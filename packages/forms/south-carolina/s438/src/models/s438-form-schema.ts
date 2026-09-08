import {
    defineFields,
    ISchema,
    BooleanFieldModel,
    DefinitionFactory,
    FieldDefinition,
    FormDefinition,
    MaxLengthFieldRule,
    NumberFieldModel,
    PageDefinition,
    RequiredFieldRule,
    RuleCollection,
    Schema,
    SectionDefinition,
    StringFieldModel
} from "@forms/core";
import { S438FormModel } from "./s438-form";
import { FrontPageModel } from "./front-page/front-page";
import { NoticePageModel } from "./notice-page/notice-page";
import { HeaderSectionModel } from "./front-page/header-section";
import { ViolatorSectionModel } from "./front-page/violator-section";
import { VehicleSectionModel } from "./front-page/vehicle-section";
import { OwnerSectionModel } from "./front-page/owner-section";
import { CourtSectionModel } from "./front-page/court-section";
import { ViolationSectionModel } from "./front-page/violation-section";
import { ViolationLocationSectionModel } from "./front-page/violation-location-section";
import { ArrestingOfficerSectionModel } from "./front-page/arresting-officer-section";
import { FooterSectionModel } from "./front-page/footer-section";

export interface IS438FormSchema extends ISchema {
    readonly frontPage: PageDefinition<FrontPageModel>;

    readonly headerSection: SectionDefinition<HeaderSectionModel>;

    readonly violatorSection: SectionDefinition<ViolatorSectionModel>;
    readonly violatorFields: {
        readonly violatorFirstName: FieldDefinition<StringFieldModel>;
        readonly violatorMiddleName: FieldDefinition<StringFieldModel>;
        readonly violatorLastName: FieldDefinition<StringFieldModel>;
        readonly violatorStreetAddress: FieldDefinition<StringFieldModel>;
        readonly violatorCity: FieldDefinition<StringFieldModel>;
        readonly violatorState: FieldDefinition<StringFieldModel>;
        readonly violatorZipCode: FieldDefinition<StringFieldModel>;
        readonly violatorDriverLicenseState: FieldDefinition<StringFieldModel>;
        readonly violatorDriverLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly violatorDriverLicenseClass: FieldDefinition<StringFieldModel>;
        readonly violatorCommercialDriverLicenseYes: FieldDefinition<BooleanFieldModel>;
        readonly violatorCommercialDriverLicenseNo: FieldDefinition<BooleanFieldModel>;
        readonly violatorRace: FieldDefinition<StringFieldModel>;
        readonly violatorSex: FieldDefinition<StringFieldModel>;
        readonly violatorDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly violatorHeight: FieldDefinition<StringFieldModel>;
        readonly violatorWeight: FieldDefinition<NumberFieldModel>;
        readonly violatorHairColor: FieldDefinition<StringFieldModel>;
        readonly violatorEyeColor: FieldDefinition<StringFieldModel>;
    };

    readonly vehicleSection: SectionDefinition<VehicleSectionModel>;
    readonly vehicleFields: {
        readonly vehicleLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly vehicleLicenseState: FieldDefinition<StringFieldModel>;
        readonly vehicleMake: FieldDefinition<StringFieldModel>;
        readonly vehicleYear: FieldDefinition<NumberFieldModel>;
        readonly vehicleAuto: FieldDefinition<BooleanFieldModel>;
        readonly vehicleBicycle: FieldDefinition<BooleanFieldModel>;
        readonly vehicleCombination: FieldDefinition<BooleanFieldModel>;
        readonly vehicleCommercialVehicle: FieldDefinition<BooleanFieldModel>;
        readonly vehicleHazardousMaterials: FieldDefinition<BooleanFieldModel>;
        readonly vehicleMoped: FieldDefinition<BooleanFieldModel>;
        readonly vehicleMotorcycle: FieldDefinition<BooleanFieldModel>;
        readonly vehiclePedestrian: FieldDefinition<BooleanFieldModel>;
        readonly vehicleOther: FieldDefinition<BooleanFieldModel>;
    };

    readonly ownerSection: SectionDefinition<OwnerSectionModel>;
    readonly ownerFields: {
        readonly ownerFirstName: FieldDefinition<StringFieldModel>;
        readonly ownerMiddleName: FieldDefinition<StringFieldModel>;
        readonly ownerLastName: FieldDefinition<StringFieldModel>;
        readonly ownerStreetAddress: FieldDefinition<StringFieldModel>;
        readonly ownerCity: FieldDefinition<StringFieldModel>;
        readonly ownerState: FieldDefinition<StringFieldModel>;
        readonly ownerZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly courtSection: SectionDefinition<CourtSectionModel>;
    readonly courtFields: {
        readonly courtName: FieldDefinition<StringFieldModel>;
        readonly courtStreetAddress: FieldDefinition<StringFieldModel>;
        readonly courtDateOfTrial: FieldDefinition<StringFieldModel>;
        readonly courtTimeOfTrial: FieldDefinition<StringFieldModel>;
        readonly courtCity: FieldDefinition<StringFieldModel>;
        readonly courtState: FieldDefinition<StringFieldModel>;
        readonly courtZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly violationSection: SectionDefinition<ViolationSectionModel>;
    readonly violationFields: {
        readonly violationSectionNumber: FieldDefinition<StringFieldModel>;
        readonly violationDescription: FieldDefinition<StringFieldModel>;
        readonly violationCourtAppearanceRequiredYes: FieldDefinition<BooleanFieldModel>;
        readonly violationCourtAppearanceRequiredNo: FieldDefinition<BooleanFieldModel>;
        readonly violationDateOfViolation: FieldDefinition<StringFieldModel>;
        readonly violationTimeOfViolation: FieldDefinition<StringFieldModel>;
        readonly violationScPoints: FieldDefinition<NumberFieldModel>;
        readonly violationBloodAlcoholLevel: FieldDefinition<StringFieldModel>;
    };

    readonly violationLocationSection: SectionDefinition<ViolationLocationSectionModel>;
    readonly violationLocationFields: {
        readonly violationLocation: FieldDefinition<StringFieldModel>;
        readonly violationLocationCounty: FieldDefinition<StringFieldModel>;
        readonly violationLocationLatitude: FieldDefinition<StringFieldModel>;
        readonly violationLocationLongitude: FieldDefinition<StringFieldModel>;
        readonly violationLocationCity: FieldDefinition<StringFieldModel>;
    };

    readonly arrestingOfficerSection: SectionDefinition<ArrestingOfficerSectionModel>;
    readonly arrestingOfficerFields: {
        readonly arrestingOfficerName: FieldDefinition<StringFieldModel>;
        readonly arrestingOfficerRank: FieldDefinition<StringFieldModel>;
        readonly arrestingOfficerSccjaOfficerNumber: FieldDefinition<StringFieldModel>;
        readonly arrestingOfficerBailDeposited: FieldDefinition<StringFieldModel>;
        readonly arrestingOfficerDateOfArrest: FieldDefinition<StringFieldModel>;
        readonly arrestingOfficerBondAmountRequested: FieldDefinition<StringFieldModel>;
    };

    readonly footerSection: SectionDefinition<FooterSectionModel>;
    readonly footerFields: {
        readonly footerTicketNumber: FieldDefinition<StringFieldModel>;
    };

    readonly noticePage: PageDefinition<NoticePageModel>;

    readonly ruleCollection: RuleCollection;
}

/** Represents the schema definition for the S438 form, defining its pages, sections, and fields. */
export class S438FormSchema extends Schema implements IS438FormSchema {
    readonly formDefinition: FormDefinition<S438FormModel> = DefinitionFactory.form<S438FormModel>("s438-form", S438FormModel);

    readonly frontPage: PageDefinition<FrontPageModel> = DefinitionFactory.page<FrontPageModel>("front-page", this.formDefinition, FrontPageModel);

    readonly headerSection: SectionDefinition<HeaderSectionModel> = DefinitionFactory.section<HeaderSectionModel>("header-section", this.frontPage, HeaderSectionModel);

    readonly violatorSection: SectionDefinition<ViolatorSectionModel> = DefinitionFactory.section<ViolatorSectionModel>("violator-section", this.frontPage, ViolatorSectionModel);
    readonly violatorFields = defineFields(this.violatorSection, {
        violatorFirstName: { label: "First Name", ctor: StringFieldModel },
        violatorMiddleName: { label: "Middle Name", ctor: StringFieldModel },
        violatorLastName: { label: "Last Name", ctor: StringFieldModel },
        violatorStreetAddress: { label: "Street Address", ctor: StringFieldModel },
        violatorCity: { label: "City", ctor: StringFieldModel },
        violatorState: { label: "State", ctor: StringFieldModel },
        violatorZipCode: { label: "Zip Code", ctor: StringFieldModel },
        violatorDriverLicenseState: { label: "DL State", ctor: StringFieldModel },
        violatorDriverLicenseNumber: { label: "Driver License No.", ctor: StringFieldModel },
        violatorDriverLicenseClass: { label: "Class", ctor: StringFieldModel },
        violatorCommercialDriverLicenseYes: { label: "Yes", ctor: BooleanFieldModel },
        violatorCommercialDriverLicenseNo: { label: "No", ctor: BooleanFieldModel },
        violatorRace: { label: "Race", ctor: StringFieldModel },
        violatorSex: { label: "Sex", ctor: StringFieldModel },
        violatorDateOfBirth: { label: "Date of Birth", ctor: StringFieldModel },
        violatorHeight: { label: "Height", ctor: StringFieldModel },
        violatorWeight: { label: "Weight", ctor: NumberFieldModel },
        violatorHairColor: { label: "Hair Color", ctor: StringFieldModel },
        violatorEyeColor: { label: "Eye Color", ctor: StringFieldModel }
    });

    readonly vehicleSection: SectionDefinition<VehicleSectionModel> = DefinitionFactory.section<VehicleSectionModel>("vehicle-section", this.frontPage, VehicleSectionModel);
    readonly vehicleFields = defineFields(this.vehicleSection, {
        vehicleLicenseNumber: { label: "License Number", ctor: StringFieldModel },
        vehicleLicenseState: { label: "License State", ctor: StringFieldModel },
        vehicleMake: { label: "Make", ctor: StringFieldModel },
        vehicleYear: { label: "Year", ctor: NumberFieldModel },
        vehicleAuto: { label: "Auto", ctor: BooleanFieldModel },
        vehicleBicycle: { label: "Bicycle", ctor: BooleanFieldModel },
        vehicleCombination: { label: "Combination", ctor: BooleanFieldModel },
        vehicleCommercialVehicle: { label: "Commercial Vehicle", ctor: BooleanFieldModel },
        vehicleHazardousMaterials: { label: "Hazardous Materials", ctor: BooleanFieldModel },
        vehicleMoped: { label: "Moped", ctor: BooleanFieldModel },
        vehicleMotorcycle: { label: "Motorcycle", ctor: BooleanFieldModel },
        vehiclePedestrian: { label: "Pedestrian", ctor: BooleanFieldModel },
        vehicleOther: { label: "Other", ctor: BooleanFieldModel }
    });

    readonly ownerSection: SectionDefinition<OwnerSectionModel> = DefinitionFactory.section<OwnerSectionModel>("owner-section", this.frontPage, OwnerSectionModel);
    readonly ownerFields = defineFields(this.ownerSection, {
        ownerFirstName: { label: "First Name", ctor: StringFieldModel },
        ownerMiddleName: { label: "Middle Name", ctor: StringFieldModel },
        ownerLastName: { label: "Last Name", ctor: StringFieldModel },
        ownerStreetAddress: { label: "Street Address", ctor: StringFieldModel },
        ownerCity: { label: "City", ctor: StringFieldModel },
        ownerState: { label: "State", ctor: StringFieldModel },
        ownerZipCode: { label: "Zip Code", ctor: StringFieldModel }
    });

    readonly courtSection: SectionDefinition<CourtSectionModel> = DefinitionFactory.section<CourtSectionModel>("court-section", this.frontPage, CourtSectionModel);
    readonly courtFields = defineFields(this.courtSection, {
        courtName: { label: "Name of Trial Court", ctor: StringFieldModel },
        courtStreetAddress: { label: "Street Address", ctor: StringFieldModel },
        courtDateOfTrial: { label: "Date of Trial", ctor: StringFieldModel },
        courtTimeOfTrial: { label: "Time of Trial", ctor: StringFieldModel },
        courtCity: { label: "City", ctor: StringFieldModel },
        courtState: { label: "State", ctor: StringFieldModel },
        courtZipCode: { label: "Zip Code", ctor: StringFieldModel }
    });

    readonly violationSection: SectionDefinition<ViolationSectionModel> = DefinitionFactory.section<ViolationSectionModel>("violation-section", this.frontPage, ViolationSectionModel);
    readonly violationFields = defineFields(this.violationSection, {
        violationSectionNumber: { label: "Violation Section No.", ctor: StringFieldModel },
        violationDescription: { label: "Violation - Court Appearance Required", ctor: StringFieldModel },
        violationCourtAppearanceRequiredYes: { label: "Court Appearance Required (Yes)", ctor: BooleanFieldModel },
        violationCourtAppearanceRequiredNo: { label: "Court Appearance Required (No)", ctor: BooleanFieldModel },
        violationDateOfViolation: { label: "Date of Violation", ctor: StringFieldModel },
        violationTimeOfViolation: { label: "Time of Viol.", ctor: StringFieldModel },
        violationScPoints: { label: "SC Points", ctor: NumberFieldModel },
        violationBloodAlcoholLevel: { label: "Blood Alcohol Level", ctor: StringFieldModel }
    });

    readonly violationLocationSection: SectionDefinition<ViolationLocationSectionModel> = DefinitionFactory.section<ViolationLocationSectionModel>("violation-location-section", this.frontPage, ViolationLocationSectionModel);
    readonly violationLocationFields = defineFields(this.violationLocationSection, {
        violationLocation: { label: "Violation Location", ctor: StringFieldModel },
        violationLocationCounty: { label: "County", ctor: StringFieldModel, name: "violation-county" },
        violationLocationLatitude: { label: "Latitude", ctor: StringFieldModel, name: "violation-latitude" },
        violationLocationLongitude: { label: "Longitude", ctor: StringFieldModel, name: "violation-longitude" },
        violationLocationCity: { label: "City", ctor: StringFieldModel, name: "violation-city" }
    });

    readonly arrestingOfficerSection: SectionDefinition<ArrestingOfficerSectionModel> = DefinitionFactory.section<ArrestingOfficerSectionModel>("arresting-officer-section", this.frontPage, ArrestingOfficerSectionModel);
    readonly arrestingOfficerFields = defineFields(this.arrestingOfficerSection, {
        arrestingOfficerName: { label: "Name and Rank of Arresting Officer", ctor: StringFieldModel },
        arrestingOfficerRank: { label: "Rank", ctor: StringFieldModel },
        arrestingOfficerSccjaOfficerNumber: { label: "SCCJA Officer Number", ctor: StringFieldModel },
        arrestingOfficerBailDeposited: { label: "Bail Deposited", ctor: StringFieldModel },
        arrestingOfficerDateOfArrest: { label: "Date of Arrest", ctor: StringFieldModel },
        arrestingOfficerBondAmountRequested: { label: "Bond Amount Requested", ctor: StringFieldModel }
    });

    readonly footerSection: SectionDefinition<FooterSectionModel> = DefinitionFactory.section<FooterSectionModel>("footer-section", this.frontPage, FooterSectionModel);
    readonly footerFields = defineFields(this.footerSection, {
        footerTicketNumber: { label: "Ticket Number", ctor: StringFieldModel }
    });

    readonly noticePage: PageDefinition<NoticePageModel> = DefinitionFactory.page<NoticePageModel>("notice-page", this.formDefinition, NoticePageModel);

    readonly ruleCollection: RuleCollection = new RuleCollection([
        new RequiredFieldRule(this.violatorFields.violatorFirstName),
        new RequiredFieldRule(this.violatorFields.violatorLastName),
        new MaxLengthFieldRule(this.violatorFields.violatorZipCode, 0, 5)
    ]);
}
