import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { IEventListener } from "@common/event-emitter";
import { useService } from "@common/react";
import { getAuditController, IAuditService } from "@forms/audit";
import { ControllerManager, FAsyncLoader, FDraggableItem } from "@forms/core";
import {
    IInitialForm,
    IModalService,
    INotificationService,
    IPresetSelectorService,
    IReportViewerComponent,
    IReportViewerService,
    IReviewService,
    IThemeService,
    IValidationService,
    IActor,
    ReportViewerForm
} from "@forms/report-viewer";

import EventLog, { EventSource, ILoggedEvent } from "./event-log";
import { logDataManager } from "./log-data-manager";
import { dropzoneDemoItems } from "../dropzone/dropzone-demo-data";
import { createExampleDataManager } from "../../example-data";

const identity = { name: "S438 Citation Form", version: "1.0" };
const officer: IActor = { agency: "Planet Express", badgeId: "2999", id: "fry", name: "Philip J. Fry", rank: "Delivery Boy" };

/** The most entries the log keeps, so a long session doesn't grow the page without end. */
const maxEntries = 500;

/** What to do on the form, and the events each brings. */
const suggestions: ReadonlyArray<string> = [
    "Type in a field: the controller's activity and the audit's records",
    "Drag a person below onto the violator: drag start and end, then a drop",
    "Add a violation, or apply a preset: their activity and audit records",
    "Save: the data manager's write calls",
    "Start a new form from a template: read, templates, and a modal",
    "Validate: the issues shown, and a notification",
    "Toggle night mode, open the review or presets panel, add a comment",
    "Switch to another browser tab and back: the controllers' closed and opened"
];

/**
 * Demonstrates every hook and event the report viewer offers a host, logging each as it is raised: the data
 * manager's calls, the component handle's `onPreferencesChanged`, the controllers' events, and the report viewer's
 * and audit's services.
 *
 * It uses `ReportViewerForm` with controllers the page owns, as the dropzone demo does: `ReportViewer` keeps its
 * controllers to itself, so a host that wants their events has to own them.
 */
export default function EventsDemoPage(): React.JSX.Element {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);
    const auditService = useService<IAuditService>(IAuditService);
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const presetSelectorService = useService<IPresetSelectorService>(IPresetSelectorService);
    const reviewService = useService<IReviewService>(IReviewService);
    const themeService = useService<IThemeService>(IThemeService);
    const validationService = useService<IValidationService>(IValidationService);

    const [searchParams, setSearchParams] = useSearchParams();
    const [component, setComponent] = useState<IReportViewerComponent | null>(null);
    const [entries, setEntries] = useState<ReadonlyArray<ILoggedEvent>>([]);
    const [isPaused, setIsPaused] = useState(false);

    // read through refs, so the subscriptions below aren't torn down and set up again whenever these change
    const isPausedRef = useRef(isPaused);
    isPausedRef.current = isPaused;
    const nextId = useRef(0);

    const log = useCallback((source: EventSource, name: string, payload?: unknown, isNoisy = false): void => {
        if (isPausedRef.current) {
            return;
        }

        const entry: ILoggedEvent = { at: new Date(), id: nextId.current++, isNoisy, name, payload, source };
        // some events are raised while the form is rendering, and state set then belongs to the next tick
        queueMicrotask(() => setEntries(current => [entry, ...current].slice(0, maxEntries)));
    }, []);

    // the page owns the controllers, so it can hear them and hand the same set to the form and the draggable items
    const controllers = useMemo(() => new ControllerManager(), []);

    const dataManager = useMemo(() => {
        // keeping the history brings the audit and comment writes, and the review panel with them
        const manager = createExampleDataManager(identity, searchParams, setSearchParams, true);
        return manager && logDataManager(manager, (name, payload) => log("Data manager", name, payload));
    }, [searchParams, log]);

    // the controllers: whole-form events, what each change was, and the controllers that make them up
    useEffect(() => {
        const dragAndDrop = controllers.getDragAndDropController();
        // opened and closed are the page being put away and brought back, as switching tabs or the back-forward cache do
        const listeners: Array<IEventListener> = [
            controllers.onOpened(() => log("Controller", "onOpened")),
            controllers.onClosed(() => log("Controller", "onClosed")),
            controllers.onActivity(args => log("Controller", "onActivity", "form" in args ? { activity: args.activity, form: args.form.id ?? "unsaved" } : args)),
            controllers.onControllerChanged(({ key }) => log("Controller", "onControllerChanged", { key }, true)),
            controllers.onPreferencesChanged(preferences => log("Controller", "onPreferencesChanged", preferences)),
            dragAndDrop.onDragStart(item => log("Controller", "drag and drop: onDragStart", item, true)),
            dragAndDrop.onDragEnd(() => log("Controller", "drag and drop: onDragEnd", undefined, true))
        ];

        return () => listeners.forEach(listener => listener.remove());
    }, [controllers, log]);

    // the services every report viewer in the app shares
    useEffect(() => {
        const listeners: Array<IEventListener> = [
            auditService.onRecord(record => log("Service", "IAuditService.onRecord", record)),
            modalService.onShowModal(({ id, options }) => log("Service", "IModalService.onShowModal", { id, title: options.title })),
            modalService.onCloseModal(({ id, options }) => log("Service", "IModalService.onCloseModal", { id, title: options.title })),
            notificationService.onShowNotification(notification => log("Service", "INotificationService.onShowNotification", notification)),
            presetSelectorService.onOpenSelector(() => log("Service", "IPresetSelectorService.onOpenSelector")),
            reviewService.onTogglePanel(() => log("Service", "IReviewService.onTogglePanel")),
            themeService.onThemeChanged(theme => log("Service", "IThemeService.onThemeChanged", theme)),
            validationService.onShowIssues(issues => log("Service", "IValidationService.onShowIssues", issues.map(issue => ({ field: issue.field.name, message: issue.message, severity: issue.severity }))))
        ];

        return () => listeners.forEach(listener => listener.remove());
    }, [auditService, modalService, notificationService, presetSelectorService, reviewService, themeService, validationService, log]);

    // the component handle, once the form has loaded; the audit controller can be reached only then too
    useEffect(() => {
        if (!component) {
            return;
        }

        const listeners: Array<IEventListener> = [
            component.onPreferencesChanged(preferences => log("Component", "onPreferencesChanged", preferences)),
            getAuditController(controllers).onRecord(record => log("Controller", "audit: onRecord", record))
        ];

        return () => listeners.forEach(listener => listener.remove());
    }, [component, controllers, log]);

    const people = dropzoneDemoItems.filter(item => item.type === "person");

    return (
        <div className="d-flex align-items-start" style={{ gap: "1rem" }}>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <FAsyncLoader<IInitialForm> op={() => reportViewerService.loadForm(identity, dataManager)}>
                    {(initialForm) => (
                        <ReportViewerForm
                            ref={setComponent}
                            controllers={controllers}
                            initialForm={initialForm}
                            dataManager={dataManager}
                            mode="editable"
                            showOptions
                            user={officer}
                        />
                    )}
                </FAsyncLoader>
            </div>
            <div className="position-sticky" style={{ top: "1rem", width: 420, flexShrink: 0 }}>
                <h6>Try this</h6>
                <ul className="small text-muted ps-3">
                    {suggestions.map(suggestion => <li key={suggestion}>{suggestion}</li>)}
                </ul>
                <div className="d-flex mb-3" style={{ gap: ".5rem" }}>
                    {people.map(item => (
                        <FDraggableItem key={item.id} controller={controllers.getDragAndDropController()} itemData={item}>
                            <div className="card p-2 small" style={{ cursor: "grab" }}>Drag {"firstName" in item.data ? item.data.firstName : item.id}</div>
                        </FDraggableItem>
                    ))}
                </div>
                <EventLog entries={entries} isPaused={isPaused} onClear={() => setEntries([])} onTogglePause={() => setIsPaused(current => !current)} />
            </div>
        </div>
    );
}
