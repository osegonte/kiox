# ADR-0001: Technology Stack Selection

**Status**: Accepted  
**Date**: 2025-01-26  
**Deciders**: Engineering Team

## Context

Kiox is a B2B marketplace platform for Nigeria requiring:
- Fast development iteration
- Strong security (PII, payments, multi-tenancy)
- Mobile-first UI with offline capabilities
- Integration with Nigerian payment providers (Paystack)
- Future WhatsApp/chat ordering support

## Decision

### Backend: FastAPI + Supabase (PostgreSQL)
- **FastAPI**: Type-safe, async, auto-docs, fast development
- **Supabase**: Managed Postgres with built-in RLS (Row Level Security)
- **PostgreSQL**: ACID compliance for money/inventory transactions

### Frontend: React + Vite + TypeScript
- **React**: Component reusability, large ecosystem
- **Vite**: Fast HMR, modern build tooling
- **TypeScript**: Type safety, better DX

### Payments: Paystack
- Nigeria-native, supports cards, bank transfers, USSD
- Hosted checkout (PCI compliance handled)
- Subscription billing for supplier fees

### Infrastructure
- **Local Dev**: Docker Compose (Postgres + Redis)
- **Production**: Railway (API), Vercel (Web), Supabase (DB)
- **Monitoring**: Sentry for errors

## Consequences

### Positive
- RLS enforces security at DB level (defense in depth)
- FastAPI async handles high concurrent loads
- Paystack reduces compliance burden
- TypeScript catches errors early

### Negative
- Supabase vendor lock-in (mitigated: standard Postgres underneath)
- Learning curve for RLS policies
- WhatsApp API requires Meta business verification (defer to Stage 5)

## Alternatives Considered

- **Django**: More batteries included but slower iteration
- **Flutterwave**: Less mature API than Paystack
- **NextJS**: Chose separate API for mobile app flexibility later
