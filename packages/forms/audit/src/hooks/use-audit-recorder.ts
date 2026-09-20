import { useEffect } from "react";
import { useService } from "@common/react";
import { IControllerManager } from "@forms/core";

import { getAuditController } from "../controllers";
import { IAuditService } from "../services";

/**
 * Forwards a form's records to the audit service. The controller starts during render, before this effect runs, so
 * its early records are held for this subscription. Pending edits are flushed on unmount and on `pagehide`.
 */
export function useAuditRecorder(controllers: IControllerManager): void {
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
}
