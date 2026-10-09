# uoft_guide

A guide for UofT computer science students: research programs, internships,
clubs, resources and other opportunities collected in one place, plus a
**Courses** tab for exploring the UofT course prerequisite graph and working
out which courses you can take next.

## Credits

- **Opportunities**: the original compilation of opportunities is by
  Imane Baghouri and Tugra Canbaz.
- **Website design**: Diego Figarella.
- **Course planner**: the prerequisite graph and the "what can I take next"
  logic behind the Courses tab are by Jack Anderson, Efren Medina, Tanish
  Ariyur and Diego Figarella, from
  [jaandersonck/uoft-course-planner](https://github.com/jaandersonck/uoft-course-planner).

## How it works

The site is a Vite + React app. Every tab but **Courses** is plain content from
`src/content.ts`. Courses talks to the FastAPI service in `api/`, which serves
the course graph.

`api/course_graph.py`, `boolean_list.py`, `algorithms.py` and `json_to_graph.py`
are the uoft-course-planner modules, with two changes: `get_relevant_courses` skips
prerequisite codes that are not vertices of the graph (other campuses), and
`graph_from_rows` builds a graph from database rows rather than only from a
file.

In production the course data lives in a Supabase database managed by the
maintainer. You do not need it to contribute: without credentials the api falls
back to `api/data/courses.json`.

## Contributing

Contributions are welcome — new opportunities, fixes to outdated entries, bug
fixes, or improvements to the Courses tab.

1. Fork the repo and create a branch.
2. Make your change:
   - **Adding or fixing an opportunity**: edit `src/content.ts`. URLs and
     emails written as plain text are turned into links automatically.
   - **Course data**: edit `api/data/courses.json`. The maintainer syncs the
     database after merging.
   - **Code**: see running locally below.
3. Open a pull request describing what changed and why.

### Running locally

```bash
npm install
npm run dev
```

The Courses tab calls `/api`, which Vite proxies to `http://localhost:8000`, so
run the api too:

```bash
pip install -r requirements.txt
cd api
uvicorn main:app --reload
python test_api.py     # self-check, exercises every endpoint
```

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Course count and data source |
| `GET /api/courses/search?q=` | Courses whose code or name matches |
| `GET /api/courses/{code}` | One course, with its prerequisite tree |
| `POST /api/plan` | `{completed, target}` to the courses takeable now plus the relevant subgraph |

## License

MIT. See [LICENSE](LICENSE).
