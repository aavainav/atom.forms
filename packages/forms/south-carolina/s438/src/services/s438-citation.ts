import { Dropzone, FieldModel, FormModel, FormModelConstructor, IControllerManager, PageCollection, TValueType } from "@forms/core";
import { IViolation } from "@forms/violations";
import { createService, Singleton } from "@shrub/core";

import { FrontPageModel } from "../models/front-page/front-page";
import type { S438FormModel } from "../models/s438-form";
import type { S438FormSchema } from "../models/s438-form-schema";

export const IS438CitationService = createService<IS438CitationService>("forms-s438-citation-service");

export interface IS438CitationService {
    /** Returns a new page with the dropped person data applied to the citation's owner section. */
    applyOwnerDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel;
    /** Returns a new page with the dropped vehicle data applied to the citation's vehicle section. */
    applyVehicleDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel;
    /** Returns a new page with the dropped violation data applied to the citation's violation section. */
    applyViolationDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel;
    /** Writes the chosen violations onto the form, one front page each, and adds the pages the extra ones need. */
    applyViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<S438FormModel>): Promise<void>;
    /** Narrows the given violations to those the citation's front pages already carry. */
    getAppliedViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<S438FormModel>): ReadonlyArray<IViolation>;
    /** Returns a new page with the dropped person data applied to the citation's violator section. */
    applyViolatorDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel;
}


@Singleton
export class S438CitationService implements IS438CitationService {
    applyOwnerDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel {
        const ownerSection = page.getOwnerSection();
        const updatedSection = dropzone.applyTo(ownerSection, {
            first_name: ownerSection.firstName,
            middle_name: ownerSection.middleName,
            last_name: ownerSection.lastName,
            address: ownerSection.streetAddress,
            city: ownerSection.city,
            state: ownerSection.state,
            zip_code: ownerSection.zipCode
        });

        return page.set(page.ownerSection, updatedSection).setDropzone(dropzone);
    }

    applyVehicleDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel {
        const vehicleSection = page.getVehicleSection();
        const updatedSection = dropzone.applyTo(vehicleSection, {
            make: vehicleSection.make,
            year: vehicleSection.year
        });

        return page.set(page.vehicleSection, updatedSection).setDropzone(dropzone);
    }

    applyViolationDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel {
        const violationSection = page.getViolationSection();
        const updatedSection = dropzone.applyTo(violationSection, {
            description: violationSection.description,
            statute: violationSection.sectionNumber,
            points: violationSection.scPoints
        });

        // a dropped violation is on the citation exactly as a chosen one is, so its boxes lock the same way
        const locked = updatedSection
            .set(updatedSection.sectionNumber, lock(updatedSection.getSectionNumber()))
            .set(updatedSection.description, lock(updatedSection.getDescription()))
            .set(updatedSection.scPoints, lock(updatedSection.getScPoints()));

        return page.set(page.violationSection, locked).setDropzone(dropzone);
    }

    async applyViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<S438FormModel>): Promise<void> {
        if (!violations.length) {
            return;
        }

        const controller = controllers.getFormController();
        const formSchema = FormModel.getSchema<S438FormSchema>(formCtor);

        const pages = controller.form.get<PageCollection>(formSchema.frontPage).getPages<FrontPageModel>();

        // the chosen violations go into the first page with no charge on it, and then onto pages after that.
        // picking again therefore adds to the citation rather than rewriting it, while the first pick still fills
        // the page the form opened with instead of leaving it blank and starting a second one.
        const empty = pages.findIndex(page => isChargeEmpty(page));
        const start = empty < 0 ? pages.length : empty;

        // the pages are added before anything is written, and each one is awaited: initialize is what creates a
        // page's sections, and writing into a page that has none would throw. addPage copies the shared sections
        // across as it goes, so the violator, vehicle and officer details are already on the new page.
        for (let index = pages.length; index < start + violations.length; index++) {
            await controller.addPage(formSchema.frontPage);
        }

        // the date and time of the violation sit in the violation section alongside the charge, so they are not
        // carried across by the shared-section copy; one stop produces one date and time however many charges come
        // out of it, so they are taken from the first page rather than left for the officer to key in per page
        const first = controller.form.get<PageCollection>(formSchema.frontPage).pages[0] as FrontPageModel;
        const date = first.getViolationSection().getDateOfViolation().getValue();
        const time = first.getViolationSection().getTimeOfViolation().getValue();

        controller.update({ update: form => {
            let collection = form.get<PageCollection>(formSchema.frontPage);

            violations.forEach((violation, offset) => {
                const index = start + offset;
                const page = collection.pages[index] as FrontPageModel;
                const section = page.getViolationSection();

                // the boxes the violation fills are disabled with it: the charge came from the code list and is
                // taken off by deleting its page, not by typing over it. the date and time are not part of the
                // charge and stay as they were.
                const updated = section
                    .set(section.sectionNumber, lock(section.getSectionNumber().setValue(violation.statute ?? violation.code)))
                    .set(section.description, lock(section.getDescription().setValue(violation.description)))
                    .set(section.scPoints, lock(section.getScPoints().setValue(violation.points ?? 0)))
                    .set(section.courtAppearanceRequiredYes, lock(section.getCourtAppearanceRequiredYes().setValue(violation.requiresCourtAppearance === true)))
                    .set(section.courtAppearanceRequiredNo, lock(section.getCourtAppearanceRequiredNo().setValue(violation.requiresCourtAppearance === false)))
                    .set(section.dateOfViolation, section.getDateOfViolation().setValue(date))
                    .set(section.timeOfViolation, section.getTimeOfViolation().setValue(time));

                collection = collection.replace(index, page.set(page.violationSection, updated));
            });

            return form.set(formSchema.frontPage, collection);
        }, reason: { kind: "violations-added", codes: violations.map(violation => violation.statute ?? violation.code) } });
    }

    getAppliedViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>, formCtor: FormModelConstructor<S438FormModel>): ReadonlyArray<IViolation> {
        const formSchema = FormModel.getSchema<S438FormSchema>(formCtor);
        const pages = controllers.getFormController().form.get<PageCollection>(formSchema.frontPage).getPages<FrontPageModel>();

        // the citation prints the statute as its violation section number, so that is what identifies a charge
        // once it is on the form; a violation with no statute of its own was written under its code
        const carried = new Set(pages.map(page => page.getViolationSection().getSectionNumber().getValue()).filter(Boolean));

        return violations.filter(violation => carried.has(violation.statute ?? violation.code));
    }

    applyViolatorDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel {
        const violatorSection = page.getViolatorSection();
        const updatedSection = dropzone.applyTo(violatorSection, {
            first_name: violatorSection.firstName,
            middle_name: violatorSection.middleName,
            last_name: violatorSection.lastName,
            address: violatorSection.streetAddress,
            city: violatorSection.city,
            state: violatorSection.state,
            zip_code: violatorSection.zipCode
        });

        return page.set(page.violatorSection, updatedSection).setDropzone(dropzone);
    }
}

/** Returns the field disabled, which is how a box filled in from the violation list is marked as not hand-editable. */
function lock<TField extends FieldModel<TValueType>>(field: TField): TField {
    return field.setIsEnabled(false);
}

/** Whether the page carries no charge yet. Section number and description identify the charge; date and time are stamped by the form itself, so a page holding only those is still unwritten. */
function isChargeEmpty(page: FrontPageModel): boolean {
    const section = page.getViolationSection();

    return section.getSectionNumber().getIsEmpty() && section.getDescription().getIsEmpty();
}
