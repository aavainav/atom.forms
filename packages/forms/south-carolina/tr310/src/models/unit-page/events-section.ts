import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IEventsSection extends ISection {
}

export interface IEventsSectionModel extends IEventsSection {
}

/** Represents the model for the unit's most harmful event and the up to four events in the sequence, all drawn from the same list. */
export class EventsSectionModel extends SectionModel implements IEventsSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly mostHarmful: FieldDefinition<OptionFieldModel> = this.schema.eventsFields.eventsMostHarmful;
    public readonly sequenceFirst: FieldDefinition<OptionFieldModel> = this.schema.eventsFields.eventsSequenceFirst;
    public readonly sequenceSecond: FieldDefinition<OptionFieldModel> = this.schema.eventsFields.eventsSequenceSecond;
    public readonly sequenceThird: FieldDefinition<OptionFieldModel> = this.schema.eventsFields.eventsSequenceThird;
    public readonly sequenceFourth: FieldDefinition<OptionFieldModel> = this.schema.eventsFields.eventsSequenceFourth;

    public getMostHarmful(): OptionFieldModel { return this.get<OptionFieldModel>(this.mostHarmful); }
    public getSequenceFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.sequenceFirst); }
    public getSequenceSecond(): OptionFieldModel { return this.get<OptionFieldModel>(this.sequenceSecond); }
    public getSequenceThird(): OptionFieldModel { return this.get<OptionFieldModel>(this.sequenceThird); }
    public getSequenceFourth(): OptionFieldModel { return this.get<OptionFieldModel>(this.sequenceFourth); }
}
