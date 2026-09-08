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
            <FFormStackPanel height={44} direction="horizontal">
                <FFieldControl width={75} label={type.label} labelFor={type.id} borderEdges={["top"]}>
                    <FFieldInput
                        id={type.id}
                        disabled={!type.getIsEnabled()}
                        invalid={type.getHasError()}
                        value={type.getValue()}
                        onChange={(value) => binding.setValue(section.type, value)}
                    />
                </FFieldControl>
                <FFieldControl width={513} label={numberOrName.label} labelFor={numberOrName.id} borderEdges={["left", "top"]}>
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
