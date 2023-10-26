

// @ts-nocheck

import * as React from "react";
import {useEffect, useRef} from "react";
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
import {getAllTokens, themeHelpers} from "../theme";
import UserIcon from "../components/UserIcon";
import SearchBar from "../components/SearchBar";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {initialAuthStateUpdate, selectAuthState, selectAuthStateUserName, updateAuthState} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import Editor from "../components/Editor";
import AppWrapper from "../components/AppWrapper";
import call from "../services/api-call";
import config from "../config";
import {useParams} from "react-router";
import Post from "../models/post"
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import PostOverview from "../components/PostOverview";
import {selectAuthStateId} from "../reducers/auth/auth";
import swal from "sweetalert";
import {Workspace} from "../models/workspace";
import CodeDisplayEditor from "../components/editor/workspace_config/code_display_editor";
import {ThreeDots} from "react-loading-icons";
import {LoadingButton} from "@mui/lab";
import Attempt from "../models/attempt";

import HorseIcon from "../components/Icons/Horse";
import HoodieIcon from "../components/Icons/Hoodie";
import { QuestionMark } from "@mui/icons-material";
import TrophyIcon from "../components/Icons/Trophy";
import GraduationIcon from "../components/Icons/Graduation";

import {v4} from "uuid";
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
import styled, {keyframes} from 'styled-components';
import WorkspaceConfigEditor from "../components/editor/workspace_config/editor";
import {Helmet, HelmetProvider} from "react-helmet-async"
import gigoImg from "../img/premiumGorilla.png"

import * as yaml from 'js-yaml';

function AttemptPage() {
    // retrieve url params
    let {id} = useParams();
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


    let handleCloseAttempt = () => {
        setConfirm(false)
        closeAttempt()
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
            {attempt_id: id},
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

        if (res["message"] === "You must be logged in to access the GIGO system."){
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }
    }
    const getProjectInformation = async () => {
        let attempt = await call(
            "/api/attempt/get",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {attempt_id: id},
            null,
            config.rootPath
        )

        let post = await call(
            "/api/attempt/getProject",
            "post",
            null,
            null,
            null,
            {attempt_id: id},
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

        if (res["message"] === "You must be logged in to access the GIGO system." || res2["message"] === "You must be logged in to access the GIGO system."){
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

        if (res2["description"] === undefined){
            if (res2["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            swal("Server Error", res["message"])
            return
        }

        if (res2["exclusive"] !== undefined && res2["exclusive"] !== null){
            setExclusive(true)
        } else {
            setExclusive(false)
        }

        // setProject(res["post"])
        setAttempt(res["post"])
        // setProjectDesc(res["post"]["description"])
        setProjectDesc(res["description"])
        // setAttemptDesc(res["description"])
        setAttemptDesc(res["evaluation"])
        setClosedState(res["post"]["closed"])
        setProjectName( "Attempt: " + res["post"]["post_title"])
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
        window.addEventListener('blur', function() {
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
        let beforeUnload = function(event) {
            // don't trigger preventDefault if we are using firefox
            if (window.navigator.userAgent.indexOf("Firefox") === -1) {
                event.preventDefault();
            }

            // record the exit time in session storage
            window.sessionStorage.setItem(`project-exit-${attempt._id}`, `${new Date().getTime()}:${implicitSessionID.current}`)

            // record changing pages
            recordImplicitAction(false)

            // clear hooks
            window.removeEventListener('blur', function() {
                // record the exit time in session storage
                window.sessionStorage.setItem(`project-exit-${attempt._id}`, `${new Date().getTime()}:${implicitSessionID.current}`)
                recordImplicitAction(false)
            });
            window.onfocus = null

            // this is bad practice but we need a little time to get the implicit action recorded
            setTimeout(function() {}, 500)
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

        if (loggedIn){
            // bail if we don't have a project yet
            if (attempt === null || implicitSessionID.current === null) {
                return
            }

            // use the state session ID if no session ID is provided
            if (sessionId === null) {
                sessionId = implicitSessionID.current
            }

            // record click action
            await call(
                "/api/implicit/recordAction",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {
                    post_id: id,
                    action: 0,
                    session_id: sessionId,
                },
                null,
                config.rootPath
            )
        }
    }

    const dispatch = useAppDispatch();

    let navigate = useNavigate();

    let descriptionRef = useRef(null);

    const descriptionTab = () => {
        if (window.innerWidth > 1000){
            return (
                <MarkdownRenderer markdown={projectDesc} style={{
                    width: "70vw",
                    maxWidth: "1300px",
                    overflowWrap: "break-word",
                    borderRadius: "10px",
                    padding: "2em 3em"
                }}/>
            )
        } else {
            return (
                <MarkdownRenderer markdown={projectDesc} style={{
                    width: "104vw",
                    maxWidth: "1300px",
                    overflowWrap: "break-word",
                    borderRadius: "10px",
                    padding: "2em 3em"
                }}/>
            )
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
            <div style={{width: "80vw"}}>
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

        if (res["message"] === "You must be logged in to access the GIGO system."){
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

        if (res["message"] === "You must be logged in to access the GIGO system."){
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
            }}/>
        )
    }

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setMinorTab(newValue);
    };

    const mainTabProject = () => {
        let minorValues = ["overview", "description"]
        if (attemptDesc && attemptDesc.trim().length > 0) {
            minorValues.push("attempt Description")
        }

        let currentUser = false

        if (userId === attempt?.author_id){
            currentUser = true
        }
        let imgSrc;
        if (attempt!== null) {
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

        return (
            <div style={{display: "flex", width: "80vw", height: "auto"}}>
                {window.innerWidth > 1000 ? (
                    <div style={{display: "flex", justifyContent: "left", paddingRight: "20px", height: "100%"}}>
                        <Tabs
                            orientation="vertical"
                            value={minorTab}
                            onChange={handleChange}
                            aria-label="Vertical tabs"
                        >
                            {minorValues.map((minorValue) => {
                                return <Tab label={minorValue} value={minorValue} key={minorValue} className={minorValues}
                                            sx={minorValue === "overview" ? {color: "text.primary", borderRadius: 1, zIndex: "600000"} : {color: "text.primary", borderRadius: 1}}/>;
                            })}
                        </Tabs>
                    </div>
                ) : null}
                <div style={window.innerWidth > 1000 ? {display: "flex", justifyContent: "center", width: "90%"} : {display: "flex", justifyContent: "center", width: "100%", position: "relative", flexDirection: "column", marginBottom: "150px"}}>
                    {window.innerWidth <= 1000 ? (
                        <div>
                            <div style={{marginBottom: "50px"}}>
                                <PostOverviewMobile
                                    width={"100%"}
                                    height={"100%"}
                                    description={attempt !== null && minorTab === "overview" ? attempt["description"] : ""}
                                    exclusiveDescription={attempt!== null? attempt["exclusive_description"] : null}
                                    postDate={attempt !== null ? attempt["created_at"] : ""}
                                    userIsOP={currentUser}
                                    id={attempt !== null ? attempt["_id"] : 0}
                                    renown={attempt !== null ? attempt["tier"] : 0}
                                    project={false}
                                />
                            </div>
                            {attempt !== null && attempt !== "" ? (
                                <div style={{width: "100%", position: "relative", height: "300px", marginBottom: "50px"}}>
                                    <img
                                        src={attempt !== null ? config.rootPath + attempt["thumbnail"] : alternativeImage}
                                        style={{                                        width: "inherit",
                                            height: "inherit", borderRadius: "5px"}}
                                        onError={handleError}
                                        alt={"project thumbnail"}/>
                                </div>
                            ) : (
                                <StyledDiv style={{height: "200px", width: "inherit"}}/>
                            )}

                            <div style={window.innerWidth > 1000 ? {overflow: "hidden", width: "70vw", maxWidth: "1300px", alignItems: "center", display: "flex", flexDirection: "column"} : {overflow: "hidden", width: "100%", maxWidth: "1300px", alignItems: "center", display: "flex", flexDirection: "column"}}>
                                {minorTabDetermination()}
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <div style={{overflow: "hidden", width: "70vw", maxWidth: "1300px", alignItems: "center", display: "flex", flexDirection: "column", zIndex: 6}}>
                                <div style={{width: "100%", position: "relative", height: "300px"}}>
                                    <img
                                        src={attempt !== null ? config.rootPath + attempt["thumbnail"] : alternativeImage}
                                        style={{
                                            width: '100%',
                                            height: '200%',
                                            objectFit: 'stretch'}}
                                        onError={handleError}
                                        alt={"project thumbnail"}/>
                                </div>
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
                                    exclusiveDescription={attempt !== null? attempt["exclusive_description"] : null}
                                    postDate={attempt !== null ? attempt["created_at"] : ""}
                                    userIsOP={currentUser}
                                    id={attempt !== null ? attempt["_id"] : 0}
                                    renown={attempt !== null ? attempt["tier"] : 0}
                                    project={false}
                                />
                                <div style={{height: "20px"}}/>
                            </div>
                            <div style={window.innerWidth > 1000 ? {overflow: "hidden", width: "70vw", maxWidth: "1300px", alignItems: "center", display: "flex", flexDirection: "column"} : {overflow: "hidden", width: "70vw", maxWidth: "1300px", alignItems: "center", display: "flex", flexDirection: "column"}}>
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
            <div style={{display: "flex", width: "80vw", height: "63vh"}}>
                {attempt !== null ? (
                    <CodeDisplayEditor repoId={attempt !== null ? attempt.repo_id : 0} references={"main"} filepath={""} width={"75vw"}              height={"73vh"} style={{display: "contents", flexDirection: "row", width: "75vw"}} projectName={attempt !== null ? attempt.post_title : ""}/>
                ) : (<ThreeDots/>)}
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
            <div style={{display: "block", width: "80vw", height: "63vh", justifyContent: "center"}}>
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
                        <Button  onClick={() => confirmEditConfig()} color={"error"}>
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
        window.location.hash = "#"+newValue
        if (newValue ==="edit") {
            getConfig()
        }
    };

    const getProjectIcon = (projectType: string) => {
        switch (projectType) {
        case "Playground":
            return (
                <HorseIcon sx={{width: "24px", height: "24px"}} />
            )
        case "Casual":
            return (
                <HoodieIcon sx={{width: "20px", height: "20px"}} />
            )
        case "Competitive":
            return (
                <TrophyIcon sx={{width: "18px", height: "18px"}} />
            )
        case "Interactive":
            return (
                <GraduationIcon sx={{width: "20px", height: "20px"}} />
            )
        default:
            return (
                <QuestionMark sx={{width: "20px", height: "20px"}} />
            )
        }
    }

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
        console.log("attempt: ", attempt)
        return (
            <>
                <Grid item sx={1}>
                    {attempt !== "" && attempt !== undefined ? (
                        <Button variant={"outlined"} sx={styles.mainTabButton} disabled={mainTab === "project"}
                                onClick={() => handleTabChange("project")}>
                            Project
                        </Button>
                    ) : (
                        <StyledDiv style={{height: "35px", width: "100px", borderRadius: 2}}/>
                    )}
                </Grid>
                {!exclusive && attempt !== "" && attempt !== undefined ? (
                    <Grid item sx={1}>
                        <Button variant={"outlined"} sx={styles.mainTabButton} disabled={mainTab === "source"}
                                onClick={() => handleTabChange("source")}>
                            Source Code
                        </Button>
                    </Grid>
                ) : null}
                {window.innerWidth > 1000 && attempt !== "" && attempt !== undefined ? (
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
                        <StyledDiv style={{height: "35px", width: "100px", borderRadius: 2}}/>
                    )}
                </Grid>
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
                        <StyledDiv style={{height: "35px", width: "100px", borderRadius: 2}}/>
                    )}
                </Grid>
            </>
        )
    }

    const renderTopBar = () => {
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
                                    <LoadingButton
                                        loading={isLoading}
                                        variant={"contained"}
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
                                        {closedState ? (userId === attempt?.author_id ? "View Attempt" : "Branch Attempt") :
                                            (userId === attempt?.author_id ? "Keep Going" : "Branch Attempt")}
                                    </LoadingButton>
                                </Grid>
                            ) : null}
                        </Grid>
                    </Box>
                </div>
                <Dialog
                    open={confirm}
                    onClose={() => setConfirm(false)}
                >
                    <DialogTitle>{"Close This Attempt?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            If you close this attempt, you will still be able to view your project, but you will no longer be able to make any changes.
                        </DialogContentText>
                    </DialogContent>
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

    console.log("attempt is: ", attempt)

    return (
        <div>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    {attempt !== null ? (
                        <HelmetProvider>
                            <Helmet>
                                <title>{attempt["post_title"]}</title>
                                <meta property="og:title" content={attempt["post_title"]} data-rh="true"/>
                                <meta property="og:description" content={attempt["description"]} data-rh="true"/>
                                <meta property="og:image" content={config.rootPath + attempt["thumbnail"]} data-rh="true"/>
                            </Helmet>
                        </HelmetProvider>
                    ) : (
                        <HelmetProvider>
                            <Helmet>
                                <title>Attempt</title>
                                <meta property="og:image" content={alternativeImage} data-rh="true"/>
                            </Helmet>
                        </HelmetProvider>
                    )}
                    {
                        embedded ? (<div style={{paddingTop: "25px"}} />) : (<></>)
                    }
                    <Typography variant="h5" component="div" sx={styles.projectName}>
                        {projectName}
                        {
                            (attempt !== null) ? (
                                <Chip
                                    label={attempt["post_type_string"]}
                                    color="primary"
                                    variant="outlined"
                                    sx={{marginLeft: "20px", marginTop: "5px"}}
                                    icon={getProjectIcon(attempt["post_type_string"])}
                                />
                            ) : (<div/>)
                        }
                    </Typography>
                    {window.innerWidth > 1000 ? (
                        <div>
                            {renderTopBar()}
                        </div>
                    ) : (
                        <div style={{marginTop: "25px"}}>
                            {attempt !== null && attempt !== "" ? (
                                <Typography component={"div"} sx={{width: "90%",
                                    height: "auto",
                                    display: "flex",
                                    flexDirection: "row"}}>
                                    <Typography style={{display: "flex", flexDirection: "row", width: "85%"}}>
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
                                        {new Date(attempt !== null ? attempt["created_at"] : "").toLocaleString("en-us", {day: '2-digit', month: 'short', year: 'numeric'})}
                                    </Typography>
                                </Typography>
                            ) : (
                                <Typography component={"div"} sx={{width: "90%",
                                    height: "auto",
                                    display: "flex",
                                    flexDirection: "row"}}>
                                    <Typography style={{display: "flex", flexDirection: "row", width: "85%"}}>
                                        <div>
                                            <Person3Icon sx={{width: "50px", height: "50px"}}/>
                                        </div>
                                    </Typography>
                                    <StyledDiv style={{height: "24px", width: "40%", marginBottom: "12px", borderRadius: "20px", marginTop: "10px"}}/>
                                </Typography>
                            )}
                        </div>
                    )}
                    <div>
                        <div style={{display: "flex", justifyContent: "center", paddingTop: "1%"}}>
                            {mainTabHtml()}
                        </div>
                    </div>
                    {/* add a 10vh buffer at the end of the page */}
                    <div style={{height: "10vh"}}/>
                </CssBaseline>
            </ThemeProvider>
        </div>
    );
}

export default AttemptPage;