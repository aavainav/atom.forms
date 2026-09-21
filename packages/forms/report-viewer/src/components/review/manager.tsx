import React, { useEffect, useRef, useState } from "react";
import { IEventListener } from "@common/event-emitter";
import { useService } from "@common/react";
import { IControllerManager } from "@forms/core";
import { getReviewController, ReviewLayer, ReviewPanel } from "@forms/review";

import { IModalService, IReportViewerDataManager, IReviewService } from "../../services";

interface IReviewManagerProps {
    /** The controllers belonging to the form being reviewed. */
    readonly controllers: IControllerManager;
    /** Where the record's comments are read from and written back to. Without one they last only as long as the form is on screen. */
    readonly dataManager?: IReportViewerDataManager<any>;
    /** Who comments are attributed to. Nobody can add one without it. */
    readonly reviewer?: string;

    /** Invoked when the comments cannot be loaded or saved. */
    onError: (message: string) => void;
}

/**
 * Mounts the review markers and panel at the report viewer's root, and keeps the comments in step with the host's
 * data manager: read once when the form is shown, written back after every change.
 */
export default function ReviewManager({ controllers, dataManager, reviewer, onError }: IReviewManagerProps): React.JSX.Element {
    const modalService = useService<IModalService>(IModalService);
    const reviewService = useService<IReviewService>(IReviewService);

    const review = getReviewController(controllers);
    const [isOpen, setIsOpen] = useState(false);

    // set during render rather than in an effect: the layer decides from it whether to offer commenting, and it
    // draws in this same pass
    review.setReviewer(reviewer ?? "");

    // read through a ref, so a data manager the host rebuilds on every render does not reload the comments each time
    const dataManagerRef = useRef(dataManager);
    dataManagerRef.current = dataManager;

    useEffect(() => {
        let isCurrent = true;
        let isStale = false;
        let isWriting = false;
        let listener: IEventListener | undefined;

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

        void (async () => {
            try {
                const held = await dataManagerRef.current?.readComments?.();

                if (isCurrent && held) {
                    review.load(held);
                }
            } catch {
                onError("The review comments could not be loaded.");
            }

            // subscribed only once they are in, or loading them would write them straight back
            if (isCurrent && dataManagerRef.current?.writeComments) {
                listener = review.onChanged(() => void save());
            }
        })();

        return () => {
            isCurrent = false;
            listener?.remove();
        };
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
