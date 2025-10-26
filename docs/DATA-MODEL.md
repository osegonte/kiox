# Data Model

## Design Principles

1. **Source of Truth**: Database is authoritative; APIs are projections
2. **Immutability**: Money/audit tables are append-only (never UPDATE)
3. **Money as Integers**: Store amounts in kobo (₦1 = 100 kobo)
4. **UTC Timestamps**: Store all times in UTC; display in Africa/Lagos
5. **Explicit State Machines**: Order/delivery status transitions enforced

## Core Entities (Stage 1+)

### Users & Auth
```sql
-- Managed by Supabase Auth
auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT CHECK (role IN ('admin', 'supplier', 'shop', 'rider'))
)
```

### Suppliers
```sql
suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Zones (Stage 4)
```sql
zones (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "Lagos Mainland"
  zip_codes TEXT[], -- Nigerian postal codes
  sla_minutes INT DEFAULT 120, -- 2 hours
  active BOOLEAN DEFAULT true
)
```

### Shops
```sql
shops (
  id UUID PRIMARY KEY,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  zone_id UUID REFERENCES zones(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Products
```sql
products (
  id UUID PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT, -- e.g., "Beverages", "Snacks"
  unit TEXT DEFAULT 'piece', -- piece, kg, liter
  price_kobo INT NOT NULL CHECK (price_kobo >= 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

CREATE INDEX idx_products_active_category ON products(active, category);
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || brand));
```

### Inventory (Stage 1)
```sql
inventory (
  product_id UUID REFERENCES products(id),
  warehouse_id UUID, -- future: multiple warehouses
  qty_on_hand INT NOT NULL CHECK (qty_on_hand >= 0),
  low_stock_threshold INT DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (product_id, warehouse_id)
)
```

### Orders
```sql
orders (
  id UUID PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'canceled'
  )),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  
  subtotal_kobo INT NOT NULL,
  discount_kobo INT DEFAULT 0,
  total_kobo INT NOT NULL,
  
  eta_at TIMESTAMPTZ, -- expected delivery
  confirmed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  rider_id UUID REFERENCES users(id), -- Stage 2
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

CREATE INDEX idx_orders_shop_status ON orders(shop_id, status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

### Order Items
```sql
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  qty INT NOT NULL CHECK (qty > 0),
  unit_price_kobo INT NOT NULL,
  line_total_kobo INT NOT NULL,
  
  CONSTRAINT check_line_total CHECK (line_total_kobo = qty * unit_price_kobo)
)
```

### Audit Log (immutable)
```sql
audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  role TEXT NOT NULL,
  entity TEXT NOT NULL, -- 'order', 'product', 'inventory'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'status_changed', 'canceled'
  metadata JSONB, -- old/new values
  ts TIMESTAMPTZ DEFAULT NOW()
)

CREATE INDEX idx_audit_entity ON audit_log(entity, entity_id, ts DESC);
```

### Payments (Stage 2)
```sql
payments (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  provider TEXT DEFAULT 'paystack', -- or 'cod'
  provider_ref TEXT UNIQUE, -- Paystack reference
  amount_kobo INT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Relationships
```
suppliers (1) ──> (N) shops
shops (1) ──> (N) orders
orders (1) ──> (N) order_items
products (1) ──> (N) order_items
products (1) ──> (1) inventory
zones (1) ──> (N) shops
```

## State Machines

### Order Status
```
pending → confirmed → packed → out_for_delivery → delivered
   ↓
canceled (only from pending/confirmed)
```

### Payment Status
```
unpaid → paid
  ↓
refunded (only from paid)
```

## RLS Policies (Examples)
```sql
-- Shops can only see their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shops_select_own_orders"
ON orders FOR SELECT
USING (
  auth.uid() IN (SELECT user_id FROM shops WHERE id = orders.shop_id)
);

-- Admins see all orders in their zones
CREATE POLICY "admins_select_zone_orders"
ON orders FOR SELECT
USING (
  auth.role() = 'admin' AND
  shop_id IN (SELECT id FROM shops WHERE zone_id IN (
    SELECT zone_id FROM admin_zones WHERE admin_id = auth.uid()
  ))
);
```

## Migration Strategy

- Alembic for schema changes
- Every migration has `upgrade()` and `downgrade()`
- Test migrations on staging DB first
- Never drop columns with data (rename → deprecate → drop)
