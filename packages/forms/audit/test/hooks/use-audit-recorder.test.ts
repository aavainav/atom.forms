import { act, createElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager } from "@forms/core";
import type { IServiceCollection } from "@shrub/core";

import { useAuditRecorder } from "../../src/hooks/use-audit-recorder";
import { getAuditController } from "../../src/controllers/audit-controller";
import type { AuditRecord } from "../../src/models/audit-record";
import { AuditService } from "../../src/services/audit";
import { stubForm } from "../fixtures/stub-form";
import type { IStubFormOptions } from "../fixtures/stub-form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

interface IMount {
    readonly manager: ControllerManager;
    readonly records: Array<AuditRecord>;
    /** Hands the hook a different manager, as a host that opens another report does. */
    render(controllers: ControllerManager): void;
    unmount(): void;
}

/** A component whose only job is to call the hook, since no testing library is installed to render a bare hook. */
function Harness({ controllers }: { controllers: ControllerManager }): null {
    useAuditRecorder(controllers);
    return null;
}

function kinds(records: ReadonlyArray<AuditRecord>): Array<string> {
    return records.map(record => record.kind);
}

/** Mounts the hook for a freshly loaded form, with the records it forwards collected off a real service. */
function mount(options?: IStubFormOptions, isStrict = false): IMount {
    const manager = new ControllerManager();
    manager.loadForm(stubForm({ name: "Dana" }, options));

    const service = new AuditService();
    const records: Array<AuditRecord> = [];
    service.onRecord(record => records.push(record));

    const services = { get: () => service } as unknown as IServiceCollection;
    const root = createRoot(document.createElement("div"));
    const unmount = (): void => act(() => root.unmount());
    const render = (controllers: ControllerManager): void => {
        const tree = createElement(ServicesContext.Provider, { value: services }, createElement(Harness, { controllers }));

        // React only sets effects up twice for a StrictMode that is the outermost element
        act(() => root.render(isStrict ? createElement(StrictMode, undefined, tree) : tree));
    };

    render(manager);
    mounted.push(unmount);

    return { manager, records, render, unmount };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("useAuditRecorder", () => {
    it("forwards what was recorded while the form loaded, before it mounted", () => {
        const { records } = mount();

        expect(kinds(records)).toEqual(["form-opened"]);
    });

    it("marks the opening with the form's mode, and no other record", () => {
        expect(mount({ mode: "viewable" }).records[0]).toMatchObject({ kind: "form-opened", mode: "viewable" });
        expect(mount().records[0]).toMatchObject({ kind: "form-opened", mode: "editable" });

        const { manager, records } = mount({ mode: "viewable" });
        getAuditController(manager).recordSaved();

        expect(records[1]).not.toHaveProperty("mode");
    });

    it("forwards what is recorded while it is mounted", () => {
        const { manager, records } = mount();

        getAuditController(manager).recordSaved();

        expect(kinds(records)).toEqual(["form-opened", "saved"]);
    });

    it("forwards the pending edits and then the close when the manager closes, and nothing after", () => {
        const { manager, records } = mount();
        manager.getFormController().setForm(stubForm({ name: "Riley" }));

        manager.close();
        getAuditController(manager).recordSaved();

        expect(kinds(records)).toEqual(["form-opened", "fields-edited", "form-closed"]);
    });

    it("keeps forwarding after it unmounts, since it lasts as long as the manager does", () => {
        const { manager, records, unmount } = mount();

        unmount();
        getAuditController(manager).recordSaved();

        expect(kinds(records)).toEqual(["form-opened", "saved"]);
    });

    /** In development React sets an effect up, cleans it up and sets it up again at once. */
    it("forwards each record once for the remount React's StrictMode does in development", () => {
        const { manager, records } = mount(undefined, true);

        getAuditController(manager).recordSaved();

        expect(kinds(records)).toEqual(["form-opened", "saved"]);
    });

    it("forwards each record once when it renders again", () => {
        const { manager, records, render } = mount();

        render(manager);
        getAuditController(manager).recordSaved();

        expect(kinds(records)).toEqual(["form-opened", "saved"]);
    });

    it("forwards the records of a different manager when it is handed one", () => {
        const { records, render } = mount();
        const next = new ControllerManager();
        next.loadForm(stubForm({ name: "Riley" }, { id: "form-2" }));

        render(next);
        getAuditController(next).recordSaved();

        expect(records.map(record => [record.kind, record.form.id])).toEqual([["form-opened", "form-1"], ["form-opened", "form-2"], ["saved", "form-2"]]);
    });
});
