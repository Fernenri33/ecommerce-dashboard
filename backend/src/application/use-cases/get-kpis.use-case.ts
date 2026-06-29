import type {
  KpiFilters,
  KpiResult,
  SalesRepository,
} from "../../domain/repositories/sales.repository.js";

export class GetKpisUseCase {
  constructor(private readonly salesRepository: SalesRepository) {}

  // Caso de uso del resumen ejecutivo. Hoy delega en el repositorio, pero deja
  // un punto claro para agregar reglas de negocio sin tocar HTTP ni SQL.
  async execute(filters: KpiFilters): Promise<KpiResult> {
    return this.salesRepository.getKpis(filters);
  }
}
