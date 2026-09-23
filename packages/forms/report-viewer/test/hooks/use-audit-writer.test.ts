import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuditController } from "@forms/audit";
import type { AuditRecord } from "@forms/audit";
import { ControllerManager } from "@forms/core";
import type { FormModel } from "@forms/core";

import { useAuditWriter } from "../../src/hooks/use-audit-writer";
import type { IReportViewerDataManager } from "../../src/services/report-viewer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

const loaded: AuditRecord = { at: 1, form: { id: "form-0", name: "Stub Form", revision: 0, version: "1.0" }, id: "loaded-1", kind: "saved" };

/** A component whose only job is to call the hook, since no testing library is installed to render a bare hook. */
function Harness({ controllers, dataManager, onError }: { readonly controllers: ControllerManager; readonly dataManager?: Partial<IReportViewerDataManager<any>>; readonly onError: (message: string) => void }): null {
    useAuditWriter(controllers, dataManager as IReportViewerDataManager<any>, onError);
    return null;
}

/** Mounts the hook over a form the audit controller records, with the data manager given. */
function mount(dataManager?: Partial<IReportViewerDataManager<any>>) {
    const controllers = new ControllerManager();
    controllers.loadForm({ id: "form-1", mode: "editable", name: "Stub Form", status: "draft", version: "1.0", getRuleCollection: () => ({ getRules: () => [] }), getPagesFor: () => [{}] } as unknown as FormModel<any>);

    const audit = getAuditController(controllers);
    const onError = vi.fn();
    const root = createRoot(document.createElement("div"));

    const render = (next = dataManager): void => {
        act(() => root.render(createElement(Harness, { controllers, dataManager: next, onError })));
    };

    render();
    mounted.push(() => act(() => root.unmount()));

    return { audit, onError, render };
}

/** Every record the data manager has been handed, in order. */
function written(writeAudit: ReturnType<typeof vi.fn>): Array<string> {
    return writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.kind));
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("useAuditWriter", () => {
    it("hands over what was raised before it mounted, such as the form opening", async () => {
        const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
        mount({ writeAudit });

        await act(async () => { await Promise.resolve(); });

        expect(written(writeAudit)).toEqual(["form-opened"]);
    });

    it("hands over each record once, only the ones it has not handed over yet", async () => {
        const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
        const { audit } = mount({ writeAudit });

        await act(async () => { audit.recordSaved(); });
        await act(async () => { audit.recordSaveFailed(); });

        expect(written(writeAudit)).toEqual(["form-opened", "saved", "save-failed"]);
    });

    it("does not hand back the history that was loaded for the report", async () => {
        const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
        const { audit } = mount({ writeAudit });

        await act(async () => { audit.load([loaded]); });
        await act(async () => { audit.recordSaved(); });

        const ids = writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.id));

        expect(ids).not.toContain("loaded-1");
        expect(ids).toHaveLength(2);
    });

    it("writes one at a time, following records that land mid-write with one write of them all", async () => {
        const finishes: Array<() => void> = [];
        const writeAudit = vi.fn((_records: ReadonlyArray<AuditRecord>) => new Promise<void>(resolve => { finishes.push(resolve); }));
        const { audit } = mount({ writeAudit });

        await act(async () => { audit.recordSaved(); });
        await act(async () => { audit.recordSaveFailed(); });

        expect(writeAudit).toHaveBeenCalledTimes(1);

        await act(async () => { finishes[0](); });

        expect(writeAudit).toHaveBeenCalledTimes(2);
        expect(writeAudit.mock.calls[1][0].map(record => record.kind)).toEqual(["saved", "save-failed"]);

        await act(async () => { finishes[1](); });

        expect(writeAudit).toHaveBeenCalledTimes(2);
    });

    it("reports records that cannot be written, and hands them over again with the next", async () => {
        const writeAudit = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
        const { audit, onError } = mount({ writeAudit });

        await act(async () => { await Promise.resolve(); });

        expect(onError).toHaveBeenCalledWith("The audit history could not be saved.");

        await act(async () => { audit.recordSaved(); });

        expect(writeAudit.mock.calls[1][0].map((record: AuditRecord) => record.kind)).toEqual(["form-opened", "saved"]);
    });

    it("holds records for a data manager that cannot write them, and hands them over once one can", async () => {
        const { audit, render } = mount({});
        const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);

        await act(async () => { audit.recordSaved(); });
        render({ writeAudit });
        await act(async () => { audit.recordSaveFailed(); });

        expect(written(writeAudit)).toEqual(["form-opened", "saved", "save-failed"]);
    });

    it("stops writing once it is unmounted", async () => {
        const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
        const { audit } = mount({ writeAudit });
        await act(async () => { await Promise.resolve(); });
        writeAudit.mockClear();

        mounted.splice(0).forEach(unmount => unmount());
        audit.recordSaved();

        expect(writeAudit).not.toHaveBeenCalled();
    });
});
