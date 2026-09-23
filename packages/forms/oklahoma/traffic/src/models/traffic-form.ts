import { citationWorkflow, IForm, IWorkflow, CitationForm, FieldDefinition, FormModel, PageCollection, PageDefinition, SectionDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { CATALOG_IDENTITY } from "../module";
import { IOKTrafficData, OKTrafficMapper } from "../mapping";
import { okTrafficValueLists } from "../value-lists";
import { OKTrafficViolationListId } from "../violations";
import type { OKTrafficFormSchema } from "./traffic-form-schema";
import { ComplaintPageModel } from "./complaint-page/complaint-page";
import { SupplementPageModel } from "./supplement-page/supplement-page";
import { WarrantPageModel } from "./warrant-page/warrant-page";

export interface IOKTrafficForm extends IForm {
}

export interface IOKTrafficFormModel extends IOKTrafficForm {
    readonly complaintPage: PageDefinition<ComplaintPageModel>;
    readonly supplementPage: PageDefinition<SupplementPageModel>;
    readonly warrantPage: PageDefinition<WarrantPageModel>;
}

/**
 * Formats a date as the `YYYY-MM-DD` the form's date boxes carry -- the one order `DateRangeFieldRule` parses,
 * and a value it can't parse silently skips validation. A host mapping another order must convert before its
 * data reaches the contract.
 */
function formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
}

/** Model for the Oklahoma City traffic citation and complaint form. Complaint, warrant and supplement pages each appear once, so the form never grows a page and the setters below always reach the first page. */
export class OKTrafficFormModel extends CitationForm<IOKTrafficData> implements IOKTrafficFormModel {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;

    public readonly mapper: OKTrafficMapper = new OKTrafficMapper();
    public readonly valueListIds: ReadonlyArray<string> = okTrafficValueLists.map(definition => definition.id);
    public readonly violationListId: string = OKTrafficViolationListId.violation;
    public readonly workflow: IWorkflow = citationWorkflow;

    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormModel);

    public readonly complaintPage: PageDefinition<ComplaintPageModel> = this.schema.complaintPage;
    public readonly warrantPage: PageDefinition<WarrantPageModel> = this.schema.warrantPage;
    public readonly supplementPage: PageDefinition<SupplementPageModel> = this.schema.supplementPage;

    public async initialize(): Promise<this> {
        // the base stamps the date of violation and the ticket number; the time is this form's own addition
        const form = await super.initialize();

        return form
            .setTimeOfViolation()
            .addRuleCollection(this.schema.ruleCollection);
    }

    /** Retrieves the single complaint page of the form. */
    public getComplaintPage(): ComplaintPageModel {
        return this.getComplaintPageCollection().getFirstPage<ComplaintPageModel>();
    }

    /** Retrieves the collection of complaint pages for the form. */
    public getComplaintPageCollection(): PageCollection {
        return this.get<PageCollection>(this.complaintPage);
    }

    /** Retrieves the single supplement page of the form. */
    public getSupplementPage(): SupplementPageModel {
        return this.getSupplementPageCollection().getFirstPage<SupplementPageModel>();
    }

    /** Retrieves the collection of supplement pages for the form. */
    public getSupplementPageCollection(): PageCollection {
        return this.get<PageCollection>(this.supplementPage);
    }

    /** Retrieves the single warrant page of the form. */
    public getWarrantPage(): WarrantPageModel {
        return this.getWarrantPageCollection().getFirstPage<WarrantPageModel>();
    }

    /** Retrieves the collection of warrant pages for the form. */
    public getWarrantPageCollection(): PageCollection {
        return this.get<PageCollection>(this.warrantPage);
    }

    /** Returns a form with today's date stamped as the date of the offense, and that box closed to editing. */
    public setDateOfViolation(): this {
        return this.setComplaintPageValue(
            this.schema.violationSection,
            this.schema.violationFields.violationDate,
            formatDate(new Date()),
            false);
    }

    /** Returns the form unchanged; the citation records no date of issue distinct from the date of the offense. */
    public setIssuedDate(): this {
        return this;
    }

    /** Returns the form unchanged; the citation records no time of issue distinct from the time of the offense. */
    public setIssuedTime(): this {
        return this;
    }

    /** Returns the form unchanged -- the citation number is assigned by the municipal court, so it arrives with the data a host loads rather than being stamped here. */
    public setTicketNumber(): this {
        return this;
    }

    /** Returns a form with the current time stamped as the time of the offense; unlike the date, the officer may correct it. */
    public setTimeOfViolation(): this {
        return this.setComplaintPageValue(
            this.schema.violationSection,
            this.schema.violationFields.violationTime,
            new Date().toLocaleTimeString(),
            true);
    }

    /** Returns a form with the given complaint page field set, threading the change back up through the page collection. */
    private setComplaintPageValue<TSection extends SectionModel>(
        sectionDefinition: SectionDefinition<TSection>,
        definition: FieldDefinition<StringFieldModel>,
        value: string,
        isEnabled: boolean): this {
        const collection = this.getComplaintPageCollection();
        const page = collection.getFirstPage<ComplaintPageModel>();
        const section = page.get<TSection>(sectionDefinition);
        const field = section.get<StringFieldModel>(definition).setValue(value).setIsEnabled(isEnabled);

        return this.set(this.complaintPage, collection.replace(0, page.set(sectionDefinition, section.set(definition, field))));
    }
}
