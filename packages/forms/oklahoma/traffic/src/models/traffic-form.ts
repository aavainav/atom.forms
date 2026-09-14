import { IForm, CitationForm, FieldDefinition, PageCollection, PageDefinition, SectionDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "./traffic-form-schema";
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
 * The identity this form is registered under in the form catalog. The model stamps it on itself and the module
 * registers the catalog item, the mapper and the route from it, so the identity a saved report carries cannot
 * drift from the one the catalog resolves it by.
 */
export const CATALOG_IDENTITY = {
    name: "OKC Traffic Citation",
    description: "Oklahoma City Municipal Court traffic citation - the complaint and information sworn by the issuing officer, the warrant page the counselor and clerk endorse, and the witness, registered owner and status supplement.",
    version: "1.0"
} as const;

/**
 * Formats a date as the `YYYY-MM-DD` the form's date boxes carry.
 *
 * This is the one order `DateRangeFieldRule` parses, and a value it cannot parse silently skips date validation.
 * Stamping any other order would leave the date the form writes for itself unchecked by the form's own rules, so
 * a host mapping a source that uses another order has to convert before its data reaches the contract.
 */
function formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Represents the model for the Oklahoma City traffic citation and complaint form.
 *
 * The complaint, warrant and supplement pages each appear once, so the form never grows a page and the setters
 * below always reach the first page of a collection.
 */
export class OKTrafficFormModel extends CitationForm implements IOKTrafficFormModel {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;

    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly complaintPage: PageDefinition<ComplaintPageModel> = this.formSchema.complaintPage;
    public readonly warrantPage: PageDefinition<WarrantPageModel> = this.formSchema.warrantPage;
    public readonly supplementPage: PageDefinition<SupplementPageModel> = this.formSchema.supplementPage;

    public async initialize(): Promise<this> {
        // the base stamps the date of violation and the ticket number; the time is this form's own addition
        const form = await super.initialize();

        return form
            .setTimeOfViolation()
            .addRuleCollection(this.formSchema.ruleCollection);
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
            this.formSchema.violationSection,
            this.formSchema.violationFields.violationDate,
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

    /**
     * Returns the form unchanged.
     *
     * The citation number is assigned by the municipal court rather than by the form, so it arrives with the data
     * a host loads and there is nothing for the form to stamp on itself.
     */
    public setTicketNumber(): this {
        return this;
    }

    /** Returns a form with the current time stamped as the time of the offense; unlike the date, the officer may correct it. */
    public setTimeOfViolation(): this {
        return this.setComplaintPageValue(
            this.formSchema.violationSection,
            this.formSchema.violationFields.violationTime,
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
