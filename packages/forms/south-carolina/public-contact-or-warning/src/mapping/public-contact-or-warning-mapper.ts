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
     */
    public populate(form: PublicContactOrWarningFormModel, data: IPublicContactOrWarningData): PublicContactOrWarningFormModel {
        const collection = form.getRecordPageCollection();
        const page = collection.getFirstPage<RecordPageModel>();

        let updated = page.set(page.agencySection, this.populateAgency(page.getAgencySection(), data));
        updated = updated.set(updated.personSection, this.populatePerson(updated.getPersonSection(), data));
        updated = updated.set(updated.routeSection, this.populateRoute(updated.getRouteSection(), data));
        updated = updated.set(updated.stopSection, this.populateStop(updated.getStopSection(), data));
        updated = updated.set(updated.vehicleSection, this.populateVehicle(updated.getVehicleSection(), data));
        updated = updated.set(updated.officerSection, this.populateOfficer(updated.getOfficerSection(), data));
        updated = updated.set(updated.natureOfContactSection, this.populateNatureOfContact(updated.getNatureOfContactSection(), data));
        updated = updated.set(updated.primaryReasonSection, this.populatePrimaryReason(updated.getPrimaryReasonSection(), data));
        updated = updated.set(updated.searchesSection, this.populateSearches(updated.getSearchesSection(), data));

        return form.set(form.recordPage, collection.replace(0, updated));
    }

    private extractAgency(section: AgencySectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "agencyCity", section.getCity());
        this.read(data, "agencyCounty", section.getCounty());
        this.read(data, "agencyName", section.getAgencyName());
    }

    private populateAgency(section: AgencySectionModel, data: IPublicContactOrWarningData): AgencySectionModel {
        let updated = this.write(section, section.city, data.agencyCity);
        updated = this.write(updated, section.county, data.agencyCounty);

        return this.write(updated, section.agencyName, data.agencyName);
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

    private populatePerson(section: PersonSectionModel, data: IPublicContactOrWarningData): PersonSectionModel {
        let updated = this.write(section, section.dateOfBirth, data.personDateOfBirth);
        updated = this.write(updated, section.driverLicenseNumber, data.personDriverLicenseNumber);
        updated = this.write(updated, section.firstName, data.personFirstName);
        updated = this.write(updated, section.gender, data.personGender);
        updated = this.write(updated, section.lastName, data.personLastName);
        updated = this.write(updated, section.latitude, data.personLatitude);
        updated = this.write(updated, section.licensedState, data.personLicensedState);
        updated = this.write(updated, section.longitude, data.personLongitude);
        updated = this.write(updated, section.middleInitial, data.personMiddleInitial);

        return this.write(updated, section.race, data.personRace);
    }

    private extractRoute(section: RouteSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "routeNumberOrName", section.getNumberOrName());
        this.read(data, "routeType", section.getType());
    }

    private populateRoute(section: RouteSectionModel, data: IPublicContactOrWarningData): RouteSectionModel {
        const updated = this.write(section, section.numberOrName, data.routeNumberOrName);

        return this.write(updated, section.type, data.routeType);
    }

    private extractStop(section: StopSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "stopCadCallNumber", section.getCadCallNumber());
        this.read(data, "stopCounty", section.getCounty());
        this.read(data, "stopDate", section.getDate());
        this.read(data, "stopTime", section.getTime());
    }

    private populateStop(section: StopSectionModel, data: IPublicContactOrWarningData): StopSectionModel {
        let updated = this.write(section, section.cadCallNumber, data.stopCadCallNumber);
        updated = this.write(updated, section.county, data.stopCounty);
        updated = this.write(updated, section.date, data.stopDate);

        return this.write(updated, section.time, data.stopTime);
    }

    private extractVehicle(section: VehicleSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "vehicleCmv", section.getCmv());
        this.read(data, "vehicleLicenseNumber", section.getLicenseNumber());
        this.read(data, "vehicleMake", section.getMake());
        this.read(data, "vehicleModel", section.getModel());
        this.read(data, "vehicleState", section.getState());
        this.read(data, "vehicleYear", section.getYear());
    }

    private populateVehicle(section: VehicleSectionModel, data: IPublicContactOrWarningData): VehicleSectionModel {
        let updated = this.write(section, section.cmv, data.vehicleCmv);
        updated = this.write(updated, section.licenseNumber, data.vehicleLicenseNumber);
        updated = this.write(updated, section.make, data.vehicleMake);
        updated = this.write(updated, section.model, data.vehicleModel);
        updated = this.write(updated, section.state, data.vehicleState);

        return this.write(updated, section.year, data.vehicleYear);
    }

    private extractOfficer(section: OfficerSectionModel, data: FormValues<IPublicContactOrWarningData>): void {
        this.read(data, "officerIssuedBy", section.getIssuedBy());
        this.read(data, "officerRank", section.getRank());
        this.read(data, "officerScCjaNumber", section.getScCjaNumber());
    }

    private populateOfficer(section: OfficerSectionModel, data: IPublicContactOrWarningData): OfficerSectionModel {
        let updated = this.write(section, section.issuedBy, data.officerIssuedBy);
        updated = this.write(updated, section.rank, data.officerRank);

        return this.write(updated, section.scCjaNumber, data.officerScCjaNumber);
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

    private populateNatureOfContact(section: NatureOfContactSectionModel, data: IPublicContactOrWarningData): NatureOfContactSectionModel {
        let updated = this.write(section, section.changingLanesUnlawfully, data.natureChangingLanesUnlawfully);
        updated = this.write(updated, section.contactOnly, data.natureContactOnly);
        updated = this.write(updated, section.defectiveEquipment, data.natureDefectiveEquipment);
        updated = this.write(updated, section.disregardingStopSign, data.natureDisregardingStopSign);
        updated = this.write(updated, section.disregardingTrafficSignal, data.natureDisregardingTrafficSignal);
        updated = this.write(updated, section.driversLicenseViolation, data.natureDriversLicenseViolation);
        updated = this.write(updated, section.failureToDimLights, data.natureFailureToDimLights);
        updated = this.write(updated, section.followingTooClose, data.natureFollowingTooClose);
        updated = this.write(updated, section.handsFreeViolation, data.natureHandsFreeViolation);
        updated = this.write(updated, section.immigrationStop, data.natureImmigrationStop);
        updated = this.write(updated, section.improperBacking, data.natureImproperBacking);
        updated = this.write(updated, section.improperLaneUse, data.natureImproperLaneUse);
        updated = this.write(updated, section.improperLights, data.natureImproperLights);
        updated = this.write(updated, section.improperPassing, data.natureImproperPassing);
        updated = this.write(updated, section.improperTurn, data.natureImproperTurn);
        updated = this.write(updated, section.noRightOfWay, data.natureNoRightOfWay);
        updated = this.write(updated, section.other, data.natureOther);
        updated = this.write(updated, section.otherSpecify, data.natureOtherSpecify);
        updated = this.write(updated, section.pedestrian, data.naturePedestrian);
        updated = this.write(updated, section.seatBeltViolation, data.natureSeatBeltViolation);
        updated = this.write(updated, section.speeding, data.natureSpeeding);

        return this.write(updated, section.vehicleLicenseViolation, data.natureVehicleLicenseViolation);
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
    private populatePrimaryReason(section: PrimaryReasonSectionModel, data: IPublicContactOrWarningData): PrimaryReasonSectionModel {
        let updated = this.write(section, section.bolo, data.primaryReasonBolo);
        updated = this.write(updated, section.motoristAssistance, data.primaryReasonMotoristAssistance);
        updated = this.write(updated, section.movingViolation, data.primaryReasonMovingViolation);
        updated = this.write(updated, section.nonMovingViolation, data.primaryReasonNonMovingViolation);
        updated = this.write(updated, section.otherSpecify, data.primaryReasonOtherSpecify);
        updated = this.write(updated, section.suspiciousActivity, data.primaryReasonSuspiciousActivity);

        return this.write(updated, section.trafficCollision, data.primaryReasonTrafficCollision);
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
    private populateSearches(section: SearchesSectionModel, data: IPublicContactOrWarningData): SearchesSectionModel {
        let updated = this.write(section, section.basisOtherSpecify, data.searchesBasisOtherSpecify);
        updated = this.write(updated, section.consentGivenNo, data.searchesConsentGivenNo);
        updated = this.write(updated, section.consentGivenYes, data.searchesConsentGivenYes);
        updated = this.write(updated, section.consentRequestedNo, data.searchesConsentRequestedNo);
        updated = this.write(updated, section.consentRequestedYes, data.searchesConsentRequestedYes);
        updated = this.write(updated, section.incidentToArrest, data.searchesIncidentToArrest);
        updated = this.write(updated, section.inventoryVehicleTowed, data.searchesInventoryVehicleTowed);
        updated = this.write(updated, section.madeByConsent, data.searchesMadeByConsent);
        updated = this.write(updated, section.ofDriver, data.searchesOfDriver);
        updated = this.write(updated, section.ofPassenger, data.searchesOfPassenger);
        updated = this.write(updated, section.ofPedestrian, data.searchesOfPedestrian);
        updated = this.write(updated, section.ofVehicle, data.searchesOfVehicle);

        return this.write(updated, section.probableCause, data.searchesProbableCause);
    }
}
