import { Router } from "express";
import {
  getKpisController,
  getRevenueTrendController,
  getTopProductsController,
} from "./controllers/sales.controller.js";

export const router = Router();

// Endpoint liviano para comprobar que Express levanto correctamente.
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// KPIs agregados para las cards del dashboard.
router.get("/kpis", getKpisController);

// Serie temporal de revenue, agrupable por dia o semana.
router.get("/trend/revenue", getRevenueTrendController);

// Ranking de productos ordenado por GMV o revenue.
router.get("/rankings/products", getTopProductsController);
