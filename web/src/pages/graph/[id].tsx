import type { IData } from "@lib/models";
import type { ChartData, ChartOptions } from "chart.js";

import { CircularProgress, Container, Grid, Typography } from "@mui/material";
import axios from "axios";
import { Chart as ChartJs, Colors } from "chart.js";
import "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import { useEffect, useMemo, useState } from "react";
import { Chart } from "react-chartjs-2";
import useLocalStorage from "use-local-storage";
ChartJs.register(zoomPlugin, Colors);

import ButtonGroupRadio from "@components/ButtonGroupRadio";
import IF from "@components/IF";

import { dateRange, daysInMonth, daysInYear, roundDecimal } from "@lib/helpers";

import { Link, useParams } from "@/router";

const COMMON_GRAPH_OPTIONS: ChartOptions<"bar" | "line"> = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
        legend: { display: false },
        title: { display: false },
    },
    scales: {
        y: {
            suggestedMin: 0,
            beginAtZero: true,
            ticks: {
                precision: 1,
                stepSize: 1,
                // color: "#FFFFFFD9",
            },
            title: {
                display: true,
                text: "TOT",
            },
        },
        x: {
            ticks: {
                color: "#FFFFFFD9",
            },
        },
    },
};

function YearlyGraph({ data }: { data: IData[] }) {
    const dataset = useMemo<ChartData<"bar" | "line">>(() => {
        const yearlyDataMap = new Map();
        let firstDate: Date;

        // Aggrega i dati per anno e trova la prima data
        data.forEach(({ recorded_at, value }) => {
            const date = new Date(recorded_at);
            const year = date.getFullYear();

            if (!firstDate || date < firstDate) {
                firstDate = date;
            }

            if (!yearlyDataMap.has(year)) {
                yearlyDataMap.set(year, { total: 0 });
            }
            yearlyDataMap.get(year).total += value;
        });

        const labels: string[] = [];
        const totalData: number[] = [];
        const avgData: number[] = [];

        // Calcola i dati per ogni anno
        const now = new Date();
        yearlyDataMap.forEach(({ total }, year) => {
            labels.push(year.toString());
            totalData.push(total);

            let daysForAvg;
            if (year === now.getFullYear()) {
                const firstDay = year === firstDate.getFullYear() ? firstDate : new Date(year, 0, 1);
                daysForAvg = Math.floor((+now - +firstDay) / (1000 * 60 * 60 * 24)) + 1;
            } else if (year === firstDate.getFullYear()) {
                // Per il primo anno, calcola i giorni dalla prima data alla fine dell'anno
                const lastDayOfYear = new Date(year, 11, 31);
                daysForAvg = Math.floor((+lastDayOfYear - +firstDate) / (1000 * 60 * 60 * 24)) + 1;
                if (daysForAvg === 0) {
                    daysForAvg = 1;
                }
            } else {
                // Per gli altri anni, considera l'intero anno
                daysForAvg = daysInYear(year);
            }

            const yearlyAvg = roundDecimal(total / daysForAvg, 2);
            avgData.push(yearlyAvg);
        });

        return {
            labels,
            datasets: [
                {
                    label: "Total Annual Sum",
                    type: "bar",
                    data: totalData,
                    order: 1,
                },
                {
                    label: "Annual Average",
                    type: "line",
                    borderWidth: 2,
                    tension: 0.4,
                    data: avgData,
                    order: 0,
                    yAxisID: "y1",
                },
            ],
        };
    }, [data]);

    const OPTIONS: ChartOptions<"bar" | "line"> = {
        ...COMMON_GRAPH_OPTIONS,
        responsive: true,
        scales: {
            ...COMMON_GRAPH_OPTIONS.scales,
            y1: {
                type: "logarithmic",
                position: "right",
                suggestedMin: 0,
                suggestedMax: 2,
                title: {
                    display: true,
                    text: "Annual Average",
                },
                grid: {
                    drawOnChartArea: false, // rimuove la griglia sul secondo asse per maggiore chiarezza
                },
            },
        },
    };

    return <Chart type="bar" data={dataset} options={OPTIONS} />;
}

const MONTH = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
function MonthGraph({ data }: { data: IData[] }) {
    const dataset = useMemo<ChartData<"bar" | "line">>(() => {
        const monthlyDataMap = new Map<string, { total: number; firstDay: number; year: number; month: number }>();

        // Aggrega i dati per mese e anno
        data.forEach(({ recorded_at, value }) => {
            const date = new Date(recorded_at);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const dmap = monthlyDataMap.get(key);
            if (!dmap) {
                monthlyDataMap.set(key, {
                    total: value,
                    firstDay: date.getDate(),
                    year: date.getFullYear(),
                    month: date.getMonth(),
                });
            } else {
                dmap.total += value;
            }
        });

        const labels: string[] = [];
        const totalData: number[] = [];
        const avgData: number[] = [];
        const cumulativeAvgData: number[] = [];
        let cumulativeSum: number = 0;
        let cumulativeMonths: number = 0;

        const now = new Date();

        // Calcola i dati per ogni mese
        monthlyDataMap.forEach(({ total, firstDay, year, month }) => {
            labels.push(`${MONTH[month]} ${year}`);
            totalData.push(total);

            const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;
            const numDays = isCurrentMonth
                ? now.getDate()
                : cumulativeMonths == 0
                  ? daysInMonth(month, year) - firstDay
                  : daysInMonth(month, year);

            // Calcola media mensile
            const monthlyAvg = roundDecimal(total / numDays, 2);
            avgData.push(monthlyAvg);

            // Calcola media cumulativa
            cumulativeSum += total;
            cumulativeMonths++;
            const cumulativeAvg = roundDecimal(cumulativeSum / cumulativeMonths, 2);
            cumulativeAvgData.push(cumulativeAvg);
        });

        return {
            labels,
            datasets: [
                {
                    label: "TOT",
                    type: "bar",
                    data: totalData,
                    order: 1,
                },
                {
                    label: "AVG",
                    type: "line",
                    borderWidth: 2,
                    tension: 0.4,
                    data: avgData,
                    order: 0,
                },
                {
                    label: "CUMULATIVE AVG",
                    type: "line",
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4,
                    data: cumulativeAvgData,
                    order: 0,
                },
            ],
        };
    }, [data]);

    const OPTIONS: ChartOptions<"bar" | "line"> = COMMON_GRAPH_OPTIONS;

    return <Chart type="bar" data={dataset} options={OPTIONS} />;
}

const WEEK = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];
function WeekGraph({ data }: { data: IData[] }) {
    const dataset = useMemo<ChartData<"bar">>(() => {
        const ds = new Array(WEEK.length).fill(0);
        for (const singleData of data) {
            const weekday = new Date(singleData.recorded_at).getDay();
            ds[weekday] = (ds[weekday] || 0) + singleData.value;
        }
        ds[ds.length] = ds[0];
        ds.shift();

        return {
            labels: WEEK,
            datasets: [{ label: "Number", data: ds }],
        };
    }, [data]);

    const OPTIONS: ChartOptions<"bar" | "line"> = COMMON_GRAPH_OPTIONS;

    return <Chart type="bar" data={dataset} options={OPTIONS} />;
}

function DayGraph({ data }: { data: IData[] }) {
    function getDateLabel(date: Date): string {
        return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    }

    const dataset = useMemo<ChartData<"bar">>(() => {
        const temp: { [key: string]: number } = {};
        const labels = [];
        const ds = [];

        for (const singleData of data) {
            const dateString = getDateLabel(new Date(singleData.recorded_at));
            temp[dateString] = (temp?.[dateString] || 0) + singleData.value;
        }

        const range = dateRange(data[0].recorded_at, new Date());
        for (const day of range) {
            const label = getDateLabel(day);
            labels.push(label);
            ds.push(temp?.[label] || 0);
        }

        return {
            labels: labels,
            datasets: [{ label: "Number", data: ds }],
        };
    }, [data]);

    const OPTIONS: ChartOptions<"bar" | "line"> = {
        ...COMMON_GRAPH_OPTIONS,
        plugins: {
            legend: { display: false },
            title: { display: false },
            zoom: {
                pan: {
                    enabled: true,
                    mode: "x",
                },
                zoom: {
                    drag: {
                        modifierKey: "ctrl",
                        enabled: true,
                    },
                    mode: "x",
                },
            },
        },
    };

    return <Chart type="bar" data={dataset} options={OPTIONS} />;
}

function HourGraph({ data }: { data: IData[] }) {
    function getDateLabel(date: Date): string {
        return String(date.getHours()).padStart(2, "0") + "-" + String(date.getHours() + 1).padStart(2, "0");
    }

    const dataset = useMemo<ChartData<"bar">>(() => {
        const labels = [];
        for (let i = 0; i < 24; i++) {
            labels.push(`${String(i).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`);
        }
        const ds = new Array(24).fill(0);

        for (const d of data) {
            const date = new Date(d.recorded_at);
            const pos = date.getHours();

            labels[pos] = getDateLabel(date);
            ds[pos] += d.value;
        }

        return {
            labels: labels,
            datasets: [{ label: "Number", data: ds }],
        };
    }, [data]);

    const OPTIONS: ChartOptions<"bar" | "line"> = COMMON_GRAPH_OPTIONS;

    return <Chart type="bar" data={dataset} options={OPTIONS} />;
}

export default function Graph() {
    const { id } = useParams("/graph/:id");

    const [useGlobal] = useLocalStorage<boolean>("useGlobal", false);

    const ViewEnum = {
        MONTH: 1,
        WEEK: 2,
        DAY: 3,
        HOUR: 4,
        YEAR: 5,
    };

    const [dataset, setDataset] = useState<IData[]>([]);
    const [currentView, setCurrentView] = useState(ViewEnum.MONTH);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`/api/counters/${id}/data`, { params: { global: useGlobal } })
            .then(({ data }) => {
                setDataset(data || []);
                setIsLoading(false);
            })
            .catch(() => {});
    }, [id, useGlobal]);

    return (
        <Container maxWidth="lg">
            <Grid container style={{ marginBottom: "1.5rem" }}>
                <Grid size={3}>
                    <Typography variant="h1" sx={{ textAlign: "center", transform: "rotateZ(180deg)" }}>
                        <Link to="/" className="no-link" style={{ color: "#FFFFFFD9" }}>
                            &#10140;
                        </Link>
                    </Typography>
                </Grid>
                <Grid size={6}>
                    <Typography variant="h1" sx={{ textAlign: "center" }}>
                        Graph
                    </Typography>
                </Grid>
                <Grid size={3} sx={{ alignSelf: "center" }}>
                    <ButtonGroupRadio
                        disabled={isLoading || dataset?.length === 0}
                        buttons={[
                            { label: "Year", callback: () => setCurrentView(ViewEnum.YEAR) },
                            { label: "Month", callback: () => setCurrentView(ViewEnum.MONTH) },
                            { label: "Week Day", callback: () => setCurrentView(ViewEnum.WEEK) },
                            { label: "Day", callback: () => setCurrentView(ViewEnum.DAY) },
                            { label: "Hour", callback: () => setCurrentView(ViewEnum.HOUR) },
                        ]}
                        defaultSelected={1}
                    />
                </Grid>
            </Grid>

            <Grid container alignContent="center" justifyContent="center" style={{ minHeight: "70vh" }}>
                <Grid size={12}>
                    <IF condition={!isLoading && dataset.length === 0}>
                        <div style={{ textAlign: "center" }}>
                            <Typography
                                variant="h3"
                                sx={{ textAlign: "center", display: "inline-block", verticalAlign: "super" }}
                            >
                                No Data
                            </Typography>
                        </div>
                    </IF>
                    <IF condition={!isLoading && dataset.length > 0 && currentView === ViewEnum.MONTH}>
                        <MonthGraph data={dataset} />
                    </IF>
                    <IF condition={!isLoading && dataset.length > 0 && currentView === ViewEnum.WEEK}>
                        <WeekGraph data={dataset} />
                    </IF>
                    <IF condition={!isLoading && dataset.length > 0 && currentView === ViewEnum.DAY}>
                        <DayGraph data={dataset} />
                    </IF>
                    <IF condition={!isLoading && dataset.length > 0 && currentView === ViewEnum.HOUR}>
                        <HourGraph data={dataset} />
                    </IF>
                    <IF condition={!isLoading && dataset.length > 0 && currentView === ViewEnum.YEAR}>
                        <YearlyGraph data={dataset} />
                    </IF>
                    <IF condition={isLoading}>
                        <div style={{ textAlign: "center" }}>
                            <CircularProgress sx={{ marginRight: "2rem" }} />
                            <Typography
                                variant="h3"
                                sx={{ textAlign: "center", display: "inline-block", verticalAlign: "super" }}
                            >
                                Loading...
                            </Typography>
                        </div>
                    </IF>
                </Grid>
            </Grid>
        </Container>
    );
}
