import { Dropzone } from "@forms/core";
import { createService, Singleton } from "@shrub/core";

import { FrontPageModel } from "../models/front-page/front-page";

export const IS438CitationService = createService<IS438CitationService>("forms-s438-citation-service");

export interface IS438CitationService {
    /** Returns a new page with the dropped person data applied to the citation's owner section. */
    applyOwnerDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel;
    /** Returns a new page with the dropped vehicle data applied to the citation's vehicle section. */
    applyVehicleDropzone(page: FrontPageModel, dropzone: Dropzone): FrontPageModel;
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
