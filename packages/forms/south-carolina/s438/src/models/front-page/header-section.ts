import { ISection, SectionModel } from "@forms/core";

export interface IHeaderSection extends ISection {
}

export interface IHeaderSectionModel extends IHeaderSection {
}

/** Represents the model for the header section of the s438 form's front page. */
export class HeaderSectionModel extends SectionModel implements IHeaderSectionModel {
}