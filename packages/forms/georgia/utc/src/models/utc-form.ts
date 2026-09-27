import { citationWorkflow, IForm, IWorkflow, BooleanFieldModel, CitationForm, FieldDefinition, FormModel, PageCollection, PageDefinition, SectionDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { CATALOG_IDENTITY } from "../module";
import { IGAUTCData, GAUTCMapper } from "../mapping";
import { gaUtcValueLists } from "../value-lists";
import { GAUTCValueViolationListId } from "../violations";
import type { GAUTCFormSchema } from "./utc-form-schema";
import { CitationPageModel } from "./citation-page/citation-page";
import { CourtPageModel } from "./court-page/court-page";

export interface IGAUTCForm extends IForm {
}

export interface IGAUTCFormModel extends IGAUTCForm {
    readonly citationPage: PageDefinition<CitationPageModel>;
    readonly courtPage: PageDefinition<CourtPageModel>;
}

/** The three letter month the citation's "On Month" box prints, indexed by month number. */
const abbreviatedMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Returns the two digits a day or a year box carries; the year box follows a printed century on the paper. */
function twoDigits(value: number): string {
    return String(value).padStart(2, "0").slice(-2);
}

/**
 * Model for the Georgia uniform traffic citation, summons, and accusation.
 *
 * Citation and court pages each appear once, so the form never grows a page and the setters below always reach
 * the first page. Unlike other citation forms, there's no single date box: the paper prints the offense date as
 * separate month/day/year boxes and its time as separate hour/minute/AM-PM boxes, so `setDateOfViolation` and
 * `setTimeOfViolation` each write several fields at once.
 */
export class GAUTCFormModel extends CitationForm<IGAUTCData> implements IGAUTCFormModel {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;

    public readonly mapper: GAUTCMapper = new GAUTCMapper();
    public readonly valueListIds: ReadonlyArray<string> = gaUtcValueLists.map(definition => definition.id);
    public readonly violationListId: string = GAUTCValueViolationListId.violation;
    public readonly workflow: IWorkflow = citationWorkflow;

    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormModel);

    public readonly citationPage: PageDefinition<CitationPageModel> = this.schema.citationPage;
    public readonly courtPage: PageDefinition<CourtPageModel> = this.schema.courtPage;

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

    /** Retrieves the single court page of the form. */
    public getCourtPage(): CourtPageModel {
        return this.getCourtPageCollection().getFirstPage<CourtPageModel>();
    }

    /** Retrieves the collection of court pages for the form. */
    public getCourtPageCollection(): PageCollection {
        return this.get<PageCollection>(this.courtPage);
    }

    /**
     * Stamps today's date across the header's month/day/year boxes and closes them to editing. The month is the
     * three-letter abbreviation the paper prints, the year its last two digits -- matching the printed citation.
     */
    public setDateOfViolation(): this {
        const now = new Date();
        const header = this.schema.headerFields;

        return this.updateCitationPageSection(this.schema.headerSection, (section) => {
            let updated = stampText(section, header.headerMonth, abbreviatedMonths[now.getMonth()], false);
            updated = stampText(updated, header.headerDay, twoDigits(now.getDate()), false);

            return stampText(updated, header.headerYear, twoDigits(now.getFullYear()), false);
        });
    }

    /** Returns the form unchanged; the citation records no date of issue distinct from the date of the offense. */
    public setIssuedDate(): this {
        return this;
    }

    /** Returns the form unchanged; the citation records no time of issue distinct from the time of the offense. */
    public setIssuedTime(): this {
        return this;
    }

    /** Returns the form unchanged -- the citation number is preprinted on the ticket book and assigned by the agency, so it arrives with the data a host loads rather than being stamped here. */
    public setTicketNumber(): this {
        return this;
    }

    /** Stamps the current time across the header's hour/minute/AM-PM boxes, left editable so the officer can correct them; the hour is written on the twelve-hour clock the AM/PM pair implies. */
    public setTimeOfViolation(): this {
        const now = new Date();
        const header = this.schema.headerFields;
        const isAfternoon = now.getHours() >= 12;
        const hour = now.getHours() % 12 || 12;

        return this.updateCitationPageSection(this.schema.headerSection, (section) => {
            let updated = stampText(section, header.headerHour, twoDigits(hour), true);
            updated = stampText(updated, header.headerMinute, twoDigits(now.getMinutes()), true);
            updated = stampCheckbox(updated, header.headerAm, !isAfternoon);

            return stampCheckbox(updated, header.headerPm, isAfternoon);
        });
    }

    /** Returns a form with the given citation page section replaced, threading the change back up through the page collection. */
    private updateCitationPageSection<TSection extends SectionModel>(
        sectionDefinition: SectionDefinition<TSection>,
        update: (section: TSection) => TSection): this {
        const collection = this.getCitationPageCollection();
        const page = collection.getFirstPage<CitationPageModel>();
        const section = page.get<TSection>(sectionDefinition);

        return this.set(this.citationPage, collection.replace(0, page.set(sectionDefinition, update(section))));
    }
}

/** Returns a section with the given checkbox set; the section is immutable, so the result has to be used. */
function stampCheckbox<TSection extends SectionModel>(
    section: TSection,
    definition: FieldDefinition<BooleanFieldModel>,
    value: boolean): TSection {
    return section.set(definition, section.get<BooleanFieldModel>(definition).setValue(value));
}

/** Returns a section with the given text box set and its editability fixed; the section is immutable, so the result has to be used. */
function stampText<TSection extends SectionModel>(
    section: TSection,
    definition: FieldDefinition<StringFieldModel>,
    value: string,
    isEnabled: boolean): TSection {
    return section.set(definition, section.get<StringFieldModel>(definition).setValue(value).setIsEnabled(isEnabled));
}
