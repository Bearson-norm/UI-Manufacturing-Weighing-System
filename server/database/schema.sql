-- Manufacturing Dashboard Database Schema
-- PostgreSQL Database Schema for Manufacturing Order Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database (run this separately)
-- CREATE DATABASE kmi_manufacturing_db;

-- UoM (Unit of Measure) table
CREATE TABLE IF NOT EXISTS uom (
    uom_id SERIAL PRIMARY KEY,
    uom_code VARCHAR(10) NOT NULL UNIQUE,
    uom_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SKU (Stock Keeping Unit) table
CREATE TABLE IF NOT EXISTS sku (
    sku_id SERIAL PRIMARY KEY,
    sku_code VARCHAR(50) NOT NULL UNIQUE,
    sku_name VARCHAR(100) NOT NULL,
    sku_type VARCHAR(20) NOT NULL CHECK (sku_type IN ('Raw Material', 'Finished Goods', 'Semi Finished Goods')),
    base_uom_id INTEGER NOT NULL REFERENCES uom(uom_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- BOM (Bill of Materials) table
CREATE TABLE IF NOT EXISTS bom (
    bom_id SERIAL PRIMARY KEY,
    fg_sku_id INTEGER NOT NULL REFERENCES sku(sku_id),
    raw_sku_id INTEGER NOT NULL REFERENCES sku(sku_id),
    quantity DECIMAL(10,4) NOT NULL CHECK (quantity > 0),
    uom_id INTEGER NOT NULL REFERENCES uom(uom_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fg_sku_id, raw_sku_id)
);

-- Manufacturing Order table
CREATE TABLE IF NOT EXISTS manufacturing_order (
    mo_id SERIAL PRIMARY KEY,
    mo_code VARCHAR(50) NOT NULL UNIQUE,
    fg_sku_id INTEGER NOT NULL REFERENCES sku(sku_id),
    planned_qty DECIMAL(10,4) NOT NULL CHECK (planned_qty > 0),
    produced_qty DECIMAL(10,4) DEFAULT 0 CHECK (produced_qty >= 0),
    uom_id INTEGER NOT NULL REFERENCES uom(uom_id),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    mo_status VARCHAR(20) DEFAULT 'Draft' CHECK (mo_status IN ('Draft', 'In Progress', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Material Consumption table
CREATE TABLE IF NOT EXISTS material_consumption (
    consumption_id SERIAL PRIMARY KEY,
    mo_id INTEGER NOT NULL REFERENCES manufacturing_order(mo_id),
    raw_sku_id INTEGER NOT NULL REFERENCES sku(sku_id),
    consumed_qty DECIMAL(10,4) NOT NULL CHECK (consumed_qty > 0),
    uom_id INTEGER NOT NULL REFERENCES uom(uom_id),
    consumption_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'operator' CHECK (role IN ('admin', 'supervisor', 'operator')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sku_type ON sku(sku_type);
CREATE INDEX IF NOT EXISTS idx_sku_code ON sku(sku_code);
CREATE INDEX IF NOT EXISTS idx_bom_fg_sku ON bom(fg_sku_id);
CREATE INDEX IF NOT EXISTS idx_bom_raw_sku ON bom(raw_sku_id);
CREATE INDEX IF NOT EXISTS idx_mo_status ON manufacturing_order(mo_status);
CREATE INDEX IF NOT EXISTS idx_mo_code ON manufacturing_order(mo_code);
CREATE INDEX IF NOT EXISTS idx_consumption_mo ON material_consumption(mo_id);
CREATE INDEX IF NOT EXISTS idx_consumption_date ON material_consumption(consumption_date);
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_log(table_name, record_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_uom_updated_at BEFORE UPDATE ON uom FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sku_updated_at BEFORE UPDATE ON sku FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bom_updated_at BEFORE UPDATE ON bom FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mo_updated_at BEFORE UPDATE ON manufacturing_order FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


