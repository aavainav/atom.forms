import { BooleanFieldModel, CitationForm, FieldDefinition, FormModel, IForm, PageCollection, PageDefinition, SectionDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "./utc-form-schema";
import { CitationPageModel } from "./citation-page/citation-page";
import { CourtPageModel } from "./court-page/court-page";

export interface IGAUTCForm extends IForm {
}

export interface IGAUTCFormModel extends IGAUTCForm {
    readonly citationPage: PageDefinition<CitationPageModel>;
    readonly courtPage: PageDefinition<CourtPageModel>;
}

/**
 * The identity this form is registered under in the form catalog. The model stamps it on itself and the module
 * registers the catalog item, the mapper and the route from it, so the identity a saved report carries cannot
 * drift from the one the catalog resolves it by.
 */
export const CATALOG_IDENTITY = {
    name: "GA Uniform Traffic Citation",
    description: "Georgia uniform traffic citation, summons, and accusation as issued by the City of Atlanta Department of Police - the face of the citation the officer serves, and the reverse of the court's copy the clerk and judge complete.",
    version: "1.0"
} as const;

/** The three letter month the citation's "On Month" box prints, indexed by month number. */
const abbreviatedMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Returns the two digits a day or a year box carries; the year box follows a printed century on the paper. */
function twoDigits(value: number): string {
    return String(value).padStart(2, "0").slice(-2);
}

/**
 * Represents the model for the Georgia uniform traffic citation, summons, and accusation.
 *
 * The citation and court pages each appear once, so the form never grows a page and the setters below always reach
 * the first page of a collection.
 *
 * Unlike the other citation forms, this one has no single date box to stamp: the paper prints the date of the
 * offense as separate month, day and year boxes and its time as separate hour, minute and AM/PM boxes, so
 * `setDateOfViolation` and `setTimeOfViolation` each write several fields in one update.
 */
export class GAUTCFormModel extends CitationForm implements IGAUTCFormModel {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;

    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormModel);

    public readonly citationPage: PageDefinition<CitationPageModel> = this.schema.citationPage;
    public readonly courtPage: PageDefinition<CourtPageModel> = this.schema.courtPage;

    public async initialize(): Promise<this> {
        // the base stamps the date of the offense and the citation number; the time is this form's own addition
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

    /** Retrieves the single court page of the form. */
    public getCourtPage(): CourtPageModel {
        return this.getCourtPageCollection().getFirstPage<CourtPageModel>();
    }

    /** Retrieves the collection of court pages for the form. */
    public getCourtPageCollection(): PageCollection {
        return this.get<PageCollection>(this.courtPage);
    }

    /**
     * Returns a form with today's date stamped across the header's month, day and year boxes, and those boxes
     * closed to editing.
     *
     * The month is the three letter abbreviation the paper prints and the year its last two digits, matching what
     * is written on a printed citation rather than any machine-readable order.
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

    /**
     * Returns the form unchanged.
     *
     * The citation number is preprinted on the ticket book and assigned by the agency rather than by the form, so
     * it arrives with the data a host loads and there is nothing for the form to stamp on itself.
     */
    public setTicketNumber(): this {
        return this;
    }

    /**
     * Returns a form with the current time stamped across the header's hour, minute and AM/PM boxes.
     *
     * Unlike the date, these are left editable so the officer may correct them, and the hour is written on the
     * twelve hour clock the AM/PM pair beside it implies.
     */
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
