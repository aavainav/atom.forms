import { FormMapper, FormValues } from "@forms/core";

import { ArrestingOfficerSectionModel } from "../models/front-page/arresting-officer-section";
import { CourtSectionModel } from "../models/front-page/court-section";
import { FooterSectionModel } from "../models/front-page/footer-section";
import { FrontPageModel } from "../models/front-page/front-page";
import { OwnerSectionModel } from "../models/front-page/owner-section";
import { S438FormModel } from "../models/s438-form";
import { VehicleSectionModel } from "../models/front-page/vehicle-section";
import { ViolationLocationSectionModel } from "../models/front-page/violation-location-section";
import { ViolationSectionModel } from "../models/front-page/violation-section";
import { ViolatorSectionModel } from "../models/front-page/violator-section";
import { IS438Data } from "./s438-data";

/**
 * Maps the SC S438 citation form to and from the data contract it publishes.
 *
 * Each section's read sits directly above its write below, so a field added to one direction and forgotten in
 * the other shows up in the same diff. Keeping the two directions in step is what makes the round trip hold.
 * The header section carries no fields of its own and so appears in neither direction.
 */
export class S438Mapper extends FormMapper<S438FormModel, IS438Data> {
    /** Returns the form's current values as its data contract, emitting only the fields this form owns. */
    public extract(form: S438FormModel): IS438Data {
        const page = form.getFrontPageCollection().getFirstPage<FrontPageModel>();
        const data: FormValues<IS438Data> = {};

        this.extractViolator(page.getViolatorSection(), data);
        this.extractVehicle(page.getVehicleSection(), data);
        this.extractOwner(page.getOwnerSection(), data);
        this.extractCourt(page.getCourtSection(), data);
        this.extractViolation(page.getViolationSection(), data);
        this.extractViolationLocation(page.getViolationLocationSection(), data);
        this.extractArrestingOfficer(page.getArrestingOfficerSection(), data);
        this.extractFooter(page.getFooterSection(), data);

        return data;
    }

    /**
     * Returns a new form with the given data applied to its front page. Every field of the form is reachable
     * from the data contract, and a field the data does not mention keeps the value it already holds - which is
     * how the date of violation and ticket number the form stamps on itself survive a partial record.
     */
    public populate(form: S438FormModel, data: IS438Data): S438FormModel {
        const collection = form.getFrontPageCollection();
        const page = collection.getFirstPage<FrontPageModel>();

        let updated = page.set(page.violatorSection, this.populateViolator(page.getViolatorSection(), data));
        updated = updated.set(updated.vehicleSection, this.populateVehicle(updated.getVehicleSection(), data));
        updated = updated.set(updated.ownerSection, this.populateOwner(updated.getOwnerSection(), data));
        updated = updated.set(updated.courtSection, this.populateCourt(updated.getCourtSection(), data));
        updated = updated.set(updated.violationSection, this.populateViolation(updated.getViolationSection(), data));
        updated = updated.set(updated.violationLocationSection, this.populateViolationLocation(updated.getViolationLocationSection(), data));
        updated = updated.set(updated.arrestingOfficerSection, this.populateArrestingOfficer(updated.getArrestingOfficerSection(), data));
        updated = updated.set(updated.footerSection, this.populateFooter(updated.getFooterSection(), data));

        return form.set(form.frontPage, collection.replace(0, updated));
    }

    private extractViolator(section: ViolatorSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "violatorCity", section.getCity());
        this.read(data, "violatorCommercialDriverLicenseNo", section.getCommercialDriverLicenseNo());
        this.read(data, "violatorCommercialDriverLicenseYes", section.getCommercialDriverLicenseYes());
        this.read(data, "violatorDateOfBirth", section.getDateOfBirth());
        this.read(data, "violatorDriverLicenseClass", section.getDriverLicenseClass());
        this.read(data, "violatorDriverLicenseNumber", section.getDriverLicenseNumber());
        this.read(data, "violatorDriverLicenseState", section.getDriverLicenseState());
        this.read(data, "violatorEyeColor", section.getEyeColor());
        this.read(data, "violatorFirstName", section.getFirstName());
        this.read(data, "violatorHairColor", section.getHairColor());
        this.read(data, "violatorHeight", section.getHeight());
        this.read(data, "violatorLastName", section.getLastName());
        this.read(data, "violatorMiddleName", section.getMiddleName());
        this.read(data, "violatorRace", section.getRace());
        this.read(data, "violatorSex", section.getSex());
        this.read(data, "violatorState", section.getState());
        this.read(data, "violatorStreetAddress", section.getStreetAddress());
        this.read(data, "violatorWeight", section.getWeight());
        this.read(data, "violatorZipCode", section.getZipCode());
    }

    private populateViolator(section: ViolatorSectionModel, data: IS438Data): ViolatorSectionModel {
        let updated = this.write(section, section.city, data.violatorCity);
        updated = this.write(updated, section.commercialDriverLicenseNo, data.violatorCommercialDriverLicenseNo);
        updated = this.write(updated, section.commercialDriverLicenseYes, data.violatorCommercialDriverLicenseYes);
        updated = this.write(updated, section.dateOfBirth, data.violatorDateOfBirth);
        updated = this.write(updated, section.driverLicenseClass, data.violatorDriverLicenseClass);
        updated = this.write(updated, section.driverLicenseNumber, data.violatorDriverLicenseNumber);
        updated = this.write(updated, section.driverLicenseState, data.violatorDriverLicenseState);
        updated = this.write(updated, section.eyeColor, data.violatorEyeColor);
        updated = this.write(updated, section.firstName, data.violatorFirstName);
        updated = this.write(updated, section.hairColor, data.violatorHairColor);
        updated = this.write(updated, section.height, data.violatorHeight);
        updated = this.write(updated, section.lastName, data.violatorLastName);
        updated = this.write(updated, section.middleName, data.violatorMiddleName);
        updated = this.write(updated, section.race, data.violatorRace);
        updated = this.write(updated, section.sex, data.violatorSex);
        updated = this.write(updated, section.state, data.violatorState);
        updated = this.write(updated, section.streetAddress, data.violatorStreetAddress);
        updated = this.write(updated, section.weight, data.violatorWeight);

        return this.write(updated, section.zipCode, data.violatorZipCode);
    }

    private extractVehicle(section: VehicleSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "vehicleAuto", section.getAuto());
        this.read(data, "vehicleBicycle", section.getBicycle());
        this.read(data, "vehicleCombination", section.getCombination());
        this.read(data, "vehicleCommercialVehicle", section.getCommercial());
        this.read(data, "vehicleHazardousMaterials", section.getHazardousMaterials());
        this.read(data, "vehicleLicenseNumber", section.getLicenseNumber());
        this.read(data, "vehicleLicenseState", section.getLicenseState());
        this.read(data, "vehicleMake", section.getMake());
        this.read(data, "vehicleMoped", section.getMoped());
        this.read(data, "vehicleMotorcycle", section.getMotorcycle());
        this.read(data, "vehicleOther", section.getOther());
        this.read(data, "vehiclePedestrian", section.getPedestrian());
        this.read(data, "vehicleYear", section.getYear());
    }

    private populateVehicle(section: VehicleSectionModel, data: IS438Data): VehicleSectionModel {
        let updated = this.write(section, section.auto, data.vehicleAuto);
        updated = this.write(updated, section.bicycle, data.vehicleBicycle);
        updated = this.write(updated, section.combination, data.vehicleCombination);
        updated = this.write(updated, section.commercial, data.vehicleCommercialVehicle);
        updated = this.write(updated, section.hazardousMaterials, data.vehicleHazardousMaterials);
        updated = this.write(updated, section.licenseNumber, data.vehicleLicenseNumber);
        updated = this.write(updated, section.licenseState, data.vehicleLicenseState);
        updated = this.write(updated, section.make, data.vehicleMake);
        updated = this.write(updated, section.moped, data.vehicleMoped);
        updated = this.write(updated, section.motorcycle, data.vehicleMotorcycle);
        updated = this.write(updated, section.other, data.vehicleOther);
        updated = this.write(updated, section.pedestrian, data.vehiclePedestrian);

        return this.write(updated, section.year, data.vehicleYear);
    }

    private extractOwner(section: OwnerSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "ownerCity", section.getCity());
        this.read(data, "ownerFirstName", section.getFirstName());
        this.read(data, "ownerLastName", section.getLastName());
        this.read(data, "ownerMiddleName", section.getMiddleName());
        this.read(data, "ownerState", section.getState());
        this.read(data, "ownerStreetAddress", section.getStreetAddress());
        this.read(data, "ownerZipCode", section.getZipCode());
    }

    private populateOwner(section: OwnerSectionModel, data: IS438Data): OwnerSectionModel {
        let updated = this.write(section, section.city, data.ownerCity);
        updated = this.write(updated, section.firstName, data.ownerFirstName);
        updated = this.write(updated, section.lastName, data.ownerLastName);
        updated = this.write(updated, section.middleName, data.ownerMiddleName);
        updated = this.write(updated, section.state, data.ownerState);
        updated = this.write(updated, section.streetAddress, data.ownerStreetAddress);

        return this.write(updated, section.zipCode, data.ownerZipCode);
    }

    private extractCourt(section: CourtSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "courtCity", section.getCity());
        this.read(data, "courtDateOfTrial", section.getDateOfTrial());
        this.read(data, "courtName", section.getCourtName());
        this.read(data, "courtState", section.getState());
        this.read(data, "courtStreetAddress", section.getStreetAddress());
        this.read(data, "courtTimeOfTrial", section.getTimeOfTrial());
        this.read(data, "courtZipCode", section.getZipCode());
    }

    private populateCourt(section: CourtSectionModel, data: IS438Data): CourtSectionModel {
        let updated = this.write(section, section.city, data.courtCity);
        updated = this.write(updated, section.dateOfTrial, data.courtDateOfTrial);
        updated = this.write(updated, section.courtName, data.courtName);
        updated = this.write(updated, section.state, data.courtState);
        updated = this.write(updated, section.streetAddress, data.courtStreetAddress);
        updated = this.write(updated, section.timeOfTrial, data.courtTimeOfTrial);

        return this.write(updated, section.zipCode, data.courtZipCode);
    }

    private extractViolation(section: ViolationSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "violationBloodAlcoholLevel", section.getBloodAlcoholLevel());
        this.read(data, "violationCourtAppearanceRequiredNo", section.getCourtAppearanceRequiredNo());
        this.read(data, "violationCourtAppearanceRequiredYes", section.getCourtAppearanceRequiredYes());
        this.read(data, "violationDateOfViolation", section.getDateOfViolation());
        this.read(data, "violationDescription", section.getDescription());
        this.read(data, "violationScPoints", section.getScPoints());
        this.read(data, "violationSectionNumber", section.getSectionNumber());
        this.read(data, "violationTimeOfViolation", section.getTimeOfViolation());
    }

    /**
     * The court appearance yes/no pair is written independently rather than as one answer, so data answering
     * neither stays unanswered rather than being pushed into a "no".
     */
    private populateViolation(section: ViolationSectionModel, data: IS438Data): ViolationSectionModel {
        let updated = this.write(section, section.bloodAlcoholLevel, data.violationBloodAlcoholLevel);
        updated = this.write(updated, section.courtAppearanceRequiredNo, data.violationCourtAppearanceRequiredNo);
        updated = this.write(updated, section.courtAppearanceRequiredYes, data.violationCourtAppearanceRequiredYes);
        updated = this.write(updated, section.dateOfViolation, data.violationDateOfViolation);
        updated = this.write(updated, section.description, data.violationDescription);
        updated = this.write(updated, section.scPoints, data.violationScPoints);
        updated = this.write(updated, section.sectionNumber, data.violationSectionNumber);

        return this.write(updated, section.timeOfViolation, data.violationTimeOfViolation);
    }

    private extractViolationLocation(section: ViolationLocationSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "violationLocation", section.getLocation());
        this.read(data, "violationLocationCity", section.getCity());
        this.read(data, "violationLocationCounty", section.getCounty());
        this.read(data, "violationLocationLatitude", section.getLatitude());
        this.read(data, "violationLocationLongitude", section.getLongitude());
    }

    private populateViolationLocation(section: ViolationLocationSectionModel, data: IS438Data): ViolationLocationSectionModel {
        let updated = this.write(section, section.violationLocation, data.violationLocation);
        updated = this.write(updated, section.violationLocationCity, data.violationLocationCity);
        updated = this.write(updated, section.violationLocationCounty, data.violationLocationCounty);
        updated = this.write(updated, section.violationLocationLatitude, data.violationLocationLatitude);

        return this.write(updated, section.violationLocationLongitude, data.violationLocationLongitude);
    }

    private extractArrestingOfficer(section: ArrestingOfficerSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "arrestingOfficerBailDeposited", section.getBailDeposited());
        this.read(data, "arrestingOfficerBondAmountRequested", section.getBondAmountRequested());
        this.read(data, "arrestingOfficerDateOfArrest", section.getDateOfArrest());
        this.read(data, "arrestingOfficerName", section.getOfficerName());
        this.read(data, "arrestingOfficerRank", section.getOfficerRank());
        this.read(data, "arrestingOfficerSccjaOfficerNumber", section.getSccjaOfficerNumber());
    }

    private populateArrestingOfficer(section: ArrestingOfficerSectionModel, data: IS438Data): ArrestingOfficerSectionModel {
        let updated = this.write(section, section.bailDeposited, data.arrestingOfficerBailDeposited);
        updated = this.write(updated, section.bondAmountRequested, data.arrestingOfficerBondAmountRequested);
        updated = this.write(updated, section.dateOfArrest, data.arrestingOfficerDateOfArrest);
        updated = this.write(updated, section.officerName, data.arrestingOfficerName);
        updated = this.write(updated, section.officerRank, data.arrestingOfficerRank);

        return this.write(updated, section.sccjaOfficerNumber, data.arrestingOfficerSccjaOfficerNumber);
    }

    private extractFooter(section: FooterSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "footerTicketNumber", section.getTicketNumber());
    }

    private populateFooter(section: FooterSectionModel, data: IS438Data): FooterSectionModel {
        return this.write(section, section.ticketNumber, data.footerTicketNumber);
    }
}
