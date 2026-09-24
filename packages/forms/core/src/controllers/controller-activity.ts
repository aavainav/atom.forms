import { FormModel } from "../models/form";
import { DraggableItemType } from "../models/import/draggable-item";

/** Every kind of activity a controller reports on its own, and what each carries. A package adds its own kinds by declaration merging. */
export interface IControllerActivityMap {
    /** A different page came into view. `page` is the page definition's name and `pageOrdinal` which of its pages, counting from zero. */
    "page-focused": { readonly page: string; readonly pageOrdinal: number };
}

/** Every kind of activity that comes with a change to the form, and what each carries. A package adds its own kinds by declaration merging. */
export interface IFormActivityMap {
    /** A drag-and-drop populated fields. */
    "dropped": { readonly type: DraggableItemType };
    /** A page was added to a set of pages. `page` is the page definition's name and `pageOrdinal` where the new page sits, counting from zero. */
    "page-added": { readonly page: string; readonly pageOrdinal: number };
    /** A page was removed. `pageOrdinal` is where it sat, counting from zero. */
    "page-removed": { readonly page: string; readonly pageOrdinal: number };
}

/** Something a controller reports: a kind, and what that kind carries. */
export type ControllerActivity = { [K in keyof IControllerActivityMap]: { readonly kind: K } & IControllerActivityMap[K] }[keyof IControllerActivityMap];

/** Something that came with a change to the form: a kind, and what that kind carries. */
export type FormActivity = { [K in keyof IFormActivityMap]: { readonly kind: K } & IFormActivityMap[K] }[keyof IFormActivityMap];

/** An activity that came with a change to the form, and the form it produced. */
export interface IFormActivityEventArgs<TForm extends FormModel<any> = FormModel<any>> {
    /** What the change was. */
    readonly activity: FormActivity;
    /** The form the change produced. */
    readonly form: TForm;
}

/** What the manager relays: an activity, with the form it produced when it came with a change to one. */
export type ActivityEventArgs = { readonly activity: ControllerActivity } | IFormActivityEventArgs;
