import { IDefinition, Definition } from "./definition";
import { Entity } from "./entity";
import { IFieldDefinition } from "./field-definition";
import { PageModel } from "./page";
import { PageDefinition } from "./page-definition";
import { SectionCollection } from "./section-collection";
import { SectionModel, SectionModelConstructor } from "./section";

/** Defines the definition of a section that repeats a fixed number of times within one page. */
export interface ISectionCollectionDefinition extends IDefinition {
    /** How many times the section repeats. */
    readonly count: number;
    /** Always `false` -- a section collection's own sections are never copied across page instances the way a shared section's one value is; there is no cross-page sharing to ask of it. */
    readonly isShared: boolean;
    /** The collection's display title, shown wherever a human-readable name is needed. Falls back to a title-cased version of `name` when not given. */
    readonly title: string;

    /** Creates a new section collection from this definition, with `count` fresh instances. */
    createNew(parent: Entity<Definition>): SectionCollection<SectionModel>;
    /** Returns the page definition that this section collection belongs to. */
    getPageDefinition(): PageDefinition<PageModel>;
    /** Registers a field definition as a child of every section in the collection. */
    registerField(fieldDefinition: IFieldDefinition): void;
}

/** The section-collection properties a caller may set when declaring one; everything else is resolved from `name` or defaulted. */
export type ISectionCollectionDefinitionOptions = Partial<Pick<ISectionCollectionDefinition, "title">>;

/**
 * Represents the definition of a section that repeats a fixed number of times within one page -- a passenger
 * table's rows, say, as opposed to `SectionDefinition`, which only ever holds one instance.
 */
export class SectionCollectionDefinition<TSection extends SectionModel = SectionModel> extends Definition implements ISectionCollectionDefinition {
    readonly count: number;
    readonly isShared: boolean = false;
    readonly title: string;

    constructor(
        name: string,
        pageDefinition: PageDefinition<PageModel>,
        ctor: SectionModelConstructor<TSection>,
        count: number,
        options?: ISectionCollectionDefinitionOptions
    ) {
        super(
            name,
            ctor,
            pageDefinition
        );

        this.count = count;
        this.title = options?.title ?? this.getDisplayName();

        pageDefinition.registerSection(this);

        SectionModel.registerDefinition(ctor, this);
    }

    public createNew(parent: Entity<Definition>): SectionCollection<TSection> {
        const create = (): TSection => Entity.create(this.valueType as SectionModelConstructor<TSection>, parent);

        return new SectionCollection(Array.from({ length: this.count }, create));
    }

    public getPageDefinition(): PageDefinition<PageModel> {
        return this.parent as PageDefinition<PageModel>;
    }

    public registerField(fieldDefinition: IFieldDefinition): void {
        this.registerChild(fieldDefinition);
    }
}
