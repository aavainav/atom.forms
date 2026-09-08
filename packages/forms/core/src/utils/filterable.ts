/** A callback to filter data. */
export type Filter<TData> = (data: TData) => boolean;

/** 
 * Defines an object that supports one or more filters. Each time apply is invoked, it is expected the provided
 * filter is added to any existing filters and will thus filter the data further.
 */
 export interface IFilterable<TData> {
     /** Applies a filter to the current object and returns a reference to the filter. */
    applyFilter(filter: Filter<TData>): IFilterRef<TData>;
    /** Removes all filters from the current object. */
    removeFilters(): void;
}

/** A reference to a filter that was applied to a filterable object. */
export interface IFilterRef<TData> {
    /** Removes the filter. */
    remove(): void;
    /** Replaces the filter; this is useful when needing to update/refresh an existing filter. */
    replace(filter: Filter<TData>): void;
}