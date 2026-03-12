import type { Counter } from "@/types";
import { api } from "./client";

export async function fetchCounters(year: number) {
    const res = await api.get<Counter[]>("/counters", {
        params: { year },
    });

    return res.data;
}

export function incCounter(id: string) {
    return api.post(`/counters/${id}/increment`);
}

export function decCounter(id: string) {
    return api.post(`/counters/${id}/decrement`);
}

export function renameCounter(id: string, name: string) {
    return api.patch(`/counters/${id}`, { name });
}

export function deleteCounter(id: string) {
    return api.delete(`/counters/${id}`);
}

export function createCounter(name: string) {
    return api.post("/counters", { name });
}
