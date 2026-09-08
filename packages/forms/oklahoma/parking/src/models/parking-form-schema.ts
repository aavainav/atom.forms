import {
    defineFields,
    ISchema,
    BooleanFieldModel,
    DefinitionFactory,
    FieldDefinition,
    FormDefinition,
    NumberFieldModel,
    OptionFieldModel,
    PageDefinition,
    RuleCollection,
    Schema,
    SectionDefinition,
    StringFieldModel
} from "@forms/core";

import { createRuleCollection } from "./parking-rules";
import { OKParkingFormModel } from "./parking-form";
import { CitationPageModel } from "./citation-page/citation-page";
import { CourtSectionModel } from "./citation-page/court-section";
import { OfficerSectionModel } from "./citation-page/officer-section";
import { PaymentSectionModel } from "./citation-page/payment-section";
import { VehicleSectionModel } from "./citation-page/vehicle-section";
import { ViolationSectionModel } from "./citation-page/violation-section";
import { ComplaintPageModel } from "./complaint-page/complaint-page";
import { CertificationSectionModel } from "./complaint-page/certification-section";
import { ComplaintSectionModel } from "./complaint-page/complaint-section";
import { WarrantSectionModel } from "./complaint-page/warrant-section";
import { DetailPageModel } from "./detail-page/detail-page";
import { NotesSectionModel } from "./detail-page/notes-section";
import { RecordSectionModel } from "./detail-page/record-section";
import { RegisteredOwnerSectionModel } from "./detail-page/registered-owner-section";
import { VehicleDetailSectionModel } from "./detail-page/vehicle-detail-section";

export interface IOKParkingFormSchema extends ISchema {
    readonly citationPage: PageDefinition<CitationPageModel>;

    readonly violationSection: SectionDefinition<ViolationSectionModel>;
    readonly violationFields: {
        readonly violationCode: FieldDefinition<StringFieldModel>;
        readonly violationDate: FieldDefinition<StringFieldModel>;
        readonly violationDescription: FieldDefinition<StringFieldModel>;
        readonly violationLocation: FieldDefinition<StringFieldModel>;
        readonly violationTime: FieldDefinition<StringFieldModel>;
    };

    readonly paymentSection: SectionDefinition<PaymentSectionModel>;
    readonly paymentFields: {
        readonly paymentAmountDue: FieldDefinition<NumberFieldModel>;
        readonly paymentDueDate: FieldDefinition<StringFieldModel>;
        readonly paymentIncreasedAmountDue: FieldDefinition<NumberFieldModel>;
        readonly paymentIncreasedDueDate: FieldDefinition<StringFieldModel>;
    };

    readonly courtSection: SectionDefinition<CourtSectionModel>;
    readonly courtFields: {
        readonly courtDate: FieldDefinition<StringFieldModel>;
        readonly courtTime: FieldDefinition<StringFieldModel>;
    };

    readonly vehicleSection: SectionDefinition<VehicleSectionModel>;
    readonly vehicleFields: {
        readonly vehicleLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly vehicleMake: FieldDefinition<OptionFieldModel>;
        readonly vehicleMeterNumber: FieldDefinition<StringFieldModel>;
    };

    readonly officerSection: SectionDefinition<OfficerSectionModel>;
    readonly officerFields: {
        readonly officerCommissionNumber: FieldDefinition<StringFieldModel>;
        readonly officerName: FieldDefinition<StringFieldModel>;
    };

    readonly complaintPage: PageDefinition<ComplaintPageModel>;

    readonly complaintSection: SectionDefinition<ComplaintSectionModel>;
    readonly complaintFields: {
        readonly complaintCitationNumber: FieldDefinition<StringFieldModel>;
        readonly complaintCounselor: FieldDefinition<StringFieldModel>;
        readonly complaintDate: FieldDefinition<StringFieldModel>;
    };

    readonly certificationSection: SectionDefinition<CertificationSectionModel>;
    readonly certificationFields: {
        readonly certificationClerkSignature: FieldDefinition<StringFieldModel>;
        readonly certificationDate: FieldDefinition<StringFieldModel>;
    };

    readonly warrantSection: SectionDefinition<WarrantSectionModel>;
    readonly warrantFields: {
        readonly warrantApproved: FieldDefinition<BooleanFieldModel>;
        readonly warrantCounselor: FieldDefinition<StringFieldModel>;
    };

    readonly detailPage: PageDefinition<DetailPageModel>;

    readonly recordSection: SectionDefinition<RecordSectionModel>;
    readonly recordFields: {
        readonly recordBeat: FieldDefinition<StringFieldModel>;
        readonly recordCitationNumber: FieldDefinition<StringFieldModel>;
        readonly recordCounty: FieldDefinition<OptionFieldModel>;
        readonly recordTribe: FieldDefinition<StringFieldModel>;
        readonly recordVoidReason: FieldDefinition<StringFieldModel>;
    };

    readonly registeredOwnerSection: SectionDefinition<RegisteredOwnerSectionModel>;
    readonly registeredOwnerFields: {
        readonly ownerAddress: FieldDefinition<StringFieldModel>;
        readonly ownerCity: FieldDefinition<StringFieldModel>;
        readonly ownerFirstName: FieldDefinition<StringFieldModel>;
        readonly ownerLastName: FieldDefinition<StringFieldModel>;
        readonly ownerMiddleName: FieldDefinition<StringFieldModel>;
        readonly ownerState: FieldDefinition<OptionFieldModel>;
        readonly ownerSuffix: FieldDefinition<StringFieldModel>;
        readonly ownerZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly vehicleDetailSection: SectionDefinition<VehicleDetailSectionModel>;
    readonly vehicleDetailFields: {
        readonly vehicleColor: FieldDefinition<StringFieldModel>;
        readonly vehicleModel: FieldDefinition<StringFieldModel>;
        readonly vehicleNoLicensePlate: FieldDefinition<BooleanFieldModel>;
        readonly vehicleRegistrationExpires: FieldDefinition<StringFieldModel>;
        readonly vehicleType: FieldDefinition<StringFieldModel>;
        readonly vehicleVin: FieldDefinition<StringFieldModel>;
        readonly vehicleYear: FieldDefinition<NumberFieldModel>;
    };

    readonly notesSection: SectionDefinition<NotesSectionModel>;
    readonly notesFields: {
        readonly notesOffenseNotes: FieldDefinition<StringFieldModel>;
        readonly notesOfficerNotes: FieldDefinition<StringFieldModel>;
    };

    readonly ruleCollection: RuleCollection;
}

/**
 * Represents the schema definition for the Oklahoma City parking violation form.
 *
 * The three pages follow the printed form: the citation the officer leaves on the vehicle, the complaint and
 * warrant page the municipal counselor and clerk endorse, and the detail page carrying the registered owner and
 * the rest of the vehicle's description. Every page appears once.
 *
 * Dates are held as `YYYY-MM-DD` rather than the `MM/DD/YYYY` the form prints, because that is the one order
 * `DateRangeFieldRule` parses and a value it cannot parse silently skips date validation.
 */
export class OKParkingFormSchema extends Schema implements IOKParkingFormSchema {
    readonly formDefinition: FormDefinition<OKParkingFormModel> = DefinitionFactory.form<OKParkingFormModel>("ok-parking-form", OKParkingFormModel);

    readonly citationPage: PageDefinition<CitationPageModel> = DefinitionFactory.page<CitationPageModel>("citation-page", this.formDefinition, CitationPageModel);

    readonly violationSection: SectionDefinition<ViolationSectionModel> = DefinitionFactory.section<ViolationSectionModel>("violation-section", this.citationPage, ViolationSectionModel);
    readonly violationFields = defineFields(this.violationSection, {
        violationDate: { label: "On (date)", ctor: StringFieldModel },
        violationTime: { label: "At (time)", ctor: StringFieldModel },
        violationLocation: { label: "At or near (Location)", ctor: StringFieldModel },
        violationCode: { label: "Code", ctor: StringFieldModel },
        violationDescription: { label: "Violation", ctor: StringFieldModel }
    });

    readonly paymentSection: SectionDefinition<PaymentSectionModel> = DefinitionFactory.section<PaymentSectionModel>("payment-section", this.citationPage, PaymentSectionModel);
    readonly paymentFields = defineFields(this.paymentSection, {
        paymentDueDate: { label: "Pay On or Before", ctor: StringFieldModel },
        paymentAmountDue: { label: "Amount Due", ctor: NumberFieldModel },
        paymentIncreasedDueDate: { label: "Increased Amount Due After", ctor: StringFieldModel },
        paymentIncreasedAmountDue: { label: "Amount Due (Fine After Arraignment Date)", ctor: NumberFieldModel }
    });

    readonly courtSection: SectionDefinition<CourtSectionModel> = DefinitionFactory.section<CourtSectionModel>("court-section", this.citationPage, CourtSectionModel);
    readonly courtFields = defineFields(this.courtSection, {
        courtDate: { label: "Court Date", ctor: StringFieldModel },
        courtTime: { label: "Court Time", ctor: StringFieldModel }
    });

    readonly vehicleSection: SectionDefinition<VehicleSectionModel> = DefinitionFactory.section<VehicleSectionModel>("vehicle-section", this.citationPage, VehicleSectionModel);
    readonly vehicleFields = defineFields(this.vehicleSection, {
        vehicleLicenseNumber: { label: "Vehicle License Number", ctor: StringFieldModel },
        vehicleMake: { label: "Vehicle Make", ctor: OptionFieldModel },
        vehicleMeterNumber: { label: "Meter #", ctor: StringFieldModel }
    });

    readonly officerSection: SectionDefinition<OfficerSectionModel> = DefinitionFactory.section<OfficerSectionModel>("officer-section", this.citationPage, OfficerSectionModel);
    readonly officerFields = defineFields(this.officerSection, {
        officerName: { label: "Officer", ctor: StringFieldModel },
        officerCommissionNumber: { label: "Comm. Number", ctor: StringFieldModel }
    });

    readonly complaintPage: PageDefinition<ComplaintPageModel> = DefinitionFactory.page<ComplaintPageModel>("complaint-page", this.formDefinition, ComplaintPageModel);

    readonly complaintSection: SectionDefinition<ComplaintSectionModel> = DefinitionFactory.section<ComplaintSectionModel>("complaint-section", this.complaintPage, ComplaintSectionModel);
    readonly complaintFields = defineFields(this.complaintSection, {
        complaintCitationNumber: { label: "Citation Number", ctor: StringFieldModel },
        complaintCounselor: { label: "Assistant Municipal Counselor", ctor: StringFieldModel },
        complaintDate: { label: "Date", ctor: StringFieldModel }
    });

    readonly certificationSection: SectionDefinition<CertificationSectionModel> = DefinitionFactory.section<CertificationSectionModel>("certification-section", this.complaintPage, CertificationSectionModel);
    readonly certificationFields = defineFields(this.certificationSection, {
        certificationClerkSignature: { label: "Signature of Clerk", ctor: StringFieldModel },
        certificationDate: { label: "Date", ctor: StringFieldModel }
    });

    readonly warrantSection: SectionDefinition<WarrantSectionModel> = DefinitionFactory.section<WarrantSectionModel>("warrant-section", this.complaintPage, WarrantSectionModel);
    readonly warrantFields = defineFields(this.warrantSection, {
        warrantApproved: { label: "Approved", ctor: BooleanFieldModel },
        warrantCounselor: { label: "Assistant Municipal Counselor", ctor: StringFieldModel }
    });

    readonly detailPage: PageDefinition<DetailPageModel> = DefinitionFactory.page<DetailPageModel>("detail-page", this.formDefinition, DetailPageModel);

    readonly recordSection: SectionDefinition<RecordSectionModel> = DefinitionFactory.section<RecordSectionModel>("record-section", this.detailPage, RecordSectionModel);
    readonly recordFields = defineFields(this.recordSection, {
        recordCitationNumber: { label: "Parking Citation Number", ctor: StringFieldModel },
        recordCounty: { label: "County", ctor: OptionFieldModel },
        recordBeat: { label: "Beat", ctor: StringFieldModel },
        recordTribe: { label: "Tribe", ctor: StringFieldModel },
        recordVoidReason: { label: "Void Reason", ctor: StringFieldModel }
    });

    readonly registeredOwnerSection: SectionDefinition<RegisteredOwnerSectionModel> = DefinitionFactory.section<RegisteredOwnerSectionModel>("registered-owner-section", this.detailPage, RegisteredOwnerSectionModel);
    readonly registeredOwnerFields = defineFields(this.registeredOwnerSection, {
        ownerFirstName: { label: "First Name", ctor: StringFieldModel },
        ownerMiddleName: { label: "Middle", ctor: StringFieldModel },
        ownerLastName: { label: "Last Name", ctor: StringFieldModel },
        ownerSuffix: { label: "Suffix", ctor: StringFieldModel },
        ownerAddress: { label: "Address", ctor: StringFieldModel },
        ownerCity: { label: "City", ctor: StringFieldModel },
        ownerState: { label: "State", ctor: OptionFieldModel },
        ownerZipCode: { label: "Zip", ctor: StringFieldModel }
    });

    readonly vehicleDetailSection: SectionDefinition<VehicleDetailSectionModel> = DefinitionFactory.section<VehicleDetailSectionModel>("vehicle-detail-section", this.detailPage, VehicleDetailSectionModel);
    readonly vehicleDetailFields = defineFields(this.vehicleDetailSection, {
        vehicleVin: { label: "VIN", ctor: StringFieldModel },
        vehicleRegistrationExpires: { label: "Reg Exp", ctor: StringFieldModel },
        vehicleYear: { label: "Veh Yr", ctor: NumberFieldModel },
        vehicleType: { label: "Type", ctor: StringFieldModel },
        vehicleColor: { label: "Color", ctor: StringFieldModel },
        vehicleModel: { label: "Model", ctor: StringFieldModel },
        vehicleNoLicensePlate: { label: "No LP", ctor: BooleanFieldModel }
    });

    readonly notesSection: SectionDefinition<NotesSectionModel> = DefinitionFactory.section<NotesSectionModel>("notes-section", this.detailPage, NotesSectionModel);
    readonly notesFields = defineFields(this.notesSection, {
        notesOfficerNotes: { label: "Officer Notes", ctor: StringFieldModel },
        notesOffenseNotes: { label: "Offense Notes", ctor: StringFieldModel }
    });

    readonly ruleCollection: RuleCollection = createRuleCollection(this);
}
