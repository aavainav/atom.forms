import { Dropzone, FieldModel, FormModel, IControllerManager, IOptionValue, PageCollection, PersonDropzoneFields, TValueType, VehicleDropzoneFields, ViolationDropzoneFields } from "@forms/core";
import { IValueListService, ValueListId } from "@forms/value-lists";
import { IViolation } from "@forms/violations";
import { createService, Singleton } from "@shrub/core";

import { ComplaintPageModel } from "../models/complaint-page/complaint-page";
import { OKTrafficFormSchema } from "../models/traffic-form-schema";
import { OKTrafficValueListId } from "../value-lists";

export const IOKTrafficService = createService<IOKTrafficService>("forms-ok-traffic-service");

/**
 * Defines the service backing the Oklahoma City traffic citation form.
 *
 * Every value list the form's option fields draw on is reached through here rather than imported by the component
 * that renders it, so the components speak the form's language - counties, states, makes, models - while the lists
 * themselves come from the value list registry, where a host can serve any of them from somewhere else by
 * registering over its id.
 */
export interface IOKTrafficService {
    /** Returns a new complaint page with the dropped person data applied to the defendant section. */
    applyDefendantDropzone(page: ComplaintPageModel, dropzone: Dropzone): ComplaintPageModel;
    /** Returns a new complaint page with the dropped vehicle data applied to the vehicle section. */
    applyVehicleDropzone(page: ComplaintPageModel, dropzone: Dropzone): ComplaintPageModel;
    /** Returns a new complaint page with the dropped violation data applied to the violation boxes. */
    applyViolationDropzone(page: ComplaintPageModel, dropzone: Dropzone): ComplaintPageModel;
    /** Writes the chosen violations onto the form, one complaint page each, and adds the pages the extra ones need. */
    applyViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>): Promise<void>;
    /** Narrows the given violations to those the complaint pages already carry. */
    getAppliedViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>): ReadonlyArray<IViolation>;
    /** Loads the options for the form's county field. */
    getCountyOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the defendant's sex field. */
    getSexOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the form's state fields, which the defendant, license, vehicle, witness, owner and trailer boxes share. */
    getStateOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the vehicle make field. */
    getVehicleMakeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the models belonging to the given make code; a blank or unrecognized code has none. */
    getVehicleModelOptions(makeCode: string): Promise<Array<IOptionValue>>;
    /** Loads the options every Y/N box on the form takes. */
    getYesNoOptions(): Promise<Array<IOptionValue>>;
    /**
     * Returns the dropped vehicle with its make and model turned from the names they arrived as into the codes the
     * form stores, dropping either if the value lists do not recognize it. Await this before applying the dropzone
     * to the page, so a name with no code never reaches the form.
     */
    resolveVehicleDropzone(dropzone: Dropzone): Promise<Dropzone>;
}

@Singleton
export class OKTrafficService implements IOKTrafficService {
    constructor(@IValueListService private readonly valueListService: IValueListService) {
    }

    applyDefendantDropzone(page: ComplaintPageModel, dropzone: Dropzone): ComplaintPageModel {
        const defendantSection = page.getDefendantSection();
        const updatedSection = dropzone.applyTo(defendantSection, {
            [PersonDropzoneFields.firstName]: defendantSection.firstName,
            [PersonDropzoneFields.middleName]: defendantSection.middleName,
            [PersonDropzoneFields.lastName]: defendantSection.lastName,
            [PersonDropzoneFields.address]: defendantSection.address,
            [PersonDropzoneFields.city]: defendantSection.city,
            [PersonDropzoneFields.zipCode]: defendantSection.zipCode
        });

        return page.set(page.defendantSection, updatedSection).setDropzone(dropzone);
    }

    applyVehicleDropzone(page: ComplaintPageModel, dropzone: Dropzone): ComplaintPageModel {
        const vehicleSection = page.getVehicleSection();
        const updatedSection = dropzone.applyTo(vehicleSection, {
            [VehicleDropzoneFields.make]: vehicleSection.make,
            [VehicleDropzoneFields.model]: vehicleSection.model,
            [VehicleDropzoneFields.year]: vehicleSection.year
        });

        return page.set(page.vehicleSection, updatedSection).setDropzone(dropzone);
    }

    applyViolationDropzone(page: ComplaintPageModel, dropzone: Dropzone): ComplaintPageModel {
        const violationSection = page.getViolationSection();
        const updatedSection = dropzone.applyTo(violationSection, {
            [ViolationDropzoneFields.code]: violationSection.municipalCode,
            [ViolationDropzoneFields.statute]: violationSection.offenseCode
        });

        // a dropped violation is on the citation exactly as a chosen one is, so its boxes lock the same way
        const locked = updatedSection
            .set(updatedSection.municipalCode, lock(updatedSection.getMunicipalCode()))
            .set(updatedSection.offenseCode, lock(updatedSection.getOffenseCode()));

        return page.set(page.violationSection, locked).setDropzone(dropzone);
    }

    getAppliedViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>): ReadonlyArray<IViolation> {
        const schema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormSchema);
        const pages = controllers.getFormController().form.get<PageCollection>(schema.complaintPage).getPages<ComplaintPageModel>();

        // the citation prints the agency's own code in its Muni Code box, so that is what identifies a charge
        const carried = new Set(pages.map(page => page.getViolationSection().getMunicipalCode().getValue()).filter(Boolean));

        return violations.filter(violation => carried.has(violation.code));
    }

    async applyViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>): Promise<void> {
        if (!violations.length) {
            return;
        }

        const controller = controllers.getFormController();
        const schema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormSchema);

        const pages = controller.form.get<PageCollection>(schema.complaintPage).getPages<ComplaintPageModel>();

        // the chosen violations go into the first page with no code on it, and then onto pages after that, so
        // picking again adds to the citation rather than rewriting it
        const empty = pages.findIndex(page => page.getViolationSection().getMunicipalCode().getIsEmpty() && page.getViolationSection().getOffenseCode().getIsEmpty());
        const start = empty < 0 ? pages.length : empty;

        // initialize must be awaited, since it is what creates the page's sections and registers its dropzones
        for (let index = pages.length; index < start + violations.length; index++) {
            await controller.addPage(schema.complaintPage);
        }

        // the date, time, county and location sit in the violation section alongside the codes, so they are not
        // carried across by the shared-section copy; one stop produces one of each however many charges come out
        // of it, so they are taken from the first page
        const first = controller.form.get<PageCollection>(schema.complaintPage).pages[0] as ComplaintPageModel;
        const source = first.getViolationSection();
        const date = source.getDate().getValue();
        const time = source.getTime().getValue();
        const county = source.getCounty().getValue();
        const location = source.getLocation().getValue();

        controller.update(form => {
            let collection = form.get<PageCollection>(schema.complaintPage);

            violations.forEach((violation, offset) => {
                const index = start + offset;
                const page = collection.pages[index] as ComplaintPageModel;
                const section = page.getViolationSection();

                const updated = section
                    .set(section.municipalCode, lock(section.getMunicipalCode().setValue(violation.code)))
                    .set(section.offenseCode, lock(section.getOffenseCode().setValue(violation.statute ?? violation.code)))
                    .set(section.date, section.getDate().setValue(date))
                    .set(section.time, section.getTime().setValue(time))
                    .set(section.county, section.getCounty().setValue(county))
                    .set(section.location, section.getLocation().setValue(location));

                let result = page.set(page.violationSection, updated);

                // the citation has no box for the charge in words, so the description goes into the offense notes
                // beneath it, which is the only place on the paper it can be read
                const offense = result.getOffenseSection();
                let offenseUpdated = offense.set(offense.notes, lock(offense.getNotes().setValue(violation.description)));

                if (violation.fine !== undefined) {
                    offenseUpdated = offenseUpdated.set(offense.amountDue, lock(offenseUpdated.getAmountDue().setValue(violation.fine)));
                }

                collection = collection.replace(index, result.set(result.offenseSection, offenseUpdated));
            });

            return form.set(schema.complaintPage, collection);
        });
    }

    async getCountyOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(OKTrafficValueListId.county);
    }

    async getSexOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(OKTrafficValueListId.sex);
    }

    async getStateOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(ValueListId.state);
    }

    async getVehicleMakeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(ValueListId.vehicleMake);
    }

    async getVehicleModelOptions(makeCode: string): Promise<Array<IOptionValue>> {
        return this.getOptions(ValueListId.vehicleModel, makeCode);
    }

    async getYesNoOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(OKTrafficValueListId.yesNo);
    }

    async resolveVehicleDropzone(dropzone: Dropzone): Promise<Dropzone> {
        const fields = dropzone.getFields();
        const makeField = fields[VehicleDropzoneFields.make];
        const modelField = fields[VehicleDropzoneFields.model];

        // the dropzone carries the names the drop arrived with and no codes; a name the lists do not recognize is
        // cleared rather than carried onto the form, since a make the record cannot resolve is worse than one the
        // user picks themselves. The make is resolved first because a model's name only identifies a model
        // underneath a make - there are more models than there are distinct model names.
        const make = makeField && await this.valueListService.findByDescription(
            ValueListId.vehicleMake,
            (<IOptionValue>makeField.getValue()).description);

        const model = make && modelField && await this.valueListService.findByDescription(
            ValueListId.vehicleModel,
            (<IOptionValue>modelField.getValue()).description,
            make.value);

        return dropzone.setFields({
            ...fields,
            [VehicleDropzoneFields.make]: makeField?.setValue(make ?? { value: "", description: "" }),
            [VehicleDropzoneFields.model]: modelField?.setValue(model ?? { value: "", description: "" })
        });
    }

    /**
     * Copies the registry's options before handing them out, so the list a select ends up holding is not the one
     * the value list service is caching and cannot be mutated out from under the next form that asks for it.
     */
    private async getOptions(listId: string, parentValue?: string): Promise<Array<IOptionValue>> {
        return [...await this.valueListService.getOptions(listId, parentValue)];
    }
}

/** Returns the field disabled, which is how a box filled in from the violation list is marked as not hand-editable. */
function lock<TField extends FieldModel<TValueType>>(field: TField): TField {
    return field.setIsEnabled(false);
}
