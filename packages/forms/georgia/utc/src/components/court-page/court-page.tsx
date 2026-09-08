import React from "react";
import { IPageBinding } from "@forms/core";

import { CourtPageModel } from "../../models/court-page/court-page";

import { CourtActionSection } from "./court-action-section";
import { DispositionSection } from "./disposition-section";
import { JudgmentSection } from "./judgment-section";
import { PleaSection } from "./plea-section";

interface ICourtPageProps {
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<CourtPageModel>;
}

/**
 * Defines the court page of the Georgia uniform traffic citation - the reverse of the court's copy.
 *
 * It takes no controllers: nothing here is imported from a person or vehicle record, and none of its boxes is
 * backed by a value list.
 */
export default function CourtPage({ binding }: ICourtPageProps): React.JSX.Element {
    const courtPage = binding.get();

    return (
        <>
            <CourtActionSection binding={binding.getSection(courtPage.courtActionSection)} />
            <div className="text-center fw-bold mt-4">FOR CLERK'S USE ONLY</div>
            <PleaSection binding={binding.getSection(courtPage.pleaSection)} />
            <DispositionSection binding={binding.getSection(courtPage.dispositionSection)} />
            <JudgmentSection binding={binding.getSection(courtPage.judgmentSection)} />
        </>
    );
}
