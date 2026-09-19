import { useEffect } from "react";
import { useService } from "@common/react";
import { IControllerManager } from "@forms/core";

import { getAuditController } from "../controllers";
import { IAuditService } from "../services";

/** The recorder's props. */
export interface IAuditRecorderProps {
    /** The controllers belonging to the form whose records are forwarded. */
    readonly controllers: IControllerManager;
}

/**
 * Forwards a form's records to the audit service, and renders nothing. The controller starts during render,
 * before this mounts, so its early records are held for this subscription. Pending edits are flushed on unmount
 * and on `pagehide`.
 */
export function AuditRecorder({ controllers }: IAuditRecorderProps): null {
    const auditService = useService<IAuditService>(IAuditService);

    useEffect(() => {
        const controller = getAuditController(controllers);
        const listener = controller.onRecord(record => auditService.record(record));
        const flush = (): void => controller.flush();

        window.addEventListener("pagehide", flush);

        return () => {
            window.removeEventListener("pagehide", flush);

            // flush first, or the record has nowhere to land
            controller.flush();
            listener.remove();
        };
    }, [auditService, controllers]);

    return null;
}
