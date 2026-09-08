import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, IValueListController, FFieldControl, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { PersonSectionModel } from "../../models/person-page/person-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodeBox, TextField } from "../fields";

interface IPersonSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PersonSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the person section of the TR-310 - the driver or non-motorist the page records, and where they live. */
export const PersonSection = ({ binding, valueListController }: IPersonSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const state = section.getState();

    const loadStateOptions = useCallback(() => tr310Service.getStateOptions(), [tr310Service]);
    const loadYesNoOptions = useCallback(() => tr310Service.getYesNoOptions(), [tr310Service]);
    const loadGenderOptions = useCallback(() => tr310Service.getGenderOptions(), [tr310Service]);

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getFirstName()} width={180} maxlength={30} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.firstName, value)} />
                <TextField field={section.getMiddleName()} width={54} maxlength={1} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.middleName, value)} />
                <TextField field={section.getLastName()} width={180} maxlength={30} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.lastName, value)} />
                <TextField field={section.getPhoneNumber()} width={140} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.phoneNumber, value)} />
                <CodeBox
                    cacheKey={TR310ValueListId.yesNo}
                    controller={valueListController}
                    field={section.getContributedTo()}
                    label={section.getContributedTo().label}
                    load={loadYesNoOptions}
                    width={120}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.contributedTo, value)}
                />
                <TextField field={section.getDateOfBirth()} width={120} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.dateOfBirth, value)} />
            </FFormStackPanel>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getAddress()} width={300} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.address, value)} />
                <TextField field={section.getCity()} width={160} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.city, value)} />
                <FFieldControl width={80} label={state.label} labelFor={state.id} borderEdges={["top", "left"]}>
                    <FFieldSelect
                        id={state.id}
                        cacheKey={ValueListId.state}
                        controller={valueListController}
                        disabled={!state.getIsEnabled()}
                        format="valueOnly"
                        invalid={state.getHasError()}
                        options={loadStateOptions}
                        searchable
                        value={state.getValue()}
                        onChange={(value) => binding.setValue(section.state, value as IOptionValue)}
                    />
                </FFieldControl>
                <TextField field={section.getZipCode()} width={100} maxlength={10} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.zipCode, value)} />
                <CodeBox
                    cacheKey={TR310ValueListId.gender}
                    controller={valueListController}
                    field={section.getSex()}
                    label={section.getSex().label}
                    load={loadGenderOptions}
                    width={70}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.sex, value)}
                />
                <TextField field={section.getRace()} width={70} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.race, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
