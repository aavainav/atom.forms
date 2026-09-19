import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";

import { AuditRecord } from "../models/audit-record";

export const IAuditService = createService<IAuditService>("forms-audit-service");

/** Defines a service that relays what happens to a form. A host subscribes to `onRecord` at startup. */
export interface IAuditService {
    /** An event that is raised for every record a form produces. */
    readonly onRecord: IEvent<AuditRecord>;

    /** Passes the record on to everyone listening. */
    record(record: AuditRecord): void;
}

@Singleton
export class AuditService implements IAuditService {
    private readonly _record = new EventEmitter<AuditRecord>("audit-record");

    get onRecord(): IEvent<AuditRecord> {
        return this._record.event;
    }

    record(record: AuditRecord): void {
        this._record.emit(record);
    }
}
