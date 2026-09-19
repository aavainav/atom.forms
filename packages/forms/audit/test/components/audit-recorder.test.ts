import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager } from "@forms/core";
import type { IServiceCollection } from "@shrub/core";

import { AuditRecorder } from "../../src/components/audit-recorder";
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

/** Mounts the recorder for a freshly loaded form, with the records it forwards collected off a real service. */
function mount(): IMount {
    const manager = new ControllerManager();
    manager.loadForm(stubForm({ name: "Dana" }));

    const service = new AuditService();
    const records: Array<AuditRecord> = [];
    service.onRecord(record => records.push(record));

    const services = { get: () => service } as unknown as IServiceCollection;
    const root = createRoot(document.createElement("div"));
    const unmount = (): void => act(() => root.unmount());

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(AuditRecorder, { controllers: manager }))));
    mounted.push(unmount);

    return { manager, records, unmount };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("AuditRecorder", () => {
    it("forwards what was recorded while the form loaded, before it mounted", () => {
        const { records } = mount();

        expect(records.map(record => record.kind)).toEqual(["form-opened"]);
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
