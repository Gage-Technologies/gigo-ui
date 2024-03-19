import * as React from "react";
import {useEffect, useState} from "react";
import {
    Box,
    Button,
    createTheme,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    PaletteMode,
    styled,
    ThemeProvider,
    Tooltip,
    Typography
} from "@mui/material";
import {getAllTokens, getDesignTokens, isHoliday, themeHelpers} from "../theme";
import ProjectCard from "../components/ProjectCard";
import {useNavigate} from "react-router-dom";
import config from "../config";
import call from "../services/api-call";
import swal from "sweetalert";
import * as animationData from '../img/85023-no-data.json'
import Carousel from "../components/Carousel2";
import {
    initialAuthStateUpdate,
    selectAuthState,
    selectAuthStateId,
    selectAuthStateTutorialState,
    updateAuthState,
} from "../reducers/auth/auth";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import XpPopup from "../components/XpPopup";
import MoonLoader from "react-spinners/MoonLoader";
import useInfiniteScroll from "../hooks/infiniteScroll";
import LazyLoad from 'react-lazyload';
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
//@ts-ignore
import ReactGA from "react-ga4";
import ProjectCardLongStyle from "../components/ProjectCardLongStyle";
import IconButton from '@mui/material/IconButton';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import ArrowBackIosNewSharpIcon from '@mui/icons-material/ArrowBackIosNewSharp';
import GIGOLandingPage from "../components/Landing/Landing";
import GIGOLandingPageMobile from "../components/Landing/LandingMobile";
import GIGOLandingPageChristmas from "../components/Landing/LandingChristmas";
import GIGOLandingPageChristmasMobile from "../components/Landing/LandingChristmasMobile";
import {keyframes} from '@mui/system';
import StarIcon from '@mui/icons-material/Star';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import {LoadingButton} from "@mui/lab";
import GIGOLandingPageNewYearsMobile from "../components/Landing/LandingNewYearsMobile";
import GIGOLandingPageNewYears from "../components/Landing/LandingNewYears";
import BytesCard from "../components/BytesCard";
import {programmingLanguages} from "../services/vars";
import AboutBytesIcon from "../components/Icons/bytes/AboutPage";
import GIGOLandingPageValentines from "../components/Landing/LandingValentines";
import GIGOLandingPageValentinesMobile from "../components/Landing/LandingValentinesMobile";
import {AwesomeButton} from "react-awesome-button";
import JourneyIcon from "../components/Icons/bytes/JourneyIcon";
import BytesCardMobile from "../components/BytesCardMobile";
import SheenPlaceholder from "../components/Loading/SheenPlaceholder";

const gradientAnimation = keyframes`
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
`;

const StartCodingButton = styled(LoadingButton)`
    animation: startCodingAuraEffect 5s infinite alternate;

    @keyframes startCodingAuraEffect {
        0% {
            background-color: #84E8A2;
            border: 1px solid #84E8A2;
        }
        20% {
            background-color: #29C18C;
            border: 1px solid #29C18C;
        }
        40% {
            background-color: #1C8762;
            border: 1px solid #1C8762;
        }
        60% {
            background-color: #2A63AC;
            border: 1px solid #2A63AC;
        }
        80% {
            background-color: #3D8EF7;
            border: 1px solid #3D8EF7;
        }
        100% {
            background-color: #63A4F8;
            border: 1px solid #63A4F8;
        }
    }
`;


function Home() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);


    const dispatch = useAppDispatch();
    const aspectRatio = useAspectRatio();
    const holiday = isHoliday()

    const authState = useAppSelector(selectAuthState);
    const [activeData, setActiveData] = React.useState<Array<never>>([])
    const [recData, setRecData] = React.useState<Array<never>>([])
    const [followData, setFollowData] = React.useState<Array<never>>([])
    const [topRec, setTopRec] = React.useState<Array<never>>([])
    const [loading, setLoading] = React.useState(true)

    const [tutorialStepIndex, setTutorialStepIndex] = React.useState(0)
    const userId = useAppSelector(selectAuthStateId) as string
    const [userProjects, setUserProjects] = React.useState<Array<never>>([])
    const [byteContent, setByteContent] = React.useState<Array<never>>([])
    const [xpPopup, setXpPopup] = React.useState(false)
    const [xpData, setXpData] = React.useState(null)
    const [recDataPage, setRecDataPage] = React.useState(0)
    const stopScroll = React.useRef(false)
    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);

    const [openTooltip, setOpenTooltip] = useState(false);

    const [proMonthlyLink, setProMonthlyLink] = useState("");
    const [proYearlyLink, setProYearlyLink] = useState("");
    const [loadingProLinks, setLoadingProLinks] = useState(false)

    const [startingByte, setStartingByte] = useState(false)

    const [completedJourneyTasks, setCompletedJourneyTasks] = useState(0)
    const [incompletedJourneyTasks, setIncompletedJourneyTasks] = useState(0)
    const [detourCount, setDetourCount] = useState(0)
    const [completedJourneyUnits, setCompletedJourneyUnits] = useState(0)
    const [startedJourney, setStartedJourney] = useState(false)

    /////// New Bytes
    const [newBytesPopoverOpen, setNewBytesPopoverOpen] = useState(false);

    const handleNewBytesPopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setNewBytesPopoverOpen(true);
    };

    const handleNewBytesPopoverClose = () => {
        setNewBytesPopoverOpen(false);
    };
    //////

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
        setRunTutorial(!tutorialState.home && loggedIn)
    }, [tutorialState])

    const retrieveProUrls = async (): Promise<{ monthly: string, yearly: string } | null> => {
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

        if (res !== undefined && res["return url"] !== undefined && res["return year"] !== undefined) {
            setProMonthlyLink(res["return url"])
            setProYearlyLink(res["return year"])
            return {
                "monthly": res["return url"],
                "yearly": res["return year"],
            }
        }

        return null
    }

    useEffect(() => {
        if (runTutorial)
            retrieveProUrls()
    }, [runTutorial])

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

    const loadByteData = async () => {
        let bytes = await call(
            "/api/bytes/getRecommendedBytes",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        if (bytes !== undefined && bytes["rec_bytes"] !== undefined) {
            setByteContent(bytes["rec_bytes"])
        }
    }

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

            const [res, res2, res4] = await Promise.all([
                active,
                follow,
                top
            ])

            if (
                (res === undefined || res["projects"] === undefined ||
                    res2 === undefined || res2["projects"] === undefined ||
                    res4 === undefined || res4["projects"] === undefined) && loggedIn
            ) {
                swal("There has been an issue loading data. Please try again later.")
            }

            setActiveData(res["projects"])
            setFollowData(res2["projects"])
            // setUserProjects(res3["projects"])
            setTopRec(res4["projects"])
        }
    }

    const dataLoad = async () => {
        let units = call(
            "/api/journey/completesUnitsStats",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        let tasks = call(
            "/api/journey/tasksStats",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        let detour = call(
            "/api/journey/detourStats",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        let startedJourney = call(
            "/api/journey/determineStart",
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
            units,
            tasks,
            detour,
            startedJourney
        ])

        console.log("res 4: ", res4)

        if (res4 !== undefined || res4["started_journey"] !== undefined) {
            setStartedJourney(res4["started_journey"])
        }

        if (
            (res === undefined || res["finished_journey_count"] === undefined ||
                res2 === undefined || res2["completed_tasks"] === undefined || res2["incompleted_tasks"] === undefined ||
                res3 === undefined || res3["detour_count"] === undefined) && loggedIn
        ) {
            swal("There has been an issue loading data. Please try again later.")
        }

        setCompletedJourneyTasks(res2["completed_tasks"])
        setIncompletedJourneyTasks(res2["incompleted_tasks"])
        setDetourCount(res3["detour_count"])
        setCompletedJourneyUnits(res["finished_journey_count"])

    }

    useEffect(() => {
        dataLoad().then(r => console.log("here: ", r))
    }, []);
    


    useEffect(() => {
        let xpLogin = window.sessionStorage.getItem('loginXP')
        setLoading(true)

        loadByteData()
        if (authState.authenticated !== false) {
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

    // const ProjectsBox = () => {
    //     if (userProjects === null || userProjects === undefined || userProjects.length === 0) {
    //         return (<div />)
    //     }
    //
    //     return (
    //         <div style={{
    //             display: "flex",
    //             flexDirection: "column",
    //             paddingLeft: "auto",
    //             paddingRight: "auto",
    //             justifyContent: "center",
    //             width: "100%",
    //             paddingBottom: "10px"
    //         }}>
    //             <div style={{ display: "inline-flex", marginTop: "25px" }}>
    //                 <Typography variant="h6" gutterBottom sx={{
    //                     paddingLeft: "10px",
    //                     paddingTop: "6px",
    //                     fontSize: "1.2em"
    //                 }}>
    //                     My Projects
    //                 </Typography>
    //                 <Button variant="text"
    //                     onClick={async () => {
    //                         navigate("/profile")
    //                     }}
    //                     className={"show-all"}
    //                 >
    //                     (show all)
    //                 </Button>
    //             </div>
    //             <div style={{
    //                 display: "flex",
    //                 justifyContent: "start",
    //                 flexDirection: `row`,
    //                 alignContent: `center`,
    //                 overflowX: "auto",
    //                 marginLeft: "1%",
    //             }}>
    //                 <Carousel show={(document.documentElement.clientWidth < 1000 ? 1 : 4)}>
    //                     {
    //                         //@ts-ignore
    //                         userProjects.map((project, index) => {
    //                             return (
    //                                 <div className={'attempt'} style={{ paddingBottom: "10px" }}>
    //                                     <LazyLoad once scroll unmountIfInvisible>
    //                                         <ProjectCard
    //                                             height={"23vh"}
    //                                             imageHeight={"23vh"}
    //                                             width={(chatOpen || sidebarOpen) ? "16vw" : (document.documentElement.clientWidth < 1000 ? 'fit-content' : '20vw')}
    //                                             imageWidth={(chatOpen || sidebarOpen) ? "16vw" : "23vw"}
    //                                             projectId={project["_id"]}
    //                                             projectTitle={project["title"]}
    //                                             projectDesc={project["description"]}
    //                                             projectThumb={config.rootPath + project["thumbnail"]}
    //                                             projectDate={project["updated_at"]}
    //                                             projectType={project["post_type_string"]}
    //                                             renown={project["tier"]}
    //                                             onClick={() => navigate("/challenge/" + project["_id"])}
    //                                             userTier={authState.tier}
    //                                             userThumb={config.rootPath + "/static/user/pfp/" + authState.id}
    //                                             userId={authState.id}
    //                                             username={authState.userName}
    //                                             backgroundName={authState.backgroundName}
    //                                             backgroundPalette={authState.backgroundColor}
    //                                             backgroundRender={authState.backgroundRenderInFront}
    //                                             exclusive={project["challenge_cost"] === null ? false : true}
    //                                             hover={false}
    //                                             role={authState.role}
    //                                             estimatedTime={project["estimated_tutorial_time_millis"]}
    //                                         />
    //                                     </LazyLoad>
    //                                 </div>
    //                             )
    //                         })}
    //                 </Carousel>
    //             </div>
    //         </div>
    //     )
    // }

    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
    const [currentProjectTimeout, setCurrentProjectTimeout] = useState<NodeJS.Timer | null>(null)

    const nextProject = () => {
        // disable auto scroll if the user click
        if (currentProjectTimeout) {
            clearInterval(currentProjectTimeout)
            setCurrentProjectTimeout(null)
        }
        setCurrentProjectIndex((prevIndex) => (prevIndex + 1) % topRec.length);
    };

    const prevProject = () => {
        // disable auto scroll if the user click
        if (currentProjectTimeout) {
            clearInterval(currentProjectTimeout)
            setCurrentProjectTimeout(null)
        }
        setCurrentProjectIndex((prevIndex) => (prevIndex - 1 + topRec.length) % topRec.length);
    };

    const cycleProjects = React.useCallback(() => {
        let index = currentProjectIndex + 1;
        if (index > topRec.length - 1) {
            index = 0;
        }
        setCurrentProjectIndex(index)
    }, [currentProjectIndex, topRec])

    useEffect(() => {
        // Set up an interval to cycle through projects every 10 seconds
        const intervalId = setInterval(cycleProjects, 10000);
        setCurrentProjectTimeout(intervalId);

        // Clear the interval when the component is unmounted
        return () => clearInterval(intervalId);
    }, [cycleProjects]);

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
                            <IconButton onClick={() => prevProject()}>
                                <ArrowBackIosNewSharpIcon/>
                            </IconButton>
                        ) : null}
                        {
                            (topRec.length > 0 && currentProjectIndex < topRec.length) ? (
                                <div className={'attempt'} style={{paddingBottom: "10px"}}>
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
                            <IconButton onClick={() => nextProject()}>
                                <ArrowForwardIosSharpIcon/>
                            </IconButton>
                        ) : null}
                    </div>
                </div>
            </>
        );
    }

    const JourneyHeader = () => {

        if (startedJourney) {
            return (
                // TODO journey - change the color to the primary color in the theme provider
                <Grid container spacing={2} sx={{ width: "100%", height: "500px", backgroundColor: "#ffef62", zIndex: 3, m: 2, borderRadius: "12px" }}>
                    <Grid item xs={8} sx={{ height: "100%", overflow: 'auto' }}>
                        <Grid container sx={{ height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                            <Grid item xs={5} sx={{
                                height: '25%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: "30px",
                                border: "solid #dfce53 3px",
                                m: 1,
                                backgroundColor: "#dfce53"
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexGrow: 1,
                                }}>
                                    <Typography variant="h2" sx={{
                                        color: theme.palette.background.default,
                                        textTransform: 'none',
                                    }}>
                                        {completedJourneyTasks}
                                    </Typography>
                                </Box>
                                <Typography variant="h5" sx={{
                                    color: theme.palette.background.default,
                                    textTransform: 'none',
                                    width: '100%',
                                    textAlign: 'center',

                                }}>
                                    Completed Stops
                                </Typography>
                            </Grid>
                            <Grid item xs={1}/>
                            <Grid item xs={5} sx={{
                                height: '25%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: "30px",
                                border: "solid #dfce53 3px",
                                m: 1,
                                backgroundColor: "#dfce53"
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexGrow: 1,
                                }}>
                                    <Typography variant="h2" sx={{
                                        color: theme.palette.background.default,
                                        textTransform: 'none',
                                    }}>
                                        {completedJourneyUnits}
                                    </Typography>
                                </Box>
                                <Typography variant="h5" sx={{
                                    color: theme.palette.background.default,
                                    textTransform: 'none',
                                    width: '100%',
                                    textAlign: 'center',

                                }}>
                                    Units Completed
                                </Typography>
                            </Grid>
                            <Grid item xs={5} sx={{
                                height: '25%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: "30px",
                                border: "solid #dfce53 3px",
                                m: 1,
                                backgroundColor: "#dfce53"
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexGrow: 1,
                                }}>
                                    <Typography variant="h2" sx={{
                                        color: theme.palette.background.default,
                                        textTransform: 'none',
                                    }}>
                                        {detourCount}
                                    </Typography>
                                </Box>
                                <Typography variant="h5" sx={{
                                    color: theme.palette.background.default,
                                    textTransform: 'none',
                                    width: '100%',
                                    textAlign: 'center',

                                }}>
                                    Detours Taken
                                </Typography>
                            </Grid>
                            <Grid item xs={1}/>
                            <Grid item xs={5} sx={{
                                height: '25%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: "30px",
                                border: "solid #dfce53 3px",
                                m: 1,
                                backgroundColor: "#dfce53"
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexGrow: 1,
                                }}>
                                    <Typography variant="h2" sx={{
                                        color: theme.palette.background.default,
                                        textTransform: 'none',
                                    }}>
                                        {incompletedJourneyTasks}
                                    </Typography>
                                </Box>
                                <Typography variant="h5" sx={{
                                    color: theme.palette.background.default,
                                    textTransform: 'none',
                                    width: '100%',
                                    textAlign: 'center',
                                }}>
                                    Stops Remaining
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={4} sx={{ height: "100%", overflow: 'auto' }}>
                        <JourneyIcon style={{height: "375px", width: "375px"}}/>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <AwesomeButton style={{
                                width: "auto",
                                height: "50px",
                                '--button-primary-color': theme.palette.secondary.main,
                                '--button-primary-color-dark': theme.palette.secondary.dark,
                                '--button-primary-color-light': "white",
                                '--button-primary-color-hover': theme.palette.secondary.main,
                                '--button-default-border-radius': "12px",
                                fontSize: "28px",
                            }} type="primary" href={"/journey/main"} >
                                <span>Continue Your Journey</span>
                            </AwesomeButton>
                        </Box>
                    </Grid>
                </Grid>
            )
        } else {
            return (
                // TODO check if user has an active journey -- change for mobile --
                <Box sx={{width: "100%", height: "500px", backgroundColor: "#ffef62", zIndex: 3, m: 2, borderRadius: "12px"}}>
                    <div style={{width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-evenly"}}>
                        <div style={{position: "relative", top: "100px", width: '50%'}}>
                            <Typography variant={"h1"} sx={{color: theme.palette.background.default, textTransform: 'none'}}>
                                Embark on your Coding Journey
                            </Typography>
                        </div>
                        <div>
                            <JourneyIcon style={{height: "400px", width: "400px", paddingTop: "40px"}}/>
                        </div>
                    </div>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <AwesomeButton style={{
                            width: "auto",
                            height: "50px",
                            '--button-primary-color': theme.palette.primary.main,
                            '--button-primary-color-dark': theme.palette.primary.dark,
                            '--button-primary-color-light': "white",
                            '--button-primary-color-hover': theme.palette.primary.main,
                            fontSize: "28px"
                        }} type="primary" href={"/journey/main"} >
                            <span>Start Your Journey</span>
                        </AwesomeButton>
                    </Box>
                </Box>
            )
        }
    }


    const ActiveProjects = () => {
        if (!authState.authenticated) {
            return null
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
                    <Carousel itemsShown={(document.documentElement.clientWidth < 1000 ? 1 : 4)} infiniteLoop={true}
                              itemsToSlide={(window.innerWidth < 1000 ? 1 : 4)}>
                        {
                            activeData && activeData.length > 0 ?
                                activeData.map((project, index) => {
                                    return (
                                        <div style={{paddingBottom: "10px"}}>
                                            <LazyLoad once scroll unmountIfInvisible>
                                                <ProjectCard
                                                    height={"23vh"}
                                                    imageHeight={"23vh"}
                                                    // TODO mobile => make width 'fit-content'
                                                    width={(chatOpen || sidebarOpen) ? "16vw" : (document.documentElement.clientWidth < 1000 ? 'fit-content' : '20vw')}
                                                    imageWidth={(chatOpen || sidebarOpen) ? "16vw" : "23vw"}
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
                                }) :
                                Array.from({length: 4}, (_, index) => (
                                    <SheenPlaceholder height={"23vh"} width={(chatOpen || sidebarOpen) ? "16vw" : "23vw"}/>
                                ))
                        }
                    </Carousel>
                </div>
            </div>
        )
    }

    const BytesMobile = () => {

        // @ts-ignore
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                width: "100%",
                paddingBottom: "10px",
            }}>
                <div style={{display: "inline-flex", alignItems: 'center', padding: "10px 0"}}>
                    <Typography variant="h6" gutterBottom
                                sx={{display: 'flex', alignItems: 'center', flexGrow: 1, marginLeft: "10%"}}>
                        <AboutBytesIcon style={{height: "20px", width: "20px", marginRight: "5px"}}
                                        miniIcon={userPref === 'light'}/>
                        Bytes Swipe
                    </Typography>
                    <Button variant="text" href="/bytesMobile" sx={{
                        fontSize: "0.8em",
                        fontWeight: "light",
                        textTransform: "lowercase",
                        marginRight: "5%"
                    }}>
                        (show all)
                    </Button>
                </div>
                <div style={{
                    display: "flex",
                    justifyContent: "start",
                    overflowX: "auto",
                    paddingLeft: "5%"
                }}>
                    <Carousel itemsShown={1} infiniteLoop={true} itemsToSlide={1}>
                        {
                            byteContent && byteContent.length > 0 ?
                                byteContent.map((project, index) => (
                                    <div key={index} style={{width: "100%", padding: "0 5%"}}>
                                        <LazyLoad once scroll unmountIfInvisible>
                                            <BytesCardMobile
                                                height="auto"
                                                imageHeight="40vh"
                                                width="100%"
                                                imageWidth="100%"
                                                bytesId={project["_id"]}
                                                bytesTitle={project["name"]}
                                                bytesDesc={project["description_medium"]}
                                                bytesThumb={config.rootPath + "/static/bytes/t/" + project["_id"]}
                                                onClick={() => navigate("/byte/" + project["_id"])}
                                                role={authState.role}
                                                completedEasy={project["completed_easy"]}
                                                completedMedium={project["completed_medium"]}
                                                completedHard={project["completed_hard"]}
                                                language={programmingLanguages[project["lang"]]}
                                                isHome={false}
                                            />
                                        </LazyLoad>
                                    </div>
                                )) : (
                                    <SheenPlaceholder height={"40vh"} width={"100%"}/>
                                )
                        }
                    </Carousel>
                </div>
            </div>
        )
    }

    const Bytes = () => {
        if (window.innerWidth < 1000) {
            return BytesMobile()
        }

        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "auto",
                paddingRight: "auto",
                justifyContent: "center",
                width: "100%",
                paddingBottom: "10px",
                height: "100%"
            }}>
                <div style={{display: "inline-flex"}}>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            paddingLeft: "10px",
                            paddingTop: "6px",
                            fontSize: "1.2em",
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <AboutBytesIcon
                            style={{
                                height: "20px",
                                width: "20px",
                                marginRight: "5px"
                            }}
                            miniIcon={userPref === 'light'}
                        />
                        Bytes
                    </Typography>
                    <Button variant="text"
                            href={"/bytes"}
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
                    <Carousel itemsShown={(document.documentElement.clientWidth < 1000 ? 1 : 5)} infiniteLoop={true}
                              itemsToSlide={document.documentElement.clientWidth < 1000 ? 1 : 5}>
                        {
                            byteContent && byteContent.length > 0 ?
                                byteContent.map((project, index) => {
                                    return (
                                        <div style={{paddingBottom: "10px", width: "16vw"}}>
                                            <LazyLoad once scroll unmountIfInvisible>
                                                <BytesCard
                                                    height={"52vh"}
                                                    imageHeight={"43vh"}
                                                    // TODO mobile => make width 'fit-content'
                                                    width={'auto'}
                                                    imageWidth={"auto"}
                                                    bytesId={project["_id"]}
                                                    bytesTitle={project["name"]}
                                                    bytesDesc={project["description_medium"]}
                                                    bytesThumb={config.rootPath + "/static/bytes/t/" + project["_id"]}
                                                    onClick={() => navigate("/byte/" + project["_id"])}
                                                    role={authState.role}
                                                    completedEasy={project["completed_easy"]}
                                                    completedMedium={project["completed_medium"]}
                                                    completedHard={project["completed_hard"]}
                                                    language={programmingLanguages[project["lang"]]}
                                                />
                                            </LazyLoad>
                                        </div>
                                    )
                                }) :
                                Array.from({length: 15}, (_, index) => (
                                    <SheenPlaceholder height={"43vh"} width={"calc(43vh * 0.5625)"}/>
                                ))
                        }
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
                                <Grid item xs={12} sm={6} md={4} lg={3} key={"rec-" + project["_id"]}>
                                    <LazyLoad once scroll unmountIfInvisible>
                                        <ProjectCard
                                            height={"20vh"}
                                            imageHeight={"20vh"}
                                            // TODO mobile => make width 'fit-content'
                                            width={(chatOpen || sidebarOpen) ? "16vw" : (document.documentElement.clientWidth < 1000 ? 'fit-content' : '20vw')}
                                            imageWidth={(chatOpen || sidebarOpen) ? "16vw" : "23vw"}
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

    const handleReferralButtonClick = async () => {
        try {
            await navigator.clipboard.writeText(`https://gigo.dev/referral/${encodeURIComponent(authState.userName)}`);
            setOpenTooltip(true);
            setTimeout(() => {
                setOpenTooltip(false);
            }, 2000); // Tooltip will hide after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleClaimButtonClick = async () => {
        setLoadingProLinks(true)

        // first let's check if we have a cached session - we hope so cause it'll be way faster
        let mlink = proMonthlyLink
        let ylink = proYearlyLink
        if (mlink == "" || ylink != "") {
            // retrieve the urls if they aren't cached
            let links = await retrieveProUrls()
            if (links === null) {
                swal("Server Error", "This is awkward... The server is having a fit. We hope you claim your trial another time!", "error")
                return
            }
            mlink = links.monthly
            ylink = links.yearly
        }

        // open the monthly link in a new tab
        window.open(mlink, "_blank");

        setLoadingProLinks(false)
    }

    const renderWelcomePopup = () => {
        let steps: {
            "title": string | React.ReactElement,
            "content": string | React.ReactElement
        }[] = [
            {
                title: "Welcome to GIGO!",
                content: "GIGO is a platform to help developers learn to code, practice their skills, and experiment quickly.",
            },
            {
                title: (
                    <DialogTitle
                        sx={{
                            width: window.innerWidth > 1000 ? 450 : undefined,
                            maxWidth: window.innerWidth > 1000 ? undefined : "90vw",
                            background: "linear-gradient(90deg, #84E8A2, #63a4f8, #84E8A2)",
                            backgroundSize: "200% 200%",
                            animation: `${gradientAnimation} 3s ease infinite`,
                            fontSize: "1.6em",
                            textAlign: "center",
                            paddingTop: "20px",
                            paddingBottom: "20px",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            MozBackgroundClip: "text",
                            MozTextFillColor: "transparent",
                        }}
                    >
                        GIGO Pro
                    </DialogTitle>
                ),
                content: (
                    <>
                        {authState.role != 1 && (
                            <>
                                <Typography variant="body2" sx={{fontSize: ".8em", mb: 2, textAlign: 'center'}}>
                                    You've received a free month of GIGO Pro!
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    mb: 2
                                }}>
                                    <LoadingButton loading={loadingProLinks} variant="contained"
                                                   onClick={handleClaimButtonClick}>
                                        Claim Free Month
                                    </LoadingButton>
                                </Box>
                            </>
                        )}
                        <Typography variant="body2" sx={{fontSize: ".8em", mb: 2, textAlign: 'center'}}>
                            Give a month, Get a month! For every friend you refer, both of you get a free month of GIGO
                            Pro!
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column'
                        }}>
                            <Tooltip
                                open={openTooltip}
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener
                                title={
                                    <React.Fragment>
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            Referral Link Copied
                                            <CheckIcon sx={{color: theme.palette.success.main, ml: 1}}/>
                                        </div>
                                    </React.Fragment>
                                }
                                placement="top"
                                arrow
                            >
                                <Button variant="contained" onClick={handleReferralButtonClick}>
                                    Referral Link
                                </Button>
                            </Tooltip>
                        </Box>
                        <Box sx={{my: 2}}>
                            <Typography variant="body1" component="div" sx={{display: 'flex', alignItems: 'center'}}>
                                <StarIcon sx={{fontSize: ".8em", mr: 1}}/>
                                <span style={{}}>Smarter Code Teacher</span>
                            </Typography>
                            <Typography variant="body1" component="div" sx={{fontSize: ".7em", ml: 3}}>
                                Get better help and guidance on your coding journey.
                            </Typography>
                            <Typography variant="body1" component="div" sx={{display: 'flex', alignItems: 'center'}}>
                                <StarIcon sx={{fontSize: ".8em", mr: 1}}/>
                                <span style={{}}>Private Projects</span>
                            </Typography>
                            <Typography variant="body1" component="div" sx={{fontSize: ".7em", ml: 3}}>
                                Learn in stealth mode.
                            </Typography>
                            <Typography variant="body1" component="div" sx={{display: 'flex', alignItems: 'center'}}>
                                <StarIcon sx={{fontSize: ".8em", mr: 1}}/>
                                <span style={{}}>More DevSpace Resources</span>
                            </Typography>
                            <Typography variant="body1" component="div" sx={{fontSize: ".7em", ml: 3}}>
                                8 CPU cores, 8GB RAM, 50GB disk space.
                            </Typography>
                            <Typography variant="body1" component="div" sx={{display: 'flex', alignItems: 'center'}}>
                                <StarIcon sx={{fontSize: ".8em", mr: 1}}/>
                                <span style={{}}>Three Concurrent DevSpaces</span>
                            </Typography>
                            <Typography variant="body1" component="div" sx={{fontSize: ".7em", ml: 3}}>
                                Run multiple projects.
                            </Typography>
                            <Typography variant="body1" component="div" sx={{display: 'flex', alignItems: 'center'}}>
                                <StarIcon sx={{fontSize: ".8em", mr: 1}}/>
                                <span style={{}}>Two Streak Freezes a Week</span>
                            </Typography>
                            <Typography variant="body1" component="div" sx={{fontSize: ".7em", ml: 3}}>
                                Preserve your streak.
                            </Typography>
                            <Typography variant="body1" component="div" sx={{display: 'flex', alignItems: 'center'}}>
                                <StarIcon sx={{fontSize: ".8em", mr: 1}}/>
                                <span style={{}}>Premium VsCode Theme</span>
                            </Typography>
                            <Typography variant="body1" component="div" sx={{fontSize: ".7em", ml: 3}}>
                                Enhance your coding experience.
                            </Typography>
                        </Box>
                    </>
                ),
            },
            {
                title: "How to use tutorials",
                content: "Tutorials will start on important pages to guide you through the platform. This is the only mandatory tutorial. If you skip a tutorial, you can always restart it using the help button at the bottom of the left-hand sidebar (desktop) or the user icon drop down (mobile).",
            },
            {
                title: "Let's Get Started!",
                content: "Start coding now, or select either a Byte or a Challenge to initiate your journey!"
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
                        backdropFilter: tutorialStepIndex <= 1 ? "blur(5px)" : undefined,
                        backgroundColor: "transparent",
                    }
                }}
                PaperProps={{
                    sx: {
                        ...themeHelpers.frostedGlass,
                    }
                }}
                disableEscapeKeyDown={true}
            >
                {typeof steps[tutorialStepIndex]["title"] === "string" ? (
                    <DialogTitle
                        sx={window.innerWidth < 1000 ? {
                            maxWidth: "90vw",
                            backgroundColor: "transparent",
                            fontSize: "1.2em",
                            // center the text
                            textAlign: "center",
                            paddingTop: "20px",
                            paddingBottom: "20px",
                        } : {
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
                ) : (
                    steps[tutorialStepIndex]["title"]
                )}
                <DialogContent
                    sx={window.innerWidth < 1000 ? {
                        maxWidth: "90vw",
                        backgroundColor: "transparent",
                    } : {
                        width: 450,
                        backgroundColor: "transparent",
                    }}
                >
                    {typeof steps[tutorialStepIndex]["content"] === "string" ? (
                        <Typography variant="body1" gutterBottom sx={{
                            fontSize: ".8em",
                            paddingTop: "10px",
                        }}>
                            {steps[tutorialStepIndex]["content"]}
                        </Typography>
                    ) : (
                        steps[tutorialStepIndex]["content"]
                    )}
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
                        <>
                            {window.innerWidth > 1000 && (
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
                                    color={"primary"}
                                    sx={{
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    Browse
                                </Button>
                            )}
                            <StartCodingButton
                                loading={startingByte}
                                onClick={async () => {
                                    setStartingByte(true)

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

                                    setStartingByte(false)
                                    setRunTutorial(false)

                                    window.location.assign("/byte/1750943457427324928")
                                }}
                                variant="contained"
                                color="success"
                                sx={{
                                    // fontSize: "0.8rem",
                                }}
                            >
                                Start Coding!
                            </StartCodingButton>
                        </>
                    ) : (
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

    const headerMobile = React.useMemo(() => {
        let project: any = undefined;
        if (byteContent.length > 0) {
            const randomIndex = Math.floor(Math.random() * byteContent.length);
            project = byteContent[randomIndex];
        }

        return (
            <Box sx={{
                width: "100%",
                height: "auto",
                backgroundColor: theme.palette.primary.light,
                zIndex: 3,
                m: 1,
                borderRadius: "12px",
                position: "relative",
                padding: "20px",
                marginTop: "2%"
            }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                }}>
                    <Typography variant="h4"
                                sx={{color: theme.palette.background.default, textTransform: 'none'}}>
                        Take a Byte Today
                    </Typography>
                    <Typography variant="subtitle2"
                                sx={{color: theme.palette.text.primary, textTransform: "none", mt: 2}}>
                        Bite-sized coding challenges deeply integrated with Code Teacher for personalized learning.
                    </Typography>
                    <Box sx={{width: "100%", mt: 3, display: 'flex', justifyContent: 'center'}}>
                        {project ? (
                            <LazyLoad once scroll unmountIfInvisible>
                                <BytesCardMobile
                                    height="300px"
                                    imageHeight="200px"
                                    width="100%"
                                    imageWidth="100%"
                                    bytesId={project["_id"]}
                                    bytesTitle={project["name"]}
                                    bytesDesc={project["description_medium"]}
                                    bytesThumb={config.rootPath + "/static/bytes/t/" + project["_id"]}
                                    onClick={() => navigate("/byte/" + project["_id"])}
                                    role={authState.role}
                                    completedEasy={project["completed_easy"]}
                                    completedMedium={project["completed_medium"]}
                                    completedHard={project["completed_hard"]}
                                    language={programmingLanguages[project["lang"]]}
                                    isHome={true}
                                />
                            </LazyLoad>
                        ) : (
                            <Box sx={{mb: 8}}>
                                <SheenPlaceholder width="80vw" height={"200px"}/>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{mt: -2}}>
                        {project ? (
                            <AwesomeButton style={{
                                '--button-primary-color': theme.palette.primary.main,
                                '--button-primary-color-dark': theme.palette.primary.dark,
                                '--button-primary-color-light': "white",
                                '--button-primary-color-hover': theme.palette.primary.main,
                                fontSize: "18px",
                            }} type="primary" href={`/byte/${project["_id"]}`}>
                                Take a Byte
                            </AwesomeButton>
                        ) : (
                            <SheenPlaceholder width="137px" height={"40px"}/>
                        )}
                    </Box>
                </Box>
            </Box>
        );

    }, [byteContent]);

    const renderLanding = () => {
        if (loggedIn) {
            return null
        }

        if (window.innerWidth < 1000) {
            if (holiday === "Christmas") {
                return (<GIGOLandingPageChristmasMobile/>)
            }
            if (holiday === "New Years") {
                return (<GIGOLandingPageNewYearsMobile/>)
            }
            if (holiday === "Valentines") {
                return (<GIGOLandingPageValentinesMobile/>)
            }
            return (<GIGOLandingPageMobile/>)
        }

        if (holiday === "Christmas") {
            return (<GIGOLandingPageChristmas/>)
        }

        if (holiday === "New Years") {
            return (<GIGOLandingPageNewYears/>)
        }

        if (holiday === "Valentines") {
            return (<GIGOLandingPageValentines/>)
        }

        return (<GIGOLandingPage/>)
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div>
                    {renderWelcomePopup()}
                    {renderLanding()}
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
                                         nextLevel={xpData["xp_update"]["old_level"] !== null ? xpData["xp_update"]["new_level"] : xpData["xp_update"]["next_level"]}
                        //@ts-ignore
                                         gainedXP={xpData["xp_update"]["new_xp"] - xpData["xp_update"]["old_xp"]}
                        //@ts-ignore
                                         reward={xpData["level_up_reward"]}
                        //@ts-ignore
                                         renown={xpData["xp_update"]["current_renown"]} popupClose={PopupClose}
                                         homePage={true}/>) : null}
                    {/*<XpPopup oldXP={*/}
                    {/*    //@ts-ignore*/}
                    {/*    8} levelUp={*/}
                    {/*    //@ts-ignore*/}
                    {/*    true} maxXP={100}*/}
                    {/*    //@ts-ignore*/}
                    {/*                     newXP={9}*/}
                    {/*    //@ts-ignore*/}
                    {/*                     nextLevel={9}*/}
                    {/*    //@ts-ignore*/}
                    {/*                     gainedXP={7}*/}
                    {/*    //@ts-ignore*/}
                    {/*                     reward={{"reward_type": "xp_boost"}}*/}
                    {/*    //@ts-ignore*/}
                    {/*                     renown={9} popupClose={null}*/}
                    {/*                     homePage={true}/>*/}
                    <Grid container sx={{
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
                            {JourneyHeader()}
                            {(window.innerWidth < 1000) && headerMobile}
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
                            {Bytes()}
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
                            {(window.innerWidth > 1000) ? ActiveProjects() : null}
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
                    </Grid>
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
