import { DraggableItemType } from "./draggable-item";
import { IDropzone, Dropzone } from "./dropzone";
import { DropzoneHelper } from "./dropzone-helper";
import { IImportablePerson } from "./importable-person";
import { StringFieldModel } from "../string-field";
import { PageModel } from "../page";
import { SectionModel } from "../section";

export enum PersonDropzoneFields {
    firstName = "first_name",
    middleName = "middle_name",
    lastName = "last_name",
    address = "address",
    city = "city",
    state = "state",
    zipCode = "zip_code",
}

/** Defines a dropzone for handling importable person data. */
export interface IPersonDropzone extends IDropzone<IImportablePerson> {
}

/** Represents a dropzone for handling importable person data. */
export class PersonDropzone extends Dropzone<IImportablePerson> implements IPersonDropzone {
    readonly type: DraggableItemType = "person";

    constructor(
        page: PageModel,
        section: SectionModel,
        firstName: StringFieldModel,
        middleName?: StringFieldModel,
        lastName?: StringFieldModel,
        address?: StringFieldModel,
        city?: StringFieldModel,
        state?: StringFieldModel,
        zipCode?: StringFieldModel,
        ) {
        super(
            page,
            section,
            {
                [PersonDropzoneFields.firstName]: firstName,
                [PersonDropzoneFields.lastName]: lastName,
                [PersonDropzoneFields.middleName]: middleName,
                [PersonDropzoneFields.address]: address,
                [PersonDropzoneFields.city]: city,
                [PersonDropzoneFields.state]: state,
                [PersonDropzoneFields.zipCode]: zipCode,
            }
        );
    }

    public onDrop(data: IImportablePerson): this {
        if (!data) {
            return this;
        }

        let dropzone = this.clearFields();

        dropzone = DropzoneHelper.setValue(dropzone, PersonDropzoneFields.firstName, data.firstName);
        dropzone = DropzoneHelper.setValue(dropzone, PersonDropzoneFields.middleName, data.middleName);
        dropzone = DropzoneHelper.setValue(dropzone, PersonDropzoneFields.lastName, data.lastName);
        dropzone = DropzoneHelper.setValue(dropzone, PersonDropzoneFields.address, data.address);
        dropzone = DropzoneHelper.setValue(dropzone, PersonDropzoneFields.city, data.city);
        dropzone = DropzoneHelper.setValue(dropzone, PersonDropzoneFields.state, data.state);
        dropzone = DropzoneHelper.setValue(dropzone, PersonDropzoneFields.zipCode, data.zipCode);

        return dropzone;
    }
}
