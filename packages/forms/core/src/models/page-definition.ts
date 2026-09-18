import { IDefinition, Definition } from "./definition";
import { Entity } from "./entity";
import { FormDefinition } from "./form-definition";
import { FormModel } from "./form";
import { PageModel, PageModelConstructor } from "./page";
import { PageCollection } from "./page-collection";
import { ISectionDefinition } from "./section-definition";

/** Defines the definition of a page within a form. */
export interface IPageDefinition extends IDefinition {
    /** The page's display title, shown wherever a human-readable name is needed. Falls back to a title-cased version of `name` when not given. */
    readonly title: string;

    /** Registers a section definition as a child of this page. */
    registerSection(sectionDefinition: ISectionDefinition): void;
    /** Creates a new, empty page collection for this definition. */
    createNew(): PageCollection;
    /** Creates a new page model instance from this definition. */
    createPage(parent: Entity<Definition>): PageModel;
}

/** The page properties a caller may set when declaring a page; everything else is resolved from `name` or defaulted. */
export type IPageDefinitionOptions = Partial<Pick<IPageDefinition, "title">>;

/** Represents the definition of a page within a form. */
export class PageDefinition<TPage extends PageModel = PageModel> extends Definition implements IPageDefinition {
    readonly title: string;

    constructor(
        name: string,
        formDefinition: FormDefinition<FormModel<any>>,
        ctor: PageModelConstructor<TPage>,
        options?: IPageDefinitionOptions) {
        super(
            name,
            ctor,
            formDefinition
        );

        this.title = options?.title ?? this.getDisplayName();

        formDefinition?.registerPage(this);

        PageModel.registerDefinition(ctor, this);
    }

    public registerSection(sectionDefinition: ISectionDefinition): void {
        this.registerChild(sectionDefinition);
    }

    public createNew(): PageCollection {
        return new PageCollection();
    }

    public createPage(parent: Entity<Definition>): TPage {
        const page = <TPage>Entity.create(this.valueType as PageModelConstructor<TPage>, parent);

        return page.setName(this.name);
    }
}
