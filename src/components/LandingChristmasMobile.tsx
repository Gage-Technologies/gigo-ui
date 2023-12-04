import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Typography, Box, PaletteMode, createTheme, Link } from '@mui/material';
import { styled } from '@mui/system';
import logoImg from '../img/logo.png';
import backgroundImageWebP from "../img/gigo-landing-christmas.webp";
import backgroundImagePNG from "../img/gigo-landing-christmas.png";
import { getAllTokens, themeHelpers } from '../theme';
import LazyLoad from 'react-lazyload';
import { SocialIcon } from 'react-social-icons';
import GigoCircleIcon from './Icons/GigoCircleLogo';
import Snowfall from 'react-snowfall';

// Responsive Hero container for mobile
const HeroContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: 'calc(100vh - 56px)',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column', // Change to column for mobile
    alignItems: 'center',
    justifyContent: 'flex-start', // Change alignment for mobile
    backgroundImage: `url(${backgroundImageWebP}), url(${backgroundImagePNG})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
}));

const HeroContent = styled(Box)({
    position: 'relative',
    textAlign: 'center',
    width: "90vw", // Adjust width for mobile
    zIndex: 999,
    color: '#fff',
    borderRadius: "10px",
    padding: "10px", // Adjust padding for mobile
    ...themeHelpers.frostedGlass,
    backgroundColor: "#1D1D1D25",
    marginTop: 'auto', // Adjust margin for mobile layout
    marginBottom: 'auto'
});

const GIGOLandingPageChristmasMobile: React.FC = () => {
    // retrieve theme from local storage
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const endRef = useRef<HTMLDivElement | null>(null);

    return (
        <>
            <HeroContainer sx={{ width: "100vw" }}>
                <Snowfall />
                <HeroContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <GigoCircleIcon sx={{ height: '60px', width: '60px', color: "#fff" }}/>
                        <Typography variant="h4" gutterBottom> {/* Change typography variant */}
                            Welcome to GIGO
                        </Typography>
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ maxWidth: "80vw" }}> {/* Change typography variant and max width */}
                        GIGO is the best place to learn how to code
                    </Typography>
                    <Typography variant="body2" gutterBottom sx={{ maxWidth: "80vw" }}> {/* Change typography variant and max width */}
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
                        <Link variant="caption" href="https://discord.gg/279hECYrfX" gutterBottom color="#ffffff" target="_blank"> {/* Change typography variant */}
                            Join us on Discord!
                        </Link>
                        <SocialIcon
                            network="discord"
                            url="https://discord.gg/279hECYrfX"
                            bgColor={"transparent"}
                            fgColor={mode === 'dark' ? "white" : "black"}
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

export default GIGOLandingPageChristmasMobile;
