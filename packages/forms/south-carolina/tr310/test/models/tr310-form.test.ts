import { describe, expect, it } from "vitest";

import { TR310Mapper } from "../../src/mapping/tr310-mapper";
import { createForm } from "../fixtures/form";

describe("TR310FormModel", () => {
    describe("getCrashData", () => {
        const mapper = new TR310Mapper();
        const driver = { value: "1", description: "MV DRIVER" };
        const nonMotorist = { value: "3", description: "NON-MOTORIST" };

        it("takes no driver when the only person sharing the unit's number is not one", async () => {
            const form = await createForm();
            const populated = await mapper.populate(form, {
                data: {
                    persons: [{ personHeaderUnitNumber: "1", personHeaderPersonType: nonMotorist, personFirstName: "Riley" }],
                    units: [{ unitHeaderUnitNumber: "1" }]
                }
            });

            expect(populated.getCrashData().units[0].driverFirstName).toBe("");
        });

        /** The bug this guards: `.find()` took the first person sharing the unit's number, driver or not. */
        it("takes the driver over an earlier person sharing the same unit number who is not one", async () => {
            const form = await createForm();
            const populated = await mapper.populate(form, {
                data: {
                    persons: [
                        { personHeaderUnitNumber: "1", personHeaderPersonType: nonMotorist, personFirstName: "Riley" },
                        { personHeaderUnitNumber: "1", personHeaderPersonType: driver, personFirstName: "James" }
                    ],
                    units: [{ unitHeaderUnitNumber: "1" }]
                }
            });

            expect(populated.getCrashData().units[0].driverFirstName).toBe("James");
        });

        it("matches a unit to its own driver, not another unit's", async () => {
            const form = await createForm();
            const populated = await mapper.populate(form, {
                data: {
                    persons: [
                        { personHeaderUnitNumber: "1", personHeaderPersonType: driver, personFirstName: "James" },
                        { personHeaderUnitNumber: "2", personHeaderPersonType: driver, personFirstName: "Dana" }
                    ],
                    units: [{ unitHeaderUnitNumber: "1" }, { unitHeaderUnitNumber: "2" }]
                }
            });

            const [unitOne, unitTwo] = populated.getCrashData().units;
            expect(unitOne.driverFirstName).toBe("James");
            expect(unitTwo.driverFirstName).toBe("Dana");
        });
    });
});
