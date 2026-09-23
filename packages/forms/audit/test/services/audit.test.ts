import { describe, expect, it } from "vitest";

import type { AuditRecord } from "../../src/models/audit-record";
import { AuditService } from "../../src/services/audit";

const record: AuditRecord = { at: 1, form: { id: "form-1", name: "Stub Form", revision: 0, version: "1.0" }, id: "record-1", kind: "saved" };

describe("AuditService", () => {
    it("hands a record to everyone listening", () => {
        const service = new AuditService();
        const first: Array<AuditRecord> = [];
        const second: Array<AuditRecord> = [];
        service.onRecord(item => first.push(item));
        service.onRecord(item => second.push(item));

        service.record(record);

        expect(first).toEqual([record]);
        expect(second).toEqual([record]);
    });

    it("stops handing records to a listener that was removed", () => {
        const service = new AuditService();
        const received: Array<AuditRecord> = [];
        const listener = service.onRecord(item => received.push(item));

        listener.remove();
        service.record(record);

        expect(received).toHaveLength(0);
    });

    it("does nothing with a record when nobody is listening", () => {
        expect(() => new AuditService().record(record)).not.toThrow();
    });
});
