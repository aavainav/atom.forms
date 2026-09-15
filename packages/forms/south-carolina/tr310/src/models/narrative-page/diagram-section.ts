import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IDiagramSection extends ISection {
}

export interface IDiagramSectionModel extends IDiagramSection {
}

/** Represents the model for the collision diagram. The diagram is held as its serialized content rather than as a drawing surface, so the form carries whatever the host's diagram editor produced. */
export class DiagramSectionModel extends SectionModel implements IDiagramSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(DiagramSectionModel);

    public readonly content: FieldDefinition<StringFieldModel> = this.schema.diagramFields.diagramContent;

    public getContent(): StringFieldModel { return this.get<StringFieldModel>(this.content); }
}
