import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IDiagramSection extends ISection {
}

export interface IDiagramSectionModel extends IDiagramSection {
}

/** Represents the model for the collision diagram. The diagram is held as its serialized content rather than as a drawing surface, so the form carries whatever the host's diagram editor produced. */
export class DiagramSectionModel extends SectionModel implements IDiagramSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly content: FieldDefinition<StringFieldModel> = this.formSchema.diagramFields.diagramContent;

    public getContent(): StringFieldModel { return this.get<StringFieldModel>(this.content); }
}
