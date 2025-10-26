#!/bin/bash
set -e

echo "📦 Preparing initial commit..."

git add .
git commit -m "feat: Stage 0 - Project scaffold and operational hygiene

- Repository structure (backend/web/ops/docs)
- FastAPI backend with health checks
- React + Vite + TypeScript web
- Docker Compose for local Postgres
- GitHub Actions CI (lint + test)
- Core documentation (ADR, Security, Data Model)
- Development tooling (Makefile, setup scripts)

Stage 0 complete ✅"

echo "✅ Commit created!"
echo ""
echo "Push to GitHub with:"
echo "  git push origin main"
