import { ISection, BooleanFieldModel, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";

export interface ISearchesSection extends ISection {
}

export interface ISearchesSectionModel extends ISearchesSection {
}

/** Represents the model for the "Searches" section of the public contact/warning record. */
export class SearchesSectionModel extends SectionModel implements ISearchesSectionModel {
    private schema: PublicContactOrWarningFormSchema = FormModel.getSchema<PublicContactOrWarningFormSchema>(SearchesSectionModel);

    public readonly ofDriver: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesOfDriver;
    public readonly ofPedestrian: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesOfPedestrian;
    public readonly ofVehicle: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesOfVehicle;
    public readonly ofPassenger: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesOfPassenger;

    public readonly consentSearchRequested: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesConsentSearchRequested;
    public readonly consentSearchRequestedYes: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesConsentSearchRequestedYes;
    public readonly consentSearchRequestedNo: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesConsentSearchRequestedNo;
    public readonly consentGiven: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesConsentGiven;
    public readonly consentGivenYes: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesConsentGivenYes;
    public readonly consentGivenNo: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesConsentGivenNo;

    public readonly madeByConsent: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesMadeByConsent;
    public readonly incidentToArrest: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesIncidentToArrest;
    public readonly inventoryVehicleTowed: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesInventoryVehicleTowed;
    public readonly probableCause: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesProbableCause;
    public readonly basisOther: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesBasisOther;
    public readonly basisOtherSpecify: FieldDefinition<StringFieldModel> = this.schema.searchesFields.searchesBasisOtherSpecify;

    private readonly consentRequestedFields: FieldDefinition<BooleanFieldModel>[] = [this.consentSearchRequestedYes, this.consentSearchRequestedNo];
    private readonly consentGivenFields: FieldDefinition<BooleanFieldModel>[] = [this.consentGivenYes, this.consentGivenNo];

    public getOfDriver(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.ofDriver); }
    public getOfPedestrian(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.ofPedestrian); }
    public getOfVehicle(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.ofVehicle); }
    public getOfPassenger(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.ofPassenger); }

    public getConsentSearchRequested(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.consentSearchRequested); }
    public getConsentSearchRequestedYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.consentSearchRequestedYes); }
    public getConsentSearchRequestedNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.consentSearchRequestedNo); }
    public getConsentGiven(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.consentGiven); }
    public getConsentGivenYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.consentGivenYes); }
    public getConsentGivenNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.consentGivenNo); }

    public getMadeByConsent(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.madeByConsent); }
    public getIncidentToArrest(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.incidentToArrest); }
    public getInventoryVehicleTowed(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.inventoryVehicleTowed); }
    public getProbableCause(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.probableCause); }
    public getBasisOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.basisOther); }
    public getBasisOtherSpecify(): StringFieldModel { return this.get<StringFieldModel>(this.basisOtherSpecify); }

    public selectConsentRequested(selected: FieldDefinition<BooleanFieldModel>): this {
        return this.consentRequestedFields.reduce(
            (section, fieldDefinition) => section.set(fieldDefinition, section.get<BooleanFieldModel>(fieldDefinition).setValue(fieldDefinition === selected)),
            this as this
        );
    }

    public selectConsentGiven(selected: FieldDefinition<BooleanFieldModel>): this {
        return this.consentGivenFields.reduce(
            (section, fieldDefinition) => section.set(fieldDefinition, section.get<BooleanFieldModel>(fieldDefinition).setValue(fieldDefinition === selected)),
            this as this
        );
    }

    public setConsentSearchRequested(checked: boolean): this {
        return this.setGate(this.consentSearchRequested, this.consentRequestedFields, checked);
    }

    public setConsentGiven(checked: boolean): this {
        return this.setGate(this.consentGiven, this.consentGivenFields, checked);
    }

    /** Sets a checkbox and disables+clears the dependents that only mean something while it is checked. */
    private setGate(gate: FieldDefinition<BooleanFieldModel>, dependents: ReadonlyArray<FieldDefinition<BooleanFieldModel>>, checked: boolean): this {
        const updated = this.set(gate, this.get<BooleanFieldModel>(gate).setValue(checked));

        return dependents.reduce(
            (section, fieldDefinition) => section.set(fieldDefinition,
                checked
                    ? section.get<BooleanFieldModel>(fieldDefinition).setIsEnabled(true)
                    : section.get<BooleanFieldModel>(fieldDefinition).setValue(false).setIsEnabled(false)),
            updated as this
        );
    }
}
