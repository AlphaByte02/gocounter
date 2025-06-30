import type { ICounter, IData } from "@lib/models";
import type { ChartData, ChartDataset, ChartOptions } from "chart.js";

import { CircularProgress, Container, Grid, Typography } from "@mui/material";
import axios from "axios";
import { Chart as ChartJs, Colors } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { useEffect, useMemo, useState } from "react";
import { Chart } from "react-chartjs-2";
import useLocalStorage from "use-local-storage";
ChartJs.register(zoomPlugin, Colors);

import IF from "@/components/IF";
import { dateRange } from "@/lib/helpers";
import { Link } from "@/router";

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

interface GraphProps {
    counters: ICounter[];
    data: IData[];
}

function Graph({ data, counters }: GraphProps) {
    function getDateLabel(date: Date): string {
        return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    }

    const dataset = useMemo<ChartData<"line">>(() => {
        const temp: { [key: string]: { [key: string]: number } } = {};
        const labels = [];
        const ds: ChartDataset<"line">[] = [];

        for (const singleData of data) {
            const dateString = getDateLabel(new Date(singleData.recorded_at));

            if (dateString in temp) {
                if (singleData.counter_id in temp[dateString]) {
                    temp[dateString] = {
                        ...temp[dateString],
                        [singleData.counter_id]: temp[dateString][singleData.counter_id] + singleData.value,
                    };
                } else {
                    temp[dateString] = { ...temp[dateString], [singleData.counter_id]: singleData.value };
                }
            } else {
                temp[dateString] = { [singleData.counter_id]: singleData.value };
            }
        }

        const countersObj: { [key: string]: { name: string; currentCount: number; data: number[] } } = counters.reduce(
            (pv, cv) => ({ ...pv, [cv.id]: { name: cv.name, currentCount: 0, data: [] } }),
            {}
        );

        const range = dateRange(data[0].recorded_at, new Date());
        for (const day of range) {
            const label = getDateLabel(day);
            labels.push(label);

            for (const id in countersObj) {
                if (Object.prototype.hasOwnProperty.call(countersObj, id)) {
                    const counter = countersObj[id];

                    counter.currentCount += temp?.[label]?.[id] || 0;
                    countersObj[id].data.push(counter.currentCount);
                }
            }
        }

        for (const id in countersObj) {
            if (Object.prototype.hasOwnProperty.call(countersObj, id)) {
                const counter = countersObj[id];
                ds.push({
                    label: counter.name,
                    data: counter.data,
                    pointStyle: false,
                    cubicInterpolationMode: "monotone",
                    tension: 0.4,
                });
            }
        }

        return {
            labels: labels,
            datasets: ds,
        };
    }, [counters, data]);

    const OPTIONS: ChartOptions<"line"> = {
        ...COMMON_GRAPH_OPTIONS,
        plugins: {
            legend: { display: true },
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

    return <Chart type="line" data={dataset} options={OPTIONS} />;
}

function AllGraph() {
    const [counters, setCounters] = useState<ICounter[]>([]);
    const [dataset, setDataset] = useState<IData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [useGlobal] = useLocalStorage<boolean>("useGlobal", false);

    useEffect(() => {
        axios
            .get("/api/counters")
            .then(({ data }: { data: ICounter[] }) => setCounters(data || []))
            .catch(() => {});

        axios
            .get(`/api/data/`, { params: { global: useGlobal } })
            .then(({ data }: { data: IData[] }) => {
                setDataset(data || []);
                setIsLoading(false);
            })
            .catch(() => {});
    }, [useGlobal]);

    return (
        <Container>
            <Grid container style={{ marginBottom: "1.5rem" }}>
                <Grid size={3}>
                    <Typography variant="h1" sx={{ textAlign: "center", transform: "rotateZ(180deg)" }}>
                        <Link to="/feed" className="no-link" style={{ color: "#FFFFFFD9" }}>
                            &#10140;
                        </Link>
                    </Typography>
                </Grid>
                <Grid size={6}>
                    <Typography variant="h1" sx={{ textAlign: "center" }}>
                        All Graph
                    </Typography>
                </Grid>
            </Grid>
            <Grid container alignContent="center" justifyContent="center" style={{ minHeight: "70vh" }}>
                <Grid size={12}>
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
                    <IF condition={!isLoading && dataset.length > 0}>
                        <Graph counters={counters} data={dataset} />
                    </IF>
                </Grid>
            </Grid>
        </Container>
    );
}

export default AllGraph;
