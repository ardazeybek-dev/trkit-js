import { describe, expect, it } from "vitest";
import { z } from "zod";
import { iban, phone, plate, tckn, vkn } from "../src/zod.js";

describe("zod schemas", () => {
  const Form = z.object({ tckn: tckn(), vkn: vkn(), iban: iban(), phone: phone({ mobileOnly: true }), plate: plate() });

  it("parses and normalises", () => {
    expect(
      Form.parse({
        tckn: " 10000000146 ",
        vkn: "454 053 6920",
        iban: "tr33 0006 1005 1978 6457 8413 26",
        phone: "0532 123 45 67",
        plate: "34abc123",
      }),
    ).toEqual({
      tckn: "10000000146",
      vkn: "4540536920",
      iban: "TR330006100519786457841326",
      phone: "+905321234567",
      plate: "34 ABC 123",
    });
  });

  it("reports every bad field, with custom messages", () => {
    const r = z.object({ tckn: tckn({ message: "Geçersiz T.C. Kimlik No" }), phone: phone({ mobileOnly: true }) })
      .safeParse({ tckn: "11111111111", phone: "0212 555 12 34" });
    expect(r.success).toBe(false);
    const msgs = r.error!.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    expect(msgs).toEqual(["tckn: Geçersiz T.C. Kimlik No", "phone: Invalid Turkish mobile number"]);
  });
});
