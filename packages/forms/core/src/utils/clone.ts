export function withChanges<TInstance extends object, TChanges extends object>(instance: TInstance, changes: TChanges): TInstance {
    return Object.assign(Object.create(Object.getPrototypeOf(instance)), instance, changes);
}