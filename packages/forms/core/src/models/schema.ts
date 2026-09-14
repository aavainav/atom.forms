export type SchemaConstructor<TSchema extends Schema> = new () => TSchema;

/** Marker interface implemented by form schemas. */
export interface ISchema {
}

/** Represents an abstract base class for defining schemas. */
export abstract class Schema implements ISchema {
}
