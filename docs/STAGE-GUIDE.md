# Kiox Stage Guide

Quick reference for development stages. See full blueprint in project docs.

## ✅ Stage 0: Foundations (CURRENT)
- [x] Repo structure
- [x] CI/CD setup
- [x] Docker local dev
- [x] Documentation (ADRs, Security, Data Model)
- [ ] `make dev` works end-to-end

**Exit**: Health checks pass, can boot in <5 min

---

## Stage 1: Core Ordering (2-4 days)
- [ ] DB tables: suppliers, shops, products, inventory, orders, audit_log
- [ ] RLS policies enabled
- [ ] API: Create order, list products, update order status
- [ ] Admin UI: Product CRUD, Order wizard
- [ ] Tests: Order flow, inventory decrement, state machine

**Exit**: Real order reduces inventory, audit trail visible

---

## Stage 2: Payments & Delivery (3-5 days)
- [ ] COD + Paystack integration
- [ ] Delivery status tracking
- [ ] Receipt generation (HTML)
- [ ] Webhook handling (idempotent)
- [ ] Nightly reconciliation job

**Exit**: Paid order completes, receipt shareable

---

## Stage 3: Alerts & Analytics (2-4 days)
- [ ] Low-stock alerts
- [ ] Promotions engine
- [ ] Analytics dashboard (GMV, orders, top SKUs)

**Exit**: Dashboard shows accurate metrics

---

## Stage 4: Multi-Zone & RBAC (2-4 days)
- [ ] Zone scoping
- [ ] Role-based access
- [ ] Commission tracking

**Exit**: Data isolation proven, zones operational

---

## Stage 5: Communications (timeboxed)
- [ ] WhatsApp deep links
- [ ] Status notifications
- [ ] Optional: WhatsApp Cloud API bot

**Exit**: Chat creates order, notifications deliver

---

## Stage 6: AI & Automation (data-driven)
- [ ] Reorder suggestions
- [ ] Demand forecasting
- [ ] Dynamic substitutions

**Exit**: Measurable uplift, safe rollback
