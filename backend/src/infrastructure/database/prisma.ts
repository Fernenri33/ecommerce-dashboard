import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 usa el adapter-pg para conectarse a PostgreSQL desde DATABASE_URL.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Cliente compartido por los repositorios de infraestructura.
export const prisma = new PrismaClient({ adapter });
