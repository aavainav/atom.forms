import { IPopulateData, FormMapper, FormValues, ReadOnlyFields } from "@forms/core";

import { CertificationSectionModel } from "../models/citation-page/certification-section";
import { CitationPageModel } from "../models/citation-page/citation-page";
import { ConditionsSectionModel } from "../models/citation-page/conditions-section";
import { CourtActionSectionModel } from "../models/court-page/court-action-section";
import { CourtPageModel } from "../models/court-page/court-page";
import { DispositionSectionModel } from "../models/court-page/disposition-section";
import { DuiSectionModel } from "../models/citation-page/dui-section";
import { GAUTCFormModel } from "../models/utc-form";
import { HeaderSectionModel } from "../models/citation-page/header-section";
import { JudgmentSectionModel } from "../models/court-page/judgment-section";
import { LocationSectionModel } from "../models/citation-page/location-section";
import { OffenseSectionModel } from "../models/citation-page/offense-section";
import { OfficerSectionModel } from "../models/citation-page/officer-section";
import { PleaSectionModel } from "../models/court-page/plea-section";
import { StatusSectionModel } from "../models/citation-page/status-section";
import { SummonsSectionModel } from "../models/citation-page/summons-section";
import { VehicleSectionModel } from "../models/citation-page/vehicle-section";
import { ViolationSectionModel } from "../models/citation-page/violation-section";
import { ViolatorSectionModel } from "../models/citation-page/violator-section";
import { IGAUTCData, IGAUTCViolationData } from "./utc-data";

/**
 * Maps the Georgia uniform traffic citation to and from the data contract it publishes.
 *
 * Each section's read sits directly above its write below, so a field added to one direction and forgotten in the
 * other shows up in the same diff. Keeping the two directions in step is what makes the round trip hold.
 *
 * `populate` is synchronous: neither page repeats, so nothing here has to create a page.
 *
 * The two halves of a YES/NO pair are written independently rather than as one answer, so a record answering
 * neither stays unanswered rather than being pushed into a no.
 */
export class GAUTCMapper extends FormMapper<GAUTCFormModel, IGAUTCData> {
    /** Returns the form's current values as its data contract, emitting only the fields this form owns. */
    public extract(form: GAUTCFormModel): IGAUTCData {
        const citationPages = form.getCitationPageCollection().getPages<CitationPageModel>();
        const citationPage = citationPages[0];
        const courtPage = form.getCourtPage();
        const data: FormValues<IGAUTCData> = {};

        this.extractHeader(citationPage.getHeaderSection(), data);
        this.extractViolator(citationPage.getViolatorSection(), data);
        this.extractVehicle(citationPage.getVehicleSection(), data);
        this.extractStatus(citationPage.getStatusSection(), data);
        this.extractViolation(citationPage.getViolationSection(), data);
        this.extractDui(citationPage.getDuiSection(), data);
        this.extractOffense(citationPage.getOffenseSection(), data);
        this.extractConditions(citationPage.getConditionsSection(), data);
        this.extractLocation(citationPage.getLocationSection(), data);
        this.extractOfficer(citationPage.getOfficerSection(), data);
        this.extractSummons(citationPage.getSummonsSection(), data);
        this.extractCertification(citationPage.getCertificationSection(), data);

        this.extractCourtAction(courtPage.getCourtActionSection(), data);
        this.extractPlea(courtPage.getPleaSection(), data);
        this.extractDisposition(courtPage.getDispositionSection(), data);
        this.extractJudgment(courtPage.getJudgmentSection(), data);

        if (citationPages.length > 1) {
            data.additionalViolations = citationPages.slice(1).map(page => this.extractViolationRecord(page));
        }

        return data;
    }

    /** Returns one further charge's Section II values, as the record carried for each citation page beyond the first. */
    private extractViolationRecord(page: CitationPageModel): IGAUTCViolationData {
        const violation: FormValues<IGAUTCViolationData> = {};

        this.extractViolation(page.getViolationSection(), violation);
        this.extractDui(page.getDuiSection(), violation);
        this.extractOffense(page.getOffenseSection(), violation);

        return violation;
    }

    /**
     * Returns a new form with the given data applied to both of its pages. Every field of the form is reachable
     * from the data contract, and a field the data does not mention keeps the value it already holds - which is
     * how the date and time the form stamps on itself survive a partial record.
     */
    public async populate(form: GAUTCFormModel, { data, readOnlyFields }: IPopulateData<IGAUTCData>): Promise<GAUTCFormModel> {
        return this.populateCourtPage(await this.populateCitationPage(form, data, readOnlyFields), data, readOnlyFields);
    }

    private extractCertification(section: CertificationSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "certificationOfficerSignature", section.getOfficerSignature());
        this.read(data, "certificationSignatureAndTitle", section.getSignatureAndTitle());
        this.read(data, "certificationSwornDay", section.getSwornDay());
        this.read(data, "certificationSwornMonth", section.getSwornMonth());
        this.read(data, "certificationSwornYear", section.getSwornYear());
    }

    private populateCertification(section: CertificationSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): CertificationSectionModel {
        let updated = this.write(section, section.officerSignature, data, "certificationOfficerSignature", readOnlyFields);
        updated = this.write(updated, section.signatureAndTitle, data, "certificationSignatureAndTitle", readOnlyFields);
        updated = this.write(updated, section.swornDay, data, "certificationSwornDay", readOnlyFields);
        updated = this.write(updated, section.swornMonth, data, "certificationSwornMonth", readOnlyFields);

        return this.write(updated, section.swornYear, data, "certificationSwornYear", readOnlyFields);
    }

    private extractConditions(section: ConditionsSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "conditionsCommercialVehicle", section.getCommercialVehicle());
        this.read(data, "conditionsHazardousMaterial", section.getHazardousMaterial());
        this.read(data, "conditionsLightingDarkness", section.getLightingDarkness());
        this.read(data, "conditionsLightingDaylight", section.getLightingDaylight());
        this.read(data, "conditionsLightingOther", section.getLightingOther());
        this.read(data, "conditionsRoadDry", section.getRoadDry());
        this.read(data, "conditionsRoadIce", section.getRoadIce());
        this.read(data, "conditionsRoadOther", section.getRoadOther());
        this.read(data, "conditionsRoadWet", section.getRoadWet());
        this.read(data, "conditionsSixteenPlusPassengers", section.getSixteenPlusPassengers());
        this.read(data, "conditionsSurfaceBlacktop", section.getSurfaceBlacktop());
        this.read(data, "conditionsSurfaceConcrete", section.getSurfaceConcrete());
        this.read(data, "conditionsSurfaceDirt", section.getSurfaceDirt());
        this.read(data, "conditionsSurfaceOther", section.getSurfaceOther());
        this.read(data, "conditionsTrafficHeavy", section.getTrafficHeavy());
        this.read(data, "conditionsTrafficLight", section.getTrafficLight());
        this.read(data, "conditionsTrafficMedium", section.getTrafficMedium());
        this.read(data, "conditionsWeatherClear", section.getWeatherClear());
        this.read(data, "conditionsWeatherCloudy", section.getWeatherCloudy());
        this.read(data, "conditionsWeatherOther", section.getWeatherOther());
        this.read(data, "conditionsWeatherRaining", section.getWeatherRaining());
    }

    private populateConditions(section: ConditionsSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): ConditionsSectionModel {
        let updated = this.write(section, section.commercialVehicle, data, "conditionsCommercialVehicle", readOnlyFields);
        updated = this.write(updated, section.hazardousMaterial, data, "conditionsHazardousMaterial", readOnlyFields);
        updated = this.write(updated, section.lightingDarkness, data, "conditionsLightingDarkness", readOnlyFields);
        updated = this.write(updated, section.lightingDaylight, data, "conditionsLightingDaylight", readOnlyFields);
        updated = this.write(updated, section.lightingOther, data, "conditionsLightingOther", readOnlyFields);
        updated = this.write(updated, section.roadDry, data, "conditionsRoadDry", readOnlyFields);
        updated = this.write(updated, section.roadIce, data, "conditionsRoadIce", readOnlyFields);
        updated = this.write(updated, section.roadOther, data, "conditionsRoadOther", readOnlyFields);
        updated = this.write(updated, section.roadWet, data, "conditionsRoadWet", readOnlyFields);
        updated = this.write(updated, section.sixteenPlusPassengers, data, "conditionsSixteenPlusPassengers", readOnlyFields);
        updated = this.write(updated, section.surfaceBlacktop, data, "conditionsSurfaceBlacktop", readOnlyFields);
        updated = this.write(updated, section.surfaceConcrete, data, "conditionsSurfaceConcrete", readOnlyFields);
        updated = this.write(updated, section.surfaceDirt, data, "conditionsSurfaceDirt", readOnlyFields);
        updated = this.write(updated, section.surfaceOther, data, "conditionsSurfaceOther", readOnlyFields);
        updated = this.write(updated, section.trafficHeavy, data, "conditionsTrafficHeavy", readOnlyFields);
        updated = this.write(updated, section.trafficLight, data, "conditionsTrafficLight", readOnlyFields);
        updated = this.write(updated, section.trafficMedium, data, "conditionsTrafficMedium", readOnlyFields);
        updated = this.write(updated, section.weatherClear, data, "conditionsWeatherClear", readOnlyFields);
        updated = this.write(updated, section.weatherCloudy, data, "conditionsWeatherCloudy", readOnlyFields);
        updated = this.write(updated, section.weatherOther, data, "conditionsWeatherOther", readOnlyFields);

        return this.write(updated, section.weatherRaining, data, "conditionsWeatherRaining", readOnlyFields);
    }

    private extractCourtAction(section: CourtActionSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "courtActionArraignmentPlea", section.getArraignmentPlea());
        this.read(data, "courtActionBailFixed", section.getBailFixed());
        this.read(data, "courtActionBailGivenBySignature", section.getBailGivenBySignature());
        this.read(data, "courtActionBailTakenBySignature", section.getBailTakenBySignature());
        this.read(data, "courtActionCashDeposit", section.getCashDeposit());
        this.read(data, "courtActionClerkSignature", section.getClerkSignature());
        this.read(data, "courtActionComplaintFiled", section.getComplaintFiled());
        this.read(data, "courtActionDate", section.getDate());
        this.read(data, "courtActionFineAmount", section.getFineAmount());
        this.read(data, "courtActionFirstContinuance", section.getFirstContinuance());
        this.read(data, "courtActionFirstContinuanceReason", section.getFirstContinuanceReason());
        this.read(data, "courtActionSecondContinuance", section.getSecondContinuance());
        this.read(data, "courtActionSecondContinuanceReason", section.getSecondContinuanceReason());
        this.read(data, "courtActionWaivesTrialByJury", section.getWaivesTrialByJury());
        this.read(data, "courtActionWarrantIssued", section.getWarrantIssued());
        this.read(data, "courtActionWarrantServed", section.getWarrantServed());
    }

    private populateCourtAction(section: CourtActionSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): CourtActionSectionModel {
        let updated = this.write(section, section.arraignmentPlea, data, "courtActionArraignmentPlea", readOnlyFields);
        updated = this.write(updated, section.bailFixed, data, "courtActionBailFixed", readOnlyFields);
        updated = this.write(updated, section.bailGivenBySignature, data, "courtActionBailGivenBySignature", readOnlyFields);
        updated = this.write(updated, section.bailTakenBySignature, data, "courtActionBailTakenBySignature", readOnlyFields);
        updated = this.write(updated, section.cashDeposit, data, "courtActionCashDeposit", readOnlyFields);
        updated = this.write(updated, section.clerkSignature, data, "courtActionClerkSignature", readOnlyFields);
        updated = this.write(updated, section.complaintFiled, data, "courtActionComplaintFiled", readOnlyFields);
        updated = this.write(updated, section.date, data, "courtActionDate", readOnlyFields);
        updated = this.write(updated, section.fineAmount, data, "courtActionFineAmount", readOnlyFields);
        updated = this.write(updated, section.firstContinuance, data, "courtActionFirstContinuance", readOnlyFields);
        updated = this.write(updated, section.firstContinuanceReason, data, "courtActionFirstContinuanceReason", readOnlyFields);
        updated = this.write(updated, section.secondContinuance, data, "courtActionSecondContinuance", readOnlyFields);
        updated = this.write(updated, section.secondContinuanceReason, data, "courtActionSecondContinuanceReason", readOnlyFields);
        updated = this.write(updated, section.waivesTrialByJury, data, "courtActionWaivesTrialByJury", readOnlyFields);
        updated = this.write(updated, section.warrantIssued, data, "courtActionWarrantIssued", readOnlyFields);

        return this.write(updated, section.warrantServed, data, "courtActionWarrantServed", readOnlyFields);
    }

    private extractDisposition(section: DispositionSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "dispositionAlcoholDrugAssessment", section.getAlcoholDrugAssessment());
        this.read(data, "dispositionAlcoholDrugRiskReductionSchool", section.getAlcoholDrugRiskReductionSchool());
        this.read(data, "dispositionBondForfeiture", section.getBondForfeiture());
        this.read(data, "dispositionDaysInJail", section.getDaysInJail());
        this.read(data, "dispositionDeadDocket", section.getDeadDocket());
        this.read(data, "dispositionDefensiveDrivingSchool", section.getDefensiveDrivingSchool());
        this.read(data, "dispositionFineAmount", section.getFineAmount());
        this.read(data, "dispositionNolleProssed", section.getNolleProssed());
        this.read(data, "dispositionPleadsGuilty", section.getPleadsGuilty());
        this.read(data, "dispositionPleadsNoloContendere", section.getPleadsNoloContendere());
        this.read(data, "dispositionPleadsNotGuilty", section.getPleadsNotGuilty());
        this.read(data, "dispositionTrialCourtAdjudicated", section.getTrialCourtAdjudicated());
        this.read(data, "dispositionTrialGuilty", section.getTrialGuilty());
        this.read(data, "dispositionTrialJury", section.getTrialJury());
        this.read(data, "dispositionTrialNotGuilty", section.getTrialNotGuilty());
    }

    private populateDisposition(section: DispositionSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): DispositionSectionModel {
        let updated = this.write(section, section.alcoholDrugAssessment, data, "dispositionAlcoholDrugAssessment", readOnlyFields);
        updated = this.write(updated, section.alcoholDrugRiskReductionSchool, data, "dispositionAlcoholDrugRiskReductionSchool", readOnlyFields);
        updated = this.write(updated, section.bondForfeiture, data, "dispositionBondForfeiture", readOnlyFields);
        updated = this.write(updated, section.daysInJail, data, "dispositionDaysInJail", readOnlyFields);
        updated = this.write(updated, section.deadDocket, data, "dispositionDeadDocket", readOnlyFields);
        updated = this.write(updated, section.defensiveDrivingSchool, data, "dispositionDefensiveDrivingSchool", readOnlyFields);
        updated = this.write(updated, section.fineAmount, data, "dispositionFineAmount", readOnlyFields);
        updated = this.write(updated, section.nolleProssed, data, "dispositionNolleProssed", readOnlyFields);
        updated = this.write(updated, section.pleadsGuilty, data, "dispositionPleadsGuilty", readOnlyFields);
        updated = this.write(updated, section.pleadsNoloContendere, data, "dispositionPleadsNoloContendere", readOnlyFields);
        updated = this.write(updated, section.pleadsNotGuilty, data, "dispositionPleadsNotGuilty", readOnlyFields);
        updated = this.write(updated, section.trialCourtAdjudicated, data, "dispositionTrialCourtAdjudicated", readOnlyFields);
        updated = this.write(updated, section.trialGuilty, data, "dispositionTrialGuilty", readOnlyFields);
        updated = this.write(updated, section.trialJury, data, "dispositionTrialJury", readOnlyFields);

        return this.write(updated, section.trialNotGuilty, data, "dispositionTrialNotGuilty", readOnlyFields);
    }

    private extractDui(section: DuiSectionModel, data: FormValues<IGAUTCViolationData>): void {
        this.read(data, "duiCharged", section.getCharged());
        this.read(data, "duiTestAdministeredBy", section.getTestAdministeredBy());
        this.read(data, "duiTestBlood", section.getTestBlood());
        this.read(data, "duiTestBreath", section.getTestBreath());
        this.read(data, "duiTestOther", section.getTestOther());
        this.read(data, "duiTestResults", section.getTestResults());
        this.read(data, "duiTestUrine", section.getTestUrine());
    }

    private populateDui(section: DuiSectionModel, data: IGAUTCViolationData): DuiSectionModel {
        let updated = this.write(section, section.charged, data, "duiCharged");
        updated = this.write(updated, section.testAdministeredBy, data, "duiTestAdministeredBy");
        updated = this.write(updated, section.testBlood, data, "duiTestBlood");
        updated = this.write(updated, section.testBreath, data, "duiTestBreath");
        updated = this.write(updated, section.testOther, data, "duiTestOther");
        updated = this.write(updated, section.testResults, data, "duiTestResults");

        return this.write(updated, section.testUrine, data, "duiTestUrine");
    }

    private extractHeader(section: HeaderSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "headerAm", section.getAm());
        this.read(data, "headerCicaNumber", section.getCicaNumber());
        this.read(data, "headerCitationNumber", section.getCitationNumber());
        this.read(data, "headerDay", section.getDay());
        this.read(data, "headerHour", section.getHour());
        this.read(data, "headerMinute", section.getMinute());
        this.read(data, "headerMonth", section.getMonth());
        this.read(data, "headerNcicNumber", section.getNcicNumber());
        this.read(data, "headerPm", section.getPm());
        this.read(data, "headerYear", section.getYear());
    }

    private populateHeader(section: HeaderSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): HeaderSectionModel {
        let updated = this.write(section, section.am, data, "headerAm", readOnlyFields);
        updated = this.write(updated, section.cicaNumber, data, "headerCicaNumber", readOnlyFields);
        updated = this.write(updated, section.citationNumber, data, "headerCitationNumber", readOnlyFields);
        updated = this.write(updated, section.day, data, "headerDay", readOnlyFields);
        updated = this.write(updated, section.hour, data, "headerHour", readOnlyFields);
        updated = this.write(updated, section.minute, data, "headerMinute", readOnlyFields);
        updated = this.write(updated, section.month, data, "headerMonth", readOnlyFields);
        updated = this.write(updated, section.ncicNumber, data, "headerNcicNumber", readOnlyFields);
        updated = this.write(updated, section.pm, data, "headerPm", readOnlyFields);

        return this.write(updated, section.year, data, "headerYear", readOnlyFields);
    }

    private extractJudgment(section: JudgmentSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "judgmentAppealBond", section.getAppealBond());
        this.read(data, "judgmentConfinementTerm", section.getConfinementTerm());
        this.read(data, "judgmentDate", section.getDate());
        this.read(data, "judgmentFineAmount", section.getFineAmount());
        this.read(data, "judgmentJudgeSignature", section.getJudgeSignature());
    }

    private populateJudgment(section: JudgmentSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): JudgmentSectionModel {
        let updated = this.write(section, section.appealBond, data, "judgmentAppealBond", readOnlyFields);
        updated = this.write(updated, section.confinementTerm, data, "judgmentConfinementTerm", readOnlyFields);
        updated = this.write(updated, section.date, data, "judgmentDate", readOnlyFields);
        updated = this.write(updated, section.fineAmount, data, "judgmentFineAmount", readOnlyFields);

        return this.write(updated, section.judgeSignature, data, "judgmentJudgeSignature", readOnlyFields);
    }

    private extractLocation(section: LocationSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "locationCity", section.getCity());
        this.read(data, "locationCounty", section.getCounty());
        this.read(data, "locationStreet", section.getStreet());
    }

    private populateLocation(section: LocationSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): LocationSectionModel {
        let updated = this.write(section, section.city, data, "locationCity", readOnlyFields);
        updated = this.write(updated, section.county, data, "locationCounty", readOnlyFields);

        return this.write(updated, section.street, data, "locationStreet", readOnlyFields);
    }

    private extractOffense(section: OffenseSectionModel, data: FormValues<IGAUTCViolationData>): void {
        this.read(data, "offenseCodeSection", section.getCodeSection());
        this.read(data, "offenseCompanionCaseNo", section.getCompanionCaseNo());
        this.read(data, "offenseCompanionCaseYes", section.getCompanionCaseYes());
        this.read(data, "offenseCompanionCitation", section.getCompanionCitation());
        this.read(data, "offenseDescription", section.getDescription());
        this.read(data, "offenseLocalOrdinance", section.getLocalOrdinance());
        this.read(data, "offenseRemarks", section.getRemarks());
        this.read(data, "offenseStateLaw", section.getStateLaw());
    }

    private populateOffense(section: OffenseSectionModel, data: IGAUTCViolationData): OffenseSectionModel {
        let updated = this.write(section, section.codeSection, data, "offenseCodeSection");
        updated = this.write(updated, section.companionCaseNo, data, "offenseCompanionCaseNo");
        updated = this.write(updated, section.companionCaseYes, data, "offenseCompanionCaseYes");
        updated = this.write(updated, section.companionCitation, data, "offenseCompanionCitation");
        updated = this.write(updated, section.description, data, "offenseDescription");
        updated = this.write(updated, section.localOrdinance, data, "offenseLocalOrdinance");
        updated = this.write(updated, section.remarks, data, "offenseRemarks");

        return this.write(updated, section.stateLaw, data, "offenseStateLaw");
    }

    private extractOfficer(section: OfficerSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "officerApdIdNumber", section.getApdIdNumber());
        this.read(data, "officerAssignment", section.getAssignment());
        this.read(data, "officerCourtCode", section.getCourtCode());
        this.read(data, "officerName", section.getOfficerName());
        this.read(data, "officerOffDays", section.getOffDays());
        this.read(data, "officerSecondApdIdNumber", section.getSecondApdIdNumber());
        this.read(data, "officerSecondAssignment", section.getSecondAssignment());
        this.read(data, "officerSecondCourtCode", section.getSecondCourtCode());
        this.read(data, "officerSecondName", section.getSecondOfficerName());
        this.read(data, "officerSecondOffDays", section.getSecondOffDays());
        this.read(data, "officerSecondTime", section.getSecondTime());
        this.read(data, "officerTime", section.getTime());
    }

    private populateOfficer(section: OfficerSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): OfficerSectionModel {
        let updated = this.write(section, section.apdIdNumber, data, "officerApdIdNumber", readOnlyFields);
        updated = this.write(updated, section.assignment, data, "officerAssignment", readOnlyFields);
        updated = this.write(updated, section.courtCode, data, "officerCourtCode", readOnlyFields);
        updated = this.write(updated, section.officerName, data, "officerName", readOnlyFields);
        updated = this.write(updated, section.offDays, data, "officerOffDays", readOnlyFields);
        updated = this.write(updated, section.secondApdIdNumber, data, "officerSecondApdIdNumber", readOnlyFields);
        updated = this.write(updated, section.secondAssignment, data, "officerSecondAssignment", readOnlyFields);
        updated = this.write(updated, section.secondCourtCode, data, "officerSecondCourtCode", readOnlyFields);
        updated = this.write(updated, section.secondOfficerName, data, "officerSecondName", readOnlyFields);
        updated = this.write(updated, section.secondOffDays, data, "officerSecondOffDays", readOnlyFields);
        updated = this.write(updated, section.secondTime, data, "officerSecondTime", readOnlyFields);

        return this.write(updated, section.time, data, "officerTime", readOnlyFields);
    }

    private extractPlea(section: PleaSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "pleaAccusedName", section.getAccusedName());
        this.read(data, "pleaAccusedSignature", section.getAccusedSignature());
        this.read(data, "pleaChargedWith", section.getChargedWith());
        this.read(data, "pleaDay", section.getDay());
        this.read(data, "pleaJudgeName", section.getJudgeName());
        this.read(data, "pleaJudgeSignature", section.getJudgeSignature());
        this.read(data, "pleaMaximumFine", section.getMaximumFine());
        this.read(data, "pleaMaximumMonths", section.getMaximumMonths());
        this.read(data, "pleaMinimumFine", section.getMinimumFine());
        this.read(data, "pleaMinimumMonths", section.getMinimumMonths());
        this.read(data, "pleaMonth", section.getMonth());
        this.read(data, "pleaYear", section.getYear());
    }

    private populatePlea(section: PleaSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): PleaSectionModel {
        let updated = this.write(section, section.accusedName, data, "pleaAccusedName", readOnlyFields);
        updated = this.write(updated, section.accusedSignature, data, "pleaAccusedSignature", readOnlyFields);
        updated = this.write(updated, section.chargedWith, data, "pleaChargedWith", readOnlyFields);
        updated = this.write(updated, section.day, data, "pleaDay", readOnlyFields);
        updated = this.write(updated, section.judgeName, data, "pleaJudgeName", readOnlyFields);
        updated = this.write(updated, section.judgeSignature, data, "pleaJudgeSignature", readOnlyFields);
        updated = this.write(updated, section.maximumFine, data, "pleaMaximumFine", readOnlyFields);
        updated = this.write(updated, section.maximumMonths, data, "pleaMaximumMonths", readOnlyFields);
        updated = this.write(updated, section.minimumFine, data, "pleaMinimumFine", readOnlyFields);
        updated = this.write(updated, section.minimumMonths, data, "pleaMinimumMonths", readOnlyFields);
        updated = this.write(updated, section.month, data, "pleaMonth", readOnlyFields);

        return this.write(updated, section.year, data, "pleaYear", readOnlyFields);
    }

    private extractStatus(section: StatusSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "statusAccidentNo", section.getAccidentNo());
        this.read(data, "statusAccidentYes", section.getAccidentYes());
        this.read(data, "statusCdlNo", section.getCdlNo());
        this.read(data, "statusCdlYes", section.getCdlYes());
        this.read(data, "statusFatalitiesNo", section.getFatalitiesNo());
        this.read(data, "statusFatalitiesYes", section.getFatalitiesYes());
        this.read(data, "statusInjuriesNo", section.getInjuriesNo());
        this.read(data, "statusInjuriesYes", section.getInjuriesYes());
    }

    private populateStatus(section: StatusSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): StatusSectionModel {
        let updated = this.write(section, section.accidentNo, data, "statusAccidentNo", readOnlyFields);
        updated = this.write(updated, section.accidentYes, data, "statusAccidentYes", readOnlyFields);
        updated = this.write(updated, section.cdlNo, data, "statusCdlNo", readOnlyFields);
        updated = this.write(updated, section.cdlYes, data, "statusCdlYes", readOnlyFields);
        updated = this.write(updated, section.fatalitiesNo, data, "statusFatalitiesNo", readOnlyFields);
        updated = this.write(updated, section.fatalitiesYes, data, "statusFatalitiesYes", readOnlyFields);
        updated = this.write(updated, section.injuriesNo, data, "statusInjuriesNo", readOnlyFields);

        return this.write(updated, section.injuriesYes, data, "statusInjuriesYes", readOnlyFields);
    }

    private extractSummons(section: SummonsSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "summonsAm", section.getAm());
        this.read(data, "summonsAppearanceDay", section.getAppearanceDay());
        this.read(data, "summonsAppearanceMonth", section.getAppearanceMonth());
        this.read(data, "summonsAppearanceYear", section.getAppearanceYear());
        this.read(data, "summonsCity", section.getCity());
        this.read(data, "summonsCopy", section.getCopy());
        this.read(data, "summonsCourtName", section.getCourtName());
        this.read(data, "summonsHour", section.getHour());
        this.read(data, "summonsJail", section.getJail());
        this.read(data, "summonsLicenseDisplayedNo", section.getLicenseDisplayedNo());
        this.read(data, "summonsLicenseDisplayedYes", section.getLicenseDisplayedYes());
        this.read(data, "summonsMinute", section.getMinute());
        this.read(data, "summonsPm", section.getPm());
        this.read(data, "summonsReleaseTo", section.getReleaseTo());
        this.read(data, "summonsSignature", section.getSignature());
    }

    private populateSummons(section: SummonsSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): SummonsSectionModel {
        let updated = this.write(section, section.am, data, "summonsAm", readOnlyFields);
        updated = this.write(updated, section.appearanceDay, data, "summonsAppearanceDay", readOnlyFields);
        updated = this.write(updated, section.appearanceMonth, data, "summonsAppearanceMonth", readOnlyFields);
        updated = this.write(updated, section.appearanceYear, data, "summonsAppearanceYear", readOnlyFields);
        updated = this.write(updated, section.city, data, "summonsCity", readOnlyFields);
        updated = this.write(updated, section.copy, data, "summonsCopy", readOnlyFields);
        updated = this.write(updated, section.courtName, data, "summonsCourtName", readOnlyFields);
        updated = this.write(updated, section.hour, data, "summonsHour", readOnlyFields);
        updated = this.write(updated, section.jail, data, "summonsJail", readOnlyFields);
        updated = this.write(updated, section.licenseDisplayedNo, data, "summonsLicenseDisplayedNo", readOnlyFields);
        updated = this.write(updated, section.licenseDisplayedYes, data, "summonsLicenseDisplayedYes", readOnlyFields);
        updated = this.write(updated, section.minute, data, "summonsMinute", readOnlyFields);
        updated = this.write(updated, section.pm, data, "summonsPm", readOnlyFields);
        updated = this.write(updated, section.releaseTo, data, "summonsReleaseTo", readOnlyFields);

        return this.write(updated, section.signature, data, "summonsSignature", readOnlyFields);
    }

    private extractVehicle(section: VehicleSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "vehicleColor", section.getColor());
        this.read(data, "vehicleMake", section.getMake());
        this.read(data, "vehicleModel", section.getModel());
        this.read(data, "vehicleRegistrationNumber", section.getRegistrationNumber());
        this.read(data, "vehicleRegistrationState", section.getRegistrationState());
        this.read(data, "vehicleRegistrationYear", section.getRegistrationYear());
        this.read(data, "vehicleYear", section.getYear());
    }

    private populateVehicle(section: VehicleSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): VehicleSectionModel {
        let updated = this.write(section, section.color, data, "vehicleColor", readOnlyFields);
        updated = this.write(updated, section.make, data, "vehicleMake", readOnlyFields);
        updated = this.write(updated, section.model, data, "vehicleModel", readOnlyFields);
        updated = this.write(updated, section.registrationNumber, data, "vehicleRegistrationNumber", readOnlyFields);
        updated = this.write(updated, section.registrationState, data, "vehicleRegistrationState", readOnlyFields);
        updated = this.write(updated, section.registrationYear, data, "vehicleRegistrationYear", readOnlyFields);

        return this.write(updated, section.year, data, "vehicleYear", readOnlyFields);
    }

    private extractViolation(section: ViolationSectionModel, data: FormValues<IGAUTCViolationData>): void {
        this.read(data, "violationCalibrationCheck", section.getCalibrationCheck());
        this.read(data, "violationClockedByOther", section.getClockedByOther());
        this.read(data, "violationClockedByPatrolVehicle", section.getClockedByPatrolVehicle());
        this.read(data, "violationClockedSpeed", section.getClockedSpeed());
        this.read(data, "violationDriverRequestedAccuracyCheck", section.getDriverRequestedAccuracyCheck());
        this.read(data, "violationLaser", section.getLaser());
        this.read(data, "violationRadar", section.getRadar());
        this.read(data, "violationSerialNumber", section.getSerialNumber());
        this.read(data, "violationSpeedZone", section.getSpeedZone());
        this.read(data, "violationTwoLaneRoad", section.getTwoLaneRoad());
        this.read(data, "violationVascar", section.getVascar());
    }

    private populateViolation(section: ViolationSectionModel, data: IGAUTCViolationData): ViolationSectionModel {
        let updated = this.write(section, section.calibrationCheck, data, "violationCalibrationCheck");
        updated = this.write(updated, section.clockedByOther, data, "violationClockedByOther");
        updated = this.write(updated, section.clockedByPatrolVehicle, data, "violationClockedByPatrolVehicle");
        updated = this.write(updated, section.clockedSpeed, data, "violationClockedSpeed");
        updated = this.write(updated, section.driverRequestedAccuracyCheck, data, "violationDriverRequestedAccuracyCheck");
        updated = this.write(updated, section.laser, data, "violationLaser");
        updated = this.write(updated, section.radar, data, "violationRadar");
        updated = this.write(updated, section.serialNumber, data, "violationSerialNumber");
        updated = this.write(updated, section.speedZone, data, "violationSpeedZone");
        updated = this.write(updated, section.twoLaneRoad, data, "violationTwoLaneRoad");

        return this.write(updated, section.vascar, data, "violationVascar");
    }

    private extractViolator(section: ViolatorSectionModel, data: FormValues<IGAUTCData>): void {
        this.read(data, "violatorAddress", section.getAddress());
        this.read(data, "violatorApartment", section.getApartment());
        this.read(data, "violatorCity", section.getCity());
        this.read(data, "violatorDateOfBirth", section.getDateOfBirth());
        this.read(data, "violatorEye", section.getEye());
        this.read(data, "violatorFirstName", section.getFirstName());
        this.read(data, "violatorHair", section.getHair());
        this.read(data, "violatorHeight", section.getHeight());
        this.read(data, "violatorLastName", section.getLastName());
        this.read(data, "violatorLicenseClass", section.getLicenseClass());
        this.read(data, "violatorLicenseEndorsements", section.getLicenseEndorsements());
        this.read(data, "violatorLicenseExpires", section.getLicenseExpires());
        this.read(data, "violatorLicenseState", section.getLicenseState());
        this.read(data, "violatorMiddleName", section.getMiddleName());
        this.read(data, "violatorOperatorLicenseNumber", section.getOperatorLicenseNumber());
        this.read(data, "violatorPhone", section.getPhone());
        this.read(data, "violatorRace", section.getRace());
        this.read(data, "violatorSex", section.getSex());
        this.read(data, "violatorState", section.getState());
        this.read(data, "violatorSuffix", section.getSuffix());
        this.read(data, "violatorWeight", section.getWeight());
        this.read(data, "violatorZipCode", section.getZipCode());
    }

    private populateViolator(section: ViolatorSectionModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): ViolatorSectionModel {
        let updated = this.write(section, section.address, data, "violatorAddress", readOnlyFields);
        updated = this.write(updated, section.apartment, data, "violatorApartment", readOnlyFields);
        updated = this.write(updated, section.city, data, "violatorCity", readOnlyFields);
        updated = this.write(updated, section.dateOfBirth, data, "violatorDateOfBirth", readOnlyFields);
        updated = this.write(updated, section.eye, data, "violatorEye", readOnlyFields);
        updated = this.write(updated, section.firstName, data, "violatorFirstName", readOnlyFields);
        updated = this.write(updated, section.hair, data, "violatorHair", readOnlyFields);
        updated = this.write(updated, section.height, data, "violatorHeight", readOnlyFields);
        updated = this.write(updated, section.lastName, data, "violatorLastName", readOnlyFields);
        updated = this.write(updated, section.licenseClass, data, "violatorLicenseClass", readOnlyFields);
        updated = this.write(updated, section.licenseEndorsements, data, "violatorLicenseEndorsements", readOnlyFields);
        updated = this.write(updated, section.licenseExpires, data, "violatorLicenseExpires", readOnlyFields);
        updated = this.write(updated, section.licenseState, data, "violatorLicenseState", readOnlyFields);
        updated = this.write(updated, section.middleName, data, "violatorMiddleName", readOnlyFields);
        updated = this.write(updated, section.operatorLicenseNumber, data, "violatorOperatorLicenseNumber", readOnlyFields);
        updated = this.write(updated, section.phone, data, "violatorPhone", readOnlyFields);
        updated = this.write(updated, section.race, data, "violatorRace", readOnlyFields);
        updated = this.write(updated, section.sex, data, "violatorSex", readOnlyFields);
        updated = this.write(updated, section.state, data, "violatorState", readOnlyFields);
        updated = this.write(updated, section.suffix, data, "violatorSuffix", readOnlyFields);
        updated = this.write(updated, section.weight, data, "violatorWeight", readOnlyFields);

        return this.write(updated, section.zipCode, data, "violatorZipCode", readOnlyFields);
    }

    /** Returns a new form with the data applied to its twelve citation page sections. */
    /**
     * Returns a form with the data applied to its citation pages, creating a page per further violation.
     *
     * The shared sections are written onto every page rather than only the first: a page created here does not go
     * through the form controller, which is what would otherwise have copied them across. Pages beyond the end of
     * `additionalViolations` are left alone rather than removed, so a record naming fewer charges than the form
     * holds never silently discards a page an officer added.
     */
    private async populateCitationPage(form: GAUTCFormModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): Promise<GAUTCFormModel> {
        const additional = data.additionalViolations ?? [];

        let form2 = form;

        // initialize must be awaited, since it is what creates the page's sections and registers its dropzones
        while (form2.getCitationPageCollection().pages.length < additional.length + 1) {
            form2 = form2.addPage(await form2.citationPage.createPage(form2).initialize(), form2.citationPage);
        }

        let collection = form2.getCitationPageCollection();

        collection.getPages<CitationPageModel>().forEach((page, index) => {
            let updated = page.set(page.headerSection, this.populateHeader(page.getHeaderSection(), data, readOnlyFields));
            updated = updated.set(updated.violatorSection, this.populateViolator(updated.getViolatorSection(), data, readOnlyFields));
            updated = updated.set(updated.vehicleSection, this.populateVehicle(updated.getVehicleSection(), data, readOnlyFields));
            updated = updated.set(updated.statusSection, this.populateStatus(updated.getStatusSection(), data, readOnlyFields));
            updated = updated.set(updated.conditionsSection, this.populateConditions(updated.getConditionsSection(), data, readOnlyFields));
            updated = updated.set(updated.locationSection, this.populateLocation(updated.getLocationSection(), data, readOnlyFields));
            updated = updated.set(updated.officerSection, this.populateOfficer(updated.getOfficerSection(), data, readOnlyFields));
            updated = updated.set(updated.summonsSection, this.populateSummons(updated.getSummonsSection(), data, readOnlyFields));
            updated = updated.set(updated.certificationSection, this.populateCertification(updated.getCertificationSection(), data, readOnlyFields));

            // Section II is what differs page to page; the first charge comes from the flat fields and the rest
            // from the array, and a page the data does not reach keeps what it holds
            const violation = index === 0 ? data : additional[index - 1];
            if (violation) {
                updated = updated.set(updated.violationSection, this.populateViolation(updated.getViolationSection(), violation));
                updated = updated.set(updated.duiSection, this.populateDui(updated.getDuiSection(), violation));
                updated = updated.set(updated.offenseSection, this.populateOffense(updated.getOffenseSection(), violation));
            }

            collection = collection.replace(index, updated);
        });

        return form2.set(form2.citationPage, collection);
    }

    /** Returns a new form with the data applied to its four court page sections. */
    private populateCourtPage(form: GAUTCFormModel, data: IGAUTCData, readOnlyFields?: ReadOnlyFields<IGAUTCData>): GAUTCFormModel {
        const collection = form.getCourtPageCollection();
        const page = collection.getFirstPage<CourtPageModel>();

        let updated = page.set(page.courtActionSection, this.populateCourtAction(page.getCourtActionSection(), data, readOnlyFields));
        updated = updated.set(updated.pleaSection, this.populatePlea(updated.getPleaSection(), data, readOnlyFields));
        updated = updated.set(updated.dispositionSection, this.populateDisposition(updated.getDispositionSection(), data, readOnlyFields));
        updated = updated.set(updated.judgmentSection, this.populateJudgment(updated.getJudgmentSection(), data, readOnlyFields));

        return form.set(form.courtPage, collection.replace(0, updated));
    }
}
