import React from "react";
import { FNavTab } from "../nav-tab";

import { IControllerManager } from "../../controllers/controller-manager";
import { IPageBinding } from "../../controllers/form-controller";

import { useForm } from "../../hooks/use-form";
import { useNavigationTarget } from "../../hooks/use-navigation-target";
import { usePrintState } from "../../hooks/use-print-state";

import { PageCollection } from "../../models/page-collection";
import { PageDefinition } from "../../models/page-definition";
import { PageModel } from "../../models/page";

import { buildClasses } from "../../utils/class-names";

import { FPage } from "../page/page";
import { getStatusWatermark } from "../watermark";

interface IPageCollectionGroup<TPage extends PageModel = PageModel> {
    /** The page definition identifying a certain page type, e.g. the front page; its pages are looked up on the form directly. */
    readonly pageDefinition: PageDefinition<TPage>;
    /** Renders the page for the given binding, which is scoped to that one page instance. */
    readonly children: (binding: IPageBinding<TPage>) => React.ReactNode;
}

interface IFPageCollectionProps {
    /** The controllers belonging to the form these pages belong to; the form controller owns the form and the print controller decides whether the pages render for print. */
    readonly controllers: IControllerManager;
    /** The page collections to render as one continuous tab strip, in display order. */
    readonly groups: ReadonlyArray<IPageCollectionGroup<any>>;
    /** The content stamped diagonally across every page in the collection, overriding the watermark the form's status would otherwise carry. */
    readonly watermark?: React.ReactNode;
}

interface IPageEntry {
    /** The group this page belongs to. */
    readonly group: IPageCollectionGroup<any>;
    /** The page instance itself. */
    readonly page: PageModel;
    /** The binding for this page instance. */
    readonly binding: IPageBinding<any>;
}

/** A page collection is a group of related pages rendered together as a single continuous tab strip. Pages are numbered by position across all `groups` combined, not per group — e.g. adding a second front page numbers it "Page 2", even though front pages are their own group. While a print is in progress the tab strip gives way to the pages that print is for, laid out flat. */
export default function FPageCollection({ controllers, groups, watermark }: IFPageCollectionProps): React.JSX.Element {
    const controller = controllers.getFormController();
    const form = useForm(controller);
    const printState = usePrintState(controllers.getPrintController());
    const navigationController = controllers.getNavigationController();
    const navigationTarget = useNavigationTarget(navigationController);

    const isViewable = form.mode === "viewable";

    // a read-only form is a record of something already settled, so its status is stamped across it; an editable form is
    // still being written and carries none. an explicitly supplied watermark wins over the status-derived one.
    const pageWatermark = watermark ?? (isViewable ? getStatusWatermark(form.status) : undefined);

    const toEntries = (source: ReadonlyArray<IPageCollectionGroup<any>>): Array<IPageEntry> => source.flatMap((group) => {
        const pageCollection = form.get<PageCollection>(group.pageDefinition);
        return pageCollection.pages.map((page) => ({
            group,
            page,
            binding: controller.getPageBinding(group.pageDefinition, page.id!)
        }));
    });

    const entries: Array<IPageEntry> = toEntries(groups);

    const [activeId, setActiveId] = React.useState<string | undefined>(entries[0]?.page.id);

    // a pending navigation names the page to show, overriding whichever tab was last clicked, until the effect
    // below consumes it
    const effectiveActiveId = navigationTarget?.pageId ?? activeId;
    const activeEntry = entries.find((entry) => entry.page.id === effectiveActiveId) ?? entries[0];

    React.useEffect(() => {
        if (!navigationTarget) {
            return;
        }

        // keeps the tab active once the target is cleared below, rather than snapping back to whatever was active before
        setActiveId(navigationTarget.pageId);

        const field = document.getElementById(navigationTarget.fieldId);
        field?.scrollIntoView({ block: "center" });
        field?.focus();

        navigationController.clear();
    }, [navigationTarget, navigationController]);

    if (printState) {
        // the pages are rendered flat rather than as panes, since a print needs every page of the copy in the
        // document at once; the add and delete affordances go with the tab strip, as neither belongs on paper
        return (
            <div className={buildClasses("f-print", `f-print--${printState.layout}`)} style={getPrintStyle(printState.scale)}>
                {toEntries(selectPrintGroups(groups, printState.pageNames)).map((entry) => (
                    <FPage key={entry.page.id} formType={form.type} watermark={pageWatermark}>
                        {entry.group.children(entry.binding)}
                    </FPage>
                ))}
            </div>
        );
    }

    // the resolved active tab, not the raw activeId state, is what's handed down: if the active page was deleted,
    // this falls back to the first entry without ever needing to correct the stored activeId itself
    const resolvedActiveTab = activeEntry?.page.id ?? "";

    return (
        <div className="page-collection">
            <ul className="nav nav-tabs">
                {entries.map((entry, index) => (
                    <FNavTab.Tab
                        key={entry.page.id}
                        id={entry.page.id ?? ""}
                        title={`Page ${index + 1}`}
                        activeTab={resolvedActiveTab}
                        onSelect={setActiveId}
                    />
                ))}
            </ul>
            <div className="tab-content">
                {entries.map((entry) => (
                    <FNavTab.Pane key={entry.page.id} id={entry.page.id ?? ""} activeTab={resolvedActiveTab}>
                        <FPage
                            formType={form.type}
                            watermark={pageWatermark}
                            onAddPage={isViewable ? undefined : () => controller.addPage(entry.group.pageDefinition)}
                            // the controller asks its confirm-delete policy, so the confirmation cannot be skipped by a host that forgets to supply one
                            onDeletePage={isViewable ? undefined : () => controller.removePage(entry.group.pageDefinition, entry.page.id!)}
                        >
                            {entry.group.children(entry.binding)}
                        </FPage>
                    </FNavTab.Pane>
                ))}
            </div>
        </div>
    );
}

/** Builds the inline style carrying the scale the printed pages are shrunk by; the stylesheet falls back to their natural size when none was measured. */
function getPrintStyle(scale?: number): React.CSSProperties | undefined {
    // a custom property is not part of CSSProperties, so the literal is asserted into it
    return scale === undefined ? undefined : ({ "--f-print-scale": scale } as React.CSSProperties);
}

/**
 * Narrows the groups to the pages a print is for, in the order it names them. Selection is by page definition
 * *name* rather than by the definition itself, so a printable copy can be declared as plain strings by a form
 * module; a name matching a repeating page type contributes every instance of it.
 */
function selectPrintGroups(groups: ReadonlyArray<IPageCollectionGroup<any>>, pageNames?: ReadonlyArray<string>): ReadonlyArray<IPageCollectionGroup<any>> {
    if (!pageNames) {
        return groups;
    }

    return pageNames
        .map((pageName) => groups.find((group) => group.pageDefinition.name === pageName))
        .filter((group): group is IPageCollectionGroup<any> => group !== undefined);
}
