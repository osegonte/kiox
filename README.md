# Kiox — B2B Marketplace Platform

Fast, secure B2B ordering system for suppliers, shops, and delivery operations across Nigeria.

## Quick Start
```bash
# Copy environment template
cp .env.example .env

# Start all services (Docker + API + Web)
make dev

# Run tests
make test
```

**API**: http://localhost:8000 | **Web**: http://localhost:5173

## Stack

- **Backend**: FastAPI + Supabase (PostgreSQL with RLS)
- **Web**: React + Vite + TypeScript
- **Payments**: Paystack

## Documentation

- [Architecture Decisions](docs/ADR-0001-stack.md)
- [Security Policy](docs/SECURITY.md)
- [Data Model](docs/DATA-MODEL.md)
- [Stage Guide](docs/STAGE-GUIDE.md)
