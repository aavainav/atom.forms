import { act, createElement } from "react";
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

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

interface IMount {
    readonly manager: ControllerManager;
    readonly records: Array<AuditRecord>;
    unmount(): void;
}

/** A component whose only job is to call the hook, since no testing library is installed to render a bare hook. */
function Harness({ controllers, isReadOnly }: { controllers: ControllerManager; isReadOnly?: boolean }): null {
    useAuditRecorder(controllers, isReadOnly);
    return null;
}

/** Mounts the hook for a freshly loaded form, with the records it forwards collected off a real service. */
function mount(isReadOnly?: boolean): IMount {
    const manager = new ControllerManager();
    manager.loadForm(stubForm({ name: "Dana" }));

    const service = new AuditService();
    const records: Array<AuditRecord> = [];
    service.onRecord(record => records.push(record));

    const services = { get: () => service } as unknown as IServiceCollection;
    const root = createRoot(document.createElement("div"));
    const unmount = (): void => act(() => root.unmount());

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(Harness, { controllers: manager, isReadOnly }))));
    mounted.push(unmount);

    return { manager, records, unmount };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("useAuditRecorder", () => {
    it("forwards what was recorded while the form loaded, before it mounted", () => {
        const { records } = mount();

        expect(records.map(record => record.kind)).toEqual(["form-opened"]);
    });

    it("marks the opening with whether the form is read-only, and no other record", () => {
        expect(mount(true).records[0]).toMatchObject({ kind: "form-opened", isReadOnly: true });
        expect(mount().records[0]).toMatchObject({ kind: "form-opened", isReadOnly: false });

        const { manager, records } = mount(true);
        getAuditController(manager).recordSaved();

        expect(records[1]).not.toHaveProperty("isReadOnly");
    });

    it("forwards what is recorded while it is mounted", () => {
        const { manager, records } = mount();

        getAuditController(manager).recordSaved();

        expect(records.map(record => record.kind)).toEqual(["form-opened", "saved"]);
    });

    it("records pending edits when it unmounts, and forwards nothing after", () => {
        const { manager, records, unmount } = mount();
        manager.getFormController().setForm(stubForm({ name: "Riley" }));

        unmount();
        getAuditController(manager).recordSaved();

        expect(records.map(record => record.kind)).toEqual(["form-opened", "fields-edited"]);
    });

    it("records pending edits when the page is put away", () => {
        const { manager, records } = mount();
        manager.getFormController().setForm(stubForm({ name: "Riley" }));

        window.dispatchEvent(new Event("pagehide"));

        expect(records.map(record => record.kind)).toEqual(["form-opened", "fields-edited"]);
    });

    it("stops listening for the page being put away once unmounted", () => {
        const { manager, records, unmount } = mount();

        unmount();
        manager.getFormController().setForm(stubForm({ name: "Riley" }));
        window.dispatchEvent(new Event("pagehide"));

        expect(records.map(record => record.kind)).toEqual(["form-opened"]);
    });
});
