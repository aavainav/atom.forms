import { IDraggableItem } from "./draggable-item";
import { Dropzone, IDropzone } from "./dropzone";
import { FieldModel, IOptionValue, TValueType } from "../field";
import { PageModel } from "../page";
import { IImportablePerson, schema as importablePersonSchema } from "./importable-person";
import { IImportableVehicle, schema as importableVehicleSchema } from "./importable-vehicle";
import { IImportableViolation, schema as importableViolationSchema } from "./importable-violation";

/** Marker interface implemented by the dropzone helper. */
export interface IDropzoneHelper {
}

/** Whether a value is an option box's pair, named by its description. */
function isOptionValue(value: TValueType): value is IOptionValue {
    return typeof value === "object" && value !== null && !Array.isArray(value) && "description" in value;
}

export class DropzoneHelper implements IDropzoneHelper {
    public static cleanFieldRecord<TField extends FieldModel<TValueType>>(fields: Record<string, TField | undefined>): Record<string, TField | undefined> {
        return Object.fromEntries(Object.entries(fields).filter(([, field]) => field !== undefined));
    }

    /** Joins the given fields' answers into a name for the record they hold, an option box by its description. Undefined when none is answered. */
    public static describe(fields: Record<string, FieldModel<TValueType> | undefined>, keys: ReadonlyArray<string>): string | undefined {
        const text = keys
            .map(key => fields[key])
            .filter((field): field is FieldModel<TValueType> => !!field && !field.getIsEmpty())
            .map(field => {
                const value = field.getValue();
                return isOptionValue(value) ? value.description : String(value);
            })
            .join(" ");

        return text || undefined;
    }

    /** The dropzone's own data type is irrelevant here -- only its fields are touched -- so it is left open rather than held to the types the default union happens to name. */
    public static setValue<TDropzone extends Dropzone<any>>(dropzone: TDropzone, key: string, value: TValueType | undefined): TDropzone {
        const field = dropzone.fields[key];
        if (!field || value === undefined) {
            return dropzone;
        }

        return dropzone.setFields({ ...dropzone.fields, [key]: field.setValue(value) });
    }

    public static validateDropzones(currentDropzone: IDropzone, page: PageModel): PageModel {
        let updatedPage = page;

        page.getDropzones().forEach((dropzone) => {
            if (dropzone.type === currentDropzone.type) {
                updatedPage = updatedPage.setDropzone(dropzone.setIsValid(true));
            }
        });

        return updatedPage;
    }

    public static isValidType<TData = IImportablePerson | IImportableVehicle | IImportableViolation>(data: IDraggableItem<TData>): boolean {
        if (data.type === "person") {
            return importablePersonSchema.safeParse(data.data).success;
        }

        if (data.type === "vehicle") {
            return importableVehicleSchema.safeParse(data.data).success;
        }

        if (data.type === "violation") {
            return importableViolationSchema.safeParse(data.data).success;
        }

        return false;
    }
}
