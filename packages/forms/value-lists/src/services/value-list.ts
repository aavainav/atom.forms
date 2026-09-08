import { createService, Singleton } from "@shrub/core";

import { IValueListDefinition, IValueListOption, ValueList } from "../models";

export const IValueListService = createService<IValueListService>("forms-value-list-service");
export const IValueListRegistrationService = createService<IValueListRegistrationService>("forms-value-list-registration-service");

const emptyOptions: ReadonlyArray<IValueListOption> = [];

/**
 * Defines the service that resolves the value lists backing a form's option fields.
 *
 * Lists are addressed by id rather than through a method apiece, which is what lets one list hang off another
 * without either of them being special: a child list is one whose definition names a parent, and every caller
 * reaches it the same way it reaches a list that hangs off nothing.
 */
export interface IValueListService {
    /** The ids of every registered list. */
    readonly listIds: ReadonlyArray<string>;

    /**
     * Finds the option in a list whose description matches, ignoring case and surrounding whitespace, which is
     * how a name that arrived from a drop is turned into the code the form stores. A child list needs the
     * parent's value, since its descriptions are only unique underneath a single parent.
     */
    findByDescription(listId: string, description: string, parentValue?: string): Promise<IValueListOption | undefined>;
    /** Finds the option in a list carrying the given code, within the parent's options on a child list. */
    findByValue(listId: string, value: string, parentValue?: string): Promise<IValueListOption | undefined>;
    /**
     * Loads a list's options, or only those hanging off `parentValue` when the list has a parent. A child list
     * with no parent value has none, and is answered without the list being loaded at all.
     */
    getOptions(listId: string, parentValue?: string): Promise<ReadonlyArray<IValueListOption>>;
    /** Gets the id of the list the given list hangs off, or undefined when it hangs off nothing. */
    getParentId(listId: string): string | undefined;
}

/** Defines the service for registering value lists. */
export interface IValueListRegistrationService {
    /** Registers a value list. A list registered under an id already in use replaces it outright. */
    registerList(definition: IValueListDefinition): void;
}

@Singleton
export class ValueListService implements IValueListService, IValueListRegistrationService {
    private readonly definitions: Map<string, IValueListDefinition> = new Map<string, IValueListDefinition>();
    private readonly lists: Map<string, Promise<ValueList>> = new Map<string, Promise<ValueList>>();

    get listIds(): ReadonlyArray<string> {
        return Array.from(this.definitions.keys());
    }

    public async findByDescription(listId: string, description: string, parentValue?: string): Promise<IValueListOption | undefined> {
        return (await this.getList(this.getDefinition(listId))).findByDescription(description, parentValue);
    }

    public async findByValue(listId: string, value: string, parentValue?: string): Promise<IValueListOption | undefined> {
        return (await this.getList(this.getDefinition(listId))).findByValue(value, parentValue);
    }

    public async getOptions(listId: string, parentValue?: string): Promise<ReadonlyArray<IValueListOption>> {
        const definition = this.getDefinition(listId);

        // an unchosen parent is the common case while a record is being filled in, and answering it here means
        // the chunk backing the child list is not fetched at all until a parent has been picked
        if (definition.parentId && !parentValue) {
            return emptyOptions;
        }

        return (await this.getList(definition)).getOptions(parentValue);
    }

    public getParentId(listId: string): string | undefined {
        return this.getDefinition(listId).parentId;
    }

    public registerList(definition: IValueListDefinition): void {
        // replacing rather than refusing is the point of the seam: a host serves one of the built-in lists from
        // somewhere else by registering over its id, and anything already loaded under it is dropped
        this.definitions.set(definition.id, definition);
        this.lists.delete(definition.id);
    }

    private getDefinition(listId: string): IValueListDefinition {
        const definition = this.definitions.get(listId);

        if (!definition) {
            throw new Error(`No value list has been registered with the id '${listId}'.`);
        }

        return definition;
    }

    private getList(definition: IValueListDefinition): Promise<ValueList> {
        let pending = this.lists.get(definition.id);

        if (!pending) {
            // the promise is cached rather than the resolved list, so selects opening at once share a single
            // load; a rejected load is not left cached, so the next request can retry
            pending = definition.load()
                .then(options => new ValueList(definition, options))
                .catch(error => {
                    this.lists.delete(definition.id);
                    throw error;
                });

            this.lists.set(definition.id, pending);
        }

        return pending;
    }
}
