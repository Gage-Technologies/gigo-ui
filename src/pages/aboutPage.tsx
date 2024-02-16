import * as React from "react";
import {useEffect, useState} from "react";
import {
    Box, Button,
    createTheme,
    CssBaseline,
    Grid, IconButton,
    PaletteMode,
    ThemeProvider, Tooltip,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useAppSelector} from "../app/hooks";
import {useNavigate} from "react-router-dom";
import AboutPageIcon from "../components/Icons/aboutPage/AboutPage";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import AboutPageLearnIcon from "../components/Icons/aboutPage/AboutPageLearn";
import AboutPageEasyIcon from "../components/Icons/aboutPage/AboutPageEasy";
import AboutPageConnectionIcon from "../components/Icons/aboutPage/AboutPageConnection";
import AboutPageWorldIcon from "../components/Icons/aboutPage/AboutPageWorld";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import config from "../config";

function About() {
    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);

    const [loading, setLoading] = React.useState(false)

    let navigate = useNavigate();

    const [isHidden, setIsHidden] = React.useState(false);

    const topIconRef = React.useRef<HTMLDivElement | null>(null)

    const handleScroll = () => {
        setIsHidden(window.pageYOffset > 0);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        // Cleanup function
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

    const aspectRatio = useAspectRatio();


    const iconContainerStyles: React.CSSProperties = {
        width:
            sidebarOpen
                ? 'calc(95vw - 15vw)'
                : chatOpen ? 'calc(95vw - 15vw)'
                    : '100vw',
        height: '85vh', // Set to 100% of viewport height
        position: 'relative',
        zIndex: 0,
    };

    const vignetteStyles: React.CSSProperties = {
        width:
            aspectRatio !== '21:9' ?
                sidebarOpen
                    ? 'calc(95vw - 15vw)'
                    : chatOpen ? 'calc(95vw - 15vw)'
                        : '95vw'
                :
                sidebarOpen
                    ? 'calc(75vw - 15vw)'
                    : chatOpen ? 'calc(75vw - 15vw)'
                        : '70vw',
        height: '90vh',
        background: `radial-gradient(circle, rgba(0,0,0,0) 50%, ${hexToRGBA(theme.palette.background.default)} 70%, ${hexToRGBA(theme.palette.background.default)} 83%), linear-gradient(180deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 52%, ${hexToRGBA(theme.palette.background.default)} 92%, ${hexToRGBA(theme.palette.background.default)}`, // Vignette gradient
        position: 'absolute',
        left:
            aspectRatio !== '21:9' ?
                '2%'
                :
                sidebarOpen ?
                    '12%'
                    : chatOpen ?
                        '12%'
                        : '15%',
        bottom: (aspectRatio !== '21:9') && (sidebarOpen || chatOpen) ? '-1%' : '0%',
        zIndex: 2, // Set a higher zIndex to appear above the SVG
    };

    const iconStyles: React.CSSProperties = {
        width: '150%',
        height: '150%',
    };

    const backgroundStyles: React.CSSProperties = {
        width: '100%',
        height: '100%',
        // ensure the image fits the page
        // objectFit: 'cover',
    };

    const [isExpanded, setIsExpanded] = useState(false);

    const handleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    const renderFullPage = () => {
        return (
            <>
                <Box
                    display={"flex"}
                    justifyContent={"center"}
                    sx={{
                        m: 2,
                        overflow: "hidden", // Ensure the video does not overflow the Box boundaries
                        position: "relative"
                    }}
                >
                    {/* Video element as background */}
                    <video
                        autoPlay
                        loop
                        muted
                        style={{
                            margin: "10px",
                            width: "calc(100% - 40px)",
                            maxWidth: "1800px",
                            height: "600px",
                            borderRadius: "12px",
                            objectFit: "cover", // Cover the entire area without losing aspect ratio
                            zIndex: 1, // Ensure it's behind other content
                        }}
                    >
                        <source src={config.rootPath + "/static/ui/videos/GIGO.webm"} type="video/webm"/>
                        Your browser does not support the video tag.
                    </video>
                </Box>
                {/* Add a floating arrow down to indicate that user should scroll */}
                {!isHidden && (
                    <Box
                        display={"flex"}
                        flexDirection={"column"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        sx={{
                            width: "100%",
                            zIndex: 10,
                            position: "absolute",
                            top: 720
                        }}
                    >
                        <Typography variant={"h5"} style={{fontWeight: "bold", textAlign: "center"}}>
                            GIGO is where you learn to code.
                        </Typography>
                        <Tooltip title={"Scroll To About"} placement={"top"}>
                            <IconButton
                                sx={{
                                    fontSize: '3em',
                                    zIndex: 1000,
                                    width: "fit-content"
                                }}
                                onClick={() => {
                                    topIconRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                                }}
                            >
                                <KeyboardArrowDownIcon fontSize={"large"}/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                <div>
                    <br/><br/><br/><br/><br/><br/>

                    <Grid container spacing={0} ref={topIconRef}>
                        <Grid item xs={2}/>
                        <Grid item xs={3}>
                            <h2 style={{textAlign: 'left'}}>Learn by Doing</h2>
                            <p>GIGO offers users the opportunity to tackle and craft genuine coding challenges. Through
                                problem-solving and project development, users gain a deeper understanding of
                                programming</p>
                        </Grid>
                        <Grid item xs={2}/>
                        <Grid item xs={3}>
                            <AboutPageLearnIcon style={iconStyles} aspectRatio={aspectRatio.toString()}/>
                        </Grid>
                        <Grid item xs={2}/>
                    </Grid>

                    <br/><br/><br/><br/><br/><br/>

                    <Grid container spacing={0}>
                        <Grid item xs={2}/>
                        <Grid item xs={3}>
                            <AboutPageEasyIcon style={iconStyles} aspectRatio={aspectRatio.toString()}/>
                        </Grid>
                        <Grid item xs={2}/>
                        <Grid item xs={3}>
                            <h2 style={{textAlign: 'left'}}>Take it Easy</h2>
                            <p>Our preconfigured development environments, running on our robust in-house
                                infrastructure, allow you to jump straight into writing and running code.</p>
                        </Grid>
                        <Grid item xs={2}/>
                    </Grid>

                    <br/><br/><br/><br/><br/><br/>

                    <Grid container spacing={0}>
                        <Grid item xs={2}/>
                        <Grid item xs={3}>
                            <h2 style={{textAlign: 'left'}}>Connect</h2>
                            <p>Engage, collaborate, and socialize with a network of programmers who share your passion
                                for technology.</p>
                        </Grid>
                        <Grid item xs={2}/>
                        <Grid item xs={3}>
                            <AboutPageConnectionIcon style={iconStyles} aspectRatio={aspectRatio.toString()}/>
                        </Grid>
                        <Grid item xs={2}/>
                    </Grid>

                    <br/><br/><br/><br/><br/><br/>

                    <Grid container spacing={0}>
                        <Grid item xs={2}/>
                        <Grid item xs={3}>
                            <AboutPageWorldIcon style={iconStyles} aspectRatio={aspectRatio.toString()}/>
                        </Grid>
                        <Grid item xs={2}/>
                        <Grid item xs={3}>
                            <h2 style={{textAlign: 'left'}}>Real World Experience</h2>
                            <p>Our extensive library of tutorials, interactive projects, and challenges are designed to
                                level up your skills for today's tech industry.</p>
                        </Grid>
                        <Grid item xs={2}/>
                    </Grid>
                    <br/><br/><br/><br/><br/><br/>
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        <Button variant={'outlined'} href={"/aboutBytes"}>
                            Learn About Bytes
                        </Button>
                    </Box>
                    <br/>
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        {/*<Button variant={'outlined'} onClick={handleExpand}>*/}
                        {/*    {isExpanded ? 'Show Less' : 'Learn More'}*/}
                        {/*</Button>*/}
                        <br/>
                        {isExpanded && (
                            <div style={{display: "flex", textAlign: "center", flexDirection: "column", width: "100%"}}>
                                <div style={{height: "20px"}}/>
                                <body style={{
                                    width: "55%",
                                    alignSelf: "center",
                                    lineHeight: 2,
                                    textAlign: "justify",
                                    color: theme.palette.text.primary
                                }}>
                                GIGO is a community that is more than just another coding platform; it's a revolution in
                                software development, education, and collaboration. We believe that the future of the
                                tech industry lies in collective growth. That's why GIGO aims to dismantle the barriers
                                that hold back most novice and intermediate programmers. Our community is dedicated to
                                collaborative learning, knowledge sharing, and advancing both individual coders and the
                                tech industry as a whole.
                                <br/>
                                <br/>
                                One of the most daunting barriers to coding is setting up a functional development
                                environment. With GIGO, those hours spent installing dependencies, configuring servers,
                                and resolving version conflicts are a thing of the past. Our preconfigured development
                                environments, running on our robust in-house infrastructure, allows you to jump straight
                                into writing and running code.
                                <br/>
                                <br/>
                                <br/>
                                </body>
                            </div>
                        )}
                    </Box>
                </div>
            </>
        )
    }

    const renderMobilePage = () => {
        const textStyle = {
            textAlign: 'center',
            margin: '10px 20px'
        };

        return (
            <>
                <br/><br/>
                <AboutPageLearnIcon aspectRatio={'mobile'}/>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <h2 style={textStyle as React.CSSProperties}>Learn by Doing</h2>
                        <p style={textStyle as React.CSSProperties}>GIGO offers users the opportunity to tackle and
                            craft genuine coding challenges. Through problem-solving and project development, users gain
                            a deeper understanding of programming</p>
                    </Grid>
                </Grid>
                <br/><br/><br/><br/>
                <AboutPageEasyIcon aspectRatio={'mobile'}/>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <h2 style={textStyle as React.CSSProperties}>Take it Easy</h2>
                        <p style={textStyle as React.CSSProperties}>Our preconfigured development environments, running
                            on our robust in-house infrastructure, allow you to jump straight into writing and running
                            code.</p>
                    </Grid>
                </Grid>
                <br/><br/><br/><br/>
                <AboutPageConnectionIcon aspectRatio={'mobile'}/>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <h2 style={textStyle as React.CSSProperties}>Connect</h2>
                        <p style={textStyle as React.CSSProperties}>Engage, collaborate, and socialize with a network of
                            programmers who share your passion for technology.</p>
                    </Grid>
                </Grid>
                <br/><br/><br/><br/>
                <AboutPageWorldIcon aspectRatio={'mobile'}/>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <h2 style={textStyle as React.CSSProperties}>Real World Experience</h2>
                        <p style={textStyle as React.CSSProperties}>Our extensive library of tutorials, interactive
                            projects, and challenges are designed to level up your skills for today's tech industry.</p>
                    </Grid>
                </Grid>
                <br/><br/>
            </>
        )
    }


    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {window.innerWidth > 1000 ? renderFullPage() : renderMobilePage()}
            </CssBaseline>
        </ThemeProvider>
    );
}

function hexToRGBA(hex: any, alpha = 1) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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


export default About;