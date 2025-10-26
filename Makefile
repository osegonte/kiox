.PHONY: help dev test lint format clean install-backend install-web

help:
	@echo "Kiox Development Commands"
	@echo "========================="
	@echo "make dev          - Start all services (DB + API + Web)"
	@echo "make test         - Run all tests"
	@echo "make lint         - Check code quality"
	@echo "make format       - Auto-format code"
	@echo "make clean        - Stop services and clean"
	@echo "make install-backend - Install Python dependencies"
	@echo "make install-web     - Install Node dependencies"

dev:
	@echo "🚀 Starting Kiox development environment..."
	cd ops/docker && docker compose up -d
	@echo "⏳ Waiting for database..."
	@sleep 5
	@echo "✅ Database ready"
	@echo "🐍 Starting FastAPI (background)..."
	cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
	@echo "⚛️  Starting React (this terminal)..."
	cd web && npm run dev

test:
	@echo "🧪 Running backend tests..."
	cd backend && source .venv/bin/activate && pytest
	@echo "🧪 Running web tests..."
	cd web && npm test

lint:
	@echo "🔍 Linting backend..."
	cd backend && source .venv/bin/activate && ruff check . && mypy .
	@echo "🔍 Linting web..."
	cd web && npm run lint

format:
	@echo "✨ Formatting backend..."
	cd backend && source .venv/bin/activate && ruff format . && ruff check --fix .
	@echo "✨ Formatting web..."
	cd web && npm run format

clean:
	@echo "�� Stopping services..."
	cd ops/docker && docker compose down
	@pkill -f "uvicorn app.main:app" || true
	@echo "✅ Cleaned up"

install-backend:
	cd backend && python3.11 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

install-web:
	cd web && npm install
