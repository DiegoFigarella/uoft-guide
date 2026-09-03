-- Courses table for the UofT CS Guide courses section.
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
