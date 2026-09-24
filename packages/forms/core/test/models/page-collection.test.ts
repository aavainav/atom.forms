import { describe, expect, it } from "vitest";

import type { PageModel } from "../../src/models/page";
import { PageCollection } from "../../src/models/page-collection";

/**
 * The collection only ever reads a page's id, so a stub is enough here and keeps the test about the collection
 * rather than about how a page is built.
 */
function page(id: string): PageModel {
    return { id } as PageModel;
}

describe("PageCollection", () => {
    const first = page("first");
    const second = page("second");

    it("starts empty", () => {
        expect(new PageCollection().pages).toHaveLength(0);
    });

    it("returns a new collection when a page is added, leaving the original alone", () => {
        const collection = new PageCollection([first]);

        const added = collection.add(second);

        expect(added).not.toBe(collection);
        expect(added.pages).toHaveLength(2);
        expect(collection.pages).toHaveLength(1);
    });

    it("finds a page by id and answers undefined for one it no longer holds", () => {
        const collection = new PageCollection([first, second]);

        expect(collection.findPageById("second")).toBe(second);
        expect(collection.findPageById("third")).toBeUndefined();
    });

    it("reports the index of a page by id, and -1 for one it no longer holds", () => {
        const collection = new PageCollection([first, second]);

        expect(collection.indexOfPage("second")).toBe(1);
        expect(collection.indexOfPage("third")).toBe(-1);
    });

    it("throws rather than answering undefined for an index it does not hold", () => {
        expect(() => new PageCollection([first]).findPageByIndex(1)).toThrowError("Page at index 1 not found in the collection.");
    });

    it("throws when asked for the first page of an empty collection", () => {
        expect(() => new PageCollection().getFirstPage())
            .toThrowError("A page must exist in the collection to retrieve the first page.");
    });

    it("removes the page at an index, returning a new collection", () => {
        const collection = new PageCollection([first, second]);

        const removed = collection.remove(0);

        expect(removed.pages).toEqual([second]);
        expect(collection.pages).toHaveLength(2);
    });

    it("replaces the page at an index, returning a new collection", () => {
        const third = page("third");
        const collection = new PageCollection([first, second]);

        const replaced = collection.replace(1, third);

        expect(replaced.pages).toEqual([first, third]);
        expect(collection.pages).toEqual([first, second]);
    });

    it("throws when replacing an index it does not hold", () => {
        const collection = new PageCollection([first]);

        expect(() => collection.replace(1, second)).toThrowError("Page at index 1 not found in the collection.");
        expect(() => collection.replace(-1, second)).toThrowError("Page at index -1 not found in the collection.");
    });

    it("clears to a new, empty collection", () => {
        const collection = new PageCollection([first, second]);

        expect(collection.clear().pages).toHaveLength(0);
        expect(collection.pages).toHaveLength(2);
    });

    it("iterates its pages in order", () => {
        expect([...new PageCollection([first, second])]).toEqual([first, second]);
    });
});
