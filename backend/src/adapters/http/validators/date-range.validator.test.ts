import { describe, expect, it } from "vitest";
import { validateDateRange } from "./date-range.validator.js";

describe("validateDateRange", () => {
  it("should validate correct dates", () => {
    const result = validateDateRange(
      "2017-01-01",
      "2018-12-31",
    );

    expect(result.ok).toBe(true);
  });

  it("should reject invalid format", () => {
    const result = validateDateRange(
      "01/01/2017",
      "2018-12-31",
    );

    expect(result.ok).toBe(false);
  });

  it("should reject inverted range", () => {
    const result = validateDateRange(
      "2018-12-31",
      "2017-01-01",
    );



    expect(result.ok).toBe(false);
  });

  it("should reject dates outside dataset range", () => {
    const result = validateDateRange("2017-01-01", "2030-12-31");

    expect(result.ok).toBe(false);
  });

});