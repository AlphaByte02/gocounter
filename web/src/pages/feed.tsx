import type { ReactElement } from "react";
import type { ICounter, IData } from "@lib/models";

import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
} from "@mui/lab";
import { Container, Fab, Unstable_Grid2 as Grid } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

import { useNavigate } from "@/router";

type IDatas = Record<string, Array<IData>>;
type ICounters = Record<string, string>;

function Feed() {
    const navigate = useNavigate();

    const [datas, setDatas] = useState<IDatas>({});
    const [counters, setCounters] = useState<ICounters>({});

    useEffect(() => {
        async function setup() {
            await axios
                .get("/api/v1/counters")
                .then(({ data }: { data: ICounter[] }) =>
                    setCounters(data.reduce((pv, cv) => ({ ...pv, [cv.id]: cv.name }), {}))
                )
                .catch(() => {});

            axios
                .get("/api/v1/datas?o=-createdAt&limit=200")
                .then(({ data: rd }: { data: IData[] }) => {
                    const newdatas: IDatas = {};

                    for (const data of rd) {
                        const label = new Date(data.createdAt).toLocaleDateString("it");
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

        setup().catch(() => {});
    }, []);

    function getTimelineItem(items: IDatas) {
        const timelineitems: ReactElement[] = [];

        function getLabel(item: IData, lr: boolean = true) {
            if (lr) {
                return (
                    <>
                        <span style={{ color: item.number > 0 ? "lightgreen" : "red" }}>
                            {item.number > 0 ? "⇡" : "⇣"}
                        </span>{" "}
                        <b>{new Date(item.createdAt).toLocaleTimeString("it")}</b> -{" "}
                        {counters[item.counterRef] || item.counterRef}
                    </>
                );
            } else {
                return (
                    <>
                        {counters[item.counterRef] || item.counterRef} -{" "}
                        <b>{new Date(item.createdAt).toLocaleTimeString("it")}</b>{" "}
                        <span style={{ color: item.number > 0 ? "lightgreen" : "red" }}>
                            {item.number > 0 ? "⇡" : "⇣"}
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
                        <TimelineOppositeContent color="text.secondary">{key}</TimelineOppositeContent>
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
                <Grid
                    container
                    alignContent="center"
                    justifyContent="center"
                    style={{ minHeight: "100vh", padding: "1rem auto" }}
                    gap={4}
                >
                    <Grid xs={12}>
                        <Timeline position="alternate">{getTimelineItem(datas)}</Timeline>
                    </Grid>
                </Grid>
            </Container>
            <Fab
                style={{ position: "fixed", right: "3%", bottom: "40px", transform: "rotateZ(180deg)" }}
                color="secondary"
                onClick={() => navigate("/")}
            >
                &#10140;
            </Fab>
        </>
    );
}

export default Feed;
