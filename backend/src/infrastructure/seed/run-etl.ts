import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const rootDir = process.cwd();

async function runSqlFile(fileName: string) {
  const filePath = path.join(rootDir, "sql", fileName);
  const sql = fs.readFileSync(filePath, "utf8");

  console.log(`Running SQL: ${fileName}`);
  await pool.query(sql);
}

async function truncateRawTables() {
  await pool.query(`
    TRUNCATE TABLE
      raw.customers,
      raw.geolocation,
      raw.order_items,
      raw.order_payments,
      raw.order_reviews,
      raw.orders,
      raw.products,
      raw.sellers,
      raw.product_category_translation
    RESTART IDENTITY CASCADE;
  `);
}

async function loadCsvToRaw(
  fileName: string,
  tableName: string,
  columns: string[],
) {
  const filePath = path.join(rootDir, "data", fileName);

  console.log(`Loading ${fileName} → raw.${tableName}`);

  const parser = fs
    .createReadStream(filePath)
    .pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }),
    );

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for await (const record of parser) {
      const values = columns.map((column) => record[column] ?? null);
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");

      await client.query(
        `
        INSERT INTO raw.${tableName} (${columns.join(", ")})
        VALUES (${placeholders});
        `,
        values,
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`Error loading ${fileName}`, error);
    throw error;
  } finally {
    client.release();
  }
}

async function loadRawCsvs() {
  await truncateRawTables();

  await loadCsvToRaw("olist_customers_dataset.csv", "customers", [
    "customer_id",
    "customer_unique_id",
    "customer_zip_code_prefix",
    "customer_city",
    "customer_state",
  ]);

  await loadCsvToRaw("olist_geolocation_dataset.csv", "geolocation", [
    "geolocation_zip_code_prefix",
    "geolocation_lat",
    "geolocation_lng",
    "geolocation_city",
    "geolocation_state",
  ]);

  await loadCsvToRaw("olist_orders_dataset.csv", "orders", [
    "order_id",
    "customer_id",
    "order_status",
    "order_purchase_timestamp",
    "order_approved_at",
    "order_delivered_carrier_date",
    "order_delivered_customer_date",
    "order_estimated_delivery_date",
  ]);

  await loadCsvToRaw("olist_order_items_dataset.csv", "order_items", [
    "order_id",
    "order_item_id",
    "product_id",
    "seller_id",
    "shipping_limit_date",
    "price",
    "freight_value",
  ]);

  await loadCsvToRaw("olist_order_payments_dataset.csv", "order_payments", [
    "order_id",
    "payment_sequential",
    "payment_type",
    "payment_installments",
    "payment_value",
  ]);

  await loadCsvToRaw("olist_order_reviews_dataset.csv", "order_reviews", [
    "review_id",
    "order_id",
    "review_score",
    "review_comment_title",
    "review_comment_message",
    "review_creation_date",
    "review_answer_timestamp",
  ]);

  await loadCsvToRaw("olist_products_dataset.csv", "products", [
    "product_id",
    "product_category_name",
    "product_name_lenght",
    "product_description_lenght",
    "product_photos_qty",
    "product_weight_g",
    "product_length_cm",
    "product_height_cm",
    "product_width_cm",
  ]);

  await loadCsvToRaw("olist_sellers_dataset.csv", "sellers", [
    "seller_id",
    "seller_zip_code_prefix",
    "seller_city",
    "seller_state",
  ]);

  await loadCsvToRaw(
    "product_category_name_translation.csv",
    "product_category_translation",
    ["product_category_name", "product_category_name_english"],
  );
}

async function main() {
  await runSqlFile("001_create_schemas.sql");
  await runSqlFile("002_create_raw_tables.sql");
  await runSqlFile("003_create_clean_tables.sql");
  await runSqlFile("004_create_gold_tables.sql");

  await loadRawCsvs();

  await runSqlFile("005_raw_to_clean.sql");
  await runSqlFile("006_clean_to_gold.sql");

  console.log("ETL finished successfully");
}

main()
  .catch((error) => {
    console.error("ETL failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });