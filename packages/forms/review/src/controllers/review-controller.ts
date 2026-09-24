import { IController, IControllerManager, IFieldPlacement, INavigationTarget, Controller, FormModel, RegisterController } from "@forms/core";

import { IReviewComment, ReviewTarget, getTargetKey } from "../models/review-comment";
import { getPlacementTargets } from "../utils/placement-targets";

declare module "@forms/core" {
    interface IControllerActivityMap {
        /** A comment was made on the report. `target` says where, in words -- never what the comment says. */
        "comment-added": { readonly commentId: string; readonly target: string };
        /** A resolved comment was reopened. */
        "comment-reopened": { readonly commentId: string; readonly target: string };
        /** A comment was resolved. */
        "comment-resolved": { readonly commentId: string; readonly target: string };
    }
}

/** Defines the controller that holds a report's review comments. It reads the form, so it throws until one is loaded. */
export interface IReviewController extends IController {
    /** Whether comments can be added, which they can only while the form is reviewable and a user has been set. */
    readonly canComment: boolean;
    /** Whether comments can be resolved and reopened, which they can in any mode but viewable: the officer whose report is reviewed deals with them too. */
    readonly canResolve: boolean;
    /** Every comment, in the order it was made. The same array until one changes, so a subscriber can take it as its snapshot. */
    readonly comments: ReadonlyArray<IReviewComment>;
    /** How many comments have not been resolved. */
    readonly openCount: number;

    /** Adds a comment from the user, throwing unless the form is reviewable, a user has been set and there is some text. */
    add(target: ReviewTarget, text: string): IReviewComment;
    /** Describes where a target is in the words the form uses, outermost first -- "Vehicle > Details > Make" -- for showing beside a comment. */
    describeTarget(target: ReviewTarget): string;
    /** Gets the comments made on exactly this target, not those beneath it. */
    getComments(target: ReviewTarget): Array<IReviewComment>;
    /** Gets the comments made on the field a control draws, from the field's id. */
    getFieldComments(fieldId: string): Array<IReviewComment>;
    /** Gets the ids of the fields on a page, in the order the form defines them. */
    getFieldIds(pageId: string): Array<string>;
    /** Gets where to send the user to see a target, or undefined for the whole form, or for a page that has since been removed. */
    getNavigationTarget(target: ReviewTarget): INavigationTarget | undefined;
    /** Replaces the comments with those the host holds for the report. */
    load(comments: ReadonlyArray<IReviewComment>): void;
    /** Gets the target for the field a control draws, from the field's id. */
    locateField(fieldId: string): ReviewTarget | undefined;
    /** Sets whether a comment has been dealt with, throwing while the form is viewable. */
    setResolved(id: string, isResolved: boolean): void;
}

/** Gets the review controller, which core's manager has no accessor for. */
export function getReviewController(controllers: IControllerManager): IReviewController {
    return controllers.getController<IReviewController>(ReviewController.key);
}

/** Gets the names a target below the form was made with, outermost first. */
function getTargetNames(target: Exclude<ReviewTarget, { readonly level: "form" }>): Array<string> {
    switch (target.level) {
        case "field":
            return [target.page, target.section, target.field];
        case "page":
            return [target.page];
        case "section":
            return [target.page, target.section];
    }
}

/** Holds the comments made on the report's form, and finds where in it a control or a comment belongs. */
@RegisterController("review")
export class ReviewController extends Controller implements IReviewController {
    private _comments: ReadonlyArray<IReviewComment> = [];
    private placements?: { readonly placements: ReadonlyMap<string, IFieldPlacement>; readonly signature: string };

    get canComment(): boolean {
        return this.form.mode === "reviewable" && !!this.manager.user;
    }

    get canResolve(): boolean {
        return this.form.mode !== "viewable";
    }

    get comments(): ReadonlyArray<IReviewComment> {
        return this._comments;
    }

    get openCount(): number {
        return this._comments.filter(comment => !comment.isResolved).length;
    }

    private get form(): FormModel<any> {
        return this.manager.getFormController().form;
    }

    public add(target: ReviewTarget, text: string): IReviewComment {
        if (this.form.mode !== "reviewable") {
            throw new Error("Comments can only be added while the form is reviewable.");
        }

        const user = this.manager.user;

        if (!user) {
            throw new Error("A user must be set before comments can be added.");
        }

        if (!text.trim()) {
            throw new Error("A comment needs some text.");
        }

        const comment: IReviewComment = { at: Date.now(), author: user, id: crypto.randomUUID(), isResolved: false, target, text: text.trim() };

        this.replace([...this._comments, comment]);
        this.emitActivity({ kind: "comment-added", commentId: comment.id, target: this.describeTarget(target) });

        return comment;
    }

    public describeTarget(target: ReviewTarget): string {
        if (target.level === "form") {
            return "Report";
        }

        const placement = this.findPlacement(target)?.placement;

        if (!placement) {
            // the definitions have gone, but the names the comment was made with can still say where it was
            return getTargetNames(target).join(" > ");
        }

        const section = placement.definition.getSectionDefinition();
        const page = section.getPageDefinition();
        // a shared section is the same on every page, so only a page or an unshared section is one of several
        const isNumbered = this.form.getPagesFor(page).length > 1 && (target.level === "page" || !section.isShared);
        const titles = [isNumbered ? `${page.title} ${target.pageOrdinal + 1}` : page.title];

        if (target.level !== "page") {
            titles.push(section.title);
        }

        if (target.level === "field") {
            titles.push(placement.definition.label || placement.definition.name);
        }

        return titles.join(" > ");
    }

    public dispose(): void {
        this._comments = [];
        this.placements = undefined;
    }

    public getComments(target: ReviewTarget): Array<IReviewComment> {
        const key = getTargetKey(target);

        return this._comments.filter(comment => getTargetKey(comment.target) === key);
    }

    public getFieldComments(fieldId: string): Array<IReviewComment> {
        const target = this.locateField(fieldId);

        return target ? this.getComments(target) : [];
    }

    public getFieldIds(pageId: string): Array<string> {
        return [...this.getPlacements()].filter(([, placement]) => placement.pageId === pageId).map(([fieldId]) => fieldId);
    }

    public getNavigationTarget(target: ReviewTarget): INavigationTarget | undefined {
        const found = this.findPlacement(target);

        return found && { fieldId: found.fieldId, pageId: found.placement.pageId };
    }

    public load(comments: ReadonlyArray<IReviewComment>): void {
        this.replace(comments);
    }

    public locateField(fieldId: string): ReviewTarget | undefined {
        const placement = this.getPlacements().get(fieldId);

        return placement && getPlacementTargets(placement).field;
    }

    public setResolved(id: string, isResolved: boolean): void {
        if (!this.canResolve) {
            throw new Error("Comments cannot be resolved or reopened while the form is viewable.");
        }

        const before = this._comments.find(comment => comment.id === id);

        if (before) {
            this.replace(this._comments.map(comment => comment.id === id ? { ...comment, isResolved } : comment));

            if (before.isResolved !== isResolved) {
                this.emitActivity({ kind: isResolved ? "comment-resolved" : "comment-reopened", commentId: id, target: this.describeTarget(before.target) });
            }
        }
    }

    private findPlacement(target: ReviewTarget): { readonly fieldId: string; readonly placement: IFieldPlacement } | undefined {
        if (target.level === "form") {
            return undefined;
        }

        const key = getTargetKey(target);

        // the map is in definition order, so a page or a section resolves to its first field
        for (const [fieldId, placement] of this.getPlacements()) {
            if (getTargetKey(getPlacementTargets(placement)[target.level]) === key) {
                return { fieldId, placement };
            }
        }

        return undefined;
    }

    private getPlacements(): ReadonlyMap<string, IFieldPlacement> {
        // field ids survive edits, so the walk is only redone when a page is added or removed
        const signature = this.form.getPages().map(page => page.id).join(",");

        if (this.placements?.signature !== signature) {
            this.placements = { placements: this.form.getFieldPlacements(), signature };
        }

        return this.placements.placements;
    }

    private replace(comments: ReadonlyArray<IReviewComment>): void {
        this._comments = comments;
        this.emitChanged();
    }
}