/* This file renders a page that informs the user that mobile is not supported yet */

import React from "react"
import {
    Button,
    createTheme,
    CssBaseline,
    ThemeProvider,
} from "@mui/material";
import backgroundImageWebP from "../img/gigo-landing.webp"
import backgroundImageLargeWebP from "../img/gigo-landing-large.webp"
import backgroundImageWebPMobile from "../img/gigo-landing-mobile.webp";

import {getAllTokens} from "../theme";
import GigoCircleIcon from "../components/Icons/GigoCircleLogo";

type BackgroundImageProps = {
    imageUrl: string;
    children?: React.ReactNode; // Include the children prop
};

const BackgroundImage: React.FC<BackgroundImageProps> = ({ imageUrl, children }) => {
    const containerStyle: React.CSSProperties = {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        width: '100vw', // Use viewport width to cover the entire width
        position: 'fixed', // Use fixed positioning
        top: 0, // Align to the top
        left: 0, // Align to the left
        margin: 0, // Ensure no margin
        padding: 0, // Ensure no padding
    };

    return (
        <div style={containerStyle}>
            {children}
        </div>
    );
};

const BytesMaintenancePage: React.FC = () => {
    const theme = React.useMemo(() => createTheme(getAllTokens("dark")), ["dark"]);

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
    };

    const glassStyle: React.CSSProperties = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '30px',
        borderRadius: '20px',
        width: '60%',
        maxWidth: window.innerWidth < 1000 ? '500px' : '800px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#ffffff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const logoStyle: React.CSSProperties = {
        position: 'absolute', // Absolute positioning
        top: '60px', // Distance from the top
        right: '20px', // Distance from the right
    };

    let bimg = backgroundImageWebP;
    if (window.innerWidth > 2000) {
        bimg = backgroundImageLargeWebP
    }
    if (window.innerWidth < 1000) {
        bimg = backgroundImageWebPMobile
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <BackgroundImage imageUrl={bimg}>
                    <div style={containerStyle}>
                        <div style={logoStyle}>
                            <GigoCircleIcon sx={{ height: '100px', width: '100px', color: "#fff" }}/>
                        </div>
                        <div style={glassStyle}>
                            Bytes are under maintenance right now.
                            <br />
                            <br />
                            Maintenance should be done within the next few hours!
                            <br />
                            <br />
                            <Button
                                variant="contained"
                                href="/"
                            >
                                Go Home
                            </Button>
                        </div>
                    </div>
                </BackgroundImage>
            </CssBaseline>
        </ThemeProvider>
    );
};

export default BytesMaintenancePage;