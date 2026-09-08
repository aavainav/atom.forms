import { Dropzone, IOptionValue, PersonDropzoneFields, VehicleDropzoneFields } from "@forms/core";
import { IValueListService, ValueListId } from "@forms/value-lists";
import { createService, Singleton } from "@shrub/core";

import { PersonPageModel } from "../models/person-page/person-page";
import { UnitPageModel } from "../models/unit-page/unit-page";
import { TR310ValueListId } from "../value-lists";

export const ITR310Service = createService<ITR310Service>("forms-tr310-service");

/**
 * Defines the service backing the TR-310 traffic collision report.
 *
 * Every value list the report's option fields draw on is reached through here rather than imported by the
 * component that renders it, so the components speak the report's language - light conditions, unit types,
 * restraint devices - while the lists themselves come from the value list registry, where a host can serve any of
 * them from somewhere else by registering over its id. There are a great many of them because the TR-310 prints a
 * code legend beside nearly every box it carries.
 */
export interface ITR310Service {
    /** Returns a new unit page with the dropped person data applied to the unit's registered owner. */
    applyOwnerDropzone(page: UnitPageModel, dropzone: Dropzone): UnitPageModel;
    /** Returns a new person page with the dropped person data applied to the person section. */
    applyPersonDropzone(page: PersonPageModel, dropzone: Dropzone): PersonPageModel;
    /** Returns a new unit page with the dropped vehicle data applied to the unit's vehicle section. */
    applyVehicleDropzone(page: UnitPageModel, dropzone: Dropzone): UnitPageModel;

    /** Loads the options for what a person was doing immediately before the impact. */
    getActionPriorToImpactOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for which air bags deployed. */
    getAirBagDeploymentOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the kind of alcohol test administered. */
    getAlcoholTestTypeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the barrier present at the collision location. */
    getBarrierTypeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for whether the unit required a commercial driver's license. */
    getCdlRequirementOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for a person's contributing actions and circumstances. */
    getContributingActionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the county the collision occurred in. */
    getCountyOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for where a unit was damaged, covering both clock positions and named areas. */
    getDamageAreaOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for how badly a unit was damaged. */
    getDamageExtentOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for a driver's actions at the time of the collision. */
    getDriverActionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for what a driver was distracted by. */
    getDriverDistractionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for what a drug test found. */
    getDrugTestResultOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the kind of drug test administered. */
    getDrugTestTypeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for whether and how far a person was ejected. */
    getEjectionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for how a unit was being used as an emergency vehicle. */
    getEmergencyVehicleUseOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for where on the trafficway the first harmful event occurred. */
    getFirstHarmfulEventLocationOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the collision's first harmful event. */
    getFirstHarmfulEventOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for a person's sex. */
    getGenderOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for whether a motorcycle or moped rider suffered a head injury. */
    getHeadInjuryOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for how badly a person was injured. */
    getInjuryStatusOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the type of intersection the collision occurred at. */
    getIntersectionTypeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the kind of jurisdiction that issued a driver's license. */
    getLicenseJurisdictionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the light condition at the time of the collision. */
    getLightConditionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for how the units came together. */
    getMannerOfCollisionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for how a person was transported to a medical facility. */
    getMedicalFacilityTransportOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for what a non-motorist was distracted by. */
    getNonMotoristDistractionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for what a non-motorist was travelling as. */
    getNonMotoristUnitTypeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for whether a person page records a driver or a non-motorist. */
    getPersonTypeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the collision's relation to a junction. */
    getRelationToJunctionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the restraint a person was using. */
    getRestraintDeviceOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the condition of the road surface. */
    getRoadSurfaceConditionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the alignment of the roadway. */
    getRoadwayAlignmentOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the roadway and environmental factors contributing to the collision. */
    getRoadwayContributingFactorOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the grade of the roadway. */
    getRoadwayGradeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options every safety equipment box on the person page takes. */
    getSafetyEquipmentUseOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for whether a school bus was involved. */
    getSchoolBusRelationOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the unit's most harmful event and its sequence of events. */
    getSequenceOfEventsOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the special function a motor vehicle was serving. */
    getSpecialFunctionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for how speed was involved in the collision. */
    getSpeedRelationOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the report's state fields, which the person, vehicle, owner and witness sections share. */
    getStateOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for what the officer suspected a person had been using. */
    getSuspectedSubstanceUseOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for whether a test was given, refused or is pending; the alcohol and drug status boxes share it. */
    getTestStatusOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for whether a unit was towed. */
    getTowStatusOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the traffic control devices in place. */
    getTrafficControlDeviceOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for whether the trafficway runs one way or two. */
    getTrafficwayDirectionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for how the trafficway is divided. */
    getTrafficwayDivisionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the direction a unit was travelling in. */
    getTravelDirectionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for what a unit was doing at the time of the collision. */
    getUnitStatusOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the type of unit. */
    getUnitTypeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for what a vehicle was doing immediately before the impact. */
    getVehicleActionPriorToImpactOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the vehicle conditions contributing to the collision. */
    getVehicleContributingCircumstanceOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the report's vehicle make field. */
    getVehicleMakeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the models belonging to the given make code; a blank or unrecognized code has none. */
    getVehicleModelOptions(makeCode: string): Promise<Array<IOptionValue>>;
    /** Loads the options for the weather at the time of the collision. */
    getWeatherConditionOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for which part of a work zone the collision occurred in. */
    getWorkZoneCrashLocationOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for whether someone was present in the work zone; the worker and law enforcement boxes share it. */
    getWorkZonePresenceOptions(): Promise<Array<IOptionValue>>;
    /** Loads the options for the type of work zone. */
    getWorkZoneTypeOptions(): Promise<Array<IOptionValue>>;
    /** Loads the plain yes/no options the report codes as 1 and 2. */
    getYesNoOptions(): Promise<Array<IOptionValue>>;
    /** Loads the yes/no/unknown options the report codes as 1, 2 and 9. */
    getYesNoUnknownOptions(): Promise<Array<IOptionValue>>;

    /**
     * Returns the dropped vehicle with its make and model turned from the names they arrived as into the codes
     * the report stores, dropping either if the value lists do not recognize it. Await this before applying the
     * dropzone to the page, so a name with no code never reaches the form.
     */
    resolveVehicleDropzone(dropzone: Dropzone): Promise<Dropzone>;
}

@Singleton
export class TR310Service implements ITR310Service {
    constructor(@IValueListService private readonly valueListService: IValueListService) {
    }

    applyOwnerDropzone(page: UnitPageModel, dropzone: Dropzone): UnitPageModel {
        const section = page.getOwnerSection();
        const updated = dropzone.applyTo(section, {
            [PersonDropzoneFields.firstName]: section.firstName,
            [PersonDropzoneFields.middleName]: section.middleName,
            [PersonDropzoneFields.lastName]: section.lastName,
            [PersonDropzoneFields.address]: section.address,
            [PersonDropzoneFields.city]: section.city,
            [PersonDropzoneFields.zipCode]: section.zipCode
        });

        return page.set(page.ownerSection, updated).setDropzone(dropzone);
    }

    applyPersonDropzone(page: PersonPageModel, dropzone: Dropzone): PersonPageModel {
        const section = page.getPersonSection();
        const updated = dropzone.applyTo(section, {
            [PersonDropzoneFields.firstName]: section.firstName,
            [PersonDropzoneFields.middleName]: section.middleName,
            [PersonDropzoneFields.lastName]: section.lastName,
            [PersonDropzoneFields.address]: section.address,
            [PersonDropzoneFields.city]: section.city,
            [PersonDropzoneFields.zipCode]: section.zipCode
        });

        return page.set(page.personSection, updated).setDropzone(dropzone);
    }

    applyVehicleDropzone(page: UnitPageModel, dropzone: Dropzone): UnitPageModel {
        const section = page.getVehicleSection();
        const updated = dropzone.applyTo(section, {
            [VehicleDropzoneFields.make]: section.make,
            [VehicleDropzoneFields.model]: section.model,
            [VehicleDropzoneFields.year]: section.year
        });

        return page.set(page.vehicleSection, updated).setDropzone(dropzone);
    }

    async getActionPriorToImpactOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.actionPriorToImpact);
    }

    async getAirBagDeploymentOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.airBagDeployment);
    }

    async getAlcoholTestTypeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.alcoholTestType);
    }

    async getBarrierTypeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.barrierType);
    }

    async getCdlRequirementOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.cdlRequirement);
    }

    async getContributingActionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.contributingAction);
    }

    async getCountyOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.county);
    }

    async getDamageAreaOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.damageArea);
    }

    async getDamageExtentOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.damageExtent);
    }

    async getDriverActionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.driverAction);
    }

    async getDriverDistractionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.driverDistraction);
    }

    async getDrugTestResultOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.drugTestResult);
    }

    async getDrugTestTypeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.drugTestType);
    }

    async getEjectionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.ejection);
    }

    async getEmergencyVehicleUseOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.emergencyVehicleUse);
    }

    async getFirstHarmfulEventLocationOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.firstHarmfulEventLocation);
    }

    async getFirstHarmfulEventOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.firstHarmfulEvent);
    }

    async getGenderOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.gender);
    }

    async getHeadInjuryOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.yesNo);
    }

    async getInjuryStatusOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.injuryStatus);
    }

    async getIntersectionTypeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.intersectionType);
    }

    async getLicenseJurisdictionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.licenseJurisdiction);
    }

    async getLightConditionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.lightCondition);
    }

    async getMannerOfCollisionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.mannerOfCollision);
    }

    async getMedicalFacilityTransportOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.medicalFacilityTransport);
    }

    async getNonMotoristDistractionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.nonMotoristDistraction);
    }

    async getNonMotoristUnitTypeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.nonMotoristUnitType);
    }

    async getPersonTypeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.personType);
    }

    async getRelationToJunctionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.relationToJunction);
    }

    async getRestraintDeviceOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.restraintDevice);
    }

    async getRoadSurfaceConditionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.roadSurfaceCondition);
    }

    async getRoadwayAlignmentOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.roadwayAlignment);
    }

    async getRoadwayContributingFactorOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.roadwayContributingFactor);
    }

    async getRoadwayGradeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.roadwayGrade);
    }

    async getSafetyEquipmentUseOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.safetyEquipmentUse);
    }

    async getSchoolBusRelationOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.schoolBusRelation);
    }

    async getSequenceOfEventsOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.sequenceOfEvents);
    }

    async getSpecialFunctionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.specialFunction);
    }

    async getSpeedRelationOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.speedRelation);
    }

    async getStateOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(ValueListId.state);
    }

    async getSuspectedSubstanceUseOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.suspectedSubstanceUse);
    }

    async getTestStatusOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.testStatus);
    }

    async getTowStatusOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.towStatus);
    }

    async getTrafficControlDeviceOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.trafficControlDevice);
    }

    async getTrafficwayDirectionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.trafficwayDirection);
    }

    async getTrafficwayDivisionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.trafficwayDivision);
    }

    async getTravelDirectionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.travelDirection);
    }

    async getUnitStatusOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.unitStatus);
    }

    async getUnitTypeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.unitType);
    }

    async getVehicleActionPriorToImpactOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.vehicleActionPriorToImpact);
    }

    async getVehicleContributingCircumstanceOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.vehicleContributingCircumstance);
    }

    async getVehicleMakeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(ValueListId.vehicleMake);
    }

    async getVehicleModelOptions(makeCode: string): Promise<Array<IOptionValue>> {
        return this.getOptions(ValueListId.vehicleModel, makeCode);
    }

    async getWeatherConditionOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.weatherCondition);
    }

    async getWorkZoneCrashLocationOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.workZoneCrashLocation);
    }

    async getWorkZonePresenceOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.workZonePresence);
    }

    async getWorkZoneTypeOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.workZoneType);
    }

    async getYesNoOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.yesNo);
    }

    async getYesNoUnknownOptions(): Promise<Array<IOptionValue>> {
        return this.getOptions(TR310ValueListId.yesNoUnknown);
    }

    async resolveVehicleDropzone(dropzone: Dropzone): Promise<Dropzone> {
        const fields = dropzone.getFields();
        const makeField = fields[VehicleDropzoneFields.make];
        const modelField = fields[VehicleDropzoneFields.model];

        // the dropzone carries the names the drop arrived with and no codes; a name the lists do not recognize is
        // cleared rather than carried onto the form, since a make the report cannot resolve is worse than one the
        // user picks themselves. The make is resolved first because a model's name only identifies a model
        // underneath a make - there are more models than there are distinct model names.
        const make = makeField && await this.valueListService.findByDescription(
            ValueListId.vehicleMake,
            (<IOptionValue>makeField.getValue()).description);

        const model = make && modelField && await this.valueListService.findByDescription(
            ValueListId.vehicleModel,
            (<IOptionValue>modelField.getValue()).description,
            make.value);

        return dropzone.setFields({
            ...fields,
            [VehicleDropzoneFields.make]: makeField?.setValue(make ?? { value: "", description: "" }),
            [VehicleDropzoneFields.model]: modelField?.setValue(model ?? { value: "", description: "" })
        });
    }

    /**
     * Copies the registry's options before handing them out, so the list a select ends up holding is not the one
     * the value list service is caching and cannot be mutated out from under the next form that asks for it.
     */
    private async getOptions(listId: string, parentValue?: string): Promise<Array<IOptionValue>> {
        return [...await this.valueListService.getOptions(listId, parentValue)];
    }
}
