import React, { useEffect, useState } from "react";
import { useService } from "@common/react";
import { IControllerManager, IRuleIssue } from "@forms/core";

import Validation from "./validation";
import { IValidationService } from "../../services/validation";

interface IValidationManagerProps {
    /** The controllers belonging to the form this validation panel is for, so an entry can navigate to its field. */
    readonly controllers: IControllerManager;
}

/** Defines a manager component for displaying the validation errors off canvas. */
export default function ValidationManager({ controllers }: IValidationManagerProps): React.JSX.Element {
    const validationService = useService<IValidationService>(IValidationService);

    const [issues, setIssues] = useState<ReadonlyArray<IRuleIssue>>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const listener = validationService.onShowIssues(result => {
            setIssues(result);
            // only new issues force the panel open; re-validating a clean report updates an already-open
            // panel's content without forcing it open, and a clean first validation never auto-opens it
            if (result.length > 0) {
                setIsOpen(true);
            }
        });

        return () => listener.remove();
    }, [validationService]);

    return <Validation controllers={controllers} issues={issues} isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
