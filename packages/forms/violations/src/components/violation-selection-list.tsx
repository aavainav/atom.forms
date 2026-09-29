import React, { useMemo, useState } from "react";
import { FFieldControl, FDraggableItem, FFieldInput, FListGroup, FListGroupCheckbox, IDragAndDropController } from "@forms/core";

import { IViolation } from "../models";

/** How many rows render before the list asks for a narrower search -- a code list runs to thousands of charges, far more than anyone scrolls through; `FFieldSelect` caps its own menu the same way. */
const maxVisibleItems = 50;

interface IViolationListProps {
    /** The ids of the violations the citation already carries; these rows are ticked and locked, and count against `maxSelected`. */
    readonly applied: ReadonlySet<string>;
    /** The drag-and-drop controller belonging to the form, so a row can be dragged onto it. */
    readonly controller: IDragAndDropController;
    /** The ids of the violations the current user has favorited on this list. */
    readonly favorites: ReadonlySet<string>;
    /** How many rows may be ticked at once, applied and selected together; once reached, the unticked rows stop accepting picks. */
    readonly maxSelected: number;
    /** The ids of the violations ticked here but not yet on the citation. */
    readonly selected: ReadonlySet<string>;
    /** The violations to offer, already ordered by the search that produced them. */
    readonly violations: ReadonlyArray<IViolation>;

    /** Invoked with the id of the violation whose ticked state changed. */
    readonly onToggle: (id: string) => void;
    /** Invoked with the id of the violation whose favorited state changed. */
    readonly onToggleFavorite: (id: string) => void;
}

/** Narrows the violations to those in the category, if one is chosen, and then to those matching the term. */
function filter(violations: ReadonlyArray<IViolation>, term: string, category: string): ReadonlyArray<IViolation> {
    const within = category ? violations.filter(violation => violation.category === category) : violations;

    const match = term.trim().toLowerCase();
    if (!match) {
        return within;
    }

    return within.filter(violation =>
        violation.code.toLowerCase().includes(match)
        || violation.description.toLowerCase().includes(match)
        || (violation.statute?.toLowerCase().includes(match) ?? false));
}

/** Puts a favorited violation ahead of the rest, so a long list still surfaces one quickly; order is otherwise unchanged. */
function sortFavoritesFirst(violations: ReadonlyArray<IViolation>, favorites: ReadonlySet<string>): ReadonlyArray<IViolation> {
    if (favorites.size === 0) {
        return violations;
    }

    return [...violations].sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)));
}

/** The distinct categories the given violations are filed under, alphabetically. */
function toCategories(violations: ReadonlyArray<IViolation>): Array<string> {
    const distinct = new Set<string>();

    for (const violation of violations) {
        if (violation.category) {
            distinct.add(violation.category);
        }
    }

    return [...distinct].sort((a, b) => a.localeCompare(b));
}

/** Renders the searchable list of violations, each row tickable and draggable. */
export function ViolationSelectionList({ applied, controller, favorites, maxSelected, selected, violations, onToggle, onToggleFavorite }: IViolationListProps): React.JSX.Element {
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");

    const categories = useMemo(() => toCategories(violations), [violations]);

    const matches = useMemo(
        () => sortFavoritesFirst(filter(violations, searchTerm, category), favorites),
        [violations, searchTerm, category, favorites]);
    const visible = matches.slice(0, maxVisibleItems);
    const isSelectionFull = applied.size + selected.size >= maxSelected;

    return (
        <>
            {/* a list whose codes were never grouped has nothing to filter on, so the control is not offered at all
                rather than opening onto a menu holding only "All categories".

                this is a plain select rather than an `FFieldSelect`, which is built for a coded form field bound to
                a value list: its menu always spells an option out as "value - description", and a category has no
                code, so every row would read "Speed - Speed". A filter over a panel is not a field on the form, and
                the print dialog reaches for plain bootstrap markup for the same reason. */}
            {categories.length > 0 && (
                <div className="mb-2">
                    <select
                        id="violation-category"
                        // bottom border only, matching the search box beneath it, so the two filters read as a pair
                        className="form-select form-select-sm border-0 border-bottom rounded-0"
                        aria-label="Filter violations by category"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                    >
                        <option value="">All categories</option>
                        {categories.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
            )}

            <div className="mb-2">
                <FFieldControl border="visible" borderEdges={["bottom"]}>
                    <FFieldInput
                        id="violation-search"
                        autocomplete="off"
                        enableClear
                        placeholder="Search violations..."
                        symbols={[".", "-", "(", ")", "/", " "]}
                        value={searchTerm}
                        onChange={(value) => setSearchTerm((value as string | undefined) ?? "")}
                    />
                </FFieldControl>
            </div>

            {isSelectionFull && (
                <div className="small text-muted mb-2">
                    {maxSelected} violations chosen — untick one to choose another.
                </div>
            )}

            {/* the categories are derived from the rows themselves, so choosing one always leaves at least one
                behind; an empty list is therefore always the search term's doing */}
            {matches.length === 0
                ? <div className="text-muted fst-italic">No violations match that search.</div>
                : (
                    <FListGroup id="violation-list">
                        {visible.map((violation) => {
                            const isApplied = applied.has(violation.id);
                            const isChecked = isApplied || selected.has(violation.id);

                            return (
                            <FDraggableItem
                                key={violation.id}
                                controller={controller}
                                disabled={isApplied}
                                itemData={{ id: violation.id, type: "violation", data: violation }}>
                                <FListGroupCheckbox
                                    id={`violation-${violation.id}`}
                                    checked={isChecked}
                                    disabled={isApplied || (isSelectionFull && !isChecked)}
                                    onChange={() => onToggle(violation.id)}>
                                    <div className="ms-2">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="fw-bold">{violation.statute ?? violation.code}</div>
                                            <i
                                                id={`violation-favorite-${violation.id}`}
                                                className={`bi ${favorites.has(violation.id) ? "bi-star-fill" : "bi-star"} text-warning`}
                                                style={{ cursor: "pointer" }}
                                                role="button"
                                                aria-label={favorites.has(violation.id) ? "Remove from favorites" : "Add to favorites"}
                                                onClick={(event) => { event.preventDefault(); event.stopPropagation(); onToggleFavorite(violation.id); }}
                                            />
                                        </div>
                                        <div className="small text-muted">{violation.description}</div>
                                        {isApplied && <div className="small fst-italic">On the citation</div>}
                                        {/* the category is shown only while it is not what narrowed the list, since
                                            repeating the chosen category on every row says nothing */}
                                        {violation.category && !category && (
                                            <div className="small text-muted fst-italic">{violation.category}</div>
                                        )}
                                    </div>
                                </FListGroupCheckbox>
                            </FDraggableItem>
                            );
                        })}
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