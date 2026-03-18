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

## VS Code & GitHub Copilot Setup

This repository includes recommended VS Code extensions to help you get started with GitHub Copilot.

1. Open the project in VS Code:
   code .

2. When prompted, click **Install All** to install the recommended extensions, or open the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`), search for `@recommended`, and install:
   - **GitHub Copilot** (`GitHub.copilot`) — AI-powered code completions
   - **GitHub Copilot Chat** (`GitHub.copilot-chat`) — conversational AI assistance in the editor

3. Sign in to GitHub when prompted to activate Copilot.

4. Start using Copilot:
   - Inline suggestions appear automatically as you type.
   - Open Copilot Chat with `Ctrl+Alt+I` / `Cmd+Alt+I` to ask questions about the codebase.

## Development Rules

- Do not commit .env files.
- Keep domain logic inside their respective module/feature directories.
- Global infrastructure belongs in core/ directories.
- All shared UI components go into web/src/shared/.
- Ensure pre-commit hooks are active before pushing.
