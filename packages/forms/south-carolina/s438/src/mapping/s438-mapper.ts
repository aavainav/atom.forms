import { IPopulateData, FormMapper, FormValues, ReadOnlyFields } from "@forms/core";

import { IS438Data, IS438ViolationData } from "./s438-data";

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

import { TrialArrestingOfficerSectionModel } from "../models/trial-page/arresting-officer-section";
import { TrialCourtInformationSectionModel } from "../models/trial-page/court-information-section";
import { TrialCourtSectionModel } from "../models/trial-page/court-section";
import { TrialFooterSectionModel } from "../models/trial-page/footer-section";
import { TrialHeaderSectionModel } from "../models/trial-page/header-section";
import { TrialOwnerSectionModel } from "../models/trial-page/owner-section";
import { TrialPageModel } from "../models/trial-page/trial-page";
import { TrialVehicleSectionModel } from "../models/trial-page/vehicle-section";
import { TrialViolationLocationSectionModel } from "../models/trial-page/violation-location-section";
import { TrialViolationSectionModel } from "../models/trial-page/violation-section";
import { TrialViolatorSectionModel } from "../models/trial-page/violator-section";

/**
 * Maps the SC S438 citation form to and from the data contract it publishes. Each section's read sits directly
 * above its write below, so a forgotten field shows up in the same diff. The header section carries no fields of
 * its own and so appears in neither direction.
 */
export class S438Mapper extends FormMapper<S438FormModel, IS438Data> {
    /** Returns the form's current values, emitting only the fields it owns. Shared sections are read from the first page alone, since every front page holds the same values there. */
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

        // the trial page holds its own copy of everything, so it is read in full rather than from the front page
        const trial = form.getTrialPageCollection().getFirstPage<TrialPageModel>();

        this.extractTrialHeader(trial.getHeaderSection(), data);
        this.extractTrialViolator(trial.getViolatorSection(), data);
        this.extractTrialVehicle(trial.getVehicleSection(), data);
        this.extractTrialOwner(trial.getOwnerSection(), data);
        this.extractTrialCourt(trial.getCourtSection(), data);
        this.extractTrialViolation(trial.getViolationSection(), data);
        this.extractTrialViolationLocation(trial.getViolationLocationSection(), data);
        this.extractTrialArrestingOfficer(trial.getArrestingOfficerSection(), data);
        this.extractTrialCourtInformation(trial.getCourtInformationSection(), data);
        this.extractTrialFooter(trial.getFooterSection(), data);

        if (pages.length > 1) {
            data.additionalViolations = pages.slice(1).map(additional => this.extractAdditionalViolation(additional.getViolationSection()));
        }

        return data;
    }

    /**
     * Returns a new form with the data applied to its front pages, creating a page per further violation. Async,
     * since creating a page means awaiting its `initialize`. Pages beyond `additionalViolations` are left alone
     * rather than removed, so a record naming fewer violations never silently discards a page an officer added.
     * A field the data omits keeps its current value -- how the date and time of violation the form stamps on
     * itself survive a partial record.
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

        const trialCollection = updated.getTrialPageCollection();
        const trial = trialCollection.getFirstPage<TrialPageModel>();

        let trialResult = trial.set(trial.headerSection, this.populateTrialHeader(trial.getHeaderSection(), data, readOnlyFields));
        trialResult = trialResult.set(trialResult.violatorSection, this.populateTrialViolator(trialResult.getViolatorSection(), data, readOnlyFields));
        trialResult = trialResult.set(trialResult.vehicleSection, this.populateTrialVehicle(trialResult.getVehicleSection(), data, readOnlyFields));
        trialResult = trialResult.set(trialResult.ownerSection, this.populateTrialOwner(trialResult.getOwnerSection(), data, readOnlyFields));
        trialResult = trialResult.set(trialResult.courtSection, this.populateTrialCourt(trialResult.getCourtSection(), data, readOnlyFields));
        trialResult = trialResult.set(trialResult.violationSection, this.populateTrialViolation(trialResult.getViolationSection(), data, readOnlyFields));
        trialResult = trialResult.set(trialResult.violationLocationSection, this.populateTrialViolationLocation(trialResult.getViolationLocationSection(), data, readOnlyFields));
        trialResult = trialResult.set(trialResult.arrestingOfficerSection, this.populateTrialArrestingOfficer(trialResult.getArrestingOfficerSection(), data, readOnlyFields));
        trialResult = trialResult.set(trialResult.courtInformationSection, this.populateTrialCourtInformation(trialResult.getCourtInformationSection(), data, readOnlyFields));
        trialResult = trialResult.set(trialResult.footerSection, this.populateTrialFooter(trialResult.getFooterSection(), data, readOnlyFields));

        return updated
            .set(updated.frontPage, collection)
            .set(updated.trialPage, trialCollection.replace(0, trialResult));
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
     * The court appearance yes/no pair is written independently, so data answering neither stays unanswered
     * rather than reading as "no". Takes the violation half of the contract rather than the whole record, so the
     * same pair of methods serves both the flat first violation and the rest in `additionalViolations`.
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

    private extractTrialHeader(section: TrialHeaderSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "trialHeaderNotes", section.getNotes());
        this.read(data, "trialHeaderVoid", section.getVoid());
    }

    private populateTrialHeader(section: TrialHeaderSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): TrialHeaderSectionModel {
        const updated = this.write(section, section.notes, data, "trialHeaderNotes", readOnlyFields);

        return this.write(updated, section.void, data, "trialHeaderVoid", readOnlyFields);
    }

    private extractTrialViolator(section: TrialViolatorSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "trialViolatorCity", section.getCity());
        this.read(data, "trialViolatorCommercialDriverLicenseNo", section.getCommercialDriverLicenseNo());
        this.read(data, "trialViolatorCommercialDriverLicenseYes", section.getCommercialDriverLicenseYes());
        this.read(data, "trialViolatorDateOfBirth", section.getDateOfBirth());
        this.read(data, "trialViolatorDriverLicenseClass", section.getDriverLicenseClass());
        this.read(data, "trialViolatorDriverLicenseNumber", section.getDriverLicenseNumber());
        this.read(data, "trialViolatorDriverLicenseState", section.getDriverLicenseState());
        this.read(data, "trialViolatorEyeColor", section.getEyeColor());
        this.read(data, "trialViolatorFirstName", section.getFirstName());
        this.read(data, "trialViolatorHairColor", section.getHairColor());
        this.read(data, "trialViolatorHeight", section.getHeight());
        this.read(data, "trialViolatorLastName", section.getLastName());
        this.read(data, "trialViolatorMiddleName", section.getMiddleName());
        this.read(data, "trialViolatorRace", section.getRace());
        this.read(data, "trialViolatorSex", section.getSex());
        this.read(data, "trialViolatorState", section.getState());
        this.read(data, "trialViolatorStreetAddress", section.getStreetAddress());
        this.read(data, "trialViolatorWeight", section.getWeight());
        this.read(data, "trialViolatorZipCode", section.getZipCode());
    }

    private populateTrialViolator(section: TrialViolatorSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): TrialViolatorSectionModel {
        let updated = this.write(section, section.city, data, "trialViolatorCity", readOnlyFields);
        updated = this.write(updated, section.commercialDriverLicenseNo, data, "trialViolatorCommercialDriverLicenseNo", readOnlyFields);
        updated = this.write(updated, section.commercialDriverLicenseYes, data, "trialViolatorCommercialDriverLicenseYes", readOnlyFields);
        updated = this.write(updated, section.dateOfBirth, data, "trialViolatorDateOfBirth", readOnlyFields);
        updated = this.write(updated, section.driverLicenseClass, data, "trialViolatorDriverLicenseClass", readOnlyFields);
        updated = this.write(updated, section.driverLicenseNumber, data, "trialViolatorDriverLicenseNumber", readOnlyFields);
        updated = this.write(updated, section.driverLicenseState, data, "trialViolatorDriverLicenseState", readOnlyFields);
        updated = this.write(updated, section.eyeColor, data, "trialViolatorEyeColor", readOnlyFields);
        updated = this.write(updated, section.firstName, data, "trialViolatorFirstName", readOnlyFields);
        updated = this.write(updated, section.hairColor, data, "trialViolatorHairColor", readOnlyFields);
        updated = this.write(updated, section.height, data, "trialViolatorHeight", readOnlyFields);
        updated = this.write(updated, section.lastName, data, "trialViolatorLastName", readOnlyFields);
        updated = this.write(updated, section.middleName, data, "trialViolatorMiddleName", readOnlyFields);
        updated = this.write(updated, section.race, data, "trialViolatorRace", readOnlyFields);
        updated = this.write(updated, section.sex, data, "trialViolatorSex", readOnlyFields);
        updated = this.write(updated, section.state, data, "trialViolatorState", readOnlyFields);
        updated = this.write(updated, section.streetAddress, data, "trialViolatorStreetAddress", readOnlyFields);
        updated = this.write(updated, section.weight, data, "trialViolatorWeight", readOnlyFields);

        return this.write(updated, section.zipCode, data, "trialViolatorZipCode", readOnlyFields);
    }

    private extractTrialVehicle(section: TrialVehicleSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "trialVehicleAuto", section.getAuto());
        this.read(data, "trialVehicleBicycle", section.getBicycle());
        this.read(data, "trialVehicleCombination", section.getCombination());
        this.read(data, "trialVehicleCommercialVehicle", section.getCommercial());
        this.read(data, "trialVehicleHazardousMaterials", section.getHazardousMaterials());
        this.read(data, "trialVehicleLicenseNumber", section.getLicenseNumber());
        this.read(data, "trialVehicleLicenseState", section.getLicenseState());
        this.read(data, "trialVehicleMake", section.getMake());
        this.read(data, "trialVehicleMoped", section.getMoped());
        this.read(data, "trialVehicleMotorcycle", section.getMotorcycle());
        this.read(data, "trialVehicleOther", section.getOther());
        this.read(data, "trialVehiclePedestrian", section.getPedestrian());
        this.read(data, "trialVehicleYear", section.getYear());
    }

    private populateTrialVehicle(section: TrialVehicleSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): TrialVehicleSectionModel {
        let updated = this.write(section, section.auto, data, "trialVehicleAuto", readOnlyFields);
        updated = this.write(updated, section.bicycle, data, "trialVehicleBicycle", readOnlyFields);
        updated = this.write(updated, section.combination, data, "trialVehicleCombination", readOnlyFields);
        updated = this.write(updated, section.commercial, data, "trialVehicleCommercialVehicle", readOnlyFields);
        updated = this.write(updated, section.hazardousMaterials, data, "trialVehicleHazardousMaterials", readOnlyFields);
        updated = this.write(updated, section.licenseNumber, data, "trialVehicleLicenseNumber", readOnlyFields);
        updated = this.write(updated, section.licenseState, data, "trialVehicleLicenseState", readOnlyFields);
        updated = this.write(updated, section.make, data, "trialVehicleMake", readOnlyFields);
        updated = this.write(updated, section.moped, data, "trialVehicleMoped", readOnlyFields);
        updated = this.write(updated, section.motorcycle, data, "trialVehicleMotorcycle", readOnlyFields);
        updated = this.write(updated, section.other, data, "trialVehicleOther", readOnlyFields);
        updated = this.write(updated, section.pedestrian, data, "trialVehiclePedestrian", readOnlyFields);

        return this.write(updated, section.year, data, "trialVehicleYear", readOnlyFields);
    }

    private extractTrialOwner(section: TrialOwnerSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "trialOwnerCity", section.getCity());
        this.read(data, "trialOwnerFirstName", section.getFirstName());
        this.read(data, "trialOwnerLastName", section.getLastName());
        this.read(data, "trialOwnerMiddleName", section.getMiddleName());
        this.read(data, "trialOwnerState", section.getState());
        this.read(data, "trialOwnerStreetAddress", section.getStreetAddress());
        this.read(data, "trialOwnerZipCode", section.getZipCode());
    }

    private populateTrialOwner(section: TrialOwnerSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): TrialOwnerSectionModel {
        let updated = this.write(section, section.city, data, "trialOwnerCity", readOnlyFields);
        updated = this.write(updated, section.firstName, data, "trialOwnerFirstName", readOnlyFields);
        updated = this.write(updated, section.lastName, data, "trialOwnerLastName", readOnlyFields);
        updated = this.write(updated, section.middleName, data, "trialOwnerMiddleName", readOnlyFields);
        updated = this.write(updated, section.state, data, "trialOwnerState", readOnlyFields);
        updated = this.write(updated, section.streetAddress, data, "trialOwnerStreetAddress", readOnlyFields);

        return this.write(updated, section.zipCode, data, "trialOwnerZipCode", readOnlyFields);
    }

    private extractTrialCourt(section: TrialCourtSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "trialCourtCity", section.getCity());
        this.read(data, "trialCourtDateOfTrial", section.getDateOfTrial());
        this.read(data, "trialCourtName", section.getCourtName());
        this.read(data, "trialCourtState", section.getState());
        this.read(data, "trialCourtStreetAddress", section.getStreetAddress());
        this.read(data, "trialCourtTimeOfTrial", section.getTimeOfTrial());
        this.read(data, "trialCourtZipCode", section.getZipCode());
    }

    private populateTrialCourt(section: TrialCourtSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): TrialCourtSectionModel {
        let updated = this.write(section, section.city, data, "trialCourtCity", readOnlyFields);
        updated = this.write(updated, section.dateOfTrial, data, "trialCourtDateOfTrial", readOnlyFields);
        updated = this.write(updated, section.courtName, data, "trialCourtName", readOnlyFields);
        updated = this.write(updated, section.state, data, "trialCourtState", readOnlyFields);
        updated = this.write(updated, section.streetAddress, data, "trialCourtStreetAddress", readOnlyFields);
        updated = this.write(updated, section.timeOfTrial, data, "trialCourtTimeOfTrial", readOnlyFields);

        return this.write(updated, section.zipCode, data, "trialCourtZipCode", readOnlyFields);
    }

    private extractTrialViolation(section: TrialViolationSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "trialViolationBloodAlcoholLevel", section.getBloodAlcoholLevel());
        this.read(data, "trialViolationCourtAppearanceRequiredNo", section.getCourtAppearanceRequiredNo());
        this.read(data, "trialViolationCourtAppearanceRequiredYes", section.getCourtAppearanceRequiredYes());
        this.read(data, "trialViolationDateOfViolation", section.getDateOfViolation());
        this.read(data, "trialViolationDescription", section.getDescription());
        this.read(data, "trialViolationScPoints", section.getScPoints());
        this.read(data, "trialViolationSectionNumber", section.getSectionNumber());
        this.read(data, "trialViolationTimeOfViolation", section.getTimeOfViolation());
    }

    private populateTrialViolation(section: TrialViolationSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): TrialViolationSectionModel {
        let updated = this.write(section, section.bloodAlcoholLevel, data, "trialViolationBloodAlcoholLevel", readOnlyFields);
        updated = this.write(updated, section.courtAppearanceRequiredNo, data, "trialViolationCourtAppearanceRequiredNo", readOnlyFields);
        updated = this.write(updated, section.courtAppearanceRequiredYes, data, "trialViolationCourtAppearanceRequiredYes", readOnlyFields);
        updated = this.write(updated, section.dateOfViolation, data, "trialViolationDateOfViolation", readOnlyFields);
        updated = this.write(updated, section.description, data, "trialViolationDescription", readOnlyFields);
        updated = this.write(updated, section.scPoints, data, "trialViolationScPoints", readOnlyFields);
        updated = this.write(updated, section.sectionNumber, data, "trialViolationSectionNumber", readOnlyFields);

        return this.write(updated, section.timeOfViolation, data, "trialViolationTimeOfViolation", readOnlyFields);
    }

    private extractTrialViolationLocation(section: TrialViolationLocationSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "trialViolationLocation", section.getLocation());
        this.read(data, "trialViolationLocationCity", section.getCity());
        this.read(data, "trialViolationLocationCounty", section.getCounty());
        this.read(data, "trialViolationLocationLatitude", section.getLatitude());
        this.read(data, "trialViolationLocationLongitude", section.getLongitude());
    }

    private populateTrialViolationLocation(section: TrialViolationLocationSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): TrialViolationLocationSectionModel {
        let updated = this.write(section, section.location, data, "trialViolationLocation", readOnlyFields);
        updated = this.write(updated, section.city, data, "trialViolationLocationCity", readOnlyFields);
        updated = this.write(updated, section.county, data, "trialViolationLocationCounty", readOnlyFields);
        updated = this.write(updated, section.latitude, data, "trialViolationLocationLatitude", readOnlyFields);

        return this.write(updated, section.longitude, data, "trialViolationLocationLongitude", readOnlyFields);
    }

    private extractTrialArrestingOfficer(section: TrialArrestingOfficerSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "trialArrestingOfficerBailDeposited", section.getBailDeposited());
        this.read(data, "trialArrestingOfficerBailReceivedBy", section.getBailReceivedBy());
        this.read(data, "trialArrestingOfficerBondAmountRequested", section.getBondAmountRequested());
        this.read(data, "trialArrestingOfficerDateBailReceived", section.getDateBailReceived());
        this.read(data, "trialArrestingOfficerDateOfArrest", section.getDateOfArrest());
        this.read(data, "trialArrestingOfficerName", section.getOfficerName());
        this.read(data, "trialArrestingOfficerRank", section.getOfficerRank());
        this.read(data, "trialArrestingOfficerSccjaOfficerNumber", section.getSccjaOfficerNumber());
    }

    private populateTrialArrestingOfficer(section: TrialArrestingOfficerSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): TrialArrestingOfficerSectionModel {
        let updated = this.write(section, section.bailDeposited, data, "trialArrestingOfficerBailDeposited", readOnlyFields);
        updated = this.write(updated, section.bailReceivedBy, data, "trialArrestingOfficerBailReceivedBy", readOnlyFields);
        updated = this.write(updated, section.bondAmountRequested, data, "trialArrestingOfficerBondAmountRequested", readOnlyFields);
        updated = this.write(updated, section.dateBailReceived, data, "trialArrestingOfficerDateBailReceived", readOnlyFields);
        updated = this.write(updated, section.dateOfArrest, data, "trialArrestingOfficerDateOfArrest", readOnlyFields);
        updated = this.write(updated, section.officerName, data, "trialArrestingOfficerName", readOnlyFields);
        updated = this.write(updated, section.officerRank, data, "trialArrestingOfficerRank", readOnlyFields);

        return this.write(updated, section.sccjaOfficerNumber, data, "trialArrestingOfficerSccjaOfficerNumber", readOnlyFields);
    }

    private extractTrialCourtInformation(section: TrialCourtInformationSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "trialCourtInformationAmountCollected", section.getAmountCollected());
        this.read(data, "trialCourtInformationAmountSuspended", section.getAmountSuspended());
        this.read(data, "trialCourtInformationArrestResultOfCollision", section.getArrestResultOfCollision());
        this.read(data, "trialCourtInformationCaseBeforeCircuitCourt", section.getCaseBeforeCircuitCourt());
        this.read(data, "trialCourtInformationCaseBeforeFamilyCourt", section.getCaseBeforeFamilyCourt());
        this.read(data, "trialCourtInformationCaseBeforeFederalCourt", section.getCaseBeforeFederalCourt());
        this.read(data, "trialCourtInformationCaseBeforeMagistrate", section.getCaseBeforeMagistrate());
        this.read(data, "trialCourtInformationCaseBeforeMunicipalCourt", section.getCaseBeforeMunicipalCourt());
        this.read(data, "trialCourtInformationCertifiedCorrect", section.getCertifiedCorrect());
        this.read(data, "trialCourtInformationCertifiedDate", section.getCertifiedDate());
        this.read(data, "trialCourtInformationChargeConvictedOf", section.getChargeConvictedOf());
        this.read(data, "trialCourtInformationCommittedTo", section.getCommittedTo());
        this.read(data, "trialCourtInformationCourtIfDifferent", section.getCourtIfDifferent());
        this.read(data, "trialCourtInformationDefendantAppeared", section.getDefendantAppeared());
        this.read(data, "trialCourtInformationDefendantDidNotAppear", section.getDefendantDidNotAppear());
        this.read(data, "trialCourtInformationDeterminedBac", section.getDeterminedBac());
        this.read(data, "trialCourtInformationDispositionDate", section.getDispositionDate());
        this.read(data, "trialCourtInformationFine", section.getFine());
        this.read(data, "trialCourtInformationForfeitedBond", section.getForfeitedBond());
        this.read(data, "trialCourtInformationGuilty", section.getGuilty());
        this.read(data, "trialCourtInformationJail", section.getJail());
        this.read(data, "trialCourtInformationNolleProssed", section.getNolleProssed());
        this.read(data, "trialCourtInformationNotGuilty", section.getNotGuilty());
        this.read(data, "trialCourtInformationPledNoloContendere", section.getPledNoloContendere());
        this.read(data, "trialCourtInformationSameAsOriginal", section.getSameAsOriginal());
        this.read(data, "trialCourtInformationScPoints", section.getScPoints());
        this.read(data, "trialCourtInformationSuspend", section.getSuspend());
        this.read(data, "trialCourtInformationTrialByJudge", section.getTrialByJudge());
        this.read(data, "trialCourtInformationTrialByJury", section.getTrialByJury());
        this.read(data, "trialCourtInformationVehicleSearched", section.getVehicleSearched());
    }

    private populateTrialCourtInformation(section: TrialCourtInformationSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): TrialCourtInformationSectionModel {
        let updated = this.write(section, section.amountCollected, data, "trialCourtInformationAmountCollected", readOnlyFields);
        updated = this.write(updated, section.amountSuspended, data, "trialCourtInformationAmountSuspended", readOnlyFields);
        updated = this.write(updated, section.arrestResultOfCollision, data, "trialCourtInformationArrestResultOfCollision", readOnlyFields);
        updated = this.write(updated, section.caseBeforeCircuitCourt, data, "trialCourtInformationCaseBeforeCircuitCourt", readOnlyFields);
        updated = this.write(updated, section.caseBeforeFamilyCourt, data, "trialCourtInformationCaseBeforeFamilyCourt", readOnlyFields);
        updated = this.write(updated, section.caseBeforeFederalCourt, data, "trialCourtInformationCaseBeforeFederalCourt", readOnlyFields);
        updated = this.write(updated, section.caseBeforeMagistrate, data, "trialCourtInformationCaseBeforeMagistrate", readOnlyFields);
        updated = this.write(updated, section.caseBeforeMunicipalCourt, data, "trialCourtInformationCaseBeforeMunicipalCourt", readOnlyFields);
        updated = this.write(updated, section.certifiedCorrect, data, "trialCourtInformationCertifiedCorrect", readOnlyFields);
        updated = this.write(updated, section.certifiedDate, data, "trialCourtInformationCertifiedDate", readOnlyFields);
        updated = this.write(updated, section.chargeConvictedOf, data, "trialCourtInformationChargeConvictedOf", readOnlyFields);
        updated = this.write(updated, section.committedTo, data, "trialCourtInformationCommittedTo", readOnlyFields);
        updated = this.write(updated, section.courtIfDifferent, data, "trialCourtInformationCourtIfDifferent", readOnlyFields);
        updated = this.write(updated, section.defendantAppeared, data, "trialCourtInformationDefendantAppeared", readOnlyFields);
        updated = this.write(updated, section.defendantDidNotAppear, data, "trialCourtInformationDefendantDidNotAppear", readOnlyFields);
        updated = this.write(updated, section.determinedBac, data, "trialCourtInformationDeterminedBac", readOnlyFields);
        updated = this.write(updated, section.dispositionDate, data, "trialCourtInformationDispositionDate", readOnlyFields);
        updated = this.write(updated, section.fine, data, "trialCourtInformationFine", readOnlyFields);
        updated = this.write(updated, section.forfeitedBond, data, "trialCourtInformationForfeitedBond", readOnlyFields);
        updated = this.write(updated, section.guilty, data, "trialCourtInformationGuilty", readOnlyFields);
        updated = this.write(updated, section.jail, data, "trialCourtInformationJail", readOnlyFields);
        updated = this.write(updated, section.nolleProssed, data, "trialCourtInformationNolleProssed", readOnlyFields);
        updated = this.write(updated, section.notGuilty, data, "trialCourtInformationNotGuilty", readOnlyFields);
        updated = this.write(updated, section.pledNoloContendere, data, "trialCourtInformationPledNoloContendere", readOnlyFields);
        updated = this.write(updated, section.sameAsOriginal, data, "trialCourtInformationSameAsOriginal", readOnlyFields);
        updated = this.write(updated, section.scPoints, data, "trialCourtInformationScPoints", readOnlyFields);
        updated = this.write(updated, section.suspend, data, "trialCourtInformationSuspend", readOnlyFields);
        updated = this.write(updated, section.trialByJudge, data, "trialCourtInformationTrialByJudge", readOnlyFields);
        updated = this.write(updated, section.trialByJury, data, "trialCourtInformationTrialByJury", readOnlyFields);

        return this.write(updated, section.vehicleSearched, data, "trialCourtInformationVehicleSearched", readOnlyFields);
    }

    private extractTrialFooter(section: TrialFooterSectionModel, data: FormValues<IS438Data>): void {
        this.read(data, "trialFooterTicketNumber", section.getTicketNumber());
    }

    private populateTrialFooter(section: TrialFooterSectionModel, data: IS438Data, readOnlyFields?: ReadOnlyFields<IS438Data>): TrialFooterSectionModel {
        return this.write(section, section.ticketNumber, data, "trialFooterTicketNumber", readOnlyFields);
    }
}
