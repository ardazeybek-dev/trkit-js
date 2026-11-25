/**
 * Ready-made Zod schemas for Turkish form fields.
 *
 *     import { z } from "zod";
 *     import { tckn, iban, phone } from "@ardazeybek-dev/trkit/zod";
 *
 *     const Customer = z.object({ tckn: tckn(), iban: iban(), phone: phone({ mobileOnly: true }) });
 *
 * Each schema trims the input, checks it and returns it in a normal form
 * (IBAN without spaces, phone in E.164, plate as `34 ABC 123`), so what you
 * store is consistent no matter how the user typed it.
 *
 * Works with Zod 3 and Zod 4. Pass `{ message }` to replace the default
 * (English) error text, for example with a Turkish one.
 */

import { z } from "zod";
import { formatPlate, isValidPlate } from "./plates.js";
import { isValidIban, isValidPhone, isValidTckn, isValidVkn, normalizePhone, type PhoneOptions } from "./validate.js";

export interface MessageOption {
  message?: string;
}

const compact = (value: string): string => value.replace(/\s+/g, "");

/** T.C. Kimlik No. Output: the 11 digits. */
export const tckn = (opts: MessageOption = {}) =>
  z
    .string()
    .trim()
    .refine(isValidTckn, { message: opts.message ?? "Invalid Turkish national ID number" });

/** Vergi Kimlik No. Output: the 10 digits, spaces removed. */
export const vkn = (opts: MessageOption = {}) =>
  z
    .string()
    .transform(compact)
    .refine(isValidVkn, { message: opts.message ?? "Invalid Turkish tax ID number" });

/** Türkiye IBAN. Output: upper case, no spaces (`TR330006…`). */
export const iban = (opts: MessageOption = {}) =>
  z
    .string()
    .transform((v) => compact(v).toUpperCase())
    .refine(isValidIban, { message: opts.message ?? "Invalid Turkish IBAN" });

/** Turkish phone number. Output: E.164 (`+905321234567`). */
export const phone = (opts: MessageOption & PhoneOptions = {}) =>
  z
    .string()
    .trim()
    .refine((v) => isValidPhone(v, opts), {
      message: opts.message ?? (opts.mobileOnly ? "Invalid Turkish mobile number" : "Invalid Turkish phone number"),
    })
    .transform((v) => normalizePhone(v) as string);

/** Licence plate. Output: `34 ABC 123`. */
export const plate = (opts: MessageOption = {}) =>
  z
    .string()
    .trim()
    .refine(isValidPlate, { message: opts.message ?? "Invalid Turkish licence plate" })
    .transform((v) => formatPlate(v) as string);
