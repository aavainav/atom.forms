import { FormMapper, FormValues } from "@forms/core";

import { OKParkingFormModel } from "../models/parking-form";
import { CitationPageModel } from "../models/citation-page/citation-page";
import { CourtSectionModel } from "../models/citation-page/court-section";
import { OfficerSectionModel } from "../models/citation-page/officer-section";
import { PaymentSectionModel } from "../models/citation-page/payment-section";
import { VehicleSectionModel } from "../models/citation-page/vehicle-section";
import { ViolationSectionModel } from "../models/citation-page/violation-section";
import { ComplaintPageModel } from "../models/complaint-page/complaint-page";
import { CertificationSectionModel } from "../models/complaint-page/certification-section";
import { ComplaintSectionModel } from "../models/complaint-page/complaint-section";
import { WarrantSectionModel } from "../models/complaint-page/warrant-section";
import { DetailPageModel } from "../models/detail-page/detail-page";
import { NotesSectionModel } from "../models/detail-page/notes-section";
import { RecordSectionModel } from "../models/detail-page/record-section";
import { RegisteredOwnerSectionModel } from "../models/detail-page/registered-owner-section";
import { VehicleDetailSectionModel } from "../models/detail-page/vehicle-detail-section";
import { IOKParkingData, IOKParkingViolationData } from "./parking-data";

/**
 * Maps the Oklahoma City parking violation form to and from the data contract it publishes.
 *
 * Each section's read sits directly above its write below, so a field added to one direction and forgotten in
 * the other shows up in the same diff. Keeping the two directions in step is what makes the round trip hold.
 *
 * Every page appears once, so populating creates no pages and answers with the form rather than a promise.
 */
export class OKParkingMapper extends FormMapper<OKParkingFormModel, IOKParkingData> {
    /** Returns the form's current values as its data contract, emitting only the fields this form owns. */
    public extract(form: OKParkingFormModel): IOKParkingData {
        const citationPages = form.getCitationPageCollection().getPages<CitationPageModel>();
        const citationPage = citationPages[0];
        const complaintPage = form.getComplaintPage();
        const detailPage = form.getDetailPage();
        const data: FormValues<IOKParkingData> = {};

        this.extractViolation(citationPage.getViolationSection(), data);
        this.extractPayment(citationPage.getPaymentSection(), data);
        this.extractCourt(citationPage.getCourtSection(), data);
        this.extractVehicle(citationPage.getVehicleSection(), data);
        this.extractOfficer(citationPage.getOfficerSection(), data);

        this.extractComplaint(complaintPage.getComplaintSection(), data);
        this.extractCertification(complaintPage.getCertificationSection(), data);
        this.extractWarrant(complaintPage.getWarrantSection(), data);

        this.extractRecord(detailPage.getRecordSection(), data);
        this.extractRegisteredOwner(detailPage.getRegisteredOwnerSection(), data);
        this.extractVehicleDetail(detailPage.getVehicleDetailSection(), data);
        this.extractNotes(detailPage.getNotesSection(), data);

        if (citationPages.length > 1) {
            data.additionalViolations = citationPages.slice(1).map(page => this.extractViolationRecord(page));
        }

        return data;
    }

    /** Returns one further violation's values, as the record carried for each citation page beyond the first. */
    private extractViolationRecord(page: CitationPageModel): IOKParkingViolationData {
        const violation: FormValues<IOKParkingViolationData> = {};

        this.extractViolation(page.getViolationSection(), violation);
        this.extractPayment(page.getPaymentSection(), violation);

        return violation;
    }

    /**
     * Returns a new form with the given data applied. Every field of the form is reachable from the data contract,
     * and a field the data does not mention keeps the value it already holds - which is how the date and time of
     * violation the form stamps on itself survive a partial record.
     */
    public async populate(form: OKParkingFormModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): Promise<OKParkingFormModel> {
        let updated = await this.populateCitationPage(form, data, readOnlyFields);
        updated = this.populateComplaintPage(updated, data, readOnlyFields);

        return this.populateDetailPage(updated, data, readOnlyFields);
    }

    /**
     * Returns a form with the citation page's half of the data contract applied, creating a page per further
     * violation.
     *
     * The shared sections are written onto every page rather than only the first: a page created here does not go
     * through the form controller, which is what would otherwise have copied them across. Pages beyond the end of
     * `additionalViolations` are left alone rather than removed.
     */
    private async populateCitationPage(form: OKParkingFormModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): Promise<OKParkingFormModel> {
        const additional = data.additionalViolations ?? [];

        let result = form;

        // initialize must be awaited, since it is what creates the page's sections and registers its dropzones
        while (result.getCitationPageCollection().pages.length < additional.length + 1) {
            result = result.addPage(await result.citationPage.createPage(result).initialize(), result.citationPage);
        }

        let collection = result.getCitationPageCollection();

        collection.getPages<CitationPageModel>().forEach((page, index) => {
            let updated = page.set(page.courtSection, this.populateCourt(page.getCourtSection(), data, readOnlyFields));
            updated = updated.set(updated.vehicleSection, this.populateVehicle(updated.getVehicleSection(), data, readOnlyFields));
            updated = updated.set(updated.officerSection, this.populateOfficer(updated.getOfficerSection(), data, readOnlyFields));

            // the violation and payment blocks are what differ page to page; the first comes from the flat fields
            // and the rest from the array, and a page the data does not reach keeps what it holds
            const violation = index === 0 ? data : additional[index - 1];
            if (violation) {
                updated = updated.set(updated.violationSection, this.populateViolation(updated.getViolationSection(), violation));
                updated = updated.set(updated.paymentSection, this.populatePayment(updated.getPaymentSection(), violation));
            }

            collection = collection.replace(index, updated);
        });

        return result.set(result.citationPage, collection);
    }

    /** Returns a form with the complaint page's half of the data contract applied. */
    private populateComplaintPage(form: OKParkingFormModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): OKParkingFormModel {
        const collection = form.getComplaintPageCollection();
        const page = collection.getFirstPage<ComplaintPageModel>();

        let updated = page.set(page.complaintSection, this.populateComplaint(page.getComplaintSection(), data, readOnlyFields));
        updated = updated.set(updated.certificationSection, this.populateCertification(updated.getCertificationSection(), data, readOnlyFields));
        updated = updated.set(updated.warrantSection, this.populateWarrant(updated.getWarrantSection(), data, readOnlyFields));

        return form.set(form.complaintPage, collection.replace(0, updated));
    }

    /** Returns a form with the detail page's half of the data contract applied. */
    private populateDetailPage(form: OKParkingFormModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): OKParkingFormModel {
        const collection = form.getDetailPageCollection();
        const page = collection.getFirstPage<DetailPageModel>();

        let updated = page.set(page.recordSection, this.populateRecord(page.getRecordSection(), data, readOnlyFields));
        updated = updated.set(updated.registeredOwnerSection, this.populateRegisteredOwner(updated.getRegisteredOwnerSection(), data, readOnlyFields));
        updated = updated.set(updated.vehicleDetailSection, this.populateVehicleDetail(updated.getVehicleDetailSection(), data, readOnlyFields));
        updated = updated.set(updated.notesSection, this.populateNotes(updated.getNotesSection(), data, readOnlyFields));

        return form.set(form.detailPage, collection.replace(0, updated));
    }

    private extractViolation(section: ViolationSectionModel, data: FormValues<IOKParkingViolationData>): void {
        this.read(data, "violationCode", section.getCode());
        this.read(data, "violationDate", section.getDate());
        this.read(data, "violationDescription", section.getDescription());
        this.read(data, "violationLocation", section.getLocation());
        this.read(data, "violationTime", section.getTime());
    }

    private populateViolation(section: ViolationSectionModel, data: IOKParkingViolationData): ViolationSectionModel {
        let updated = this.write(section, section.code, data, "violationCode");
        updated = this.write(updated, section.date, data, "violationDate");
        updated = this.write(updated, section.description, data, "violationDescription");
        updated = this.write(updated, section.location, data, "violationLocation");

        return this.write(updated, section.time, data, "violationTime");
    }

    private extractPayment(section: PaymentSectionModel, data: FormValues<IOKParkingViolationData>): void {
        this.read(data, "paymentAmountDue", section.getAmountDue());
        this.read(data, "paymentDueDate", section.getDueDate());
        this.read(data, "paymentIncreasedAmountDue", section.getIncreasedAmountDue());
        this.read(data, "paymentIncreasedDueDate", section.getIncreasedDueDate());
    }

    private populatePayment(section: PaymentSectionModel, data: IOKParkingViolationData): PaymentSectionModel {
        let updated = this.write(section, section.amountDue, data, "paymentAmountDue");
        updated = this.write(updated, section.dueDate, data, "paymentDueDate");
        updated = this.write(updated, section.increasedAmountDue, data, "paymentIncreasedAmountDue");

        return this.write(updated, section.increasedDueDate, data, "paymentIncreasedDueDate");
    }

    private extractCourt(section: CourtSectionModel, data: FormValues<IOKParkingData>): void {
        this.read(data, "courtDate", section.getDate());
        this.read(data, "courtTime", section.getTime());
    }

    private populateCourt(section: CourtSectionModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): CourtSectionModel {
        const updated = this.write(section, section.date, data, "courtDate", readOnlyFields);

        return this.write(updated, section.time, data, "courtTime", readOnlyFields);
    }

    private extractVehicle(section: VehicleSectionModel, data: FormValues<IOKParkingData>): void {
        this.read(data, "vehicleLicenseNumber", section.getLicenseNumber());
        this.read(data, "vehicleMake", section.getMake());
        this.read(data, "vehicleMeterNumber", section.getMeterNumber());
    }

    private populateVehicle(section: VehicleSectionModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): VehicleSectionModel {
        let updated = this.write(section, section.licenseNumber, data, "vehicleLicenseNumber", readOnlyFields);
        updated = this.write(updated, section.make, data, "vehicleMake", readOnlyFields);

        return this.write(updated, section.meterNumber, data, "vehicleMeterNumber", readOnlyFields);
    }

    private extractOfficer(section: OfficerSectionModel, data: FormValues<IOKParkingData>): void {
        this.read(data, "officerCommissionNumber", section.getCommissionNumber());
        this.read(data, "officerName", section.getOfficerName());
    }

    private populateOfficer(section: OfficerSectionModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): OfficerSectionModel {
        const updated = this.write(section, section.commissionNumber, data, "officerCommissionNumber", readOnlyFields);

        return this.write(updated, section.officerName, data, "officerName", readOnlyFields);
    }

    private extractComplaint(section: ComplaintSectionModel, data: FormValues<IOKParkingData>): void {
        this.read(data, "complaintCitationNumber", section.getCitationNumber());
        this.read(data, "complaintCounselor", section.getCounselor());
        this.read(data, "complaintDate", section.getDate());
    }

    private populateComplaint(section: ComplaintSectionModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): ComplaintSectionModel {
        let updated = this.write(section, section.citationNumber, data, "complaintCitationNumber", readOnlyFields);
        updated = this.write(updated, section.counselor, data, "complaintCounselor", readOnlyFields);

        return this.write(updated, section.date, data, "complaintDate", readOnlyFields);
    }

    private extractCertification(section: CertificationSectionModel, data: FormValues<IOKParkingData>): void {
        this.read(data, "certificationClerkSignature", section.getClerkSignature());
        this.read(data, "certificationDate", section.getDate());
    }

    private populateCertification(section: CertificationSectionModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): CertificationSectionModel {
        const updated = this.write(section, section.clerkSignature, data, "certificationClerkSignature", readOnlyFields);

        return this.write(updated, section.date, data, "certificationDate", readOnlyFields);
    }

    private extractWarrant(section: WarrantSectionModel, data: FormValues<IOKParkingData>): void {
        this.read(data, "warrantApproved", section.getApproved());
        this.read(data, "warrantCounselor", section.getCounselor());
    }

    private populateWarrant(section: WarrantSectionModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): WarrantSectionModel {
        const updated = this.write(section, section.approved, data, "warrantApproved", readOnlyFields);

        return this.write(updated, section.counselor, data, "warrantCounselor", readOnlyFields);
    }

    private extractRecord(section: RecordSectionModel, data: FormValues<IOKParkingData>): void {
        this.read(data, "recordBeat", section.getBeat());
        this.read(data, "recordCitationNumber", section.getCitationNumber());
        this.read(data, "recordCounty", section.getCounty());
        this.read(data, "recordTribe", section.getTribe());
        this.read(data, "recordVoidReason", section.getVoidReason());
    }

    private populateRecord(section: RecordSectionModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): RecordSectionModel {
        let updated = this.write(section, section.beat, data, "recordBeat", readOnlyFields);
        updated = this.write(updated, section.citationNumber, data, "recordCitationNumber", readOnlyFields);
        updated = this.write(updated, section.county, data, "recordCounty", readOnlyFields);
        updated = this.write(updated, section.tribe, data, "recordTribe", readOnlyFields);

        return this.write(updated, section.voidReason, data, "recordVoidReason", readOnlyFields);
    }

    private extractRegisteredOwner(section: RegisteredOwnerSectionModel, data: FormValues<IOKParkingData>): void {
        this.read(data, "ownerAddress", section.getAddress());
        this.read(data, "ownerCity", section.getCity());
        this.read(data, "ownerFirstName", section.getFirstName());
        this.read(data, "ownerLastName", section.getLastName());
        this.read(data, "ownerMiddleName", section.getMiddleName());
        this.read(data, "ownerState", section.getState());
        this.read(data, "ownerSuffix", section.getSuffix());
        this.read(data, "ownerZipCode", section.getZipCode());
    }

    private populateRegisteredOwner(section: RegisteredOwnerSectionModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): RegisteredOwnerSectionModel {
        let updated = this.write(section, section.address, data, "ownerAddress", readOnlyFields);
        updated = this.write(updated, section.city, data, "ownerCity", readOnlyFields);
        updated = this.write(updated, section.firstName, data, "ownerFirstName", readOnlyFields);
        updated = this.write(updated, section.lastName, data, "ownerLastName", readOnlyFields);
        updated = this.write(updated, section.middleName, data, "ownerMiddleName", readOnlyFields);
        updated = this.write(updated, section.state, data, "ownerState", readOnlyFields);
        updated = this.write(updated, section.suffix, data, "ownerSuffix", readOnlyFields);

        return this.write(updated, section.zipCode, data, "ownerZipCode", readOnlyFields);
    }

    private extractVehicleDetail(section: VehicleDetailSectionModel, data: FormValues<IOKParkingData>): void {
        this.read(data, "vehicleColor", section.getColor());
        this.read(data, "vehicleModel", section.getModel());
        this.read(data, "vehicleNoLicensePlate", section.getNoLicensePlate());
        this.read(data, "vehicleRegistrationExpires", section.getRegistrationExpires());
        this.read(data, "vehicleType", section.getType());
        this.read(data, "vehicleVin", section.getVin());
        this.read(data, "vehicleYear", section.getYear());
    }

    private populateVehicleDetail(section: VehicleDetailSectionModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): VehicleDetailSectionModel {
        let updated = this.write(section, section.color, data, "vehicleColor", readOnlyFields);
        updated = this.write(updated, section.model, data, "vehicleModel", readOnlyFields);
        updated = this.write(updated, section.noLicensePlate, data, "vehicleNoLicensePlate", readOnlyFields);
        updated = this.write(updated, section.registrationExpires, data, "vehicleRegistrationExpires", readOnlyFields);
        updated = this.write(updated, section.type, data, "vehicleType", readOnlyFields);
        updated = this.write(updated, section.vin, data, "vehicleVin", readOnlyFields);

        return this.write(updated, section.year, data, "vehicleYear", readOnlyFields);
    }

    private extractNotes(section: NotesSectionModel, data: FormValues<IOKParkingData>): void {
        this.read(data, "notesOffenseNotes", section.getOffenseNotes());
        this.read(data, "notesOfficerNotes", section.getOfficerNotes());
    }

    private populateNotes(section: NotesSectionModel, data: IOKParkingData, readOnlyFields?: ReadonlySet<keyof IOKParkingData>): NotesSectionModel {
        const updated = this.write(section, section.offenseNotes, data, "notesOffenseNotes", readOnlyFields);

        return this.write(updated, section.officerNotes, data, "notesOfficerNotes", readOnlyFields);
    }
}
