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

The Courses tab calls `/api`, which Vite proxies to the courses api on
`http://localhost:8000`. Run both.

## Run the courses api

```bash
pip install -r requirements.txt
cd api
uvicorn main:app --reload
python test_api.py     # self-check, exercises every endpoint
```

`GET /api/health` reports how many courses loaded and whether they came from
Supabase or the json fallback.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Course count and data source |
| `GET /api/courses/search?q=` | Courses whose code or name matches |
| `GET /api/courses/{code}` | One course, with its prerequisite tree |
| `POST /api/plan` | `{completed, target}` to the courses takeable now plus the relevant subgraph |

The graph, the prerequisite logic and the "what can I take next" algorithms come
from [jaandersonck/csc111-project2](https://github.com/jaandersonck/csc111-project2):
`course_graph.py`, `boolean_list.py`, `algorithms.py` and `json_to_graph.py` are
that project's modules. The Tk interface and the Plotly visualization are not
vendored — this repo replaces them with the Courses tab. Two changes were needed:
`get_relevant_courses` now skips prerequisite codes that are not vertices of the
graph (other campuses), and `graph_from_rows` builds a graph from database rows
rather than only from a file.

## Deployment

Vercel builds this as one FastAPI app: `pyproject.toml` points the Python
runtime at `api/main.py`, `vercel.json` runs the Vite build first, and the app
mounts the resulting `dist/` at `/`. The api and the site therefore share an
origin, which is why the browser calls a relative `/api` and there is no CORS
config.

Set `SUPABASE_URL` and `SUPABASE_KEY` in the Vercel project so production
reads the database, which is the point of having one: course data changes
without a redeploy. Paging the table costs a few seconds on a cold start
against about 0.07s for the json, but that is well inside the 300s function
limit and fluid compute reuses a warm instance across requests, so it is not a
per-request cost.

The json fallback only applies when both variables are absent. Credentials
that are set but wrong are an error, not a fallback: the graph stays unloaded,
`GET /api/health` reports `"source": null` with the reason, and the courses
endpoints answer 503 while the rest of the site keeps serving.

## Courses database

`api/data/courses.json` is the source data. `api/gen_sql.py` turns it into the
sql under `supabase/`:

```bash
cd api && python gen_sql.py
```

The seed files it writes are gitignored: they are a few megabytes of generated
sql that already lives in the database. Run `gen_sql.py` again whenever you
need them back.

### Credentials

Copy `api/.env.example` to `api/.env` and fill it in from the Supabase
dashboard. `.env` is gitignored. Real environment variables override the file,
so a hosting platform's own settings still win.

| Variable | Where it comes from | Used by |
| --- | --- | --- |
| `SUPABASE_URL` | Project Settings → API | the api at startup |
| `SUPABASE_KEY` | Project Settings → API Keys, publishable key | the api at startup |
| `DATABASE_URL` | **Connect** button at the top of the dashboard → Session pooler (port 5432), with `[YOUR-PASSWORD]` replaced | `migrate.py` only |

The publishable key (`sb_publishable_…`) is enough: the courses table is
public-read and nothing writes through the api. A legacy anon key works too.
Keep the secret key out of this entirely, and note the browser never sees any
key — it only talks to the api. The key travels in the `apikey` header, not in
`Authorization`: publishable and secret keys are not JWTs.

### Push the data to your project

```bash
cd api && python migrate.py
```

That runs `supabase/migrations/0001_courses.sql` (the table plus its public
read policy) and then every `supabase/seed/courses_*.sql` in order, and prints
the row count it ends with: 5349. It is re-runnable — the schema is created
only if missing and the seed upserts on `code`. Run `gen_sql.py` first, since
the seed files are not in the repo.

The seed is split into eleven files because the whole thing is a few megabytes
of sql; that also means you can paste them into the dashboard's SQL editor by
hand instead, if you would rather not hand a script your database password.

Once the table is populated, start the api with `api/.env` in place and
`/health` reports `"source": "supabase"`. Without credentials it falls back to
the json file, which is what the tests and local development use.
