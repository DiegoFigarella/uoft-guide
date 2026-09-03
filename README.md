# uoft_guide

Guide for uoft cs students.

The site is a static Vite + React app. Every tab but **Courses** is copy from
`src/content.ts`. Courses is live: it talks to the FastAPI service in `api/`,
which serves the UofT course prerequisite graph.

## Run the site

```bash
npm install
npm run dev
```

The Courses tab calls the api at `http://localhost:8000` unless `VITE_API_URL`
says otherwise.

## Run the courses api

```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload
python test_api.py     # self-check, exercises every endpoint
```

`GET /health` reports how many courses loaded and whether they came from
Supabase or the json fallback.

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Course count and data source |
| `GET /courses/search?q=` | Courses whose code or name matches |
| `GET /courses/{code}` | One course, with its prerequisite tree |
| `POST /plan` | `{completed, target}` to the courses takeable now plus the relevant subgraph |

The graph, the prerequisite logic and the "what can I take next" algorithms come
from [jaandersonck/csc111-project2](https://github.com/jaandersonck/csc111-project2):
`course_graph.py`, `boolean_list.py`, `algorithms.py` and `json_to_graph.py` are
that project's modules. The Tk interface and the Plotly visualization are not
vendored — this repo replaces them with the Courses tab. Two changes were needed:
`get_relevant_courses` now skips prerequisite codes that are not vertices of the
graph (other campuses), and `graph_from_rows` builds a graph from database rows
rather than only from a file.

## Courses database

`api/data/courses.json` is the source data. `api/gen_sql.py` turns it into the
sql under `supabase/`:

```bash
cd api && python gen_sql.py
```

To populate Supabase, run in the SQL editor:

1. `supabase/migrations/0001_courses.sql` — creates `public.courses` and its
   public read policy.
2. `supabase/seed/courses_01.sql` … `courses_11.sql`, in order. They are split
   because the whole seed is a few megabytes of sql; each file is re-runnable
   and upserts on `code`.

Then point the api at the table:

```bash
export SUPABASE_URL=https://<project>.supabase.co
export SUPABASE_KEY=<anon key>
```

With those set, the api reads the table at startup and `/health` reports
`"source": "supabase"`. Without them it falls back to the json file, which is
what the tests and local development use. The key stays in the api's
environment; the browser never sees it.
