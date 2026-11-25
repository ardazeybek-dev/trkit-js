import { describe, expect, it } from "vitest";
import { asciify, compare, lower, slugify, title, upper } from "../src/index.js";

describe("case", () => {
  it("handles dotted and dotless i", () => {
    expect(lower("IĞDIR")).toBe("ığdır");
    expect(lower("İSTANBUL")).toBe("istanbul");
    expect(upper("istanbul")).toBe("İSTANBUL");
    expect(upper("ığdır")).toBe("IĞDIR");
  });
  it("round-trips", () => {
    for (const w of ["Iğdır", "İzmir", "çiçek", "ŞIRNAK"]) expect(lower(upper(lower(w)))).toBe(lower(w));
  });
  it("title-cases and keeps whitespace", () => {
    expect(title("izmir kuş cenneti")).toBe("İzmir Kuş Cenneti");
    expect(title("  ILGAZ   dağı ")).toBe("  Ilgaz   Dağı ");
  });
});

describe("asciify and slugify", () => {
  it("folds Turkish letters", () => {
    expect(asciify("Çiğdem Şahin")).toBe("Cigdem Sahin");
    expect(asciify("IĞDIR ığdır İzmir")).toBe("IGDIR igdir Izmir");
    expect(asciify("café")).toBe("cafe");
  });
  it("makes slugs", () => {
    expect(slugify("Çığır Açan Şeyler")).toBe("cigir-acan-seyler");
    expect(slugify("Merhaba  Dünya!", "_")).toBe("merhaba_dunya");
    expect(slugify("IĞDIR")).toBe("igdir");
    expect(slugify("--Ölçü 100%--")).toBe("olcu-100");
    expect(slugify("a.b", ".")).toBe("a.b");
  });
});

describe("compare", () => {
  it("sorts in Turkish alphabet order", () => {
    expect(["şeker", "su", "çay", "cam", "ılık", "ilik", "öğle", "ok"].sort(compare)).toEqual([
      "cam", "çay", "ılık", "ilik", "ok", "öğle", "su", "şeker",
    ]);
  });
  it("ignores case first", () => {
    expect(["b", "A", "a", "Ç"].sort(compare)).toEqual(["A", "a", "b", "Ç"]);
  });
});
