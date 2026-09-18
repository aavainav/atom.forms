import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useService } from "@common/react";
import { IFormCatalogItem } from "@forms/catalog";
import { useForm, IControllerManager, FButton, FOffCanvas } from "@forms/core";

import { ViolationSelectionList } from "./violation-selection-list";
import { IViolation } from "../models";
import { IViolationSelectorService, IViolationService } from "../services";

/** How many violations may be ticked before the rest of the list stops accepting picks. */
const maxSelectedViolations = 5;

/** The panel's props, declared here rather than imported so nothing in this package depends on whoever renders it -- `onError` reports a failure for the same reason, since notifications belong to the host, not the panel. */
export interface IViolationsPanelProps {
    /** The catalog item the form was loaded from, which the binding is resolved by. */
    readonly catalogItem: IFormCatalogItem;
    /** The controllers belonging to the form the panel acts on. */
    readonly controllers: IControllerManager;
    /** Invoked when the list cannot be loaded or a chosen violation cannot be applied. */
    readonly onError?: (message: string) => void;
}

/** Defines a manager component for the violation selector off canvas. */
export function ViolationsPanel({ catalogItem, controllers, onError }: IViolationsPanelProps): React.JSX.Element {
    const violationSelectorService = useService<IViolationSelectorService>(IViolationSelectorService);
    const violationService = useService<IViolationService>(IViolationService);

    const [isApplying, setIsApplying] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set<string>());
    const [violations, setViolations] = useState<ReadonlyArray<IViolation>>([]);

    const binding = violationService.getBinding(catalogItem);

    // the form is read through the hook rather than off the controller, so deleting a page while the panel is open
    // frees the violation that was on it here as well; the panel is mounted for the life of the form and would
    // otherwise be showing whatever the citation held when it was last opened
    const form = useForm(controllers.getFormController());

    const applied = useMemo(
        () => new Set((binding && violations.length ? binding.getApplied(controllers, violations) : []).map(violation => violation.code)),
        [binding, controllers, violations, form]);

    const close = useCallback(() => {
        setIsOpen(false);
        setSelected(new Set<string>());
    }, []);

    useEffect(() => {
        const listener = violationSelectorService.onOpenSelector(() => setIsOpen(true));
        return () => listener.remove();
    }, [violationSelectorService]);

    useEffect(() => {
        if (!isOpen || !binding) {
            return;
        }

        let isCurrent = true;

        // the list is loaded when the panel is first opened rather than when the form is, so the chunk carrying a
        // jurisdiction's code list is not fetched by an officer who never opens the selector
        violationService.getViolations(binding.listId)
            .then(result => { if (isCurrent) { setViolations(result); } })
            .catch(() => {
                if (isCurrent) {
                    onError?.("The violations could not be loaded.");
                }
            });

        return () => { isCurrent = false; };
    }, [isOpen, binding, violationService, onError]);

    const toggle = useCallback((code: string) => {
        // a violation already on the citation is ticked and locked, and is taken off only by deleting its page
        if (applied.has(code)) {
            return;
        }

        setSelected(current => {
            if (!current.has(code) && applied.size + current.size >= maxSelectedViolations) {
                // the list disables its unticked rows at the cap, so this only catches a pick that got past that
                return current;
            }

            const next = new Set(current);
            next.has(code) ? next.delete(code) : next.add(code);

            return next;
        });
    }, [applied]);

    const add = async (): Promise<void> => {
        if (!binding) {
            return;
        }

        // only the newly ticked ones are handed over: the rest are already on the citation, and applying them a
        // second time would write a second page for a charge it already carries. they are handed over in the order
        // the list offers them rather than the order they were ticked in, so the pages come out in the order an
        // officer reading the panel would expect
        const chosen = violations.filter(violation => selected.has(violation.code) && !applied.has(violation.code));
        if (!chosen.length) {
            return;
        }

        setIsApplying(true);

        try {
            await binding.apply(controllers, chosen);
            close();
        }
        catch (error) {
            onError?.(error instanceof Error ? error.message : "The violations could not be added to the form.");
        }
        finally {
            setIsApplying(false);
        }
    };

    return (
        <FOffCanvas id="violations" isOpen={isOpen} placement="end">
            <FOffCanvas.Header borderVisibility="visible" onClose={close}><h5>Violations</h5></FOffCanvas.Header>
            <FOffCanvas.Body>
                <ViolationSelectionList
                    controller={controllers.getDragAndDropController()}
                    violations={violations}
                    applied={applied}
                    selected={selected}
                    maxSelected={maxSelectedViolations}
                    onToggle={toggle}
                />
            </FOffCanvas.Body>
            <div className="f-offcanvas__footer d-flex align-items-center justify-content-between border-top p-3">
                <span className="small text-muted">{applied.size + selected.size} of {maxSelectedViolations} selected</span>
                <FButton
                    id="violations-add-button"
                    variant="primary"
                    type="button"
                    disabled={selected.size === 0 || isApplying}
                    text="Add"
                    onClick={add}
                />
            </div>
        </FOffCanvas>
    );
}
