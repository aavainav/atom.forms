import { citationWorkflow, IForm, IWorkflow, CitationForm, FieldDefinition, FormModel, PageCollection, PageDefinition, SectionDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { CATALOG_IDENTITY } from "../module";
import { IOKParkingData, OKParkingMapper } from "../mapping";
import { okParkingValueLists } from "../value-lists";
import { OKParkingViolationListId } from "../violations";
import type { OKParkingFormSchema } from "./parking-form-schema";
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
 * Formats a date as the `YYYY-MM-DD` the form's date boxes carry -- the one order `DateRangeFieldRule` parses,
 * and a value it can't parse silently skips validation. A host mapping another order must convert before its
 * data reaches the contract.
 */
function formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
}

/** Model for the Oklahoma City parking violation form. Citation, complaint and detail pages each appear once, so the form never grows a page and the setters below always reach the first page. */
export class OKParkingFormModel extends CitationForm<IOKParkingData> implements IOKParkingFormModel {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;

    public readonly mapper: OKParkingMapper = new OKParkingMapper();
    public readonly valueListIds: ReadonlyArray<string> = okParkingValueLists.map(definition => definition.id);
    public readonly violationListId: string = OKParkingViolationListId.violation;
    public readonly workflow: IWorkflow = citationWorkflow;

    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormModel);

    public readonly citationPage: PageDefinition<CitationPageModel> = this.schema.citationPage;
    public readonly complaintPage: PageDefinition<ComplaintPageModel> = this.schema.complaintPage;
    public readonly detailPage: PageDefinition<DetailPageModel> = this.schema.detailPage;

    public async initialize(): Promise<this> {
        const form = await super.initialize();

        return form.addRuleCollection(this.schema.ruleCollection);
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

    /** Returns the form unchanged -- the parking citation number is assigned by the municipal court, so it arrives with the data a host loads rather than being stamped here. */
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
