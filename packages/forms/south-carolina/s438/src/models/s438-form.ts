import { citationWorkflow, CitationForm, FieldDefinition, FormModel, IForm, IFormVariant, IWorkflow, PageCollection, PageDefinition, PageModel, SectionDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { CATALOG_IDENTITY } from "../module";
import { IS438Data, S438CitationType, S438Mapper } from "../mapping";
import { S438ViolationListId } from "../violations";
import type { S438FormSchema } from "./s438-form-schema";
import { FrontPageModel } from "./front-page/front-page";
import { NoticePageModel } from "./notice-page/notice-page";
import { TrialPageModel } from "./trial-page/trial-page";

export interface IS438Form extends IForm {
}

export interface IS438FormModel extends IS438Form {
    readonly frontPage: PageDefinition<FrontPageModel>;
    readonly trialPage: PageDefinition<TrialPageModel>;
    readonly noticePage: PageDefinition<NoticePageModel>;
}

/** Formats a date as the `MM/DD/YYYY` the citation's date boxes carry. */
function formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${month}/${day}/${date.getFullYear()}`;
}

/** Formats a time as the military `hhmm` the citation's time boxes carry. */
function formatTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * Represents the S438 form model, providing access to its schema and its front, trial and notice pages. A citation is
 * written on the front pages or the trial pages, never both: the copy it is not on has no pages, so it draws no tab
 * and none of its rules run.
 */
export class S438FormModel extends CitationForm<IS438Data> implements IS438Form {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;

    public readonly mapper: S438Mapper = new S438Mapper();
    public readonly violationListId: string = S438ViolationListId.violation;

    public readonly variants: ReadonlyArray<IFormVariant> = [
        { id: "court", isDefault: true, title: "Court", description: "The front page and notice page, returned to court." },
        { id: "trial", title: "Trial", description: "The trial page and notice page." }
    ];

    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(S438FormModel);
    public readonly frontPage: PageDefinition<FrontPageModel> = this.schema.frontPage;
    public readonly trialPage: PageDefinition<TrialPageModel> = this.schema.trialPage;
    public readonly noticePage: PageDefinition<NoticePageModel> = this.schema.noticePage;

    /**
     * The citation workflow with its lock changed. In South Carolina the officer may correct an issued citation until
     * the court takes it, so issuing closes only what the citation charges: the violations themselves, where they
     * were, and the adding or removing of a page for one. The court's taking it is the host's to say, by loading it
     * viewable. Both copies are locked; the one the citation is not on has nothing to lock.
     */
    public readonly workflow: IWorkflow = citationWorkflow.with({
        id: "sc-citation",
        locks: {
            issued: form => form
                .lockPageSet(this.frontPage)
                .lockSection(this.schema.violationSection)
                .lockSection(this.schema.violationLocationSection)
                .lockPageSet(this.trialPage)
                .lockSection(this.schema.trialViolationSection)
                .lockSection(this.schema.trialViolationLocationSection)
        }
    });

    /** Starts as its default variant, a court citation; variants flagged wrongly throw here, on the form's first load. */
    public async initialize(): Promise<this> {
        const form = await super.initialize();
        return (await form.applyVariant(form.getDefaultVariant()!.id)).addRuleCollection(this.schema.ruleCollection);
    }

    public applyVariant(id: string): Promise<this> {
        if (id !== "court" && id !== "trial") {
            return super.applyVariant(id);
        }

        return this.setCitationType(id);
    }

    public getVariant(): string {
        return this.getCitationType();
    }

    /** Which copy the citation is on, told by which pages it carries. */
    public getCitationType(): S438CitationType {
        return this.getFrontPageCollection().pages.length === 0 ? "trial" : "court";
    }

    /** Returns a form on the given copy only: the other copy's pages are dropped, and a copy it lacked is created and stamped. */
    public async setCitationType(type: S438CitationType): Promise<this> {
        const [keep, drop] = type === "trial" ? [this.trialPage, this.frontPage] : [this.frontPage, this.trialPage];
        let form = this.set(drop, this.get<PageCollection>(drop).clear());

        // initialize must be awaited, since it is what creates the page's sections
        if (form.get<PageCollection>(keep).pages.length === 0) {
            form = form.addPage(await keep.createPage(form).initialize(), keep);
            form = form.setDateOfViolation().setTimeOfViolation();
        }

        return form;
    }

    /** Retrieves the collection of front pages for the form. */
    public getFrontPageCollection(): PageCollection {
        return this.get<PageCollection>(this.frontPage);
    }

    /** Retrieves the collection of trial pages for the form, one per charge on a trial citation and none on a court one. */
    public getTrialPageCollection(): PageCollection {
        return this.get<PageCollection>(this.trialPage);
    }

    /** Retrieves the collection of notice pages for the form. */
    public getNoticePageCollection(): PageCollection {
        return this.get<PageCollection>(this.noticePage);
    }

    /** Returns a form with today's date stamped as the date of violation on whichever copy it is on, and that box closed to editing. */
    public setDateOfViolation(): this {
        const date = formatDate(new Date());

        return this.getCitationType() === "trial"
            ? this.setFirstPageValue(this.trialPage, this.schema.trialViolationSection, this.schema.trialViolationFields.trialViolationDateOfViolation, date, false)
            : this.setFirstPageValue(this.frontPage, this.schema.violationSection, this.schema.violationFields.violationDateOfViolation, date, false);
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

    /** Returns a form with the current time stamped as the time of violation on whichever copy it is on; unlike the date, the officer may correct it. */
    public setTimeOfViolation(): this {
        const time = formatTime(new Date());

        return this.getCitationType() === "trial"
            ? this.setFirstPageValue(this.trialPage, this.schema.trialViolationSection, this.schema.trialViolationFields.trialViolationTimeOfViolation, time, true)
            : this.setFirstPageValue(this.frontPage, this.schema.violationSection, this.schema.violationFields.violationTimeOfViolation, time, true);
    }

    /** Returns a form with a field on the definition's first page set, threading the change back up through its page collection. */
    private setFirstPageValue<TSection extends SectionModel>(
        pageDefinition: PageDefinition,
        sectionDefinition: SectionDefinition<TSection>,
        definition: FieldDefinition<StringFieldModel>,
        value: string,
        isEnabled: boolean): this {
        const collection = this.get<PageCollection>(pageDefinition);
        const page = collection.getFirstPage<PageModel>();
        const section = page.get<TSection>(sectionDefinition);
        const field = section.get<StringFieldModel>(definition).setValue(value).setIsEnabled(isEnabled);

        return this.set(pageDefinition, collection.replace(0, page.set(sectionDefinition, section.set(definition, field))));
    }
}
