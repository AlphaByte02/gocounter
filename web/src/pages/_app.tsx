import { CssBaseline, ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Outlet } from "react-router";

import "dayjs/locale/it";

let darkTheme = createTheme({
    palette: {
        mode: "dark",
        text: {
            primary: "#FFFFFFD9",
            secondary: "#FFFFFFA6",
        },
    },
});
darkTheme = responsiveFontSizes(darkTheme, { factor: 4 });

export default function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
                <CssBaseline />
                <section>
                    <main>
                        <Outlet />
                    </main>
                </section>
            </LocalizationProvider>
        </ThemeProvider>
    );
}
