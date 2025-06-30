import type { AvgDisplayType, ICounter, ISettings } from "@lib/models";

import {
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    FormControlLabel,
    FormGroup,
    Grid,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import useLocalStorage from "use-local-storage";

import { useNavigate } from "@/router";

import Counter from "@components/Counter";
import CounterDrawer, { type CounterDrawerValues } from "@components/CounterDrawer";
import Switch from "@components/Switch";

const SettingsDialog = ({
    isDialogOpen,
    settings: initSettings,
    onConfirm,
    onClose,
}: {
    isDialogOpen: boolean;
    settings: ISettings;
    onConfirm: (settings: ISettings) => void;
    onClose: () => void;
}) => {
    const [settings, setSettings] = useState<ISettings>(initSettings);

    function onFinish() {
        onConfirm?.(settings);
    }

    function handleOnClose() {
        onClose?.();
        setSettings(initSettings);
    }

    return (
        <Dialog fullWidth={true} maxWidth="sm" open={isDialogOpen} onClose={handleOnClose} keepMounted={false}>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                onChange={(e) => setSettings((cs) => ({ ...cs, useGlobal: e.target.checked }))}
                                checked={settings.useGlobal}
                            />
                        }
                        label="Use Global"
                    />
                </FormGroup>
                <Switch
                    prelabel="Numeric"
                    onChange={(e) =>
                        setSettings((cs) => ({ ...cs, avgDisplay: e.target.checked ? "human" : "numeric" }))
                    }
                    checked={settings.avgDisplay === "human"}
                    postlabel="Human"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleOnClose} color="secondary">
                    Cancella
                </Button>
                <Button onClick={onFinish} color="primary">
                    Salva
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const AddNewCounterDialog = ({
    isDialogOpen,
    onConfirm,
    onClose,
}: {
    isDialogOpen: boolean;
    onConfirm: (name: string) => void;
    onClose: () => void;
}) => {
    const [counterName, setCounterName] = useState("");

    function onFinish() {
        onConfirm?.(counterName);
        setCounterName("");
    }

    function handleOnClose() {
        onClose?.();
        setCounterName("");
    }

    return (
        <Dialog fullWidth={true} maxWidth="sm" open={isDialogOpen} onClose={handleOnClose}>
            <DialogTitle>Aggiungi Counter</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    id="name"
                    label="Nome Counter"
                    fullWidth
                    required
                    value={counterName}
                    onChange={(e) => setCounterName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleOnClose} color="secondary">
                    Cancella
                </Button>
                <Button onClick={onFinish} color="primary">
                    Aggiungi
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const DeleteCounterDialog = ({
    isDialogOpen,
    counter,
    onConfirm,
    onClose,
}: {
    isDialogOpen: boolean;
    counter?: ICounter;
    onConfirm: () => void;
    onClose: () => void;
}) => {
    function onFinish() {
        onConfirm?.();
    }

    function handleOnClose() {
        onClose?.();
    }

    return (
        <Dialog fullWidth={true} maxWidth="sm" open={isDialogOpen} onClose={handleOnClose}>
            <DialogTitle>Elimina Counter</DialogTitle>
            <DialogContent>
                <Typography>Sei sicuro di voler eliminare &quot;{counter?.name}&quot;?</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleOnClose} color="secondary">
                    Annulla
                </Button>
                <Button onClick={onFinish} color="error">
                    Cancella
                </Button>
            </DialogActions>
        </Dialog>
    );
};

function App() {
    const navigate = useNavigate();

    const [counters, setCounters] = useState<ICounter[]>([]);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);

    const [currentCounter, setCurrentCounter] = useState<ICounter>();

    const [useGlobal, setUseGlobal] = useLocalStorage<boolean>("useGlobal", false);
    const [avgDisplay, setAvgDisplay] = useLocalStorage<AvgDisplayType>("avgDisplay", "numeric");

    useEffect(() => {
        axios
            .get("/api/counters")
            .then(({ data }: { data: ICounter[] }) => setCounters(data || []))
            .catch(() => {});
    }, []);

    function handleCreateCounter(name: string) {
        axios
            .post("/api/counters", { name: name })
            .then(({ data }: { data: ICounter }) => setCounters((c) => [...c, data]))
            .catch(() => {});
    }

    function handleDeleteCounter(id: string) {
        if (!id) {
            return;
        }

        axios
            .delete(`/api/counters/${id}`)
            .then(() => setCounters((c) => c.filter((e) => e.id != id)))
            .catch(() => {});
    }

    function handleEditCounter(values: CounterDrawerValues) {
        if (!currentCounter || !values.id) {
            return;
        }

        if (values.name !== currentCounter?.name) {
            return axios
                .patch<ICounter>(`/api/counters/${values.id}`, { name: values.name.trim() })
                .then(({ data }) => {
                    setCounters((c) => {
                        const nc = [...c];

                        nc.splice(
                            nc.findIndex((e) => e.id === values.id),
                            1,
                            data
                        );

                        return nc;
                    });
                })
                .catch((e) => console.error(e))
                .finally(() => {
                    setIsEditDrawerOpen(false);
                    setCurrentCounter(undefined);
                });
        }

        setIsEditDrawerOpen(false);
        setCurrentCounter(undefined);
    }

    function showEditCounter(id: string) {
        if (!id) {
            return;
        }

        setIsEditDrawerOpen(true);
        setCurrentCounter(counters.find((e) => e.id === id));
    }

    return (
        <>
            <SettingsDialog
                isDialogOpen={isSettingsOpen}
                settings={{ useGlobal: useGlobal, avgDisplay: avgDisplay }}
                onConfirm={(ns) => {
                    if (ns.useGlobal !== useGlobal) {
                        setUseGlobal(ns.useGlobal);
                    }
                    if (ns.avgDisplay !== avgDisplay) {
                        setAvgDisplay(ns.avgDisplay);
                    }

                    setIsSettingsOpen(false);
                }}
                onClose={() => setIsSettingsOpen(false)}
            />
            <AddNewCounterDialog
                isDialogOpen={isAddDialogOpen}
                onConfirm={(name) => {
                    handleCreateCounter(name);
                    setIsAddDialogOpen(false);
                }}
                onClose={() => setIsAddDialogOpen(false)}
            />
            <DeleteCounterDialog
                isDialogOpen={isDeleteModelOpen}
                counter={currentCounter}
                onConfirm={() => {
                    handleDeleteCounter(currentCounter?.id || "");
                    setIsDeleteModelOpen(false);
                    setCurrentCounter(undefined);
                }}
                onClose={() => {
                    setIsDeleteModelOpen(false);
                    setCurrentCounter(undefined);
                }}
            />
            <CounterDrawer
                open={isEditDrawerOpen}
                counter={currentCounter}
                onClose={() => {
                    setIsEditDrawerOpen(false);
                    setCurrentCounter(undefined);
                }}
                onDelete={() => {
                    setIsEditDrawerOpen(false);
                    setIsDeleteModelOpen(true);
                }}
                onSubmit={(values) => {
                    handleEditCounter(values);
                }}
            />
            <Container maxWidth="lg">
                <Grid
                    container
                    alignContent="center"
                    justifyContent="center"
                    style={{ minHeight: "100vh", padding: "1rem auto" }}
                    gap={4}
                >
                    {counters.map((counter) => (
                        <Grid size={{ xs: 10, md: 5 }} key={counter.id}>
                            <Counter
                                id={counter.id}
                                avgDisplay={avgDisplay}
                                global={useGlobal}
                                name={counter.name}
                                onEdit={showEditCounter}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Container>
            <Fab
                color="default"
                sx={{ position: "fixed", right: "3%", top: "40px", backgroundColor: "#808080", fontSize: "24px" }}
                onClick={() => setIsSettingsOpen(true)}
            >
                ⚙
            </Fab>
            <Fab
                sx={{ position: "fixed", right: "3%", bottom: "40px", fontSize: "20px" }}
                color="primary"
                onClick={() => setIsAddDialogOpen(true)}
            >
                +
            </Fab>
            <Fab
                sx={{ position: "fixed", right: "3%", bottom: "105px", fontSize: "20px" }}
                color="secondary"
                onClick={() => navigate("/feed")}
            >
                ☰
            </Fab>
        </>
    );
}

export default App;
