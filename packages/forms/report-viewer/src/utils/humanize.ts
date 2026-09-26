/** Spells a contract key out for the officer: `personHeaderPersonType` reads "Person Header Person Type". */
export function humanize(key: string): string {
    const spaced = key.replace(/([A-Z])/g, " $1").trim();

    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
