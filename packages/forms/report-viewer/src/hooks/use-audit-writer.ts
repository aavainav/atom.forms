import { useEffect, useRef } from "react";
import { getAuditController } from "@forms/audit";
import { IControllerManager } from "@forms/core";

import { IReportViewerDataManager } from "../services";

/**
 * Hands the audit records the form raises to the data manager's `writeAudit`, after each settled batch of them.
 * Only the records it has not yet handed over are sent, one write at a time, so the host is appended to and never
 * given a record twice; a failed write leaves them for the next attempt. It lets go when the manager closes, after the
 * form's close is recorded, so that record is handed over too.
 */
export function useAuditWriter(controllers: IControllerManager, dataManager: IReportViewerDataManager<any> | undefined, onError: (message: string) => void): void {
    // read through refs, so a data manager or handler the host rebuilds on every render does not restart the writer
    const dataManagerRef = useRef(dataManager);
    dataManagerRef.current = dataManager;
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    useEffect(() => {
        controllers.attach("audit-writer", () => {
            const audit = getAuditController(controllers);
            let isStale = false;
            let isWriting = false;
            // how many of the session's records the host has been given
            let written = 0;

            const save = async (): Promise<void> => {
                if (isWriting) {
                    isStale = true;
                    return;
                }

                isWriting = true;

                try {
                    do {
                        isStale = false;

                        const writeAudit = dataManagerRef.current?.writeAudit;
                        const pending = audit.session.slice(written);

                        if (writeAudit && pending.length) {
                            await writeAudit(pending);
                            written += pending.length;
                        }
                    } while (isStale);
                } catch {
                    onErrorRef.current("The audit history could not be saved.");
                } finally {
                    isWriting = false;
                }
            };

            const listener = audit.onChanged(() => void save());

            // whatever was raised before this mounted, such as the form opening
            void save();

            return () => listener.remove();
        });
    }, [controllers]);
}
