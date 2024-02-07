import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Typography, Box, PaletteMode, createTheme, Link } from '@mui/material';
import { styled } from '@mui/system';
import backgroundImageWebP from "../../img/gigo-landing-valentines.webp";
import backgroundImagePNG from "../../img/gigo-landing-valentines.png";
import { getAllTokens, themeHelpers } from '../../theme';
import LazyLoad from 'react-lazyload';
import { SocialIcon } from 'react-social-icons';
import GigoCircleIcon from '../Icons/GigoCircleLogo';
import HeartIcon from "../Icons/Heart";

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

const GIGOLandingPageValentinesMobile: React.FC = () => {
    // retrieve theme from local storage
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [hearts, setHearts] = useState<string[]>([]);
    const endRef = useRef<HTMLDivElement | null>(null);

    // Define the move animation
    useEffect(() => {
        // Generate unique keyframes for each firefly
        setHearts(Array.from({ length: 30 }, (_, index) => {
            let moveX = Math.random() * window.innerWidth * (Math.random() > .5 ? -1 : 1);
            while (Math.abs(moveX) < 100) {
                moveX = Math.random() * window.innerWidth * (Math.random() > .5 ? -1 : 1);
            }

            let moveY = Math.random() * window.innerHeight * (Math.random() > .5 ? -1 : 1);
            while (Math.abs(moveY) < 100) {
                moveY = Math.random() * window.innerHeight * (Math.random() > .5 ? -1 : 1);
            }

            return `
                @keyframes move_${index} {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(${moveX}px, ${moveY}px); }
                }
            `;
        }));
    }, []);

    const heartsMemo = useMemo(() => {
        return (
            <>
                <style>
                    {hearts.join(' ')}
                </style>
                {hearts.map((_, index) => {
                    let size = Math.max(Math.random() * 12, 5);
                    return (
                        <LazyLoad once scroll unmountIfInvisible>
                            <HeartIcon
                                key={index}
                                sx={{
                                    color: "pink",
                                    position: 'absolute',
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    animation: `move_${index} ${Math.max(Math.random() * 120, 15)}s ease-in-out infinite`,
                                }}
                            />
                        </LazyLoad>
                    )
                })}
            </>
        )
    }, [hearts])

    return (
        <>
            <HeroContainer sx={{ width: "100vw" }}>
                {heartsMemo}
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
                            backgroundColor: theme.palette.primary.main + "50",
                            '&:hover': {
                                backgroundColor: theme.palette.primary.main + "99",
                            }
                        }}
                        href="/signup"
                        // onClick={() => {
                        //     if (endRef.current) {
                        //         endRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
                        //     }
                        // }}
                    >
                        Fall In Love With GIGO
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

export default GIGOLandingPageValentinesMobile;
