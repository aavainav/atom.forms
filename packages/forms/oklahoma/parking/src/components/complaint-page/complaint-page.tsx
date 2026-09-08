import React from "react";
import { IPageBinding } from "@forms/core";

import { ComplaintPageModel } from "../../models/complaint-page/complaint-page";

import { CertificationSection } from "./certification-section";
import { ComplaintSection } from "./complaint-section";
import { WarrantSection } from "./warrant-section";

interface IComplaintPageProps {
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<ComplaintPageModel>;
}

/** Defines the complaint page of the Oklahoma City parking violation form. */
export default function ComplaintPage({ binding }: IComplaintPageProps): React.JSX.Element {
    const complaintPage = binding.get();

    return (
        <>
            <ComplaintSection binding={binding.getSection(complaintPage.complaintSection)} />
            <CertificationSection binding={binding.getSection(complaintPage.certificationSection)} />
            <WarrantSection binding={binding.getSection(complaintPage.warrantSection)} />
        </>
    );
}
