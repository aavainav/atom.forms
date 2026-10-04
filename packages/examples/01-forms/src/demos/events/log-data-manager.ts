import { IReportViewerDataManager } from "@forms/report-viewer";

/** Writes one line to the event log. */
export type LogEvent = (name: string, payload?: unknown) => void;

/** Logs a call, then what it answered or why it failed, passing both through unchanged. */
function wrap<TArgs extends Array<unknown>, TResult>(name: string, call: (...args: TArgs) => Promise<TResult>, log: LogEvent): (...args: TArgs) => Promise<TResult> {
    return async (...args: TArgs) => {
        log(name, { args });

        try {
            const result = await call(...args);
            log(`${name} answered`, result);
            return result;
        }
        catch (error) {
            log(`${name} failed`, error instanceof Error ? error.message : error);
            throw error;
        }
    };
}

/**
 * Wraps a data manager so every call the report viewer makes of it is logged. A method the manager lacks stays
 * absent, since the viewer offers a feature only when its manager has the method behind it.
 */
export function logDataManager<TData extends object>(manager: IReportViewerDataManager<TData>, log: LogEvent): IReportViewerDataManager<TData> {
    const optional = <TKey extends keyof IReportViewerDataManager<TData>>(key: TKey, call: ((...args: Array<any>) => Promise<unknown>) | undefined) =>
        call ? { [key]: wrap(key, call.bind(manager), log) } : {};

    return {
        read: wrap("read", manager.read.bind(manager), log),
        ...optional("deletePreset", manager.deletePreset),
        ...optional("readPresets", manager.readPresets),
        ...optional("readTemplates", manager.readTemplates),
        ...optional("write", manager.write),
        ...optional("writeAudit", manager.writeAudit),
        ...optional("writeBundle", manager.writeBundle),
        ...optional("writeComments", manager.writeComments),
        ...optional("writePreset", manager.writePreset)
    };
}
