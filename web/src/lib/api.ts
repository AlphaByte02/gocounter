import { query, revalidate } from "@solidjs/router";
import axios from "axios";

import type {
    AddDataPayload,
    Counter,
    CounterStats,
    CreateCounterPayload,
    Data,
    UpdateCounterPayload
} from "@/types";

const http = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

// ── Query keys ────────────────────────────────────────────────────────────────

export const COUNTERS_KEY = "counters";
export const STATS_KEY = "stats";
export const FEED_KEY = "feed";

// ── Cached queries ────────────────────────────────────────────────────────────

export const getCounters = query(async (): Promise<Counter[]> => {
    const { data } = await http.get<Counter[]>("/counters");
    return data;
}, COUNTERS_KEY);

/**
 * from: opzionale, passa solo l'anno (es. 2025).
 * Il backend riceve ?from=2025 e filtra >= 2025-01-01.
 */
export const getCounterStats = query(async (id: string, from?: number): Promise<CounterStats> => {
    const { data } = await http.get<CounterStats>(`/counters/${id}/stats`, {
        params: from ? { from } : undefined,
    });
    return data;
}, STATS_KEY);

export const getFeed = query(async (): Promise<Data[]> => {
    const { data } = await http.get<Data[]>("/feed");
    return data;
}, FEED_KEY);

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createCounter(payload: CreateCounterPayload): Promise<Counter> {
    const { data } = await http.post<Counter>("/counters", payload);
    await revalidate(COUNTERS_KEY);
    return data;
}

export async function updateCounter(id: string, payload: UpdateCounterPayload): Promise<Counter> {
    console.log(payload);

    const { data } = await http.patch<Counter>(`/counters/${id}`, payload);
    await revalidate(COUNTERS_KEY);
    return data;
}

export async function deleteCounter(id: string): Promise<void> {
    await http.delete(`/counters/${id}`);
    await revalidate(COUNTERS_KEY);
    await revalidate(STATS_KEY);
}

export async function addData(payload: AddDataPayload): Promise<void> {
    await http.post("/data", payload);
    await revalidate(STATS_KEY);
}
