import type { IActor } from "@forms/core";

/**
 * What a comment is about: the whole report, or one page, section or field of it. Below the form, a target names
 * the page, section and field by the names their definitions carry, which stay the same across loads where an id
 * does not, and -- for a page that repeats -- which of its pages, counting from zero.
 */
export type ReviewTarget =
    | { readonly field: string; readonly level: "field"; readonly page: string; readonly pageOrdinal: number; readonly section: string }
    | { readonly level: "form" }
    | { readonly level: "page"; readonly page: string; readonly pageOrdinal: number }
    | { readonly level: "section"; readonly page: string; readonly pageOrdinal: number; readonly section: string };

/** A reviewer's comment on a report. */
export interface IReviewComment {
    /** When it was made, in milliseconds since the epoch. */
    readonly at: number;
    /** Who made it. */
    readonly author: IActor;
    /** Identifies it, for resolving it and for telling it apart from the others. */
    readonly id: string;
    /** Whether it has been dealt with. */
    readonly isResolved: boolean;
    /** What it is about. */
    readonly target: ReviewTarget;
    /** What it says. */
    readonly text: string;
}

/** Names a target so that two targets naming the same thing share one, for matching comments to it. */
export function getTargetKey(target: ReviewTarget): string {
    switch (target.level) {
        case "field":
            return JSON.stringify([target.level, target.page, target.pageOrdinal, target.section, target.field]);
        case "form":
            return JSON.stringify([target.level]);
        case "page":
            return JSON.stringify([target.level, target.page, target.pageOrdinal]);
        case "section":
            return JSON.stringify([target.level, target.page, target.pageOrdinal, target.section]);
    }
}
