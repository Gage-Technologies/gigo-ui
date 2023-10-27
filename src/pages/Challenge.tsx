

// @ts-nocheck

import * as React from "react";
import {SyntheticEvent, useEffect} from "react";
import {
    Badge,
    Box,
    Button,
    ButtonBase,
    Chip,
    Card,
    createTheme,
    CssBaseline,
    Grid,
    IconButton,
    PaletteMode,
    Tab,
    Tabs,
    TextField,
    ThemeProvider,
    Tooltip,
    Typography,
    Modal,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Paper,
    InputBase,
    Autocomplete
} from "@mui/material";
import {getAllTokens, themeHelpers} from "../theme";
import SearchBar from "../components/SearchBar";
import SearchIcon from '@mui/icons-material/Search';
import {useAppSelector, useAppDispatch} from "../app/hooks";
import {
    initialAuthStateUpdate, selectAuthState,
    selectAuthStateId, selectAuthStateTutorialState,
    selectAuthStateUserName,
    updateAuthState
} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import AttemptsCard from "../components/AttemptsCard";
import {Chart} from "react-google-charts";
import DiscussionCard from "../components/DiscussionCard";
import ThreadComment from "../components/ThreadComment";
import SendIcon from '@mui/icons-material/Send';
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {useParams} from "react-router";
import Post from "../models/post"
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import PostOverview from "../components/PostOverview";
import PostOverviewMobile from "../components/PostOverviewMobile"
import {Workspace} from "../models/workspace";
import * as animationData from "../img/85023-no-data.json";
import CodeDisplayEditor from "../components/editor/workspace_config/code_display_editor";
import {LoadingButton} from "@mui/lab";
import {ThreeDots} from "react-loading-icons";
import Attempt from "../models/attempt";
import {
    Discussion,
    EmptyComment,
    EmptyDiscussion,
    EmptyThreadComment,
    EmptyThreadReply,
    ThreadReply
} from "../models/discussions";
import CommentCard from "../components/DiscussionComment";
import ThreadCard from "../components/ThreadComment";
import WorkspaceConfigEditor from "../components/editor/workspace_config/editor";
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import {v4} from "uuid";
import * as yaml from 'js-yaml';

import HorseIcon from "../components/Icons/Horse";
import HoodieIcon from "../components/Icons/Hoodie";
import { QuestionMark } from "@mui/icons-material";
import TrophyIcon from "../components/Icons/Trophy";
import GraduationIcon from "../components/Icons/Graduation";
import ProjectPayment from "./stripe/projectPayment";
import renown1 from "../img/renown/renown1.svg"
import renown2 from "../img/renown/renown2.svg"
import renown3 from "../img/renown/renown3.svg"
import renown4 from "../img/renown/renown4.svg"
import renown5 from "../img/renown/renown5.svg"
import renown6 from "../img/renown/renown6.svg"
import renown7 from "../img/renown/renown7.svg"
import renown8 from "../img/renown/renown8.svg"
import renown9 from "../img/renown/renown9.svg"
import renown10 from "../img/renown/renown10.svg"
import alternativeImage from "../img/Black.png"
import CardTutorial from "../components/CardTutorial";
import UserIcon from "../components/UserIcon";
import {useDispatch, useSelector} from "react-redux";
import {selectCacheState} from "../reducers/pageCache/pageCache";
import styled, {keyframes} from 'styled-components';
import PersonIcon from "@mui/icons-material/Person";
import {Helmet, HelmetProvider} from "react-helmet-async";
import CloseIcon from "@material-ui/icons/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {authorizeGithub} from "../services/auth";
import CaptchaPage from "./CaptchaPage";
import EditIcon from "@mui/icons-material/Edit";
import ProjectSelector from "../components/EditProjectSelector";
import { CloudUpload as CloudUploadIcon } from '@material-ui/icons';
import { Backdrop, Fade, makeStyles } from '@material-ui/core';
import darkImageUploadIcon from "../img/dark_image_upload2.svg";
import {initialCreateProjectStateUpdate} from "../reducers/createProject/createProject";
import ProjectRenown from "../components/EditProjectRenown";
import Tag from "../models/tag";
import editProjectRenown from "../components/EditProjectRenown";

function Challenge() {

    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [editTitle, setEditTitle] = React.useState(false);
    const [editImage, setEditImage] = React.useState(false);

    const TutorialLaunchButton = styled(LoadingButton)`
      animation: auraEffect1 2s infinite alternate;
    
      @keyframes auraEffect1 {
        0% {
          box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${theme.palette.secondary.main}, 0 0 20px ${theme.palette.secondary.main}, 0 0 25px ${theme.palette.secondary.main}, 0 0 30px ${theme.palette.secondary.main} 0 0 35px ${theme.palette.secondary.main};
        }
        100% {
          box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 25px ${theme.palette.secondary.main}, 0 0 30px ${theme.palette.secondary.main}, 0 0 35px ${theme.palette.secondary.main}, 0 0 40px ${theme.palette.secondary.main}, 0 0 50px ${theme.palette.secondary.main};
        }
      }
    `;

    const TutorialDiscussionButton = styled(Button)`
      animation: auraEffect2 2s infinite alternate;
    
      @keyframes auraEffect2 {
        0% {
          box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${theme.palette.primary.main}, 0 0 20px ${theme.palette.primary.main}, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main} 0 0 35px ${theme.palette.primary.main};
        }
        100% {
          box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main}, 0 0 40px ${theme.palette.primary.main}, 0 0 50px ${theme.palette.primary.main};
        }
      }
    `;

    const styles = {
        themeButton: {
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
        },
        tutorialHeader: {
            fontSize: "1rem",
        },
        tutorialText: {
            fontSize: "0.7rem",
        }
    };

    // retrieve url params
    let {id} = useParams();
    const queryParams = new URLSearchParams(window.location.search)


    const dispatch = useAppDispatch();
    const cache = useSelector(selectCacheState);

    const embedded = queryParams.has('embed') && queryParams.get('embed') === 'true';

    const [mainTab, setMainTab] = React.useState(window.location.hash.replace('#', '') !== "" ? window.location.hash.replace('#', '') : "project")

    const [searchText, setSearchText] = React.useState("")

    const [minorTab, setMinorTab] = React.useState("overview")

    const [discussionTab, setDiscussionTab] = React.useState("main")

    const [thread, setThread] = React.useState(false)
    const [purchasePopup, setPurchasePopup] = React.useState(false)

    const [discTitle, setDiscTitle] = React.useState("")

    const [commentBody, setCommentBody] = React.useState("")

    const [threadComment, setThreadComment] = React.useState("")

    const [loading, setLoading] = React.useState(true)

    const [attempt, setAttempt] = React.useState([])

    const [closedAttempts, setClosedAttempts] = React.useState([])
    const [selectedDiscussion, setSelectedDiscussion] = React.useState<Discussion>(EmptyDiscussion)
    const [selectedComment, setSelectedComment] = React.useState<Comment>(EmptyComment)
    const [selectedThread, setSelectedThread] = React.useState<Thread>(EmptyThreadComment)
    const [selectedReply, setSelectedReply] = React.useState<ThreadReply>(EmptyThreadReply)

    const [projectAttempts, setProjectAttempts] = React.useState([])

    const [projectDesc, setProjectDesc] = React.useState<string>("")
    const [projectEval, setProjectEval] = React.useState<string>("")
    const [project, setProject] = React.useState<Post | null>(null)
    const [projectImage, setProjectImage] = React.useState<string | null>(null)
    const [projectTitle, setProjectTitle] = React.useState<string>("")
    const [projectTutorial, setProjectTutorial] = React.useState<ProjectTutorial[] | null>(null)
    const [userAttempt, setUserAttempt] = React.useState<Attempt | null>(null)
    const [publishing, setPublishing] = React.useState(false)
    const [launchingWorkspace, setLaunchingWorkspace] = React.useState(false)
    const [imageGenLoad, setImageGenLoad] = React.useState<boolean>(false)

    const [discussionOptions, setDiscussionOptions] = React.useState([])
    const [discussionLeads, setDiscussionLeads] = React.useState([])
    const [commentLeads, setCommentLeads] = React.useState([])
    const [threadLeads, setThreadLeads] = React.useState([])

    const [discussions, setDiscussions] = React.useState([])
    const [comments, setComments] = React.useState([])
    const [threadComments, setThreadComments] = React.useState([])
    const [threadReplies, setThreadReplies] = React.useState([])

    const [discussionUpVotes, setDiscussionUpVotes] = React.useState([])
    const [commentUpVotes, setCommentUpVotes] = React.useState([])
    const [threadUpVotes, setThreadUpVotes] = React.useState([])
    const [replyUpVotes, setReplyUpVotes] = React.useState([])

    const [threadArray, setThreadArray] = React.useState([])
    const [replyArray, setReplyArray] = React.useState([])

    const [coffeePostEdit, setCoffeePostEdit] = React.useState<string>("")

    const [wsConfig, setWsConfig] = React.useState(null)

    const [discussionReplies, setDiscussionReplies] = React.useState([])

    const [createDiscussion, setCreateDiscussion] = React.useState(false)
    const [editDiscussionPopup, setEditDiscussionPopup] = React.useState(false);
    const [editCommentPopup, setEditCommentPopup] = React.useState(false);
    const [editCommentType, setEditCommentType] = React.useState(0);

    const [loadingEdit, setLoadingEdit] = React.useState(false)
    const [filteredDiscussions, setFilteredDiscussions] = React.useState([])
    const [deleteProject, setDeleteProject] = React.useState(false)

    const implicitSessionID = React.useRef<string | null>("")

    const [stepIndex, setStepIndex] = React.useState(0)

    const username = useAppSelector(selectAuthStateUserName)
    const callingId = useAppSelector(selectAuthStateId)

    const [editConfirm, setEditConfirm] = React.useState(false)

    const [sharePopupOpen, setSharePopupOpen] = React.useState(false)
    const [shareProject, setShareProject] = React.useState("")
    const [isEphemeral, setIsEphemeral] = React.useState(false)
    const [loadingEphemeral, setLoadingEphemeral] = React.useState(false)
    const [isCaptchaVerified, setIsCaptchaVerified] = React.useState(false)
    const [shouldRenderCaptcha, setShouldRenderCaptcha] = React.useState(false)
    const [genLimitReached, setGenLimitReached] = React.useState<boolean>(false);
    const [genOpened, setGenOpened] = React.useState<boolean>(false);
    const [promptError, setPromptError] = React.useState<string>("")
    const [prompt, setPrompt] = React.useState("");
    const [genImageId, setGenImageId] = React.useState<string>("");
    const [challengeType, setChallengeType] = React.useState<null | string>(null);
    const [projectRenown, setProjectRenown] = React.useState<number>(0);
    const [projectTags, setProjectTags] = React.useState<string[]>([])
    const [removedTagsState, setRemovedTagsState] = React.useState<Tag[]>([]);
    const [addedTagsState, setAddedTagsState] = React.useState<Tag[]>([]);
    const [tagOptions, setTagOptions] = React.useState<Tag[]>([])
    const [usedThumbnail, setUsedThumbnail] = React.useState<string | null>(null);

    const authState = useAppSelector(selectAuthState);

    let loggedIn = false
    if (authState.authenticated !== false) {
        loggedIn = true
    }

    const tutorialState = useAppSelector(selectAuthStateTutorialState)
    // we init this to false because we don't trigger until the content loads
    const [runTutorial, setRunTutorial] = React.useState(false)

    // this enables us to push tutorial restarts from the app wrapper down into this page
    useEffect(() => {
        if (tutorialState.challenge === !runTutorial) {
            return
        }
        setRunTutorial(!tutorialState.challenge && loggedIn)
    }, [tutorialState])

    useEffect(() => {
        if (queryParams.has('share')) {
            checkEphemeral();
        }
    }, []);

    const getSessionID = () => {
        // return empty string if there's no project
        if (project === null) {
            return ""
        }

        // check for an existing session token
        let lastSession = window.sessionStorage.getItem(`project-exit-${project._id}`)

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

    useEffect(() => {
        // bail if we don't have a project yet
        if (project === null) {
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
            window.sessionStorage.setItem(`project-exit-${project._id}`, `${new Date().getTime()}:${sid}`)
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
            window.sessionStorage.setItem(`project-exit-${project._id}`, `${new Date().getTime()}:${implicitSessionID.current}`)

            // record changing pages
            recordImplicitAction(false)

            // clear hooks
            window.removeEventListener('blur', function() {
                // record the exit time in session storage
                window.sessionStorage.setItem(`project-exit-${project._id}`, `${new Date().getTime()}:${implicitSessionID.current}`)
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
    }, [project])

    const recordImplicitAction = async (open: boolean, sessionId: string | null = null) => {
        if (loggedIn){
            // bail if we don't have a project yet
            if (project === null || implicitSessionID.current === null) {
                return
            }

            // use the state session ID if no session ID is provided
            if (sessionId === null) {
                sessionId = implicitSessionID.current
            }

            // determine the appropriate action
            let action: number | null = null;
            if (open) {
                if (callingId === project.author_id) {
                    action = 7
                } else {
                    action = 5
                }
            } else {
                if (callingId === project.author_id) {
                    action = 8
                } else {
                    action = 6
                }
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
                    action: action,
                    session_id: sessionId,
                },
                null,
                config.rootPath
            )
        }
    }

    const getProjectInformation = async () => {
        let projectPromise = call(
            "/api/project/get",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {post_id: id},
            null,
            config.rootPath
        )

        let attemptPromise = call(
            "/api/project/attempts",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {project_id: id, skip: 0, limit: 15},
            null,
            config.rootPath
        )

        let closedAttemptPromise = call(
            "/api/project/closedAttempts",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {project_id: id, skip: 0, limit: 15},
            null,
            config.rootPath
        )

        const [projectResponse, attemptResponse, closedAttemptResponse] = await Promise.all([
            projectPromise,
            attemptPromise,
            closedAttemptPromise,
        ])

        if (projectResponse["message"] === "You must be logged in to access the GIGO system." || attemptResponse["message"] === "You must be logged in to access the GIGO system." ||  closedAttemptResponse["message"] === "You must be logged in to access the GIGO system."){
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }

        if (projectResponse === undefined || attemptResponse === undefined || closedAttemptResponse === undefined) {
            swal("There has been an issue loading data. Please try again later.")
        }

        if (projectResponse["post"] === "user is not authorized to view this post.") {
            window.location.href = "/home"
        }

        if (projectResponse["post"] === undefined || projectResponse["description"] === undefined || projectResponse["evaluation"] === undefined) {
            if (projectResponse["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            swal("Server Error", projectResponse["message"])
            return
        }

        setProject(projectResponse["post"])
        if (projectResponse["attempt"] !== undefined && projectResponse["attempt"] != null) {
            setUserAttempt(projectResponse["attempt"])
        }
        const combinedArray = projectResponse["post"]["tag_strings"].map((item, index) => ({
            value: item,
            _id: projectResponse["post"]["tags"][index]
        }));
        // setProjectImage(projectResponse["post"]["thumbnail"])
        setProjectTags(combinedArray)
        setProjectRenown(projectResponse["post"]["tier"])
        setProjectTitle(projectResponse["post"]["title"])
        setChallengeType(projectResponse["post"]["post_type_string"])
        setProjectDesc(projectResponse["description"])
        setProjectEval(projectResponse["evaluation"])
        setProjectTutorial(projectResponse["tutorials"])
        setAttempt(attemptResponse["attempts"])
        setClosedAttempts(closedAttemptResponse["attempts"])


    }

    const publishProject = async () => {
        if (project === null || project.published) {
            return
        }

        let res = await call(
            "/api/project/publish",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {project_id: project._id},
            null,
            config.rootPath
        )

        if (res["message"] === "You must be logged in to access the GIGO system."){
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }

        if (res === undefined || res["message"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            setPublishing(false);
            return;
        }

        if (res["message"] !== "Post published successfully.") {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    (res["message"] !== "internal server error occurred") ?
                        res["message"] :
                        "An unexpected error has occurred. We're sorry, we'll get right on that!"
                );
            setPublishing(false);
            return;
        }

        let stateUpdate = Object.assign({}, project) as Post
        stateUpdate.published = true
        setProject(stateUpdate)
        setPublishing(false)
        swal("Project Published", "Other users can now see and Attempt this project!")
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

    const getDiscussions = async () => {
        let discuss = call(
            "/api/discussion/getDiscussions",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {post_id: id, skip: 0, limit: 50},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            discuss,
        ])

        if (res === undefined || res["discussions"] === undefined || res["lead_ids"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }

        setDiscussions(res["discussions"])
        FilterDiscussions()

        setCoffeePostEdit("")

        if (discussionUpVotes.length === 0 && res["up_voted"] !== null) {
            for (let i = 0; i < res["up_voted"].length; i++) {
                discussionUpVotes.push(res["up_voted"][i])
            }
        }

        if (discussionLeads.length === 0 && res["lead_ids"] !== null) {
            for (let i = 0; i < res["lead_ids"].length; i++) {
                discussionLeads.push(res["lead_ids"][i])
            }
        }

        if (discussionLeads.length !== 0) {
            let com = call(
                "/api/discussion/getComments",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {discussion_id: discussionLeads, skip: 0, limit: 50},
                null,
                config.rootPath
            )

            const [res2] = await Promise.all([
                com,
            ])

            if (res2 === undefined || res2["comments"] === undefined || res2["lead_ids"] === undefined || res2["up_voted"] === undefined) {
                if (sessionStorage.getItem("alive") === null)
                    //@ts-ignore
                    swal(
                        "Server Error",
                        "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                    );
                return;
            }

            setComments(res2["comments"])
            if (commentUpVotes.length === 0 && res2["up_voted"] !== null) {
                for (let i = 0; i < res2["up_voted"].length; i++) {
                    commentUpVotes.push(res2["up_voted"][i])
                }
            }

            if (commentLeads.length === 0 && res2["lead_ids"] !== null) {
                for (let i = 0; i < res2["lead_ids"].length; i++) {
                    commentLeads.push(res2["lead_ids"][i])
                }
            }
        }

        if (commentLeads.length !== 0) {
            let threadCom = call(
                "/api/discussion/getThreads",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {comment_id: commentLeads, skip: 0, limit: 15},
                null,
                config.rootPath
            )

            const [res3] = await Promise.all([
                threadCom,
            ])

            if (res3 === undefined || res3["threads"] === undefined || res3["lead_ids"] === undefined || res3["up_voted"] === undefined) {
                if (sessionStorage.getItem("alive") === null)
                    //@ts-ignore
                    swal(
                        "Server Error",
                        "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                    );
                return;
            }

            setThreadComments(res3["threads"])

            if (threadUpVotes.length === 0 && res3["up_voted"] !== null) {
                for (let i = 0; i < res3["up_voted"].length; i++) {
                    threadUpVotes.push(res3["up_voted"][i])
                }
            }

            if (threadLeads.length === 0 && res3["lead_ids"] !== null) {
                for (let i = 0; i < res3["lead_ids"].length; i++) {
                    threadLeads.push(res3["lead_ids"][i])
                }
            }
        }

        if (threadLeads.length !== 0) {
            let replies = call(
                "/api/discussion/getThreadReply",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {thread_id: threadLeads, skip: 0, limit: 15},
                null,
                config.rootPath
            )

            const [res4] = await Promise.all([
                replies,
            ])

            if (res4 === undefined || res4["thread_reply"] === undefined || res4["up_voted"] === undefined) {
                if (sessionStorage.getItem("alive") === null)
                    //@ts-ignore
                    swal(
                        "Server Error",
                        "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                    );
                return;
            }

            setThreadReplies(res4["thread_reply"])

        }
    }

    const getComments = async () => {
        let com = call(
            "/api/discussion/getComments",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {discussion_id: discussionLeads, skip: 0, limit: 50},
            null,
            config.rootPath
        )

        const [res2] = await Promise.all([
            com,
        ])

        if (res2 === undefined || res2["comments"] === undefined || res2["lead_ids"] === undefined || res2["up_voted"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }

        if (commentUpVotes.length === 0 && res2["up_voted"] !== null) {
            for (let i = 0; i < res2["up_voted"].length; i++) {
                commentUpVotes.push(res2["up_voted"][i])
            }
        }

        if (commentLeads.length === 0 && res2["lead_ids"] !== null) {
            for (let i = 0; i < res2["lead_ids"].length; i++) {
                commentLeads.push(res2["lead_ids"][i])
            }
        }

        setDiscussionReplies(res2["comments"])
    }


    useEffect(() => {
        setLoading(true)
        getProjectInformation()
        getDiscussions()
        setLoading(false)
    }, [id])

    useEffect(() => {
        if (projectDesc !== "")
            setRunTutorial(!tutorialState.challenge && loggedIn)
    }, [projectDesc])

    const projectName = project !== null ? project["title"] : ""

    const ownerName = project !== null ? project["author"] : ""
    const userId = useAppSelector(selectAuthStateId);
    let navigate = useNavigate();

    function insertBeforeAll(substring, insert, originalString) {
        var index = originalString.indexOf(substring);
        while (index !== -1) {
            originalString = originalString.slice(0, index) + insert + originalString.slice(index);
            // Start the next search from the end of the inserted string and the substring
            index = originalString.indexOf(substring, index + insert.length + substring.length);
        }
        return originalString;
    }


    const descriptionTab = () => {
        let regex = /(?:!\[[^\]]*\]\((?!http)(.*?)\))|(?:<img\s[^>]*?src\s*=\s*['\"](?!http)(.*?)['\"][^>]*?>)/g;
        let markdown = projectDesc
        let match;
        let finalString;
        while ((match = regex.exec(markdown)) !== null) {
            let imagePath = match[1] ? match[1] : match[2];
            finalString = insertBeforeAll(imagePath, config.rootPath + "/static/git/p/" + id.toString() + "/", projectDesc)
            setProjectDesc(finalString)
        }
        return (
            <MarkdownRenderer markdown={projectDesc} style={{
                width: "70vw",
                maxWidth: "1300px",
                overflowWrap: "break-word",
                borderRadius: "10px",
                padding: "2em 3em"
            }}/>
        )
    }

    let imgSrc;

    if (project!== null) {
        switch (project["tier"]) {
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

    const handleError = (e) => {
        e.target.src = alternativeImage; // replace with your alternative image URL
        console.log("There was an error")
    };

    const overviewTab = () => {


        if (window.innerWidth > 1000) {
            if (projectTutorial !== null && project?.post_type === 0) {
                return (
                    <MarkdownRenderer
                        markdown={
                            projectTutorial.slice(0, 5)
                                .map(x => `\n### Part ${x.number}\n\n` + x.content)
                                .join("\n<br/><br/>") +
                            "\n\n### Start the project to finish the tutorial!"
                        }
                        style={{
                            width: "70vw",
                            maxWidth: "1300px",
                            overflowWrap: "break-word",
                            borderRadius: "10px",
                            padding: "2em 3em"
                        }}
                    />
                )
            } else {
                return (
                    <div></div>
                )
            }
        } else {
            if (projectTutorial !== null && project?.post_type === 0) {
                return (
                    <MarkdownRenderer
                        markdown={
                            projectTutorial.slice(0, 5)
                                .map(x => `\n### Part ${x.number}\n\n` + x.content)
                                .join("\n<br/><br/>") +
                            "\n\n### Start the project to finish the tutorial!"
                        }
                        style={{
                            width: "104vw",
                            maxWidth: "1300px",
                            overflowWrap: "break-word",
                            borderRadius: "10px",
                            padding: "2em 3em"
                        }}
                    />
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
    }

    const evaluationTab = () => {
        let regex = /(?:!\[[^\]]*\]\((?!http)(.*?)\))|(?:<img\s[^>]*?src\s*=\s*['\"](?!http)(.*?)['\"][^>]*?>)/g;
        let markdown = projectEval
        let match;
        let finalString;
        while ((match = regex.exec(markdown)) !== null) {
            let imagePath = match[1] ? match[1] : match[2];
            finalString = insertBeforeAll(imagePath, config.rootPath + "/static/git/p/" + id.toString() + "/", projectEval)
            setProjectEval(finalString)
        }
        return (
            <MarkdownRenderer markdown={projectEval} style={{
                width: "70vw",
                maxWidth: "1300px",
                overflowWrap: "break-word",
                borderRadius: "10px",
                padding: "2em 3em"
            }}/>
        )
    }

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const attemptTab = () => {
        return (
            <div style={{overflowY: "auto", width: "50vw"}}>
                <Typography variant={"h5"} style={{textAlign: "center", fontWeight: "bold", paddingBottom: "10px", paddingTop: "10px"}}>
                    check out the attempts made on this project!
                </Typography>
                {attempt.length > 0 ? (
                    attempt.map((attempts) => {
                        return (
                            <div style={{paddingBottom: "10px"}}>
                                <ButtonBase onClick={() => navigate("/attempt/" + attempts["_id"])}>
                                <AttemptsCard attemptUser={attempts["author"]} userThumb={config.rootPath + "/static/user/pfp/" + attempts["author_id"]}
                                              userId={attempts["author_id"]} attemptTime={attempts["created_at"]}
                                              attemptLines={attempts["attemptLines"]}
                                              attemptPercentage={attempts["attemptPercentage"]}
                                              success={attempts["success"]}
                                              userTier={attempts["tier"]}
                                              backgroundName={attempts["name"]}
                                              backgroundPalette={attempts["color_palette"]}
                                              backgroundRender={attempts["render_in_front"]}
                                              width={"50vw"}
                                              height={"auto"}
                                              description={attempts["description"]}
                                />
                                </ButtonBase>
                            </div>
                        );
                    })
                ) : (
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%"}}>
                        {/* Let's add a pretty message telling the user there are no attempts and encouraging them to make one */}
                        <Typography variant={"h5"} style={{textAlign: "center", fontWeight: "bold", paddingBottom: "10px"}}>
                            No Attempts Yet!
                        </Typography>
                        <Typography variant={"h6"} style={{textAlign: "center", fontWeight: "bold", paddingBottom: "10px"}}>
                            Be the first to attempt this challenge!
                        </Typography>
                    </div>
                )}
            </div>
        )
    }

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

    const analyticsTab = () => {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                overflowY: "auto",
                maxHeight: "70vh",
                width: "50vw",
                overflowX: "hidden"
            }}>
                <Chart
                    width={"500px"}
                    height={"300px"}
                    chartType="PieChart"
                    loader={<div>Loading Chart</div>}
                    data={[
                        ["Task", "Hours per Day"],
                        ["Work", 11],
                        ["Eat", 2],
                        ["Commute", 2],
                        ["Watch TV", 2],
                        ["Sleep", 7]
                    ]}
                    options={{
                        title: "My Daily Activities"
                    }}
                    rootProps={{"data-testid": "1"}}
                />
            </div>
        )
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

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setMinorTab(newValue);
    };

    const handleGenClose = () => {
        setGenOpened(false);
        // if (prompt !== createProjectForm.name) {
        //     setPrompt("");
        // }
    };

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
                            inputProps={{maxLength: 120, minLength: 3}}
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

    const handleRemoveImage = () => {
        setProjectImage(null);
        // if (prompt !== createProjectForm.name) {
        //     setPrompt("");
        // }
    };

    const handleGenClickOpen = () => {
        // setPrompt(createProjectForm.name)
        setGenOpened(true);
    };

    const loadFileToThumbnailImage = (file: File) => {
        // exit if file is null
        if (file === null) {
            return
        }

        // clone the file so we don't read the same one we're going to upload
        let clonedFile = new File([file], file.name, {type: file.type});

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

    const mainTabProject = () => {
        let minorValues = ["overview", "description", "attempts"]
        if (project && project?.post_type !== 0) {
            minorValues = ["overview", "description", "evaluation", "attempts"]
        }

        if (isEphemeral){
            minorValues = ["overview", "description"]
        }

        let currentUser = false
        if (project !== null && userId === project["author_id"]) {
            currentUser = true
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
                                            sx={minorValue === "overview" && stepIndex === 2 ? {color: "text.primary", borderRadius: 1, zIndex: "600000"} : {color: "text.primary", borderRadius: 1}}/>;
                            })}
                        </Tabs>
                    </div>
                ) : null}
                <div style={window.innerWidth > 1000 ? {display: "flex", justifyContent: "center", width: "90%"} : {display: "flex", justifyContent: "center", width: "100%", position: "relative", flexDirection: "column"}}>
                    {window.innerWidth <= 1000 ? (
                        <div>
                            <div style={{marginBottom: "50px"}}>
                                <PostOverviewMobile
                                    width={"100%"}
                                    height={"100%"}
                                    description={project !== null && minorTab === "overview" ? project["description"] : ""}
                                    exclusiveDescription={project!== null? project["exclusive_description"] : null}
                                    postDate={project !== null ? project["created_at"] : ""}
                                    userIsOP={currentUser}
                                    id={project !== null ? project["_id"] : 0}
                                    renown={project !== null ? project["tier"] : 0}
                                    project={true}
                                />
                            </div>
                            {project !== null ? (
                                <div style={{width: "100%", position: "relative", height: "300px", marginBottom: "50px"}}>
                                    <img
                                        src={config.rootPath + project["thumbnail"]}
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
                                <div style={{ width: "100%", position: "relative", height: "300px" }}>
                                    <img
                                        src={project !== null ? config.rootPath + project["thumbnail"] : alternativeImage}
                                        style={{
                                            width: '100%',
                                            height: '250%',
                                            objectFit: 'stretch'
                                        }}
                                        onError={handleError}
                                        alt={"project thumbnail"}
                                    />
                                    <Button
                                        onClick={() => setEditImage(true)}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0
                                        }}
                                    >
                                        <EditIcon/>
                                    </Button>
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
                                                    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                                                        {projectImage == null || projectImage == "" ? (
                                                            <h5 style={{color: "grey"}}>Upload Image</h5>
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
                                                        variant={`contained`}
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
                                                        onClick={() => editProject(null, null, null, projectImage)}
                                                    >
                                                        Submit
                                                    </Button>
                                                </Tooltip>
                                            </Grid>
                                        ) : null}
                                    </Box>
                                </Modal>
                                <PostOverview
                                    userId={project !== null ? project["author_id"] : ""}
                                    userName={project !== null ? project["author"] : ""}
                                    width={"100%"}
                                    height={"100%"}
                                    userThumb={project !== null ? config.rootPath + "/static/user/pfp/" + project["author_id"] : ""}
                                    backgroundName={project !== null ? project["name"] : null}
                                    backgroundPalette={project !== null ? project["color_palette"] : null}
                                    backgroundRender={project !== null ? project["render_in_front"] : null}
                                    userTier={project !== null ? project["tier"] : ""}
                                    description={project !== null && minorTab === "overview" ? project["description"] : ""}
                                    exclusiveDescription={project!== null? project["exclusive_description"] : null}
                                    postDate={project !== null ? project["created_at"] : ""}
                                    userIsOP={currentUser}
                                    id={project !== null ? project["_id"] : 0}
                                    renown={project !== null ? project["tier"] : 0}
                                    project={true}
                                    estimatedTime={project !== null ? project["estimated_tutorial_time_millis"] : null}
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
        if (minorTab === "description") {
            return descriptionTab()
        } else if (minorTab === "evaluation") {
            return evaluationTab()
        } else if (minorTab === "attempts") {
            return attemptTab()
        } else if (minorTab === "analytics") {
            return analyticsTab()
        } else if (minorTab === "overview") {
            return overviewTab()
        }
    }

    const mainTabSource = () => {
        return (
            <div style={{display: "flex", width: "80vw", height: "63vh"}}>
                {project !== null ? (
                    <CodeDisplayEditor repoId={project !== null ? project["repo_id"] : 0}
                                       references={"main"}
                                       filepath={""}
                                       height={"73vh"}
                                       style={{display: "contents", flexDirection: "row", width: "75vw"}}
                                       projectName={project !== null ? project["title"] : ""}
                    />
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
                "repo": project["repo_id"],  // available in attempt or project
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
                "project": project["_id"], // available in attempt or project
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
                "repo": project["repo_id"],  // available in attempt or project
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

    const handlePostDiscussion = async (id, title, body) => {
        if (title === "" || title === null || body === "" || body === null) {
            return
        }

        let res = await call(
            "/api/discussion/createDiscussion",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {post_id: id, title: title, body: body, tags: []},
            null,
            config.rootPath
        )

        const [disc] = await Promise.all([
            res,
        ])

        if (disc === undefined || disc["message"] === undefined || disc["discussion"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }

        if (res["message"] === "You must be logged in to access the GIGO system."){
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }

        if (res === undefined) {
            swal("There has been an issue loading data. Please try again later.")
        }

        if (disc["message"] === "Discussion has been posted" && disc["discussion"] !== null) {
            // Add the new discussion to the array
            const updatedDiscussions = [...filteredDiscussions, disc["discussion"]];

            setFilteredDiscussions(updatedDiscussions);
        }

        setCommentBody("")
        setDiscTitle("")
        handleDiscussionClose()

        return
    }


    const handlePostComment = async (discussion, body) => {
        if (discussion === null || body === "") {
            return
        }

        let res = await call(
            "/api/discussion/createComment",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {discussion_id: selectedDiscussion["_id"], body},
            null,
            config.rootPath
        )

        const [com] = await Promise.all([
            res,
        ])

        if (com === undefined || com["message"] === undefined || com["comment"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }

        if (com["message"] !== "Comment has been posted" || com["comment"] === null) {
            if (sessionStorage.getItem("alive") === null) {
                //@ts-ignore
                swal(
                    "Server Error",
                    (com["message"] !== "internal server error occurred") ?
                        com["message"] :
                        "An unexpected error has occurred. We're sorry, we'll get right on that!"
                );
            }
            swal(
                "Server Error",
                "We were unable to post your comment, please try again later!"
            );
            return;
        }

        discussionReplies.push(res["comment"])
        setCommentBody("")
        await getDiscussions()

        return
    }

    const handlePostThread = async (body) => {
        if ( body === "" || body === null ) {
            return
        }

        let res = await call(
            "/api/discussion/createThreadComment",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {comment_id: selectedComment["_id"], body},
            null,
            config.rootPath
        )

        const [thr] = await Promise.all([
            res,
        ])

        if (thr === undefined || thr["message"] === undefined || thr["thread_comment"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }

        if (thr["message"] !== "Comment has been posted" || thr["thread_comment"] === null) {
            if (sessionStorage.getItem("alive") === null) {
                //@ts-ignore
                swal(
                    "Server Error",
                    (com["message"] !== "internal server error occurred") ?
                        com["message"] :
                        "An unexpected error has occurred. We're sorry, we'll get right on that!"
                );
            }
            swal(
                "Server Error",
                "We were unable to post your comment, please try again later!"
            );
            return;
        }

        threadArray.push(thr["thread_comment"])
        setCommentBody("")
        await getDiscussions()

        return
    }

    const handleThreadReply = async (body) => {
        if ( body === "" || body === null ) {
            return
        }

        let res = await call(
            "/api/discussion/createThreadReply",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {thread_id: selectedThread["_id"], body},
            null,
            config.rootPath
        )

        const [reply] = await Promise.all([
            res,
        ])

        if (reply === undefined || reply["message"] === undefined || reply["thread_reply"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }

        if (reply["message"] !== "Reply has been posted" || reply["thread_reply"] === null) {
            if (sessionStorage.getItem("alive") === null) {
                //@ts-ignore
                swal(
                    "Server Error",
                    (com["message"] !== "internal server error occurred") ?
                        com["message"] :
                        "An unexpected error has occurred. We're sorry, we'll get right on that!"
                );
            }
            swal(
                "Server Error",
                "We were unable to post your comment, please try again later!"
            );
            return;
        }

        replyArray.push(reply["thread_reply"])
        setCommentBody("")
        await getDiscussions()

        return
    }

    const handleDiscussionSearch =  async (e : any) => {
        if (typeof e.target.value !== "string") {
            return
        }

        let res = await call(
            "/api/search/discussions",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                query: e.target.value,
                skip: 0,
                limit: 5,
                post_id: id,
            }
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["discussions"] === undefined) {
            if (res["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            if (res["message"] === "incorrect type passed for field query") {
                return
            }
            swal("Server Error", res["message"])
            return
        }

        setFilteredDiscussions(res["discussions"])
    }

    const handleCommentSearch =  async (e : any) => {
        if (typeof e.target.value !== "string") {
            return
        }

        let res = await call(
            "/api/search/comment",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                query: e.target.value,
                skip: 0,
                limit: 5,
                discussion_id: selectedDiscussion["_id"],
            }
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["comment"] === undefined) {
            if (res["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            if (res["message"] === "incorrect type passed for field query") {
                return
            }
            swal("Server Error", res["message"])
            return
        }

        setDiscussionReplies(res["comment"])
    }

    const goBack = () => {
        getDiscussions()
        if (discussionTab === "comment") {
            setSelectedDiscussion(EmptyDiscussion)
            setDiscussionReplies([])
            setDiscussionTab("main")
        } else if (discussionTab === "thread") {
            setSelectedThread("")
            setThreadArray([])
            setDiscussionTab("comment")
        } else {
            setDiscussionTab("thread")
            setReplyArray([])
        }
    }

    const FilterDiscussions = () => {
        const filteredDiscussion = discussions.reduce((acc, item) => {
            if (Boolean(item.title) &&
                item.title.toLowerCase().includes(searchText.toLowerCase())) {
                return [item, ...acc]
            }
            return (
                [...acc, item]
            );
        }, []);
        setFilteredDiscussions(filteredDiscussion)
    }


    const handleSearchText = (text: string) => {
        setSearchText(text)
    }

    const getDiscussionComments = async (discussion: object) => {
        setSelectedDiscussion(discussion)
        setLoading(true)

        for (let i = 0; i < comments.length; i++) {
            if (comments[i]["discussion_id"] === discussion["_id"]) {
                discussionReplies.push(comments[i])
            }
        }

        setDiscussionTab("comment")

        setLoading(false)
    }

    const getCommentThreads = async (comment: object) => {
        setDiscussionTab("thread")
        setSelectedComment(comment)
        setLoading(true)

        for (let i = 0; i < threadComments.length; i++) {
            if (threadComments[i]["comment_id"] === comment["_id"]) {
                threadArray.push(threadComments[i])
            }
        }

        setLoading(false)
    }

        const getThreadReplies = async (thread: object) => {
            setDiscussionTab("reply")
            setSelectedThread(thread)
            setLoading(true)

            for (let i = 0; i < threadReplies.length; i++) {
                if (threadReplies[i]["thread_comment_id"] === thread["_id"]) {
                    replyArray.push(threadReplies[i])
                }
            }

            setLoading(false)
        }

        const handleSubmit = (event) => {
            event.target.reset();
        };

    const [editDiscussion, setEditDiscussion] = React.useState(false)
    const [newTitle, setNewTitle] = React.useState("")
    const [newBody, setNewBody] = React.useState("")
    const [newDiscussion, setNewDiscussion] = React.useState("")

    const editDiscussions = async (id, discussionType: string) => {
        if (newBody !== "" && newTitle!== "") {
            let res = await call(
                "/api/discussion/editDiscussions",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {_id: id, discussion_type: discussionType, title: newTitle, body: newBody, tags: []},
                null,
                config.rootPath
            )

            const [edit ] = await Promise.all([
                res,
            ])

            if (edit["message"] === "You must be logged in to access the GIGO system."){
                let authState = Object.assign({}, initialAuthStateUpdate)
                // @ts-ignore
                dispatch(updateAuthState(authState))
                navigate("/login")
            }

            if (edit === undefined || edit["message"] === undefined || edit["new_discussion"] === undefined) {
                swal("\"There has been an issue editing your discussion. Please try again later.\"")
            }

            if (edit["message"] !== "Discussion has been successfully edited" || edit["new_discussion"] === null) {
                swal("\"There has been an issue editing your discussion. Please try again later.\"")
            }

            if (edit["message"] === "Discussion has been successfully edited" && edit["new_discussion"] !== null) {
                const editedDiscussion = edit["new_discussion"];

                switch (discussionType) {
                    case "discussion":
                        const discussionIndex = filteredDiscussions.findIndex(discussion => discussion._id === id);
                        if (discussionIndex !== -1) {
                            const updatedDiscussions = [
                                ...filteredDiscussions.slice(0, discussionIndex),
                                editedDiscussion,
                                ...filteredDiscussions.slice(discussionIndex + 1)
                            ];
                            setFilteredDiscussions(updatedDiscussions);
                        }
                        break;
                    case "comment":
                        const commentIndex = discussionReplies.findIndex(reply => reply._id === id);
                        if (commentIndex !== -1) {
                            const updatedDiscussionReplies = [
                                ...discussionReplies.slice(0, commentIndex),
                                editedDiscussion,
                                ...discussionReplies.slice(commentIndex + 1)
                            ];
                            setDiscussionReplies(updatedDiscussionReplies);
                        }
                        break;
                    case "thread_comment":
                        const threadCommentIndex = threadArray.findIndex(thread => thread._id === id);
                        if (threadCommentIndex !== -1) {
                            const updatedThreadArray = [
                                ...threadArray.slice(0, threadCommentIndex),
                                editedDiscussion,
                                ...threadArray.slice(threadCommentIndex + 1)
                            ];
                            setThreadArray(updatedThreadArray);
                        }
                        break;
                    case "thread_reply":
                        const threadReplyIndex = replyArray.findIndex(reply => reply._id === id);
                        if (threadReplyIndex !== -1) {
                            const updatedReplyArray = [
                                ...replyArray.slice(0, threadReplyIndex),
                                editedDiscussion,
                                ...replyArray.slice(threadReplyIndex + 1)
                            ];
                            setReplyArray(updatedReplyArray);
                        }
                        break;
                    default:
                        console.log(`Unknown discussionType: ${discussionType}`);
                }
            }
            
            setEditDiscussion(false)
            setNewTitle("")
            setNewBody("")

        }
    }

    const addCoffee = async (discId, discussionType: string) => {
        let add = await call(
            "/api/discussion/addCoffee",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {_id: discId, discussion_type: discussionType},
            null,
            config.rootPath
        )

        const [res ] = await Promise.all([
            add,
        ])

        if (res === undefined || res["message"] === undefined) {
            swal("\"There has been an issue. Please try again later.\"")
        }

        if (res["message"] !== "Coffee added to discussion") {
            swal("\"There has been an issue. Please try again later.\"")
        }

        if (discussionType === "discussion") {
            let newDiscussionUpVotes = discussionUpVotes.slice();
            newDiscussionUpVotes.push(discId)
            setDiscussionUpVotes(newDiscussionUpVotes)
        } else if (discussionType === "comment") {
            let newCommentUpVotes = commentUpVotes.slice();
            newCommentUpVotes.push(discId)
            setCommentUpVotes(newCommentUpVotes)
        } else if (discussionType === "thread_comment") {
            let newThreadUpVotes = threadUpVotes.slice();
            newThreadUpVotes.push(discId)
            setThreadUpVotes(newThreadUpVotes)
        } else if (discussionType === "thread_reply") {
            let newReplyUpVotes = replyUpVotes.slice();
            newReplyUpVotes.push(discId)
            setReplyUpVotes(newReplyUpVotes)
        }
    }

    const removeCoffee = async (discId, discussionType: string) => {
        let remove = await call(
            "/api/discussion/removeCoffee",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {_id: discId, discussion_type: discussionType},
            null,
            config.rootPath
        )

        const [res ] = await Promise.all([
            remove,
        ])

        if (res === undefined || res["message"] === undefined) {
            swal("\"There has been an issue. Please try again later.\"")
        }

        if (res["message"] !== "Coffee removed from discussion") {
            swal("\"There has been an issue. Please try again later.\"")
        }


        let index = -1

        if (discussionType === "discussion") {
            let fullUpvote = discussionUpVotes.slice();
            let newFinalUpvote = fullUpvote.filter(data => data !== discId)
            setDiscussionUpVotes(newFinalUpvote)
        } else if (discussionType === "comment") {
            let fullUpvote = commentUpVotes.slice();
            let newFinalUpvote = fullUpvote.filter(data => data!== discId)
            setCommentUpVotes(newFinalUpvote)
        } else if (discussionType === "thread_comment") {
            let fullUpvote = threadUpVotes
            let index = fullUpvote.indexOf(discId)
            if (index > -1){
                let finalThreadUpvote = fullUpvote.splice(index, 1)
                setCommentUpVotes(finalThreadUpvote)
            }
        } else if (discussionType === "thread_reply") {
            let fullUpvote = replyUpVotes
            let index = fullUpvote.indexOf(discId)
            if (index > -1){
                let finalReplyUpvote = fullUpvote.splice(index, 1)
                setCommentUpVotes(finalReplyUpvote)
            }
        }
    }

    const handleCoffeeClick = async (coffee: string, isAdd: boolean, discussionType: string, obj: object) => {
        if (discussionType === "discussion") {
            let x = -1

            let testingDiscussion = discussions


            let index = testingDiscussion.map(x => x["_id"]).indexOf(obj["_id"])

            if (isAdd) {
                if (discussionUpVotes.includes(obj["_id"])){
                    x = Number(obj["coffee"]) - 1
                    testingDiscussion[index]["coffee"] = x.toString()
                    setDiscussions(testingDiscussion)
                    FilterDiscussions()
                    removeCoffee(obj["_id"], "discussion")
                    return
                }
                x = Number(obj["coffee"]) + 1
                testingDiscussion[index]["coffee"] = x.toString()
                setDiscussions(testingDiscussion)
                FilterDiscussions()
                addCoffee(obj["_id"], "discussion")
                return
            } else {
                if (Number(obj["coffee"]) <= 0){
                    x = Number(obj["coffee"]) + 1
                    testingDiscussion[index]["coffee"] = x.toString()
                    setDiscussions(testingDiscussion)
                    FilterDiscussions()
                    addCoffee(obj["_id"], "discussion")
                    return
                }
                x = Number(obj["coffee"]) - 1
                testingDiscussion[index]["coffee"] = x.toString()
                setDiscussions(testingDiscussion)
                FilterDiscussions()
                removeCoffee(obj["_id"], "discussion")
                return
            }

        } else if (discussionType === "comment") {
            let x = -1

            let testingDiscussion = discussionReplies

            let index = discussionReplies.map(x => x["_id"]).indexOf(obj["_id"])

            if (isAdd) {
                if (commentUpVotes.includes(obj["_id"])){
                    x = Number(obj["coffee"]) - 1
                    testingDiscussion[index]["coffee"] = x.toString()
                    setDiscussionReplies(testingDiscussion)
                    removeCoffee(obj["_id"], "comment")
                    return
                }
                x = Number(obj["coffee"]) + 1
                testingDiscussion[index]["coffee"] = x.toString()
                setDiscussionReplies(testingDiscussion)
                addCoffee(obj["_id"], "comment")
                return
            } else {
                if (Number(obj["coffee"]) <= 0){
                    x = Number(obj["coffee"]) + 1
                    testingDiscussion[index]["coffee"] = x.toString()
                    setDiscussionReplies(testingDiscussion)
                    addCoffee(obj["_id"], "comment")
                    return
                }
                x = Number(obj["coffee"]) - 1
                testingDiscussion[index]["coffee"] = x.toString()
                setDiscussionReplies(testingDiscussion)
                removeCoffee(obj["_id"], "comment")
                return
            }
        } else if (discussionType === "thread_comment") {
            let x = -1

            let index = threadArray.map(x => x["_id"]).indexOf(obj["_id"])


            let testingDiscussion = threadArray

            if (isAdd) {
                if (threadUpVotes.includes(obj["_id"])){
                    x = Number(obj["coffee"]) - 1
                    testingDiscussion[index]["coffee"] = x.toString()
                    setThreadArray(testingDiscussion)
                    removeCoffee(obj["_id"], "thread_comment")
                    return
                }
                x = Number(obj["coffee"]) + 1
                testingDiscussion[index]["coffee"] = x.toString()
                setThreadArray(testingDiscussion)
                addCoffee(obj["_id"], "thread_comment")
                return
            } else {
                if (Number(obj["coffee"]) <= 0){
                    x = Number(obj["coffee"]) + 1
                    testingDiscussion[index]["coffee"] = x.toString()
                    setThreadArray(testingDiscussion)
                    addCoffee(obj["_id"], "thread_comment")
                    return
                }
                x = Number(obj["coffee"]) - 1
                testingDiscussion[index]["coffee"] = x.toString()
                setThreadArray(testingDiscussion)
                removeCoffee(obj["_id"], "thread_comment")
                return
            }

        } else if (discussionType === "thread_reply") {
            let x = -1

            let index = replyArray.map(x => x["_id"]).indexOf(obj["_id"])

            let testingDiscussion = replyArray

            if (isAdd) {
                if (replyUpVotes.includes(obj["_id"])){
                    x = Number(obj["coffee"]) - 1
                    testingDiscussion[index]["coffee"] = x.toString()
                    setReplyArray(testingDiscussion)
                    removeCoffee(obj["_id"], "thread_reply")
                    return
                }
                x = Number(obj["coffee"]) + 1
                testingDiscussion[index]["coffee"] = x.toString()
                setReplyArray(testingDiscussion)
                addCoffee(obj["_id"], "thread_reply")
                return
            } else {
                if (Number(obj["coffee"]) <= 0){
                    x = Number(obj["coffee"]) + 1
                    testingDiscussion[index]["coffee"] = x.toString()
                    setReplyArray(testingDiscussion)
                    addCoffee(obj["_id"], "thread_reply")
                    return
                }
                x = Number(obj["coffee"]) - 1
                testingDiscussion[index]["coffee"] = x.toString()
                setReplyArray(testingDiscussion)
                removeCoffee(obj["_id"], "thread_reply")
                return
            }
        }
    }


    const handleDiscussionOpen = () => {
        setCreateDiscussion(true);
    }

    const handleDiscussionClose = () => {
        setCreateDiscussion(false);
    }

    let renderDiscussionPopup = () => {
        return (
            <Dialog open={createDiscussion} onClose={handleDiscussionClose} maxWidth="xl">
                <DialogTitle>Create A New Discussion Post</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Discussion Title"
                        type="text"
                        fullWidth
                        onChange={e => setDiscTitle(e.target.value)}
                        value={discTitle}
                        required
                        inputProps={{ maxLength: 86 }}
                        helperText={discTitle.length === 86 ? 'Maximum character limit reached.' : ''}
                        error={discTitle.length === 86}
                    />
                    <TextField
                        margin="dense"
                        label="Comment"
                        type="text"
                        fullWidth
                        multiline
                        rows={6}
                        onChange={e => setCommentBody(e.target.value)}
                        value={commentBody}
                        required
                        inputProps={{ maxLength: 2000 }}
                        helperText={commentBody.length === 2000 ? 'Maximum character limit reached.' : ''}
                        error={commentBody.length === 2000}
                    />
                </DialogContent>
                <DialogActions sx={{marginTop: "-20px"}}>
                    <Button onClick={handleDiscussionClose}>
                        Cancel
                    </Button>
                    <Button onClick={() => handlePostDiscussion(id, discTitle, commentBody)} disabled={!discTitle || !commentBody}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    let renderEditDiscussionPopup = () => {
        if (!selectedDiscussion) return null;
        return (
            <Dialog open={editDiscussionPopup} onClose={() => setEditDiscussionPopup(false)} maxWidth="xl">
                <DialogTitle>Edit Discussion Post</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        type="text"
                        fullWidth
                        onChange={e => setNewTitle(e.target.value)}
                        value={newTitle}
                        required
                        inputProps={{ maxLength: 86 }}
                        helperText={discTitle.length === 86 ? 'Maximum character limit reached.' : ''}
                        error={discTitle.length === 86}
                    />
                    <TextField
                        margin="dense"
                        label="Comment"
                        type="text"
                        fullWidth
                        multiline
                        rows={6}
                        onChange={e => setNewBody(e.target.value)}
                        value={newBody}
                        required
                        inputProps={{ maxLength: 2000 }}
                        helperText={commentBody.length === 2000 ? 'Maximum character limit reached.' : ''}
                        error={commentBody.length === 2000}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDiscussionPopup(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        editDiscussions(selectedDiscussion["_id"], "discussion");
                        setEditDiscussionPopup(false);
                    }}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    let renderEditCommentPopup = (type: number) => {
        if ((!selectedComment && !selectedThread && !selectedReply) || editCommentType === 0) return null;
        return (
            <Dialog open={editCommentPopup} onClose={() => setEditCommentPopup(false)} maxWidth="xl">
                <DialogTitle>Edit Comment</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Comment"
                        type="text"
                        fullWidth
                        multiline
                        rows={6}
                        onChange={e => setNewBody(e.target.value)}
                        value={newBody}
                        required
                        inputProps={{ maxLength: 2000 }}
                        helperText={commentBody.length === 2000 ? 'Maximum character limit reached.' : ''}
                        error={commentBody.length === 2000}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditCommentPopup(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        if (type === 1) {
                            editDiscussions(selectedComment["_id"], "comment");
                        } else if (type === 2) {
                            editDiscussions(selectedThread["_id"], "thread_comment");
                        } else if (type === 3) {
                            editDiscussions(selectedReply["_id"], "thread_reply");
                        }
                        setEditCommentPopup(false);
                    }}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }


    const mainTabDiscussions = () => {
        if (discussionTab === "main") {
            return (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <Paper style={window.innerWidth > 1000 ? {
                        padding: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        width: "30vw",
                        boxShadow: "none",
                        transition: 'background-color 0.3s ease',
                        '&:hover': {
                            backgroundColor: '#F5F5F5',
                        },
                    } : {
                        padding: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        width: "68vw",
                        boxShadow: "none",
                        transition: 'background-color 0.3s ease',
                        '&:hover': {
                        backgroundColor: '#F5F5F5',
                    },
                    }}>
                        <SearchIcon style={{ marginRight: "5px", marginLeft: "6px" }}/>
                        <InputBase
                            id="discussionInput"
                            style={{
                                marginLeft: '8px', // approximate equivalent of theme.spacing(1),
                                flex: 1
                            }}
                            placeholder="Discussions"
                            onChange={(e) => {
                                const value = e.target.value;
                                value === "" ? getDiscussions() : handleDiscussionSearch(e);
                            }}
                        />
                    </Paper>
                    <div style={{
                        display: "flex",
                        justifyContent: "start",
                        flexDirection: "column",
                        overflowY: "auto",
                        overflowX: "hidden",
                        height: "58vh",
                        paddingTop: "2%"
                    }}>
                        {filteredDiscussions.map((discussion) => (
                            <div
                                key={discussion["_id"]}
                                style={{
                                display: "flex",
                                paddingBottom: "10px",
                                width: "80vw",
                                alignContent: "center",
                                alignItems: "center",
                                position: "relative"
                            }}>
                                <ButtonBase onClick={() => getDiscussionComments(discussion)}>
                                    <DiscussionCard
                                        userName={discussion["author"]}
                                        userThumb={config.rootPath + "/static/user/pfp/" + discussion["author_id"]}
                                        userId={discussion["author_id"]}
                                        userTier={discussion["author_tier"]}
                                        discussionTitle={discussion["title"]}
                                        discussionSummary={discussion["body"]}
                                        tags={discussion["tags"]}
                                        discussionId={discussion["_id"]}
                                        width={window.innerWidth > 1000 ? 77 * window.innerWidth / 100 : 70 * window.innerWidth / 100}
                                        height={150}
                                        backgroundName={discussion["name"]}
                                        backgroundPalette={discussion["color_palette"]}
                                        backgroundRender={discussion["render_in_front"]}
                                        role={discussion["user_status"]}
                                    />
                                </ButtonBase>
                                {discussion["author_id"] === callingId ? (
                                    <Button
                                        variant={`text`} color={"primary"} size={`small`}
                                        sx={window.innerWidth > 1000 ? { height: "2.5vh", minHeight: "4px", right: 3.5 * window.innerWidth / 100, bottom: "35%" } : { height: "2.5vh", minHeight: "4px", right: 20 * window.innerWidth / 100, bottom: "45%" }}
                                        onClick={() => {
                                            setSelectedDiscussion(discussion);
                                            setNewTitle(discussion["title"]);
                                            setNewBody(discussion["body"]);
                                            setEditDiscussionPopup(true);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                ) : null}
                                {discussionUpVotes.includes(discussion["_id"]) ? (
                                    <IconButton onClick={() => handleCoffeeClick(discussion["coffee"], false, "discussion", discussion)}
                                                sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                        <Badge color="primary" badgeContent={discussion["coffee"]}
                                               sx={{height: "2.5vh", minHeight: "4px"}}
                                               anchorOrigin={{
                                                   vertical: 'top',
                                                   horizontal: 'left',
                                               }}>
                                            <LocalCafeIcon />
                                        </Badge>
                                    </IconButton>
                                ) : (
                                    <IconButton onClick={() => handleCoffeeClick(discussion["coffee"], true, "discussion", discussion)}
                                                sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                        <Badge color="primary" badgeContent={discussion["coffee"]}
                                               sx={{height: "2.5vh", minHeight: "4px"}}
                                               anchorOrigin={{
                                                   vertical: 'top',
                                                   horizontal: 'left',
                                               }}>
                                            <LocalCafeOutlinedIcon />
                                        </Badge>
                                    </IconButton>
                                )}
                            </div>
                        ))}
                    </div>
                    {createDiscussion ? renderDiscussionPopup() : null}
                    {selectedDiscussion && editDiscussionPopup ? renderEditDiscussionPopup() : null}
                    {!createDiscussion && !editDiscussionPopup &&
                    <div
                        style={window.innerWidth > 1000 ?{
                            width: "80vw",
                            minWidth: "175px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingTop: "1%"
                        } : {
                            width: "80vw",
                            minWidth: "175px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingTop: "1%",
                        }}
                    >
                        <Button
                            variant={"contained"} color={"primary"}
                            sx={{ height: "4vh", minHeight: "35px", right: "4%",                             zIndex: "600000" }}
                            onClick={() => handleDiscussionOpen()} className={'discussion'}
                        >
                            Start a Discussion
                        </Button>
                    </div>
                    }
                </div>
            )} else if (discussionTab === "comment") {
            return (
                <div style={{display: "flex", flexDirection: "column"}}>
                    <Grid item xs={"auto"}>
                        <Paper style={window.innerWidth > 1000 ? {
                            padding: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            width: "30vw"
                        } : {
                            padding: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            width: "68vw"
                        }}>
                            <SearchIcon style={{ marginRight: "5px", marginLeft: "6px" }}/>
                            <InputBase
                                id="commentInput"
                                style={{
                                    marginLeft: '8px',
                                    flex: 1
                                }}
                                placeholder="Comments"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    value === "" ? getComments() : handleCommentSearch(e);
                                }}
                            />
                        </Paper>
                    </Grid>
                    <div>
                        <Button onClick={() => goBack()}>
                            Go Back
                        </Button>
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "start",
                        flexDirection: "column",
                        overflowY: "auto",
                        overflowX: "hidden",
                        height: "58vh",
                        paddingTop: ".5%",
                    }}>
                        <div style={{
                            display: "flex",
                            paddingBottom: "10px",
                            width: "80vw",
                            alignContent: "center",
                            position:`relative`}}>
                            <DiscussionCard userName={selectedDiscussion["author"]}
                                           userThumb={config.rootPath + "/static/user/pfp/" + selectedDiscussion["author_id"]}
                                           userId={selectedDiscussion["author_id"]}
                                           userTier={selectedDiscussion["author_tier"]}
                                           discussionTitle={selectedDiscussion["title"]}
                                           discussionSummary={selectedDiscussion["body"]}
                                           tags={selectedDiscussion["tags"]}
                                           discussionId={selectedDiscussion["_id"]}
                                            width={window.innerWidth > 1000 ? 77 * window.innerWidth / 100 : 70 * window.innerWidth / 100}
                                           height={150} backgroundName={selectedDiscussion["name"]}
                                            backgroundPalette={selectedDiscussion["color_palette"]}
                                            backgroundRender={selectedDiscussion["render_in_front"]} role={selectedDiscussion["user_status"]}/>
                            {discussionUpVotes.includes(selectedDiscussion["_id"]) ? (
                                <IconButton onClick={() => handleCoffeeClick(selectedDiscussion["coffee"], false, "discussion", selectedDiscussion)}
                                sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                    <Badge color="primary" badgeContent={selectedDiscussion["coffee"]}
                                           sx={{height: "2.5vh", minHeight: "4px"}}
                                           anchorOrigin={{
                                               vertical: 'top',
                                               horizontal: 'left',
                                           }}>
                                        <LocalCafeIcon />
                                    </Badge>
                                </IconButton>
                            ) : (
                                <IconButton onClick={() => handleCoffeeClick(selectedDiscussion["coffee"], true, "discussion", selectedDiscussion)}
                                            sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                    <Badge color="primary" badgeContent={selectedDiscussion["coffee"]}
                                           sx={{height: "2.5vh", minHeight: "4px"}}
                                           anchorOrigin={{
                                               vertical: 'top',
                                               horizontal: 'left',
                                           }}>
                                        <LocalCafeOutlinedIcon />
                                    </Badge>
                                </IconButton>
                            )}
                        </div>
                        {discussionReplies.map((comment) => {
                            return (
                                <div style={{
                                    display: "flex",
                                    paddingBottom: "10px",
                                    width: "80vw",
                                    alignContent: "center",
                                    position: "relative"
                                }}>
                                    <ButtonBase onClick={() => getCommentThreads(comment)}>
                                        <CommentCard userName={comment["author"]}
                                                     userThumb={config.rootPath + "/static/user/pfp/" + comment["author_id"]}
                                                     userId={comment["author_id"]}
                                                     userTier={comment["author_tier"]}
                                                     commentBody={comment["body"]}
                                                     commentId={comment["_id"]}
                                                     width={window.innerWidth > 1000 ? 77 * window.innerWidth / 100 : 70 * window.innerWidth / 100}
                                                     height={150} backgroundName={comment["name"]}
                                                     backgroundPalette={comment["color_palette"]}
                                                     backgroundRender={comment["render_in_front"]} role={comment["user_status"]}/>
                                    </ButtonBase>
                                    {comment["author_id"] === callingId ? (
                                        <Button
                                            variant={`text`} color={"primary"} size={`small`}
                                            sx={window.innerWidth > 1000 ? { position: 'absolute', right: "4%" } : {position: "absolute", top: "15%"}}
                                            onClick={() => {
                                                setSelectedComment(comment);
                                                setNewBody(comment["body"]);
                                                setEditCommentType(1)
                                                setEditCommentPopup(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    ) : null}
                                    {commentUpVotes.includes(comment["_id"]) ? (
                                        <IconButton
                                            onClick={() => handleCoffeeClick(comment["coffee"], false, "comment", comment)}
                                            sx={{position: "absolute", bottom: "5%", left: "1%"}}
                                        >
                                            <Badge color="primary" badgeContent={comment["coffee"]}
                                                   sx={{height: "2.5vh", minHeight: "4px"}}
                                                   anchorOrigin={{
                                                       vertical: 'top',
                                                       horizontal: 'left',
                                                   }}>
                                                <LocalCafeIcon />
                                            </Badge>
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            onClick={() => handleCoffeeClick(comment["coffee"], true, "comment", comment)}
                                            sx={{position: "absolute", bottom: "5%", left: "1%"}}
                                        >
                                            <Badge color="primary" badgeContent={comment["coffee"]}
                                                   sx={{height: "2.5vh", minHeight: "4px"}}
                                                   anchorOrigin={{
                                                       vertical: 'top',
                                                       horizontal: 'left',
                                                   }}>
                                                <LocalCafeOutlinedIcon />
                                            </Badge>
                                        </IconButton>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div style={{width: "76vw"}}>
                        <form noValidate autoComplete="off" style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "95%",
                            paddingBottom: "2%"
                        }} onSubmit={e => e.preventDefault()}>
                            <TextField id={"outlined-basic"} label={"Comment"} variant={"outlined"} multiline={true}
                                       style={{width: "100%",}} onChange={e => setCommentBody(e.target.value)}
                                       value={commentBody}/>
                            <div style={{paddingTop: "1.5%"}}>
                                <Button variant="contained" size={"large"} color="primary"
                                        onClick={() => handlePostComment(selectedDiscussion, commentBody)}  className={"commentInformation"} style={{                            zIndex: "600000"}}>
                                    <SendIcon/>
                                </Button>
                            </div>
                        </form>
                    </div>
                    {renderEditCommentPopup(1)}
                </div>
            )
        } else if (discussionTab === "thread") {
            return (
                <div style={{display: "flex", flexDirection: "column"}}>
                    <div style={window.innerWidth > 1000 ? {display: "flex", width: "80vw", justifyContent: "left", paddingBottom: "15px"} : {display: "flex", width: "68vw", justifyContent: "left", paddingBottom: "15px"}}>
                        <SearchBar handleSearchText={handleSearchText}/>
                    </div>
                    <div>
                        <Button onClick={() => goBack()}>
                            Go Back
                        </Button>
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "start",
                        flexDirection: "column",
                        overflowY: "auto",
                        overflowX: "hidden",
                        height: "58vh",
                        paddingTop: ".5%",
                    }}>
                        <div style={{
                            marginBottom: ".8%",
                            display: "flex",
                            paddingBottom: "5px",
                            width: "80vw",
                            alignContent: "center",
                            position: `relative`}}>
                            <CommentCard userName={selectedComment["author"]}
                                         userThumb={config.rootPath + "/static/user/pfp/" + selectedComment["author_id"]}
                                         userId={selectedComment["author_id"]}
                                         userTier={selectedComment["author_tier"]}
                                         commentBody={selectedComment["body"]}
                                         commentId={selectedComment["_id"]}
                                         width={window.innerWidth > 1000 ? 77 * window.innerWidth / 100 : 70 * window.innerWidth / 100}
                                         height={150} backgroundName={selectedComment["name"]}
                                         backgroundPalette={selectedComment["color_palette"]}
                                         backgroundRender={selectedComment["render_in_front"]} role={selectedComment["user_status"]}/>
                            {commentUpVotes.includes(selectedComment["_id"]) ? (
                                <IconButton onClick={() => handleCoffeeClick(selectedComment["coffee"], false, "comment", selectedComment)}
                                            sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                    <Badge color="primary" badgeContent={selectedComment["coffee"]}
                                           sx={{height: "2.5vh", minHeight: "4px"}}
                                           anchorOrigin={{
                                               vertical: 'top',
                                               horizontal: 'left',
                                           }}>
                                        <LocalCafeIcon />
                                    </Badge>
                                </IconButton>
                            ) : (
                                <IconButton onClick={() => handleCoffeeClick(selectedComment["coffee"], true, "comment", selectedComment)}
                                            sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                    <Badge color="primary" badgeContent={selectedComment["coffee"]}
                                           sx={{height: "2.5vh", minHeight: "4px"}}
                                           anchorOrigin={{
                                               vertical: 'top',
                                               horizontal: 'left',
                                           }}>
                                        <LocalCafeOutlinedIcon />
                                    </Badge>
                                </IconButton>
                            )}
                        </div>
                        {threadArray.map((thread) => {
                            return (
                                <div style={{
                                    display: "flex",
                                    paddingBottom: "10px",
                                    width: "80vw",
                                    alignContent: "center",
                                    position: "relative"
                                }}>
                                    <ButtonBase onClick={() => getThreadReplies(thread)}>
                                        <ThreadCard userName={thread["author"]}
                                                    userThumb={config.rootPath + "/static/user/pfp/" + thread["author_id"]}
                                                    userId={thread["author_id"]}
                                                    userTier={thread["author_tier"]}
                                                    threadBody={thread["body"]}
                                                    threadId={thread["_id"]}
                                                    width={window.innerWidth > 1000 ? 77 * window.innerWidth / 100 : 70 * window.innerWidth / 100}
                                                    height={150} backgroundName={thread["name"]}
                                                    backgroundPalette={thread["color_palette"]}
                                                    backgroundRender={thread["render_in_front"]} role={thread["user_status"]}/>
                                    </ButtonBase>
                                    {thread["author_id"] === callingId ? (
                                        <Button
                                            variant={`text`} color={"primary"} size={`small`}
                                            sx={window.innerWidth > 1000 ? { position: 'absolute', right: "4%" } : {position: "absolute", top: "15%"}}
                                            onClick={() => {
                                                setSelectedThread(thread);
                                                setNewBody(thread["body"]);
                                                setEditCommentType(2)
                                                setEditCommentPopup(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    ) : null}
                                    {threadUpVotes.includes(thread["_id"]) ? (
                                        <IconButton onClick={() => handleCoffeeClick(thread["coffee"], false, "thread_comment", thread)}
                                                    sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                            <Badge color="primary" badgeContent={thread["coffee"]}
                                                   sx={{height: "2.5vh", minHeight: "4px"}}
                                                   anchorOrigin={{
                                                       vertical: 'top',
                                                       horizontal: 'left',
                                                   }}>
                                                <LocalCafeIcon />
                                            </Badge>
                                        </IconButton>
                                    ) : (
                                        <IconButton onClick={() => handleCoffeeClick(thread["coffee"], true, "thread_comment", thread)}
                                                    sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                            <Badge color="primary" badgeContent={thread["coffee"]}
                                                   sx={{height: "2.5vh", minHeight: "4px"}}
                                                   anchorOrigin={{
                                                       vertical: 'top',
                                                       horizontal: 'left',
                                                   }}>
                                                <LocalCafeOutlinedIcon />
                                            </Badge>
                                        </IconButton>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div style={{width: "76vw"}}>
                        <form noValidate autoComplete="off" style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "95%",
                            paddingBottom: "2%"
                        }} onSubmit={e => e.preventDefault()}>
                            <TextField id={"outlined-basic"} label={"Comment"} variant={"outlined"} multiline={true}
                                       style={{width: "100%",}} onChange={e => setCommentBody(e.target.value)}
                                       value={commentBody}/>
                            <div style={{paddingTop: "1.5%"}}>
                                <Button variant="contained" size={"large"} color="primary"
                                        onClick={() => handlePostThread(commentBody)} className={"thread"} style={{                            zIndex: "600000"}}>
                                    <SendIcon/>
                                </Button>
                            </div>
                        </form>
                    </div>
                    {renderEditCommentPopup(2)}
                </div>
            )
        } else if (discussionTab === "reply") {
            return (
                <div style={{display: "flex", flexDirection: "column"}}>
                    <div style={window.innerWidth > 1000 ? {display: "flex", width: "80vw", justifyContent: "left", paddingBottom: "15px"} : {display: "flex", width: "68vw", justifyContent: "left", paddingBottom: "15px"}}>
                        <SearchBar handleSearchText={handleSearchText}/>
                    </div>
                    <div>
                        <Button onClick={() => goBack()}>
                            Go Back
                        </Button>
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "start",
                        flexDirection: "column",
                        overflowY: "auto",
                        overflowX: "hidden",
                        height: "58vh",
                        paddingTop: ".5%"
                    }}>
                        <div style={{
                            marginBottom: ".8%",
                            display: "flex",
                            paddingBottom: "5px",
                            width: "80vw",
                            alignContent: "center",
                            position: `relative`}}>
                            <ThreadCard  userName={selectedThread["author"]}
                                         userThumb={config.rootPath + "/static/user/pfp/" + selectedThread["author_id"]}
                                         userId={selectedThread["author_id"]}
                                         userTier={selectedThread["author_tier"]}
                                         threadBody={selectedThread["body"]}
                                         threadId={selectedThread["_id"]}
                                         width={window.innerWidth > 1000 ? 77 * window.innerWidth / 100 : 70 * window.innerWidth / 100}
                                         height={150} backgroundName={selectedThread["name"]}
                                         backgroundPalette={selectedThread["color_palette"]}
                                         backgroundRender={selectedThread["render_in_front"]} role={selectedThread["user_status"]}/>
                            {threadUpVotes.includes(selectedThread["_id"]) ? (
                                <IconButton onClick={() => handleCoffeeClick(selectedThread["coffee"], false, "thread_comment", selectedThread)}
                                            sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                    <Badge color="primary" badgeContent={selectedThread["coffee"]}
                                           sx={{height: "2.5vh", minHeight: "4px"}}
                                           anchorOrigin={{
                                               vertical: 'top',
                                               horizontal: 'left',
                                           }}>
                                        <LocalCafeIcon />
                                    </Badge>
                                </IconButton>
                            ) : (
                                <IconButton onClick={() => handleCoffeeClick(selectedThread["coffee"], true, "thread_comment", selectedThread)}
                                            sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                    <Badge color="primary" badgeContent={selectedThread["coffee"]}
                                           sx={{height: "2.5vh", minHeight: "4px"}}
                                           anchorOrigin={{
                                               vertical: 'top',
                                               horizontal: 'left',
                                           }}>
                                        <LocalCafeOutlinedIcon />
                                    </Badge>
                                </IconButton>
                            )}
                        </div>
                        {replyArray.map((reply) => {
                            return (
                                <div style={{
                                    display: "flex",
                                    paddingBottom: "10px",
                                    width: "82.3vw",
                                    alignContent: "center",
                                    position: "relative"
                                }}>
                                    <ThreadCard userName={reply["author"]}
                                                userThumb={config.rootPath + "/static/user/pfp/" + reply["author_id"]}
                                                userId={reply["author_id"]}
                                                userTier={reply["author_tier"]}
                                                threadBody={reply["body"]}
                                                threadId={reply["_id"]}
                                                width={window.innerWidth > 1000 ? 77 * window.innerWidth / 100 : 70 * window.innerWidth / 100}
                                                height={150} backgroundName={reply["name"]}
                                                backgroundPalette={reply["color_palette"]}
                                                backgroundRender={reply["render_in_front"]} role={reply["user_status"]}/>
                                    {reply["author_id"] === callingId ? (
                                        <Button
                                            variant={`text`} color={"primary"} size={`small`}
                                            sx={window.innerWidth > 1000 ? { position: 'absolute', right: "6%" } : {position: "absolute", top: "15%"}}
                                            onClick={() => {
                                                setSelectedReply(reply);
                                                setNewBody(reply["body"]);
                                                setEditCommentType(3)
                                                setEditCommentPopup(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    ) : null}
                                    {replyUpVotes.includes(reply["_id"]) ? (
                                        <IconButton onClick={() => handleCoffeeClick(reply["coffee"], false, "thread_reply", reply)}
                                                    sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                            <Badge color="primary" badgeContent={reply["coffee"]}
                                                   sx={{height: "2.5vh", minHeight: "4px"}}
                                                   anchorOrigin={{
                                                       vertical: 'top',
                                                       horizontal: 'left',
                                                   }}>
                                                <LocalCafeIcon />
                                            </Badge>
                                        </IconButton>
                                    ) : (
                                        <IconButton onClick={() => handleCoffeeClick(reply["coffee"], true, "thread_reply", reply)}
                                                    sx={{position: "absolute", bottom: "5%", left: "1%"}}>
                                            <Badge color="primary" badgeContent={reply["coffee"]}
                                                   sx={{height: "2.5vh", minHeight: "4px"}}
                                                   anchorOrigin={{
                                                       vertical: 'top',
                                                       horizontal: 'left',
                                                   }}>
                                                <LocalCafeOutlinedIcon />
                                            </Badge>
                                        </IconButton>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div style={{width: "76vw"}}>
                        <form noValidate autoComplete="off" style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "95%",
                            paddingBottom: "2%"
                        }} onSubmit={e => e.preventDefault()}>
                            <TextField id={"outlined-basic"} label={"Comment"} variant={"outlined"} multiline={true}
                                       style={{width: "100%",}} onChange={e => setCommentBody(e.target.value)}
                                       value={commentBody}/>
                            <div style={{paddingTop: "1.5%"}}>
                                <Button variant="contained" size={"large"} color="primary"
                                        onClick={() => handleThreadReply(commentBody)}>
                                    <SendIcon/>
                                </Button>
                            </div>
                        </form>
                    </div>
                    {renderEditCommentPopup(3)}
                </div>
            )
        }
    }

    const mainTabHtml = () => {
        let renderFunc = mainTabProject
        if (mainTab === "source") {
            renderFunc = mainTabSource
        } else if (mainTab === "edit") {
            renderFunc = mainTabEdit
        } else if (mainTab === "discussions") {
            renderFunc = mainTabDiscussions
        }

        return (
            <div style={{width: "80vw"}}>
                {renderFunc()}
            </div>
        )
    }

    const handleTabChange = (newValue: string) => {
        setMainTab(newValue);
        window.location.hash = "#"+newValue
        if (newValue === "discussions") {
            getDiscussions().then(r => console.log(r))
            console.log("run: ", runTutorial)
        }
        setDiscussionTab("main")
        setThread(false)
        setSelectedComment({
            commentId: ""
        })

        if (newValue ==="edit") {
            getConfig()
        }
    };

    const handleThreadComment = () => {
        let comment = threadArray
        comment.push({
            userName: "test user",
            userThumb: "https://www.jackson-pollock.org/images/paintings/white-light.jpg",
            userId: "2",
            userTier: "purple",
            threadId: "42269",
            commentId: "424",
            discussionId: "69",
            discussionComment: threadComment,
            commentNumber: "2",
            commentLead: "false",
            commentCoffee: 0
        })
        setThreadArray(comment)
        setThreadComment("")
    }

    const launchWorkspace = async (repoId: string, codeSourceId: string, codeSourceType: number) => {
        if (project == null) {
            setLaunchingWorkspace(false)
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
                "repo": repoId,  // available in attempt or project
                "code_source_id": codeSourceId,  // pass id of attempt or project
                "code_source_type": codeSourceType, // 0 for project - 1 for attempt
            }
        )

        // handle failed call
        if (res === undefined || res["message"] === undefined) {
            setLaunchingWorkspace(false)
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We can't get in touch with the server... Sorry about that! We'll get working on that right away!"
                );
            return
        }

        if (res["message"] === "You must be logged in to access the GIGO system."){
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }

        // handle expected failure
        if (res["message"] !== "Workspace Created Successfully") {
            setLaunchingWorkspace(false)
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    res["message"]
                );
            return
        }

        let workspace: Workspace = res["workspace"]

        // route to workspace page
        navigate(`/launchpad/${workspace._id}`)
    }


    const createAttempt = async () => {
        // execute api call to remote GIGO server to create workspace
        let res = await call(
            "/api/attempt/start",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                project_id: project["_id"],
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
            let attempt: Attempt = res["attempt"]
            setUserAttempt(attempt)
            await launchWorkspace(attempt.repo_id, attempt._id, 1)
        } else if (res["message"] === "You have already started an attempt. Keep working on that one!") {
            swal("You have already started an attempt. Keep working on that one!")
            setLaunchingWorkspace(false)
        } else {
            swal("There was an issue branching this attempt. Please try again later.")
            setLaunchingWorkspace(false)
        }
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
        state.challenge = true
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
                tutorial_key: "challenge"
            }
        )
    }

    const threadTab = () => {
        return (
            <div style={{width: "16.5vw", height: "65vh", overflow: "auto"}}>
                <div>
                    <Button onClick={() => setThread(false)}>
                        Exit Thread
                    </Button>
                </div>
                <div style={{paddingTop: "10px"}}>
                    {threadComments.map((comment) => {
                        return (
                            <div style={{display: "flex", justifyContent: "center", paddingBottom: "5px"}}>
                                <ThreadComment userName={comment["userName"]} userThumb={config.rootPath + "/static/user/pfp/" + discussion["author_id"]}
                                               userId={comment["userId"]} userTier={comment["userTier"]}
                                               discussionId={comment["discussionId"]} commentId={comment["commentId"]}
                                               discussionComment={comment["discussionComment"]}
                                               threadId={comment["threadId"]} commentNumber={comment["commentNumber"]}
                                               commentLead={comment["commentLead"]}
                                               commentCoffees={comment["commentCoffee"]}
                                               width={14 * window.innerWidth / 100}/>
                            </div>
                        )
                    })}
                </div>
                <div>
                    <form noValidate autoComplete="off" style={{
                        display: "flex",
                        justifyContent: "center",
                        width: "95%",
                        margin: `${theme.spacing(0)} auto`
                    }} onSubmit={e => e.preventDefault()}>
                        <TextField id={"outlined-basic"} label={"Comment"} variant={"outlined"} style={{width: "100%"}}
                                   onChange={e => setThreadComment(e.target.value)} value={threadComment}/>
                        <Button variant="contained" color="primary"
                                onClick={() => handleThreadComment()}
                        >
                            <SendIcon/>
                        </Button>
                    </form>
                </div>
            </div>
        )
    }

    const deleteProjectFunction = async () => {
        console.log("why: ", project)
        if (project === null || project.deleted) {
            return

        }

        let res = await call(
            "/api/project/delete",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {project_id: project._id},
            null,
            config.rootPath
        )

        if (res === undefined || res["message"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }

        if (res["message"] !== "Project has been deleted.") {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    (res["message"] !== "internal server error occurred") ?
                        res["message"] :
                        "An unexpected error has occurred. We're sorry, we'll get right on that!"
                );
            return;
        }

        let stateUpdate = Object.assign({}, project) as Post
        stateUpdate.deleted = true
        setProject(stateUpdate)
        setDeleteProject(false)
        swal("Project Deleted", "This project will no longer be searchable.")
    }

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

    const [isScrolled, setIsScrolled] = React.useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 80) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const renderDiscussionButton = () => {
        if (runTutorial && stepIndex === 2) {
            return (
                <TutorialDiscussionButton
                    variant="outlined"
                    sx={styles.mainTabButton}
                    disabled={mainTab === "discussions"}
                    onClick={() => handleTabChange("discussions")}
                    className="comment"
                >
                    Discussions
                </TutorialDiscussionButton>
            )
        }

        return (
            <Button
                variant="outlined"
                sx={styles.mainTabButton}
                disabled={mainTab === "discussions"}
                onClick={() => handleTabChange("discussions")}
                className="comment"
            >
                Discussions
            </Button>
        )
    }

    const renderTabButtons = () => {
        return (
            <>
                <Grid item sx={1}>
                    {project !== null ? (
                        <Button variant="outlined" sx={styles.mainTabButton} disabled={mainTab === "project"} onClick={() => handleTabChange("project")}>
                            Project
                        </Button>
                    ) : (
                        <StyledDiv style={{height: "35px", width: "100px", borderRadius: 2}}/>
                    )}
                </Grid>
                {project !== null && project["has_access"] !== null && project["has_access"] === false ? null : window.innerWidth > 1000 ? (
                    <Grid item sx={1}>
                        {project !== null ? (
                            <Button variant="outlined" sx={styles.mainTabButton} disabled={mainTab === "source"} className="sourceCode" onClick={() => handleTabChange("source")} style={stepIndex === 2 ? { zIndex: "600000" } : {}}>
                                Source Code
                            </Button>
                        ) : (
                            <StyledDiv style={{height: "35px", width: "100px", borderRadius: 2}}/>
                        )}
                    </Grid>
                ) : null}
                <Grid item sx={1}>
                    {project !== null ? (
                        isEphemeral ? <></> : renderDiscussionButton()
                    ) : (
                        <StyledDiv style={{height: "35px", width: "100px", borderRadius: 2}}/>
                    )}
                </Grid>
                {username === ownerName && window.innerWidth > 1000 ? (
                    <>
                        <Grid item sx={1}>
                            <Button variant="outlined" sx={styles.mainTabButton} disabled={mainTab === "edit"} onClick={() => handleTabChange("edit")}>
                                Edit Config
                            </Button>
                        </Grid>
                        <Grid item sx={1}>
                            <Button variant="outlined" sx={styles.mainTabButton} disabled={mainTab === "edit"} onClick={() => shareLink()}>
                                Share
                            </Button>
                            {sharePopup()}
                        </Grid>
                    </>
                ) : (<div />)}
                {(project !== null && !project.published && !project.deleted && window.innerWidth > 1000) && (
                    <Grid item sx={1}>
                        <Tooltip title="This Challenge is un-published. Publishing enables other users to see and Attempt this challenge.">
                            <LoadingButton
                                loading={publishing}
                                variant="outlined"
                                sx={{
                                    height: "4vh",
                                    maxHeight: "50px",
                                    minHeight: "35px",
                                    fontSize: "0.8em",
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.main + "25",
                                    }
                                }}
                                onClick={() => {
                                    setPublishing(true);
                                    publishProject();
                                }}
                            >
                                Publish
                            </LoadingButton>
                        </Tooltip>
                    </Grid>
                )}
                {(project !== null && !project.deleted && userId === project["author_id"] && window.innerWidth > 1000) && (
                    <Grid item sx={1}>
                        <LoadingButton
                            loading={publishing}
                            color="error"
                            variant="outlined"
                            sx={{
                                height: "4vh",
                                maxHeight: "50px",
                                minHeight: "35px",
                                fontSize: "0.8em",
                                '&:hover': {
                                    backgroundColor: theme.palette.error.main + "25",
                                }
                            }}
                            onClick={() => {
                                setDeleteProject(true);
                            }}
                        >
                            Delete
                        </LoadingButton>
                    </Grid>
                )}
            </>
        )
    }

    const checkEphemeral = async () => {
        let url = new URL(window.location.href);
        let challenge = url.pathname.split('/')
        let challengeId = challenge[challenge.indexOf('challenge') + 1]

        let res = await call(
            "/api/project/verifyLink",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {
                "post_id": challengeId,
                "share_link": queryParams.get('share')
            },
            null,
            config.rootPath
        )

        if (res["message"] === 'valid share link') {
            setIsEphemeral(true)
        } else if (res["message"] === 'invalid share link') {
            window.location.href = "/404"
        } else {
            // todo handle error
        }

    }

    const shareLink = async () => {
        let res = await call(
            "/api/project/shareLink",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {
                "post_id": project["_id"],
            },
            null,
            config.rootPath
        )

        
        //todo handle if error
        setShareProject(`https://gigo.dev/challenge/${project["_id"]}?share=${res['message']}`)
        setSharePopupOpen(true);
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareProject);
        } catch(err) {
            console.log('Failed to copy text: ', err);
        }
    }

    const sharePopup = () => {
        return (
            <Modal open={sharePopupOpen} onClose={() => setSharePopupOpen(false)}>
                <Box
                    sx={{
                        width: "30vw",
                        minHeight: "340px",
                        height: "30vh",
                        justifyContent: "center",
                        marginLeft: "35vw",
                        marginTop: "35vh",
                        outlineColor: "black",
                        borderRadius: 1,
                        boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    <Button onClick={() => setSharePopupOpen(false)}>
                        <CloseIcon/>
                    </Button>
                    <div style={{width: "100%", display: "flex", alignItems: "center", flexDirection: "column"}}>
                        <h3>Share your Project</h3>
                        <div style={{display: "flex", width: "100%", flexDirection: "row", justifyContent: "center"}}>
                            <h5 style={{outline: "solid gray", borderRadius: "5px", padding: "8px"}} id={"url"}>{shareProject.length > 30 ? shareProject.slice(0,30) + "..." : shareProject}</h5>
                            <Button onClick={() => copyToClipboard()}>
                                <ContentCopyIcon/>
                            </Button>
                        </div>
                    </div>
                </Box>
            </Modal>
        )
    }

    const renderLaunchButton = () => {
        let clickCallback = () => {
            if (!loggedIn) {
                window.location.href = "/signup";
            }
            if (project !== null && project["has_access"] !== null && project["has_access"] === false) {
                setPurchasePopup(true);
                return;
            }
            setLaunchingWorkspace(true);
            if (project !== null && userId === project["author_id"]) {
                launchWorkspace(project.repo_id, project._id, 0);
                return;
            } else if (userAttempt !== null) {
                launchWorkspace(userAttempt.repo_id, userAttempt._id, 1);
                return;
            }
            createAttempt();
        }

        let sx = {
            maxHeight: "50px",
            minHeight: "35px",
            fontSize: "0.8em",
        }

        let buttonText = (project !== null && userId === project["author_id"]) || (userAttempt !== null) ? "Keep Going" : project !== null && project["has_access"] !== null && project["has_access"] === false ? "Buy Content" : "Give It A Shot"

        if (runTutorial && stepIndex === 1) {
            return (
                <TutorialLaunchButton
                    loading={launchingWorkspace}
                    variant="contained"
                    color="secondary"
                    sx={sx}
                    className="attempt"
                    onClick={clickCallback}
                >
                    {buttonText}
                </TutorialLaunchButton>
            )
        }

        return (
            <LoadingButton
                loading={launchingWorkspace}
                variant="contained"
                color="secondary"
                sx={sx}
                className="attempt"
                onClick={clickCallback}
            >
                {buttonText}
            </LoadingButton>
        )
    }

    const editProject = async(title: null, challengeType: null, tier: null, image: null, removeTags: null, addTags: null) => {
        let params = {
            id: project["_id"],
        }

        if (title != null) {
            params["title"] = title;
        }

        if (challengeType != null) {
            switch (challengeType) {
                case "Casual":
                    params["challenge_type"] = 2
                    break
                case "Competitive":
                    params["challenge_type"] = 3
                    break
                case "Interactive":
                    params["challenge_type"] = 0
                    break
                case "Playground":
                    params["challenge_type"] = 1
                    break
            }
        }

        if (tier!= null) {
            params["tier"] = tier - 1;
        }

        console.log("removed tags here: ", removeTags)

        if (removeTags != null){
            params["remove_tags"] = removeTags;
        }

        if (addTags!= null){
            params["add_tags"] = addTags;
        }

        let edit;

        if (image != null) {
            console.log("project is: ", projectImage)
            if (genImageId !== null && genImageId !== "") {
                //@ts-ignore
                params["gen_image_id"] = genImageId

                edit = await call(
                    "/api/project/editProject",
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
                    "/api/project/editProject",
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
                }

                if ("message" in res && res["message"] === "success"){
                    if (sessionStorage.getItem("alive") === null)
                        //@ts-ignore
                        swal("Success!", res["message"], "success")
                    return;
                }
            }
        } else {
            edit = call(
                "/api/project/editProject",
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
    }

    const renderTabBar = () => {
        return (
            <>
                <div style={window.innerWidth > 1000 ? {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000, // You may need to adjust this
                    ...(isScrolled ? {
                        position: "fixed",
                        top: "120px",
                    } : {
                        position: "absolute",
                        top: "160px"
                    })
                } : {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000, // You may need to adjust this
                    position: "absolute",
                    ...(!isScrolled && {
                        top: "275px"
                    })
                }}>
                    <Box
                        sx={window.innerWidth > 1000 ?{
                            p: 2,
                            height: "8vh",
                            minHeight: "70px",
                            alignItems: "center",
                            border: 1,
                            borderRadius: "15px",
                            borderColor: theme.palette.primary.dark + "75",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                            width: 'fit-content',
                            ...(isScrolled && {
                                ...themeHelpers.frostedGlass,
                                backgroundColor: "rgba(206,206,206,0.31)"
                            })
                        } : {
                            p: 2,
                            height: "20vh",
                            minHeight: "70px",
                            width: "90%",
                            alignItems: "center",
                            border: 1,
                            borderRadius: "15px",
                            borderColor: theme.palette.primary.dark + "75",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                            width: 'fit-content',
                            // ...(isScrolled && {
                            //     ...themeHelpers.frostedGlass,
                            //     backgroundColor: "rgba(206,206,206,0.31)"
                            // })
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
                            {!isScrolled && renderTabButtons()}
                            {project !== null ? (
                                <Grid item sx={1}>
                                    {renderLaunchButton()}
                                </Grid>
                            ) : null}
                        </Grid>
                    </Box>
                </div>
            <Modal open={purchasePopup} onClose={() => setPurchasePopup(false)}>
                <Box
                    sx={{
                        width: "30vw",
                        height: "20vh",
                        justifyContent: "center",
                        marginLeft: "40vw",
                        marginTop: "40vh",
                        outlineColor: "black",
                        borderRadius: 1,
                        boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    <ProjectPayment price={project !== null ? project["stripe_price_id"] : ""} post={project !== null ? project["_id"].toString() : ""} />
                </Box>
            </Modal>
            <Modal open={deleteProject} onClose={() => setDeleteProject(false)}>
                <Box
                    sx={{
                        width: "30vw",
                        height: "20vh",
                        justifyContent: "center",
                        marginLeft: "40vw",
                        marginTop: "40vh",
                        outlineColor: "black",
                        borderRadius: 1,
                        boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <h4>Are you sure you want to delete this project?</h4>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                        <Button onClick={() => deleteProjectFunction()}>Confirm</Button>
                        <Button onClick={() => setDeleteProject(false)}>Cancel</Button>
                    </div>
                </Box>
            </Modal>
            </>
        )
    }

    const handleProjectSelection = (selectedProject) => {
        console.log("2: ", selectedProject)
        setChallengeType(selectedProject)
    };

    const handleProjectSelectionRenown = (selectedProject) => {
        console.log("2: ", selectedProject)
        setProjectRenown(selectedProject)
    };

    const handleTagSearch = async (e: any) => {
        if (typeof e.target.value !== "string") {
            return
        }

        let res = await call(
            "/api/search/tags",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                query: e.target.value,
                skip: 0,
                limit: 5,
            }
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }


        if (res["tags"] === undefined) {
            if (res["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            if (res["message"] === "incorrect type passed for field query") {
                return
            }
            swal("Server Error", res["message"])
            return
        }

        setTagOptions(res["tags"])
    }

    // const removedTags: Tag[] = [];
    // const addedTags: Tag[] = [];

    const userChallenge = () => {
        return (
            <>
                {project !== null ? (
                    <HelmetProvider>
                        <Helmet>
                            <title>{project !== null ? project["post_title"] : "Challenge"}</title>
                            <meta property="og:title" content={project !== null ? project["post_title"]: "Challenge"} data-rh="true"/>
                            <meta property="og:description" content={project !== null ? project["description"] : "Description"} data-rh="true"/>
                            <meta property="og:image" content={project !== null ? config.rootPath + project["thumbnail"] : alternativeImage} data-rh="true"/>
                        </Helmet>
                    </HelmetProvider>
                ) : (
                    <HelmetProvider>
                        <Helmet>
                            <title>{project !== null ? project["post_title"] : "Challenge"}</title>
                            <meta property="og:image" content={project !== null ? config.rootPath + project["thumbnail"] : alternativeImage} data-rh="true"/>
                        </Helmet>
                    </HelmetProvider>
                )}
                {embedded ? <div style={{ paddingTop: "25px" }} /> : <></>}
                <CardTutorial
                    open={runTutorial}
                    closeCallback={closeTutorialCallback}
                    step={stepIndex}
                    changeCallback={tutorialCallback}
                    steps={[
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Let's get started with a Challenge!</h2>
                                    <p style={styles.tutorialText}>Challenges are how lessons and projects are structured on GIGO. Finish the tutorial to learn how to start and interact with a challenge.</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>Challenges are grouped into 4 categories:</p>
                                    <ul>
                                        <li style={styles.tutorialText}>Interactive - A project that includes guided learning material such as tutorials or interactive lessons.</li>
                                        <li style={styles.tutorialText}>Playground - A project with no goal that is meant to enable free experimentation.</li>
                                        <li style={styles.tutorialText}>Casual - A project that has a predefined goal and evaluations but is not competitively ranked against other users.</li>
                                        <li style={styles.tutorialText}>Competitive - Similar to Casual, but is ranked against other users.</li>
                                    </ul>
                                </div>
                            )
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Give It A Shot</h2>
                                    <p style={styles.tutorialText}>On GIGO Attempts are how you accept a Challenge. Making an Attempt allows you to work on the project. Click the 'Give It A Shot' button on any Challenge to make an attempt and start working on the project!</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>When you make an Attempt, GIGO will create a copy of the project for you to work on. GIGO will then start a dedicated Workspace that you can use to work on the project. You can only make one Attempt on a Challenge, so bring your A game!</p>
                                </div>
                            )
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Talking about Challenges</h2>
                                    <p style={styles.tutorialText}>Ask questions, raise issues, or converse about the project using the
                                        'Discussions' tab at the top of the page.</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>Discussions are a great way to get help or share your thoughts on a project. When you complete an Attempt head over to Discussions to share your opinion or help others!</p>
                                </div>
                            )
                        },
                    ]}
                />
                <Typography variant="h5" component="div" sx={styles.projectName} style={{display: "flex", flexDirection: "row"}}>
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
                            style={{ width: "auto" }}
                            inputProps={styles.textField}
                            multiline
                        />
                    ) : (
                        <div>
                            {projectName}
                        </div>
                    )}
                    {project !== null && project["post_type_string"] && (
                        <div>
                            {editTitle ? (
                                <div style={{padding: "10px"}}>
                                    <ProjectSelector originalLabel={project["post_type_string"]} onProjectSelect={handleProjectSelection}/>
                                </div>
                            ) : (
                                <Chip
                                    label={project["post_type_string"]}
                                    color="primary"
                                    variant="outlined"
                                    sx={{ marginLeft: "20px", marginTop: "5px" }}
                                    icon={getProjectIcon(project["post_type_string"])}
                                />
                            )}
                        </div>
                    )}
                    {!editTitle && (
                        <Button onClick={() => setEditTitle(true)}>
                            <EditIcon/>
                        </Button>
                    )}
                </Typography>
                {project !== null && project["post_type_string"] && (
                    <div>
                        {editTitle ? (
                            <div style={{position: "absolute", top: "60%", paddingLeft: "10px"}}>
                                <ProjectRenown originalLabel={project["tier"] + 1} onProjectSelect={handleProjectSelectionRenown}/>
                            </div>
                        ) : null}
                    </div>
                )}
                {project !== null && editTitle && (
                    <Autocomplete
                        multiple
                        limitTags={5}
                        id="tagInputAutocomplete"
                        freeSolo={true}
                        options={tagOptions}
                        getOptionLabel={(option: Tag | string) => {
                            if (typeof option === "string") {
                                return option
                            }
                            return option.value
                        }}
                        isOptionEqualToValue={(option: string | Tag, value: string | Tag) => {
                            // return false if either of the inputs are user-defined values unless they are both
                            // user-defined values then we check if they are the same
                            if (typeof option === "string" || typeof value === "string") {
                                if (typeof option === "string" && typeof value === "string") {
                                    return option.toLowerCase() === value.toLowerCase();
                                }
                                return false
                            }
                            return option._id === value._id;
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Challenge Tags" placeholder="Challenge Tags"/>
                        )}
                        onInputChange={(e) => {
                            handleTagSearch(e)
                        }}
                        // @ts-ignore
                        onChange={(event, value: Array<Tag | string>) => {
                            const currentRemovedTags: Tag[] = [];
                            const currentAddedTags: Tag[] = [];

                            // Find out which tags were added
                            const newAddedTags = value.filter(tag => !projectTags.includes(tag));

                            newAddedTags.forEach(tag => {
                                if (removedTagsState.some(removedTag => removedTag.value === tag.value)) {
                                    const index = removedTagsState.findIndex(removedTag => removedTag.value === tag.value);
                                    if (index !== -1) removedTagsState.splice(index, 1);
                                } else {
                                    if (typeof tag === "object") {
                                        currentAddedTags.push(tag as Tag);
                                    } else {
                                        currentAddedTags.push({
                                            _id: "-1",
                                            value: tag,
                                        } as Tag);
                                    }
                                    // console.log("tag is: ", tag)
                                    // currentAddedTags.push(tag);
                                }
                            });

                            // Find out which tags were removed
                            const newRemovedTags = projectTags.filter(tag => !value.includes(tag));

                            newRemovedTags.forEach(tag => {
                                if (addedTagsState.some(addedTag => addedTag.value === tag.value)) {
                                    const index = addedTagsState.findIndex(addedTag => addedTag.value === tag.value);
                                    if (index !== -1) addedTagsState.splice(index, 1);
                                } else {
                                    currentRemovedTags.push(tag as Tag);
                                }
                            });

                            // Update the projectTags
                            let tagArray: Tag[] = [];
                            value.forEach(tag => {
                                if (typeof tag === "object") {
                                    tagArray.push(tag as Tag);
                                } else {
                                    tagArray.push({
                                        _id: "-1",
                                        value: tag,
                                    } as Tag);
                                }
                            });
                            setProjectTags(tagArray);

                            // Update the state with currentRemovedTags and currentAddedTags
                            setRemovedTagsState(currentRemovedTags);
                            setAddedTagsState(currentAddedTags);
                        }}
                        // @ts-ignore
                        value={projectTags}
                        sx={{
                            position: "absolute",
                            top: "45%",
                            paddingLeft: "10px",
                            width: "18vw"
                        }} className={"tags"}
                    />
                )}
                {editTitle && (
                    <div style={{position: "absolute", top: "60%", marginLeft: "100px"}}>
                        <Button onClick={() => editProject(
                            projectTitle !== projectName ? projectTitle : null,
                            challengeType !== project["post_type_string"] ? challengeType : null,
                            projectRenown.toString() !== project["tier"].toString() ? projectRenown : null,
                            null,
                            removedTagsState.length > 0 ? removedTagsState : null,
                            addedTagsState.length > 0 ? addedTagsState : null
                        )}>
                            Submit
                        </Button>
                        <Button onClick={() => setEditTitle(false)}>
                            Cancel
                        </Button>
                    </div>
                )}
                {window.innerWidth > 1000 ? (
                    <div style={project !== null ? {} : {marginBottom: "110px"}}>
                        {renderTabBar()}
                    </div>
                ) : (
                    <div style={{marginTop: "25px"}}>
                        {project !== null ? (
                            <Typography component={"div"} sx={{width: "90%",
                                height: "auto",
                                display: "flex",
                                flexDirection: "row"}}>
                                <Typography sx={{display: "flex", flexDirection: "row", width: "85%", ml: 2}}>
                                    <div>
                                        <UserIcon
                                            userId={project !== null ? project["author_id"] : ""}
                                            userTier={project !== null ? project["tier"] : ""}
                                            userThumb={project !== null ? config.rootPath + "/static/user/pfp/" + project["author_id"] : ""}
                                            backgroundName={project !== null ? project["name"] : null}
                                            backgroundPalette={project !== null ? project["color_palette"] : null}
                                            backgroundRender={project !== null ? project["render_in_front"] : null}
                                            size={50}
                                            imageTop={2}
                                        />
                                    </div>
                                    <Typography variant="h5" component="div">
                                        {project !== null ? project["author"] : ""}
                                    </Typography>
                                </Typography>
                                <Typography variant="body1" color="text.primary" align="right">
                                    {new Date(project !== null ? project["created_at"] : "").toLocaleString("en-us", {day: '2-digit', month: 'short', year: 'numeric'})}
                                </Typography>
                            </Typography>
                        ) : (
                            <Typography component={"div"} sx={{width: "90%",
                                height: "auto",
                                display: "flex",
                                flexDirection: "row"}}>
                                <Typography style={{display: "flex", flexDirection: "row", width: "85%"}}>
                                    <div>
                                        <PersonIcon sx={{width: "50px", height: "50px"}}/>
                                    </div>
                                </Typography>
                                <StyledDiv style={{height: "24px", width: "40%", marginBottom: "12px", borderRadius: "20px", marginTop: "10px"}}/>
                            </Typography>
                        )}
                    </div>
                )}
                <div style={window.innerWidth > 1000 ? {
                    marginTop: "60px",
                    ...(thread && {
                        display: "flex",
                        flexDirection: "row"
                    })
                } : {
                    ...(thread && {
                        display: "flex",
                        flexDirection: "row"
                    })
                }}>
                    <div style={thread ? { display: "flex", justifyContent: "left", paddingTop: "2%", paddingLeft: "5px" } : window.innerWidth > 1000 ? { display: "flex", justifyContent: "center", paddingTop: "2%" } : { display: "flex", justifyContent: "center", paddingTop: "2%", marginBottom: "150px" }}>
                        {mainTab === "discussions" ? (
                            <Box
                                sx={window.innerWidth > 1000 ? {
                                    width: '80vw',
                                    backgroundColor: theme.palette.background.paper,
                                    borderRadius: 3,
                                    p: 3,
                                    height: "auto",
                                    border: 1,
                                    borderColor: theme.palette.primary.dark + "75",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);"
                                } : {
                                    width: '80vw',
                                    backgroundColor: theme.palette.background.paper,
                                    borderRadius: 3,
                                    p: 3,
                                    height: "100%",
                                    border: 1,
                                    borderColor: theme.palette.primary.dark + "75",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);"
                                }}
                            >
                                {mainTabHtml()}
                            </Box>
                        ) : (
                            mainTabHtml()
                        )}
                    </div>
                    {thread ? (
                        <div style={{ display: "flex", justifyContent: "right", paddingTop: "2%", paddingLeft: "1vw" }}>
                            <Box
                                sx={{
                                    width: '18vw',
                                    bgcolor: 'background2.default',
                                    color: 'text.primary',
                                    borderRadius: 1,
                                    p: 3,
                                    height: "68vh",
                                }}
                            >
                                {threadTab()}
                            </Box>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
                {/* add a 10vh buffer at the end of the page */}
                <div style={{height: "10vh"}}/>
            </>
        )
    }

    const launchEphemeralWorkspace = async () => {
        setLoadingEphemeral(true)
        let promise = call(
            "/api/ephemeral/create",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {
                "commit": "main", // for now always 'main' - future will handle branches and commits
                challenge_id: id,
            },
            null,
            config.rootPath
        )

        const [res] = await Promise.all([promise])
        if (res === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }

        if (res["workspace_id"] === undefined) {
            // capitalize the message
            let m = res["message"].charAt(0).toUpperCase() + res["message"].slice(1)
            swal("Failed To Launch", m, "error")
            setLoadingEphemeral(false)
            return;
        }


        navigate(`/launchpad/${res['workspace_id']}`)
    }

    const ephemeralLaunchButton = () => {
        let sx = {
            maxHeight: "50px",
            minHeight: "35px",
            fontSize: "0.8em",
        }

        let buttonText = (project !== null && userId === project["author_id"]) || (userAttempt !== null) ? "Keep Going" : project !== null && project["has_access"] !== null && project["has_access"] === false ? "Buy Content" : "Give It A Shot"

        return (
            <LoadingButton
                loading={loadingEphemeral}
                variant="contained"
                color="secondary"
                sx={sx}
                className="attempt"
                onClick={() => launchEphemeralWorkspace()}
            >
                {buttonText}
            </LoadingButton>
        )
    }

    const ephemeralTabBar = () => {
        return (
            <>
                <div style={window.innerWidth > 1000 ? {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000, // You may need to adjust this
                    ...(isScrolled ? {
                        position: "fixed",
                        top: "120px",
                    } : {
                        position: "absolute",
                        top: "160px"
                    })
                } : {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000, // You may need to adjust this
                    position: "absolute",
                    ...(!isScrolled && {
                        top: "275px"
                    })
                }}>
                    <Box
                        sx={window.innerWidth > 1000 ?{
                            p: 2,
                            height: "8vh",
                            minHeight: "70px",
                            alignItems: "center",
                            border: 1,
                            borderRadius: "15px",
                            borderColor: theme.palette.primary.dark + "75",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                            width: 'fit-content',
                            ...(isScrolled && {
                                ...themeHelpers.frostedGlass,
                                backgroundColor: "rgba(206,206,206,0.31)"
                            })
                        } : {
                            p: 2,
                            height: "20vh",
                            minHeight: "70px",
                            width: "90%",
                            alignItems: "center",
                            border: 1,
                            borderRadius: "15px",
                            borderColor: theme.palette.primary.dark + "75",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                            width: 'fit-content',
                            // ...(isScrolled && {
                            //     ...themeHelpers.frostedGlass,
                            //     backgroundColor: "rgba(206,206,206,0.31)"
                            // })
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
                            {!isScrolled && renderTabButtons()}
                            {project !== null ? (
                                <Grid item sx={1}>
                                    {ephemeralLaunchButton()}
                                </Grid>
                            ) : null}
                        </Grid>
                    </Box>
                </div>
                <Modal open={purchasePopup} onClose={() => setPurchasePopup(false)}>
                    <Box
                        sx={{
                            width: "30vw",
                            height: "20vh",
                            justifyContent: "center",
                            marginLeft: "40vw",
                            marginTop: "40vh",
                            outlineColor: "black",
                            borderRadius: 1,
                            boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        <ProjectPayment price={project !== null ? project["stripe_price_id"] : ""} post={project !== null ? project["_id"].toString() : ""} />
                    </Box>
                </Modal>
                <Modal open={deleteProject} onClose={() => setDeleteProject(false)}>
                    <Box
                        sx={{
                            width: "30vw",
                            height: "20vh",
                            justifyContent: "center",
                            marginLeft: "40vw",
                            marginTop: "40vh",
                            outlineColor: "black",
                            borderRadius: 1,
                            boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                            <h4>Are you sure you want to delete this project?</h4>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                            <Button onClick={() => deleteProjectFunction()}>Confirm</Button>
                            <Button onClick={() => setDeleteProject(false)}>Cancel</Button>
                        </div>
                    </Box>
                </Modal>
            </>
        )
    }

    const ephemeralChallenge = () => {

        return (
            <>
                {project !== null ? (
                    <HelmetProvider>
                        <Helmet>
                            <title>{project !== null ? project["post_title"] : "Challenge"}</title>
                            <meta property="og:title" content={project !== null ? project["post_title"]: "Challenge"} data-rh="true"/>
                            <meta property="og:description" content={project !== null ? project["description"] : "Description"} data-rh="true"/>
                            <meta property="og:image" content={project !== null ? config.rootPath + project["thumbnail"] : alternativeImage} data-rh="true"/>
                        </Helmet>
                    </HelmetProvider>
                ) : (
                    <HelmetProvider>
                        <Helmet>
                            <title>{project !== null ? project["post_title"] : "Challenge"}</title>
                            <meta property="og:image" content={project !== null ? config.rootPath + project["thumbnail"] : alternativeImage} data-rh="true"/>
                        </Helmet>
                    </HelmetProvider>
                )}
                {embedded ? <div style={{ paddingTop: "25px" }} /> : <></>}
                <Typography variant="h5" component="div" sx={styles.projectName}>
                    {projectName}
                    {project !== null && project["post_type_string"] && (
                        <Chip
                            label={project["post_type_string"]}
                            color="primary"
                            variant="outlined"
                            sx={{ marginLeft: "20px", marginTop: "5px" }}
                            icon={getProjectIcon(project["post_type_string"])}
                        />
                    )}
                </Typography>
                {window.innerWidth > 1000 ? (
                    <div style={project !== null ? {} : {marginBottom: "110px"}}>
                        {ephemeralTabBar()}
                    </div>
                ) : (
                    <div style={{marginTop: "25px"}}>
                        {project !== null ? (
                            <Typography component={"div"} sx={{width: "90%",
                                height: "auto",
                                display: "flex",
                                flexDirection: "row"}}>
                                <Typography style={{display: "flex", flexDirection: "row", width: "85%"}}>
                                    <div>
                                        <UserIcon
                                            userId={project !== null ? project["author_id"] : ""}
                                            userTier={project !== null ? project["tier"] : ""}
                                            userThumb={project !== null ? config.rootPath + "/static/user/pfp/" + project["author_id"] : ""}
                                            backgroundName={project !== null ? project["name"] : null}
                                            backgroundPalette={project !== null ? project["color_palette"] : null}
                                            backgroundRender={project !== null ? project["render_in_front"] : null}
                                            size={50}
                                            imageTop={2}
                                        />
                                    </div>
                                    <Typography variant="h5" component="div">
                                        {project !== null ? project["author"] : ""}
                                    </Typography>
                                </Typography>
                                <Typography variant="body1" color="text.primary" align="right">
                                    {new Date(project !== null ? project["created_at"] : "").toLocaleString("en-us", {day: '2-digit', month: 'short', year: 'numeric'})}
                                </Typography>
                            </Typography>
                        ) : (
                            <Typography component={"div"} sx={{width: "90%",
                                height: "auto",
                                display: "flex",
                                flexDirection: "row"}}>
                                <Typography style={{display: "flex", flexDirection: "row", width: "85%"}}>
                                    <div>
                                        <PersonIcon sx={{width: "50px", height: "50px"}}/>
                                    </div>
                                </Typography>
                                <StyledDiv style={{height: "24px", width: "40%", marginBottom: "12px", borderRadius: "20px", marginTop: "10px"}}/>
                            </Typography>
                        )}
                    </div>
                )}
                <div style={window.innerWidth > 1000 ? {
                    marginTop: "60px",
                    ...(thread && {
                        display: "flex",
                        flexDirection: "row"
                    })
                } : {
                    ...(thread && {
                        display: "flex",
                        flexDirection: "row"
                    })
                }}>
                    <div style={thread ? { display: "flex", justifyContent: "left", paddingTop: "2%", paddingLeft: "5px" } : window.innerWidth > 1000 ? { display: "flex", justifyContent: "center", paddingTop: "2%" } : { display: "flex", justifyContent: "center", paddingTop: "2%", marginBottom: "150px" }}>
                        {mainTab === "discussions" ? (
                            <Box
                                sx={window.innerWidth > 1000 ? {
                                    width: '80vw',
                                    backgroundColor: theme.palette.background.paper,
                                    borderRadius: 3,
                                    p: 3,
                                    height: "auto",
                                    border: 1,
                                    borderColor: theme.palette.primary.dark + "75",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);"
                                } : {
                                    width: '80vw',
                                    backgroundColor: theme.palette.background.paper,
                                    borderRadius: 3,
                                    p: 3,
                                    height: "100%",
                                    border: 1,
                                    borderColor: theme.palette.primary.dark + "75",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);"
                                }}
                            >
                                {mainTabHtml()}
                            </Box>
                        ) : (
                            mainTabHtml()
                        )}
                    </div>
                    {thread ? (
                        <div style={{ display: "flex", justifyContent: "right", paddingTop: "2%", paddingLeft: "1vw" }}>
                            <Box
                                sx={{
                                    width: '18vw',
                                    bgcolor: 'background2.default',
                                    color: 'text.primary',
                                    borderRadius: 1,
                                    p: 3,
                                    height: "68vh",
                                }}
                            >
                                {threadTab()}
                            </Box>
                        </div>
                    ) : (
                        <div />
                    )}
                </div>
                {/* add a 10vh buffer at the end of the page */}
                <div style={{height: "10vh"}}/>
            </>
        )
    }

    useEffect(() => {
        setShouldRenderCaptcha(true);
    }, []);

    const MemoCaptcha = React.useMemo(() => (
        <CaptchaPage
            setIsCaptchaVerified={(verified) => setIsCaptchaVerified(verified)}
            redirectOnFailure={() => {
                // redirect to this page but with no share query param
                navigate(window.location.pathname, {replace: true});
            }}
        />
    ), [])

    if (shouldRenderCaptcha && !isCaptchaVerified && isEphemeral && !loggedIn && queryParams.get("share") !== null) {
        return (
            <>
                {MemoCaptcha}
            </>
        )
    }

    return (
        <div style={{ overflow: "hidden" }}>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    {isEphemeral ? ephemeralChallenge() : userChallenge()}
                </CssBaseline>
            </ThemeProvider>
        </div>
    );
}

export default Challenge;