import { Dropzone, FieldModel, FormModel, FormModelConstructor, IControllerManager, IOptionValue, PageCollection, PersonDropzoneFields, TValueType, VehicleDropzoneFields, ViolationDropzoneFields } from "@forms/core";
import { IValueListService, ValueListId } from "@forms/value-lists";
import { IViolation } from "@forms/violations";
import { createService, Singleton } from "@shrub/core";

import { CitationPageModel } from "../models/citation-page/citation-page";
import type { GAUTCFormModel } from "../models/utc-form";
import type { GAUTCFormSchema } from "../models/utc-form-schema";
import { GAUTCValueListId } from "../value-lists";

export const IGAUTCService = createService<IGAUTCService>("forms-ga-utc-service");

/**
 * Backs the Georgia uniform traffic citation form. Every value list its option fields draw on is reached through
 * here rather than imported by the component that renders it, so components speak the form's language --
 * counties, states, makes, models -- while a host can serve any list from elsewhere by registering over its id.
 */
export interface IGAUTCService {
    /** Returns a new citation page with the dropped vehicle data applied to the vehicle boxes of Section I. */
    applyVehicleDropzone(page: CitationPageModel, dropzone: Dropzone): CitationPageModel;
    /** Returns a new citation page with the dropped violation data applied to the offense boxes of Section II. */
    applyViolationDropzone(page: CitationPageModel, dropzone: Dropzone): CitationPageModel;
    /** Writes the chosen violations onto the form, one citation page each, and adds the pages the extra ones need. */
    applyViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<GAUTCFormModel>): Promise<void>;
    /** Narrows the given violations to those the citation pages already carry. */
    getAppliedViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<GAUTCFormModel>): ReadonlyArray<IViolation>;
    /** Returns a new citation page with the dropped person data applied to Section I. */
    applyViolatorDropzone(page: CitationPageModel, dropzone: Dropzone): CitationPageModel;
    /** Loads the options for the citation's county box - the three counties the form prints beside it. */
    getCountyOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the violator's sex box. */
    getSexOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the citation's state boxes, which the violator, licence and registration boxes share. */
    getStateOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the vehicle make box. */
    getVehicleMakeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the models belonging to the given make code; a blank or unrecognized code has none. */
    getVehicleModelOptions(makeCode: string): Promise<Array<IOptionValue>>;
    /**
     * Returns the dropped vehicle with make/model turned from arrival names into stored codes, dropping either the
     * value lists don't recognize. Await this before applying the dropzone, so a name with no code never reaches
     * the citation.
     */
    resolveVehicleDropzone(dropzone: Dropzone): Promise<Dropzone>;
}

@Singleton
export class GAUTCService implements IGAUTCService {
    constructor(@IValueListService private readonly valueListService: IValueListService) {
    }

    applyVehicleDropzone(page: CitationPageModel, dropzone: Dropzone): CitationPageModel {
        const vehicleSection = page.getVehicleSection();
        const updatedSection = dropzone.applyTo(vehicleSection, {
            [VehicleDropzoneFields.make]: vehicleSection.make,
            [VehicleDropzoneFields.model]: vehicleSection.model,
            [VehicleDropzoneFields.year]: vehicleSection.year
        });

        return page.set(page.vehicleSection, updatedSection).setDropzone(dropzone);
    }

    applyViolatorDropzone(page: CitationPageModel, dropzone: Dropzone): CitationPageModel {
        const violatorSection = page.getViolatorSection();
        const updatedSection = dropzone.applyTo(violatorSection, {
            [PersonDropzoneFields.firstName]: violatorSection.firstName,
            [PersonDropzoneFields.middleName]: violatorSection.middleName,
            [PersonDropzoneFields.lastName]: violatorSection.lastName,
            [PersonDropzoneFields.address]: violatorSection.address,
            [PersonDropzoneFields.city]: violatorSection.city,
            [PersonDropzoneFields.zipCode]: violatorSection.zipCode
        });

        return page.set(page.violatorSection, updatedSection).setDropzone(dropzone);
    }

    applyViolationDropzone(page: CitationPageModel, dropzone: Dropzone): CitationPageModel {
        const offenseSection = page.getOffenseSection();
        const updatedSection = dropzone.applyTo(offenseSection, {
            [ViolationDropzoneFields.description]: offenseSection.description,
            [ViolationDropzoneFields.statute]: offenseSection.codeSection
        });

        // a dropped violation is on the citation exactly as a chosen one is, so its boxes lock the same way
        const locked = updatedSection
            .set(updatedSection.codeSection, lock(updatedSection.getCodeSection()))
            .set(updatedSection.description, lock(updatedSection.getDescription()));

        return page.set(page.offenseSection, locked).setDropzone(dropzone);
    }

    getAppliedViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<GAUTCFormModel>): ReadonlyArray<IViolation> {
        const formSchema = FormModel.getSchema<GAUTCFormSchema>(formCtor);
        const pages = controllers.getFormController().form.get<PageCollection>(formSchema.citationPage).getPages<CitationPageModel>();

        // the citation prints the statute as its offense code section, so that is what identifies a charge once it
        // is on the form; a violation with no statute of its own was written under its code
        const carried = new Set(pages.map(page => page.getOffenseSection().getCodeSection().getValue()).filter(Boolean));

        return violations.filter(violation => carried.has(violation.statute ?? violation.code));
    }

    async applyViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<GAUTCFormModel>): Promise<void> {
        if (!violations.length) {
            return;
        }

        const controller = controllers.getFormController();
        const formSchema = FormModel.getSchema<GAUTCFormSchema>(formCtor);

        const pages = controller.form.get<PageCollection>(formSchema.citationPage).getPages<CitationPageModel>();

        // the chosen violations go into the first page with no offence on it, and then onto pages after that, so
        // picking again adds to the citation rather than rewriting it
        const empty = pages.findIndex(page => page.getOffenseSection().getCodeSection().getIsEmpty() && page.getOffenseSection().getDescription().getIsEmpty());
        const start = empty < 0 ? pages.length : empty;

        // initialize must be awaited, since it is what creates the page's sections and registers its dropzones
        for (let index = pages.length; index < start + violations.length; index++) {
            await controller.addPage(formSchema.citationPage);
        }

        controller.update({ update: form => {
            let collection = form.get<PageCollection>(formSchema.citationPage);

            violations.forEach((violation, offset) => {
                const index = start + offset;
                const page = collection.pages[index] as CitationPageModel;
                const section = page.getOffenseSection();

                let updated = section
                    .set(section.codeSection, lock(section.getCodeSection().setValue(violation.statute ?? violation.code)))
                    .set(section.description, lock(section.getDescription().setValue(violation.description)));

                if (violation.isLocalOrdinance !== undefined) {
                    updated = updated.selectAuthority(violation.isLocalOrdinance ? updated.localOrdinance : updated.stateLaw);
                    updated = updated
                        .set(updated.stateLaw, lock(updated.getStateLaw()))
                        .set(updated.localOrdinance, lock(updated.getLocalOrdinance()));
                }

                collection = collection.replace(index, page.set(page.offenseSection, updated));
            });

            return form.set(formSchema.citationPage, collection);
        }, reason: { kind: "violation", codes: violations.map(violation => violation.statute ?? violation.code) } });
    }

    async getCountyOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(GAUTCValueListId.county);
    }

    async getSexOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(GAUTCValueListId.sex);
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

        // the dropzone carries the names the drop arrived with and no codes; a name the lists do not recognize is
        // cleared rather than carried onto the citation, since a make the record cannot resolve is worse than one
        // the user picks themselves. The make is resolved first because a model's name only identifies a model
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
     * Copies the registry's options before handing them out, so a select's list isn't the value list service's own
     * cached one, and can't be mutated out from under the next form that asks for it.
     */
    private async getOptions(listId: string, parentValue?: string): Promise<Array<IOptionValue>> {
        return [...await this.valueListService.getOptions(listId, parentValue)];
    }
}

/** Returns the field disabled, which is how a box filled in from the violation list is marked as not hand-editable. */
function lock<TField extends FieldModel<TValueType>>(field: TField): TField {
    return field.setIsEnabled(false);
}
