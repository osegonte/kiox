# Stage 0 Completion Checklist

## Repository Structure
- [x] Backend folder (FastAPI)
- [x] Web folder (React + Vite)
- [x] Ops folder (Docker, scripts)
- [x] Docs folder (ADRs, guides)
- [x] GitHub Actions workflows

## Backend
- [x] requirements.txt with FastAPI, SQLAlchemy, Supabase client
- [x] main.py with health check endpoint
- [x] Basic test structure
- [x] Linting config (ruff, mypy)
- [ ] Virtual environment created (`make install-backend`)

## Web
- [x] package.json with React, Vite, TypeScript
- [x] App component with API health check
- [x] ESLint + Prettier config
- [ ] Dependencies installed (`make install-web`)

## Infrastructure
- [x] Docker Compose (Postgres + Redis)
- [x] .env.example template
- [x] Makefile with dev/test/lint commands
- [ ] Docker containers running

## Documentation
- [x] README with quick start
- [x] ADR-0001 (Stack selection)
- [x] SECURITY.md
- [x] DATA-MODEL.md
- [x] STAGE-GUIDE.md

## CI/CD
- [x] GitHub Actions workflow
- [x] Lint + test jobs for backend and web
- [ ] CI passing on main branch

## Exit Criteria
- [ ] `make dev` starts all services
- [ ] API health check returns 200
- [ ] Web loads and shows API status
- [ ] All tests pass
- [ ] Pushed to GitHub with CI green

## Next Steps (Stage 1)
1. Create database tables with Alembic
2. Implement RLS policies
3. Build product + order APIs
4. Create admin UI for orders
