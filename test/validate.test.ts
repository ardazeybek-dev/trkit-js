import { describe, expect, it } from "vitest";
import {
  formatIban, formatPhone, isValidIban, isValidPhone, isValidTckn, isValidVkn, normalizePhone,
} from "../src/index.js";

describe("TCKN", () => {
  it("accepts valid numbers", () => {
    expect(isValidTckn("10000000146")).toBe(true);
    expect(isValidTckn(10000000146)).toBe(true);
    expect(isValidTckn(" 10000000146 ")).toBe(true);
  });
  it("rejects invalid numbers", () => {
    for (const v of ["11111111111", "10000000147", "00000000146", "1000000014", "1000000014a", ""]) {
      expect(isValidTckn(v)).toBe(false);
    }
  });
  it("handles a negative intermediate sum", () => {
    // odd*7 - even is negative here: 1*7 - (9+9+9+9) = -29, -29 mod 10 = 1.
    const base = "1909090901";
    const d11 = Array.from(base, Number).reduce((a, b) => a + b, 0) % 10;
    expect(isValidTckn(base + d11)).toBe(true);
  });
});

describe("VKN", () => {
  it("checks the check digit", () => {
    expect(isValidVkn("4540536920")).toBe(true);
    expect(isValidVkn("454 053 6920")).toBe(true);
    expect(isValidVkn("4540536921")).toBe(false);
    expect(isValidVkn("454053692")).toBe(false);
  });
});

describe("IBAN", () => {
  it("validates with mod 97", () => {
    expect(isValidIban("TR33 0006 1005 1978 6457 8413 26")).toBe(true);
    expect(isValidIban("tr330006100519786457841326")).toBe(true);
    expect(isValidIban("TR33 0006 1005 1978 6457 8413 27")).toBe(false);
    expect(isValidIban("DE89370400440532013000")).toBe(false);
  });
  it("formats", () => {
    expect(formatIban("tr330006100519786457841326")).toBe("TR33 0006 1005 1978 6457 8413 26");
  });
});

describe("phone", () => {
  it("normalises the common spellings", () => {
    for (const v of ["0532 123 45 67", "(0532) 123-45-67", "+90 532 123 45 67", "5321234567", "905321234567", "0090 532 1234567"]) {
      expect(normalizePhone(v)).toBe("+905321234567");
    }
    expect(normalizePhone("0212 555 12 34")).toBe("+902125551234");
    expect(normalizePhone("0850 222 00 00")).toBe("+908502220000");
  });
  it("rejects non-Turkish or malformed numbers", () => {
    for (const v of ["+49 532 1234567", "0532 123 45 6", "0123 456 78 90", "0900 123 45 67", "abc"]) {
      expect(normalizePhone(v)).toBeNull();
    }
  });
  it("can require a mobile number", () => {
    expect(isValidPhone("0532 123 45 67", { mobileOnly: true })).toBe(true);
    expect(isValidPhone("0212 555 12 34", { mobileOnly: true })).toBe(false);
    expect(isValidPhone("0212 555 12 34")).toBe(true);
  });
  it("formats", () => {
    expect(formatPhone("+905321234567")).toBe("0532 123 45 67");
    expect(formatPhone("nope")).toBeNull();
  });
});
