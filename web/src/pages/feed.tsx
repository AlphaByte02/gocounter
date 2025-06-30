import type { ICounter, IData } from "@lib/models";
import type { ReactElement } from "react";

import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
} from "@mui/lab";
import { CircularProgress, Container, Fab, Grid, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

import { useNavigate } from "@/router";
import IF from "@/components/IF";

type IDatas = Record<string, Array<IData>>;
type ICounters = Record<string, string>;

function Feed() {
    const navigate = useNavigate();

    const [datas, setDatas] = useState<IDatas>({});
    const [counters, setCounters] = useState<ICounters>({});

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function setup() {
            await axios
                .get("/api/counters")
                .then(({ data }: { data: ICounter[] }) =>
                    setCounters(data.reduce((pv, cv) => ({ ...pv, [cv.id]: cv.name }), {}))
                )
                .catch(() => {});

            await axios
                .get("/api/feed")
                .then(({ data: rd }: { data: IData[] }) => {
                    const newdatas: IDatas = {};

                    for (const data of rd) {
                        const label = new Date(data.recorded_at).toLocaleDateString("it");
                        const oldd = newdatas[label];
                        if (!oldd) {
                            newdatas[label] = [];
                        }

                        newdatas[label].push(data);
                    }

                    setDatas(newdatas);
                })
                .catch(() => {});
        }

        setup()
            .then(() => setIsLoading(false))
            .catch(() => {});
    }, []);

    function getTimelineItem(items: IDatas) {
        const timelineitems: ReactElement[] = [];

        function getLabel(item: IData, lr: boolean = true) {
            if (lr) {
                return (
                    <>
                        <span style={{ color: item.value > 0 ? "lightgreen" : "red" }}>
                            {item.value > 0 ? "⇡" : "⇣"}
                        </span>{" "}
                        <b>{new Date(item.recorded_at).toLocaleTimeString("it")}</b> -{" "}
                        {counters[item.counter_id] || item.counter_id}
                    </>
                );
            } else {
                return (
                    <>
                        {counters[item.counter_id] || item.counter_id} -{" "}
                        <b>{new Date(item.recorded_at).toLocaleTimeString("it")}</b>{" "}
                        <span style={{ color: item.value > 0 ? "lightgreen" : "red" }}>
                            {item.value > 0 ? "⇡" : "⇣"}
                        </span>
                    </>
                );
            }
        }

        const itemsLen = Object.keys(items).length;
        let counter = 0;
        for (const key in items) {
            if (Object.prototype.hasOwnProperty.call(items, key)) {
                const element = items[key];

                timelineitems.push(
                    <TimelineItem key={key}>
                        <TimelineOppositeContent>{key}</TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot />
                            {counter != itemsLen - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                            {element.map((el) => (
                                <div style={{ marginBottom: "1rem" }} key={el.id}>
                                    {getLabel(el, counter % 2 == 0)}
                                </div>
                            ))}
                        </TimelineContent>
                    </TimelineItem>
                );

                counter += 1;
            }
        }

        return timelineitems;
    }

    return (
        <>
            <Container maxWidth="lg">
                <Grid container style={{ marginBottom: "1.5rem" }}>
                    <Grid size={12}>
                        <Typography variant="h1" sx={{ textAlign: "center" }}>
                            Feed
                        </Typography>
                    </Grid>
                </Grid>
                <Grid
                    container
                    alignContent="center"
                    justifyContent="center"
                    style={{ minHeight: "100vh", padding: "1rem auto" }}
                    gap={4}
                >
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
                        <IF condition={!isLoading}>
                            <Timeline position="alternate">{getTimelineItem(datas)}</Timeline>
                        </IF>
                    </Grid>
                </Grid>
            </Container>
            <Fab
                style={{ position: "fixed", right: "3%", bottom: "105px", fontSize: "20px" }}
                onClick={() => navigate("/graph/all")}
            >
                📈
            </Fab>
            <Fab
                sx={{ position: "fixed", right: "3%", bottom: "40px", transform: "rotateZ(180deg)" }}
                color="secondary"
                onClick={() => navigate("/")}
            >
                &#10140;
            </Fab>
        </>
    );
}

export default Feed;
