import { describe, expect, it, vi } from "vitest";
import { GetKpisUseCase } from "./get-kpis.use-case.js";

describe("GetKpisUseCase", () => {
  it("should return KPI data", async () => {
    const repository = {
      getKpis: vi.fn().mockResolvedValue({
        gmv: 100,
        shipping: 10,
        revenue: 110,
        orders: 5,
        items: 7,
        aov: 22,
        itemsPerOrder: 1.4,
        cancellationRate: 0,
        onTimeDeliveryRate: 1,
      }),
    };

    const useCase = new GetKpisUseCase(repository as any);

    const result = await useCase.execute({
      from: "2017-01-01",
      to: "2018-12-31",
    });

    expect(result.gmv).toBe(100);
    expect(repository.getKpis).toHaveBeenCalled();
  });
});