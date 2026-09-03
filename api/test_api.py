"""Self-check for the courses api, run against the json fallback.

    python test_api.py
"""
import functools
import json

import httpx
from fastapi.testclient import TestClient

import main
import store


def check_supabase_paging() -> None:
    """A table longer than one PostgREST page must still load completely.

    PostgREST caps a response at 1000 rows, so a store that ignores paging
    builds a graph missing most of the calendar without failing.
    """
    row = json.load(open(store.JSON_FALLBACK, encoding='utf-8'))['CSC207H1']
    table = [row | {'code': f'AAA{i:05d}'} for i in range(1300)]
    asked: list[int] = []

    def respond(request: httpx.Request) -> httpx.Response:
        offset = int(request.url.params['offset'])
        limit = int(request.url.params['limit'])
        asked.append(offset)
        return httpx.Response(200, json=table[offset:offset + limit])

    transport = httpx.MockTransport(respond)
    real_client = store.httpx.Client
    store.httpx.Client = functools.partial(real_client, transport=transport)
    try:
        rows = store._fetch_supabase_rows('https://example.supabase.co', 'key')
    finally:
        store.httpx.Client = real_client

    assert len(rows) == len(table), (len(rows), len(table))
    assert asked == [0, 1000], asked


def check() -> None:
    """Exercise every endpoint and assert the shapes the frontend relies on."""
    with TestClient(main.app) as client:
        health = client.get('/health').json()
        assert health['courses'] == 5349, health

        results = client.get('/courses/search', params={'q': 'csc207'}).json()
        assert results[0]['code'] == 'CSC207H1', results

        assert client.get('/courses/NOPE000H1').status_code == 404

        detail = client.get('/courses/csc207h1').json()
        assert detail['credits'] == 0.5 and detail['level'] == 200, detail
        assert detail['prereq_tree']['operator'] == 'AND', detail
        assert detail['exclusions'] == ['CSC207H5', 'CSCB07H3'], detail

        # Nothing completed: the only move towards CSC207H1 is a first-year course.
        first = client.post('/plan', json={'completed': [], 'target': 'CSC207H1'}).json()
        assert not first['reached'] and not first['eligible'], first
        assert {option['code'] for option in first['options']} == {'CSC110Y1', 'CSC108H1'}, first

        # One step later the target itself is the option, and depth grows along the chain.
        second = client.post('/plan', json={'completed': ['csc108h1', 'CSC148H1'],
                                            'target': 'CSC207H1'}).json()
        assert second['eligible'] and [o['code'] for o in second['options']] == ['CSC207H1'], second
        assert second['credits'] == 1.0, second
        depth = {node['code']: node['depth'] for node in second['graph']['nodes']}
        assert depth['CSC108H1'] == 0 and depth['CSC207H1'] > depth['CSC148H1'], depth
        state = {node['code']: node['state'] for node in second['graph']['nodes']}
        assert state['CSC148H1'] == 'completed' and state['CSC207H1'] == 'option', state
        assert {'from': 'CSC148H1', 'to': 'CSC207H1'} in second['graph']['edges'], second

        # Target already done.
        done = client.post('/plan', json={'completed': ['CSC207H1'],
                                          'target': 'CSC207H1'}).json()
        assert done['reached'] and done['options'] == [], done

    check_supabase_paging()
    print('api ok')


if __name__ == '__main__':
    check()
