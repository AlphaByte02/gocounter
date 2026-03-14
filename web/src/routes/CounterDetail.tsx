import { A, createAsync, useParams, type RoutePreloadFuncArgs } from "@solidjs/router";
import { type Component, For, Show, createMemo, createSignal } from "solid-js";
import BarChart from "../components/BarChart";
import YearSelector from "../components/YearSelector";
import { getCounter, getCounterData, getCounterStats } from "../lib/api";
import { byDay, byHour, byMonth, byWeekday, byYear } from "../lib/chartData";
import { availableYears, currentYear } from "../lib/dates";
import type { CounterStats } from "@/types";
import { roundDecimal } from "@/lib/helpers";

// ── Preload ───────────────────────────────────────────────────────────────────

export function counterDetailPreload({ params }: RoutePreloadFuncArgs) {
    if (!params.id) return;

    void getCounter(params.id);
    void getCounterData(params.id);
}

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard: Component<{ label: string; value: string | number }> = (props) => (
    <div class="bg-surface-2 border border-border rounded-2xl px-5 py-4 flex flex-col gap-1">
        <p class="text-xs text-muted font-body uppercase tracking-wider">{props.label}</p>
        <p class="font-mono font-semibold text-2xl text-text-primary">{props.value}</p>
    </div>
);

// ── Tab button ────────────────────────────────────────────────────────────────

const TAB_VIEWS = ["Mese", "Anno", "Giorno settimana", "Giorno", "Ora"] as const;
type TabView = (typeof TAB_VIEWS)[number];

const TabButton: Component<{ label: string; active: boolean; onClick: () => void; disabled?: boolean }> = (props) => (
    <button
        onClick={props.onClick}
        disabled={props.disabled}
        class="px-3 py-1.5 rounded-lg text-sm font-body transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
        classList={{
            "bg-accent/20 text-accent border border-accent/40": props.active,
            "text-muted hover:text-text-secondary hover:bg-surface-3 border border-transparent": !props.active,
        }}
    >
        {props.label}
    </button>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const CounterDetail: Component = () => {
    const params = useParams<{ id: string }>();
    const [selectedYear, setSelectedYear] = createSignal<number | null>(currentYear());
    const [activeTab, setActiveTab] = createSignal<TabView>("Mese");

    const counter = createAsync(() => getCounter(params.id));
    const data = createAsync(() => getCounterData(params.id, selectedYear() ?? undefined), { initialValue: [] });
    const stats = createAsync(() => getCounterStats(params.id, selectedYear() ?? undefined), {
        initialValue: undefined,
    });

    const years = createMemo(() => {
        const c = counter();
        if (!c) return [currentYear()];
        return availableYears(new Date(c.created_at).getFullYear());
    });

    const items = createMemo(() => data() ?? []);
    const hasData = createMemo(() => items().length > 0);

    // Grafici — calcolati solo quando servono
    const monthData = createMemo(() => byMonth(items()));
    const weekdayData = createMemo(() => byWeekday(items()));
    const hourData = createMemo(() => byHour(items()));
    const dayData = createMemo(() => byDay(items()));
    const yearData = createMemo(() => byYear(items()));

    const availableTabs = createMemo<TabView[]>(() =>
        TAB_VIEWS.filter((t) => {
            if (t === "Anno" && yearData() === null) return false;
            if (t === "Giorno" && (!selectedYear() === null || selectedYear() !== currentYear())) return false;
            return true;
        }),
    );

    createMemo(() => {
        if (!availableTabs().includes(activeTab())) setActiveTab("Mese");
    });

    const statVal = (key: keyof CounterStats) =>
        stats.latest?.[key] != null
            ? key === "avg"
                ? roundDecimal(Number(stats.latest[key]), 2)
                : stats.latest[key]
            : stats()?.[key] != null
              ? key === "avg"
                  ? roundDecimal(Number(stats()![key]), 2)
                  : stats()![key]
              : "—";

    return (
        <div class="min-h-screen bg-surface-0 text-text-primary font-body">
            <div
                class="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    "background-image":
                        "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    "background-size": "40px 40px",
                }}
            />

            <div class="relative max-w-6xl mx-auto px-4 py-12">
                {/* Back nav */}
                <div class="mb-6">
                    <A
                        href="/"
                        class="text-muted hover:text-text-secondary transition-colors text-sm font-body inline-flex items-center gap-1"
                    >
                        <span class="opacity-60">←</span> home
                    </A>
                </div>

                {/* Header */}
                <header class="mb-10">
                    <Show when={counter()} fallback={<div class="h-10 w-48 bg-surface-2 rounded-xl animate-pulse" />}>
                        <h1 class="font-display font-extrabold text-4xl text-text-primary tracking-tight mb-1">
                            {counter()!.name}
                        </h1>
                        <p class="text-muted text-sm font-body">
                            creato il{" "}
                            {new Date(counter()!.created_at).toLocaleDateString("it-IT", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </Show>
                </header>

                {/* Year filter */}
                <div class="mb-10 py-4">
                    <YearSelector selected={selectedYear()} onChange={setSelectedYear} years={years()} />
                    <Show when={selectedYear()}>
                        <p class="text-center text-xs text-muted mt-3 font-body">
                            Dati dal <span class="text-accent font-mono">1 gen {selectedYear()}</span> ad oggi
                        </p>
                    </Show>
                </div>

                {/* Stats row */}
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    <StatCard label="Totale" value={statVal("total")} />
                    <StatCard label="Media" value={statVal("avg")} />
                    <StatCard label="Days" value={statVal("days")} />
                </div>

                <Show
                    when={hasData()}
                    fallback={
                        <div class="text-center py-24 text-muted">
                            <p class="text-5xl mb-4 opacity-30">◎</p>
                            <p class="font-body text-sm">Nessun dato per il periodo selezionato.</p>
                        </div>
                    }
                >
                    {/* Tab selector */}
                    <div class="flex gap-2 flex-wrap mb-5">
                        <For each={availableTabs()}>
                            {(tab) => (
                                <TabButton label={tab} active={activeTab() === tab} onClick={() => setActiveTab(tab)} />
                            )}
                        </For>
                    </div>

                    {/* Chart panel */}
                    <div class="bg-surface-2 border border-border rounded-2xl p-6">
                        <Show when={activeTab() === "Mese"}>
                            <BarChart
                                labels={monthData().labels}
                                datasets={[
                                    { label: "TOT", data: monthData().totals, type: "bar", order: 2 },
                                    {
                                        label: "AVG",
                                        data: monthData().avgs,
                                        type: "line",
                                        order: 1,
                                        yAxisID: "y2",
                                        tension: 0.4,
                                        pointRadius: 3,
                                    },
                                    {
                                        label: "AVG cum.",
                                        data: monthData().cumulativeAvgs,
                                        type: "line",
                                        order: 0,
                                        yAxisID: "y2",
                                        tension: 0.4,
                                        pointRadius: 2,
                                        borderDash: [5, 5],
                                    },
                                ]}
                                dualAxis
                                height={500}
                            />
                        </Show>

                        <Show when={activeTab() === "Anno" && yearData()}>
                            <BarChart
                                labels={yearData()!.labels}
                                datasets={[
                                    { label: "TOT", data: yearData()!.totals, type: "bar", order: 1 },
                                    {
                                        label: "Annual Average",
                                        data: yearData()!.avgs,
                                        type: "line",
                                        order: 0,
                                        yAxisID: "y2",
                                        tension: 0.4,
                                        pointRadius: 3,
                                    },
                                ]}
                                dualAxis
                                rightAxisType="logarithmic"
                                height={500}
                            />
                        </Show>

                        <Show when={activeTab() === "Giorno settimana"}>
                            <BarChart
                                labels={weekdayData().labels}
                                datasets={[{ label: "TOT", data: weekdayData().totals }]}
                                height={500}
                            />
                        </Show>

                        <Show when={activeTab() === "Giorno"}>
                            <BarChart
                                labels={dayData().labels}
                                datasets={[{ label: "TOT", data: dayData().totals }]}
                                height={500}
                            />
                        </Show>

                        <Show when={activeTab() === "Ora"}>
                            <BarChart
                                labels={hourData().labels}
                                datasets={[{ label: "TOT", data: hourData().totals }]}
                                height={500}
                            />
                        </Show>
                    </div>
                </Show>
            </div>
        </div>
    );
};

export default CounterDetail;
