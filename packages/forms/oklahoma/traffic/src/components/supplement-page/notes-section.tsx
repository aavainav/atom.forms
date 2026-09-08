import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { NotesSectionModel } from "../../models/supplement-page/notes-section";
import { TextBox } from "../fields";

interface INotesSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<NotesSectionModel>;
}

/** Defines the officer notes of the Oklahoma City traffic citation form's supplement page. */
export const NotesSection = ({ binding }: INotesSectionProps): React.JSX.Element => {
    const section = binding.get();
    const officerNotes = section.getOfficerNotes();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <TextBox
                        field={officerNotes}
                        height={100}
                        borderEdges={["left", "top", "right", "bottom"]}
                        onChange={(value) => binding.setValue(section.officerNotes, value)}
                    />
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
