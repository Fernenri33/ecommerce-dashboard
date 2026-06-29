import type { Request, Response } from "express";
import { GetKpisUseCase } from "../../../application/use-cases/get-kpis.use-case.js";
import { PrismaSalesRepository } from "../../../infrastructure/repositories/prisma-sales.repository.js";
import { GetRevenueTrendUseCase } from "../../../application/use-cases/get-revenue-trend.use-case.js";
import type {
  KpiFilters,
  RevenueTrendFilters,
  ProductRankingFilters,
} from "../../../domain/repositories/sales.repository.js";
import { GetTopProductsUseCase } from "../../../application/use-cases/get-top-products.use-case.js";
import { validateDateRange } from "../validators/date-range.validator.js";

// Composicion manual de dependencias: el adaptador HTTP crea los casos de uso
// con el repositorio concreto. Asi el dominio sigue libre de Express y Prisma.
const salesRepository = new PrismaSalesRepository();
const getKpisUseCase = new GetKpisUseCase(salesRepository);
const getRevenueTrendUseCase = new GetRevenueTrendUseCase(salesRepository);
const getTopProductsUseCase = new GetTopProductsUseCase(salesRepository);

export async function getKpisController(req: Request, res: Response) {
  try {
    const { from, to, status, state, category } = req.query;

    // El rango de fechas es obligatorio para mantener consultas acotadas al
    // dataset Olist disponible y devolver errores claros al frontend.
    const dateRange = validateDateRange(from, to);
    if (!dateRange.ok) {
      return res.status(400).json({ message: dateRange.message });
    }

    const filters: KpiFilters = {
      from: dateRange.from,
      to: dateRange.to,
    };

    // Normalizacion minima de filtros opcionales antes de pasar al caso de uso.
    if (status) filters.status = String(status);
    if (state) filters.state = String(state).toUpperCase();
    if (category) filters.category = String(category);

    return res.json(await getKpisUseCase.execute(filters));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getRevenueTrendController(req: Request, res: Response) {
  try {
    const { from, to, grain = "day", status, state, category } = req.query;

    const dateRange = validateDateRange(from, to);
    if (!dateRange.ok) {
      return res.status(400).json({ message: dateRange.message });
    }

    // grain controla un fragmento SQL interno, por eso se valida como enum antes
    // de llegar al repositorio.
    if (grain !== "day" && grain !== "week") {
      return res.status(400).json({ message: "grain must be day or week" });
    }

    const filters: RevenueTrendFilters = {
      from: dateRange.from,
      to: dateRange.to,
      grain,
    };

    if (status) filters.status = String(status);
    if (state) filters.state = String(state).toUpperCase();
    if (category) filters.category = String(category);

    return res.json(await getRevenueTrendUseCase.execute(filters));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTopProductsController(req: Request, res: Response) {
  try {
    const {
      from,
      to,
      metric = "gmv",
      limit = "10",
      status,
      state,
      category,
    } = req.query;

    const dateRange = validateDateRange(from, to);
    if (!dateRange.ok) {
      return res.status(400).json({ message: dateRange.message });
    }

    // metric tambien decide el ORDER BY interno. Solo se aceptan las metricas
    // disponibles en el contrato del endpoint.
    if (metric !== "gmv" && metric !== "revenue") {
      return res.status(400).json({ message: "metric must be gmv or revenue" });
    }

    // Se limita el tamano para proteger al dashboard de respuestas enormes y
    // evitar consultas innecesariamente pesadas.
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return res
        .status(400)
        .json({ message: "limit must be an integer between 1 and 50" });
    }

    const filters: ProductRankingFilters = {
      from: dateRange.from,
      to: dateRange.to,
      metric: metric as "gmv" | "revenue",
      limit: parsedLimit,
    };

    if (status) filters.status = String(status);
    if (state) filters.state = String(state).toUpperCase();
    if (category) filters.category = String(category);

    return res.json(await getTopProductsUseCase.execute(filters));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
