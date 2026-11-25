import { describe, expect, it } from "vitest";
import { PLATES, cityFromPlate, formatPlate, isValidPlate, plateFromCity } from "../src/index.js";

describe("province codes", () => {
  it("has all 81", () => {
    expect(Object.keys(PLATES)).toHaveLength(81);
  });
  it("maps both ways", () => {
    expect(cityFromPlate(35)).toBe("İzmir");
    expect(cityFromPlate("06")).toBe("Ankara");
    expect(cityFromPlate(99)).toBeNull();
    expect(cityFromPlate("3a")).toBeNull();
    expect(plateFromCity("İSTANBUL")).toBe(34);
    expect(plateFromCity("istanbul")).toBe(34);
    expect(plateFromCity("Igdir")).toBe(76);
    expect(plateFromCity("Hakkari")).toBe(30);
    expect(plateFromCity("Berlin")).toBeNull();
  });
  it("round-trips every province", () => {
    for (const [code, city] of Object.entries(PLATES)) expect(plateFromCity(city)).toBe(Number(code));
  });
});

describe("plate numbers", () => {
  it("accepts valid shapes", () => {
    for (const v of ["34 ABC 123", "34abc12", "06 A 1234", "06 A 12345", "35 AB 123", "35 AB 1234", "81 XYZ 99"]) {
      expect(isValidPlate(v)).toBe(true);
    }
  });
  it("rejects invalid shapes", () => {
    for (const v of ["00 ABC 123", "82 ABC 123", "34 A 123", "34 AB 12", "34 ABC 1234", "34 ABCD 12", "34 ŞEN 123", "3 ABC 123"]) {
      expect(isValidPlate(v)).toBe(false);
    }
  });
  it("formats", () => {
    expect(formatPlate("34abc123")).toBe("34 ABC 123");
    expect(formatPlate("bad")).toBeNull();
  });
});
