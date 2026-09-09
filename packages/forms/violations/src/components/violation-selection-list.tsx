import React, { useMemo, useState } from "react";
import { FFieldControl, FDraggableItem, FFieldInput, FListGroup, FListGroupCheckbox, IDragAndDropController } from "@forms/core";

import { IViolation } from "../models";

/**
 * How many rows are rendered before the list stops and asks for a narrower search.
 *
 * A jurisdiction's code list runs to thousands of charges, and rendering all of them costs far more than anyone
 * scrolls through; `FFieldSelect` caps its own menu the same way and for the same reason.
 */
const maxVisibleItems = 50;

interface IViolationListProps {
    /** The drag-and-drop controller belonging to the form, so a row can be dragged onto it. */
    readonly controller: IDragAndDropController;
    /** The violations to offer, already ordered by the search that produced them. */
    readonly violations: ReadonlyArray<IViolation>;
    /** The codes currently ticked. */
    readonly selected: ReadonlySet<string>;
    /** How many codes may be ticked at once; once reached, the unticked rows stop accepting picks. */
    readonly maxSelected: number;
    /** Invoked with the code whose ticked state changed. */
    readonly onToggle: (code: string) => void;
}

/** Narrows the violations to those matching the term, across code, statute and description. */
function filter(violations: ReadonlyArray<IViolation>, term: string): ReadonlyArray<IViolation> {
    const match = term.trim().toLowerCase();
    if (!match) {
        return violations;
    }

    return violations.filter(violation =>
        violation.code.toLowerCase().includes(match)
        || violation.description.toLowerCase().includes(match)
        || (violation.statute?.toLowerCase().includes(match) ?? false));
}

/** Renders the searchable list of violations, each row tickable and draggable. */
export function ViolationSelectionList({ controller, violations, selected, maxSelected, onToggle }: IViolationListProps): React.JSX.Element {
    const [searchTerm, setSearchTerm] = useState("");

    const matches = useMemo(() => filter(violations, searchTerm), [violations, searchTerm]);
    const visible = matches.slice(0, maxVisibleItems);
    const isSelectionFull = selected.size >= maxSelected;

    return (
        <>
            <div className="mb-2">
                <FFieldControl border="visible" borderEdges={["bottom"]}>
                    <FFieldInput
                        id="violation-search"
                        autocomplete="off"
                        enableClear
                        placeholder="Search violations..."
                        symbols={[".", "-", "(", ")", "/", " "]}
                        value={searchTerm}
                        onChange={(value) => setSearchTerm(value ?? "")}
                    />
                </FFieldControl>
            </div>

            {isSelectionFull && (
                <div className="small text-muted mb-2">
                    {maxSelected} violations chosen — untick one to choose another.
                </div>
            )}

            {matches.length === 0
                ? <div className="text-muted fst-italic">No violations match that search.</div>
                : (
                    <FListGroup id="violation-list">
                        {visible.map((violation) => (
                            <FDraggableItem
                                key={violation.code}
                                controller={controller}
                                itemData={{ id: violation.code, type: "violation", data: violation }}>
                                <FListGroupCheckbox
                                    id={`violation-${violation.code}`}
                                    checked={selected.has(violation.code)}
                                    disabled={isSelectionFull && !selected.has(violation.code)}
                                    onChange={() => onToggle(violation.code)}>
                                    <div className="ms-2">
                                        <div className="fw-bold">{violation.statute ?? violation.code}</div>
                                        <div className="small text-muted">{violation.description}</div>
                                    </div>
                                </FListGroupCheckbox>
                            </FDraggableItem>
                        ))}
                    </FListGroup>
                )}

            {matches.length > visible.length && (
                <div className="small text-muted mt-2">
                    Showing {visible.length} of {matches.length} — refine your search to see more.
                </div>
            )}
        </>
    );
}