import { IDefinition, Definition } from "./definition";
import { Entity } from "./entity";
import { IFieldDefinition } from "./field-definition";
import { PageModel } from "./page";
import { PageDefinition } from "./page-definition";
import { SectionModel, SectionModelConstructor } from "./section";

/** Defines the definition of a section within a form. */
export interface ISectionDefinition extends IDefinition {
    /**
     * Whether the section holds the same values on every instance of its page.
     *
     * A shared section writes through to every instance, not just the one being edited, so a page repeating for
     * one reason -- a citation with a page per violation -- still reads as one record for everything else.
     */
    readonly isShared: boolean;
    /** The section's display title, shown wherever a human-readable name is needed. Falls back to a title-cased version of `name` when not given. */
    readonly title: string;

    /** Creates a new section model instance from this definition. */
    createNew(parent: Entity<Definition>): SectionModel;
    /** Returns the page definition that this section belongs to. */
    getPageDefinition(): PageDefinition<PageModel>;
    /** Registers a field definition as a child of this section. */
    registerField(fieldDefinition: IFieldDefinition): void;
}

/** The section properties a caller may set when declaring a section; everything else is resolved from `name` or defaulted. */
export type ISectionDefinitionOptions = Partial<Pick<ISectionDefinition, "isShared" | "title">>;

/** Represents the definition of a section within a form. */
export class SectionDefinition<TSection extends SectionModel = SectionModel> extends Definition implements ISectionDefinition {
    readonly isShared: boolean;
    readonly title: string;

    constructor(
        name: string,
        pageDefinition: PageDefinition<PageModel>,
        ctor: SectionModelConstructor<TSection>,
        options?: ISectionDefinitionOptions
    ) {
        super(
            name,
            ctor,
            pageDefinition
        );

        this.isShared = options?.isShared ?? false;
        this.title = options?.title ?? this.getDisplayName();

        pageDefinition.registerSection(this);

        SectionModel.registerDefinition(ctor, this);
    }

    public createNew(parent: Entity<Definition>): TSection {
        return Entity.create(this.valueType as SectionModelConstructor<TSection>, parent);
    }

    public getPageDefinition(): PageDefinition<PageModel> {
        return this.parent as PageDefinition<PageModel>;
    }

    public registerField(fieldDefinition: IFieldDefinition): void {
        this.registerChild(fieldDefinition);
    }
}
