import * as React from "react";
import {
    Box,
    createTheme,
    CssBaseline,
    PaletteMode,
    ThemeProvider,
} from "@mui/material";
import { getAllTokens } from "../theme";
import config from "../config";


function PrivacyPolicy() {
    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);


    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Box
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    sx={{width: "100%", height: "100%", paddingTop: "20px"}}
                >
                    <object
                        data={config.rootPath + "/static/ui/PRIVACY_POLICY.pdf"}
                        width={window.innerWidth  - 400}
                        height={window.innerHeight - 92}
                    />
                </Box>
        </CssBaseline>
        </ThemeProvider >
    );
}

export default PrivacyPolicy;