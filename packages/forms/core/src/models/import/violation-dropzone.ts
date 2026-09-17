import { DraggableItemType } from "./draggable-item";
import { IDropzone, Dropzone } from "./dropzone";
import { DropzoneHelper } from "./dropzone-helper";
import { IImportableViolation } from "./importable-violation";

import { BooleanFieldModel } from "./../boolean-field";
import { NumberFieldModel } from "../number-field";
import { StringFieldModel } from "../string-field";
import { PageModel } from "../page";
import { SectionModel } from "../section";

export enum ViolationDropzoneFields {
    code = "code",
    description = "description",
    statute = "statute",
    fine = "fine",
    points = "points",
    isLocalOrdinance = "is_local_ordinance",
    requiresCourtAppearance = "requires_court_appearance",
}

/** Defines a dropzone for handling importable violation data. */
export interface IViolationDropzone extends IDropzone<IImportableViolation> {
}

/**
 * Dropzone for importable violation data. A citation names the charge differently on every form -- on the
 * Oklahoma forms, across two sections, one carrying the money -- so a form registers this with only the fields
 * it prints; a dropzone ignores a key it holds no field for.
 */
export class ViolationDropzone extends Dropzone<IImportableViolation> implements IViolationDropzone {
    readonly type: DraggableItemType = "violation";

    constructor(
        page: PageModel,
        section: SectionModel,
        code?: StringFieldModel,
        description?: StringFieldModel,
        statute?: StringFieldModel,
        fine?: NumberFieldModel,
        points?: NumberFieldModel,
        isLocalOrdinance?: BooleanFieldModel,
        requiresCourtAppearance?: BooleanFieldModel,
        ) {
        super(
            page,
            section,
            {
                [ViolationDropzoneFields.code]: code,
                [ViolationDropzoneFields.description]: description,
                [ViolationDropzoneFields.statute]: statute,
                [ViolationDropzoneFields.fine]: fine,
                [ViolationDropzoneFields.points]: points,
                [ViolationDropzoneFields.isLocalOrdinance]: isLocalOrdinance,
                [ViolationDropzoneFields.requiresCourtAppearance]: requiresCourtAppearance,
            }
        );
    }

    public onDrop(data: IImportableViolation): this {
        if (!data) {
            return this;
        }

        let dropzone = this.clearFields();

        dropzone = DropzoneHelper.setValue(dropzone, ViolationDropzoneFields.code, data.code);
        dropzone = DropzoneHelper.setValue(dropzone, ViolationDropzoneFields.description, data.description);
        dropzone = DropzoneHelper.setValue(dropzone, ViolationDropzoneFields.statute, data.statute);
        dropzone = DropzoneHelper.setValue(dropzone, ViolationDropzoneFields.fine, data.fine);
        dropzone = DropzoneHelper.setValue(dropzone, ViolationDropzoneFields.points, data.points);
        dropzone = DropzoneHelper.setValue(dropzone, ViolationDropzoneFields.isLocalOrdinance, data.isLocalOrdinance);
        dropzone = DropzoneHelper.setValue(dropzone, ViolationDropzoneFields.requiresCourtAppearance, data.requiresCourtAppearance);

        return dropzone;
    }
}
