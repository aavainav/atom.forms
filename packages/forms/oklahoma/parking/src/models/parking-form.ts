import { IForm, CitationForm, FieldDefinition, FormModel, PageCollection, PageDefinition, SectionDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "./parking-form-schema";
import { CitationPageModel } from "./citation-page/citation-page";
import { ComplaintPageModel } from "./complaint-page/complaint-page";
import { DetailPageModel } from "./detail-page/detail-page";

export interface IOKParkingForm extends IForm {
}

export interface IOKParkingFormModel extends IOKParkingForm {
    readonly citationPage: PageDefinition<CitationPageModel>;
    readonly complaintPage: PageDefinition<ComplaintPageModel>;
    readonly detailPage: PageDefinition<DetailPageModel>;
}

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
 * Represents the model for the Oklahoma City parking violation form.
 *
 * The citation, complaint and detail pages each appear once, so the form never grows a page and the setters below
 * always reach the first page of a collection.
 */
export class OKParkingFormModel extends CitationForm implements IOKParkingFormModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormSchema);

    public readonly citationPage: PageDefinition<CitationPageModel> = this.schema.citationPage;
    public readonly complaintPage: PageDefinition<ComplaintPageModel> = this.schema.complaintPage;
    public readonly detailPage: PageDefinition<DetailPageModel> = this.schema.detailPage;

    public async initialize(): Promise<this> {
        // the base stamps the date of violation and the ticket number; the time is this form's own addition
        const form = await super.initialize();

        return form
            .setTimeOfViolation()
            .addRuleCollection(this.schema.ruleCollection);
    }

    /** Retrieves the single citation page of the form. */
    public getCitationPage(): CitationPageModel {
        return this.getCitationPageCollection().getFirstPage<CitationPageModel>();
    }

    /** Retrieves the collection of citation pages for the form. */
    public getCitationPageCollection(): PageCollection {
        return this.get<PageCollection>(this.citationPage);
    }

    /** Retrieves the single complaint page of the form. */
    public getComplaintPage(): ComplaintPageModel {
        return this.getComplaintPageCollection().getFirstPage<ComplaintPageModel>();
    }

    /** Retrieves the collection of complaint pages for the form. */
    public getComplaintPageCollection(): PageCollection {
        return this.get<PageCollection>(this.complaintPage);
    }

    /** Retrieves the single detail page of the form. */
    public getDetailPage(): DetailPageModel {
        return this.getDetailPageCollection().getFirstPage<DetailPageModel>();
    }

    /** Retrieves the collection of detail pages for the form. */
    public getDetailPageCollection(): PageCollection {
        return this.get<PageCollection>(this.detailPage);
    }

    /** Returns a form with today's date stamped as the date of violation, and that box closed to editing. */
    public setDateOfViolation(): this {
        return this.setCitationPageValue(
            this.schema.violationSection,
            this.schema.violationFields.violationDate,
            formatDate(new Date()),
            false);
    }

    /** Returns the form unchanged; the citation records no date of issue distinct from the date of violation. */
    public setIssuedDate(): this {
        return this;
    }

    /** Returns the form unchanged; the citation records no time of issue distinct from the time of violation. */
    public setIssuedTime(): this {
        return this;
    }

    /**
     * Returns the form unchanged.
     *
     * The parking citation number is assigned by the municipal court rather than by the form, so it arrives with
     * the data a host loads and there is nothing for the form to stamp on itself.
     */
    public setTicketNumber(): this {
        return this;
    }

    /** Returns a form with the current time stamped as the time of violation; unlike the date, the officer may correct it. */
    public setTimeOfViolation(): this {
        return this.setCitationPageValue(
            this.schema.violationSection,
            this.schema.violationFields.violationTime,
            new Date().toLocaleTimeString(),
            true);
    }

    /** Returns a form with the given citation page field set, threading the change back up through the page collection. */
    private setCitationPageValue<TSection extends SectionModel>(
        sectionDefinition: SectionDefinition<TSection>,
        definition: FieldDefinition<StringFieldModel>,
        value: string,
        isEnabled: boolean): this {
        const collection = this.getCitationPageCollection();
        const page = collection.getFirstPage<CitationPageModel>();
        const section = page.get<TSection>(sectionDefinition);
        const field = section.get<StringFieldModel>(definition).setValue(value).setIsEnabled(isEnabled);

        return this.set(this.citationPage, collection.replace(0, page.set(sectionDefinition, section.set(definition, field))));
    }
}
