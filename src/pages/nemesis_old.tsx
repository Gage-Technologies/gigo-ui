

import * as React from "react";
import {
    Autocomplete,
    Box,
    Button,
    ButtonBase,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    createTheme,
    CssBaseline, Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    LinearProgress,
    linearProgressClasses,
    MenuItem,
    PaletteMode,
    Select,
    SelectChangeEvent,
    styled,
    Tab,
    Tabs, TextField,
    ThemeProvider,
    Tooltip,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useNavigate, useSearchParams} from "react-router-dom";
import AppWrapper from "../components/AppWrapper";
import ProgressBar from 'react-customizable-progressbar'
import CustomBar from "../components/ProgressBar/CustomizedProgressbar"
import {useEffect, useState} from "react";


import Lottie, { Options } from "react-lottie";

import * as blue from "../img/Nemesis/blue.json"
import * as red from "../img/Nemesis/red.json"
import * as redfort from "../img/Nemesis/redFort.json"
import * as clouds from "../img/Nemesis/clouds.json"
import * as bluefort from "../img/Nemesis/blueFort.json"
import * as neutralfort from "../img/Nemesis/neutralFort.json"
import * as bluebroken from "../img/Nemesis/blueBroken.json"
import * as bluedefeatfort from "../img/Nemesis/blueDefeatFort.json"
import * as redbroken from "../img/Nemesis/redBroken.json"
import * as reddefeatfort from "../img/Nemesis/redDefeatFort.json"
import * as clash from "../img/Nemesis/clashing.json"
import * as redarrow from "../img/Nemesis/redArrow.json"
import * as bluearrow from "../img/Nemesis/blueArrow.json"
import * as map from "../img/Nemesis/map.json"
import * as graycastle from "../img/Nemesis/grayCastle.json"
import * as celebrate from "../img/Nemesis/blueCelebrate.json"
import * as blueWinAnimation from "../img/Nemesis/blueWin.json"
import * as redWinAnimation from "../img/Nemesis/redWin.json"
import * as redCelebrate from "../img/Nemesis/redCelebrate.json"
import * as bluedefeat from "../img/Nemesis/blueDefeat.json"
//@ts-ignore
import * as reddefeat from "../img/Nemesis/redDefeat.json"

//@ts-ignore
// import {Calendar} from "react-modern-calendar-datepicker";
// import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import './calendar.css'
import {useAppSelector, useAppDispatch} from "../app/hooks";
import {
    initialAuthStateUpdate,
    selectAuthStateId,
    selectAuthStateThumbnail,
    selectAuthStateUserName, updateAuthState
} from "../reducers/auth/auth";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import config from "../config";
import {initialSearchStateUpdate} from "../reducers/searchParams/searchParams";
import AnimatedText from "react-animated-text-content";
import {isChrome} from "react-device-detect";
import * as flame from "../img/streak/active.json";
import {AwesomeButton} from "react-awesome-button";
import 'react-awesome-button/dist/styles.css';
import '../img/Nemesis/button.css'
import call from "../services/api-call";
import Countdown from "react-countdown";
import Joyride, {ACTIONS, CallBackProps, EVENTS, STATUS} from "react-joyride";
import {handle} from "mdast-util-to-markdown/lib/handle";
import UserIcon from "../components/UserIcon";


function NemesisOld() {
    let userPref = localStorage.getItem('theme')
    const [color, setColor] = React.useState("white")
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    // linear-gradient(90deg, rgba(25,60,112,1) 0%, rgba(25,60,112,1) 50%, rgba(121,16,16,1) 50%, rgba(121,16,16,1) 100%);

    let designTokensBlue = getAllTokens(mode);
    designTokensBlue.palette.background.default = '#193c70';
    const themeBlue = React.useMemo(() => createTheme(designTokensBlue), [mode]);

    let designTokensRed = getAllTokens(mode);
    designTokensRed.palette.background.default = "#791010";
    const themeRed = React.useMemo(() => createTheme(designTokensRed), [mode]);
    const dispatch = useAppDispatch();

    let designTokens50 = getAllTokens(mode);
    // @ts-ignore
    designTokens50["components"] = {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: "linear-gradient(90deg, rgba(25,60,112,1) 0%, rgba(25,60,112,1) 49.9%, rgba(0,0,0,1) 50%, rgba(121,16,16,1) 50.1%, rgba(121,16,16,1) 100%);"
                }
            }
        }
    }
    const theme50 = React.useMemo(() => createTheme(designTokens50), [mode]);

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    let navigate = useNavigate();

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
    const [leader, setLeader] = React.useState("un-done");

    // Protagonist
    const [segA, setSegA] = React.useState(100);
    const [segB, setSegB] = React.useState(100);
    const [segC, setSegC] = React.useState(100);

    // antagonist
    const [segD, setSegD] = React.useState(0);
    const [segE, setSegE] = React.useState(0);
    const [segF, setSegF] = React.useState(0);

    // xp-gained
    const [antagonist, setAntagonist] = React.useState(0);
    const [protagonist, setProtagonist] = React.useState(0);
    const [proAvg, setProAvg] = React.useState(0);
    const [antAvg, setAntAvg] = React.useState(0);

    const [hasNemesis, setHasNemesis] = React.useState(true);
    const[sendRequest, setSendRequest] = React.useState<string | null>(null);

    const [lost, setLost] = React.useState(false)
    const [lostPopup, setLostPopup] = React.useState(false)
    const [win, setWin] = React.useState(false)
    const [winPopup, setWinPopup] = React.useState(false)
    const [victor, setVictor] = React.useState("")

    const [redToGo, setRedToGo] = React.useState(1000);
    const [blueToGo, setBlueToGo] = React.useState(1000);
    const [redAttack, setRedAttack] = React.useState("Win");
    const [blueAttack, setBlueAttack] = React.useState("Win");

    const [loading, setLoading] = React.useState(true);

    const [mainBlueCondition, setMainBlueCondition] = React.useState("blueOptions");
    const [fortACondition, setFortACondition] = React.useState("blueFort");
    const [fortBCondition, setFortBCondition] = React.useState("neutralFort");
    const [fortCCondition, setFortCCondition] = React.useState("redFort");
    const [mainRedCondition, setMainRedCondition] = React.useState("redOptions");
    const thumbnail = useAppSelector(selectAuthStateThumbnail);
    const username = useAppSelector(selectAuthStateUserName);

    let diagonal = Math.sqrt(Math.pow(windowHeight, 2) + Math.pow(windowWidth, 2));

    let newRadius = Math.floor((diagonal - 600) / 9.25);

    const [xPos, setxPos] = React.useState(0)
    const [yPos, setyPos] = React.useState(0)
    const [xPosRed, setxPosRed] = React.useState(0)
    const [yPosRed, setyPosRed] = React.useState(0)
    const [xBlue, setxBlue] = React.useState(0)
    const [yBlue, setyBlue] = React.useState(0)
    const [xRed, setxRed] = React.useState(0)
    const [yRed, setyRed] = React.useState(0)

    const [popupOpen, setPopupOpen] = React.useState(false);

    let difference = Math.abs(antagonist - protagonist)

    const callingId = useAppSelector(selectAuthStateId)

    const [active, setActive] = React.useState([]);
    const [pastWarStats, setPastWarStats] = React.useState([]);
    const [friendsList, setFriendsList] = React.useState([]);
    const [declareName, setDeclareName] = React.useState("");

    const [protagName, setProtagName] = React.useState("");
    const [antagName, setAntagName] = React.useState("");
    const [protagPic, setProtagPic] = React.useState("");
    const [antagPic, setAntagPic] = React.useState("");
    const [firstBattle, setFirstBattle] = React.useState(false);
    const [nemesisDate, setNemesisDate] = React.useState("")
    const [requestDate, setRequestDate] = React.useState(new Date())

    const [endTime, setEndTime] = React.useState("");

    const [dailyProtagXp, setDailyProtagXp] = React.useState([]);
    const [dailyAntagXp, setDailyAntagXp] = React.useState([]);

    const [antagonistId, setAntagonistId] = React.useState("");
    const [protagonistId, setProtagonistId] = React.useState("");

    const [proTowersTaken, setProTowersTaken] = React.useState(0);
    const [antTowersTaken, setAntTowersTaken] = React.useState(0);

    const [pending, setPending] = React.useState([]);
    const [matchId, setMatchId] = React.useState(0);

    const [friendValue, setFriendValue] = useState(null);
    const [allUserValue, setAllUserValue] = useState(null);
    const [allUserList, setAllUserList] = useState([]);

    const [steps, setSteps] = React.useState([{content: <h2>You can challenge someone, and if they accept, you can battle your nemesis to find the best developer. You win by gaining more XP than your nemesis.</h2>, target: '.start', disableBeacon: true}, {content: <h2>Review current requests sent and received for starting a nemesis challenge. Click a tab over to review past battles and their outcomes</h2>, target: '.check'}])

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
            {
            }
        )

        let history = call(
            "/api/nemesis/history",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
            }
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

        const [res, res2, res3, res4, res5] = await Promise.all([
            active, history, friends, pending, allUsers
        ])
        if (res["nemesis"].length === 0) {
            setHasNemesis(false)
        } else {
            setHasNemesis(true)
        }

        setActive(res["nemesis"])
        setPastWarStats(res2["history"])
        setFriendsList(res3["friends"])
        setPending(res4["pending"])
        setAllUserList(res5["all_users"])

    }

    const sendDeclare = async () => {
        const today = new Date();

        if (requestDate.getTime() <= today.getTime()) {
            // @ts-ignore
            swal("Please select a valid date", "", "error")
            return
        }

        let res = await call(
            "/api/nemesis/declare",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {protag_id: declareName, end_time: nemesisDate,
            }
        )
        if (res["declare_nemesis"] === "request already sent") {
            // @ts-ignore
            swal("Previous request to this user is still pending", "", "error")
        } else if (res["declare_nemesis"] === "request sent") {
            // @ts-ignore
            swal("Request Sent", "", "success")
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
    }

    const declareVictor = async (victor: string, matchID: number) => {
        let res = await call(
            "/api/nemesis/victory",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                victor: victor,
                match_id: matchID,
            }
        )
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


    const getBattle = async () => {
        setFirstBattle(true)
        setSegA(100);
        setSegB(100);
        setSegC(100);

        setSegD(0);
        setSegE(0);
        setSegF(0);
        let battle = call(
            "/api/nemesis/recent",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {}
        )

        const [res] = await Promise.all([
            battle
        ])

        if (res["battleground"] !== undefined) {
            setAntagonist(Number(res["battleground"]["antagonist_xp_gain"]))
            setProtagonist(Number(res["battleground"]["protagonist_xp_gain"]))
            setProtagName(res["battleground"]["protagonist_username"])
            setAntagName(res["battleground"]["antagonist_username"])
            setProtagPic(config.rootPath + "/static/user/pfp/" + res["battleground"]["protagonist_id"])
            setAntagPic(config.rootPath + "/static/user/pfp/" + res["battleground"]["antagonist_id"])
            setPopupOpen(false)
            setLoading(!loading)
            setWin(false)
            setLost(false)
            setCountdownTime(Math.floor(new Date(res["battleground"]["end_time"]).getTime() / 1000))
            setEndTime(res["battleground"]["end_time"])
            setProAvg(res["battleground"]["pro_avg"])
            setAntAvg(res["battleground"]["ant_avg"])
            setDailyProtagXp(res["battleground"]["daily_protagonist_xp_gain"])
            setDailyAntagXp(res["battleground"]["daily_antagonist_xp_gain"])
            setAntagonistId(res["battleground"]["antagonist_id"])
            setProtagonistId(res["battleground"]["protagonist_id"])
            setProTowersTaken(res["battleground"]["protagonist_towers_taken"])
            setAntTowersTaken(res["battleground"]["antagonist_towers_taken"])
            setMatchId(res["battleground"]["match_id"])
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

    const cloud = {
        loop: true,
        autoplay: true,
        animationData: clouds,
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
        loop: true,
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


    const situation = {
        loop: true,
        autoplay: true,
        animationData: map,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet'
        }
    };

    const gray = {
        loop: true,
        autoplay: true,
        animationData: graycastle,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet'
        }
    };

    const blueWinOptions = {
        loop: true,
        autoplay: true,
        animationData: blueWinAnimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    };

    const redWinOptions = {
        loop: true,
        autoplay: true,
        animationData: redWinAnimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    };

    const blueCelebration = {
        loop: true,
        autoplay: true,
        animationData: celebrate,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    }

    const redCelebration = {
        loop: true,
        autoplay: true,
        animationData: redCelebrate,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    }

    const blueDefeat = {
        loop: true,
        autoplay: true,
        animationData: bluedefeat,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    }

    const redDefeat = {
        loop: true,
        autoplay: true,
        animationData: reddefeat,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    }

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


    const estLeader = (antagonist: number, protagonist: number) => {
        if (antagonist > protagonist) {
            setLeader("antagonist")
            if (difference >= 1000){
                if (callingId === antagonistId){
                    setWin(true)
                    setWinPopup(true)
                    setVictor("antagonist")
                    declareVictor(antagonistId, matchId)
                } else {
                    setLost(true)
                    setLostPopup(true)
                    setVictor("antagonist")
                    declareVictor(antagonistId, matchId)
                }
            }
            if (difference >= 501 && difference < 1000) {
                let loc = Math.round(100 - (((difference - 500) / 500) * 100))
                if (loc === 0) {
                    loc = loc + 1
                } else if (loc === 100) {
                    loc = loc - 1
                }
                setSegA(loc)
                setSegB(0)
                setSegC(0)

                setFortACondition("redFort")
                setFortBCondition("redFort")
                setFortCCondition("redFort")

                setRedToGo(1000 - difference)
                setBlueToGo(difference)
                setRedAttack("Win")
                setBlueAttack("Re-claim Left Tower")
            }
            if (difference >= 251 && difference <= 500) {
                let loc = Math.round(100 - (((difference - 250 )/ 250) * 100))
                if (loc === 0) {
                    loc = loc+1
                } else if (loc === 100) {
                    loc = loc-1
                }
                setSegA(100)
                setSegB(loc)
                setSegC(0)

                setFortACondition("blueDefeatFort")
                setFortBCondition("redFort")
                setFortCCondition("redFort")

                setRedToGo(500 - difference)
                setBlueToGo(difference)
                setRedAttack("Take Left Tower")
                setBlueAttack("Take Middle Tower")
            }
            if (difference >= 1 && difference <= 250) {
                let loc = Math.round(100 -(difference / 250) * 100)
                if (loc === 0) {
                    loc = loc+1
                } else if (loc === 100) {
                    loc = loc-1
                }
                setSegA(100)
                setSegB(100)
                setSegC(loc)

                setFortACondition("blueBroken")
                setFortBCondition("redFort")
                setFortCCondition("redFort")

                setRedToGo(500 - difference)
                setBlueToGo(difference)
                setRedAttack("Take Left Tower")
                setBlueAttack("Take Middle Tower")
            }
            if (difference === 0) {
                setSegA(100);
                setSegB(100);
                setSegC(100);

                setSegD(0);
                setSegE(0);
                setSegF(0);
            }
            return "antagonist"
        } else if (protagonist > antagonist) {
            setLeader("protagonist")
            if (difference >= 1000){
                if (callingId === protagonistId){
                    setWin(true)
                    setWinPopup(true)
                    setVictor("protagonist")
                    declareVictor(protagonistId, matchId)
                } else {
                    setLost(true)
                    setLostPopup(true)
                    setVictor("protagonist")
                    declareVictor(protagonistId, matchId)
                }
            }
            if (difference >= 501 && difference < 1000) {
                let loc = Math.round(((difference - 500) / 500) * 100)
                if (loc === 0) {
                    loc = loc+1
                } else if (loc === 100) {
                    loc = loc-1
                }
                setSegA(100)
                setSegB(100)
                setSegC(100)

                setSegD(100)
                setSegE(100)
                setSegF(loc)

                setFortACondition("blueFort")
                setFortBCondition("blueFort")
                setFortCCondition("blueFort")

                setBlueToGo(1000 - difference)
                setRedToGo(difference - 500)
                setBlueAttack("Win")
                setRedAttack("Re-claim Right Tower")
            }
            if (difference >= 251 && difference <= 500) {
                let loc = Math.round(((difference - 250 )/ 250) * 100)
                if (loc === 0) {
                    loc = loc+1
                } else if (loc === 100) {
                    loc = loc-1
                }
                setSegA(100)
                setSegB(100)
                setSegC(100)

                setSegD(100)
                setSegE(loc)
                setSegF(0)

                setFortACondition("blueFort")
                setFortBCondition("blueFort")
                setFortCCondition("redDefeatFort")

                setBlueToGo(500 - difference)
                setRedToGo(difference)
                setBlueAttack("Take Right Tower")
                setRedAttack("Take Middle Tower")
            }
            if (difference >= 1 && difference <= 250) {
                let loc = Math.round(((difference / 250)) * 100)
                if (loc === 0) {
                    loc = loc+1
                } else if (loc === 100) {
                    loc = loc-1
                }
                setSegA(100)
                setSegB(100)
                setSegC(100)

                setSegD(loc)
                setSegE(0)
                setSegF(0)

                setFortACondition("blueFort")
                setFortBCondition("blueFort")
                setFortCCondition("redBroken")

                setBlueToGo(500 - difference)
                setRedToGo(difference)
                setBlueAttack("Take Right Tower")
                setRedAttack("Take Middle Tower")
            }
            if (difference === 0) {
                setSegA(100);
                setSegB(100);
                setSegC(100);

                setSegD(0);
                setSegE(0);
                setSegF(0);
            }
            setColor('#193c70')
            return "protagonist"
        } else {
            setLeader("tied")
            return "tied"
        }
        return "none"
    }


    const getPoint = () => {
        const element = document.getElementById("nemesis");
        if (element) {
            const rect = element.getBoundingClientRect();
            setxPos(rect.left);
            setyPos(rect.top);
        }

        const blueCastle = document.getElementById("blue-castle");
        if (blueCastle) {
            const rect = blueCastle.getBoundingClientRect();
            setxBlue(rect.left);
            setyBlue(rect.top);
        }

        const redCastle = document.getElementById("red-castle");
        if (redCastle) {
            const rect = redCastle.getBoundingClientRect();
            setxRed(rect.left);
            setyRed(rect.top);
        }
    }

    const getPointB = () => {
        const element = document.getElementById("nemesis");
        if (element) {
            const rect = element.getBoundingClientRect();
            const x = window.innerWidth - rect.left;
            const y = window.innerHeight - rect.bottom;
            setxPosRed(x);
            setyPosRed(y);
        }

        const castle = document.getElementById("blue-castle");
        if (castle) {
            const rect = castle.getBoundingClientRect();
            setxBlue(rect.left);
            setyBlue(rect.top);
        }

        const redCastle = document.getElementById("red-castle");
        if (redCastle) {
            const rect = redCastle.getBoundingClientRect();
            setxRed(rect.left);
            setyRed(rect.top);
        }
    }

    React.useEffect(() => {
        if (!firstBattle) {
            getBattle()
        }
        async function fetchData() {
            await estLeader(antagonist, protagonist);
            await getActive();
            getPoint();
            getPointB();
        }
        fetchData().then( () => {
            setRun(false)
            }
        );
    }, [loading, antagonist, protagonist, run]);




    let circle = () => {
        if (leader === "antagonist") {
            let point = `calc(${(xPos * 2)}px)`;
            return (
                <Box
                    sx={{
                        display: "inline-block",
                        borderRadius: "50%",
                        width: point,
                        height: point,
                        backgroundColor: "#193c70",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        zIndex: -1,
                        boxShadow: "0px 6px 18px 0px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                        transform: "translate(-50%, -25%)"
                    }}
                />

            )
        } else if (leader === "protagonist") {
            let point = `calc(${(xPosRed * 2) + 75}px)`;
            return (
                <Box
                    sx={{
                        display: "inline-block",
                        borderRadius: "50%",
                        width: point,
                        height: point,
                        backgroundColor: "#791010",
                        position: "fixed",
                        bottom: 0,
                        right: 0,
                        zIndex: 0,
                        boxShadow: "0px 6px 18px 0px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                        transform: "translate(50%, 45%)"
                }}
                />
            )
        }
    };

    const clashing = () => {
        if (leader === "antagonist") {
        return (
            <div style={{
                position: 'fixed',
                top: `${yPos - 40}px`,
                left: `${xPos - 35}px`,
                margin: '0 auto',
                height: '10%',
                zIndex: 999,
            }}>
                <Lottie
                    isClickToPauseDisabled={true}
                    options={swords}
                    width={75}
                    height={75}/>
            </div>
        )
    } else if (leader === "protagonist") {
            return (
                <div style={{
                    position: 'fixed',
                    bottom: `calc(${yPosRed}px - 5vh)`,
                    right: `calc(${xPosRed}px - 4vh)`,
                    margin: '0 auto',
                    height: '10%',
                    zIndex: 999,
                }}>
                    <Lottie
                        isClickToPauseDisabled={true}
                        options={swords}
                        width={75}
                        height={75}
                        speed={1.5}/>
                </div>
            )
        }
    }

    const protagonistBase = () => {
        return (
            <Grid item xs={2.5}>
                <Box display="flex" flexDirection="row" justifyContent="flex-start">
                    <div style={window.innerWidth <= 2300 ? {
                        position: 'fixed',
                        top: `${yBlue + 152}px`,
                        left: `${xBlue + 19}px`,
                        margin: '0 auto',
                        height:'10%',
                        zIndex: 7,
                    } : {
                        position: 'fixed',
                        top: `${yBlue + 300}px`,
                        left: `${xBlue + 115}px`,
                        margin: '0 auto',
                        height:'10%',
                        zIndex: 7,
                    }}>
                        <img
                            src={protagPic}
                            alt="User Icon"
                            style={{ aspectRatio: 33 / 35,
                                transform: "scale(.2)",
                                overflow: "visible",
                            }}
                        />
                    </div>
                    <Box style={{ display: "flex", justifyContent: "center", padding: "10px", zIndex: 6, flexDirection: "column" }}>
                        <Typography sx={{ fontStyle: 'italic' }} variant="h6" align="center">{"Protagonist"}</Typography>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={blueOptions}
                            width={windowWidth / 8 < 280 ? 280 : windowWidth / 8}
                            height={windowWidth / 8 < 280 ? 280 : windowWidth / 8} />
                        <Typography variant="h5" align="center">{protagName}</Typography>
                        <Typography variant="h6" align="center">{protagonist} XP</Typography>
                    </Box>
                </Box>
            </Grid>
        )
    }

    const antagonistBase = () => {
        console.log("window width: " + window.innerWidth)
        return (
            <Grid item xs={2.5} style={{ height: "100%", position: "relative" }}>
                <div style={window.innerWidth <= 2300 ? {
                    position: 'fixed',
                    bottom: `${yRed + 192}px`,
                    right: `${xRed + 18}px`,
                    margin: '0 auto',
                    height:'10%',
                    zIndex: 7,
                } : {
                        position: 'fixed',
                        bottom: `${yRed + 250}px`,
                        right: `${xRed + 120}px`,
                        margin: '0 auto',
                        height:'10%',
                        zIndex: 7,
                    }}>
                    <img
                        src={antagPic}
                        alt="User Icon"
                        style={{ aspectRatio: 33 / 35,
                            transform: "scale(.2)",
                            overflow: "visible" }}
                    />
                </div>
                <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="flex-end"
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                >
                    <Box style={{ display: "flex", justifyContent: "center", padding: "10px", zIndex: 6, flexDirection: "column" }}>
                        <Typography variant="h5" align="center">{antagName}</Typography>
                        <Typography variant="h6" align="center">{antagonist} XP</Typography>
                        <Lottie options={redOptions} width={windowWidth / 8 < 280 ? 280 : windowWidth / 8}
                                height={windowWidth / 8 < 280 ? 280 : windowWidth / 8} isClickToPauseDisabled={true} />
                        <Typography sx={{ fontStyle: 'italic' }} variant="h6" align="center">{"Antagonist"}</Typography>
                    </Box>
                </Box>
            </Grid>
        )
    }

    const xpNeededRed = () => {
        return (
            <Grid container justifyContent={"left"} sx={{
                position: 'fixed',
                top: `6%`,
                right: `0%`,
                zIndex: 7,
                width: "40vw",
                height:"8vh",
                borderColor: "rgba(255, 255, 255, 1)",
                borderWidth: ".25em",
                borderTopLeftRadius: 2,
                borderBottomRightRadius: 2,
                opacity: 1,
                color: "white",
                backgroundColor:"rgba(40, 39, 51, 0.4)",
                backdropFilter: (isChrome) ? "blur(15px)" : undefined,
                clipPath: "polygon(100% 10%, 100% 50%, 100% 90%, 3% 90%, 0 50%, 3% 10%)"
            }}>
                <div style={{height: "100%", display: "flex", alignItems: "center"}}>
                    <Lottie
                        isClickToPauseDisabled={true}
                        options={redArrow}
                        width={100}
                        height={100}
                        style={{transform: "rotate(180deg)",  margin: "0px"}}/>
                    <Typography variant='h3' sx={{fontSize: 'calc(1vw + 1vh + 10px)'}} align="center">{redToGo + " XP to " + redAttack}</Typography>
                </div>
            </Grid>
        )
    }

    const xpNeededBlue = () => {
        return (
            <Grid container justifyContent={"right"} sx={{
                position: 'fixed',
                left: `0%`,
                bottom:"-1%",
                zIndex: 7,
                width: "40vw",
                height:"8vh",
                borderColor: "rgba(255, 255, 255, 1)",
                opacity: 1,
                color: "white",
                backgroundColor:"rgba(40, 39, 51, 0.4)",
                backdropFilter: (isChrome) ? "blur(15px)" : undefined,
                clipPath: "polygon(97% 10%, 100% 50%, 97% 90%, 0 90%, 0 50%, 0 10%)",
            }}>
                <div style={{height: "100%", display: "flex", alignItems: "center"}}>
                    <Typography variant='h3' sx={{fontSize: 'calc(1vw + 1vh + 10px)'}} align="center">{blueToGo + " XP to " + blueAttack}</Typography>
                    <Lottie
                        isClickToPauseDisabled={true}
                        options={blueArrow}
                        width={100}
                        height={100}
                        style={{margin: "0px"}}
                    />
                </div>
            </Grid>
        )
    }

    const atmosphere = () => {
        return (
            <>
                <div style={window.outerWidth >= 3840 ? {
                    position: 'fixed',
                    top: '250px',
                    left: '2800px',
                    margin: '0 auto',
                    height: '10%',
                } : {
                    position: 'fixed',
                    top: '100px',
                    left: '1350px',
                    margin: '0 auto',
                    height: '10%',
                }}>
                    <Box style={{display: "flex", justifyContent: "center", paddingLeft: "25px", paddingTop: "15px"}}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={cloud}
                            width={window.outerWidth >= 3840 ? 500 : 280}
                            height={window.outerWidth >= 3840 ? 500 : 280}
                        />
                    </Box>
                </div>
                <div style={window.outerWidth >= 3840 ? {
                    position: 'fixed',
                    top: '250px',
                    left: '2650px',
                    margin: '0 auto',
                    height: '10%',
                } : {
                    position: 'fixed',
                    top: '100px',
                    left: '1200px',
                    margin: '0 auto',
                    height: '10%',
                }}>
                    <Box style={{display: "flex", justifyContent: "center", paddingLeft: "25px", paddingTop: "15px"}}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={cloud}
                            width={window.outerWidth >= 3840 ? 250 : 190}
                            height={window.outerWidth >= 3840 ? 250 : 190}/>
                    </Box>
                </div>
                <div style={window.outerWidth >= 3840 ? {
                    position: 'fixed',
                    top: '1400px',
                    left: '650px',
                    margin: '0 auto',
                    height: '10%',
                } : {
                    position: 'fixed',
                    top: '600px',
                    left: '120px',
                    margin: '0 auto',
                    height: '10%',
                }}>
                    <Box style={{display: "flex", justifyContent: "center", paddingLeft: "25px", paddingTop: "15px"}}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={cloud}
                            width={window.outerWidth >= 3840 ? 240 : 190}
                            height={window.outerWidth >= 3840 ? 240 : 190}/>
                    </Box>
                </div>
                <div style={window.outerWidth >= 3840 ? {
                    position: 'fixed',
                    top: '1400px',
                    left: '750px',
                    margin: '0 auto',
                    height: '10%',
                } : {
                    position: 'fixed',
                    top: '600px',
                    left: '130px',
                    margin: '0 auto',
                    height: '10%',
                }}>
                    <Box style={{display: "flex", justifyContent: "center", paddingLeft: "25px", paddingTop: "15px"}}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={cloud}
                            width={window.outerWidth >= 3840 ? 500 : 280}
                            height={window.outerWidth >= 3840 ? 500 : 280}/>
                    </Box>
                </div>
            </>
        )
    }

    const battleground = () => {
        return (
            <>
                <Grid item xs={12} style={{ height: '26vh', position: "relative",}} >
                    <Box style={window.outerWidth >= 2560 && window.outerWidth < 3840 ? { position: "fixed", zIndex: 0, right: windowWidth / 1.38, bottom: windowHeight / 1.5} : window.outerWidth >= 3840 ? {position: "fixed", zIndex: 0, right: windowWidth / 1.44, bottom: windowHeight / 1.4} : { position: "fixed", zIndex: 0, right: windowWidth / 1.37, bottom: windowHeight / 1.6}}>
                        <CustomBar
                            progress={segA}
                            radius={newRadius}
                            cut={290}
                            strokeColor={'#3B7ACE'}
                            trackStrokeColor={'#CE3B3B'}
                            strokeWidth={5}
                            trackStrokeWidth={5}
                            rotate={window.outerWidth >= 3840 ? 65 : 55}
                            counterClockwise={true}
                            mirror={true}
                            outlineColor={'#522b1c'}
                            pointerStrokeColor={'#902ae9'}
                            pointerRadius={1}
                        />
                    </Box>
                    <Box style={{ position: "absolute", bottom: -15, left: -35, zIndex: 6  }}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={fortAOptions}
                            width={windowWidth / 8}
                            height={windowWidth / 8} />
                    </Box>
                </Grid>
                <Grid item xs={12} style={{ height: '26vh', position: 'relative' }}>
                    <div style={{position: "relative"}}>
                        <div style={window.outerWidth >= 2560 && window.outerWidth < 3840 ? {position: "fixed", left: "16%", top: "25%", zIndex: 1} : window.outerWidth >= 3840 ? {position: "fixed", left: "13.86%", top: "23%", zIndex: 1} : {position: "fixed", left: "16%", top: "28%", zIndex: 1}}>
                            <CustomBar
                                progress={segB}
                                pointerRadius={1}
                                radius={newRadius}
                                cut={280}
                                strokeColor={'#3B7ACE'}
                                trackStrokeColor={'#CE3B3B'}
                                strokeWidth={5}
                                trackStrokeWidth={5}
                                rotate={window.outerWidth >= 3840 ? 270 : undefined}
                                outlineColor={'#522b1c'}
                                pointerStrokeColor={'#902ae9'}
                            />
                        </div>
                        <div style={window.outerWidth >= 2560 && window.outerWidth < 3840 ? {position: "fixed", left: "34.7%", top: "17%", zIndex: 0} : window.outerWidth >= 3840 ? {position: "fixed", left: "34.77%", top: "17%", zIndex: 0} : {position: "fixed", left: "32.8%", top: "20.1%", zIndex: 0}}>
                            <CustomBar
                                progress={segC}
                                radius={newRadius}
                                cut={246}
                                strokeColor={'#3B7ACE'}
                                trackStrokeColor={'#CE3B3B'}
                                strokeWidth={5}
                                trackStrokeWidth={5}
                                rotate={window.outerWidth >= 3840 ? 53 : 50}
                                counterClockwise={true}
                                mirror={true}
                                outlineColor={'#522b1c'}
                                pointerStrokeColor={'#902ae9'}
                                pointerRadius={1}
                            />
                        </div>
                    </div>
                    <Lottie
                        isClickToPauseDisabled={true}
                        options={fortBOptions}
                        width={windowWidth / 8}
                        height={windowWidth / 8}
                        style={window.outerWidth >= 3840 ? {
                                position: 'absolute',
                                left: '50%',
                                transform: 'translate(-10%, 10%)',
                                bottom: '0',
                                zIndex: 6}
                            : {
                                position: 'absolute',
                                left: '50%',
                                transform: 'translate(-50%, 0)',
                                bottom: '0',
                                zIndex: 6
                            }}
                    />
                </Grid>
                <Grid item xs={12} style={{ height: '26vh', position: "relative" }}>

                    <div style={{position: "relative"}}>

                        <div style={window.outerWidth >= 2560 && window.outerWidth < 3840 ? {position: "fixed", left: windowWidth / 2.5, top: windowHeight / 1.9, zIndex: 1} : window.outerWidth >= 3840 ? {position: "fixed", left: windowWidth / 2.4, top: windowHeight / 2, zIndex: 1} : {position: "fixed", left: windowWidth / 2.4, top: windowHeight / 2, zIndex: 1}}>
                            <CustomBar
                                progress={segD}
                                pointerRadius={1}
                                radius={newRadius}
                                cut={280}
                                strokeColor={'#3B7ACE'}
                                trackStrokeColor={'#CE3B3B'}
                                strokeWidth={5}
                                trackStrokeWidth={5}
                                outlineColor={'#522b1c'}
                                rotate={window.outerWidth >= 3840 ? 290 : undefined}
                                pointerStrokeColor={'#902ae9'}
                            />
                        </div>
                        <div style={window.outerWidth >= 2560 && window.outerWidth < 3840 ? {position: "fixed", left: windowWidth / 1.71, top: windowHeight / 2.3, zIndex: 0} : window.outerWidth >= 3840 ? {position: "fixed", left: windowWidth / 1.6, top: windowHeight / 1.8, zIndex: 0} : {position: "fixed", left: (windowWidth - 6) / 1.7, top: windowHeight / 2.3, zIndex: 0}}>
                            <CustomBar
                                progress={segE}
                                radius={newRadius}
                                cut={244}
                                strokeColor={'#3B7ACE'}
                                trackStrokeColor={'#CE3B3B'}
                                strokeWidth={5}
                                trackStrokeWidth={5}
                                rotate={window.outerWidth >= 2560 && window.outerWidth < 3840 ? 48 : window.outerWidth >= 3840 ? 65 : 53}
                                counterClockwise={true}
                                mirror={true}
                                outlineColor={'#522b1c'}
                                pointerStrokeColor={'#902ae9'}
                                pointerRadius={1}
                            />
                        </div>
                    </div>
                    <Box style={window.outerWidth >= 2560 && window.outerWidth < 3840 ? {position: "absolute", bottom: 0, right: -80, zIndex: 6} : window.outerWidth >= 3840 ? {position: "absolute", bottom: "-68%", right: -150, zIndex: 6 } :{ position: "absolute", bottom: 15, right: -30, zIndex: 6 }}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={fortCOptions}
                            width={windowWidth / 8}
                            height={windowWidth / 8} />
                    </Box>
                    <Box style={window.outerWidth >= 3840 ? {position: "fixed", zIndex: 0 , top: windowHeight / 1.25, left: windowWidth / 1.3} :{ position: "fixed", zIndex: 0 , top: windowHeight / 1.4, left: windowWidth / 1.45}}>
                        <CustomBar
                            progress={segF}
                            radius={newRadius}
                            cut={280}
                            strokeColor={'#3B7ACE'}
                            trackStrokeColor={'#CE3B3B'}
                            strokeWidth={5}
                            trackStrokeWidth={5}
                            rotate={window.outerWidth >= 3840 ? 200 : 255}
                            outlineColor={'#522b1c'}
                            pointerStrokeColor={'#902ae9'}
                            pointerRadius={1}
                        />
                    </Box>
                </Grid>
            </>
        )
    }

    const [typeTab, setTypeTab] = React.useState("Current Situation")
    const tabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTypeTab(newValue);
    };

    let minorValues = ["Current Situation", "War History", "Active Rivalries", "Past Wars", "Pending Requests", "Declare"]

    //@ts-ignore
    const renderer = ({days, hours, minutes, seconds }) => {
            return (
                <Typography variant='h4' component='div' style={{ width: '100%', textAlign: 'center', zIndex: 2, paddingTop: 10 }}>
                    {days}d : {hours}h : {minutes}m : {seconds}s remaining
                </Typography>
            );
    }

    const currentSituation = () => {
        return (
            <Box style={{ justifyContent: "center", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "visible", minHeight: "25vw", minWidth: "25vw" }}>
                <Lottie
                    isClickToPauseDisabled={true}
                    options={situation}
                    width={400}
                    height={400}
                    speed={1.5}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%) scaleX(-1)",
                        zIndex: 1,
                        opacity: 0.05,
                        overflow: "visible"
                    }}
                />
                <TableContainer component={Paper} style={{opacity: 1}}>
                    <Table sx={{ minWidth: 650 }} aria-label="caption table">
                        <TableHead style={{ backgroundColor: "#2b8761" }}>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell align="right">Alignment</TableCell>
                                <TableCell align="right">Current XP</TableCell>
                                <TableCell align="right">Avg. XP Gain / Day</TableCell>
                                <TableCell align="right">Towers Taken</TableCell>
                                <TableCell align="right">End-Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {protagName}
                                </TableCell>
                                <TableCell align="right">{"Protagonist"}</TableCell>
                                <TableCell align="right">{protagonist}</TableCell>
                                <TableCell align="right">{proAvg}</TableCell>
                                <TableCell align="right">{proTowersTaken}</TableCell>
                                <TableCell align="right">
                                    {new Date(endTime).toLocaleDateString("en-US",
                                        {
                                            month: "2-digit",
                                            day: "2-digit",
                                            year: "numeric"})}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {antagName}
                                </TableCell>
                                <TableCell align="right">{"Antagonist"}</TableCell>
                                <TableCell align="right">{antagonist}</TableCell>
                                <TableCell align="right">{antAvg}</TableCell>
                                <TableCell align="right">{antTowersTaken}</TableCell>
                                <TableCell align="right">
                                    {new Date(endTime).toLocaleDateString("en-US",
                                        {
                                            month: "2-digit",
                                            day: "2-digit",
                                            year: "numeric"})}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <Countdown date={Date.now() + countdownTime} renderer={renderer} />
            </Box>
        )
    }

    const [countdownTime, setCountdownTime] = React.useState(0)

    const handleBattleground = async (antagId: string, protagId: string, matchID: string) => {
        setSegA(100);
        setSegB(100);
        setSegC(100);

        setSegD(0);
        setSegE(0);
        setSegF(0);
        let battle = call(
            "/api/nemesis/battleground",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                match_id:matchID,
                protagonist_id: protagId,
                antagonist_id: antagId,
            }
        )

        const [res] = await Promise.all([
            battle
        ])

        setAntagonist(Number(res["battleground"]["antagonist_xp_gain"]))
        setProtagonist(Number(res["battleground"]["protagonist_xp_gain"]))
        // setAntagonist(res["battleground"]["daily_antagonist_xp_gain"][0]["exp"])
        // setProtagonist(res["battleground"]["daily_protagonist_xp_gain"][0]["exp"])
        setProtagName(res["battleground"]["protagonist_username"])
        setAntagName(res["battleground"]["antagonist_username"])
        setProtagPic(config.rootPath + "/static/user/pfp/" + res["battleground"]["protagonist_id"])
        setAntagPic(config.rootPath + "/static/user/pfp/" + res["battleground"]["antagonist_id"])
        setPopupOpen(false)
        setLoading(!loading)
        setWin(false)
        setLost(false)
        setCountdownTime(Math.floor(new Date(res["battleground"]["end_time"]).getTime() / 1000))
        setEndTime(res["battleground"]["end_time"])
        setProAvg(res["battleground"]["pro_avg"])
        setAntAvg(res["battleground"]["ant_avg"])
        setDailyProtagXp(res["battleground"]["daily_protagonist_xp_gain"])
        setDailyAntagXp(res["battleground"]["daily_antagonist_xp_gain"])
        setAntagonistId(res["battleground"]["antagonist_id"])
        setProtagonistId(res["battleground"]["protagonist_id"])
        setProTowersTaken(res["battleground"]["protagonist_towers_taken"])
        setAntTowersTaken(res["battleground"]["antagonist_towers_taken"])
        setMatchId(res["battleground"]["match_id"])
    }

    const rivalries = () => {
        return (
            <Box style={{ justifyContent: "center", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", position: "relative", overflow: "visible", minHeight: "25vw", minWidth: "25vw" }}>
                <Lottie
                    isClickToPauseDisabled={true}
                    options={swords}
                    width={400}
                    height={400}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                        opacity: 0.05,
                        overflow: "visible"
                    }}
                />
                <TableContainer component={Paper} style={{opacity: 1}}>
                    <Table sx={{ minWidth: 650 }} aria-label="caption table">
                        <TableHead style={{ backgroundColor: "#2b8761" }}>
                            <TableRow>
                                <TableCell>Matchup</TableCell>
                                <TableCell align="right">Alignment</TableCell>
                                <TableCell align="right">End-Time</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {active.map((row) => (
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        {/*@ts-ignore*/}
                                        {row["protagonist_name"].toLowerCase() === username.toLowerCase()
                                        ?
                                        "You vs. " + row["antagonist_name"]
                                        :
                                        row["protagonist_name"] + " vs. You"}
                                    </TableCell>
                                    <TableCell align="right">{row["protagonist_id"] === callingId ? "Protagonist" : "Antagonist"}</TableCell>
                                    <TableCell align="right">
                                        {new Date(row["end_time"]).toLocaleDateString("en-US",
                                            {
                                        month: "2-digit",
                                        day: "2-digit",
                                        year: "numeric"})}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button onClick={() => {
                                            handleBattleground(row["antagonist_id"], row["protagonist_id"], row["id"])
                                        }
                                        }>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

        )
    }

    const history = () => {
        const allRows = [...dailyProtagXp, ...dailyAntagXp];

        //@ts-ignore
        allRows.sort((a, b) => new Date(a.date) - new Date(b.date));

        return (
            <Box style={{ justifyContent: "center", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", position: "relative", overflow: "hidden", minHeight: "25vw", minWidth: "25vw" }}>
                <Lottie
                    isClickToPauseDisabled={true}
                    options={swords}
                    width={400}
                    height={400}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                        opacity: 0.15,
                        overflow: "visible"
                    }}
                />
                <TableContainer component={Paper} style={{opacity: 1, overflow: "hidden"}}>
                    <Table sx={{ minWidth: 650 }} aria-label="caption table">
                        <TableHead style={{ backgroundColor: "#2b8761" }}>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>XP Gained</TableCell>
                                <TableCell>Earned By</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allRows.map((row) => (
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                    {new Date(row["date"]).toLocaleDateString("en-US",
                                        {
                                            month: "2-digit",
                                            day: "2-digit",
                                            year: "numeric"})}
                                </TableCell>
                                    <TableCell component="th" scope="row">{row["exp"]}</TableCell>
                                    <TableCell component="th" scope="row">{
                                        row["alignment"] === "protagonist" ? protagName : antagName
                                    }</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        )
    }

    const pastWars = () => {
        return (
            <Box style={{ justifyContent: "center", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", position: "relative", overflow: "visible", minHeight: "25vw", minWidth: "25vw" }}>
                <Lottie
                    isClickToPauseDisabled={true}
                    options={swords}
                    width={400}
                    height={400}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                        opacity: 0.05,
                        overflow: "visible"
                    }}
                />
                <TableContainer component={Paper} style={{opacity: 1}}>
                    <Table sx={{ minWidth: 650 }} aria-label="caption table" className={"review"}>
                        <TableHead style={{ backgroundColor: "#2b8761" }}>
                            <TableRow>
                                <TableCell>Matchup</TableCell>
                                <TableCell align="right">Towers Taken</TableCell>
                                <TableCell align="right">Your XP Gained</TableCell>
                                <TableCell align="right">Enemy XP Gained</TableCell>
                                <TableCell align="right">Outcome</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pastWarStats.map((row) => (
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        {/*@ts-ignore*/}
                                        {row["protagonist_name"].toLowerCase() === username.toLowerCase()
                                        ?
                                        "You vs. " + row["antagonist_name"]
                                        :
                                        row["protagonist_name"] + " vs. You"}
                                    </TableCell>
                                    <TableCell align="right">{row["towers_taken_protag"]}</TableCell>
                                    <TableCell align="right">{row["protagonist_xp_gain"]}</TableCell>
                                    <TableCell align="right">{row["antagonist_xp_gain"]}</TableCell>
                                    {/*@ts-ignore*/}
                                    <TableCell align="right" style={{ color: row["victor"].toLowerCase() === username.toLowerCase() ? "green" : "red"}}>
                                        {/*@ts-ignore*/}
                                        {row["victor"].toLowerCase() === username.toLowerCase() ? "WON" : "LOST"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

        )
    }

    const tabDetermination = () => {
        if (typeTab === "Current Situation") {
            return currentSituation();
        } else if (typeTab === "Active Rivalries") {
            return rivalries();
        } else if (typeTab === "Past Wars") {
            return pastWars();
        } else if (typeTab === "War History") {
            return history();
        } else if (typeTab === "Pending Requests") {
            return requests();
        } else if (typeTab === "Declare") {
            return declareNemesis();
        }
    }

    const statsPopup = () => {
        return (
            <>
                <DialogTitle style={{ textAlign: 'center' }}>Situation Room</DialogTitle>
                <DialogContent>
                    <Typography sx={{display: "flex", width: "100%", justifyContent: "center"}}>
                        <Tabs
                            orientation="horizontal"
                            value={typeTab}
                            onChange={tabChange}
                            aria-label="Vertical tabs"
                            style={{zIndex: 999}}
                        >
                            {minorValues.map((minorValue) => {
                                return <Tab label={minorValue} value={minorValue} sx={{color: "text.primary"}}/>;
                            })}
                        </Tabs>
                    </Typography>
                    {tabDetermination()}
                </DialogContent>
            </>
        )
    }

    const [startTab, setStartTab] = React.useState("Declare Nemesis");
    const changeStartTab = (event: React.SyntheticEvent, newValue: string) => {

        setStartTab(newValue);
    };

    const ChangeTabTutorial = (newValue: string) => {

        setStartTab(newValue);
    }

    let startTabValues = ["Declare Nemesis", "Pending Requests", "Past Wars"]

    const startTabDetermination = () => {
        if (startTab === "Declare Nemesis") {
            return declareNemesis();
        } else if (startTab === "Pending Requests") {
            return requests();
        } else if (startTab === "Past Wars") {
            return pastWars();
        }
    }

    const handleChange = (event: SelectChangeEvent) => {
        setDeclareName(event.target.value as string);
    };

    const [declareStep, setDeclareStep] = React.useState(0);
    const [selectedUser, setSelectedUser] = React.useState("null");

    const selectUser = () => {
        // STEP 0
        return (
            <>
                <Typography color='error' variant='h5' component='div' style={{ width: '100%', textAlign: 'center'  }} className={"start"}>
                    {"Declare a Nemesis!"}
                </Typography>
                <Box style={{zIndex: 6, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "row"}}>
                    <div style={{padding: "10px"}}>
                        <Button
                            size="large"
                            variant="contained"
                            color="primary"
                            style={{width: "250px"}}
                            onClick={() => {
                                setDeclareStep(1);
                            }}
                        >
                            Friends
                        </Button>
                    </div>
                    <div style={{padding: "10px"}}>
                        <Button
                            size="large"
                            variant="contained"
                            color="primary"
                            style={{width: "250px"}}
                            onClick={() => {
                                setDeclareStep(2);
                            }}
                        >
                            All Users
                        </Button>
                    </div>
                </Box>
            </>
        )
    }

    const friendDeclare = () => {
        // STEP 1
        return (
            <>
                <Typography color='error' variant='h5' component='div' style={{ width: '100%', textAlign: 'center', zIndex: 2  }} className={"start"}>
                    {"Select a Friend!"}
                </Typography>
            <Box style={{minHeight: "30vh", minWidth: "20vw", maxHeight: "30vh", overflowY: "scroll"}}>
                <Box style={{overflow: "hidden"}}>
                    {friendsList.map((row) => (
                        <div style={{padding: "2px"}}>
                            <ButtonBase sx={{display: 'flex', width: "100%", height: "100%"}}
                                        onClick={() => {
                                            setDeclareName(row["friend"])
                                            setSelectedUser(row["friend_name"])
                                        }}>
                                <Card sx={{
                                    display: 'flex',
                                    width: "100%",
                                    height: "100%",
                                }}>
                                    <CardContent sx={{display: 'flex'}}>
                                        <div style={{
                                            display: 'flex',
                                            width: "100%",
                                            justifyContent: "space-between"
                                        }}>
                                            <UserIcon userTier={"n/a"} userThumb={config.rootPath + "/static/user/pfp/" + row["friend"]} userId={row["friend"]} backgroundName={null} backgroundPalette={null} backgroundRender={null}/>
                                            <Typography gutterBottom variant="h4" component="div" sx={{
                                                maxWidth: "100%",
                                                fontSize: "20px",

                                            }}>
                                                {row["friend_name"]}
                                            </Typography>
                                        </div>
                                    </CardContent>
                                </Card>
                            </ButtonBase>
                        </div>
                    ))}
                </Box>
            </Box>
                <Typography>{selectedUser === "null" ? "" : selectedUser}</Typography>
                <div style={{display: "flex", width: "100%", justifyContent: "center"}}>
                    <Button onClick={() => {
                        setDeclareStep(0)
                        setDeclareName("")
                        setSelectedUser("")
                    }}>Back</Button>
                    <Button onClick={() => {
                        setDeclareStep(3)
                    }}>Next</Button>
                </div>
            </>
        )
    }

    const allUserDeclare = () => {
        // STEP 2
        return (
            <>
                <Typography color='error' variant='h5' component='div' style={{ width: '100%', textAlign: 'center', zIndex: 2  }} className={"start"}>
                    {"Select Any User!"}
                </Typography>
                <Box style={{zIndex: 6, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "row"}}>
                    <Autocomplete
                        style={{width: "60%", paddingRight: "10px"}}
                        value={allUserValue}
                        onChange={(event, newAllUserValue) => {
                            setAllUserValue(newAllUserValue);
                            // @ts-ignore
                            setDeclareName(newAllUserValue["_id"])
                            // @ts-ignore
                            setSelectedUser(newAllUserValue["username"])
                        }}
                        options={allUserList}
                        getOptionLabel={(option) => option["username"]}
                        renderInput={(params) => (
                            <TextField {...params} label="Search All Users" variant="outlined" style={{height: "10%"}} />
                        )}
                    />
                </Box>
                <Typography>{selectedUser === "null" ? "" : selectedUser}</Typography>
                <div style={{display: "flex", width: "100%", justifyContent: "center"}}>
                    <Button onClick={() => {
                        setDeclareStep(0)
                        setDeclareName("")
                        setSelectedUser("")
                        setFriendValue(null)
                    }}>Back</Button>
                    <Button onClick={() => {
                        setDeclareStep(4)
                    }}>Next</Button>
                </div>
            </>
        )
    }

    const selectEndDate = () => {
        // STEP 3
        return(
            <>
                <Typography color='error' variant='h5' component='div' style={{ width: '100%', textAlign: 'center', zIndex: 2  }} className={"start"}>
                    {"Select End Date and Declare!"}
                </Typography>
                <div style={{padding: "10px"}}>
                    <TextField
                        id="date"
                        label="End Date"
                        type="date"
                        size={`small`}
                        sx={{
                            width: "11vw",
                            paddingBottom: "1vw",
                            mt: "1vh",
                        }}
                        value={nemesisDate}
                        onChange={(e) => {
                            setNemesisDate(e.target.value)
                            let date = new Date();
                            date.setFullYear(
                                parseInt(e.target.value.split('-')[0]),
                                parseInt(e.target.value.split('-')[1]) - 1,
                                parseInt(e.target.value.split('-')[2])
                            );
                            setRequestDate(date);
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                <div style={{display: "flex", width: "100%", justifyContent: "center"}}>
                    <Button onClick={() => {
                        setDeclareStep(1)
                        setNemesisDate("")
                    }}>Back</Button>
                </div>
                <div style={{padding: "10px"}}>
                    <Button
                        size="large"
                        variant="contained"
                        color="primary"
                        style={{width: "250px"}}
                        onClick={() =>
                        {
                            sendDeclare()
                        }
                        }
                    >
                        Declare
                    </Button>
                </div>
            </>
        )
    }

    const selectEndDate2 = () => {
        // STEP 4
        return(
            <>
                <div style={{padding: "10px"}}>
                    <TextField
                        id="date"
                        label="End Date"
                        type="date"
                        size={`small`}
                        sx={{
                            width: "11vw",
                            paddingBottom: "1vw",
                            mt: "1vh",
                        }}
                        value={nemesisDate}
                        onChange={(e) => {
                            setNemesisDate(e.target.value)
                            let date = new Date();
                            date.setFullYear(
                                parseInt(e.target.value.split('-')[0]),
                                parseInt(e.target.value.split('-')[1]) - 1,
                                parseInt(e.target.value.split('-')[2])
                            );
                            setRequestDate(date);
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                <div style={{display: "flex", width: "100%", justifyContent: "center"}}>
                    <Button onClick={() => {
                        setDeclareStep(2)
                        setNemesisDate("")
                    }}>Back</Button>
                </div>
                <div style={{padding: "10px"}}>
                    <Button
                        size="large"
                        variant="contained"
                        color="primary"
                        style={{width: "250px"}}
                        onClick={() =>
                        {
                            sendDeclare()
                        }
                        }
                    >
                        Declare
                    </Button>
                </div>
            </>
        )
    }

    const declareNemesis = () => {
        return (
            <Box style={{ justifyContent: "center", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", position: "relative", overflow: "visible", minHeight: "25vw", minWidth: "25vw", }}>
                {declareStep === 0
                ?
                    selectUser()
                : declareStep === 1
                ?
                friendDeclare()
                : declareStep === 2
                ?
                allUserDeclare()
                : declareStep === 3
                ?
                selectEndDate()
                :
                selectEndDate2()}
            </Box>
        )
    }

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { action, index, status, type } = data;
        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status))
        {
            // Need to set our running state to false, so we can restart if we click start again.
            setRun(false)
            setStepIndex(0)
            // navigate("/streak")
        } else if (action === "close" && window.sessionStorage.getItem("help") === "true") {
            setRun(false)
            setStepIndex(0)
            let authState = Object.assign({}, initialAuthStateUpdate)
            // authState.tutorial = false
            // @ts-ignore
            dispatch(updateAuthState(authState))
            window.sessionStorage.setItem("help", "false")
        } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)) {
            const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
            const oldStepIndex = index - (action === ACTIONS.PREV? 1 : -1);


            if (index === 0){
                setRun(false)
                setStartTab("Pending Requests")
                setTimeout(() => {
                    setStepIndex(nextStepIndex);
                    setRun(true)
                }, 500);
            } else {
                if (action === "prev"){
                    setRun(false)
                    setStartTab("Declare Nemesis")
                    setTimeout(() => {
                        setStepIndex(oldStepIndex);
                        setRun(true)
                    }, 500);
                } else {
                    setStepIndex(nextStepIndex);
                }
            }
        }

        console.groupCollapsed(type);
        console.log(data);
        console.groupEnd();
    };

    const requests = () => {
        const handleDeleteRow = (id: number) => {
            setPending((prevRows) => prevRows.filter((row) => row["_id"] !== id));
        };
        return (
            <Box style={{ justifyContent: "center", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", position: "relative", overflow: "visible", minHeight: "25vw", minWidth: "25vw" }}>
                <Lottie
                    isClickToPauseDisabled={true}
                    options={gray}
                    width={400}
                    height={400}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                        opacity: 0.05,
                        overflow: "visible"
                    }}
                />
                <TableContainer component={Paper} style={{opacity: 1}} className={'check'}>
                    <Table sx={{ minWidth: 650 }} aria-label="caption table">
                        <TableHead style={{ backgroundColor: "#2b8761", zIndex: "6000000" }}>
                            <TableRow>
                                <TableCell>Matchup</TableCell>
                                <TableCell align="right">Alignment</TableCell>
                                <TableCell align="right">Request</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pending.map((row) => (
                                <TableRow >
                                    <TableCell component="th" scope="row">
                                        {/*@ts-ignore*/}
                                        {row["protagonist_name"].toLowerCase() === username.toLowerCase()
                                            ?
                                            "You vs. " + row["antagonist_name"]
                                            :
                                            row["protagonist_name"] + " vs. You"}
                                    </TableCell>
                                    <TableCell align="right">
                                        {/*@ts-ignore*/}
                                        {row["protagonist_name"].toLowerCase() === username.toLowerCase()
                                            ?
                                            "Protagonist"
                                            :
                                            "Antagonist"}
                                    </TableCell>
                                        <TableCell align="right">
                                            {/*@ts-ignore*/}
                                            {row["protagonist_name"].toLowerCase() === username.toLowerCase()
                                            ?
                                                <>
                                                    <Button variant="contained" color={"primary"}
                                                            onClick={() => {
                                                                setHasNemesis(true)
                                                                acceptNemesis(row["antagonist_id"])
                                                                handleDeleteRow(row["_id"])
                                                            }}>
                                                        Accept
                                                    </Button>
                                                    <Button variant="contained" color={"error"}
                                                            onClick={() => {
                                                                declineNemesis(row["antagonist_id"])
                                                                handleDeleteRow(row["_id"])
                                                            }}>
                                                        Decline
                                                    </Button>
                                                </>
                                            :
                                                <>
                                                    <Button variant="contained" disabled={true}>
                                                        Pending
                                                    </Button>
                                                </>}
                                        </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {pending.length === 0
                    ?
                    <Typography component={"div"}
                                sx={{display: "flex",
                                    justifyContent: "center",
                                    paddingTop: "2%",
                                    paddingBottom: "2%",
                                    flexDirection: "row",
                                    opacity: "0.5"
                                }}>
                        No pending requests
                    </Typography>
                    :
                    <></>
                }
            </Box>
        )
    }

    const welcomePopup = () => {
        return (
            <>
                <DialogContent>
                    <Typography sx={{display: "flex", width: "100%", justifyContent: "center"}}>
                        <Tabs
                            orientation="horizontal"
                            value={startTab}
                            onChange={changeStartTab}
                            aria-label="Vertical tabs"
                            style={{zIndex: 999}}
                        >
                            {startTabValues.map((tabValue) => {
                                return <Tab label={tabValue} value={tabValue} sx={{color: "text.primary"}}/>;
                            })}
                        </Tabs>
                    </Typography>
                    {startTabDetermination()}
                </DialogContent>
                {!hasNemesis
                    ?
                    <Button onClick={() => {
                        navigate("/home")
                    }} color="primary">Return Home</Button>
                    :
                    <></>
                }
            </>
        )
    }

    const winScreen = () => {
        return (
            <>
                <Dialog
                    PaperProps={{ style: { minHeight: "50vh", minWidth: "50vw" } }}
                    open={winPopup}
                    onClose={() => setWinPopup(false)}>
                    <Box style={{ justifyContent: "center", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", position: "relative", overflow: "visible", minHeight: "75vh", minWidth: "50vw" }}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={victor === "protagonist" ? blueCelebration : redCelebration}
                            width={600}
                            height={600}
                            // segments={[120,240]}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                zIndex: 1,
                                overflow: "visible",
                                opacity: 0.5,

                            }}
                        />
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={victor === "protagonist" ? blueWinOptions : redWinOptions}
                            width={500}
                            height={500}
                            segments={[120,240]}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                zIndex: 2,
                                opacity: 0.5,
                                overflow: "visible"
                            }}
                        />
                        <Typography color='white' variant='h1' component='div' style={{ width: '100%', textAlign: 'center', zIndex: 3  }}>
                            {"YOU WON!"}
                        </Typography>
                    </Box>
                    <DialogActions>
                        <Button onClick={() => {
                            setPopupOpen(true)
                            setWinPopup(false)
                        }} color="primary">Select Other Battles</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    PaperProps={{ style: { minHeight: "50vh", minWidth: "50vw" } }}
                    open={popupOpen}
                    onClose={() => {
                        setWinPopup(true)
                        setPopupOpen(false)
                    }}
                >
                    {statsPopup()}
                </Dialog>
                <Grid container>
                    <Grid item xs={6}>
                        <Typography variant="h5" align="center">
                            Protagonist
                        </Typography>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                            }}
                        >
                            <Lottie
                                isClickToPauseDisabled={true}
                                options={victor === "protagonist" ? blueWinOptions : blueDefeat}
                                width={400}
                                height={400}
                                segments={victor === "protagonist" ? [120,240] : [0,240]}
                            />
                        </div>
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                            <div style={{marginRight: "40px"}}>
                                <Typography variant="h5" align="center">
                                    XP Gained
                                </Typography>
                                <Typography variant="h6" align="center">
                                    {protagonist}
                                </Typography>
                            </div>
                            <div style={{marginRight: "40px"}}>
                                <Typography variant="h5" align="center">
                                    Towers Taken
                                </Typography>
                                <Typography variant="h6" align="center">
                                    8
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="h5" align="center">
                                    Avg. XP Gain / Day
                                </Typography>
                                <Typography variant="h6" align="center">
                                    {proAvg} per day
                                </Typography>
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h5" align="center">
                            Antagonist
                        </Typography>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                            }}
                        >
                            <Lottie
                                isClickToPauseDisabled={true}
                                options={victor === "antagonist" ? redWinOptions : redDefeat}
                                segments={victor === "antagonist" ? [120,240] : [0,240]}
                                width={400}
                                height={400}
                            />
                        </div>
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                            <div style={{marginRight: "40px"}}>
                                <Typography variant="h5" align="center">
                                    XP Gained
                                </Typography>
                                <Typography variant="h6" align="center">
                                    {antagonist}
                                </Typography>
                            </div>
                            <div style={{marginRight: "40px"}}>
                                <Typography variant="h5" align="center">
                                    Towers Taken
                                </Typography>
                                <Typography variant="h6" align="center">
                                    10
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="h5" align="center">
                                    Avg. XP Gain
                                </Typography>
                                <Typography variant="h6" align="center">
                                    {antAvg} per day
                                </Typography>
                            </div>
                        </div>
                    </Grid>
                </Grid>
                <Grid container justifyContent="center" >
                    <AwesomeButton
                        type="primary"
                        onPress={() => {
                            setWinPopup(true)
                        }}
                    >Situation Room
                    </AwesomeButton>
                </Grid>
            </>
        )
    }

    const lostScreen = () => {
        return (
            <>
                <Dialog
                    PaperProps={{ style: { minHeight: "50vh", minWidth: "50vw" } }}
                    open={lostPopup}
                    onClose={() => setLostPopup(false)}>
                    <Box style={{ justifyContent: "center", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", position: "relative", overflow: "visible", minHeight: "75vh", minWidth: "50vw" }}>
                        <Lottie
                            isClickToPauseDisabled={true}
                            options={victor === "protagonist" ? redDefeat : blueDefeat}
                            width={500}
                            height={500}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                zIndex: 2,
                                opacity: 0.5,
                                overflow: "visible"
                            }}
                        />
                        <Typography color='white' variant='h1' component='div' style={{ width: '100%', textAlign: 'center', zIndex: 3  }}>
                            {"YOU LOST!"}
                        </Typography>
                    </Box>
                    <DialogActions>
                        <Button onClick={() => {
                            setPopupOpen(true)
                            setLostPopup(false)
                        }} color="primary">Select Other Battles</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    PaperProps={{ style: { minHeight: "50vh", minWidth: "50vw" } }}
                    open={popupOpen}
                    onClose={() => {
                        setLostPopup(false)
                        setPopupOpen(false)
                    }}
                >
                    {statsPopup()}
                </Dialog>
                <Grid container>
                    <Grid item xs={6}>
                        <Typography variant="h5" align="center">
                            Protagonist
                        </Typography>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                            }}
                        >
                            <Lottie
                                isClickToPauseDisabled={true}
                                options={victor === "protagonist" ? blueWinOptions : blueDefeat}
                                width={400}
                                height={400}
                                segments={victor === "protagonist" ? [120,240] : [0,240]}
                            />
                        </div>
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                            <div style={{marginRight: "40px"}}>
                                <Typography variant="h5" align="center">
                                    XP Gained
                                </Typography>
                                <Typography variant="h6" align="center">
                                    {protagonist}
                                </Typography>
                            </div>
                            <div style={{marginRight: "40px"}}>
                                <Typography variant="h5" align="center">
                                    Towers Taken
                                </Typography>
                                <Typography variant="h6" align="center">
                                    8
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="h5" align="center">
                                    Avg. XP Gain / Day
                                </Typography>
                                <Typography variant="h6" align="center">
                                    {proAvg} per day
                                </Typography>
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h5" align="center">
                            Antagonist
                        </Typography>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                            }}
                        >
                            <Lottie
                                isClickToPauseDisabled={true}
                                options={victor === "antagonist" ? redWinOptions : redDefeat}
                                segments={victor === "antagonist" ? [120,240] : [0,240]}
                                width={400}
                                height={400}
                            />
                        </div>
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                            <div style={{marginRight: "40px"}}>
                                <Typography variant="h5" align="center">
                                    XP Gained
                                </Typography>
                                <Typography variant="h6" align="center">
                                    {antagonist}
                                </Typography>
                            </div>
                            <div style={{marginRight: "40px"}}>
                                <Typography variant="h5" align="center">
                                    Towers Taken
                                </Typography>
                                <Typography variant="h6" align="center">
                                    10
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="h5" align="center">
                                    Avg. XP Gain
                                </Typography>
                                <Typography variant="h6" align="center">
                                    {antAvg} per day
                                </Typography>
                            </div>
                        </div>
                    </Grid>
                </Grid>
                <Grid container justifyContent="center" >
                    <AwesomeButton
                        type="primary"
                        onPress={() => {
                            setLostPopup(true)
                        }}
                    >Situation Room
                    </AwesomeButton>
                </Grid>
            </>
        )
    }


    if (hasNemesis && !win && !lost) {
        return (
            <ThemeProvider theme={leader === "antagonist" ? themeRed : leader === "protagonist" ? themeBlue : theme50}>
                <CssBaseline>
                    {circle()}
                    {clashing()}
                    <Grid container style={{ height: '90vh', bottom: "20px"}}>
                        {protagonistBase()}
                        <Grid item xs={7}>
                            {xpNeededRed()}
                            {atmosphere()}
                            {battleground()}
                            {xpNeededBlue()}
                            <Grid container justifyContent="center" >
                                <AwesomeButton
                                    type="primary"
                                    onPress={() => {
                                        setPopupOpen(true)
                                    }}
                                >Situation Room
                                </AwesomeButton>
                            </Grid>
                            <Dialog
                                PaperProps={{ style: { minHeight: "50vh", minWidth: "50vw" } }}
                                open={popupOpen}
                                onClose={() => setPopupOpen(false)}
                            >
                                {statsPopup()}
                            </Dialog>
                        </Grid>
                        {antagonistBase()}
                    </Grid>
                </CssBaseline>
            </ThemeProvider>
        );
    } else if (win) {
        return (
            <ThemeProvider theme={theme50}>
                <CssBaseline>
                    {/*<AppWrapper/>*/}
                    {winScreen()}
                </CssBaseline>
            </ThemeProvider>
        );
    } else if (lost) {
        return (
            <ThemeProvider theme={theme50}>
                <CssBaseline>
                    {/*<AppWrapper/>*/}
                    {lostScreen()}
                </CssBaseline>
            </ThemeProvider>
        );
    } else {
        return (
            <ThemeProvider theme={theme50}>
                <CssBaseline>
                    {/*<AppWrapper/>*/}
                    <Grid container style={{ height: '90vh', bottom: "20px"}}>
                        {/*<Joyride*/}
                        {/*    continuous={true}*/}
                        {/*    // getHelpers={getHelpers}*/}
                        {/*    run={run}*/}
                        {/*    scrollToFirstStep={true}*/}
                        {/*    disableOverlayClose={true}*/}
                        {/*    showProgress={true}*/}
                        {/*    //@ts-ignore*/}
                        {/*    steps={steps}*/}
                        {/*    callback={handleJoyrideCallback}*/}
                        {/*    stepIndex={stepIndex}*/}
                        {/*    styles={{*/}
                        {/*        options: {*/}
                        {/*            zIndex: 10000,*/}
                        {/*            primaryColor: theme.palette.primary.dark,*/}
                        {/*            overlayColor: "rgba(255,255,255,0.4)",*/}
                        {/*            backgroundColor: theme.palette.background.default,*/}
                        {/*            arrowColor: theme.palette.background.default,*/}
                        {/*            textColor: theme.palette.text.primary*/}
                        {/*        },*/}
                        {/*    }}*/}
                        {/*/>*/}
                        <Grid item xs={7}>
                            <Dialog
                                PaperProps={{ style: { minHeight: "50vh", minWidth: "50vw", } }}
                                open={true}
                            >
                                {welcomePopup()}
                            </Dialog>
                        </Grid>
                    </Grid>
                </CssBaseline>
            </ThemeProvider>
        );
    }
}

export default NemesisOld;