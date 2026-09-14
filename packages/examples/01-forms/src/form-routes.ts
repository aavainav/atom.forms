import { IFormIdentity } from "@forms/core";

/** Where one catalog form is reachable in this app. */
export interface IFormRoute {
    /** The form the route renders. The version is pinned so the route cannot drift onto a newer one the catalog picks up. */
    readonly identity: Required<IFormIdentity>;
    /** The route's path, relative to the app's root route. */
    readonly path: string;
}

/**
 * Every catalog form this app routes to.
 *
 * Routing belongs to the host now -- a form package registers nothing but its catalog item -- so this table is the
 * one place the app decides where a form lives. It is read twice: once to register the routes, and once by the home
 * page to build its menu. A form registered with the catalog but missing from here is still listed on the home
 * page, marked as having no route, so a form added without a route shows as a visible gap rather than vanishing.
 */
export const formRoutes: ReadonlyArray<IFormRoute> = [
    { identity: { name: "GA Uniform Traffic Citation", version: "1.0" }, path: "ga/utc" },
    { identity: { name: "OKC Parking Violation", version: "1.0" }, path: "ok/parking" },
    { identity: { name: "OKC Traffic Citation", version: "1.0" }, path: "ok/traffic" },
    { identity: { name: "SC Form 432 - Public Contact / Warning", version: "1.0" }, path: "sc/432" },
    { identity: { name: "S438 Citation Form", version: "1.0" }, path: "sc/s438" },
    { identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" }, path: "sc/tr310" }
];

/** Returns the route for the given pathname, which is how the one route component resolves which form it is rendering. */
export function findFormRouteByPath(pathname: string): IFormRoute | undefined {
    const path = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    return formRoutes.find(route => route.path === path);
}

/** Returns the absolute url for a catalog form's route, if this app routes to it. */
export function getFormRoutePath(name: string): string | undefined {
    const route = formRoutes.find(formRoute => formRoute.identity.name === name);
    return route && `/${route.path}`;
}
