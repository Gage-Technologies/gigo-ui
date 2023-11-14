

import * as React from "react";
import {useEffect, useState} from "react";
import {
    Box,
    Button,
    createTheme,
    CssBaseline,
    Dialog, DialogActions, DialogContent, DialogTitle,
    Grid,
    PaletteMode,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens, isHoliday, themeHelpers} from "../theme";
import ProjectCard from "../components/ProjectCard";
import AppWrapper from "../components/AppWrapper";
import {useNavigate} from "react-router-dom";
import config from "../config";
import call from "../services/api-call";
import swal from "sweetalert";
import {ThreeDots} from "react-loading-icons";
import Lottie from "react-lottie";
import * as animationData from '../img/85023-no-data.json'
import Carousel from "../components/Carousel";
import '../components/Carousel.css'
import {
    initialAuthStateUpdate,
    selectAuthState,
    selectAuthStateId, selectAuthStateTutorialState, updateAuthState,
} from "../reducers/auth/auth";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import XpPopup from "../components/XpPopup";
import Joyride, {ACTIONS, CallBackProps, EVENTS, STATUS} from 'react-joyride';
import {string} from "prop-types";
import MoonLoader from "react-spinners/MoonLoader";
import useInfiniteScroll from "../hooks/infiniteScroll";
import { fontGrid } from "@mui/material/styles/cssUtils";
import { FontDownload } from "@mui/icons-material";
import LazyLoad from 'react-lazyload';
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
//@ts-ignore
import ReactGA from "react-ga4";
import ProjectCardLongStyle from "../components/ProjectCardLongStyle";
import IconButton from '@mui/material/IconButton';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import ArrowBackIosNewSharpIcon from '@mui/icons-material/ArrowBackIosNewSharp';
import HappyHalloweenIcon from "../components/Icons/HappyHalloween";
import PumpkinIcon from "../components/Icons/Pumpkin";
import Pumpkin2Icon from "../components/Icons/Pumpkin2";
import HalloweenBannerIcon from "../components/Icons/HalloweenBanner";
import GIGOLandingPage from "../components/Landing";
import GIGOLandingPageMobile from "../components/LandingMobile";


function Home() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);


    const dispatch = useAppDispatch();
    const aspectRatio = useAspectRatio();

    const authState = useAppSelector(selectAuthState);
    const [activeData, setActiveData] = React.useState<Array<never>>([])
    const [recData, setRecData] = React.useState<Array<never>>([])
    const [followData, setFollowData] = React.useState<Array<never>>([])
    const [topRec, setTopRec] = React.useState<Array<never>>([])
    const [loading, setLoading] = React.useState(true)

    const [tutorialStepIndex, setTutorialStepIndex] = React.useState(0)
    const userId = useAppSelector(selectAuthStateId) as string
    const [userProjects, setUserProjects] = React.useState<Array<never>>([])
    const [xpPopup, setXpPopup] = React.useState(false)
    const [xpData, setXpData] = React.useState(null)
    const [recDataPage, setRecDataPage] = React.useState(0)
    const stopScroll = React.useRef(false)
    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);

    ReactGA.initialize("G-38KBFJZ6M6");


    let navigate = useNavigate();

    let loggedIn = false
    if (authState.authenticated !== false) {
        loggedIn = true
    }

    const tutorialState = useAppSelector(selectAuthStateTutorialState);
    const [runTutorial, setRunTutorial] = React.useState(!tutorialState.home && loggedIn)

    // this enables us to push tutorial restarts from the app wrapper down into this page
    useEffect(() => {
        if (tutorialState.home === !runTutorial) {
            return
        }
        setRunTutorial(!tutorialState.home && loggedIn && window.innerWidth > 1000)
    }, [tutorialState])

    const infiniteScrollHandler = async () => {
        // we make up to 3 attempts to retrieve the next block of data
        for (let i = 0; i < 3; i++) {
            let rec = await call(
                "/api/home/recommended",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {
                    skip: recDataPage * 32,
                },
                null,
                config.rootPath
            )

            if (rec === undefined || rec["projects"] === undefined) {
                if (i === 2) {
                    //@ts-ignore
                    swal("Server Error", "The server is not being cool right now. We're gonna have a talk with it. Try again later!")
                }
                stopScroll.current = true
                continue
            }

            let newProjects = rec["projects"] as Array<never>

            if (newProjects.length === 0) {
                stopScroll.current = true
            }

            let localCopy = JSON.parse(JSON.stringify(recData))
            // @ts-ignore
            localCopy = localCopy.concat(newProjects)
            setRecData(localCopy)

            setRecDataPage(recDataPage + 1)

            break
        }
    }

    const [isFetching, setIsFetching] = useInfiniteScroll(infiniteScrollHandler, true, 1440, stopScroll)

    const apiLoad = async () => {

        if ((activeData.length === 0 || recData.length === 0 || followData.length === 0 || topRec.length === 0) && loggedIn) {
            let active = call(
                "/api/home/active",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {},
                null,
                config.rootPath
            )

            let follow = call(
                "/api/home/following",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {},
                null,
                config.rootPath
            )

            let projects = call(
                "/api/user/userProjects",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {skip: 0, limit: 10},
                null,
                config.rootPath
            )

            let top = call(
                "/api/home/top",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {},
                null,
                config.rootPath
            )

            const [res, res2, res3, res4] = await Promise.all([
                active,
                follow,
                projects,
                top
            ])

            if (
                (res === undefined || res["projects"] === undefined ||
                res2 === undefined || res["projects"] === undefined ||
                res3 === undefined || res["projects"] === undefined) ||
                res4 === undefined || res["projects"] === undefined && loggedIn
            ) {
                swal("There has been an issue loading data. Please try again later.")
            }

            setActiveData(res["projects"])
            setFollowData(res2["projects"])
            setUserProjects(res3["projects"])
            setTopRec(res4["projects"])
        }
    }


    useEffect(() => {
        let xpLogin = window.sessionStorage.getItem('loginXP')
        setLoading(true)

        if (authState.authenticated !== false){
            apiLoad().then(r => console.log("here: ", r))
        }
        // if (tutorial === true && window.sessionStorage.getItem("help") === "true") {
        //     setRun(true)
        // }
        setLoading(false)
        if (xpLogin !== "undefined" && xpLogin !== null) {
            setXpPopup(true)
            setXpData(JSON.parse(xpLogin))
        }
    }, [])

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const ProjectsBox = () => {
        if (userProjects === null || userProjects === undefined || userProjects.length === 0) {
            return (<div/>)
        }

        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "auto",
                paddingRight: "auto",
                justifyContent: "center",
                width: "100%",
                paddingBottom: "10px"
            }}>
                <div style={{display: "inline-flex", marginTop: "25px"}}>
                    <Typography variant="h6" gutterBottom sx={{
                        paddingLeft: "10px",
                        paddingTop: "6px",
                        fontSize: "1.2em"
                    }}>
                        My Projects
                    </Typography>
                    <Button variant="text"
                        onClick={async () => {
                            navigate("/profile")
                        }}
                        className={"show-all"}
                    >
                        (show all)
                    </Button>
                </div>
                <div style={{
                    display: "flex",
                    justifyContent: "start",
                    flexDirection: `row`,
                    alignContent: `center`,
                    overflowX: "auto",
                    marginLeft: "1%",
                }}>
                    <Carousel show={(document.documentElement.clientWidth < 1000 ? 1 : 4)}>
                        {
                            //@ts-ignore
                            userProjects.map((project, index) => {
                                return (
                                    <div className={'attempt'} style={{paddingBottom: "10px"}}>
                                        <LazyLoad once scroll unmountIfInvisible>
                                            <ProjectCard
                                                height={"23vh"}
                                                imageHeight={"23vh"}
                                                width={(chatOpen) ? "16vw" : (document.documentElement.clientWidth < 1000 ? 'fit-content' : '21vw')}
                                                imageWidth={(chatOpen) ? "16vw" : "21vw"}
                                                projectId={project["_id"]}
                                                projectTitle={project["title"]}
                                                projectDesc={project["description"]}
                                                projectThumb={config.rootPath + project["thumbnail"]}
                                                projectDate={project["updated_at"]}
                                                projectType={project["post_type_string"]}
                                                renown={project["tier"]}
                                                onClick={() => navigate("/challenge/" + project["_id"])}
                                                userTier={authState.tier}
                                                userThumb={config.rootPath + "/static/user/pfp/" + authState.id}
                                                userId={authState.id}
                                                username={authState.userName}
                                                backgroundName={authState.backgroundName}
                                                backgroundPalette={authState.backgroundColor}
                                                backgroundRender={authState.backgroundRenderInFront}
                                                exclusive={project["challenge_cost"] === null ? false : true}
                                                hover={false}
                                                role={authState.role}
                                                estimatedTime={project["estimated_tutorial_time_millis"]}
                                            />
                                        </LazyLoad>
                                    </div>
                                )
                            })}
                    </Carousel>
                </div>
            </div>
        )
    }

    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

    const nextProject = () => {
        setCurrentProjectIndex((prevIndex) => (prevIndex + 1) % topRec.length);
    };

    const prevProject = () => {
        setCurrentProjectIndex((prevIndex) => (prevIndex - 1 + topRec.length) % topRec.length);
    };

    const project = topRec[currentProjectIndex];


    const TopRecommendations = () => {
        return (
            <>
                <style>
                    {`
            @keyframes pulsate {
                0% {
                    text-shadow: 0 0 3px #fff, 0 0 5px #fff, 0 0 8px ${theme.palette.primary.main}, 0 0 10px ${theme.palette.primary.main}, 0 0 12px ${theme.palette.primary.main}, 0 0 14px ${theme.palette.primary.main}, 0 0 16px ${theme.palette.primary.main};
                }
                100% {
                    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main}, 0 0 40px ${theme.palette.primary.main}, 0 0 50px ${theme.palette.primary.main};
                }
            }
            `}
                </style>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    paddingBottom: "10px"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        alignContent: "center",
                        marginLeft: "1%",
                        marginRight: "1%",
                        marginTop: "2%",
                        marginBottom: "1%",
                        paddingLeft: "5%",
                        paddingRight: "5%",
                        gap: "5%"
                    }}>
                        {document.documentElement.clientWidth > 1000 && topRec.length > 0 && currentProjectIndex < topRec.length ? (
                            <IconButton onClick={prevProject}>
                                <ArrowBackIosNewSharpIcon />
                            </IconButton>
                        ) : null}
                        {
                            (topRec.length > 0 && currentProjectIndex < topRec.length) ? (
                                <div className={'attempt'} style={{ paddingBottom: "10px" }}>
                                    <LazyLoad once scroll unmountIfInvisible>
                                        <ProjectCardLongStyle
                                            height={document.documentElement.clientWidth < 1000 ? "23vh" : "42vh"}
                                            imageHeight={document.documentElement.clientWidth < 1000 ? "23vh" : "42vh"}
                                            width={(chatOpen) ? "35vw" : (document.documentElement.clientWidth < 1000 ? 'fit-content' : '42vw')}
                                            imageWidth={(chatOpen) ? "16vw" : "21vw"}
                                            projectId={topRec[currentProjectIndex]["_id"]}
                                            projectTitle={topRec[currentProjectIndex]["title"]}
                                            projectDesc={topRec[currentProjectIndex]["description"]}
                                            projectThumb={config.rootPath + topRec[currentProjectIndex]["thumbnail"]}
                                            projectDate={topRec[currentProjectIndex]["updated_at"]}
                                            projectType={topRec[currentProjectIndex]["post_type_string"]}
                                            renown={topRec[currentProjectIndex]["tier"]}
                                            onClick={() => navigate("/challenge/" + topRec[currentProjectIndex]["_id"])}
                                            userTier={topRec[currentProjectIndex]["user_tier"]}
                                            userThumb={config.rootPath + "/static/user/pfp/" + topRec[currentProjectIndex]["author_id"]}
                                            userId={topRec[currentProjectIndex]["author_id"]}
                                            username={topRec[currentProjectIndex]["author"]}
                                            backgroundName={topRec[currentProjectIndex]["background_name"]}
                                            backgroundPalette={topRec[currentProjectIndex]["background_palette"]}
                                            backgroundRender={topRec[currentProjectIndex]["background_render"]}
                                            exclusive={topRec[currentProjectIndex]["challenge_cost"] === null ? false : true}
                                            hover={false}
                                            role={topRec[currentProjectIndex]["user_status"]}
                                            animate={true}
                                        />
                                    </LazyLoad>
                                </div>
                            ) : null
                        }
                        {document.documentElement.clientWidth > 1000 && topRec.length > 0 && currentProjectIndex < topRec.length ? (
                            <IconButton onClick={nextProject}>
                                <ArrowForwardIosSharpIcon />
                            </IconButton>
                        ) : null}
                    </div>
                </div>
            </>
        );
    }


    const ActiveProjects = () => {
        if (activeData === null || activeData === undefined || activeData.length === 0) {
            return (<div/>)
        }

        // @ts-ignore
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "auto",
                paddingRight: "auto",
                justifyContent: "center",
                width: "100%",
                paddingBottom: "10px"
            }}>
                <div style={{display: "inline-flex"}}>
                    <Typography variant="h6" gutterBottom sx={{
                        paddingLeft: "10px",
                        paddingTop: "6px",
                        fontSize: "1.2em"
                    }}>
                        Active Challenges
                    </Typography>
                    <Button variant="text"
                            href={"/active"}
                            sx={{
                                fontSize: "0.8em",
                                fontWeight: "light",
                                textTransform: "lowercase",
                            }}
                    >
                        (show all)
                    </Button>
                </div>
                <div style={{
                    display: "flex",
                    justifyContent: "start",
                    flexDirection: `row`,
                    alignContent: `center`,
                    overflowX: "auto",
                    marginLeft: "1%",
                }}>
                    {/*TODO mobile => make carousel 1 for mobile*/}
                    <Carousel show={(document.documentElement.clientWidth < 1000 ? 1 : 4)}>
                        {
                            //@ts-ignore
                            activeData.map((project, index) => {
                                return (
                                    <div style={{paddingBottom: "10px"}}>
                                        <LazyLoad once scroll unmountIfInvisible>
                                            <ProjectCard
                                                height={"23vh"}
                                                imageHeight={"23vh"}
                                                // TODO mobile => make width 'fit-content'
                                                width={(chatOpen) ? "16vw" : (document.documentElement.clientWidth < 1000 ? 'fit-content' : '21vw')}
                                                imageWidth={(chatOpen) ? "16vw" : "21vw"}
                                                projectId={project["_id"]}
                                                projectTitle={project["title"] !== null ? project["title"] : project["post_title"]}
                                                projectDesc={project["description"]}
                                                projectThumb={config.rootPath + project["thumbnail"]}
                                                projectDate={project["updated_at"]}
                                                projectType={project["post_type_string"]}
                                                renown={project["tier"]}
                                                onClick={() => navigate("/attempt/" + project["_id"])}
                                                userTier={authState.tier}
                                                userThumb={config.rootPath + "/static/user/pfp/" + authState.id}
                                                userId={authState.id}
                                                username={authState.userName}
                                                backgroundName={authState.backgroundName}
                                                backgroundPalette={authState.backgroundColor}
                                                backgroundRender={authState.backgroundRenderInFront}
                                                exclusive={false}
                                                hover={false}
                                                attempt={true}
                                                role={authState.role}
                                            />
                                        </LazyLoad>
                                    </div>
                                )
                            })}
                    </Carousel>
                </div>
            </div>
        )
    }

    const Recommended = () => {
        let randomTag = () => {
            // generate a 6 digit random alpha-numeric string
            let result = '';
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for (let i = 0; i < 6; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result
        }

        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "auto",
                paddingRight: "auto",
                justifyContent: "center",
                width: "103%",
                paddingBottom: "10px",
                marginLeft: "1%",
            }}>
                <div style={{display: "inline-flex"}}>
                    <Typography variant="h6" gutterBottom sx={{
                        paddingLeft: "10px",
                        paddingTop: "6px",
                        fontSize: "1.2em",
                    }}>
                        Recommended Challenges
                    </Typography>
                </div>
                <Grid container spacing={4}
                    sx={{
                        paddingRight: "10px",
                        paddingLeft: "10px"
                    }}
                >
                    {
                        recData.map((project, index) => {
                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={"rec-"+project["_id"]}>
                                    <LazyLoad once scroll unmountIfInvisible>
                                        <ProjectCard
                                            height={"20vh"}
                                            imageHeight={"20vh"}
                                            // TODO mobile => make width 'fit-content'
                                            width={(chatOpen) ? "16vw" : (document.documentElement.clientWidth < 1000 ? 'fit-content' : '21vw')}
                                            imageWidth={(chatOpen) ? "16vw" : "20vw"}
                                            projectId={project["_id"]}
                                            projectTitle={project["title"]}
                                            projectDesc={project["description"]}
                                            projectThumb={config.rootPath + project["thumbnail"]}
                                            projectDate={project["updated_at"]}
                                            projectType={project["post_type"]}
                                            renown={project["tier"]}
                                            onClick={() => navigate("/challenge/" + project["_id"])}
                                            userTier={project["user_tier"]}
                                            userThumb={config.rootPath + "/static/user/pfp/" + project["author_id"]}
                                            userId={project["author_id"]}
                                            username={project["author"]}
                                            backgroundName={project["background_name"]}
                                            backgroundPalette={project["background_palette"]}
                                            backgroundRender={project["background_render"]}
                                            exclusive={project["challenge_cost"] === null ? false : true}
                                            hover={false}
                                            role={project["user_status"]}
                                            estimatedTime={project["estimated_tutorial_time_millis"]}
                                        />
                                    </LazyLoad>
                                </Grid>
                            )
                        })
                    }
                </Grid>
                {
                    isFetching ? (
                        <Grid container spacing={2} justifyContent="center" alignItems="center"
                            style={{marginTop: "10px"}}
                        >
                            <Grid item xs={12}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: "100%"
                                    }}
                                >
                                    <MoonLoader color={theme.palette.primary.main} loading={true} size={35}/>
                                </div>
                            </Grid>
                        </Grid>
                    ) : (<></>)
                }
            </div>
        )
    }

    const renderWelcomePopup = () => {
        let steps = [
            {
                title: "Welcome to GIGO!",
                content: "GIGO is a platform to help developers learn to code, practice their skills, and experiment quickly.",
            },
            {
                title: "How to use tutorials",
                content: "Tutorials will start on important pages to guide you through the platform. This is the only mandatory tutorial. If you skip a tutorial, you can always restart it using the help button at the bottom of the left-hand sidebar.",
            },
            {
                title: "Get Started!",
                content: "Pick a project from the recommendations or search for one in the search bar.",
            }
        ]

        return (
            <Dialog
                open={runTutorial}
                onClose={(event, reason) => {
                    if (reason === 'backdropClick') {
                        return;
                    }
                    setRunTutorial(false)
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: tutorialStepIndex === 0 ? "blur(3px)" : undefined,
                        backgroundColor: "transparent",
                    }
                }}
                PaperProps={{
                    sx: {
                        ...themeHelpers.frostedGlass,
                        backgroundColor: "rgba(206,206,206,0.31)",
                    }
                }}
                disableEscapeKeyDown={true}
            >
                <DialogTitle
                    sx={{
                        width: 450,
                        backgroundColor: "transparent",
                        fontSize: "1.2em",
                        // center the text
                        textAlign: "center",
                        paddingTop: "20px",
                        paddingBottom: "20px",
                    }}
                >
                    {steps[tutorialStepIndex]["title"]}
                </DialogTitle>
                <DialogContent
                    sx={{
                        width: 450,
                        backgroundColor: "transparent",
                    }}
                >
                    <Typography variant="body1" gutterBottom sx={{
                        fontSize: ".8em",
                        paddingTop: "10px",
                    }}>
                        {steps[tutorialStepIndex]["content"]}
                    </Typography>
                </DialogContent>
                <DialogActions
                    sx={{
                        backgroundColor: 'transparent',
                    }}
                >
                    {tutorialStepIndex !== 0 && (
                        <Button
                            onClick={() => setTutorialStepIndex(tutorialStepIndex - 1)}
                            variant="contained"
                            color="primary"
                            sx={{
                                fontSize: "0.8rem",
                            }}
                        >
                            Back
                        </Button>
                    )}
                    {tutorialStepIndex === steps.length - 1 ? (
                            <Button
                                onClick={async () => {
                                    setRunTutorial(false)
                                    let authState = Object.assign({}, initialAuthStateUpdate)
                                    // copy the existing state
                                    let state = Object.assign({}, tutorialState)
                                    // update the state
                                    state.home = true
                                    authState.tutorialState = state
                                    // @ts-ignore
                                    dispatch(updateAuthState(authState))

                                    // send api call to backend to mark the challenge tutorial as completed
                                    await call(
                                        "/api/user/markTutorial",
                                        "post",
                                        null,
                                        null,
                                        null,
                                        // @ts-ignore
                                        {
                                            tutorial_key: "home"
                                        }
                                    )
                                }}
                                variant="contained"
                                color="success"
                                sx={{
                                    fontSize: "0.8rem",
                                }}
                            >
                                Finish
                            </Button>
                        ): (
                            <Button
                                onClick={() => setTutorialStepIndex(tutorialStepIndex + 1)}
                                variant="contained"
                                color="primary"
                                sx={{
                                    fontSize: "0.8rem",
                                }}
                            >
                                Next
                            </Button>
                        )
                    }
                </DialogActions>
            </Dialog>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div>
                    {renderWelcomePopup()}
                    {loggedIn ? null : window.innerWidth > 1000 ? <GIGOLandingPage /> : <GIGOLandingPageMobile />}
                    <Typography component={"div"}>
                    </Typography>
                    {xpPopup ? (<XpPopup oldXP={
                        //@ts-ignore
                        (xpData["xp_update"]["old_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]} levelUp={
                        //@ts-ignore
                        xpData["level_up_reward"] === null ? false : true} maxXP={100}
                        //@ts-ignore
                                         newXP={(xpData["xp_update"]["new_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]}
                        //@ts-ignore
                                         nextLevel={xpData["xp_update"]["old_level"] !== undefined ? xpData["xp_update"]["new_level"] : xpData["xp_update"]["next_level"]}
                        //@ts-ignore
                                         gainedXP={xpData["xp_update"]["new_xp"] - xpData["xp_update"]["old_xp"]}
                        //@ts-ignore
                                         reward={xpData["level_up_reward"]}
                        //@ts-ignore
                                         renown={xpData["xp_update"]["current_renown"]} popupClose={PopupClose}
                                         homePage={true}/>) : null}
                    {loading ? <Grid container sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "1",
                        paddingLeft: "50px"
                    }}>
                        <Typography component={"div"} sx={{
                            display: "flex",
                            justifyContent: "center",
                            height: window.innerHeight,
                            alignItems: "center"
                        }}>
                            <ThreeDots/>
                        </Typography>
                    </Grid> : <Grid container sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "1",
                        // paddingLeft: "50px"
                    }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: "wrap",
                                width: "100%",
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                                color: 'text.primary',
                                borderRadius: 1,
                            }}
                        >
                            {isHoliday() === "Halloween" && window.innerWidth > 1000 && loggedIn ?
                                <>
                                    <div id="happy-halloween"
                                         style={
                                           chatOpen ?
                                                    {
                                                        width: "18%",
                                                        height: "20%",
                                                        left: "11%",
                                                        position: "absolute",
                                                    }
                                            :
                                                    {
                                                        width: "25%",
                                                        height: "25%",
                                                        left: "10%",
                                                        position: "absolute",
                                                    }
                                         }>
                                        <HappyHalloweenIcon/>
                                    </div>
                                    <div id="happy-halloween-pumpkin"
                                         style={chatOpen ?
                                                 {width: "15%", height: "15%", left: "67%", position: "absolute"}
                                                :
                                                 {width: "17%", height: "17%", left: "80%", position: "absolute"}
                                                }>
                                        <PumpkinIcon/>
                                    </div>
                                    <div id="happy-halloween-pumpkin2"
                                         style={
                                        chatOpen ?
                                            aspectRatio === "21:9" ?
                                                {width: "8%", height: "8%", left: "67%", top:"36%", position: "absolute"}
                                            :
                                                {width: "8%", height: "8%", left: "67%", top:"32%", position: "absolute"}
                                        :
                                            aspectRatio === "21:9" ?
                                                {width: "10%", height: "10%", left: "80%", top:"36%", position: "absolute"}
                                            :
                                                {width: "10%", height: "10%", left: "80%", top:"32%", position: "absolute"}
                                        }>
                                        <Pumpkin2Icon/>
                                    </div>
                                </>

                                :
                                    <></>
                            }



                            {TopRecommendations()}
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: "wrap",
                                width: "100%",
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                                color: 'text.primary',
                                borderRadius: 1,
                            }}
                        >
                            {ProjectsBox()}
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: "wrap",
                                width: "100%",
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                                color: 'text.primary',
                                borderRadius: 1,
                            }}
                        >
                            {ActiveProjects()}
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: "wrap",
                                width: "100%",
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                                color: 'text.primary',
                                borderRadius: 1,
                            }}
                        >
                            {Recommended()}
                        </Box>
                    </Grid>}
                </div>
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

export default Home;
