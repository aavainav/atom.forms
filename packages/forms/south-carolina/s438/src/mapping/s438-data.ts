/**
 * One further violation the citation was written for, beyond the one the flat fields carry. The S438 prints one
 * charge per ticket, so three charges produce three front pages; violator, vehicle, owner, court, location and
 * officer details stay flat and identical across all of them, and only these fields differ page to page.
 */
export interface IS438ViolationData {
    /** The blood alcohol level recorded for the violation. */
    readonly violationBloodAlcoholLevel?: string;
    /** Checked when no court appearance is required for the violation. */
    readonly violationCourtAppearanceRequiredNo?: boolean;
    /** Checked when a court appearance is required for the violation; paired with `violationCourtAppearanceRequiredNo`, and a record answering neither leaves both false. */
    readonly violationCourtAppearanceRequiredYes?: boolean;
    /** The date of the violation. */
    readonly violationDateOfViolation?: string;
    /** The description of the violation. */
    readonly violationDescription?: string;
    /** The South Carolina points the violation carries. */
    readonly violationScPoints?: number;
    /** The section number of the violation. */
    readonly violationSectionNumber?: string;
    /** The recorded speed, for a speeding violation. An unanswered speed is reported as 0. */
    readonly violationSpeed?: number;
    /** The legal speed limit, for a speeding violation. An unanswered limit is reported as 0. */
    readonly violationSpeedLimit?: number;
    /** The time of the violation. */
    readonly violationTimeOfViolation?: string;
}

/** Represents the data contract for the SC S438 (Uniform Traffic Ticket) citation record. */
export interface IS438Data {
    /** The violations beyond the first, one per further front page. The first stays in the flat `violation*` fields, so a record written before a citation could carry more than one charge round-trips unchanged. */
    readonly additionalViolations?: ReadonlyArray<IS438ViolationData>;
    /** The bail deposited with the arresting officer. */
    readonly arrestingOfficerBailDeposited?: string;
    /** The bond amount the arresting officer requested. */
    readonly arrestingOfficerBondAmountRequested?: string;
    /** The date of the arrest. */
    readonly arrestingOfficerDateOfArrest?: string;
    /** The name of the arresting officer. */
    readonly arrestingOfficerName?: string;
    /** The arresting officer's rank. */
    readonly arrestingOfficerRank?: string;
    /** The arresting officer's South Carolina Criminal Justice Academy number. */
    readonly arrestingOfficerSccjaOfficerNumber?: string;
    /** The city of the trial court. */
    readonly courtCity?: string;
    /** The date of trial. */
    readonly courtDateOfTrial?: string;
    /** The name of the trial court. */
    readonly courtName?: string;
    /** The state of the trial court. */
    readonly courtState?: string;
    /** The street address of the trial court. */
    readonly courtStreetAddress?: string;
    /** The time of trial. */
    readonly courtTimeOfTrial?: string;
    /** The zip code of the trial court. */
    readonly courtZipCode?: string;
    /** The ticket number the citation was issued under. */
    readonly footerTicketNumber?: string;
    /** The city of the registered owner, when the owner is not the violator. */
    readonly ownerCity?: string;
    /** The first name of the registered owner, when the owner is not the violator. */
    readonly ownerFirstName?: string;
    /** The last name of the registered owner, when the owner is not the violator. */
    readonly ownerLastName?: string;
    /** The middle name of the registered owner, when the owner is not the violator. */
    readonly ownerMiddleName?: string;
    /** The state of the registered owner, when the owner is not the violator. */
    readonly ownerState?: string;
    /** The street address of the registered owner, when the owner is not the violator. */
    readonly ownerStreetAddress?: string;
    /** The zip code of the registered owner, when the owner is not the violator. */
    readonly ownerZipCode?: string;
    /** The bail deposited with the arresting officer, as the trial copy records it. */
    readonly trialArrestingOfficerBailDeposited?: string;
    /** Who received the bail, on the trial copy. */
    readonly trialArrestingOfficerBailReceivedBy?: string;
    /** The bond amount the arresting officer requested, as the trial copy records it. */
    readonly trialArrestingOfficerBondAmountRequested?: string;
    /** The date the bail was received, on the trial copy. */
    readonly trialArrestingOfficerDateBailReceived?: string;
    /** The date of the arrest, as the trial copy records it. */
    readonly trialArrestingOfficerDateOfArrest?: string;
    /** The name of the arresting officer, as the trial copy records it. */
    readonly trialArrestingOfficerName?: string;
    /** The arresting officer's rank, as the trial copy records it. */
    readonly trialArrestingOfficerRank?: string;
    /** The arresting officer's South Carolina Criminal Justice Academy number, as the trial copy records it. */
    readonly trialArrestingOfficerSccjaOfficerNumber?: string;
    /** The city of the trial court, as the trial copy records it. */
    readonly trialCourtCity?: string;
    /** The date of trial, as the trial copy records it. */
    readonly trialCourtDateOfTrial?: string;
    /** The amount of the fine collected. */
    readonly trialCourtInformationAmountCollected?: string;
    /** The amount of the fine suspended. */
    readonly trialCourtInformationAmountSuspended?: string;
    /** Checked when the arrest was the result of a collision. */
    readonly trialCourtInformationArrestResultOfCollision?: boolean;
    /** Checked when the case went before a circuit court. */
    readonly trialCourtInformationCaseBeforeCircuitCourt?: boolean;
    /** Checked when the case went before a family court. */
    readonly trialCourtInformationCaseBeforeFamilyCourt?: boolean;
    /** Checked when the case went before a federal court. */
    readonly trialCourtInformationCaseBeforeFederalCourt?: boolean;
    /** Checked when the case went before a magistrate. */
    readonly trialCourtInformationCaseBeforeMagistrate?: boolean;
    /** Checked when the case went before a municipal court. */
    readonly trialCourtInformationCaseBeforeMunicipalCourt?: boolean;
    /** Who certified the disposition correct. */
    readonly trialCourtInformationCertifiedCorrect?: string;
    /** The date the disposition was certified correct. */
    readonly trialCourtInformationCertifiedDate?: string;
    /** The charge the defendant was convicted of. */
    readonly trialCourtInformationChargeConvictedOf?: string;
    /** Where the defendant was committed to. */
    readonly trialCourtInformationCommittedTo?: string;
    /** The name of the trial court, when it differs from the one the ticket summoned the defendant to. */
    readonly trialCourtInformationCourtIfDifferent?: string;
    /** Checked when the defendant appeared. */
    readonly trialCourtInformationDefendantAppeared?: boolean;
    /** Checked when the defendant did not appear. */
    readonly trialCourtInformationDefendantDidNotAppear?: boolean;
    /** Checked when a blood alcohol content was determined. */
    readonly trialCourtInformationDeterminedBac?: boolean;
    /** The date of the disposition. */
    readonly trialCourtInformationDispositionDate?: string;
    /** The fine imposed. */
    readonly trialCourtInformationFine?: string;
    /** Checked when the bond was forfeited. */
    readonly trialCourtInformationForfeitedBond?: boolean;
    /** Checked when the defendant was found guilty. */
    readonly trialCourtInformationGuilty?: boolean;
    /** The jail term imposed. */
    readonly trialCourtInformationJail?: string;
    /** Checked when the case was nolle prossed. */
    readonly trialCourtInformationNolleProssed?: boolean;
    /** Checked when the defendant was found not guilty. */
    readonly trialCourtInformationNotGuilty?: boolean;
    /** Checked when the defendant pled nolo contendere. */
    readonly trialCourtInformationPledNoloContendere?: boolean;
    /** Checked when the charge convicted of is the one the ticket was written for. Recorded as answered; it does not fill the charge in. */
    readonly trialCourtInformationSameAsOriginal?: boolean;
    /** The South Carolina points the conviction carries. */
    readonly trialCourtInformationScPoints?: number;
    /** The part of the sentence suspended. */
    readonly trialCourtInformationSuspend?: string;
    /** Checked when the case was tried by the trial judge. */
    readonly trialCourtInformationTrialByJudge?: boolean;
    /** Checked when the case was tried by a jury. */
    readonly trialCourtInformationTrialByJury?: boolean;
    /** Checked when the vehicle was searched. */
    readonly trialCourtInformationVehicleSearched?: boolean;
    /** The name of the trial court, as the trial copy records it. */
    readonly trialCourtName?: string;
    /** The state of the trial court, as the trial copy records it. */
    readonly trialCourtState?: string;
    /** The street address of the trial court, as the trial copy records it. */
    readonly trialCourtStreetAddress?: string;
    /** The time of trial, as the trial copy records it. */
    readonly trialCourtTimeOfTrial?: string;
    /** The zip code of the trial court, as the trial copy records it. */
    readonly trialCourtZipCode?: string;
    /** The ticket number, as the trial copy records it. */
    readonly trialFooterTicketNumber?: string;
    /** Notes written on the trial copy. */
    readonly trialHeaderNotes?: string;
    /** Checked when the trial copy is void. */
    readonly trialHeaderVoid?: boolean;
    /** The city of the registered owner, as the trial copy records it. */
    readonly trialOwnerCity?: string;
    /** The first name of the registered owner, as the trial copy records it. */
    readonly trialOwnerFirstName?: string;
    /** The last name of the registered owner, as the trial copy records it. */
    readonly trialOwnerLastName?: string;
    /** The middle name of the registered owner, as the trial copy records it. */
    readonly trialOwnerMiddleName?: string;
    /** The state of the registered owner, as the trial copy records it. */
    readonly trialOwnerState?: string;
    /** The street address of the registered owner, as the trial copy records it. */
    readonly trialOwnerStreetAddress?: string;
    /** The zip code of the registered owner, as the trial copy records it. */
    readonly trialOwnerZipCode?: string;
    /** Checked when the vehicle is an automobile, on the trial copy. */
    readonly trialVehicleAuto?: boolean;
    /** Checked when the vehicle is a bicycle, on the trial copy. */
    readonly trialVehicleBicycle?: boolean;
    /** Checked when the vehicle is a combination vehicle, on the trial copy. */
    readonly trialVehicleCombination?: boolean;
    /** Checked when the vehicle is a commercial vehicle, on the trial copy. */
    readonly trialVehicleCommercialVehicle?: boolean;
    /** Checked when the vehicle was carrying hazardous materials, on the trial copy. */
    readonly trialVehicleHazardousMaterials?: boolean;
    /** The vehicle's license plate number, as the trial copy records it. */
    readonly trialVehicleLicenseNumber?: string;
    /** The state that issued the vehicle's plate, as the trial copy records it. */
    readonly trialVehicleLicenseState?: string;
    /** The make of the vehicle, as the trial copy records it. */
    readonly trialVehicleMake?: string;
    /** Checked when the vehicle is a moped, on the trial copy. */
    readonly trialVehicleMoped?: boolean;
    /** Checked when the vehicle is a motorcycle, on the trial copy. */
    readonly trialVehicleMotorcycle?: boolean;
    /** Checked when the vehicle is none of the listed types, on the trial copy. */
    readonly trialVehicleOther?: boolean;
    /** Checked when the violator was a pedestrian, on the trial copy. */
    readonly trialVehiclePedestrian?: boolean;
    /** The model year of the vehicle, as the trial copy records it. */
    readonly trialVehicleYear?: number;
    /** The violator's blood alcohol level, as the trial copy records it. */
    readonly trialViolationBloodAlcoholLevel?: string;
    /** Checked when no court appearance is required, on the trial copy. */
    readonly trialViolationCourtAppearanceRequiredNo?: boolean;
    /** Checked when a court appearance is required, on the trial copy. */
    readonly trialViolationCourtAppearanceRequiredYes?: boolean;
    /** The date of the violation, as the trial copy records it. */
    readonly trialViolationDateOfViolation?: string;
    /** The description of the violation, as the trial copy records it. */
    readonly trialViolationDescription?: string;
    /** The location of the violation, as the trial copy records it. */
    readonly trialViolationLocation?: string;
    /** The city of the violation, as the trial copy records it. */
    readonly trialViolationLocationCity?: string;
    /** The county of the violation, as the trial copy records it. */
    readonly trialViolationLocationCounty?: string;
    /** The latitude of the violation, as the trial copy records it. */
    readonly trialViolationLocationLatitude?: string;
    /** The longitude of the violation, as the trial copy records it. */
    readonly trialViolationLocationLongitude?: string;
    /** The South Carolina points the violation carries, as the trial copy records it. */
    readonly trialViolationScPoints?: number;
    /** The code section number of the violation, as the trial copy records it. */
    readonly trialViolationSectionNumber?: string;
    /** The recorded speed, as the trial copy records it. */
    readonly trialViolationSpeed?: number;
    /** The legal speed limit, as the trial copy records it. */
    readonly trialViolationSpeedLimit?: number;
    /** The time of the violation, as the trial copy records it. */
    readonly trialViolationTimeOfViolation?: string;
    /** The city of the violator, as the trial copy records it. */
    readonly trialViolatorCity?: string;
    /** Checked when the violator does not hold a commercial driver's license, on the trial copy. */
    readonly trialViolatorCommercialDriverLicenseNo?: boolean;
    /** Checked when the violator holds a commercial driver's license, on the trial copy. */
    readonly trialViolatorCommercialDriverLicenseYes?: boolean;
    /** The violator's date of birth, as the trial copy records it. */
    readonly trialViolatorDateOfBirth?: string;
    /** The class of the violator's driver's license, as the trial copy records it. */
    readonly trialViolatorDriverLicenseClass?: string;
    /** The violator's driver's license number, as the trial copy records it. */
    readonly trialViolatorDriverLicenseNumber?: string;
    /** The state that issued the violator's driver's license, as the trial copy records it. */
    readonly trialViolatorDriverLicenseState?: string;
    /** The violator's eye color, as the trial copy records it. */
    readonly trialViolatorEyeColor?: string;
    /** The violator's first name, as the trial copy records it. */
    readonly trialViolatorFirstName?: string;
    /** The violator's hair color, as the trial copy records it. */
    readonly trialViolatorHairColor?: string;
    /** The violator's height, as the trial copy records it. */
    readonly trialViolatorHeight?: string;
    /** The violator's last name, as the trial copy records it. */
    readonly trialViolatorLastName?: string;
    /** The violator's middle name, as the trial copy records it. */
    readonly trialViolatorMiddleName?: string;
    /** The violator's race, as the trial copy records it. */
    readonly trialViolatorRace?: string;
    /** The violator's sex, as the trial copy records it. */
    readonly trialViolatorSex?: string;
    /** The violator's state, as the trial copy records it. */
    readonly trialViolatorState?: string;
    /** The violator's street address, as the trial copy records it. */
    readonly trialViolatorStreetAddress?: string;
    /** The violator's weight, as the trial copy records it. */
    readonly trialViolatorWeight?: number;
    /** The violator's zip code, as the trial copy records it. */
    readonly trialViolatorZipCode?: string;
    /** Checked when the vehicle is an automobile. */
    readonly vehicleAuto?: boolean;
    /** Checked when the vehicle is a bicycle. */
    readonly vehicleBicycle?: boolean;
    /** Checked when the vehicle is a combination vehicle. */
    readonly vehicleCombination?: boolean;
    /** Checked when the vehicle is a commercial vehicle. */
    readonly vehicleCommercialVehicle?: boolean;
    /** Checked when the vehicle was carrying hazardous materials. */
    readonly vehicleHazardousMaterials?: boolean;
    /** The vehicle's license plate number. */
    readonly vehicleLicenseNumber?: string;
    /** The state that issued the vehicle's plate. */
    readonly vehicleLicenseState?: string;
    /** The make of the vehicle. */
    readonly vehicleMake?: string;
    /** Checked when the vehicle is a moped. */
    readonly vehicleMoped?: boolean;
    /** Checked when the vehicle is a motorcycle. */
    readonly vehicleMotorcycle?: boolean;
    /** Checked when the vehicle is none of the listed types. */
    readonly vehicleOther?: boolean;
    /** Checked when the violator was a pedestrian rather than in a vehicle. */
    readonly vehiclePedestrian?: boolean;
    /** The model year of the vehicle. An unanswered year is left absent rather than reported as 0. */
    readonly vehicleYear?: number;
    /** The violator's blood alcohol level. */
    readonly violationBloodAlcoholLevel?: string;
    /** Checked when no court appearance is required for the violation. */
    readonly violationCourtAppearanceRequiredNo?: boolean;
    /** Checked when a court appearance is required for the violation; paired with `violationCourtAppearanceRequiredNo`, and a record answering neither leaves both false. */
    readonly violationCourtAppearanceRequiredYes?: boolean;
    /** The date of the violation. The form stamps today's date on a new citation, so data carrying a date overrides it. */
    readonly violationDateOfViolation?: string;
    /** The description of the violation. */
    readonly violationDescription?: string;
    /** The location the violation took place at. */
    readonly violationLocation?: string;
    /** The city the violation took place in. */
    readonly violationLocationCity?: string;
    /** The county the violation took place in. */
    readonly violationLocationCounty?: string;
    /** The latitude of the violation. */
    readonly violationLocationLatitude?: string;
    /** The longitude of the violation. */
    readonly violationLocationLongitude?: string;
    /** The South Carolina points the violation carries. */
    readonly violationScPoints?: number;
    /** The code section number of the violation. The form holds one violation, so a record carrying several supplies the one it is issued for. */
    readonly violationSectionNumber?: string;
    /** The recorded speed, for a speeding violation. An unanswered speed is reported as 0. */
    readonly violationSpeed?: number;
    /** The legal speed limit, for a speeding violation. An unanswered limit is reported as 0. */
    readonly violationSpeedLimit?: number;
    /** The time of the violation. */
    readonly violationTimeOfViolation?: string;
    /** The city of the violator. */
    readonly violatorCity?: string;
    /** Checked when the violator does not hold a commercial driver's license. */
    readonly violatorCommercialDriverLicenseNo?: boolean;
    /** Checked when the violator holds a commercial driver's license; paired with `violatorCommercialDriverLicenseNo`, and a record answering neither leaves both false. */
    readonly violatorCommercialDriverLicenseYes?: boolean;
    /** The violator's date of birth. */
    readonly violatorDateOfBirth?: string;
    /** The class of the violator's driver's license. */
    readonly violatorDriverLicenseClass?: string;
    /** The violator's driver's license number. */
    readonly violatorDriverLicenseNumber?: string;
    /** The state that issued the violator's driver's license. */
    readonly violatorDriverLicenseState?: string;
    /** The violator's eye color. */
    readonly violatorEyeColor?: string;
    /** The violator's first name; required by the form. */
    readonly violatorFirstName?: string;
    /** The violator's hair color. */
    readonly violatorHairColor?: string;
    /** The violator's height. */
    readonly violatorHeight?: string;
    /** The violator's last name; required by the form. */
    readonly violatorLastName?: string;
    /** The violator's middle name. */
    readonly violatorMiddleName?: string;
    /** The violator's race. */
    readonly violatorRace?: string;
    /** The violator's sex. */
    readonly violatorSex?: string;
    /** The violator's state. */
    readonly violatorState?: string;
    /** The violator's street address. */
    readonly violatorStreetAddress?: string;
    /** The violator's weight. */
    readonly violatorWeight?: number;
    /** The violator's zip code; at most 5 characters. */
    readonly violatorZipCode?: string;
}
