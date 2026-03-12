export interface Counter {
    id: string;
    name: string;
    visibility: string;
    edit_policy: string;
    created_at: string;
    updated_at: string;
}

export interface Data {
    id: string;
    counter_id: string;
    value: number;
    recorded_at: string;
    created_at: string;
    updated_at: string;
}

export interface CounterStats {
    total: number;
    days: number;
    avg: number;
}

export interface CreateCounterPayload {
    name: string;
}

export interface UpdateCounterPayload {
    name: string;
}

export interface AddDataPayload {
    counter_id: string;
    value: number;
    recorded_at?: string;
}

export type AvgDisplayType = "numeric" | "human";
