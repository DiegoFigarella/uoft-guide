"""FastAPI service exposing the CSC111 course graph to the guide's courses section.

The graph is built once at startup and then queried in memory: the algorithms
walk the whole prerequisite tree, which is not something to push into SQL.

Run with:

    uvicorn main:app --reload
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from algorithms import get_course_codes, get_next_needed_courses, get_relevant_courses, search_courses
from boolean_list import BooleanList, CreditCondition
from course_graph import CourseGraph, _CourseVertex
from store import load_graph

# Vite dev server and the built site. Only origins that need the api.
ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

state: dict[str, object] = {}


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Build the course graph before the first request."""
    course_graph, source = load_graph()
    state['graph'] = course_graph
    state['source'] = source
    yield
    state.clear()


app = FastAPI(title='UofT CS Guide courses', lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)


def graph() -> CourseGraph:
    """Return the loaded course graph."""
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


@app.get('/health')
def health() -> dict:
    """Return the number of courses loaded and where they came from."""
    return {'courses': len(graph().vertices), 'source': state['source']}


@app.get('/courses/search')
def search(q: str = Query(min_length=1), limit: int = Query(default=20, ge=1, le=100)) -> list[dict]:
    """Return courses whose code or name contains q, best matches first."""
    codes = search_courses(graph(), q)[:limit]
    return [summary(graph().get_vertex(code)) for code in codes]


@app.get('/courses/{code}')
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


@app.post('/plan')
def plan(request: PlanRequest) -> dict:
    """Return the next courses to take towards a target, and the graph of the path.

    `options` is what the student can pick right now; picking one means posting
    again with it added to `completed`. `reached` means the target is done, and
    empty `options` with the target unreached is a dead end: the prerequisites
    that are left sit outside this dataset or are credit conditions.
    """
    target = vertex(request.target).code
    completed = {code.strip().upper() for code in request.completed}
    completed = {code for code in completed if code in graph().vertices}

    options = get_next_needed_courses(graph(), target, completed)
    # Completed courses that lie on a path to the target are already part of
    # relevant; the rest of a transcript is not, and would only crowd the graph.
    relevant = get_relevant_courses(graph(), target, completed) | options
    edges = subgraph_edges(relevant)
    node_depths = depths(relevant, edges)

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
                for code in sorted(relevant, key=lambda c: (node_depths[c], c))
            ],
            'edges': [{'from': prereq, 'to': course_code} for prereq, course_code in edges],
        },
    }
