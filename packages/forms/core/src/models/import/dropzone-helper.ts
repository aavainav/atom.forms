import { IDraggableItem } from "./draggable-item";
import { Dropzone, IDropzone } from "./dropzone";
import { FieldModel, TValueType } from "../field";
import { PageModel } from "../page";
import { IImportablePerson, schema as importablePersonSchema } from "./importable-person";
import { IImportableVehicle, schema as importableVehicleSchema } from "./importable-vehicle";

/** Marker interface implemented by the dropzone helper. */
export interface IDropzoneHelper {
}

export class DropzoneHelper implements IDropzoneHelper {
    public static cleanFieldRecord<TField extends FieldModel<TValueType>>(fields: Record<string, TField | undefined>): Record<string, TField | undefined> {
        return Object.fromEntries(Object.entries(fields).filter(([, field]) => field !== undefined));
    }

    public static setValue<TDropzone extends Dropzone>(dropzone: TDropzone, key: string, value: TValueType | undefined): TDropzone {
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

    public static isValidType<TData = IImportablePerson | IImportableVehicle>(data: IDraggableItem<TData>): boolean {
        if (data.type === "person") {
            return importablePersonSchema.safeParse(data.data).success;
        }

        if (data.type === "vehicle") {
            return importableVehicleSchema.safeParse(data.data).success;
        }

        return false;
    }
}
