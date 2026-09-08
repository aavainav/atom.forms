import { Dropzone, IOptionValue, PersonDropzoneFields, VehicleDropzoneFields } from "@forms/core";
import { IValueListService, ValueListId } from "@forms/value-lists";
import { createService, Singleton } from "@shrub/core";

import { ComplaintPageModel } from "../models/complaint-page/complaint-page";
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
