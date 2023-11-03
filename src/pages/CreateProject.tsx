import * as React from "react";
import { SyntheticEvent, useEffect } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    createTheme,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Modal,
    PaletteMode,
    Popover,
    Select,
    Switch,
    TextField,
    ThemeProvider,
    Tooltip,
    Typography
} from "@mui/material";
import { getAllTokens } from "../theme";
import darkImageUploadIcon from "../img/dark_image_upload2.svg";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import ReactGA from "react-ga4";
import {
    clearProjectState,
    CreateProjectStateUpdate,
    initialCreateProjectStateUpdate,
    selectActiveState,
    selectChallengeType,
    selectCreateWorkspaceConfig,
    selectCustomWorkspaceConfigContent,
    selectDescription,
    selectEvaluation,
    selectExclusiveDescription,
    selectLanguage,
    selectName,
    selectPrice,
    selectProject,
    selectSection,
    selectTags,
    selectTier,
    selectVisibility,
    selectWorkspaceConfig,
    updateCreateProjectState
} from "../reducers/createProject/createProject";
import { programmingLanguages } from "../services/vars";
import { TaskAlt } from "@mui/icons-material";
import call from "../services/api-call";
import config from "../config";
import { LoadingButton } from "@mui/lab";
import Post from "../models/post";
import { useNavigate } from "react-router-dom";
import { DefaultWorkspaceConfig, Workspace, WorkspaceConfig } from "../models/workspace";
import {
    initialAuthStateUpdate,
    selectAuthStateRole,
    selectAuthStateTutorialState,
    selectAuthStateUserName,
    updateAuthState
} from "../reducers/auth/auth";
import Tag from "../models/tag";
import swal from "sweetalert";
import WorkspaceConfigEditor from "../components/editor/workspace_config/editor";
import XpPopup from "../components/XpPopup";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Slider from '@mui/material/Slider';
import CardTutorial from "../components/CardTutorial";
import styled from "@emotion/styled";


function CreateProject() {
    // initialize navigation access
    let navigate = useNavigate();

    // retrieve theme from local storage
    let userPref = localStorage.getItem('theme')

    // configure theme
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const TutorialGenerateImageButton = styled(LoadingButton)`
      animation: tutorialAuraEffect 2s infinite alternate;
    
      @keyframes tutorialAuraEffect {
        0% {
          box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${theme.palette.primary.main}, 0 0 20px ${theme.palette.primary.main}, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main} 0 0 35px ${theme.palette.primary.main};
        }
        100% {
          box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main}, 0 0 40px ${theme.palette.primary.main}, 0 0 50px ${theme.palette.primary.main};
        }
      }
    `;

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

    const tutorialState = useAppSelector(selectAuthStateTutorialState)
    const [runTutorial, setRunTutorial] = React.useState(!tutorialState.create_project)
    const [stepIndex, setStepIndex] = React.useState(0)

    // initialize redux states
    const dispatch = useAppDispatch();
    const reduxActiveState = useAppSelector(selectActiveState);
    const reduxNameState = useAppSelector(selectName);
    const reduxDescriptionState = useAppSelector(selectDescription);
    const reduxEvaluationState = useAppSelector(selectEvaluation);
    const reduxPriceState = useAppSelector(selectPrice);
    const reduxVisibilityState = useAppSelector(selectVisibility);
    const reduxTierState = useAppSelector(selectTier);
    const reduxTagsState = useAppSelector(selectTags);
    const reduxChallengeTypeState = useAppSelector(selectChallengeType);
    const reduxLanguageState = useAppSelector(selectLanguage);
    const reduxSectionState = useAppSelector(selectSection);
    const reduxExclusiveDescriptionState = useAppSelector(selectExclusiveDescription);
    const reduxProjectState = useAppSelector(selectProject);
    const reduxWorkspaceConfig = useAppSelector(selectWorkspaceConfig);
    const reduxCustomWorkspaceConfigContent = useAppSelector(selectCustomWorkspaceConfigContent);
    const reduxCreateWorkspaceConfig = JSON.stringify(selectCreateWorkspaceConfig);
    const username = useAppSelector(selectAuthStateUserName);

    const status = useAppSelector(selectAuthStateRole);

    let exclusiveProject = window.sessionStorage.getItem('exclusiveProject')

    ReactGA.initialize("G-38KBFJZ6M6");

    // this enables us to push tutorial restarts from the app wrapper down into this page
    useEffect(() => {
        if (tutorialState.create_project === !runTutorial) {
            return
        }
        setRunTutorial(!tutorialState.create_project)
    }, [tutorialState])

    // create state hooks for createProjectForm values via redux
    const [createProjectForm, setCreateProjectForm] = React.useState(
        (reduxActiveState)
            ?
            {
                name: reduxNameState,
                description: reduxDescriptionState,
                tier: reduxTierState,
                tags: reduxTagsState,
                thumbnail: null,
                challengeType: reduxChallengeTypeState,
                challengeDescription: reduxDescriptionState,
                evaluation: reduxEvaluationState,
                price: reduxPriceState,
                languages: reduxLanguageState,
                workspaceConfig: reduxWorkspaceConfig !== null ? reduxWorkspaceConfig : {
                    _id: "0",
                    title: "Default",
                    content: DefaultWorkspaceConfig,
                    description: "Default workspace configuration provided by GIGO."
                } as WorkspaceConfig,
                customWorkspaceContent: reduxCustomWorkspaceConfigContent,
                createWorkspaceConfig: reduxCreateWorkspaceConfig,
                exclusiveDescription: reduxExclusiveDescriptionState,
                visibility: reduxVisibilityState
            }
            :
            {
                name: '',
                description: '',
                tier: -1,
                tags: [],
                thumbnail: null,
                challengeType: -1,
                challengeDescription: '',
                languages: [],
                workspaceConfig: {
                    _id: "0",
                    title: "Default",
                    content: DefaultWorkspaceConfig,
                    description: "Default workspace configuration provided by GIGO."
                } as WorkspaceConfig,
                customWorkspaceContent: {
                    _id: "-1",
                    title: "Custom",
                    content: DefaultWorkspaceConfig,
                } as WorkspaceConfig,
                createWorkspaceConfig: false,
                evaluation: null,
                price: null,
                exclusiveDescription: null,
                visibility: false
            }
    )

    let [project, setProject] = React.useState<Post | null>(null);

    // create state hooks for layout based state changes
    const [section, setSection] = React.useState<number>(reduxSectionState === null ? 0 : reduxSectionState)

    const [challengeExplanationAnchor, setChallengeExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const challengeExplanationPopoverOpen = Boolean(challengeExplanationAnchor);

    const [tierExplanationAnchor, setTierExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const tierExplanationPopoverOpen = Boolean(tierExplanationAnchor);

    const [languageExplanationAnchor, setLanguageExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const languageExplanationPopoverOpen = Boolean(languageExplanationAnchor);

    const [evaluationExplanationAnchor, setEvaluationExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const evaluationExplanationPopoverOpen = Boolean(evaluationExplanationAnchor);

    const [exclusiveDescriptionAnchor, setExclusiveDescriptionAnchor] = React.useState<HTMLElement | null>(null);
    const exclusiveDescriptionPopoverOpen = Boolean(exclusiveDescriptionAnchor);

    const [priceExplanationAnchor, setPriceExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const priceExplanationPopoverOpen = Boolean(priceExplanationAnchor);

    const [tagsExplanationAnchor, setTagsExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const tagsExplanationPopoverOpen = Boolean(tagsExplanationAnchor);

    const [wsCfgTemplateExplanationAnchor, setWsCfgTemplateExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const wsCfgTemplateExplanationPopoverOpen = Boolean(wsCfgTemplateExplanationAnchor);

    const [visibilityExplanationAnchor, setVisibilityExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const visibilityExplanationPopoverOpen = Boolean(visibilityExplanationAnchor);

    const [changeLock, setChangeLock] = React.useState<boolean>(false);
    const [confirmProjectCreate, setConfirmProjectCreate] = React.useState<boolean>(false);

    const [tagOptions, setTagOptions] = React.useState<Tag[]>([])
    const [bsTags, setBsTags] = React.useState<boolean>(false)

    const [xpData, setXpData] = React.useState(null)

    const [prompt, setPrompt] = React.useState(createProjectForm.name || "");
    const [promptError, setPromptError] = React.useState<string>("")
    const [genOpened, setGenOpened] = React.useState<boolean>(false);
    const [genImageId, setGenImageId] = React.useState<string>("");
    const [imageGenLoad, setImageGenLoad] = React.useState<boolean>(false)
    const [genLimitReached, setGenLimitReached] = React.useState<boolean>(false);
    const [genLimitTimeout, setGenLimitTimeout] = React.useState<NodeJS.Timeout>()

    const [visibility, setVisibility] = React.useState(false)
    const [showPopupConnect, setShowPopupConnect] = React.useState(false)
    const [connectedAccountLink, setConnectedAccount] = React.useState(null)

    const wsConfigOptionsBaseState = [
        {
            _id: "0",
            title: "Default",
            content: DefaultWorkspaceConfig,
            description: "Default workspace configuration provided by GIGO."
        } as WorkspaceConfig,
        createProjectForm.customWorkspaceContent
    ]
    const [wsConfigOptions, setWsConfigOptions] = React.useState<WorkspaceConfig[]>(wsConfigOptionsBaseState)

    // create state hook for thumbnail up
    const [thumbnail, setThumbnail] = React.useState<string | null>(null);

    // create styles that will be used for CSS
    const styles = {
        themeButton: {
            display: "flex",
            justifyContent: "right"
        },
        createAccount: {
            display: "flex",
            marginLeft: "auto",
            marginTop: "3vh",
            paddingLeft: "40%",
            fontSize: "200%"
        },
        textField: {
            color: `text.secondary`
        },
        card: {
            width: "75vw",
            height: "auto",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "5vh",
            borderRadius: 1,
            paddingBottom: "5vh",
            marginBottom: "5vh",
            backgroundColor: "transparent",
            backgroundImage: "none",
            border: `1px solid ${theme.palette.primary.dark}75`,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);"
        },
        tutorialHeader: {
            fontSize: "1rem",
        },
        tutorialText: {
            fontSize: "0.7rem",
        }
    };

    // constants and types for the languages state multi-select
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    window.addEventListener('beforeunload', (event) => {
        if (window.location.href.includes('create-challenge')) {
            window.sessionStorage.setItem('exclusiveProject', "false")
            updateSectionState(0)
        }
    });

    /**
     * Clear local and redux state entirely
     */
    const clearState = () => {
        dispatch(clearProjectState())
        setCreateProjectForm({
            name: '',
            description: '',
            tier: -1,
            tags: [],
            thumbnail: null,
            challengeType: -1,
            challengeDescription: '',
            languages: [],
            workspaceConfig: {
                _id: "0",
                title: "Default",
                content: DefaultWorkspaceConfig,
                description: "Default workspace configuration provided by GIGO."
            } as WorkspaceConfig,
            customWorkspaceContent: {
                _id: "-1",
                title: "Custom",
                content: DefaultWorkspaceConfig,
            } as WorkspaceConfig,
            createWorkspaceConfig: false,
            evaluation: null,
            price: null,
            exclusiveDescription: null,
            visibility: false
        });
        setProject(null);
    }

    /**
     * Performs state update for section state using local state hooks and relays the updates to the redux storage
     */
    const updateSectionState = (state: number) => {
        // deep copy initial update state
        let updateState = Object.assign({}, initialCreateProjectStateUpdate)

        // update section
        updateState.section = state

        // execute local state hook
        setSection(state)

        // update redux storage with new state
        dispatch(updateCreateProjectState(updateState))
    }

    /**
     * Performs state updates for local state hooks and relays the updates to the redux storage
     */
    const updateFormState = (state: CreateProjectStateUpdate) => {
        // deep copy createProjectForm to local state copy to augment the local stat
        let formUpdate = Object.assign({}, createProjectForm);

        // conditionally update each field in the createProjectForm state depending on which values were passed

        if (state.name !== null) {
            formUpdate.name = state.name;
        }

        if (state.description !== null) {
            formUpdate.description = state.description;
        }

        if (state.languages !== null) {
            formUpdate.languages = state.languages;
        }

        if (state.challengeType !== null) {
            formUpdate.challengeType = state.challengeType;
        }

        if (state.tags !== null) {
            formUpdate.tags = state.tags;
        }

        if (state.tier !== null) {
            formUpdate.tier = state.tier;
        }

        if (state.thumbnail !== null) {
            // @ts-ignore
            formUpdate.thumbnail = state.thumbnail;
            state.thumbnail = null;
        }

        if (state.workspaceConfig !== null) {
            formUpdate.workspaceConfig = state.workspaceConfig;
        }

        if (state.customWorkspaceConfigContent !== null) {
            formUpdate.customWorkspaceContent = state.customWorkspaceConfigContent;
        }

        if (state.createWorkspaceConfig !== null) {
            formUpdate.createWorkspaceConfig = state.createWorkspaceConfig;
        }

        if (state.evaluation !== null) {
            formUpdate.evaluation = state.evaluation;
        }

        if (state.price !== null) {
            formUpdate.price = state.price;
        }

        // execute local state update with the createProjectForm update
        setCreateProjectForm(formUpdate);

        // mark state as active since we are updating it
        state.active = true;

        // update redux storage with new state
        dispatch(updateCreateProjectState(state));
    }

    /**
     * Handles a search for tags given a query string via the remote GIGO servers
     */
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

    useEffect(() => {
        setVisibility(createProjectForm.visibility)
        if (exclusiveProject === "true") {
            setSection(-1)
        }
    }, [])


    /**
     * Handles a search for workspace configs given a query string via the remote GIGO servers
     */
    const handleWorkspaceConfigSearch = async (e: any) => {
        if (e === null) {
            return
        }

        if (typeof e.target.value !== "string") {
            return
        }

        let res = await call(
            "/api/search/workspaceConfigs",
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

        if (res["workspace_configs"] === undefined) {
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

        // extract workspace configs from response
        let workspaceConfigs = res["workspace_configs"];

        // iterate over workspace configs loading the full tag data for each tags id from the responses
        for (let i = 0; i < workspaceConfigs.length; i++) {
            // create array to hold full tags
            let fullTags = []

            // iterate over tag ids in tag loading the full tags from the response
            for (let j = 0; j < workspaceConfigs[i].tags.length; j++) {
                // skip if tag doesn't exit
                if (res["tags"][workspaceConfigs[i].tags[j]] === undefined) {
                    continue
                }
                fullTags.push(res["tags"][workspaceConfigs[i].tags[j]])
            }

            // assign full tags to workspace
            workspaceConfigs[i].fullTags = fullTags
        }

        let wsConfigOption = [
            ...wsConfigOptionsBaseState,
            ...workspaceConfigs
        ]

        setWsConfigOptions(wsConfigOption)
    }

    const createProjectCallback = async (res: any) => {

        if (res === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            setChangeLock(false);
            return;
        }

        if (res["message"] === "config is not the right format") {
            //@ts-ignore
            swal("Cannot Edit Config", "Sorry, the config is not the right format. Please try again.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "version must be 0.1") {
            //@ts-ignore
            swal("Cannot Edit Config", "Version must be 0.1.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "must have a base container") {
            //@ts-ignore
            swal("Cannot Edit Config", "You must include a base container.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "must have a working directory") {
            //@ts-ignore
            swal("Cannot Edit Config", "You must include a working directory.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "must provide cpu cores") {
            //@ts-ignore
            swal("Cannot Edit Config", "You must configure up to 6 cpu cores.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "must provide memory") {
            //@ts-ignore
            swal("Cannot Edit Config", "You must configure up to 8 GB of memory.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "must provide disk") {
            //@ts-ignore
            swal("Cannot Edit Config", "You must configure up to 100 GB of disk space.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "cannot use more than 6 CPU cores") {
            //@ts-ignore
            swal("Cannot Edit Config", "Cannot use more than 6 CPU cores.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "cannot use more than 8 GB of RAM") {
            //@ts-ignore
            swal("Cannot Edit Config", "Cannot use more than 8 GB of RAM.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "cannot use more than 100 GB of disk space") {
            //@ts-ignore
            swal("Cannot Edit Config", "Cannot use more than 100 GB of disk space.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "failed to locate repo") {
            //@ts-ignore
            swal("Cannot Edit Config", "Sorry, there was an internal error. Let us look into that for you as soon as possible.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "failed to retrieve file from repo") {
            //@ts-ignore
            swal("Cannot Edit Config", "Sorry, there was an internal error. Let us look into that for you as soon as possible.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "failed to update the workspace config in repo") {
            //@ts-ignore
            swal("Cannot Edit Config", "Sorry, there was an internal error. Let us look into that for you as soon as possible.", "error");
            setChangeLock(false)
            return
        } else if (res["message"] === "You must have your stripe connected account setup.") {
            //@ts-ignore
            swal("You cannot make exclusive content", "You must go to account settings and setup your connected account for exclusive content before making any", "error");
            setChangeLock(false)
            return
        } else if (res["message"].includes("https://connect.stripe.com")) {
            setShowPopupConnect(true)
            setConnectedAccount(res["message"])
        }

        if (res["message"] !== "Project has been created.") {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    (res["message"] !== "internal server error occurred") ?
                        res["message"] :
                        "An unexpected error has occurred. We're sorry, we'll get right on that!"
                );
            setChangeLock(false);
            return;
        }


        // clear redux state
        dispatch(clearProjectState());
        // clear local project form state
        setCreateProjectForm({
            name: '',
            description: '',
            tier: -1,
            tags: [],
            thumbnail: null,
            challengeType: -1,
            challengeDescription: '',
            languages: [],
            workspaceConfig: {
                _id: "0",
                title: "Default",
                content: DefaultWorkspaceConfig,
                description: "Default workspace configuration provided by GIGO."
            } as WorkspaceConfig,
            customWorkspaceContent: {
                _id: "-1",
                title: "Custom",
                content: DefaultWorkspaceConfig,
            } as WorkspaceConfig,
            createWorkspaceConfig: false,
            evaluation: null,
            price: null,
            exclusiveDescription: null,
            visibility: false
        });

        // update project state
        setProject(res["project"]);

        // update redux state with project and section
        let reduxState = Object.assign({}, initialCreateProjectStateUpdate)
        reduxState.project = res["project"]
        reduxState.section = 3
        dispatch(updateCreateProjectState(reduxState))

        // unlock page and change sections
        setChangeLock(false);
        setSection(3);


        setXpData(res["xp"])

        // window.sessionStorage.setItem("createXP", JSON.stringify(res["xp"]))
    }

    /**
     * Creates project on via the remote GIGO server and updates the local & redux state
     */
    const createProject = async () => {
        // set change lock
        setChangeLock(true)

        // create base params
        let params = {
            name: createProjectForm.name,
            description: createProjectForm.description,
            tags: createProjectForm.tags,
            challenge_type: createProjectForm.challengeType,
            tier: (createProjectForm.tier !== -1) ? createProjectForm.tier : 0,
            languages: createProjectForm.languages,
            workspace_config_id: createProjectForm.workspaceConfig._id,
            workspace_config_revision: createProjectForm.workspaceConfig.revision === undefined ? 0 : createProjectForm.workspaceConfig.revision,
        } as object


        // conditionally add content for workspace config
        if (createProjectForm.workspaceConfig._id === "-1" || createProjectForm.workspaceConfig._id === "0") {
            // @ts-ignore
            params["workspace_config_content"] = createProjectForm.workspaceConfig.content
        }

        // conditionally add the parameters for creating a new template
        if (createProjectForm.createWorkspaceConfig) {
            // @ts-ignore
            params["workspace_config_title"] = createProjectForm.workspaceConfig.title
            // @ts-ignore
            params["workspace_config_desc"] = createProjectForm.workspaceConfig.description
            // @ts-ignore
            params["workspace_config_tags"] = createProjectForm.workspaceConfig.fullTags
            // @ts-ignore
            params["workspace_config_languages"] = createProjectForm.workspaceConfig.languages
            // @ts-ignore
            params["workspace_config_create"] = true
        }

        if (status.toString() === "1" && visibility === true) {
            //@ts-ignore
            params["project_visibility"] = 1
        }


        if (createProjectForm.challengeType === 2) {
            if (createProjectForm.evaluation === null || createProjectForm.evaluation === "") {
                //@ts-ignore
                params["workspace_evaluation"] = "Provide a more efficient solution."
            } else {
                //@ts-ignore
                params["workspace_evaluation"] = createProjectForm.evaluation
            }
        }

        if (createProjectForm.price !== null && createProjectForm.price !== 0) {
            //@ts-ignore
            params["project_cost"] = createProjectForm.price.toString()
        }

        if (createProjectForm.evaluation !== null && createProjectForm.evaluation !== "") {
            //@ts-ignore
            params["exclusive_description"] = createProjectForm.evaluation
        }


        // execute api call to remote GIGO server to create project
        if (genImageId !== null && genImageId !== "") {
            //@ts-ignore
            params["gen_image_id"] = genImageId

            let res = await call(
                "/api/project/create",
                "post",
                null,
                null,
                null,
                // @ts-ignore
                params
            )

            createProjectCallback(res)
        } else {
            let res = await call(
                "/api/project/create",
                "post",
                null,
                null,
                null,
                // @ts-ignore
                params,
                createProjectForm.thumbnail,
                config.rootPath,
                createProjectCallback
            )

            if (res === undefined) {
                if (sessionStorage.getItem("alive") === null)
                    //@ts-ignore
                    swal(
                        "Server Error",
                        "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                    );
                setChangeLock(false);
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
                setChangeLock(false);
                return;
            }
        }
    }

    /**
     * Launches a workspace for a newly created challenge
     */
    const launchWorkspace = async () => {
        if (project == null) {
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
                "repo": project.repo_id,  // available in attempt or project
                "code_source_id": project._id,  // pass id of attempt or project
                "code_source_type": 0, // 0 for project - 1 for attempt
            }
        )

        // handle failed call
        if (res === undefined || res["message"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We can't get in touch with the server... Sorry about that! We'll get working on that right away!"
                );
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
            return
        }


        let workspace: Workspace = res["workspace"]

        // clear state before we exit
        clearState()

        // route to workspace page
        navigate(`/launchpad/${workspace._id}`)
    }

    const generateImage = async () => {
        if (thumbnail !== null || prompt === "")
            return false

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
            // clear existing timeout if it exists
            if (genLimitTimeout)
                clearTimeout(genLimitTimeout)
            // create timeout to unset genlimitreached after 5 mintues
            setGenLimitTimeout(
                setTimeout(() => {
                    if (genLimitTimeout)
                        clearTimeout(genLimitTimeout)
                    setGenLimitReached(false)
                    setGenLimitTimeout(undefined)
                }, 300000)
            )
            swal(
                "Generation Limit Reached",
                "You've generated too many images... Cool off for 5 minutes or create a project to generate more images."
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
                    setThumbnail(e.target.result);
                    setImageGenLoad(false)
                }
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                // fallback on browser loading
                setThumbnail(config.rootPath + "/api/project/tempGenImage/" + id)
                setImageGenLoad(false)
            });

        setGenImageId(id)

        return true
    }

    React.useEffect(() => {
        console.log("thumbnail : " + thumbnail);
    }, [thumbnail]);

    /**
     * loadFileToThumbnailImage
     * Reads the input image file using a FileReader and saves the image as a data url in
     * the thumbnailSource state variable
     * @params {File} file File that will be loaded into the Image
     */
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

            // send data url to image src
            setThumbnail(e.target.result);
        }

        try {
            // execute file reader
            reader.readAsDataURL(clonedFile);
        } catch (e) {
            console.log("ERROR: failed to read thumbnail: ", e);
        }
    }

    const handleGenClickOpen = () => {
        setPrompt(createProjectForm.name)
        setGenOpened(true);
    };

    const handleGenClose = () => {
        setGenOpened(false);
        if (prompt !== createProjectForm.name) {
            setPrompt("");
        }
    };

    const handleRemoveImage = () => {
        setThumbnail(null);
        if (prompt !== createProjectForm.name) {
            setPrompt("");
        }
    };

    const handleGenSubmit = () => {
        let promptLength = prompt.length;
        if (promptLength === 0) {
            setPromptError("You must enter a prompt");
        } else if (promptLength < 3) {
            setPromptError("Your prompt must be at least 3 characters long");
        } else {
            setGenOpened(false);
            setPromptError("");
            if (prompt !== createProjectForm.name) {
                setPrompt("");
            }
            setImageGenLoad(true)
            generateImage().then((ok) => {
                if (!ok)
                    setImageGenLoad(false)
            })
        }
    };


    /**
     * Render the prompt popup for generating a image
     */
    let renderGenImagePopup = () => {
        return (
            <Dialog open={genOpened} onClose={handleGenClose}>
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
            </Dialog>
        )
    }


    /**
     * Render the Challenge Type Explanation Popover
     */
    let renderChallengeTypeExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={challengeExplanationPopoverOpen ? 'challenge-type-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setChallengeExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={() => {
                        setChallengeExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        mt: 1
                    }}
                >
                    <InfoOutlinedIcon sx={{ height: 14, width: 14 }} /> Learn more about Challenge Types
                </Typography>
                <Popover
                    id="challenge-type-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={challengeExplanationPopoverOpen}
                    anchorEl={challengeExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={() => {
                        setChallengeExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            GIGO utilizes a class system for challenges, which allows users to quickly identify the
                            type of challenge they are attempting. This class system is broken into four distinct
                            categories: Interactive, Playground, Casual, Debug and Competitive. Each category has its own set
                            of criteria that must be met by the author in order to meet the classification standards.
                        </div>
                        <ul>
                            <li>
                                <strong style={{
                                    fontSize: 12,
                                    fontWeight: "bold",
                                }}
                                >
                                    Interactive
                                </strong>
                                <br />
                                <div style={{
                                    fontSize: 12,
                                    textOverflow: "wrap"
                                }}>
                                    Interactive Challenges provide users with a comprehensive learning experience.
                                    Through the platform's tutorial plugin integration, we offer guided instruction to
                                    help users develop their coding skills while they work on the challenge. With this
                                    approach, our challenges give users access to an educational experience similar to
                                    what is offered in online programming courses.
                                </div>
                            </li>
                            <li>
                                <strong style={{
                                    fontSize: 12,
                                    fontWeight: "bold",
                                }}
                                >
                                    Playground
                                </strong>
                                <br />
                                <div style={{
                                    fontSize: 12,
                                    textOverflow: "wrap"
                                }}>
                                    Playground Challenges are the perfect place to experiment and explore new ideas,
                                    frameworks, styles and other programming related concepts. These challenges are
                                    designed to be low-barrier for users who want to test out different approaches
                                    without affecting their rank or score.
                                </div>
                            </li>
                            <li>
                                <strong style={{
                                    fontSize: 12,
                                    fontWeight: "bold",
                                }}
                                >
                                    Casual
                                </strong>
                                <br />
                                <div style={{
                                    fontSize: 12,
                                    textOverflow: "wrap"
                                }}>
                                    Casual challenges are designed to give users an opportunity to test their
                                    skills without the pressure of affecting their rank. These challenges provide a
                                    thorough evaluation metric similar to that of Competitive Challenges, allowing
                                    users the chance to practice and prepare for more competitive levels while still
                                    enjoying a rigorous challenge.
                                </div>
                            </li>
                            <li>
                                <strong style={{
                                    fontSize: 12,
                                    fontWeight: "bold",
                                }}
                                >
                                    Competitive
                                </strong>
                                <br />
                                <div style={{
                                    fontSize: 12,
                                    textOverflow: "wrap"
                                }}>
                                    Competitive Challenges will help hone your coding skills and improve your rank.
                                    These challenging tasks are designed with difficulty levels tailored to the user's
                                    tier, and each task is evaluated against a comprehensive set of metrics defined by
                                    the author. With Competitive Challenges, you can test yourself against other users
                                    and strive for higher rankings on the platform!
                                </div>
                            </li>
                            <li>
                                <strong style={{
                                    fontSize: 12,
                                    fontWeight: "bold",
                                }}
                                >
                                    Debug
                                </strong>
                                <br />
                                <div style={{
                                    fontSize: 12,
                                    textOverflow: "wrap"
                                }}>
                                    Debug Challenges will help sharpen your debugging skills. These projects are designed
                                    similar to casual, with most of the code being done, but with bugs sprinkled in.
                                    Strengthen your ability to track back and find bugs. Learn how to test the most important tool in a developer's arsenal.
                                </div>
                            </li>
                        </ul>
                    </div>
                </Popover>
            </div>
        )
    }

    /**
     * Render the Tier Type Explanation Popover
     */
    let renderTierTypeExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={tierExplanationPopoverOpen ? 'tier-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setTierExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setTierExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        mt: 1
                    }}
                >
                    <InfoOutlinedIcon sx={{ height: 14, width: 14 }} /> Learn more about Renowns
                </Typography>
                <Popover
                    id="tier-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={tierExplanationPopoverOpen}
                    anchorEl={tierExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setTierExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            Renown is a skill tier system that allows users to gauge their proficiency on the platform.
                            It is determined by the number of challenges completed and serves as an indicator for other
                            attempters regarding their proficiency in code development. With each challenge successfully
                            completed, users can progress through different tiers of Renown, allowing them to gain
                            recognition within the community while also helping others determine if they are skilled
                            enough to attempt certain challenges.
                            <ul>
                                <li>
                                    <strong style={{
                                        fontSize: 12,
                                        fontWeight: "bold",
                                    }}
                                    >
                                        Renown 1
                                    </strong>
                                    <br />
                                    <div style={{
                                        fontSize: 12,
                                        textOverflow: "wrap"
                                    }}>
                                        Renown 1 is the entry-level tier of developers on our code development platform.
                                        Those who have achieved Renown 1 are proficient in no programming languages,
                                        and may need interactive tutorial assistance when attempting challenges. This
                                        tier provides a great starting point for those with little to no understanding
                                        of common concepts and techniques within coding, allowing them to gradually
                                        build their skillset over time.
                                    </div>
                                </li>
                                <li>
                                    <strong style={{
                                        fontSize: 12,
                                        fontWeight: "bold",
                                    }}
                                    >
                                        Renown 4
                                    </strong>
                                    <br />
                                    <div style={{
                                        fontSize: 12,
                                        textOverflow: "wrap"
                                    }}>
                                        Renown 4 developers are experienced coders with the ability to take
                                        instructions from a senior developer and implement them in one or two
                                        programming languages. They can work independently but may require some
                                        guidance in the form of tutorials. However, compared to Renown 1, they
                                        need less verbosity when it comes to coding tasks.
                                    </div>
                                </li>
                                <li>
                                    <strong style={{
                                        fontSize: 12,
                                        fontWeight: "bold",
                                    }}
                                    >
                                        Renown 7
                                    </strong>
                                    <br />
                                    <div style={{
                                        fontSize: 12,
                                        textOverflow: "wrap"
                                    }}>
                                        Renown 7 are expected to be able to solve complex tasks with
                                        no roadmap or assistance. Challenges should focus on the object, evaluation
                                        metrics and environment rather than providing a pre-defined road map. Renown
                                        7 developers must demonstrate their ability to architect systems and develop
                                        solutions that may not have been anticipated by the challenge author. This
                                        requires an advanced level of technical expertise and problem solving skills
                                        in order for successful completion of these challenging tasks.
                                    </div>
                                </li>
                                <li>
                                    <strong style={{
                                        fontSize: 12,
                                        fontWeight: "bold",
                                    }}
                                    >
                                        Renown 10
                                    </strong>
                                    <br />
                                    <div style={{
                                        fontSize: 12,
                                        textOverflow: "wrap"
                                    }}>
                                        Renown 10 developers are the most experienced and knowledgeable on our platform.
                                        They have a deep understanding of all aspects of code development, from
                                        architecture to debugging, and can tackle any challenge that comes their way.
                                        Their expertise has been proven time and again through successful projects
                                        completed on the platform. Renown 10 developers are highly sought after for
                                        their technical skills as well as leadership capabilities; they serve as an
                                        example to other members of the community in terms of best practices for
                                        coding standards, software engineering principles, and more.
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }

    /**
     * Render the Languages Explanation Popover
     */
    let renderLanguageExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={languageExplanationPopoverOpen ? 'lang-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setLanguageExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setLanguageExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        mt: 1
                    }}
                >
                    <InfoOutlinedIcon sx={{ height: 14, width: 14 }} /> Learn more about Languages
                </Typography>
                <Popover
                    id="lang-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={languageExplanationPopoverOpen}
                    anchorEl={languageExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setLanguageExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            In order to ensure the integrity of a challenge, authors are able to specify which
                            language(s) should be used for any solutions submitted. This is an arbitrary restriction
                            that will help maintain consistency among the submissions and ensure that all attempts
                            adhere to a uniform set of standards. However, GIGO does not prevent users from using
                            source code written in other languages within their own challenge or attempt codebase -
                            it is ultimately up to each individual author as they are responsible for enforcing their
                            restrictions.
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }

    /**
     * Render the Tags Explanation Popover
     */
    let renderTagsExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={tagsExplanationPopoverOpen ? 'tags-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setTagsExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setTagsExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        mt: 1
                    }}
                >
                    <InfoOutlinedIcon sx={{ height: 14, width: 14 }} /> Learn more about Tags
                </Typography>
                <Popover
                    id="tags-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={tagsExplanationPopoverOpen}
                    anchorEl={tagsExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setTagsExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            Tags are an important part of making your challenge more discoverable and visible to other
                            users. The GIGO team has validated official tags which are marked with a checkmark, however
                            if you don't find any official tags for the concept you are tagging just type out a new tag
                            and hit enter - this will create a new user created tag that is un-official initially but
                            can be validated by the GIGO team if it is used frequently in the community.
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }

    let renderExclusiveDescriptionPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={exclusiveDescriptionPopoverOpen ? 'exclusive-description-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setExclusiveDescriptionAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setExclusiveDescriptionAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        mt: 1
                    }}
                >
                    <InfoOutlinedIcon sx={{ height: 14, width: 14 }} /> Learn more about Exclusive Content's Descriptions
                </Typography>
                <Popover
                    id="exclusive-description-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={exclusiveDescriptionPopoverOpen}
                    anchorEl={exclusiveDescriptionAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setExclusiveDescriptionAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            When creating exclusive content, you must provide a deeper description of the content that
                            others will be paying for. Explain why they should be paying for this content.
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }

    let renderEvaluationExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={evaluationExplanationPopoverOpen ? 'eval-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setEvaluationExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setEvaluationExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        mt: 1
                    }}
                >
                    <InfoOutlinedIcon sx={{ height: 14, width: 14 }} /> Learn more about Evaluation
                </Typography>
                <Popover
                    id="eval-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={evaluationExplanationPopoverOpen}
                    anchorEl={evaluationExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setEvaluationExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            When creating a casual challenge that others can attempt, you must create a rubric
                            for what it takes to have a complete attempt. This is an explanation of the goals of the
                            project and what the code must be able to successfully complete, in order for an attempt to
                            be considered successful. If you do not input an evaluation, a default evaluation will be
                            used.
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }

    let renderPriceExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={priceExplanationPopoverOpen ? 'price-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setPriceExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setPriceExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        mt: 1
                    }}
                >
                    <InfoOutlinedIcon sx={{ height: 14, width: 14 }} /> Learn more about Price
                </Typography>
                <Popover
                    id="eval-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={priceExplanationPopoverOpen}
                    anchorEl={priceExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setPriceExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            When creating a public challenge that others can attempt, you can put a price on your work.
                            If you think this challenge is worth paying money for, others can give you money for access
                            to your exclusive content.
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }

    /**
     * Render the Workspace Config Template Popover
     */
    let renderWsConfigTemplateExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={wsCfgTemplateExplanationPopoverOpen ? 'ws-cfg-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setWsCfgTemplateExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setWsCfgTemplateExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        mt: 1
                    }}
                >
                    <InfoOutlinedIcon sx={{ height: 14, width: 14 }} /> Learn more about Workspace Config Templates
                </Typography>
                <Popover
                    id="ws-cfg-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={wsCfgTemplateExplanationPopoverOpen}
                    anchorEl={wsCfgTemplateExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setWsCfgTemplateExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            Workspace configs are a great way to quickly and easily set up virtual machines for
                            development. They enable users to have consistent development environments, which is
                            essential in order to ensure that their challenges run smoothly. Furthermore, workspace
                            config templates provide an even greater convenience - they allow developers to start
                            from a pre-made configuration close to their project rather than having them write one
                            themselves from scratch. If no template fits your needs you can always use the default
                            config template which provisions an Ubuntu machine as its starting point.
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }

    /**
     * Render the Visibility Switch Popover
     */
    let renderVisibilityExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={visibilityExplanationPopoverOpen ? 'visibility-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setVisibilityExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setVisibilityExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        mt: 1
                    }}
                >
                    <InfoOutlinedIcon sx={{ height: 14, width: 14 }} /> Learn more about Private projects
                </Typography>
                <Popover
                    id="visibility-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={visibilityExplanationPopoverOpen}
                    anchorEl={visibilityExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setVisibilityExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div
                        style={{
                            width: "45vw",
                            paddingTop: "5px",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                        }}
                    >
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            Private projects are a Pro feature. Signup for pro to make a private project.
                        </div>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            Private projects are only visible to you and other users you invite to the project. This is
                            a great way to host a project that you are working on with a team, or to host a lesson for
                            a friend. Private projects are not visible to the public and cannot be attempted by other
                            users unless you invite them to the project.
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }

    /**
     * Renders the createProjectForm section selector at the top of Create Project card
     */
    let renderSectionSelection = () => {
        return (
            <div>
                <Grid container justifyContent="space-around" sx={{
                    flexGrow: 1,
                    paddingTop: "20px",
                }}>
                    {exclusiveProject === "true" ? (
                        <Grid item xs={"auto"}>
                            <Tooltip title={
                                (project !== null) ?
                                    "Challenge has been created and can no longer be modified." :
                                    "Pricing and description information about an exclusive challenge."}
                            >
                                <div>
                                    <Button
                                        disabled={project !== null}
                                        variant={(section === -1) ? "contained" : "outlined"}
                                        color="primary"
                                        onClick={() => {
                                            updateSectionState(-1)
                                        }}
                                    >
                                        0. Exclusive Content
                                    </Button>
                                </div>
                            </Tooltip>
                        </Grid>
                    ) : null}
                    <Grid item xs={"auto"}>
                        <Tooltip title={
                            (project !== null) ?
                                "Challenge has been created and can no longer be modified." :
                                "Basic information about the Challenge."}
                        >
                            <div>
                                <Button
                                    disabled={project !== null}
                                    variant={(section === 0) ? "contained" : "outlined"}
                                    color="primary"
                                    onClick={() => {
                                        updateSectionState(0)
                                    }}
                                >
                                    1. Basic Info
                                </Button>
                            </div>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={"auto"}>
                        <Tooltip title={
                            (project !== null) ?
                                "Challenge has been created and can no longer be modified." :
                                "Details about the Challenge."}
                        >
                            <div>
                                <Button
                                    disabled={project !== null}
                                    variant={(section === 1) ? "contained" : "outlined"}
                                    color="primary"
                                    onClick={() => {
                                        updateSectionState(1)
                                    }}
                                >
                                    2. Project Details
                                </Button>
                            </div>
                        </Tooltip>
                    </Grid>
                    {createProjectForm.challengeType === 2 ? (
                        <Grid item xs={"auto"}>
                            <Tooltip title={
                                (project !== null) ?
                                    "Challenge has been created and can no longer be modified." :
                                    "Evaluation of a successful attempt of the Challenge."}
                            >
                                <div>
                                    <Button
                                        disabled={project !== null}
                                        variant={(section === 2) ? "contained" : "outlined"}
                                        color="primary"
                                        onClick={() => {
                                            updateSectionState(2)
                                        }}
                                    >
                                        3. Evaluation Details
                                    </Button>
                                </div>
                            </Tooltip>
                        </Grid>
                    ) : (<div />)}
                    <Grid item xs={"auto"}>
                        <Tooltip title={
                            (project !== null) ?
                                "Challenge has been created and can no longer be modified." :
                                "Interactive editor for workspace configuration."}
                        >
                            <div>
                                <Button
                                    disabled={project !== null}
                                    variant={createProjectForm.challengeType === 2 ? (section === 3) ? "contained" : "outlined" : (section === 2) ? "contained" : "outlined"}
                                    color="primary"
                                    onClick={() => createProjectForm.challengeType === 2 ? updateSectionState(3) :
                                        updateSectionState(2)
                                    }
                                >
                                    {createProjectForm.challengeType === 2 ? "4. Workspace Config" : "3. Workspace Config"}
                                </Button>
                            </div>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={"auto"}>
                        <Tooltip title={
                            (project !== null) ?
                                "Project Created" :
                                "Project Has Not Been Created"}
                        >
                            <TaskAlt
                                fontSize={"large"}
                                color={(project !== null) ? "primary" : "disabled"}
                            />
                        </Tooltip>
                    </Grid>
                    {/*{*/}
                    {/*    (createProjectForm.challengeType === 0) ?*/}
                    {/*        (*/}
                    {/*            <Grid item xs={"auto"}>*/}
                    {/*                <Tooltip title={*/}
                    {/*                    (project === null) ?*/}
                    {/*                        "Studio for creating integrated tutorials. Challenge must be created before this can be accessed." :*/}
                    {/*                        "Studio for creating integrated tutorials."}*/}
                    {/*                >*/}
                    {/*                    <div>*/}
                    {/*                        <Button*/}
                    {/*                            disabled={project === null}*/}
                    {/*                            variant={(section === 4) ? "contained" : "outlined"}*/}
                    {/*                            color="primary"*/}
                    {/*                            onClick={() => {*/}
                    {/*                                updateSectionState(4)*/}
                    {/*                            }}*/}
                    {/*                        >*/}
                    {/*                            4. Tutorial Studio*/}
                    {/*                        </Button>*/}
                    {/*                    </div>*/}
                    {/*                </Tooltip>*/}
                    {/*            </Grid>*/}
                    {/*        )*/}
                    {/*        :*/}
                    {/*        (*/}
                    {/*            <></>*/}
                    {/*        )*/}
                    {/*}*/}
                </Grid>
            </div>
        )
    }

    let renderExclusiveInfoSection = () => {
        return (
            <div>
                <Grid container sx={{
                    float: "left",
                    marginLeft: "3.5vw",
                    paddingTop: "20px",
                }}>
                    <div
                        style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-between" }}>
                        <div style={{ width: "50%" }}>
                            <TextField
                                disabled={changeLock}
                                id={"exclusiveDescription"}
                                className={"exclusiveDescription"}
                                variant={`outlined`}
                                color={"primary"}
                                label={"Exclusive Description"}
                                required={true}
                                margin={`normal`}
                                multiline={true}
                                minRows={3}
                                maxRows={15}
                                helperText={
                                    <div>
                                        <ul>
                                            <li>What will users be learning?</li>
                                            <li>Why is your content worth the price?</li>
                                            <li>How will this information help them?</li>
                                        </ul>
                                    </div>
                                }
                                // sx={{
                                //     width: "30vw"
                                // }}
                                value={createProjectForm.exclusiveDescription}
                                onChange={(e) => {
                                    // copy initial state
                                    let updateState = Object.assign({}, initialCreateProjectStateUpdate);
                                    // update description in state update
                                    updateState.exclusiveDescription = e.target.value;
                                    // execute state update
                                    updateFormState(updateState)
                                }}
                            />
                            {renderExclusiveDescriptionPopover()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", width: "45%" }}>
                            <div>
                                <div>Price</div>
                                <Grid item xs={12}>
                                    <Slider
                                        aria-label="Always visible"
                                        defaultValue={0}
                                        style={{ height: "15px", width: "55%" }}
                                        className={"price"}
                                        value={createProjectForm.price === null ? 0 : createProjectForm.price}
                                        valueLabelDisplay={"auto"}
                                        valueLabelFormat={createProjectForm.price === null ? "0" : createProjectForm.price.toString()}
                                        min={0}
                                        size={"medium"}
                                        max={420}
                                        onChange={(e) => {
                                            // copy initial state
                                            let updateState = Object.assign({}, initialCreateProjectStateUpdate);
                                            // update description in state update
                                            //@ts-ignore
                                            updateState.price = e.target.value;
                                            // execute state update
                                            updateFormState(updateState)
                                        }}
                                    />
                                </Grid>
                                {renderPriceExplanationPopover()}
                            </div>
                            <Button
                                variant={`contained`}
                                color={"primary"}
                                sx={{
                                    width: "20vw",
                                    height: "50px",
                                    borderRadius: 1,
                                    float: "right",
                                }}
                                onClick={() => {
                                    updateSectionState(0)
                                }}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </Grid>
            </div>
        )
    }


    /**
     * Renders the `1. Basic Info` section of the Create Project card
     */
    let renderBasicInfoSection = () => {
        let GenerateImageButton: any = LoadingButton;
        if (runTutorial && stepIndex === 1 && section === 0) {
            GenerateImageButton = TutorialGenerateImageButton;
        }

        return (
            <div>
                <Grid container sx={{
                    float: "left",
                    width: "30vw",
                    marginLeft: "3.5vw",
                    paddingTop: "20px",
                }}>
                    <Grid item xs={12}>
                        <TextField
                            disabled={changeLock}
                            id={"title"}
                            variant={`outlined`}
                            color={"primary"}
                            label={"Title"}
                            required={true}
                            margin={`normal`}
                            type={`text`}
                            sx={{
                                width: "30vw",
                            }}
                            value={createProjectForm.name}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialCreateProjectStateUpdate);
                                // update name in state update
                                updateState.name = e.target.value;
                                // execute state update
                                updateFormState(updateState)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        {imageGenLoad ? (
                            <LoadingImageUploadButton
                                loading={true}
                                disabled={true}
                                sx={{
                                    width: "30vw",
                                    height: "43vh"
                                }}
                            >
                                Generating Image
                            </LoadingImageUploadButton>
                        ) : (
                            <Button
                                disabled={changeLock}
                                color={"primary"}
                                component="label"
                                variant="outlined"
                                sx={{
                                    width: "30vw",
                                    height: "43vh"
                                }}
                            >
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    {thumbnail == null || thumbnail == "" ? (
                                        <h5 style={{ color: "grey" }}>Upload Image</h5>
                                    ) : null}
                                    <img
                                        key={thumbnail}
                                        style={{
                                            height: thumbnail === null ? "30vh" : "42vh",
                                            width: "auto",
                                            maxWidth: "29.5vw",
                                            opacity: thumbnail === null ? "30%" : "100%",
                                            borderRadius: "10px"
                                        }}
                                        src={thumbnail === null ? darkImageUploadIcon : thumbnail}
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

                                        // copy initial state
                                        let updateState = Object.assign({}, initialCreateProjectStateUpdate);
                                        // update file in state update
                                        updateState.thumbnail = e.target.files[0];
                                        // execute state update
                                        updateFormState(updateState)

                                        // update state for rendering the thumbnail
                                        loadFileToThumbnailImage(e.target.files[0])
                                    }}
                                />
                            </Button>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        <Tooltip title="Generate a unique image for your project using Magic">
                            <GenerateImageButton
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
                                disabled={thumbnail !== null || genLimitReached}
                                onClick={() => {
                                    handleGenClickOpen()
                                }}
                                loading={imageGenLoad}
                            >
                                Generate Image
                            </GenerateImageButton>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                        <Tooltip title="Generate up to 10 images per 5m">
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
                                disabled={thumbnail === null}
                                onClick={() => {
                                    handleRemoveImage()
                                }}
                            >
                                Remove Image
                            </Button>
                        </Tooltip>
                    </Grid>
                    {renderGenImagePopup()}
                </Grid>
                <Grid container style={{
                    float: "right",
                    width: "30vw",
                    marginRight: "3.5vw",
                    paddingTop: "20px",
                }}>
                    <Grid item xs={12}>
                        <TextField
                            disabled={changeLock}
                            id={"description"}
                            variant={`outlined`}
                            color={"primary"}
                            label={"Description"}
                            required={true}
                            margin={`normal`}
                            multiline={true}
                            minRows={3}
                            maxRows={15}
                            sx={{
                                width: "30vw",
                            }}
                            value={createProjectForm.description}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialCreateProjectStateUpdate);
                                // update description in state update
                                updateState.description = e.target.value;
                                // execute state update
                                updateFormState(updateState)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography>Public</Typography>
                            <Switch value={visibility} checked={visibility} disabled={status.toString() !== "1"}
                                onClick={() => {
                                    // copy initial state
                                    let updateState = Object.assign({}, initialCreateProjectStateUpdate);
                                    // update description in state update
                                    updateState.visibility = !visibility;
                                    // execute state update
                                    updateFormState(updateState)
                                    setVisibility(!visibility)
                                }} />
                            <Typography>Private</Typography>
                        </div>
                        {renderVisibilityExplanationPopover()}
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant={`contained`}
                            color={"primary"}
                            sx={{
                                width: "30vw",
                                height: "50px",
                                borderRadius: 1,
                                float: "right",
                            }}
                            disabled={thumbnail === null || createProjectForm.description === "" || createProjectForm.name === ""}
                            onClick={() => {
                                updateSectionState(1)
                            }}
                        >
                            Continue
                        </Button>
                    </Grid>
                </Grid>
            </div>
        )
    }

    let renderEvaluationSection = () => {
        return (
            <div>
                <Grid container spacing={{ xs: 2, sm: 6, md: 12 }} justifyContent={"center"} alignItems={"center"}
                    sx={{ paddingTop: "5vh" }}>
                    <Grid item>
                        <TextField
                            disabled={changeLock}
                            id={"evaluation"}
                            className={"evaluation"}
                            variant={`outlined`}
                            color={"primary"}
                            label={"Evaluation"}
                            required={true}
                            margin={`normal`}
                            multiline={true}
                            minRows={3}
                            maxRows={15}
                            sx={stepIndex === 10 ? {
                                width: "30vw", zIndex: "600000"
                            } : { width: "30vw" }}
                            value={createProjectForm.evaluation}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialCreateProjectStateUpdate);
                                // update description in state update
                                updateState.evaluation = e.target.value;
                                // execute state update
                                updateFormState(updateState)
                            }}
                        />
                        {renderEvaluationExplanationPopover()}
                    </Grid>
                    <Grid item xs={"auto"}>
                        <Button
                            variant={`contained`}
                            color={"primary"}
                            sx={{
                                width: "20vw",
                                height: "50px",
                                borderRadius: 1,
                                float: "right",
                            }}
                            onClick={() => {
                                updateSectionState(3)
                            }}
                        >
                            Continue
                        </Button>
                    </Grid>
                </Grid>
            </div>
        )
    }

    /**
     * Renders the `2. Challenge Details` section of the Create Project card
     */
    let renderChallengeDetailsSection = () => {
        return (
            <div>
                <Grid container spacing={{ xs: 2, sm: 6, md: 12 }} justifyContent="space-evenly" sx={{
                    flexGrow: 1,
                    paddingTop: "5vh",
                }}>
                    <Grid item xs={"auto"}>
                        <FormControl sx={stepIndex >= 3 && stepIndex <= 8 ? { zIndex: "600000" } : {}}
                            className={'challenge'}>
                            <InputLabel id={"challengeTypeInputLabel"}>Challenge Type</InputLabel>
                            <Select
                                disabled={changeLock}
                                labelId={"challengeType"}
                                id={"challengeTypeInput"}
                                required={true}
                                value={createProjectForm.challengeType >= 0 ? createProjectForm.challengeType : 0}
                                label={"Challenge Type"}
                                sx={{
                                    width: "30vw",
                                }}
                                onChange={(e) => {
                                    // ensure type is number
                                    if (typeof e.target.value === "string") {
                                        return
                                    }

                                    // copy initial state
                                    let updateState = Object.assign({}, initialCreateProjectStateUpdate);
                                    // update name in state update
                                    updateState.challengeType = e.target.value;
                                    // execute state update
                                    updateFormState(updateState)
                                }}
                            >
                                <MenuItem value={0}>
                                    <em>Interactive</em>
                                </MenuItem>
                                <MenuItem value={1}>
                                    <em>Playground</em>
                                </MenuItem>
                                <MenuItem value={2}>
                                    <em>Casual</em>
                                </MenuItem>
                                <MenuItem value={3}>
                                    <em>Competitive</em>
                                </MenuItem>
                                <MenuItem value={4}>
                                    <em>Debug</em>
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <br />
                        {renderChallengeTypeExplanationPopover()}
                    </Grid>
                    <Grid item xs={"auto"}>
                        <FormControl sx={stepIndex === 9 ? { zIndex: "600000" } : {}} className={"renown"}>
                            <InputLabel id={"tierInputLabel"}>Challenge Renown</InputLabel>
                            <Select
                                disabled={changeLock}
                                labelId={"tierInputLabel"}
                                id={"challengeTierInput"}
                                required={true}
                                value={createProjectForm.tier >= 0 ? createProjectForm.tier : 0}
                                label={"Challenge Renown"}
                                sx={{
                                    width: "30vw",
                                }}
                                onChange={(e) => {
                                    // ensure type is number
                                    if (typeof e.target.value === "string") {
                                        return
                                    }

                                    // copy initial state
                                    let updateState = Object.assign({}, initialCreateProjectStateUpdate);
                                    // update name in state update
                                    updateState.tier = e.target.value;
                                    // execute state update
                                    updateFormState(updateState)
                                }}
                            >
                                <MenuItem value={0}>
                                    <em>Renown 1</em>
                                </MenuItem>
                                <MenuItem value={1}>
                                    <em>Renown 2</em>
                                </MenuItem>
                                <MenuItem value={2}>
                                    <em>Renown 3</em>
                                </MenuItem>
                                <MenuItem value={3}>
                                    <em>Renown 4</em>
                                </MenuItem>
                                <MenuItem value={4}>
                                    <em>Renown 5</em>
                                </MenuItem>
                                <MenuItem value={5}>
                                    <em>Renown 6</em>
                                </MenuItem>
                                <MenuItem value={6}>
                                    <em>Renown 7</em>
                                </MenuItem>
                                <MenuItem value={7}>
                                    <em>Renown 8</em>
                                </MenuItem>
                                <MenuItem value={8}>
                                    <em>Renown 9</em>
                                </MenuItem>
                                <MenuItem value={9}>
                                    <em>Renown 10</em>
                                </MenuItem>
                            </Select>
                        </FormControl>
                        {renderTierTypeExplanationPopover()}
                    </Grid>
                    <Grid item xs={"auto"}>
                        <Autocomplete
                            disabled={changeLock}
                            multiple
                            limitTags={5}
                            id="languagesInputSelect"
                            options={programmingLanguages.map((_, i) => {
                                return i
                            })}
                            getOptionLabel={(option) => programmingLanguages[option]}
                            // @ts-ignore
                            onChange={(e: SyntheticEvent, value: number[]) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialCreateProjectStateUpdate);

                                // set value for state update
                                updateState.languages = value

                                // execute state update
                                updateFormState(updateState)
                            }}
                            value={createProjectForm.languages === null ? [] : createProjectForm.languages}
                            renderInput={(params) => (
                                <TextField {...params} label="Languages" placeholder="Languages" />
                            )}
                            sx={{
                                width: "30vw",
                            }} className={"languages"}
                        />
                        {renderLanguageExplanationPopover()}
                    </Grid>
                    {/* TODO: query for real tags from server */}
                    <Grid item xs={"auto"}>
                        <Autocomplete
                            disabled={changeLock}
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
                                <TextField {...params} label="Challenge Tags" placeholder="Challenge Tags" />
                            )}
                            onInputChange={(e) => {
                                handleTagSearch(e)
                            }}
                            // @ts-ignore
                            onChange={(e: SyntheticEvent, value: Array<Tag | string>) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialCreateProjectStateUpdate);

                                // set update state tags to empty array
                                updateState.tags = [];

                                // handle any values that may be strings from user input
                                for (let i = 0; i < value.length; i++) {
                                    // append to the update state tags if this is an object
                                    if (typeof value[i] === "object") {
                                        // @ts-ignore
                                        updateState.tags.push(value[i]);
                                        continue
                                    }

                                    // wrap the value in an object with -1 for an id to mark
                                    updateState.tags.push({
                                        _id: "-1",
                                        value: value[i],
                                    } as Tag)
                                }

                                // execute state update
                                updateFormState(updateState)
                            }}
                            // @ts-ignore
                            value={createProjectForm.tags}
                            sx={{
                                width: "30vw",
                            }} className={"tags"}
                        />
                        {renderTagsExplanationPopover()}
                    </Grid>
                    <Grid item xs={"auto"}>
                        <Button
                            variant={`contained`}
                            color={"primary"}
                            sx={{
                                width: "20vw",
                                height: "50px",
                                borderRadius: 1,
                                float: "right",
                            }}
                            onClick={() => {
                                updateSectionState(2)
                            }}
                        >
                            Continue
                        </Button>
                    </Grid>
                </Grid>
            </div>
        )
    }

    /**
     * Render options for creating a new workspace template
     */
    let renderCreateWorkspaceConfig = () => {
        // return empty tag if we aren't using a custom
        if (createProjectForm.workspaceConfig._id !== "-1") {
            return (<></>)
        }

        // return button for creating a public template
        if (!createProjectForm.createWorkspaceConfig) {
            return (
                <Grid item xs={"auto"}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={
                                    typeof createProjectForm.createWorkspaceConfig === "string" ? false : createProjectForm.createWorkspaceConfig
                                }
                                onChange={() => {
                                    // copy initial state
                                    let updateState = Object.assign({}, initialCreateProjectStateUpdate);

                                    // set createWorkspaceConfig to inverse of the current value
                                    updateState.createWorkspaceConfig = !createProjectForm.createWorkspaceConfig

                                    // execute state update
                                    updateFormState(updateState)
                                }}
                            />
                        }
                        label={"Create Public Template"}
                    />
                </Grid>
            )
        }

        return (
            <>
                <Grid item xs={"auto"}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={
                                    typeof createProjectForm.createWorkspaceConfig === "string" ? false : createProjectForm.createWorkspaceConfig
                                }
                                onChange={() => {
                                    // copy initial state
                                    let updateState = Object.assign({}, initialCreateProjectStateUpdate);

                                    // set createWorkspaceConfig to inverse of the current value
                                    updateState.createWorkspaceConfig = !createProjectForm.createWorkspaceConfig

                                    // execute state update
                                    updateFormState(updateState)
                                }}
                            />
                        }
                        label={"Create Public Template"}
                    />
                </Grid>
                <Grid item xs={"auto"}>
                    <TextField
                        disabled={changeLock}
                        id={"template-title"}
                        variant={`outlined`}
                        color={"primary"}
                        label={"Template Title"}
                        required={true}
                        margin={`normal`}
                        type={`text`}
                        sx={{
                            width: "20vw",
                        }}
                        value={createProjectForm.workspaceConfig.title}
                        onChange={(e) => {
                            // copy initial state
                            let updateState = Object.assign({}, initialCreateProjectStateUpdate);

                            // create custom config
                            let cfg = Object.assign({}, createProjectForm.workspaceConfig) as WorkspaceConfig;

                            // set new title
                            cfg.title = e.target.value;

                            // update workspace config in state update
                            updateState.workspaceConfig = cfg;
                            // update custom backup state
                            updateState.customWorkspaceConfigContent = cfg;

                            // execute state update
                            updateFormState(updateState)
                        }}
                    />
                </Grid>
                <Grid item xs={"auto"}>
                    <TextField
                        disabled={changeLock}
                        id={"template-description"}
                        variant={`outlined`}
                        color={"primary"}
                        label={"Template Description"}
                        required={true}
                        margin={`normal`}
                        multiline={true}
                        minRows={3}
                        maxRows={5}
                        sx={{
                            width: "20vw",
                        }}
                        value={createProjectForm.workspaceConfig.description}
                        onChange={(e) => {
                            // copy initial state
                            let updateState = Object.assign({}, initialCreateProjectStateUpdate);

                            // create custom config
                            let cfg = Object.assign({}, createProjectForm.workspaceConfig) as WorkspaceConfig;

                            // set new description
                            cfg.description = e.target.value;

                            // update workspace config in state update
                            updateState.workspaceConfig = cfg;
                            // update custom backup state
                            updateState.customWorkspaceConfigContent = cfg;

                            // execute state update
                            updateFormState(updateState)
                        }}
                    />
                </Grid>
                <Grid item xs={"auto"}>
                    <Autocomplete
                        multiple
                        disabled={changeLock}
                        limitTags={5}
                        freeSolo={true}
                        id="wsConfigTagSearchAutocomplete"
                        options={tagOptions}
                        getOptionLabel={(option: Tag | string) => {
                            if (typeof option === "string") {
                                return option
                            }
                            return option.value
                        }}
                        isOptionEqualToValue={(option: Tag | string, value: Tag | string) => {
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
                            <TextField {...params} label="Template Tags" placeholder="Template Tags" />
                        )}
                        onInputChange={(e) => {
                            handleTagSearch(e)
                        }}
                        // @ts-ignore
                        onChange={(e: SyntheticEvent, value: Tag[] | string[]) => {
                            // copy initial state
                            let updateState = Object.assign({}, initialCreateProjectStateUpdate);

                            // create custom config
                            let cfg = Object.assign({}, createProjectForm.workspaceConfig) as WorkspaceConfig;

                            // create array to hold tags
                            let updateTags: Tag[] = [];

                            // handle any values that may be strings from user input
                            for (let i = 0; i < value.length; i++) {
                                // append to the update state tags if this is an object
                                if (typeof value[i] === "object") {
                                    // @ts-ignore
                                    updateTags.push(value[i]);
                                    continue
                                }

                                // wrap the value in an object with -1 for an id to mark
                                updateTags.push({
                                    _id: "-1",
                                    value: value[i],
                                } as Tag)
                            }

                            // set tag ids and full tags
                            cfg.fullTags = updateTags;
                            cfg.tags = updateTags.map((tag: Tag) => tag._id)

                            // update workspace config in state update
                            updateState.workspaceConfig = cfg;
                            // update custom backup state
                            updateState.customWorkspaceConfigContent = cfg;

                            // execute state update
                            updateFormState(updateState)
                        }}
                        // @ts-ignore
                        value={createProjectForm.workspaceConfig.fullTags}
                        sx={{
                            width: "20vw",
                        }}
                    />
                    {renderTagsExplanationPopover()}
                </Grid>
                <Grid item xs={"auto"}>
                    <Autocomplete
                        disabled={changeLock}
                        multiple
                        limitTags={5}
                        id="wsConfigLanguagesInputSelect"
                        options={programmingLanguages.map((_, i) => {
                            return i
                        })}
                        getOptionLabel={(option) => programmingLanguages[option]}
                        // @ts-ignore
                        onChange={(e: SyntheticEvent, value: number[]) => {
                            // copy initial state
                            let updateState = Object.assign({}, initialCreateProjectStateUpdate);

                            // create custom config
                            let cfg = Object.assign({}, createProjectForm.workspaceConfig) as WorkspaceConfig;

                            // set tag ids and full tags
                            cfg.languages = value;
                            cfg.language_strings = value.map((lang_id: number) => programmingLanguages[lang_id]);

                            // update workspace config in state update
                            updateState.workspaceConfig = cfg;
                            // update custom backup state
                            updateState.customWorkspaceConfigContent = cfg;

                            // execute state update
                            updateFormState(updateState)
                        }}
                        value={createProjectForm.workspaceConfig.languages === null ? [] : createProjectForm.workspaceConfig.languages}
                        renderInput={(params) => (
                            <TextField {...params} label="Template Languages" placeholder="Template Languages" />
                        )}
                        sx={{
                            width: "20vw",
                        }}
                    />
                    {renderLanguageExplanationPopover()}
                </Grid>
            </>
        )
    }

    /**
     * Renders the `Workspace Config` section of the Create Project card
     */
    let renderWorkspaceConfig = () => {
        return (
            <div>
                <WorkspaceConfigEditor
                    value={createProjectForm.workspaceConfig.content}
                    setValue={(v: string) => {
                        // skip state update if this is a template and it is unchanged
                        if (createProjectForm.workspaceConfig._id !== "0" &&
                            v === createProjectForm.workspaceConfig.content) {
                            return
                        }

                        // copy initial state
                        let updateState = Object.assign({}, initialCreateProjectStateUpdate);

                        // create variable to hold the config value we're going to use and assume that it is a custom config
                        let cfg = Object.assign({}, createProjectForm.customWorkspaceContent) as WorkspaceConfig;
                        cfg.content = v

                        // use a template if any of the template content match the current value
                        for (let i = 0; i < wsConfigOptions.length; i++) {
                            if (wsConfigOptions[i]._id === "-1" || wsConfigOptions[i].content !== v) {
                                continue
                            }
                            cfg = wsConfigOptions[i]
                        }

                        // set update state workspace config to new value
                        updateState.workspaceConfig = cfg;

                        // save options in case they need an update
                        let opts = wsConfigOptions;

                        // disable config template creation if this isn't a custom template
                        if (cfg._id !== "-1") {
                            updateState.createWorkspaceConfig = false;
                        } else {
                            // update custom config content if this is a custom configuration
                            updateState.customWorkspaceConfigContent = cfg;
                            // update options to hold new custom value
                            for (let i = 0; i < opts.length; i++) {
                                if (opts[i]._id !== "-1") {
                                    continue;
                                }
                                opts[i] = cfg;
                                break
                            }
                        }


                        // execute state update
                        updateFormState(updateState)
                        setWsConfigOptions(opts)
                    }}
                    style={{
                        float: "left",
                        marginTop: "40px",
                        marginLeft: "40px"
                    }}
                    width={"40vw"}
                    height={"70vh"}
                />
                <Grid container justifyContent="space-evenly" sx={{
                    float: "right",
                    width: "25vw",
                    height: (createProjectForm.workspaceConfig._id === "-1" && createProjectForm.createWorkspaceConfig) ?
                        "70vh" :
                        (createProjectForm.workspaceConfig._id === "-1") ?
                            "30vh" :
                            "20vh",
                    minHeight: (createProjectForm.workspaceConfig._id === "-1" && createProjectForm.createWorkspaceConfig) ?
                        "650px" :
                        (createProjectForm.workspaceConfig._id === "-1") ?
                            "200px" :
                            "100px",
                    marginRight: "40px",
                    marginTop: "40px",
                }}>
                    <Grid item xs={"auto"}>
                        <Autocomplete
                            disabled={changeLock}
                            limitTags={5}
                            id="wsConfigSearchAutocomplete"
                            options={wsConfigOptions}
                            getOptionLabel={(option: WorkspaceConfig) => {
                                return option.title
                            }}
                            isOptionEqualToValue={(option: WorkspaceConfig, value: WorkspaceConfig) => {
                                return option._id === value._id;
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Workspace Config Templates"
                                    placeholder="Workspace Config Templates" />
                            )}
                            onInputChange={(e) => {
                                handleWorkspaceConfigSearch(e)
                            }}
                            // @ts-ignore
                            onChange={(e: SyntheticEvent, value: WorkspaceConfig) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialCreateProjectStateUpdate);


                                // set update state workspace config to new value
                                updateState.workspaceConfig = value;

                                // execute state update
                                updateFormState(updateState)
                            }}
                            // @ts-ignore
                            value={createProjectForm.workspaceConfig}
                            sx={stepIndex === 12 ? {
                                width: "20vw",
                                zIndex: "6000000"
                            } : { width: "20vw" }} className={'workspace_config'}
                        />
                        {renderWsConfigTemplateExplanationPopover()}
                    </Grid>
                    {renderCreateWorkspaceConfig()}
                    {
                        (!confirmProjectCreate) ? (
                            <Grid item xs={"auto"}>
                                <LoadingButton
                                    loading={changeLock}
                                    variant={`contained`}
                                    color={"primary"}
                                    sx={{
                                        width: "20vw",
                                        height: "50px",
                                        borderRadius: 1,
                                        // float: "right",
                                    }}
                                    onClick={() => setConfirmProjectCreate(true)}
                                >
                                    Create Challenge
                                </LoadingButton>
                            </Grid>
                        ) : (
                            <>
                                <Grid item xs={"auto"}>
                                    <LoadingButton
                                        loading={changeLock}
                                        variant={`contained`}
                                        color={"primary"}
                                        sx={{
                                            width: "20vw",
                                            height: "50px",
                                            borderRadius: 1,
                                            // float: "right",
                                        }}
                                        onClick={createProject}
                                    >
                                        Confirm
                                    </LoadingButton>
                                </Grid>
                                <Grid item xs={"auto"}>
                                    <Button
                                        disabled={changeLock}
                                        variant={`contained`}
                                        color={"error"}
                                        sx={{
                                            width: "20vw",
                                            height: "50px",
                                            borderRadius: 1,
                                            // float: "right",
                                        }}
                                        onClick={() => setConfirmProjectCreate(false)}
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
                            </>
                        )
                    }
                </Grid>
            </div>
        )
    }

    /**
     * Renders the `Challenge Created` section of the Create Project card
     */
    let renderChallengeCreated = () => {
        return (
            <div>
                <Typography component={"div"} variant={"h3"}
                    sx={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: "12vh" }}>
                    Challenge Created!
                </Typography>
                {xpData !== null && xpData !== undefined ? (<XpPopup oldXP={
                    //@ts-ignore
                    (xpData["xp_update"]["old_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]} levelUp={
                        //@ts-ignore
                        xpData["level_up_reward"] === null ? false : true} homePage={false} popupClose={null} maxXP={100}
                    newXP={(xpData["xp_update"]["new_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]}
                    nextLevel={xpData["xp_update"]["next_level"]}
                    gainedXP={xpData["xp_update"]["new_xp"] - xpData["xp_update"]["old_xp"]}
                    reward={xpData["level_up_reward"]}
                    renown={xpData["xp_update"]["current_renown"]} />) : null}
                <Grid container spacing={12} justifyContent="space-evenly" sx={{
                    flexGrow: 1,
                    paddingTop: "29vh",
                }}>
                    <Grid item xs={"auto"}>
                        <Button
                            disabled={changeLock}
                            variant={`contained`}
                            color={"error"}
                            sx={{
                                width: "15vw",
                                height: "50px",
                                borderRadius: 1,
                                float: "right",
                            }}
                            onClick={() => {
                                clearState()
                                navigate(-1)
                            }}
                        >
                            Exit
                        </Button>
                    </Grid>
                    <Grid item xs={"auto"}>
                        <LoadingButton
                            loading={changeLock}
                            variant={`contained`}
                            color={"secondary"}
                            sx={{
                                width: "15vw",
                                height: "50px",
                                borderRadius: 1,
                                float: "right",
                            }}
                            // TODO: update after project page change
                            onClick={async () => {
                                setChangeLock(true)
                                await launchWorkspace()
                                setChangeLock(false)
                            }}
                        >
                            Launch Workspace
                        </LoadingButton>
                    </Grid>
                </Grid>
            </div>
        )
    }

    /**
     * Select the createProjectForm section to render based on the section state variable
     */
    let sectionSwitch = () => {
        if (createProjectForm.challengeType === 2) {
            switch (section) {
                case -1:
                    return renderExclusiveInfoSection()
                case 0:
                    return renderBasicInfoSection()
                case 1:
                    return renderChallengeDetailsSection()
                case 2:
                    return renderEvaluationSection()
                case 3:
                    return renderWorkspaceConfig()
                case 4:
                    return renderChallengeCreated()
            }
        } else {
            switch (section) {
                case -1:
                    return renderExclusiveInfoSection()
                case 0:
                    return renderBasicInfoSection()
                case 1:
                    return renderChallengeDetailsSection()
                case 2:
                    return renderWorkspaceConfig()
                case 3:
                    return renderChallengeCreated()
            }
        }
    }


    // initialize tags if there are no values
    if (tagOptions.length === 0 && !bsTags) {
        setBsTags(true)
        handleTagSearch({ target: { value: "" } })
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
        state.create_project = true
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
                tutorial_key: "create_project"
            }
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <CardTutorial
                    open={
                        runTutorial &&
                        // first page steps
                        (section === 0 && stepIndex >= 0 && stepIndex < 2) ||
                        // workspace config steps
                        (section === 2 && stepIndex >= 2)
                    }
                    closeCallback={closeTutorialCallback}
                    step={stepIndex}
                    changeCallback={tutorialCallback}
                    steps={[
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Making a Challenge on GIGO</h2>
                                    <p style={styles.tutorialText}>Challenges are how lessons and projects are
                                        structured on GIGO. Finish the tutorial to learn how to create a Challenge on GIGO.</p>
                                </div>
                            ),
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>Giving Challenges an image</h2>
                                    <p style={styles.tutorialText}>Images are required for Challenges on GIGO. We encourage you to upload your own but if you need an image, use the `Generate Image` button to create one.</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>We use Magic to generate images from a prompt. It takes a little while but most times it's easier than fishing through your files for a good picture.</p>
                                </div>
                            )
                        },
                        {
                            content: (
                                <div>
                                    <h2 style={styles.tutorialHeader}>GIGO Workspace Configs</h2>
                                    <p style={styles.tutorialText}>GIGO uses Workspace Configs to launch Challenge environments. Workspace Configs create reproducible and consistent environments.</p>
                                </div>
                            ),
                            moreInfo: (
                                <div>
                                    <p style={styles.tutorialText}>Workspace Configs allow virtually infinite configurations for Challenges. You can even configure a full Docker Compose configuration to launch containers inside the workspace. Here's some pro tips:</p>
                                    <ul>
                                        <li style={styles.tutorialText}>Use containers via the `containers` key instead of installing programs with the `exec` key. Containers can be cached and usually provide faster launches.</li>
                                        <li style={styles.tutorialText}>Consider creating a custom container from the `gigodev/gimg:ubuntu-base` container if you find yourself repeating configurations.</li>
                                        <li style={styles.tutorialText}>Only content in the `/home/gigo` directory persists between restarts. Try to keep your content that you want to persist in that folder.</li>
                                        <li style={styles.tutorialText}>Workspaces are ephemeral by nature and only persist for a maximum of 24h of inactivity.</li>
                                    </ul>
                                </div>
                            )
                        },
                    ]}
                />
                <Card sx={styles.card}>
                    <Typography component={"div"} variant={"h5"}
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            paddingTop: "10px"
                        }}>
                        Create Project
                    </Typography>
                    <Modal open={showPopupConnect} onClose={() => setShowPopupConnect(false)}
                        style={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>
                        <Box
                            sx={{
                                width: "40vw",
                                height: "45vh",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                                outlineColor: "black",
                                borderRadius: 1,
                                boxShadow:
                                    "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                                backgroundColor: theme.palette.background.default,
                            }}
                        >
                            <div
                                style={{ width: "80%", height: "70%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <h4>You cannot make exclusive content without creating a connected account. Would you
                                    like to continue to connected account setup?</h4>
                            </div>
                            <div
                                style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                                <Button onClick={() => window.location.replace(
                                    //@ts-ignore
                                    connectedAccountLink)}>
                                    Confirm
                                </Button>
                                <Button onClick={() => setShowPopupConnect(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Box>
                    </Modal>
                    {renderSectionSelection()}
                    {sectionSwitch()}
                </Card>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default CreateProject;