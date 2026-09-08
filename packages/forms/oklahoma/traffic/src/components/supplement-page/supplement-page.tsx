import React from "react";
import { IControllerManager, IPageBinding, FLabel } from "@forms/core";

import { SupplementPageModel } from "../../models/supplement-page/supplement-page";

import { NotesSection } from "./notes-section";
import { RegisteredOwnerSection } from "./registered-owner-section";
import { StatusSection } from "./status-section";
import { WitnessSection } from "./witness-section";

interface ISupplementPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<SupplementPageModel>;
}

/** Defines the supplement page of the Oklahoma City traffic citation form. */
export default function SupplementPage({ controllers, binding }: ISupplementPageProps): React.JSX.Element {
    const valueListController = controllers.getValueListController();
    const supplementPage = binding.get();

    return (
        <>
            <div className="text-center mb-3">
                <FLabel fontSize="5" textAlignment="center">Citation Number</FLabel>
            </div>

            <WitnessSection binding={binding.getSection(supplementPage.witnessSection)} valueListController={valueListController} />
            <RegisteredOwnerSection binding={binding.getSection(supplementPage.registeredOwnerSection)} valueListController={valueListController} />
            <StatusSection binding={binding.getSection(supplementPage.statusSection)} valueListController={valueListController} />
            <NotesSection binding={binding.getSection(supplementPage.notesSection)} />
        </>
    );
}
