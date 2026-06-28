import { describe, expect, it } from "vitest";
import {
  formatNutritionNumber,
  formatProductEntryName,
  formatQuantity
} from "./nutrition-formatting";

describe("nutrition formatting", () => {
  it("keeps whole numbers compact and decimals readable", () => {
    expect(formatNutritionNumber(12)).toBe("12");
    expect(formatNutritionNumber(12.54)).toBe("12.5");
  });

  it("formats quantities by nutrition basis", () => {
    expect(formatQuantity(250, "per_100g")).toBe("250 g");
    expect(formatQuantity(600, "per_100ml")).toBe("600 ml");
    expect(formatQuantity(1.5, "per_unit", "banana")).toBe("1.5 banana");
  });

  it("formats product entry titles by basis", () => {
    expect(formatProductEntryName("Banana", 2, "per_unit", "banana")).toBe("Banana x 2");
    expect(formatProductEntryName("Cottage Cheese", 250, "per_100g", null)).toBe(
      "Cottage Cheese 250 g"
    );
  });
});
