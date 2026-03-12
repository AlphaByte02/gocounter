import type { Counter } from "@/types";
import type { Component } from "solid-js";

import { createAsync, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";

import { addData, getCounterStats } from "@/lib/api";
import { roundDecimal } from "@/lib/helpers";

interface Props {
    counter: Counter;
    fromYear?: number;
    onOpenSettings: (counter: Counter) => void;
}

const CounterCard: Component<Props> = (props) => {
    const navigate = useNavigate();

    const [loading, setLoading] = createSignal(false);
    const [popping, setPopping] = createSignal(false);

    const stats = createAsync(() => getCounterStats(props.counter.id, props.fromYear), { initialValue: undefined });

    const total = () => stats()?.total ?? 0;

    const triggerPop = () => {
        setPopping(true);
        setTimeout(() => setPopping(false), 300);
    };

    const handleIncrement = async () => {
        if (loading()) return;
        setLoading(true);
        try {
            await addData({ counter_id: props.counter.id, value: 1 });
            triggerPop();
        } finally {
            setLoading(false);
        }
    };

    const handleDecrement = async () => {
        if (loading()) return;
        setLoading(true);
        try {
            await addData({ counter_id: props.counter.id, value: -1 });
            triggerPop();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div class="relative bg-surface-2 rounded-2xl p-6 shadow-card border border-border hover:border-border-strong transition-all duration-300 flex flex-col gap-5">
            {/* Header */}
            <div class="flex items-start justify-between gap-2">
                <h3 class="font-display font-semibold text-text-primary text-lg leading-tight break-words max-w-[80%]">
                    {props.counter.name}
                </h3>
                <button
                    onClick={() => props.onOpenSettings(props.counter)}
                    class="flex flex-col gap-[3px] items-center justify-center w-7 h-7 rounded-lg hover:bg-surface-4 text-muted hover:text-text-secondary transition-colors shrink-0 mt-0.5"
                    title="Impostazioni"
                >
                    <span class="w-[3px] h-[3px] rounded-full bg-current" />
                    <span class="w-[3px] h-[3px] rounded-full bg-current" />
                    <span class="w-[3px] h-[3px] rounded-full bg-current" />
                </button>
            </div>

            {/* Value */}
            <div class="flex items-center justify-center py-3">
                <span
                    class="font-mono font-semibold text-6xl tabular-nums transition-all duration-200"
                    classList={{
                        "animate-counter-pop": popping(),
                        "text-negative": total() < 0,
                        "text-text-primary": total() >= 0,
                    }}
                >
                    {total()}
                </span>
            </div>

            {/* +/- Controls */}
            <div class="flex items-center gap-2">
                <button
                    onClick={handleDecrement}
                    disabled={loading()}
                    class="flex-1 h-11 rounded-xl bg-surface-3 hover:bg-negative/10 border border-border hover:border-negative/40 text-muted hover:text-negative transition-all duration-200 font-mono text-2xl font-light disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    −
                </button>
                <button
                    onClick={handleIncrement}
                    disabled={loading()}
                    class="flex-1 h-11 rounded-xl bg-surface-3 hover:bg-positive/10 border border-border hover:border-positive/40 text-muted hover:text-positive transition-all duration-200 font-mono text-2xl font-light disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    +
                </button>
            </div>

            {/* Stats footer + detail link */}
            <div class="flex items-center justify-between pt-3 border-t border-border-subtle">
                <Show when={stats()}>
                    <div class="flex gap-3 text-xs font-body text-muted">
                        <span>
                            AVG{" "}
                            <span class="text-text-secondary font-mono">{roundDecimal(stats()!.avg, 2) ?? "0"}/d</span>
                        </span>
                    </div>
                </Show>

                <button
                    onClick={() => navigate(`/counters/${props.counter.id}`)}
                    class="ml-auto text-xs text-muted hover:text-accent hover:cursor-pointer transition-colors font-body flex items-center gap-1"
                    title="Vedi dettagli"
                >
                    Dettagli
                    <span class="text-[10px] opacity-60">→</span>
                </button>
            </div>
        </div>
    );
};

export default CounterCard;
