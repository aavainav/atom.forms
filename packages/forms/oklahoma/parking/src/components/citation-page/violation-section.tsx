import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { ViolationSectionModel } from "../../models/citation-page/violation-section";

interface IViolationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolationSectionModel>;
}

/** Defines the violation section of the Oklahoma City parking violation form's citation page. */
export const ViolationSection = ({ binding }: IViolationSectionProps): React.JSX.Element => {
    const section = binding.get();
    const date = section.getDate();
    const time = section.getTime();
    const location = section.getLocation();
    const code = section.getCode();
    const description = section.getDescription();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={160} label={date.label} labelFor={date.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={date.id}
                        type="date"
                        disabled={!date.getIsEnabled()}
                        invalid={date.getHasError()}
                        value={date.getValue()}
                        onChange={(value) => binding.setValue(section.date, value)}
                    />
                </FFieldControl>
                <FFieldControl width={130} label={time.label} labelFor={time.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={time.id}
                        disabled={!time.getIsEnabled()}
                        invalid={time.getHasError()}
                        value={time.getValue()}
                        onChange={(value) => binding.setValue(section.time, value)}
                    />
                </FFieldControl>
                <div className="w-100">
                    <FFieldControl label={location.label} labelFor={location.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={location.id}
                            disabled={!location.getIsEnabled()}
                            invalid={location.getHasError()}
                            value={location.getValue()}
                            onChange={(value) => binding.setValue(section.location, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={130} label={code.label} labelFor={code.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={code.id}
                        alphanumeric
                        disabled={!code.getIsEnabled()}
                        invalid={code.getHasError()}
                        value={code.getValue()}
                        onChange={(value) => binding.setValue(section.code, value)}
                    />
                </FFieldControl>
                <div className="w-100">
                    <FFieldControl label={description.label} labelFor={description.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={description.id}
                            disabled={!description.getIsEnabled()}
                            invalid={description.getHasError()}
                            value={description.getValue()}
                            onChange={(value) => binding.setValue(section.description, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
