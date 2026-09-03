"""Generate the Supabase schema and seed SQL for the courses table from data/courses.json.

Run from the api directory:

    python gen_sql.py

The seed is split into chunks because the whole table is ~4MB of SQL and the
Supabase SQL editor cannot take that in one paste.
"""
import json
import os

CHUNK = 500
DATA = os.path.join(os.path.dirname(__file__), 'data', 'courses.json')
OUT = os.path.join(os.path.dirname(__file__), '..', 'supabase')

SCHEMA = """-- Courses table for the UofT CS Guide courses section.
-- Mirrors data/courses.json one row per course; prereq_tree keeps the raw
-- boolean tree as jsonb so the API can parse it with the original code.
create table if not exists public.courses (
    code        text primary key,
    name        text not null,
    hours       text,
    description text,
    exclusions  text,
    breadth     smallint,
    prereq_tree jsonb
);

-- Course data is public, so anyone may read it and nobody may write it
-- through the anon key.
alter table public.courses enable row level security;

drop policy if exists "courses are publicly readable" on public.courses;
create policy "courses are publicly readable"
    on public.courses for select
    using (true);
"""


def literal(value: str | int | dict | list | None) -> str:
    """Return value as a Postgres literal, quoting and escaping strings."""
    if value is None:
        return 'null'
    if isinstance(value, int):
        return str(value)
    if isinstance(value, (dict, list)):
        return literal(json.dumps(value, ensure_ascii=False))
    return "'" + value.replace("'", "''") + "'"


def row_values(course: dict) -> str:
    """Return one VALUES tuple for the given course."""
    cells = [literal(course[key]) for key in
             ('code', 'name', 'hours', 'description', 'exclusions', 'breadth')]
    cells.append(literal(course['prereq_tree']) + '::jsonb')
    return '    (' + ', '.join(cells) + ')'


def main() -> None:
    """Write the schema migration and the chunked seed files."""
    with open(DATA, encoding='utf-8') as f:
        courses = list(json.load(f).values())

    migrations = os.path.join(OUT, 'migrations')
    seed = os.path.join(OUT, 'seed')
    os.makedirs(migrations, exist_ok=True)
    os.makedirs(seed, exist_ok=True)

    with open(os.path.join(migrations, '0001_courses.sql'), 'w',
              encoding='utf-8', newline='\n') as f:
        f.write(SCHEMA)

    chunks = [courses[i:i + CHUNK] for i in range(0, len(courses), CHUNK)]
    for i, chunk in enumerate(chunks, start=1):
        path = os.path.join(seed, f'courses_{i:02d}.sql')
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(f'-- Courses {i} of {len(chunks)}: '
                    f'{chunk[0]["code"]} to {chunk[-1]["code"]}\n')
            f.write('insert into public.courses\n'
                    '    (code, name, hours, description, exclusions, breadth, prereq_tree)\n'
                    'values\n')
            f.write(',\n'.join(row_values(course) for course in chunk))
            f.write('\non conflict (code) do update set\n'
                    '    name = excluded.name,\n'
                    '    hours = excluded.hours,\n'
                    '    description = excluded.description,\n'
                    '    exclusions = excluded.exclusions,\n'
                    '    breadth = excluded.breadth,\n'
                    '    prereq_tree = excluded.prereq_tree;\n')

    print(f'{len(courses)} courses to {len(chunks)} seed files')


if __name__ == '__main__':
    main()
