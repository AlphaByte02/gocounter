import type { Counter, Data } from "@/types";

import { dateRange, daysInMonth, daysInYear } from "./dates";
import { roundDecimal } from "./helpers";

// ── Month graph ───────────────────────────────────────────────────────────────
// Traduzione fedele di MonthGraph: TOT (barre) + AVG (linea) + CUMULATIVE AVG (linea tratteggiata)

const MONTHS_IT = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];

export interface MonthChartData {
    labels: string[];
    totals: number[];
    avgs: number[];
    cumulativeAvgs: number[];
}

export function byMonth(items: Data[]): MonthChartData {
    type MonthEntry = { total: number; firstDay: number; year: number; month: number };
    const map = new Map<string, MonthEntry>();

    for (const { recorded_at, value } of items) {
        const date = new Date(recorded_at);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const entry = map.get(key);
        if (!entry) {
            map.set(key, { total: value, firstDay: date.getDate(), year: date.getFullYear(), month: date.getMonth() });
        } else {
            entry.total += value;
        }
    }

    const labels: string[] = [];
    const totals: number[] = [];
    const avgs: number[] = [];
    const cumulativeAvgs: number[] = [];

    let cumulativeSum = 0;
    let cumulativeMonths = 0;
    const now = new Date();

    for (const [, { total, year, month }] of map.entries()) {
        labels.push(`${MONTHS_IT[month]} ${year}`);
        totals.push(total);

        const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;
        const numDays = isCurrentMonth ? now.getDate() : daysInMonth(month, year);

        avgs.push(roundDecimal(total / numDays, 2));

        cumulativeSum += total;
        cumulativeMonths++;
        cumulativeAvgs.push(roundDecimal(cumulativeSum / cumulativeMonths, 2));
    }

    return { labels, totals, avgs, cumulativeAvgs };
}

// ── Year graph ────────────────────────────────────────────────────────────────
// Traduzione fedele di YearlyGraph: TOT (barre) + Annual Average (linea, asse log destra)

export interface YearChartData {
    labels: string[];
    totals: number[];
    avgs: number[];
}

export function byYear(items: Data[]): YearChartData | null {
    if (!items.length) return null;

    type YearEntry = { total: number };
    const map = new Map<number, YearEntry>();

    let firstDate: Date | undefined;
    for (const { recorded_at, value } of items) {
        const date = new Date(recorded_at);
        const year = date.getFullYear();
        if (!firstDate || date < firstDate) firstDate = date;
        const entry = map.get(year);
        if (!entry) map.set(year, { total: value });
        else entry.total += value;
    }

    if (map.size <= 1) return null;

    const labels: string[] = [];
    const totals: number[] = [];
    const avgs: number[] = [];
    const now = new Date();

    for (const [year, { total }] of map.entries()) {
        labels.push(String(year));
        totals.push(total);

        let days: number;
        if (year === now.getFullYear()) {
            const firstDay = year === firstDate?.getFullYear() ? firstDate : new Date(year, 0, 1);
            days = Math.floor((+now - +firstDay) / (1000 * 60 * 60 * 24)) + 1;
        } else if (year === firstDate?.getFullYear()) {
            const lastDay = new Date(year, 11, 31);
            days = Math.max(1, Math.floor((+lastDay - +firstDate) / (1000 * 60 * 60 * 24)) + 1);
        } else {
            days = daysInYear(year);
        }

        avgs.push(roundDecimal(total / days, 2));
    }

    return { labels, totals, avgs };
}

// ── Weekday graph ─────────────────────────────────────────────────────────────
// Lunedì-prima come nel React originale (LUN=0 dopo lo shift)

const DAYS_IT = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];

export interface WeekChartData {
    labels: string[];
    totals: number[];
}

export function byWeekday(items: Data[]): WeekChartData {
    const ds = new Array(7).fill(0);
    for (const { recorded_at, value } of items) {
        // getDay(): 0=dom,1=lun,...,6=sab → shift per avere lun=0
        const day = (new Date(recorded_at).getDay() + 6) % 7;
        ds[day] += value;
    }
    return { labels: DAYS_IT, totals: ds };
}

// ── Hour graph ────────────────────────────────────────────────────────────────

export interface HourChartData {
    labels: string[];
    totals: number[];
}

export function byHour(items: Data[]): HourChartData {
    const labels: string[] = [];
    const ds = new Array(24).fill(0);
    for (let i = 0; i < 24; i++) {
        labels.push(`${String(i).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`);
    }
    for (const { recorded_at, value } of items) {
        ds[new Date(recorded_at).getHours()] += value;
    }
    return { labels, totals: ds };
}

// ── Day graph ─────────────────────────────────────────────────────────────────
// Usa dateRange come nel React: include tutti i giorni anche quelli a zero

export interface DayChartData {
    labels: string[];
    totals: number[];
}

export function byDay(items: Data[]): DayChartData {
    if (!items.length) return { labels: [], totals: [] };

    function dayLabel(d: Date): string {
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    }

    const temp: Record<string, number> = {};
    for (const { recorded_at, value } of items) {
        const label = dayLabel(new Date(recorded_at));
        temp[label] = (temp[label] ?? 0) + value;
    }

    // Ordina gli items per data per trovare il primo
    const sorted = [...items].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
    const range = dateRange(sorted[0].recorded_at, new Date());

    const labels: string[] = [];
    const totals: number[] = [];
    for (const day of range) {
        const label = dayLabel(day);
        labels.push(label);
        totals.push(temp[label] ?? 0);
    }

    return { labels, totals };
}

export interface AllCountersChartData {
    labels: string[];
    series: { counterId: string; counterName: string; data: number[] }[];
}

export function byAllCountersCumulative(items: Data[], counters: Counter[]): AllCountersChartData {
    if (!items.length || !counters.length) return { labels: [], series: [] };

    function dayLabel(d: Date): string {
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    }

    // Aggrega per giorno × counter
    const temp: Record<string, Record<string, number>> = {};
    for (const { recorded_at, value, counter_id } of items) {
        const label = dayLabel(new Date(recorded_at));
        if (!temp[label]) temp[label] = {};
        temp[label][counter_id] = (temp[label][counter_id] ?? 0) + value;
    }

    // Stato cumulativo per ogni counter
    const state: Record<string, { name: string; current: number; data: number[] }> = Object.fromEntries(
        counters.map((c) => [c.id, { name: c.name, current: 0, data: [] }]),
    );

    // Genera range di date completo
    const sorted = [...items].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
    const range = dateRange(sorted[0].recorded_at, new Date());
    const labels: string[] = [];

    for (const day of range) {
        const label = dayLabel(day);
        labels.push(label);
        for (const id in state) {
            state[id].current += temp[label]?.[id] ?? 0;
            state[id].data.push(state[id].current);
        }
    }

    const series = counters
        .filter((c) => c.id in state)
        .map((c) => ({
            counterId: c.id,
            counterName: c.name,
            data: state[c.id].data,
        }));

    return { labels, series };
}
