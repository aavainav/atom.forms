import { Dropzone, IOptionValue, PersonDropzoneFields, VehicleDropzoneFields } from "@forms/core";
import { IValueListService, ValueListId } from "@forms/value-lists";
import { createService, Singleton } from "@shrub/core";

import { CitationPageModel } from "../models/citation-page/citation-page";
import { DetailPageModel } from "../models/detail-page/detail-page";
import { OKParkingValueListId } from "../value-lists";

export const IOKParkingService = createService<IOKParkingService>("forms-ok-parking-service");

/**
 * Defines the service backing the Oklahoma City parking violation form.
 *
 * Every value list the form's option fields draw on is reached through here rather than imported by the component
 * that renders it, so the components speak the form's language - counties, states, makes - while the lists
 * themselves come from the value list registry, where a host can serve any of them from somewhere else by
 * registering over its id.
 */
export interface IOKParkingService {
    /** Returns a new detail page with the dropped person data applied to the registered owner section. */
    applyOwnerDropzone(page: DetailPageModel, dropzone: Dropzone): DetailPageModel;
    /** Returns a new citation page with the dropped vehicle data applied to the vehicle section. */
    applyVehicleDropzone(page: CitationPageModel, dropzone: Dropzone): CitationPageModel;
    /** Loads the options for the form's county field. */
    getCountyOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the registered owner's state field. */
    getStateOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the vehicle make field. */
    getVehicleMakeOptions(): Promise<Array<IOptionValue>>;
    /**
     * Returns the dropped vehicle with its make turned from the name it arrived as into the code the form stores,
     * dropping it if the value list does not recognize it. Await this before applying the dropzone to the page, so
     * a name with no code never reaches the form.
     */
    resolveVehicleDropzone(dropzone: Dropzone): Promise<Dropzone>;
}

@Singleton
export class OKParkingService implements IOKParkingService {
    constructor(@IValueListService private readonly valueListService: IValueListService) {
    }

    applyOwnerDropzone(page: DetailPageModel, dropzone: Dropzone): DetailPageModel {
        const ownerSection = page.getRegisteredOwnerSection();
        const updatedSection = dropzone.applyTo(ownerSection, {
            [PersonDropzoneFields.firstName]: ownerSection.firstName,
            [PersonDropzoneFields.middleName]: ownerSection.middleName,
            [PersonDropzoneFields.lastName]: ownerSection.lastName,
            [PersonDropzoneFields.address]: ownerSection.address,
            [PersonDropzoneFields.city]: ownerSection.city,
            [PersonDropzoneFields.zipCode]: ownerSection.zipCode
        });

        return page.set(page.registeredOwnerSection, updatedSection).setDropzone(dropzone);
    }

    applyVehicleDropzone(page: CitationPageModel, dropzone: Dropzone): CitationPageModel {
        const vehicleSection = page.getVehicleSection();
        const updatedSection = dropzone.applyTo(vehicleSection, {
            [VehicleDropzoneFields.make]: vehicleSection.make
        });

        return page.set(page.vehicleSection, updatedSection).setDropzone(dropzone);
    }

    async getCountyOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(OKParkingValueListId.county);
    }

    async getStateOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(ValueListId.state);
    }

    async getVehicleMakeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(ValueListId.vehicleMake);
    }

    async resolveVehicleDropzone(dropzone: Dropzone): Promise<Dropzone> {
        const fields = dropzone.getFields();
        const makeField = fields[VehicleDropzoneFields.make];

        // the dropzone carries the name the drop arrived with and no code; a name the list does not recognize is
        // cleared rather than carried onto the form, since a make the record cannot resolve is worse than one the
        // user picks themselves
        const make = makeField && await this.valueListService.findByDescription(
            ValueListId.vehicleMake,
            (<IOptionValue>makeField.getValue()).description);

        return dropzone.setFields({
            ...fields,
            [VehicleDropzoneFields.make]: makeField?.setValue(make ?? { value: "", description: "" })
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
