import { IDraggableItem, IImportablePerson, IImportableVehicle } from "@forms/core";

/** Mock draggable person/vehicle records for exercising the dropzone drag-and-drop feature. */
export const dropzoneDemoItems: ReadonlyArray<IDraggableItem<IImportablePerson | IImportableVehicle>> = [
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
    }
];
