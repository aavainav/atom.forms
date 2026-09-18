import React from "react";
import { useForm, IControllerManager, FForm, FPageCollection } from "@forms/core";

import { GAUTCFormModel } from "../models/utc-form";
import CitationPage from "./citation-page/citation-page";
import CourtPage from "./court-page/court-page";

interface IGAUTCFormProps {
    /** The controllers belonging to this form. The form controller owns the form model. */
    readonly controllers: IControllerManager;
    /** An indicator whether the report should be rendered read only. */
    readonly isReadOnly: boolean;
}

/** The Georgia uniform traffic citation, summons, and accusation. Both page groups render as one continuous tab strip in print order -- citation face, then the court copy's reverse -- each holding a single page, so add/delete affordances never come into play. */
export default function GAUTCForm({ controllers, isReadOnly }: IGAUTCFormProps): React.JSX.Element {
    const controller = controllers.getFormController<GAUTCFormModel>();
    const form = useForm(controller);

    return (
        <FForm form={form}>
            <FPageCollection
                controllers={controllers}
                isReadOnly={isReadOnly}
                groups={[
                    {
                        pageDefinition: form.citationPage,
                        children: (binding) => (
                            <CitationPage controllers={controllers} binding={binding} isReadOnly={isReadOnly} />
                        )
                    },
                    {
                        pageDefinition: form.courtPage,
                        children: (binding) => <CourtPage binding={binding} />
                    }
                ]}
            />
        </FForm>
    );
}
