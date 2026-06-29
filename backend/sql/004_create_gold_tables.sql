-- 004_create_gold_tables.sql

DROP TABLE IF EXISTS gold.fact_sales CASCADE;
DROP TABLE IF EXISTS gold.dim_order CASCADE;
DROP TABLE IF EXISTS gold.dim_product CASCADE;
DROP TABLE IF EXISTS gold.dim_customer CASCADE;
DROP TABLE IF EXISTS gold.dim_date CASCADE;

CREATE TABLE gold.dim_date (
    date_id INTEGER PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    week INTEGER NOT NULL,
    quarter INTEGER NOT NULL
);

CREATE TABLE gold.dim_customer (
    customer_id TEXT PRIMARY KEY,
    customer_unique_id TEXT,
    city TEXT,
    state CHAR(2)
);

CREATE TABLE gold.dim_product (
    product_id TEXT PRIMARY KEY,
    product_category_name TEXT,
    product_category_name_english TEXT
);

CREATE TABLE gold.dim_order (
    order_id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    order_purchase_timestamp TIMESTAMP,
    order_approved_at TIMESTAMP,
    order_delivered_carrier_date TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP
);

CREATE TABLE gold.fact_sales (
    order_id TEXT NOT NULL,
    order_item_id INTEGER NOT NULL,
    date_id INTEGER NOT NULL,
    customer_id TEXT NOT NULL,
    product_id TEXT,
    item_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    freight_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_value_allocated NUMERIC(12,2) NOT NULL DEFAULT 0,
    is_delivered BOOLEAN NOT NULL DEFAULT FALSE,
    is_canceled BOOLEAN NOT NULL DEFAULT FALSE,
    is_on_time BOOLEAN,

    PRIMARY KEY (order_id, order_item_id),

    CONSTRAINT fk_fact_date
        FOREIGN KEY (date_id)
        REFERENCES gold.dim_date(date_id),

    CONSTRAINT fk_fact_customer
        FOREIGN KEY (customer_id)
        REFERENCES gold.dim_customer(customer_id),

    CONSTRAINT fk_fact_product
        FOREIGN KEY (product_id)
        REFERENCES gold.dim_product(product_id),

    CONSTRAINT fk_fact_order
        FOREIGN KEY (order_id)
        REFERENCES gold.dim_order(order_id)
);