import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { NotesSectionModel } from "../../models/detail-page/notes-section";

interface INotesSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<NotesSectionModel>;
}

/** Defines the notes section of the Oklahoma City parking violation form's detail page. */
export const NotesSection = ({ binding }: INotesSectionProps): React.JSX.Element => {
    const section = binding.get();
    const officerNotes = section.getOfficerNotes();
    const offenseNotes = section.getOffenseNotes();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl height={80} label={officerNotes.label} labelFor={officerNotes.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={officerNotes.id}
                            disabled={!officerNotes.getIsEnabled()}
                            invalid={officerNotes.getHasError()}
                            value={officerNotes.getValue()}
                            onChange={(value) => binding.setValue(section.officerNotes, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl height={80} label={offenseNotes.label} labelFor={offenseNotes.id} borderEdges={["left", "top", "right", "bottom"]}>
                        <FFieldInput
                            id={offenseNotes.id}
                            disabled={!offenseNotes.getIsEnabled()}
                            invalid={offenseNotes.getHasError()}
                            value={offenseNotes.getValue()}
                            onChange={(value) => binding.setValue(section.offenseNotes, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
