

import * as React from "react";
import {
    Box,
    Button,
    ButtonBase,
    Card,
    createTheme,
    CssBaseline, Dialog,
    Grid,
    PaletteMode,
    styled,
    Tab,
    Tabs,
    ThemeProvider,
    Tooltip,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useEffect, useState} from "react";


import Lottie, { Options } from "react-lottie";

import * as blue from "../img/Nemesis/blue.json"
import * as red from "../img/Nemesis/red.json"
import * as redfort from "../img/Nemesis/redFort.json"
import * as bluefort from "../img/Nemesis/blueFort.json"
import * as neutralfort from "../img/Nemesis/neutralFort.json"
import * as bluebroken from "../img/Nemesis/blueBroken.json"
import * as bluedefeatfort from "../img/Nemesis/blueDefeatFort.json"
import * as redbroken from "../img/Nemesis/redBroken.json"
import * as reddefeatfort from "../img/Nemesis/redDefeatFort.json"
import * as clash from "../img/Nemesis/clashing.json"
import * as redarrow from "../img/Nemesis/redArrow.json"
import * as bluearrow from "../img/Nemesis/blueArrow.json"
import * as bluedefeat from "../img/Nemesis/blueDefeat.json"
//@ts-ignore
import * as reddefeat from "../img/Nemesis/redDefeat.json"
import * as animationData from '../img/loadingIcon.json'

import {useAppSelector, useAppDispatch} from "../app/hooks";
import {
    selectAuthStateId,
    selectAuthStateThumbnail,
    selectAuthStateUserName,
} from "../reducers/auth/auth";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import config from "../config";
import {isChrome} from "react-device-detect";
import {AwesomeButton} from "react-awesome-button";
import 'react-awesome-button/dist/styles.css';
import '../img/Nemesis/button.css'
import call from "../services/api-call";
import UserIcon from "../components/UserIcon";
import {AppBar, IconButton, List, ListItem, makeStyles} from "@material-ui/core";
import NemesisPageIcon from "../components/Icons/NemesisPageIcon";
import CloseIcon from "@material-ui/icons/Close";
import {GroupAdd, People} from "@material-ui/icons";

function Nemesis() {
    let userPref = localStorage.getItem('theme')
    const [color, setColor] = React.useState("white")
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    let designTokensNemesis = getAllTokens(mode);
    designTokensNemesis.palette.background.default = '#d2ccc8';
    const nemesisTheme = React.useMemo(() => createTheme(designTokensNemesis), [mode]);

    const dispatch = useAppDispatch();

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth)
    const [windowHeight, setWindowHeight] = React.useState(window.innerHeight)
    const setWindowDimensions = () => {
        setWindowWidth(window.innerWidth)
        setWindowHeight(window.innerHeight)
    }
    useEffect(() => {
        window.addEventListener('resize', setWindowDimensions);
        return () => {
            window.removeEventListener('resize', setWindowDimensions)
        }
    }, [])

    // xp-gained
    const [antagonist, setAntagonist] = React.useState(0);
    const [protagonist, setProtagonist] = React.useState(0);

    const [hasNemesis, setHasNemesis] = React.useState(false);

    const [victor, setVictor] = React.useState("")

    const [loading, setLoading] = React.useState(true);

    const [fortACondition, setFortACondition] = React.useState("blueFort");
    const [fortBCondition, setFortBCondition] = React.useState("neutralFort");
    const [fortCCondition, setFortCCondition] = React.useState("redFort");
    const thumbnail = useAppSelector(selectAuthStateThumbnail);
    const username = useAppSelector(selectAuthStateUserName);
    const id = useAppSelector(selectAuthStateId);

    let diagonal = Math.sqrt(Math.pow(windowHeight, 2) + Math.pow(windowWidth, 2));

    const callingId = useAppSelector(selectAuthStateId)

    const [friendsList, setFriendsList] = React.useState([]);
    const [declareId, setDeclareId] = React.useState("");

    const [protagName, setProtagName] = React.useState("");
    const [antagName, setAntagName] = React.useState("");

    const [endTime, setEndTime] = React.useState("");
    const [startTime, setStartTime] = React.useState("");

    const [dailyProtagXp, setDailyProtagXp] = React.useState([]);
    const [dailyAntagXp, setDailyAntagXp] = React.useState([]);

    const [antagonistId, setAntagonistId] = React.useState("");
    const [protagonistId, setProtagonistId] = React.useState("");

    const [proTowersTaken, setProTowersTaken] = React.useState(0);
    const [antTowersTaken, setAntTowersTaken] = React.useState(0);

    const [pending, setPending] = React.useState([]);

    const [matchHistory, setMatchHistory] = React.useState([]);

    const [friendValue, setFriendValue] = useState(null);
    const [allUserValue, setAllUserValue] = useState(null);
    const [allUsersList, setAllUsersList] = useState([]);

    const [steps, setSteps] = React.useState([{
        content: <h2>You can challenge someone, and if they accept, you can battle your nemesis to find the best
            developer. You win by gaining more XP than your nemesis.</h2>,
        target: '.start',
        disableBeacon: true
    }, {
        content: <h2>Review current requests sent and received for starting a nemesis challenge. Click a tab over to
            review past battles and their outcomes</h2>, target: '.check'
    }])

    const tutorial = false

    const [run, setRun] = React.useState(false)
    const [stepIndex, setStepIndex] = React.useState(0)

    const getActive = async () => {
        let active = call(
            "/api/nemesis/active",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {}
        )

        let friends = await call(
            "/api/friends/list",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
            }
        )

        let allUsers = await call(
            "/api/nemesis/allUsers",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
            }
        )

        let pending = await call(
            "/api/nemesis/pending",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
            }
        )

        let history = await call(
            "/api/nemesis/history",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
            }
        )

        const [res, res2, res3, res4, res5] = await Promise.all([
            active, friends, allUsers, pending, history
        ])

        setMatchHistory(res5['history'])

        if (res['nemesis'].length > 0) {
            setHasNemesis(true)
            getBattle(res['nemesis'][0]['id'], res['nemesis'][0]['protagonist_id'], res['nemesis'][0]['antagonist_id'])

            let xp = await call(
                "/api/nemesis/dailyXP",
                "post",
                null,
                null,
                null,
                // @ts-ignore
                {
                    match_id: res['nemesis'][0]['id']
                }
            )

            setDailyProtagXp(xp['daily_protagonist'])
            setDailyAntagXp(xp['daily_antagonist'])
        } else if (res['nemesis'].length === 0) {
            // TODO maybe check date and after x amount of days, show default start screen instead of last match stats
            getLastBattle()
        }

        // Declare info
        setFriendsList(res2['friends'])
        setAllUsersList(res3['all_users'])
        setPending(res4['pending'])
    }

    const getBattle = async (matchId: string, protagId: string, antagId: string) => {
        let battle = await call(
            "/api/nemesis/battleground",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                match_id: matchId,
                protagonist_id: protagId,
                antagonist_id: antagId,
            }
        )

        const [res] = await Promise.all([
            battle
        ])


        setStartTime(res['battleground']['time_of_villainy'])
        setEndTime(res['battleground']['end_time'])

        // Protagonist stats
        setProtagName(res['battleground']['protagonist_username'])
        setProtagonist(res['battleground']['protagonist_xp_gain'])
        setProTowersTaken(res['battleground']['protagonist_towers_taken'])


        // Antagonist stats
        setAntagName(res['battleground']['antagonist_username'])
        setAntagonist(res['battleground']['antagonist_xp_gain'])
        setAntTowersTaken(res['battleground']['antagonist_towers_taken'])


    }

    const getLastBattle = async () => {
        let battle = await call(
            "/api/nemesis/recent",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
            }
        )

        const [res] = await Promise.all([
            battle
        ])

        if (res['battleground'] !== undefined) {
            setStartTime(res['battleground']['time_of_villainy'])
            setEndTime(res['battleground']['end_time'])

            // Protagonist stats
            setProtagName(res['battleground']['protagonist_username'])
            setProtagonist(res['battleground']['protagonist_xp_gain'])
            setProTowersTaken(res['battleground']['protagonist_towers_taken'])


            // Antagonist stats
            setAntagName(res['battleground']['antagonist_username'])
            setAntagonist(res['battleground']['antagonist_xp_gain'])
            setAntTowersTaken(res['battleground']['antagonist_towers_taken'])

            setVictor(res['victor'])
        }

    }

    const sendDeclare = async () => {

        let res = await call(
            "/api/nemesis/declare",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {protag_id: declareId,
            }
        )
        if (res["declare_nemesis"] === "request already sent") {
            // @ts-ignore
            swal("Previous request to this user is still pending", "", "error")
        } else if (res["declare_nemesis"] === "request sent") {
            // @ts-ignore
            swal("Request Sent", "", "success")
            setOpenPopup(false)
            setSelectedName(null)
            setDeclareId("")
            setLoading(!loading)
        }

    }

    const acceptNemesis = async (antagId: string) => {
        // antagonist id
        let res = await call(
            "/api/nemesis/accept",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                antagonist_id: antagId,
            }
        )

        window.location.reload()
    }

    const declineNemesis = async (antagId: string) => {
        // antagonist id
        let res = await call(
            "/api/nemesis/decline",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                antagonist_id: antagId,
            }
        )
    }

    const [friendOpen, setFriendOpen] = React.useState(false);
    const [allOpen, setAllOpen] = React.useState(false);
    const [selectedName, setSelectedName] = useState<string | null>(null);

    const [redToGo, setRedToGo] = React.useState(1000);
    const [blueToGo, setBlueToGo] = React.useState(1000);

    const [redAttack, setRedAttack] = React.useState("Win");
    const [blueAttack, setBlueAttack] = React.useState("Win");

    const redPoints = antagonist
    const bluePoints = protagonist
    const difference = Math.abs(redPoints - bluePoints)


    const status = () => {
        if (difference >= 1 && difference <= 499) {
            if (bluePoints > redPoints) {
                setBlueToGo(500 - difference)
                setBlueAttack("Capture Right Tower")

                setRedToGo(difference)
                setRedAttack('Take Middle Tower')
            } else {
                setRedToGo(500 - difference)
                setRedAttack("Capture Left Tower")

                setBlueToGo(difference)
                setBlueAttack('Take Middle Tower')
            }
        } else if (difference >= 500 && difference <= 999) {
            if (bluePoints > redPoints) {
                setBlueToGo(1000-difference)
                setBlueAttack("Win")

                setRedToGo(difference - 500)
                setRedAttack('Re-Take Right Tower')
            } else {
                setRedToGo(1000-difference)
                setRedAttack("Win")

                setBlueToGo(difference - 500)
                setBlueAttack('Take Middle Tower')
            }
        }
    }

    useEffect(() => {
        status()
        getActive()
    }, [difference])

    let blueProgress: number = 50

    // determine position of the "vs" progress bar
    type ProgressRange = [number, number, number];

    const progressTable: ProgressRange[] = [
        [1, 100, 55],
        [101, 300, 60],
        [301, 400, 62.5],
        [401, 500, 66.6],
        [501, 600, 70],
        [601, 800, 80],
        [801, 900, 90],
        [901, 1000, 100]
    ];

    for (const [min, max, progress] of progressTable) {
        if (difference >= min && difference <= max) {
            blueProgress = (bluePoints > redPoints) ? progress : (100 - progress);
            break;
        } else if (difference > 1000) {
            if (protagonist > antagonist) {
                setVictor(protagName)
            } else {
                setVictor(antagName)
            }
            break;
        }
    }

    if (bluePoints > redPoints) {
        if (difference >= 1 && fortBCondition !== "blueFort") {
            setFortBCondition("blueFort");
        }
        if (difference >= 500 && fortCCondition !== "blueFort") {
            setFortCCondition("blueFort");
        }
    } else {
        if (difference >= 1 && fortBCondition !== "redFort") {
            setFortBCondition("redFort");
        }
        if (difference >= 500 && fortACondition !== "redFort") {
            setFortACondition("redFort");
        }
    }

    const redOptions = {
        loop: false,
        autoplay: true,
        animationData: red,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const blueOptions = {
        loop: false,
        autoplay: true,
        animationData: blue,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    };

    const swords = {
        loop: false,
        autoplay: true,
        animationData: clash,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet'
        }
    };

    const redArrow = {
        loop: true,
        autoplay: true,
        animationData: redarrow,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet'
        }
    };

    const blueArrow = {
        loop: true,
        autoplay: true,
        animationData: bluearrow,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet'
        }
    };

    const blueDefeat = {
        loop: false,
        autoplay: true,
        animationData: bluedefeat,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    }

    const redDefeat = {
        loop: false,
        autoplay: true,
        animationData: reddefeat,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    }

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };


    let fortAOptions: Options;

    switch (fortACondition) {
        case "redFort":
            fortAOptions = {
                loop: true,
                autoplay: true,
                animationData: redfort,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        case "blueFort":
            fortAOptions = {
                loop: true,
                autoplay: true,
                animationData: bluefort,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        case "blueBroken":
            fortAOptions = {
                loop: true,
                autoplay: true,
                animationData: bluebroken,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        case "blueDefeatFort":
            fortAOptions = {
                loop: true,
                autoplay: true,
                animationData: bluedefeatfort,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        default:
            fortAOptions = {
                loop: false,
                autoplay: true,
                animationData: blue,
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid slice'
                },
            };
    }

    let fortBOptions: Options;

    switch (fortBCondition) {
        case "redFort":
            fortBOptions = {
                loop: true,
                autoplay: true,
                animationData: redfort,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        case "blueFort":
            fortBOptions = {
                loop: true,
                autoplay: true,
                animationData: bluefort,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        case "blueBroken":
            fortBOptions = {
                loop: true,
                autoplay: true,
                animationData: bluebroken,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        case "redBroken":
            fortBOptions = {
                loop: true,
                autoplay: true,
                animationData: redbroken,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        case "blueDefeatFort":
            fortBOptions = {
                loop: true,
                autoplay: true,
                animationData: bluedefeatfort,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        default:
            fortBOptions = {
                loop: false,
                autoplay: true,
                animationData: neutralfort,
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid slice'
                },
            };
    }

    let fortCOptions: Options;

    switch (fortCCondition) {
        case "redFort":
            fortCOptions = {
                loop: true,
                autoplay: true,
                animationData: redfort,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        case "blueFort":
            fortCOptions = {
                loop: true,
                autoplay: true,
                animationData: bluefort,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        case "redBroken":
            fortCOptions = {
                loop: true,
                autoplay: true,
                animationData: redbroken,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        case "redDefeatFort":
            fortCOptions = {
                loop: true,
                autoplay: true,
                animationData: reddefeatfort,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                },
            };
            break;
        default:
            fortCOptions = {
                loop: false,
                autoplay: true,
                animationData: redfort,
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid slice'
                },
            };
    }

    const [openPopup, setOpenPopup] = useState(false);
    const [value, setValue] = useState(0);

    const xpNeededRed = () => {
        return (
            <div>
                <Grid container justifyContent={"left"} sx={{
                    position: 'fixed',
                    top: '6vh',
                    right: `0%`,
                    zIndex: 7,
                    width: "40vw",
                    height: "8vh",
                    borderColor: "rgba(255, 255, 255, 1)",
                    borderWidth: ".25em",
                    borderTopLeftRadius: 2,
                    borderBottomRightRadius: 2,
                    opacity: 0.8,
                    color: "white",
                    backgroundColor: "#791010",
                    backdropFilter: (isChrome) ? "blur(15px)" : undefined,
                    clipPath: "polygon(100% 10%, 100% 50%, 100% 90%, 3% 90%, 0 50%, 3% 10%)"
                }}>
                    <div style={{height: "100%", display: "flex", alignItems: "center"}}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={redArrow}
                            width={'6vw'}
                            height={'6vh'}
                            style={{transform: "rotate(180deg)", margin: "0px"}}/>
                        <Typography variant='h3' sx={{fontSize: '4vh'}}
                                    align="center">{redToGo + " XP to " + redAttack}</Typography>
                    </div>
                </Grid>
            </div>
        )
    }

    const xpNeededBlue = () => {
        return (
            <Grid container justifyContent={"right"} sx={{
                position: 'fixed',
                left: `0%`,
                top: '6vh',
                zIndex: 7,
                width: "40vw",
                height: "8vh",
                borderColor: "rgba(255, 255, 255, 1)",
                opacity: 0.8,
                color: "white",
                backgroundColor: "#193c70",
                backdropFilter: (isChrome) ? "blur(15px)" : undefined,
                clipPath: "polygon(97% 10%, 100% 50%, 97% 90%, 0 90%, 0 50%, 0 10%)",
            }}>
                <div style={{height: "100%", display: "flex", alignItems: "center"}}>
                    <Typography variant='h3' sx={{fontSize: '4vh'}}
                                align="center">{blueToGo + " XP to " + blueAttack}</Typography>
                    <Lottie
                        isClickToPauseDisabled={true}
                        options={blueArrow}
                        width={'6vw'}
                        height={'6vh'}
                        style={{margin: "0px"}}
                    />
                </div>
            </Grid>
        )
    }

    const buttonLocation = (victor === "")
    const mainButton = () => {
        return (
            <Grid container justifyContent={"center"} sx={{
                position: 'fixed',
                top: buttonLocation ? '7.5vh' : '92.5vh',
                right: `0vw`,
                zIndex: 99,
            }}>
                <Grid container justifyContent="center">
                    <AwesomeButton
                        type="primary"
                        onPress={() => {
                            setValue(0)
                            setOpenPopup(true)
                        }}
                    >Situation Room
                    </AwesomeButton>
                </Grid>
            </Grid>
        )
    }

    // TODO: KEEP!!  THIS IS FOR THE TUTORIALS
    // const handleJoyrideCallback = (data: CallBackProps) => {
    //     const { action, index, status, type } = data;
    //     if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status))
    //     {
    //         // Need to set our running state to false, so we can restart if we click start again.
    //         setRun(false)
    //         setStepIndex(0)
    //         navigate("/streak")
    //     } else if (action === "close" && window.sessionStorage.getItem("help") === "true") {
    //         setRun(false)
    //         setStepIndex(0)
    //         let authState = Object.assign({}, initialAuthStateUpdate)
    //         authState.tutorial = false
    //         // @ts-ignore
    //         dispatch(updateAuthState(authState))
    //         window.sessionStorage.setItem("help", "false")
    //     } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)) {
    //         const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
    //         const oldStepIndex = index - (action === ACTIONS.PREV? 1 : -1);
    //
    //
    //         if (index === 0){
    //             setRun(false)
    //             setStartTab("Pending Requests")
    //             setTimeout(() => {
    //                 setStepIndex(nextStepIndex);
    //                 setRun(true)
    //             }, 500);
    //         } else {
    //             if (action === "prev"){
    //                 setRun(false)
    //                 setStartTab("Declare Nemesis")
    //                 setTimeout(() => {
    //                     setStepIndex(oldStepIndex);
    //                     setRun(true)
    //                 }, 500);
    //             } else {
    //                 setStepIndex(nextStepIndex);
    //             }
    //         }
    //     }
    //
    //     console.groupCollapsed(type);
    ;
    //     console.groupEnd();
    // };

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

    const aspectRatio = useAspectRatio();

    const currentWar = () => {

        const AntagonistText = styled('span')({
            color: '#f72c2f',
        });

        const ProtagonistText = styled('span')({
            color: '#007ee4',
        });

        const getTimeLeft = (datetimeFromDB: string) => {
            const now = new Date();
            const endDate = new Date(datetimeFromDB.replace(' ', 'T'));

            const timeDiff = endDate.getTime() - now.getTime();

            if (timeDiff <= 0) {
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                };
            }

            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

            return {
                days,
                hours,
                minutes,
            };
        };
        
        // set the time left for countdown
        const timeLeft = getTimeLeft(endTime);

        // get number of days that passed to calc avg xp gain
        const startDate = new Date(startTime);
        const currentDate = new Date();
        const timeDifference = currentDate.getTime() - startDate.getTime();
        const numDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        // set the avg xp gain
        const protagAvg = (numDays === 0) ? 0 : (protagonist / numDays)
        const antagAvg = (numDays === 0) ? 0 : (antagonist / numDays)

        return (
            <>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="h4"  sx={{ color: '#007ee4', paddingBottom: '10px' }}>
                            Protagonist
                        </Typography>
                        <Typography variant="subtitle1" sx={{ paddingBottom: '10px', textTransform: 'none' }}>
                            {protagName}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ paddingBottom: '10px' }}>
                            Total XP: <ProtagonistText>{protagonist}</ProtagonistText>
                        </Typography>
                        <Typography variant="subtitle1" sx={{ paddingBottom: '10px' }}>
                            Avg XP / Day: <ProtagonistText>{protagAvg}</ProtagonistText>
                        </Typography>
                        <Typography variant="subtitle1" sx={{ paddingBottom: '10px' }}>
                            Towers Taken: <ProtagonistText>{proTowersTaken}</ProtagonistText>
                        </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ mx: 2 }}>
                        vs.
                    </Typography>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#f72c2f', paddingBottom: '10px' }}>
                            Antagonist
                        </Typography>
                        <Typography variant="subtitle1" sx={{ paddingBottom: '10px', textTransform: 'none' }}>
                            {antagName}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ paddingBottom: '10px' }}>
                            Total XP: <AntagonistText>{antagonist}</AntagonistText>
                        </Typography>
                        <Typography variant="subtitle1" sx={{ paddingBottom: '10px' }}>
                            Avg XP / Day: <AntagonistText>{antagAvg}</AntagonistText>
                        </Typography>
                        <Typography variant="subtitle1" sx={{ paddingBottom: '10px' }}>
                            Towers Taken: <AntagonistText>{antTowersTaken}</AntagonistText>
                        </Typography>
                    </Box>
                </Box>
                <div>
                    <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                        <Typography variant="h5">
                            {`Time Remaining: ${timeLeft.days} Days ${timeLeft.hours} Hours ${timeLeft.minutes} Minutes`}
                        </Typography>
                    </Box>
                </div>
            </>
        )
    }

    const headerStyles = {
        background: '#333',  // Header background color
        color: '#fff',
    };

    const borderStyles = {
        borderBottom: 'white',  // Horizontal line color
        borderRight: 'background.paper',   // Vertical line color
    };

    const warHistory = () => {

        interface XPArray {
            username: string,
            date: string,
            exp: number
        }

        const combinedArray: XPArray[] = [];

        if (dailyAntagXp.length === 0 && dailyProtagXp.length > 0) {
            combinedArray.push(...dailyProtagXp);
        } else if (dailyProtagXp.length === 0 && dailyAntagXp.length > 0) {
            combinedArray.push(...dailyAntagXp);
        } else if (dailyAntagXp.length > 0 && dailyProtagXp.length > 0) {
            combinedArray.push(...dailyAntagXp, ...dailyProtagXp);
        }

        combinedArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return (
            <>
                <Paper elevation={2} style={{ width: 'auto', marginBottom: '16px' }}>
                    <TableContainer style={{ maxHeight: 400, overflowY: 'auto', borderRadius: 10}}>
                        <Table size="small" stickyHeader sx={{backgroundColor: "background.paper"}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ ...headerStyles, ...borderStyles }}>Date</TableCell>
                                    <TableCell style={{ ...headerStyles, ...borderStyles }}>Points Earned</TableCell>
                                    <TableCell style={{ ...headerStyles, ...borderStyles }}>Earned By</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dailyAntagXp.length === 0 || dailyProtagXp.length === 0
                                ?
                                    <TableRow>
                                        <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                                            No Data! Get to coding and take the lead!
                                        </TableCell>
                                    </TableRow>
                                :
                                    combinedArray.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {new Date(item['date']).toLocaleString(undefined, {
                                                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                                })}
                                                </TableCell>
                                                <TableCell>{item['exp']}</TableCell>
                                                {item['username'] === protagName
                                                ?
                                                    <TableCell style={{ color: '#3d7ce9' }}>{item["username"]}</TableCell>
                                                :
                                                    <TableCell style={{ color: '#ea2a2a' }}>{item["username"]}</TableCell>}
                                            </TableRow>
                                        ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </>
        )
    }

    const previous = () => {

        return (
            <Paper elevation={2} style={{ width: 'auto', marginBottom: '16px' }}>
                <TableContainer style={{ maxHeight: 400, overflowY: 'auto', borderRadius: 10}}>
                    <Table size="small" stickyHeader sx={{backgroundColor: "background.paper"}}>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ ...headerStyles, ...borderStyles }}>Protagonist vs. Antagonist</TableCell>
                                <TableCell style={{ ...headerStyles, ...borderStyles }}>Towers Taken</TableCell>
                                <TableCell style={{ ...headerStyles, ...borderStyles }}>Your XP Gained</TableCell>
                                <TableCell style={{ ...headerStyles, ...borderStyles }}>Enemy XP Gained</TableCell>
                                <TableCell style={{ ...headerStyles, ...borderStyles }}>Outcome</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {matchHistory.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    <TableCell style={borderStyles}>{row['protagonist_name']} vs. {row['antagonist_name']}</TableCell>
                                    <TableCell style={borderStyles}>
                                        {
                                        row['protagonist_name'] === username
                                            ?
                                                row['towers_taken_protag']
                                            :
                                                row['towers_taken_antag']
                                        }
                                    </TableCell>
                                    <TableCell style={borderStyles}>
                                        {
                                            row['protagonist_name'] === username
                                                ?
                                                row['protagonist_xp_gain']
                                                :
                                                row['antagonist_xp_gain']
                                        }
                                    </TableCell>
                                    <TableCell style={borderStyles}>
                                        {
                                            row['protagonist_name'] === username
                                                ?
                                                row['antagonist_xp_gain']
                                                :
                                                row['protagonist_xp_gain']
                                        }
                                    </TableCell>
                                    <TableCell style={borderStyles}>
                                        <Typography style={{ color: row['victor'] === username ? '#29C18C' : '#f72c2f' }}>
                                            {row['victor'] === username
                                                ?
                                                    'WON'
                                                :
                                                    'LOST'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        )

    }


    const declare = () => {
        const friendList = () => {
            return (
                (friendsList.length !== 0)
                    ?
                    <Box style={{overflow: "hidden", width: '20vw'}}>
                        {friendsList.map((row) => (
                            <div style={{padding: "2px"}}>
                                <ButtonBase sx={{display: 'flex', width: "100%", height: "100%"}}
                                            onClick={() => {
                                                handleNameSelect(row["friend_name"], row['friend'])
                                            }}>
                                    <Card sx={{
                                        display: 'flex',
                                        textAlign: "left",
                                        width: "99%",
                                        height: 75,
                                        border: 1,
                                        borderColor: theme.palette.secondary.main + "75",
                                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                        backgroundColor: "transparent",
                                        backgroundImage: "none",
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: theme.palette.secondary.main + "25",
                                        }
                                    }}>
                                        <Button
                                            sx={{width: "100%"}}
                                        >
                                            <div style={{display: "flex", flexDirection: "row", width: "95%", justifyContent: "left"}}>
                                                <div>
                                                    <UserIcon
                                                        userId={
                                                            // @ts-ignore
                                                            row['friend']
                                                        }
                                                        userTier={1}
                                                        userThumb={
                                                            //@ts-ignore
                                                            config.rootPath + "/static/user/pfp/" + row['friend']}
                                                        backgroundName={
                                                            //@ts-ignore
                                                            null}
                                                        backgroundPalette={
                                                            //@ts-ignore
                                                            null}
                                                        backgroundRender={
                                                            //@ts-ignore
                                                            true}
                                                        imageTop={2}
                                                        size={50}
                                                    />
                                                </div>
                                                <Typography variant="h5" component="div" sx={{
                                                    ml: 1,
                                                    mt: 1,
                                                    fontSize: 16,
                                                }}>
                                                    {row['friend_name']}
                                                </Typography>
                                            </div>
                                            <Tooltip
                                                title={`Renown`}
                                            >
                                                <img
                                                    style={{
                                                        height: "99%",
                                                        width: "auto",
                                                        opacity: "0.85",
                                                        overflow: "hidden",
                                                    }}
                                                />
                                            </Tooltip>
                                        </Button>
                                    </Card>
                                </ButtonBase>
                            </div>
                        ))}
                    </Box>
                    :
                    <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: "hidden",
                        width: '20vw',
                        height: '10vh'
                    }}>
                        <div style={{padding: "2px"}}>
                            No Friends Yet!
                        </div>
                    </Box>
            )
        }

        const allUserList = () => {
            return (
                <Box style={{overflow: "visible", width: '20vw', height: '40vh'}}>
                    {allUsersList.map((row) => (
                        <div style={{padding: "2px"}}>
                            <ButtonBase sx={{display: 'flex', width: "100%", height: "100%"}}
                                        onClick={() => {
                                            handleNameSelect(row["username"], row['_id'])
                                        }}>
                                <Card sx={{
                                    display: 'flex',
                                    textAlign: "left",
                                    width: "99%",
                                    height: 75,
                                    border: 1,
                                    borderColor: theme.palette.secondary.main + "75",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                    backgroundColor: "transparent",
                                    backgroundImage: "none",
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: theme.palette.secondary.main + "25",
                                    }
                                }}>
                                    <Button
                                        sx={{width: "100%"}}

                                    >
                                        <div style={{display: "flex", flexDirection: "row", width: "95%", justifyContent: "left"}}>
                                            <div>
                                                <UserIcon
                                                    userId={
                                                        // @ts-ignore
                                                        row['_id']
                                                    }
                                                    userTier={1}
                                                    userThumb={
                                                        //@ts-ignore
                                                        config.rootPath + "/static/user/pfp/" + row['_id']}
                                                    backgroundName={
                                                        //@ts-ignore
                                                        null}
                                                    backgroundPalette={
                                                        //@ts-ignore
                                                        null}
                                                    backgroundRender={
                                                        //@ts-ignore
                                                        true}
                                                    imageTop={2}
                                                    size={50}
                                                />
                                            </div>
                                            <Typography variant="h5" component="div" sx={{
                                                ml: 1,
                                                mt: 1,
                                                fontSize: 16,
                                            }}>
                                                {row['username']}
                                            </Typography>
                                        </div>
                                        <Tooltip
                                            title={`Renown`}
                                        >
                                            <img
                                                style={{
                                                    height: "99%",
                                                    width: "auto",
                                                    opacity: "0.85",
                                                    overflow: "hidden",
                                                }}
                                            />
                                        </Tooltip>
                                    </Button>
                                </Card>
                            </ButtonBase>
                        </div>
                    ))}
                </Box>
            )
        }

        const handleNameSelect = (name: string, id: string) => {
            setSelectedName(name);
            setFriendOpen(false)
            setAllOpen(false)
            setDeclareId(id)
        };

        const handleSubmit = () => {
            sendDeclare()
        };

        return (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Box display="flex" justifyContent="center" gap={2}>
                    <Button
                        startIcon={<People />}
                        variant="outlined"
                        onClick={() => setFriendOpen(true)}
                    >
                        Friends
                    </Button>
                    <Dialog open={friendOpen} onClose={() => setFriendOpen(false)}>
                        {friendList()}
                    </Dialog>
                    <Button
                        startIcon={<GroupAdd />}
                        variant="outlined"
                        onClick={() => setAllOpen(true)}
                    >
                        All Users
                    </Button>
                    <Dialog open={allOpen} onClose={() => setAllOpen(false)}>
                        {allUserList()}
                    </Dialog>
                </Box>

                {selectedName && (
                    <Typography variant="h6">Selected: {selectedName}</Typography>
                )}

                <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!selectedName}>
                    Declare!
                </Button>
            </Box>
        )
    }

    const pendingRequests = () => {

        const handleDeleteRow = (id: number) => {
            setPending((prevRows) => prevRows.filter((row) => row["_id"] !== id));
        };

        return (
            <>
                <Paper elevation={2} style={{ width: 'auto', marginBottom: '16px' }}>
                    <TableContainer style={{ maxHeight: 400, overflowY: 'auto', borderRadius: 10}}>
                        <Table size="small" stickyHeader sx={{backgroundColor: "background.paper"}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ ...headerStyles, ...borderStyles }}>Opponent</TableCell>
                                    <TableCell style={{ ...headerStyles, ...borderStyles }}>Your Role</TableCell>
                                    <TableCell align='center' style={{ ...headerStyles, ...borderStyles }}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pending.map((row) => (
                                    <TableRow >
                                        <TableCell component="th" scope="row">
                                            {/*@ts-ignore*/}
                                            {row["protagonist_name"].toLowerCase() === username.toLowerCase()
                                                ?
                                                row["antagonist_name"]
                                                :
                                                row["protagonist_name"]}
                                        </TableCell>
                                        <TableCell >
                                            {/*@ts-ignore*/}
                                            {row["protagonist_name"].toLowerCase() === username.toLowerCase()
                                                ?
                                                "Protagonist"
                                                :
                                                "Antagonist"}
                                        </TableCell>
                                        <TableCell align='right'>
                                            {/*@ts-ignore*/}
                                            {row["protagonist_name"].toLowerCase() === username.toLowerCase()
                                                ?
                                                <>
                                                    <Button variant="outlined" color={"primary"}
                                                            onClick={() => {
                                                                acceptNemesis(row["antagonist_id"])
                                                                setHasNemesis(true)
                                                                handleDeleteRow(row["_id"])
                                                            }}>
                                                        Accept
                                                    </Button>
                                                    <Button variant="outlined" color={"error"}
                                                            onClick={() => {
                                                                declineNemesis(row["antagonist_id"])
                                                                handleDeleteRow(row["_id"])
                                                                setOpenPopup(false)
                                                            }}>
                                                        Decline
                                                    </Button>
                                                </>
                                                :
                                                <>
                                                    <Button variant="outlined" disabled={true}>
                                                        Pending
                                                    </Button>
                                                </>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </>
        )
    }


    const [open, setOpen] = useState(false);

    const situationPopup = () => {
        const handleOpen = () => {
            setOpen(true);
        };

        const handleClose = () => {
            setOpen(false);
        };

        const handleChange = (event: any, newValue: React.SetStateAction<number>) => {
            setValue(newValue);
        };

        let testing = true

        return (
            <Dialog open={openPopup} onClose={handleClose} maxWidth='md'>
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={() => {
                        setOpenPopup(false)
                        setSelectedName(null)
                        setDeclareId("")
                    }
                }
                    style={{ position: 'absolute', right: '12px', top: '5px', zIndex: 99}}
                >
                    <CloseIcon />
                </IconButton>
                <Box sx={{ width: 800, padding: 3, bgcolor: 'background.paper', maxHeight: 500, overflowY: 'hidden'}}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                    >
                        <Tab label="Current War" />
                        <Tab label="War History" />
                        <Tab label="Previous Matches" />
                        {victor !== ""
                            ?
                            <Tab label="Declare" />
                            :
                            <Tooltip title='Only one nemesis at a time!'>
                                <div style={{opacity: 0.5}}>
                                    <Tab label="Declare" disabled={true} />
                                </div>
                            </Tooltip>
                        }
                        {pending.length === 0
                        ?
                            <></>
                        :
                            <Tab label="Pending" />
                        }
                    </Tabs>
                    {value === 0 && (
                        currentWar()
                    )}
                    {value === 1 && (
                        warHistory()
                    )}
                    {value === 2 && (
                        previous()
                    )}
                    {value === 3 && (
                        declare()
                    )}
                    {value === 4 && (
                        pendingRequests()
                    )}
                </Box>
            </Dialog>
        );
    }

    const useStyles = makeStyles({
        root: {
            width: '100vw',
            height: '100vh',
            position: 'absolute',
            overflow: 'hidden',
            top: 0,
            left: 0,
            zIndex: -1, // Place it behind the content
        },
    });

    const mainStylesRed: React.CSSProperties = {
        bottom: aspectRatio === '21:9' ? '15vh' : '20vh',
        position: 'fixed',
        right: 0
    };

    const mainStylesBlue: React.CSSProperties = {
        bottom: aspectRatio === '21:9' ? '15vh' : '20vh',
        position: 'fixed',
        left: aspectRatio === '21:9' ? 0 : '2vh'
    };

    const mainHeight = (aspectRatio === '21:9') ? (windowWidth / 3.5) : (windowWidth / 3);

    const classes = useStyles()

    const castles = () => {
        return (
            <Grid container direction="row" alignItems="flex-end" style={{ height: '93vh' }}>
                <Grid container direction="row" alignItems="flex-end" style={{ height: '93vh' }}>
                    <Grid item xs={3} style={mainStylesBlue}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={blueOptions}
                            width={windowWidth / 4}
                            height={mainHeight}
                        />
                    </Grid>
                    <Grid item xs={6} container direction="row" alignItems="center" style={{ bottom: aspectRatio === '21:9' ? '5vh' : '4vh' , position: 'fixed', left: '25vw'}}>
                        <Grid item xs={4}>
                            <Lottie
                                isClickToPauseDisabled={true}
                                options={fortAOptions}
                                width={windowWidth / 10}
                                height={windowWidth / 9}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Lottie
                                isClickToPauseDisabled={true}
                                options={fortBOptions}
                                width={windowWidth / 7}
                                height={windowWidth / 6}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Lottie
                                isClickToPauseDisabled={true}
                                options={fortCOptions}
                                width={windowWidth / 10}
                                height={windowWidth / 9}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={3} style={mainStylesRed}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={redOptions}
                            width={windowWidth / 4}
                            height={mainHeight}
                        />
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    const startCastles = () => {
        return (
            <Grid container direction="column" alignItems="flex-end" style={{ height: '93vh' }}>
                <Grid container direction="column" alignItems="flex-end" style={{ height: '93vh' }}>
                    <Grid item xs={3} style={mainStylesBlue}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={blueOptions}
                            width={windowWidth / 4}
                            height={mainHeight} />
                    </Grid>
                    <Grid item xs={12} direction='column' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                            width: '100vw',
                            height: '93vh',
                            backdropFilter: 'blur(8px)',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(90deg, rgba(0,126,228,0.8015581232492998) 0%, rgba(119,83,133,0) 50%, rgba(234,42,42,0.8015581232492998) 100%)',
                            color: "black",
                            zIndex: 99,

                        }}>
                            <Grid item xs={6}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '93vh',
                                }}>
                                    <h3>Welcome to the Nemesis Page!</h3>

                                    <p>Want to start a friendly competition with your friends or even just another user? Declare a nemesis!</p>
                                    <p>
                                        When you declare a nemesis, you begin an XP battle with your chosen opponent. For one week, you will compete to  outpace your opponent by 1000 XP. The individual initiating the request to declare a nemesis match will assume the role of the antagonist, whereas the individual who agrees to the request becomes the protagonist. Enjoy a playful tug-of-war as you both code your way to victory! So what are you waiting for, declare your nemesis and get to coding!
                                    </p>
                                </div>
                                <Grid container justifyContent={"center"} sx={{
                                    position: 'fixed',
                                    top: '70vh',
                                    right: `0vw`,
                                    zIndex: 99,
                                }}>
                                    <Grid container justifyContent="center">
                                        <AwesomeButton
                                            type="primary"
                                            onPress={() => {
                                                if (pending.length === 0) {
                                                    setValue(3)
                                                    setOpenPopup(true)
                                                } else {
                                                    setValue(4)
                                                    setOpenPopup(true)
                                                }
                                            }}
                                        >Declare!
                                        </AwesomeButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </div>
                    </Grid>
                    <Grid item xs={3} style={mainStylesRed}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={redOptions}
                            width={windowWidth / 4}
                            height={mainHeight} />
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    const progressBar = () => {
        return (
            <>
                <Box
                    sx={{
                        display: "flex", // Change to flex
                        justifyContent: "flex-end", // Align content to the right
                        width: `${blueProgress}vw`,
                        height: "5vh",
                        backgroundColor: "#193c70",
                        position: "fixed",
                        bottom: '0vh',
                        left: 0,
                        zIndex: 1,
                        transform: "translate(0%, 25%)",
                        overflow: 'visible',
                        boxShadow: "0px 6px 18px 0px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                    }}
                >
                    <Lottie
                        isClickToPauseDisabled={true}
                        options={swords}
                        style={{
                            position: "absolute",
                            left: aspectRatio === '21:9' ? `${blueProgress - 1.85}vw` : `${blueProgress - 2.5}vw`,
                            bottom: '0vh'
                        }}
                        width={windowHeight / 10}
                        height={windowHeight / 10} />
                </Box>
                <Box
                    sx={{
                        display: "inline-block",
                        width: '100vw',
                        height: '5vh',
                        backgroundColor: "#791010",
                        position: "fixed",
                        bottom: '0vh',
                        right: 0,
                        //opacity: 0.2,
                        zIndex: 0,
                        boxShadow: "0px 6px 18px 0px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                        transform: "translate(0%, 25%)"
                    }}
                />
            </>
        )
    }

    const blueWin = () => {
        return (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backdropFilter: 'blur(2px)',
                background: 'radial-gradient(circle, rgba(0,126,228,0) 0%, rgba(0,126,228,0.700717787114846) 100%)',
                zIndex: -1
            }}>
                <Grid container direction="row" alignItems="flex-end" style={{ height: '93vh' }}>
                    <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        <Grid item xs={3} direction={'column'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h3" style={{color: '#3e80e9'}}>You</Typography>
                                <Typography variant="h4" style={{color: 'black'}}>Total XP: {protagonist}</Typography>
                                <Typography variant="h4" style={{color: 'black'}}>Tower's Taken: {proTowersTaken} </Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '93vh',
                            }}>
                                <Typography variant="h1" style={{color: '#4c8aec'}}>YOU WON!</Typography>
                                <Lottie
                                    isClickToPauseDisabled={true}
                                    options={blueOptions}
                                    width={windowWidth / 4}
                                    height={mainHeight}
                                />
                            </div>
                        </Grid>

                        <Grid item xs={3} direction={'column'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h3" style={{color: '#f72c2f'}}>Opponent</Typography>
                                <Typography variant="h4" style={{color: 'black'}}>Total XP: {antagonist}</Typography>
                                <Typography variant="h4" style={{color: 'black'}}>Tower's Taken: {antTowersTaken}</Typography>
                        </Grid>

                    </Grid>
                </Grid>
            </div>
        )
    }

    const blueLost = () => {
        return (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backdropFilter: 'blur(2px)',
                background: 'radial-gradient(circle, rgba(0,126,228,0) 0%, rgba(0,126,228,0.700717787114846) 100%)',
                zIndex: -1
            }}>
                <Grid container direction="row" alignItems="flex-end" style={{ height: '93vh' }}>
                    <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        <Grid item xs={3} direction={'column'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h3" style={{color: '#3e80e9'}}>You</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Total XP: {protagonist}</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Tower's Taken: {proTowersTaken}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '93vh',
                            }}>
                                <Typography variant="h1" style={{color: '#4c8aec'}}>YOU LOST!</Typography>
                                <Lottie
                                    isClickToPauseDisabled={true}
                                    options={blueDefeat}
                                    width={windowWidth / 4}
                                    height={mainHeight}
                                />
                            </div>
                        </Grid>

                        <Grid item xs={3} direction={'column'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h3" style={{color: '#f72c2f'}}>Opponent</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Total XP: {antagonist} </Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Tower's Taken: {antTowersTaken} </Typography>
                        </Grid>

                    </Grid>
                </Grid>
            </div>
        )
    }

    const redWin = () => {
        return (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backdropFilter: 'blur(2px)',
                background: 'radial-gradient(circle, rgba(234,42,42,0.14049369747899154) 0%, rgba(234,42,42,0.6558998599439776)',
                zIndex: -1
            }}>
                <Grid container direction="row" alignItems="flex-end" style={{ height: '93vh' }}>
                    <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        <Grid item xs={3} direction={'column'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h3" style={{color: '#f72c2f'}}>You</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Total XP: {antagonist}</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Tower's Taken: {antTowersTaken} </Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '93vh',
                            }}>
                                <Typography variant="h1" style={{color: '#c93435'}}>YOU WON!</Typography>
                                <Lottie
                                    isClickToPauseDisabled={true}
                                    options={redOptions}
                                    width={windowWidth / 4}
                                    height={mainHeight}
                                />
                            </div>
                        </Grid>

                        <Grid item xs={3} direction={'column'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h3" style={{color: '#3e80e9'}}>Opponent</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Total XP: {protagonist}</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Tower's Taken: {proTowersTaken}</Typography>
                        </Grid>

                    </Grid>
                </Grid>
            </div>
        )
    }

    const redLost = () => {
        return (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backdropFilter: 'blur(2px)',
                background: 'radial-gradient(circle, rgba(234,42,42,0.14049369747899154) 0%, rgba(234,42,42,0.6558998599439776)',
                zIndex: -1
            }}>
                <Grid container direction="row" alignItems="flex-end" style={{ height: '93vh' }}>
                    <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        <Grid item xs={3} direction={'column'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h3" style={{color: '#f72c2f'}}>You</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Total XP: {antagonist}</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Tower's Taken: {antTowersTaken} </Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '93vh',
                            }}>
                                <Typography variant="h1" style={{color: '#c93435'}}>YOU LOST!</Typography>
                                <Lottie
                                    isClickToPauseDisabled={true}
                                    options={redDefeat}
                                    width={windowWidth / 4}
                                    height={mainHeight}
                                />
                            </div>
                        </Grid>

                        <Grid item xs={3} direction={'column'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h3" style={{color: '#3e80e9'}}>Opponent</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Total XP: {protagonist}</Typography>
                            <Typography variant="h4" style={{color: 'black'}}>Tower's Taken: {proTowersTaken}</Typography>
                        </Grid>

                    </Grid>
                </Grid>
            </div>
        )
    }

    if (!hasNemesis){
        // User does not have a nemesis at the moment
        return (
            <ThemeProvider theme={nemesisTheme}>
                <CssBaseline>
                    <div className={classes.root}>
                        <NemesisPageIcon style={{width: '100vw', height: '100vh', }} aspectRatio={aspectRatio.toString()} />
                    </div>
                    {startCastles()}
                    {situationPopup()}
                </CssBaseline>
            </ThemeProvider>
        )
    } else if (victor === username) {
        if (protagName === "") {
            return (
                <div><Lottie options={defaultOptions} height={500} width={500}/></div>
            )
        }
        if (username === protagName) {
            // user won and played as protagonist
            return (
                <ThemeProvider theme={nemesisTheme}>
                    <CssBaseline>
                        {blueWin()}
                        {mainButton()}
                        {situationPopup()}
                    </CssBaseline>
                </ThemeProvider>
            )
        } else {
            // user won and played as antagonist
            return (
                <ThemeProvider theme={nemesisTheme}>
                    <CssBaseline>
                        {redWin()}
                        {mainButton()}
                        {situationPopup()}
                    </CssBaseline>
                </ThemeProvider>
            )
        }
    } else if (victor !== username && victor !== "") {
        if (protagName === "") {
            return (
                <div><Lottie options={defaultOptions} height={500} width={500}/></div>
            )
        }
        if (username === protagName) {
            // user lost and played as protagonist
            return (
                <ThemeProvider theme={nemesisTheme}>
                    <CssBaseline>
                        {blueLost()}
                        {mainButton()}
                        {situationPopup()}
                    </CssBaseline>
                </ThemeProvider>
            )
        } else {
            // user lost and played as antagonist
            return (
                <ThemeProvider theme={nemesisTheme}>
                    <CssBaseline>
                        {redLost()}
                        {mainButton()}
                        {situationPopup()}
                    </CssBaseline>
                </ThemeProvider>
            )
        }
    } else {
        // user nemesis match is in session
        return (
            <ThemeProvider theme={nemesisTheme}>
                <CssBaseline>
                    <div className={classes.root}>
                        <NemesisPageIcon style={{width: '100vw', height: '100vh', }} aspectRatio={aspectRatio.toString()} />
                    </div>
                    {xpNeededBlue()}
                    {mainButton()}
                    {situationPopup()}
                    {xpNeededRed()}
                    {castles()}
                    {progressBar()}
                </CssBaseline>
            </ThemeProvider>
        )
    }
}
export default Nemesis;