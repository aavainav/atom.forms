import { IDefinition, Definition } from "./definition";
import { Entity } from "./entity";
import { FormDefinition } from "./form-definition";
import { FormModel } from "./form";
import { PageModel, PageModelConstructor } from "./page";
import { PageCollection } from "./page-collection";
import { ISectionDefinition } from "./section-definition";

/** Defines the definition of a page within a form. */
export interface IPageDefinition extends IDefinition {
    /** Registers a section definition as a child of this page. */
    registerSection(sectionDefinition: ISectionDefinition): void;
    /** Creates a new, empty page collection for this definition. */
    createNew(): PageCollection;
    /** Creates a new page model instance from this definition. */
    createPage(parent: Entity<Definition>): PageModel;
}

/** Represents the definition of a page within a form. */
export class PageDefinition<TPage extends PageModel = PageModel> extends Definition implements IPageDefinition {
    constructor(
        name: string,
        formDefinition: FormDefinition<FormModel>,
        ctor: PageModelConstructor<TPage>) {
        super(
            name,
            ctor,
            formDefinition
        );

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
