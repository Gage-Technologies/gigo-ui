import * as React from "react";
import {createTheme, CssBaseline, PaletteMode, ThemeProvider} from "@mui/material";
import {getAllTokens} from "../../theme";

const GeneralAlert = () => {
    // retrieve theme from local storage
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>

            </CssBaseline>
        </ThemeProvider>
    )
}

export default GeneralAlert
