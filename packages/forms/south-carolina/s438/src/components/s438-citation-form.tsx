import React from "react";
import { FForm, FPageCollection, IControllerManager, useForm } from "@forms/core";
import { S438FormModel } from "../models/s438-form";
import FrontPage from "./front-page/front-page";
import NoticePage from "./notice-page/notice-page";

interface IS438FormProps {
    /** The controllers belonging to this form. The form controller owns the form model. */
    readonly controllers: IControllerManager;
    /** An indicator whether the report should be rendered read only. */
    readonly isReadOnly: boolean;
}

/** Defines the S438 citation form. */
export default function S438Form({ controllers, isReadOnly }: IS438FormProps): React.JSX.Element {
    const controller = controllers.getFormController<S438FormModel>();
    const form = useForm(controller);

    return (
        <FForm form={form}>
            <FPageCollection
                controllers={controllers}
                isReadOnly={isReadOnly}
                groups={[
                    {
                        pageDefinition: form.frontPage,
                        children: (binding) => (
                            <FrontPage controllers={controllers} binding={binding} isReadOnly={isReadOnly} />
                        )
                    },
                    {
                        pageDefinition: form.noticePage,
                        children: (binding) => <NoticePage noticePage={binding.get()} />
                    }
                ]}
            />
        </FForm>
    );
}
