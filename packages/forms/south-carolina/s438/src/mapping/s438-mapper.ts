import { IPopulateData, FormMapper, FormValues, ReadOnlyFields } from "@forms/core";

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
import { IS438Data, IS438ViolationData } from "./s438-data";

/**
 * Maps the SC S438 citation form to and from the data contract it publishes.
 *
 * Each section's read sits directly above its write below, so a field added to one direction and forgotten in
 * the other shows up in the same diff. Keeping the two directions in step is what makes the round trip hold.
 * The header section carries no fields of its own and so appears in neither direction.
 */
export class S438Mapper extends FormMapper<S438FormModel, IS438Data> {
    /**
     * Returns the form's current values as its data contract, emitting only the fields this form owns.
     *
     * The shared sections are read from the first page alone: every front page holds the same values there, so
     * reading them per page would be reading the same answer several times over.
     */
    public extract(form: S438FormModel): IS438Data {
        const pages = form.getFrontPageCollection().getPages<FrontPageModel>();
        const page = pages[0];
        const data: FormValues<IS438Data> = {};

        this.extractViolator(page.getViolatorSection(), data);
        this.extractVehicle(page.getVehicleSection(), data);
        this.extractOwner(page.getOwnerSection(), data);
        this.extractCourt(page.getCourtSection(), data);
        this.extractViolation(page.getViolationSection(), data);
        this.extractViolationLocation(page.getViolationLocationSection(), data);
        this.extractArrestingOfficer(page.getArrestingOfficerSection(), data);
        this.extractFooter(page.getFooterSection(), data);

        if (pages.length > 1) {
            data.additionalViolations = pages.slice(1).map(additional => this.extractAdditionalViolation(additional.getViolationSection()));
        }

        return data;
    }

    /**
     * Returns a new form with the given data applied to its front pages, creating a page per further violation.
     *
     * This is asynchronous because creating a page means awaiting its `initialize`, which is what gives the page
     * its sections. Pages beyond the end of `additionalViolations` are left alone rather than removed, so a record
     * naming fewer violations than the form holds never silently discards a page an officer added.
     *
     * Every field of the form is reachable from the data contract, and a field the data does not mention keeps the
     * value it already holds - which is how the date of violation and ticket number the form stamps on itself
     * survive a partial record.
     */
    public async populate(form: S438FormModel, { data, readOnlyFields }: IPopulateData<IS438Data>): Promise<S438FormModel> {
        const additional = data.additionalViolations ?? [];

        let updated = form;

        // initialize must be awaited, since it is what creates the page's sections and registers its dropzones
        while (updated.getFrontPageCollection().pages.length < additional.length + 1) {
            updated = updated.addPage(await updated.frontPage.createPage(updated).initialize(), updated.frontPage);
        }

        let collection = updated.getFrontPageCollection();

        collection.getPages<FrontPageModel>().forEach((page, index) => {
            // the shared sections are written onto every page rather than only the first: a page created here does
            // not go through the form controller, which is what would otherwise have copied them across
            let result = page.set(page.violatorSection, this.populateViolator(page.getViolatorSection(), data, readOnlyFields));
            result = result.set(result.vehicleSection, this.populateVehicle(result.getVehicleSection(), data, readOnlyFields));
            result = result.set(result.ownerSection, this.populateOwner(result.getOwnerSection(), data, readOnlyFields));
            result = result.set(result.courtSection, this.populateCourt(result.getCourtSection(), data, readOnlyFields));
            result = result.set(result.violationLocationSection, this.populateViolationLocation(result.getViolationLocationSection(), data, readOnlyFields));
            result = result.set(result.arrestingOfficerSection, this.populateArrestingOfficer(result.getArrestingOfficerSection(), data, readOnlyFields));
            result = result.set(result.footerSection, this.populateFooter(result.getFooterSection(), data, readOnlyFields));

            // the violation is the one section that differs page to page; the first comes from the flat fields and
            // the rest from the array, and a page the data does not reach keeps what it holds
            const violation = index === 0 ? data : additional[index - 1];
            if (violation) {
                result = result.set(result.violationSection, this.populateViolation(result.getViolationSection(), violation));
            }

            collection = collection.replace(index, result);
        });

        return updated.set(updated.frontPage, collection);
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

    private populateViolator(section: ViolatorSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): ViolatorSectionModel {
        let updated = this.write(section, section.city, data, "violatorCity", readOnlyFields);
        updated = this.write(updated, section.commercialDriverLicenseNo, data, "violatorCommercialDriverLicenseNo", readOnlyFields);
        updated = this.write(updated, section.commercialDriverLicenseYes, data, "violatorCommercialDriverLicenseYes", readOnlyFields);
        updated = this.write(updated, section.dateOfBirth, data, "violatorDateOfBirth", readOnlyFields);
        updated = this.write(updated, section.driverLicenseClass, data, "violatorDriverLicenseClass", readOnlyFields);
        updated = this.write(updated, section.driverLicenseNumber, data, "violatorDriverLicenseNumber", readOnlyFields);
        updated = this.write(updated, section.driverLicenseState, data, "violatorDriverLicenseState", readOnlyFields);
        updated = this.write(updated, section.eyeColor, data, "violatorEyeColor", readOnlyFields);
        updated = this.write(updated, section.firstName, data, "violatorFirstName", readOnlyFields);
        updated = this.write(updated, section.hairColor, data, "violatorHairColor", readOnlyFields);
        updated = this.write(updated, section.height, data, "violatorHeight", readOnlyFields);
        updated = this.write(updated, section.lastName, data, "violatorLastName", readOnlyFields);
        updated = this.write(updated, section.middleName, data, "violatorMiddleName", readOnlyFields);
        updated = this.write(updated, section.race, data, "violatorRace", readOnlyFields);
        updated = this.write(updated, section.sex, data, "violatorSex", readOnlyFields);
        updated = this.write(updated, section.state, data, "violatorState", readOnlyFields);
        updated = this.write(updated, section.streetAddress, data, "violatorStreetAddress", readOnlyFields);
        updated = this.write(updated, section.weight, data, "violatorWeight", readOnlyFields);

        return this.write(updated, section.zipCode, data, "violatorZipCode", readOnlyFields);
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

    private populateVehicle(section: VehicleSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): VehicleSectionModel {
        let updated = this.write(section, section.auto, data, "vehicleAuto", readOnlyFields);
        updated = this.write(updated, section.bicycle, data, "vehicleBicycle", readOnlyFields);
        updated = this.write(updated, section.combination, data, "vehicleCombination", readOnlyFields);
        updated = this.write(updated, section.commercial, data, "vehicleCommercialVehicle", readOnlyFields);
        updated = this.write(updated, section.hazardousMaterials, data, "vehicleHazardousMaterials", readOnlyFields);
        updated = this.write(updated, section.licenseNumber, data, "vehicleLicenseNumber", readOnlyFields);
        updated = this.write(updated, section.licenseState, data, "vehicleLicenseState", readOnlyFields);
        updated = this.write(updated, section.make, data, "vehicleMake", readOnlyFields);
        updated = this.write(updated, section.moped, data, "vehicleMoped", readOnlyFields);
        updated = this.write(updated, section.motorcycle, data, "vehicleMotorcycle", readOnlyFields);
        updated = this.write(updated, section.other, data, "vehicleOther", readOnlyFields);
        updated = this.write(updated, section.pedestrian, data, "vehiclePedestrian", readOnlyFields);

        return this.write(updated, section.year, data, "vehicleYear", readOnlyFields);
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

    private populateOwner(section: OwnerSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): OwnerSectionModel {
        let updated = this.write(section, section.city, data, "ownerCity", readOnlyFields);
        updated = this.write(updated, section.firstName, data, "ownerFirstName", readOnlyFields);
        updated = this.write(updated, section.lastName, data, "ownerLastName", readOnlyFields);
        updated = this.write(updated, section.middleName, data, "ownerMiddleName", readOnlyFields);
        updated = this.write(updated, section.state, data, "ownerState", readOnlyFields);
        updated = this.write(updated, section.streetAddress, data, "ownerStreetAddress", readOnlyFields);

        return this.write(updated, section.zipCode, data, "ownerZipCode", readOnlyFields);
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

    private populateCourt(section: CourtSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): CourtSectionModel {
        let updated = this.write(section, section.city, data, "courtCity", readOnlyFields);
        updated = this.write(updated, section.dateOfTrial, data, "courtDateOfTrial", readOnlyFields);
        updated = this.write(updated, section.courtName, data, "courtName", readOnlyFields);
        updated = this.write(updated, section.state, data, "courtState", readOnlyFields);
        updated = this.write(updated, section.streetAddress, data, "courtStreetAddress", readOnlyFields);
        updated = this.write(updated, section.timeOfTrial, data, "courtTimeOfTrial", readOnlyFields);

        return this.write(updated, section.zipCode, data, "courtZipCode", readOnlyFields);
    }

    private extractViolation(section: ViolationSectionModel, data: FormValues<IS438ViolationData>): void {
        this.read(data, "violationBloodAlcoholLevel", section.getBloodAlcoholLevel());
        this.read(data, "violationCourtAppearanceRequiredNo", section.getCourtAppearanceRequiredNo());
        this.read(data, "violationCourtAppearanceRequiredYes", section.getCourtAppearanceRequiredYes());
        this.read(data, "violationDateOfViolation", section.getDateOfViolation());
        this.read(data, "violationDescription", section.getDescription());
        this.read(data, "violationScPoints", section.getScPoints());
        this.read(data, "violationSectionNumber", section.getSectionNumber());
        this.read(data, "violationTimeOfViolation", section.getTimeOfViolation());
    }

    /** Returns one further violation's values, as the record carried for each front page beyond the first. */
    private extractAdditionalViolation(section: ViolationSectionModel): IS438ViolationData {
        const violation: FormValues<IS438ViolationData> = {};

        this.extractViolation(section, violation);

        return violation;
    }

    /**
     * The court appearance yes/no pair is written independently rather than as one answer, so data answering
     * neither stays unanswered rather than being pushed into a "no".
     *
     * It takes the violation half of the contract rather than the whole record, so the same pair of methods serves
     * the first violation, which sits flat on the record, and the rest, which sit in `additionalViolations`.
     */
    private populateViolation(section: ViolationSectionModel, data: IS438ViolationData): ViolationSectionModel {
        let updated = this.write(section, section.bloodAlcoholLevel, data, "violationBloodAlcoholLevel");
        updated = this.write(updated, section.courtAppearanceRequiredNo, data, "violationCourtAppearanceRequiredNo");
        updated = this.write(updated, section.courtAppearanceRequiredYes, data, "violationCourtAppearanceRequiredYes");
        updated = this.write(updated, section.dateOfViolation, data, "violationDateOfViolation");
        updated = this.write(updated, section.description, data, "violationDescription");
        updated = this.write(updated, section.scPoints, data, "violationScPoints");
        updated = this.write(updated, section.sectionNumber, data, "violationSectionNumber");

        return this.write(updated, section.timeOfViolation, data, "violationTimeOfViolation");
    }

    private extractViolationLocation(section: ViolationLocationSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "violationLocation", section.getLocation());
        this.read(data, "violationLocationCity", section.getCity());
        this.read(data, "violationLocationCounty", section.getCounty());
        this.read(data, "violationLocationLatitude", section.getLatitude());
        this.read(data, "violationLocationLongitude", section.getLongitude());
    }

    private populateViolationLocation(section: ViolationLocationSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): ViolationLocationSectionModel {
        let updated = this.write(section, section.violationLocation, data, "violationLocation", readOnlyFields);
        updated = this.write(updated, section.violationLocationCity, data, "violationLocationCity", readOnlyFields);
        updated = this.write(updated, section.violationLocationCounty, data, "violationLocationCounty", readOnlyFields);
        updated = this.write(updated, section.violationLocationLatitude, data, "violationLocationLatitude", readOnlyFields);

        return this.write(updated, section.violationLocationLongitude, data, "violationLocationLongitude", readOnlyFields);
    }

    private extractArrestingOfficer(section: ArrestingOfficerSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "arrestingOfficerBailDeposited", section.getBailDeposited());
        this.read(data, "arrestingOfficerBondAmountRequested", section.getBondAmountRequested());
        this.read(data, "arrestingOfficerDateOfArrest", section.getDateOfArrest());
        this.read(data, "arrestingOfficerName", section.getOfficerName());
        this.read(data, "arrestingOfficerRank", section.getOfficerRank());
        this.read(data, "arrestingOfficerSccjaOfficerNumber", section.getSccjaOfficerNumber());
    }

    private populateArrestingOfficer(section: ArrestingOfficerSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): ArrestingOfficerSectionModel {
        let updated = this.write(section, section.bailDeposited, data, "arrestingOfficerBailDeposited", readOnlyFields);
        updated = this.write(updated, section.bondAmountRequested, data, "arrestingOfficerBondAmountRequested", readOnlyFields);
        updated = this.write(updated, section.dateOfArrest, data, "arrestingOfficerDateOfArrest", readOnlyFields);
        updated = this.write(updated, section.officerName, data, "arrestingOfficerName", readOnlyFields);
        updated = this.write(updated, section.officerRank, data, "arrestingOfficerRank", readOnlyFields);

        return this.write(updated, section.sccjaOfficerNumber, data, "arrestingOfficerSccjaOfficerNumber", readOnlyFields);
    }

    private extractFooter(section: FooterSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "footerTicketNumber", section.getTicketNumber());
    }

    private populateFooter(section: FooterSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): FooterSectionModel {
        return this.write(section, section.ticketNumber, data, "footerTicketNumber", readOnlyFields);
    }
}
