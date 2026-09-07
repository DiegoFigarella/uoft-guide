"""Vercel entrypoint.

Vercel's Python runtime only auto-detects an app at the project root or in
src/ and app/, and the api lives in api/. Re-exporting it here is enough:
pointing at api/main.py instead would need a pyproject.toml, which makes uv
demand a [project] table and a second copy of the dependency list.

Detecting a FastAPI app also stops Vercel turning every other module in api/
into its own serverless function.
"""
from api.main import app

__all__ = ['app']
