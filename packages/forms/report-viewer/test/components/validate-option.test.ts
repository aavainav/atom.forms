import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { RuleIssueCollection } from "@forms/core";
import type { IControllerManager, IRuleIssue } from "@forms/core";
import type { IServiceCollection } from "@shrub/core";

import { ValidateOption } from "../../src/components/options/validate-option";
import { INotificationService } from "../../src/services/notification";
import { IValidationService } from "../../src/services/validation";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const issue = { field: { name: "firstName" }, message: "Required.", section: {}, severity: 0 } as IRuleIssue;

const mounted: Array<() => void> = [];

function mount(issues: RuleIssueCollection) {
    const controllers = {} as IControllerManager;
    const validate = vi.fn(() => issues);
    const showNotification = vi.fn();
    const registry = new Map<unknown, unknown>([
        [INotificationService, { showNotification }],
        [IValidationService, { validate }]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(ValidateOption, { catalogItem: {} as never, controllers, onError: vi.fn(), showModal: vi.fn(), title: "Validate" }))));
    mounted.push(() => act(() => root.unmount()));

    act(() => container.querySelector<HTMLElement>("#validate-button")!.click());

    return { controllers, showNotification, validate };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("ValidateOption", () => {
    it("validates the form its controllers hold when it is clicked", () => {
        const { controllers, validate } = mount(new RuleIssueCollection());

        expect(validate).toHaveBeenCalledWith(controllers);
    });

    it("says nothing was found when the report is clean", () => {
        const { showNotification } = mount(new RuleIssueCollection());

        expect(showNotification).toHaveBeenCalledWith({ type: "success", message: "No validation issues found." });
    });

    it("says how many issues were found when it is not", () => {
        const { showNotification } = mount(new RuleIssueCollection([issue, issue]));

        expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "2 validation issue(s) found." });
    });
});
