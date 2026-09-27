import { citationWorkflow, CitationForm, FieldDefinition, FormModel, IForm, IWorkflow, PageCollection, PageDefinition, SectionDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { CATALOG_IDENTITY } from "../module";
import { IS438Data, S438Mapper } from "../mapping";
import { S438ViolationListId } from "../violations";
import type { S438FormSchema } from "./s438-form-schema";
import { FrontPageModel } from "./front-page/front-page";
import { NoticePageModel } from "./notice-page/notice-page";

export interface IS438Form extends IForm {
}

export interface IS438FormModel extends IS438Form {
    readonly frontPage: PageDefinition<FrontPageModel>;
    readonly noticePage: PageDefinition<NoticePageModel>;
}

/** Formats a date as the `MM/DD/YYYY` the citation's date boxes carry. */
function formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${month}/${day}/${date.getFullYear()}`;
}

/** Represents the S438 form model, providing access to its schema and its front and notice pages. */
export class S438FormModel extends CitationForm<IS438Data> implements IS438Form {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;

    public readonly mapper: S438Mapper = new S438Mapper();
    public readonly violationListId: string = S438ViolationListId.violation;

    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(S438FormModel);
    public readonly frontPage: PageDefinition<FrontPageModel> = this.schema.frontPage;
    public readonly noticePage: PageDefinition<NoticePageModel> = this.schema.noticePage;

    /**
     * The citation workflow with its lock changed. In South Carolina the officer may correct an issued citation until
     * the court takes it, so issuing closes only what the citation charges: the violations themselves, where they
     * were, and the adding or removing of a page for one. The court's taking it is the host's to say, by loading it
     * viewable.
     */
    public readonly workflow: IWorkflow = citationWorkflow.with({
        id: "sc-citation",
        locks: {
            issued: form => form
                .lockPageSet(this.frontPage)
                .lockSection(this.schema.violationSection)
                .lockSection(this.schema.violationLocationSection)
        }
    });

    public async initialize(): Promise<this> {
        const form = await super.initialize();
        return form.addRuleCollection(this.schema.ruleCollection);
    }

    /** Retrieves the collection of front pages for the form. */
    public getFrontPageCollection(): PageCollection {
        return this.get<PageCollection>(this.frontPage);
    }

    /** Retrieves the collection of notice pages for the form. */
    public getNoticePageCollection(): PageCollection {
        return this.get<PageCollection>(this.noticePage);
    }

    /** Returns a form with today's date stamped as the date of violation, and that box closed to editing. */
    public setDateOfViolation(): this {
        return this.setFrontPageValue(
            this.schema.violationSection,
            this.schema.violationFields.violationDateOfViolation,
            formatDate(new Date()),
            false);
    }

    /** Returns the form unchanged; the citation does not record the date it was issued separately from the arrest date. */
    public setIssuedDate(): this {
        return this;
    }

    /** Returns the form unchanged; the citation does not record the time it was issued separately from the time of violation. */
    public setIssuedTime(): this {
        return this;
    }

    /** Returns the form unchanged -- the citation cannot issue its own ticket number, so it arrives with the data a host loads, through the defaults for a new form, rather than being stamped here. */
    public setTicketNumber(): this {
        return this;
    }

    /** Returns a form with the current time stamped as the time of violation; unlike the date, the officer may correct it. */
    public setTimeOfViolation(): this {
        return this.setFrontPageValue(
            this.schema.violationSection,
            this.schema.violationFields.violationTimeOfViolation,
            new Date().toLocaleTimeString(),
            true);
    }

    /** Returns a form with the given front page field set, threading the change back up through the page collection. */
    private setFrontPageValue<TSection extends SectionModel>(
        sectionDefinition: SectionDefinition<TSection>,
        definition: FieldDefinition<StringFieldModel>,
        value: string,
        isEnabled: boolean): this {
        const collection = this.getFrontPageCollection();
        const page = collection.getFirstPage<FrontPageModel>();
        const section = page.get<TSection>(sectionDefinition);
        const field = section.get<StringFieldModel>(definition).setValue(value).setIsEnabled(isEnabled);

        return this.set(this.frontPage, collection.replace(0, page.set(sectionDefinition, section.set(definition, field))));
    }
}
