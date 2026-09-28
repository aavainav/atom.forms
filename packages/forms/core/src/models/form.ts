import { Definition } from "./definition";
import { Entity, EntityConstructor, IEntity } from "./entity";
import { FieldModel, TValueType } from "./field";
import { FieldDefinition } from "./field-definition";
import { IFieldPlacement } from "./field-placement";

import { PageModel } from "./page";
import { PageCollection } from "./page-collection";
import { PageDefinition } from "./page-definition";
import { SectionCollection } from "./section-collection";
import { SectionCollectionDefinition } from "./section-collection-definition";
import { SectionModel } from "./section";
import { SectionDefinition } from "./section-definition";
import { ISchema } from "./schema";
import { RuleCollection } from "./validation/rule-collection";
import { RuleIssueSeverity, type IRuleIssue } from "./validation/rule-issue";
import { RuleIssueCollection } from "./validation/rule-issue-collection";
import { IWorkflow, IWorkflowEntry } from "./workflow";

import { IFormMapper, IPopulateData, ReadOnlyFields } from "../mapping/form-mapper";
import { IReportData } from "../mapping/data/report-data";
import { mergeReadOnlyFields } from "../mapping/merge-read-only-fields";
import { withChanges } from "../utils/clone";

/** How a form renders: "editable" allows edits and the add/delete/import affordances; "viewable" is a locked snapshot, styled like a printed record; "reviewable" is viewable that a reviewer can also comment on. */
export type FormMode = "editable" | "reviewable" | "viewable";
export type FormModelConstructor<TForm extends FormModel<any>> = new (id?: string, revision?: number) => TForm;
export type FormStatus = "approved" | "canceled" | "draft" | "inProgress" | "inReview" | "issued" | "rejected" | "voided";
export type FormType = "crash" | "citation" | "tow" | "warning" | "none";

/** Every status, as a record so that a status added to `FormStatus` will not compile until it is added here too. `@forms/workflow` checks a status a report is stored with against this when the report is loaded. */
export const knownStatuses: Readonly<Record<FormStatus, true>> = { approved: true, canceled: true, draft: true, inProgress: true, inReview: true, issued: true, rejected: true, voided: true };

/** Identifies a form registered with the form catalog. A missing version resolves to the latest. */
export interface IFormIdentity {
    readonly name: string;
    readonly version?: string;
}

/** Defines the model properties of a form. */
export interface IForm {
    /** The report's own identity, distinct from the catalog identity (name/version) -- undefined until it is first saved. */
    readonly id?: string;
    /** How many times the report has been saved. Restored from storage, advanced by `incrementRevision`. */
    readonly revision?: number;
    /** The display name of the form. */
    readonly name: string;
    /** A human-readable description of the form. */
    readonly description?: string;
    /** The status of the form. This will also determine if a watermark is needed to be displayed. */
    readonly status: FormStatus;
    /** The type of the form. */
    readonly type: FormType;
    /** The version of the form definition. */
    readonly version: string;
}

/** Defines the model of a form. */
export interface IFormModel<TData extends object> extends IEntity<PageDefinition> {
    /** The display name of the form. */
    readonly name: string;
    /** A human-readable description of the form. */
    readonly description?: string;
    /** What has been done to move the report along its workflow, oldest first. */
    readonly history: ReadonlyArray<IWorkflowEntry>;
    /** Translates this form to and from the data contract it publishes. A form without one can be neither extracted nor saved. */
    readonly mapper?: IFormMapper<any, TData>;
    /** How the form renders. Defaults to "editable". */
    readonly mode: FormMode;
    /** Which of the contract's fields the host closed when it populated the form, so that a change made later can leave them alone. */
    readonly readOnlyFields?: ReadOnlyFields<TData>;
    /** The status of the form. This will also determine if a watermark is needed to be displayed. */
    readonly status: FormStatus;
    /** The type of the form. */
    readonly type: FormType;
    /** The ids of the value lists this form's option fields draw on. */
    readonly valueListIds?: ReadonlyArray<string>;
    /** The version of the form definition. */
    readonly version: string;
    /** The violation list this citation draws its charges from, if any. */
    readonly violationListId?: string;
    /** The rules the form's reports move by. A form without one has no transitions, and its status is set directly. */
    readonly workflow?: IWorkflow;

    /** Creates and initializes a page for each child page definition, adding it to the form. */
    initialize(): Promise<this>;
    /** Adds a page to the page collection for the specified page definition. */
    addPage(page: PageModel, pageDefinition: PageDefinition): this;
    /** Adds a rule collection used to validate the form. */
    addRuleCollection(ruleCollection: RuleCollection): this;
    /** Returns a new form whose current data becomes the reference `getIsDirty()` compares against, going forward. */
    clean(): this;
    /** Extracts this form's data through its own mapper, stamped with the identity it carries. A form without a mapper returns just the identity. */
    extractData(): IReportData;
    /** Gets the child entity registered for the specified page definition. */
    get<TPage>(pageDefinition: PageDefinition): TPage;
    /** Gets the first field across all pages that matches the specified field definition. */
    getFirstField<TField extends FieldModel<TValueType>>(fieldDefinition: FieldDefinition<TField>): TField;
    /** Locates every field on every page, keyed by the field's id, in one walk of the form. */
    getFieldPlacements(): Map<string, IFieldPlacement>;
    /** Gets every field matching the specified field definition, grouped by the page it belongs to. */
    getFields<TField extends FieldModel<TValueType>>(fieldDefinition: FieldDefinition<TField>): Map<PageModel, Array<TField>>;
    /** Gets whether the form's data differs from what it held the last time `clean()` ran. A form without a mapper, or one that has never been cleaned, is never dirty. */
    getIsDirty(): boolean;
    /** Finds the id of the page instance a rule issue was raised on -- the one whose copy of the issue's field carries the same id -- so a page that repeats can tell which occurrence produced a given issue. Undefined when no page instance matches. */
    getPageIdForIssue(issue: IRuleIssue): string | undefined;
    /** Gets every page on the form, across all page definitions. */
    getPages(): Array<PageModel>;
    /** Gets the pages belonging to the specified page definition, or an empty array when the form has none. */
    getPagesFor(pageDefinition: PageDefinition): Array<PageModel>;
    /** Gets the rule collection used to validate the form. */
    getRuleCollection(): RuleCollection;
    /** Returns a form with its revision advanced by one, for the record an actual save produces. */
    incrementRevision(): this;
    /** Whether pages of the definition are locked, so that none can be added or removed. */
    isPageSetLocked(pageDefinition: PageDefinition): boolean;
    /** Whether the section is locked, so that its fields, and anything that would write to them, are closed. */
    isSectionLocked(sectionDefinition: SectionDefinition): boolean;
    /** Returns a form in which no page of the definition can be added or removed. Its fields are not closed; lock a section for that. */
    lockPageSet(pageDefinition: PageDefinition): this;
    /** Returns a form in which the section's fields are closed on every page, including a page added later, and stay closed. */
    lockSection(sectionDefinition: SectionDefinition | SectionCollectionDefinition): this;
    /** Returns a new form with the given data applied through its own mapper. A form without a mapper returns itself unchanged. */
    populate(input: IPopulateData<IReportData>): FormModel<TData> | Promise<FormModel<TData>>;
    /** Removes the page at the specified index from the page collection for the specified page definition. */
    removePage(index: number, pageDefinition: PageDefinition): this;
    /**
     * Sets the form's mode. Switching to any mode but "editable" disables every field; switching to "editable" only
     * stamps the mode -- it does not re-enable fields disabled for another reason, such as a `readOnlyFields` lock.
     */
    setMode(mode: FormMode): this;
    /** Returns a form with the given status, which determines the watermark stamped across its pages. */
    setStatus(status: FormStatus): this;
    /** Applies the given issue collection, setting the has error state for every field on the form. */
    validate(issueCollection: RuleIssueCollection): this;
    /** Releases resources held by the form model, such as registered schemas and definitions. */
    dispose(): void;
}

/** Represents a form model that manages pages and their definitions within a form. */
export class FormModel<TData extends object> extends Entity<PageDefinition> implements IFormModel<TData> {
    public readonly name: string;
    public readonly description?: string;
    public readonly history: ReadonlyArray<IWorkflowEntry> = [];
    public readonly mapper?: IFormMapper<FormModel<TData>, TData>;
    public readonly mode: FormMode = "editable";
    public readonly readOnlyFields?: ReadOnlyFields<TData>;
    public readonly status: FormStatus = "draft";
    public readonly type: FormType;
    public readonly valueListIds?: ReadonlyArray<string>;
    public readonly version: string;
    public readonly violationListId?: string;
    public readonly workflow?: IWorkflow;

    public readonly ruleCollection: RuleCollection = new RuleCollection([]);

    private readonly lockedPageSets: ReadonlySet<string> = new Set<string>();
    private readonly lockedSections: ReadonlySet<string> = new Set<string>();
    private readonly snapshot?: TData;

    public async initialize(): Promise<this> {
        let form = this;

        for (const pageDefinition of form.getChildDefinitions()) {
            const page = await pageDefinition.createPage(form).initialize();
            form = form.addPage(page, pageDefinition);
        }

        return form;
    }

    public addPage(page: PageModel, pageDefinition: PageDefinition): this {
        if (this.isPageSetLocked(pageDefinition)) {
            throw new Error(`Pages of ${pageDefinition.name} cannot be added while they are locked.`);
        }

        const pageCollection = this.get<PageCollection>(pageDefinition);
        if (!pageCollection) {
            throw new Error("A page collection for the specified page definition does not exist.");
        }

        return this.set(pageDefinition, pageCollection.add(this.lockAddedPage(page, pageDefinition)));
    }

    public addRuleCollection(ruleCollection: RuleCollection): this {
        return withChanges(this, { ruleCollection: this.ruleCollection.addRuleCollection(ruleCollection) });
    }

    public clean(): this {
        return withChanges(this, { snapshot: this.mapper?.extract(this) });
    }

    public extractData(): IReportData {
        const values = this.mapper ? this.mapper.extract(this) : {};

        // a form model declares the identity it is registered under and stamps it on itself, so the whole of
        // IForm comes off the form; without it, saved data could not be resolved back to a form by loadForm.
        return {
            ...values,
            id: this.id,
            revision: this.revision,
            name: this.name,
            description: this.description,
            status: this.status,
            type: this.type,
            version: this.version,
            ...(this.workflow ? { workflow: { history: this.history, id: this.workflow.id, version: this.workflow.version } } : {})
        };
    }

    public get<TPage>(pageDefinition: PageDefinition): TPage {
        return super.get<TPage>(pageDefinition);
    }

    public getFirstField<TField extends FieldModel<TValueType>>(fieldDefinition: FieldDefinition<TField>): TField {
        const firstField = this.getFields<TField>(fieldDefinition).values().next().value?.[0];

        if (!firstField) {
            throw new Error("No field could be found for the specified field definition.");
        }

        return firstField;
    }

    public getFieldPlacements(): Map<string, IFieldPlacement> {
        const placements = new Map<string, IFieldPlacement>();

        for (const pageDefinition of this.getChildDefinitions()) {
            this.getPagesFor(pageDefinition).forEach((page, pageOrdinal) => {
                for (const sectionDefinition of pageDefinition.children) {
                    const section = page.get<SectionModel>(sectionDefinition as SectionDefinition);

                    for (const fieldDefinition of sectionDefinition.children) {
                        if (fieldDefinition instanceof FieldDefinition) {
                            const id = section.get<FieldModel<TValueType>>(fieldDefinition).id;

                            if (id) {
                                placements.set(id, { definition: fieldDefinition, pageId: page.id!, pageOrdinal });
                            }
                        }
                    }
                }
            });
        }

        return placements;
    }

    public getFields<TField extends FieldModel<TValueType>>(fieldDefinition: FieldDefinition<TField>): Map<PageModel, Array<TField>> {
        const fields: Map<PageModel, Array<TField>> = new Map<PageModel, Array<TField>>();

        const pageDefinition = fieldDefinition.getPageDefinition();
        const pageCollection = this.get<PageCollection>(pageDefinition);

        if (!pageCollection || pageCollection.pages.length === 0) {
            throw new Error(`Page collection is missing or empty for ${pageDefinition.name}.`);
        }

        this.getPages().forEach(page => {
            if (pageCollection.pages.includes(page)) {
                fields.set(page, page.getFields<TField>(fieldDefinition));
            }
        });

        return fields;
    }

    public getIsDirty(): boolean {
        return !!this.mapper && !!this.snapshot && JSON.stringify(this.mapper.extract(this)) !== JSON.stringify(this.snapshot);
    }

    public getPageIdForIssue(issue: IRuleIssue): string | undefined {
        const fieldDefinition = issue.section.children.find(child => child.name === issue.field.name) as FieldDefinition<FieldModel<TValueType>> | undefined;
        if (!fieldDefinition) {
            return undefined;
        }

        for (const [page, fields] of this.getFields(fieldDefinition)) {
            if (fields.some(field => field.id === issue.field.id)) {
                return page.id;
            }
        }

        return undefined;
    }

    public getPages(): Array<PageModel> {
        const pages: Array<PageModel> = [];

        this.getChildDefinitions().forEach(definition => {
            this.get<PageCollection>(definition).pages.forEach(page => {
                pages.push(page);
            });
        });

        return pages;
    }

    /**
     * Unlike `getFields`, this returns an empty array rather than throwing when the page collection is missing or
     * empty, so that validating a rule bound to a page the form has no instances of skips the rule instead of
     * aborting the whole run.
     */
    public getPagesFor(pageDefinition: PageDefinition): Array<PageModel> {
        // `get` throws for an unregistered definition, so check ownership rather than letting that escape.
        if (!this.getChildDefinitions().includes(pageDefinition)) {
            return [];
        }

        return this.get<PageCollection>(pageDefinition).getPages<PageModel>();
    }

    public getRuleCollection(): RuleCollection {
        return this.ruleCollection;
    }

    public incrementRevision(): this {
        return withChanges(this, { revision: (this.revision ?? 0) + 1 });
    }

    public isPageSetLocked(pageDefinition: PageDefinition): boolean {
        return this.lockedPageSets.has(pageDefinition.id);
    }

    public isSectionLocked(sectionDefinition: SectionDefinition): boolean {
        return this.lockedSections.has(sectionDefinition.id);
    }

    public lockPageSet(pageDefinition: PageDefinition): this {
        return withChanges(this, { lockedPageSets: new Set([...this.lockedPageSets, pageDefinition.id]) });
    }

    public lockSection(sectionDefinition: SectionDefinition | SectionCollectionDefinition): this {
        const closed = this.mapSectionFields(sectionDefinition, field => field.setIsEnabled(false));

        return withChanges(closed, { lockedSections: new Set([...this.lockedSections, sectionDefinition.id]) });
    }

    public populate(input: IPopulateData<IReportData>): FormModel<TData> | Promise<FormModel<TData>> {
        if (!this.mapper) {
            return this;
        }

        const populated = this.mapper.populate(this, <IPopulateData<TData>>input);
        // kept as the locked sections are, so that a later change can tell which fields the host closed
        const remember = (form: FormModel<TData>): FormModel<TData> => input.readOnlyFields
            ? withChanges(form, { readOnlyFields: mergeReadOnlyFields(this.readOnlyFields, <ReadOnlyFields<TData>>input.readOnlyFields) })
            : form;

        return populated instanceof Promise ? populated.then(remember) : remember(populated);
    }

    public removePage(index: number, pageDefinition: PageDefinition): this {
        if (this.isPageSetLocked(pageDefinition)) {
            throw new Error(`Pages of ${pageDefinition.name} cannot be removed while they are locked.`);
        }

        const pageCollection = this.get<PageCollection>(pageDefinition);
        if (!pageCollection) {
            throw new Error("A page collection for the specified page definition does not exist.");
        }

        return this.set(pageDefinition, pageCollection.remove(index));
    }

    public setMode(mode: FormMode): this {
        const form = mode === "editable" ? this : this.mapFields(field => field.setIsEnabled(false));
        return withChanges(form, { mode });
    }

    public setStatus(status: FormStatus): this {
        return withChanges(this, { status });
    }

    public validate(issueCollection: RuleIssueCollection): this {
        const erroredFields = new Set(
            issueCollection
                .getIssues()
                .filter(issue => issue.severity === RuleIssueSeverity.error)
                .map(issue => issue.field)
        );

        return this.mapFields(field => field.setHasError(erroredFields.has(field)));
    }

    public dispose(): void {
        Entity.clearDefinitionRegistry();
    }

    public static registerDefinition<TDefinition extends Definition>(ctor: EntityConstructor<TDefinition>, definition: Definition): void {
        Entity.registerDefinition(ctor, definition);
    }

    /** Gets the schema for the given entity constructor, walking up to the form definition at the root of its tree. */
    public static getSchema<TSchema extends ISchema>(ctor: Function): TSchema {
        const definition = Entity.resolveDefinition<Definition>(ctor as EntityConstructor<Definition>);
        return Entity.resolveSchema(definition) as TSchema;
    }

    /** Returns the page with the fields of every section the form has locked closed, for a page about to be added. */
    private lockAddedPage(page: PageModel, pageDefinition: PageDefinition): PageModel {
        let locked = page;

        for (const sectionDefinition of pageDefinition.children as Array<SectionDefinition | SectionCollectionDefinition>) {
            if (this.lockedSections.has(sectionDefinition.id)) {
                locked = FormModel.mapPageSection(locked, sectionDefinition, field => field.setIsEnabled(false));
            }
        }

        return locked;
    }

    /** Returns a new form with every field on every page replaced by the result of the given mapping. */
    private mapFields(map: (field: FieldModel<TValueType>) => FieldModel<TValueType>): this {
        let form = this;

        form.getChildDefinitions().forEach(pageDefinition => {
            const pageCollection = form.get<PageCollection>(pageDefinition);

            const pages = pageCollection.getPages<PageModel>().map(page => {
                let updatedPage = page;

                pageDefinition.children.forEach(sectionDefinition => {
                    updatedPage = FormModel.mapPageSection(updatedPage, sectionDefinition as SectionDefinition | SectionCollectionDefinition, map);
                });

                return updatedPage;
            });

            form = form.set(pageDefinition, new PageCollection(pages));
        });

        return form;
    }

    /** Returns a new form with every field of the section, on every page, replaced by the result of the given mapping. */
    private mapSectionFields(sectionDefinition: SectionDefinition | SectionCollectionDefinition, map: (field: FieldModel<TValueType>) => FieldModel<TValueType>): this {
        const pageDefinition = sectionDefinition.getPageDefinition();
        const pages = this.getPagesFor(pageDefinition).map(page => FormModel.mapPageSection(page, sectionDefinition, map));

        return this.set(pageDefinition, new PageCollection(pages));
    }

    /** Returns a page's section, or every section of a collection, with each field replaced by the result of the given mapping. */
    private static mapPageSection(page: PageModel, sectionDefinition: SectionDefinition | SectionCollectionDefinition, map: (field: FieldModel<TValueType>) => FieldModel<TValueType>): PageModel {
        const value = page.get<SectionModel | SectionCollection<SectionModel>>(sectionDefinition);

        if (value instanceof SectionCollection) {
            const sections = value.getSections<SectionModel>().map(section => FormModel.mapSection(section, sectionDefinition, map));
            return page.set(sectionDefinition, sections.reduce((collection, section, index) => collection.replace(index, section), value));
        }

        return page.set(sectionDefinition, FormModel.mapSection(value, sectionDefinition, map));
    }

    /** Returns a section with each of its fields replaced by the result of the given mapping. */
    private static mapSection(section: SectionModel, sectionDefinition: SectionDefinition | SectionCollectionDefinition, map: (field: FieldModel<TValueType>) => FieldModel<TValueType>): SectionModel {
        let mapped = section;

        sectionDefinition.children.forEach(fieldDefinition => {
            if (fieldDefinition instanceof FieldDefinition) {
                mapped = mapped.set(fieldDefinition, map(mapped.get<FieldModel<TValueType>>(fieldDefinition)));
            }
        });

        return mapped;
    }
}
