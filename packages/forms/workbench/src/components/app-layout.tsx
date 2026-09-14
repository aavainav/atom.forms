import React from "react";
import { Outlet } from "react-router";

/** The app's root route: a bare outlet the routes a host registers are rendered into. */
export default function AppLayout(): React.JSX.Element {
    return <Outlet />;
}
