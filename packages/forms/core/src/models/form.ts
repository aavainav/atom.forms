import { Definition } from "./definition";
import { Entity, EntityConstructor, IEntity } from "./entity";
import { FieldModel, TValueType } from "./field";
import { FieldDefinition } from "./field-definition";
import { PageModel } from "./page";
import { PageCollection } from "./page-collection";
import { PageDefinition } from "./page-definition";
import type { SectionModel } from "./section";
import type { SectionDefinition } from "./section-definition";
import { ISchema } from "./schema";
import { RuleCollection } from "./validation/rule-collection";
import { RuleIssueSeverity } from "./validation/rule-issue";
import { RuleIssueCollection } from "./validation/rule-issue-collection";
import { withChanges } from "../utils/clone";

export type FormModelConstructor<TForm extends FormModel> = new () => TForm;
export type FormStatus = "canceled" | "draft" | "rejected" | "inProgress" | "issued" | "voided";
export type FormType = "crash" | "citation" | "tow" | "warning" | "none";

/** Identifies a form registered with the form catalog. A missing version resolves to the latest. */
export interface IFormIdentity {
    readonly name: string;
    readonly version?: string;
}

/** Defines the model properties of a form. */
export interface IForm {
    readonly name: string;
    readonly description?: string;
    readonly status: FormStatus;
    readonly type: FormType;
    readonly version: string;
}

/** Defines the model of a form. */
export interface IFormModel extends IEntity<PageDefinition> {
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

    /** Creates and initializes a page for each child page definition, adding it to the form. */
    initialize(): Promise<this>;
    /** Adds a page to the page collection for the specified page definition. */
    addPage(page: PageModel, pageDefinition: PageDefinition): this;
    /** Adds a rule collection used to validate the form. */
    addRuleCollection(ruleCollection: RuleCollection): this;
    /** Gets the child entity registered for the specified page definition. */
    get<TPage>(pageDefinition: PageDefinition): TPage;
    /** Gets the first field across all pages that matches the specified field definition. */
    getFirstField<TField extends FieldModel<TValueType>>(fieldDefinition: FieldDefinition<TField>): TField;
    /** Gets every field matching the specified field definition, grouped by the page it belongs to. */
    getFields<TField extends FieldModel<TValueType>>(fieldDefinition: FieldDefinition<TField>): Map<PageModel, Array<TField>>;
    /** Gets every page on the form, across all page definitions. */
    getPages(): Array<PageModel>;
    /** Gets the pages belonging to the specified page definition, or an empty array when the form has none. */
    getPagesFor(pageDefinition: PageDefinition): Array<PageModel>;
    /** Gets the rule collection used to validate the form. */
    getRuleCollection(): RuleCollection;
    /** Removes the page at the specified index from the page collection for the specified page definition. */
    removePage(index: number, pageDefinition: PageDefinition): this;
    /** Disables every field on the form, so it renders read-only. */
    setReadOnly(): this;
    /** Returns a form with the given status, which determines the watermark stamped across its pages. */
    setStatus(status: FormStatus): this;
    /** Marks every field on the form as not dirty. */
    clean(): this;
    /** Applies the given issue collection, setting the has error state for every field on the form. */
    validate(issueCollection: RuleIssueCollection): this;
    /** Releases resources held by the form model, such as registered schemas and definitions. */
    dispose(): void;
}

/** Represents a form model that manages pages and their definitions within a form. */
export class FormModel extends Entity<PageDefinition> implements IFormModel {
    public readonly name: string;
    public readonly description?: string;
    public readonly status: FormStatus = "draft";
    public readonly type: FormType;
    public readonly version: string;

    public readonly ruleCollection: RuleCollection = new RuleCollection([]);

    public async initialize(): Promise<this> {
        let form = this;

        for (const pageDefinition of form.getChildDefinitions()) {
            const page = await pageDefinition.createPage(form).initialize();
            form = form.addPage(page, pageDefinition);
        }

        return form;
    }

    public addPage(page: PageModel, pageDefinition: PageDefinition): this {
        const pageCollection = this.get<PageCollection>(pageDefinition);
        if (!pageCollection) {
            throw new Error("A page collection for the specified page definition does not exist.");
        }

        return this.set(pageDefinition, pageCollection.add(page));
    }

    public addRuleCollection(ruleCollection: RuleCollection): this {
        return withChanges(this, { ruleCollection: this.ruleCollection.addRuleCollection(ruleCollection) });
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

    public removePage(index: number, pageDefinition: PageDefinition): this {
        const pageCollection = this.get<PageCollection>(pageDefinition);
        if (!pageCollection) {
            throw new Error("A page collection for the specified page definition does not exist.");
        }

        return this.set(pageDefinition, pageCollection.remove(index));
    }

    public setReadOnly(): this {
        return this.mapFields(field => field.setIsEnabled(false));
    }

    public setStatus(status: FormStatus): this {
        return withChanges(this, { status });
    }

    public clean(): this {
        return this.mapFields(field => field.setIsDirty(false));
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

    /** Returns a new form with every field on every page replaced by the result of the given mapping. */
    private mapFields(map: (field: FieldModel<TValueType>) => FieldModel<TValueType>): this {
        let form = this;

        form.getChildDefinitions().forEach(pageDefinition => {
            const pageCollection = form.get<PageCollection>(pageDefinition);

            const pages = pageCollection.getPages<PageModel>().map(page => {
                let updatedPage = page;

                pageDefinition.children.forEach(sectionDefinition => {
                    let section = updatedPage.get<SectionModel>(sectionDefinition as SectionDefinition);

                    sectionDefinition.children.forEach(fieldDefinition => {
                        if (fieldDefinition instanceof FieldDefinition) {
                            const field = section.get<FieldModel<TValueType>>(fieldDefinition);
                            section = section.set(fieldDefinition, map(field));
                        }
                    });

                    updatedPage = updatedPage.set(sectionDefinition as SectionDefinition, section);
                });

                return updatedPage;
            });

            form = form.set(pageDefinition, new PageCollection(pages));
        });

        return form;
    }
}
