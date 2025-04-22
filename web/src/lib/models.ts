export interface ICounter {
    id: string;
    name: string;
    soft_reset: string;
    created_at: string;
    updated_at: string;
}

export interface IData {
    id: string;
    counter_id: string;
    value: number;
    recorded_at: string;
    created_at: string;
    updated_at: string;
}

export type AvgDisplayType = "numeric" | "human";
export interface ISettings {
    useGlobal: boolean;
    avgDisplay: AvgDisplayType;
}
