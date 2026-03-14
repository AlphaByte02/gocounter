import type { Counter } from "@/types";
import type { Component } from "solid-js";

import { A, createAsync } from "@solidjs/router";
import { createMemo, createSignal, For, Show, Suspense } from "solid-js";

import CounterCard from "@/components/CounterCard";
import CreateCounterModal from "@/components/CreateCounterModal";
import DateEntryDrawer from "@/components/DateEntryDrawer";
import SettingsModal from "@/components/SettingsModal";
import YearSelector from "@/components/YearSelector";

import { getCounters } from "@/lib/api";
import { availableYears, currentYear } from "@/lib/dates";

// ── Preload (avvia il fetch prima che il componente monti) ────────────────────

export function homePreload() {
    void getCounters();
}

// ── Page ──────────────────────────────────────────────────────────────────────

const Home: Component = () => {
    const [selectedYear, setSelectedYear] = createSignal(currentYear());

    const counters = createAsync(() => getCounters(), { initialValue: [] });

    const years = createMemo(() => {
        const list = counters();
        if (!list?.length) return [currentYear()];
        const earliest = list.reduce((min, c) => {
            const y = new Date(c.created_at).getFullYear();
            return y < min ? y : min;
        }, currentYear());
        return availableYears(earliest);
    });

    // Modals
    const [settingsTarget, setSettingsTarget] = createSignal<Counter | null>(null);
    const [dateEntryTarget, setDateEntryTarget] = createSignal<Counter | null>(null);
    const [showCreate, setShowCreate] = createSignal(false);

    return (
        <div class="min-h-screen bg-surface-0 text-text-primary font-body">
            {/* Background grid */}
            <div
                class="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    "background-image":
                        "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    "background-size": "40px 40px",
                }}
            />

            <div class="relative max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <header class="mb-12 text-center">
                    <h1 class="font-display font-extrabold text-4xl text-text-primary tracking-tight mb-1">counters</h1>
                    <p class="text-muted text-sm font-body">traccia quello che vuoi</p>
                    <div class="mt-4 flex items-center justify-center gap-3">
                        <A
                            href="/feed"
                            class="text-xs text-muted hover:text-accent transition-colors font-body border border-border hover:border-accent/40 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                        >
                            <span class="w-1.5 h-1.5 rounded-full bg-muted inline-block" />
                            feed
                        </A>
                        <A
                            href="/all"
                            class="text-xs text-muted hover:text-accent transition-colors font-body border border-border hover:border-accent/40 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                        >
                            <span class="w-1.5 h-1.5 rounded-full bg-muted inline-block" />
                            andamento
                        </A>
                    </div>
                </header>

                {/* Year selector */}
                <div class="mb-10 py-4">
                    <YearSelector selected={selectedYear()} onChange={setSelectedYear} years={years()} />
                    <Show when={selectedYear()}>
                        <p class="text-center text-xs text-muted mt-3 font-body">
                            Dati dal <span class="text-accent font-mono">1 gen {selectedYear()}</span> ad oggi
                        </p>
                    </Show>
                </div>

                {/* Counter grid - 2 colonne fisse */}
                <Suspense
                    fallback={
                        <div class="grid grid-cols-2 gap-5">
                            <For each={Array(4).fill(0)}>
                                {() => <div class="bg-surface-2 rounded-2xl h-56 animate-pulse border border-border" />}
                            </For>
                        </div>
                    }
                >
                    <Show
                        when={(counters()?.length ?? 0) > 0}
                        fallback={
                            <div class="text-center py-24 text-muted">
                                <p class="text-5xl mb-4 opacity-30">◎</p>
                                <p class="font-body text-sm">Nessun counter ancora.</p>
                                <p class="font-body text-xs mt-1 text-muted/60">Creane uno per iniziare.</p>
                            </div>
                        }
                    >
                        <div class="grid grid-cols-2 gap-5">
                            <For each={counters()}>
                                {(counter) => (
                                    <CounterCard
                                        counter={counter}
                                        fromYear={selectedYear() ?? undefined}
                                        onOpenSettings={(c) => setSettingsTarget(c)}
                                    />
                                )}
                            </For>
                        </div>
                    </Show>
                </Suspense>

                {/* FAB */}
                <div class="fixed bottom-8 right-8">
                    <button
                        onClick={() => setShowCreate(true)}
                        class="w-14 h-14 rounded-full bg-accent shadow-glow hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] hover:scale-105 transition-all duration-200 flex items-center justify-center text-white text-2xl font-light"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Modals */}
            <Show when={settingsTarget()}>
                <SettingsModal
                    counter={settingsTarget()!}
                    onClose={() => setSettingsTarget(null)}
                    onSaved={() => setSettingsTarget(null)}
                    onDeleted={() => setSettingsTarget(null)}
                    onOpenDateEntry={() => {
                        const t = settingsTarget();
                        setSettingsTarget(null);
                        setDateEntryTarget(t);
                    }}
                />
            </Show>

            <Show when={showCreate()}>
                <CreateCounterModal onClose={() => setShowCreate(false)} onCreated={() => setShowCreate(false)} />
            </Show>

            <Show when={dateEntryTarget()}>
                <DateEntryDrawer
                    counter={dateEntryTarget()!}
                    onClose={() => setDateEntryTarget(null)}
                    onSaved={() => setDateEntryTarget(null)}
                />
            </Show>
        </div>
    );
};

export default Home;
