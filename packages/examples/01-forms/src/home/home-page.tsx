import React from "react";
import { useNavigate } from "react-router";
import { useService } from "@common/react";
import { IFormCatalogItem, IFormCatalogService } from "@forms/catalog";
import { FAsyncLoader, FListGroup, FListGroupItem } from "@forms/core";

import { createExampleDataManager } from "../example-data";
import { getFormRoutePath } from "../form-routes";

/** The sandbox demos. These are not catalog forms, so unlike the forms they carry their own title and description. */
const demoRoutes: ReadonlyArray<{ readonly description: string; readonly path: string; readonly title: string }> = [
    {
        description: "What the audit records as a form is edited, validated, printed and saved, listed live beside it.",
        path: "/demo/audit",
        title: "Audit"
    },
    {
        description: "Drag mock person and vehicle records onto the public contact/warning form's dropzones.",
        path: "/demo/dropzone",
        title: "Dropzone"
    },
    {
        description: "How a form's mode changes what's on screen: fields disabling, placeholders disappearing, and the watermark each status stamps -- everything a printed copy would show too.",
        path: "/demo/form-mode",
        title: "Form Mode"
    },
    {
        description: "Apply a preset to a report under way, or save one of your own: what it sets, what it leaves alone and why, with the audit records it raises listed beside it.",
        path: "/demo/presets",
        title: "Presets"
    },
    {
        description: "A reviewer comments on a report -- on a field, a page or the whole of it -- and the officer reads and resolves the comments, both working from the same ones.",
        path: "/demo/review",
        title: "Review"
    },
    {
        description: "A report reaches the viewer in one status and leaves it in another, moved once: a crash report from draft to approved by the officer and then the reviewer, and a citation from draft to issued.",
        path: "/demo/workflow",
        title: "Workflow"
    }
];

interface IHomeLinkProps {
    /** Sets a row apart from the ones around it, as a template is beneath the form it starts. */
    readonly className?: string;
    readonly description?: string;
    /** The route to navigate to. A catalog form with no entry in the app's route table has none, and lists as unreachable. */
    readonly path?: string;
    readonly title: string;
    readonly version?: string;
}

/**
 * Lists every catalog form, alphabetically, alongside the route this app knows for it, and beneath each the templates
 * the host offers for starting one. A form with no entry in the route table is listed rather than dropped, so
 * registering a form's bootstrapper without adding its route shows up as a visible gap instead of a silently missing row.
 */
async function getFormLinks(catalogItems: Map<string, IFormCatalogItem>): Promise<Array<IHomeLinkProps>> {
    const links: Array<IHomeLinkProps> = [];

    for (const catalogItem of Array.from(catalogItems.values()).sort((a, b) => a.name.localeCompare(b.name))) {
        const path = getFormRoutePath(catalogItem.name);
        const templates = await createExampleDataManager(catalogItem, new URLSearchParams(), () => undefined)?.readTemplates?.() ?? [];
        const standard = templates.find(entry => entry.isDefault);

        links.push({
            description: catalogItem.description,
            // starts every form new rather than mid-way through whatever was last saved for it -- from the host's
            // default template when it has one, or else as the form makes it; the "Load test data" option is how
            // to fill one in once it's open
            path: path && `${path}?${standard ? `template=${encodeURIComponent(standard.id)}` : "record=new"}`,
            title: catalogItem.name,
            version: catalogItem.version
        });

        // the default is what the form's own row starts, so it is not listed a second time
        for (const template of templates.filter(entry => entry !== standard)) {
            links.push({ className: "ps-5", description: template.description, path: path && `${path}?template=${encodeURIComponent(template.id)}`, title: template.title });
        }
    }

    return links;
}

/**
 * One row in a list. The href makes it a real anchor, so the url shows on hover, while a plain click is routed by
 * react-router without reloading the app. A modified click is left to the browser, so ctrl/cmd/shift still open the
 * route in a new tab or window the way they would on any other link.
 */
function HomeLink({ className, description, path, title, version }: IHomeLinkProps): React.JSX.Element {
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }

        event.preventDefault();
        navigate(path!);
    };

    return (
        <FListGroupItem className={className} disabled={!path} href={path} onClick={path ? handleClick : undefined}>
            <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                    {title}
                    {version && <span className="badge text-bg-light fw-normal ms-2">v{version}</span>}
                </span>
                <span className="text-muted small font-monospace">{path ?? "no route registered"}</span>
            </div>
            {description && <div className="text-muted small">{description}</div>}
        </FListGroupItem>
    );
}

/** The sandbox front door: every form registered with the catalog, and the demos, as links into their routes. */
export default function HomePage(): React.JSX.Element {
    const formCatalogService = useService<IFormCatalogService>(IFormCatalogService);

    return (
        <div className="container py-4" style={{ maxWidth: 900 }}>
            <h4 className="mb-1">Forms Sandbox</h4>
            <p className="text-muted">Pick a form to start a new one, or a demo to exercise a piece of the report viewer.</p>

            <h6 className="text-uppercase text-muted mt-4 mb-2">Forms</h6>
            <FAsyncLoader<Array<IHomeLinkProps>> op={async () => getFormLinks(await formCatalogService.getLatestVersions())}>
                {(links) => (
                    <FListGroup>
                        {links.map(link => <HomeLink key={link.path ?? link.title} {...link} />)}
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
