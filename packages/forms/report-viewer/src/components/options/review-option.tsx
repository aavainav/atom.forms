import React from "react";
import { useService } from "@common/react";
import { FBadge, FButton, FIcon, FTooltip } from "@forms/core";
import { getReviewController, useReviewComments } from "@forms/review";

import { IReportViewerOptionProps } from "../../services";
import { IReviewService } from "../../services/review";

/** Defines the option for opening the review panel, which lists the comments made on the current report. */
export const ReviewOption = ({ controllers, title }: IReportViewerOptionProps): React.JSX.Element => {
    const reviewService = useService<IReviewService>(IReviewService);
    const review = getReviewController(controllers);

    // the badge carries how many comments are still open, so it redraws as they are added and resolved
    useReviewComments(review);

    return (
        <FTooltip title={title} placement="top">
            <FButton id="review-button" variant="light" type="button" onClick={() => reviewService.togglePanel()}>
                <FIcon icon="chat-left-text" />
                {review.openCount > 0 && <FBadge variant="danger" pill overlay label="open">{review.openCount}</FBadge>}
            </FButton>
        </FTooltip>
    );
}
