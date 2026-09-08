import React, { useState } from "react";
import { PrintLayout } from "@forms/core";

import { IPrintProfile } from "../models/print-profile";
import { IPrintRequest } from "../services";

interface IPrintDialogProps {
    /** The copy and layout the dialog opens on. */
    readonly initial: IPrintRequest;
    /** The copies of the form that can be printed, in the order they are offered. */
    readonly profiles: ReadonlyArray<IPrintProfile>;
    /** Invoked with the copy and layout the user has chosen, each time either changes. */
    onChange: (request: IPrintRequest) => void;
}

/** The layouts offered, in the order they are listed. */
const layouts: ReadonlyArray<{ readonly layout: PrintLayout; readonly name: string; readonly description: string }> = [
    { layout: "top-down", name: "Top down", description: "Each page on its own sheet." },
    { layout: "side-by-side", name: "Side by side", description: "The pages beside one another on one sheet, scaled to fit." }
];

/** Defines the body of the print dialog, for choosing which copy of a form to print. */
export const PrintDialog = ({ initial, profiles, onChange }: IPrintDialogProps): React.JSX.Element => {
    const [profileId, setProfileId] = useState(initial.profileId);
    const [layout, setLayout] = useState<PrintLayout>(initial.layout ?? "top-down");

    const selectLayout = (selected: PrintLayout): void => {
        setLayout(selected);
        onChange({ profileId, layout: selected });
    };

    const selectProfile = (profile: IPrintProfile): void => {
        // each copy knows how it is meant to print, so picking one moves the layout with it; changing the layout
        // afterwards overrides that for this print alone and is not remembered against the copy
        const selected = profile.layout ?? "top-down";

        setProfileId(profile.id);
        setLayout(selected);
        onChange({ profileId: profile.id, layout: selected });
    };

    return (
        <>
            <fieldset className="mb-4">
                <legend className="fs-6 fw-bold">Copy</legend>
                {profiles.map(profile => (
                    <div className="form-check mb-2" key={profile.id}>
                        <input
                            className="form-check-input"
                            type="radio"
                            name="print-profile"
                            id={`print-profile-${profile.id}`}
                            checked={profile.id === profileId}
                            onChange={() => selectProfile(profile)}
                        />
                        <label className="form-check-label" htmlFor={`print-profile-${profile.id}`}>
                            {profile.name}
                            {profile.description && <div className="text-secondary small">{profile.description}</div>}
                        </label>
                    </div>
                ))}
            </fieldset>
            <fieldset>
                <legend className="fs-6 fw-bold">Layout</legend>
                {layouts.map(option => (
                    <div className="form-check mb-2" key={option.layout}>
                        <input
                            className="form-check-input"
                            type="radio"
                            name="print-layout"
                            id={`print-layout-${option.layout}`}
                            checked={option.layout === layout}
                            onChange={() => selectLayout(option.layout)}
                        />
                        <label className="form-check-label" htmlFor={`print-layout-${option.layout}`}>
                            {option.name}
                            <div className="text-secondary small">{option.description}</div>
                        </label>
                    </div>
                ))}
            </fieldset>
        </>
    );
}
