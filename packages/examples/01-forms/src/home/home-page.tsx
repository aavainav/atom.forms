import React from "react";
import { useService } from "@common/react";
import { IFormCatalogItem, IFormCatalogService } from "@forms/catalog";
import { FAsyncLoader, FListGroup, FListGroupItem } from "@forms/core";
import { IFormRegistration, INavigationService, IReportViewerService } from "@forms/report-viewer";

/** The catalog and the routes registered for it, which the home page lists by joining the two on the form's name. */
interface IHomeContent {
    readonly catalogItems: Map<string, IFormCatalogItem>;
    readonly registrations: Array<IFormRegistration>;
}

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
     * The options the report viewer offers for this form, by name. Every option is registered — the report
     * viewer's own included — so this is the same list the options bar renders, asked for without rendering any
     * of it. A citation lists Violations; the TR-310 and the 432 do not, because that option's `canShow` gates on
     * the form having declared how it takes one.
     */
    readonly options?: ReadonlyArray<string>;
    /** The route to navigate to. A form registered with the catalog but not with the report viewer has none, and lists as unreachable. */
    readonly path?: string;
    readonly title: string;
    readonly version?: string;
}

/**
 * Joins the catalog to the report viewer's registered routes on the form's name, listing the routed forms in
 * registration order and then any catalog form no route was registered for. An unrouted form is listed rather than
 * dropped so that registering a form's bootstrapper without registering its route shows up here as a visible gap
 * instead of a silently missing row.
 */
function getFormLinks({ catalogItems, registrations }: IHomeContent, getOptions: (catalogItem: IFormCatalogItem) => Array<string>): Array<IHomeLinkProps> {
    const routedNames = new Set(registrations.map(registration => registration.name));
    const links: Array<IHomeLinkProps> = [];

    for (const registration of registrations) {
        const catalogItem = catalogItems.get(registration.name);

        if (catalogItem) {
            links.push({
                description: catalogItem.description,
                options: getOptions(catalogItem),
                path: getLinkPath(registration),
                title: catalogItem.name,
                version: catalogItem.version
            });
        }
    }

    for (const catalogItem of catalogItems.values()) {
        if (!routedNames.has(catalogItem.name)) {
            links.push({
                description: catalogItem.description,
                options: getOptions(catalogItem),
                title: catalogItem.name,
                version: catalogItem.version
            });
        }
    }

    return links;
}

/**
 * Returns the url for a registered form. A form registers its route as a child of the report viewer's layout route,
 * so the path it registers is relative (`sc/tr310`) and the link the browser needs is absolute.
 */
function getLinkPath({ route }: IFormRegistration): string | undefined {
    return route.path ? `/${route.path.replace(/^\//, "")}` : undefined;
}

/**
 * One row in a list. The href makes it a real anchor, so the url shows on hover, while a plain click is handled by the
 * navigation service to route without reloading the app. A modified click is left to the browser, so ctrl/cmd/shift
 * still open the route in a new tab or window the way they would on any other link.
 */
function HomeLink({ description, options, path, title, version }: IHomeLinkProps): React.JSX.Element {
    const navigationService = useService<INavigationService>(INavigationService);

    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }

        event.preventDefault();
        navigationService.navigateTo(path!);
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
            <FAsyncLoader<IHomeContent> op={async () => {
                const [catalogItems, registrations] = await Promise.all([
                    formCatalogService.getLatestVersions(),
                    reportViewerService.getForms()
                ]);

                return { catalogItems, registrations };
            }}>
                {(content) => (
                    <FListGroup>
                        {getFormLinks(content, catalogItem => reportViewerService.getOptions(catalogItem).map(option => option.title))
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
