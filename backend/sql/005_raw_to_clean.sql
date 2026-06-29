TRUNCATE TABLE
    clean.order_reviews,
    clean.order_payments,
    clean.order_items,
    clean.orders,
    clean.products,
    clean.sellers,
    clean.geolocation,
    clean.product_category_translation,
    clean.customers
CASCADE;

INSERT INTO clean.customers
SELECT
    customer_id,
    customer_unique_id,
    NULLIF(TRIM(customer_zip_code_prefix), '')::INTEGER,
    TRIM(customer_city),
    UPPER(TRIM(customer_state))
FROM raw.customers;

INSERT INTO clean.products
SELECT
    product_id,
    NULLIF(TRIM(product_category_name), ''),
    NULLIF(TRIM(product_name_lenght), '')::INTEGER,
    NULLIF(TRIM(product_description_lenght), '')::INTEGER,
    NULLIF(TRIM(product_photos_qty), '')::INTEGER,
    NULLIF(TRIM(product_weight_g), '')::INTEGER,
    NULLIF(TRIM(product_length_cm), '')::INTEGER,
    NULLIF(TRIM(product_height_cm), '')::INTEGER,
    NULLIF(TRIM(product_width_cm), '')::INTEGER
FROM raw.products;

INSERT INTO clean.sellers
SELECT
    seller_id,
    NULLIF(TRIM(seller_zip_code_prefix), '')::INTEGER,
    TRIM(seller_city),
    UPPER(TRIM(seller_state))
FROM raw.sellers;

INSERT INTO clean.orders
SELECT
    order_id,
    customer_id,
    LOWER(TRIM(order_status)),
    NULLIF(TRIM(order_purchase_timestamp), '')::TIMESTAMP,
    NULLIF(TRIM(order_approved_at), '')::TIMESTAMP,
    NULLIF(TRIM(order_delivered_carrier_date), '')::TIMESTAMP,
    NULLIF(TRIM(order_delivered_customer_date), '')::TIMESTAMP,
    NULLIF(TRIM(order_estimated_delivery_date), '')::TIMESTAMP
FROM raw.orders;

INSERT INTO clean.order_items
SELECT
    order_id,
    NULLIF(TRIM(order_item_id), '')::INTEGER,
    product_id,
    seller_id,
    NULLIF(TRIM(shipping_limit_date), '')::TIMESTAMP,
    NULLIF(TRIM(price), '')::NUMERIC(12,2),
    NULLIF(TRIM(freight_value), '')::NUMERIC(12,2)
FROM raw.order_items;

INSERT INTO clean.order_payments
SELECT
    order_id,
    NULLIF(TRIM(payment_sequential), '')::INTEGER,
    LOWER(TRIM(payment_type)),
    NULLIF(TRIM(payment_installments), '')::INTEGER,
    NULLIF(TRIM(payment_value), '')::NUMERIC(12,2)
FROM raw.order_payments;

INSERT INTO clean.order_reviews
SELECT
    review_id,
    order_id,
    NULLIF(TRIM(review_score), '')::INTEGER,
    NULLIF(TRIM(review_comment_title), ''),
    NULLIF(TRIM(review_comment_message), ''),
    NULLIF(TRIM(review_creation_date), '')::TIMESTAMP,
    NULLIF(TRIM(review_answer_timestamp), '')::TIMESTAMP
FROM raw.order_reviews;

INSERT INTO clean.geolocation (
    geolocation_zip_code_prefix,
    geolocation_lat,
    geolocation_lng,
    geolocation_city,
    geolocation_state
)
SELECT
    NULLIF(TRIM(geolocation_zip_code_prefix), '')::INTEGER,
    NULLIF(TRIM(geolocation_lat), '')::NUMERIC(10,7),
    NULLIF(TRIM(geolocation_lng), '')::NUMERIC(10,7),
    TRIM(geolocation_city),
    UPPER(TRIM(geolocation_state))
FROM raw.geolocation;

INSERT INTO clean.product_category_translation
SELECT
    product_category_name,
    product_category_name_english
FROM raw.product_category_translation;