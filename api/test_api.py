"""Self-check for the courses api, run against the json fallback.

    python test_api.py
"""
import functools
import json
import os

import httpx
from fastapi.testclient import TestClient

import main
import store


def check_unreachable_database() -> None:
    """A database the api cannot read must not take the rest of the site down.

    This app serves the frontend too, so a failed load has to leave the courses
    endpoints answering 503 rather than crashing every request.
    """
    def explode() -> tuple:
        raise RuntimeError('could not read the courses table')

    original = main.load_graph
    main.load_graph = explode
    try:
        with TestClient(main.app) as client:
            health = client.get('/api/health').json()
            assert health['source'] is None and 'could not read' in health['error'], health
            assert client.get('/api/courses/search', params={'q': 'csc'}).status_code == 503
            assert client.post('/api/plan', json={'completed': [], 'target': 'CSC207H1'}).status_code == 503
    finally:
        main.load_graph = original


def check_supabase_paging() -> None:
    """A table longer than one PostgREST page must still load completely.

    PostgREST caps a response at 1000 rows, so a store that ignores paging
    builds a graph missing most of the calendar without failing.
    """
    row = json.load(open(store.JSON_FALLBACK, encoding='utf-8'))['CSC207H1']
    table = [row | {'code': f'AAA{i:05d}'} for i in range(1300)]

    def fetch(cap: int) -> tuple[list[dict], list[int]]:
        """Return the rows the store loads from a server capped at cap rows."""
        asked: list[int] = []

        def respond(request: httpx.Request) -> httpx.Response:
            assert request.headers['apikey'] == 'sb_publishable_key'
            assert 'authorization' not in request.headers, dict(request.headers)
            offset = int(request.url.params['offset'])
            limit = min(int(request.url.params['limit']), cap)
            asked.append(offset)
            return httpx.Response(200, json=table[offset:offset + limit])

        transport = httpx.MockTransport(respond)
        real_client = store.httpx.Client
        store.httpx.Client = functools.partial(real_client, transport=transport)
        try:
            return (store._fetch_supabase_rows('https://example.supabase.co',
                                               'sb_publishable_key'), asked)
        finally:
            store.httpx.Client = real_client

    rows, asked = fetch(store.PAGE)
    assert len(rows) == len(table), (len(rows), len(table))
    assert asked == [0, 1000, 1300], asked

    # A project with db-max-rows below PAGE still has to load completely.
    capped, asked = fetch(500)
    assert len(capped) == len(table), (len(capped), len(table))
    assert asked == [0, 500, 1000, 1300], asked


def check() -> None:
    """Exercise every endpoint and assert the shapes the frontend relies on."""
    # Always test against the json fallback, whatever api/.env points at.
    os.environ.pop('SUPABASE_URL', None)
    os.environ.pop('SUPABASE_KEY', None)

    with TestClient(main.app) as client:
        health = client.get('/api/health').json()
        assert health['courses'] == 5349, health

        results = client.get('/api/courses/search', params={'q': 'csc207'}).json()
        assert results[0]['code'] == 'CSC207H1', results

        assert client.get('/api/courses/NOPE000H1').status_code == 404

        detail = client.get('/api/courses/csc207h1').json()
        assert detail['credits'] == 0.5 and detail['level'] == 200, detail
        assert detail['prereq_tree']['operator'] == 'AND', detail
        assert detail['exclusions'] == ['CSC207H5', 'CSCB07H3'], detail

        # Nothing completed: the only move towards CSC207H1 is a first-year course.
        first = client.post('/api/plan', json={'completed': [], 'target': 'CSC207H1'}).json()
        assert not first['reached'] and not first['eligible'], first
        assert {option['code'] for option in first['options']} == {'CSC110Y1', 'CSC108H1'}, first

        # One step later the target itself is the option, and depth grows along the chain.
        second = client.post('/api/plan', json={'completed': ['csc108h1', 'CSC148H1'],
                                            'target': 'CSC207H1'}).json()
        assert second['eligible'] and [o['code'] for o in second['options']] == ['CSC207H1'], second
        assert second['credits'] == 1.0, second
        # The graph is only what the student picked, in the order it chains up.
        depth = {node['code']: node['depth'] for node in second['graph']['nodes']}
        assert depth == {'CSC108H1': 0, 'CSC148H1': 1, 'CSC207H1': 2}, depth
        state = {node['code']: node['state'] for node in second['graph']['nodes']}
        assert state['CSC148H1'] == 'completed' and state['CSC207H1'] == 'option', state
        assert {'from': 'CSC148H1', 'to': 'CSC207H1'} in second['graph']['edges'], second

        # An unrelated course on the transcript is not part of the path.
        noisy = client.post('/api/plan', json={'completed': ['CSC108H1', 'ANT100Y1'],
                                           'target': 'CSC207H1'}).json()
        assert {node['code'] for node in noisy['graph']['nodes']} == {'CSC108H1', 'CSC207H1'}, noisy
        # Nothing completed is a direct prerequisite of the target, and it still
        # sits below what has been taken rather than beside it.
        assert {node['code']: node['depth'] for node in noisy['graph']['nodes']} == {
            'CSC108H1': 0, 'CSC207H1': 1}, noisy

        # Target already done.
        done = client.post('/api/plan', json={'completed': ['CSC207H1'],
                                          'target': 'CSC207H1'}).json()
        assert done['reached'] and done['options'] == [], done

    check_supabase_paging()
    check_unreachable_database()
    print('api ok')


if __name__ == '__main__':
    check()
