import React from "react";
import { useForm, IControllerManager, FForm, FPageCollection } from "@forms/core";

import { TR310FormModel } from "../models/tr310-form";
import CollisionPage from "./collision-page/collision-page";
import PersonPage from "./person-page/person-page";
import UnitPage from "./unit-page/unit-page";
import NarrativePage from "./narrative-page/narrative-page";

interface ITR310FormProps {
    /** The controllers belonging to this form. The form controller owns the form model. */
    readonly controllers: IControllerManager;
    /** An indicator whether the report should be rendered read only. */
    readonly isReadOnly: boolean;
}

/** The TR-310 traffic collision report. Four page groups render as one continuous tab strip in print order. Person and unit groups carry the collection's add/delete affordances, growing a page per person or unit involved; collision and narrative are one each. */
export default function TR310Form({ controllers, isReadOnly }: ITR310FormProps): React.JSX.Element {
    const controller = controllers.getFormController<TR310FormModel>();
    const form = useForm(controller);

    return (
        <FForm form={form}>
            <FPageCollection
                controllers={controllers}
                isReadOnly={isReadOnly}
                groups={[
                    {
                        pageDefinition: form.collisionPage,
                        children: (binding) => (
                            <CollisionPage controllers={controllers} binding={binding} />
                        )
                    },
                    {
                        pageDefinition: form.personPage,
                        children: (binding) => (
                            <PersonPage controllers={controllers} binding={binding} isReadOnly={isReadOnly} />
                        )
                    },
                    {
                        pageDefinition: form.unitPage,
                        children: (binding) => (
                            <UnitPage controllers={controllers} binding={binding} isReadOnly={isReadOnly} />
                        )
                    },
                    {
                        pageDefinition: form.narrativePage,
                        children: (binding) => (
                            <NarrativePage controllers={controllers} binding={binding} />
                        )
                    }
                ]}
            />
        </FForm>
    );
}
