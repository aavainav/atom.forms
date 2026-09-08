import React from "react";
import { FSection } from "@forms/core";

import { HeaderSectionModel } from "../../models/front-page/header-section";

interface IHeaderSectionProps {
    /** The header section's current field values. */
    readonly section: HeaderSectionModel;
}

/** Defines the header section for the front page of the S438 citation form. */
export default function HeaderSection(_props: IHeaderSectionProps): React.JSX.Element {
    return (
        <FSection>
            <div className="border border-bottom-0 border-dark text-center">
                <h4>UNIFORM TRAFFIC TICKET</h4>
                <h6 className="mb-0">STATE OF SOUTH CAROLINA</h6>
                <h6 className="mb-0">VERSUS</h6>
            </div>
        </FSection>
    );
}
