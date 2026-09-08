import { useRef, useEffect } from "react";
import { IEventListener } from "@common/event-emitter";

export type DisposableTypes = IDisposable | IDisposableFunction | IEventListener;

export interface IDisposableFunction {
    (): void;
}

export interface IDisposable {
    dispose(): void;
}

export interface IDisposableCollection {
    add(disposable: DisposableTypes): void;
}

export function useDisposables(): IDisposableCollection {
    const disposablesRef = useRef<Array<IDisposableFunction>>([]);

    useEffect(() => {
        return () => {
            disposablesRef.current.forEach(dispose => dispose());
            disposablesRef.current = [];
        };
    }, []);

    return {
        add: (disposable) => {
            const list = disposablesRef.current;
            
            if (typeof disposable === "function") {
                list.push(disposable);
                return;
            }

            if (isDisposable(disposable)) {
                list.push(disposable.dispose.bind(disposable));
                return;
            }

            // Assumes object has a .remove() method
            list.push(() => disposable.remove());
        }
    };
}

function isDisposable(disposable: DisposableTypes): disposable is IDisposable {
    return (<IDisposable>disposable).dispose !== undefined;
}