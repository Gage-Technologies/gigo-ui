

import * as React from "react";
import {
    Box,
    createTheme,
    CssBaseline,
    Grid,
    PaletteMode,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens, getDesignTokens, isHoliday} from "../theme";
import { AwesomeButton } from "react-awesome-button";
import 'react-awesome-button/dist/styles.css';

import AboutBytesIcon from "../components/Icons/bytes/AboutPage";
import CTIcon from "../components/Icons/bytes/ct-logo.svg";
import NSIcon from "../components/Icons/bytes/ns-icon.svg";
import DebugIcon from "../components/Icons/Debug";
import ByteEasySelectionIcon from "../img/bytes/difficulty/ByteEasySelection";
import ByteMediumSelectionIcon from "../img/bytes/difficulty/ByteMediumSelection";
import ByteHardSelectionIcon from "../img/bytes/difficulty/ByteHardSelection";
import config from "../config";
function AboutBytes() {
    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    // For now, this is always set to the default theme to keep consistency
    const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    //@ts-ignore
    const DesktopVideo = ({ videoSrc }) => {
        return (
            <Box sx={{height: "auto", width: "40vw"}}>
                <video
                    src={videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{width: '100%', height: 'auto', borderRadius: "10px", border: "solid 2px #008664"}}
                >
                    Your browser does not support the video tag.
                </video>
            </Box>
        );
    };

    //@ts-ignore
    const MobileVideo = ({ videoSrc }) => {
        return (
            <Box sx={{height: "auto", width: "100vw", p: 2}}>
                <video
                    src={videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{width: '100%', height: 'auto', borderRadius: "10px", border: "solid 2px #008664"}}
                >
                    Your browser does not support the video tag.
                </video>
            </Box>
        );
    };

    const renderDesktop = () => {
        return (
            <>
                <Box style={{width: "100%", height: "500px", backgroundColor: theme.palette.secondary.dark}}>
                    <div style={{width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-evenly"}}>
                        <div style={{position: "relative", top: "100px", width: '50%'}}>
                            <Typography variant={"h1"} sx={{color: "white"}}>
                                GIGO Bytes
                            </Typography>
                            <Typography variant={"subtitle1"} sx={{color: "white", textTransform: 'none', mt: 3}}>
                                A transformative way for learners to sharpen their coding skills. Mini coding challenges, designed to fit into your busy schedule.
                            </Typography>
                        </div>
                        <div>
                            <AboutBytesIcon style={{height: "400px", width: "400px", paddingTop: "40px"}}/>
                        </div>
                    </div>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <AwesomeButton style={{
                            width: "auto",
                            height: "50px",
                            '--button-primary-color': theme.palette.primary.main,
                            '--button-primary-color-dark': theme.palette.primary.dark,
                            '--button-primary-color-light': theme.palette.text.primary,
                            '--button-primary-color-hover': theme.palette.primary.main,
                            fontSize: "28px"
                        }} type="primary" href={"/byte/1750943457427324928"} >
                            <span>Take a Byte</span>
                        </AwesomeButton>
                    </Box>
                </Box>
                <div>
                    <br/><br/><br/><br/><br/><br/>

                    <Grid container spacing={0}>
                        <Grid item xs={1} />
                        <Grid item xs={4}>
                            <h2 style={{ textAlign: 'left' }}>Code Teacher</h2>
                            <p>GIGO Bytes are integrated with Code Teacher to offer a unique and personalized learning experience. Code Teacher acts as your own personal AI tutor, providing tailored guidance and support throughout your coding journey. </p>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <img alt="Code Teacher" src={CTIcon} style={{ width: "16vw", height: "16vw"}} />
                            </div>
                        </Grid>
                        <Grid item xs={1} />
                        <Grid item xs={4} style={{ paddingTop: "5vh" }}>
                            <DesktopVideo videoSrc={config.rootPath + "/static/ui/videos/demo-chat.mp4"} />
                        </Grid>
                        <Grid item xs={1} />
                    </Grid>

                    <br/><br/><br/><br/><br/><br/>

                    <Grid container spacing={0}>
                        <Grid item xs={1}/>
                        <Grid item xs={4}>
                            <DesktopVideo videoSrc={config.rootPath + "/static/ui/videos/demo-debug.mp4"}/>
                        </Grid>
                        <Grid item xs={1}/>
                        <Grid item xs={4}>
                            <h2 style={{textAlign: 'left'}}>Need to Debug?</h2>
                            <p>When you run into errors, Code Teacher is there to automatically correct them, turning
                                every mistake into a learning opportunity.</p>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <DebugIcon style={{height: '16vw', width: '16vw'}}/>
                            </div>
                        </Grid>
                        <Grid item xs={1}/>
                    </Grid>

                    <br/><br/><br/><br/><br/><br/>


                    <Grid container spacing={0}>
                        <Grid item xs={1}/>
                        <Grid item xs={4}>
                            <h2 style={{textAlign: 'left'}}>Feeling stuck?</h2>
                            <p>Code Teacher will offer intelligent suggestions on 'What To Do Next?', ensuring a smooth
                                learning curve.</p>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <Box sx={{
                                    border: 'solid 4px',
                                    borderColor: '#84E8A2',
                                    borderRadius: "32px",
                                    width: "14vw",
                                    height: "14vw",
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mt: 1
                                }}>
                                    <img alt="Code Teacher" src={NSIcon} style={{width: "7vw", height: "7vw"}}/>
                                </Box>
                            </div>
                        </Grid>
                        <Grid item xs={1}/>
                        <Grid item xs={4}>
                            <DesktopVideo videoSrc={config.rootPath + "/static/ui/videos/demo-nextsteps.mp4"}/>
                        </Grid>
                        <Grid item xs={1}/>
                    </Grid>

                    <br/><br/><br/><br/><br/><br/>

                    <Grid container spacing={0}>
                        <Grid item xs={1}/>
                        <Grid item xs={4}>
                            <DesktopVideo videoSrc={config.rootPath + "/static/ui/videos/demo-difficulty.mp4"}/>
                        </Grid>
                        <Grid item xs={1}/>
                        <Grid item xs={4}>
                            <h2 style={{textAlign: 'left'}}>Customizable Difficulty Levels</h2>
                            <p>Adjust the difficulty level of each challenge, making it suitable for
                                various experience levels. Each difficulty has it's own goal unique to that level of programming.
                            </p>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mt: 1,
                                    gap: "20px"
                                }}>
                                    <ByteEasySelectionIcon style={{height: "12vw"}}/>
                                    <ByteMediumSelectionIcon style={{height: "12vw"}}/>
                                    <ByteHardSelectionIcon style={{height: "12vw"}}/>
                                </Box>
                            </div>

                        </Grid>
                        <Grid item xs={1}/>
                    </Grid>


                    <br/><br/><br/><br/><br/><br/>
                </div>
            </>
        )
    }

    const renderMobile = () => {
        const textStyle = {
            textAlign: 'center',
            margin: '10px 20px'
        };

        return(
            <>
                <Box style={{width: "100%", height: "500px", backgroundColor: theme.palette.secondary.dark}}>
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                        <AboutBytesIcon
                            style={{height: "250px", width: "250px", paddingTop: "40px", paddingBottom: "20px"}}/>
                    </div>
                    <Grid container spacing={0}>
                        <Grid item xs={12}>
                            <h1 style={textStyle as React.CSSProperties}>GIGO Bytes</h1>
                            <p style={textStyle as React.CSSProperties}>A transformative way for learners to sharpen
                                their coding skills. Mini coding challenges, designed to fit into your busy
                                schedule.</p>
                        </Grid>
                    </Grid>
                </Box>
                <br/><br/>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <img alt="Code Teacher" src={CTIcon} style={{width: "50vw", height: "50vw"}}/>
                        </div>
                        <h2 style={textStyle as React.CSSProperties}>Code Teacher</h2>
                        <p style={textStyle as React.CSSProperties}>GIGO Bytes are integrated with Code Teacher to offer
                            a unique and personalized learning experience. Code Teacher acts as your own personal AI
                            tutor, providing tailored guidance and support throughout your coding journey.</p>
                        <Grid item xs={4} style={{paddingTop: "5vh"}}>
                            <MobileVideo videoSrc={config.rootPath + "/static/ui/videos/demo-chat.mp4"}/>
                        </Grid>
                    </Grid>
                </Grid>
                <br/><br/>
                <hr style={{width: '80%', border: `1px solid ${theme.palette.secondary.contrastText}`, margin: '0 auto'}}/>
                <br/><br/>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <DebugIcon style={{height: '50vw', width: '50vw'}}/>
                        </div>
                        <h2 style={textStyle as React.CSSProperties}>Need to Debug?</h2>
                        <p style={textStyle as React.CSSProperties}>When you run into errors, Code Teacher is there to
                            automatically correct them, turning
                            every mistake into a learning opportunity.</p>
                        <Grid item xs={4} style={{paddingTop: "5vh"}}>
                            <MobileVideo videoSrc={config.rootPath + "/static/ui/videos/demo-debug.mp4"}/>
                        </Grid>
                    </Grid>
                </Grid>
                <br/><br/>
                <hr style={{
                    width: '80%',
                    border: `1px solid ${theme.palette.secondary.contrastText}`,
                    margin: '0 auto'
                }}/>
                <br/><br/>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <Box sx={{
                                border: 'solid 4px',
                                borderColor: '#84E8A2',
                                borderRadius: "32px",
                                width: "50vw",
                                height: "50vw",
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                mt: 1
                            }}>
                                <img alt="Code Teacher" src={NSIcon} style={{width: "30vw", height: "30vw"}}/>
                            </Box>
                        </div>
                        <h2 style={textStyle as React.CSSProperties}>Feeling Stuck?</h2>
                        <p style={textStyle as React.CSSProperties}>Code Teacher will offer intelligent suggestions on
                            'What To Do Next?', ensuring a smooth
                            learning curve.</p>
                        <Grid item xs={4} style={{paddingTop: "5vh"}}>
                            <MobileVideo videoSrc={config.rootPath + "/static/ui/videos/demo-nextsteps.mp4"}/>
                        </Grid>
                    </Grid>
                </Grid>
                <br/><br/>
                <hr style={{
                    width: '80%',
                    border: `1px solid ${theme.palette.secondary.contrastText}`,
                    margin: '0 auto'
                }}/>
                <br/><br/>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                mt: 1,
                                gap: "20px"
                            }}>
                                <ByteEasySelectionIcon style={{height: "30vw"}}/>
                                <ByteMediumSelectionIcon style={{height: "30vw"}}/>
                                <ByteHardSelectionIcon style={{height: "30vw"}}/>
                            </Box>
                        </div>
                        <h2 style={textStyle as React.CSSProperties}>Customizable Difficulty</h2>
                        <p style={textStyle as React.CSSProperties}>Adjust the difficulty level of each challenge,
                            making it suitable for
                            various experience levels. Each difficulty has it's own goal unique to that level of
                            programming.</p>
                        <Grid item xs={4} style={{paddingTop: "5vh"}}>
                            <MobileVideo videoSrc={config.rootPath + "/static/ui/videos/demo-difficulty.mp4"}/>
                        </Grid>
                    </Grid>
                </Grid>
                <br/><br/>
            </>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div>
                    {window.innerWidth > 1000 ? renderDesktop() : renderMobile()}
                </div>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default AboutBytes;