import React from "react";
import { useForm, IControllerManager, FForm, FPageCollection } from "@forms/core";

import { OKParkingFormModel } from "../models/parking-form";
import CitationPage from "./citation-page/citation-page";
import ComplaintPage from "./complaint-page/complaint-page";
import DetailPage from "./detail-page/detail-page";

interface IOKParkingFormProps {
    /** The controllers belonging to this form. The form controller owns the form model. */
    readonly controllers: IControllerManager;
    /** An indicator whether the report should be rendered read only. */
    readonly isReadOnly: boolean;
}

/**
 * Defines the Oklahoma City parking violation form.
 *
 * The three page groups are rendered as one continuous tab strip in the order the paper form is printed. Each
 * group holds a single page, so the collection's add and delete affordances never come into play.
 */
export default function OKParkingForm({ controllers, isReadOnly }: IOKParkingFormProps): React.JSX.Element {
    const controller = controllers.getFormController<OKParkingFormModel>();
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
                        pageDefinition: form.complaintPage,
                        children: (binding) => <ComplaintPage binding={binding} />
                    },
                    {
                        pageDefinition: form.detailPage,
                        children: (binding) => (
                            <DetailPage controllers={controllers} binding={binding} isReadOnly={isReadOnly} />
                        )
                    }
                ]}
            />
        </FForm>
    );
}
