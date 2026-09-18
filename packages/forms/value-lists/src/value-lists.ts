import { IValueListDefinition, toOptions } from "./models";

/**
 * The ids of the value lists this package registers.
 *
 * Unqualified because these lists have no jurisdiction or form -- a national code set every traffic form reaches
 * for. A list owned by one state or form carries that owner as a prefix, so two forms can never collide on one id.
 */
export const ValueListId = {
    state: "state",
    vehicleMake: "vehicle-make",
    vehicleModel: "vehicle-model"
} as const;

/**
 * The value lists this package registers with the value list service.
 *
 * Every generated module must stay reached only through a dynamic `load()` -- a static import under ./generated,
 * even a type-only one a later edit turns into a value import, folds that data back into this module's own chunk
 * and silently breaks the split. Vehicle make/model data alone outweighs everything else combined, and models
 * aren't fetched at all until a make is chosen.
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
