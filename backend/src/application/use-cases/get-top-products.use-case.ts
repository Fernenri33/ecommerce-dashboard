import type {
  ProductRankingFilters,
  ProductRankingItem,
  SalesRepository,
} from "../../domain/repositories/sales.repository.js";

export class GetTopProductsUseCase {
  constructor(private readonly salesRepository: SalesRepository) {}

  // Caso de uso para la tabla de productos. Mantiene aislada la decision de
  // ranking para que el controlador solo traduzca query params a filtros.
  async execute(filters: ProductRankingFilters): Promise<ProductRankingItem[]> {
    return this.salesRepository.getTopProducts(filters);
  }
}
