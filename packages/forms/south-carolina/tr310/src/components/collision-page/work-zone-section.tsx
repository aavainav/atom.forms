import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection } from "@forms/core";

import { WorkZoneSectionModel } from "../../models/collision-page/work-zone-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodedField } from "../fields";

interface IWorkZoneSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<WorkZoneSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** The code the report uses for a yes answer on its yes/no/unknown boxes. */
const yes = "1";

/**
 * Defines the work zone section of the TR-310.
 *
 * The detail boxes stay shut until the collision is recorded as work zone related, so a collision that happened
 * nowhere near one never offers four boxes it has no answer for; the rules ask for them on the same condition.
 */
export const WorkZoneSection = ({ binding, valueListController }: IWorkZoneSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const related = section.getRelated();
    const isNotWorkZoneRelated = related.getValue().value !== yes;

    const loadYesNoUnknownOptions = useCallback(() => tr310Service.getYesNoUnknownOptions(), [tr310Service]);
    const loadCrashLocationOptions = useCallback(() => tr310Service.getWorkZoneCrashLocationOptions(), [tr310Service]);
    const loadTypeOptions = useCallback(() => tr310Service.getWorkZoneTypeOptions(), [tr310Service]);
    const loadPresenceOptions = useCallback(() => tr310Service.getWorkZonePresenceOptions(), [tr310Service]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    cacheKey={TR310ValueListId.yesNoUnknown}
                    columns={1}
                    controller={valueListController}
                    field={related}
                    load={loadYesNoUnknownOptions}
                    title="Work Zone Related"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.related, value)}
                />
                <CodedField
                    cacheKey={TR310ValueListId.workZoneCrashLocation}
                    columns={1}
                    controller={valueListController}
                    disabled={isNotWorkZoneRelated}
                    field={section.getCrashLocation()}
                    load={loadCrashLocationOptions}
                    title="Crash in Work Zone"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.crashLocation, value)}
                />
                <CodedField
                    cacheKey={TR310ValueListId.workZoneType}
                    columns={1}
                    controller={valueListController}
                    disabled={isNotWorkZoneRelated}
                    field={section.getType()}
                    load={loadTypeOptions}
                    title="Type of Work Zone"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.type, value)}
                />
                <CodedField
                    cacheKey={TR310ValueListId.workZonePresence}
                    columns={1}
                    controller={valueListController}
                    disabled={isNotWorkZoneRelated}
                    field={section.getWorkerPresent()}
                    load={loadPresenceOptions}
                    title="Worker Present"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.workerPresent, value)}
                />
                <CodedField
                    cacheKey={TR310ValueListId.workZonePresence}
                    columns={1}
                    controller={valueListController}
                    disabled={isNotWorkZoneRelated}
                    field={section.getLawEnforcement()}
                    load={loadPresenceOptions}
                    title="Law Enforcement in Work Zone"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.lawEnforcement, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
