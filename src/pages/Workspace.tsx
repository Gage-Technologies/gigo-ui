import * as React from "react";
import {ElementType, useCallback, useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
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
import {useLocation, useParams} from "react-router";
import call from "../services/api-call";
import {Workspace, WorkspaceInitFailure} from "../models/workspace";
import config from "../config";
import TwentyFortyEight from "../components/Games/TwentyFortyEight";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {
    initialAuthStateUpdate, selectAuthStateTutorialState,
    selectAuthStateUserName,
    updateAuthState
} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import CodeSource from "../models/codeSource";
import {CountdownCircleTimer} from "react-countdown-circle-timer";
import {LoadingButton} from "@mui/lab";
import useWebSocket from "react-use-websocket";
import XpPopup from "../components/XpPopup";
import Joyride, {ACTIONS, CallBackProps, EVENTS, STATUS} from "react-joyride";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import {ThreeDots} from "react-loading-icons";
import LaunchPadRocket from "../components/Icons/launch-pad-rocket";
import LaunchPadRocketIcon from "../components/Icons/launch-pad-rocket";
import LaunchPadIcon from "../components/Icons/LaunchPad";
import LottieAnimation from "../components/LottieAnimation";
import * as animationData from "../img/launch-pad-smoke.json";
import {useGlobalWebSocket} from "../services/websocket";
// @ts-ignore
import * as animationDataStopped from "../img/launch-page-stopped.json";
import Lottie from "react-lottie";
import {useSpring, animated, useSprings, SpringValues, useSpringRef} from 'react-spring';
// @ts-ignore
import * as fullRocket from "../img/rocket.json";
import { AwesomeButton } from "react-awesome-button";
import styled from "@emotion/styled";
import CardTutorial from "../components/CardTutorial";
import {setCache, deleteCache, clearCache, selectCacheState} from '../reducers/pageCache/pageCache';
import {useSelector} from "react-redux";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import * as wsModels from "../models/websocket";


interface InitialStatusMessage {
    workspace: Workspace;
    code_source: CodeSource;
    workspace_url: string
}



const WorkspacePage = () => {

    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);

    const aspectRatio = useAspectRatio();

    // retrieve url params
    let {id} = useParams();

    let cacheKey = "launchpad::" + id
    const cache = useSelector(selectCacheState);

    let [initialProgress, setInitialProgress] = React.useState<number | 0>(
        cache[`${cacheKey}:initial_progress`] !== undefined ? cache[`${cacheKey}:initial_progress`].data as number : 0
    );

    useEffect(() => {
        if (initialProgress === 0) {
            dispatch(deleteCache(`${cacheKey}:initial_progress`));
        } else {
            console.log("initial_progress after set:", initialProgress);
            dispatch(setCache(`${cacheKey}:initial_progress`, initialProgress));
        }
    }, [initialProgress])


    // retrieve the query params from the url
    const query = new URLSearchParams(window.location.search);

    // initialize to true if editor mode is on
    const [showIframe, setShowIframe] = useState<boolean>(query.get("editor") === "true");
    const [showDesktopIframe, setShowDesktopIframe] = useState<string | null>(query.get("desktop"));

    console.log("showDesktopIframe:", showDesktopIframe);

    let navigate = useNavigate();

    // retrieve theme from local storage
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    let [launchingAnim, setLaunchingAnim] = useState(false);

    // create state variables
    let [initialized, setInitialized] = React.useState<boolean>(false);
    let [workspace, setWorkspace] = React.useState<Workspace | null>(null);
    let [lastWorkspace, setLastWorkspace] = React.useState<Workspace | null>(null);
    const [workspaceError, setWorkspaceError] = React.useState<WorkspaceInitFailure | null>(null);
    const workspaceRef = React.useRef<Workspace | null>(workspace);
    let [workspaceUrl, setWorkspaceUrl] = React.useState<string | null>(null);
    let [codeSource, setCodeSource] = React.useState<CodeSource | null>(null);
    let [isVNC, setVNC] = React.useState<boolean>(false);
    let [iframeUrl, setIframeUrl] = React.useState<string | null>(null);

    let [expiration, setExpiration] = React.useState<number | null>(null);
    const [highestScore, setHighestScore] = React.useState<number | null>(0);

    const [xpPopup, setXpPopup] = React.useState(false)
    const [xpData, setXpData] = React.useState(null)

    const tutorialState = useAppSelector(selectAuthStateTutorialState)
    const [runTutorial, setRunTutorial] = React.useState(!tutorialState.vscode)

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playMicrowaveDing = () => {
        const frequencies = [523.25, 659.25, 783.99]; // Two selected frequencies
        const duration = 0.1; // 0.5 second duration for each chime
        const delayTimes = [0, 0.25, 0.5]; // Start times for each chime

        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + delayTimes[index]);

            gainNode.gain.setValueAtTime(0, audioContext.currentTime + delayTimes[index]);
            gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + delayTimes[index] + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delayTimes[index] + duration);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(audioContext.currentTime + delayTimes[index]);
            oscillator.stop(audioContext.currentTime + delayTimes[index] + duration);
        });
    };

    const [hasPlayed, setHasPlayed] = useState(false);


    useEffect(() => {
        if (workspace === null || workspace.state === null) {
            return;
        }

        if (workspace.state === 1 && !hasPlayed && !window.location.href.includes("editor=true")) {
            playMicrowaveDing();
            setHasPlayed(true);
        }

        // Reset `hasPlayed` if needed
        if (workspace.state > 1) {
            setHasPlayed(false);
        }
    }, [workspace]); // Include dependencies if needed

    const [steps, setSteps] = React.useState([
        {
            content: (
                <div>
                    <h2>Welcome to the GIGO Workspace system!</h2>
                    <p>On GIGO, we use Cloud Development Environments (Workspaces) to make working on complicated projects super easy! Finish the tutorial to learn how to interact with the Workspace page.</p>
                </div>
            ),
            target: 'body',
            placement: 'center'
        },
        {
            content: (
                <div>
                    <h2>Workspace Status</h2>
                    <p>This is the Workspace's status bar. Workspaces start in the provisioning state but will show a progress bar once the workspace begins to start.</p>
                </div>
            ), 
            target: '.bar', 
            disableBeacon: true
        }, 
        {
            content: (
                <div>
                    <h2>Opening the Workspace</h2>
                    <p>Once the workspace has finished initializing and is ready to be used, the 'Open Workspace' button will light up. If you click the 'Open Workspace' button the workspace will be opened in a new tab.</p>
                </div>
            ), 
            target: '.open_button'
        }, 
        {
            content: (
                <div>
                    <h2>Starting & Stopping the Workspace</h2>
                    <p>Workspaces are automtically stopped after 10m of inactivity. If your workspace stops and you want to start it again, you can use the button here to start it.</p>
                </div>
            ), 
            target: '.button'
        }, 
        {
            content: (
                <div>
                    <h2>Workspace Lifecycle</h2>
                    <p>Workspaces are automtically stopped after 10m of inactivity and deleted after 24h of inactivity. You can see the time left between, each stage of the lifecycle here.</p>
                </div>
            ),
            target: '.circle'
        }, 
        {
            content: (
                <div>
                    <h2>While You Wait</h2>
                    <p>Some workspaces can take awhile to start. If you're bored or just like a challenge, try your hand at 2048!</p>
                </div>
            ),
            target: '.game'
        },
        {
            content: (
                <div>
                    <h2>Firefox Warning</h2>
                    <p>We noticed that you're using Firefox. Firefox is a great browser and we love it but we've noticed that there can be some connectivity issues with Firefox when using workspaces. If you notice anything funky you might want to try another browser.</p>
                </div>
            ),
            target: 'body',
            placement: 'center'
        }
    ]);

    const tutorial = false

    const [run, setRun] = React.useState(false)
    const dispatch = useAppDispatch();

    const [stepIndex, setStepIndex] = React.useState(0)

    let [loadingWorkspaceTransition, setLoadingWorkspaceTransition] = React.useState<boolean>(false);

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
            console.log("websocket json decode error: ", e);
            return
        }

        if (jsonMessage === null) {
            console.log("unexpected null message")
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

        console.log("workspace error found: ", workspace.state)

        // handle workspace failure
        if (workspace.init_failure !== null && workspace.init_failure.stderr !== "" && workspace.state === 5) {

            setWorkspaceError(workspace.init_failure)
        } else {
            setWorkspaceError(null)
        }

        // handle status updates
        setWorkspace(workspace)

        // update isVNC ref
        if (!isVNC && workspace.is_vnc) {
            setVNC(true)
        }

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

        if (expiry.getTime() !== expiration) {
            setExpiration(expiry.getTime())
        }
    }

    const [lottieBackground, setLottieBackground] = React.useState(null)
    const [lottieStopped, setLottieStoppedBackground] = React.useState(null)

    useEffect(() => {

        if (lottieBackground === undefined || lottieBackground === null) {
            fetch(`${config.rootPath}/static/ui/lottie/general/launch-page-provisioning-reg.json`, {credentials: 'include'})
                .then(data => {
                    data.json().then(json => {
                        setLottieBackground(json)
                    })
                })
                .catch(error => console.error(error));

        }

        if (lottieStopped === undefined || lottieStopped === null) {
            fetch(`${config.rootPath}/static/ui/lottie/general/launch-page-stopped.json`, {credentials: 'include'})
                .then(data => {
                    data.json().then(json => {
                        setLottieStoppedBackground(json)
                    })
                })
                .catch(error => console.error(error));

        }
    },[])

    useEffect(() => {
        console.log('workspaceError after set:', workspaceError);
    }, [workspaceError]);

    useEffect(() => {
        if (!initialized) {
            setTimeout(() => {
                setRun(tutorial)
                setInitialized(true)
            }, 600)
        }
    }, [workspace])

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
        console.log("attemptXP in workspace: ", xpAttempt)
        if (xpAttempt !== "undefined" && xpAttempt !== null) {
            setXpPopup(true)
            setXpData(JSON.parse(xpAttempt))
        }
        getHighestScore()
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
        // if (workspace.state === 0 && workspace.init_state === 0) {
        //     return "indeterminate"
        // }

        return "determinate"
    }

    /**
     * Calculates the value of the progress bar with awarness of the state
     */
    const progressValue = () => {
        // default to undefined
        if (workspace === null) {
            return 0
        }

        // undefined for untracked transition states
        if (workspace.state === 2 || workspace.state === 4) {
            return 0
        }

        // handle starting state when in provisioning since we don't have good feedback here
        if (workspace.state === 0 && workspace.init_state === 0) {
            return (6 / 14) * 100
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

    // @ts-ignore
    // const initialProgress = localStorage.getItem('currentProgress') ? parseInt(localStorage.getItem('currentProgress')) : 0;
    const [currentProgress, setCurrentProgress] = useState(initialProgress);

    console.log("initialProgress: ", initialProgress)

    const targetProgress = progressValue(); // replace this with your actual target value function
    const progressIncrement = 1; // set the increment value

    useEffect(() => {
        // Only set the interval if targetProgress has changed
        if (currentProgress !== targetProgress && workspace !== null && workspace.init_state !== null && workspace.init_state > 0) {
            const timer = setInterval(() => {
                if (currentProgress < targetProgress) {
                    setCurrentProgress(prev => {
                        const newValue = Math.min(prev + progressIncrement, targetProgress);
                        localStorage.setItem('currentProgress', newValue.toString()); // Save to localStorage
                        setInitialProgress(newValue)
                        return newValue;
                    });
                }
            }, 100); // 100ms interval, adjust this value based on your animation needs

            return () => {
                clearInterval(timer);
            };
        }else if (currentProgress !== targetProgress && workspace !== null && workspace.init_state !== null && workspace.init_state === 0) {
            const timer = setInterval(() => {
                if (currentProgress < targetProgress) {
                    setCurrentProgress(prev => {
                        const newValue = Math.min(prev + progressIncrement, targetProgress);
                        localStorage.setItem('currentProgress', newValue.toString()); // Save to localStorage
                        setInitialProgress(newValue)
                        return newValue;
                    });
                }
            }, 1000); // 100ms interval, adjust this value based on your animation needs

            return () => {
                clearInterval(timer);
            };
        }
    }, [targetProgress, currentProgress]);

    const [slideOut, setSlideOut] = useState(false);


    useEffect(() => {
        if (workspace === null || workspace.init_state === undefined) {
            return
        }

        if (workspace.init_state > 0) {
            setSlideOut(true);
        }
    }, [workspace]);

    // useEffect(() => {
    //     const defaultWorkspace: Workspace = {
    //         state: 0,
    //         init_state: 0,
    //         code_source_id: "",
    //         code_source_type: 0,
    //         code_source_type_string: "",
    //         repo_id: "",
    //         created_at: "",
    //         owner_id: "",
    //         expiration: "",
    //         commit: "",
    //         init_failure: null,
    //         state_string: "",
    //         init_state_string: "",
    //         _id: id !== undefined ? id : "",
    //     };
    //     setWorkspace(defaultWorkspace);
    //
    //
    //     setTimeout(() => {
    //         let w = JSON.parse(JSON.stringify(defaultWorkspace)) as Workspace;
    //         let w2 = JSON.parse(JSON.stringify(defaultWorkspace)) as Workspace;
    //         w2.init_state = 0
    //         w2.state = 0
    //         setLastWorkspace(w2)
    //         w.init_state = 5;
    //         w.state = 0;
    //         setWorkspace(w);
    //     }, 2000)
    //
    //
    //     setTimeout(() => {
    //         let w = JSON.parse(JSON.stringify(defaultWorkspace)) as Workspace;
    //         let w2 = JSON.parse(JSON.stringify(defaultWorkspace)) as Workspace;
    //         w2.init_state = 1
    //         w2.state = 0
    //         setLastWorkspace(w2)
    //         w.init_state = 13;
    //         w.state = 1;
    //         setWorkspace(w);
    //     }, 10000)
    //     //
    //     // setTimeout(() => {
    //     //     let w = JSON.parse(JSON.stringify(defaultWorkspace)) as Workspace;
    //     //     let w2 = JSON.parse(JSON.stringify(defaultWorkspace)) as Workspace;
    //     //     w2.init_state = 5
    //     //     w2.state = 0
    //     //     setLastWorkspace(w2)
    //     //     w.init_state = 12;
    //     //     w.state = 0;
    //     //     setWorkspace(w);
    //     // }, 15000)
    //     //
    //     // setTimeout(() => {
    //     //     let w = JSON.parse(JSON.stringify(defaultWorkspace)) as Workspace;
    //     //     let w2 = JSON.parse(JSON.stringify(defaultWorkspace)) as Workspace;
    //     //     w2.init_state = 12
    //     //     w2.state = 0
    //     //     setLastWorkspace(w2)
    //     //     w.init_state = 13;
    //     //     w.state = 1;
    //     //     setWorkspace(w);
    //     // }, 20000)
    //     //
    //     // setTimeout(() => {
    //     //     let w = JSON.parse(JSON.stringify(defaultWorkspace)) as Workspace;
    //     //     let w2 = JSON.parse(JSON.stringify(defaultWorkspace)) as Workspace;
    //     //     w2.init_state = 13
    //     //     w2.state = 1
    //     //     setLastWorkspace(w2)
    //     //     w.init_state = 13;
    //     //     w.state = 2;
    //     //     setWorkspace(w);
    //     // }, 25000)
    // }, [])

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


    const handleLaunch =  () => {
        // @ts-ignore
        // console.log("workspace state before change", workspace.init_state)
        localStorage.setItem('currentProgress', "0");
        setCurrentProgress(0);
        setLaunchingAnim(true)
        if (workspace!== null && workspace.init_state!== null){
            workspace.state = 0
            workspace.init_state = 0
        }
        startWorkspace()
    }

    const handleStop =  () => {
        localStorage.setItem('currentProgress', "0"); // Save to localStorage
        setLaunchingAnim(false)
        stopWorkspace()
    }

    useEffect(() => {
        console.log("updating iframe url: ", isVNC)
        if (workspace !== null && workspace.init_state === 13 && workspace.state === 1 || workspaceUrl !== null) {
            if (isVNC) {
                setIframeUrl(window.location.href.split("?")[0] + "?editor=true&desktop=none")
            } else {
                setIframeUrl(window.location.href.split("?")[0] + "?editor=true")
            }
        }
    }, [workspace, workspaceUrl, isVNC])


    // const handleMouseDown = (event: any) => {
    //     console.log("button type: ", event.button)
    //     switch (event.button) {
    //         case undefined: // Mobile
    //         case 0:  // Left click
    //             console.log("vnc: ", isVNCRef.current)
    //             // setShowIframe(true);
    //             // update the current page url to set the query string
    //             window.history.replaceState({}, "", window.location.href.split("?")[0] + "?editor=true");
    //             if (isVNCRef.current) {
    //                 setShowDesktopIframe("none")
    //                 window.history.replaceState({}, "", window.location.href.split("?")[0] + "?editor=true&desktop=none");
    //             }
    //
    //             window.location.reload();
    //             break;
    //         case 1:  // Middle click
    //             window.open(config.coderPath + workspaceUrl, '_blank');
    //             break;
    //         // No case for right click as the context menu will be handled by <a> tag
    //         default:
    //             break;
    //     }
    // };

    useEffect(() => {
        // Callback to run when workspace.state changes
        if (workspace !== null && workspace.state !== null && workspace.state !== 1 && showIframe) {
            setShowIframe(false);
            setShowDesktopIframe("none")
            window.history.replaceState({}, "", window.location.href.split("?")[0] + "");
            window.location.reload();
        }
    }, [workspace]);

    /**
     * Renders top status bar
     */
    const renderStatusBar = () => {
        return (
            <>
                {/*<div style={{width: "60%"}}/>*/}
                <div style={{
                    width: "70%",

                    top: "0%",
                }}>
                    <LinearProgress
                        sx={{
                            width: "40%",
                            height: "3vh",
                            left: "14vw",
                            minHeight: "7px",
                            borderRadius: 1,

                        }}
                        color={progressColor()}
                        variant={progressType()}
                        value={progressValue()}
                    />
                </div>
                {/*<Card                                                                  */}
                {/*    sx={{                                                              */}
                {/*        width: "81vw",                                                 */}
                {/*        height: "10vh",                                                */}
                {/*        minHeight: "85px",                                             */}
                {/*        marginLeft: "3vw",                                             */}
                {/*        marginTop: "1vh",                                              */}
                {/*        borderRadius: 1,                                               */}
                {/*        zIndex: tutorial && stepIndex === 0 ? "600000" : undefined,    */}
                {/*        border: 1,                                                     */}
                {/*        borderColor: progressColorBorder() + "75",                     */}
                {/*        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",                 */}
                {/*        backgroundColor: "transparent",                                */}
                {/*        backgroundImage: "none",                                       */}
                {/*    }}                                                                 */}
                {/*    className={"bar"}                                                  */}
                {/*>                                                                      */}
                {/*<Grid container justifyContent="space-around" sx={{*/}
                {/*    flexGrow: 1,*/}
                {/*    paddingTop: "20px",*/}
                {/*    minHeight: "85px"*/}
                {/*}}>*/}
                {/*    <Grid item xs={"auto"}>*/}
                {/*        <Typography component={"div"} variant="subtitle1">*/}
                {/*            State: {(workspace === null) ? "Pending" : workspace.state_string}*/}
                {/*        </Typography>*/}
                {/*    </Grid>*/}
                {/*    {*/}
                {/*        (workspace !== null && (workspace.state === 0 || workspace.state === 1)) ?*/}
                {/*            (*/}
                {/*                <Grid item xs={"auto"}>*/}
                {/*                    <Typography component={"div"} variant="subtitle1">*/}
                {/*                        Initialization: {workspace.init_state_string}*/}
                {/*                    </Typography>*/}
                {/*                </Grid>*/}
                {/*            ) : (*/}
                {/*                <></>*/}
                {/*            )*/}
                {/*    }*/}
                {/*    <Grid item xs={"auto"}>*/}
                {/*        <Typography component={"div"} variant="subtitle1">*/}
                {/*            Commit: {(workspace === null) ? "Pending" : workspace.commit}*/}
                {/*        </Typography>*/}
                {/*    </Grid>*/}
                {/*    <Grid item xs={"auto"}>*/}
                {/*        {renderCodeSourceLink()}*/}
                {/*    </Grid>*/}
                {/*    <Grid item xs={"auto"}>*/}
                {/*        <Button*/}
                {/*            disabled={workspace === null || workspace.init_state !== 13 || workspace.state !== 1 || workspaceUrl === null}*/}
                {/*            variant={"outlined"}*/}
                {/*            color={"primary"}*/}
                {/*            href={config.coderPath + workspaceUrl}*/}
                {/*            onMouseDown={handleMouseDown}*/}
                {/*            className={"open_button"}*/}
                {/*            sx={stepIndex === 1 ? {*/}
                {/*                zIndex: "600000",*/}
                {/*                '&:hover': {*/}
                {/*                    backgroundColor: theme.palette.primary.main + "25",*/}
                {/*                }*/}
                {/*            } : {*/}
                {/*                '&:hover': {*/}
                {/*                    backgroundColor: theme.palette.primary.main + "25",*/}
                {/*                }*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            Open Workspace*/}
                {/*        </Button>*/}
                {/*    </Grid>*/}
                {/*</Grid>*/}
                {/*</Card>  */}
            </>
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

    const [currentRemainingTime, setCurrentRemainingTime] = useState(calculateRemainingTime());

    useEffect(() => {
        // Set up interval to update remaining time every minute (or your preferred interval)
        const intervalId = setInterval(() => {
            setCurrentRemainingTime(calculateRemainingTime());
        }, 60000); // Update every 60,000 milliseconds (1 minute)

        // Cleanup interval on component unmount
        return () => {
            clearInterval(intervalId);
        };
    }, [calculateRemainingTime()]); // Empty dependency array means this effect runs once when the component mounts


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
            <span className="time">{formattedTime}</span>
        );
    };

    const timerProps = {
        size: 120,
        strokeWidth: 6
    };


    const AnimatedAwesomeButton = styled(AwesomeButton)`
      // border-radius: 25px;
      // transition: box-shadow 0.3s ease;
      // box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${theme.palette.primary.main}, 0 0 20px ${theme.palette.primary.main}, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main};
      //
      // &:hover {
      //   box-shadow: 0 0 3px #fff, 0 0 6px #fff, 0 0 9px ${theme.palette.primary.main}, 0 0 12px ${theme.palette.primary.main}, 0 0 15px ${theme.palette.primary.main}, 0 0 18px ${theme.palette.primary.main}, 0 0 21px ${theme.palette.primary.main};
      // }

     

      .aws-btn__wrapper:before {
            border-radius: 25px;
            transition: box-shadow 0.3s ease;
            box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${theme.palette.primary.main}, 0 0 20px ${theme.palette.primary.main}, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main};
        
            &:hover {
              box-shadow: 0 0 3px #fff, 0 0 6px #fff, 0 0 9px ${theme.palette.primary.main}, 0 0 12px ${theme.palette.primary.main}, 0 0 15px ${theme.palette.primary.main}, 0 0 18px ${theme.palette.primary.main}, 0 0 21px ${theme.palette.primary.main};
            }
        
            &:active {
              box-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px ${theme.palette.primary.main}, 0 0 8px ${theme.palette.primary.main}, 0 0 10px ${theme.palette.primary.main}, 0 0 12px ${theme.palette.primary.main}, 0 0 14px ${theme.palette.primary.main};
            }
        }
    `;


    // @ts-ignore
    if (workspace !== null && workspace.init_state !== null) {
        console.log("workspace sim state: ", workspace.init_state)
    }


    let buttonsAndProgressBar = () => {
        let button = (
            <LoadingButton
                variant={"outlined"}
                sx={stepIndex === 3 ? {
                    height: "40px", zIndex: "600000",
                    '&:hover': {
                        backgroundColor: theme.palette.primary.main + "25",
                    }
                } : {
                    height: "40px", zIndex: "600000",
                    '&:hover': {
                        backgroundColor: theme.palette.primary.main + "25",
                    }
                }}
                loading={loadingWorkspaceTransition}
                onClick={() => handleLaunch()}
            >
                {"Launch"}
            </LoadingButton>
        )

        if (workspace !== null) {
            if (workspace.state === 1) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "4.662vh", zIndex: "600000", top: "-1vh", width: "3.69vw",
                            '&:hover': {
                                backgroundColor: theme.palette.warning.main + "25",
                            }
                        }}
                        color={"warning"}
                        loading={loadingWorkspaceTransition}
                        onClick={() => handleStop()}
                    >
                        {"Stop"}
                    </LoadingButton>
                )
            } else if (workspace.state === 2) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                        }}
                        disabled
                    >
                        {"Stopping"}
                    </LoadingButton>
                )
            } else if (workspace.state === 3) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px", zIndex: "600000",
                            '&:hover': {
                                backgroundColor: theme.palette.primary.main + "25",
                            }
                        }}
                        loading={loadingWorkspaceTransition}
                        onClick={() => handleLaunch()}
                    >
                        {"Launch"}
                    </LoadingButton>
                )
            } else if (workspace.state === 4) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                        }}
                        disabled
                    >
                        {"Removing"}
                    </LoadingButton>
                )
            } else if (workspace.state === 5) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                        }}
                        disabled
                    >
                        {"Launch Failure"}
                    </LoadingButton>
                )
            } else if (workspace.state === 6) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                        }}
                        disabled
                    >
                        {"Deleted"}
                    </LoadingButton>
                )
            } else if (workspace.state === 0 && workspace.init_state === 0) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={stepIndex === 3 ? {
                            height: "40px", zIndex: "600000",
                        } : {
                            height: "40px", zIndex: "600000",
                        }}
                        disabled
                    >
                        {"Uplink Starting"}
                    </LoadingButton>
                )
            } else if (workspace.state === 0 && workspace.init_state >= 1) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px", zIndex: 4,
                        }}
                        disabled
                    >
                        {"Fueling Rocket"}
                    </LoadingButton>
                )
            }
        }

        return (
            <div style={{
                width: "100%",
                height: "15vh",
                display: "flex",
                justifyContent: "center",
                paddingTop: "20px",
                overflow: "hidden"
            }} className={"button"}>
                <LinearProgress
                    sx={{
                        position: "absolute",
                        width: "55vh",
                        height: "3vh",
                        top: "80%",
                        left:
                            sidebarOpen ?
                                aspectRatio === "21:9" ? "40.5vw" : "51%"
                            : chatOpen ?
                                aspectRatio === "21:9" ? "31vw" : "37%"
                            :
                                aspectRatio === "21:9" ? "36%" : "45%",
                        minHeight: "7px",
                        borderRadius: 5,
                        transform: "rotate(270deg)",
                        transformOrigin: "left bottom"
                    }}
                    color={progressColor()} // replace with your function
                    variant={progressType()} // replace with your function
                    value={currentProgress}
                />
                <div style={{
                    position: "absolute",
                    width: `calc(55vh * ${currentProgress / 100} - 30px)`,
                    height: "1vh",
                    // top: "calc(80% + 5px)",
                    top: "80.9vh",
                    left:
                        sidebarOpen ?
                            aspectRatio === "21:9" ? "40vw" : "50.15vw"
                        : chatOpen ?
                            aspectRatio === "21:9" ? "30.4vw" : "36.15vw"
                        :
                            aspectRatio === "21:9" ? "calc(35.85% - 12px)" : "44.15vw",
                    borderRadius: 10,
                    backgroundColor: "white",
                    opacity: "30%",
                    transform: "rotate(270deg)",
                    transformOrigin: "left bottom"
                }}/>
                {button}
            </div>
        );
    }

    let progressBarMobile = () => {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "20px",
                overflow: "hidden"
            }} className={"button"}>
                <LinearProgress
                    sx={{
                        position: "absolute",
                        width: "90vw",
                        height: "23px",
                        top: (workspace === null || workspace.init_state !== 13 || workspace.state !== 1 || workspaceUrl === null) ? "150px" : "300px",
                        left: "5vw",
                        minHeight: "7px",
                        borderRadius: 5,
                        // transform: "rotate(270deg)",
                        transformOrigin: "left bottom"
                    }}
                    color={progressColor()} // replace with your function
                    variant={progressType()} // replace with your function
                    value={currentProgress}
                />
                <div style={{
                    position: "absolute",
                    width: `calc(90vw * ${currentProgress / 100} - 30px)`,
                    height: "7px",
                    // top: "calc(80% + 5px)",
                    top: (workspace === null || workspace.init_state !== 13 || workspace.state !== 1 || workspaceUrl === null) ? "154px" : "304px",
                    left: "calc(5vw + 15px)",
                    borderRadius: 10,
                    backgroundColor: "white",
                    opacity: "30%",
                    // transform: "rotate(270deg)",
                    transformOrigin: "left bottom"
                }}/>
            </div>
        );
    }

    const getSyncedWorkspaceStates = (wsOverride: Workspace | null = null): {state: number, init_state: number} => {
        let ws = wsOverride !== null ? wsOverride : workspace;

        if (ws === null) {
            console.log("workspace synced state: ", {
                state: 0,
                init_state: 0
            })
            return {
                state: 0,
                init_state: 0
            };
        }

        if (ws.state === 0 && ws.init_state === 14) {
            console.log("workspace synced state: ", {
                state: 0,
                init_state: 3
            })
            return {
                state: 0,
                init_state: 3
            }
        }

        console.log("workspace synced state: ", {
            init_state: ws.init_state,
            state: ws.state
        })
        return {
            init_state: ws.init_state,
            state: ws.state
        }
    }

    // Create the animated props using useSpring
    const satAnimPropsActiveRef = useSpringRef()
    const satAnimPropsActive = useSpring({
        ref: satAnimPropsActiveRef,
        from: { transform: 'translate3d(0,0px,0)' },
        to: { transform: 'translate3d(0,-500px,0)' },
        config: { duration: 10000 }, // Animation duration: 10 seconds
        reset: true,
    });
    const rocketAnimPropsActiveRef = useSpringRef();
    const rocketAnimPropsActive = useSpring({
        ref: rocketAnimPropsActiveRef,
        from: { transform: 'translate3d(0,1000px,0)' },
        to: { transform: 'translate3d(0,0px,0)' },
        config: { duration: 10000 }, // Animation duration: 10 seconds
        reset: true,
    });
    const lpAnimPropsActiveRef = useSpringRef();
    const lpAnimPropsActive = useSpring({
        ref: lpAnimPropsActiveRef,
        from: { transform: 'translate3d(0,0px,0)' },
        to: { transform: 'translate3d(0,1700px,0)' },
        config: { duration: 5000 }, // Animation duration: 5 seconds
        reset: true,
    });

    const handleAnimationTriggers = (ws: Workspace | null, lastWS: Workspace | null) => {
        let currentStates = ws;
        let lastStates = lastWS;

        if (currentStates === null || lastStates === null || currentStates.init_state === undefined || lastStates.init_state === undefined) {
            return;
        }

        if (currentStates.state === 1 && currentStates.state !== lastStates.state) {
            lpAnimPropsActiveRef.update({reset: true});
            lpAnimPropsActiveRef.start();
            lpAnimPropsActiveRef.update({reset: false});
        }

        if (currentStates.init_state > 0 && lastStates.init_state === 0) {
            satAnimPropsActiveRef.update({reset: true});
            rocketAnimPropsActiveRef.update({reset: true});
            satAnimPropsActiveRef.start();
            rocketAnimPropsActiveRef.start();
            satAnimPropsActiveRef.update({reset: false});
            rocketAnimPropsActiveRef.update({reset: false});
        }
    }

    useEffect(() => {
        handleAnimationTriggers(workspace, lastWorkspace);
    }, [workspace, lastWorkspace]);

    const renderProvisioningSatAnim = () => {
        let states = getSyncedWorkspaceStates();

        if (states.state !== 0) {
            return null
        }

        let wrapperId = "sat-at-rest"
        let animationStyle = {};
        let AnimationWrapper: ElementType = 'div';
        if (states.state === 0 && states.init_state > 0) {
            AnimationWrapper = animated.div;
            // @ts-ignore
            animationStyle = satAnimPropsActive;
            wrapperId = "sat-leaving-screen"
        }

        return (
            <AnimationWrapper id={wrapperId} style={animationStyle}>
                <LottieAnimation
                    animationData={lottieBackground} // Replace with your actual animation data
                    loop={true}
                    autoplay={true}
                    renderer="svg"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        zIndex: 2,
                        transform: 'translate(-50%, -50%)',
                    }}/>
            </AnimationWrapper>
        )
    }

    const renderPostProvisioningRocketAnim = () => {
        let states = getSyncedWorkspaceStates();

        if (states.state !== 0 || states.init_state === 0) {
            return null
        }

        return (
            <animated.div id={"rocket-entry"} style={rocketAnimPropsActive}>
                {/*launch pad smoke */}
                <Lottie
                    options={{
                        // @ts-ignore
                        initialSegment: [42,56],
                        animationData: animationData,
                        rendererSettings: {
                            preserveAspectRatio: 'xMidYMid slice'
                        }
                    }}
                    // width={700}
                    // height={770}
                    width="36.458vw"
                    height="93.24vh"
                    style={{
                        position: "absolute",
                        // left: -30,
                        left: aspectRatio === "21:9" ? "-5vw" : "-1.5625vw",
                        // bottom: -206,
                        bottom: "-24.009vh",
                        zIndex: 2,
                    }}
                />
                <Lottie
                    options={{
                        // @ts-ignore
                        initialSegment: [42,75],
                        animationData: animationData,
                        rendererSettings: {
                            preserveAspectRatio: 'xMidYMid slice'
                        }
                    }}
                    // width={700}
                    // height={800}
                    width="36.458vw"
                    height="93.24vh"
                    style={{
                        position: "absolute",
                        // left: -30,
                        left: aspectRatio === "21:9" ? "-5vw" : "-1.5625vw",
                        // bottom: -210,
                        bottom: "-24.009vh",
                        zIndex: 2,
                    }}
                />

                {/*launch pad svg*/}
                {/*<animated.div style={animatedLaunchPadProps}>*/}
                {/*top: 10*/}
                {/*left: -120*/}
                <div>
                    <LaunchPadIcon style={{position: 'absolute', top: "1.166vh", left: aspectRatio === "21:9" ? "-4.8vw" : "-6.25vw", zIndex: 1, height: "900%", width: "900%"}}/>
                </div>
                {/*</animated.div>*/}

                {/*non moving svg rocket*/}
                {/*top: -110*/}
                {/*left: -46*/}
                <div>
                    {/*<LaunchPadRocketIcon style={{position: 'absolute', top: -110, left: -46, zIndex: 99, height: 900, width: 750}} />*/}
                    <LaunchPadRocketIcon style={{position: 'absolute', top: "-12.821vh", left:  aspectRatio === "21:9" ? "-6.5vw" : "-2.396vw", zIndex: 99, height: "104.895vh", width: "39.0625vw"}} />
                </div>
            </animated.div>
        )
    }

    const renderActiveRocketLaunchAnim = () => {
        let states = getSyncedWorkspaceStates();

        if (states.state !== 1) {
            return null
        }

        return (
            <>
                {/*launch pad moving down*/}
                <animated.div id={"landing-pad-drop"} style={lpAnimPropsActive}>
                    <div>
                        <LaunchPadIcon style={{position: 'absolute', top: 10, left: -120, zIndex: 1, height: "900%", width: "900%"}}/>
                    </div>
                </animated.div>
                {/*fully animated rocket*/}
                <div>
                    <Lottie
                        isClickToPauseDisabled={true}
                        options={{
                            loop: true,
                            autoplay: true,
                            animationData: fullRocket,
                            rendererSettings: {
                                preserveAspectRatio: 'xMidYMid slice'
                            }
                        }}
                        // width={700}
                        // height={800}
                        width={ aspectRatio === "21:9" ? "25vw" : "36.458vw"}
                        height={ aspectRatio === "21:9" ? "50vh" : "93.24vh"}
                        style={{position: 'absolute', top: aspectRatio === "21:9" ? "-12.821vh" : "-12.821vh", left: aspectRatio === "21:9" ? ".5vw" : ".521vw", zIndex: 3, height: aspectRatio === "21:9" ? "90vh" : "93.24vh", width: aspectRatio === "21:9" ? "25vw" : "33.854vw"}}
                    />
                </div>
            </>
        )
    }

    const renderNotActiveSpaceMan = () => {
        let states = getSyncedWorkspaceStates();
        if (states.state < 2) {
            return null
        }

        return (
            <Lottie
                isClickToPauseDisabled={true}
                options={{
                    loop: true,
                    autoplay: true,
                    animationData: animationDataStopped,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid slice'
                    }
                }}
                // width={600}
                // height={350}
                width="31.25vw"
                height="40.793vh"
                style={{
                    position: "absolute",
                    left: aspectRatio === "21:9" ? "-10%" : "0%",
                    // bottom: -450,
                    bottom: "-46.62vh",
                    zIndex: 2,
                }}
            />
        )
    }


    // Local state to hold the mode (simple or advanced)
    const [pageMode, setPageMode] = useState('simple');
    const [oldMode, setOldMode] = useState('simple');

    // useEffect to refresh the page when the mode changes
    useEffect(() => {
        console.log("Mode changed to " + pageMode + " from " + oldMode);
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

    const togglePageMode = () => {
        setPageMode(prevMode => prevMode === 'simple' ? 'advanced' : 'simple');
    };

    const renderBody = () => {
        let ports = []

        let styles = {
            lottie: {
                zIndex: 4,
                position: "absolute",
                top: 0,
                left: 0
            },
        };



        if (workspace !== null) {
            //@ts-ignore
            ports = workspace["ports"]
            let remainingTime = calculateRemainingTime()
            return (
                <div>

                    <div style={{position: "absolute", left:  aspectRatio === "21:9" ? "68.5%" :  "67%", top: aspectRatio === "21:9" ? "9%" : "10%", height: "auto", display: (workspace === null || workspace.init_state !== 13 || workspace.state !== 1 || workspaceUrl === null || iframeUrl === null) ? "none": "block"}}>
                        <AnimatedAwesomeButton
                            // @ts-ignore
                            href={iframeUrl}
                            type="primary"
                            style={{
                                marginBottom: '20px',
                                width: "auto",
                                '--button-default-height': '78px',
                                '--button-default-font-size': '23px',
                                '--button-default-border-radius': '25px',
                                ' --button-horizontal-padding': '20px',
                                '--button-raise-level': '10px',
                                '--button-hover-pressure': '4',
                                '--transform-speed':' 0.2s',
                                '--button-primary-border': 'none',
                                hover: {
                                    backgroundColor: theme.palette.primary.main + '25',
                                }
                            }}
                        >
                            Enter DevSpace
                        </AnimatedAwesomeButton>
                        <div style={{whiteSpace: 'nowrap', left: "-5%"}}>
                            Enter within the next: {renderTime()}
                        </div>

                    </div>
                    <Grid container justifyContent="space-between" sx={{
                        flexGrow: 1,
                        paddingTop: "20px",
                        marginLeft: "3vw",
                        width: "81vw",
                        height: "80vh",
                        overflow: "hidden"
                    }}>
                        {(workspaceError === null) ? (
                            <Grid item xs={"auto"}>
                                <Card sx={{
                                    width: aspectRatio === "21:9" ? "26.25vw" :  "35vw",
                                    height: "75vh",
                                    borderRadius: 1,
                                    border: 2.5,
                                    borderColor: progressColorBorder() + "75",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                    backgroundColor: "transparent",
                                    backgroundImage: "none",
                                }}>
                                    {buttonsAndProgressBar()}
                                    <div style={{position: 'relative'}}>
                                        {renderProvisioningSatAnim()}
                                        {renderPostProvisioningRocketAnim()}
                                        {renderActiveRocketLaunchAnim()}
                                        {renderNotActiveSpaceMan()}
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
                                                        wordWrap: "break-word",
                                                        fontFamily: "monospace",
                                                        backgroundColor: `#151515`,
                                                        padding: "10px",
                                                        borderRadius: "5px"
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
                                                                wordWrap: "break-word",
                                                                fontFamily: "monospace",
                                                                backgroundColor: `#151515`,
                                                                padding: "10px",
                                                                borderRadius: "5px"
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
                                                                wordWrap: "break-word",
                                                                fontFamily: "monospace",
                                                                backgroundColor: `#151515`,
                                                                padding: "10px",
                                                                borderRadius: "5px"
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


                    </Grid>
                    {/*<Grid item xs={"auto"}>*/}
                    <Grid item xs={"auto"}>
                        <Card sx={{
                            position: "absolute",
                            width: "35vw",
                            height: "77vh",
                            left: "55%",
                            top:"17.5%",
                            backgroundColor: "transparent",
                            backgroundImage: "none",
                            boxShadow: "none"
                        }}>
                            <div
                                style={stepIndex === 5 ? {position:  "absolute", width: "43%", display: "flex", justifyContent: "center", zIndex: "600000", top: "15%", left: "30%"} : {position:  "absolute", width: "43%", display: "flex", justifyContent: "center", top: "8%", left: "30%"}}
                                className={"game"}>
                                {render2048()}
                            </div>
                        </Card>
                    </Grid>
                    {/*</Grid>*/}
                    <Box style={{ width: "10%", position: "absolute", top: "95%", left: "11%" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={pageMode === 'advanced'}
                                    onChange={togglePageMode}
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
                <div className={"game"}>
                    <Grid container justifyContent="space-between" sx={{
                        flexGrow: 1,
                        paddingTop: "20px",
                        display: "flex",
                        justifyContent: "center",
                        marginLeft: "3vw",
                        width: "91vw",
                        top: "10%"
                    }}>
                        {render2048()}
                    </Grid>
                </div>
            )
        }
    }

    const renderBodyMobile = () => {
        let ports = []

        let styles = {
            lottie: {
                zIndex: 4,
                position: "absolute",
                top: 0,
                left: 0
            },
        };



        if (workspace !== null) {
            //@ts-ignore
            ports = workspace["ports"]
            let remainingTime = calculateRemainingTime()
            return (
                <div>
                    <div 
                        style={{
                            position: "absolute", 
                            left:  "calc(50vw - 107px)", 
                            top: "150px", 
                            height: "auto", 
                            display: (workspace === null || workspace.init_state !== 13 || workspace.state !== 1 || workspaceUrl === null || iframeUrl === null) ? "none": "block"
                        }}
                    >
                        <AnimatedAwesomeButton
                            // @ts-ignore
                            href={iframeUrl}
                            type="primary"
                            style={{
                                marginBottom: '20px',
                                width: "auto",
                                '--button-default-height': '78px',
                                '--button-default-font-size': '23px',
                                '--button-default-border-radius': '25px',
                                ' --button-horizontal-padding': '20px',
                                '--button-raise-level': '10px',
                                '--button-hover-pressure': '4',
                                '--transform-speed':' 0.2s',
                                '--button-primary-border': 'none',
                                hover: {
                                    backgroundColor: theme.palette.primary.main + '25',
                                }
                            }}
                        >
                            Enter DevSpace
                        </AnimatedAwesomeButton>
                        <div style={{whiteSpace: 'nowrap', left: "-5%"}}>
                            Enter within the next: {renderTime()}
                        </div>

                    </div>
                    <Grid container justifyContent="space-between" sx={{
                        flexGrow: 1,
                        paddingTop: "20px",
                        marginLeft: "3vw",
                        overflow: "hidden"
                    }}>
                        <Grid item xs={12}>
                            {progressBarMobile()}
                        </Grid>
                        {(workspaceError === null) ? (
                            <Grid item xs={12}>
                                {/* <Card sx={{
                                    // position: "absolute",
                                    width: "80vw",
                                    // height: "77vh",
                                    // left: "55%",
                                    // top:"200px",
                                    backgroundColor: "transparent",
                                    backgroundImage: "none",
                                    boxShadow: "none"
                                }}>
                                    <div
                                        style={{display: "flex", justifyContent: "center", marginTop: "50px"}}
                                        className={"game"}>
                                        {render2048()}
                                    </div>
                                </Card> */}
                                <Card sx={{
                                    width: "80vw",
                                    backgroundColor: "transparent",
                                    backgroundImage: "none",
                                    boxShadow: "none",
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: progressColorBorder() + "75",
                                    marginTop: "200px",
                                    padding: "10px"
                                }}>
                                    <Typography variant="h6">
                                        Mobile DevSpace support is still early. Use a computer for the best experience!
                                    </Typography>
                                </Card>
                            </Grid>
                        ) : (
                            <Grid item xs={12}>
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
                                                        wordWrap: "break-word",
                                                        fontFamily: "monospace",
                                                        backgroundColor: `#151515`,
                                                        padding: "10px",
                                                        borderRadius: "5px"
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
                                                                wordWrap: "break-word",
                                                                fontFamily: "monospace",
                                                                backgroundColor: `#151515`,
                                                                padding: "10px",
                                                                borderRadius: "5px"
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
                                                                wordWrap: "break-word",
                                                                fontFamily: "monospace",
                                                                backgroundColor: `#151515`,
                                                                padding: "10px",
                                                                borderRadius: "5px"
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
                    </Grid>
                    {/*<Grid item xs={"auto"}>*/}
                </div>
            )
        } else {
            return (
                <div className={"game"}>
                    <Grid container justifyContent="space-between" sx={{
                        flexGrow: 1,
                        paddingTop: "20px",
                        display: "flex",
                        justifyContent: "center",
                        marginLeft: "3vw",
                        width: "91vw",
                        top: "10%"
                    }}>
                        {render2048()}
                    </Grid>
                </div>
            )
        }
    }

    const iframeRef = React.useRef(null);

    useEffect(() => {
        // @ts-ignore
        const iframe = iframeRef.current;

        const ariaLabels = [
            ['null'],
            ['aria-label="AFK"'],
            ['aria-label="Tutorial"'],
            ['aria-label="Streak"'],
            ['aria-label="Code Teacher"'],
            ['aria-label="Application Menu"', 'aria-label="Terminal"', 'aria-label="New Terminal"'],
            ['aria-label="Explorer (Ctrl+Shift+E)"', 'aria-label="Explorer Section: codebase"'],
            ['aria-label="Extensions (Ctrl+Shift+X)"', 'class="suggest-input-placeholder"'],
            ['null']
        ];

        const applyStyles = () => {
            if (iframe === null) {
                return;
            }

            // @ts-ignore
            const iframeContent = iframe.contentWindow || iframe.contentDocument;

            if (iframeContent.document) {
                const oldStyle = iframeContent.document.getElementById('dynamicStyle');
                if (oldStyle) {
                    oldStyle.remove();
                }

                const style = document.createElement('style');
                style.id = 'dynamicStyle';

                const currentAriaLabels = ariaLabels[stepIndex];
                const selector = currentAriaLabels.map(label => `*[${label}]`).join(', ');

                let auraEffect = `
                @keyframes auraEffect {
                    0% {
                        box-shadow: inset 0 0 1px #fff, inset 0 0 2px #fff, inset 0 0 3px #007bff, inset 0 0 4px #007bff, inset 0 0 5px #007bff, inset 0 0 6px #007bff;
                    }
                    100% {
                        box-shadow: inset 0 0 3px #fff, inset 0 0 6px #fff, inset 0 0 9px #007bff, inset 0 0 15px #007bff, inset 0 0 20px #007bff, inset 0 0 23px #007bff;
                    }
                }
            `;

                if (currentAriaLabels.includes('aria-label="Code Teacher"')) {
                    auraEffect = `
                    @keyframes auraEffect {
                      0% {
                        box-shadow: 
                          inset 0 0 5px #fff, 
                          inset 0 0 10px #fff, 
                          inset 0 0 15px #1c8762, 
                          inset 0 0 20px #007bff, 
                          inset 0 0 25px #1c8762, 
                          inset 0 0 30px #1c8762,
                          0 0 5px #1c8762, 
                          0 0 10px #1c8762; 
                      }
                      100% {
                        box-shadow: 
                          inset 0 0 10px #fff, 
                          inset 0 0 15px #fff, 
                          inset 0 0 20px #1c8762, 
                          inset 0 0 25px #1c8762, 
                          inset 0 0 30px #1c8762, 
                          inset 0 0 35px #1c8762,
                          0 0 15px #1c8762, 
                          0 0 20px #1c8762; 
                      }
                    }
                    ${selector} {
                        animation: auraEffect .5s infinite alternate;
                    }
                `;
                }

                style.textContent = `
                ${auraEffect}
                ${selector} {
                    animation: auraEffect 1.5s infinite alternate;
                }
            `;
                iframeContent.document.head.appendChild(style);
            }
        };

        if (iframe) {
            // @ts-ignore
            iframe.addEventListener('load', applyStyles);

            // Apply styles immediately if the iframe is already loaded
            applyStyles();

            return () => {
                if (iframe) {
                    // @ts-ignore
                    iframe.removeEventListener('load', applyStyles);
                }
            };
        }
    }, [iframeRef.current, stepIndex]);



    const closeTutorialCallback = async () => {
        setRunTutorial(false)
        let authState = Object.assign({}, initialAuthStateUpdate)
        // copy the existing state
        let state = Object.assign({}, tutorialState)
        // update the state
        state.vscode = true
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
                tutorial_key: "vscode"
            }
        )
    }

    const tutorialCallback = async (step: number, reverse: boolean) => {
        setStepIndex(step)
    }

    const styles = {
        tutorialHeader: {
            fontSize: "1rem",
        },
        tutorialText: {
            fontSize: "0.7rem",
        }
    };

    let queryParams = new URLSearchParams(window.location.search)

    let xpPopupMemo = React.useMemo(() => {
        if (xpData === undefined || xpData === null) {
            return null
        }
        return(
            <XpPopup oldXP={
                //@ts-ignore
                (xpData["xp_update"]["old_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]} levelUp={xpData["level_up_reward"] === null ? false : true} homePage={false} popupClose={null} maxXP={100} newXP={(xpData["xp_update"]["new_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]} nextLevel={xpData["xp_update"]["next_level"]} gainedXP={xpData["xp_update"]["new_xp"] - xpData["xp_update"]["old_xp"]} reward={xpData["level_up_reward"]} renown={xpData["xp_update"]["current_renown"]}/>
        )
    }, [xpData])

    console.log("workspace url: ", workspaceUrl)

    const convertEditorUrlToDesktop = (url: any): string => {
        const regex = /^(\/editor\/\d+\/\d+-\w+)(\/.+)?(\?.+)?$/;
        const match = url.match(regex);

        if (match) {
            return match[1].replace('/editor/', '/desktop/');
        }

        console.log("workspace url2: ", url)


        return "Invalid URL"; // or throw an error, or return the original URL, based on your needs
    };

    let useRef = React.useRef

    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const dragBarRef = useRef<HTMLDivElement>(null);
    const sensitivity = 1.05; // Increase or decrease this value to control sensitivity

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            const originalLeftWidth = leftPanelRef.current?.offsetWidth || 0;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const delta = (moveEvent.clientX - e.clientX) * sensitivity;
                const newLeftWidth = originalLeftWidth + delta;

                // Apply the new width
                if (leftPanelRef.current && rightPanelRef.current) {
                    leftPanelRef.current.style.flex = `0 0 ${newLeftWidth}px`;
                    rightPanelRef.current.style.flex = `1 1 calc(100% - ${newLeftWidth}px)`;
                }
            };

            const handleMouseUp = () => {
                console.log("handleMouseUp");
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            // Attach mousemove and mouseup listeners to the document
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        // Attach the listener to the drag bar
        if (dragBarRef.current) {
            dragBarRef.current.addEventListener('mousedown', handleMouseDown);
        }

        return () => {
            // Cleanup if component unmounts
            if (dragBarRef.current) {
                dragBarRef.current.removeEventListener('mousedown', handleMouseDown);
            }
        };
    }, []);


    const location = useLocation();
    useEffect(() => {
        console.log("location: ", location);

        // Check if the URL contains the phrase "popped-out"
        if ((location.pathname.includes('popped-out') || location.search.includes('popped-out')) && workspaceUrl !== null && workspaceUrl !== undefined && workspaceUrl !== "") {
            console.log("popped-out: ", location.pathname);
            // Execute your callback function
            window.open(config.coderPath + convertEditorUrlToDesktop(workspaceUrl), '_blank')
            window.history.replaceState({}, "", window.location.href.split("?")[0] + "?editor=true&desktop=none");
            window.location.reload();
        }else{
            console.log("not popped-out: ", workspaceUrl);
        }
    }, [location.pathname, location.search, workspaceUrl]);

    const renderDesktop = () => {
        return (
            <>
            {showIframe && showDesktopIframe === "side" ? (

                <div style={{ display: 'flex', overflow: 'hidden' }}>
                    <div ref={leftPanelRef} style={{ flex: '1 1 0%', minWidth: 0, overflow: 'hidden' }}>
                        {/* Left iframe content */}
                        {(workspaceUrl !== null && workspaceUrl !== undefined && workspaceUrl !== "") ? (
                            <iframe
                                src={workspaceUrl}
                                width="100%"
                                height={`${window.innerHeight - 35}`}
                                style={{ border: "none" }}
                                title="Workspace"

                            >
                                Your browser does not support iframes.
                            </iframe>
                        ) : (
                            <div>
                                <ThreeDots />
                            </div>
                        )}
                    </div>

                    {/*<div ref={dragBarRef}*/}
                    {/*     className="drag-bar"*/}
                    {/*     style={{width: '40px', opacity: '0.5', visibility: 'hidden', backgroundColor: 'transparent'}}*/}
                    {/*>*/}
                    <div
                        ref={dragBarRef}
                        className="drag-bar"
                        style={{
                            cursor: 'ew-resize',
                            backgroundImage: `radial-gradient(circle, ${hexToRGBA(theme.palette.primary.contrastText, 1)} 1px, ${hexToRGBA(theme.palette.primary.main, 1)} 1px)`,
                            backgroundSize: '10px 10px',
                            width: '20px'
                        }}
                    />
                    {/*</div>*/}
                    <div ref={rightPanelRef} style={{ flex: '1 1 0%', minWidth: 0, overflow: 'hidden' }}>
                        {(workspaceUrl !== null && workspaceUrl !== undefined && workspaceUrl !== "") ? (
                            <iframe
                                src={convertEditorUrlToDesktop(workspaceUrl)}
                                width="100%"
                                height={`${window.innerHeight - 35}`}
                                style={{ border: "none" }}
                                title="Workspace"

                            >
                                Your browser does not support iframes.
                            </iframe>
                        ) : (
                            <div>
                                <ThreeDots />
                            </div>
                        )}
                    </div>
                </div>

            ) : showIframe ? (
                <div style={{overflow: "hidden"}}>
                    {(workspaceUrl !== null && workspaceUrl !== undefined && workspaceUrl !== "") ? (
                        <iframe
                            src={workspaceUrl}
                            width="100%" // Your desired width
                            height={`${window.innerHeight - 35}`}
                            style={{border: "none"}}
                            title="Workspace"
                            ref={iframeRef}
                        >
                            Your browser does not support iframes.
                        </iframe>
                    ) : (
                        <div>
                            <ThreeDots/>
                        </div>
                    )}
                </div>

                ) : (
                    <>
                        <div style={{position: 'relative', height: '8vh', width: '100vw'}}>
                            <Typography
                                component={"div"}
                                variant={"h4"}
                                sx={{
                                    position: "absolute",
                                    top: "70%",
                                    left:
                                        sidebarOpen ?
                                                aspectRatio === "21:9" ? "20%" : "23%"
                                        : chatOpen ?
                                                aspectRatio === "21:9" ? "18%" : "20%"
                                        :
                                                aspectRatio === "21:9" ? "24%" : "28%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 2,
                                    color: theme.palette.text.primary,

                                }}
                            >
                                {"Launch Pad"}
                            </Typography>
                            <Typography
                                component={"div"}
                                variant={"h4"}
                                sx={{
                                    position: "absolute",
                                    top: "70%",
                                    left: sidebarOpen ?
                                        aspectRatio === "21:9" ? "20.1%" : "23.1%"
                                        : chatOpen ?
                                            aspectRatio === "21:9" ? "18.1%" : "20.1%"
                                            :
                                            aspectRatio === "21:9" ? "24.1%" : "28.1%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 1,
                                    color: theme.palette.primary.dark,
                                }}
                            >
                                {"Launch Pad"}
                            </Typography>
                        </div>

                        {/*<div style={{display: "flex", width: "100%"}}>*/}
                        {/*    {renderStatusBar()}*/}
                        {/*</div>*/}
                        <div style={{display: "flex", justifyContent: "center", width: "100%"}}>
                            {renderBody()}
                        </div>
                    </>
                )}
            {xpPopup ? (xpPopupMemo) : null}
            </>
        )
    }


    const renderMobileButton = () => {
        let button = (
            <LoadingButton
                variant={"outlined"}
                sx={stepIndex === 3 ? {
                    height: "40px", zIndex: "600000",
                    '&:hover': {
                        backgroundColor: theme.palette.primary.main + "25",
                    }
                } : {
                    height: "40px", zIndex: "600000",
                    '&:hover': {
                        backgroundColor: theme.palette.primary.main + "25",
                    }
                }}
                loading={loadingWorkspaceTransition}
                onClick={() => handleLaunch()}
            >
                {"Launch"}
            </LoadingButton>
        )

        if (workspace !== null) {
            if (workspace.state === 1) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                            '&:hover': {
                                backgroundColor: theme.palette.warning.main + "25",
                            }
                        }}
                        color={"warning"}
                        loading={loadingWorkspaceTransition}
                        onClick={() => handleStop()}
                    >
                        {"Stop"}
                    </LoadingButton>
                )
            } else if (workspace.state === 2) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                        }}
                        disabled
                    >
                        {"Stopping"}
                    </LoadingButton>
                )
            } else if (workspace.state === 3) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                            '&:hover': {
                                backgroundColor: theme.palette.primary.main + "25",
                            }
                        }}
                        loading={loadingWorkspaceTransition}
                        onClick={() => handleLaunch()}
                    >
                        {"Launch"}
                    </LoadingButton>
                )
            } else if (workspace.state === 4) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                        }}
                        disabled
                    >
                        {"Removing"}
                    </LoadingButton>
                )
            } else if (workspace.state === 5) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                        }}
                        disabled
                    >
                        {"Launch Failure"}
                    </LoadingButton>
                )
            } else if (workspace.state === 6) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                        }}
                        disabled
                    >
                        {"Deleted"}
                    </LoadingButton>
                )
            } else if (workspace.state === 0 && workspace.init_state === 0) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px"
                        }}
                        disabled
                    >
                        {"Uplink Starting"}
                    </LoadingButton>
                )
            } else if (workspace.state === 0 && workspace.init_state >= 1) {
                button = (
                    <LoadingButton
                        variant={"outlined"}
                        sx={{
                            height: "40px",
                        }}
                        disabled
                    >
                        {"Fueling Rocket"}
                    </LoadingButton>
                )
            }
        }

        return button
    }


    const renderMobile = () => {
        return (
            <>
            {showIframe && showDesktopIframe === "side" ? (

                <div style={{ display: 'flex', overflow: 'hidden' }}>
                    <div ref={leftPanelRef} style={{ flex: '1 1 0%', minWidth: 0, overflow: 'hidden' }}>
                        {/* Left iframe content */}
                        {(workspaceUrl !== null && workspaceUrl !== undefined && workspaceUrl !== "") ? (
                            <iframe
                                src={workspaceUrl}
                                width="100%"
                                height={`${window.innerHeight - 35}`}
                                style={{ border: "none" }}
                                title="Workspace"

                            >
                                Your browser does not support iframes.
                            </iframe>
                        ) : (
                            <div>
                                <ThreeDots />
                            </div>
                        )}
                    </div>

                    {/*<div ref={dragBarRef}*/}
                    {/*     className="drag-bar"*/}
                    {/*     style={{width: '40px', opacity: '0.5', visibility: 'hidden', backgroundColor: 'transparent'}}*/}
                    {/*>*/}
                    <div
                        ref={dragBarRef}
                        className="drag-bar"
                        style={{
                            cursor: 'ew-resize',
                            backgroundImage: `radial-gradient(circle, ${hexToRGBA(theme.palette.primary.contrastText, 1)} 1px, ${hexToRGBA(theme.palette.primary.main, 1)} 1px)`,
                            backgroundSize: '10px 10px',
                            width: '20px'
                        }}
                    />
                    {/*</div>*/}
                    <div ref={rightPanelRef} style={{ flex: '1 1 0%', minWidth: 0, overflow: 'hidden' }}>
                        {(workspaceUrl !== null && workspaceUrl !== undefined && workspaceUrl !== "") ? (
                            <iframe
                                src={convertEditorUrlToDesktop(workspaceUrl)}
                                width="100%"
                                height={`${window.innerHeight - 35}`}
                                style={{ border: "none" }}
                                title="Workspace"

                            >
                                Your browser does not support iframes.
                            </iframe>
                        ) : (
                            <div>
                                <ThreeDots />
                            </div>
                        )}
                    </div>
                </div>

            ) : showIframe ? (
                <div style={{overflow: "hidden"}}>
                    {(workspaceUrl !== null && workspaceUrl !== undefined && workspaceUrl !== "") ? (
                        <iframe
                            src={workspaceUrl}
                            width="100%" // Your desired width
                            height={`${window.innerHeight - 35}`}
                            style={{border: "none"}}
                            title="Workspace"
                            ref={iframeRef}
                        >
                            Your browser does not support iframes.
                        </iframe>
                    ) : (
                        <div>
                            <ThreeDots/>
                        </div>
                    )}
                </div>

                ) : (
                    <div style={(window.innerWidth < 500) ? {overflow: "hidden", height: "calc(100vh - 90px)"} : undefined}>
                        <div>
                            <Typography
                                component={"div"}
                                variant={"h5"}
                                sx={{
                                    position: "absolute",
                                    top: "75px",
                                    left: "15px",
                                    zIndex: 2,
                                    color: theme.palette.text.primary,

                                }}
                            >
                                {"Launch Pad"}
                            </Typography>
                            <Typography
                                component={"div"}
                                variant={"h5"}
                                sx={{
                                    position: "absolute",
                                    top: "75px",
                                    left: "16px",

                                    zIndex: 1,
                                    color: theme.palette.primary.dark,
                                }}
                            >
                                {"Launch Pad"}
                            </Typography>
                        </div>
                        <div
                            style={{
                                float: "right",
                                marginTop: "10px",
                                marginRight: "10px"
                            }}
                        >
                            {renderMobileButton()}
                        </div>
                        <div style={{display: "flex", justifyContent: "center", width: "100%"}}>
                            {renderBodyMobile()}
                        </div>
                    </div>
                )}
            {xpPopup && window.innerWidth > 1000 ? (xpPopupMemo) : null}
            </>
        )
    }

    let renderer = window.innerWidth > 1000 ? renderDesktop : renderMobile


    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <CardTutorial
                    open={runTutorial && queryParams.has("editor") && queryParams.get("editor") === "true"}
                    closeCallback={closeTutorialCallback}
                    step={stepIndex}
                    changeCallback={tutorialCallback}
                    steps={[
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>This is Your DevSpace!</h2>
                                    <p style={styles.tutorialText}>DevSpaces are preconfigured development environments running on VSCode, allowing you to launch straight into writing and running code</p>
                                </div>
                            ),
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Need to Go Somewhere?</h2>
                                    <p style={styles.tutorialText}>DevSpaces will close after 10 minutes of inactivity. On the left you can see the activity bar, use our AFK feature to give you an hour of idle time.</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>To save resources, we automatically close DevSpaces after 10 minutes of idle time. If you want to go make lunch or simply know you will take a long time on another tab, you can use the AFK function to allow up to an hour of idle time.</p>
                                </div>
                            )
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Interactive Tutorials</h2>
                                    <p style={styles.tutorialText}>Some GIGO projects are designed to be a tutorial, use this extension to easily fly through each step</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>GIGO provides interactive DevSpaces for programmers to design a tutorial for others to learn how to create a specific project. This extension allows the user to have the tutorial on the side and go through step by step alongside their code. You can also create your own tutorial using this extension by clicking the plus sign when you're in the tutorial extension tab.</p>
                                </div>
                            )
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Check Your Streak!</h2>
                                    <p style={styles.tutorialText}>You can check your streak status for today and get a preview of how your week has gone</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>Streaks are a way to keep track on your progress everyday. If you program for at least 30 minutes a day, your streak will go up. While in a DevSpace, there will be an animation that pops up to inform you that you have reached your streak for the day. Get to coding and make that streak go higher!</p>
                                </div>
                            )
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Learn with Code Teacher!</h2>
                                    <p style={styles.tutorialText}>Code Teacher is your personal Magic assistant available to help you inside your DevSpace.</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>Code Teacher is an advanced AI assistant understands the context of your project to offer real-time guidance. Whether you're stuck on a bug, unsure how to implement a function, or simply want to understand your code better, Code Teacher is there to help. Free users will gain access to 3 questions a day. Pro users, however, get full access to Code Teacher. </p>

                                </div>
                            )
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Need A Terminal?</h2>
                                    <p style={styles.tutorialText}>Navigate the highlighted menu in the top left of the DevSpace, click 'Terminal', then 'New Terminal'. Better yet, there is a keyboard shortcut: Ctrl + Shift + `</p>
                                </div>
                            ),
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Access Your Project Files</h2>
                                    <p style={styles.tutorialText}>This is where you manage all of the files for you code in your DevSpace. Here, you can edit code, create new files, create new folders, and more.</p>
                                </div>
                            ),
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Install More Extensions</h2>
                                    <p style={styles.tutorialText}>VSCode offers a vast library of extensions. Here, you can search for more extensions to install or disable any that are currently installed. Your DevSpace comes with a few extensions already installed, so it is recommended to keep those enabled.</p>
                                </div>
                            ),
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Happy Coding!</h2>
                                    <p style={styles.tutorialText}>Now that you know the basics, you can jump right in and get to coding!</p>
                                </div>
                            ),
                        },
                    ]}
                />
                {renderer()}
            </CssBaseline>
        </ThemeProvider>
    )
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
            console.log("divisor: ", divisor);
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
        console.log("aspectRatio: ", aspectRatio);

        return () => {
            window.removeEventListener('resize', calculateAspectRatio);
        };
    }, []);

    return aspectRatio;
}

export default WorkspacePage;