import { ITR310Data } from "@forms/tr310";

/**
 * Mock records for exercising `TR310Mapper.populate()` and `extract()` through the report viewer's data reader.
 * Keyed by the `?record=` query param `createExampleDataManager` reads.
 *
 * `full` is a two-unit collision with three people -- two drivers and a pedestrian -- showing the mapper add a
 * person page and a unit page beyond the one of each a new form opens with, and a rule bound once reporting
 * against every page it applies to. `minimal` carries one person and one unit with only what's required, showing
 * a partial record leaving the rest alone.
 *
 * Dates: the form parses `YYYY-MM-DD` only, and a value it can't parse silently skips validation, so a host
 * mapping another order must convert before it gets here.
 */
export const mockTR310Records: Record<string, ITR310Data> = {
    full: {
        headerPageNumber: "1",
        headerPageCount: "4",
        headerVersion: "1",
        headerUnitCount: 2,
        headerCrashReportNumber: "2026-0004-001947",
        headerOfficerNotified: "07:41",
        headerOfficerArrived: "07:52",
        headerRoadwayCleared: "08:35",

        collisionDate: "2026-09-01",
        collisionTime: "07:37",
        collisionCounty: { value: "40", description: "RICHLAND" },
        collisionCityOrTown: "Columbia",
        collisionSecondaryCrash: { value: "2", description: "NO" },
        collisionPrivatePropertyCollision: { value: "2", description: "NO" },
        collisionTotalDamageOverThreshold: { value: "1", description: "YES" },
        collisionPicturesTaken: true,

        routeCategory: "US",
        routeNumber: "1",
        routeName: "Gervais St",
        routeLaneNumber: "2",
        routeLaneCount: "4",
        routeDistanceOffsetFeet: "220",
        routeDirection: "E",

        baseIntersectionCategory: "SC",
        baseIntersectionRouteNumber: "12",
        baseIntersectionRouteName: "Assembly St",

        secondIntersectionCategory: "SC",
        secondIntersectionRouteNumber: "48",
        secondIntersectionRouteName: "Main St",

        coordinatesLatitude: "34.00071",
        coordinatesLongitude: "-81.03481",

        trafficwayDirection: { value: "02", description: "TWO WAY" },
        trafficwayDivided: { value: "01", description: "NOT DIVIDED" },

        barrierType: { value: "00", description: "NO BARRIER" },
        barrierIntersectionType: { value: "04", description: "FOUR LEG INTERSECTION" },

        conditionsLight: { value: "01", description: "DAYLIGHT" },
        conditionsWeatherFirst: { value: "02", description: "RAIN" },
        conditionsWeatherSecond: { value: "03", description: "CLOUDY" },
        conditionsRoadSurface: { value: "02", description: "WET" },
        conditionsMannerOfCollision: { value: "20", description: "FRONT TO REAR" },

        harmfulEventFirst: { value: "22", description: "MOVING MOTOR VEHICLE" },
        harmfulEventLocation: { value: "05", description: "ROADWAY" },

        junctionRelation: { value: "05", description: "INTERSECTION OR RELATED" },
        junctionContributingFactorFirst: { value: "13", description: "ROAD SURFACE CONDITION (I.E. WET)" },
        junctionSchoolBusRelated: { value: "3", description: "NO" },

        workZoneRelated: { value: "2", description: "NO" },

        witnesses: [
            {
                type: "W",
                firstName: "Dana",
                middleInitial: "L",
                lastName: "Ferrell",
                address: "118 Blossom St",
                city: "Columbia",
                state: { value: "SC", description: "SOUTH CAROLINA" },
                zipCode: "29201",
                telephone: "803-555-0141"
            },
            {
                type: "P",
                firstName: "Marcus",
                lastName: "Oyelaran",
                address: "1400 Gervais St",
                city: "Columbia",
                state: { value: "SC", description: "SOUTH CAROLINA" },
                zipCode: "29201",
                propertyDamageAmount: "850",
                propertyDamageDescription: "Wrought iron fence, approx 12 ft"
            }
        ],

        collisionOfficerName: "A Vainavicz",
        collisionOfficerRank: "SGT",
        collisionOfficerCjaNumber: "0000",
        collisionOfficerJurisdiction: "0004 / South Carolina Police Department",

        narrativeHeaderInternalAgencyCode: "0004",
        narrativeHeaderCrashReportNumber: "2026-0004-001947",
        narrativeText: "Unit 1 was stopped at the signal on Gervais St facing east when Unit 2, travelling east behind it, "
            + "failed to slow for the wet surface and struck Unit 1 in the rear. A pedestrian standing on the sidewalk was "
            + "struck by debris and declined transport. Both units were driveable and cleared the roadway under their own power.",
        narrativeOfficerName: "A Vainavicz",
        narrativeOfficerRank: "SGT",
        narrativeOfficerCjaNumber: "0000",

        persons: [
            {
                personHeaderPersonNumber: "1",
                personHeaderUnitNumber: "1",
                personHeaderPersonType: { value: "1", description: "MV DRIVER" },
                personHeaderCrashReportNumber: "2026-0004-001947",

                personFirstName: "James",
                personMiddleName: "R",
                personLastName: "Whitfield",
                personPhoneNumber: "803-555-0118",
                personContributedTo: { value: "2", description: "NO" },
                personDateOfBirth: "1988-03-14",
                personAddress: "902 Rosewood Dr",
                personCity: "Columbia",
                personState: { value: "SC", description: "SOUTH CAROLINA" },
                personZipCode: "29205",
                personSex: { value: "M", description: "MALE" },
                personRace: "W",

                driverLicenseNumber: "104938271",
                driverLicenseState: { value: "SC", description: "SOUTH CAROLINA" },
                driverLicenseClass: "D",
                driverLicenseJurisdiction: { value: "1", description: "US STATE" },

                driverActionsDistraction: { value: "00", description: "NOT DISTRACTED" },
                driverActionsFirst: { value: "00", description: "NO CONTRIBUTING ACTION" },

                occupantSeatingLocation: "Front seat, left side",
                occupantEjection: { value: "1", description: "NOT EJECTED" },
                occupantMedicalFacilityTransport: { value: "00", description: "NOT TRANSPORTED" },
                occupantAirBagDeployment: { value: "00", description: "NOT DEPLOYED" },
                occupantRestraintDevice: { value: "13", description: "SHOULDER & LAP BELT" },

                injuryStatus: { value: "0", description: "NO APPARENT INJURY" },
                injuryContributingActionFirst: { value: "00", description: "NO IMPROPER ACTION" },

                alcoholDrugsSuspectedUse: { value: "00", description: "NONE" },
                alcoholDrugsAlcoholTestStatus: { value: "1", description: "TEST NOT GIVEN" },
                alcoholDrugsDrugTestStatus: { value: "1", description: "TEST NOT GIVEN" },

                passengers: [
                    {
                        personNumber: "3",
                        unitNumber: "1",
                        nameAndAddress: "Whitfield, Alice - 902 Rosewood Dr, Columbia SC",
                        dateOfBirth: "1990-11-02",
                        injuryStatus: { value: "1", description: "POSSIBLE INJURY" },
                        sex: { value: "F", description: "FEMALE" },
                        race: "W",
                        seatingLocation: "22",
                        ejection: { value: "1", description: "NOT EJECTED" },
                        medicalFacilityTransport: { value: "11", description: "EMS GROUND" },
                        airBagDeployment: { value: "00", description: "NOT DEPLOYED" },
                        restraintDevice: { value: "13", description: "SHOULDER & LAP BELT" }
                    }
                ],

                personOfficerName: "A Vainavicz",
                personOfficerRank: "SGT",
                personOfficerCjaNumber: "0000"
            },
            {
                personHeaderPersonNumber: "2",
                personHeaderUnitNumber: "2",
                personHeaderPersonType: { value: "1", description: "MV DRIVER" },
                personHeaderCrashReportNumber: "2026-0004-001947",

                personFirstName: "Teresa",
                personLastName: "Nakamura",
                personPhoneNumber: "803-555-0177",
                personContributedTo: { value: "1", description: "YES" },
                personDateOfBirth: "1979-06-25",
                personAddress: "45 Devine St",
                personCity: "Columbia",
                personState: { value: "SC", description: "SOUTH CAROLINA" },
                personZipCode: "29205",
                personSex: { value: "F", description: "FEMALE" },
                personRace: "A",

                driverLicenseNumber: "220184099",
                driverLicenseState: { value: "SC", description: "SOUTH CAROLINA" },
                driverLicenseClass: "D",
                driverLicenseJurisdiction: { value: "1", description: "US STATE" },

                driverActionsDistraction: { value: "00", description: "NOT DISTRACTED" },
                driverActionsFirst: { value: "07", description: "FOLLOWED TOO CLOSELY" },
                driverActionsSecond: { value: "18", description: "INATTENTIVE, CARELESS, NEGLIGENT" },

                occupantSeatingLocation: "Front seat, left side",
                occupantEjection: { value: "1", description: "NOT EJECTED" },
                occupantMedicalFacilityTransport: { value: "11", description: "EMS GROUND" },
                occupantAirBagDeployment: { value: "01", description: "DEPLOYED FRONT" },
                occupantRestraintDevice: { value: "13", description: "SHOULDER & LAP BELT" },

                injuryStatus: { value: "2", description: "SUSPECTED MINOR INJURY" },
                injuryContributingActionFirst: { value: "01", description: "INATTENTIVE DISTRACTED" },

                alcoholDrugsSuspectedUse: { value: "00", description: "NONE" },
                alcoholDrugsAlcoholTestStatus: { value: "2", description: "TEST GIVEN" },
                alcoholDrugsAlcoholTestType: { value: "1", description: "BREATH (ALCOHOL ONLY)" },
                alcoholDrugsBloodAlcoholContent: "0.00",
                alcoholDrugsDrugTestStatus: { value: "1", description: "TEST NOT GIVEN" },

                personOfficerName: "A Vainavicz",
                personOfficerRank: "SGT",
                personOfficerCjaNumber: "0000"
            },
            {
                personHeaderPersonNumber: "4",
                personHeaderUnitNumber: "3",
                personHeaderPersonType: { value: "3", description: "NON-MOTORIST" },
                personHeaderCrashReportNumber: "2026-0004-001947",

                personFirstName: "Owen",
                personLastName: "Brathwaite",
                personContributedTo: { value: "2", description: "NO" },
                personDateOfBirth: "2001-01-19",
                personAddress: "1400 Gervais St",
                personCity: "Columbia",
                personState: { value: "SC", description: "SOUTH CAROLINA" },
                personZipCode: "29201",
                personSex: { value: "M", description: "MALE" },
                personRace: "B",

                nonMotoristUnitType: { value: "64", description: "PEDESTRIAN" },
                nonMotoristDistraction: { value: "00", description: "NOT DISTRACTED" },

                injuryStatus: { value: "1", description: "POSSIBLE INJURY" },
                injuryContributingActionFirst: { value: "00", description: "NO IMPROPER ACTION" },
                injuryActionPriorToImpact: { value: "31", description: "ADJACENT TO ROADWAY (SHOULDER, MEDIAN)" },

                safetyEquipmentReflectiveClothingUse: { value: "N", description: "NO" },

                occupantMedicalFacilityTransport: { value: "00", description: "NOT TRANSPORTED" },

                personOfficerName: "A Vainavicz",
                personOfficerRank: "SGT",
                personOfficerCjaNumber: "0000"
            }
        ],

        units: [
            {
                unitHeaderUnitNumber: "1",
                unitHeaderFr10Number: "FR10-2026-88213",
                unitHeaderCrashReportNumber: "2026-0004-001947",

                vehicleStatus: { value: "1", description: "IN TRANSPORT" },
                vehiclePlateNumber: "SC 4471 KD",
                vehicleState: { value: "SC", description: "SOUTH CAROLINA" },
                vehiclePlateExpires: "2027-04-30",
                vehicleIdentificationNumber: "4T1BF1FK5HU123456",
                vehicleDamageExtent: { value: "02", description: "FUNCTIONAL DAMAGE" },
                vehicleHitAndRun: { value: "2", description: "NO" },
                vehicleYear: 2019,
                vehicleMake: { value: "TOYT", description: "TOYOTA" },
                vehicleModel: { value: "CAM", description: "CAMRY" },
                vehicleBodyType: "4D SEDAN",
                vehicleOccupantCount: 2,

                insuranceCompany: "Palmetto Mutual",
                insuranceCdlRequired: { value: "2", description: "NO" },
                insuranceTowed: { value: "3", description: "NO" },
                insuranceEstimatedDamage: "3200",

                ownerFirstName: "James",
                ownerMiddleName: "R",
                ownerLastName: "Whitfield",
                ownerAddress: "902 Rosewood Dr",
                ownerCity: "Columbia",
                ownerState: { value: "SC", description: "SOUTH CAROLINA" },
                ownerZipCode: "29205",
                ownerDriverLicenseNumber: "104938271",

                travelDirection: { value: "E", description: "EAST" },
                travelSpeedRelated: { value: "5", description: "NO" },
                travelEstimatedSpeed: "0",
                travelSpeedLimit: "35",

                damageInitialPointOfContact: { value: "06", description: "CLOCK POSITION 6" },
                damageAreaOne: { value: "05", description: "CLOCK POSITION 5" },
                damageAreaTwo: { value: "07", description: "CLOCK POSITION 7" },

                unitTypeUnit: { value: "01", description: "AUTOMOBILE" },
                unitTypeEmergencyVehicleUse: { value: "77", description: "NOT APPLICABLE" },
                unitTypeSpecialFunction: { value: "00", description: "NO SPECIAL FUNCTION" },

                eventsMostHarmful: { value: "22", description: "MOVING MOTOR VEHICLE" },
                eventsSequenceFirst: { value: "22", description: "MOVING MOTOR VEHICLE" },

                roadwayGrade: { value: "01", description: "LEVEL" },
                roadwayAlignment: { value: "01", description: "STRAIGHT" },
                roadwayVehicleActionPriorToImpact: { value: "13", description: "STOPPED" },
                roadwayTrafficControlDeviceFirst: { value: "17", description: "TRAFFIC CONTROL SIGNAL" },
                roadwayVehicleContributingCircumstances: { value: "00", description: "NONE" },

                unitOfficerName: "A Vainavicz",
                unitOfficerRank: "SGT",
                unitOfficerCjaNumber: "0000"
            },
            {
                unitHeaderUnitNumber: "2",
                unitHeaderFr10Number: "FR10-2026-88214",
                unitHeaderCrashReportNumber: "2026-0004-001947",

                vehicleStatus: { value: "1", description: "IN TRANSPORT" },
                vehiclePlateNumber: "SC 9920 BR",
                vehicleState: { value: "SC", description: "SOUTH CAROLINA" },
                vehiclePlateExpires: "2026-11-30",
                vehicleIdentificationNumber: "1FTFW1E85MF987654",
                vehicleDamageExtent: { value: "03", description: "DISABLING DAMAGE" },
                vehicleHitAndRun: { value: "2", description: "NO" },
                vehicleYear: 2021,
                vehicleMake: { value: "FORD", description: "FORD" },
                vehicleModel: { value: "F15", description: "F-150" },
                vehicleBodyType: "PICKUP",
                vehicleOccupantCount: 1,

                insuranceCompany: "Congaree Casualty",
                insuranceCdlRequired: { value: "2", description: "NO" },
                insuranceTowed: { value: "1", description: "YES, DISABLED" },
                insuranceTowedBy: "Midlands Towing",
                insuranceEstimatedDamage: "9400",

                ownerFirstName: "Teresa",
                ownerLastName: "Nakamura",
                ownerAddress: "45 Devine St",
                ownerCity: "Columbia",
                ownerState: { value: "SC", description: "SOUTH CAROLINA" },
                ownerZipCode: "29205",
                ownerDriverLicenseNumber: "220184099",

                travelDirection: { value: "E", description: "EAST" },
                travelSpeedRelated: { value: "3", description: "YES, TOO FAST FOR CONDITION" },
                travelEstimatedSpeed: "38",
                travelSpeedLimit: "35",

                damageInitialPointOfContact: { value: "12", description: "CLOCK POSITION 12" },
                damageAreaOne: { value: "11", description: "CLOCK POSITION 11" },
                damageAreaTwo: { value: "01", description: "CLOCK POSITION 1" },

                unitTypeUnit: { value: "11", description: "PICKUP TRUCK" },
                unitTypeEmergencyVehicleUse: { value: "77", description: "NOT APPLICABLE" },
                unitTypeSpecialFunction: { value: "00", description: "NO SPECIAL FUNCTION" },

                eventsMostHarmful: { value: "22", description: "MOVING MOTOR VEHICLE" },
                eventsSequenceFirst: { value: "22", description: "MOVING MOTOR VEHICLE" },

                roadwayGrade: { value: "01", description: "LEVEL" },
                roadwayAlignment: { value: "01", description: "STRAIGHT" },
                roadwayVehicleActionPriorToImpact: { value: "01", description: "MOVEMENT ESSENTIALLY STRAIGHT AHEAD" },
                roadwayTrafficControlDeviceFirst: { value: "17", description: "TRAFFIC CONTROL SIGNAL" },
                roadwayVehicleContributingCircumstances: { value: "00", description: "NONE" },

                violationOneStatuteNumber: "56-5-1930",
                violationOneCharge: "Following too closely",
                violationOneTicketNumber: "20260000001947",

                unitOfficerName: "A Vainavicz",
                unitOfficerRank: "SGT",
                unitOfficerCjaNumber: "0000"
            }
        ]
    },

    minimal: {
        headerUnitCount: 1,

        collisionDate: "2026-09-03",
        collisionTime: "16:12",
        collisionCounty: { value: "23", description: "GREENVILLE" },

        routeCategory: "SC",
        routeName: "Wade Hampton Blvd",

        coordinatesLatitude: "34.85261",
        coordinatesLongitude: "-82.39401",

        trafficwayDirection: { value: "02", description: "TWO WAY" },
        trafficwayDivided: { value: "01", description: "NOT DIVIDED" },

        conditionsLight: { value: "01", description: "DAYLIGHT" },
        conditionsWeatherFirst: { value: "01", description: "CLEAR (NO ADVERSE CONDITION)" },
        conditionsRoadSurface: { value: "01", description: "DRY" },
        conditionsMannerOfCollision: { value: "00", description: "NOT A COLLISION WITH MV IN TRANSPORT" },

        harmfulEventFirst: { value: "20", description: "ANIMAL (DEER ONLY)" },
        harmfulEventLocation: { value: "05", description: "ROADWAY" },

        junctionRelation: { value: "00", description: "NON-JUNCTION" },
        junctionSchoolBusRelated: { value: "3", description: "NO" },

        workZoneRelated: { value: "2", description: "NO" },

        collisionOfficerName: "A Vainavicz",

        narrativeText: "Single vehicle struck a deer that entered the roadway from the north shoulder. No injuries reported.",

        persons: [
            {
                personHeaderPersonNumber: "1",
                personHeaderUnitNumber: "1",
                personHeaderPersonType: { value: "1", description: "MV DRIVER" },
                personFirstName: "Renata",
                personLastName: "Coelho",
                driverLicenseNumber: "553019284",
                driverLicenseState: { value: "SC", description: "SOUTH CAROLINA" },
                injuryStatus: { value: "0", description: "NO APPARENT INJURY" }
            }
        ],

        units: [
            {
                unitHeaderUnitNumber: "1",
                vehicleStatus: { value: "1", description: "IN TRANSPORT" },
                vehicleDamageExtent: { value: "01", description: "MINOR DAMAGE" },
                vehicleHitAndRun: { value: "2", description: "NO" },
                // the year is left unanswered, so a save omits it rather than reporting it as 0
                vehicleMake: { value: "HOND", description: "HONDA" },
                unitTypeUnit: { value: "01", description: "AUTOMOBILE" },
                eventsMostHarmful: { value: "20", description: "ANIMAL (DEER ONLY)" }
            }
        ]
    }
};
