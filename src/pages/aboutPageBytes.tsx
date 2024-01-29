

import * as React from "react";
import { useEffect } from "react";
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
import {getAllTokens, getDesignTokens, isHoliday} from "../theme";
import XpPopup from "../components/XpPopup";
import ProjectCard from "../components/ProjectCard";
import AppWrapper from "../components/AppWrapper";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { initialAuthState, initialAuthStateUpdate, selectAuthState, updateAuthState } from "../reducers/auth/auth";
import { useNavigate } from "react-router-dom";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import Lottie from "react-lottie";
import * as animationData from '../img/85023-no-data.json'
import Carousel from "../components/Carousel";
import { ThreeDots } from "react-loading-icons";
import aboutUsImg from "../img/aboutUsBackground.png"
import loginImg from "../img/login/login_background.png";
import { AwesomeButton } from "react-awesome-button";
import 'react-awesome-button/dist/styles.css';

import AboutBytesIcon from "../components/Icons/bytes/aboutPage";
//@ts-ignore
import chatDemo from "../components/Icons/bytes/demo-chat.mp4"
//@ts-ignore
import debugDemo from "../components/Icons/bytes/demo-debug.mp4"
//@ts-ignore
import difficultyDemo from "../components/Icons/bytes/demo-difficulty.mp4"
//@ts-ignore
import nextStepsDemo from "../components/Icons/bytes/demo-nextsteps.mp4"
import AboutPageLearnIcon from "../components/Icons/aboutPage/AboutPageLearn";
import AboutPageEasyIcon from "../components/Icons/aboutPage/AboutPageEasy";
import AboutPageConnectionIcon from "../components/Icons/aboutPage/AboutPageConnection";
import AboutPageWorldIcon from "../components/Icons/aboutPage/AboutPageWorld";
import CTIcon from "../components/Icons/bytes/ct-logo.svg";
import NSIcon from "../components/Icons/bytes/ns-icon.svg";
import DebugIcon from "../components/Icons/Debug";
import ByteEasySelectionIcon from "../img/bytes/difficulty/ByteEasySelection";
import ByteMediumSelectionIcon from "../img/bytes/difficulty/ByteMediumSelection";
import ByteHardSelectionIcon from "../img/bytes/difficulty/ByteHardSelection";
function AboutBytes() {
    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    // For now, this is always set to the default theme to keep consistency
    const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    // load auth state from storage
    const authState = useAppSelector(selectAuthState);

    const [loading, setLoading] = React.useState(false)
    const [inTrial, setInTrial] = React.useState(false)
    const [membership, setMembership] = React.useState(0)
    const [membershipDates, setMembershipDates] = React.useState({ start: 0, last: 0, upcoming: 0 })


    let navigate = useNavigate();
    let dispatch = useAppDispatch();

    const stripeNavigate = async () => {
        let res = await call(
            "/api/stripe/premiumMembershipSession",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        if (res["message"] === "You must be logged in to access the GIGO system.") {
            let authState = Object.assign({}, initialAuthState)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }
        if (res !== undefined && res["return url"] !== undefined) {
            window.location.replace(res["return url"])
        }
    }

    const getSubData = async () => {
        let follow = call(
            "/api/user/subscription",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            follow
        ])

        if (res === undefined) {
            swal("There has been an issue loading data. Please try again later.")
        }

        setMembershipDates({
            start: res["membershipStart"],
            last: res["lastPayment"],
            upcoming: res["upcomingPayment"]
        })
        setInTrial(res["inTrial"])
        setMembership(res["subscription"])

    }

    const UnixDateConverter = (unixTimestamp: number) => {
        let date = new Date(unixTimestamp * 1000);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        if (day === 0) {
            return "N/A"
        } else {
            return month + "/" + day + "/" + year;
        }
    }

    const getCountdown = (upcomingDateInSeconds: number) => {
        const upcomingDate = upcomingDateInSeconds * 1000; // Convert to milliseconds
        const now = new Date().getTime();
        const differenceInMilliseconds = upcomingDate - now;

        if (differenceInMilliseconds <= 0) {
            return "Expired";
        }

        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    // Changed "Become A Pro" to "Stay A Pro"

    useEffect(() => {
        if (authState.authenticated)
            getSubData()
    }, [])

    let height = "200px"
    let width = "200px"

    if (window.innerWidth <= 1000) {
        height = "180px"
        width = "180px"
    }

    let textWidth = "250px"

    if (window.innerWidth <= 1000) {
        if (window.innerWidth <= 280) {
            textWidth = "150px"
        } else {
            textWidth = "200px"
        }
    }

    const holiday = isHoliday()

    const renderThemeColor = () => {

        if (holiday === "Christmas") {
            if (mode === "light") {
                return "#79bbd0"
            } else {
                return "#aa0000"
            }
        } else {
            return "theme.palette.primary.light"
        }
    }

    //@ts-ignore
    const VideoAsGif = ({ videoSrc }) => {
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
                            <VideoAsGif videoSrc={chatDemo} />
                        </Grid>
                        <Grid item xs={1} />
                    </Grid>

                    <br/><br/><br/><br/><br/><br/>

                    <Grid container spacing={0}>
                        <Grid item xs={1}/>
                        <Grid item xs={4}>
                            <VideoAsGif videoSrc={debugDemo}/>
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
                            <VideoAsGif videoSrc={nextStepsDemo}/>
                        </Grid>
                        <Grid item xs={1}/>
                    </Grid>

                    <br/><br/><br/><br/><br/><br/>

                    <Grid container spacing={0}>
                        <Grid item xs={1}/>
                        <Grid item xs={4}>
                        <VideoAsGif videoSrc={difficultyDemo}/>
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

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div>
                    {renderDesktop()}
                </div>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default AboutBytes;