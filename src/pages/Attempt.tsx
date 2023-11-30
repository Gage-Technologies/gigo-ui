

// @ts-nocheck

import * as React from "react";
import { useEffect, useRef } from "react";
import {
    Box,
    Button,
    ButtonBase, Card, CardMedia, Chip,
    createTheme,
    CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Modal,
    PaletteMode,
    Tab,
    Tabs,
    TextField,
    ThemeProvider, Tooltip,
    Typography
} from "@mui/material";
import { getAllTokens, themeHelpers } from "../theme";
import UserIcon from "../components/UserIcon";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { initialAuthStateUpdate, selectAuthState, selectAuthStateUserName, updateAuthState } from "../reducers/auth/auth";
import { useNavigate } from "react-router-dom";
import call from "../services/api-call";
import config from "../config";
import { useParams } from "react-router";
import Post from "../models/post"
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import PostOverview from "../components/PostOverview";
import { selectAuthStateId } from "../reducers/auth/auth";
import swal from "sweetalert";
import { Workspace } from "../models/workspace";
import CodeDisplayEditor from "../components/editor/workspace_config/code_display_editor";
import { ThreeDots } from "react-loading-icons";
import { LoadingButton } from "@mui/lab";
import Attempt from "../models/attempt";

import HorseIcon from "../components/Icons/Horse";
import HoodieIcon from "../components/Icons/Hoodie";
import { QuestionMark } from "@mui/icons-material";
import TrophyIcon from "../components/Icons/Trophy";
import GraduationIcon from "../components/Icons/Graduation";

import { v4 } from "uuid";
import renown1 from "../img/renown/renown1.svg";
import renown2 from "../img/renown/renown2.svg";
import renown3 from "../img/renown/renown3.svg";
import renown4 from "../img/renown/renown4.svg";
import renown5 from "../img/renown/renown5.svg";
import renown6 from "../img/renown/renown6.svg";
import renown7 from "../img/renown/renown7.svg";
import renown8 from "../img/renown/renown8.svg";
import renown9 from "../img/renown/renown9.svg";
import renown10 from "../img/renown/renown10.svg";
import alternativeImage from "../img/Black.png";
import ReactGA from "react-ga4";
import PostOverviewMobile from "../components/PostOverviewMobile"
import ProjectPayment from "./stripe/projectPayment";
import Person3Icon from "@mui/icons-material/Person3";
import styled, { keyframes } from 'styled-components';
import WorkspaceConfigEditor from "../components/editor/workspace_config/editor";
import { Helmet, HelmetProvider } from "react-helmet-async"

import * as yaml from 'js-yaml';
import { Backdrop } from "@material-ui/core";
import darkImageUploadIcon from "../img/dark_image_upload2.svg";
import EditIcon from "@mui/icons-material/Edit";
import Fab from '@mui/material/Fab';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CircularProgress from '@mui/material/CircularProgress';
import DebugIcon from "../components/Icons/Debug";
import {initialCreateProjectStateUpdate} from "../reducers/createProject/createProject";


function AttemptPage() {
    // retrieve url params
    let { id } = useParams();
    const queryParams = new URLSearchParams(window.location.search)
    const embedded = queryParams.has('embed') && queryParams.get('embed') === 'true';
    let userPref = localStorage.getItem('theme')

    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [mainTab, setMainTab] = React.useState(window.location.hash.replace('#', '') !== "" ? window.location.hash.replace('#', '') : "project")
    const [minorTab, setMinorTab] = React.useState("overview")
    const [loading, setLoading] = React.useState(true)
    const userId = useAppSelector(selectAuthStateId);
    const [attempt, setAttempt] = React.useState<Attempt | null>("")
    const [attemptDesc, setAttemptDesc] = React.useState<string>("")
    const [projectDesc, setProjectDesc] = React.useState<Post | null>(null)
    const [closedState, setClosedState] = React.useState(false)
    const [projectName, setProjectName] = React.useState<string>("Attempt")
    const [confirm, setConfirm] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [exclusive, setExclusive] = React.useState(false)
    const [wsConfig, setWsConfig] = React.useState(null)
    const [loadingEdit, setLoadingEdit] = React.useState(false)
    const [editConfirm, setEditConfirm] = React.useState(false)
    const [editTitle, setEditTitle] = React.useState(false)
    const [editImage, setEditImage] = React.useState(false)
    const [projectImage, setProjectImage] = React.useState<string | null>(null)
    const [projectTitle, setProjectTitle] = React.useState<string>("")
    const [imageGenLoad, setImageGenLoad] = React.useState<boolean>(false)
    const [genLimitReached, setGenLimitReached] = React.useState<boolean>(false);
    const [genOpened, setGenOpened] = React.useState<boolean>(false);
    const [promptError, setPromptError] = React.useState<string>("")
    const [prompt, setPrompt] = React.useState("");
    const [genImageId, setGenImageId] = React.useState<string>("");
    const [usedThumbnail, setUsedThumbnail] = React.useState<string | null>(null);
    const [attemptTitle, setAttemptTitle] = React.useState<string>("")


    let handleCloseAttempt = () => {
        if (attemptTitle === "") {
            swal("Please add a unique title for your attempt!")
        } else {
            setConfirm(false)
            closeAttempt()
        }
    }
    const styles = {
        themeButton: {
            display: "flex",
            justifyContent: "right"
        },
        projectName: {
            marginLeft: "2%",
            marginTop: "10px",
        },
        mainTabButton: {
            height: "4vh",
            maxHeight: "50px",
            minHeight: "35px",
            fontSize: "0.8rem",
            '&:hover': {
                backgroundColor: theme.palette.primary.main + "25",
            }
        }
    };

    ReactGA.initialize("G-38KBFJZ6M6");

    const closeAttempt = async () => {
        setClosedState(true)
        let attempt = await call(
            "/api/attempt/closeAttempt",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            { attempt_id: id, title: attemptTitle },
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            attempt,
        ])

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["message"] === "You must be logged in to access the GIGO system.") {
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }
    }

    const loadFileToThumbnailImage = (file: File) => {
        // exit if file is null
        if (file === null) {
            return
        }

        // clone the file so we don't read the same one we're going to upload
        let clonedFile = new File([file], file.name, { type: file.type });

        // create file reader
        const reader = new FileReader();

        // configure callback for reader once the file has been read
        reader.onloadend = (e) => {
            // ensure that the target and result are not null
            if (e.target === null || e.target.result === null) {
                return
            }

            // exclude ArrayBuffer case for typescript (it won't ever be an ArrayBuffer though)
            if (typeof e.target.result !== "string") {
                return
            }

            console.log("target: ", e.target.result)

            // send data url to image src
            setProjectImage(e.target.result);
        }

        try {
            // execute file reader
            reader.readAsDataURL(clonedFile);
        } catch (e) {
            console.log("ERROR: failed to read thumbnail: ", e);
        }
    }

    const generateImage = async () => {
        console.log("lol: ", projectImage)
        console.log("prompt: ", prompt)
        // if (projectImage !== null || prompt === "")
        //     return false

        // execute api call to remote GIGO server to create image
        let res = await call(
            "/api/project/genImage",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                "prompt": prompt,
            }
        )

        // handle generation count failure
        if (res !== undefined && res["message"] !== undefined && res["message"] === "User has already reached the generation limit") {
            setGenLimitReached(true)
            swal(
                "Generation Limit Reached",
                "Sorry, but you have reached the image generation limit for this project."
            );
            return false
        }

        // handle failed call
        if (res === undefined || res["image"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We can't get in touch with the server... Sorry about that! We'll get working on that right away!"
                );
            return false
        }

        // handle expected failure
        if (res["image"] === "" || res["image"] === null) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    res["message"]
                );
            return false
        }

        let id = res["image"]

        fetch(config.rootPath + "/api/project/tempGenImage/" + id, {
            credentials: 'include'  // Include cookies
        })
            .then(response => response.blob())
            .then(blob => {
                // create reader to format image into a base64 string
                const reader = new FileReader();
                // configure callback for reader once the file has been read
                reader.onloadend = (e) => {
                    // ensure that the target and result are not null
                    if (e.target === null || e.target.result === null) {
                        return
                    }

                    // exclude ArrayBuffer case for typescript (it won't ever be an ArrayBuffer though)
                    if (typeof e.target.result !== "string") {
                        return
                    }

                    // send data url to image src
                    setProjectImage(e.target.result);
                    setImageGenLoad(false)
                }
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                // fallback on browser loading
                setProjectImage(config.rootPath + "/api/project/tempGenImage/" + id)
                // setImageGenLoad(false)
            });

        setGenImageId(id)

        return true
    }

    const handleGenClose = () => {
        setGenOpened(false);
        // if (prompt !== createProjectForm.name) {
        //     setPrompt("");
        // }
    };

    const handleGenClickOpen = () => {
        // setPrompt(createProjectForm.name)
        setGenOpened(true);
    };

    const editProject = async (title: null, image: null) => {
        let params = {
            id: attempt["_id"],
        }

        if (title != null) {
            params["title"] = title;
        }

        let edit;

        if (image != null) {
            console.log("project is: ", projectImage)
            if (genImageId !== null && genImageId !== "") {
                //@ts-ignore
                params["gen_image_id"] = genImageId

                edit = await call(
                    "/api/project/editAttempt",
                    "post",
                    null,
                    null,
                    null,
                    // @ts-ignore
                    params
                )

                const [res] = await Promise.all([
                    edit
                ])

                if (res === undefined) {
                    swal("There has been an issue loading data. Please try again later.")
                }

                if (res["message"] !== "success") {
                    swal("There has been an issue loading data. Please try again later.")
                } else {
                    swal("Success!", res["message"], "success")
                }
            } else {
                let res = await call(
                    "/api/project/editAttempt",
                    "post",
                    null,
                    null,
                    null,
                    // @ts-ignore
                    params,
                    usedThumbnail,
                    config.rootPath
                )

                if (res === undefined) {
                    if (sessionStorage.getItem("alive") === null)
                        //@ts-ignore
                        swal(
                            "Server Error",
                            "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                        );
                    return;
                }

                if ("message" in res && res["message"] !== "File Upload Starting") {
                    if (sessionStorage.getItem("alive") === null)
                        //@ts-ignore
                        swal(
                            "Server Error",
                            (res["message"] !== "internal server error occurred") ?
                                res["message"] :
                                "An unexpected error has occurred. We're sorry, we'll get right on that!"
                        );
                    return;
                } else {
                    if (sessionStorage.getItem("alive") === null)
                        //@ts-ignore
                        swal("Success!", res["message"], "success")
                    return;
                }

                { console.log("res is: ", res["message"]) }

                // if ("message" in res && res["message"] !== "success"){
                //     if (sessionStorage.getItem("alive") === null)
                //         //@ts-ignore
                //         swal(
                //             "Server Error",
                //             (res["message"] !== "internal server error occurred") ?
                //                 res["message"] :
                //                 "An unexpected error has occurred. We're sorry, we'll get right on that!"
                //         );
                //     return;
                // } else {
                //     if (sessionStorage.getItem("alive") === null)
                //         //@ts-ignore
                //         swal("Success!", res["message"], "success")
                //     return;
                // }
            }
        } else {
            edit = call(
                "/api/project/editAttempt",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                params,
                null,
                config.rootPath
            )

            const [res] = await Promise.all([
                edit
            ])

            if (res === undefined) {
                swal("There has been an issue loading data. Please try again later.")
            }

            if (res["message"] !== "success") {
                swal("There has been an issue loading data. Please try again later.")
            } else {
                swal("Success!", res["message"], "success")
            }
        }

        // window.location.reload();
    }

    let renderGenImagePopup = () => {
        return (
            <Dialog open={genOpened} onClose={handleGenClose}>
                <Box style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: theme.spacing(2), // Provide padding to ensure the modal is slightly larger than its contents.
                    outlineColor: "black",
                    borderRadius: 1,
                    boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                    backgroundColor: theme.palette.background.default,
                }}>
                    <DialogTitle>Enter Prompt</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Your prompt will be used to generate an image using Magic
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Prompt"
                            type="text"
                            fullWidth
                            defaultValue={prompt}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            inputProps={{ maxLength: 120, minLength: 3 }}
                            helperText={prompt.length > 119 ? 'Character limit reached' : promptError}
                            error={prompt.length > 119 || prompt === "" || prompt.length < 3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleGenClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleGenSubmit}>
                            Submit
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        )
    }

    const handleGenSubmit = () => {
        let promptLength = prompt.length;
        if (promptLength === 0) {
            setPromptError("You must enter a prompt");
        } else if (promptLength < 3) {
            setPromptError("Your prompt must be at least 3 characters long");
        } else {
            setGenOpened(false);
            setPromptError("");
            setImageGenLoad(true)
            generateImage().then((ok) => {
                if (!ok)
                    setImageGenLoad(false)
            })
        }
    };
    const getProjectInformation = async () => {
        console.log("getting info")
        let attempt = await call(
            "/api/attempt/get",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            { attempt_id: id },
            null,
            config.rootPath
        )

        let post = await call(
            "/api/attempt/getProject",
            "post",
            null,
            null,
            null,
            { attempt_id: id },
            null, config.rootPath
        )

        const [res, res2] = await Promise.all([
            attempt,
            post
        ])

        if (res === undefined || res2 === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["message"] === "You must be logged in to access the GIGO system." || res2["message"] === "You must be logged in to access the GIGO system.") {
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }

        if (res["post"] === undefined || res["description"] === undefined) {
            if (res["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            swal("Server Error", res["message"])
            return
        }

        if (res2["description"] === undefined) {
            if (res2["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            swal("Server Error", res["message"])
            return
        }

        if (res2["exclusive"] !== undefined && res2["exclusive"] !== null) {
            setExclusive(true)
        } else {
            setExclusive(false)
        }

        // setProject(res["post"])
        // setProject(res["post"])
        setAttempt(res["post"])
        // setProjectDesc(res["post"]["description"])
        console.log("setting info: ", res["description"])
        setProjectDesc(res["description"])
        // setAttemptDesc(res["description"])
        setAttemptDesc(res["evaluation"])
        setClosedState(res["post"]["closed"])
        if (res["post"]["title"] === null) {
            setProjectName("Attempt:  " + res["post"]["post_title"])
        } else {
            setProjectName("Attempt:  " + res["post"]["title"])
        }
        setProjectTitle(res["post"]["title"] !== null ? res["post"]["title"] : res["post"]["post_title"])
    }

    const authState = useAppSelector(selectAuthState);

    useEffect(() => {
        setLoading(true)
        getProjectInformation()
        setLoading(false)
    }, [])

    const implicitSessionID = React.useRef<string | null>("")
    const getSessionID = () => {
        // return empty string if there's no project
        if (attempt === null) {
            return ""
        }

        // check for an existing session token
        let lastSession = window.sessionStorage.getItem(`project-exit-${attempt._id}`)

        // generate a new id if there is no session
        if (lastSession === null) {
            return v4()
        }

        // split the session token into its parts
        let parts = lastSession.split(":")

        // parse time from the millis unix timestamp in part[0] and return the
        // old session id if it has been less than 5 minutes
        if (new Date().getTime() - parseInt(parts[0]) < 300000 && parts[1].length > 0) {
            return parts[1]
        }

        return v4()
    }

    const implicitRecord = async () => {
        // bail if we don't have a project yet
        if (attempt === null) {
            return
        }

        // initialize an implicit session ID
        let sid = getSessionID()
        implicitSessionID.current = sid

        // record on click
        recordImplicitAction(true, sid)

        // record click off of tab or minimize
        window.addEventListener('blur', function () {
            // record the exit time in session storage
            window.sessionStorage.setItem(`project-exit-${attempt._id}`, `${new Date().getTime()}:${sid}`)
            recordImplicitAction(false)
        });

        // record on click back to tab
        window.onfocus = function () {
            let sid = getSessionID()
            if (sid !== implicitSessionID.current) {
                implicitSessionID.current = (sid)
            }
            recordImplicitAction(true, sid)
        }

        // create a listener for beforeunload
        let beforeUnload = function (event) {
            // record the exit time in session storage
            window.sessionStorage.setItem(`project-exit-${attempt._id}`, `${new Date().getTime()}:${implicitSessionID.current}`)

            // record changing pages
            recordImplicitAction(false)

            // clear hooks
            window.removeEventListener('blur', function () {
                // record the exit time in session storage
                window.sessionStorage.setItem(`project-exit-${attempt._id}`, `${new Date().getTime()}:${implicitSessionID.current}`)
                recordImplicitAction(false)
            });
            window.onfocus = null

            return true
        }

        // handle case of page change by clearing our watchers
        window.addEventListener('beforeunload', beforeUnload);

        // remove implicit action on unmount
        return () => {
            window.removeEventListener('beforeunload', beforeUnload)
        }
    }

    let loggedIn = false
    if (authState.authenticated !== false) {
        loggedIn = true
    }

    const recordImplicitAction = async (open: boolean, sessionId: string | null = null) => {

        if (loggedIn) {
            // bail if we don't have a project yet
            if (attempt === null || implicitSessionID.current === null) {
                return
            }

            // use the state session ID if no session ID is provided
            if (sessionId === null) {
                sessionId = implicitSessionID.current
            }

            // Convert payload to a string
            const blob = new Blob([JSON.stringify({
                post_id: id,
                action: 0,
                session_id: sessionId,
            })], {type : 'application/json'});

            // Use navigator.sendBeacon to send the data to the server
            navigator.sendBeacon(config.rootPath + '/api/implicit/recordAction', blob);
        }
    }

    const dispatch = useAppDispatch();

    let navigate = useNavigate();

    let descriptionRef = useRef(null);

    const descriptionTab = () => {
        console.log("description is: ", projectDesc)
        if (window.innerWidth > 1000) {
            return (
                <MarkdownRenderer markdown={projectDesc} style={{
                    width: "70vw",
                    maxWidth: "1300px",
                    overflowWrap: "break-word",
                    borderRadius: "10px",
                    padding: "2em 3em"
                }} />
            )
        } else {
            if (projectDesc === null) {
                return (
                    <MarkdownRenderer markdown={""} style={{
                        width: "104vw",
                        maxWidth: "1300px",
                        overflowWrap: "break-word",
                        borderRadius: "10px",
                        padding: "2em 3em"
                    }} />
                )
            } else {
                return (
                    <MarkdownRenderer markdown={projectDesc} style={{
                        width: "104vw",
                        maxWidth: "1300px",
                        overflowWrap: "break-word",
                        borderRadius: "10px",
                        padding: "2em 3em"
                    }} />
                )
            }
        }
    }

    const mainTabHtml = () => {
        let renderFunc = mainTabProject
        if (mainTab === "source") {
            renderFunc = mainTabSource
        } else if (mainTab === "edit") {
            renderFunc = mainTabEdit
        }

        return (
            <div style={{ width: "80vw" }}>
                {renderFunc()}
            </div>
        )
    }

    // const handleTabChange = (newValue: string) => {
    //     setMainTab(newValue);
    //     if (newValue === "discussions") {
    //         getDiscussions().then(r => console.log(r))
    //         console.log("run: ", runTutorial)
    //     }
    //     setDiscussionTab("main")
    //     setThread(false)
    //     setSelectedComment({
    //         commentId: ""
    //     })
    //
    //     if (newValue ==="edit") {
    //         getConfig()
    //     }
    // };


    const launchWorkspace = async (parentAttempt: Attempt | null) => {
        setIsLoading(true)
        if (attempt == null) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Unexpected Error",
                    "We can't seem to find the Challenge data... Sorry about that! Try going to the Challenge page " +
                    "and launch a workspace from there."
                );
            return
        }

        // execute api call to remote GIGO server to create workspace
        let res = await call(
            "/api/workspace/create",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                "commit": "main", // for now always 'main' - future will handle branches and commits
                "repo": (parentAttempt == null) ? attempt.repo_id : parentAttempt.repo_id,  // available in attempt or project
                "code_source_id": (parentAttempt == null) ? attempt._id : parentAttempt._id,  // pass id of attempt or project
                "code_source_type": 1, // 0 for project - 1 for attempt
            }
        )

        if (res["message"] === "You must be logged in to access the GIGO system.") {
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }

        // handle failed call
        if (res === undefined || res["message"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We can't get in touch with the server... Sorry about that! We'll get working on that right away!"
                );
            setIsLoading(false)
            return
        }

        // handle expected failure
        if (res["message"] !== "Workspace Created Successfully") {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    res["message"]
                );
            setIsLoading(false)
            return
        }

        let workspace: Workspace = res["workspace"]

        // route to workspace page
        navigate(`/launchpad/${workspace._id}`)

        implicitRecord()
    }


    const createAttempt = async () => {
        setIsLoading(true)
        // execute api call to remote GIGO server to create workspace
        let res = await call(
            "/api/attempt/start",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                project_id: attempt?.post_id,
                parent_attempt: attempt?._id
            }
        )

        if (res["message"] === "You must be logged in to access the GIGO system.") {
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }


        window.sessionStorage.setItem("attemptXP", JSON.stringify(res["xp"]))

        if (res !== undefined && res["message"] !== undefined && res["message"] === "Attempt created successfully.") {
            await launchWorkspace(res["attempt"])
        } else if (res["message"] === "You have already started an attempt. Keep working on that one!") {
            swal("You have already started an attempt. Keep working on that one!")
            setIsLoading(false)
        } else {
            swal("There was an issue branching this attempt. Please try again later.")
            setIsLoading(false)
        }

        implicitRecord()
    }

    const handleError = (e) => {
        e.target.src = alternativeImage; // replace with your alternative image URL
        console.log("There was an error")
    };

    const attemptDescriptionTab = () => {
        return (
            <MarkdownRenderer markdown={attemptDesc} style={{
                width: "70vw",
                maxWidth: "1300px",
                overflowWrap: "break-word",
                borderRadius: "10px",
                padding: "2em 3em"
            }} />
        )
    }

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setMinorTab(newValue);
    };

    const LoadingImageUploadButton = styled(LoadingButton)`
      animation: imageGenAuraEffect 2s infinite alternate;
      border: none;

      @keyframes imageGenAuraEffect {
        0% {
          box-shadow: 0 0 3px #84E8A2, 0 0 6px #84E8A2;
        }
        20% {
          box-shadow: 0 0 3px #29C18C, 0 0 6px #29C18C;
        }
        40% {
          box-shadow: 0 0 3px #1C8762, 0 0 6px #1C8762;
        }
        60% {
          box-shadow: 0 0 3px #2A63AC, 0 0 6px #2A63AC;
        }
        80% {
          box-shadow: 0 0 3px #3D8EF7, 0 0 6px #3D8EF7;
        }
        100% {
          box-shadow: 0 0 3px #63A4F8, 0 0 6px #63A4F8;
        }
      }
    `;

    const mainTabProject = () => {
        let minorValues = ["overview", "description"]
        if (attemptDesc && attemptDesc.trim().length > 0) {
            minorValues.push("attempt Description")
        }

        let currentUser = false

        if (userId === attempt?.author_id) {
            currentUser = true
        }
        let imgSrc;
        if (attempt !== null) {
            switch (attempt?.tier) {
                case 0:
                    imgSrc = renown1;
                    break;
                case 1:
                    imgSrc = renown2;
                    break;
                case 2:
                    imgSrc = renown3;
                    break;
                case 3:
                    imgSrc = renown4;
                    break;
                case 4:
                    imgSrc = renown5;
                    break;
                case 5:
                    imgSrc = renown6;
                    break;
                case 6:
                    imgSrc = renown7;
                    break;
                case 7:
                    imgSrc = renown8;
                    break;
                case 8:
                    imgSrc = renown9;
                    break;
                case 9:
                    imgSrc = renown10;
                    break;

            }
        }

        console.log("html project info: ", projectDesc)

        return (
            <div style={{ display: "flex", width: "80vw", height: "auto" }}>
                {window.innerWidth > 1000 ? (
                    <div style={{ display: "flex", justifyContent: "left", paddingRight: "20px", height: "100%" }}>
                        <Tabs
                            orientation="vertical"
                            value={minorTab}
                            onChange={handleChange}
                            aria-label="Vertical tabs"
                        >
                            {minorValues.map((minorValue) => {
                                return <Tab label={minorValue} value={minorValue} key={minorValue} className={minorValues}
                                    sx={minorValue === "overview" ? { color: "text.primary", borderRadius: 1, zIndex: "600000" } : { color: "text.primary", borderRadius: 1 }} />;
                            })}
                        </Tabs>
                    </div>
                ) : null}
                <div style={window.innerWidth > 1000 ? { display: "flex", justifyContent: "center", width: "90%" } : { display: "flex", justifyContent: "center", width: "100%", position: "relative", flexDirection: "column", marginBottom: "150px" }}>
                    {window.innerWidth <= 1000 ? (
                        <div>
                            <div style={{ marginBottom: "50px" }}>
                                <PostOverviewMobile
                                    width={"100%"}
                                    height={"100%"}
                                    description={attempt !== null && minorTab === "overview" ? attempt["description"] : ""}
                                    exclusiveDescription={attempt !== null ? attempt["exclusive_description"] : null}
                                    postDate={attempt !== null ? attempt["created_at"] : ""}
                                    userIsOP={currentUser}
                                    id={attempt !== null ? attempt["_id"] : 0}
                                    renown={attempt !== null ? attempt["tier"] : 0}
                                    project={false}
                                />
                            </div>
                            {attempt !== null && attempt !== "" ? (
                                <div style={{ width: "100%", position: "relative", height: "300px", marginBottom: "50px" }}>
                                    <img
                                        src={attempt !== null ? config.rootPath + attempt["thumbnail"] : alternativeImage}
                                        style={{
                                            width: "inherit",
                                            height: "inherit", borderRadius: "5px"
                                        }}
                                        onError={handleError}
                                        alt={"project thumbnail"} />
                                </div>
                            ) : (
                                <StyledDiv style={{ height: "200px", width: "inherit" }} />
                            )}

                            <div style={window.innerWidth > 1000 ? { overflow: "hidden", width: "70vw", maxWidth: "1300px", alignItems: "center", display: "flex", flexDirection: "column" } : { overflow: "break-word", width: "100%", maxWidth: "1300px", alignItems: "center", display: "flex", flexDirection: "column" }}>
                                {minorTabDetermination()}
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <div style={{ overflow: "hidden", width: "70vw", maxWidth: "1300px", alignItems: "center", display: "flex", flexDirection: "column", zIndex: 6 }}>
                                <div style={{ width: "100%", position: "relative", height: "300px" }}>
                                    <img
                                        src={attempt !== null ? config.rootPath + attempt["thumbnail"] : alternativeImage}
                                        style={{
                                            width: '100%',
                                            height: '200%',
                                            objectFit: 'stretch'
                                        }}
                                        onError={handleError}
                                        alt={"project thumbnail"} />
                                    {attempt !== null && userId === attempt["author_id"] && window.innerWidth > 1000 ? (
                                        <Button
                                            onClick={() => setEditImage(true)}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0
                                            }}
                                        >
                                            <EditIcon />
                                        </Button>
                                    ) : null}
                                </div>
                                <Modal
                                    aria-labelledby="transition-modal-title"
                                    aria-describedby="transition-modal-description"
                                    open={editImage}
                                    onClose={() => setEditImage(false)}
                                    closeAfterTransition
                                    BackdropComponent={Backdrop}
                                    BackdropProps={{
                                        timeout: 500,
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center', // Add vertical scroll if content is longer than page height
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: theme.spacing(2), // Provide padding to ensure the modal is slightly larger than its contents.
                                            outlineColor: "black",
                                            borderRadius: 1,
                                            boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                                            backgroundColor: theme.palette.background.default,
                                        }}
                                    >
                                        <Grid item xs={12}>
                                            {imageGenLoad ? (
                                                <LoadingImageUploadButton
                                                    loading={true}
                                                    disabled={true}
                                                // sx={{
                                                //     width: "30vw",
                                                //     height: "43vh"
                                                // }}
                                                >
                                                    Generating Image
                                                </LoadingImageUploadButton>
                                            ) : (
                                                <Button
                                                    color={"primary"}
                                                    component="label"
                                                    variant="outlined"
                                                    sx={{
                                                        width: "30vw",
                                                        height: "43vh"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        {projectImage == null || projectImage == "" ? (
                                                            <h5 style={{ color: "grey" }}>Upload Image</h5>
                                                        ) : null}
                                                        <img
                                                            key={projectImage}
                                                            style={{
                                                                height: projectImage === null ? "30vh" : "42vh",
                                                                width: "auto",
                                                                maxWidth: "29.5vw",
                                                                opacity: projectImage === null ? "30%" : "100%",
                                                                borderRadius: "10px"
                                                            }}
                                                            src={projectImage === null ? darkImageUploadIcon : projectImage}
                                                            alt="upload icon"
                                                            className={"background"}
                                                        />
                                                    </div>
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept="image/png, image/jpeg"
                                                        onChange={(e) => {
                                                            // exit if there are no files
                                                            if (e.target.files === null) {
                                                                return
                                                            }

                                                            // // copy initial state
                                                            // let updateState = Object.assign({}, initialCreateProjectStateUpdate);
                                                            // // update file in state update
                                                            // updateState.thumbnail = e.target.files[0];
                                                            // // execute state update
                                                            // updateFormState(updateState)
                                                            setUsedThumbnail(e.target.files[0])

                                                            // update state for rendering the thumbnail
                                                            loadFileToThumbnailImage(e.target.files[0])
                                                        }}
                                                    />
                                                </Button>
                                            )}
                                        </Grid>
                                        {!imageGenLoad ? (
                                            <Grid item xs={12}>
                                                <Tooltip title="Generate a unique image for your project using Magic">
                                                    <Button
                                                        variant={`outlined`}
                                                        color={"primary"}
                                                        sx={{
                                                            width: "10vw",
                                                            height: "45px",
                                                            borderRadius: 1,
                                                            left: `9.75vw`,
                                                            marginTop: "35px",
                                                        }}
                                                        className={'generate'}
                                                        disabled={genLimitReached}
                                                        onClick={() => {
                                                            handleGenClickOpen()
                                                        }}
                                                        loading={imageGenLoad}
                                                    >
                                                        Generate Image
                                                    </Button>
                                                </Tooltip>
                                            </Grid>
                                        ) : null}
                                        {!imageGenLoad ? (
                                            <Grid item xs={12}>
                                                <Tooltip title="Note : Only 3 images may be generated">
                                                    <Button
                                                        variant={`text`}
                                                        color={"primary"}
                                                        sx={{
                                                            width: "10vw",
                                                            height: "30px",
                                                            borderRadius: 1,
                                                            marginTop: "0px",
                                                            marginBottom: "-25px",
                                                            left: `9.75vw`,
                                                        }}
                                                        disabled={projectImage === null}
                                                        onClick={() => {
                                                            handleRemoveImage()
                                                        }}
                                                    >
                                                        Remove Image
                                                    </Button>
                                                </Tooltip>
                                            </Grid>
                                        ) : null}
                                        {renderGenImagePopup()}
                                        {!imageGenLoad ? (
                                            <Grid item xs={12}>
                                                <Tooltip title="Update Image">
                                                    <Button
                                                        variant={`contained`}
                                                        color={"primary"}
                                                        sx={{
                                                            width: "auto",
                                                            height: "40px",
                                                            borderRadius: 1,
                                                            left: `-5vw`,
                                                            position: "relative",
                                                            marginTop: "-100px"
                                                        }}
                                                        disabled={projectImage === null}
                                                        onClick={() => editProject(null, projectImage)}
                                                    >
                                                        Submit
                                                    </Button>
                                                </Tooltip>
                                            </Grid>
                                        ) : null}
                                    </Box>
                                </Modal>
                                <PostOverview
                                    userId={attempt !== null ? attempt["author_id"] : ""}
                                    userName={attempt !== null ? attempt["author"] : ""}
                                    width={"100%"}
                                    height={"100%"}
                                    userThumb={attempt !== null ? config.rootPath + "/static/user/pfp/" + attempt["author_id"] : ""}
                                    backgroundName={attempt !== null ? attempt["name"] : null}
                                    backgroundPalette={attempt !== null ? attempt["color_palette"] : null}
                                    backgroundRender={attempt !== null ? attempt["render_in_front"] : null}
                                    userTier={attempt !== null ? attempt["tier"] : ""}
                                    description={attempt !== null && minorTab === "overview" ? attempt["description"] : ""}
                                    exclusiveDescription={attempt !== null ? attempt["exclusive_description"] : null}
                                    postDate={attempt !== null ? attempt["created_at"] : ""}
                                    userIsOP={currentUser}
                                    id={attempt !== null ? attempt["_id"] : 0}
                                    renown={attempt !== null ? attempt["tier"] : 0}
                                    project={false}
                                />
                                <div style={{ height: "20px" }} />
                            </div>
                            <div style={window.innerWidth > 1000 ? { overflow: "hidden", width: "70vw", maxWidth: "1300px", alignItems: "center", display: "flex", flexDirection: "column" } : { overflow: "hidden", width: "70vw", maxWidth: "1300px", alignItems: "center", display: "flex", flexDirection: "column" }}>
                                {minorTabDetermination()}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        )
    }

    const minorTabDetermination = () => {
        if (window.innerWidth > 1000) {
            if (minorTab === "description") {
                return descriptionTab()
            } else if (minorTab === "attempt Description") {
                return attemptDescriptionTab()
            }
        } else {
            return descriptionTab()
        }
    }

    const mainTabSource = () => {
        return (
            <div style={{ display: "flex", width: "80vw", height: "63vh" }}>
                {attempt !== null ? (
                    <CodeDisplayEditor repoId={attempt !== null ? attempt.repo_id : 0} references={"main"} filepath={""} width={"75vw"} height={"73vh"} style={{ display: "contents", flexDirection: "row", width: "75vw" }} projectName={attempt !== null ? attempt.post_title : ""} />
                ) : (<ThreeDots />)}
                {/*<Editor theme={theme}/>*/}
            </div>
        )
    }
    const getConfig = async () => {
        let res = await call(
            "/api/project/config",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {
                "commit": "main", // for now always 'main' - future will handle branches and commits
                "repo": attempt["repo_id"],  // available in attempt or project
            },
            null,
            config.rootPath
        )

        setWsConfig(res["ws_config"])
    }

    const confirmEditConfig = async () => {
        let res = await call(
            "/api/project/confirmEditConfig",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {
                "project": attempt["_id"], // available in attempt or project
            },
            null,
            config.rootPath
        )

        if (res["message"] === "failed to destroy workspace") {
            setLoadingEdit(false)
            swal("Error", "Sorry, GIGO ran into a internal server error, we will look at that right away", "error")
        } else if (res["message"] === "config edit confirmed successfully") {
            setLoadingEdit(false)
            setEditConfirm(false)
            swal("Config Edited!", "Your changes have been saved.", "success");
        }
    }


    const editConfig = async () => {
        setLoadingEdit(true)
        try {
            const doc = yaml.load(wsConfig);
        } catch (e) {
            swal("YAML Format Error", e["message"], "error");
            setLoadingEdit(false)
            return
        }

        let res = await call(
            "/api/project/editConfig",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {
                "commit": "main", // for now always 'main' - future will handle branches and commits
                "repo": attempt["repo_id"],  // available in attempt or project
                "content": wsConfig
            },
            null,
            config.rootPath
        )

        if (res["message"] === "repo config updated successfully.") {
            //@ts-ignore
            // swal("Config Edited!", "Your changes have been saved.", "success");
            setEditConfirm(true)
            setLoadingEdit(false)
        } else if (res["message"] === "config is not the right format") {
            //@ts-ignore
            swal("Cannot Edit Config", "Sorry, the config is not the right format. Please try again.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "version must be 0.1") {
            //@ts-ignore
            swal("Cannot Edit Config", "Version must be 0.1.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "must have a base container") {
            //@ts-ignore
            swal("Cannot Edit Config", "You must include a base container.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "must have a working directory") {
            //@ts-ignore
            swal("Cannot Edit Config", "You must include a working directory.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "must provide cpu cores") {
            //@ts-ignore
            swal("Cannot Edit Config", "You must configure up to 6 cpu cores.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "must provide memory") {
            //@ts-ignore
            swal("Cannot Edit Config", "You must configure up to 8 GB of memory.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "must provide disk") {
            //@ts-ignore
            swal("Cannot Edit Config", "You must configure up to 100 GB of disk space.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "cannot use more than 6 CPU cores") {
            //@ts-ignore
            swal("Cannot Edit Config", "Cannot use more than 6 CPU cores.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "cannot use more than 8 GB of RAM") {
            //@ts-ignore
            swal("Cannot Edit Config", "Cannot use more than 8 GB of RAM.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "cannot use more than 100 GB of disk space") {
            //@ts-ignore
            swal("Cannot Edit Config", "Cannot use more than 100 GB of disk space.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "failed to locate repo") {
            //@ts-ignore
            swal("Cannot Edit Config", "Sorry, there was an internal error. Let us look into that for you as soon as possible.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "failed to retrieve file from repo") {
            //@ts-ignore
            swal("Cannot Edit Config", "Sorry, there was an internal error. Let us look into that for you as soon as possible.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "failed to update the workspace config in repo") {
            //@ts-ignore
            swal("Cannot Edit Config", "Sorry, there was an internal error. Let us look into that for you as soon as possible.", "error");
            setLoadingEdit(false)
        } else if (res["message"] === "config is the same") {
            //@ts-ignore
            swal("No Changes Made", "", "info");
            setLoadingEdit(false)
        }
    }

    const mainTabEdit = () => {
        return (
            <div style={{ display: "block", width: "80vw", height: "63vh", justifyContent: "center" }}>
                <WorkspaceConfigEditor
                    value={wsConfig}
                    setValue={(e) => setWsConfig(e)}
                    style={{
                        float: "left",
                        marginLeft: "40px",
                        marginRight: "40px"
                    }}
                    width={"72.5vw"}
                    height={"58vh"}
                />
                <LoadingButton variant={"contained"}
                    loading={loadingEdit}
                    sx={{
                        height: "4vh",
                        minHeight: "35px",
                        bgcolor: theme.palette.primary,
                        width: "72.5vw",
                        marginTop: "45px",
                        marginLeft: "40px",
                        marginRight: "40px",
                        borderRadius: "10px",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        textAlign: "center",
                        marginTop: "10px",
                        marginBottom: "10px"
                    }}
                    onClick={() => editConfig()}>
                    Confirm Edit
                </LoadingButton>
                <Dialog
                    open={editConfirm}
                    onClose={() => setEditConfirm(false)}
                >
                    <DialogTitle>{"Apply Changes Now?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            To ensure the changes take effect, they will be automatically applied after 24 hours. However, if you prefer, you can apply the changes immediately. Please note that applying a configuration change will require the workspace to re-initialize, resulting in the deletion of any data that has not been pushed to Git or specified within the configuration.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditConfirm(false)} color="primary">Apply Later</Button>
                        <Button onClick={() => confirmEditConfig()} color={"error"}>
                            Apply Changes Now
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }


    const lastIndexOf = (array: string | any[], key: string) => {
        for (let i = array.length - 1; i >= 0; i--) {
            if (array[i].threadId === key)
                return i;
        }
        return -1;
    };



    // const mainTabHtml = () => {
    //     return (
    //         <div style={{width: "80vw"}}>
    //             {mainTab === "project" ? mainTabProject() : mainTabSource()}
    //         </div>
    //     )
    // }


    const handleTabChange = (newValue: string) => {
        setMainTab(newValue);
        window.location.hash = "#" + newValue
        if (newValue === "edit") {
            getConfig()
        }
    };

    const getProjectIcon = (projectType: string) => {
        switch (projectType) {
            case "Playground":
                return (
                    <HorseIcon sx={{ width: "24px", height: "24px" }} />
                )
            case "Casual":
                return (
                    <HoodieIcon sx={{ width: "20px", height: "20px" }} />
                )
            case "Competitive":
                return (
                    <TrophyIcon sx={{ width: "18px", height: "18px" }} />
                )
            case "Interactive":
                return (
                    <GraduationIcon sx={{ width: "20px", height: "20px" }} />
                )
            case "Debug":
                return (
                    <DebugIcon sx={{ width: "20px", height: "20px" }} />
                )
            default:
                return (
                    <QuestionMark sx={{ width: "20px", height: "20px" }} />
                )
        }
    }

    /**
     * Convert millis duration to a well formatted time string with a min precision of minutes (ex: 1h2m)
     */
    const millisToTime = (millisDuration: number) => {
        const seconds = Math.floor((millisDuration / 1000) % 60);
        const minutes = Math.floor((millisDuration / (1000 * 60)) % 60);

        let timeString = "";

        // we cap at 10 minutes since anything longer is likely a system error
        // skewing the time to be higher
        if (minutes >= 10) {
            return `>10m`
        }

        if (minutes > 0) {
            timeString += `${minutes}m `;
        }
        if (seconds > 0) {
            timeString += `${seconds}s `;
        }

        return timeString.trim();
    };

    const shimmer = keyframes`
      0% {
        background-position: -1200px 0;
      }
      100% {
        background-position: 1200px 0;
      }
    `;

    const StyledDiv = styled.div`
      animation: ${shimmer} 2.2s infinite linear forwards;
      width: 100%;
      height: 220%;
      background: #E5F0FB;
      background: linear-gradient(to right, #c1dceb 4%, #a3cbe1 25%, #c1dceb 36%);
      background-size: 1200px 100%;
    `;

    const renderTabButtons = () => {

        return (
            <>
                <Grid item sx={1}>
                    {attempt !== "" && attempt !== undefined ? (
                        <Button variant={"outlined"} sx={styles.mainTabButton} disabled={mainTab === "project"}
                            onClick={() => handleTabChange("project")}>
                            Project
                        </Button>
                    ) : (
                        <StyledDiv style={{ height: "35px", width: "100px", borderRadius: 2 }} />
                    )}
                </Grid>
                {!exclusive && attempt !== "" && attempt !== undefined && (attempt["closed"] === true || userId === attempt?.author_id) ? (
                    <Grid item sx={1}>
                        <Button variant={"outlined"} sx={styles.mainTabButton} disabled={mainTab === "source"}
                                onClick={() => handleTabChange("source")}>
                            Source Code
                        </Button>
                    </Grid>
                ) : !exclusive && attempt !== "" && attempt !== undefined && (attempt["closed"] === false && userId !== attempt?.author_id) ? (
                    <Grid item sx={1}>
                        <Tooltip title={"This user has not yet published this attempt"}>
                            <Button variant={"outlined"} sx={styles.mainTabButton} disabled={mainTab === "source"}
                                    onClick={() => handleTabChange("source")} disabled={true}>
                                Source Code
                            </Button>
                        </Tooltip>
                    </Grid>
                ) : null}
                {window.innerWidth > 1000 && attempt !== "" && attempt !== undefined && userId === attempt?.author_id ? (
                    <Grid item sx={1}>
                        <Button variant="outlined" sx={styles.mainTabButton} disabled={mainTab === "edit"} onClick={() => handleTabChange("edit")}>
                            Edit Config
                        </Button>
                    </Grid>
                ) : (<div />)}
                <Grid item sx={1}>
                    {attempt !== "" && attempt !== undefined ? (
                        <Button variant={"outlined"} sx={styles.mainTabButton}
                            href={"/challenge/" + attempt?.post_id}>
                            Original Challenge
                        </Button>
                    ) : (
                        <StyledDiv style={{ height: "35px", width: "100px", borderRadius: 2 }} />
                    )}
                </Grid>
                {userId === attempt?.author_id && (
                    <Grid item sx={1}>
                        {attempt !== "" && attempt !== undefined ? (
                            <Button
                                variant={"outlined"}
                                sx={{
                                    height: "4vh",
                                    fontSize: "0.8em",
                                    '&:hover': {
                                        backgroundColor: theme.palette.error.main + "25",
                                    }
                                }}
                                color={"error"}
                                disabled={closedState}
                                onClick={() => setConfirm(true)}
                            >
                                {closedState ? "Attempt Published" : "Publish Attempt"}
                            </Button>
                        ) : (
                            <StyledDiv style={{ height: "35px", width: "100px", borderRadius: 2 }} />
                        )}
                    </Grid>
                )}
            </>
        )
    }

    const renderTopBar = () => {
        let toolTipText = "Unknown Launch Time"
        if (attempt["start_time_millis"] !== undefined && attempt["start_time_millis"] !== null && attempt["start_time_millis"] !== 0) {
            toolTipText = `Estimated Launch Time: ${millisToTime(attempt["start_time_millis"])}`
        }

        if (attempt["closed"] === false && userId !== attempt?.author_id) {
            toolTipText = "This user has not yet published this attempt"
        }

        return (
            <>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    top: "80px",
                    zIndex: 1000, // You may need to adjust this
                    marginTop: "10px"
                }}>
                    <Box
                        sx={{
                            p: 2,
                            height: "8vh",
                            minHeight: "70px",
                            alignItems: "center",
                            border: 1,
                            borderRadius: "15px",
                            borderColor: theme.palette.primary.dark + "75",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                            width: 'fit-content',  // Add this line,
                        }}
                    >
                        <Grid container
                            direction="row"
                            justifyContent="space-evenly"
                            alignItems="center"
                            spacing={2}
                            sx={{
                                width: 'fit-content',  // Add this line
                                height: "100%",
                            }}
                        >
                            {renderTabButtons()}
                            {attempt !== null && attempt !== "" ? (
                                <Grid item sx={1}>
                                    <Tooltip title={toolTipText} placement={"top"} arrow disableInteractive enterDelay={200} leaveDelay={200}>
                                        <div>
                                            <LoadingButton
                                                loading={isLoading}
                                                variant={"contained"}
                                                disabled={attempt["closed"] === false && userId !== attempt?.author_id}
                                                color={"secondary"}
                                                sx={{
                                                    height: "4vh",
                                                    maxHeight: "50px",
                                                    fontSize: "0.8em",
                                                }}
                                                onClick={() => {
                                                    if (!loggedIn) {
                                                        window.location.href = "/signup";
                                                    }
                                                    userId === attempt?.author_id ? launchWorkspace() : createAttempt();
                                                }}
                                            >
                                                Launch <RocketLaunchIcon sx={{ marginLeft: "10px" }} />
                                            </LoadingButton>
                                        </div>
                                    </Tooltip>
                                </Grid>
                            ) : null}
                        </Grid>
                    </Box>
                </div>
                <Dialog
                    open={confirm}
                    onClose={() => setConfirm(false)}
                >
                    <div>
                        <DialogTitle>{"Publish This Attempt? Add A Title"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                If you close this attempt, you will still be able to view your project, but you will no longer be able to make any changes.
                                <hr/>
                                If you have already changed the title from the post title and would like to keep that name, please retype it below to confirm.
                            </DialogContentText>
                            <TextField
                                id={"title"}
                                variant={`outlined`}
                                color={"primary"}
                                label={"Title"}
                                required={true}
                                margin={`normal`}
                                type={`text`}
                                sx={{
                                    width: "100%"
                                }}
                                value={attemptTitle}
                                onChange={(e) => setAttemptTitle(e.target.value)}
                            />
                        </DialogContent>
                    </div>
                    <DialogActions>
                        <Button
                            onClick={handleCloseAttempt}
                            color="primary"
                            variant={"outlined"}
                            sx={{
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main + "25",
                                }
                            }}
                        >
                            Confirm
                        </Button>
                        <Button
                            onClick={() => setConfirm(false)}
                            color={"error"}
                            variant={"outlined"}
                            sx={{
                                '&:hover': {
                                    backgroundColor: theme.palette.error.main + "25",
                                }
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        )
    }



    return (
        <div>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    {attempt !== null ? (
                        <HelmetProvider>
                            <Helmet>
                                <title>{attempt["title"] !== null ? attempt["title"] : attempt["post_title"]}</title>
                                <meta property="og:title" content={attempt["title"] !== null ? attempt["title"] : attempt["post_title"]} data-rh="true" />
                                <meta property="og:description" content={attempt["description"]} data-rh="true" />
                                <meta property="og:image" content={config.rootPath + attempt["thumbnail"]} data-rh="true" />
                            </Helmet>
                        </HelmetProvider>
                    ) : (
                        <HelmetProvider>
                            <Helmet>
                                <title>Attempt</title>
                                <meta property="og:image" content={alternativeImage} data-rh="true" />
                            </Helmet>
                        </HelmetProvider>
                    )}
                    {
                        embedded ? (<div style={{ paddingTop: "25px" }} />) : (<></>)
                    }
                    <Typography variant="h5" component="div" sx={styles.projectName} style={{ display: "flex", flexDirection: "row" }}>
                        {editTitle ? (
                            <TextField
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                                variant="outlined"
                                size="medium"
                                color={(projectTitle.length > 30) ? "error" : "primary"}
                                fullWidth
                                required
                                sx={{ mt: 2 }}
                                style={{ width: "auto", background: theme.palette.background.default, zIndex: 2000 }}
                                inputProps={styles.textField}
                                multiline
                            />
                        ) : (
                            <div>
                                {console.log("projectname: ", projectName)}
                                {projectName}
                            </div>
                        )}
                        {
                            (attempt !== null) ? (
                                <Chip
                                    label={attempt["post_type_string"]}
                                    color="primary"
                                    variant="outlined"
                                    sx={{ marginLeft: "20px", marginTop: "5px" }}
                                    icon={getProjectIcon(attempt["post_type_string"])}
                                />
                            ) : (<div />)
                        }
                        {attempt !== null && userId === attempt["author_id"] && window.innerWidth > 1000 ? (
                            <div>
                                {!editTitle ? (
                                    <Button onClick={() => setEditTitle(true)}>
                                        <EditIcon />
                                    </Button>
                                ) : (
                                    <div>
                                        <Button onClick={() => {
                                            editProject(
                                                projectTitle !== projectName ? projectTitle : null,
                                                null
                                            )
                                        }}>
                                            Submit
                                        </Button>
                                        <Button onClick={() => setEditTitle(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </Typography>
                    {window.innerWidth > 1000 ? (
                        <div>
                            {renderTopBar()}
                        </div>
                    ) : (
                        <div style={{ marginTop: "25px" }}>
                            {attempt !== null && attempt !== "" ? (
                                <Typography component={"div"} sx={{
                                    width: "90%",
                                    height: "auto",
                                    display: "flex",
                                    flexDirection: "row"
                                }}>
                                    <Typography style={{ display: "flex", flexDirection: "row", width: "85%" }}>
                                        <div>
                                            <UserIcon
                                                userId={attempt !== null ? attempt["author_id"] : ""}
                                                userTier={attempt !== null ? attempt["tier"] : ""}
                                                userThumb={attempt !== null ? config.rootPath + "/static/user/pfp/" + attempt["author_id"] : ""}
                                                backgroundName={attempt !== null ? attempt["name"] : null}
                                                backgroundPalette={attempt !== null ? attempt["color_palette"] : null}
                                                backgroundRender={attempt !== null ? attempt["render_in_front"] : null}
                                                size={50}
                                                imageTop={2}
                                            />
                                        </div>
                                        <Typography variant="h5" component="div">
                                            {attempt !== null ? attempt["author"] : ""}
                                        </Typography>
                                    </Typography>
                                    <Typography variant="body1" color="text.primary" align="right">
                                        {new Date(attempt !== null ? attempt["created_at"] : "").toLocaleString("en-us", { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </Typography>
                                </Typography>
                            ) : (
                                <Typography component={"div"} sx={{
                                    width: "90%",
                                    height: "auto",
                                    display: "flex",
                                    flexDirection: "row"
                                }}>
                                    <Typography style={{ display: "flex", flexDirection: "row", width: "85%" }}>
                                        <div>
                                            <Person3Icon sx={{ width: "50px", height: "50px" }} />
                                        </div>
                                    </Typography>
                                    <StyledDiv style={{ height: "24px", width: "40%", marginBottom: "12px", borderRadius: "20px", marginTop: "10px" }} />
                                </Typography>
                            )}
                        </div>
                    )}
                    <div>
                        <div style={{ display: "flex", justifyContent: "center", paddingTop: "1%" }}>
                            {mainTabHtml()}
                        </div>
                    </div>
                    {/* add a 10vh buffer at the end of the page */}
                    <div style={{ height: "10vh" }} />
                    {/* On mobile add a hovering button to launch the project */}
                    {window.innerWidth <= 1000 && (
                        <Fab
                            color="secondary"
                            disabled={(attempt["closed"] === false && userId !== attempt?.author_id) || isLoading}
                            aria-label="launch-mobile"
                            sx={{ position: "fixed", bottom: "80px", right: "20px", zIndex: 6000 }}
                            onClick={() => {
                                if (!loggedIn) {
                                    window.location.href = "/signup";
                                }
                                userId === attempt?.author_id ? launchWorkspace() : createAttempt();
                            }}
                        >
                            {isLoading ? (<CircularProgress color="inherit" size={24} />) : (<RocketLaunchIcon />)}
                        </Fab>
                    )}
                </CssBaseline>
            </ThemeProvider>
        </div>
    );
}

export default AttemptPage;