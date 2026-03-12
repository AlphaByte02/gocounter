import type { Counter } from "@/types";
import type { Component } from "solid-js";

import { createSignal, Show } from "solid-js";

import { addData } from "@/lib/api";

interface Props {
    counter: Counter;
    onClose: () => void;
    onSaved: () => void;
}

const DateEntryDrawer: Component<Props> = (props) => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    const [date, setDate] = createSignal(today);
    const [time, setTime] = createSignal(currentTime);
    const [value, setValue] = createSignal(1);
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");

    const handleSubmit = async (sign: 1 | -1) => {
        if (loading()) return;
        setLoading(true);
        setError("");
        try {
            // Combina data e ora locali in un ISO UTC corretto
            const [y, m, d] = date().split("-").map(Number);
            const [hh, mm] = time().split(":").map(Number);
            const recorded_at = new Date(y, m - 1, d, hh, mm).toISOString();

            await addData({
                counter_id: props.counter.id,
                value: value() * sign,
                recorded_at,
            });
            props.onSaved();
            props.onClose();
        } catch {
            setError("Errore durante il salvataggio.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop — click chiude */}
            <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" onClick={props.onClose} />

            {/* Drawer — stopPropagation per non chiudere cliccando dentro */}
            <div
                class="fixed bottom-0 left-0 right-0 z-50 bg-surface-2 border-t border-border rounded-t-3xl p-6 pb-10 animate-slide-up shadow-[0_-8px_40px_rgba(0,0,0,0.6)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div class="w-10 h-1 bg-surface-4 rounded-full mx-auto mb-6" />

                <h2 class="font-display font-bold text-xl text-text-primary mb-1 leading-relaxed">Aggiungi a data</h2>
                <p class="text-sm text-muted font-body mb-6">
                    <span class="text-accent">{props.counter.name}</span>
                </p>

                <div class="space-y-4">
                    {/* Data + Ora sulla stessa riga */}
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-xs text-muted font-body uppercase tracking-wider mb-1.5 block">
                                Data
                            </label>
                            <input
                                type="date"
                                value={date()}
                                max={today}
                                onInput={(e) => setDate(e.currentTarget.value)}
                                class="w-full bg-surface-3 border border-border rounded-xl px-3 py-2.5 text-text-primary font-mono text-sm focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label class="text-xs text-muted font-body uppercase tracking-wider mb-1.5 block">
                                Ora
                            </label>
                            <input
                                type="time"
                                value={time()}
                                onInput={(e) => setTime(e.currentTarget.value)}
                                class="w-full bg-surface-3 border border-border rounded-xl px-3 py-2.5 text-text-primary font-mono text-sm focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="text-xs text-muted font-body uppercase tracking-wider mb-1.5 block">
                            Quantità
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={value()}
                            onInput={(e) => setValue(Math.max(1, parseInt(e.currentTarget.value) || 1))}
                            class="w-full bg-surface-3 border border-border rounded-xl px-4 py-2.5 text-text-primary font-mono text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                    </div>

                    <Show when={error()}>
                        <p class="text-negative text-sm font-body">{error()}</p>
                    </Show>

                    <div class="flex gap-3 pt-2">
                        <button
                            onClick={() => handleSubmit(-1)}
                            disabled={loading()}
                            class="flex-1 h-12 rounded-xl bg-negative/10 border border-negative/30 text-negative hover:bg-negative/20 transition-colors font-display font-semibold text-sm disabled:opacity-40"
                        >
                            − Sottrai
                        </button>
                        <button
                            onClick={() => handleSubmit(1)}
                            disabled={loading()}
                            class="flex-1 h-12 rounded-xl bg-positive/10 border border-positive/30 text-positive hover:bg-positive/20 transition-colors font-display font-semibold text-sm disabled:opacity-40"
                        >
                            + Aggiungi
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DateEntryDrawer;
