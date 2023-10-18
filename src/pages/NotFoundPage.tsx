import * as React from "react";
import {
    Box, Button,
    Card,
    Container,
    createTheme,
    CssBaseline,
    Grid,
    PaletteMode,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import NotFoundPageIcon from "../components/Icons/notFoundPage/NotFoundPage"

import {useAppSelector} from "../app/hooks";

import {useNavigate} from "react-router-dom";

import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import {useEffect, useState} from "react";


function NotFoundPage() {
    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);

    const [loading, setLoading] = React.useState(false)

    let navigate = useNavigate();

    let aspectRatio = useAspectRatio()
    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <NotFoundPageIcon aspectRatio={aspectRatio} theme={userPref}/>
            </CssBaseline>
        </ThemeProvider>
    );
}

function useAspectRatio() {
    const [aspectRatio, setAspectRatio] = useState('');

    useEffect(() => {
        function gcd(a: any, b: any): any {
            return b === 0 ? a : gcd(b, a % b);
        }

        function calculateAspectRatio() {
            const width = window.screen.width;
            const height = window.screen.height;
            let divisor = gcd(width, height);
            // Dividing by GCD and truncating into integers
            let simplifiedWidth = Math.trunc(width / divisor);
            let simplifiedHeight = Math.trunc(height / divisor);

            divisor = Math.ceil(simplifiedWidth / simplifiedHeight);
            simplifiedWidth = Math.trunc(simplifiedWidth / divisor);
            simplifiedHeight = Math.trunc(simplifiedHeight / divisor);
            setAspectRatio(`${simplifiedWidth}:${simplifiedHeight}`);
        }

        calculateAspectRatio();

        window.addEventListener('resize', calculateAspectRatio);

        return () => {
            window.removeEventListener('resize', calculateAspectRatio);
        };
    }, []);

    return aspectRatio;
}


export default NotFoundPage;