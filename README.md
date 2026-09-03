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
says otherwise; copy `.env.example` to `.env` to point it elsewhere.

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

### Credentials

Copy `api/.env.example` to `api/.env` and fill it in from the Supabase
dashboard. `.env` is gitignored. Real environment variables override the file,
so a hosting platform's own settings still win.

| Variable | Where it comes from | Used by |
| --- | --- | --- |
| `SUPABASE_URL` | Project Settings → API | the api at startup |
| `SUPABASE_KEY` | Project Settings → API, anon key | the api at startup |
| `DATABASE_URL` | **Connect** button at the top of the dashboard → Session pooler (port 5432), with `[YOUR-PASSWORD]` replaced | `migrate.py` only |

The anon key is enough: the courses table is public-read and nothing writes
through the api. Keep the service_role key out of this entirely, and note the
browser never sees any key — it only talks to the api.

### Push the data to your project

```bash
cd api && python migrate.py
```

That runs `supabase/migrations/0001_courses.sql` (the table plus its public
read policy) and then `supabase/seed/courses_01.sql` … `courses_11.sql` in
order, and prints the row count it ends with: 5349. It is re-runnable — the
schema is created only if missing and the seed upserts on `code`.

The seed is split into eleven files because the whole thing is a few megabytes
of sql; that also means you can paste them into the dashboard's SQL editor by
hand instead, if you would rather not hand a script your database password.

Once the table is populated, start the api with `api/.env` in place and
`/health` reports `"source": "supabase"`. Without credentials it falls back to
the json file, which is what the tests and local development use.
