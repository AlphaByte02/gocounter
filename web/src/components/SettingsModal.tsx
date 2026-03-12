import type { Counter } from "@/types";
import type { Component } from "solid-js";

import { createSignal, Show } from "solid-js";

import { deleteCounter, updateCounter } from "@/lib/api";

interface Props {
    counter: Counter;
    onClose: () => void;
    onSaved: () => void;
    onDeleted: () => void;
    onOpenDateEntry: () => void;
}

const SettingsModal: Component<Props> = (props) => {
    const [name, setName] = createSignal(props.counter.name);
    const [loading, setLoading] = createSignal(false);
    const [confirmDelete, setConfirmDelete] = createSignal(false);
    const [error, setError] = createSignal("");

    const handleSave = async () => {
        if (!name().trim() || loading()) return;
        setLoading(true);
        setError("");
        try {
            await updateCounter(props.counter.id, { name: name().trim() });
            props.onSaved();
            props.onClose();
        } catch {
            setError("Errore durante il salvataggio.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (loading()) return;
        setLoading(true);
        setError("");
        try {
            await deleteCounter(props.counter.id);
            props.onDeleted();
            props.onClose();
        } catch {
            setError("Errore durante l'eliminazione.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in" onClick={props.onClose} />

            <div class="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={props.onClose}>
                <div
                    class="bg-surface-2 border border-border rounded-2xl w-full max-w-sm p-6 shadow-[0_24px_80px_rgba(0,0,0,0.7)] animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 class="font-display font-bold text-xl text-text-primary mb-1">Impostazioni</h2>
                    <p class="text-sm text-muted font-body mb-6">Modifica il counter</p>

                    <div class="mb-4">
                        <label class="text-xs text-muted font-body uppercase tracking-wider mb-1.5 block">Nome</label>
                        <input
                            type="text"
                            value={name()}
                            onInput={(e) => setName(e.currentTarget.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            class="w-full bg-surface-3 border border-border rounded-xl px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-accent transition-colors"
                            placeholder="Nome counter..."
                        />
                    </div>

                    <button
                        onClick={() => {
                            props.onOpenDateEntry();
                        }}
                        class="w-full h-10 rounded-xl bg-surface-3 border border-border hover:border-accent/40 text-text-secondary hover:text-accent text-sm font-body transition-colors mb-4 flex items-center justify-center gap-2"
                    >
                        <span>📅</span>
                        Aggiungi / Sottrai a data specifica
                    </button>

                    <Show when={error()}>
                        <p class="text-negative text-sm font-body mb-4">{error()}</p>
                    </Show>

                    {/* Save / Cancel */}
                    <div class="flex gap-3 mb-4">
                        <button
                            onClick={props.onClose}
                            class="flex-1 h-10 rounded-xl bg-surface-3 border border-border text-text-secondary hover:text-text-primary transition-colors font-body text-sm"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading() || !name().trim()}
                            class="flex-1 h-10 rounded-xl bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors font-display font-semibold text-sm disabled:opacity-40"
                        >
                            {loading() ? "..." : "Salva"}
                        </button>
                    </div>

                    {/* Delete section */}
                    <div class="border-t border-border-subtle pt-4">
                        <Show
                            when={confirmDelete()}
                            fallback={
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    class="w-full h-9 rounded-xl text-negative/60 hover:text-negative hover:bg-negative/10 border border-transparent hover:border-negative/30 transition-all text-sm font-body"
                                >
                                    Elimina counter
                                </button>
                            }
                        >
                            <p class="text-xs text-muted text-center mb-3 font-body">
                                Sicuro? L'operazione è irreversibile.
                            </p>
                            <div class="flex gap-2">
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    class="flex-1 h-9 rounded-xl bg-surface-3 border border-border text-text-secondary text-sm font-body transition-colors"
                                >
                                    No
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading()}
                                    class="flex-1 h-9 rounded-xl bg-negative/20 border border-negative/40 text-negative hover:bg-negative/30 transition-colors font-display font-semibold text-sm disabled:opacity-40"
                                >
                                    {loading() ? "..." : "Sì, elimina"}
                                </button>
                            </div>
                        </Show>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
