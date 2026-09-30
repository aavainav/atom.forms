import { crashWorkflow, ICrash, IForm, IWorkflow, CrashForm, FieldDefinition, FormModel, NumberFieldModel, PageCollection, PageDefinition, StringFieldModel } from "@forms/core";
import { CATALOG_IDENTITY } from "../module";
import { ITR310Data, TR310Mapper } from "../mapping";
import { tr310ValueLists } from "../value-lists";
import type { TR310FormSchema } from "./tr310-form-schema";
import { CollisionPageModel } from "./collision-page/collision-page";
import { NarrativePageModel } from "./narrative-page/narrative-page";
import { PersonPageModel } from "./person-page/person-page";
import { UnitPageModel } from "./unit-page/unit-page";
import { WitnessSectionModel } from "./collision-page/witness-section";

export interface ITR310Form extends IForm {
}

export interface ITR310FormModel extends ITR310Form {
    readonly collisionPage: PageDefinition<CollisionPageModel>;
    readonly narrativePage: PageDefinition<NarrativePageModel>;
    readonly personPage: PageDefinition<PersonPageModel>;
    readonly unitPage: PageDefinition<UnitPageModel>;
}

/** The code the report uses for a yes answer on its yes/no/unknown boxes. */
const yes = "1";

/** The code `personHeaderPersonType` carries for a driver, matching `tr310-rules.ts`'s own constant. */
const driver = "1";

/** Formats a date as the `YYYY-MM-DD` the report's date boxes carry. */
function formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
}

/** Reads a string field as the single value it holds. */
function text(field: StringFieldModel): string {
    const value = field.getValue();

    return Array.isArray(value) ? value.join(", ") : value;
}

/** Reads a number field as the single value it holds, for the same reason `text` does. */
function count(field: NumberFieldModel): number | null {
    const value = field.getValue();

    return Array.isArray(value) ? value[0] ?? null : value;
}

/** Represents the model for the South Carolina TR-310 traffic collision report. */
export class TR310FormModel extends CrashForm<ITR310Data> implements ITR310FormModel {
    public readonly name: string = CATALOG_IDENTITY.name;
    public readonly description: string = CATALOG_IDENTITY.description;
    public readonly version: string = CATALOG_IDENTITY.version;

    public readonly mapper: TR310Mapper = new TR310Mapper();
    public readonly valueListIds: ReadonlyArray<string> = tr310ValueLists.map(definition => definition.id);
    public readonly workflow: IWorkflow = crashWorkflow;

    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormModel);

    public readonly collisionPage: PageDefinition<CollisionPageModel> = this.schema.collisionPage;
    public readonly personPage: PageDefinition<PersonPageModel> = this.schema.personPage;
    public readonly unitPage: PageDefinition<UnitPageModel> = this.schema.unitPage;
    public readonly narrativePage: PageDefinition<NarrativePageModel> = this.schema.narrativePage;

    public async initialize(): Promise<this> {
        const form = await super.initialize();

        return form
            .setDateOfCrash()
            .setTimeOfCrash()
            .setCrashNumber()
            .addRuleCollection(this.schema.ruleCollection);
    }

    /** Builds the common crash contract from the report. */
    public getCrashData(): ICrash {
        const page = this.getCollisionPage();
        const collision = page.getCollisionSection();
        const conditions = page.getConditionsSection();
        const coordinates = page.getCoordinatesSection();

        return {
            id: this.id ?? "",
            name: this.name,
            version: this.version,
            type: this.type,
            agencyOri: "",
            agencyName: "",
            crashDate: text(collision.getDate()),
            crashTime: text(collision.getTime()),
            locationStreet: text(page.getRouteSection().getRouteName()),
            locationCity: text(collision.getCityOrTown()),
            locationState: "SC",
            locationZip: "",
            intersectingStreet: text(page.getSecondIntersectionSection().getRouteName()),
            latitude: Number(text(coordinates.getLatitude())) || undefined,
            longitude: Number(text(coordinates.getLongitude())) || undefined,
            lightCondition: conditions.getLight().getValue().description,
            roadCondition: conditions.getRoadSurface().getValue().description,
            weatherCondition: conditions.getWeatherFirst().getValue().description,
            workZoneRelated: page.getWorkZoneSection().getRelated().getValue().value === yes,
            units: this.getUnitPages().map(unitPage => this.getUnitData(unitPage)),
            witnesses: this.getWitnessData()
        };
    }

    /** Retrieves the single collision page of the report. */
    public getCollisionPage(): CollisionPageModel {
        return this.getCollisionPageCollection().getFirstPage<CollisionPageModel>();
    }

    /** Retrieves the collection of collision pages for the form. */
    public getCollisionPageCollection(): PageCollection {
        return this.get<PageCollection>(this.collisionPage);
    }

    /** Retrieves the single narrative page of the report. */
    public getNarrativePage(): NarrativePageModel {
        return this.getNarrativePageCollection().getFirstPage<NarrativePageModel>();
    }

    /** Retrieves the collection of narrative pages for the form. */
    public getNarrativePageCollection(): PageCollection {
        return this.get<PageCollection>(this.narrativePage);
    }

    /** Retrieves the collection of person pages for the form. */
    public getPersonPageCollection(): PageCollection {
        return this.get<PageCollection>(this.personPage);
    }

    /** Retrieves the person pages of the report, one per person involved, in page order. */
    public getPersonPages(): Array<PersonPageModel> {
        return this.getPersonPageCollection().getPages<PersonPageModel>();
    }

    /** Retrieves the collection of unit pages for the form. */
    public getUnitPageCollection(): PageCollection {
        return this.get<PageCollection>(this.unitPage);
    }

    /** Retrieves the unit pages of the report, one per unit involved, in page order. */
    public getUnitPages(): Array<UnitPageModel> {
        return this.getUnitPageCollection().getPages<UnitPageModel>();
    }

    /**
     * Returns the form unchanged.
     *
     * The SCDPS crash report number is assigned by the state rather than by the report, so it arrives with the
     * data a host loads and there is nothing for the form to stamp on itself.
     */
    public setCrashNumber(): this {
        return this;
    }

    /** Returns a form with today's date stamped on the collision, and that box closed to editing. */
    public setDateOfCrash(): this {
        return this.setCollisionValue(this.schema.collisionFields.collisionDate, formatDate(new Date()), false);
    }

    /** Returns a form with the current time stamped on the collision; unlike the date, the officer may correct it. */
    public setTimeOfCrash(): this {
        return this.setCollisionValue(this.schema.collisionFields.collisionTime, new Date().toLocaleTimeString(), true);
    }

    /** Builds the common contract's unit from a unit page, taking the driver from the person page recording that unit. */
    private getUnitData(page: UnitPageModel): ICrash["units"][number] {
        const vehicle = page.getVehicleSection();
        const owner = page.getOwnerSection();
        const unitNumber = text(page.getUnitHeaderSection().getUnitNumber());

        const driverSection = this.getPersonPages()
            .find(person => {
                const header = person.getPersonHeaderSection();
                return text(header.getUnitNumber()) === unitNumber && header.getPersonType().getValue().value === driver;
            })
            ?.getPersonSection();

        return {
            unitId: unitNumber,
            unitType: page.getUnitTypeSection().getUnit().getValue().description,
            driverFirstName: driverSection ? text(driverSection.getFirstName()) : "",
            driverLastName: driverSection ? text(driverSection.getLastName()) : "",
            driverMiddleName: driverSection && text(driverSection.getMiddleName()),
            driverDateOfBirth: driverSection && text(driverSection.getDateOfBirth()),
            driverGender: driverSection?.getSex().getValue().description,
            ownerFirstName: text(owner.getFirstName()),
            ownerLastName: text(owner.getLastName()),
            ownerMiddleName: text(owner.getMiddleName()),
            ownerStreet: text(owner.getAddress()),
            ownerCity: text(owner.getCity()),
            ownerState: owner.getState().getValue().value,
            ownerZip: text(owner.getZipCode()),
            vehicleMake: vehicle.getMake().getValue().description,
            vehicleModel: vehicle.getModel().getValue().description,
            vehicleYear: count(vehicle.getYear()),
            // the common contract carries passengers per unit; the report records them per person page, and which
            // unit a passenger rode in is not asked for beyond the unit number on their own row
            passengers: []
        };
    }

    /** Builds the common contract's witnesses from the three rows the collision page carries, skipping the unfilled ones. */
    private getWitnessData(): ICrash["witnesses"] {
        return this.getCollisionPage().getWitnessSection().getSections<WitnessSectionModel>()
            .map((witness, index) => ({
                witnessId: String(index + 1),
                firstName: text(witness.getFirstName()),
                lastName: text(witness.getLastName()),
                middleName: text(witness.getMiddleInitial())
            }))
            .filter(entry => entry.firstName || entry.lastName);
    }

    /** Returns a form with the given collision field set, threading the change back up through the page collection. */
    private setCollisionValue(definition: FieldDefinition<StringFieldModel>, value: string, isEnabled: boolean): this {
        const collection = this.getCollisionPageCollection();
        const page = collection.getFirstPage<CollisionPageModel>();
        const section = page.getCollisionSection();
        const field = section.get<StringFieldModel>(definition).setValue(value).setIsEnabled(isEnabled);

        return this.set(this.collisionPage, collection.replace(0, page.set(page.collisionSection, section.set(definition, field))));
    }
}
