import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";
import { RouteSectionModel } from "../../models/record-page/route-section";

interface IRouteSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<RouteSectionModel>;
}

/** Defines the route section of the public contact/warning record. */
export const RouteSection = ({ binding }: IRouteSectionProps): React.JSX.Element => {
    const section = binding.get();
    const type = section.getType();
    const numberOrName = section.getNumberOrName();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal" height={44}>
                <FFieldControl borderEdges={["top"]} label={type.label} labelFor={type.id} width={75}>
                    <FFieldInput
                        id={type.id}
                        disabled={!type.getIsEnabled()}
                        invalid={type.getHasError()}
                        value={type.getValue()}
                        onChange={(value) => binding.setValue(section.type, value)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top"]} label={numberOrName.label} labelFor={numberOrName.id} width={513}>
                    <FFieldInput
                        id={numberOrName.id}
                        disabled={!numberOrName.getIsEnabled()}
                        invalid={numberOrName.getHasError()}
                        value={numberOrName.getValue()}
                        onChange={(value) => binding.setValue(section.numberOrName, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
};
