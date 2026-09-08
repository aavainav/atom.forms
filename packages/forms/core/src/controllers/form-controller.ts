import { EventEmitter, IEvent } from "@common/event-emitter";

import { IController } from "./controller";

import { FieldModel, TValueType } from "../models/field";
import { FieldDefinition } from "../models/field-definition";
import { FormModel } from "../models/form";
import { PageCollection } from "../models/page-collection";
import { PageDefinition } from "../models/page-definition";
import { PageModel } from "../models/page";
import { SectionDefinition } from "../models/section-definition";
import { SectionModel } from "../models/section";

import { Mutable } from "../utils/mutable";

/** Asked before a page is removed; resolve false to cancel the removal. */
export type ConfirmPageDelete = (page: PageModel) => Promise<boolean>;

/** Binds a single section within a page, so its values can be read and written without knowing where it sits in the form. */
export interface ISectionBinding<TSection extends SectionModel = SectionModel> {
    readonly sectionDefinition: SectionDefinition<TSection>;

    /** Gets the section as it currently stands on the form. */
    get(): TSection;
    /**
     * Applies a change computed from the section's current state. Always compute from the argument rather than a
     * section captured during render; a captured section is a snapshot that another edit may already have replaced.
     */
    update(update: (section: TSection) => TSection): void;
    /** Sets a single field's value. */
    setValue(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, value: TValueType): void;
}

/** Binds a single page instance, identified by its id so it survives other pages being added or removed. */
export interface IPageBinding<TPage extends PageModel = PageModel> {
    readonly pageDefinition: PageDefinition<TPage>;
    /** The page instance's id, which is stable for the life of the page unlike its index in the collection. */
    readonly pageId: string;

    /** Gets the page as it currently stands on the form. */
    get(): TPage;
    /** Applies a change computed from the page's current state. */
    update(update: (page: TPage) => TPage): void;
    /** Gets the binding for one of the page's sections. */
    getSection<TSection extends SectionModel>(sectionDefinition: SectionDefinition<TSection>): ISectionBinding<TSection>;
}

/** Defines the controller that owns the current form model and is the single path through which every edit is applied. */
export interface IFormController<TForm extends FormModel = FormModel> extends IController {
    /** The form as it currently stands. A new instance replaces it on every edit, after which `onChanged` is raised. */
    readonly form: TForm;

    /** Replaces the form with the result of the update; returning the form unchanged raises nothing. */
    update(update: (form: TForm) => TForm): void;
    /** Replaces the form outright. Prefer `update` so the change is computed from the current form rather than a captured one. */
    setForm(form: TForm): void;

    /** Creates, initializes and appends a page for the given definition. */
    addPage(pageDefinition: PageDefinition): Promise<void>;
    /** Removes the identified page after asking the confirm policy, returning true if it was removed. */
    removePage(pageDefinition: PageDefinition, pageId: string): Promise<boolean>;
    /** Sets the policy asked before a page is removed; when unset, pages are removed without confirmation. */
    setConfirmDeletePage(confirm: ConfirmPageDelete | undefined): void;

    /** Gets the binding for a single page instance. */
    getPageBinding<TPage extends PageModel>(pageDefinition: PageDefinition<TPage>, pageId: string): IPageBinding<TPage>;
}

class SectionBinding<TSection extends SectionModel> implements ISectionBinding<TSection> {
    constructor(private readonly page: IPageBinding<PageModel>, readonly sectionDefinition: SectionDefinition<TSection>) {
    }

    public get(): TSection {
        return this.page.get().get<TSection>(this.sectionDefinition);
    }

    public update(update: (section: TSection) => TSection): void {
        this.page.update(page => page.set(this.sectionDefinition, update(page.get<TSection>(this.sectionDefinition))));
    }

    public setValue(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, value: TValueType): void {
        this.update(section => section.set(fieldDefinition, section.get<FieldModel<TValueType>>(fieldDefinition).setValue(value)));
    }
}

/**
 * Binds a section that holds the same values on every instance of its page, so a write lands on all of them.
 *
 * The update is run against each page's own copy of the section rather than one result being written into all of
 * them: every field carries a uuid used as its DOM id, and a section shared by reference would repeat those ids on
 * every page -- which collides for real during a print, where the pages render together rather than as tab panes.
 * Running the update per page converges their values while leaving each page its own field identities, because a
 * field is set to an absolute value rather than by a delta.
 */
class SharedSectionBinding<TSection extends SectionModel> implements ISectionBinding<TSection> {
    constructor(
        private readonly controller: IFormController,
        private readonly page: IPageBinding<PageModel>,
        readonly sectionDefinition: SectionDefinition<TSection>) {
    }

    public get(): TSection {
        // every instance holds the same values, so this page's copy is as good as any and needs no lookup
        return this.page.get().get<TSection>(this.sectionDefinition);
    }

    public update(update: (section: TSection) => TSection): void {
        this.controller.update(form => {
            const pageDefinition = this.page.pageDefinition;
            let pageCollection = form.get<PageCollection>(pageDefinition);

            for (let index = 0; index < pageCollection.pages.length; index++) {
                const page = pageCollection.pages[index];
                pageCollection = pageCollection.replace(index, page.set(this.sectionDefinition, update(page.get<TSection>(this.sectionDefinition))));
            }

            return form.set(pageDefinition, pageCollection);
        });
    }

    public setValue(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, value: TValueType): void {
        this.update(section => section.set(fieldDefinition, section.get<FieldModel<TValueType>>(fieldDefinition).setValue(value)));
    }
}

class PageBinding<TPage extends PageModel> implements IPageBinding<TPage> {
    private readonly sections: Map<string, ISectionBinding<any>> = new Map<string, ISectionBinding<any>>();

    constructor(
        private readonly controller: IFormController,
        readonly pageDefinition: PageDefinition<TPage>,
        readonly pageId: string) {
    }

    public get(): TPage {
        const page = this.controller.form.get<PageCollection>(this.pageDefinition).findPageById<TPage>(this.pageId);
        if (!page) {
            throw new Error(`Page ${this.pageId} is no longer part of ${this.pageDefinition.name}.`);
        }

        return page;
    }

    public update(update: (page: TPage) => TPage): void {
        this.controller.update(form => {
            const pageCollection = form.get<PageCollection>(this.pageDefinition);
            const index = pageCollection.indexOfPage(this.pageId);

            // the page can be removed while a handler is still in flight, such as an async drop; dropping the edit is correct
            if (index < 0) {
                return form;
            }

            return form.set(this.pageDefinition, pageCollection.replace(index, update(pageCollection.pages[index] as TPage)));
        });
    }

    public getSection<TSection extends SectionModel>(sectionDefinition: SectionDefinition<TSection>): ISectionBinding<TSection> {
        let binding = this.sections.get(sectionDefinition.id);

        if (!binding) {
            // a shared section is written through to every instance of the page, so the section it is bound to is
            // the one the definition names rather than the one sitting on this particular page
            binding = sectionDefinition.isShared
                ? new SharedSectionBinding<TSection>(this.controller, this, sectionDefinition)
                : new SectionBinding<TSection>(this, sectionDefinition);

            this.sections.set(sectionDefinition.id, binding);
        }

        return binding;
    }
}

export class FormController<TForm extends FormModel = FormModel> implements IFormController<TForm> {
    private readonly _changed = new EventEmitter<void>("form:changed");
    private readonly bindings: Map<string, IPageBinding<any>> = new Map<string, IPageBinding<any>>();

    private readonly confirmDeletePage?: ConfirmPageDelete;
    private readonly _form: TForm;

    constructor(form: TForm) {
        this._form = form;
    }

    get form(): TForm {
        return this._form;
    }

    get onChanged(): IEvent<void> {
        return this._changed.event;
    }

    /**
     * Subscribers read the form directly rather than through the change event, so an edit must land synchronously.
     * Do not defer an edit through `startTransition`: a deferred render could read a newer form than the one a
     * subscriber has rendered against, tearing the two apart.
     */
    public update(update: (form: TForm) => TForm): void {
        const form = update(this._form);

        // the models are immutable, so an update that changed nothing returns the same instance and need not be published
        if (form === this._form) {
            return;
        }

        (<Mutable<TForm>>this._form) = form;
        this._changed.emit();
    }

    public setForm(form: TForm): void {
        this.update(() => form);
    }

    public async addPage(pageDefinition: PageDefinition): Promise<void> {
        // initialize must be awaited, since it is what creates the page's sections and registers its dropzones
        const page = await pageDefinition.createPage(this._form).initialize();
        this.update(form => form.addPage(copySharedSections(form, pageDefinition, page), pageDefinition));
    }

    public async removePage(pageDefinition: PageDefinition, pageId: string): Promise<boolean> {
        const page = this._form.get<PageCollection>(pageDefinition).findPageById(pageId);
        if (!page) {
            return false;
        }

        if (this.confirmDeletePage && !await this.confirmDeletePage(page)) {
            return false;
        }

        this.update(form => {
            // the collection is resolved again because it may have changed while the confirmation was open
            const index = form.get<PageCollection>(pageDefinition).indexOfPage(pageId);
            return index < 0 ? form : form.removePage(index, pageDefinition);
        });

        this.bindings.delete(this.getBindingKey(pageDefinition, pageId));

        return true;
    }

    public setConfirmDeletePage(confirm: ConfirmPageDelete | undefined): void {
        (<Mutable<ConfirmPageDelete | undefined>>this.confirmDeletePage) = confirm;
    }

    public getPageBinding<TPage extends PageModel>(pageDefinition: PageDefinition<TPage>, pageId: string): IPageBinding<TPage> {
        const key = this.getBindingKey(pageDefinition, pageId);
        let binding = this.bindings.get(key);

        if (!binding) {
            binding = new PageBinding<TPage>(this, pageDefinition, pageId);
            this.bindings.set(key, binding);
        }

        return binding;
    }

    public dispose(): void {
        this.bindings.clear();
        (<Mutable<ConfirmPageDelete | undefined>>this.confirmDeletePage) = undefined;
    }

    private getBindingKey(pageDefinition: PageDefinition<PageModel>, pageId: string): string {
        return `${pageDefinition.id}:${pageId}`;
    }
}

/**
 * Copies the values of the page definition's shared sections from the first page in the collection onto a page
 * about to be added.
 *
 * A page arrives from `createPage` empty, so without this a new page would show blank shared sections until an
 * edit to one of them happened to converge every instance.
 *
 * The values are copied field by field rather than by carrying the whole section across, so the new page keeps the
 * fields `initialize` gave it and with them their own uuids -- the ids the rendered inputs and their labels are
 * addressed by, which must stay distinct across pages that print together.
 */
function copySharedSections<TPage extends PageModel>(form: FormModel, pageDefinition: PageDefinition<TPage>, page: TPage): TPage {
    const shared = pageDefinition.children.filter((child): child is SectionDefinition => child instanceof SectionDefinition && child.isShared);
    if (!shared.length) {
        return page;
    }

    // the first page of a collection has nothing to copy from, and is itself what every later page copies
    const source = form.get<PageCollection>(pageDefinition).pages[0];
    if (!source) {
        return page;
    }

    return shared.reduce((result, sectionDefinition) => {
        const from = source.get<SectionModel>(sectionDefinition);

        const section = sectionDefinition.children.reduce((target, child) => {
            const fieldDefinition = child as FieldDefinition<FieldModel<TValueType>>;
            const field = from.get<FieldModel<TValueType>>(fieldDefinition);

            return target.set(
                fieldDefinition,
                target.get<FieldModel<TValueType>>(fieldDefinition).setValue(field.getValue()).setIsEnabled(field.getIsEnabled()));
        }, result.get<SectionModel>(sectionDefinition));

        return result.set(sectionDefinition, section);
    }, page);
}
