# Asset Management System

Domain-driven asset management system. Split into a Flask API and a React frontend.

## Project Structure

- api/: Flask 3.11+ backend. Domain logic is isolated in app/modules/.
- web/: React Vite frontend. Component logic is isolated in src/features/.

## Backend Setup

1. Create a virtual environment:
   python -m venv venv

2. Install dependencies:
   pip install -r api/requirements.txt

3. Environment configuration:
   cp api/.env.example api/.env
   Edit api/.env with your database credentials.

4. Database migrations:
   flask db upgrade

5. Run:
   python api/run.py

## Frontend Setup

1. Install dependencies:
   cd web && npm install

2. Environment configuration:
   cp web/.env.example web/.env

3. Run:
   npm run dev

## Development Rules

- Do not commit .env files.
- Keep domain logic inside their respective module/feature directories.
- Global infrastructure belongs in core/ directories.
- All shared UI components go into web/src/shared/.
- Ensure pre-commit hooks are active before pushing.
