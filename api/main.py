"""FastAPI service exposing the CSC111 course graph to the guide's courses section.

The graph is built once at startup and then queried in memory: the algorithms
walk the whole prerequisite tree, which is not something to push into SQL.

Run with:

    uvicorn main:app --reload
"""
import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Vercel imports this module as `api.main`, which puts the project root on the
# path instead of this folder, so the flat sibling imports below stop resolving.
# Adding this folder keeps one set of import statements working both there and
# under `uvicorn main:app` locally.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from algorithms import get_course_codes, get_next_needed_courses, get_relevant_courses, search_courses
from boolean_list import BooleanList, CreditCondition
from course_graph import CourseGraph, _CourseVertex
from store import load_graph

# The built frontend, served by this same app in production so the browser
# calls /api/... on its own origin. Absent in local dev, where Vite serves it.
DIST = 'dist'

state: dict[str, object] = {}


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Build the course graph before the first request, or record why it failed.

    This app serves the whole site, not just the api, so an unreachable database
    must not take the other tabs down with it. A failure here leaves the graph
    unset and the courses endpoints answering 503, which is the blast radius the
    api had back when it was deployed on its own.
    """
    try:
        state['graph'], state['source'] = load_graph()
    except Exception as issue:
        state['error'] = f'{type(issue).__name__}: {issue}'
    yield
    state.clear()


app = FastAPI(title='UofT CS Guide courses', lifespan=lifespan)


def graph() -> CourseGraph:
    """Return the loaded course graph, or raise a 503 if it never loaded."""
    if 'graph' not in state:
        raise HTTPException(status_code=503, detail=f"Courses unavailable. {state.get('error', '')}".strip())
    return state['graph']


def vertex(code: str) -> _CourseVertex:
    """Return the vertex for code, or raise a 404 if the course is unknown."""
    try:
        return graph().get_vertex(code.strip().upper())
    except KeyError:
        raise HTTPException(status_code=404, detail=f'Course not found: {code}')


def summary(course: _CourseVertex) -> dict:
    """Return the fields every list of courses needs."""
    return {
        'code': course.code,
        'name': course.name,
        'department': course.department(),
        'level': course.level(),
        'credits': course.credits(),
        'breadth': course.breadth,
    }


def prereq_json(prereqs: BooleanList | None) -> dict | None:
    """Return the prerequisite tree as plain json, so the client can render it.

    Course codes stay strings and credit conditions become objects, mirroring
    the shape the tree has in the source data.
    """
    if prereqs is None or not prereqs.items:
        return None

    items = []
    for item in prereqs.items:
        if isinstance(item, str):
            items.append(item)
        elif isinstance(item, BooleanList):
            nested = prereq_json(item)
            if nested is not None:
                items.append(nested)
        elif isinstance(item, CreditCondition):
            items.append({'credits': item.amount_credits, 'department': item.department})
    return {'operator': prereqs.operator or 'AND', 'items': items}


def depths(nodes: set[str], edges: list[tuple[str, str]]) -> dict[str, int]:
    """Return each node's depth: the length of the longest prerequisite chain into it.

    A cycle in the data would make the longest path undefined, so a node that is
    already being resolved counts as depth 0 instead of recursing forever.
    """
    incoming: dict[str, list[str]] = {node: [] for node in nodes}
    for prereq, course_code in edges:
        incoming[course_code].append(prereq)

    resolved: dict[str, int] = {}
    visiting: set[str] = set()

    def depth_of(node: str) -> int:
        if node in resolved:
            return resolved[node]
        if node in visiting:
            return 0
        visiting.add(node)
        result = max((depth_of(prereq) + 1 for prereq in incoming[node]), default=0)
        visiting.discard(node)
        resolved[node] = result
        return result

    return {node: depth_of(node) for node in nodes}


def subgraph_edges(codes: set[str]) -> list[tuple[str, str]]:
    """Return the prerequisite edges that run between the given courses."""
    edges = []
    for code in codes:
        for prereq in get_course_codes(graph().get_vertex(code).prerequisites):
            if prereq in codes:
                edges.append((prereq, code))
    return edges


class PlanRequest(BaseModel):
    """A student's completed courses and the course they are working towards."""
    completed: list[str] = []
    target: str


@app.get('/api/health')
def health() -> dict:
    """Return the number of courses loaded and where they came from.

    Answers even when the graph failed to load, so `source` tells you whether
    production is really reading Supabase and `error` says why it is not.
    """
    if 'graph' not in state:
        return {'courses': 0, 'source': None, 'error': state.get('error')}
    return {'courses': len(graph().vertices), 'source': state['source']}


@app.get('/api/courses/search')
def search(q: str = Query(min_length=1), limit: int = Query(default=20, ge=1, le=100)) -> list[dict]:
    """Return courses whose code or name contains q, best matches first."""
    codes = search_courses(graph(), q)[:limit]
    return [summary(graph().get_vertex(code)) for code in codes]


@app.get('/api/courses/{code}')
def course(code: str) -> dict:
    """Return everything known about one course, including its prerequisite tree."""
    found = vertex(code)
    exclusions = found.exclusions or ''
    return summary(found) | {
        'hours': found.hours,
        'description': found.description,
        'exclusions': [part.strip() for part in exclusions.split(',') if part.strip()],
        'prereq_tree': prereq_json(found.prerequisites),
    }


@app.post('/api/plan')
def plan(request: PlanRequest) -> dict:
    """Return the next courses to take towards a target, and the graph of the path.

    `options` is what the student can pick right now; picking one means posting
    again with it added to `completed`. `reached` means the target is done, and
    empty `options` with the target unreached is a dead end: the prerequisites
    that are left sit outside this dataset or are credit conditions.

    `graph` is the path so far: the completed courses that lead to the target,
    the target itself, and the prerequisite edges between them.
    """
    target = vertex(request.target).code
    completed = {code.strip().upper() for code in request.completed}
    completed = {code for code in completed if code in graph().vertices}

    options = get_next_needed_courses(graph(), target, completed)

    # The graph is the path the student has actually built: the courses they
    # picked that lead to the target, plus the target. Alternatives they did not
    # take, and transcript entries that have nothing to do with the target, are
    # not part of it.
    on_a_path = get_relevant_courses(graph(), target, set())
    chosen = (on_a_path & completed) | {target}
    edges = subgraph_edges(chosen)
    node_depths = depths(chosen, edges)

    # The target is where the path ends, so it belongs on the bottom row even
    # when nothing chosen so far is a direct prerequisite of it.
    others = [depth for code, depth in node_depths.items() if code != target]
    if others:
        node_depths[target] = max(node_depths[target], max(others) + 1)

    def state_of(code: str) -> str:
        if code in completed:
            return 'completed'
        if code in options:
            return 'option'
        return 'pending'

    # Target first, then grouped by department and level, as in the original app.
    ordered = sorted(options, key=lambda code: (
        code != target,
        graph().get_vertex(code).department(),
        graph().get_vertex(code).level(),
        code,
    ))

    return {
        'target': target,
        'reached': target in completed,
        'eligible': graph().is_eligible(target, completed),
        'credits': graph().credit_count(completed),
        'options': [summary(graph().get_vertex(code)) for code in ordered],
        'graph': {
            'nodes': [
                summary(graph().get_vertex(code)) | {
                    'depth': node_depths[code],
                    'state': state_of(code),
                    'target': code == target,
                }
                for code in sorted(chosen, key=lambda c: (node_depths[c], c))
            ],
            'edges': [{'from': prereq, 'to': course_code} for prereq, course_code in edges],
        },
    }


# Declared after every route, so the api always wins over a file of the same
# name. Vercel promotes these to the CDN at build time; locally dist/ only
# exists after `npm run build`, and Vite serves the frontend anyway.
if os.path.isdir(DIST):
    app.mount('/', StaticFiles(directory=DIST, html=True), name='frontend')
