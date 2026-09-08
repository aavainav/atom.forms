import { IEvent } from "@common/event-emitter";

/** Defines a controller owned by a controller manager. */
export interface IController {
    /** An event that is raised when the controller's state changes. */
    readonly onChanged: IEvent<void>;

    /** Releases any resources held by the controller. */
    dispose(): void;
}
