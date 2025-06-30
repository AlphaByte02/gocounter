import type { ICounter } from "@lib/models";

import { Box, Button, Drawer, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import EditableTypography from "@components/EditableTypography";

export type CounterDrawerValues = {
    id: string;
    name: string;
};

type CounterDrawerProps = {
    open: boolean;
    counter?: ICounter;
    onClose: () => void;
    onDelete: () => void;
    onSubmit: (values: CounterDrawerValues) => void;
};

const CounterDrawer = ({ open, counter: initCounter, onClose, onSubmit, onDelete }: CounterDrawerProps) => {
    const matches = useMediaQuery("(max-width:768px)");

    const [counter, setCounter] = useState(initCounter);

    const [counterName, setCounterName] = useState(initCounter?.name || "");

    useEffect(() => {
        setCounter(initCounter);
        setCounterName(initCounter?.name || "");
    }, [initCounter]);

    const resetSoftReset = useCallback(() => {
        if (!counter) {
            return;
        }

        axios
            .patch<ICounter>(`/api/v1/counters/${counter.id}`, { softReset: new Date() })
            .then(({ data }) => {
                setCounter(data);
            })
            .catch((e) => console.error(e));
    }, [counter]);

    const removeSoftReset = useCallback(() => {
        if (!counter) {
            return;
        }

        axios
            .patch<ICounter>(`/api/v1/counters/${counter.id}`, { softReset: null })
            .then(({ data }) => {
                setCounter(data);
            })
            .catch((e) => console.error(e));
    }, [counter]);

    function handleSubmit() {
        if (!counter) {
            return;
        }

        onSubmit?.({ id: counter?.id, name: counterName });
    }

    return (
        <Drawer open={open} anchor="right" onClose={onClose}>
            <Box width={matches ? "90vw" : "30vw"} height="90vh" px={4} pt={4}>
                <EditableTypography
                    initialValue={counter?.name}
                    onChange={(v) => setCounterName(v)}
                    variant="h3"
                    align="center"
                />
                <Stack height="100%" pt={8} justifyContent="start" alignItems="center">
                    <Typography variant="h5" mb={1}>
                        Soft Reset
                    </Typography>
                    <Stack direction="row" width="100%" justifyContent="center" alignItems="center" spacing={2}>
                        {counter?.soft_reset && (
                            <Typography component="span" align="center">
                                {new Date(counter.soft_reset).toLocaleString("it")}
                            </Typography>
                        )}
                        <Button variant="outlined" color="warning" onClick={() => resetSoftReset()}>
                            {counter?.soft_reset ? "↺" : "+"}
                        </Button>
                        {counter?.soft_reset && (
                            <Button variant="outlined" color="secondary" onClick={() => removeSoftReset()}>
                                🗑️
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Box>
            <Box px={6}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Button variant="outlined" color="error" onClick={onDelete}>
                        Delete
                    </Button>
                    <div>
                        <Stack spacing={2} direction="row">
                            <Button variant="outlined" disabled color="warning">
                                Reset
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                disabled={counterName === counter?.name}
                                onClick={handleSubmit}
                            >
                                Save
                            </Button>
                        </Stack>
                    </div>
                </Stack>
            </Box>
        </Drawer>
    );
};

export default CounterDrawer;
