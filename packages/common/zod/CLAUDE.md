# `@common/zod`

One factory, `createParser(schema)`, that wraps a zod schema into a parser returning a discriminated result instead
of zod's own throw-based `.parse` or bare `.safeParse` — and accepts a JSON string as well as an object. One file.
Not a shrub module — plain TypeScript, no service, no module.ts.

Module dependencies: none. Package dependencies: `zod` (4.3.6).

**Not consumed anywhere else in this repo yet** — no form or common package imports it. There is no existing call
site to point to for how it's meant to be used; the tests in `test/create-parser.test.ts` are the closest thing.

## Exports

| Export | What it is |
| --- | --- |
| `createParser<TSchema>(schema: zod.Schema<TSchema>)` | Returns an `ISchemaParser<TSchema>`. |
| `ISchemaParser<TSchema>` | `{ parse(data: object \| string): { success: true, data: TSchema } \| { success: false, error: zod.ZodError } }`. |

## How it works

- `parse` accepts either an already-parsed object or a JSON string. A string is run through `JSON.parse` first;
  **if that fails, `parse` throws a `zod.ZodError`** it constructs itself (`code: "custom", path: [], message:
  <reason>`), rather than returning `{ success: false }` — the one case this parser throws instead of reporting
  failure in its result, since a string that isn't JSON at all hasn't given the parser anything to validate, only
  garbage. An empty string throws the same way.
- Once there is an object in hand — given directly, or parsed from a string — validation always goes through zod's
  `schema.safeParse`, so a schema mismatch always comes back as `{ success: false, error }`, never a throw.
- A successful result carries the data **as the schema produced it** — defaults filled in, `.transform()`s applied —
  not the raw input.
- `createParser(schema)` returns a fresh, independent instance per call; the schema is captured once in its
  constructor, and calling `.parse(...)` repeatedly on the same instance is expected (there's no per-call state).
- The private helpers on `ZodSchemaParser` are ordered alphabetically (`getErrorMessage`, `isSuccess`,
  `parseStringToObject`, `stringToObject`), per the class-member convention in
  [../../forms/CLAUDE.md](../../forms/CLAUDE.md).

## Tests

`yarn test` runs under `node`, on `pool: "vmThreads"` per the base config described in
[../../forms/CLAUDE.md](../../forms/CLAUDE.md). `create-parser.test.ts` covers object input (success, multi-issue
failure, defaults, transforms), string input (valid JSON that passes/fails the schema, JSON that isn't an object the
schema accepts, and non-JSON strings throwing), and that separate `createParser` calls don't share state.
