import { IFormIdentity } from "@forms/core";
import { createService, Singleton } from "@shrub/core";

import { IViolation, IViolationBinding, IViolationListDefinition, ViolationList } from "../models";

export const IViolationService = createService<IViolationService>("forms-violation-service");
export const IViolationRegistrationService = createService<IViolationRegistrationService>("forms-violation-registration-service");

/** Defines the service for reading the violations a citation can be written for. */
export interface IViolationService {
    /** The ids of every registered list. */
    readonly listIds: ReadonlyArray<string>;

    /** Finds the violation carrying the given code in the identified list. */
    findByCode(listId: string, code: string): Promise<IViolation | undefined>;
    /** Gets the binding declaring how the identified form takes a violation, or undefined when the form declared none. */
    getBinding(identity: IFormIdentity): IViolationBinding | undefined;
    /** Gets every violation in the identified list. */
    getViolations(listId: string): Promise<ReadonlyArray<IViolation>>;
    /** Finds the violations in the identified list matching the given term; an empty term answers with the whole list. */
    search(listId: string, term: string): Promise<ReadonlyArray<IViolation>>;
}

/** Defines the service for registering violation lists and the forms that draw on them. */
export interface IViolationRegistrationService {
    /** Registers a violation list. A list registered under an id already in use replaces it outright. */
    registerList(definition: IViolationListDefinition): void;
    /** Registers how the identified form takes a violation. Only one binding may be registered per identity. */
    registerViolations(identity: IFormIdentity, binding: IViolationBinding): void;
}

@Singleton
export class ViolationService implements IViolationService, IViolationRegistrationService {
    private readonly bindings: Map<string, IViolationBinding> = new Map<string, IViolationBinding>();
    private readonly definitions: Map<string, IViolationListDefinition> = new Map<string, IViolationListDefinition>();
    private readonly lists: Map<string, Promise<ViolationList>> = new Map<string, Promise<ViolationList>>();

    get listIds(): ReadonlyArray<string> {
        return Array.from(this.definitions.keys());
    }

    public async findByCode(listId: string, code: string): Promise<IViolation | undefined> {
        return (await this.getList(this.getDefinition(listId))).findByCode(code);
    }

    public getBinding(identity: IFormIdentity): IViolationBinding | undefined {
        return this.bindings.get(getBindingKey(identity));
    }

    public async getViolations(listId: string): Promise<ReadonlyArray<IViolation>> {
        return (await this.getList(this.getDefinition(listId))).getViolations();
    }

    public async search(listId: string, term: string): Promise<ReadonlyArray<IViolation>> {
        return (await this.getList(this.getDefinition(listId))).search(term);
    }

    public registerList(definition: IViolationListDefinition): void {
        // replacing rather than refusing is the point of the seam: an agency serves its own current code list by
        // registering over the id the bundled one was registered under
        this.definitions.set(definition.id, definition);
        this.lists.delete(definition.id);
    }

    public registerViolations(identity: IFormIdentity, binding: IViolationBinding): void {
        if (!identity.version) {
            throw new Error(`A violation binding for the form with the name of ${identity.name} must be registered with a version.`);
        }

        const key = getBindingKey(identity);

        if (this.bindings.has(key)) {
            throw new Error(`A violation binding for the form with the name of ${identity.name} and version ${identity.version} has already been registered.`);
        }

        this.bindings.set(key, binding);
    }

    private getDefinition(listId: string): IViolationListDefinition {
        const definition = this.definitions.get(listId);

        if (!definition) {
            throw new Error(`No violation list has been registered with the id '${listId}'.`);
        }

        return definition;
    }

    private getList(definition: IViolationListDefinition): Promise<ViolationList> {
        let pending = this.lists.get(definition.id);

        if (!pending) {
            // the promise is cached rather than the resolved list, so a selector opened twice before the first load
            // settles shares that one load; a rejected load is not left cached, so the next request can retry
            pending = definition.load()
                .then(violations => new ViolationList(definition, violations))
                .catch(error => {
                    this.lists.delete(definition.id);
                    throw error;
                });

            this.lists.set(definition.id, pending);
        }

        return pending;
    }
}

/** Keys a binding by the form it belongs to. Registration rejects an identity without a version, so both sides of the lookup name a concrete one. */
function getBindingKey({ name, version }: IFormIdentity): string {
    return `${name}@${version}`;
}
