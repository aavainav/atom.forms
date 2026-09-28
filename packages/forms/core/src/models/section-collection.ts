import { SectionModel } from "./section";

/** Describes the raw shape of a section collection. */
export interface ISectionCollection<TSection extends SectionModel = SectionModel> {
    /** The sections the collection holds, in order. */
    readonly sections: ReadonlyArray<TSection>;

    /** Gets the sections the collection holds, in order. */
    getSections<T extends TSection>(): Array<T>;
    /** Returns a new collection with the section at the given index replaced, throwing if the index is out of range. */
    replace(index: number, section: TSection): SectionCollection<TSection>;
}

/**
 * Represents an immutable, fixed-length collection of `SectionModel` objects -- a section that repeats a set number
 * of times within one page (a passenger table's rows, say), as opposed to `PageCollection`, which grows and shrinks
 * as pages are added and removed. A section collection's length is fixed at the definition, on purpose: going past
 * it is a matter of adding another page, not growing this one.
 */
export class SectionCollection<TSection extends SectionModel = SectionModel> implements Iterable<TSection>, ISectionCollection<TSection> {
    readonly sections: ReadonlyArray<TSection>;

    constructor(sections: ReadonlyArray<TSection> = []) {
        this.sections = sections;
    }

    public getSections<T extends TSection>(): Array<T> {
        return this.sections as Array<T>;
    }

    public replace(index: number, section: TSection): SectionCollection<TSection> {
        if (index < 0 || index >= this.sections.length) {
            throw new Error(`Section at index ${index} not found in the collection.`);
        }

        return new SectionCollection(this.sections.map((existing, i) => (i === index ? section : existing)));
    }

    [Symbol.iterator](): Iterator<TSection> {
        return this.sections[Symbol.iterator]();
    }
}
