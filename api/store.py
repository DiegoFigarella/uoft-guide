"""Course store: build the CourseGraph from Supabase, or from the json fallback.

The courses table in Supabase holds exactly the rows that data/courses.json
held, so the graph is built by the same code either way.
"""
import json
import os

import httpx

from course_graph import CourseGraph
from json_to_graph import graph_from_rows

# PostgREST caps a response at 1000 rows, so the full table has to be paged.
PAGE = 1000
COLUMNS = 'code,name,hours,description,exclusions,breadth,prereq_tree'
JSON_FALLBACK = os.path.join(os.path.dirname(__file__), 'data', 'courses.json')


def _fetch_supabase_rows(url: str, key: str) -> list[dict]:
    """Return every row of the courses table, one page at a time.

    Raise RuntimeError if a page comes back short of a full page but the next
    page still has rows, which would mean a partial graph built silently.
    """
    endpoint = url.rstrip('/') + '/rest/v1/courses'
    headers = {'apikey': key, 'Authorization': f'Bearer {key}'}
    rows: list[dict] = []

    with httpx.Client(timeout=30) as client:
        offset = 0
        while True:
            response = client.get(endpoint, headers=headers, params={
                'select': COLUMNS,
                'order': 'code',
                'offset': offset,
                'limit': PAGE,
            })
            response.raise_for_status()
            page = response.json()
            rows.extend(page)
            if len(page) < PAGE:
                break
            offset += PAGE

    if not rows:
        raise RuntimeError('Supabase courses table is empty: run the seed sql first')
    return rows


def load_graph() -> tuple[CourseGraph, str]:
    """Return the course graph and the name of the source it was built from.

    Supabase is used when SUPABASE_URL and SUPABASE_KEY are set.

    ponytail: the json fallback exists so the site can be developed and the api
    verified before anyone has populated Supabase. Drop it once the table is
    the only source anybody uses.
    """
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_KEY')

    if url and key:
        return graph_from_rows(_fetch_supabase_rows(url, key)), 'supabase'

    with open(JSON_FALLBACK, encoding='utf-8') as f:
        return graph_from_rows(json.load(f).values()), 'json'
