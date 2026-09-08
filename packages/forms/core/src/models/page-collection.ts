import { PageModel } from "./page";

/** Defines the model of a page collection. */
export interface IPageCollection {
    /** The pages the collection holds, in display order. */
    readonly pages: ReadonlyArray<PageModel>;

    /** Returns a new collection with the given page appended to the end. */
    add(page: PageModel): PageCollection;
    /** Returns the page at the given index, throwing if the index is out of range. */
    findPageByIndex(index: number): PageModel;
    /** Returns the page with the given id, or undefined if it is no longer in the collection. */
    findPageById<TPage extends PageModel>(pageId: string): TPage | undefined;
    /** Returns the index of the page with the given id, or -1 if it is no longer in the collection. */
    indexOfPage(pageId: string): number;
    /** Gets the pages the collection holds, in display order. */
    getPages<TPage extends PageModel>(): Array<TPage>;
    /** Returns the first page in the collection, throwing if the collection is empty. */
    getFirstPage<TPage extends PageModel>(): TPage;
    /** Returns a new collection with the page at the given index removed. */
    remove(index: number): PageCollection;
    /** Returns a new collection with the page at the given index replaced, throwing if the index is out of range. */
    replace(index: number, page: PageModel): PageCollection;
    /** Returns a new, empty collection. */
    clear(): PageCollection;
}

/** Represents an immutable collection of `PageModel` objects with array-like behavior. */
export class PageCollection implements Iterable<PageModel>, IPageCollection {
    readonly pages: ReadonlyArray<PageModel>;

    constructor(pages: ReadonlyArray<PageModel> = []) {
        this.pages = pages;
    }

    public add(page: PageModel): PageCollection {
        return new PageCollection([...this.pages, page]);
    }

    public findPageByIndex(index: number): PageModel {
        const page = this.pages[index];
        if (!page) {
            throw new Error(`Page at index ${index} not found in the collection.`);
        }

        return page;
    }

    public findPageById<TPage extends PageModel>(pageId: string): TPage | undefined {
        return this.pages.find(page => page.id === pageId) as TPage | undefined;
    }

    public indexOfPage(pageId: string): number {
        return this.pages.findIndex(page => page.id === pageId);
    }

    public getPages<TPage extends PageModel>(): Array<TPage> {
        return this.pages as Array<TPage>;
    }

    public getFirstPage<TPage extends PageModel>(): TPage {
        const page = <TPage>this.pages[0];
        if (!page) {
            throw new Error("A page must exist in the collection to retrieve the first page.");
        }

        return page;
    }

    public remove(index: number): PageCollection {
        return new PageCollection(this.pages.filter((_, i) => i !== index));
    }

    public replace(index: number, page: PageModel): PageCollection {
        if (index < 0 || index >= this.pages.length) {
            throw new Error(`Page at index ${index} not found in the collection.`);
        }

        return new PageCollection(this.pages.map((existing, i) => (i === index ? page : existing)));
    }

    public clear(): PageCollection {
        return new PageCollection([]);
    }

    [Symbol.iterator](): Iterator<PageModel> {
        return this.pages[Symbol.iterator]();
    }
}
