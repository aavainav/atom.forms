import { FormMapper, FormValues } from "@forms/core";

import { OKTrafficFormModel } from "../models/traffic-form";
import { ComplaintPageModel } from "../models/complaint-page/complaint-page";
import { ArraignmentSectionModel } from "../models/complaint-page/arraignment-section";
import { DefendantSectionModel } from "../models/complaint-page/defendant-section";
import { DescriptionSectionModel } from "../models/complaint-page/description-section";
import { HeaderSectionModel } from "../models/complaint-page/header-section";
import { LicenseSectionModel } from "../models/complaint-page/license-section";
import { OffenseSectionModel } from "../models/complaint-page/offense-section";
import { OfficerSectionModel } from "../models/complaint-page/officer-section";
import { SwornSectionModel } from "../models/complaint-page/sworn-section";
import { VehicleSectionModel } from "../models/complaint-page/vehicle-section";
import { ViolationInformationSectionModel } from "../models/complaint-page/violation-information-section";
import { ViolationSectionModel } from "../models/complaint-page/violation-section";
import { WarrantPageModel } from "../models/warrant-page/warrant-page";
import { CertificationSectionModel } from "../models/warrant-page/certification-section";
import { ComplaintSectionModel } from "../models/warrant-page/complaint-section";
import { WarrantSectionModel } from "../models/warrant-page/warrant-section";
import { SupplementPageModel } from "../models/supplement-page/supplement-page";
import { NotesSectionModel } from "../models/supplement-page/notes-section";
import { RegisteredOwnerSectionModel } from "../models/supplement-page/registered-owner-section";
import { StatusSectionModel } from "../models/supplement-page/status-section";
import { WitnessSectionModel } from "../models/supplement-page/witness-section";
import { IOKTrafficData, IOKTrafficViolationData } from "./traffic-data";

/**
 * Maps the Oklahoma City traffic citation form to and from the data contract it publishes.
 *
 * Each section's read sits directly above its write below, so a field added to one direction and forgotten in
 * the other shows up in the same diff. Keeping the two directions in step is what makes the round trip hold.
 *
 * The complaint page repeats once per charge the citation is written for, so populating may have to create pages
 * and therefore answers with a promise; the warrant and supplement pages appear once each.
 */
export class OKTrafficMapper extends FormMapper<OKTrafficFormModel, IOKTrafficData> {
    /** Returns the form's current values as its data contract, emitting only the fields this form owns. */
    public extract(form: OKTrafficFormModel): IOKTrafficData {
        const complaintPages = form.getComplaintPageCollection().getPages<ComplaintPageModel>();
        const complaintPage = complaintPages[0];
        const warrantPage = form.getWarrantPage();
        const supplementPage = form.getSupplementPage();
        const data: FormValues<IOKTrafficData> = {};

        this.extractHeader(complaintPage.getHeaderSection(), data);
        this.extractDefendant(complaintPage.getDefendantSection(), data);
        this.extractLicense(complaintPage.getLicenseSection(), data);
        this.extractDescription(complaintPage.getDescriptionSection(), data);
        this.extractVehicle(complaintPage.getVehicleSection(), data);
        this.extractViolation(complaintPage.getViolationSection(), data);
        this.extractOffense(complaintPage.getOffenseSection(), data);
        this.extractViolationInformation(complaintPage.getViolationInformationSection(), data);
        this.extractOfficer(complaintPage.getOfficerSection(), data);
        this.extractSworn(complaintPage.getSwornSection(), data);
        this.extractArraignment(complaintPage.getArraignmentSection(), data);

        this.extractComplaint(warrantPage.getComplaintSection(), data);
        this.extractCertification(warrantPage.getCertificationSection(), data);
        this.extractWarrant(warrantPage.getWarrantSection(), data);

        this.extractWitness(supplementPage.getWitnessSection(), data);
        this.extractRegisteredOwner(supplementPage.getRegisteredOwnerSection(), data);
        this.extractStatus(supplementPage.getStatusSection(), data);
        this.extractNotes(supplementPage.getNotesSection(), data);

        if (complaintPages.length > 1) {
            data.additionalViolations = complaintPages.slice(1).map(page => this.extractViolationRecord(page));
        }

        return data;
    }

    /** Returns one further charge's values, as the record carried for each complaint page beyond the first. */
    private extractViolationRecord(page: ComplaintPageModel): IOKTrafficViolationData {
        const violation: FormValues<IOKTrafficViolationData> = {};

        this.extractViolation(page.getViolationSection(), violation);
        this.extractOffense(page.getOffenseSection(), violation);
        this.extractViolationInformation(page.getViolationInformationSection(), violation);

        return violation;
    }

    /**
     * Returns a new form with the given data applied. Every field of the form is reachable from the data contract,
     * and a field the data does not mention keeps the value it already holds - which is how the date and time of
     * the offense the form stamps on itself survive a partial record.
     */
    public async populate(form: OKTrafficFormModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): Promise<OKTrafficFormModel> {
        let updated = await this.populateComplaintPage(form, data, readOnlyFields);
        updated = this.populateWarrantPage(updated, data, readOnlyFields);

        return this.populateSupplementPage(updated, data, readOnlyFields);
    }

    /**
     * Returns a form with the complaint page's half of the data contract applied, creating a page per further
     * violation.
     *
     * The shared sections are written onto every page rather than only the first: a page created here does not go
     * through the form controller, which is what would otherwise have copied them across. Pages beyond the end of
     * `additionalViolations` are left alone rather than removed.
     */
    private async populateComplaintPage(form: OKTrafficFormModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): Promise<OKTrafficFormModel> {
        const additional = data.additionalViolations ?? [];

        let result = form;

        // initialize must be awaited, since it is what creates the page's sections and registers its dropzones
        while (result.getComplaintPageCollection().pages.length < additional.length + 1) {
            result = result.addPage(await result.complaintPage.createPage(result).initialize(), result.complaintPage);
        }

        let collection = result.getComplaintPageCollection();

        collection.getPages<ComplaintPageModel>().forEach((page, index) => {
            let updated = page.set(page.headerSection, this.populateHeader(page.getHeaderSection(), data, readOnlyFields));
            updated = updated.set(updated.defendantSection, this.populateDefendant(updated.getDefendantSection(), data, readOnlyFields));
            updated = updated.set(updated.licenseSection, this.populateLicense(updated.getLicenseSection(), data, readOnlyFields));
            updated = updated.set(updated.descriptionSection, this.populateDescription(updated.getDescriptionSection(), data, readOnlyFields));
            updated = updated.set(updated.vehicleSection, this.populateVehicle(updated.getVehicleSection(), data, readOnlyFields));
            updated = updated.set(updated.officerSection, this.populateOfficer(updated.getOfficerSection(), data, readOnlyFields));
            updated = updated.set(updated.swornSection, this.populateSworn(updated.getSwornSection(), data, readOnlyFields));
            updated = updated.set(updated.arraignmentSection, this.populateArraignment(updated.getArraignmentSection(), data, readOnlyFields));

            // the violation, offense and violation-information blocks are what differ page to page; the first
            // charge comes from the flat fields and the rest from the array
            const violation = index === 0 ? data : additional[index - 1];
            if (violation) {
                updated = updated.set(updated.violationSection, this.populateViolation(updated.getViolationSection(), violation));
                updated = updated.set(updated.offenseSection, this.populateOffense(updated.getOffenseSection(), violation));
                updated = updated.set(updated.violationInformationSection, this.populateViolationInformation(updated.getViolationInformationSection(), violation));
            }

            collection = collection.replace(index, updated);
        });

        return result.set(result.complaintPage, collection);
    }

    /** Returns a form with the warrant page's half of the data contract applied. */
    private populateWarrantPage(form: OKTrafficFormModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): OKTrafficFormModel {
        const collection = form.getWarrantPageCollection();
        const page = collection.getFirstPage<WarrantPageModel>();

        let updated = page.set(page.complaintSection, this.populateComplaint(page.getComplaintSection(), data, readOnlyFields));
        updated = updated.set(updated.certificationSection, this.populateCertification(updated.getCertificationSection(), data, readOnlyFields));
        updated = updated.set(updated.warrantSection, this.populateWarrant(updated.getWarrantSection(), data, readOnlyFields));

        return form.set(form.warrantPage, collection.replace(0, updated));
    }

    /** Returns a form with the supplement page's half of the data contract applied. */
    private populateSupplementPage(form: OKTrafficFormModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): OKTrafficFormModel {
        const collection = form.getSupplementPageCollection();
        const page = collection.getFirstPage<SupplementPageModel>();

        let updated = page.set(page.witnessSection, this.populateWitness(page.getWitnessSection(), data, readOnlyFields));
        updated = updated.set(updated.registeredOwnerSection, this.populateRegisteredOwner(updated.getRegisteredOwnerSection(), data, readOnlyFields));
        updated = updated.set(updated.statusSection, this.populateStatus(updated.getStatusSection(), data, readOnlyFields));
        updated = updated.set(updated.notesSection, this.populateNotes(updated.getNotesSection(), data, readOnlyFields));

        return form.set(form.supplementPage, collection.replace(0, updated));
    }

    private extractHeader(section: HeaderSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "headerCitationNumber", section.getCitationNumber());
    }

    private populateHeader(section: HeaderSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): HeaderSectionModel {
        return this.write(section, section.citationNumber, data, "headerCitationNumber", readOnlyFields);
    }

    private extractDefendant(section: DefendantSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "defendantAddress", section.getAddress());
        this.read(data, "defendantCity", section.getCity());
        this.read(data, "defendantFirstName", section.getFirstName());
        this.read(data, "defendantLastName", section.getLastName());
        this.read(data, "defendantMiddleName", section.getMiddleName());
        this.read(data, "defendantState", section.getState());
        this.read(data, "defendantZipCode", section.getZipCode());
    }

    private populateDefendant(section: DefendantSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): DefendantSectionModel {
        let updated = this.write(section, section.address, data, "defendantAddress", readOnlyFields);
        updated = this.write(updated, section.city, data, "defendantCity", readOnlyFields);
        updated = this.write(updated, section.firstName, data, "defendantFirstName", readOnlyFields);
        updated = this.write(updated, section.lastName, data, "defendantLastName", readOnlyFields);
        updated = this.write(updated, section.middleName, data, "defendantMiddleName", readOnlyFields);
        updated = this.write(updated, section.state, data, "defendantState", readOnlyFields);

        return this.write(updated, section.zipCode, data, "defendantZipCode", readOnlyFields);
    }

    private extractLicense(section: LicenseSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "licenseClass", section.getLicenseClass());
        this.read(data, "licenseEndorsements", section.getEndorsements());
        this.read(data, "licenseExpires", section.getExpires());
        this.read(data, "licenseIdentifier", section.getIdentifier());
        this.read(data, "licenseState", section.getState());
    }

    private populateLicense(section: LicenseSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): LicenseSectionModel {
        let updated = this.write(section, section.licenseClass, data, "licenseClass", readOnlyFields);
        updated = this.write(updated, section.endorsements, data, "licenseEndorsements", readOnlyFields);
        updated = this.write(updated, section.expires, data, "licenseExpires", readOnlyFields);
        updated = this.write(updated, section.identifier, data, "licenseIdentifier", readOnlyFields);

        return this.write(updated, section.state, data, "licenseState", readOnlyFields);
    }

    private extractDescription(section: DescriptionSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "descriptionDateOfBirth", section.getDateOfBirth());
        this.read(data, "descriptionEthnicity", section.getEthnicity());
        this.read(data, "descriptionHeight", section.getHeight());
        this.read(data, "descriptionRace", section.getRace());
        this.read(data, "descriptionSex", section.getSex());
        this.read(data, "descriptionWeight", section.getWeight());
    }

    private populateDescription(section: DescriptionSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): DescriptionSectionModel {
        let updated = this.write(section, section.dateOfBirth, data, "descriptionDateOfBirth", readOnlyFields);
        updated = this.write(updated, section.ethnicity, data, "descriptionEthnicity", readOnlyFields);
        updated = this.write(updated, section.height, data, "descriptionHeight", readOnlyFields);
        updated = this.write(updated, section.race, data, "descriptionRace", readOnlyFields);
        updated = this.write(updated, section.sex, data, "descriptionSex", readOnlyFields);

        return this.write(updated, section.weight, data, "descriptionWeight", readOnlyFields);
    }

    private extractVehicle(section: VehicleSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "vehicleColor", section.getColor());
        this.read(data, "vehicleCommercialVehicle", section.getCommercialVehicle());
        this.read(data, "vehicleHazardousMaterials", section.getHazardousMaterials());
        this.read(data, "vehicleMake", section.getMake());
        this.read(data, "vehicleModel", section.getModel());
        this.read(data, "vehicleRegistrationExpires", section.getRegistrationExpires());
        this.read(data, "vehicleStyle", section.getStyle());
        this.read(data, "vehicleTag", section.getTag());
        this.read(data, "vehicleTagState", section.getTagState());
        this.read(data, "vehicleVin", section.getVin());
        this.read(data, "vehicleYear", section.getYear());
    }

    private populateVehicle(section: VehicleSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): VehicleSectionModel {
        let updated = this.write(section, section.color, data, "vehicleColor", readOnlyFields);
        updated = this.write(updated, section.commercialVehicle, data, "vehicleCommercialVehicle", readOnlyFields);
        updated = this.write(updated, section.hazardousMaterials, data, "vehicleHazardousMaterials", readOnlyFields);
        updated = this.write(updated, section.make, data, "vehicleMake", readOnlyFields);
        updated = this.write(updated, section.model, data, "vehicleModel", readOnlyFields);
        updated = this.write(updated, section.registrationExpires, data, "vehicleRegistrationExpires", readOnlyFields);
        updated = this.write(updated, section.style, data, "vehicleStyle", readOnlyFields);
        updated = this.write(updated, section.tag, data, "vehicleTag", readOnlyFields);
        updated = this.write(updated, section.tagState, data, "vehicleTagState", readOnlyFields);
        updated = this.write(updated, section.vin, data, "vehicleVin", readOnlyFields);

        return this.write(updated, section.year, data, "vehicleYear", readOnlyFields);
    }

    private extractViolation(section: ViolationSectionModel, data: FormValues<IOKTrafficViolationData>): void {
        this.read(data, "violationByActOf", section.getByActOf());
        this.read(data, "violationCounty", section.getCounty());
        this.read(data, "violationDate", section.getDate());
        this.read(data, "violationIsBlock", section.getIsBlock());
        this.read(data, "violationLocation", section.getLocation());
        this.read(data, "violationMunicipalCode", section.getMunicipalCode());
        this.read(data, "violationOffenseCode", section.getOffenseCode());
        this.read(data, "violationTime", section.getTime());
    }

    private populateViolation(section: ViolationSectionModel, data: IOKTrafficViolationData): ViolationSectionModel {
        let updated = this.write(section, section.byActOf, data, "violationByActOf");
        updated = this.write(updated, section.county, data, "violationCounty");
        updated = this.write(updated, section.date, data, "violationDate");
        updated = this.write(updated, section.isBlock, data, "violationIsBlock");
        updated = this.write(updated, section.location, data, "violationLocation");
        updated = this.write(updated, section.municipalCode, data, "violationMunicipalCode");
        updated = this.write(updated, section.offenseCode, data, "violationOffenseCode");

        return this.write(updated, section.time, data, "violationTime");
    }

    private extractOffense(section: OffenseSectionModel, data: FormValues<IOKTrafficViolationData>): void {
        this.read(data, "offenseAmountDue", section.getAmountDue());
        this.read(data, "offenseDueDate", section.getDueDate());
        this.read(data, "offenseNotes", section.getNotes());
    }

    private populateOffense(section: OffenseSectionModel, data: IOKTrafficViolationData): OffenseSectionModel {
        let updated = this.write(section, section.amountDue, data, "offenseAmountDue");
        updated = this.write(updated, section.dueDate, data, "offenseDueDate");

        return this.write(updated, section.notes, data, "offenseNotes");
    }

    private extractViolationInformation(section: ViolationInformationSectionModel, data: FormValues<IOKTrafficViolationData>): void {
        this.read(data, "violationInformationActualSpeed", section.getActualSpeed());
        this.read(data, "violationInformationHighFatalitySpeed", section.getHighFatalitySpeed());
        this.read(data, "violationInformationIncidentNumber", section.getIncidentNumber());
        this.read(data, "violationInformationLidarDistance", section.getLidarDistance());
        this.read(data, "violationInformationOffenseLevel", section.getOffenseLevel());
        this.read(data, "violationInformationSpeedDetection", section.getSpeedDetection());
        this.read(data, "violationInformationSpeedLimit", section.getSpeedLimit());
    }

    private populateViolationInformation(section: ViolationInformationSectionModel, data: IOKTrafficViolationData): ViolationInformationSectionModel {
        let updated = this.write(section, section.actualSpeed, data, "violationInformationActualSpeed");
        updated = this.write(updated, section.highFatalitySpeed, data, "violationInformationHighFatalitySpeed");
        updated = this.write(updated, section.incidentNumber, data, "violationInformationIncidentNumber");
        updated = this.write(updated, section.lidarDistance, data, "violationInformationLidarDistance");
        updated = this.write(updated, section.offenseLevel, data, "violationInformationOffenseLevel");
        updated = this.write(updated, section.speedDetection, data, "violationInformationSpeedDetection");

        return this.write(updated, section.speedLimit, data, "violationInformationSpeedLimit");
    }

    private extractOfficer(section: OfficerSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "officerBodyWornCamera", section.getBodyWornCamera());
        this.read(data, "officerCommissionNumber", section.getCommissionNumber());
        this.read(data, "officerComplainantSignature", section.getComplainantSignature());
        this.read(data, "officerName", section.getOfficerName());
        this.read(data, "officerSecondBodyWornCamera", section.getSecondBodyWornCamera());
        this.read(data, "officerSecondCommissionNumber", section.getSecondCommissionNumber());
        this.read(data, "officerSecondName", section.getSecondOfficerName());
    }

    private populateOfficer(section: OfficerSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): OfficerSectionModel {
        let updated = this.write(section, section.bodyWornCamera, data, "officerBodyWornCamera", readOnlyFields);
        updated = this.write(updated, section.commissionNumber, data, "officerCommissionNumber", readOnlyFields);
        updated = this.write(updated, section.complainantSignature, data, "officerComplainantSignature", readOnlyFields);
        updated = this.write(updated, section.officerName, data, "officerName", readOnlyFields);
        updated = this.write(updated, section.secondBodyWornCamera, data, "officerSecondBodyWornCamera", readOnlyFields);
        updated = this.write(updated, section.secondCommissionNumber, data, "officerSecondCommissionNumber", readOnlyFields);

        return this.write(updated, section.secondOfficerName, data, "officerSecondName", readOnlyFields);
    }

    private extractSworn(section: SwornSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "swornDate", section.getDate());
        this.read(data, "swornName", section.getSwornName());
        this.read(data, "swornTitle", section.getTitle());
    }

    private populateSworn(section: SwornSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): SwornSectionModel {
        let updated = this.write(section, section.date, data, "swornDate", readOnlyFields);
        updated = this.write(updated, section.swornName, data, "swornName", readOnlyFields);

        return this.write(updated, section.title, data, "swornTitle", readOnlyFields);
    }

    private extractArraignment(section: ArraignmentSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "arraignmentCourtDate", section.getCourtDate());
        this.read(data, "arraignmentCourtTime", section.getCourtTime());
        this.read(data, "arraignmentDefendantSignature", section.getDefendantSignature());
    }

    private populateArraignment(section: ArraignmentSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): ArraignmentSectionModel {
        let updated = this.write(section, section.courtDate, data, "arraignmentCourtDate", readOnlyFields);
        updated = this.write(updated, section.courtTime, data, "arraignmentCourtTime", readOnlyFields);

        return this.write(updated, section.defendantSignature, data, "arraignmentDefendantSignature", readOnlyFields);
    }

    private extractComplaint(section: ComplaintSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "complaintCitationNumber", section.getCitationNumber());
        this.read(data, "complaintCounselor", section.getCounselor());
        this.read(data, "complaintDate", section.getDate());
    }

    private populateComplaint(section: ComplaintSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): ComplaintSectionModel {
        let updated = this.write(section, section.citationNumber, data, "complaintCitationNumber", readOnlyFields);
        updated = this.write(updated, section.counselor, data, "complaintCounselor", readOnlyFields);

        return this.write(updated, section.date, data, "complaintDate", readOnlyFields);
    }

    private extractCertification(section: CertificationSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "certificationClerkSignature", section.getClerkSignature());
        this.read(data, "certificationDate", section.getDate());
    }

    private populateCertification(section: CertificationSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): CertificationSectionModel {
        const updated = this.write(section, section.clerkSignature, data, "certificationClerkSignature", readOnlyFields);

        return this.write(updated, section.date, data, "certificationDate", readOnlyFields);
    }

    private extractWarrant(section: WarrantSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "warrantApproved", section.getApproved());
        this.read(data, "warrantCounselor", section.getCounselor());
    }

    private populateWarrant(section: WarrantSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): WarrantSectionModel {
        const updated = this.write(section, section.approved, data, "warrantApproved", readOnlyFields);

        return this.write(updated, section.counselor, data, "warrantCounselor", readOnlyFields);
    }

    private extractWitness(section: WitnessSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "witnessAddress", section.getAddress());
        this.read(data, "witnessCity", section.getCity());
        this.read(data, "witnessEmail", section.getEmail());
        this.read(data, "witnessName", section.getWitnessName());
        this.read(data, "witnessPhone", section.getPhone());
        this.read(data, "witnessSocialSecurityNumber", section.getSocialSecurityNumber());
        this.read(data, "witnessState", section.getState());
        this.read(data, "witnessType", section.getType());
        this.read(data, "witnessZipCode", section.getZipCode());
    }

    private populateWitness(section: WitnessSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): WitnessSectionModel {
        let updated = this.write(section, section.address, data, "witnessAddress", readOnlyFields);
        updated = this.write(updated, section.city, data, "witnessCity", readOnlyFields);
        updated = this.write(updated, section.email, data, "witnessEmail", readOnlyFields);
        updated = this.write(updated, section.witnessName, data, "witnessName", readOnlyFields);
        updated = this.write(updated, section.phone, data, "witnessPhone", readOnlyFields);
        updated = this.write(updated, section.socialSecurityNumber, data, "witnessSocialSecurityNumber", readOnlyFields);
        updated = this.write(updated, section.state, data, "witnessState", readOnlyFields);
        updated = this.write(updated, section.type, data, "witnessType", readOnlyFields);

        return this.write(updated, section.zipCode, data, "witnessZipCode", readOnlyFields);
    }

    private extractRegisteredOwner(section: RegisteredOwnerSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "ownerAddress", section.getAddress());
        this.read(data, "ownerCity", section.getCity());
        this.read(data, "ownerName", section.getOwnerName());
        this.read(data, "ownerSameAsSuspect", section.getSameAsSuspect());
        this.read(data, "ownerState", section.getState());
        this.read(data, "ownerZipCode", section.getZipCode());
    }

    private populateRegisteredOwner(section: RegisteredOwnerSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): RegisteredOwnerSectionModel {
        let updated = this.write(section, section.address, data, "ownerAddress", readOnlyFields);
        updated = this.write(updated, section.city, data, "ownerCity", readOnlyFields);
        updated = this.write(updated, section.ownerName, data, "ownerName", readOnlyFields);
        updated = this.write(updated, section.sameAsSuspect, data, "ownerSameAsSuspect", readOnlyFields);
        updated = this.write(updated, section.state, data, "ownerState", readOnlyFields);

        return this.write(updated, section.zipCode, data, "ownerZipCode", readOnlyFields);
    }

    private extractStatus(section: StatusSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "statusAssignment", section.getAssignment());
        this.read(data, "statusConstructionWorkZone", section.getConstructionWorkZone());
        this.read(data, "statusDirectionOfTravel", section.getDirectionOfTravel());
        this.read(data, "statusEthnicity", section.getEthnicity());
        this.read(data, "statusJailed", section.getJailed());
        this.read(data, "statusMainPhone", section.getMainPhone());
        this.read(data, "statusNoLicensePlate", section.getNoLicensePlate());
        this.read(data, "statusReleaseType", section.getReleaseType());
        this.read(data, "statusRequestWarrant", section.getRequestWarrant());
        this.read(data, "statusSchoolZone", section.getSchoolZone());
        this.read(data, "statusSigned", section.getSigned());
        this.read(data, "statusTrailerState", section.getTrailerState());
        this.read(data, "statusTrailerTag", section.getTrailerTag());
        this.read(data, "statusTransient", section.getTransient());
        this.read(data, "statusTribe", section.getTribe());
        this.read(data, "statusVoidReason", section.getVoidReason());
        this.read(data, "statusWitnessCaptured", section.getWitnessCaptured());
    }

    private populateStatus(section: StatusSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): StatusSectionModel {
        let updated = this.write(section, section.assignment, data, "statusAssignment", readOnlyFields);
        updated = this.write(updated, section.constructionWorkZone, data, "statusConstructionWorkZone", readOnlyFields);
        updated = this.write(updated, section.directionOfTravel, data, "statusDirectionOfTravel", readOnlyFields);
        updated = this.write(updated, section.ethnicity, data, "statusEthnicity", readOnlyFields);
        updated = this.write(updated, section.jailed, data, "statusJailed", readOnlyFields);
        updated = this.write(updated, section.mainPhone, data, "statusMainPhone", readOnlyFields);
        updated = this.write(updated, section.noLicensePlate, data, "statusNoLicensePlate", readOnlyFields);
        updated = this.write(updated, section.releaseType, data, "statusReleaseType", readOnlyFields);
        updated = this.write(updated, section.requestWarrant, data, "statusRequestWarrant", readOnlyFields);
        updated = this.write(updated, section.schoolZone, data, "statusSchoolZone", readOnlyFields);
        updated = this.write(updated, section.signed, data, "statusSigned", readOnlyFields);
        updated = this.write(updated, section.trailerState, data, "statusTrailerState", readOnlyFields);
        updated = this.write(updated, section.trailerTag, data, "statusTrailerTag", readOnlyFields);
        updated = this.write(updated, section.transient, data, "statusTransient", readOnlyFields);
        updated = this.write(updated, section.tribe, data, "statusTribe", readOnlyFields);
        updated = this.write(updated, section.voidReason, data, "statusVoidReason", readOnlyFields);

        return this.write(updated, section.witnessCaptured, data, "statusWitnessCaptured", readOnlyFields);
    }

    private extractNotes(section: NotesSectionModel, data: FormValues<IOKTrafficData>): void {
        this.read(data, "notesOfficerNotes", section.getOfficerNotes());
    }

    private populateNotes(section: NotesSectionModel, data: IOKTrafficData, readOnlyFields?: ReadonlySet<keyof IOKTrafficData>): NotesSectionModel {
        return this.write(section, section.officerNotes, data, "notesOfficerNotes", readOnlyFields);
    }
}
