import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useService } from "@common/react";
import { useForm, FormModel, IControllerManager, FButton, FListGroup, FListGroupCheckbox, FOffCanvas } from "@forms/core";

import { PresetList } from "./preset-list";
import { PresetPreview } from "./preset-preview";
import { emptySaveRequest, getSaveBlocker, PresetSaveForm } from "./preset-save-form";
import { IModalService, IPresetSelectorService, IPresetService, IReportPreset, IReportViewerDataManager, ISaveRequest } from "../../services";

interface IPresetsPanelProps {
    /** The controllers belonging to the form the panel acts on. */
    readonly controllers: IControllerManager;
    /** Where the presets come from, and where a saved one goes. */
    readonly dataManager: IReportViewerDataManager<any>;
    /** Invoked when the presets cannot be loaded, or one cannot be applied, saved or deleted. */
    readonly onError: (message: string) => void;
}

/** Names the variants a preset is for, by their titles, as the list says it: "For the Trial form". */
function describeVariants(preset: IReportPreset<any>, form: FormModel<any>): string {
    const ids = preset.variants ?? [form.getDefaultVariant()!.id];
    const titles = form.variants.filter(variant => ids.includes(variant.id)).map(variant => variant.title);

    return `For the ${titles.join(" or ")} form`;
}

/** Defines the panel a preset is chosen and applied from, beside the form so that it fills in as presets are applied. */
export function PresetsPanel({ controllers, dataManager, onError }: IPresetsPanelProps): React.JSX.Element {
    const modalService = useService<IModalService>(IModalService);
    const presetSelectorService = useService<IPresetSelectorService>(IPresetSelectorService);
    const presetService = useService<IPresetService>(IPresetService);

    const [draft, setDraft] = useState<ISaveRequest>(emptySaveRequest);
    const [isApplying, setIsApplying] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [overwrite, setOverwrite] = useState(false);
    const [presets, setPresets] = useState<ReadonlyArray<IReportPreset<any>>>([]);
    const [selected, setSelected] = useState<string | undefined>();

    // read through the hook, so the preview follows the form as it is edited and as presets are applied
    const form = useForm(controllers.getFormController());

    const loadPresets = useCallback(async (): Promise<void> => {
        try {
            setPresets(await dataManager.readPresets?.() ?? []);
        }
        catch {
            onError("The presets could not be loaded.");
        }
    }, [dataManager, onError]);

    useEffect(() => {
        const listener = presetSelectorService.onOpenSelector(() => setIsOpen(true));
        return () => listener.remove();
    }, [presetSelectorService]);

    // read each time the panel opens, not when the form loads, so a list the host keeps changing is not stale
    useEffect(() => {
        if (isOpen) {
            void loadPresets();
        }
    }, [isOpen, loadPresets]);

    // what the report holds, read once for each form it is, since the save step lists all of it and is rendered for every keystroke of a name
    const current = useMemo(() => form.extractData(), [form]);
    const preset = presets.find(entry => entry.id === selected);
    const plan = useMemo(() => preset && presetService.plan(preset, current, form.readOnlyFields, overwrite), [preset, presetService, current, form, overwrite]);
    // what the save step lists is worked out only while it is showing, since on a large report it runs to hundreds of rows
    const groups = useMemo(() => isSaving ? presetService.getSavableGroups(current, form.readOnlyFields) : [], [isSaving, presetService, current, form]);
    const lists = useMemo(() => isSaving ? presetService.getPageLists(current) : [], [isSaving, presetService, current]);
    // a preset for another variant of the form is listed but cannot be chosen, and says which it is for
    const unavailable = useMemo(() => new Map(presets
        .filter(entry => !presetService.fitsVariant(entry, form))
        .map(entry => [entry.id, describeVariants(entry, form)])), [presets, presetService, form]);
    const blocker = getSaveBlocker(draft);
    const canApply = !!plan && (plan.fields.length > 0 || plan.pages.length > 0) && !isApplying;

    const close = useCallback(() => {
        setIsOpen(false);
        setIsSaving(false);
        setSelected(undefined);
    }, []);

    const apply = async (): Promise<void> => {
        if (!preset) {
            return;
        }

        setIsApplying(true);

        try {
            await presetService.apply(controllers, preset, overwrite);
        }
        catch (error) {
            onError(error instanceof Error ? error.message : "The preset could not be applied.");
        }
        finally {
            setIsApplying(false);
        }
    };

    const startSaving = (): void => {
        setDraft(emptySaveRequest);
        setIsSaving(true);
    };

    const save = async (request: ISaveRequest): Promise<void> => {
        try {
            const saved = await presetService.save(controllers, dataManager, request);

            setIsSaving(false);
            setSelected(saved.id);
            await loadPresets();
        }
        catch (error) {
            onError(error instanceof Error ? error.message : "The preset could not be saved.");
        }
    };

    const remove = (): void => {
        if (!preset) {
            return;
        }

        const { id, title } = preset;

        modalService.showConfirmModal({
            title: "Delete this preset?",
            message: `"${title}" will be deleted, and cannot be applied again.`,
            confirmText: "Delete",
            onCancel: async () => {},
            onConfirm: async () => {
                try {
                    await presetService.remove(controllers, dataManager, id);
                    setSelected(undefined);
                    await loadPresets();
                }
                catch (error) {
                    onError(error instanceof Error ? error.message : "The preset could not be deleted.");
                }
            }
        });
    };

    return (
        <FOffCanvas id="presets" isOpen={isOpen} placement="end">
            <FOffCanvas.Header borderVisibility="visible" onClose={close}><h5>{isSaving ? "Save as preset" : "Presets"}</h5></FOffCanvas.Header>
            <FOffCanvas.Body>
                {isSaving
                    ? <PresetSaveForm groups={groups} lists={lists} value={draft} onChange={setDraft} />
                    : (
                        <>
                            <PresetList presets={presets} selected={selected} unavailable={unavailable} onSelect={setSelected} />
                            {plan && <PresetPreview plan={plan} />}
                        </>
                    )}
            </FOffCanvas.Body>
            {!isSaving && (
                <FOffCanvas.Footer borderVisibility="visible" direction="vertical">
                    <FListGroup borderless>
                        <FListGroupCheckbox id="presets-overwrite" checked={overwrite} label="Overwrite what is already answered" onChange={setOverwrite} />
                    </FListGroup>
                    <div className="d-flex justify-content-between mt-2">
                        <div>
                            {dataManager.writePreset && <FButton id="presets-save-button" variant="light" type="button" text="Save as preset" onClick={startSaving} />}
                            {preset?.isPersonal && dataManager.deletePreset && <FButton id="presets-delete-button" variant="light" type="button" text="Delete" onClick={remove} />}
                        </div>
                        <FButton id="presets-apply-button" variant="primary" type="button" disabled={!canApply} text="Apply" onClick={apply} />
                    </div>
                </FOffCanvas.Footer>
            )}
            {isSaving && (
                // the actions are here rather than beneath the list, which on a full report is far too long to scroll to before Save can be reached
                <FOffCanvas.Footer borderVisibility="visible" contentAlignment="center" contentJustify="between">
                    <span id="presets-save-hint" className="small text-muted">{blocker ?? `${draft.selected.size + draft.pageCounts.size} to keep`}</span>
                    <div>
                        <FButton id="preset-cancel-button" variant="light" type="button" text="Cancel" onClick={() => setIsSaving(false)} />
                        <FButton id="preset-save-button" variant="primary" type="button" disabled={!!blocker} text="Save" onClick={() => save(draft)} />
                    </div>
                </FOffCanvas.Footer>
            )}
        </FOffCanvas>
    );
}
