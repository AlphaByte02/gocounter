import { A, createAsync } from "@solidjs/router";
import { type Component, Show, createMemo, createSignal } from "solid-js";

import LineChart from "@/components/LineChart";
import YearSelector from "@/components/YearSelector";

import { getCounters, getData } from "@/lib/api";
import { byAllCountersCumulative } from "@/lib/chartData";
import { availableYears, currentYear } from "@/lib/dates";

// ── Preload ───────────────────────────────────────────────────────────────────

export function allGraphPreload() {
    void getCounters();
    void getData();
}

// ── Page ──────────────────────────────────────────────────────────────────────

const AllGraph: Component = () => {
    const [selectedYear, setSelectedYear] = createSignal<number | null>(currentYear());

    const counters = createAsync(() => getCounters(), { initialValue: [] });
    const allData = createAsync(() => getData(selectedYear() ?? undefined), { initialValue: [] });

    // Anni disponibili dal counter più vecchio
    const years = createMemo(() => {
        const list = counters();
        if (!list?.length) return [currentYear()];
        const earliest = list.reduce((min, c) => {
            const y = new Date(c.created_at).getFullYear();
            return y < min ? y : min;
        }, currentYear());
        return availableYears(earliest);
    });

    const chartData = createMemo(() => byAllCountersCumulative(allData() ?? [], counters() ?? []));

    const hasData = createMemo(() => chartData().labels.length > 0);

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
                    <h1 class="font-display font-extrabold text-4xl text-text-primary tracking-tight mb-1">
                        andamento
                    </h1>
                    <p class="text-muted text-sm font-body">valore cumulativo di tutti i counter nel tempo</p>
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

                {/* Chart */}
                <Show
                    when={hasData()}
                    fallback={
                        <div class="text-center py-24 text-muted">
                            <p class="text-5xl mb-4 opacity-30">◎</p>
                            <p class="font-body text-sm">Nessun dato per il periodo selezionato.</p>
                        </div>
                    }
                >
                    <div class="bg-surface-2 border border-border rounded-2xl p-6">
                        <LineChart
                            labels={chartData().labels}
                            datasets={chartData().series.map((s) => ({
                                label: s.counterName,
                                data: s.data,
                            }))}
                            height={560}
                        />
                    </div>
                </Show>
            </div>
        </div>
    );
};

export default AllGraph;
