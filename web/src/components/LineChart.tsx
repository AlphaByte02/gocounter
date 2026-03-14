import {
    CategoryScale,
    Chart,
    type ChartConfiguration,
    type ChartDataset as CJSDataset,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
} from "chart.js";
import { type Component, createEffect, onCleanup, onMount } from "solid-js";

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export interface LineDataset {
    label: string;
    data: number[];
    color?: string;
}

interface Props {
    labels: string[];
    datasets: LineDataset[];
    height?: number;
}

// Palette di colori distinti per le linee dei counter
const PALETTE = [
    "rgba(108,99,255,1)", // violet
    "rgba(34,211,160,1)", // green
    "rgba(251,146,60,1)", // orange
    "rgba(251,191,36,1)", // yellow
    "rgba(236,72,153,1)", // pink
    "rgba(56,189,248,1)", // sky
    "rgba(167,243,208,1)", // mint
    "rgba(253,186,116,1)", // peach
];

const C = {
    text: "rgba(160,160,184,1)",
    grid: "rgba(255,255,255,0.06)",
    tooltip: "rgba(18,18,25,0.96)",
};

const LineChart: Component<Props> = (props) => {
    let canvas: HTMLCanvasElement | undefined;
    let chart: Chart | undefined;

    const makeDatasets = (): CJSDataset<"line">[] =>
        props.datasets.map((ds, i) => {
            const color = ds.color ?? PALETTE[i % PALETTE.length];
            return {
                type: "line",
                label: ds.label,
                data: ds.data,
                borderColor: color,
                backgroundColor: color.replace(",1)", ",0.08)"),
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 0,
                pointHoverBackgroundColor: color,
                cubicInterpolationMode: "monotone",
            } as CJSDataset<"line">;
        });

    const buildConfig = (): ChartConfiguration<"line"> => ({
        type: "line",
        data: { labels: props.labels, datasets: makeDatasets() },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        color: C.text,
                        font: { family: "'DM Sans'", size: 12 },
                        boxWidth: 24,
                        boxHeight: 2,
                        usePointStyle: false,
                        padding: 16,
                    },
                },
                tooltip: {
                    backgroundColor: C.tooltip,
                    borderColor: "rgba(255,255,255,0.08)",
                    borderWidth: 1,
                    titleColor: C.text,
                    bodyColor: "#f0f0f8",
                    titleFont: { family: "'DM Sans'", size: 11 } as any,
                    bodyFont: { family: "'JetBrains Mono'", size: 12 } as any,
                    padding: 12,
                    cornerRadius: 10,
                    // Mostra tutti i counter nel tooltip, ordine per valore desc
                    itemSort: (a, b) => (b.raw as number) - (a.raw as number),
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: C.text,
                        font: { family: "'DM Sans'", size: 11 },
                        maxRotation: 45,
                        // Mostra solo ~8 label per non affollare
                        maxTicksLimit: 8,
                    },
                    grid: { color: C.grid },
                    border: { color: C.grid },
                },
                y: {
                    suggestedMin: 0,
                    beginAtZero: true,
                    ticks: {
                        color: C.text,
                        font: { family: "'JetBrains Mono'", size: 11 },
                        precision: 0,
                    },
                    grid: { color: C.grid },
                    border: { color: C.grid },
                    title: {
                        display: true,
                        text: "Cumulativo",
                        color: C.text,
                        font: { size: 11 } as any,
                    },
                },
            },
        },
    });

    onMount(() => {
        if (!canvas) return;
        chart = new Chart(canvas, buildConfig());
    });

    createEffect(() => {
        const labels = props.labels;
        const datasets = makeDatasets();
        if (!chart) return;
        chart.data.labels = labels;
        chart.data.datasets = datasets;
        chart.update("active");
    });

    onCleanup(() => chart?.destroy());

    return (
        <div style={{ height: `${props.height ?? 500}px` }}>
            <canvas ref={canvas} />
        </div>
    );
};

export default LineChart;
