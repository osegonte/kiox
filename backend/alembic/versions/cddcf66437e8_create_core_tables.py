"""create_core_tables

Revision ID: cddcf66437e8
Revises: 
Create Date: 2025-10-26
"""
from alembic import op
import sqlalchemy as sa

revision = 'cddcf66437e8'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Enable UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Suppliers table
    op.execute("""
        CREATE TABLE suppliers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            contact_phone TEXT NOT NULL,
            contact_email TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    
    # Zones table
    op.execute("""
        CREATE TABLE zones (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            sla_minutes INT DEFAULT 120,
            active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    
    # Shops table
    op.execute("""
        CREATE TABLE shops (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            owner_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            zone_id UUID REFERENCES zones(id),
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    
    # Products table
    op.execute("""
        CREATE TABLE products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sku TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            brand TEXT,
            category TEXT,
            unit TEXT DEFAULT 'piece',
            price_kobo INT NOT NULL CHECK (price_kobo >= 0),
            active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    
    # Create search index on products
    op.execute("""
        CREATE INDEX idx_products_active_category ON products(active, category)
    """)
    op.execute("""
        CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(brand, '')))
    """)
    
    # Inventory table
    op.execute("""
        CREATE TABLE inventory (
            product_id UUID REFERENCES products(id),
            warehouse_id UUID DEFAULT uuid_generate_v4(),
            qty_on_hand INT NOT NULL CHECK (qty_on_hand >= 0),
            low_stock_threshold INT DEFAULT 10,
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (product_id, warehouse_id)
        )
    """)
    
    # Orders table
    op.execute("""
        CREATE TABLE orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            shop_id UUID REFERENCES shops(id) NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN (
                'pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'canceled'
            )),
            payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
            subtotal_kobo INT NOT NULL,
            discount_kobo INT DEFAULT 0,
            total_kobo INT NOT NULL,
            eta_at TIMESTAMPTZ,
            confirmed_at TIMESTAMPTZ,
            delivered_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    
    # Create indexes on orders
    op.execute("""
        CREATE INDEX idx_orders_shop_status ON orders(shop_id, status)
    """)
    op.execute("""
        CREATE INDEX idx_orders_created ON orders(created_at DESC)
    """)
    
    # Order items table
    op.execute("""
        CREATE TABLE order_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            product_id UUID REFERENCES products(id),
            qty INT NOT NULL CHECK (qty > 0),
            unit_price_kobo INT NOT NULL,
            line_total_kobo INT NOT NULL,
            CONSTRAINT check_line_total CHECK (line_total_kobo = qty * unit_price_kobo)
        )
    """)
    
    # Audit log table (immutable)
    op.execute("""
        CREATE TABLE audit_log (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            actor_id TEXT,
            role TEXT NOT NULL,
            entity TEXT NOT NULL,
            entity_id UUID NOT NULL,
            action TEXT NOT NULL,
            metadata JSONB,
            ts TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    
    op.execute("""
        CREATE INDEX idx_audit_entity ON audit_log(entity, entity_id, ts DESC)
    """)
    
    # Enable Row Level Security on all tables
    op.execute("ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE zones ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE shops ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE products ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE inventory ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE orders ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE order_items ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY")
    
    # Create default policies (allow service role full access for now)
    tables = ['suppliers', 'zones', 'shops', 'products', 'inventory', 'orders', 'order_items', 'audit_log']
    for table in tables:
        op.execute(f"""
            CREATE POLICY "service_role_all_{table}"
            ON {table}
            FOR ALL
            USING (true)
        """)

def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS audit_log CASCADE")
    op.execute("DROP TABLE IF EXISTS order_items CASCADE")
    op.execute("DROP TABLE IF EXISTS orders CASCADE")
    op.execute("DROP TABLE IF EXISTS inventory CASCADE")
    op.execute("DROP TABLE IF EXISTS products CASCADE")
    op.execute("DROP TABLE IF EXISTS shops CASCADE")
    op.execute("DROP TABLE IF EXISTS zones CASCADE")
    op.execute("DROP TABLE IF EXISTS suppliers CASCADE")
