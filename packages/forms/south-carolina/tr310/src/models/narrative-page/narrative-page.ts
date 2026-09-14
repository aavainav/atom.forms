import { PageModel, SectionDefinition } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";
import { NarrativeHeaderSectionModel } from "./narrative-header-section";
import { NarrativeSectionModel } from "./narrative-section";
import { DiagramSectionModel } from "./diagram-section";
import { AdditionalPassengersSectionModel } from "./additional-passengers-section";
import { NarrativeOfficerSectionModel } from "./narrative-officer-section";

export interface INarrativePage {
}

export interface INarrativePageModel extends INarrativePage {
}

/** Represents the narrative page of the TR-310, carrying the officer's account of the collision, the diagram, and the passengers that did not fit on a person page. */
export class NarrativePageModel extends PageModel implements INarrativePageModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly narrativeHeaderSection: SectionDefinition<NarrativeHeaderSectionModel> = this.formSchema.narrativeHeaderSection;
    public readonly narrativeSection: SectionDefinition<NarrativeSectionModel> = this.formSchema.narrativeSection;
    public readonly diagramSection: SectionDefinition<DiagramSectionModel> = this.formSchema.diagramSection;
    public readonly additionalPassengersSection: SectionDefinition<AdditionalPassengersSectionModel> = this.formSchema.additionalPassengersSection;
    public readonly narrativeOfficerSection: SectionDefinition<NarrativeOfficerSectionModel> = this.formSchema.narrativeOfficerSection;

    public getNarrativeHeaderSection(): NarrativeHeaderSectionModel { return this.get<NarrativeHeaderSectionModel>(this.narrativeHeaderSection); }
    public getNarrativeSection(): NarrativeSectionModel { return this.get<NarrativeSectionModel>(this.narrativeSection); }
    public getDiagramSection(): DiagramSectionModel { return this.get<DiagramSectionModel>(this.diagramSection); }
    public getAdditionalPassengersSection(): AdditionalPassengersSectionModel { return this.get<AdditionalPassengersSectionModel>(this.additionalPassengersSection); }
    public getNarrativeOfficerSection(): NarrativeOfficerSectionModel { return this.get<NarrativeOfficerSectionModel>(this.narrativeOfficerSection); }
}
