import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
    CircularProgress,
    createTheme,
    CssBaseline,
    Divider, FormControlLabel,
    Grid,
    LinearProgress,
    Link,
    List,
    ListItem,
    ListItemText,
    PaletteMode, Switch,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useParams} from "react-router";
import call from "../services/api-call";
import {Workspace, WorkspaceInitFailure} from "../models/workspace";
import config from "../config";
import TwentyFortyEight from "../components/Games/TwentyFortyEight";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {
    initialAuthStateUpdate,
    selectAuthStateUserName,
    updateAuthState
} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import CodeSource from "../models/codeSource";
import {CountdownCircleTimer} from "react-countdown-circle-timer";
import {LoadingButton} from "@mui/lab";
import XpPopup from "../components/XpPopup";
import * as wsModels from "../models/websocket";
import {useGlobalWebSocket} from "../services/websocket";
import {setCache, deleteCache, clearCache, selectCacheState} from '../reducers/pageCache/pageCache';
import {useDispatch, useSelector} from "react-redux";


interface InitialStatusMessage {
    workspace: Workspace;
    code_source: CodeSource;
    workspace_url: string
}


const WorkspaceAdvancedPage = () => {
    // retrieve url params
    let {id} = useParams();
    let cacheKey = "advancedWorkspace::" + id

    let navigate = useNavigate();

    const dispatch = useDispatch();
    const cache = useSelector(selectCacheState);

    // retrieve theme from local storage
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    // create state variables and initialize from cache if possible
    let [workspace, setWorkspace] = React.useState<Workspace | null>(
        cache[`${cacheKey}:workspace`] !== undefined ? cache[`${cacheKey}:workspace`].data as Workspace : null
    );
    const [workspaceError, setWorkspaceError] = React.useState<WorkspaceInitFailure | null>(
        cache[`${cacheKey}:workspaceError`] !== undefined ? cache[`${cacheKey}:workspaceError`].data as WorkspaceInitFailure : null
    );
    const workspaceRef = React.useRef<Workspace | null>(workspace);
    let [workspaceUrl, setWorkspaceUrl] = React.useState<string | null>(
        cache[`${cacheKey}:workspaceUrl`] !== undefined ? cache[`${cacheKey}:workspaceUrl`].data as string : null
    );
    let [codeSource, setCodeSource] = React.useState<CodeSource | null>(
        cache[`${cacheKey}:codeSource`] !== undefined ? cache[`${cacheKey}:codeSource`].data as CodeSource : null
    );

    let [expiration, setExpiration] = React.useState<number | null>(
        cache[`${cacheKey}:expiration`] !== undefined ? cache[`${cacheKey}:expiration`].data as number : null
    );
    const [highestScore, setHighestScore] = React.useState<number | null>(
        cache[`${cacheKey}:highestScore`] !== undefined ? cache[`${cacheKey}:highestScore`].data as number : null
    );

    const [xpPopup, setXpPopup] = React.useState(false)
    const [xpData, setXpData] = React.useState(null)
    const [steps, setSteps] = React.useState([{
        content: <h2>This shows the current state of the workspace</h2>, target: '.bar', disableBeacon: true
    }, {content: <h2>When the workspace is done you may open a workspace here.</h2>, target: '.open_button'}, {
        content: <h2>You may start or stop a workspace here</h2>, target: '.button'
    }, {
        content: <h2>If not being used, the workspace will auto close within this time frame</h2>, target: '.circle'
    }, {content: <h2>While you wait, try your hand at 2048.</h2>, target: '.game'}]);

    const [stepIndex, setStepIndex] = React.useState(0)

    let [loadingWorkspaceTransition, setLoadingWorkspaceTransition] = React.useState<boolean>(false);

    useEffect(() => {
        if (workspace === null) {
            dispatch(deleteCache(`${cacheKey}:workspace`))
        } else {
            ;
            dispatch(setCache(`${cacheKey}:workspace`, workspace))
        }
    }, [workspace])

    useEffect(() => {
        if (workspaceError === null) {
            dispatch(deleteCache(`${cacheKey}:workspaceError`))
        } else {
            dispatch(setCache(`${cacheKey}:workspaceError`, workspaceError))
        }
    }, [workspaceError])

    useEffect(() => {
        if (workspaceUrl === null) {
            dispatch(deleteCache(`${cacheKey}:workspaceUrl`))
        } else {
            dispatch(setCache(`${cacheKey}:workspaceUrl`, workspaceUrl))
        }
    }, [workspaceUrl])

    useEffect(() => {
        if (codeSource === null) {
            dispatch(deleteCache(`${cacheKey}:codeSource`))
        } else {
            dispatch(setCache(`${cacheKey}:codeSource`, codeSource))
        }
    }, [codeSource])

    useEffect(() => {
        if (expiration === null) {
            dispatch(deleteCache(`${cacheKey}:expiration`))
        } else {
            dispatch(setCache(`${cacheKey}:expiration`, expiration))
        }
    }, [expiration])

    useEffect(() => {
        if (highestScore === null) {
            dispatch(deleteCache(`${cacheKey}:highestScore`))
        } else {
            dispatch(setCache(`${cacheKey}:highestScore`, highestScore))
        }
    }, [highestScore])


    /**
     * Handles a single workspace message
     * @param message Websocket event message
     * @returns
     */
    const handleWsMessage = useCallback((message: wsModels.WsMessage<any>) => {
        // attempt to parse json message
        let jsonMessage: Object | null = null
        try {
            jsonMessage = message.payload;
        } catch (e) {
            ;
            return
        }

        if (jsonMessage === null) {

            return
        }

        // create variable to hold the workspace
        let workspace: Workspace;

        // handle initial state message
        if ("code_source" in jsonMessage) {
            let msg = jsonMessage as InitialStatusMessage;
            setWorkspaceUrl(msg.workspace_url)
            setCodeSource(msg.code_source)
            workspace = msg.workspace
        } else {
            let msg = jsonMessage as InitialStatusMessage;
            workspace = msg.workspace as Workspace
        }

        // conditionally mark workspace transition as not loading if it is currently set
        // and we just changed the workspace state since we are now confident the transition
        // occurred
        if (workspaceRef.current?.state !== workspace.state) {
            setLoadingWorkspaceTransition(false)
        }



        // handle workspace failure
        if (workspace.init_failure !== null && workspace.init_failure.stderr !== "" && workspace.state === 5) {

            setWorkspaceError(workspace.init_failure)
        } else {
            setWorkspaceError(null)
        }

        // handle status updates
        setWorkspace(workspace)

        // calculate the updated expiratoion time
        calculateExpiration(workspace)
    }, [workspace, workspaceError, workspaceUrl, codeSource, expiration, highestScore, loadingWorkspaceTransition, stepIndex]);

    let globalWs = useGlobalWebSocket();
    globalWs.registerCallback(wsModels.WsMessageType.WorkspaceStatusUpdate, `workspace:status:${id}`, handleWsMessage);

    useEffect(() => {
        // generate a random alphanumeric id
        let seqId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        globalWs.sendWebsocketMessage({
            sequence_id: seqId,
            type: wsModels.WsMessageType.SubscribeWorkspace,
            payload: {
                workspace_id: id,
            }
        }, null)

        return () => {
            globalWs.sendWebsocketMessage({
                sequence_id: seqId,
                type: wsModels.WsMessageType.UnsubscribeWorkspace,
                payload: {
                    workspace_id: id,
                }
            }, null)
        }
    }, [])

    /**
     * Calculates the unix time of the workspace expiration in milliseconds
     * @param workspace Workspace that will be used to calculate the expiration
     */
    const calculateExpiration = (workspace: Workspace) => {
        let expiry = new Date(
            Number(workspace.expiration.substring(0, 4)),
            Number(workspace.expiration.substring(5, 7)) - 1,
            Number(workspace.expiration.substring(8, 10)),
            Number(workspace.expiration.substring(11, 13)),
            Number(workspace.expiration.substring(14, 16)),
            Number(workspace.expiration.substring(17, 19)),
        )

        // when the state is non-active we want to add 24 hours to the expiration date
        // to mark when the ws will be removed
        if (workspace.state >= 2) {
            expiry.setTime(expiry.getTime() + 24 * 60 * 60 * 1000)
        }

        setExpiration(expiry.getTime())
    }

    useEffect(() => {
        ;
    }, [workspaceError]);


    /**
     * Retrieves the high score for the current user on the 2048 game
     */
    const getHighestScore = async () => {
        let res = await call(
            "/api/workspace/getHighestScore",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {}
        )

        if (res !== undefined && res["highest_score"] !== undefined) {
            setHighestScore(Number(res["highest_score"]));
        }
    }

    useEffect(() => {
        let xpAttempt = window.sessionStorage.getItem('attemptXP')

        if (xpAttempt !== "undefined" && xpAttempt !== null) {
            setXpPopup(true)
            setXpData(JSON.parse(xpAttempt))
        }
        getHighestScore()
        const userAgent = navigator.userAgent;
        if (userAgent.includes("Firefox") && steps.length === 5) {

            // let tutorialSteps = steps
            // tutorialSteps.push({content: <h2>Firefox is incompatible with development environments and can cause unexpected issues.We suggest using a Chromium based browser such as Google Chrome, Brave, Edge, etc</h2>, target: 'body', 
            // //@ts-ignore
            // placement: 'center'})
            let tutorialSteps = [{
                content: <h2>This shows the current state of the workspace</h2>, target: '.bar', disableBeacon: true
            },
                {content: <h2>When the workspace is done you may open a workspace here.</h2>, target: '.open_button'},
                {content: <h2>You may start or stop a workspace here</h2>, target: '.button'},
                {
                    content: <h2>If not being used, the workspace will auto close within this time
                        frame</h2>, target: '.circle'
                },
                {content: <h2>While you wait, try your hand at 2048.</h2>, target: '.game'},
                {
                    content: <h2>Firefox is incompatible with development environments and can cause unexpected
                        issues.We suggest using a Chromium based browser such as Google Chrome, Brave, Edge,
                        etc</h2>, target: '.game'
                }];
            setSteps(tutorialSteps)
        }
    }, [highestScore, steps])

    const username = useAppSelector(selectAuthStateUserName);

    const startWorkspace = async () => {
        // mark the workspace transition as loading so that we don't have double calls
        setLoadingWorkspaceTransition(true)

        // execute api call to remote GIGO server to create workspace
        let res = await call(
            "/api/workspace/startWorkspace",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                workspace_id: id,
            }
        )

        // NOTE: we release the loading flag in the status update loop so we
        // are sure the state transition has occurred

        if (res["message"] !== undefined && res["message"] === "You must be logged in to access the GIGO system.") {
            // mark workspace transition as not loading since we failed
            setLoadingWorkspaceTransition(false)

            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }
    }

    const stopWorkspace = async () => {
        // mark the workspace transition as loading so that we don't have double calls
        setLoadingWorkspaceTransition(true)

        // execute api call to remote GIGO server to create workspace
        let res = await call(
            "/api/workspace/stopWorkspace",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                workspace_id: id,
            }
        )

        // NOTE: we release the loading flag in the status update loop so we
        // are sure the state transition has occurred

        if (res["message"] !== undefined && res["message"] === "You must be logged in to access the GIGO system.") {
            // mark workspace transition as not loading since we failed
            setLoadingWorkspaceTransition(false)

            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }
    }

    /**
     * Renders link for code source
     */
    const renderCodeSourceLink = () => {
        if (codeSource === null) {
            return (
                <div/>
            )
        }

        if (codeSource.type === 0) {
            return (
                <div>
                    <Typography component={"div"} variant="subtitle1">
                        Challenge:{" "}
                        <Link href={`/challenge/${codeSource._id}`} variant="subtitle1">
                            {(codeSource.name.length <= 20) ? codeSource.name : codeSource.name.slice(0, 20) + "..."}
                        </Link>
                    </Typography>
                </div>
            )
        }

        return (
            <div>
                <Typography component={"div"} variant="subtitle1">
                    Attempt:{" "}
                    <Link href={`/attempt/${codeSource._id}`} variant="subtitle1">
                        {(codeSource.name.length <= 20) ? codeSource.name : codeSource.name.slice(0, 20) + "..."}
                    </Link>
                </Typography>
            </div>
        )
    }

    /**
     * Selects the correct color for the progress bar
     */
    const progressColor = () => {
        // default to primary
        if (workspace === null) {
            return "primary"
        }

        // primary for starting and active states
        if (workspace.state === 0 || workspace.state === 1) {
            return "primary"
        }

        // warning for stopping and suspended states
        if (workspace.state === 2 || workspace.state === 3) {
            return "warning"
        }

        // error for all else
        return "error"
    }

    const progressColorBorder = () => {
        // default to primary
        if (workspace === null) {
            return theme.palette.primary.main
        }

        // primary for starting and active states
        if (workspace.state === 0 || workspace.state === 1) {
            return theme.palette.primary.main
        }

        // warning for stopping and suspended states
        if (workspace.state === 2 || workspace.state === 3) {
            return theme.palette.warning.main
        }

        // error for all else
        return theme.palette.error.main
    }

    /**
     * Select progress bar type depending on the current state
     */
    const progressType = () => {
        // default to indeterminate
        if (workspace === null) {
            return "indeterminate"
        }

        // indeterminate for untracked transition states
        if (workspace.state === 2 || workspace.state === 4) {
            return "indeterminate"
        }

        // handle starting state when in provisioning since we don't have good feedback here
        if (workspace.state === 0 && workspace.init_state === 0) {
            return "indeterminate"
        }

        return "determinate"
    }

    /**
     * Calculates the value of the progress bar with awarness of the state
     */
    const progressValue = () => {
        // default to undefined
        if (workspace === null) {
            return undefined
        }

        // undefined for untracked transition states
        if (workspace.state === 2 || workspace.state === 4) {
            return undefined
        }

        // handle starting state when in provisioning since we don't have good feedback here
        if (workspace.state === 0 && workspace.init_state === 0) {
            return undefined
        }

        // handle all other starting stages by calculating the appropriate value
        if (workspace.state === 0) {
            // extract current initialization state and normalize for out-of-range states
            let currentStep = workspace.init_state
            if (currentStep === 14) {
                currentStep = 8
            }

            // increment current step by 1 for percentage calculation
            currentStep++


            return (currentStep / 14) * 100
        }

        return 100
    }

    /**
     * Calculates the remaining time before the next system auto actin for the workspace
     */
    const calculateRemainingTime = () => {
        if (workspace === null || expiration === null) {
            return {
                "hours": null,
                "minutes": null,
                "milliseconds": null,
            }
        }

        let currentTime = new Date()

        let UTCCurrent = new Date(currentTime.getUTCFullYear(), currentTime.getUTCMonth(), currentTime.getUTCDate(), currentTime.getUTCHours(), currentTime.getUTCMinutes())


        let diffMs = (expiration - UTCCurrent.getTime()); // milliseconds
        let diffHrs = Math.floor(diffMs / 3600000); // hours
        let diffMins = Math.round((diffMs % 3600000) / 60000); // minutes

        return {
            "hours": diffHrs,
            "minutes": diffMins,
            "milliseconds": diffMs,
        }
    }

    /**
     * Renders top status bar
     */
    const renderStatusBar = () => {
        return (
            <Card
                sx={{
                    width: "81vw",
                    height: "10vh",
                    minHeight: "85px",
                    marginLeft: "3vw",
                    marginTop: "1vh",
                    borderRadius: 1,
                    border: 1,
                    borderColor: progressColorBorder() + "75",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                    backgroundColor: "transparent",
                    backgroundImage: "none",
                }}
                className={"bar"}
            >
                <LinearProgress
                    sx={{
                        width: "100%",
                        height: "1vh",
                        minHeight: "7px"
                    }}
                    color={progressColor()}
                    variant={progressType()}
                    value={progressValue()}
                />
                <Grid container justifyContent="space-around" sx={{
                    flexGrow: 1,
                    paddingTop: "20px",
                    minHeight: "85px"
                }}>
                    <Grid item xs={"auto"}>
                        <Typography component={"div"} variant="subtitle1">
                            State: {(workspace === null) ? "Pending" : workspace.state_string}
                        </Typography>
                    </Grid>
                    {
                        (workspace !== null && (workspace.state === 0 || workspace.state === 1)) ?
                            (
                                <Grid item xs={"auto"}>
                                    <Typography component={"div"} variant="subtitle1">
                                        Initialization: {workspace.init_state_string}
                                    </Typography>
                                </Grid>
                            ) : (
                                <></>
                            )
                    }
                    <Grid item xs={"auto"}>
                        <Typography component={"div"} variant="subtitle1">
                            Commit: {(workspace === null) ? "Pending" : workspace.commit}
                        </Typography>
                    </Grid>
                    <Grid item xs={"auto"}>
                        {renderCodeSourceLink()}
                    </Grid>
                    <Grid item xs={"auto"}>
                        <Button
                            disabled={workspace === null || workspace.init_state !== 13 || workspace.state !== 1 || workspaceUrl === null}
                            variant={"outlined"}
                            color={"primary"}
                            onClick={() => {
                                window.open(config.coderPath + workspaceUrl, '_blank')
                            }} className={"open_button"}
                            sx={stepIndex === 1 ? {
                                zIndex: "600000",
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main + "25", 
                                }
                            } : {
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main + "25", 
                                }
                            }}
                        >
                            Open DevSpace
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        )
    }

    const setHighestScoreFunc = async (num: any) => {
        let res = await call(
            "/api/workspace/setHighestScore",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                highest_score: num.toString(),
            }
        )

        // if (res === undefined || res["message"] === undefined || res["message"] !== "success") {
        //     // swal("Unable to set highest score. Please try again.")
        // } else {
        //     // this.setState({
        //     //     highScore: num
        //     // })
        //     setHighestScore(num)
        // }

        if (res !== undefined && res["message"] !== undefined && res["message"] === "success") {
            setHighestScore(num)
        }
    }

    const twentyFortyEight = (score: number) => {
        if (highestScore !== null && score > highestScore) {
            setHighestScoreFunc(score)
        }
    }

    const render2048 = () => {
        return (
            <Grid item xs={"auto"}>
                <TwentyFortyEight scoreCallback={twentyFortyEight} highScore={highestScore}/>
            </Grid>
        )
    }

    function detectBrowser() {
        const userAgent = navigator.userAgent;

        if (userAgent.includes("Chrome")) {
            return "Google Chrome";
        } else if (userAgent.includes("Firefox")) {
            return "Mozilla Firefox";
        } else if (userAgent.includes("Safari")) {
            return "Apple Safari";
        } else if (userAgent.includes("Opera")) {
            return "Opera";
        } else if (userAgent.includes("Edge")) {
            return "Microsoft Edge";
        } else if (userAgent.includes("Trident") || userAgent.includes("MSIE")) {
            return "Internet Explorer";
        } else {
            return "Unknown browser";
        }
    }

    // @ts-ignore
    const renderTime = () => {
        let remainingTime = calculateRemainingTime()

        let formattedTime = ""
        if (remainingTime.hours !== null && remainingTime.hours > 0) {
            formattedTime += remainingTime.hours + "h"
        }
        if (remainingTime.minutes !== null && remainingTime.minutes > 0) {
            if (formattedTime.length > 0) {
                formattedTime += " "
            }
            formattedTime += remainingTime.minutes + "m"
        }
        return (
            <div className="time-wrapper" style={{width: "100%", display: "flex", justifyContent: "space-around"}}>
                <div className="time">{formattedTime}</div>
            </div>
        );
    };

    const timerProps = {
        size: 120,
        strokeWidth: 6
    };


    // Local state to hold the mode (simple or advanced)
    const [pageMode, setMode] = useState('advanced');
    const [oldMode, setOldMode] = useState('advanced');

    // useEffect to refresh the page when the mode changes
    useEffect(() => {
        ;
        if (pageMode === 'advanced' && oldMode !== 'advanced') {
            setOldMode('advanced');
            window.location.href = window.location.href.replace('launchpad', 'workspace');
            // window.location.reload();
        } else if (pageMode === 'simple' && oldMode !== 'simple') {
            setOldMode('simple');
            window.location.href = window.location.href.replace('workspace', 'launchpad');
            // window.location.reload();
        }
    }, [pageMode, oldMode]);

    const toggleMode = () => {
        setMode(prevMode => prevMode === 'simple' ? 'advanced' : 'simple');
    };

    const renderBody = () => {
        let ports = []

        if (workspace !== null) {
            //@ts-ignore
            ports = workspace["ports"]
            let remainingTime = calculateRemainingTime()

            // @ts-ignore
            return (
                <div>
                    <Grid container justifyContent="space-between" sx={{
                        flexGrow: 1,
                        paddingTop: "20px",
                        marginLeft: "3vw",
                        width: "81vw",
                        height: "70vh",
                        overflow: "hidden"
                    }}>
                        {(workspaceError === null) ? (
                            <Grid item xs={"auto"}>
                                <Card sx={{
                                    width: "35vw",
                                    height: "65vh",
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: progressColorBorder() + "75",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                    backgroundColor: "transparent",
                                    backgroundImage: "none",
                                }}>
                                    <div style={{
                                        width: "100%",
                                        height: "15vh",
                                        display: "flex",
                                        justifyContent: "center",
                                        paddingTop: "20px"
                                    }} className={"button"}>
                                        {workspace["state"] === 1 ? (
                                            <LoadingButton
                                                variant={"outlined"}
                                                sx={stepIndex === 2 ? {
                                                    height: "50px", zIndex: "600000",
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.warning.main + "25", 
                                                    }
                                                } : {
                                                    height: "50px",
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.warning.main + "25", 
                                                    }
                                                }}
                                                color={"warning"}
                                                loading={loadingWorkspaceTransition}
                                                onClick={() => stopWorkspace()}
                                            >
                                                {"Stop DevSpace"}
                                            </LoadingButton>
                                        ) : workspace["state"] === 3 ? (
                                            <LoadingButton
                                                variant={"outlined"}
                                                sx={stepIndex === 2 ? {
                                                    height: "50px", zIndex: "600000",
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.primary.main + "25", 
                                                    }
                                                } : {
                                                    height: "50px",
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.primary.main + "25", 
                                                    }
                                                }}
                                                loading={loadingWorkspaceTransition}
                                                onClick={() => startWorkspace()}
                                            >
                                                {"Start DevSpace"}
                                            </LoadingButton>
                                        ) : (
                                            <LoadingButton 
                                                variant={"outlined"}
                                                sx={stepIndex === 2 ? {
                                                    height: "50px", zIndex: "600000",
                                                } : {
                                                    height: "50px",
                                                }}
                                                disabled
                                            >
                                                {"DevSpace Transitioning"}
                                            </LoadingButton>
                                        )}
                                    </div>
                                    <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                                        {
                                            (workspace.state < 2) ? "Auto Close In:" : "Data Cleanup In:"
                                        }
                                    </div>
                                    <div style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "space-around",
                                        paddingTop: "10px",
                                    }}>
                                        {
                                            (workspace.state < 2) ? (
                                                <CountdownCircleTimer
                                                    {...timerProps}
                                                    key={"active"}
                                                    rotation={"counterclockwise"}
                                                    size={200}
                                                    strokeWidth={15}
                                                    //@ts-ignore
                                                    colors={[theme.palette.primary.main, theme.palette.warning, theme.palette.error, theme.palette.error]}
                                                    duration={(remainingTime.milliseconds === null || remainingTime.milliseconds <= 1_800_000) ? 1800 : remainingTime.milliseconds / 1000}
                                                    initialRemainingTime={
                                                        // convert remaining millis to seconds
                                                        (remainingTime.milliseconds !== null ? remainingTime.milliseconds : 0) / 1000
                                                    }
                                                    isPlaying={true}
                                                    updateInterval={1}
                                                >
                                                    {({elapsedTime, color}) => (
                                                        <span
                                                            style={stepIndex === 3 ? {color, zIndex: "6000000"} : {color}}
                                                            className={"circle"}>
                                                        {renderTime()}
                                                    </span>
                                                    )}
                                                </CountdownCircleTimer>
                                            ) : (
                                                <CountdownCircleTimer
                                                    {...timerProps}
                                                    key={"inactive"}
                                                    rotation={"counterclockwise"}
                                                    size={200}
                                                    strokeWidth={15}
                                                    //@ts-ignore
                                                    colors={[theme.palette.primary.main, theme.palette.warning, theme.palette.error, theme.palette.error]}
                                                    // colorsTime={[
                                                    //     86400,
                                                    //     3600,
                                                    //     1800,
                                                    //     0
                                                    // ]}
                                                    duration={(remainingTime.milliseconds === null || remainingTime.milliseconds <= 86_400_00) ? 86400 : remainingTime.milliseconds / 1000}
                                                    initialRemainingTime={
                                                        // convert remaining millis to seconds
                                                        (remainingTime.milliseconds !== null ? remainingTime.milliseconds : 0) / 1000
                                                    }
                                                    isPlaying={true}
                                                    updateInterval={1}
                                                >
                                                    {({elapsedTime, color}) => (
                                                        <span
                                                            style={stepIndex === 3 ? {color, zIndex: "6000000"} : {color}}
                                                            className={"circle"}>
                                                        {renderTime()}
                                                    </span>
                                                    )}
                                                </CountdownCircleTimer>
                                            )
                                        }
                                    </div>
                                    <div>
                                        <div style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            paddingTop: "50px",
                                            paddingBottom: "10px",
                                            zIndex: "600000"
                                        }}>
                                            Ports
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            width: "100%",
                                            justifyContent: "space-between",
                                            flexWrap: "wrap"
                                        }}>
                                            {(ports !== null) ? ports.map((port: { name: string; port: string; url: string, disabled: boolean }, index: any) => {
                                                return (
                                                    <div style={{
                                                        width: "45%",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        height: "60px",
                                                        paddingBottom: "20px"
                                                    }}>
                                                        <a href={port.url} target={"_blank"}>
                                                            <Button 
                                                                variant={"outlined"} 
                                                                disabled={port.disabled}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: theme.palette.primary.main + "25", 
                                                                    }
                                                                }}
                                                            >
                                                                {port.name !== "" ? port.name + "  -  " + port.port : port.port}
                                                            </Button>
                                                        </a>
                                                    </div>
                                                )
                                            }) : (<div/>)}
                                        </div>
                                    </div>
                                </Card>
                            </Grid>
                        ) : (
                            <Grid item xs={"auto"}>
                                <Card sx={{
                                    width: "35vw",
                                    height: "65vh",
                                    borderRadius: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    overflowY: "auto",
                                    border: 1,
                                    borderColor: progressColorBorder() + "75",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                    backgroundColor: "transparent",
                                    backgroundImage: "none",
                                }}>
                                    {/* center the header and pin it to the top of the card*/}
                                    <Typography variant={"h4"} style={{
                                        color: theme.palette.error.main,
                                        paddingTop: "20px",
                                        paddingBottom: "20px",
                                    }}>
                                        DevSpace Error
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemText
                                                primary="Error"
                                                secondary={
                                                    <pre style={{
                                                        whiteSpace: "pre-wrap",
                                                        fontFamily: "monospace",
                                                        backgroundColor: `#151515`,
                                                        padding: "10px",
                                                        borderRadius: "5px",
                                                        overflowX: "auto",
                                                        maxWidth: "33vw"
                                                    }}>
                                                        {workspaceError.stderr.trim() !== "" ? workspaceError.stderr : "An unknown error has occurred."}
                                                    </pre>
                                                }
                                            />
                                        </ListItem>
                                        {workspaceError.command.trim().length > 0 &&
                                            <>
                                                <ListItem>
                                                    <ListItemText
                                                        primary="Command"
                                                        secondary={
                                                            <pre style={{
                                                                whiteSpace: "pre-wrap",
                                                                fontFamily: "monospace",
                                                                backgroundColor: `#151515`,
                                                                padding: "10px",
                                                                borderRadius: "5px",
                                                                overflowX: "auto",
                                                                maxWidth: "33vw"
                                                            }}>
                                                                {workspaceError.command}
                                                            </pre>
                                                        }
                                                    />
                                                </ListItem>
                                            </>
                                        }
                                        {workspaceError.status != -1 &&
                                          <>
                                            <ListItem>
                                              <ListItemText
                                                primary="Status"
                                                secondary={workspaceError.status}
                                              />
                                            </ListItem>
                                          </>
                                        }
                                        {workspaceError.stdout.trim().length > 0 &&
                                            <>
                                                <ListItem>
                                                    <ListItemText
                                                        primary="Out"
                                                        secondary={
                                                            <pre style={{
                                                                whiteSpace: "pre-wrap",
                                                                fontFamily: "monospace",
                                                                backgroundColor: `#151515`,
                                                                padding: "10px",
                                                                borderRadius: "5px",
                                                                overflowX: "auto",
                                                                maxWidth: "33vw"
                                                            }}>
                                                                {workspaceError.stdout}
                                                            </pre>
                                                        }
                                                    />
                                                </ListItem>
                                            </>
                                        }
                                    </List>
                                </Card>
                            </Grid>
                        )}
                        <div
                            style={stepIndex === 4 ? {width: "43%", display: "flex", justifyContent: "center", zIndex: "600000"} : {width: "43%", display: "flex", justifyContent: "center"}}
                            className={"game"}>
                            {render2048()}
                        </div>
                    </Grid>
                    <Box style={{ width: "10%", position: "absolute", top: "95%", left: "11%" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={pageMode === 'advanced'}
                                    onChange={toggleMode}
                                    name="modeSwitch"
                                />
                            }
                            label={pageMode.toUpperCase()}
                        />
                    </Box>
                </div>
            )
        } else {
            return (
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    style={{ transform: 'translate(-50%, -50%)' }}
                >
                    <CircularProgress color="inherit" />
                </Box>
            )
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Typography
                    component={"div"}
                    variant={"h3"}
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "left",
                        paddingBottom: "10px",
                        paddingLeft: "3vw"
                    }}
                >
                    {
                        "DevSpace Status"
                    }
                </Typography>
                {xpPopup ? (<XpPopup oldXP={
                    //@ts-ignore
                    (xpData["xp_update"]["old_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]} levelUp={xpData["level_up_reward"] === null ? false : true} homePage={false} popupClose={null} maxXP={100} newXP={(xpData["xp_update"]["new_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]} nextLevel={xpData["xp_update"]["next_level"]} gainedXP={xpData["xp_update"]["new_xp"] - xpData["xp_update"]["old_xp"]} reward={xpData["level_up_reward"]} renown={xpData["xp_update"]["current_renown"]}/>) : null}
                <div style={{display: "flex", justifyContent: "center", width: "100%"}}>
                    {renderStatusBar()}
                </div>
                <div style={{display: "flex", justifyContent: "center", width: "100%"}}>
                    {renderBody()}
                </div>
            </CssBaseline>
        </ThemeProvider>
    )
}

export default WorkspaceAdvancedPage;