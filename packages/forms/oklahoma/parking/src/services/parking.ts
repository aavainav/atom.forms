import { Dropzone, FieldModel, FormModel, FormModelConstructor, IControllerManager, IOptionValue, PageCollection, PersonDropzoneFields, TValueType, VehicleDropzoneFields, ViolationDropzoneFields } from "@forms/core";
import { IValueListService, ValueListId } from "@forms/value-lists";
import { IViolation } from "@forms/violations";
import { createService, Singleton } from "@shrub/core";

import { CitationPageModel } from "../models/citation-page/citation-page";
import { DetailPageModel } from "../models/detail-page/detail-page";
import type { OKParkingFormModel } from "../models/parking-form";
import type { OKParkingFormSchema } from "../models/parking-form-schema";
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
    /** Returns a new citation page with the dropped violation data applied to the violation boxes. */
    applyViolationDropzone(page: CitationPageModel, dropzone: Dropzone): CitationPageModel;
    /** Writes the chosen violations onto the form, one citation page each, and adds the pages the extra ones need. */
    applyViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<OKParkingFormModel>): Promise<void>;
    /** Narrows the given violations to those the citation pages already carry. */
    getAppliedViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<OKParkingFormModel>): ReadonlyArray<IViolation>;
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

    applyViolationDropzone(page: CitationPageModel, dropzone: Dropzone): CitationPageModel {
        const violationSection = page.getViolationSection();
        const updatedSection = dropzone.applyTo(violationSection, {
            [ViolationDropzoneFields.code]: violationSection.code,
            [ViolationDropzoneFields.description]: violationSection.description
        });

        // a dropped violation is on the citation exactly as a chosen one is, so its boxes lock the same way
        const locked = updatedSection
            .set(updatedSection.code, lock(updatedSection.getCode()))
            .set(updatedSection.description, lock(updatedSection.getDescription()));

        return page.set(page.violationSection, locked).setDropzone(dropzone);
    }

    getAppliedViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<OKParkingFormModel>): ReadonlyArray<IViolation> {
        const formSchema = FormModel.getSchema<OKParkingFormSchema>(formCtor);
        const pages = controllers.getFormController().form.get<PageCollection>(formSchema.citationPage).getPages<CitationPageModel>();

        // the citation prints the agency's own code in its violation block, so that is what identifies a charge
        const carried = new Set(pages.map(page => page.getViolationSection().getCode().getValue()).filter(Boolean));

        return violations.filter(violation => carried.has(violation.code));
    }

    async applyViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<OKParkingFormModel>): Promise<void> {
        if (!violations.length) {
            return;
        }

        const controller = controllers.getFormController();
        const formSchema = FormModel.getSchema<OKParkingFormSchema>(formCtor);

        const pages = controller.form.get<PageCollection>(formSchema.citationPage).getPages<CitationPageModel>();

        // the chosen violations go into the first page with no violation on it, and then onto pages after that, so
        // picking again adds to the citation rather than rewriting it
        const empty = pages.findIndex(page => page.getViolationSection().getCode().getIsEmpty() && page.getViolationSection().getDescription().getIsEmpty());
        const start = empty < 0 ? pages.length : empty;

        // initialize must be awaited, since it is what creates the page's sections and registers its dropzones
        for (let index = pages.length; index < start + violations.length; index++) {
            await controller.addPage(formSchema.citationPage);
        }

        // the date, time and location of the violation sit in the violation section alongside the code, so they are
        // not carried across by the shared-section copy; one ticket run produces one date, time and place however
        // many violations come out of it, so they are taken from the first page
        const first = controller.form.get<PageCollection>(formSchema.citationPage).pages[0] as CitationPageModel;
        const date = first.getViolationSection().getDate().getValue();
        const time = first.getViolationSection().getTime().getValue();
        const location = first.getViolationSection().getLocation().getValue();

        controller.update(form => {
            let collection = form.get<PageCollection>(formSchema.citationPage);

            violations.forEach((violation, offset) => {
                const index = start + offset;
                const page = collection.pages[index] as CitationPageModel;
                const section = page.getViolationSection();

                const updated = section
                    .set(section.code, lock(section.getCode().setValue(violation.code)))
                    .set(section.description, lock(section.getDescription().setValue(violation.description)))
                    .set(section.date, section.getDate().setValue(date))
                    .set(section.time, section.getTime().setValue(time))
                    .set(section.location, section.getLocation().setValue(location));

                let result = page.set(page.violationSection, updated);

                // the fine is printed in the payment block rather than beside the violation, so a violation
                // carrying one writes both sections; one that does not leaves the amount for the clerk
                if (violation.fine !== undefined) {
                    const payment = result.getPaymentSection();
                    result = result.set(result.paymentSection, payment.set(payment.amountDue, lock(payment.getAmountDue().setValue(violation.fine))));
                }

                collection = collection.replace(index, result);
            });

            return form.set(formSchema.citationPage, collection);
        });
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

/** Returns the field disabled, which is how a box filled in from the violation list is marked as not hand-editable. */
function lock<TField extends FieldModel<TValueType>>(field: TField): TField {
    return field.setIsEnabled(false);
}
