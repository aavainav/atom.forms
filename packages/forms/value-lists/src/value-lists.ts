import { IValueListDefinition, toOptions } from "./models";

/**
 * The ids of the value lists this package registers.
 *
 * These are the lists with no jurisdiction and no form in them - a national code set every traffic form reaches
 * for - which is why they are unqualified. A list belonging to one state or one form is owned by the package that
 * needs it and carries that owner as a prefix, so two forms can never register different data under one id.
 */
export const ValueListId = {
    state: "state",
    vehicleMake: "vehicle-make",
    vehicleModel: "vehicle-model"
} as const;

/**
 * The value lists this package registers with the value list service.
 *
 * Every generated module is reached through a `load` callback that imports it dynamically, and must stay that
 * way. A static import of anything under ./generated - including a type-only import that a later edit turns into
 * a value import - folds that list's data straight back into whichever chunk this module lands in, and the split
 * silently stops working. The vehicle make and model data alone is larger than everything else put together, and
 * the model list is not fetched at all until a make has been chosen.
 */
export const standardValueLists: ReadonlyArray<IValueListDefinition> = [
    {
        id: ValueListId.state,
        load: () => import("./generated/states").then(module => toOptions(module.states))
    },
    {
        id: ValueListId.vehicleMake,
        load: () => import("./generated/vehicle-makes").then(module => toOptions(module.vehicleMakes))
    },
    {
        // the models hang off the makes, and that one line is the whole of the dependency: the service groups the
        // flat model list by the make each row carries, and a select bound to it reloads when the make changes
        id: ValueListId.vehicleModel,
        parentId: ValueListId.vehicleMake,
        load: () => import("./generated/vehicle-models").then(module => toOptions(module.vehicleModels))
    }
];
