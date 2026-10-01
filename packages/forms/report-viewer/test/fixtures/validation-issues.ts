import { ControllerManager, FormModel, IRuleIssue, RuleIssueSeverity, SectionDefinition } from "@forms/core";

/** A page of the stub form: its definition's title, and the ids of its instances in order. */
export interface IStubPage {
    readonly title: string;
    readonly ids: ReadonlyArray<string>;
}

/** What an issue needs to say where it is, and what it says. */
export interface IStubIssue {
    readonly field: { readonly id?: string; readonly label: string; readonly name: string };
    readonly message: string;
    readonly page: IStubPage;
    /** The id of the page instance the issue was raised on. */
    readonly pageId: string;
    readonly section: string;
    readonly severity?: RuleIssueSeverity;
    /** Whether the section holds the same values on every copy of a repeating page. */
    readonly shared?: boolean;
}

const issuePages = new WeakMap<IRuleIssue, string>();

/** Builds an issue the panel can place: its section, made on the real definition's prototype, answers with its page. */
export function issue({ field, message, page, pageId, section, severity = RuleIssueSeverity.error, shared = false }: IStubIssue): IRuleIssue {
    const built: IRuleIssue = {
        field: { ...field, value: "" },
        message,
        section: Object.assign(Object.create(SectionDefinition.prototype), { isShared: shared, title: section, getPageDefinition: () => page }),
        severity
    };

    issuePages.set(built, pageId);

    return built;
}

/** A controller manager over a stub form, made on the real form's prototype, that knows only the pages given and which page each issue was raised on. */
export function controllersFor(pages: ReadonlyArray<IStubPage>): ControllerManager {
    const controllers = new ControllerManager();
    const form: FormModel<any> = Object.assign(Object.create(FormModel.prototype), {
        history: [],
        id: "form-1",
        mode: "editable",
        name: "Stub",
        status: "draft",
        version: "1.0",
        getPageIdForIssue: (raised: IRuleIssue) => issuePages.get(raised),
        getPagesFor: (definition: IStubPage) => (pages.find(page => page === definition)?.ids ?? []).map(id => ({ id }))
    });

    controllers.loadForm(form);

    return controllers;
}
