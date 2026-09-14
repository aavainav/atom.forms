import { IEntity } from "./entity";
import type { ISchema } from "./schema";

/** Constructs the model instance that values conforming to a definition resolve to. */
export type ValueTypeConstructor = new (...args: any[]) => unknown;

/** Describes a hierarchical entity definition with a unique identifier and an optional parent-child relationship. */
export interface IDefinition {
    /** The unique identifier of the definition. */
    readonly id: string;
    /** The name of the definition. */
    readonly name: string;
    /** The constructor for the model instances that values conforming to this definition resolve to. */
    readonly valueType: ValueTypeConstructor;
    /** The parent definition, if any. */
    readonly parent?: IDefinition;
    /** The schema this definition was built from. Only ever set on the form definition at the root of the tree. */
    readonly schema?: ISchema;

    /** The child definitions declared beneath this definition. */
    readonly children: ReadonlyArray<IDefinition>;
}

/** Represents an abstract base class for hierarchical entity definitions with unique identifiers and optional parent-child relationships. */
export abstract class Definition implements IDefinition {
    public readonly id: string;
    public readonly name: string;
    public readonly valueType: ValueTypeConstructor;
    public readonly parent?: IDefinition;
    public readonly schema?: ISchema;

    private readonly _children: Array<IDefinition> = [];

    constructor(name: string, valueType: ValueTypeConstructor, parent?: IDefinition, schema?: ISchema) {
        if (!valueType) {
            throw new Error(`Definition: No value type constructor defined for definition '${name}'.`);
        }

        this.id = crypto.randomUUID();
        this.name = name;
        this.valueType = valueType;
        this.parent = parent;
        this.schema = schema;
    }

    public get children(): ReadonlyArray<IDefinition> {
        return this._children;
    }

    public abstract createNew(parent: IEntity<Definition>): Object;

    protected registerChild(child: IDefinition): void {
        this._children.push(child);
    }
}
