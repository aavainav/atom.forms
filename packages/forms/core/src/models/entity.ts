import { Definition, IDefinition } from "./definition";
import type { ISchema } from "./schema";
import { withChanges } from "../utils/clone";

export type EntityConstructor<TChildDefinition extends Definition> = new (id?: string, revision?: number, definition?: Definition) => Entity<TChildDefinition>;

/** Represents an entity defined by a specific definition type. */
export interface IEntity<TChildDefinition extends Definition> {
    /** The unique identifier of the entity. */
    readonly id?: string;
    /** The revision number of the entity. */
    readonly revision?: number;

    /** The definition that describes this entity's shape. */
    readonly definition: Definition;
    /** The schema of the form this entity belongs to. */
    readonly schema: ISchema;

    /** Returns the entity's definition cast to the requested type. */
    getDefinition<TDefinition>(): TDefinition;
    /** Returns the entity's schema cast to the requested type. */
    getSchema<TSchema extends ISchema>(): TSchema;
    /** Returns the child definitions declared by this entity's definition. */
    getChildDefinitions(): TChildDefinition[];
    /** Returns the child definition with the given name, throwing if none is found. */
    getDefinitionByName(name: string): Definition;
    /** Returns a new entity with the value set for the given child definition. */
    set<TValue>(definition: TChildDefinition, value: TValue): this;
};

/** Represents an abstract base class for an entity defined by a specific definition type. */
export abstract class Entity<TChildDefinition extends Definition> implements IEntity<TChildDefinition> {
    readonly id?: string;
    readonly revision?: number;

    readonly definition: Definition;
    readonly schema: ISchema;

    private static definitionRegistry: Map<EntityConstructor<Definition>, Definition> = new Map<EntityConstructor<Definition>, Definition>();
    private readonly values: Map<TChildDefinition, any> = new Map<TChildDefinition, any>();

    constructor(id?: string, revision?: number, definition?: Definition) {
        this.id = id ?? crypto.randomUUID();
        this.revision = revision ?? 0;
        this.definition = definition ?? Entity.resolveDefinition<TChildDefinition>(this.constructor as EntityConstructor<TChildDefinition>);
        this.schema = Entity.resolveSchema(this.definition);

        this.initializeDefinitionValues();
    }

    public getDefinition<TDefinition>(): TDefinition {
        return <TDefinition>this.definition;
    }

    public getSchema<TSchema extends ISchema>(): TSchema {
        return <TSchema>this.schema;
    }

    public getChildDefinitions(): Array<TChildDefinition> {
        return this.definition.children as Array<TChildDefinition>;
    }

    public getDefinitionByName(name: string): Definition {
        const definition = this.getChildDefinitions().find((def) => def.name === name);

        if (!definition) {
            throw new Error(`Definition with name ${name} not found in entity definitions.`);
        }

        return definition;
    }

    public set<TValue>(definition: TChildDefinition, value: TValue): this {
        this.validateDefinition(definition);

        const values = new Map(this.values).set(definition, value);
        return withChanges(this, { values });
    }

    public static clearDefinitionRegistry(): void {
        Entity.definitionRegistry.clear();
    }

    public static create<TDefinition extends Definition, TEntity extends Entity<TDefinition>>(ctor: EntityConstructor<TDefinition>, _parent: Entity<TDefinition>): TEntity {
        return new ctor() as TEntity;
    }

    protected get<TValue>(definition: TChildDefinition): TValue;
    protected get<TValue>(definition: TChildDefinition): Array<TValue>;
    protected get<TValue>(definition: TChildDefinition): TValue | Array<TValue> {
        if (Array.isArray(definition)) {
            return definition.map((def) => this.values.get(def)) as Array<TValue>;
        } else {
            const value = this.values.get(definition) as TValue;

            if (!value) {
                throw new Error(`A field was not found for definition with name ${definition.name} for section ${definition.parent?.name}.`);
            }

            return value;
        }
    }

    protected static registerDefinition<TDefinition extends Definition>(type: EntityConstructor<TDefinition>, definition: Definition): void {
        Entity.definitionRegistry.set(type, definition);
    }

    protected static resolveDefinition<TDefinition extends Definition>(ctor: EntityConstructor<TDefinition>): TDefinition {
        const definition = Entity.definitionRegistry.get(ctor);
        if (!definition) {
            throw new Error(`Definition for entity type ${ctor.name} is not registered.`);
        }

        return definition as TDefinition;
    }

    /** Walks a definition up to the form definition at the root of its tree and returns the schema it was built from. */
    protected static resolveSchema(definition: Definition): ISchema {
        let current: IDefinition = definition;

        while (current.parent) {
            current = current.parent;
        }

        if (!current.schema) {
            throw new Error(`No schema is registered for the form definition '${current.name}'.`);
        }

        return current.schema;
    }

    private initializeDefinitionValues(): void {
        this.getChildDefinitions().forEach((definition) => {
            this.values.set(definition, definition.createNew(this));
        });
    }

    private validateDefinition(definition: Definition): void {
        if (definition === null || definition === undefined) {
            throw new Error("Definition cannot be null or undefined.");
        }

        if (!this.definition.children.includes(definition)) {
            throw new Error(`Definition with id ${definition.id} is not a child of entity definition ${this.definition.id}.`);
        }
    }
}
