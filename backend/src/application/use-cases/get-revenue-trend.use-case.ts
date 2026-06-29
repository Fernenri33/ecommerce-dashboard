import type {
  RevenueTrendFilters,
  RevenueTrendItem,
  SalesRepository,
} from "../../domain/repositories/sales.repository.js";

export class GetRevenueTrendUseCase {
  constructor(private readonly salesRepository: SalesRepository) {}

  // Caso de uso para la serie temporal que consume el grafico del frontend.
  async execute(filters: RevenueTrendFilters): Promise<RevenueTrendItem[]> {
    return this.salesRepository.getRevenueTrend(filters);
  }
}
