import React from "react";
import { useService } from "@common/react";
import { IFormCatalogItem } from "@forms/catalog";
import { useForm, IControllerManager, FButton, FIcon, FTooltip } from "@forms/core";

import { isViolationsClosed } from "../models";
import { IViolationSelectorService, IViolationService } from "../services";

/** Defines the props the violations option is rendered with. Declared here rather than imported so that nothing in this package depends on whoever renders it. */
export interface IViolationsOptionProps {
    /** The catalog item the form was loaded from, which the binding is resolved by. */
    readonly catalogItem: IFormCatalogItem;
    /** The controllers belonging to the form the violations are chosen for. */
    readonly controllers: IControllerManager;
    /** The name the option is offered under, shown as its tooltip. */
    readonly title: string;
}

/** Defines the option for choosing the violations the citation is written for. It is disabled once the form has closed its violations. */
export const ViolationsOption = ({ catalogItem, controllers, title }: IViolationsOptionProps): React.JSX.Element => {
    const violationSelectorService = useService<IViolationSelectorService>(IViolationSelectorService);
    const violationService = useService<IViolationService>(IViolationService);

    // read through the hook, so the button closes as the form does: on being issued, say
    const form = useForm(controllers.getFormController());
    const binding = violationService.getBinding(catalogItem);

    return (
        <FTooltip title={title} placement="right">
            <FButton id="violations-button" variant="light" type="button" disabled={!!binding && isViolationsClosed(form, binding)} onClick={() => violationSelectorService.openSelector()}>
                <FIcon icon="card-checklist" />
            </FButton>
        </FTooltip>
    );
}
