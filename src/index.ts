/** trkit: Turkish text utilities and Türkiye-specific validators. */

export { asciify, compare, lower, slugify, title, upper } from "./text.js";
export {
  formatIban,
  formatPhone,
  isValidIban,
  isValidPhone,
  isValidTckn,
  isValidVkn,
  normalizePhone,
  type PhoneOptions,
} from "./validate.js";
export { PLATES, cityFromPlate, formatPlate, isValidPlate, plateFromCity } from "./plates.js";
