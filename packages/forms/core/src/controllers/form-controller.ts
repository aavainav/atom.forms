import { Controller, ControllerKey, IController } from "./controller";
import { IFormActivityEventArgs, FormActivity } from "./controller-activity";
import { RegisterController } from "./controller-registry";

import { FieldModel, TValueType } from "../models/field";
import { FieldDefinition } from "../models/field-definition";
import { FormMode, FormModel } from "../models/form";
import { PageCollection } from "../models/page-collection";
import { PageDefinition } from "../models/page-definition";
import { PageModel } from "../models/page";
import { SectionCollection } from "../models/section-collection";
import { SectionCollectionDefinition } from "../models/section-collection-definition";
import { SectionDefinition } from "../models/section-definition";
import { SectionModel } from "../models/section";

import { Mutable } from "../utils/mutable";

/** Asked before a page is removed; resolve false to cancel the removal. */
export type ConfirmPageDelete = (page: PageModel) => Promise<boolean>;

/** What a section update needs: how to compute the new section, and optionally why. Method shorthand keeps `update` bivariant, so a subclass binding stays assignable to the SectionModel base. */
export interface ISectionUpdateOptions<TSection extends SectionModel> {
    /** What the update was, for whatever observes the change to record -- core never interprets it itself. */
    readonly reason?: FormActivity;
    /** Computes the new section from its current state. Compute from the argument, not a section captured during render -- that snapshot may already be stale. */
    update(section: TSection): TSection;
}

/** What a page update needs: how to compute the new page, and optionally why. See `ISectionUpdateOptions` for why `update` uses method shorthand. */
export interface IPageUpdateOptions<TPage extends PageModel> {
    /** What the update was, for whatever observes the change to record -- core never interprets it itself. */
    readonly reason?: FormActivity;
    /** Computes the new page from its current state. */
    update(page: TPage): TPage;
}

/** What a form update needs: how to compute the new form, and optionally why. See `ISectionUpdateOptions` for why `update` uses method shorthand. */
export interface IFormUpdateOptions<TForm extends FormModel<any>> {
    /** What the update was, for whatever observes the change to record -- core never interprets it itself. */
    readonly reason?: FormActivity;
    /** Computes the new form from its current state; returning the form unchanged raises nothing. */
    update(form: TForm): TForm;
}

/** Binds a single section within a page, so its values can be read and written without knowing where it sits in the form. */
export interface ISectionBinding<TSection extends SectionModel = SectionModel> {
    readonly sectionDefinition: SectionDefinition<TSection> | SectionCollectionDefinition<TSection>;

    /** Gets the section as it currently stands on the form. */
    get(): TSection;
    /** Sets a single field's value. */
    setValue(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, value: TValueType): void;
    /** Applies a change computed from the section's current state. Compute from the argument, not a section captured during render -- that snapshot may already be stale. */
    update(options: ISectionUpdateOptions<TSection>): void;
}

/** What a section collection update needs: how to compute the new collection, and optionally why. See `ISectionUpdateOptions` for why `update` uses method shorthand. */
export interface ISectionCollectionUpdateOptions<TSection extends SectionModel> {
    /** What the update was, for whatever observes the change to record -- core never interprets it itself. */
    readonly reason?: FormActivity;
    /** Computes the new collection from its current state. */
    update(collection: SectionCollection<TSection>): SectionCollection<TSection>;
}

/** Binds a section collection within a page, so one of its sections can be read and replaced without knowing where the collection sits in the form. */
export interface ISectionCollectionBinding<TSection extends SectionModel = SectionModel> {
    readonly sectionDefinition: SectionCollectionDefinition<TSection>;

    /** Gets the collection as it currently stands on the form. */
    get(): SectionCollection<TSection>;
    /** Binds one section within the collection, by its index -- stable, since nothing here ever adds or removes one. */
    getSection(index: number): ISectionBinding<TSection>;
    /** Applies a change computed from the collection's current state. */
    update(options: ISectionCollectionUpdateOptions<TSection>): void;
}

/** Binds a single page instance, identified by its id so it survives other pages being added or removed. */
export interface IPageBinding<TPage extends PageModel = PageModel> {
    /** The mode of the form this page belongs to. */
    readonly mode: FormMode;
    /** The page definition that is used to get the corresponding page model. */
    readonly pageDefinition: PageDefinition<TPage>;
    /** The page instance's id, which is stable for the life of the page unlike its index in the collection. */
    readonly pageId: string;

    /** Gets the page as it currently stands on the form. */
    get(): TPage;
    /** Gets the binding for one of the page's sections. */
    getSection<TSection extends SectionModel>(sectionDefinition: SectionDefinition<TSection>): ISectionBinding<TSection>;
    /** Gets the binding for one of the page's section collections. */
    getSectionCollection<TSection extends SectionModel>(sectionDefinition: SectionCollectionDefinition<TSection>): ISectionCollectionBinding<TSection>;
    /** Whether the form has locked the section, closing its fields and anything that would write to them. */
    isSectionLocked(sectionDefinition: SectionDefinition): boolean;
    /** Applies a change computed from the page's current state. */
    update(options: IPageUpdateOptions<TPage>): void;
}

/** Defines the controller that owns the current form model and is the single path through which every edit is applied. */
export interface IFormController<TForm extends FormModel<any> = FormModel<any>> extends IController {
    /** The form as it currently stands. A new instance replaces it on every edit, after which `onChanged` is raised. */
    readonly form: TForm;


    /** Creates, initializes and appends a page for the given definition. */
    addPage(pageDefinition: PageDefinition): Promise<void>;
    /** Gets the binding for a single page instance. */
    getPageBinding<TPage extends PageModel>(pageDefinition: PageDefinition<TPage>, pageId: string): IPageBinding<TPage>;
     /** Removes the identified page after asking the confirm policy, returning true if it was removed. */
    removePage(pageDefinition: PageDefinition, pageId: string): Promise<boolean>;
    /** Sets the policy asked before a page is removed; when unset, pages are removed without confirmation. */
    setConfirmDeletePage(confirm: ConfirmPageDelete | undefined): void;
    /** Replaces the form outright. Prefer `update` so the change is computed from the current form rather than a captured one. */
    setForm(form: TForm): void;
    /** Replaces the form with the result of the update; returning the form unchanged raises nothing. */
    update(options: IFormUpdateOptions<TForm>): void;
}

/**
 * Copies the shared sections' values from the collection's first page onto a page about to be added -- a page
 * arrives from `createPage` empty, so without this its shared sections would stay blank until an edit converged them.
 */
function copySharedSections<TPage extends PageModel>(form: FormModel<any>, pageDefinition: PageDefinition<TPage>, page: TPage): TPage {
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

class SectionBinding<TSection extends SectionModel> implements ISectionBinding<TSection> {
    constructor(private readonly page: IPageBinding<PageModel>, readonly sectionDefinition: SectionDefinition<TSection>) {
    }

    public get(): TSection {
        return this.page.get().get<TSection>(this.sectionDefinition);
    }

    public setValue(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, value: TValueType): void {
        this.update({ update: section => section.set(fieldDefinition, section.get<FieldModel<TValueType>>(fieldDefinition).setValue(value)) });
    }

    public update({ reason, update }: ISectionUpdateOptions<TSection>): void {
        this.page.update({ update: page => page.set(this.sectionDefinition, update(page.get<TSection>(this.sectionDefinition))), reason });
    }
}

/** Binds a section that holds the same values on every instance of its page, so a write lands on all of them. */
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

    public setValue(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, value: TValueType): void {
        this.update({ update: section => section.set(fieldDefinition, section.get<FieldModel<TValueType>>(fieldDefinition).setValue(value)) });
    }

    public update({ reason, update }: ISectionUpdateOptions<TSection>): void {
        this.controller.update({
            update: form => {
                const pageDefinition = this.page.pageDefinition;
                let pageCollection = form.get<PageCollection>(pageDefinition);

                for (let index = 0; index < pageCollection.pages.length; index++) {
                    const page = pageCollection.pages[index];
                    pageCollection = pageCollection.replace(index, page.set(this.sectionDefinition, update(page.get<TSection>(this.sectionDefinition))));
                }

                return form.set(pageDefinition, pageCollection);
            },
            reason
        });
    }
}

/** Binds one section within a section collection, by its index, so it can be read and written like any ordinary section. */
class SectionCollectionItemBinding<TSection extends SectionModel> implements ISectionBinding<TSection> {
    constructor(
        private readonly collection: ISectionCollectionBinding<TSection>,
        private readonly index: number,
        readonly sectionDefinition: SectionCollectionDefinition<TSection>) {
    }

    public get(): TSection {
        return this.collection.get().getSections<TSection>()[this.index];
    }

    public setValue(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, value: TValueType): void {
        this.update({ update: section => section.set(fieldDefinition, section.get<FieldModel<TValueType>>(fieldDefinition).setValue(value)) });
    }

    public update({ reason, update }: ISectionUpdateOptions<TSection>): void {
        this.collection.update({ update: collection => collection.replace(this.index, update(collection.getSections<TSection>()[this.index])), reason });
    }
}

class SectionCollectionBinding<TSection extends SectionModel> implements ISectionCollectionBinding<TSection> {
    private readonly items: Map<number, ISectionBinding<TSection>> = new Map<number, ISectionBinding<TSection>>();

    constructor(private readonly page: IPageBinding<PageModel>, readonly sectionDefinition: SectionCollectionDefinition<TSection>) {
    }

    public get(): SectionCollection<TSection> {
        return this.page.get().get<SectionCollection<TSection>>(this.sectionDefinition);
    }

    public getSection(index: number): ISectionBinding<TSection> {
        let binding = this.items.get(index);

        if (!binding) {
            binding = new SectionCollectionItemBinding<TSection>(this, index, this.sectionDefinition);
            this.items.set(index, binding);
        }

        return binding;
    }

    public update({ reason, update }: ISectionCollectionUpdateOptions<TSection>): void {
        this.page.update({ update: page => page.set(this.sectionDefinition, update(page.get<SectionCollection<TSection>>(this.sectionDefinition))), reason });
    }
}

class PageBinding<TPage extends PageModel> implements IPageBinding<TPage> {
    private readonly sections: Map<string, ISectionBinding<any>> = new Map<string, ISectionBinding<any>>();
    private readonly sectionCollections: Map<string, ISectionCollectionBinding<any>> = new Map<string, ISectionCollectionBinding<any>>();

    constructor(
        private readonly controller: IFormController,
        readonly pageDefinition: PageDefinition<TPage>,
        readonly pageId: string) {
    }

    get mode(): FormMode {
        return this.controller.form.mode;
    }

    public get(): TPage {
        const page = this.controller.form.get<PageCollection>(this.pageDefinition).findPageById<TPage>(this.pageId);
        if (!page) {
            throw new Error(`Page ${this.pageId} is no longer part of ${this.pageDefinition.name}.`);
        }

        return page;
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

    public getSectionCollection<TSection extends SectionModel>(sectionDefinition: SectionCollectionDefinition<TSection>): ISectionCollectionBinding<TSection> {
        let binding = this.sectionCollections.get(sectionDefinition.id);

        if (!binding) {
            binding = new SectionCollectionBinding<TSection>(this, sectionDefinition);
            this.sectionCollections.set(sectionDefinition.id, binding);
        }

        return binding;
    }

    public isSectionLocked(sectionDefinition: SectionDefinition): boolean {
        return this.controller.form.isSectionLocked(sectionDefinition);
    }

    public update({ reason, update }: IPageUpdateOptions<TPage>): void {
        this.controller.update({
            update: form => {
                const pageCollection = form.get<PageCollection>(this.pageDefinition);
                const index = pageCollection.indexOfPage(this.pageId);

                // the page can be removed while a handler is still in flight, such as an async drop; dropping the edit is correct
                if (index < 0) {
                    return form;
                }

                return form.set(this.pageDefinition, pageCollection.replace(index, update(pageCollection.pages[index] as TPage)));
            },
            reason
        });
    }
}

@RegisterController(ControllerKey.form)
export class FormController<TForm extends FormModel<any> = FormModel<any>> extends Controller implements IFormController<TForm> {
    private readonly bindings: Map<string, IPageBinding<any>> = new Map<string, IPageBinding<any>>();

    private readonly confirmDeletePage?: ConfirmPageDelete;
    private _form?: TForm;
    private notify?: (args: IFormActivityEventArgs<TForm>) => void;

    get form(): TForm {
        if (!this._form) {
            throw new Error("A form must be loaded before the form controller can be used.");
        }

        return this._form;
    }

    /** Whether a form has been loaded into the controller yet. */
    get isLoaded(): boolean {
        return !!this._form;
    }

    public async addPage(pageDefinition: PageDefinition): Promise<void> {
        // initialize must be awaited, since it is what creates the page's sections and registers its dropzones
        const page = await pageDefinition.createPage(this.form).initialize();
        const pageOrdinal = this.form.get<PageCollection>(pageDefinition).pages.length;

        this.update({
            update: form => form.addPage(copySharedSections(form, pageDefinition, page), pageDefinition),
            reason: { kind: "page-added", page: pageDefinition.name, pageOrdinal }
        });
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

    /**
     * Seeds the controller with the form it drives. The manager calls this straight after creating the controller,
     * when nothing can be listening yet, so it raises nothing; once a form is held a further call does nothing, so
     * re-seeding the same form on every render is harmless. Use `setForm` to replace a form that is already loaded.
     */
    public load(form: TForm): void {
        if (!this._form) {
            this._form = form;
        }
    }

    public async removePage(pageDefinition: PageDefinition, pageId: string): Promise<boolean> {
        const page = this.form.get<PageCollection>(pageDefinition).findPageById(pageId);
        if (!page) {
            return false;
        }

        if (this.confirmDeletePage && !await this.confirmDeletePage(page)) {
            return false;
        }

        // resolved again because the collection may have changed while the confirmation was open
        const pageOrdinal = this.form.get<PageCollection>(pageDefinition).indexOfPage(pageId);

        this.update({
            update: form => pageOrdinal < 0 ? form : form.removePage(pageOrdinal, pageDefinition),
            reason: { kind: "page-removed", page: pageDefinition.name, pageOrdinal }
        });

        this.bindings.delete(this.getBindingKey(pageDefinition, pageId));

        return true;
    }

    public setConfirmDeletePage(confirm: ConfirmPageDelete | undefined): void {
        (<Mutable<ConfirmPageDelete | undefined>>this.confirmDeletePage) = confirm;
    }

    public setForm(form: TForm): void {
        this.update({ update: () => form });
    }

    /** Wired by the manager once, right after this controller is created -- not part of the public interface. */
    public setNotifier(notify: (args: IFormActivityEventArgs<TForm>) => void): void {
        this.notify = notify;
    }

    public update({ reason, update }: IFormUpdateOptions<TForm>): void {
        const current = this.form;
        const form = update(current);

        // the models are immutable, so an update that changed nothing returns the same instance and need not be published
        if (form === current) {
            return;
        }

        this._form = form;

        if (reason) {
            this.notify?.({ activity: reason, form });
        }

        this.emitChanged();
    }

    public dispose(): void {
        this.bindings.clear();
        (<Mutable<ConfirmPageDelete | undefined>>this.confirmDeletePage) = undefined;
    }

    private getBindingKey(pageDefinition: PageDefinition<PageModel>, pageId: string): string {
        return `${pageDefinition.id}:${pageId}`;
    }
}
