import React from "react";
import { IPageBinding } from "@forms/core";

import { WarrantPageModel } from "../../models/warrant-page/warrant-page";

import { CertificationSection } from "./certification-section";
import { ComplaintSection } from "./complaint-section";
import { WarrantSection } from "./warrant-section";

interface IWarrantPageProps {
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<WarrantPageModel>;
}

/** Defines the warrant page of the Oklahoma City traffic citation form. */
export default function WarrantPage({ binding }: IWarrantPageProps): React.JSX.Element {
    const warrantPage = binding.get();

    return (
        <>
            <ComplaintSection binding={binding.getSection(warrantPage.complaintSection)} />
            <CertificationSection binding={binding.getSection(warrantPage.certificationSection)} />
            <WarrantSection binding={binding.getSection(warrantPage.warrantSection)} />
        </>
    );
}
