import React, { useCallback, useEffect, useRef, useState } from "react";
import FLoadingIndicator from "../loading-indicator/loading-indicator";

export interface IAsyncOperation<TReturn = any> {
    (): Promise<TReturn>;
}

export interface IAsyncLoaderController {
    /** True if the loader is currently loading. */
    readonly isLoading: boolean;
    /** Forces the loader to reload and execute the async operation. */
    reload(): void;
}

interface IFAsyncLoaderProps<TResult> {
    /** Disables caching the result of the async operation; the operation is re-run after every render. */
    readonly disableCache?: boolean;
    readonly op: IAsyncOperation<TResult>;
    readonly loading?: React.ReactNode;
    readonly children: (result: TResult, controller: IAsyncLoaderController) => React.ReactNode;
    onInitialized?: (controller: IAsyncLoaderController) => void;
}

/** Executes an async operation and renders `children` with the result once it resolves. */
export default function FAsyncLoader<TResult = any>({ disableCache = false, op, loading, children, onInitialized }: IFAsyncLoaderProps<TResult>): React.JSX.Element {
    const [isLoading, setIsLoading] = useState(true);
    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;

    const resultRef = useRef<TResult | undefined>(undefined);
    const opRef = useRef(op);
    opRef.current = op;

    const load = useCallback((): void => {
        setIsLoading(true);

        opRef.current().then(result => {
            resultRef.current = result;
        }).finally(() => setIsLoading(false));
    }, []);

    const controllerRef = useRef<IAsyncLoaderController | undefined>(undefined);
    if (!controllerRef.current) {
        controllerRef.current = {
            get isLoading() {
                return isLoadingRef.current;
            },
            reload: load
        };
    }

    useEffect(() => {
        load();
        onInitialized?.(controllerRef.current!);
    }, []);

    if (isLoading) {
        return <>{loading ?? <FLoadingIndicator />}</>;
    }

    if (resultRef.current === undefined) {
        return <div />;
    }

    if (disableCache) {
        queueMicrotask(load);
    }

    return <>{children(resultRef.current, controllerRef.current)}</>;
}
