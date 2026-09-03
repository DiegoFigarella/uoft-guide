"""Push the courses schema and data into a Supabase project.

    python migrate.py

Reads DATABASE_URL from api/.env (Supabase dashboard: Project Settings ->
Database -> Connection string -> URI, with your database password in it).
Running it again is safe: the schema is created only if missing and the seed
upserts on course code.
"""
import glob
import os

import psycopg
from dotenv import load_dotenv

HERE = os.path.dirname(os.path.abspath(__file__))
SQL = os.path.join(HERE, '..', 'supabase')

load_dotenv(os.path.join(HERE, '.env'))


def files() -> list[str]:
    """Return the migration and seed files, in the order they must run."""
    return sorted(glob.glob(os.path.join(SQL, 'migrations', '*.sql'))) + seeds()


def seeds() -> list[str]:
    """Return the seed files, which are generated and so may not be there."""
    return sorted(glob.glob(os.path.join(SQL, 'seed', '*.sql')))


def run(dsn: str) -> int:
    """Apply every sql file to the database at dsn. Return the row count after."""
    with psycopg.connect(dsn) as connection:
        with connection.cursor() as cursor:
            for path in files():
                with open(path, encoding='utf-8') as f:
                    cursor.execute(f.read())
                print(f'  ran {os.path.basename(path)}')
            cursor.execute('select count(*) from public.courses')
            count = cursor.fetchone()[0]
        connection.commit()
    return count


def main() -> None:
    """Apply the sql to DATABASE_URL and report how many courses ended up there."""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise SystemExit('DATABASE_URL is not set: copy .env.example to .env and fill it in')

    if not seeds():
        print('no seed files in supabase/seed: run "python gen_sql.py" first '
              'if the table should be (re)populated')

    print(f'applying {len(files())} sql files')
    print(f'{run(dsn)} courses in public.courses')


if __name__ == '__main__':
    main()
