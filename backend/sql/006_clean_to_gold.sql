-- 006_clean_to_gold.sql

TRUNCATE TABLE
    gold.fact_sales,
    gold.dim_order,
    gold.dim_product,
    gold.dim_customer,
    gold.dim_date
CASCADE;

INSERT INTO gold.dim_customer (
    customer_id,
    customer_unique_id,
    city,
    state
)
SELECT
    customer_id,
    customer_unique_id,
    customer_city,
    customer_state
FROM clean.customers;

INSERT INTO gold.dim_product (
    product_id,
    product_category_name,
    product_category_name_english
)
SELECT
    p.product_id,
    p.product_category_name,
    t.product_category_name_english
FROM clean.products p
LEFT JOIN clean.product_category_translation t
    ON t.product_category_name = p.product_category_name;

INSERT INTO gold.dim_order (
    order_id,
    status,
    order_purchase_timestamp,
    order_approved_at,
    order_delivered_carrier_date,
    order_delivered_customer_date,
    order_estimated_delivery_date
)
SELECT
    order_id,
    order_status,
    order_purchase_timestamp,
    order_approved_at,
    order_delivered_carrier_date,
    order_delivered_customer_date,
    order_estimated_delivery_date
FROM clean.orders;

INSERT INTO gold.dim_date (
    date_id,
    date,
    year,
    quarter,
    month,
    week,
    day
)
SELECT
    ROW_NUMBER() OVER (ORDER BY purchase_date) AS date_id,
    purchase_date,
    EXTRACT(YEAR FROM purchase_date)::INTEGER,
    EXTRACT(QUARTER FROM purchase_date)::INTEGER,
    EXTRACT(MONTH FROM purchase_date)::INTEGER,
    EXTRACT(WEEK FROM purchase_date)::INTEGER,
    EXTRACT(DAY FROM purchase_date)::INTEGER
FROM (
    SELECT DISTINCT
        DATE(order_purchase_timestamp) AS purchase_date
    FROM clean.orders
    WHERE order_purchase_timestamp IS NOT NULL
) dates;

INSERT INTO gold.fact_sales (
    order_id,
    order_item_id,
    date_id,
    customer_id,
    product_id,
    item_price,
    freight_value,
    payment_value_allocated,
    is_delivered,
    is_canceled,
    is_on_time
)
SELECT
    oi.order_id,
    oi.order_item_id,
    dd.date_id,
    o.customer_id,
    oi.product_id,
    COALESCE(oi.price, 0),
    COALESCE(oi.freight_value, 0),
    (
        COALESCE(p.total_payment, 0)
        / COUNT(*) OVER (PARTITION BY oi.order_id)
    ) AS payment_value_allocated,
    o.order_status = 'delivered',
    o.order_status = 'canceled',
    CASE
        WHEN o.order_delivered_customer_date IS NULL
            OR o.order_estimated_delivery_date IS NULL
        THEN NULL
        WHEN o.order_delivered_customer_date <= o.order_estimated_delivery_date
        THEN TRUE
        ELSE FALSE
    END AS is_on_time
FROM clean.order_items oi
INNER JOIN clean.orders o
    ON o.order_id = oi.order_id
INNER JOIN gold.dim_date dd
    ON dd.date = DATE(o.order_purchase_timestamp)
LEFT JOIN (
    SELECT
        order_id,
        SUM(payment_value) AS total_payment
    FROM clean.order_payments
    GROUP BY order_id
) p
    ON p.order_id = oi.order_id;