import { WorkbenchBootstrapper } from "@forms/workbench";
import { GAUTCFormBootstrapper } from "@forms/ga-utc";
import { OKParkingFormBootstrapper } from "@forms/ok-parking";
import { OKTrafficFormBootstrapper } from "@forms/ok-traffic";
import { PrintingBootstrapper } from "@forms/printing";
import { PublicContactOrWarningFormBootstrapper } from "@forms/public-contact-or-warning";
import { S438CitationFormBootstrapper } from "@forms/s438";
import { TR310CrashFormBootstrapper } from "@forms/tr310";

import { bootstrapper as DropzoneDemoBootstrapper } from "./demos/dropzone";
import { bootstrapper as ExampleDataBootstrapper } from "./example-data-module";
import { bootstrapper as HomeBootstrapper } from "./home";
import { bootstrapper as WatermarkDemoBootstrapper } from "./demos/watermark";

// Entry point and startup for the report viewer react app. Better place to do this?
await WorkbenchBootstrapper.start({
    bootstrappers: [
        DropzoneDemoBootstrapper,
        ExampleDataBootstrapper,
        GAUTCFormBootstrapper,
        HomeBootstrapper,
        OKParkingFormBootstrapper,
        OKTrafficFormBootstrapper,
        PrintingBootstrapper,
        PublicContactOrWarningFormBootstrapper,
        S438CitationFormBootstrapper,
        TR310CrashFormBootstrapper,
        WatermarkDemoBootstrapper,
    ],
    settings: {
        "report-viewer": {
            isReadOnly: false
        }
    }
});