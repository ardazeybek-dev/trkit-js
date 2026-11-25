# trkit (JavaScript)

[![CI](https://github.com/ardazeybek-dev/trkit-js/actions/workflows/ci.yml/badge.svg)](https://github.com/ardazeybek-dev/trkit-js/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@ardazeybek-dev/trkit.svg)](https://www.npmjs.com/package/@ardazeybek-dev/trkit)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Turkish text utilities and Türkiye validators for JavaScript and TypeScript.
Zero dependencies, under 3 kB gzipped, works in browsers, Node, Deno, Bun and edge
runtimes. Ships ready-made [Zod](https://zod.dev) schemas for Turkish form fields.

The JavaScript sibling of [`trkit` for Python](https://github.com/ardazeybek-dev/trkit):
both give identical results for the shared functions.

## Why

Almost every form built for Türkiye asks for a T.C. Kimlik No, an IBAN, a
phone number or a plate, and every team writes the checksum code again. And
JavaScript's case functions get Turkish wrong:

```js
"istanbul".toUpperCase()   // "ISTANBUL"  should be "İSTANBUL"
"IĞDIR".toLowerCase()      // "iğdir"     should be "ığdır"
["şeker", "su", "çay", "cam"].sort()  // ["cam", "su", "çay", "şeker"]
```

`toLocaleUpperCase("tr")` helps only where the runtime ships full ICU data;
`trkit` applies the rules itself, so it behaves the same everywhere.

## Install

```bash
npm install @ardazeybek-dev/trkit
```

## Validators

```ts
import {
  isValidTckn, isValidVkn, isValidIban, isValidPhone, isValidPlate,
  normalizePhone, formatPhone, formatIban, formatPlate,
} from "@ardazeybek-dev/trkit";

isValidTckn("10000000146");                       // true
isValidVkn("4540536920");                          // true
isValidIban("TR33 0006 1005 1978 6457 8413 26");  // true

normalizePhone("(0532) 123-45-67");               // "+905321234567"
isValidPhone("0212 555 12 34", { mobileOnly: true }); // false
formatPhone("+905321234567");                      // "0532 123 45 67"

isValidPlate("34abc123");                          // true
formatPlate("34abc123");                           // "34 ABC 123"
formatIban("tr330006100519786457841326");          // "TR33 0006 1005 1978 6457 8413 26"
```

| Function | What it checks |
|---|---|
| `isValidTckn` | 11 digits, first non-zero, both check digits |
| `isValidVkn` | 10 digits and the check digit. One in ten random numbers passes, so it catches typos, nothing more |
| `isValidIban` | `TR` + 24 digits and the ISO 13616 mod-97 check; spaces are ignored |
| `isValidPhone` / `normalizePhone` | Mobile (5xx), landline (2xx-4xx) and 850 numbers in any common spelling: `0532…`, `+90 532…`, `0090…`, `(0532) 123-45-67` |
| `isValidPlate` | Province 01-81, then 1 letter + 4-5 digits, 2 letters + 3-4 digits or 3 letters + 2-3 digits |

These are format and checksum tests. They tell you a value is well-formed,
not that it belongs to a real person, company or account.

## Zod schemas

`zod` is an optional peer dependency (Zod 3 or 4). Each schema trims the
input, validates it and returns it in one normal form, so what you store is
consistent however the user typed it.

```ts
import { z } from "zod";
import { tckn, vkn, iban, phone, plate } from "@ardazeybek-dev/trkit/zod";

const Customer = z.object({
  tckn: tckn({ message: "Geçersiz T.C. Kimlik No" }),
  iban: iban(),                        // → "TR330006100519786457841326"
  phone: phone({ mobileOnly: true }),  // → "+905321234567"
  plate: plate(),                      // → "34 ABC 123"
});
```

Works as is with React Hook Form (`zodResolver`), tRPC, Next.js server
actions and anything else that takes a Zod schema.

## Text

```ts
import { upper, lower, title, asciify, slugify, compare } from "@ardazeybek-dev/trkit";

upper("istanbul");                  // "İSTANBUL"
lower("IĞDIR");                     // "ığdır"
title("izmir kuş cenneti");         // "İzmir Kuş Cenneti"
asciify("Çiğdem Şahin");            // "Cigdem Sahin"
slugify("Çığır Açan Şeyler");       // "cigir-acan-seyler"
["şeker", "su", "çay", "cam"].sort(compare); // ["cam", "çay", "su", "şeker"]
```

`compare` sorts in Turkish alphabet order (c < ç, g < ğ, ı < i, o < ö,
s < ş, u < ü), ignoring case first.

## Provinces

```ts
import { PLATES, cityFromPlate, plateFromCity } from "@ardazeybek-dev/trkit";

cityFromPlate("06");      // "Ankara"
plateFromCity("İZMİR");   // 35
plateFromCity("Igdir");   // 76, Turkish letters are optional
PLATES[34];               // "İstanbul"
```

## Development

```bash
npm install
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run build      # tsup → dist/ (ESM + CommonJS + .d.ts)
```

```
src/
  text.ts      Turkish casing, asciify, slugify, compare
  validate.ts  TCKN, VKN, IBAN, phone
  plates.ts    province codes and plate numbers
  zod.ts       Zod schemas (the "./zod" entry point)
  index.ts     public API
test/          one test file per module
```

Releases are published to npm by the `npm publish` workflow, which needs a
repository secret named `NPM_TOKEN`.

## Related

- [trkit](https://github.com/ardazeybek-dev/trkit): the Python version, with a command line tool
- [kvkk](https://github.com/ardazeybek-dev/kvkk): finds and masks Turkish personal data (TCKN, IBAN, phone…) in files and logs
- [bordro](https://github.com/ardazeybek-dev/bordro): Turkish payroll calculator

## License

MIT © Seyid Arda Zeybek
