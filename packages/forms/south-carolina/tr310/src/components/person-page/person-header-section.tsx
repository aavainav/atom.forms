import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { PersonHeaderSectionModel } from "../../models/person-page/person-header-section";
import { ITR310Service } from "../../services";
import { CodedField, TextField } from "../fields";

interface IPersonHeaderSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PersonHeaderSectionModel>;
}

/** Defines the person page's header, identifying which person of which unit the page records. */
export const PersonHeaderSection = ({ binding }: IPersonHeaderSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadPersonTypeOptions = useCallback(() => tr310Service.getPersonTypeOptions(), [tr310Service]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FFormStackPanel height={44} direction="horizontal">
                    <TextField field={section.getPersonNumber()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.personNumber, value)} />
                    <TextField field={section.getUnitNumber()} width={80} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.unitNumber, value)} />
                    <TextField field={section.getCrashReportNumber()} width={240} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.crashReportNumber, value)} />
                </FFormStackPanel>
                <CodedField
                    columns={1}
                    field={section.getPersonType()}
                    load={loadPersonTypeOptions}
                    title="Person Type"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.personType, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
