

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
import {getAllTokens, isHoliday} from "../theme";
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

import premiumImage from "../img/croppedPremium.png";
import premiumGorilla from "../img/premiumGorilla.png";
import codeTeacher from "../img/premiumPageIcons/graduation-cap.svg"
import streakFreeze from "../img/premiumPageIcons/ice-cube.svg"
import workspaces from "../img/premiumPageIcons/settings.svg"
import resources from "../img/premiumPageIcons/technology.svg"
import privateWorkspace from "../img/premiumPageIcons/padlock.svg"
import vscodeTheme from "../img/premiumPageIcons/coding.svg"
import christmasLogin219 from "../img/christmas-login-21-9.png";
import loginImg219 from "../img/login/login_background-21-9.jpg";
import christmasLogin from "../img/christmas-login.png";

function PremiumDescription() {
    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

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


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div>
                    <Box style={window.innerWidth > 1000 ? { width: "100%", height: "500px", backgroundColor: renderThemeColor() } : { width: "100%", height: "850px", backgroundColor: renderThemeColor() }}>
                        <div style={window.innerWidth > 1000 ? { width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-evenly" } : { width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>
                            <div style={window.innerWidth > 1000 ? { position: "relative", top: "150px" } : { position: "relative", height: "100%", top: "50px" }}>
                                {inTrial ? (
                                    <div style={window.innerWidth > 1000 ? {} : { left: "20px", position: "relative", width: "90%", lineHeight: 1.5 }}>
                                        <h1 style={{ top: '1%' }}>
                                            1 Month Trial Expires in{' '}
                                            {window.innerWidth > 1000 ? (
                                                <span style={window.innerWidth > 1000 ? {
                                                    backgroundColor: 'rgba(256, 256, 256, 0.6)', // adjust the transparency by changing the alpha value
                                                    padding: '10px',
                                                    borderRadius: '15px',
                                                    marginLeft: '10px', // adjust the space between the text and the date
                                                } : {
                                                    backgroundColor: 'rgba(256, 256, 256, 0.6)', // adjust the transparency by changing the alpha value
                                                    padding: '10px',
                                                    borderRadius: '15px',
                                                    marginLeft: '10px', // adjust the space between the text and the date
                                                    fontSize: "18px"
                                                }}>
                                                    {getCountdown(membershipDates.upcoming)}
                                                </span>
                                            ) : (
                                                <div style={window.innerWidth > 1000 ? {} : { marginTop: "20px" }}>
                                                    <span style={window.innerWidth > 1000 ? {
                                                        backgroundColor: 'rgba(256, 256, 256, 0.6)', // adjust the transparency by changing the alpha value
                                                        padding: '10px',
                                                        borderRadius: '15px',
                                                        marginLeft: '10px', // adjust the space between the text and the date
                                                    } : {
                                                        backgroundColor: 'rgba(256, 256, 256, 0.6)', // adjust the transparency by changing the alpha value
                                                        padding: '10px',
                                                        borderRadius: '15px',
                                                        marginLeft: '10px', // adjust the space between the text and the date
                                                        fontSize: "18px"
                                                    }}>
                                                        {getCountdown(membershipDates.upcoming)}
                                                    </span>
                                                </div>
                                            )}
                                        </h1>
                                        {/*<h4> Dont want To see it go?</h4>*/}


                                        <h4>Don't want to see it go? Only $15.00/month. Cancel anytime.</h4>
                                        <AwesomeButton style={{
                                            width: "auto",
                                            '--button-primary-color': theme.palette.background.paper,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.dark,
                                            fontSize: "14px"
                                        }} type="primary" onPress={() => stripeNavigate()}>
                                            <img src={premiumImage} />
                                        </AwesomeButton>
                                    </div>
                                ) : membership !== 1 ? (
                                    <div style={window.innerWidth > 1000 ? {} : { left: "20px", position: "relative", width: "90%" }}>
                                        <h1>Become a Pro</h1>
                                        <h4>Only $15.00/month. Cancel anytime.</h4>
                                        <AwesomeButton style={{
                                            width: "auto",
                                            '--button-primary-color': theme.palette.background.paper,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.dark,
                                            fontSize: "14px"
                                        }} type="primary" onPress={() => stripeNavigate()}>
                                            <img src={premiumImage} />
                                        </AwesomeButton>
                                    </div>
                                ) : (
                                    <div style={window.innerWidth > 1000 ? {} : { position: "relative", left: "20px", width: "90%", lineHeight: 1.5 }}>
                                        <h1>
                                            It Feels Good to Be A Pro
                                        </h1>
                                        <h4>No Limits. No Restrictions. True Freedom.</h4>
                                        <AwesomeButton style={{
                                            width: "auto",
                                            '--button-primary-color': theme.palette.background.paper,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.dark,
                                            fontSize: "14px"
                                        }} type="primary" href={"/settings"} onPress={() => {
                                            window.sessionStorage.setItem("accountsPage", "membership");
                                        }}>
                                            <span>Manage Plan</span>
                                        </AwesomeButton>
                                    </div>
                                )
                                }

                            </div>
                            <div>
                                <img src={premiumGorilla} width={window.innerWidth <= 280 ? 200 : ""} />
                            </div>
                        </div>
                    </Box>
                    <div style={window.innerWidth > 1000 ? { height: "200px" } : { height: "100px" }} />
                    <Box>
                        <div style={window.innerWidth > 1000 ? { display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-evenly" } : { display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
                            <div style={window.innerWidth > 1000 ? {} : { marginBottom: "50px" }}>
                                <Button disabled={true} style={{ backgroundColor: renderThemeColor() }}>
                                    <img src={codeTeacher} width={width} height={height} />
                                </Button>
                                <div style={window.innerWidth > 1000 ? { width: textWidth } : { width: textWidth, wordWrap: "break-word" }}>
                                    <h4>Access to Code Teacher</h4>
                                    <body>Your personal Magic tutor. Code Teacher works along side you to help you learn to code and solve problems.</body>
                                </div>
                            </div>
                            <div style={window.innerWidth > 1000 ? {} : { marginBottom: "50px" }}>
                                <Button disabled={true} style={{ backgroundColor: renderThemeColor() }}>
                                    <img src={privateWorkspace} width={width} height={height} />
                                </Button>
                                <div style={window.innerWidth > 1000 ? { width: textWidth } : { width: textWidth, wordWrap: "break-word" }}>
                                    <h4>Private Workspaces</h4>
                                    <body>Keep your code personal. Work on projects privately, developing your skills in stealth mode.</body>
                                </div>
                            </div>
                            <div style={window.innerWidth > 1000 ? {} : { marginBottom: "50px" }}>
                                <Button disabled={true} style={{ backgroundColor: renderThemeColor() }}>
                                    <img src={resources} width={width} height={height} />
                                </Button>
                                <div style={window.innerWidth > 1000 ? { width: textWidth } : { width: textWidth, wordWrap: "break-word" }}>
                                    <h4>More Workspace Resources</h4>
                                    <body>Get Access to 8 cpu cores, 8GB ram and 50GB disk. Run projects faster, reduce build times, and get the best experience.</body>
                                </div>
                            </div>
                        </div>
                        <div style={{ height: "100px" }} />
                        <div style={window.innerWidth > 1000 ? { display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-evenly" } : { display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
                            <div style={window.innerWidth > 1000 ? {} : { marginBottom: "50px" }}>
                                <Button disabled={true} style={{ backgroundColor: renderThemeColor() }}>
                                    <img src={workspaces} width={width} height={height} />
                                </Button>
                                <div style={window.innerWidth > 1000 ? { width: textWidth } : { width: textWidth, wordWrap: "break-word" }}>
                                    <h4>Three Concurrent DevSpaces</h4>
                                    <body>Run all the code you need, as much as you need. Work on multiple projects at the same time or with up to three concurrent DevSpaces.</body>
                                </div>
                            </div>
                            <div style={window.innerWidth > 1000 ? {} : { marginBottom: "50px" }}>
                                <Button disabled={true} style={{ backgroundColor: renderThemeColor() }}>
                                    <img src={streakFreeze} width={width} height={height} />
                                </Button>
                                <div style={window.innerWidth > 1000 ? { width: textWidth } : { width: textWidth, wordWrap: "break-word" }}>
                                    <h4>Two Streak Freezes a Week</h4>
                                    <body>Keep your streak longer. Don't let a bad week kill your awesome streak! Streak freezes preserve your streak on days that you can't find the time.</body>
                                </div>
                            </div>
                            <div style={window.innerWidth > 1000 ? {} : { marginBottom: "50px" }}>
                                <Button disabled={true} style={{ backgroundColor: renderThemeColor() }}>
                                    <img src={vscodeTheme} width={width} height={height} />
                                </Button>
                                <div style={window.innerWidth > 1000 ? { width: textWidth } : { width: textWidth, wordWrap: "break-word" }}>
                                    <h4>Premium VsCode Theme</h4>
                                    <body>A unique code theme to help you see the errors faster. Code the GIGO way with the custom GIGO editor theme!</body>
                                </div>
                            </div>
                        </div>
                    </Box>
                    <div style={window.innerWidth > 1000 ? { height: "200px" } : { height: "100px" }} />
                </div>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default PremiumDescription;