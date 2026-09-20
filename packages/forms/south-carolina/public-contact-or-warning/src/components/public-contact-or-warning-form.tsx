import React from "react";
import { useForm, IControllerManager, FForm, FPageCollection } from "@forms/core";

import { PublicContactOrWarningFormModel } from "../models/public-contact-or-warning-form";
import RecordPage from "./record-page/record-page";

interface IPublicContactOrWarningFormProps {
    /** The controllers belonging to this form. The form controller owns the form model. */
    readonly controllers: IControllerManager;
}

/** Defines the public contact/warning form. */
export default function PublicContactOrWarningForm({ controllers }: IPublicContactOrWarningFormProps): React.JSX.Element {
    const controller = controllers.getFormController<PublicContactOrWarningFormModel>();
    const form = useForm(controller);

    return (
        <FForm form={form}>
            <FPageCollection
                controllers={controllers}
                groups={[
                    {
                        pageDefinition: form.recordPage,
                        children: (binding) => (
                            <RecordPage controllers={controllers} binding={binding} />
                        )
                    }
                ]}
            />
        </FForm>
    );
}
