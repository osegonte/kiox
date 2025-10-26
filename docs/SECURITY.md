# Security Policy

## Principles

1. **Defense in Depth**: Security at DB (RLS), API (auth middleware), and UI layers
2. **Least Privilege**: Users/roles see only their data
3. **Zero Trust**: Every request validated; no assumptions
4. **Audit Everything**: Immutable audit log for sensitive operations

## Authentication & Authorization

### JWT Tokens
- Short-lived access tokens (15 min)
- Refresh tokens (7 days) with rotation
- Stored in httpOnly, secure, sameSite cookies (web)
- Revocation via token blacklist in Redis

### Row Level Security (RLS)
- **Enabled on ALL tables** by default (deny all)
- Explicit policies per role:
  - `admin`: full access within assigned zones
  - `supplier`: own data + orders from their shops
  - `shop`: own orders only
  - `rider`: assigned deliveries only

Example policy:
```sql
CREATE POLICY "shops_select_own"
ON shops FOR SELECT
USING (auth.uid() = owner_id OR auth.role() = 'admin');
```

## Data Protection

### PII Minimization
- Store only: name, phone, address (required for delivery)
- Hash phone numbers in logs/analytics
- Never log passwords, tokens, or card data

### Payment Card Data
- **NEVER** store PANs, CVVs, or card details
- Use Paystack hosted checkout
- Store only: `provider_ref`, `last4`, `brand`

### Secrets Management
- All secrets in environment variables
- Use Supabase Vault for DB-stored secrets (future)
- Rotate API keys quarterly
- Never commit secrets to Git (pre-commit hook checks)

## Backups & Recovery

- Daily automated backups (Supabase)
- Point-in-time recovery (7 days retention)
- Quarterly restore drill (compliance requirement)
- Backups encrypted at rest

## Monitoring & Incident Response

### Alerts (Sentry + custom)
- Failed auth attempts > 5/min
- Payment reconciliation mismatches
- RLS policy violations
- Webhook failure rate > 1%

### Incident Playbook
1. Detect: Alert fires
2. Triage: Check Sentry, logs, metrics
3. Contain: Disable affected endpoint/user if needed
4. Fix: Deploy hotfix
5. Postmortem: Document in `docs/incidents/`

## Compliance

### NDPR (Nigeria Data Protection Regulation)
- User consent for data collection
- Right to access (export endpoint)
- Right to deletion (anonymize, keep financial records)
- Data processing agreement with Supabase

### PCI DSS
- Paystack handles card data (Level 1 PCI certified)
- Our scope: secure transmission to Paystack only

## Vulnerability Reporting

Email: security@kiox.ng (set up post-launch)  
Response SLA: 48 hours for critical, 1 week for medium/low

## Security Checklist (Stage 0+)

- [x] RLS enabled on all tables
- [x] Secrets in `.env`, not code
- [x] HTTPS only in production
- [x] CORS restricted to known origins
- [ ] Rate limiting (Stage 2)
- [ ] Automated dependency scanning (Stage 1)
- [ ] Penetration test before public launch
