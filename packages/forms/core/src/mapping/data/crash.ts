import { FormType } from "../../models/form";
import { AdditionalProperties } from "./additional-properties";

interface IPassenger {
    readonly passengerId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly middleName?: string;
    readonly age?: number;
    readonly gender?: string;
    readonly additionalProperties?: AdditionalProperties;
}

interface IUnit {
    readonly unitId: string;
    readonly unitType: string;
    readonly driverFirstName: string;
    readonly driverLastName: string;
    readonly driverMiddleName?: string;
    readonly driverLicenseNumber?: string;
    readonly driverLicenseState?: string;
    readonly driverLicenseClass?: string;
    readonly driverDateOfBirth?: string;
    readonly driverAge?: number;
    readonly driverGender?: string;
    readonly ownerFirstName?: string;
    readonly ownerLastName?: string;
    readonly ownerMiddleName?: string;
    readonly ownerStreet?: string;
    readonly ownerCity?: string;
    readonly ownerState?: string;
    readonly ownerZip?: string;
    readonly vehicleMake?: string;
    readonly vehicleModel?: string;
    readonly vehicleYear?: number;
    readonly vehicleColor?: string; 
    readonly passengers: IPassenger[];
    readonly additionalProperties?: AdditionalProperties;
}

interface IWitness {
    readonly witnessId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly middleName?: string;
    readonly age?: number;
    readonly gender?: string;
    readonly additionalProperties?: AdditionalProperties;
}

/** Represents a common data model to map crash data. */
export interface ICrash {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly type: FormType;
    readonly agencyOri: string;
    readonly agencyName: string;
    readonly crashDate: string;
    readonly crashTime: string;
    readonly locationStreet: string;
    readonly locationCity: string;
    readonly locationState: string;
    readonly locationZip: string;
    readonly latitude?: number;
    readonly longitude?: number;
    readonly intersectingStreet?: string;
    readonly weatherCondition?: string;
    readonly lightCondition?: string;
    readonly roadCondition?: string;
    readonly crashSeverity?: string;
    readonly workZoneRelated: boolean;
    readonly units: IUnit[];
    readonly witnesses: IWitness[];
    readonly additionalProperties?: AdditionalProperties;
}