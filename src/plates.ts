/** Licence plates: province codes and plate number format. */

import { asciify, lower } from "./text.js";

/** Province name for each plate code, 1 to 81. */
export const PLATES: Readonly<Record<number, string>> = Object.freeze({
  1: "Adana", 2: "Adıyaman", 3: "Afyonkarahisar", 4: "Ağrı", 5: "Amasya",
  6: "Ankara", 7: "Antalya", 8: "Artvin", 9: "Aydın", 10: "Balıkesir",
  11: "Bilecik", 12: "Bingöl", 13: "Bitlis", 14: "Bolu", 15: "Burdur",
  16: "Bursa", 17: "Çanakkale", 18: "Çankırı", 19: "Çorum", 20: "Denizli",
  21: "Diyarbakır", 22: "Edirne", 23: "Elazığ", 24: "Erzincan", 25: "Erzurum",
  26: "Eskişehir", 27: "Gaziantep", 28: "Giresun", 29: "Gümüşhane", 30: "Hakkâri",
  31: "Hatay", 32: "Isparta", 33: "Mersin", 34: "İstanbul", 35: "İzmir",
  36: "Kars", 37: "Kastamonu", 38: "Kayseri", 39: "Kırklareli", 40: "Kırşehir",
  41: "Kocaeli", 42: "Konya", 43: "Kütahya", 44: "Malatya", 45: "Manisa",
  46: "Kahramanmaraş", 47: "Mardin", 48: "Muğla", 49: "Muş", 50: "Nevşehir",
  51: "Niğde", 52: "Ordu", 53: "Rize", 54: "Sakarya", 55: "Samsun",
  56: "Siirt", 57: "Sinop", 58: "Sivas", 59: "Tekirdağ", 60: "Tokat",
  61: "Trabzon", 62: "Tunceli", 63: "Şanlıurfa", 64: "Uşak", 65: "Van",
  66: "Yozgat", 67: "Zonguldak", 68: "Aksaray", 69: "Bayburt", 70: "Karaman",
  71: "Kırıkkale", 72: "Batman", 73: "Şırnak", 74: "Bartın", 75: "Ardahan",
  76: "Iğdır", 77: "Yalova", 78: "Karabük", 79: "Kilis", 80: "Osmaniye",
  81: "Düzce",
});

// Keys are folded to lower-case ASCII, so "İzmir", "IZMIR", "izmir" and
// "Hakkari" (without the circumflex) all resolve. No two provinces collide.
const cityKey = (city: string): string => asciify(lower(city.trim())).toLowerCase();
const BY_CITY = new Map<string, number>();
for (const [code, city] of Object.entries(PLATES)) BY_CITY.set(cityKey(city), Number(code));

/** Province name for a plate code: `cityFromPlate("06") === "Ankara"`. */
export function cityFromPlate(code: number | string): string | null {
  const text = String(code).trim();
  if (!/^[0-9]{1,2}$/.test(text)) return null;
  return PLATES[Number(text)] ?? null;
}

/** Plate code for a province name, case-insensitive: `plateFromCity("İZMİR") === 35`. */
export function plateFromCity(city: string): number | null {
  return BY_CITY.get(cityKey(city)) ?? null;
}

const PLATE_RE = /^(\d{2})\s*([A-Z]{1,3})\s*(\d{2,5})$/;

/**
 * Report whether a string is a well-formed civilian licence plate such as
 * `34 ABC 123`. Spaces are optional and case is ignored.
 *
 * The province code must be 01-81, and the letter and number groups must be
 * one of the combinations in use: one letter with four or five digits, two
 * letters with three or four digits, three letters with two or three digits.
 * The letters Ç, Ğ, İ, Ö, Ş and Ü never appear on plates.
 */
export function isValidPlate(value: string): boolean {
  const m = PLATE_RE.exec(String(value).trim().toUpperCase());
  if (!m) return false;
  const [, province = "", letters = "", digits = ""] = m;
  const code = Number(province);
  if (code < 1 || code > 81) return false;
  const allowed: Record<number, [number, number]> = { 1: [4, 5], 2: [3, 4], 3: [2, 3] };
  const [min, max] = allowed[letters.length]!;
  return digits.length >= min && digits.length <= max;
}

/** Format a plate as `34 ABC 123`, or `null` when it is not valid. */
export function formatPlate(value: string): string | null {
  if (!isValidPlate(value)) return null;
  const [, p, l, d] = PLATE_RE.exec(String(value).trim().toUpperCase())!;
  return `${p} ${l} ${d}`;
}
