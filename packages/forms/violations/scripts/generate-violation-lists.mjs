#!/usr/bin/env node

// Emits violation list modules from source data, for this package or for any form package that owns a list of its
// own.
//
// Each violation is written as a flat row rather than as an object, for the same reason value lists are: spelling
// one out in full costs several times what the data in it is worth once a jurisdiction's code list runs to a few
// thousand charges, almost all of it the same `{ code: "", description: "" },` scaffolding repeated per row. The
// trailing fields are positional and optional, and a row carrying none of them is just a code and a description.
//
// `fields` below is the row order, and it is by how often a field is filled in rather than how important it is: a
// row is trimmed to its last present field, so a commonly present field placed late costs a placeholder per row.
//
// The lists to emit are declared by a manifest at <data>/lists.json, so this script carries no knowledge of which
// package is running it:
//
//     [{ "source": "violations.json", "output": "violations.ts", "export": "violations", "doc": "..." }]
//
// Usage: generate-violation-lists [--data ./data] [--out ./src/generated] [--row-import <specifier>]
//
// Paths are resolved against the working directory, so a package runs it from its own root. `--row-import` names
// where the emitted files reach `ViolationRow`: this package uses a relative path into its own models, and a form
// package uses the package name.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const defaults = {
    data: "./data",
    out: "./src/generated",
    "row-import": "@forms/violations"
};

/** The row fields in the order `ViolationRow` declares them, with the type each has to be. */
const fields = [
    { name: "id", type: "string", required: true },
    { name: "code", type: "string", required: true },
    { name: "description", type: "string", required: true },
    { name: "category", type: "string" },
    { name: "statute", type: "string" },
    { name: "fine", type: "number" },
    { name: "points", type: "number" },
    { name: "isLocalOrdinance", type: "boolean" },
    { name: "requiresCourtAppearance", type: "boolean" }
];

/** Reads the command line into an options object, falling back to the defaults for anything not given. */
function parseArguments(argv) {
    const options = { ...defaults };

    for (let index = 0; index < argv.length; index++) {
        const name = argv[index].replace(/^--/, "");

        if (!(name in defaults)) {
            throw new Error(`Unknown option '${argv[index]}'. Expected one of: ${Object.keys(defaults).map(key => `--${key}`).join(", ")}.`);
        }

        const value = argv[++index];

        if (value === undefined) {
            throw new Error(`Option '${argv[index - 1]}' expects a value.`);
        }

        options[name] = value;
    }

    return options;
}

/** Renders a list's doc comment, on one line where it fits on one and as a block where it does not. */
function renderDoc(doc) {
    const lines = Array.isArray(doc) ? doc : [doc];

    // a blank line separating paragraphs is emitted as a bare ` *`, so the output carries no trailing whitespace
    return lines.length === 1
        ? `/** ${lines[0]} */`
        : ["/**", ...lines.map(line => line ? ` * ${line}` : " *"), " */"].join("\n");
}

/**
 * Renders one violation as a row, trimmed to its last present field.
 *
 * The trailing fields are positional, so a gap in the middle has to be held open with an `undefined` while a run of
 * absent fields at the end is simply dropped -- which is what keeps a list carrying neither fines nor points down
 * to the two fields it actually uses.
 */
function renderRow(violation) {
    const values = fields.map(({ name }) => violation[name]);

    let last = values.length - 1;
    while (last >= 0 && values[last] === undefined) {
        last--;
    }

    return `    [${values.slice(0, last + 1).map(value => value === undefined ? "undefined" : JSON.stringify(value)).join(", ")}]`;
}

/** Fails rather than emitting a row whose fields would not survive the round trip. */
function assertRow(sourceName, violation, index) {
    for (const key of Object.keys(violation)) {
        if (!fields.some(field => field.name === key)) {
            throw new Error(`${sourceName} row ${index}: '${key}' is not a field of a violation. Expected one of: ${fields.map(field => field.name).join(", ")}.`);
        }
    }

    for (const { name, type, required } of fields) {
        const value = violation[name];

        if (value === undefined) {
            if (required) {
                throw new Error(`${sourceName} row ${index}: '${name}' is required.`);
            }

            continue;
        }

        if (typeof value !== type) {
            throw new Error(`${sourceName} row ${index}: '${name}' is ${typeof value}, expected a ${type}.`);
        }

        if (type === "string" && !value) {
            throw new Error(`${sourceName} row ${index}: '${name}' is empty; leave the field out rather than emitting a blank.`);
        }
    }
}

async function generate(list, options) {
    const source = JSON.parse(await readFile(resolve(options.data, list.source), "utf8"));

    source.forEach((violation, index) => assertRow(list.source, violation, index));

    // the type annotation is load-bearing: without it TypeScript infers the literal type of every row and writes
    // the whole list into the emitted .d.ts a second time
    const contents = [
        `// Generated by generate-violation-lists from ${options.data.replace(/^\.\//, "")}/${list.source} - do not edit.`,
        "",
        // the import is type-only and must stay that way: a value import of anything outside ./generated is an
        // edge the bundler follows, and these modules are only ever meant to be reached through a dynamic import
        `import type { ViolationRow } from "${options["row-import"]}";`,
        "",
        renderDoc(list.doc),
        `export const ${list.export}: ReadonlyArray<ViolationRow> = [`,
        source.map(renderRow).join(",\n"),
        "];",
        ""
    ].join("\n");

    await writeFile(resolve(options.out, list.output), contents, "utf8");

    return { name: list.output, rows: source.length, bytes: Buffer.byteLength(contents, "utf8") };
}

async function main() {
    const options = parseArguments(process.argv.slice(2));
    const manifestPath = join(resolve(options.data), "lists.json");
    const lists = JSON.parse(await readFile(manifestPath, "utf8"));

    // a package generating its lists for the first time has no output directory yet, and the ENOENT that
    // writeFile would raise reads like a broken tool rather than a missing folder
    await mkdir(resolve(options.out), { recursive: true });

    for (const list of lists) {
        const result = await generate(list, options);

        console.log(`${result.name.padEnd(22)} ${String(result.rows).padStart(5)} rows  ${String(result.bytes).padStart(7)} bytes`);
    }
}

try {
    await main();
} catch (error) {
    // this runs through a bin shim, where an unhandled rejection prints a stack that buries the actual problem
    console.error(`generate-violation-lists: ${error.message}`);
    process.exitCode = 1;
}
