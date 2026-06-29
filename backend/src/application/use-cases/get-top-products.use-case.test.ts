import { describe, expect, it, vi } from "vitest";
import { GetTopProductsUseCase } from "./get-top-products.use-case.js";

describe("GetTopProductsUseCase", () => {
  it("should return ranking", async () => {
    const repository = {
      getTopProducts: vi.fn().mockResolvedValue([
        {
          productId: "1",
          category: "electronics",
          gmv: 1000,
          revenue: 1200,
          orders: 50,
          items: 60,
        },
      ]),
    };

    const useCase = new GetTopProductsUseCase(repository as any);

    const result = await useCase.execute({
      from: "2017-01-01",
      to: "2018-12-31",
      metric: "gmv",
      limit: 10,
    });

    expect(result.length).toBe(1);
    expect(repository.getTopProducts).toHaveBeenCalled();
  });
});