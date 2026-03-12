import type { Counter } from "@/types";
import type { Component } from "solid-js";

import { createSignal, Show } from "solid-js";

import { createCounter } from "@/lib/api";

interface Props {
    onClose: () => void;
    onCreated: (counter: Counter) => void;
}

const CreateCounterModal: Component<Props> = (props) => {
    const [name, setName] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");

    const handleCreate = async () => {
        if (!name().trim() || loading()) return;
        setLoading(true);
        setError("");
        try {
            const counter = await createCounter({ name: name().trim() });
            props.onCreated(counter);
            props.onClose();
        } catch {
            setError("Errore durante la creazione.");
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
                    <h2 class="font-display font-bold text-xl text-text-primary mb-1">Nuovo Counter</h2>
                    <p class="text-sm text-muted font-body mb-6">Crea un nuovo counter da tracciare</p>

                    <div class="mb-4">
                        <label class="text-xs text-muted font-body uppercase tracking-wider mb-1.5 block">Nome</label>
                        <input
                            type="text"
                            value={name()}
                            onInput={(e) => setName(e.currentTarget.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            autofocus
                            class="w-full bg-surface-3 border border-border rounded-xl px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-accent transition-colors"
                            placeholder="Es. Caffè, Passeggiate, Libri..."
                        />
                    </div>

                    <Show when={error()}>
                        <p class="text-negative text-sm font-body mb-4">{error()}</p>
                    </Show>

                    <div class="flex gap-3">
                        <button
                            onClick={props.onClose}
                            class="flex-1 h-10 rounded-xl bg-surface-3 border border-border text-text-secondary hover:text-text-primary transition-colors font-body text-sm"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={loading() || !name().trim()}
                            class="flex-1 h-10 rounded-xl bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors font-display font-semibold text-sm disabled:opacity-40"
                        >
                            {loading() ? "..." : "Crea"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateCounterModal;
