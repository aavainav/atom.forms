import { ISection, BooleanFieldModel, FieldDefinition, FormModel, SectionModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { selectExclusive } from "../exclusive-group";

export interface IStatusSection extends ISection {
}

export interface IStatusSectionModel extends IStatusSection {
}

/**
 * Represents the model for the CDL, accident, injuries and fatalities row of Section I.
 *
 * Each of the four is a printed YES/NO pair, so each is held as two boolean fields and moved through its own
 * `select*` method - a pair answering one question can never hold both boxes, and leaving both clear is how the
 * form records a question the officer did not answer.
 */
export class StatusSectionModel extends SectionModel implements IStatusSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormSchema);

    public readonly cdlYes: FieldDefinition<BooleanFieldModel> = this.schema.statusFields.statusCdlYes;
    public readonly cdlNo: FieldDefinition<BooleanFieldModel> = this.schema.statusFields.statusCdlNo;
    public readonly accidentYes: FieldDefinition<BooleanFieldModel> = this.schema.statusFields.statusAccidentYes;
    public readonly accidentNo: FieldDefinition<BooleanFieldModel> = this.schema.statusFields.statusAccidentNo;
    public readonly injuriesYes: FieldDefinition<BooleanFieldModel> = this.schema.statusFields.statusInjuriesYes;
    public readonly injuriesNo: FieldDefinition<BooleanFieldModel> = this.schema.statusFields.statusInjuriesNo;
    public readonly fatalitiesYes: FieldDefinition<BooleanFieldModel> = this.schema.statusFields.statusFatalitiesYes;
    public readonly fatalitiesNo: FieldDefinition<BooleanFieldModel> = this.schema.statusFields.statusFatalitiesNo;

    /** The accident YES/NO pair. */
    public readonly accident: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.accidentYes, this.accidentNo];
    /** The commercial driver's licence YES/NO pair. */
    public readonly cdl: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.cdlYes, this.cdlNo];
    /** The fatalities YES/NO pair. */
    public readonly fatalities: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.fatalitiesYes, this.fatalitiesNo];
    /** The injuries YES/NO pair. */
    public readonly injuries: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.injuriesYes, this.injuriesNo];

    public getAccidentNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.accidentNo); }
    public getAccidentYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.accidentYes); }
    public getCdlNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.cdlNo); }
    public getCdlYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.cdlYes); }
    public getFatalitiesNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.fatalitiesNo); }
    public getFatalitiesYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.fatalitiesYes); }
    public getInjuriesNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.injuriesNo); }
    public getInjuriesYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.injuriesYes); }

    /** Returns a section with the given half of the accident pair checked and the other cleared. */
    public selectAccident(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.accident, selected);
    }

    /** Returns a section with the given half of the CDL pair checked and the other cleared. */
    public selectCdl(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.cdl, selected);
    }

    /** Returns a section with the given half of the fatalities pair checked and the other cleared. */
    public selectFatalities(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.fatalities, selected);
    }

    /** Returns a section with the given half of the injuries pair checked and the other cleared. */
    public selectInjuries(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.injuries, selected);
    }
}
