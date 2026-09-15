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

    public readonly consentRequestedYes: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesConsentRequestedYes;
    public readonly consentRequestedNo: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesConsentRequestedNo;
    public readonly consentGivenYes: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesConsentGivenYes;
    public readonly consentGivenNo: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesConsentGivenNo;

    public readonly madeByConsent: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesMadeByConsent;
    public readonly incidentToArrest: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesIncidentToArrest;
    public readonly inventoryVehicleTowed: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesInventoryVehicleTowed;
    public readonly probableCause: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesProbableCause;
    public readonly basisOther: FieldDefinition<BooleanFieldModel> = this.schema.searchesFields.searchesBasisOther;
    public readonly basisOtherSpecify: FieldDefinition<StringFieldModel> = this.schema.searchesFields.searchesBasisOtherSpecify;

    private readonly consentRequestedFields: FieldDefinition<BooleanFieldModel>[] = [this.consentRequestedYes, this.consentRequestedNo];
    private readonly consentGivenFields: FieldDefinition<BooleanFieldModel>[] = [this.consentGivenYes, this.consentGivenNo];

    public getOfDriver(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.ofDriver); }
    public getOfPedestrian(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.ofPedestrian); }
    public getOfVehicle(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.ofVehicle); }
    public getOfPassenger(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.ofPassenger); }

    public getConsentRequestedYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.consentRequestedYes); }
    public getConsentRequestedNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.consentRequestedNo); }
    public getConsentGivenYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.consentGivenYes); }
    public getConsentGivenNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.consentGivenNo); }

    public getMadeByConsent(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.madeByConsent); }
    public getIncidentToArrest(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.incidentToArrest); }
    public getInventoryVehicleTowed(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.inventoryVehicleTowed); }
    public getProbableCause(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.probableCause); }
    public getBasisOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.basisOther); }
    public getBasisOtherSpecify(): StringFieldModel { return this.get<StringFieldModel>(this.basisOtherSpecify); }

    /** Selects Yes/No for "Consent Search Requested", unchecking the other option - true radio behavior. */
    public selectConsentRequested(selected: FieldDefinition<BooleanFieldModel>): this {
        return this.consentRequestedFields.reduce(
            (section, fieldDefinition) => section.set(fieldDefinition, section.get<BooleanFieldModel>(fieldDefinition).setValue(fieldDefinition === selected)),
            this as this
        );
    }

    /** Selects Yes/No for "Consent Given", unchecking the other option - true radio behavior. */
    public selectConsentGiven(selected: FieldDefinition<BooleanFieldModel>): this {
        return this.consentGivenFields.reduce(
            (section, fieldDefinition) => section.set(fieldDefinition, section.get<BooleanFieldModel>(fieldDefinition).setValue(fieldDefinition === selected)),
            this as this
        );
    }
}
