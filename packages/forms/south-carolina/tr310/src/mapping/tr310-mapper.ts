import { IPopulateData, FormMapper, FormValues, PageCollection, PageDefinition, ReadOnlyFields, SectionCollection } from "@forms/core";

import { TR310FormModel } from "../models/tr310-form";
import { CollisionPageModel } from "../models/collision-page/collision-page";
import { PersonPageModel } from "../models/person-page/person-page";
import { UnitPageModel } from "../models/unit-page/unit-page";
import { NarrativePageModel } from "../models/narrative-page/narrative-page";
import { HeaderSectionModel } from "../models/collision-page/header-section";
import { CollisionSectionModel } from "../models/collision-page/collision-section";
import { RouteSectionModel } from "../models/collision-page/route-section";
import { BaseIntersectionSectionModel } from "../models/collision-page/base-intersection-section";
import { SecondIntersectionSectionModel } from "../models/collision-page/second-intersection-section";
import { CoordinatesSectionModel } from "../models/collision-page/coordinates-section";
import { TrafficwaySectionModel } from "../models/collision-page/trafficway-section";
import { BarrierSectionModel } from "../models/collision-page/barrier-section";
import { ConditionsSectionModel } from "../models/collision-page/conditions-section";
import { HarmfulEventSectionModel } from "../models/collision-page/harmful-event-section";
import { JunctionSectionModel } from "../models/collision-page/junction-section";
import { WorkZoneSectionModel } from "../models/collision-page/work-zone-section";
import { WitnessSectionModel } from "../models/collision-page/witness-section";
import { CollisionOfficerSectionModel } from "../models/collision-page/collision-officer-section";
import { PersonHeaderSectionModel } from "../models/person-page/person-header-section";
import { PersonSectionModel } from "../models/person-page/person-section";
import { DriverLicenseSectionModel } from "../models/person-page/driver-license-section";
import { DriverActionsSectionModel } from "../models/person-page/driver-actions-section";
import { OccupantSectionModel } from "../models/person-page/occupant-section";
import { NonMotoristSectionModel } from "../models/person-page/non-motorist-section";
import { InjurySectionModel } from "../models/person-page/injury-section";
import { SafetyEquipmentSectionModel } from "../models/person-page/safety-equipment-section";
import { AlcoholDrugsSectionModel } from "../models/person-page/alcohol-drugs-section";
import { PassengersSectionModel } from "../models/person-page/passengers-section";
import { PersonOfficerSectionModel } from "../models/person-page/person-officer-section";
import { UnitHeaderSectionModel } from "../models/unit-page/unit-header-section";
import { VehicleSectionModel } from "../models/unit-page/vehicle-section";
import { InsuranceSectionModel } from "../models/unit-page/insurance-section";
import { OwnerSectionModel } from "../models/unit-page/owner-section";
import { TravelSectionModel } from "../models/unit-page/travel-section";
import { DamageSectionModel } from "../models/unit-page/damage-section";
import { UnitTypeSectionModel } from "../models/unit-page/unit-type-section";
import { EventsSectionModel } from "../models/unit-page/events-section";
import { RoadwaySectionModel } from "../models/unit-page/roadway-section";
import { ViolationsSectionModel } from "../models/unit-page/violations-section";
import { UnitOfficerSectionModel } from "../models/unit-page/unit-officer-section";
import { NarrativeHeaderSectionModel } from "../models/narrative-page/narrative-header-section";
import { NarrativeSectionModel } from "../models/narrative-page/narrative-section";
import { DiagramSectionModel } from "../models/narrative-page/diagram-section";
import { AdditionalPassengersSectionModel } from "../models/narrative-page/additional-passengers-section";
import { NarrativeOfficerSectionModel } from "../models/narrative-page/narrative-officer-section";
import { ITR310Data, ITR310PassengerData, ITR310PersonData, ITR310UnitData, ITR310WitnessData } from "./tr310-data";

/**
 * Maps the SC TR-310 traffic collision report to and from the data contract it publishes. Each section's read
 * sits directly above its write below, so a forgotten field shows up in the same diff. Collision and narrative
 * pages appear once and map straight across; person and unit pages repeat, so populating creates a page per
 * record before writing one, hence the promise.
 */
export class TR310Mapper extends FormMapper<TR310FormModel, ITR310Data> {
    /** Returns the form's current values as its data contract, emitting only the fields this report owns. */
    public extract(form: TR310FormModel): ITR310Data {
        const collisionPage = form.getCollisionPage();
        const narrativePage = form.getNarrativePage();
        const data: FormValues<ITR310Data> = {};

        this.extractHeader(collisionPage.getHeaderSection(), data);
        this.extractCollision(collisionPage.getCollisionSection(), data);
        this.extractRoute(collisionPage.getRouteSection(), data);
        this.extractBaseIntersection(collisionPage.getBaseIntersectionSection(), data);
        this.extractSecondIntersection(collisionPage.getSecondIntersectionSection(), data);
        this.extractCoordinates(collisionPage.getCoordinatesSection(), data);
        this.extractTrafficway(collisionPage.getTrafficwaySection(), data);
        this.extractBarrier(collisionPage.getBarrierSection(), data);
        this.extractConditions(collisionPage.getConditionsSection(), data);
        this.extractHarmfulEvent(collisionPage.getHarmfulEventSection(), data);
        this.extractJunction(collisionPage.getJunctionSection(), data);
        this.extractWorkZone(collisionPage.getWorkZoneSection(), data);
        data.witnesses = this.extractWitness(collisionPage.getWitnessSection());
        this.extractCollisionOfficer(collisionPage.getCollisionOfficerSection(), data);

        this.extractNarrativeHeader(narrativePage.getNarrativeHeaderSection(), data);
        this.extractNarrative(narrativePage.getNarrativeSection(), data);
        this.extractDiagram(narrativePage.getDiagramSection(), data);
        data.additionalPassengers = this.extractAdditionalPassengers(narrativePage.getAdditionalPassengersSection());
        this.extractNarrativeOfficer(narrativePage.getNarrativeOfficerSection(), data);

        data.persons = form.getPersonPages().map(page => this.extractPersonRecord(page));
        data.units = form.getUnitPages().map(page => this.extractUnitRecord(page));

        return data;
    }

    /**
     * Returns a new form with the data applied. A field the data omits keeps its current value -- how the date
     * the form stamps on itself survives a partial record. A page is added for every person and unit beyond the
     * pages the form already holds; pages beyond either array are left alone rather than removed, so data
     * mentioning fewer units never silently discards a page an officer added.
     */
    public async populate(form: TR310FormModel, { data, readOnlyFields }: IPopulateData<ITR310Data>): Promise<TR310FormModel> {
        let updated = this.populateCollisionPage(form, data, readOnlyFields);
        updated = this.populateNarrativePage(updated, data, readOnlyFields);

        updated = await this.addPages(updated, updated.personPage, data.persons?.length ?? 0);
        updated = await this.addPages(updated, updated.unitPage, data.units?.length ?? 0);

        updated = this.populatePersonPages(updated, data.persons ?? []);

        return this.populateUnitPages(updated, data.units ?? []);
    }

    /** Returns a form carrying at least `count` pages for the given definition, creating and initializing any that are missing. */
    private async addPages(form: TR310FormModel, pageDefinition: PageDefinition, count: number): Promise<TR310FormModel> {
        let updated = form;

        // initialize must be awaited, since it is what creates the page's sections and registers its dropzones
        while (updated.get<PageCollection>(pageDefinition).pages.length < count) {
            updated = updated.addPage(await pageDefinition.createPage(updated).initialize(), pageDefinition);
        }

        return updated;
    }

    /** Returns the collision page's values as the flat half of the data contract. */
    private populateCollisionPage(form: TR310FormModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): TR310FormModel {
        const collection = form.getCollisionPageCollection();
        const page = collection.getFirstPage<CollisionPageModel>();

        let updated = page.set(page.headerSection, this.populateHeader(page.getHeaderSection(), data, readOnlyFields));
        updated = updated.set(updated.collisionSection, this.populateCollision(updated.getCollisionSection(), data, readOnlyFields));
        updated = updated.set(updated.routeSection, this.populateRoute(updated.getRouteSection(), data, readOnlyFields));
        updated = updated.set(updated.baseIntersectionSection, this.populateBaseIntersection(updated.getBaseIntersectionSection(), data, readOnlyFields));
        updated = updated.set(updated.secondIntersectionSection, this.populateSecondIntersection(updated.getSecondIntersectionSection(), data, readOnlyFields));
        updated = updated.set(updated.coordinatesSection, this.populateCoordinates(updated.getCoordinatesSection(), data, readOnlyFields));
        updated = updated.set(updated.trafficwaySection, this.populateTrafficway(updated.getTrafficwaySection(), data, readOnlyFields));
        updated = updated.set(updated.barrierSection, this.populateBarrier(updated.getBarrierSection(), data, readOnlyFields));
        updated = updated.set(updated.conditionsSection, this.populateConditions(updated.getConditionsSection(), data, readOnlyFields));
        updated = updated.set(updated.harmfulEventSection, this.populateHarmfulEvent(updated.getHarmfulEventSection(), data, readOnlyFields));
        updated = updated.set(updated.junctionSection, this.populateJunction(updated.getJunctionSection(), data, readOnlyFields));
        updated = updated.set(updated.workZoneSection, this.populateWorkZone(updated.getWorkZoneSection(), data, readOnlyFields));
        updated = updated.set(updated.witnessSection, this.populateWitness(updated.getWitnessSection(), data.witnesses));
        updated = updated.set(updated.collisionOfficerSection, this.populateCollisionOfficer(updated.getCollisionOfficerSection(), data, readOnlyFields));

        return form.set(form.collisionPage, collection.replace(0, updated));
    }

    /** Returns a form with the narrative page's half of the data contract applied. */
    private populateNarrativePage(form: TR310FormModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): TR310FormModel {
        const collection = form.getNarrativePageCollection();
        const page = collection.getFirstPage<NarrativePageModel>();

        let updated = page.set(page.narrativeHeaderSection, this.populateNarrativeHeader(page.getNarrativeHeaderSection(), data, readOnlyFields));
        updated = updated.set(updated.narrativeSection, this.populateNarrative(updated.getNarrativeSection(), data, readOnlyFields));
        updated = updated.set(updated.diagramSection, this.populateDiagram(updated.getDiagramSection(), data, readOnlyFields));
        updated = updated.set(updated.additionalPassengersSection, this.populateAdditionalPassengers(updated.getAdditionalPassengersSection(), data.additionalPassengers));
        updated = updated.set(updated.narrativeOfficerSection, this.populateNarrativeOfficer(updated.getNarrativeOfficerSection(), data, readOnlyFields));

        return form.set(form.narrativePage, collection.replace(0, updated));
    }

    /** Returns one person page's values as its record in the data contract. */
    private extractPersonRecord(page: PersonPageModel): ITR310PersonData {
        const data: FormValues<ITR310PersonData> = {};

        this.extractPersonHeader(page.getPersonHeaderSection(), data);
        this.extractPerson(page.getPersonSection(), data);
        this.extractDriverLicense(page.getDriverLicenseSection(), data);
        this.extractDriverActions(page.getDriverActionsSection(), data);
        this.extractOccupant(page.getOccupantSection(), data);
        this.extractNonMotorist(page.getNonMotoristSection(), data);
        this.extractInjury(page.getInjurySection(), data);
        this.extractSafetyEquipment(page.getSafetyEquipmentSection(), data);
        this.extractAlcoholDrugs(page.getAlcoholDrugsSection(), data);
        data.passengers = this.extractPassengers(page.getPassengersSection());
        this.extractPersonOfficer(page.getPersonOfficerSection(), data);

        return data;
    }

    /** Returns a form with each person record written onto the page at its own index; a record past the last page is dropped. */
    private populatePersonPages(form: TR310FormModel, records: ReadonlyArray<ITR310PersonData>): TR310FormModel {
        let collection = form.getPersonPageCollection();

        records.forEach((record, index) => {
            const page = <PersonPageModel | undefined>collection.pages[index];

            if (page) {
                collection = collection.replace(index, this.populatePersonPage(page, record));
            }
        });

        return form.set(form.personPage, collection);
    }

    /** Returns a new person page with the given record applied to it, section by section. */
    private populatePersonPage(page: PersonPageModel, data: ITR310PersonData): PersonPageModel {
        let updated = page.set(page.personHeaderSection, this.populatePersonHeader(page.getPersonHeaderSection(), data));
        updated = updated.set(updated.personSection, this.populatePerson(updated.getPersonSection(), data));
        updated = updated.set(updated.driverLicenseSection, this.populateDriverLicense(updated.getDriverLicenseSection(), data));
        updated = updated.set(updated.driverActionsSection, this.populateDriverActions(updated.getDriverActionsSection(), data));
        updated = updated.set(updated.occupantSection, this.populateOccupant(updated.getOccupantSection(), data));
        updated = updated.set(updated.nonMotoristSection, this.populateNonMotorist(updated.getNonMotoristSection(), data));
        updated = updated.set(updated.injurySection, this.populateInjury(updated.getInjurySection(), data));
        updated = updated.set(updated.safetyEquipmentSection, this.populateSafetyEquipment(updated.getSafetyEquipmentSection(), data));
        updated = updated.set(updated.alcoholDrugsSection, this.populateAlcoholDrugs(updated.getAlcoholDrugsSection(), data));
        updated = updated.set(updated.passengersSection, this.populatePassengers(updated.getPassengersSection(), data.passengers));
        updated = updated.set(updated.personOfficerSection, this.populatePersonOfficer(updated.getPersonOfficerSection(), data));

        return updated;
    }

    /** Returns one unit page's values as its record in the data contract. */
    private extractUnitRecord(page: UnitPageModel): ITR310UnitData {
        const data: FormValues<ITR310UnitData> = {};

        this.extractUnitHeader(page.getUnitHeaderSection(), data);
        this.extractVehicle(page.getVehicleSection(), data);
        this.extractInsurance(page.getInsuranceSection(), data);
        this.extractOwner(page.getOwnerSection(), data);
        this.extractTravel(page.getTravelSection(), data);
        this.extractDamage(page.getDamageSection(), data);
        this.extractUnitType(page.getUnitTypeSection(), data);
        this.extractEvents(page.getEventsSection(), data);
        this.extractRoadway(page.getRoadwaySection(), data);
        this.extractViolations(page.getViolationsSection(), data);
        this.extractUnitOfficer(page.getUnitOfficerSection(), data);

        return data;
    }

    /** Returns a form with each unit record written onto the page at its own index; a record past the last page is dropped. */
    private populateUnitPages(form: TR310FormModel, records: ReadonlyArray<ITR310UnitData>): TR310FormModel {
        let collection = form.getUnitPageCollection();

        records.forEach((record, index) => {
            const page = <UnitPageModel | undefined>collection.pages[index];

            if (page) {
                collection = collection.replace(index, this.populateUnitPage(page, record));
            }
        });

        return form.set(form.unitPage, collection);
    }

    /** Returns a new unit page with the given record applied to it, section by section. */
    private populateUnitPage(page: UnitPageModel, data: ITR310UnitData): UnitPageModel {
        let updated = page.set(page.unitHeaderSection, this.populateUnitHeader(page.getUnitHeaderSection(), data));
        updated = updated.set(updated.vehicleSection, this.populateVehicle(updated.getVehicleSection(), data));
        updated = updated.set(updated.insuranceSection, this.populateInsurance(updated.getInsuranceSection(), data));
        updated = updated.set(updated.ownerSection, this.populateOwner(updated.getOwnerSection(), data));
        updated = updated.set(updated.travelSection, this.populateTravel(updated.getTravelSection(), data));
        updated = updated.set(updated.damageSection, this.populateDamage(updated.getDamageSection(), data));
        updated = updated.set(updated.unitTypeSection, this.populateUnitType(updated.getUnitTypeSection(), data));
        updated = updated.set(updated.eventsSection, this.populateEvents(updated.getEventsSection(), data));
        updated = updated.set(updated.roadwaySection, this.populateRoadway(updated.getRoadwaySection(), data));
        updated = updated.set(updated.violationsSection, this.populateViolations(updated.getViolationsSection(), data));
        updated = updated.set(updated.unitOfficerSection, this.populateUnitOfficer(updated.getUnitOfficerSection(), data));

        return updated;
    }

    private extractHeader(section: HeaderSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "headerAmended", section.getAmended());
        this.read(data, "headerCorrected", section.getCorrected());
        this.read(data, "headerCrashReportNumber", section.getCrashReportNumber());
        this.read(data, "headerOfficerArrived", section.getOfficerArrived());
        this.read(data, "headerOfficerNotified", section.getOfficerNotified());
        this.read(data, "headerPageCount", section.getPageCount());
        this.read(data, "headerPageNumber", section.getPageNumber());
        this.read(data, "headerRoadwayCleared", section.getRoadwayCleared());
        this.read(data, "headerUnitCount", section.getUnitCount());
        this.read(data, "headerVersion", section.getVersion());
    }

    private populateHeader(section: HeaderSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): HeaderSectionModel {
        let updated = this.write(section, section.amended, data, "headerAmended", readOnlyFields);
        updated = this.write(updated, section.corrected, data, "headerCorrected", readOnlyFields);
        updated = this.write(updated, section.crashReportNumber, data, "headerCrashReportNumber", readOnlyFields);
        updated = this.write(updated, section.officerArrived, data, "headerOfficerArrived", readOnlyFields);
        updated = this.write(updated, section.officerNotified, data, "headerOfficerNotified", readOnlyFields);
        updated = this.write(updated, section.pageCount, data, "headerPageCount", readOnlyFields);
        updated = this.write(updated, section.pageNumber, data, "headerPageNumber", readOnlyFields);
        updated = this.write(updated, section.roadwayCleared, data, "headerRoadwayCleared", readOnlyFields);
        updated = this.write(updated, section.unitCount, data, "headerUnitCount", readOnlyFields);

        return this.write(updated, section.version, data, "headerVersion", readOnlyFields);
    }

    private extractCollision(section: CollisionSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "collisionCityOrTown", section.getCityOrTown());
        this.read(data, "collisionCounty", section.getCounty());
        this.read(data, "collisionDate", section.getDate());
        this.read(data, "collisionPicturesTaken", section.getPicturesTaken());
        this.read(data, "collisionPrivatePropertyCollision", section.getPrivatePropertyCollision());
        this.read(data, "collisionSecondaryCrash", section.getSecondaryCrash());
        this.read(data, "collisionTime", section.getTime());
        this.read(data, "collisionTotalDamageOverThreshold", section.getTotalDamageOverThreshold());
    }

    private populateCollision(section: CollisionSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): CollisionSectionModel {
        let updated = this.write(section, section.cityOrTown, data, "collisionCityOrTown", readOnlyFields);
        updated = this.write(updated, section.county, data, "collisionCounty", readOnlyFields);
        updated = this.write(updated, section.date, data, "collisionDate", readOnlyFields);
        updated = this.write(updated, section.picturesTaken, data, "collisionPicturesTaken", readOnlyFields);
        updated = this.write(updated, section.privatePropertyCollision, data, "collisionPrivatePropertyCollision", readOnlyFields);
        updated = this.write(updated, section.secondaryCrash, data, "collisionSecondaryCrash", readOnlyFields);
        updated = this.write(updated, section.time, data, "collisionTime", readOnlyFields);

        return this.write(updated, section.totalDamageOverThreshold, data, "collisionTotalDamageOverThreshold", readOnlyFields);
    }

    private extractRoute(section: RouteSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "routeAuxiliary", section.getAuxiliary());
        this.read(data, "routeCategory", section.getCategory());
        this.read(data, "routeDirection", section.getDirection());
        this.read(data, "routeDistanceOffsetFeet", section.getDistanceOffsetFeet());
        this.read(data, "routeDistanceOffsetMiles", section.getDistanceOffsetMiles());
        this.read(data, "routeLaneCount", section.getLaneCount());
        this.read(data, "routeLaneNumber", section.getLaneNumber());
        this.read(data, "routeName", section.getRouteName());
        this.read(data, "routeNumber", section.getNumber());
        this.read(data, "routeRailroadId", section.getRailroadId());
    }

    private populateRoute(section: RouteSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): RouteSectionModel {
        let updated = this.write(section, section.auxiliary, data, "routeAuxiliary", readOnlyFields);
        updated = this.write(updated, section.category, data, "routeCategory", readOnlyFields);
        updated = this.write(updated, section.direction, data, "routeDirection", readOnlyFields);
        updated = this.write(updated, section.distanceOffsetFeet, data, "routeDistanceOffsetFeet", readOnlyFields);
        updated = this.write(updated, section.distanceOffsetMiles, data, "routeDistanceOffsetMiles", readOnlyFields);
        updated = this.write(updated, section.laneCount, data, "routeLaneCount", readOnlyFields);
        updated = this.write(updated, section.laneNumber, data, "routeLaneNumber", readOnlyFields);
        updated = this.write(updated, section.routeName, data, "routeName", readOnlyFields);
        updated = this.write(updated, section.number, data, "routeNumber", readOnlyFields);

        return this.write(updated, section.railroadId, data, "routeRailroadId", readOnlyFields);
    }

    private extractBaseIntersection(section: BaseIntersectionSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "baseIntersectionAuxiliary", section.getAuxiliary());
        this.read(data, "baseIntersectionCategory", section.getCategory());
        this.read(data, "baseIntersectionRouteName", section.getRouteName());
        this.read(data, "baseIntersectionRouteNumber", section.getRouteNumber());
    }

    private populateBaseIntersection(section: BaseIntersectionSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): BaseIntersectionSectionModel {
        let updated = this.write(section, section.auxiliary, data, "baseIntersectionAuxiliary", readOnlyFields);
        updated = this.write(updated, section.category, data, "baseIntersectionCategory", readOnlyFields);
        updated = this.write(updated, section.routeName, data, "baseIntersectionRouteName", readOnlyFields);

        return this.write(updated, section.routeNumber, data, "baseIntersectionRouteNumber", readOnlyFields);
    }

    private extractSecondIntersection(section: SecondIntersectionSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "secondIntersectionAuxiliary", section.getAuxiliary());
        this.read(data, "secondIntersectionCategory", section.getCategory());
        this.read(data, "secondIntersectionRouteName", section.getRouteName());
        this.read(data, "secondIntersectionRouteNumber", section.getRouteNumber());
    }

    private populateSecondIntersection(section: SecondIntersectionSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): SecondIntersectionSectionModel {
        let updated = this.write(section, section.auxiliary, data, "secondIntersectionAuxiliary", readOnlyFields);
        updated = this.write(updated, section.category, data, "secondIntersectionCategory", readOnlyFields);
        updated = this.write(updated, section.routeName, data, "secondIntersectionRouteName", readOnlyFields);

        return this.write(updated, section.routeNumber, data, "secondIntersectionRouteNumber", readOnlyFields);
    }

    private extractCoordinates(section: CoordinatesSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "coordinatesLatitude", section.getLatitude());
        this.read(data, "coordinatesLongitude", section.getLongitude());
    }

    private populateCoordinates(section: CoordinatesSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): CoordinatesSectionModel {
        let updated = this.write(section, section.latitude, data, "coordinatesLatitude", readOnlyFields);

        return this.write(updated, section.longitude, data, "coordinatesLongitude", readOnlyFields);
    }

    private extractTrafficway(section: TrafficwaySectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "trafficwayDirection", section.getDirection());
        this.read(data, "trafficwayDivided", section.getDivided());
    }

    private populateTrafficway(section: TrafficwaySectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): TrafficwaySectionModel {
        let updated = this.write(section, section.direction, data, "trafficwayDirection", readOnlyFields);

        return this.write(updated, section.divided, data, "trafficwayDivided", readOnlyFields);
    }

    private extractBarrier(section: BarrierSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "barrierIntersectionType", section.getIntersectionType());
        this.read(data, "barrierType", section.getType());
    }

    private populateBarrier(section: BarrierSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): BarrierSectionModel {
        let updated = this.write(section, section.intersectionType, data, "barrierIntersectionType", readOnlyFields);

        return this.write(updated, section.type, data, "barrierType", readOnlyFields);
    }

    private extractConditions(section: ConditionsSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "conditionsLight", section.getLight());
        this.read(data, "conditionsMannerOfCollision", section.getMannerOfCollision());
        this.read(data, "conditionsRoadSurface", section.getRoadSurface());
        this.read(data, "conditionsWeatherFirst", section.getWeatherFirst());
        this.read(data, "conditionsWeatherSecond", section.getWeatherSecond());
    }

    private populateConditions(section: ConditionsSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): ConditionsSectionModel {
        let updated = this.write(section, section.light, data, "conditionsLight", readOnlyFields);
        updated = this.write(updated, section.mannerOfCollision, data, "conditionsMannerOfCollision", readOnlyFields);
        updated = this.write(updated, section.roadSurface, data, "conditionsRoadSurface", readOnlyFields);
        updated = this.write(updated, section.weatherFirst, data, "conditionsWeatherFirst", readOnlyFields);

        return this.write(updated, section.weatherSecond, data, "conditionsWeatherSecond", readOnlyFields);
    }

    private extractHarmfulEvent(section: HarmfulEventSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "harmfulEventFirst", section.getFirst());
        this.read(data, "harmfulEventLocation", section.getLocation());
    }

    private populateHarmfulEvent(section: HarmfulEventSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): HarmfulEventSectionModel {
        let updated = this.write(section, section.first, data, "harmfulEventFirst", readOnlyFields);

        return this.write(updated, section.location, data, "harmfulEventLocation", readOnlyFields);
    }

    private extractJunction(section: JunctionSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "junctionContributingFactorFirst", section.getContributingFactorFirst());
        this.read(data, "junctionContributingFactorSecond", section.getContributingFactorSecond());
        this.read(data, "junctionRelation", section.getRelation());
        this.read(data, "junctionSchoolBusRelated", section.getSchoolBusRelated());
    }

    private populateJunction(section: JunctionSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): JunctionSectionModel {
        let updated = this.write(section, section.contributingFactorFirst, data, "junctionContributingFactorFirst", readOnlyFields);
        updated = this.write(updated, section.contributingFactorSecond, data, "junctionContributingFactorSecond", readOnlyFields);
        updated = this.write(updated, section.relation, data, "junctionRelation", readOnlyFields);

        return this.write(updated, section.schoolBusRelated, data, "junctionSchoolBusRelated", readOnlyFields);
    }

    private extractWorkZone(section: WorkZoneSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "workZoneCrashLocation", section.getCrashLocation());
        this.read(data, "workZoneLawEnforcement", section.getLawEnforcement());
        this.read(data, "workZoneRelated", section.getRelated());
        this.read(data, "workZoneType", section.getType());
        this.read(data, "workZoneWorkerPresent", section.getWorkerPresent());
    }

    private populateWorkZone(section: WorkZoneSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): WorkZoneSectionModel {
        let updated = this.write(section, section.crashLocation, data, "workZoneCrashLocation", readOnlyFields);
        updated = this.write(updated, section.lawEnforcement, data, "workZoneLawEnforcement", readOnlyFields);
        updated = this.write(updated, section.related, data, "workZoneRelated", readOnlyFields);
        updated = this.write(updated, section.type, data, "workZoneType", readOnlyFields);

        return this.write(updated, section.workerPresent, data, "workZoneWorkerPresent", readOnlyFields);
    }

    /** Returns one entry per witness or property owner row, in row order. Always reports all three, blank or not. */
    private extractWitness(witnesses: SectionCollection<WitnessSectionModel>): ReadonlyArray<ITR310WitnessData> {
        return witnesses.getSections<WitnessSectionModel>().map(section => {
            const data: FormValues<ITR310WitnessData> = {};

            this.read(data, "type", section.getType());
            this.read(data, "firstName", section.getFirstName());
            this.read(data, "middleInitial", section.getMiddleInitial());
            this.read(data, "lastName", section.getLastName());
            this.read(data, "address", section.getAddress());
            this.read(data, "city", section.getCity());
            this.read(data, "state", section.getState());
            this.read(data, "zipCode", section.getZipCode());
            this.read(data, "telephone", section.getTelephone());
            this.read(data, "propertyDamageAmount", section.getPropertyDamageAmount());
            this.read(data, "propertyDamageDescription", section.getPropertyDamageDescription());

            return data as ITR310WitnessData;
        });
    }

    /** Returns the collection with each record written onto the row at its own index; a record past the last row is dropped, and a row the records don't reach is left alone. */
    private populateWitness(witnesses: SectionCollection<WitnessSectionModel>, records: ReadonlyArray<ITR310WitnessData> = []): SectionCollection<WitnessSectionModel> {
        let updated = witnesses;

        records.forEach((record, index) => {
            const section = <WitnessSectionModel | undefined>updated.getSections<WitnessSectionModel>()[index];

            if (section) {
                updated = updated.replace(index, this.populateWitnessRow(section, record));
            }
        });

        return updated;
    }

    /** Returns a new witness row with the given record applied to it. */
    private populateWitnessRow(section: WitnessSectionModel, data: ITR310WitnessData): WitnessSectionModel {
        let updated = this.write(section, section.type, data, "type");
        updated = this.write(updated, section.firstName, data, "firstName");
        updated = this.write(updated, section.middleInitial, data, "middleInitial");
        updated = this.write(updated, section.lastName, data, "lastName");
        updated = this.write(updated, section.address, data, "address");
        updated = this.write(updated, section.city, data, "city");
        updated = this.write(updated, section.state, data, "state");
        updated = this.write(updated, section.zipCode, data, "zipCode");
        updated = this.write(updated, section.telephone, data, "telephone");
        updated = this.write(updated, section.propertyDamageAmount, data, "propertyDamageAmount");

        return this.write(updated, section.propertyDamageDescription, data, "propertyDamageDescription");
    }

    private extractCollisionOfficer(section: CollisionOfficerSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "collisionOfficerCjaNumber", section.getCjaNumber());
        this.read(data, "collisionOfficerInternalAgency", section.getInternalAgency());
        this.read(data, "collisionOfficerJurisdiction", section.getJurisdiction());
        this.read(data, "collisionOfficerName", section.getOfficerName());
        this.read(data, "collisionOfficerRank", section.getRank());
        this.read(data, "collisionOfficerReviewDate", section.getReviewDate());
        this.read(data, "collisionOfficerReviewerName", section.getReviewerName());
        this.read(data, "collisionOfficerReviewerRank", section.getReviewerRank());
    }

    private populateCollisionOfficer(section: CollisionOfficerSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): CollisionOfficerSectionModel {
        let updated = this.write(section, section.cjaNumber, data, "collisionOfficerCjaNumber", readOnlyFields);
        updated = this.write(updated, section.internalAgency, data, "collisionOfficerInternalAgency", readOnlyFields);
        updated = this.write(updated, section.jurisdiction, data, "collisionOfficerJurisdiction", readOnlyFields);
        updated = this.write(updated, section.officerName, data, "collisionOfficerName", readOnlyFields);
        updated = this.write(updated, section.rank, data, "collisionOfficerRank", readOnlyFields);
        updated = this.write(updated, section.reviewDate, data, "collisionOfficerReviewDate", readOnlyFields);
        updated = this.write(updated, section.reviewerName, data, "collisionOfficerReviewerName", readOnlyFields);

        return this.write(updated, section.reviewerRank, data, "collisionOfficerReviewerRank", readOnlyFields);
    }

    private extractPersonHeader(section: PersonHeaderSectionModel, data: FormValues<ITR310PersonData>): void {
        this.read(data, "personHeaderCrashReportNumber", section.getCrashReportNumber());
        this.read(data, "personHeaderPersonId", section.getPersonId());
        this.read(data, "personHeaderPersonNumber", section.getPersonNumber());
        this.read(data, "personHeaderPersonType", section.getPersonType());
        this.read(data, "personHeaderUnitNumber", section.getUnitNumber());
    }

    private populatePersonHeader(section: PersonHeaderSectionModel, data: ITR310PersonData): PersonHeaderSectionModel {
        let updated = this.write(section, section.crashReportNumber, data, "personHeaderCrashReportNumber");
        // a record saved before this field existed carries none, so the page keeps the id it was just stamped with
        updated = this.write(updated, section.personId, data, "personHeaderPersonId");
        updated = this.write(updated, section.personNumber, data, "personHeaderPersonNumber");
        updated = this.write(updated, section.personType, data, "personHeaderPersonType");

        return this.write(updated, section.unitNumber, data, "personHeaderUnitNumber");
    }

    private extractPerson(section: PersonSectionModel, data: FormValues<ITR310PersonData>): void {
        this.read(data, "personAddress", section.getAddress());
        this.read(data, "personCity", section.getCity());
        this.read(data, "personContributedTo", section.getContributedTo());
        this.read(data, "personDateOfBirth", section.getDateOfBirth());
        this.read(data, "personFirstName", section.getFirstName());
        this.read(data, "personLastName", section.getLastName());
        this.read(data, "personMiddleName", section.getMiddleName());
        this.read(data, "personPhoneNumber", section.getPhoneNumber());
        this.read(data, "personRace", section.getRace());
        this.read(data, "personSex", section.getSex());
        this.read(data, "personState", section.getState());
        this.read(data, "personZipCode", section.getZipCode());
    }

    private populatePerson(section: PersonSectionModel, data: ITR310PersonData): PersonSectionModel {
        let updated = this.write(section, section.address, data, "personAddress");
        updated = this.write(updated, section.city, data, "personCity");
        updated = this.write(updated, section.contributedTo, data, "personContributedTo");
        updated = this.write(updated, section.dateOfBirth, data, "personDateOfBirth");
        updated = this.write(updated, section.firstName, data, "personFirstName");
        updated = this.write(updated, section.lastName, data, "personLastName");
        updated = this.write(updated, section.middleName, data, "personMiddleName");
        updated = this.write(updated, section.phoneNumber, data, "personPhoneNumber");
        updated = this.write(updated, section.race, data, "personRace");
        updated = this.write(updated, section.sex, data, "personSex");
        updated = this.write(updated, section.state, data, "personState");

        return this.write(updated, section.zipCode, data, "personZipCode");
    }

    private extractDriverLicense(section: DriverLicenseSectionModel, data: FormValues<ITR310PersonData>): void {
        this.read(data, "driverLicenseClass", section.getClass());
        this.read(data, "driverLicenseJurisdiction", section.getJurisdiction());
        this.read(data, "driverLicenseNumber", section.getNumber());
        this.read(data, "driverLicenseState", section.getState());
    }

    private populateDriverLicense(section: DriverLicenseSectionModel, data: ITR310PersonData): DriverLicenseSectionModel {
        let updated = this.write(section, section.class, data, "driverLicenseClass");
        updated = this.write(updated, section.jurisdiction, data, "driverLicenseJurisdiction");
        updated = this.write(updated, section.number, data, "driverLicenseNumber");

        return this.write(updated, section.state, data, "driverLicenseState");
    }

    private extractDriverActions(section: DriverActionsSectionModel, data: FormValues<ITR310PersonData>): void {
        this.read(data, "driverActionsDistraction", section.getDistraction());
        this.read(data, "driverActionsFirst", section.getFirst());
        this.read(data, "driverActionsFourth", section.getFourth());
        this.read(data, "driverActionsSecond", section.getSecond());
        this.read(data, "driverActionsThird", section.getThird());
    }

    private populateDriverActions(section: DriverActionsSectionModel, data: ITR310PersonData): DriverActionsSectionModel {
        let updated = this.write(section, section.distraction, data, "driverActionsDistraction");
        updated = this.write(updated, section.first, data, "driverActionsFirst");
        updated = this.write(updated, section.fourth, data, "driverActionsFourth");
        updated = this.write(updated, section.second, data, "driverActionsSecond");

        return this.write(updated, section.third, data, "driverActionsThird");
    }

    private extractOccupant(section: OccupantSectionModel, data: FormValues<ITR310PersonData>): void {
        this.read(data, "occupantAirBagDeployment", section.getAirBagDeployment());
        this.read(data, "occupantEjection", section.getEjection());
        this.read(data, "occupantHeadInjury", section.getHeadInjury());
        this.read(data, "occupantMedicalFacilityTransport", section.getMedicalFacilityTransport());
        this.read(data, "occupantRestraintDevice", section.getRestraintDevice());
        this.read(data, "occupantSeatingLocation", section.getSeatingLocation());
    }

    private populateOccupant(section: OccupantSectionModel, data: ITR310PersonData): OccupantSectionModel {
        let updated = this.write(section, section.airBagDeployment, data, "occupantAirBagDeployment");
        updated = this.write(updated, section.ejection, data, "occupantEjection");
        updated = this.write(updated, section.headInjury, data, "occupantHeadInjury");
        updated = this.write(updated, section.medicalFacilityTransport, data, "occupantMedicalFacilityTransport");
        updated = this.write(updated, section.restraintDevice, data, "occupantRestraintDevice");

        return this.write(updated, section.seatingLocation, data, "occupantSeatingLocation");
    }

    private extractNonMotorist(section: NonMotoristSectionModel, data: FormValues<ITR310PersonData>): void {
        this.read(data, "nonMotoristDistraction", section.getDistraction());
        this.read(data, "nonMotoristUnitType", section.getUnitType());
    }

    private populateNonMotorist(section: NonMotoristSectionModel, data: ITR310PersonData): NonMotoristSectionModel {
        let updated = this.write(section, section.distraction, data, "nonMotoristDistraction");

        return this.write(updated, section.unitType, data, "nonMotoristUnitType");
    }

    private extractInjury(section: InjurySectionModel, data: FormValues<ITR310PersonData>): void {
        this.read(data, "injuryActionPriorToImpact", section.getActionPriorToImpact());
        this.read(data, "injuryContributingActionFirst", section.getContributingActionFirst());
        this.read(data, "injuryContributingActionSecond", section.getContributingActionSecond());
        this.read(data, "injuryStatus", section.getStatus());
    }

    private populateInjury(section: InjurySectionModel, data: ITR310PersonData): InjurySectionModel {
        let updated = this.write(section, section.actionPriorToImpact, data, "injuryActionPriorToImpact");
        updated = this.write(updated, section.contributingActionFirst, data, "injuryContributingActionFirst");
        updated = this.write(updated, section.contributingActionSecond, data, "injuryContributingActionSecond");

        return this.write(updated, section.status, data, "injuryStatus");
    }

    private extractSafetyEquipment(section: SafetyEquipmentSectionModel, data: FormValues<ITR310PersonData>): void {
        this.read(data, "safetyEquipmentHelmetUse", section.getHelmetUse());
        this.read(data, "safetyEquipmentLightingUse", section.getLightingUse());
        this.read(data, "safetyEquipmentOtherPreventativeUse", section.getOtherPreventativeUse());
        this.read(data, "safetyEquipmentOtherProtectiveUse", section.getOtherProtectiveUse());
        this.read(data, "safetyEquipmentProtectivePadsUse", section.getProtectivePadsUse());
        this.read(data, "safetyEquipmentReflectiveClothingUse", section.getReflectiveClothingUse());
    }

    private populateSafetyEquipment(section: SafetyEquipmentSectionModel, data: ITR310PersonData): SafetyEquipmentSectionModel {
        let updated = this.write(section, section.helmetUse, data, "safetyEquipmentHelmetUse");
        updated = this.write(updated, section.lightingUse, data, "safetyEquipmentLightingUse");
        updated = this.write(updated, section.otherPreventativeUse, data, "safetyEquipmentOtherPreventativeUse");
        updated = this.write(updated, section.otherProtectiveUse, data, "safetyEquipmentOtherProtectiveUse");
        updated = this.write(updated, section.protectivePadsUse, data, "safetyEquipmentProtectivePadsUse");

        return this.write(updated, section.reflectiveClothingUse, data, "safetyEquipmentReflectiveClothingUse");
    }

    private extractAlcoholDrugs(section: AlcoholDrugsSectionModel, data: FormValues<ITR310PersonData>): void {
        this.read(data, "alcoholDrugsAlcoholTestStatus", section.getAlcoholTestStatus());
        this.read(data, "alcoholDrugsAlcoholTestType", section.getAlcoholTestType());
        this.read(data, "alcoholDrugsBloodAlcoholContent", section.getBloodAlcoholContent());
        this.read(data, "alcoholDrugsDrugTestResult", section.getDrugTestResult());
        this.read(data, "alcoholDrugsDrugTestStatus", section.getDrugTestStatus());
        this.read(data, "alcoholDrugsDrugTestType", section.getDrugTestType());
        this.read(data, "alcoholDrugsSuspectedUse", section.getSuspectedUse());
    }

    private populateAlcoholDrugs(section: AlcoholDrugsSectionModel, data: ITR310PersonData): AlcoholDrugsSectionModel {
        let updated = this.write(section, section.alcoholTestStatus, data, "alcoholDrugsAlcoholTestStatus");
        updated = this.write(updated, section.alcoholTestType, data, "alcoholDrugsAlcoholTestType");
        updated = this.write(updated, section.bloodAlcoholContent, data, "alcoholDrugsBloodAlcoholContent");
        updated = this.write(updated, section.drugTestResult, data, "alcoholDrugsDrugTestResult");
        updated = this.write(updated, section.drugTestStatus, data, "alcoholDrugsDrugTestStatus");
        updated = this.write(updated, section.drugTestType, data, "alcoholDrugsDrugTestType");

        return this.write(updated, section.suspectedUse, data, "alcoholDrugsSuspectedUse");
    }

    /** Returns one entry per passenger row, in row order. Always reports all four, blank or not. */
    private extractPassengers(passengers: SectionCollection<PassengersSectionModel>): ReadonlyArray<ITR310PassengerData> {
        return passengers.getSections<PassengersSectionModel>().map(section => {
            const data: FormValues<ITR310PassengerData> = {};

            this.read(data, "airBagDeployment", section.getAirBagDeployment());
            this.read(data, "dateOfBirth", section.getDateOfBirth());
            this.read(data, "ejection", section.getEjection());
            this.read(data, "headInjury", section.getHeadInjury());
            this.read(data, "injuryStatus", section.getInjuryStatus());
            this.read(data, "medicalFacilityTransport", section.getMedicalFacilityTransport());
            this.read(data, "nameAndAddress", section.getNameAndAddress());
            this.read(data, "personNumber", section.getPersonNumber());
            this.read(data, "race", section.getRace());
            this.read(data, "restraintDevice", section.getRestraintDevice());
            this.read(data, "safetyEquipment", section.getSafetyEquipment());
            this.read(data, "seatingLocation", section.getSeatingLocation());
            this.read(data, "sex", section.getSex());
            this.read(data, "unitNumber", section.getUnitNumber());

            return data as ITR310PassengerData;
        });
    }

    /** Returns the collection with each record written onto the row at its own index; a record past the last row is dropped, and a row the records don't reach is left alone. */
    private populatePassengers(passengers: SectionCollection<PassengersSectionModel>, records: ReadonlyArray<ITR310PassengerData> = []): SectionCollection<PassengersSectionModel> {
        let updated = passengers;

        records.forEach((record, index) => {
            const section = <PassengersSectionModel | undefined>updated.getSections<PassengersSectionModel>()[index];

            if (section) {
                updated = updated.replace(index, this.populatePassenger(section, record));
            }
        });

        return updated;
    }

    /** Returns a new passenger row with the given record applied to it. */
    private populatePassenger(section: PassengersSectionModel, data: ITR310PassengerData): PassengersSectionModel {
        let updated = this.write(section, section.airBagDeployment, data, "airBagDeployment");
        updated = this.write(updated, section.dateOfBirth, data, "dateOfBirth");
        updated = this.write(updated, section.ejection, data, "ejection");
        updated = this.write(updated, section.headInjury, data, "headInjury");
        updated = this.write(updated, section.injuryStatus, data, "injuryStatus");
        updated = this.write(updated, section.medicalFacilityTransport, data, "medicalFacilityTransport");
        updated = this.write(updated, section.nameAndAddress, data, "nameAndAddress");
        updated = this.write(updated, section.personNumber, data, "personNumber");
        updated = this.write(updated, section.race, data, "race");
        updated = this.write(updated, section.restraintDevice, data, "restraintDevice");
        updated = this.write(updated, section.safetyEquipment, data, "safetyEquipment");
        updated = this.write(updated, section.seatingLocation, data, "seatingLocation");
        updated = this.write(updated, section.sex, data, "sex");

        return this.write(updated, section.unitNumber, data, "unitNumber");
    }

    private extractPersonOfficer(section: PersonOfficerSectionModel, data: FormValues<ITR310PersonData>): void {
        this.read(data, "personOfficerCjaNumber", section.getCjaNumber());
        this.read(data, "personOfficerInternalAgency", section.getInternalAgency());
        this.read(data, "personOfficerName", section.getOfficerName());
        this.read(data, "personOfficerRank", section.getRank());
    }

    private populatePersonOfficer(section: PersonOfficerSectionModel, data: ITR310PersonData): PersonOfficerSectionModel {
        let updated = this.write(section, section.cjaNumber, data, "personOfficerCjaNumber");
        updated = this.write(updated, section.internalAgency, data, "personOfficerInternalAgency");
        updated = this.write(updated, section.officerName, data, "personOfficerName");

        return this.write(updated, section.rank, data, "personOfficerRank");
    }

    private extractUnitHeader(section: UnitHeaderSectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "unitHeaderCrashReportNumber", section.getCrashReportNumber());
        this.read(data, "unitHeaderFr10Number", section.getFr10Number());
        this.read(data, "unitHeaderUnitId", section.getUnitId());
        this.read(data, "unitHeaderUnitNumber", section.getUnitNumber());
    }

    private populateUnitHeader(section: UnitHeaderSectionModel, data: ITR310UnitData): UnitHeaderSectionModel {
        let updated = this.write(section, section.crashReportNumber, data, "unitHeaderCrashReportNumber");
        updated = this.write(updated, section.fr10Number, data, "unitHeaderFr10Number");
        // a record saved before this field existed carries none, so the page keeps the id it was just stamped with
        updated = this.write(updated, section.unitId, data, "unitHeaderUnitId");

        return this.write(updated, section.unitNumber, data, "unitHeaderUnitNumber");
    }

    private extractVehicle(section: VehicleSectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "vehicleBodyType", section.getBodyType());
        this.read(data, "vehicleDamageExtent", section.getDamageExtent());
        this.read(data, "vehicleHitAndRun", section.getHitAndRun());
        this.read(data, "vehicleIdentificationNumber", section.getIdentificationNumber());
        this.read(data, "vehicleMake", section.getMake());
        this.read(data, "vehicleModel", section.getModel());
        this.read(data, "vehicleOccupantCount", section.getOccupantCount());
        this.read(data, "vehiclePlateExpires", section.getPlateExpires());
        this.read(data, "vehiclePlateNumber", section.getPlateNumber());
        this.read(data, "vehicleState", section.getState());
        this.read(data, "vehicleStatus", section.getStatus());
        this.read(data, "vehicleYear", section.getYear());
    }

    private populateVehicle(section: VehicleSectionModel, data: ITR310UnitData): VehicleSectionModel {
        let updated = this.write(section, section.bodyType, data, "vehicleBodyType");
        updated = this.write(updated, section.damageExtent, data, "vehicleDamageExtent");
        updated = this.write(updated, section.hitAndRun, data, "vehicleHitAndRun");
        updated = this.write(updated, section.identificationNumber, data, "vehicleIdentificationNumber");
        updated = this.write(updated, section.make, data, "vehicleMake");
        updated = this.write(updated, section.model, data, "vehicleModel");
        updated = this.write(updated, section.occupantCount, data, "vehicleOccupantCount");
        updated = this.write(updated, section.plateExpires, data, "vehiclePlateExpires");
        updated = this.write(updated, section.plateNumber, data, "vehiclePlateNumber");
        updated = this.write(updated, section.state, data, "vehicleState");
        updated = this.write(updated, section.status, data, "vehicleStatus");

        return this.write(updated, section.year, data, "vehicleYear");
    }

    private extractInsurance(section: InsuranceSectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "insuranceCdlRequired", section.getCdlRequired());
        this.read(data, "insuranceCompany", section.getCompany());
        this.read(data, "insuranceEstimatedDamage", section.getEstimatedDamage());
        this.read(data, "insuranceTowed", section.getTowed());
        this.read(data, "insuranceTowedBy", section.getTowedBy());
    }

    private populateInsurance(section: InsuranceSectionModel, data: ITR310UnitData): InsuranceSectionModel {
        let updated = this.write(section, section.cdlRequired, data, "insuranceCdlRequired");
        updated = this.write(updated, section.company, data, "insuranceCompany");
        updated = this.write(updated, section.estimatedDamage, data, "insuranceEstimatedDamage");
        updated = this.write(updated, section.towed, data, "insuranceTowed");

        return this.write(updated, section.towedBy, data, "insuranceTowedBy");
    }

    private extractOwner(section: OwnerSectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "ownerAddress", section.getAddress());
        this.read(data, "ownerCity", section.getCity());
        this.read(data, "ownerDriverLicenseNumber", section.getDriverLicenseNumber());
        this.read(data, "ownerFirstName", section.getFirstName());
        this.read(data, "ownerLastName", section.getLastName());
        this.read(data, "ownerMiddleName", section.getMiddleName());
        this.read(data, "ownerState", section.getState());
        this.read(data, "ownerZipCode", section.getZipCode());
    }

    private populateOwner(section: OwnerSectionModel, data: ITR310UnitData): OwnerSectionModel {
        let updated = this.write(section, section.address, data, "ownerAddress");
        updated = this.write(updated, section.city, data, "ownerCity");
        updated = this.write(updated, section.driverLicenseNumber, data, "ownerDriverLicenseNumber");
        updated = this.write(updated, section.firstName, data, "ownerFirstName");
        updated = this.write(updated, section.lastName, data, "ownerLastName");
        updated = this.write(updated, section.middleName, data, "ownerMiddleName");
        updated = this.write(updated, section.state, data, "ownerState");

        return this.write(updated, section.zipCode, data, "ownerZipCode");
    }

    private extractTravel(section: TravelSectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "travelDirection", section.getDirection());
        this.read(data, "travelEstimatedSpeed", section.getEstimatedSpeed());
        this.read(data, "travelSpeedLimit", section.getSpeedLimit());
        this.read(data, "travelSpeedRelated", section.getSpeedRelated());
    }

    private populateTravel(section: TravelSectionModel, data: ITR310UnitData): TravelSectionModel {
        let updated = this.write(section, section.direction, data, "travelDirection");
        updated = this.write(updated, section.estimatedSpeed, data, "travelEstimatedSpeed");
        updated = this.write(updated, section.speedLimit, data, "travelSpeedLimit");

        return this.write(updated, section.speedRelated, data, "travelSpeedRelated");
    }

    private extractDamage(section: DamageSectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "damageAreaEight", section.getAreaEight());
        this.read(data, "damageAreaEleven", section.getAreaEleven());
        this.read(data, "damageAreaFive", section.getAreaFive());
        this.read(data, "damageAreaFour", section.getAreaFour());
        this.read(data, "damageAreaNine", section.getAreaNine());
        this.read(data, "damageAreaOne", section.getAreaOne());
        this.read(data, "damageAreaSeven", section.getAreaSeven());
        this.read(data, "damageAreaSix", section.getAreaSix());
        this.read(data, "damageAreaTen", section.getAreaTen());
        this.read(data, "damageAreaThree", section.getAreaThree());
        this.read(data, "damageAreaTwelve", section.getAreaTwelve());
        this.read(data, "damageAreaTwo", section.getAreaTwo());
        this.read(data, "damageInitialPointOfContact", section.getInitialPointOfContact());
    }

    private populateDamage(section: DamageSectionModel, data: ITR310UnitData): DamageSectionModel {
        let updated = this.write(section, section.areaEight, data, "damageAreaEight");
        updated = this.write(updated, section.areaEleven, data, "damageAreaEleven");
        updated = this.write(updated, section.areaFive, data, "damageAreaFive");
        updated = this.write(updated, section.areaFour, data, "damageAreaFour");
        updated = this.write(updated, section.areaNine, data, "damageAreaNine");
        updated = this.write(updated, section.areaOne, data, "damageAreaOne");
        updated = this.write(updated, section.areaSeven, data, "damageAreaSeven");
        updated = this.write(updated, section.areaSix, data, "damageAreaSix");
        updated = this.write(updated, section.areaTen, data, "damageAreaTen");
        updated = this.write(updated, section.areaThree, data, "damageAreaThree");
        updated = this.write(updated, section.areaTwelve, data, "damageAreaTwelve");
        updated = this.write(updated, section.areaTwo, data, "damageAreaTwo");

        return this.write(updated, section.initialPointOfContact, data, "damageInitialPointOfContact");
    }

    private extractUnitType(section: UnitTypeSectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "unitTypeEmergencyVehicleUse", section.getEmergencyVehicleUse());
        this.read(data, "unitTypeSpecialFunction", section.getSpecialFunction());
        this.read(data, "unitTypeUnit", section.getUnit());
    }

    private populateUnitType(section: UnitTypeSectionModel, data: ITR310UnitData): UnitTypeSectionModel {
        let updated = this.write(section, section.emergencyVehicleUse, data, "unitTypeEmergencyVehicleUse");
        updated = this.write(updated, section.specialFunction, data, "unitTypeSpecialFunction");

        return this.write(updated, section.unit, data, "unitTypeUnit");
    }

    private extractEvents(section: EventsSectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "eventsMostHarmful", section.getMostHarmful());
        this.read(data, "eventsSequenceFirst", section.getSequenceFirst());
        this.read(data, "eventsSequenceFourth", section.getSequenceFourth());
        this.read(data, "eventsSequenceSecond", section.getSequenceSecond());
        this.read(data, "eventsSequenceThird", section.getSequenceThird());
    }

    private populateEvents(section: EventsSectionModel, data: ITR310UnitData): EventsSectionModel {
        let updated = this.write(section, section.mostHarmful, data, "eventsMostHarmful");
        updated = this.write(updated, section.sequenceFirst, data, "eventsSequenceFirst");
        updated = this.write(updated, section.sequenceFourth, data, "eventsSequenceFourth");
        updated = this.write(updated, section.sequenceSecond, data, "eventsSequenceSecond");

        return this.write(updated, section.sequenceThird, data, "eventsSequenceThird");
    }

    private extractRoadway(section: RoadwaySectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "roadwayAlignment", section.getAlignment());
        this.read(data, "roadwayGrade", section.getGrade());
        this.read(data, "roadwayTrafficControlDeviceFirst", section.getTrafficControlDeviceFirst());
        this.read(data, "roadwayTrafficControlDeviceFourth", section.getTrafficControlDeviceFourth());
        this.read(data, "roadwayTrafficControlDeviceSecond", section.getTrafficControlDeviceSecond());
        this.read(data, "roadwayTrafficControlDeviceThird", section.getTrafficControlDeviceThird());
        this.read(data, "roadwayVehicleActionPriorToImpact", section.getVehicleActionPriorToImpact());
        this.read(data, "roadwayVehicleContributingCircumstances", section.getVehicleContributingCircumstances());
    }

    private populateRoadway(section: RoadwaySectionModel, data: ITR310UnitData): RoadwaySectionModel {
        let updated = this.write(section, section.alignment, data, "roadwayAlignment");
        updated = this.write(updated, section.grade, data, "roadwayGrade");
        updated = this.write(updated, section.trafficControlDeviceFirst, data, "roadwayTrafficControlDeviceFirst");
        updated = this.write(updated, section.trafficControlDeviceFourth, data, "roadwayTrafficControlDeviceFourth");
        updated = this.write(updated, section.trafficControlDeviceSecond, data, "roadwayTrafficControlDeviceSecond");
        updated = this.write(updated, section.trafficControlDeviceThird, data, "roadwayTrafficControlDeviceThird");
        updated = this.write(updated, section.vehicleActionPriorToImpact, data, "roadwayVehicleActionPriorToImpact");

        return this.write(updated, section.vehicleContributingCircumstances, data, "roadwayVehicleContributingCircumstances");
    }

    private extractViolations(section: ViolationsSectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "violationOneCharge", section.getOneCharge());
        this.read(data, "violationOneStatuteNumber", section.getOneStatuteNumber());
        this.read(data, "violationOneTicketNumber", section.getOneTicketNumber());
        this.read(data, "violationTwoCharge", section.getTwoCharge());
        this.read(data, "violationTwoStatuteNumber", section.getTwoStatuteNumber());
        this.read(data, "violationTwoTicketNumber", section.getTwoTicketNumber());
    }

    private populateViolations(section: ViolationsSectionModel, data: ITR310UnitData): ViolationsSectionModel {
        let updated = this.write(section, section.oneCharge, data, "violationOneCharge");
        updated = this.write(updated, section.oneStatuteNumber, data, "violationOneStatuteNumber");
        updated = this.write(updated, section.oneTicketNumber, data, "violationOneTicketNumber");
        updated = this.write(updated, section.twoCharge, data, "violationTwoCharge");
        updated = this.write(updated, section.twoStatuteNumber, data, "violationTwoStatuteNumber");

        return this.write(updated, section.twoTicketNumber, data, "violationTwoTicketNumber");
    }

    private extractUnitOfficer(section: UnitOfficerSectionModel, data: FormValues<ITR310UnitData>): void {
        this.read(data, "unitOfficerCjaNumber", section.getCjaNumber());
        this.read(data, "unitOfficerInternalAgency", section.getInternalAgency());
        this.read(data, "unitOfficerName", section.getOfficerName());
        this.read(data, "unitOfficerRank", section.getRank());
    }

    private populateUnitOfficer(section: UnitOfficerSectionModel, data: ITR310UnitData): UnitOfficerSectionModel {
        let updated = this.write(section, section.cjaNumber, data, "unitOfficerCjaNumber");
        updated = this.write(updated, section.internalAgency, data, "unitOfficerInternalAgency");
        updated = this.write(updated, section.officerName, data, "unitOfficerName");

        return this.write(updated, section.rank, data, "unitOfficerRank");
    }

    private extractNarrativeHeader(section: NarrativeHeaderSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "narrativeHeaderCrashReportNumber", section.getCrashReportNumber());
        this.read(data, "narrativeHeaderInternalAgencyCode", section.getInternalAgencyCode());
    }

    private populateNarrativeHeader(section: NarrativeHeaderSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): NarrativeHeaderSectionModel {
        let updated = this.write(section, section.crashReportNumber, data, "narrativeHeaderCrashReportNumber", readOnlyFields);

        return this.write(updated, section.internalAgencyCode, data, "narrativeHeaderInternalAgencyCode", readOnlyFields);
    }

    private extractNarrative(section: NarrativeSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "narrativeAmendedOrCorrectedNotes", section.getAmendedOrCorrectedNotes());
        this.read(data, "narrativeText", section.getText());
    }

    private populateNarrative(section: NarrativeSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): NarrativeSectionModel {
        let updated = this.write(section, section.amendedOrCorrectedNotes, data, "narrativeAmendedOrCorrectedNotes", readOnlyFields);

        return this.write(updated, section.text, data, "narrativeText", readOnlyFields);
    }

    private extractDiagram(section: DiagramSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "diagramContent", section.getContent());
    }

    private populateDiagram(section: DiagramSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): DiagramSectionModel {
        return this.write(section, section.content, data, "diagramContent", readOnlyFields);
    }

    /** Returns one entry per additional passenger row, in row order. Always reports all four, blank or not. */
    private extractAdditionalPassengers(passengers: SectionCollection<AdditionalPassengersSectionModel>): ReadonlyArray<ITR310PassengerData> {
        return passengers.getSections<AdditionalPassengersSectionModel>().map(section => {
            const data: FormValues<ITR310PassengerData> = {};

            this.read(data, "airBagDeployment", section.getAirBagDeployment());
            this.read(data, "dateOfBirth", section.getDateOfBirth());
            this.read(data, "ejection", section.getEjection());
            this.read(data, "headInjury", section.getHeadInjury());
            this.read(data, "injuryStatus", section.getInjuryStatus());
            this.read(data, "medicalFacilityTransport", section.getMedicalFacilityTransport());
            this.read(data, "nameAndAddress", section.getNameAndAddress());
            this.read(data, "personNumber", section.getPersonNumber());
            this.read(data, "race", section.getRace());
            this.read(data, "restraintDevice", section.getRestraintDevice());
            this.read(data, "safetyEquipment", section.getSafetyEquipment());
            this.read(data, "seatingLocation", section.getSeatingLocation());
            this.read(data, "sex", section.getSex());
            this.read(data, "unitNumber", section.getUnitNumber());

            return data as ITR310PassengerData;
        });
    }

    /** Returns the collection with each record written onto the row at its own index; a record past the last row is dropped, and a row the records don't reach is left alone. */
    private populateAdditionalPassengers(passengers: SectionCollection<AdditionalPassengersSectionModel>, records: ReadonlyArray<ITR310PassengerData> = []): SectionCollection<AdditionalPassengersSectionModel> {
        let updated = passengers;

        records.forEach((record, index) => {
            const section = <AdditionalPassengersSectionModel | undefined>updated.getSections<AdditionalPassengersSectionModel>()[index];

            if (section) {
                updated = updated.replace(index, this.populateAdditionalPassenger(section, record));
            }
        });

        return updated;
    }

    /** Returns a new additional passenger row with the given record applied to it. */
    private populateAdditionalPassenger(section: AdditionalPassengersSectionModel, data: ITR310PassengerData): AdditionalPassengersSectionModel {
        let updated = this.write(section, section.airBagDeployment, data, "airBagDeployment");
        updated = this.write(updated, section.dateOfBirth, data, "dateOfBirth");
        updated = this.write(updated, section.ejection, data, "ejection");
        updated = this.write(updated, section.headInjury, data, "headInjury");
        updated = this.write(updated, section.injuryStatus, data, "injuryStatus");
        updated = this.write(updated, section.medicalFacilityTransport, data, "medicalFacilityTransport");
        updated = this.write(updated, section.nameAndAddress, data, "nameAndAddress");
        updated = this.write(updated, section.personNumber, data, "personNumber");
        updated = this.write(updated, section.race, data, "race");
        updated = this.write(updated, section.restraintDevice, data, "restraintDevice");
        updated = this.write(updated, section.safetyEquipment, data, "safetyEquipment");
        updated = this.write(updated, section.seatingLocation, data, "seatingLocation");
        updated = this.write(updated, section.sex, data, "sex");

        return this.write(updated, section.unitNumber, data, "unitNumber");
    }

    private extractNarrativeOfficer(section: NarrativeOfficerSectionModel, data: FormValues<ITR310Data>): void {
        this.read(data, "narrativeOfficerCjaNumber", section.getCjaNumber());
        this.read(data, "narrativeOfficerInternalAgency", section.getInternalAgency());
        this.read(data, "narrativeOfficerName", section.getOfficerName());
        this.read(data, "narrativeOfficerRank", section.getRank());
    }

    private populateNarrativeOfficer(section: NarrativeOfficerSectionModel, data: ITR310Data, readOnlyFields?: ReadOnlyFields<ITR310Data>): NarrativeOfficerSectionModel {
        let updated = this.write(section, section.cjaNumber, data, "narrativeOfficerCjaNumber", readOnlyFields);
        updated = this.write(updated, section.internalAgency, data, "narrativeOfficerInternalAgency", readOnlyFields);
        updated = this.write(updated, section.officerName, data, "narrativeOfficerName", readOnlyFields);

        return this.write(updated, section.rank, data, "narrativeOfficerRank", readOnlyFields);
    }
}
