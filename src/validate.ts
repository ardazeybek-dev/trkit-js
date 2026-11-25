/**
 * Türkiye-specific validators. Every check here is a checksum or format test:
 * it tells you the value is well-formed, not that it belongs to a real person,
 * company or account.
 */

const strip = (value: string | number): string => String(value).replace(/\s+/g, "");

/**
 * Turkish national ID number (T.C. Kimlik No).
 *
 * 1. Exactly 11 digits, the first one non-zero.
 * 2. `(d1 + d3 + d5 + d7 + d9) * 7 - (d2 + d4 + d6 + d8)` mod 10 equals d10.
 * 3. The sum of the first ten digits mod 10 equals d11.
 */
export function isValidTckn(value: string | number): boolean {
  const text = String(value).trim();
  if (!/^[1-9][0-9]{10}$/.test(text)) return false;
  const d = Array.from(text, Number);
  const odd = d[0]! + d[2]! + d[4]! + d[6]! + d[8]!;
  const even = d[1]! + d[3]! + d[5]! + d[7]!;
  // JavaScript's % keeps the sign, so bring a negative result back into 0-9.
  if ((((odd * 7 - even) % 10) + 10) % 10 !== d[9]) return false;
  return d.slice(0, 10).reduce((a, b) => a + b, 0) % 10 === d[10];
}

/**
 * Turkish tax identification number (Vergi Kimlik No), ten digits with one
 * check digit. One in ten random ten-digit numbers passes this check, so use
 * it to catch typos, not to prove anything.
 */
export function isValidVkn(value: string | number): boolean {
  const text = strip(value);
  if (!/^[0-9]{10}$/.test(text)) return false;
  let total = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (Number(text[i]) + 9 - i) % 10;
    if (tmp === 0) continue;
    const product = (tmp * 2 ** (9 - i)) % 9;
    total += product === 0 ? 9 : product;
  }
  return (10 - (total % 10)) % 10 === Number(text[9]);
}

/**
 * Türkiye IBAN: `TR`, two check digits, 22 digits. Spaces are ignored and the
 * ISO 13616 mod-97 test is applied.
 */
export function isValidIban(value: string): boolean {
  const compact = strip(value).toUpperCase();
  if (!/^TR[0-9]{24}$/.test(compact)) return false;
  const rearranged = compact.slice(4) + compact.slice(0, 4);
  // Letters become two-digit numbers (A=10 … Z=35); here only T and R occur.
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  // Reduce piece by piece so the number never leaves safe-integer range.
  let rest = 0;
  for (const ch of numeric) rest = (rest * 10 + Number(ch)) % 97;
  return rest === 1;
}

/** Format a Türkiye IBAN in groups of four: `TR33 0006 1005 …`. */
export function formatIban(value: string): string {
  return strip(value).toUpperCase().replace(/(.{4})(?=.)/g, "$1 ");
}

/**
 * Normalise a Turkish phone number to E.164 (`+905321234567`), or return
 * `null` when it is not one. Accepts the common ways people type it:
 * `0532 123 45 67`, `(0532) 123-45-67`, `+90 532 123 45 67`, `5321234567`.
 *
 * Mobile numbers start with 5 after the country code; landlines start with
 * an area code from 2 to 4; `850` is the nationwide business prefix.
 */
export function normalizePhone(value: string): string | null {
  let digits = String(value).replace(/[\s().\-/]/g, "");
  if (digits.startsWith("+")) {
    if (!digits.startsWith("+90")) return null;
    digits = digits.slice(3);
  } else if (digits.startsWith("0090")) {
    digits = digits.slice(4);
  } else if (digits.length === 12 && digits.startsWith("90")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (!/^[0-9]{10}$/.test(digits)) return null;
  if (!/^(?:[2-5]|850)/.test(digits)) return null;
  return `+90${digits}`;
}

export interface PhoneOptions {
  /** Accept only mobile numbers (5xx). Default: `false`. */
  mobileOnly?: boolean;
}

/** Report whether a value is a Turkish phone number. */
export function isValidPhone(value: string, options: PhoneOptions = {}): boolean {
  const e164 = normalizePhone(value);
  if (e164 === null) return false;
  return options.mobileOnly ? e164[3] === "5" : true;
}

/** Format a Turkish phone number as `0532 123 45 67`, or `null` if invalid. */
export function formatPhone(value: string): string | null {
  const e164 = normalizePhone(value);
  if (e164 === null) return null;
  const n = e164.slice(3);
  return `0${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}`;
}
