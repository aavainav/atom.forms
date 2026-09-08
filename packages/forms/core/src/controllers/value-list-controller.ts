import { EventEmitter, IEvent } from "@common/event-emitter";

import { IController } from "./controller";

import { IOptionValue } from "../models/field";

/** Defines a controller that resolves and caches the value lists backing a form's option fields. */
export interface IValueListController extends IController {
    /** Resolves the options for the specified key, invoking the loader only the first time the key is requested. */
    getOptions(key: string, loader: () => Promise<IOptionValue[]>): Promise<IOptionValue[]>;
    /** Clears the cached options for the specified key, or every cached value list when no key is given. */
    clear(key?: string): void;
}

export class ValueListController implements IValueListController {
    private readonly _changed = new EventEmitter<void>("value-list:changed");
    private readonly cache: Map<string, Promise<IOptionValue[]>> = new Map<string, Promise<IOptionValue[]>>();

    get onChanged(): IEvent<void> {
        return this._changed.event;
    }

    public getOptions(key: string, loader: () => Promise<IOptionValue[]>): Promise<IOptionValue[]> {
        let pending = this.cache.get(key);

        if (!pending) {
            // cache the promise rather than the resolved options so concurrent requests for the same key share a single load
            pending = loader().catch(error => {
                // don't leave a rejected promise cached; the next request should be able to retry
                this.cache.delete(key);
                throw error;
            });

            this.cache.set(key, pending);
            pending.then(() => this._changed.emit(), () => { });
        }

        return pending;
    }

    public clear(key?: string): void {
        if (key === undefined) {
            this.cache.clear();
        } else {
            this.cache.delete(key);
        }

        this._changed.emit();
    }

    public dispose(): void {
        this.cache.clear();
    }
}
