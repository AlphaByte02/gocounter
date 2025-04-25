import type { AvgDisplayType } from "@lib/models";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Menu,
    MenuItem,
    Paper,
    Skeleton,
    TextField,
    Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

import { humanizeAvg, roundDecimal } from "@lib/helpers";

import IF from "@components/IF";

import { Link } from "@/router";

type AddProps = {
    value: number;
    date: dayjs.Dayjs | null;
};

type CustomAddDialogProps = {
    open: boolean;
    onConfirm: (values: AddProps) => void;
    onClose: () => void;
};

const CustomAddDialog = ({ open, onConfirm, onClose }: CustomAddDialogProps) => {
    const [values, setValues] = useState<AddProps>({ value: 1, date: dayjs() });

    function onFinish() {
        onConfirm?.(values);
        setValues({ value: 1, date: dayjs() });
    }

    function handleOnClose() {
        setValues({ value: 1, date: dayjs() });
        onClose?.();
    }

    return (
        <Dialog fullWidth={true} maxWidth="sm" open={open} onClose={handleOnClose}>
            <DialogTitle>Aggiungi Counter</DialogTitle>
            <DialogContent>
                <TextField
                    type="number"
                    label="Value"
                    defaultValue={1}
                    onChange={(event) => {
                        setValues((ov) => ({ ...ov, value: +event.target.value }));
                    }}
                />
                <br />
                <br />
                <DateTimePicker
                    disableFuture
                    label="Giorno"
                    defaultValue={dayjs()}
                    value={values.date}
                    onChange={(d) => setValues((ov) => ({ ...ov, date: d }))}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancella
                </Button>
                <Button onClick={onFinish} color="primary">
                    Aggiungi
                </Button>
            </DialogActions>
        </Dialog>
    );
};

type CounterProps = {
    id: string;
    name: string;
    avgDisplay: AvgDisplayType;
    global?: boolean;
    onEdit: (id: string) => void;
};

const Counter = ({ id, name, avgDisplay = "numeric", global = false, onEdit }: CounterProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomAddDialogOpen, setIsCustomAddDialogOpen] = useState(false);

    const [count, setCount] = useState(0);

    const [avg, setAvg] = useState(0);

    const getAvg = useCallback(
        (avg: number) => {
            if (avgDisplay === "numeric") {
                return `~${roundDecimal(avg, 2)}/d`;
            } else if (avgDisplay === "human") {
                return `~${humanizeAvg(roundDecimal(avg, 3))}`;
            } else {
                throw new Error();
            }
        },
        [avgDisplay]
    );

    const setStats = useCallback(() => {
        axios
            .get(`/api/counters/${id}/stats`, { params: { global: global } })
            .then(({ data }) => {
                setCount(data.total);
                setAvg(data.avg);
            })
            .catch(() => {})
            .finally(() => {
                setIsLoading(false);
                setIsSubmitting(false);
            });
    }, [global, id]);

    useEffect(() => {
        setStats();
    }, [setStats]);

    function submit(value: number, date: Date | undefined = undefined) {
        setIsSubmitting(true);

        const values: { number: number; counterRef: string; createdAt?: Date } = {
            number: value,
            counterRef: id,
        };
        if (date) {
            values.createdAt = date;
        }

        axios
            .post("/api/data", values)
            .then(() => setStats())
            .catch(() => {})
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    function onSub() {
        submit(-1);
    }
    function onAdd() {
        submit(1);
    }

    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setContextMenu(contextMenu === null ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 } : null);
    };

    const handleCustomAdd = () => {
        setContextMenu(null);
        setIsCustomAddDialogOpen(true);
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    return (
        <Paper elevation={3} style={{ padding: "0.5em 1em" }}>
            <Grid container>
                <Grid size={12} container>
                    <Grid size={8} offset={2}>
                        <Typography variant="h4" align="center">
                            {name}
                        </Typography>
                    </Grid>
                    <Grid size={2} style={{ textAlign: "right" }}>
                        <Button sx={{ color: "#FFFFFFD9" }} color="secondary" onClick={() => onEdit(id)}>
                            ⋮
                        </Button>
                    </Grid>
                </Grid>

                <Grid size={12} container sx={{ marginBottom: ".5rem" }}>
                    <Grid size={3} display="flex" justifyContent="center" alignItems="center">
                        <Button
                            disabled={isSubmitting}
                            onClick={onSub}
                            onContextMenu={handleContextMenu}
                            size="large"
                            color="inherit"
                            sx={{ fontSize: "1.5rem" }}
                        >
                            -1
                        </Button>
                    </Grid>
                    <Grid size={6}>
                        {!isLoading && (
                            <Typography variant="h2" align="center">
                                {count}
                                {avg !== undefined && (
                                    <Typography align="center" style={{ color: "gray" }}>
                                        ({getAvg(avg)})
                                    </Typography>
                                )}
                            </Typography>
                        )}
                        <IF condition={isLoading}>
                            <Box width="min-content" mx="auto">
                                <Skeleton variant="rounded" width={225} height={64} sx={{ marginBottom: 1 }} />
                                <Skeleton variant="rounded" width={150} height={24} sx={{ margin: "auto" }} />
                            </Box>
                        </IF>
                    </Grid>
                    <Grid size={3} display="flex" justifyContent="center" alignItems="center">
                        <Button
                            disabled={isSubmitting}
                            onClick={onAdd}
                            onContextMenu={handleContextMenu}
                            size="large"
                            color="inherit"
                            sx={{ fontSize: "1.5rem" }}
                        >
                            +1
                        </Button>
                    </Grid>
                </Grid>

                <Grid size={12}>
                    <Typography align="center">
                        <Link to="/graph/:id" params={{ id: id.toString() }}>
                            <Button>Grafico</Button>
                        </Link>
                    </Typography>
                </Grid>
            </Grid>
            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                }
            >
                <MenuItem onClick={handleCustomAdd}>Custom Add</MenuItem>
            </Menu>
            <CustomAddDialog
                open={isCustomAddDialogOpen}
                onConfirm={(values) => {
                    submit(values.value, values.date?.toDate());
                    setIsCustomAddDialogOpen(false);
                }}
                onClose={() => setIsCustomAddDialogOpen(false)}
            />
        </Paper>
    );
};

export default Counter;
