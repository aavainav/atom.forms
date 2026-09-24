import { useEffect } from "react";
import { useService } from "@common/react";
import { IControllerManager } from "@forms/core";

import { getAuditController } from "../controllers";
import { IAuditService } from "../services";

/**
 * Forwards a form's records to the audit service for as long as the manager lives. The controller starts during render,
 * before this effect runs, so its early records are held for this subscription. It lets go when the manager closes, after
 * the controller has recorded the form closed, so that record is forwarded too.
 */
export function useAuditRecorder(controllers: IControllerManager): void {
    const auditService = useService<IAuditService>(IAuditService);

    useEffect(() => {
        controllers.attach("audit-recorder", () => {
            const listener = getAuditController(controllers).onRecord(record => auditService.record(record));

            return () => listener.remove();
        });
    }, [auditService, controllers]);
}
