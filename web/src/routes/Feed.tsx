import type { Data } from "@/types";
import type { Component } from "solid-js";

import { A, createAsync } from "@solidjs/router";
import dayjs from "dayjs";
import { For, Show, createMemo } from "solid-js";

import { getCounters, getFeed } from "@/lib/api";

// ── Preload ───────────────────────────────────────────────────────────────────

export function feedPreload() {
    void getFeed();
    void getCounters();
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface EnrichedItem extends Data {
    counter_name: string;
}

interface TimeGroup {
    items: EnrichedItem[];
}

interface DayEntry {
    dateKey: string; // "2025-03-01"
    dateLabel: string; // "1 mar 2025"
    groups: TimeGroup[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GROUP_TIME = 5 * 60 * 1000; // 5 min.

// ── Logic ─────────────────────────────────────────────────────────────────────

function buildDayEntries(items: Data[], counterMap: Map<string, string>): DayEntry[] {
    if (!items.length) return [];

    // Enrich with counter name
    const enriched: EnrichedItem[] = items.map((item) => ({
        ...item,
        counter_name: counterMap.get(item.counter_id) ?? "–",
    }));

    // Group by day
    const byDay = new Map<string, EnrichedItem[]>();
    for (const item of enriched) {
        const key = dayjs(item.recorded_at).format("YYYY-MM-DD");
        if (!byDay.has(key)) byDay.set(key, []);
        byDay.get(key)?.push(item);
    }

    // For each day, group items within GROUP_TIME of each other
    const days: DayEntry[] = [];
    for (const [key, dayItems] of byDay) {
        const groups: TimeGroup[] = [];
        let current: EnrichedItem[] = [dayItems[0]];

        for (let i = 1; i < dayItems.length; i++) {
            const prev = new Date(dayItems[i - 1].recorded_at).getTime();
            const curr = new Date(dayItems[i].recorded_at).getTime();
            if (Math.abs(prev - curr) <= GROUP_TIME) {
                current.push(dayItems[i]);
            } else {
                groups.push({ items: current });
                current = [dayItems[i]];
            }
        }
        groups.push({ items: current });

        days.push({
            dateKey: key,
            dateLabel: new Date(`${key}T12:00:00`).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            groups,
        });
    }

    // Sort descending
    return days.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

// ── Formatting ────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ── Sub-components ────────────────────────────────────────────────────────────

const ValueBadge: Component<{ value: number }> = (props) => (
    <span
        class="inline-flex items-center font-mono text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0"
        classList={{
            "bg-positive/15 text-positive": props.value > 0,
            "bg-negative/15 text-negative": props.value < 0,
        }}
    >
        {props.value > 0 ? "+" : ""}
        {props.value}
    </span>
);

// Un gruppo di eventi ravvicinati dentro la card del giorno
const ItemGroup: Component<{ group: TimeGroup }> = (props) => (
    <Show
        when={props.group.items.length > 1}
        fallback={
            // Evento singolo: riga semplice
            <div class="flex items-center justify-between gap-3 py-2.5 px-4">
                <div class="flex items-center gap-2.5 min-w-0">
                    <span class="text-xs text-muted font-mono shrink-0">
                        {formatTime(props.group.items[0].recorded_at)}
                    </span>
                    <span class="font-display font-semibold text-sm text-text-primary truncate">
                        {props.group.items[0].counter_name}
                    </span>
                </div>
                <ValueBadge value={props.group.items[0].value} />
            </div>
        }
    >
        {/* Gruppo ravvicinato: barra laterale accent + sfondo tenue */}
        <div class="relative mx-2 my-1.5 rounded-xl overflow-hidden">
            {/* Barra laterale sinistra */}
            <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-accent/50 rounded-full" />
            <div class="bg-accent/5 pl-3 pr-2">
                <For each={props.group.items}>
                    {(item) => (
                        <div class="flex items-center justify-between gap-3 py-2 pl-1">
                            <div class="flex items-center gap-2.5 min-w-0">
                                <span class="text-xs text-muted font-mono shrink-0">
                                    {formatTime(item.recorded_at)}
                                </span>
                                <span class="font-display font-semibold text-sm text-text-primary truncate">
                                    {item.counter_name}
                                </span>
                            </div>
                            <ValueBadge value={item.value} />
                        </div>
                    )}
                </For>
            </div>
        </div>
    </Show>
);

// Card di un giorno intero
const DayCard: Component<{ entry: DayEntry; side: "left" | "right" }> = (props) => (
    <div
        class="bg-surface-2 border border-border rounded-2xl overflow-hidden w-full"
        classList={{
            "rounded-tr-sm": props.side === "right",
            "rounded-tl-sm": props.side === "left",
        }}
    >
        {/* Header giorno */}
        <div class="px-4 py-2.5 border-b border-border-subtle bg-surface-3/50">
            <span class="font-display font-semibold text-sm text-text-secondary">{props.entry.dateLabel}</span>
        </div>

        {/* Gruppi di eventi */}
        <div class="divide-y divide-border-subtle">
            <For each={props.entry.groups}>{(group) => <ItemGroup group={group} />}</For>
        </div>
    </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const Feed: Component = () => {
    const feed = createAsync(() => getFeed(), { initialValue: [] });
    const counters = createAsync(() => getCounters(), { initialValue: [] });

    // Mappa id → name, aggiornata reattivamente
    const counterMap = createMemo<Map<string, string>>(() => {
        const map = new Map<string, string>();
        for (const c of counters() ?? []) map.set(c.id, c.name);
        return map;
    });

    const days = createMemo(() => buildDayEntries(feed() ?? [], counterMap()));

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

            <div class="relative max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <header class="mb-12">
                    <div class="mb-4">
                        <A
                            href="/"
                            class="text-muted hover:text-text-secondary transition-colors text-sm font-body inline-flex items-center gap-1"
                        >
                            <span class="opacity-60">←</span> home
                        </A>
                    </div>
                    <h1 class="font-display font-extrabold text-4xl text-text-primary tracking-tight mb-1">feed</h1>
                    <p class="text-muted text-sm font-body">ultimi 200 eventi</p>
                </header>

                <Show
                    when={days().length > 0}
                    fallback={
                        <div class="text-center py-24 text-muted">
                            <p class="text-5xl mb-4 opacity-30">◎</p>
                            <p class="font-body text-sm">Nessun evento ancora.</p>
                        </div>
                    }
                >
                    {/* Timeline */}
                    <div class="relative">
                        {/* Linea verticale centrale */}
                        <div class="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border" />

                        <div class="flex flex-col gap-6">
                            <For each={days()}>
                                {(entry, i) => {
                                    const side = i() % 2 === 0 ? "left" : "right";
                                    return (
                                        <div class="relative grid grid-cols-[1fr_32px_1fr] items-start gap-2">
                                            {/* Colonna sinistra */}
                                            <div class="flex justify-end pt-2">
                                                <Show when={side === "left"}>
                                                    <div class="w-full max-w-xs animate-slide-up">
                                                        <DayCard entry={entry} side="left" />
                                                    </div>
                                                </Show>
                                            </div>

                                            {/* Dot + data centrale */}
                                            <div class="flex flex-col items-center gap-1 z-10 pt-3">
                                                <div class="w-3 h-3 rounded-full bg-surface-3 border-2 border-border-strong shrink-0" />
                                            </div>

                                            {/* Colonna destra */}
                                            <div class="flex justify-start pt-2">
                                                <Show when={side === "right"}>
                                                    <div class="w-full max-w-xs animate-slide-up">
                                                        <DayCard entry={entry} side="right" />
                                                    </div>
                                                </Show>
                                            </div>
                                        </div>
                                    );
                                }}
                            </For>
                        </div>
                    </div>
                </Show>
            </div>
        </div>
    );
};

export default Feed;
