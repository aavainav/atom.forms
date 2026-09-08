import { Dropzone, IOptionValue, VehicleDropzoneFields } from "@forms/core";
import { IValueListService, ValueListId } from "@forms/value-lists";
import { createService, Singleton } from "@shrub/core";

import { RecordPageModel } from "../models/record-page/record-page";
import { PublicContactOrWarningValueListId } from "../value-lists";

export const IPublicContactOrWarningService = createService<IPublicContactOrWarningService>("forms-public-contact-or-warning-service");

/**
 * Defines the service backing the public contact/warning record.
 *
 * Every value list the record's option fields draw on is reached through here rather than imported by the
 * component that renders it, so the components speak the record's language - counties, makes, models - while the
 * lists themselves come from the value list registry, where a host can serve any of them from somewhere else by
 * registering over its id.
 */
export interface IPublicContactOrWarningService {
    /** Returns a new page with the dropped person data applied to the record's person section. */
    applyPersonDropzone(page: RecordPageModel, dropzone: Dropzone): RecordPageModel;
    /** Returns a new page with the dropped vehicle data applied to the record's vehicle section. */
    applyVehicleDropzone(page: RecordPageModel, dropzone: Dropzone): RecordPageModel;
    /** Loads the options for the record's county fields, which the agency and stop sections share. */
    getCountyOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the record's gender field. */
    getGenderOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the record's race/ethnicity field. */
    getRaceOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the record's state fields, which the person and vehicle sections share. */
    getStateOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the record's vehicle make field. */
    getVehicleMakeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the models belonging to the given make code; a blank or unrecognized code has none. */
    getVehicleModelOptions(makeCode: string): Promise<Array<IOptionValue>>;
    /**
     * Returns the dropped vehicle with its make and model turned from the names they arrived as into the codes
     * the record stores, dropping either if the value lists do not recognize it. Await this before applying the
     * dropzone to the page, so a name with no code never reaches the form.
     */
    resolveVehicleDropzone(dropzone: Dropzone): Promise<Dropzone>;
}

@Singleton
export class PublicContactOrWarningService implements IPublicContactOrWarningService {
    constructor(@IValueListService private readonly valueListService: IValueListService) {
    }

    applyPersonDropzone(page: RecordPageModel, dropzone: Dropzone): RecordPageModel {
        const personSection = page.getPersonSection();
        const updatedSection = dropzone.applyTo(personSection, {
            first_name: personSection.firstName,
            middle_name: personSection.middleInitial,
            last_name: personSection.lastName
        });

        return page.set(page.personSection, updatedSection).setDropzone(dropzone);
    }

    applyVehicleDropzone(page: RecordPageModel, dropzone: Dropzone): RecordPageModel {
        const vehicleSection = page.getVehicleSection();
        const updatedSection = dropzone.applyTo(vehicleSection, {
            [VehicleDropzoneFields.make]: vehicleSection.make,
            [VehicleDropzoneFields.model]: vehicleSection.model,
            [VehicleDropzoneFields.year]: vehicleSection.year
        });

        return page.set(page.vehicleSection, updatedSection).setDropzone(dropzone);
    }

    async getCountyOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(PublicContactOrWarningValueListId.county);
    }

    async getGenderOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(PublicContactOrWarningValueListId.gender);
    }

    async getRaceOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(PublicContactOrWarningValueListId.raceEthnicity);
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

    async resolveVehicleDropzone(dropzone: Dropzone): Promise<Dropzone> {
        const fields = dropzone.getFields();
        const makeField = fields[VehicleDropzoneFields.make];
        const modelField = fields[VehicleDropzoneFields.model];

        // the dropzone carries the names the drop arrived with and no codes; a name the lists do not recognize
        // is cleared rather than carried onto the form, since a make the record cannot resolve is worse than
        // one the user picks themselves. The make is resolved first because a model's name only identifies a
        // model underneath a make - there are more models than there are distinct model names.
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
