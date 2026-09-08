import { Dropzone, FormModel, IControllerManager, PageCollection } from "@forms/core";
import { IViolation } from "@forms/violations";
import { createService, Singleton } from "@shrub/core";

import { FrontPageModel } from "../models/front-page/front-page";
import { S438FormSchema } from "../models/s438-form-schema";

export const IS438CitationService = createService<IS438CitationService>("forms-s438-citation-service");

export interface IS438CitationService {
    /** Returns a new page with the dropped person data applied to the citation's owner section. */
    applyOwnerDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel;
    /** Returns a new page with the dropped vehicle data applied to the citation's vehicle section. */
    applyVehicleDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel;
    /** Returns a new page with the dropped violation data applied to the citation's violation section. */
    applyViolationDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel;
    /** Writes the chosen violations onto the form, one front page each, and adds the pages the extra ones need. */
    applyViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>): Promise<void>;
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

        return page.set(page.violationSection, updatedSection).setDropzone(dropzone);
    }

    async applyViolations(controllers: IControllerManager, violations: ReadonlyArray<IViolation>): Promise<void> {
        if (!violations.length) {
            return;
        }

        const controller = controllers.getFormController();
        const schema = FormModel.getSchema<S438FormSchema>(S438FormSchema);

        const pages = controller.form.get<PageCollection>(schema.frontPage).getPages<FrontPageModel>();

        // the chosen violations go into the first page with no charge on it, and then onto pages after that.
        // picking again therefore adds to the citation rather than rewriting it, while the first pick still fills
        // the page the form opened with instead of leaving it blank and starting a second one.
        const empty = pages.findIndex(page => isChargeEmpty(page));
        const start = empty < 0 ? pages.length : empty;

        // the pages are added before anything is written, and each one is awaited: initialize is what creates a
        // page's sections, and writing into a page that has none would throw. addPage copies the shared sections
        // across as it goes, so the violator, vehicle and officer details are already on the new page.
        for (let index = pages.length; index < start + violations.length; index++) {
            await controller.addPage(schema.frontPage);
        }

        // the date and time of the violation sit in the violation section alongside the charge, so they are not
        // carried across by the shared-section copy; one stop produces one date and time however many charges come
        // out of it, so they are taken from the first page rather than left for the officer to key in per page
        const first = controller.form.get<PageCollection>(schema.frontPage).pages[0] as FrontPageModel;
        const date = first.getViolationSection().getDateOfViolation().getValue();
        const time = first.getViolationSection().getTimeOfViolation().getValue();

        controller.update(form => {
            let collection = form.get<PageCollection>(schema.frontPage);

            violations.forEach((violation, offset) => {
                const index = start + offset;
                const page = collection.pages[index] as FrontPageModel;
                const section = page.getViolationSection();

                const updated = section
                    .set(section.sectionNumber, section.getSectionNumber().setValue(violation.statute ?? violation.code))
                    .set(section.description, section.getDescription().setValue(violation.description))
                    .set(section.scPoints, section.getScPoints().setValue(violation.points ?? 0))
                    .set(section.courtAppearanceRequiredYes, section.getCourtAppearanceRequiredYes().setValue(violation.requiresCourtAppearance === true))
                    .set(section.courtAppearanceRequiredNo, section.getCourtAppearanceRequiredNo().setValue(violation.requiresCourtAppearance === false))
                    .set(section.dateOfViolation, section.getDateOfViolation().setValue(date))
                    .set(section.timeOfViolation, section.getTimeOfViolation().setValue(time));

                collection = collection.replace(index, page.set(page.violationSection, updated));
            });

            return form.set(schema.frontPage, collection);
        });
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

/**
 * Whether the page carries no charge yet.
 *
 * The section number and the description are what identify the charge; the date and time are stamped onto a new
 * citation by the form itself, so a page holding only those is still a page nobody has written a violation on.
 */
function isChargeEmpty(page: FrontPageModel): boolean {
    const section = page.getViolationSection();

    return section.getSectionNumber().getIsEmpty() && section.getDescription().getIsEmpty();
}
