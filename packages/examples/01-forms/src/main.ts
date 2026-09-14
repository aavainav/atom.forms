import { WorkbenchBootstrapper } from "@forms/workbench";
import { GAUTCFormBootstrapper } from "@forms/ga-utc";
import { OKParkingFormBootstrapper } from "@forms/ok-parking";
import { OKTrafficFormBootstrapper } from "@forms/ok-traffic";
import { PublicContactOrWarningFormBootstrapper } from "@forms/public-contact-or-warning";
import { S438CitationFormBootstrapper } from "@forms/s438";
import { TR310CrashFormBootstrapper } from "@forms/tr310";

import { bootstrapper as DropzoneDemoBootstrapper } from "./demos/dropzone";
import { bootstrapper as FormsBootstrapper } from "./forms";
import { bootstrapper as HomeBootstrapper } from "./home";
import { bootstrapper as WatermarkDemoBootstrapper } from "./demos/watermark";

// Entry point and startup for the forms react app. Better place to do this?
await WorkbenchBootstrapper.start({
    // kept alphabetical
    bootstrappers: [
        DropzoneDemoBootstrapper,
        FormsBootstrapper,
        GAUTCFormBootstrapper,
        HomeBootstrapper,
        OKParkingFormBootstrapper,
        OKTrafficFormBootstrapper,
        PublicContactOrWarningFormBootstrapper,
        S438CitationFormBootstrapper,
        TR310CrashFormBootstrapper,
        WatermarkDemoBootstrapper,
    ],
    settings: {}
});
