import { FieldModel, FieldModelConstructor, TValueType } from "./field";
import { FieldDefinition } from "./field-definition";
import { FormDefinition } from "./form-definition";
import { FormModel, FormModelConstructor } from "./form";
import { PageDefinition } from "./page-definition";
import { PageModel, PageModelConstructor } from "./page";
import type { ISchema } from "./schema";
import { ISectionDefinitionOptions, SectionDefinition } from "./section-definition";
import { SectionModel, SectionModelConstructor } from "./section";

/** Describes a single field to be created by `defineFields`. */
export interface FieldDescriptor<TField extends FieldModel<TValueType> = FieldModel<any>> {
    /** The labe for the field. */
    readonly label: string;
    /** The constructor used to construct a new field instance. */
    readonly ctor: FieldModelConstructor<TField>;
    /** Overrides the field's wire name when it can't be mechanically derived from the spec's key. */
    readonly name?: string;
}

type FieldDefinitionsOf<TSpecs extends Record<string, FieldDescriptor>> = {
    [K in keyof TSpecs]: TSpecs[K] extends FieldDescriptor<infer TField> ? FieldDefinition<TField> : never;
};

function camelToKebab(value: string): string {
    return value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

/** Centralizes construction of the Form/Page/Section definition tree. */
export class DefinitionFactory {
    static form<TForm extends FormModel<any>>(name: string, ctor: FormModelConstructor<TForm>, schema: ISchema): FormDefinition<TForm> {
        return new FormDefinition<TForm>(name, ctor, schema);
    }

    static page<TPage extends PageModel>(name: string, form: FormDefinition<FormModel<any>>, ctor: PageModelConstructor<TPage>): PageDefinition<TPage> {
        return new PageDefinition<TPage>(name, form, ctor);
    }

    static section<TSection extends SectionModel>(name: string, page: PageDefinition<PageModel>, ctor: SectionModelConstructor<TSection>, options?: ISectionDefinitionOptions): SectionDefinition<TSection> {
        return new SectionDefinition<TSection>(name, page, ctor, options);
    }
}

/** Declares a group of fields on a section in one call, keyed by property name. */
export function defineFields<TSpecs extends Record<string, FieldDescriptor>>(section: SectionDefinition<SectionModel>, specs: TSpecs): FieldDefinitionsOf<TSpecs> {
    const result = {} as FieldDefinitionsOf<TSpecs>;

    for (const key of Object.keys(specs) as (keyof TSpecs & string)[]) {
        const spec = specs[key];
        const name = spec.name ?? camelToKebab(key);
        (result as Record<string, FieldDefinition<FieldModel<TValueType>>>)[key] = new FieldDefinition(name, spec.label, section, spec.ctor);
    }

    return result;
}
