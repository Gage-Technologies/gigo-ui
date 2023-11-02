import * as React from "react";
import {useEffect, useState} from "react";
import {
    Box,
    Button,
    createTheme,
    CssBaseline,
    Grid,
    Modal,
    PaletteMode,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useNavigate} from "react-router-dom";
import call from "../services/api-call";
import swal from "sweetalert";
import config from "../config";
import ReactGA from "react-ga4";
import {
    initialAuthStateUpdate,
    selectAuthStateId,
    selectAuthStateTutorialState,
    updateAuthState
} from "../reducers/auth/auth";
import Lottie from "react-lottie";
import * as flame from "../img/streak/active.json";
//@ts-ignore
import {Calendar, utils} from "@amir04lm26/react-modern-calendar-date-picker";
// import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import '@amir04lm26/react-modern-calendar-date-picker/lib/DatePicker.css';
import './calendar.css'
import {ThreeDots} from "react-loading-icons";
import * as XPBoost from "../img/doubleXP.json";
import freeze from "../img/streak/freeze.svg"
import Countdown from "react-countdown";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import CardTutorial from "../components/CardTutorial";
import styled from "@emotion/styled";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";


function Streak() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);

    const TutorialBox = styled(Box)`
      animation: auraEffect 2s infinite alternate;
    
      @keyframes auraEffect {
        0% {
          box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${theme.palette.primary.main}, 0 0 20px ${theme.palette.primary.main}, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main} 0 0 35px ${theme.palette.primary.main};
        }
        100% {
          box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main}, 0 0 40px ${theme.palette.primary.main}, 0 0 50px ${theme.palette.primary.main};
        }
      }
    `;

    let navigate = useNavigate();


    const styles = {
        box: {
            width: "16vw",
            height: "30vh",
            borderRadius: 3,
            p: 2,
            m: 2,
            // boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2);",
            backgroundColor: "transparent",
            // border: `2px solid ${theme.palette.primary.dark}75`,
        },
        tutorialHeader: {
            fontSize: "1rem",
        },
        tutorialText: {
            fontSize: "0.7rem",
        }
    };


    document.documentElement.style.setProperty('--app-primary-color', theme.palette.primary.main);
    document.documentElement.style.setProperty('--app-primary-color-dark', theme.palette.primary.dark);
    document.documentElement.style.setProperty('--app-primary-color-light', theme.palette.primary.light);
    document.documentElement.style.setProperty('--app-secondary-color', theme.palette.secondary.main);
    document.documentElement.style.setProperty('--app-secondary-color-dark', theme.palette.secondary.dark);
    document.documentElement.style.setProperty('--app-secondary-color-light', theme.palette.secondary.light);
    document.documentElement.style.setProperty('--app-border-color', `${theme.palette.primary.dark}75`);


    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: flame,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    ReactGA.initialize("G-38KBFJZ6M6");

    const defaultFrom = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate() - 7,
    };
    const defaultTo = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
    };
    const defaultValue = {
        from: defaultFrom,
        to: defaultTo,
    };
    const [selectedDayRange, setSelectedDayRange] = useState(
        defaultValue
    );

    const [rawDates, setRawDates] = useState([]);
    const [rawFreeze, setRawFreeze] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [xpDataActive, setXpDataActive] = useState([]);
    const [xpData, setXpData] = useState([]);
    const [xpActive, setXpActive] = useState(null);
    const [popupShow, setPopupShow] = useState(false);
    const [streakCount, setStreakCount] = useState(0);
    const [steps, setSteps] = React.useState([{
        content: <h2>Streaks are gained by completing more than 30 minutes of programming inside of a workspace for a
            day.</h2>, target: '.fire', disableBeacon: true
    }, {
        content: <h2>These are XP tokens. You earn these by receiving them in loop boxes</h2>, target: '.token'
    }, {content: <h2>When activated they will double all incoming XP for 24 hours</h2>, target: '.token'}, {
        content: <h2>A streak freeze is automatically consumed when you do not extend your
            streak</h2>, target: '.streak'
    }, {content: <h2>You can earn streak freezes from loop boxes</h2>, target: '.streak'}, {
        content: <h2>That's the tutorial, thanks for your time and enjoy the
            system.</h2>, target: 'body', placement: 'center'
    }])

    const tutorialState = useAppSelector(selectAuthStateTutorialState)
    // we init this to false because we don't trigger until the content loads
    const [runTutorial, setRunTutorial] = React.useState(!tutorialState.stats)

    const [stepIndex, setStepIndex] = React.useState(0)
    const userId = useAppSelector(selectAuthStateId);

    // this enables us to push tutorial restarts from the app wrapper down into this page
    useEffect(() => {
        if (tutorialState.stats === !runTutorial) {
            return
        }
        setRunTutorial(!tutorialState.stats && window.innerWidth > 1000)
    }, [tutorialState])

    const getStreaks = async () => {
        setLoading(true)
        let user = await call(
            "/api/user/streakPage",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {user_id: userId},
            null,
            config.rootPath
        )

        let xp = await call(
            "/api/xp/getXPBoost",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        let streak = await call(
            "/api/streakFreeze/get",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        const [res, res2, res3] = await Promise.all([
            user,
            xp,
            streak
        ])

        if (res === null) {
            swal("wrong", "Something went wrong", "error");
        }


        if (res["streaks"] !== null) {
            setRawDates(res["streaks"])
        } else {
            setRawDates([])
        }
        if (res["freezes"] !== null) {
            setRawFreeze(res["freezes"])
        } else {
            setRawFreeze([])
        }
        if (res["stats"] !== null && res["stats"].length !== 0) {
            setStats(res["stats"][0])
        } else {
            setStats([])
        }

        if (res3 !== undefined && res3["streak_freezes"] !== undefined) {
            setStreakCount(res3["streak_freezes"])
        }

        if (res2 !== undefined && res2["xp data"] !== null && res2["xp data"] !== undefined) {
            for (let i = 0; i < res2["xp data"].length; i++) {
                if (res2["xp data"][i]["EndDate"] === null && res2["xp data"][i]["Id"] !== null) {
                    setXpData(res2["xp data"][i])
                } else {
                    let date = new Date(res2["xp data"][i]["EndDate"])
                    if (date > new Date()) {
                        setXpDataActive(res2["xp data"][i])
                        setXpActive(
                            //@ts-ignore
                            date)
                    }
                }
            }
        }

        setLoading(false)

    }

    const startStreak = async () => {
        setPopupShow(false)
        let streak = await call(
            "/api/xp/startXPBoost",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {_id: xpData["Id"]},
            null,
            config.rootPath
        )

        if (streak !== null && streak !== undefined && streak["message"] === "xp boost has started") {
            swal("XP Boost Has Started")
            let newCount = xpData
            //@ts-ignore
            newCount["Count"] = newCount["Count"] - 1
            setXpData(newCount)
            let date = new Date().setHours(new Date().getHours() + 24)
            setXpActive(
                //@ts-ignore
                date)
        }
    }

    useEffect(() => {
        getStreaks()
    }, [])


    let renderFlame = () => {
        const children = (
            <div>
                <Typography variant="h5" component="div"
                            style={{width: "100%", display: "flex", justifyContent: "center"}}>
                    {"Current Streak"}
                </Typography>
                <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                    <Lottie options={defaultOptions}
                            width={"50%"}
                            height={"50%"}/>
                </div>
                <Typography color="#FF7A0E" variant="h1" component="div"
                            style={{width: "100%", display: "flex", justifyContent: "center"}}>
                    {/*@ts-ignore*/}
                    {stats !== undefined && stats["current_streak"] === undefined ? 0 : stats["current_streak"]}
                </Typography>
            </div>
        )

        if (runTutorial && stepIndex === 1) {
            return (
                <TutorialBox sx={{...styles.box, marginLeft: "auto", marginRight: "auto"}} className={"fire"}>
                    {children}
                </TutorialBox>
            )
        }

        return (
            <Box sx={{...styles.box, marginLeft: "auto", marginRight: "auto"}} className={"fire"}>
                {children}
            </Box>
        )
    }

    let renderAvg = () => {
        return (
            <Box sx={styles.box}>
                <Typography variant='h5' component='div' style={{width: '100%', textAlign: 'center'}}>
                    {'Avg Time a Day'}
                </Typography>
                <Typography color='#FF7A0E' variant='h1' component='div'
                            style={{width: '95%', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto'}}>
                    {/*@ts-ignore*/}
                    {formatTime(stats["avg_time"])}
                </Typography>
            </Box>
        )
    }
    let renderTot = () => {
        return (
            <Box sx={styles.box}>
                <Typography variant='h5' component='div' style={{width: '100%', textAlign: 'center'}}>
                    {'Time in Challenges'}
                </Typography>
                <Typography color='#FF7A0E' variant='h1' component='div'
                            style={{width: '95%', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto'}}>
                    {/*@ts-ignore*/}
                    {formatTime(stats["total_time_spent"])}
                </Typography>
            </Box>
        )
    }
    //onClick={() => startStreak()}

    let renderXPBoost = () => {
        const children = (
            <>
                            <Button
                    style={{backgroundColor: "transparent", width: "100%", display: "flex", alignItems: "center"}}
                    onClick={() => setPopupShow(true)} disabled={xpActive !== null ||
                    //@ts-ignore
                    xpData["Count"] === 0 || xpData["Count"] === undefined}>
                    <Box display={"flex"} flexDirection={"column"}>
                        <Lottie options={xpBoostOptions} isClickToPauseDisabled={true}
                                width={"75%"}
                                height={"75%"}
                                style={{zIndex: 4, display: "flex", height: "100%", alignItems: "center"}}/>
                        <h3>{
                            //@ts-ignore
                            xpData["Count"] === undefined ? "0   XP Tokens" : xpData["Count"] + "   XP Tokens"}</h3>
                        {
                            //@ts-ignore
                            xpData["Count"] === undefined ? (<div/>) : (
                                <div style={{width: "100%"}}>
                                    <div
                                        style={{display: "flex", flexDirection: "row", width: "100%", justifyContent: "center"}}>
                                        {xpActive === null ? (<div style={{height: "auto"}}>Activate</div>) : (
                                            <Countdown date={xpActive}/>
                                        )}
                                    </div>
                                </div>
                            )}
                    </Box>
                </Button>
                <Modal open={popupShow} onClose={() => setPopupShow(false)}>
                    <Box
                        sx={{
                            width: "20vw",
                            height: "20vh",
                            justifyContent: "center",
                            marginLeft: "40vw",
                            marginTop: "40vh",
                            outlineColor: "black",
                            borderRadius: 1,
                            boxShadow:
                                "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                            <h4>Are you sure you want to start an XP Token</h4>
                        </div>
                        <div style={{display: "flex", flexDirection: "row", width: "100%", justifyContent: "center"}}>
                            <Button onClick={() => startStreak()}>
                                Confirm
                            </Button>
                            <Button onClick={() => setPopupShow(false)}>
                                Cancel
                            </Button>
                        </div>
                    </Box>
                </Modal>
            </>
        )

        if (runTutorial && stepIndex === 2) {
            return (
                <TutorialBox sx={styles.box} className={"token"}>
                    {children}
                </TutorialBox>
            )
        }

        return (
            <Box sx={styles.box} className={"token"}>
                {children}
            </Box>
        )
    }

    let renderStreakFreeze = () => {
        const children = (
            <>
                <img src={freeze} alt="image not found"
                     style={{zIndex: 4, alignItems: "center", width: "50%", height: "50%", marginTop: "10px"}}/>
                <h3
                    style={{
                        marginTop: "auto",
                    }}
                >{
                    //@ts-ignore
                    streakCount + "   Streak Freezes"}</h3>
            </>
        )

        if (runTutorial && stepIndex === 3) {
            return (
                <TutorialBox sx={{...styles.box, marginLeft: "auto", marginRight: "auto", alignItems: "center"}} className={"streak"} display={"flex"} flexDirection={"column"}>
                    {children}
                </TutorialBox>
            )
        }

        return (
            <Box sx={{...styles.box, marginLeft: "auto", marginRight: "auto", alignItems: "center"}} className={"streak"} display={"flex"} flexDirection={"column"}>
                {children}
            </Box>
        )
    }

    let renderStats = () => {
        return (
            <Box sx={styles.box}>
                <Typography variant='h6' component='div' style={{width: '100%', textAlign: 'center'}}>
                    {'Longest Streak'}
                </Typography>
                <Typography color='#FF7A0E' variant='h5' component='div' style={{width: '100%', textAlign: 'center'}}>
                    {/*@ts-ignore*/}
                    {stats["longest_streak"]}
                </Typography>
                <Typography variant='h6' component='div' style={{width: '100%', textAlign: 'center'}}>
                    {'Challenges Completed'}
                </Typography>
                <Typography color='#FF7A0E' variant='h5' component='div' style={{width: '100%', textAlign: 'center'}}>
                    {/*@ts-ignore*/}
                    {stats["challenges_completed"]}
                </Typography>
                <Typography variant='h6' component='div' style={{width: '100%', textAlign: 'center'}}>
                    {'Avg. Time Per Challenge'}
                </Typography>
                <Typography color='#FF7A0E' variant='h5' component='div' style={{width: '100%', textAlign: 'center'}}>
                    {/*@ts-ignore*/}
                    {"do math"}
                </Typography>
                <Typography variant='h6' component='div' style={{width: '100%', textAlign: 'center'}}>
                    {'Days on Platform'}
                </Typography>
                <Typography color='#FF7A0E' variant='h5' component='div' style={{width: '100%', textAlign: 'center'}}>
                    {/*@ts-ignore*/}
                    {stats["days_on_platform"]}
                </Typography>
            </Box>
        )
    }

    const dates = rawDates.map(date => {
        const formattedDate = new Date(date).toISOString().slice(0, 10);
        return `${formattedDate}`;
    });

    const dates2 = rawFreeze.map(date => {
        const formattedFreeze = new Date(date).toISOString().slice(0, 10);
        return `${formattedFreeze}`;
    });

    function formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
    }

    const xpBoostOptions = {
        loop: true,
        autoplay: true,
        animationData: XPBoost,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };


    const dispatch = useAppDispatch();

    const streakDays = dates.map((dateString, index) => {
        const [year, month, day] = dateString.split('-');
        let className;
        const date = new Date(Number(year), Number(month) - 1, Number(day)); // month is 0-indexed in Date constructor
        const today = new Date()
        if (today.getFullYear() === parseInt(year) && today.getMonth() + 1 === parseInt(month) && today.getDate() === parseInt(day)) {
            if ((dates.includes(getPreviousDay(dateString)))) { // check if previous day is included in array
                className = 'today';
            } else {
                className = 'soloToday';
            }
        } else if (date.getDay() === 0) { // Sunday
            if (!dates.includes(getNextDay(dateString)) || (isFirstOrLastDayOfMonth(dateString) === 'last')) {
                className = 'solo';
            } else {
                className = 'startDay';
            }
        } else if (date.getDay() === 6) { // Saturday
            if (!dates.includes(getPreviousDay(dateString)) || (isFirstOrLastDayOfMonth(dateString) === 'first')) {
                className = 'solo';
            } else {
                className = 'endDay';
            }
        } else if (index === 0 || !dates.includes(getPreviousDay(dateString))) { //check if isolated date
            if (!dates.includes(getNextDay(dateString)) || (!dates.includes(getPreviousDay(dateString)) && isFirstOrLastDayOfMonth(dateString) === 'last')) {
                className = 'solo';
            } else {
                className = 'startDay';
            }
        } else if (!dates.includes(getNextDay(dateString))) { // check if last day of streak
            className = 'endDay';
        } else if (!dates.includes(getPreviousDay(dateString)) && today.getFullYear() === parseInt(year) && today.getMonth() + 1 === parseInt(month) && today.getDate() === parseInt(day)) { // check if today's date is isolated
            className = 'soloToday';
        } else if (isFirstOrLastDayOfMonth(dateString) === 'first') {
            if (today.getFullYear() === parseInt(year) && today.getMonth() + 1 === parseInt(month) && today.getDate() === parseInt(day)) {
                className = 'soloToday'
            } else {
                className = 'startDay';
            }
        } else if (isFirstOrLastDayOfMonth(dateString) === 'last') { // last day of the month
            className = 'endDay';
        } else {
            className = 'betweenDay';
        }

        return {year: parseInt(year), month: parseInt(month), day: parseInt(day), className};
    });

    const freezeDays = dates2.map((dateString, index) => {
        const [year, month, day] = dateString.split('-');
        return {year: parseInt(year), month: parseInt(month), day: parseInt(day), className: 'freeze'};
    });

    const calendarDays = streakDays.concat(freezeDays)
        .map(({year, month, day, className}) => ({
            year: parseInt(String(year)),
            month: parseInt(String(month)),
            day: parseInt(String(day)),
            className
        }));

    function getPreviousDay(dateString: any) {
        const [year, month, day] = dateString.split('-');
        const today = new Date(year, month - 1, day);
        const previousDay = new Date(today);
        previousDay.setDate(today.getDate() - 1);
        const prevDateStr = [previousDay.getFullYear(), ('0' + (previousDay.getMonth() + 1)).slice(-2), ('0' + previousDay.getDate()).slice(-2)].join('-');
        return prevDateStr;
    }

    function getNextDay(dateString: any) {
        const [year, month, day] = dateString.split('-');
        const today = new Date(year, month - 1, day);
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);
        const nextDateStr = [nextDay.getFullYear(), ('0' + (nextDay.getMonth() + 1)).slice(-2), ('0' + nextDay.getDate()).slice(-2)].join('-');
        return nextDateStr;
    }

    function isFirstOrLastDayOfMonth(dateString: any) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);

        const firstDayOfMonth = new Date(year, month - 1, 1);
        const lastDayOfMonth = new Date(year, month, 0);

        if (date.getTime() === firstDayOfMonth.getTime()) {
            return 'first';
        } else if (date.getTime() === lastDayOfMonth.getTime()) {
            return 'last';
        } else {
            return 'not';
        }
    }

    let renderCal = () => {
        return (
            <div style={{
                marginLeft: "auto",
                marginRight: "auto",
            }}>
                <Calendar
                    calendarClassName={theme.palette.mode === 'dark' ? "custom-calendar-dark" : "custom-calendar-light"}
                    customDaysClassName={calendarDays}
                    maximumDate={utils("en").getToday()}
                />
            </div>
        )
    }


    const tutorialCallback = async (step: number, reverse: boolean) => {
        setStepIndex(step)
    }

    const closeTutorialCallback = async () => {
        setRunTutorial(false)
        let authState = Object.assign({}, initialAuthStateUpdate)
        // copy the existing state
        let state = Object.assign({}, tutorialState)
        // update the state
        state.stats = true
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
                tutorial_key: "stats"
            }
        )
    }

    let topBarWidth = 9.6;
    if (sidebarOpen) {
        topBarWidth = 10.8;
    }
    if (chatOpen) {
        topBarWidth = 11.5;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <CardTutorial
                    open={runTutorial}
                    closeCallback={closeTutorialCallback}
                    step={stepIndex}
                    changeCallback={tutorialCallback}
                    steps={[
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Stay warm from your streak flame!</h2>
                                    <p style={styles.tutorialText}>Streaks track consecutive days working on a project. Finish the tutorial to learn how streaks work and what cool features they bring.</p>
                                </div>
                            ),
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>How do I get a Streak?</h2>
                                    <p style={styles.tutorialText}>Streaks are gained by completing more than 30 minutes of programming inside of a project for 3 or more consecutive days.</p>
                                </div>
                            ),
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>What are XP Tokens?</h2>
                                    <p style={styles.tutorialText}>XP Tokens double XP for 24 hours after activation. When you have XP Tokens click this icon to activate the XP token.</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>XP Tokens are awarded in Loop Boxes as you use the platform. Start and finish Attempts to maximize your Loop Boxes!</p>
                                </div>
                            ),
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>What are Streak Freezes?</h2>
                                    <p style={styles.tutorialText}>A streak freeze pauses your streak on a day that you did not work on. They are automatically consumed to preserver your streak.</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>Upgrade to Pro to receive 2 Streak Freezes every week!</p>
                                </div>
                            ),
                        }
                    ]}
                />
                {loading ? (
                    <Grid container
                          sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "1", paddingLeft: "50px"}}>
                        <Typography component={"div"} sx={{
                            display: "flex",
                            justifyContent: "center",
                            height: window.innerHeight,
                            alignItems: "center"
                        }}>
                            <ThreeDots/>
                        </Typography>
                    </Grid>
                ) : (
                    <Grid
                        container
                        // center content
                        justifyContent="center"
                        // align items in center
                        alignItems="center"
                        sx={{ml: 0, mr: 0}}
                    >
                        <Grid item xs={topBarWidth}
                            sx={{
                                m: 1,
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2);",
                                backgroundColor: "transparent",
                                border: `2px solid ${theme.palette.primary.dark}75`,
                                borderRadius: 3
                            }}
                        >
                            <Grid container
                                // center content
                                justifyContent="center"
                                // align items in center
                                alignItems="center"
                            >
                                <Grid item xs={4}
                                      sx={{display: "flex", alignItems: "center", ml: 0}}
                                >
                                    {renderFlame()}
                                </Grid>
                                <Grid item xs={4}
                                      sx={{display: "flex", justifyContent: "center", alignItems: "center"}}
                                >
                                    {renderXPBoost()}
                                </Grid>
                                <Grid item xs={4}
                                      sx={{display: "flex", justifyContent: "right", alignItems: "center"}}
                                >
                                    {renderStreakFreeze()}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}
                              sx={{display: "flex"}}
                        >
                            {renderCal()}
                        </Grid>
                    </Grid>
                )}
            </CssBaseline>
        </ThemeProvider>
    );
}

export default Streak;