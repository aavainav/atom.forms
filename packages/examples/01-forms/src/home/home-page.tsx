import React from "react";
import { useNavigate } from "react-router";
import { useService } from "@common/react";
import { IFormCatalogItem, IFormCatalogService } from "@forms/catalog";
import { FAsyncLoader, FListGroup, FListGroupItem } from "@forms/core";
import { IReportViewerService } from "@forms/report-viewer";

import { getFormRoutePath } from "../form-routes";

/** The sandbox demos. These are not catalog forms, so unlike the forms they carry their own title and description. */
const demoRoutes: ReadonlyArray<{ readonly description: string; readonly path: string; readonly title: string }> = [
    {
        description: "Drag mock person and vehicle records onto the public contact/warning form's dropzones.",
        path: "/demo/dropzone",
        title: "Dropzone"
    },
    {
        description: "The watermark each form status stamps across a page, and that a form carries one only while it renders read-only.",
        path: "/demo/watermark",
        title: "Watermark"
    }
];

interface IHomeLinkProps {
    readonly description: string;
    /**
     * The options the report viewer offers for this form, by name -- the same list the options bar renders, asked
     * for without rendering any of it. A form that declared a `violationListId` lists Violations; the TR-310 and
     * the 432 do not. Save is absent here rather than gated off: it needs a data manager, and only the route that
     * opens a record has one.
     */
    readonly options?: ReadonlyArray<string>;
    /** The route to navigate to. A catalog form with no entry in the app's route table has none, and lists as unreachable. */
    readonly path?: string;
    readonly title: string;
    readonly version?: string;
}

/**
 * Lists every catalog form, alphabetically, alongside the route this app knows for it. A form with no entry in the
 * route table is listed rather than dropped, so registering a form's bootstrapper without adding its route shows up
 * as a visible gap instead of a silently missing row.
 */
function getFormLinks(catalogItems: Map<string, IFormCatalogItem>, getOptions: (catalogItem: IFormCatalogItem) => Array<string>): Array<IHomeLinkProps> {
    return Array.from(catalogItems.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(catalogItem => ({
            description: catalogItem.description,
            options: getOptions(catalogItem),
            path: getFormRoutePath(catalogItem.name),
            title: catalogItem.name,
            version: catalogItem.version
        }));
}

/**
 * One row in a list. The href makes it a real anchor, so the url shows on hover, while a plain click is routed by
 * react-router without reloading the app. A modified click is left to the browser, so ctrl/cmd/shift still open the
 * route in a new tab or window the way they would on any other link.
 */
function HomeLink({ description, options, path, title, version }: IHomeLinkProps): React.JSX.Element {
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }

        event.preventDefault();
        navigate(path!);
    };

    return (
        <FListGroupItem disabled={!path} href={path} onClick={path ? handleClick : undefined}>
            <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                    {title}
                    {version && <span className="badge text-bg-light fw-normal ms-2">v{version}</span>}
                </span>
                <span className="text-muted small font-monospace">{path ?? "no route registered"}</span>
            </div>
            <div className="text-muted small">{description}</div>
            {options && options.length > 0 && (
                <div className="d-flex flex-wrap align-items-center gap-1 mt-2">
                    <span className="text-muted small me-1">Options</span>
                    {options.map(option => <span key={option} className="badge rounded-pill text-bg-light border fw-normal">{option}</span>)}
                </div>
            )}
        </FListGroupItem>
    );
}

/** The sandbox front door: every form registered with the catalog, and the demos, as links into their routes. */
export default function HomePage(): React.JSX.Element {
    const formCatalogService = useService<IFormCatalogService>(IFormCatalogService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    return (
        <div className="container py-4" style={{ maxWidth: 900 }}>
            <h4 className="mb-1">Forms Sandbox</h4>
            <p className="text-muted">Pick a form to load it with its mock data, or a demo to exercise a piece of the report viewer. Each form lists the options its report viewer offers, which is what the bar in the bottom right will hold.</p>

            <h6 className="text-uppercase text-muted mt-4 mb-2">Forms</h6>
            <FAsyncLoader<Map<string, IFormCatalogItem>> op={() => formCatalogService.getLatestVersions()}>
                {(catalogItems) => (
                    <FListGroup>
                        {getFormLinks(catalogItems, catalogItem => reportViewerService.getOptions(catalogItem).map(option => option.title))
                            .map(link => <HomeLink key={link.title} {...link} />)}
                    </FListGroup>
                )}
            </FAsyncLoader>

            <h6 className="text-uppercase text-muted mt-4 mb-2">Demos</h6>
            <FListGroup>
                {demoRoutes.map(demo => (
                    <HomeLink key={demo.path} description={demo.description} path={demo.path} title={demo.title} />
                ))}
            </FListGroup>
        </div>
    );
}
