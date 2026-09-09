import React, { useCallback, useEffect, useState } from "react";
import { useService } from "@common/react";
import { FButton, FOffCanvas } from "@forms/core";
import { INotificationService, IReportViewerOptionProps } from "@forms/report-viewer";

import { ViolationSelectionList } from "./violation-selection-list";
import { IViolation } from "../models";
import { IViolationSelectorService, IViolationService } from "../services";

/** Defines a manager component for the violation selector off canvas. */
export function ViolationsPanel({ catalogItem, controllers }: IReportViewerOptionProps): React.JSX.Element {
    const notificationService = useService<INotificationService>(INotificationService);
    const violationSelectorService = useService<IViolationSelectorService>(IViolationSelectorService);
    const violationService = useService<IViolationService>(IViolationService);

    const [violations, setViolations] = useState<ReadonlyArray<IViolation>>([]);
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set<string>());
    const [isOpen, setIsOpen] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    const binding = violationService.getBinding(catalogItem);

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
                    notificationService.showNotification({ type: "danger", message: "The violations could not be loaded." });
                }
            });

        return () => { isCurrent = false; };
    }, [isOpen, binding, violationService, notificationService]);

    const toggle = useCallback((code: string) => {
        setSelected(current => {
            const next = new Set(current);
            next.has(code) ? next.delete(code) : next.add(code);

            return next;
        });
    }, []);

    const add = async (): Promise<void> => {
        if (!binding) {
            return;
        }

        // the chosen violations are handed over in the order the list offers them rather than the order they were
        // ticked in, so the pages come out in the order an officer reading the panel would expect
        const chosen = violations.filter(violation => selected.has(violation.code));
        if (!chosen.length) {
            return;
        }

        setIsApplying(true);

        try {
            await binding.apply(controllers, chosen);
            close();
        }
        catch (error) {
            notificationService.showNotification({ type: "danger", message: error instanceof Error ? error.message : "The violations could not be added to the form." });
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
                    selected={selected}
                    onToggle={toggle}
                />
            </FOffCanvas.Body>
            <div className="f-offcanvas__footer d-flex align-items-center justify-content-between border-top p-3">
                <span className="small text-muted">{selected.size} selected</span>
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
