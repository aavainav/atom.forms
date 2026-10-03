import { IDraggableItem, IImportablePerson, IImportableVehicle, IImportableViolation } from "@forms/core";

/** Mock draggable person, vehicle and violation records for exercising the dropzone drag-and-drop feature. */
export const dropzoneDemoItems: ReadonlyArray<IDraggableItem<IImportablePerson | IImportableVehicle | IImportableViolation>> = [
    {
        id: "person-1",
        type: "person",
        data: { firstName: "Maria", middleName: "Elena", lastName: "Santiago" } satisfies IImportablePerson
    },
    {
        id: "person-2",
        type: "person",
        data: { firstName: "David", lastName: "Cho" } satisfies IImportablePerson
    },
    {
        id: "vehicle-1",
        type: "vehicle",
        data: { make: "Honda", model: "Accord", year: 2019 } satisfies IImportableVehicle
    },
    {
        id: "vehicle-2",
        type: "vehicle",
        data: { make: "Ford", model: "F-150", year: 2022 } satisfies IImportableVehicle
    },
    {
        id: "violation-1",
        type: "violation",
        data: { code: "56-5-1520", description: "Speeding, 15 mph over posted limit", statute: "56-05-1520(G)(2)", points: 4 } satisfies IImportableViolation
    }
];
