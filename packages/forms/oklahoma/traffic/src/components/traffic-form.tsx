import React from "react";
import { useForm, IControllerManager, FForm, FPageCollection } from "@forms/core";

import { OKTrafficFormModel } from "../models/traffic-form";
import ComplaintPage from "./complaint-page/complaint-page";
import SupplementPage from "./supplement-page/supplement-page";
import WarrantPage from "./warrant-page/warrant-page";

interface IOKTrafficFormProps {
    /** The controllers belonging to this form. The form controller owns the form model. */
    readonly controllers: IControllerManager;
    /** An indicator whether the report should be rendered read only. */
    readonly isReadOnly: boolean;
}

/** The Oklahoma City traffic citation form. Three page groups render as one continuous tab strip in print order, each holding a single page, so add/delete affordances never come into play. */
export default function OKTrafficForm({ controllers, isReadOnly }: IOKTrafficFormProps): React.JSX.Element {
    const controller = controllers.getFormController<OKTrafficFormModel>();
    const form = useForm(controller);

    return (
        <FForm form={form}>
            <FPageCollection
                controllers={controllers}
                isReadOnly={isReadOnly}
                groups={[
                    {
                        pageDefinition: form.complaintPage,
                        children: (binding) => (
                            <ComplaintPage controllers={controllers} binding={binding} isReadOnly={isReadOnly} />
                        )
                    },
                    {
                        pageDefinition: form.warrantPage,
                        children: (binding) => <WarrantPage binding={binding} />
                    },
                    {
                        pageDefinition: form.supplementPage,
                        children: (binding) => (
                            <SupplementPage controllers={controllers} binding={binding} />
                        )
                    }
                ]}
            />
        </FForm>
    );
}
