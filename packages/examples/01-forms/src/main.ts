import { WorkbenchBootstrapper } from "@forms/workbench";
import { GAUTCFormBootstrapper } from "@forms/ga-utc";
import { OKParkingFormBootstrapper } from "@forms/ok-parking";
import { OKTrafficFormBootstrapper } from "@forms/ok-traffic";
import { PublicContactOrWarningFormBootstrapper } from "@forms/public-contact-or-warning";
import { S438CitationFormBootstrapper } from "@forms/s438";
import { TR310CrashFormBootstrapper } from "@forms/tr310";

import { bootstrapper as AuditDemoBootstrapper } from "./demos/audit";
import { bootstrapper as DropzoneDemoBootstrapper } from "./demos/dropzone";
import { bootstrapper as FormModeDemoBootstrapper } from "./demos/form-mode";
import { bootstrapper as ReviewDemoBootstrapper } from "./demos/review";
import { bootstrapper as FormsBootstrapper } from "./forms";
import { bootstrapper as HomeBootstrapper } from "./home";

// Entry point and startup for the forms react app. Better place to do this?
await WorkbenchBootstrapper.start({
    // kept alphabetical
    bootstrappers: [
        AuditDemoBootstrapper,
        DropzoneDemoBootstrapper,
        FormModeDemoBootstrapper,
        FormsBootstrapper,
        GAUTCFormBootstrapper,
        HomeBootstrapper,
        OKParkingFormBootstrapper,
        OKTrafficFormBootstrapper,
        PublicContactOrWarningFormBootstrapper,
        ReviewDemoBootstrapper,
        S438CitationFormBootstrapper,
        TR310CrashFormBootstrapper,
    ],
    settings: {}
});
