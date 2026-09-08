import { IDefinition, Definition } from "./definition";
import { Entity } from "./entity";
import { IFieldDefinition } from "./field-definition";
import { PageModel } from "./page";
import { PageDefinition } from "./page-definition";
import { SectionModel, SectionModelConstructor } from "./section";

/** Options a section definition can be declared with. */
export interface ISectionDefinitionOptions {
    /**
     * Whether the section holds the same values on every instance of its page.
     *
     * A shared section is written through to every page instance rather than to the one being edited, so a page
     * that repeats for one reason -- a citation carrying a page per violation -- still reads as one record for
     * everything the repetition is not about.
     */
    readonly isShared?: boolean;
}

/** Defines the definition of a section within a form. */
export interface ISectionDefinition extends IDefinition {
    /** Whether the section holds the same values on every instance of its page. */
    readonly isShared: boolean;

    /** Creates a new section model instance from this definition. */
    createNew(parent: Entity<Definition>): SectionModel;
    /** Returns the page definition that this section belongs to. */
    getPageDefinition(): PageDefinition<PageModel>;
    /** Registers a field definition as a child of this section. */
    registerField(fieldDefinition: IFieldDefinition): void;
}

/** Represents the definition of a section within a form. */
export class SectionDefinition<TSection extends SectionModel = SectionModel> extends Definition implements ISectionDefinition {
    readonly isShared: boolean;

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
