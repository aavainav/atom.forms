import React from "react";
import { IControllerManager, IPageBinding } from "@forms/core";

import { NarrativePageModel } from "../../models/narrative-page/narrative-page";

import { NarrativeHeaderSection } from "./narrative-header-section";
import { NarrativeSection } from "./narrative-section";
import { DiagramSection } from "./diagram-section";
import { AdditionalPassengersSection } from "./additional-passengers-section";
import { NarrativeOfficerSection } from "./narrative-officer-section";

interface INarrativePageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<NarrativePageModel>;
}

/** Defines the narrative page of the TR-310, carrying the officer's account, the diagram, and the passengers that did not fit on a person page. */
export default function NarrativePage({ controllers, binding }: INarrativePageProps): React.JSX.Element {
    const page = binding.get();

    return (
        <>
            <NarrativeHeaderSection binding={binding.getSection(page.narrativeHeaderSection)} />
            <NarrativeSection binding={binding.getSection(page.narrativeSection)} />
            <DiagramSection binding={binding.getSection(page.diagramSection)} />
            <AdditionalPassengersSection binding={binding.getSection(page.additionalPassengersSection)} />
            <NarrativeOfficerSection binding={binding.getSection(page.narrativeOfficerSection)} />
        </>
    );
}
