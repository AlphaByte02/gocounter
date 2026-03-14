import { type Component, onMount, onCleanup, createEffect } from "solid-js";
import {
    Chart,
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    Tooltip,
    Legend,
    type ChartConfiguration,
    type ChartDataset as CJSDataset,
    BarController,
    LineController,
} from "chart.js";

Chart.register(
    BarController,
    LineController,
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    Tooltip,
    Legend,
);

export interface ChartDataset {
    label: string;
    data: number[];
    type?: "bar" | "line";
    color?: string;
    fill?: boolean;
    tension?: number;
    pointRadius?: number;
    order?: number;
    yAxisID?: string;
    borderDash?: number[];
}

interface Props {
    labels: string[];
    datasets: ChartDataset[];
    height?: number;
    // "linear" (default) | "logarithmic" per l'asse destro
    rightAxisType?: "linear" | "logarithmic";
    dualAxis?: boolean;
}

// ── Colori tema ───────────────────────────────────────────────────────────────
const C = {
    accent: "rgba(108,99,255,1)",
    accentDim: "rgba(108,99,255,0.25)",
    green: "rgba(34,211,160,0.9)",
    orange: "rgba(251,146,60,0.9)", // cumulative avg
    muted: "rgba(107,107,128,0.45)",
    text: "rgba(160,160,184,1)",
    grid: "rgba(255,255,255,0.06)",
    tooltip: "rgba(18,18,25,0.96)",
};

// Palette per le linee in ordine
const LINE_COLORS = [C.green, C.orange, "rgba(251,191,36,0.9)"];

const BarChart: Component<Props> = (props) => {
    let canvas: HTMLCanvasElement | undefined;
    let chart: Chart | undefined;

    let lineIndex = 0;

    const makeDatasets = (): CJSDataset[] => {
        lineIndex = 0;
        return props.datasets.map((ds, i) => {
            const isLine = ds.type === "line";
            const lineColor = isLine ? LINE_COLORS[lineIndex++ % LINE_COLORS.length] : undefined;

            return {
                type: (ds.type ?? "bar") as any,
                label: ds.label,
                data: ds.data,
                order: ds.order ?? i,
                yAxisID: ds.yAxisID ?? "y",
                backgroundColor: ds.color ?? (isLine ? "transparent" : i === 0 ? C.accentDim : C.muted),
                hoverBackgroundColor: ds.color ?? (isLine ? "transparent" : i === 0 ? C.accentDim : C.muted),
                borderColor: ds.color ?? (isLine ? lineColor! : C.accent),
                hoverBorderColor: ds.color ?? (isLine ? lineColor! : C.accent),
                borderWidth: isLine ? 2 : 1,
                borderRadius: isLine ? 0 : 6,
                borderDash: ds.borderDash,
                fill: ds.fill ?? false,
                tension: ds.tension ?? 0.4,
                pointRadius: ds.pointRadius ?? (isLine ? 2 : 0),
                pointBackgroundColor: ds.color ?? lineColor,
            } as CJSDataset;
        });
    };

    const buildConfig = (): ChartConfiguration => ({
        type: "bar",
        data: { labels: props.labels, datasets: makeDatasets() },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: {
                    display: props.datasets.length > 1,
                    labels: {
                        color: C.text,
                        font: { family: "'DM Sans'", size: 11 },
                        boxWidth: 14,
                        boxHeight: 2,
                        usePointStyle: true,
                        pointStyleWidth: 14,
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
                },
            },
            scales: {
                x: {
                    ticks: { color: C.text, font: { family: "'DM Sans'", size: 11 }, maxRotation: 45 },
                    grid: { color: C.grid },
                    border: { color: C.grid },
                },
                y: {
                    suggestedMin: 0,
                    beginAtZero: true,
                    ticks: { color: C.text, font: { family: "'JetBrains Mono'", size: 11 }, precision: 1, stepSize: 1 },
                    grid: { color: C.grid },
                    border: { color: C.grid },
                    title: { display: true, text: "TOT", color: C.text, font: { size: 10 } as any },
                },
                ...(props.dualAxis
                    ? {
                          y2: {
                              type: props.rightAxisType ?? "linear",
                              position: "right" as const,
                              suggestedMin: 0,
                              suggestedMax: props.rightAxisType === "logarithmic" ? 2 : undefined,
                              ticks: { color: LINE_COLORS[0], font: { family: "'JetBrains Mono'", size: 10 } },
                              grid: { drawOnChartArea: false },
                              border: { color: C.grid },
                              title: {
                                  display: true,
                                  text: "AVG",
                                  color: LINE_COLORS[0],
                                  font: { size: 10 } as any,
                              },
                          },
                      }
                    : {}),
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
        <div style={{ height: `${props.height ?? 220}px` }}>
            <canvas ref={canvas} />
        </div>
    );
};

export default BarChart;
