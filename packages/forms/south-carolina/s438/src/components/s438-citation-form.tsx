import React from "react";
import { FForm, FPageCollection, IControllerManager, useForm } from "@forms/core";
import { S438FormModel } from "../models/s438-form";

import FrontPage from "./front-page/front-page";
import NoticePage from "./notice-page/notice-page";
import TrialPage from "./trial-page/trial-page";

interface IS438FormProps {
    /** The controllers belonging to this form. The form controller owns the form model. */
    readonly controllers: IControllerManager;
}

/** Defines the S438 citation form. */
export default function S438Form({ controllers }: IS438FormProps): React.JSX.Element {
    const controller = controllers.getFormController<S438FormModel>();
    const form = useForm(controller);

    return (
        <FForm form={form}>
            <FPageCollection
                controllers={controllers}
                groups={[
                    {
                        pageDefinition: form.frontPage,
                        children: (binding) => <FrontPage controllers={controllers} binding={binding} />
                    },
                    {
                        pageDefinition: form.noticePage,
                        children: (binding) => <NoticePage noticePage={binding.get()} />
                    },
                    {
                        pageDefinition: form.trialPage,
                        children: (binding) => <TrialPage controllers={controllers} binding={binding} />
                    }
                ]}
            />
        </FForm>
    );
}
