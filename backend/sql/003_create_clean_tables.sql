CREATE TABLE IF NOT EXISTS clean.customers (
    customer_id TEXT PRIMARY KEY,
    customer_unique_id TEXT NOT NULL,
    customer_zip_code_prefix INTEGER,
    customer_city TEXT,
    customer_state CHAR(2)
);

CREATE TABLE IF NOT EXISTS clean.geolocation (
    geolocation_id BIGSERIAL PRIMARY KEY,

    geolocation_zip_code_prefix INTEGER,

    geolocation_lat NUMERIC(10,7),
    geolocation_lng NUMERIC(10,7),

    geolocation_city TEXT,
    geolocation_state CHAR(2)
);

CREATE TABLE IF NOT EXISTS clean.orders (
    order_id TEXT PRIMARY KEY,

    customer_id TEXT NOT NULL,

    order_status TEXT NOT NULL,

    order_purchase_timestamp TIMESTAMP,
    order_approved_at TIMESTAMP,

    order_delivered_carrier_date TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,

    order_estimated_delivery_date TIMESTAMP,

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES clean.customers(customer_id)
);

CREATE TABLE IF NOT EXISTS clean.products (
    product_id TEXT PRIMARY KEY,

    product_category_name TEXT,

    product_name_length INTEGER,
    product_description_length INTEGER,

    product_photos_qty INTEGER,

    product_weight_g INTEGER,

    product_length_cm INTEGER,
    product_height_cm INTEGER,
    product_width_cm INTEGER
);

CREATE TABLE IF NOT EXISTS clean.sellers (
    seller_id TEXT PRIMARY KEY,

    seller_zip_code_prefix INTEGER,

    seller_city TEXT,
    seller_state CHAR(2)
);

CREATE TABLE IF NOT EXISTS clean.order_items (
    order_id TEXT NOT NULL,

    order_item_id INTEGER NOT NULL,

    product_id TEXT,
    seller_id TEXT,

    shipping_limit_date TIMESTAMP,

    price NUMERIC(12,2),
    freight_value NUMERIC(12,2),

    PRIMARY KEY (
        order_id,
        order_item_id
    ),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES clean.orders(order_id),

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES clean.products(product_id),

    CONSTRAINT fk_order_items_seller
        FOREIGN KEY (seller_id)
        REFERENCES clean.sellers(seller_id)
);

CREATE TABLE IF NOT EXISTS clean.order_payments (
    order_id TEXT NOT NULL,

    payment_sequential INTEGER NOT NULL,

    payment_type TEXT,

    payment_installments INTEGER,

    payment_value NUMERIC(12,2),

    PRIMARY KEY (
        order_id,
        payment_sequential
    ),

    CONSTRAINT fk_order_payments_order
        FOREIGN KEY (order_id)
        REFERENCES clean.orders(order_id)
);

CREATE TABLE IF NOT EXISTS clean.order_reviews (
    review_id TEXT NOT NULL,

    order_id TEXT NOT NULL,

    review_score INTEGER,

    review_comment_title TEXT,
    review_comment_message TEXT,

    review_creation_date TIMESTAMP,
    review_answer_timestamp TIMESTAMP,

    PRIMARY KEY (
        review_id,
        order_id
    ),

    CONSTRAINT fk_order_reviews_order
        FOREIGN KEY (order_id)
        REFERENCES clean.orders(order_id)
);

CREATE TABLE IF NOT EXISTS clean.product_category_translation (
    product_category_name TEXT PRIMARY KEY,

    product_category_name_english TEXT
);