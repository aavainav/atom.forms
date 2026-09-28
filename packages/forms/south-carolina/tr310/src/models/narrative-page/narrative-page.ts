import { FormModel, PageModel, SectionCollection, SectionCollectionDefinition, SectionDefinition } from "@forms/core";
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
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(NarrativePageModel);

    public readonly narrativeHeaderSection: SectionDefinition<NarrativeHeaderSectionModel> = this.schema.narrativeHeaderSection;
    public readonly narrativeSection: SectionDefinition<NarrativeSectionModel> = this.schema.narrativeSection;
    public readonly diagramSection: SectionDefinition<DiagramSectionModel> = this.schema.diagramSection;
    public readonly additionalPassengersSection: SectionCollectionDefinition<AdditionalPassengersSectionModel> = this.schema.additionalPassengersSection;
    public readonly narrativeOfficerSection: SectionDefinition<NarrativeOfficerSectionModel> = this.schema.narrativeOfficerSection;

    public getNarrativeHeaderSection(): NarrativeHeaderSectionModel { return this.get<NarrativeHeaderSectionModel>(this.narrativeHeaderSection); }
    public getNarrativeSection(): NarrativeSectionModel { return this.get<NarrativeSectionModel>(this.narrativeSection); }
    public getDiagramSection(): DiagramSectionModel { return this.get<DiagramSectionModel>(this.diagramSection); }
    public getAdditionalPassengersSection(): SectionCollection<AdditionalPassengersSectionModel> { return this.get<SectionCollection<AdditionalPassengersSectionModel>>(this.additionalPassengersSection); }
    public getNarrativeOfficerSection(): NarrativeOfficerSectionModel { return this.get<NarrativeOfficerSectionModel>(this.narrativeOfficerSection); }
}
