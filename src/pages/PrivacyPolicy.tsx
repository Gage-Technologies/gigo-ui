import * as React from "react";
import {
    createTheme,
    CssBaseline,
    PaletteMode,
    ThemeProvider,
} from "@mui/material";
import {getAllTokens} from "../theme";
import config from "../config";


function PrivacyPolicy() {
    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);


    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
            <object data={config.rootPath + "/static/ui/PRIVACY_POLICY.pdf"} 
                width="800"
                height="800"> 
        </object> 
            </CssBaseline>
        </ThemeProvider>
    );
}

export default PrivacyPolicy;