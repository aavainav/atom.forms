import React from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip } from "@forms/core";
import { getReviewController, useReviewComments } from "@forms/review";

import { IReportViewerOptionProps } from "../../services";
import { IReviewService } from "../../services/review";

/** Defines the option for opening the review panel, which lists the comments made on the current report. */
export const ReviewOption = ({ controllers, title }: IReportViewerOptionProps): React.JSX.Element => {
    const reviewService = useService<IReviewService>(IReviewService);
    const review = getReviewController(controllers);

    // the tooltip carries how many comments are still open, so it redraws as they are added and resolved
    useReviewComments(review);

    const label = review.openCount > 0 ? `${title} (${review.openCount} open)` : title;

    return (
        // bootstrap reads a tooltip's title once, when it is built, so a title that changes needs a new tooltip
        <FTooltip key={label} title={label} placement="top">
            <FButton id="review-button" variant="light" type="button" onClick={() => reviewService.togglePanel()}>
                <FIcon icon="chat-left-text" />
            </FButton>
        </FTooltip>
    );
}
