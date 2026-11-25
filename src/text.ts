/**
 * Turkish-aware text operations.
 *
 * `String.prototype.toUpperCase()` does not know about the Turkish dotted and
 * dotless `i`:
 *
 *     "istanbul".toUpperCase()  -> "ISTANBUL"  (should be "İSTANBUL")
 *     "IĞDIR".toLowerCase()     -> "iğdır"     (should be "ığdır")
 *
 * `toLocaleUpperCase("tr")` fixes this only where the runtime ships full ICU
 * data, so these functions apply the rules themselves and behave the same in
 * every browser, Node build and edge runtime.
 */

const LOWER_MAP: Record<string, string> = { I: "ı", İ: "i" };
const UPPER_MAP: Record<string, string> = { i: "İ", ı: "I" };

const ASCII_MAP: Record<string, string> = {
  ç: "c", Ç: "C",
  ğ: "g", Ğ: "G",
  ı: "i", İ: "I",
  ö: "o", Ö: "O",
  ş: "s", Ş: "S",
  ü: "u", Ü: "U",
};

function mapChars(text: string, map: Record<string, string>): string {
  let out = "";
  for (const ch of text) out += map[ch] ?? ch;
  return out;
}

/** Lower-case text using Turkish rules: `lower("IĞDIR") === "ığdır"`. */
export function lower(text: string): string {
  return mapChars(text, LOWER_MAP).toLowerCase();
}

/** Upper-case text using Turkish rules: `upper("istanbul") === "İSTANBUL"`. */
export function upper(text: string): string {
  return mapChars(text, UPPER_MAP).toUpperCase();
}

/**
 * Capitalise the first letter of each word using Turkish rules.
 * Whitespace between words is preserved.
 *
 * `title("izmir kuş cenneti") === "İzmir Kuş Cenneti"`
 */
export function title(text: string): string {
  return text
    .split(/(\s+)/)
    .map((part) => {
      if (part === "" || /^\s+$/.test(part)) return part;
      const [first = "", ...rest] = Array.from(part);
      return upper(first) + lower(rest.join(""));
    })
    .join("");
}

/**
 * Replace Turkish letters with their ASCII counterparts and drop any other
 * accents: `asciify("Çiğdem Şahin") === "Cigdem Sahin"`.
 */
export function asciify(text: string): string {
  return mapChars(text, ASCII_MAP)
    .normalize("NFKD")
    .replace(/\p{M}/gu, "");
}

/**
 * Convert text into a URL-safe slug.
 *
 * `slugify("Çığır Açan Şeyler") === "cigir-acan-seyler"`
 */
export function slugify(text: string, separator = "-"): string {
  // Lower-case with Turkish rules first, then fold to ASCII. The other way
  // around, "IĞDIR" would become "IGDIR" and then "ıgdır", and the dotless ı
  // would be dropped.
  const ascii = asciify(lower(text)).toLowerCase();
  let slug = ascii.replace(/[^a-z0-9]+/g, separator);
  if (separator) {
    const esc = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    slug = slug.replace(new RegExp(`^(?:${esc})+|(?:${esc})+$`, "g"), "");
  }
  return slug;
}

/**
 * Compare two strings the way a Turkish reader expects: ç after c, ğ after g,
 * ı before i, ö after o, ş after s, ü after u. Case is ignored first and used
 * only to break ties. Ready to pass to `Array.prototype.sort`.
 *
 * `["şeker", "su", "çay", "cam"].sort(compare)` gives
 * `["cam", "çay", "su", "şeker"]`.
 */
export function compare(a: string, b: string): number {
  const ka = sortKey(a);
  const kb = sortKey(b);
  if (ka !== kb) return ka < kb ? -1 : 1;
  return a === b ? 0 : a < b ? -1 : 1;
}

// The Turkish alphabet, with q, w and x placed where they sit in the Latin one.
const RANK = new Map<string, number>();
Array.from("abcçdefgğhıijklmnoöpqrsştuüvwxyz").forEach((ch, i) => RANK.set(ch, i));

function sortKey(text: string): string {
  let key = "";
  for (const ch of lower(text)) {
    const rank = RANK.get(ch);
    // Letters are moved to a private range starting at U+2000 so they sort
    // in alphabet order and after digits, spaces and punctuation, which keep
    // their own code point.
    key += rank === undefined ? ch : String.fromCharCode(0x2000 + rank);
  }
  return key;
}
