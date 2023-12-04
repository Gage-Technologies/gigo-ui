import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Typography, Box, PaletteMode, createTheme, Link } from '@mui/material';
import { styled } from '@mui/system';

import backgroundImageWebP from "../img/gigo-landing-christmas.webp"
import backgroundImageLargeWebP from "../img/gigo-landing-christmas-large.webp"
import backgroundImagePNG from "../img/gigo-landing-christmas.png"
import backgroundImageLargePNG from "../img/gigo-landing-christmas-large.png"
import { useAppSelector } from '../app/hooks';
import { selectAppWrapperChatOpen, selectAppWrapperSidebarOpen } from '../reducers/appWrapper/appWrapper';
import { getAllTokens, themeHelpers } from '../theme';
import LazyLoad from 'react-lazyload';
import { SocialIcon } from 'react-social-icons';
import GigoCircleIcon from './Icons/GigoCircleLogo';
import Snowfall from 'react-snowfall';


// Hero container with jungle-themed background
const HeroContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: '100vh',
    width: '100vw', // Adjust for the sidebar width
    marginLeft: 0,
    marginRight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `
        url(${window.innerWidth > 2000 ? backgroundImageLargeWebP : backgroundImageWebP}),
        url(${window.innerWidth > 2000 ? backgroundImageLargePNG : backgroundImagePNG})
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
}));

const HeroContent = styled(Box)({
    position: 'relative',
    textAlign: 'center',
    width: "fit-content",
    zIndex: 999,
    color: '#fff',
    borderRadius: "10px",
    padding: "20px",
    ...themeHelpers.frostedGlass,
    backgroundColor: "#1D1D1D25"
});


const GIGOLandingPageChristmas: React.FC = () => {
    // retrieve theme from local storage
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const leftOpen = useAppSelector(selectAppWrapperSidebarOpen)
    const rightOpen = useAppSelector(selectAppWrapperChatOpen)
    const endRef = useRef<HTMLDivElement | null>(null);

    let width = '100vw'
    let widthSub = 0;
    if (leftOpen) {
        widthSub += 200
    }
    if (rightOpen) {
        widthSub += 300
    }
    if (widthSub > 0) {
        width = `calc(100vw - ${widthSub}px)`
    }

    return (
        <>
            <HeroContainer sx={{ width: width }}>
                <Snowfall />
                <HeroContent>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <GigoCircleIcon sx={{ height: '90px', width: '90px', marginRight: "20px", marginBottom: "20px", color: "white" }}/>
                        <Typography variant="h3" gutterBottom>
                            Welcome to GIGO
                        </Typography>
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ maxWidth: "40vw" }}>
                        GIGO is the best place to learn how to code
                    </Typography>
                    <Typography variant="body1" gutterBottom sx={{ maxWidth: "40vw" }}>
                        Built by self-taught developers, GIGO focuses on aligning learning with the real world of development.
                        Code in the cloud, work on real projects, and learn the latest technologies from any machine, even a tablet!
                        Pick a project and click launch to get started!
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        sx={{
                            mt: 2,
                            color: "white",
                            backgroundColor: theme.palette.error.main + "50",
                            borderColor: theme.palette.error.main,
                            // highlight on hover
                            '&:hover': {
                                backgroundColor: theme.palette.error.main + "99",
                                borderColor: theme.palette.error.main,
                            }
                        }}
                        href="/signup"
                        // onClick={() => {
                        //     if (endRef.current) {
                        //         endRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
                        //     }
                        // }}
                    >
                        Explore The North Pole
                    </Button>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                        <Link variant="caption" href="https://discord.gg/279hECYrfX" gutterBottom color="#ffffff" target="_blank" > {/* Change typography variant */}
                            Join us on Discord!
                        </Link>
                        <SocialIcon
                            network="discord"
                            url="https://discord.gg/279hECYrfX"
                            bgColor={"transparent"}
                            fgColor={mode === 'dark' ? "white" : "black"}
                            target="_blank"
                            style={{
                                height: "32px",
                                width: "32px",
                                marginBottom: "5px"
                            }}
                        />
                    </Box>
                </HeroContent>
            </HeroContainer>
            <div ref={endRef} id="end-landing" />
        </>
    );
};

export default GIGOLandingPageChristmas;
