import React, { useEffect, useRef, useState } from "react";
import { useService } from "@common/react";
import { IControllerManager } from "@forms/core";
import { getReviewController, ReviewLayer, ReviewPanel } from "@forms/review";

import { IModalService, IReportViewerDataManager, IReviewService } from "../../services";

interface IReviewManagerProps {
    /** The controllers belonging to the form being reviewed. */
    readonly controllers: IControllerManager;
    /** Where the comments are written back to. Without one, or one with no `writeComments`, they last only as long as the form is on screen. */
    readonly dataManager?: IReportViewerDataManager<any>;

    /** Invoked when the comments cannot be saved. */
    onError: (message: string) => void;
}

/**
 * Mounts the review markers and panel at the report viewer's root, and writes the comments back through the host's
 * data manager after every change. The comments themselves were loaded with the form.
 */
export default function ReviewManager({ controllers, dataManager, onError }: IReviewManagerProps): React.JSX.Element {
    const modalService = useService<IModalService>(IModalService);
    const reviewService = useService<IReviewService>(IReviewService);

    const review = getReviewController(controllers);
    const [isOpen, setIsOpen] = useState(false);

    // read through a ref, so a data manager the host rebuilds on every render does not restart the writer
    const dataManagerRef = useRef(dataManager);
    dataManagerRef.current = dataManager;

    useEffect(() => {
        let isStale = false;
        let isWriting = false;

        // one write at a time; changes arriving meanwhile cost one more write, of the latest comments
        const save = async (): Promise<void> => {
            if (isWriting) {
                isStale = true;
                return;
            }

            isWriting = true;

            try {
                do {
                    isStale = false;
                    await dataManagerRef.current?.writeComments?.(review.comments);
                } while (isStale);
            } catch {
                onError("The review comments could not be saved.");
            } finally {
                isWriting = false;
            }
        };

        const listener = review.onChanged(() => void save());

        return () => listener.remove();
    }, [review, onError]);

    useEffect(() => {
        const listener = reviewService.onTogglePanel(() => setIsOpen(open => !open));
        return () => listener.remove();
    }, [reviewService]);

    return (
        <>
            <ReviewLayer controllers={controllers} showModal={options => modalService.showModal(options)} />
            <ReviewPanel controllers={controllers} isOpen={isOpen} showModal={options => modalService.showModal(options)} onClose={() => setIsOpen(false)} />
        </>
    );
}
