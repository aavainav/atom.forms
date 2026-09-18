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

import { createRuleCollection } from "./traffic-rules";
import { OKTrafficFormModel } from "./traffic-form";
import { ComplaintPageModel } from "./complaint-page/complaint-page";
import { ArraignmentSectionModel } from "./complaint-page/arraignment-section";
import { DefendantSectionModel } from "./complaint-page/defendant-section";
import { DescriptionSectionModel } from "./complaint-page/description-section";
import { HeaderSectionModel } from "./complaint-page/header-section";
import { LicenseSectionModel } from "./complaint-page/license-section";
import { OffenseSectionModel } from "./complaint-page/offense-section";
import { OfficerSectionModel } from "./complaint-page/officer-section";
import { SwornSectionModel } from "./complaint-page/sworn-section";
import { VehicleSectionModel } from "./complaint-page/vehicle-section";
import { ViolationInformationSectionModel } from "./complaint-page/violation-information-section";
import { ViolationSectionModel } from "./complaint-page/violation-section";
import { WarrantPageModel } from "./warrant-page/warrant-page";
import { CertificationSectionModel } from "./warrant-page/certification-section";
import { ComplaintSectionModel } from "./warrant-page/complaint-section";
import { WarrantSectionModel } from "./warrant-page/warrant-section";
import { SupplementPageModel } from "./supplement-page/supplement-page";
import { NotesSectionModel } from "./supplement-page/notes-section";
import { RegisteredOwnerSectionModel } from "./supplement-page/registered-owner-section";
import { StatusSectionModel } from "./supplement-page/status-section";
import { WitnessSectionModel } from "./supplement-page/witness-section";

export interface IOKTrafficFormSchema extends ISchema {
    readonly complaintPage: PageDefinition<ComplaintPageModel>;

    readonly headerSection: SectionDefinition<HeaderSectionModel>;
    readonly headerFields: {
        readonly headerCitationNumber: FieldDefinition<StringFieldModel>;
    };

    readonly defendantSection: SectionDefinition<DefendantSectionModel>;
    readonly defendantFields: {
        readonly defendantAddress: FieldDefinition<StringFieldModel>;
        readonly defendantCity: FieldDefinition<StringFieldModel>;
        readonly defendantFirstName: FieldDefinition<StringFieldModel>;
        readonly defendantLastName: FieldDefinition<StringFieldModel>;
        readonly defendantMiddleName: FieldDefinition<StringFieldModel>;
        readonly defendantState: FieldDefinition<OptionFieldModel>;
        readonly defendantZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly licenseSection: SectionDefinition<LicenseSectionModel>;
    readonly licenseFields: {
        readonly licenseClass: FieldDefinition<StringFieldModel>;
        readonly licenseEndorsements: FieldDefinition<StringFieldModel>;
        readonly licenseExpires: FieldDefinition<StringFieldModel>;
        readonly licenseIdentifier: FieldDefinition<StringFieldModel>;
        readonly licenseState: FieldDefinition<OptionFieldModel>;
    };

    readonly descriptionSection: SectionDefinition<DescriptionSectionModel>;
    readonly descriptionFields: {
        readonly descriptionDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly descriptionEthnicity: FieldDefinition<StringFieldModel>;
        readonly descriptionHeight: FieldDefinition<StringFieldModel>;
        readonly descriptionRace: FieldDefinition<StringFieldModel>;
        readonly descriptionSex: FieldDefinition<OptionFieldModel>;
        readonly descriptionWeight: FieldDefinition<NumberFieldModel>;
    };

    readonly vehicleSection: SectionDefinition<VehicleSectionModel>;
    readonly vehicleFields: {
        readonly vehicleColor: FieldDefinition<StringFieldModel>;
        readonly vehicleCommercialVehicle: FieldDefinition<OptionFieldModel>;
        readonly vehicleHazardousMaterials: FieldDefinition<OptionFieldModel>;
        readonly vehicleMake: FieldDefinition<OptionFieldModel>;
        readonly vehicleModel: FieldDefinition<OptionFieldModel>;
        readonly vehicleRegistrationExpires: FieldDefinition<StringFieldModel>;
        readonly vehicleStyle: FieldDefinition<StringFieldModel>;
        readonly vehicleTag: FieldDefinition<StringFieldModel>;
        readonly vehicleTagState: FieldDefinition<OptionFieldModel>;
        readonly vehicleVin: FieldDefinition<StringFieldModel>;
        readonly vehicleYear: FieldDefinition<NumberFieldModel>;
    };

    readonly violationSection: SectionDefinition<ViolationSectionModel>;
    readonly violationFields: {
        readonly violationByActOf: FieldDefinition<StringFieldModel>;
        readonly violationCounty: FieldDefinition<OptionFieldModel>;
        readonly violationDate: FieldDefinition<StringFieldModel>;
        readonly violationIsBlock: FieldDefinition<OptionFieldModel>;
        readonly violationLocation: FieldDefinition<StringFieldModel>;
        readonly violationMunicipalCode: FieldDefinition<StringFieldModel>;
        readonly violationOffenseCode: FieldDefinition<StringFieldModel>;
        readonly violationTime: FieldDefinition<StringFieldModel>;
    };

    readonly offenseSection: SectionDefinition<OffenseSectionModel>;
    readonly offenseFields: {
        readonly offenseAmountDue: FieldDefinition<NumberFieldModel>;
        readonly offenseDueDate: FieldDefinition<StringFieldModel>;
        readonly offenseNotes: FieldDefinition<StringFieldModel>;
    };

    readonly violationInformationSection: SectionDefinition<ViolationInformationSectionModel>;
    readonly violationInformationFields: {
        readonly violationInformationActualSpeed: FieldDefinition<NumberFieldModel>;
        readonly violationInformationHighFatalitySpeed: FieldDefinition<OptionFieldModel>;
        readonly violationInformationIncidentNumber: FieldDefinition<StringFieldModel>;
        readonly violationInformationLidarDistance: FieldDefinition<StringFieldModel>;
        readonly violationInformationOffenseLevel: FieldDefinition<StringFieldModel>;
        readonly violationInformationSpeedDetection: FieldDefinition<StringFieldModel>;
        readonly violationInformationSpeedLimit: FieldDefinition<NumberFieldModel>;
    };

    readonly officerSection: SectionDefinition<OfficerSectionModel>;
    readonly officerFields: {
        readonly officerBodyWornCamera: FieldDefinition<OptionFieldModel>;
        readonly officerCommissionNumber: FieldDefinition<StringFieldModel>;
        readonly officerComplainantSignature: FieldDefinition<StringFieldModel>;
        readonly officerName: FieldDefinition<StringFieldModel>;
        readonly officerSecondBodyWornCamera: FieldDefinition<OptionFieldModel>;
        readonly officerSecondCommissionNumber: FieldDefinition<StringFieldModel>;
        readonly officerSecondName: FieldDefinition<StringFieldModel>;
    };

    readonly swornSection: SectionDefinition<SwornSectionModel>;
    readonly swornFields: {
        readonly swornDate: FieldDefinition<StringFieldModel>;
        readonly swornName: FieldDefinition<StringFieldModel>;
        readonly swornTitle: FieldDefinition<StringFieldModel>;
    };

    readonly arraignmentSection: SectionDefinition<ArraignmentSectionModel>;
    readonly arraignmentFields: {
        readonly arraignmentCourtDate: FieldDefinition<StringFieldModel>;
        readonly arraignmentCourtTime: FieldDefinition<StringFieldModel>;
        readonly arraignmentDefendantSignature: FieldDefinition<StringFieldModel>;
    };

    readonly warrantPage: PageDefinition<WarrantPageModel>;

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

    readonly supplementPage: PageDefinition<SupplementPageModel>;

    readonly witnessSection: SectionDefinition<WitnessSectionModel>;
    readonly witnessFields: {
        readonly witnessAddress: FieldDefinition<StringFieldModel>;
        readonly witnessCity: FieldDefinition<StringFieldModel>;
        readonly witnessEmail: FieldDefinition<StringFieldModel>;
        readonly witnessName: FieldDefinition<StringFieldModel>;
        readonly witnessPhone: FieldDefinition<StringFieldModel>;
        readonly witnessSocialSecurityNumber: FieldDefinition<StringFieldModel>;
        readonly witnessState: FieldDefinition<OptionFieldModel>;
        readonly witnessType: FieldDefinition<StringFieldModel>;
        readonly witnessZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly registeredOwnerSection: SectionDefinition<RegisteredOwnerSectionModel>;
    readonly registeredOwnerFields: {
        readonly ownerAddress: FieldDefinition<StringFieldModel>;
        readonly ownerCity: FieldDefinition<StringFieldModel>;
        readonly ownerName: FieldDefinition<StringFieldModel>;
        readonly ownerSameAsSuspect: FieldDefinition<OptionFieldModel>;
        readonly ownerState: FieldDefinition<OptionFieldModel>;
        readonly ownerZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly statusSection: SectionDefinition<StatusSectionModel>;
    readonly statusFields: {
        readonly statusAssignment: FieldDefinition<StringFieldModel>;
        readonly statusConstructionWorkZone: FieldDefinition<OptionFieldModel>;
        readonly statusDirectionOfTravel: FieldDefinition<StringFieldModel>;
        readonly statusEthnicity: FieldDefinition<StringFieldModel>;
        readonly statusJailed: FieldDefinition<StringFieldModel>;
        readonly statusMainPhone: FieldDefinition<StringFieldModel>;
        readonly statusNoLicensePlate: FieldDefinition<OptionFieldModel>;
        readonly statusReleaseType: FieldDefinition<StringFieldModel>;
        readonly statusRequestWarrant: FieldDefinition<OptionFieldModel>;
        readonly statusSchoolZone: FieldDefinition<OptionFieldModel>;
        readonly statusSigned: FieldDefinition<OptionFieldModel>;
        readonly statusTrailerState: FieldDefinition<OptionFieldModel>;
        readonly statusTrailerTag: FieldDefinition<StringFieldModel>;
        readonly statusTransient: FieldDefinition<OptionFieldModel>;
        readonly statusTribe: FieldDefinition<StringFieldModel>;
        readonly statusVoidReason: FieldDefinition<StringFieldModel>;
        readonly statusWitnessCaptured: FieldDefinition<OptionFieldModel>;
    };

    readonly notesSection: SectionDefinition<NotesSectionModel>;
    readonly notesFields: {
        readonly notesOfficerNotes: FieldDefinition<StringFieldModel>;
    };

    readonly ruleCollection: RuleCollection;
}

/**
 * Schema for the Oklahoma City traffic citation form. Three pages follow the printed form: the complaint and
 * information sworn by the issuing officer, the warrant page the municipal counselor and clerk endorse, and the
 * supplement carrying witness, registered owner and status flags -- each appearing once. Dates are `YYYY-MM-DD`,
 * not the printed `MM/DD/YYYY`, since that's the one order `DateRangeFieldRule` parses.
 */
export class OKTrafficFormSchema extends Schema implements IOKTrafficFormSchema {
    readonly formDefinition: FormDefinition<OKTrafficFormModel> = DefinitionFactory.form<OKTrafficFormModel>("ok-traffic-form", OKTrafficFormModel, this);

    readonly complaintPage: PageDefinition<ComplaintPageModel> = DefinitionFactory.page<ComplaintPageModel>("complaint-page", this.formDefinition, ComplaintPageModel);

    readonly headerSection: SectionDefinition<HeaderSectionModel> = DefinitionFactory.section<HeaderSectionModel>("header-section", this.complaintPage, HeaderSectionModel, { isShared: true });
    readonly headerFields = defineFields(this.headerSection, {
        headerCitationNumber: { label: "Citation Number", ctor: StringFieldModel }
    });

    readonly defendantSection: SectionDefinition<DefendantSectionModel> = DefinitionFactory.section<DefendantSectionModel>("defendant-section", this.complaintPage, DefendantSectionModel, { isShared: true });
    readonly defendantFields = defineFields(this.defendantSection, {
        defendantLastName: { label: "Last", ctor: StringFieldModel },
        defendantFirstName: { label: "First", ctor: StringFieldModel },
        defendantMiddleName: { label: "Middle", ctor: StringFieldModel },
        defendantAddress: { label: "Address", ctor: StringFieldModel },
        defendantCity: { label: "City", ctor: StringFieldModel },
        defendantState: { label: "State", ctor: OptionFieldModel },
        defendantZipCode: { label: "Zip", ctor: StringFieldModel }
    });

    readonly licenseSection: SectionDefinition<LicenseSectionModel> = DefinitionFactory.section<LicenseSectionModel>("license-section", this.complaintPage, LicenseSectionModel, { isShared: true });
    readonly licenseFields = defineFields(this.licenseSection, {
        licenseIdentifier: { label: "ID", ctor: StringFieldModel, name: "license-id" },
        licenseClass: { label: "Class", ctor: StringFieldModel },
        licenseEndorsements: { label: "Endmts", ctor: StringFieldModel },
        licenseState: { label: "State", ctor: OptionFieldModel },
        licenseExpires: { label: "DL Expire", ctor: StringFieldModel }
    });

    readonly descriptionSection: SectionDefinition<DescriptionSectionModel> = DefinitionFactory.section<DescriptionSectionModel>("description-section", this.complaintPage, DescriptionSectionModel, { isShared: true });
    readonly descriptionFields = defineFields(this.descriptionSection, {
        descriptionDateOfBirth: { label: "DOB", ctor: StringFieldModel },
        descriptionRace: { label: "Race", ctor: StringFieldModel },
        descriptionEthnicity: { label: "Ethnicity", ctor: StringFieldModel },
        descriptionSex: { label: "Sex", ctor: OptionFieldModel },
        descriptionHeight: { label: "HT", ctor: StringFieldModel },
        descriptionWeight: { label: "WT (lb.)", ctor: NumberFieldModel }
    });

    readonly vehicleSection: SectionDefinition<VehicleSectionModel> = DefinitionFactory.section<VehicleSectionModel>("vehicle-section", this.complaintPage, VehicleSectionModel, { isShared: true });
    readonly vehicleFields = defineFields(this.vehicleSection, {
        vehicleYear: { label: "YR", ctor: NumberFieldModel },
        vehicleMake: { label: "Make", ctor: OptionFieldModel },
        vehicleModel: { label: "Model", ctor: OptionFieldModel },
        vehicleStyle: { label: "Style", ctor: StringFieldModel },
        vehicleColor: { label: "Color", ctor: StringFieldModel },
        vehicleVin: { label: "VIN", ctor: StringFieldModel },
        vehicleTag: { label: "Tag", ctor: StringFieldModel },
        vehicleTagState: { label: "Tag State", ctor: OptionFieldModel },
        vehicleRegistrationExpires: { label: "Expire", ctor: StringFieldModel },
        vehicleCommercialVehicle: { label: "CMV", ctor: OptionFieldModel },
        vehicleHazardousMaterials: { label: "Haz Mat", ctor: OptionFieldModel }
    });

    readonly violationSection: SectionDefinition<ViolationSectionModel> = DefinitionFactory.section<ViolationSectionModel>("violation-section", this.complaintPage, ViolationSectionModel);
    readonly violationFields = defineFields(this.violationSection, {
        violationDate: { label: "On (date)", ctor: StringFieldModel },
        violationTime: { label: "At (time)", ctor: StringFieldModel },
        violationCounty: { label: "County", ctor: OptionFieldModel },
        violationIsBlock: { label: "Is Block", ctor: OptionFieldModel },
        violationLocation: { label: "At or near (Location)", ctor: StringFieldModel },
        violationMunicipalCode: { label: "Muni Code", ctor: StringFieldModel },
        violationOffenseCode: { label: "Off Code", ctor: StringFieldModel },
        violationByActOf: { label: "By Act Of", ctor: StringFieldModel }
    });

    readonly offenseSection: SectionDefinition<OffenseSectionModel> = DefinitionFactory.section<OffenseSectionModel>("offense-section", this.complaintPage, OffenseSectionModel);
    readonly offenseFields = defineFields(this.offenseSection, {
        offenseNotes: { label: "Offense Notes", ctor: StringFieldModel },
        offenseDueDate: { label: "Amount Due If Paid On or Before", ctor: StringFieldModel },
        offenseAmountDue: { label: "Amount Due", ctor: NumberFieldModel }
    });

    readonly violationInformationSection: SectionDefinition<ViolationInformationSectionModel> = DefinitionFactory.section<ViolationInformationSectionModel>("violation-information-section", this.complaintPage, ViolationInformationSectionModel);
    readonly violationInformationFields = defineFields(this.violationInformationSection, {
        violationInformationIncidentNumber: { label: "Incident #", ctor: StringFieldModel, name: "incident-number" },
        violationInformationOffenseLevel: { label: "Offense Level", ctor: StringFieldModel, name: "offense-level" },
        violationInformationHighFatalitySpeed: { label: "HFS", ctor: OptionFieldModel, name: "high-fatality-speed" },
        violationInformationActualSpeed: { label: "Actual Spd", ctor: NumberFieldModel, name: "actual-speed" },
        violationInformationSpeedLimit: { label: "Limit", ctor: NumberFieldModel, name: "speed-limit" },
        violationInformationSpeedDetection: { label: "Spd Det", ctor: StringFieldModel, name: "speed-detection" },
        violationInformationLidarDistance: { label: "Lidar Dist", ctor: StringFieldModel, name: "lidar-distance" }
    });

    readonly officerSection: SectionDefinition<OfficerSectionModel> = DefinitionFactory.section<OfficerSectionModel>("officer-section", this.complaintPage, OfficerSectionModel, { isShared: true });
    readonly officerFields = defineFields(this.officerSection, {
        officerComplainantSignature: { label: "Complainant Signature", ctor: StringFieldModel },
        officerName: { label: "Officer", ctor: StringFieldModel },
        officerCommissionNumber: { label: "Comm. Number", ctor: StringFieldModel },
        officerBodyWornCamera: { label: "BWC Video", ctor: OptionFieldModel },
        officerSecondName: { label: "Officer #2", ctor: StringFieldModel },
        officerSecondCommissionNumber: { label: "Comm. Number", ctor: StringFieldModel },
        officerSecondBodyWornCamera: { label: "BWC Video", ctor: OptionFieldModel }
    });

    readonly swornSection: SectionDefinition<SwornSectionModel> = DefinitionFactory.section<SwornSectionModel>("sworn-section", this.complaintPage, SwornSectionModel, { isShared: true });
    readonly swornFields = defineFields(this.swornSection, {
        swornName: { label: "Name", ctor: StringFieldModel },
        swornDate: { label: "Date", ctor: StringFieldModel },
        swornTitle: { label: "Title", ctor: StringFieldModel }
    });

    readonly arraignmentSection: SectionDefinition<ArraignmentSectionModel> = DefinitionFactory.section<ArraignmentSectionModel>("arraignment-section", this.complaintPage, ArraignmentSectionModel, { isShared: true });
    readonly arraignmentFields = defineFields(this.arraignmentSection, {
        arraignmentCourtDate: { label: "Arraignment Court Date", ctor: StringFieldModel },
        arraignmentCourtTime: { label: "Time", ctor: StringFieldModel },
        arraignmentDefendantSignature: { label: "Signature", ctor: StringFieldModel }
    });

    readonly warrantPage: PageDefinition<WarrantPageModel> = DefinitionFactory.page<WarrantPageModel>("warrant-page", this.formDefinition, WarrantPageModel);

    readonly complaintSection: SectionDefinition<ComplaintSectionModel> = DefinitionFactory.section<ComplaintSectionModel>("complaint-section", this.warrantPage, ComplaintSectionModel);
    readonly complaintFields = defineFields(this.complaintSection, {
        complaintCitationNumber: { label: "Citation Number", ctor: StringFieldModel },
        complaintCounselor: { label: "Assistant Municipal Counselor", ctor: StringFieldModel },
        complaintDate: { label: "Date", ctor: StringFieldModel }
    });

    readonly certificationSection: SectionDefinition<CertificationSectionModel> = DefinitionFactory.section<CertificationSectionModel>("certification-section", this.warrantPage, CertificationSectionModel);
    readonly certificationFields = defineFields(this.certificationSection, {
        certificationClerkSignature: { label: "Signature of Clerk", ctor: StringFieldModel },
        certificationDate: { label: "Date", ctor: StringFieldModel }
    });

    readonly warrantSection: SectionDefinition<WarrantSectionModel> = DefinitionFactory.section<WarrantSectionModel>("warrant-section", this.warrantPage, WarrantSectionModel);
    readonly warrantFields = defineFields(this.warrantSection, {
        warrantApproved: { label: "Approved", ctor: BooleanFieldModel },
        warrantCounselor: { label: "Assistant Municipal Counselor", ctor: StringFieldModel }
    });

    readonly supplementPage: PageDefinition<SupplementPageModel> = DefinitionFactory.page<SupplementPageModel>("supplement-page", this.formDefinition, SupplementPageModel);

    readonly witnessSection: SectionDefinition<WitnessSectionModel> = DefinitionFactory.section<WitnessSectionModel>("witness-section", this.supplementPage, WitnessSectionModel);
    readonly witnessFields = defineFields(this.witnessSection, {
        witnessType: { label: "Type", ctor: StringFieldModel },
        witnessName: { label: "Name", ctor: StringFieldModel },
        witnessAddress: { label: "Address", ctor: StringFieldModel },
        witnessCity: { label: "City", ctor: StringFieldModel },
        witnessState: { label: "State", ctor: OptionFieldModel },
        witnessZipCode: { label: "Zip", ctor: StringFieldModel },
        witnessPhone: { label: "Phone", ctor: StringFieldModel },
        witnessSocialSecurityNumber: { label: "SSN", ctor: StringFieldModel },
        witnessEmail: { label: "Email", ctor: StringFieldModel }
    });

    readonly registeredOwnerSection: SectionDefinition<RegisteredOwnerSectionModel> = DefinitionFactory.section<RegisteredOwnerSectionModel>("registered-owner-section", this.supplementPage, RegisteredOwnerSectionModel);
    readonly registeredOwnerFields = defineFields(this.registeredOwnerSection, {
        ownerSameAsSuspect: { label: "Same as Suspect", ctor: OptionFieldModel },
        ownerName: { label: "Name", ctor: StringFieldModel },
        ownerAddress: { label: "Address", ctor: StringFieldModel },
        ownerCity: { label: "City", ctor: StringFieldModel },
        ownerState: { label: "State", ctor: OptionFieldModel },
        ownerZipCode: { label: "Zip", ctor: StringFieldModel }
    });

    readonly statusSection: SectionDefinition<StatusSectionModel> = DefinitionFactory.section<StatusSectionModel>("status-section", this.supplementPage, StatusSectionModel);
    readonly statusFields = defineFields(this.statusSection, {
        statusSigned: { label: "Signed Status", ctor: OptionFieldModel },
        statusRequestWarrant: { label: "Request Warrant", ctor: OptionFieldModel },
        statusMainPhone: { label: "Main Phone", ctor: StringFieldModel },
        statusDirectionOfTravel: { label: "Dir. of Travel", ctor: StringFieldModel },
        statusJailed: { label: "Jailed", ctor: StringFieldModel },
        statusTrailerTag: { label: "Trailer Tag", ctor: StringFieldModel },
        statusReleaseType: { label: "Release Type", ctor: StringFieldModel },
        statusTrailerState: { label: "Trailer State", ctor: OptionFieldModel },
        statusTribe: { label: "Tribe", ctor: StringFieldModel },
        statusSchoolZone: { label: "School Zone", ctor: OptionFieldModel },
        statusVoidReason: { label: "Void Reason", ctor: StringFieldModel },
        statusConstructionWorkZone: { label: "CZ/WP", ctor: OptionFieldModel },
        statusAssignment: { label: "Assignment", ctor: StringFieldModel },
        statusEthnicity: { label: "Ethnicity", ctor: StringFieldModel },
        statusTransient: { label: "Transient", ctor: OptionFieldModel },
        statusWitnessCaptured: { label: "Witness/Complainant Captured", ctor: OptionFieldModel },
        statusNoLicensePlate: { label: "No LP", ctor: OptionFieldModel }
    });

    readonly notesSection: SectionDefinition<NotesSectionModel> = DefinitionFactory.section<NotesSectionModel>("notes-section", this.supplementPage, NotesSectionModel);
    readonly notesFields = defineFields(this.notesSection, {
        notesOfficerNotes: { label: "Officer Notes", ctor: StringFieldModel }
    });

    readonly ruleCollection: RuleCollection = createRuleCollection(this);
}
