import React, {SyntheticEvent, useEffect, useState} from 'react';
import JourneyPageIcon from "../components/Icons/JourneyPage";
import {themeHelpers, getAllTokens, isHoliday} from "../theme";
import {
    Autocomplete,
    Card,
    createTheme,
    CssBaseline,
    InputBase,
    PaletteMode,
    Tab,
    Tabs,
    TextField,
    ThemeProvider,
    Tooltip
} from "@mui/material";
import JourneyPageCampIcon from "../components/Icons/JourneyPageCamp";
import {Chip, Grid} from "@material-ui/core";
import JourneyPagePumpIcon from "../components/Icons/JourneyPageGasPump";
import {useAppSelector} from "../app/hooks";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import { makeStyles } from '@material-ui/core/styles';
import {AwesomeButton} from "react-awesome-button";
import {useNavigate} from "react-router-dom";
import premiumImage from "../img/croppedPremium.png";
import { Box, Typography, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from "@mui/icons-material/Search";
import call from "../services/api-call";
import swal from "sweetalert";
import {Add, Cancel, Edit} from "@material-ui/icons";
import WorkspaceConfigEditor from "../components/editor/workspace_config/editor";
import {initialCreateProjectStateUpdate} from "../reducers/createProject/createProject";
import { DefaultWorkspaceConfig, Workspace, WorkspaceConfig } from "../models/workspace";
import Tag from "../models/tag";
import {programmingLanguages} from "../services/vars";

interface Config {
    id: string;
    title: string;
    description: string;
    downloads: number; // Assuming downloads should be a number
    hoursPlayed: string;
}

// Styled components based on your existing search bar styles
const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.contrastText, 0.25),
    },
    width: 'auto',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.contrastText
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

// SearchBar component
// @ts-ignore
const SearchBar = ({ handleWorkspaceConfigSearch }) => {
    return (
        <Search>
            <SearchIconWrapper>
                <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                onChange={(e) => handleWorkspaceConfigSearch(e.target.value)}
            />
        </Search>
    );
};



function PublicConfigs() {

    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [minorTab, setMinorTab] = React.useState<string>("Community")
    const [skip, setSkip] = React.useState(0);
    const [add, setAdd] = React.useState(false);
    const [workspaceConfigValue, setWorkspaceConfigValue] = useState(DefaultWorkspaceConfig);
    const [createTitle, setCreateTitle] = useState("");
    const [createDescription, setCreateDescription] = useState("");
    const [createTags, setCreateTags] = useState<Tag[]>([]);
    const[createLanguage, setCreateLanguage] = useState<Tag[]>([]);
    const [tagOptions, setTagOptions] = React.useState<Tag[]>([])

    const [revision, setRevision] = React.useState<boolean>(false);
    const [revisionTitle, setRevisionTitle] = useState<string>("");
    const [revisionDescription, setRevisionDescription] = useState<string>("");
    const [revisionTags, setRevisionTags] = useState<Tag[]>([]);
    const[revisionLanguage, setRevisionLanguage] = useState<number[]>([]);
    const [revisionContent, setRevisionContent] = useState<string>("");
    const [revisionId, setRevisionId] = useState<string>("");
    const [extraRevisions, setExtraRevisions] = useState([]);
    const [revisionUses, setRevisionUses] = useState<number>(0);
    const [revisionCompletions, setRevisionCompletions] = useState<number>(0);
    const [revisionRevisions, setRevisionRevisions] = useState<number>(0);

    const [revisionObject, setRevisionObject] = useState<any>(null);

    const [editTitle, setEditTitle] = React.useState("");
    const [editDescription, setEditDescription] = React.useState("");
    const [editTags, setEditTags] = React.useState<Tag[]>([]);
    const [editLanguage, setEditLanguage] = React.useState<number[]>([]);
    const [editContent, setEditContent] = React.useState<string>("");
    const [editId, setEditId] = React.useState<string>("");

    const [editMode, setEditMode] = React.useState<boolean>(false);
    const colorMode = React.useMemo(
        () => ({
            // The dark mode switch would invoke this method
            toggleColorMode: () => {
                setMode((prevMode: PaletteMode) =>
                    prevMode === 'light' ? 'dark' : 'light',
                );
            },
        }),
        [mode],
    );

    const editButton = (title: string, description: string, tags: Tag[], languages: number[], id: string, content: string) => {
        setEditMode(true)
        setEditTitle(title)
        setEditDescription(description)
        setEditTags(tags)
        setEditId(id)
        setEditContent(content)
        setEditLanguage(languages)
    }

    // const wsConfigOptionsBaseState = [
    //     {
    //         _id: "0",
    //         title: "Default",
    //         content: DefaultWorkspaceConfig,
    //         description: "Default workspace configuration provided by GIGO."
    //     } as WorkspaceConfig
    // ]
    // const wsConfigOptionsBaseState = [
    // ]
    const [wsConfigOptions, setWsConfigOptions] = React.useState<WorkspaceConfig[]>([])

    const aspectRatio = useAspectRatio();
    const handleTheme = () => {
        colorMode.toggleColorMode();
        localStorage.setItem('theme', mode === 'light' ? "dark" : 'light')
        window.location.reload()
    };

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setSkip(0)
        setMinorTab(newValue)
    };

    const handleWorkspaceConfigSearch = async (e: any, skip: number) => {
        if (e === null) {
            return
        }


        if (e !== "" && typeof e !== "string") {
            return
        }

        // let queryValue = e

        // if (e.target === undefined){
        //     queryValue = ""
        // } else {
        //     queryValue = e.target.value;
        // }

        let params = {
            query: e,
            skip: skip,
            limit: 50
        }

        if (minorTab === "My Public Configs") {
            //@ts-ignore
            params["search_user"] = true
        }

        let res = await call(
            "/api/search/workspaceConfigs",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            params
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

        // // iterate over workspace configs loading the full tag data for each tags id from the responses
        // for (let i = 0; i < workspaceConfigs.length; i++) {
        //     // create array to hold full tags
        //     let fullTags = []
        //
        //     // iterate over tag ids in tag loading the full tags from the response
        //     for (let j = 0; j < workspaceConfigs[i].tags.length; j++) {
        //         // skip if tag doesn't exit
        //         if (res["tags"][workspaceConfigs[i].tags[j]] === undefined) {
        //             continue
        //         }
        //         fullTags.push(res["tags"][workspaceConfigs[i].tags[j]])
        //     }
        //     console.log("configs second: ", fullTags)
        //
        //     // assign full tags to workspace
        //     workspaceConfigs[i].fullTags = fullTags
        // }

        // iterate over workspace configs loading the full tag data for each tags id from the responses
        for (let i = 0; i < workspaceConfigs.length; i++) {
            // create array to hold full tags
            let fullTags = []

            // iterate over tag ids in tag loading the full tags from the response
            for (let j = 0; j < workspaceConfigs[i].tags.length; j++) {
                if (workspaceConfigs[i].tags[j] === undefined || workspaceConfigs[i].tags[j].toString() === "0") {
                    continue
                }
                // skip if tag doesn't exit
                if (res["tags"][workspaceConfigs[i].tags[j]] === undefined) {
                    continue
                }
                fullTags.push(res["tags"][workspaceConfigs[i].tags[j]])
            }


            // assign full tags to workspace
            workspaceConfigs[i].fullTags = fullTags
        }



        if (skip === 0){
            setWsConfigOptions(workspaceConfigs)
        } else {
            let wsConfigOption = [
                ...wsConfigOptions,
                ...workspaceConfigs
            ]
            setWsConfigOptions(wsConfigOption)
        }

        // let wsConfigOption = [
        //     ...workspaceConfigs
        // ]

        setSkip(skip + 50)
    }

    // window.onscroll = function() {
    //     if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
    //         handleWorkspaceConfigSearch("", skip).then(r => console.log("searching"))
    //     }
    // }

    useEffect(() => {
        //null
        handleWorkspaceConfigSearch("", 0)
    }, [minorTab])

    const handleValueChange = (v: React.SetStateAction<string>) => {
        setWorkspaceConfigValue(v)
    }

    const handleValueChangeEdit = (v: React.SetStateAction<string>) => {
        setEditContent(v)
    }

    const handleValueChangeRevision = (v: React.SetStateAction<string>) => {
        setRevisionContent(v)
    }

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

    const createPublicConfig = async() => {

        if (createTitle === "" || createDescription === "" || createTags.length === 0 || createLanguage.length === 0 || workspaceConfigValue === "") {
            swal("Error", "Please fill out all fields!")
            return
        }

        let language = programmingLanguages.indexOf(createLanguage[0].toString())

        let res = await call(
            "/api/public_config/create",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                title: createTitle,
                description: createDescription,
                tags: createTags,
                languages: [language],
                content: workspaceConfigValue
            }
        )

        if (res !== undefined && res["message"] !== undefined && res["message"] === "workspace config template created successfully"){
            setAdd(false)
            swal("Success", "Your workspace config template has been created successfully!")
        } else {
            swal("Error", "There was an error creating the workspace config template. Please try again later.")
        }
    }

    const editConfig = async() => {
        // console.log("description: ", editDescription)
        // console.log("contnet: ", editContent)
        // console.log("tags: ", editTags)
        // console.log("id: ", editId)

        if (editTitle === "" || editDescription === "" || editContent === "" || editId === ""){
            swal("Error", "Please fill out all fields!")
            return
        }

        let res = await call(
            "/api/public_config/edit",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                description: editDescription,
                config_id: editId,
                content: editContent,
                tags: editTags
            }
        )

        if (res !== undefined && res["message"] !== undefined){
            if (res["message"] === "successfully updated workspace config"){
                setEditMode(false)
                setRevision(false)
                swal("Success", "Your workspace config template has been created successfully!")
            } else if (res["message"] === "workspace config template not found"){
                setEditMode(false)
                setRevision(false)
                swal("There were no changes made!")
            } else {
                setEditMode(false)
                setRevision(false)
                swal(res["message"])
            }
        } else {
            swal("Error", "There was an error creating the workspace config template. Please try again later.")
        }
    }

    const getRevisions = async(config: WorkspaceConfig) => {
        console.log("lang is: ", config)
        setRevision(true)
        setRevisionContent(config.content)
        setRevisionTitle(config.title)
        setRevisionId(config._id)
        setRevisionDescription(config.description)
        console.log("tags are: ", config.fullTags)
        setRevisionTags(config.fullTags)
        setRevisionLanguage(config.languages)
        setRevisionUses(config.uses)
        setRevisionCompletions(config.completions)
        setRevisionRevisions(config.revision)
        setRevisionObject(config)

        if (config._id == undefined || config._id === ""){
            swal("Error", "We were unable to fulfill this request at this time!")
            return
        }

        let res = await call(
            "/api/workspace/config/getWsConfig",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                id: config._id
            }
        )

        if (res !== undefined && res["revisions_and_tags"] !== undefined){
            let revisions = res["revisions_and_tags"]
            revisions.shift()
            console.log("revisions are: ", revisions)
            setExtraRevisions(revisions)
        } else {
            swal("Error", "There was an issue getting other revisions. Please try again later.")
        }
    }

    function isObject(obj: any) {
        return obj !== null && typeof obj === 'object';
    }

    function compareArrays(array1: any, array2: any) {
        if (array1.length !== array2.length) {
            return false;
        }

        for (let i = 0; i < array1.length; i++) {
            if (!compareStructs(array1[i], array2[i])) {
                return false;
            }
        }

        return true;
    }

    function compareStructs(struct1: any, struct2: any) {
        if (!isObject(struct1) || !isObject(struct2)) {
            return struct1 === struct2;
        }

        if (Array.isArray(struct1) && Array.isArray(struct2)) {
            return compareArrays(struct1, struct2);
        }

        const keys1 = Object.keys(struct1);
        const keys2 = Object.keys(struct2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (let key of keys1) {
            if (!keys2.includes(key)) {
                return false;
            }

            if (isObject(struct1[key]) || Array.isArray(struct1[key])) {
                if (!compareStructs(struct1[key], struct2[key])) {
                    return false;
                }
            } else if (struct1[key] !== struct2[key]) {
                return false;
            }
        }

        return true;
    }

    const getRevisionsOfRevision = async(config: WorkspaceConfig) => {
        console.log("lang is: ", config)
        setRevision(true)
        // @ts-ignore
        setRevisionContent(config["revision"].content)
        // @ts-ignore
        setRevisionTitle(config["revision"].title)
        // @ts-ignore
        setRevisionId(config["revision"]._id)
        // @ts-ignore
        setRevisionDescription(config["revision"].description)
        // @ts-ignore
        setRevisionTags(config["tags"])
        // @ts-ignore
        setRevisionLanguage(config["revision"].languages)
        // @ts-ignore
        setRevisionUses(config["revision"].uses)
        // @ts-ignore
        setRevisionCompletions(config["revision"].completions)
        // @ts-ignore
        setRevisionRevisions(config["revision"].revision)
        setRevisionObject(config["revision"])

        //@ts-ignore
        if (config["revision"]._id == undefined || config["revision"]._id === ""){
            swal("Error", "We were unable to fulfill this request at this time!")
            return
        }

        let res = await call(
            "/api/workspace/config/getWsConfig",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                //@ts-ignore
                id: config["revision"]._id
            }
        )

        if (res !== undefined && res["revisions_and_tags"] !== undefined){
            let revisions = res["revisions_and_tags"]
            // console.log("revisions are: ", revisions)
            // console.log("config ones: ", config)
            let revisionFull = []
            for (let i = 0; i < revisions.length; i++) {
                if (!compareStructs(revisions[i], config)){
                    revisionFull.push(revisions[i])
                }
            }
            // revisions.pop();
            console.log("revisions are: ", revisions)
            console.log("config ones: ", config)
            //@ts-ignore
            setExtraRevisions(revisionFull)
        } else {
            swal("Error", "There was an issue getting other revisions. Please try again later.")
        }
    }


    const navigate = useNavigate();
    const minorValues = ["Community", "My Public Configs"]
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Box sx={{ bgcolor: 'background.paper', minHeight: '10vh', p: 2 }}>
                    {/* Header and Search Bar */}
                    {editMode || revision ? (
                        <Box style={{
                            display: "flex",
                            alignItems: "right",
                            flexDirection: "row"
                        }}>
                            <Button onClick={() => {
                                setEditMode(false)
                                setRevision(false)
                                setExtraRevisions([])
                            }}>
                                <Cancel/>
                                <h5>Go Back</h5>
                            </Button>
                        </Box>
                    ) : (
                        <Box style={{
                            position: "absolute",
                            right: "15%",
                            top: "10%"
                        }}>
                            <Tooltip title={add ? "Go Back" : "Add A New Public Config"}>
                                <Button onClick={() => {setAdd(!add)}} variant={"outlined"}>
                                    {
                                        add ? (
                                            <Cancel/>
                                        ) : (
                                            <Add/>
                                        )
                                    }
                                </Button>
                            </Tooltip>
                        </Box>
                        )}
                    {
                        add ? (
                            <div style={{display: "flex", flexDirection: "row"}}>
                                <WorkspaceConfigEditor
                                    value={workspaceConfigValue}
                                    setValue={handleValueChange}
                                    style={{
                                        float: "left",
                                        marginTop: "40px",
                                        marginLeft: "40px"
                                    }}
                                    width={"40vw"}
                                    height={"70vh"}
                                />
                                <div style={{display: "flex", justifyContent: "center", width: "50%", alignItems: "center", flexDirection: "column"}}>
                                    <Grid item xs={"auto"}>
                                        <TextField
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
                                            value={createTitle}
                                            onChange={(e) => {
                                                setCreateTitle(e.target.value)
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={"auto"}>
                                        <TextField
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
                                                paddingBottom: "10px"
                                            }}
                                            value={createDescription}
                                            onChange={(e) => {
                                                setCreateDescription(e.target.value)
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={"auto"}>
                                        <Autocomplete
                                            multiple
                                            limitTags={5}
                                            freeSolo
                                            id="wsConfigTagSearchAutocomplete"
                                            options={tagOptions}
                                            getOptionLabel={(option: Tag | string) => typeof option === "string" ? option : option.value}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Template Tags" placeholder="Template Tags" />
                                            )}
                                            onInputChange={(e, value) => {
                                                handleTagSearch(e);
                                            }}
                                            onChange={(event, value: (Tag | string)[], reason) => {
                                                // set update state tags to empty array
                                                let createTagNew = [];

                                                // handle any values that may be strings from user input
                                                for (let i = 0; i < value.length; i++) {
                                                    // append to the update state tags if this is an object
                                                    if (typeof value[i] === "object") {
                                                        // @ts-ignore
                                                        createTagNew.push(value[i]);
                                                        continue
                                                    }

                                                    // wrap the value in an object with -1 for an id to mark
                                                    createTagNew.push({
                                                        _id: "-1",
                                                        value: value[i],
                                                    } as Tag)
                                                }
                                                // @ts-ignore
                                                setCreateTags(createTagNew)
                                            }}
                                            value={createTags}
                                            sx={{ width: "20vw", paddingBottom: "10px" }}
                                        />
                                    </Grid>
                                    <Grid item xs={"auto"}>
                                        <Autocomplete
                                            multiple
                                            limitTags={5}
                                            id="wsConfigLanguagesInputSelect"
                                            options={programmingLanguages.map((_, i) => i)}
                                            getOptionLabel={(option) => programmingLanguages[option]}
                                            onChange={(event, value: number[]) => {
                                                // @ts-ignore
                                                setCreateLanguage(value.map(v => programmingLanguages[v])); // Adjust according to your state structure
                                            }}
                                            //@ts-ignore
                                            value={createLanguage === null ? [] : createLanguage.map(lang => programmingLanguages.indexOf(lang))}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Template Languages" placeholder="Template Languages" />
                                            )}
                                            sx={{ width: "20vw", paddingBottom: "10px" }}
                                        />
                                    </Grid>
                                    <Button variant={"contained"} style={{height: "fit-content"}} onClick={() => createPublicConfig()}>
                                        Submit
                                    </Button>
                                </div>
                            </div>
                        ) : editMode ? (
                            <div style={{display: "flex", flexDirection: "row"}}>
                                <WorkspaceConfigEditor
                                    value={editContent}
                                    setValue={handleValueChangeEdit}
                                    style={{
                                        float: "left",
                                        marginTop: "40px",
                                        marginLeft: "40px"
                                    }}
                                    width={"40vw"}
                                    height={"70vh"}
                                />
                                <div style={{display: "flex", justifyContent: "center", width: "50%", alignItems: "center", flexDirection: "column"}}>
                                    {/*<Grid item xs={"auto"}>*/}
                                    {/*    <TextField*/}
                                    {/*        id={"template-title"}*/}
                                    {/*        variant={`outlined`}*/}
                                    {/*        color={"primary"}*/}
                                    {/*        label={"Template Title"}*/}
                                    {/*        required={true}*/}
                                    {/*        margin={`normal`}*/}
                                    {/*        type={`text`}*/}
                                    {/*        sx={{*/}
                                    {/*            width: "20vw",*/}
                                    {/*        }}*/}
                                    {/*        value={editTitle}*/}
                                    {/*        onChange={(e) => {*/}
                                    {/*            setEditTitle(e.target.value)*/}
                                    {/*        }}*/}
                                    {/*    />*/}
                                    {/*</Grid>*/}
                                    <Grid item xs={"auto"}>
                                        <TextField
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
                                                paddingBottom: "10px"
                                            }}
                                            value={editDescription}
                                            onChange={(e) => {
                                                setEditDescription(e.target.value)
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={"auto"}>
                                        <Autocomplete
                                            multiple
                                            limitTags={5}
                                            freeSolo
                                            id="wsConfigTagSearchAutocomplete"
                                            options={tagOptions}
                                            getOptionLabel={(option: Tag | string) => typeof option === "string" ? option : option.value}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Template Tags" placeholder="Template Tags" />
                                            )}
                                            onInputChange={(e, value) => {
                                                handleTagSearch(e);
                                            }}
                                            onChange={(event, value: (Tag | string)[], reason) => {
                                                // Create a new array instead of modifying the existing one
                                                let editTagsNew = [];

                                                // If a tag is removed, handle accordingly
                                                if (reason === 'removeOption') {
                                                    editTagsNew = value.map(v => typeof v === "string" ? { _id: "-1", value: v } : v);
                                                } else {
                                                    // handle any values that may be strings from user input
                                                    for (let i = 0; i < value.length; i++) {
                                                        if (typeof value[i] === "object") {
                                                            editTagsNew.push(value[i]);
                                                        } else {
                                                            editTagsNew.push({ _id: "-1", value: value[i] });
                                                        }
                                                    }
                                                }

                                                // Update the state with the new array
                                                //@ts-ignore
                                                setEditTags(editTagsNew);
                                            }}
                                            //@ts-ignore
                                            value={editTags}
                                            sx={{ width: "20vw", paddingBottom: "10px" }}
                                        />
                                    </Grid>
                                    {/*<Grid item xs={"auto"}>*/}
                                    {/*    <Autocomplete*/}
                                    {/*        multiple*/}
                                    {/*        limitTags={5}*/}
                                    {/*        id="wsConfigLanguagesInputSelect"*/}
                                    {/*        options={programmingLanguages.map((_, i) => i)}*/}
                                    {/*        getOptionLabel={(option) => programmingLanguages[option]}*/}
                                    {/*        onChange={(event, value: number[]) => {*/}
                                    {/*            let language = value*/}

                                    {/*            console.log("language is: ", language)*/}

                                    {/*            if (language === undefined) {*/}
                                    {/*                setEditLanguage([])*/}
                                    {/*            } else {*/}
                                    {/*                // @ts-ignore*/}
                                    {/*                setEditLanguage(value)*/}
                                    {/*            }*/}
                                    {/*        }}*/}
                                    {/*        //@ts-ignore*/}
                                    {/*        // value={editLanguage === null ? [] : editLanguage.map(lang => programmingLanguages[lang])}*/}
                                    {/*        value={editLanguage}*/}
                                    {/*        renderInput={(params) => (*/}
                                    {/*            <TextField {...params} label="Template Languages" placeholder="Template Languages" />*/}
                                    {/*        )}*/}
                                    {/*        sx={{ width: "20vw", paddingBottom: "10px" }}*/}
                                    {/*    />*/}
                                    {/*</Grid>*/}
                                    <Button variant={"contained"} style={{height: "fit-content"}} onClick={() => editConfig()}>
                                        Submit
                                    </Button>
                                </div>
                            </div>
                            ) : revision ? (
                                <div style={{display: "flex", flexDirection: "row"}}>
                                    <div style={{display: "flex", flexDirection: "column"}}>
                                        <Grid item xs={"auto"}>
                                            <TextField
                                                id={"template-title"}
                                                variant="outlined"
                                                color="primary"
                                                label="Title"
                                                required={true}
                                                margin="normal"
                                                type="text"
                                                sx={{
                                                    width: "20vw",
                                                }}
                                                value={revisionTitle}
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                            />
                                            <TextField
                                                id={"languages"}
                                                variant="outlined"
                                                color="primary"
                                                label="Languages"
                                                required={true}
                                                margin="normal"
                                                type={"text"}
                                                value={revisionLanguage !== undefined && revisionLanguage[0] !== -1 ? programmingLanguages[revisionLanguage[0]].toString() : ""}
                                                sx={{width: "auto", paddingLeft: "10px"}}
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                            />
                                        </Grid>
                                        <WorkspaceConfigEditor
                                            value={revisionContent}
                                            setValue={handleValueChangeRevision}
                                            style={{
                                                float: "left",
                                                marginTop: "10px",
                                                // marginLeft: "40px"
                                            }}
                                            width={"40vw"}
                                            height={"50vh"}
                                        />
                                        <Grid item xs={"auto"} style={{display: "flex", flexDirection: "row"}}>
                                            <TextField
                                                id={"template-description"}
                                                variant="outlined"
                                                color="primary"
                                                label="Description"
                                                required={true}
                                                margin="normal"
                                                multiline={true}
                                                minRows={3}
                                                maxRows={5}
                                                sx={{
                                                    width: "20vw",
                                                    paddingBottom: "10px",
                                                    paddingTop: "10px"
                                                }}
                                                value={revisionDescription}
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                            />
                                            <Autocomplete
                                                multiple
                                                limitTags={5}
                                                id="wsConfigTagSearchAutocomplete"
                                                options={revisionTags}
                                                getOptionLabel={(option) => typeof option === "string" ? option : option.value}
                                                renderTags={(tagValue, getTagProps) =>
                                                    tagValue.map((option, index) => (
                                                        <Chip
                                                            variant="outlined"
                                                            label={typeof option === "string" ? option : option.value}
                                                            {...getTagProps({ index })}
                                                            disabled
                                                            style={{color: theme.palette.text.primary}}
                                                        />
                                                    ))
                                                }
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Tags" placeholder="Template Tags" />
                                                )}
                                                value={revisionTags}
                                                sx={{ width: "20vw", paddingBottom: "10px", paddingTop: "30px", paddingLeft: "10px" }}
                                                readOnly
                                            />
                                        </Grid>
                                    </div>
                                    <div style={{ position: "absolute", top: 80, right: 20, display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ marginRight: '20px' }}>{"Uses: " + revisionUses}</span>
                                        <span>{"Completions: " + revisionCompletions}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "75%", width: "50%" }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ marginBottom: '20px' }}>
                                                <h2>Previous Versions</h2>
                                            </div>
                                            <div>
                                                {extraRevisions.length > 0 ? (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        {extraRevisions.map((config) => (
                                                            <React.Fragment key={config["revision"]["_id"]}>
                                                                <Button
                                                                    variant="outlined"
                                                                    sx={{
                                                                        bgcolor: theme.palette.background.default,
                                                                        mb: 1,
                                                                        borderRadius: '10px',
                                                                        color: theme.palette.text.primary,
                                                                        justifyContent: 'space-between',
                                                                        padding: '10px 20px',
                                                                        textTransform: 'none',
                                                                        width: '100%',
                                                                    }}
                                                                    onClick={() => getRevisionsOfRevision(config)}
                                                                >
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                                        <Typography variant="subtitle1">{config["revision"]["title"]}</Typography>
                                                                        <Typography variant="body2">{config["revision"]["description"]}</Typography>
                                                                    </Box>
                                                                </Button>
                                                                <div style={{height: "15px"}}/>
                                                            </React.Fragment>
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    <h3>There are no revisions.</h3>
                                                )}
                                            </div>
                                            <div style={{position: "absolute", bottom: "15%"}}>
                                                <Button variant={"outlined"} onClick={() => navigate('/create-challenge', {state: {workspace_config: revisionObject}})}>Create Project With config</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        ) : (
                            <div>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start', // Align items to the left
                                        width: '78%',
                                        margin: 'auto',
                                        marginBottom: '30px',
                                    }}
                                >
                                    <Typography variant="h4">Public Configs</Typography>
                                    <div style={{ width: '30%', marginBottom: "15px" }}>
                                        <SearchBar handleWorkspaceConfigSearch={(e: any) => {
                                            handleWorkspaceConfigSearch(e, 0)
                                        }}
                                        /> {/* SearchBar component */}
                                    </div>
                                    <Tabs
                                        orientation="horizontal"
                                        value={minorTab}
                                        onChange={handleChange}
                                        aria-label="Horizontal tabs"
                                    >
                                        {minorValues.map((minorValue) => {
                                            return <Tab label={minorValue} value={minorValue} key={minorValue}
                                                        sx={{color: "text.primary", borderRadius: 1}}/>;
                                        })}
                                    </Tabs>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {wsConfigOptions.map((config) => (
                                        <React.Fragment key={config._id}>
                                            <Button
                                                variant="outlined"
                                                sx={{
                                                    bgcolor: theme.palette.background.default,
                                                    mb: 1,
                                                    borderRadius: '10px', // Full rounded outline
                                                    color: theme.palette.text.primary,
                                                    justifyContent: 'space-between',
                                                    padding: '10px 20px',
                                                    textTransform: 'none', // Prevents the button text from being uppercase
                                                    width: '78%', // Set width to 78% of the parent container
                                                }}
                                                onClick={() => getRevisions(config)}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                    <Typography variant="subtitle1">{config.title}</Typography>
                                                    <Typography variant="body2">{config.description}</Typography>
                                                </Box>
                                                {minorTab === "My Public Configs" ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {/*<DownloadIcon />*/}
                                                        <Button onClick={() => editButton(config.title, config.description, config.fullTags, config.languages, config._id, config.content)}>
                                                            <Edit/>
                                                        </Button>
                                                        {/*<Typography variant="body2">{config.downloads}</Typography>*/}
                                                        {/*<Typography variant="body2">{config.hoursPlayed} HOURS PLAYED</Typography>*/}
                                                    </Box>
                                                ) : null}
                                            </Button>
                                            <div style={{height: "15px"}}/>
                                        </React.Fragment>
                                    ))}
                                </Box>
                            </div>
                        )
                    }
                </Box>
            </CssBaseline>
        </ThemeProvider>
    );
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

export default PublicConfigs;

