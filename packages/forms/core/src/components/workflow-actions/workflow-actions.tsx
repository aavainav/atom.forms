import React from "react";

import { IActor } from "../../models/actor";
import { IAvailableTransition, IWorkflowTransition, WorkflowGuard } from "../../models/workflow";
import { FButton } from "../button";
import { FFormStackPanel } from "../form-stackpanel";
import { FIcon } from "../icon";
import { FTooltip } from "../tooltip";

/** What each guard needs before its transition can be made, and what to tell the user while it is not so. */
const guards: Record<WorkflowGuard, { readonly isMet: (openComments: number) => boolean; readonly message: string }> = {
    hasOpenComments: { isMet: openComments => openComments > 0, message: "Add a comment first, so the author knows what to fix." },
    noOpenComments: { isMet: openComments => openComments === 0, message: "Resolve every open comment first." }
};

/** Says why a transition cannot be made yet, or nothing when it can. */
function getBlocker(transition: IWorkflowTransition, openComments: number, user?: IActor): string | undefined {
    if (!user) {
        return "Say who is using the report before making this change.";
    }

    return transition.guards?.map(guard => guards[guard]).find(guard => !guard.isMet(openComments))?.message;
}

interface IFWorkflowActionsProps {
    readonly openComments: number;
    readonly transitions: ReadonlyArray<IAvailableTransition>;
    readonly user?: IActor;

    onSelect: (transition: IAvailableTransition, user: IActor) => void;
}

/**
 * An icon button for each transition given, disabled and tooltipped with why while it can't be made -- tooltipped
 * with its title otherwise, since the button itself carries no text. Purely presentational -- which transitions
 * there are, how many comments are open and who is acting are all given as props, and a click just reports which
 * transition was chosen. Validating, confirming, saving and applying it belong to whoever renders this.
 */
export default function FWorkflowActions({ onSelect, openComments, transitions, user }: IFWorkflowActionsProps): React.JSX.Element {
    return (
        <FFormStackPanel direction="horizontal">
            {transitions.map((available, index) => {
                const blocker = getBlocker(available.transition, openComments, user);
                const button = (
                    <FButton
                        id={`workflow-${available.id}-button`}
                        variant="light"
                        type="button"
                        disabled={!!blocker}
                        onClick={() => user && onSelect(available, user)}
                    >
                        <FIcon icon={available.transition.icon} />
                    </FButton>
                );

                return (
                    <div key={available.id} className={index === 0 ? undefined : "ms-2"}>
                        {/* a disabled button raises no mouse events, so its tooltip sits on a wrapper when blocked;
                            bootstrap reads a tooltip's title once, when it is built, so a new reason needs a new tooltip */}
                        {blocker
                            ? <FTooltip key={blocker} title={blocker} placement="top"><span className="d-inline-block">{button}</span></FTooltip>
                            : <FTooltip title={available.transition.title} placement="top">{button}</FTooltip>}
                    </div>
                );
            })}
        </FFormStackPanel>
    );
}
