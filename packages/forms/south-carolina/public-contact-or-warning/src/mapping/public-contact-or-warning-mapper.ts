import { FormMapper, FormValues } from "@forms/core";

import { AgencySectionModel } from "../models/record-page/agency-section";
import { NatureOfContactSectionModel } from "../models/record-page/nature-of-contact-section";
import { OfficerSectionModel } from "../models/record-page/officer-section";
import { PersonSectionModel } from "../models/record-page/person-section";
import { PrimaryReasonSectionModel } from "../models/record-page/primary-reason-section";
import { PublicContactOrWarningFormModel } from "../models/public-contact-or-warning-form";
import { RecordPageModel } from "../models/record-page/record-page";
import { RouteSectionModel } from "../models/record-page/route-section";
import { SearchesSectionModel } from "../models/record-page/searches-section";
import { StopSectionModel } from "../models/record-page/stop-section";
import { VehicleSectionModel } from "../models/record-page/vehicle-section";
import { IPublicContactOrWarningData } from "./public-contact-or-warning-data";

/**
 * Maps the SC Form 432 (Public Contact / Warning) form to and from the data contract it publishes.
 *
 * Each section's read sits directly above its write below, so a field added to one direction and forgotten in
 * the other shows up in the same diff. Keeping the two directions in step is what makes the round trip hold.
 */
export class PublicContactOrWarningMapper extends FormMapper<PublicContactOrWarningFormModel, IPublicContactOrWarningData> {
    /** Returns the form's current values as its data contract, emitting only the fields this form owns. */
    public extract(form: PublicContactOrWarningFormModel): IPublicContactOrWarningData {
        const page = form.getRecordPageCollection().getFirstPage<RecordPageModel>();
        const data: FormValues<IPublicContactOrWarningData> = {};

        this.extractAgency(page.getAgencySection(), data);
        this.extractPerson(page.getPersonSection(), data);
        this.extractRoute(page.getRouteSection(), data);
        this.extractStop(page.getStopSection(), data);
        this.extractVehicle(page.getVehicleSection(), data);
        this.extractOfficer(page.getOfficerSection(), data);
        this.extractNatureOfContact(page.getNatureOfContactSection(), data);
        this.extractPrimaryReason(page.getPrimaryReasonSection(), data);
        this.extractSearches(page.getSearchesSection(), data);

        return data;
    }

    /**
     * Returns a new form with the given data applied to its record page. Every field of the form is reachable
     * from the data contract, and a field the data does not mention keeps the value it already holds.
     *
     * `readOnlyFields` names which of `data`'s own fields should come back disabled rather than editable - today
     * only the agency section's fields are wired up to honor it (see `populateAgency`).
     */
    public populate(form: PublicContactOrWarningFormModel, data: IPublicContactOrWarningData, readOnlyFields?: ReadonlySet<keyof IPublicContactOrWarningData>): PublicContactOrWarningFormModel {
        const collection = form.getRecordPageCollection();
        const page = collection.getFirstPage<RecordPageModel>();

        let updated = page.set(page.agencySection, this.populateAgency(page.getAgencySection(), data, readOnlyFields));
        updated = updated.set(updated.personSection, this.populatePerson(updated.getPersonSection(), data, readOnlyFields));
        updated = updated.set(updated.routeSection, this.populateRoute(updated.getRouteSection(), data, readOnlyFields));
        updated = updated.set(updated.stopSection, this.populateStop(updated.getStopSection(), data, readOnlyFields));
        updated = updated.set(updated.vehicleSection, this.populateVehicle(updated.getVehicleSection(), data, readOnlyFields));
        updated = updated.set(updated.officerSection, this.populateOfficer(updated.getOfficerSection(), data, readOnlyFields));
        updated = updated.set(updated.natureOfContactSection, this.populateNatureOfContact(updated.getNatureOfContactSection(), data, readOnlyFields));
        updated = updated.set(updated.primaryReasonSection, this.populatePrimaryReason(updated.getPrimaryReasonSection(), data, readOnlyFields));
        updated = updated.set(updated.searchesSection, this.populateSearches(updated.getSearchesSection(), data, readOnlyFields));

        return form.set(form.recordPage, collection.replace(0, updated));
    }

    private extractAgency(section: AgencySectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "agencyCity", section.getCity());
        this.read(data, "agencyCounty", section.getCounty());
        this.read(data, "agencyName", section.getAgencyName());
    }

    private populateAgency(section: AgencySectionModel, data: IPublicContactOrWarningData, readOnlyFields?: ReadonlySet<keyof IPublicContactOrWarningData>): AgencySectionModel {
        let updated = this.write(section, section.city, data, "agencyCity", readOnlyFields);
        updated = this.write(updated, section.county, data, "agencyCounty", readOnlyFields);

        return this.write(updated, section.agencyName, data, "agencyName", readOnlyFields);
    }

    private extractPerson(section: PersonSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "personDateOfBirth", section.getDateOfBirth());
        this.read(data, "personDriverLicenseNumber", section.getDriverLicenseNumber());
        this.read(data, "personFirstName", section.getFirstName());
        this.read(data, "personGender", section.getGender());
        this.read(data, "personLastName", section.getLastName());
        this.read(data, "personLatitude", section.getLatitude());
        this.read(data, "personLicensedState", section.getLicensedState());
        this.read(data, "personLongitude", section.getLongitude());
        this.read(data, "personMiddleInitial", section.getMiddleInitial());
        this.read(data, "personRace", section.getRace());
    }

    private populatePerson(section: PersonSectionModel, data: IPublicContactOrWarningData, readOnlyFields?: ReadonlySet<keyof IPublicContactOrWarningData>): PersonSectionModel {
        let updated = this.write(section, section.dateOfBirth, data, "personDateOfBirth", readOnlyFields);
        updated = this.write(updated, section.driverLicenseNumber, data, "personDriverLicenseNumber", readOnlyFields);
        updated = this.write(updated, section.firstName, data, "personFirstName", readOnlyFields);
        updated = this.write(updated, section.gender, data, "personGender", readOnlyFields);
        updated = this.write(updated, section.lastName, data, "personLastName", readOnlyFields);
        updated = this.write(updated, section.latitude, data, "personLatitude", readOnlyFields);
        updated = this.write(updated, section.licensedState, data, "personLicensedState", readOnlyFields);
        updated = this.write(updated, section.longitude, data, "personLongitude", readOnlyFields);
        updated = this.write(updated, section.middleInitial, data, "personMiddleInitial", readOnlyFields);

        return this.write(updated, section.race, data, "personRace", readOnlyFields);
    }

    private extractRoute(section: RouteSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "routeNumberOrName", section.getNumberOrName());
        this.read(data, "routeType", section.getType());
    }

    private populateRoute(section: RouteSectionModel, data: IPublicContactOrWarningData, readOnlyFields?: ReadonlySet<keyof IPublicContactOrWarningData>): RouteSectionModel {
        const updated = this.write(section, section.numberOrName, data, "routeNumberOrName", readOnlyFields);

        return this.write(updated, section.type, data, "routeType", readOnlyFields);
    }

    private extractStop(section: StopSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "stopCadCallNumber", section.getCadCallNumber());
        this.read(data, "stopCounty", section.getCounty());
        this.read(data, "stopDate", section.getDate());
        this.read(data, "stopTime", section.getTime());
    }

    private populateStop(section: StopSectionModel, data: IPublicContactOrWarningData, readOnlyFields?: ReadonlySet<keyof IPublicContactOrWarningData>): StopSectionModel {
        let updated = this.write(section, section.cadCallNumber, data, "stopCadCallNumber", readOnlyFields);
        updated = this.write(updated, section.county, data, "stopCounty", readOnlyFields);
        updated = this.write(updated, section.date, data, "stopDate", readOnlyFields);

        return this.write(updated, section.time, data, "stopTime", readOnlyFields);
    }

    private extractVehicle(section: VehicleSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "vehicleCmv", section.getCmv());
        this.read(data, "vehicleLicenseNumber", section.getLicenseNumber());
        this.read(data, "vehicleMake", section.getMake());
        this.read(data, "vehicleModel", section.getModel());
        this.read(data, "vehicleState", section.getState());
        this.read(data, "vehicleYear", section.getYear());
    }

    private populateVehicle(section: VehicleSectionModel, data: IPublicContactOrWarningData, readOnlyFields?: ReadonlySet<keyof IPublicContactOrWarningData>): VehicleSectionModel {
        let updated = this.write(section, section.cmv, data, "vehicleCmv", readOnlyFields);
        updated = this.write(updated, section.licenseNumber, data, "vehicleLicenseNumber", readOnlyFields);
        updated = this.write(updated, section.make, data, "vehicleMake", readOnlyFields);
        updated = this.write(updated, section.model, data, "vehicleModel", readOnlyFields);
        updated = this.write(updated, section.state, data, "vehicleState", readOnlyFields);

        return this.write(updated, section.year, data, "vehicleYear", readOnlyFields);
    }

    private extractOfficer(section: OfficerSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "officerIssuedBy", section.getIssuedBy());
        this.read(data, "officerRank", section.getRank());
        this.read(data, "officerScCjaNumber", section.getScCjaNumber());
    }

    private populateOfficer(section: OfficerSectionModel, data: IPublicContactOrWarningData, readOnlyFields?: ReadonlySet<keyof IPublicContactOrWarningData>): OfficerSectionModel {
        let updated = this.write(section, section.issuedBy, data, "officerIssuedBy", readOnlyFields);
        updated = this.write(updated, section.rank, data, "officerRank", readOnlyFields);

        return this.write(updated, section.scCjaNumber, data, "officerScCjaNumber", readOnlyFields);
    }

    private extractNatureOfContact(section: NatureOfContactSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "natureChangingLanesUnlawfully", section.getChangingLanesUnlawfully());
        this.read(data, "natureContactOnly", section.getContactOnly());
        this.read(data, "natureDefectiveEquipment", section.getDefectiveEquipment());
        this.read(data, "natureDisregardingStopSign", section.getDisregardingStopSign());
        this.read(data, "natureDisregardingTrafficSignal", section.getDisregardingTrafficSignal());
        this.read(data, "natureDriversLicenseViolation", section.getDriversLicenseViolation());
        this.read(data, "natureFailureToDimLights", section.getFailureToDimLights());
        this.read(data, "natureFollowingTooClose", section.getFollowingTooClose());
        this.read(data, "natureHandsFreeViolation", section.getHandsFreeViolation());
        this.read(data, "natureImmigrationStop", section.getImmigrationStop());
        this.read(data, "natureImproperBacking", section.getImproperBacking());
        this.read(data, "natureImproperLaneUse", section.getImproperLaneUse());
        this.read(data, "natureImproperLights", section.getImproperLights());
        this.read(data, "natureImproperPassing", section.getImproperPassing());
        this.read(data, "natureImproperTurn", section.getImproperTurn());
        this.read(data, "natureNoRightOfWay", section.getNoRightOfWay());
        this.read(data, "natureOther", section.getOther());
        this.read(data, "natureOtherSpecify", section.getOtherSpecify());
        this.read(data, "naturePedestrian", section.getPedestrian());
        this.read(data, "natureSeatBeltViolation", section.getSeatBeltViolation());
        this.read(data, "natureSpeeding", section.getSpeeding());
        this.read(data, "natureVehicleLicenseViolation", section.getVehicleLicenseViolation());
    }

    private populateNatureOfContact(section: NatureOfContactSectionModel, data: IPublicContactOrWarningData, readOnlyFields?: ReadonlySet<keyof IPublicContactOrWarningData>): NatureOfContactSectionModel {
        let updated = this.write(section, section.changingLanesUnlawfully, data, "natureChangingLanesUnlawfully", readOnlyFields);
        updated = this.write(updated, section.contactOnly, data, "natureContactOnly", readOnlyFields);
        updated = this.write(updated, section.defectiveEquipment, data, "natureDefectiveEquipment", readOnlyFields);
        updated = this.write(updated, section.disregardingStopSign, data, "natureDisregardingStopSign", readOnlyFields);
        updated = this.write(updated, section.disregardingTrafficSignal, data, "natureDisregardingTrafficSignal", readOnlyFields);
        updated = this.write(updated, section.driversLicenseViolation, data, "natureDriversLicenseViolation", readOnlyFields);
        updated = this.write(updated, section.failureToDimLights, data, "natureFailureToDimLights", readOnlyFields);
        updated = this.write(updated, section.followingTooClose, data, "natureFollowingTooClose", readOnlyFields);
        updated = this.write(updated, section.handsFreeViolation, data, "natureHandsFreeViolation", readOnlyFields);
        updated = this.write(updated, section.immigrationStop, data, "natureImmigrationStop", readOnlyFields);
        updated = this.write(updated, section.improperBacking, data, "natureImproperBacking", readOnlyFields);
        updated = this.write(updated, section.improperLaneUse, data, "natureImproperLaneUse", readOnlyFields);
        updated = this.write(updated, section.improperLights, data, "natureImproperLights", readOnlyFields);
        updated = this.write(updated, section.improperPassing, data, "natureImproperPassing", readOnlyFields);
        updated = this.write(updated, section.improperTurn, data, "natureImproperTurn", readOnlyFields);
        updated = this.write(updated, section.noRightOfWay, data, "natureNoRightOfWay", readOnlyFields);
        updated = this.write(updated, section.other, data, "natureOther", readOnlyFields);
        updated = this.write(updated, section.otherSpecify, data, "natureOtherSpecify", readOnlyFields);
        updated = this.write(updated, section.pedestrian, data, "naturePedestrian", readOnlyFields);
        updated = this.write(updated, section.seatBeltViolation, data, "natureSeatBeltViolation", readOnlyFields);
        updated = this.write(updated, section.speeding, data, "natureSpeeding", readOnlyFields);

        return this.write(updated, section.vehicleLicenseViolation, data, "natureVehicleLicenseViolation", readOnlyFields);
    }

    private extractPrimaryReason(section: PrimaryReasonSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "primaryReasonBolo", section.getBolo());
        this.read(data, "primaryReasonMotoristAssistance", section.getMotoristAssistance());
        this.read(data, "primaryReasonMovingViolation", section.getMovingViolation());
        this.read(data, "primaryReasonNonMovingViolation", section.getNonMovingViolation());
        this.read(data, "primaryReasonOtherSpecify", section.getOtherSpecify());
        this.read(data, "primaryReasonSuspiciousActivity", section.getSuspiciousActivity());
        this.read(data, "primaryReasonTrafficCollision", section.getTrafficCollision());
    }

    /**
     * The reasons are a "check only one" group, but each is written independently here rather than through
     * `selectReason` so that data checking none of them stays as it arrived instead of being forced into a
     * selection. Data that checks more than one is the source's error to correct, and validation reports it.
     */
    private populatePrimaryReason(section: PrimaryReasonSectionModel, data: IPublicContactOrWarningData, readOnlyFields?: ReadonlySet<keyof IPublicContactOrWarningData>): PrimaryReasonSectionModel {
        let updated = this.write(section, section.bolo, data, "primaryReasonBolo", readOnlyFields);
        updated = this.write(updated, section.motoristAssistance, data, "primaryReasonMotoristAssistance", readOnlyFields);
        updated = this.write(updated, section.movingViolation, data, "primaryReasonMovingViolation", readOnlyFields);
        updated = this.write(updated, section.nonMovingViolation, data, "primaryReasonNonMovingViolation", readOnlyFields);
        updated = this.write(updated, section.otherSpecify, data, "primaryReasonOtherSpecify", readOnlyFields);
        updated = this.write(updated, section.suspiciousActivity, data, "primaryReasonSuspiciousActivity", readOnlyFields);

        return this.write(updated, section.trafficCollision, data, "primaryReasonTrafficCollision", readOnlyFields);
    }

    private extractSearches(section: SearchesSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "searchesBasisOtherSpecify", section.getBasisOtherSpecify());
        this.read(data, "searchesConsentGivenNo", section.getConsentGivenNo());
        this.read(data, "searchesConsentGivenYes", section.getConsentGivenYes());
        this.read(data, "searchesConsentRequestedNo", section.getConsentRequestedNo());
        this.read(data, "searchesConsentRequestedYes", section.getConsentRequestedYes());
        this.read(data, "searchesIncidentToArrest", section.getIncidentToArrest());
        this.read(data, "searchesInventoryVehicleTowed", section.getInventoryVehicleTowed());
        this.read(data, "searchesMadeByConsent", section.getMadeByConsent());
        this.read(data, "searchesOfDriver", section.getOfDriver());
        this.read(data, "searchesOfPassenger", section.getOfPassenger());
        this.read(data, "searchesOfPedestrian", section.getOfPedestrian());
        this.read(data, "searchesOfVehicle", section.getOfVehicle());
        this.read(data, "searchesProbableCause", section.getProbableCause());
    }

    /**
     * The consent yes/no pairs are written independently rather than through `selectConsentRequested` and
     * `selectConsentGiven`, for the same reason the primary reasons are: data that answers neither must stay
     * unanswered rather than be pushed into a "no".
     */
    private populateSearches(section: SearchesSectionModel, data: IPublicContactOrWarningData, readOnlyFields?: ReadonlySet<keyof IPublicContactOrWarningData>): SearchesSectionModel {
        let updated = this.write(section, section.basisOtherSpecify, data, "searchesBasisOtherSpecify", readOnlyFields);
        updated = this.write(updated, section.consentGivenNo, data, "searchesConsentGivenNo", readOnlyFields);
        updated = this.write(updated, section.consentGivenYes, data, "searchesConsentGivenYes", readOnlyFields);
        updated = this.write(updated, section.consentRequestedNo, data, "searchesConsentRequestedNo", readOnlyFields);
        updated = this.write(updated, section.consentRequestedYes, data, "searchesConsentRequestedYes", readOnlyFields);
        updated = this.write(updated, section.incidentToArrest, data, "searchesIncidentToArrest", readOnlyFields);
        updated = this.write(updated, section.inventoryVehicleTowed, data, "searchesInventoryVehicleTowed", readOnlyFields);
        updated = this.write(updated, section.madeByConsent, data, "searchesMadeByConsent", readOnlyFields);
        updated = this.write(updated, section.ofDriver, data, "searchesOfDriver", readOnlyFields);
        updated = this.write(updated, section.ofPassenger, data, "searchesOfPassenger", readOnlyFields);
        updated = this.write(updated, section.ofPedestrian, data, "searchesOfPedestrian", readOnlyFields);
        updated = this.write(updated, section.ofVehicle, data, "searchesOfVehicle", readOnlyFields);

        return this.write(updated, section.probableCause, data, "searchesProbableCause", readOnlyFields);
    }
}
