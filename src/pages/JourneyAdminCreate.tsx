import React, {SyntheticEvent, useEffect, useState} from "react";
import {
    Autocomplete,
    Button, Card,
    createTheme, CssBaseline, FormControl, Grid, InputLabel, MenuItem,
    PaletteMode, Select, Tab, Tabs, TextField, ThemeProvider, Typography,
    ButtonGroup
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {selectAuthStateRole} from "../reducers/auth/auth";
import {programmingLanguages} from "../services/vars";
import WorkspaceConfigEditor from "../components/editor/workspace_config/editor";
import {useLocation, useNavigate} from "react-router-dom";
import {useParams} from "react-router";
import {useSelector} from "react-redux";
import {
    clearJourneyCreateUnitState,
    JourneyCreateUnitState,
    JourneyCreateUnitStateUpdate,
    selectCost, selectCreateWorkspaceConfig, selectCustomWorkspaceConfigContent,
    selectUnitDescription,
    selectLanguages,
    selectUnitTags,
    selectTier,
    selectUnitTitle,
    selectUnitFocus, selectWorkspaceConfig, updateJourneyCreateUnitState,
    initialJourneyCreateUnitState, initialJourneyCreateUnitStateUpdate
} from "../reducers/journeyCreate/journeyCreateUnit";
import {DefaultWorkspaceConfig, WorkspaceConfig} from "../models/workspace";
import {
    clearJourneyCreateProjectState,
    JourneyCreateProjectState,
    JourneyCreateProjectStateUpdate,
    selectDependencies,
    selectLanguage,
    selectParentUnit,
    selectProjectTitle,
    selectWorkingDirectory,
    updateJourneyCreateProjectState,
    initialJourneyCreateProjectState,
    initialJourneyCreateProjectStateUpdate,
    selectProjectDescription,
    selectProjectTags
} from "../reducers/journeyCreate/journeyCreateProject";
import Tag from "../models/tag";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {initialCreateProjectStateUpdate} from "../reducers/createProject/createProject";


function JourneyAdminCreate() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const adminStatus = useAppSelector(selectAuthStateRole)

    // make sure user is admin, if not, redirect to home
    useEffect(() => {
        if (adminStatus !== 1) {
            window.location.href = "/home"
        }
    }, [])

    const dispatch = useAppDispatch();

    const reduxUnitTitleState = useSelector(selectUnitTitle);
    const reduxUnitFocusState = useSelector(selectUnitFocus);
    const reduxLanguagesState = useSelector(selectLanguages);
    const reduxUnitTagsState = useSelector(selectUnitTags);
    const reduxTierState = useSelector(selectTier);
    const reduxUnitDescriptionState = useSelector(selectUnitDescription);
    const reduxCostState = useSelector(selectCost);
    const reduxWorkspaceConfigState = useSelector(selectWorkspaceConfig);
    const reduxCustomWorkspaceConfigContentState = useSelector(selectCustomWorkspaceConfigContent);
    const reduxCreateWorkspaceConfigState = useSelector(selectCreateWorkspaceConfig);

    const [journeyUnit, setJourneyUnit] = React.useState(
        {
            title: reduxUnitTitleState,
            unitFocus: reduxUnitFocusState,
            languages: reduxLanguagesState,
            tags: reduxUnitTagsState,
            tier: reduxTierState,
            description: reduxUnitDescriptionState,
            cost: reduxCostState,
            workspaceConfig: reduxWorkspaceConfigState !== null ? reduxWorkspaceConfigState : {
                _id: "0",
                title: "Default",
                content: DefaultWorkspaceConfig,
                description: "Default workspace configuration provided by GIGO."
            } as WorkspaceConfig,
            customWorkspaceConfigContent: reduxCustomWorkspaceConfigContentState,
            createWorkspaceConfig: reduxCreateWorkspaceConfigState
        }
    );

    const updateJourneyCreateUnit = (state: JourneyCreateUnitStateUpdate) => {
        let createUnitUpdate = Object.assign({}, journeyUnit);

        if (state.title !== undefined && state.title !== null) {
            createUnitUpdate.title = state.title;
        }

        if (state.unitFocus !== undefined && state.unitFocus !== null) {
            createUnitUpdate.unitFocus = state.unitFocus;
        }

        if (state.languages !== undefined && state.languages !== null) {
            createUnitUpdate.languages = state.languages;
        }

        if (state.tags !== undefined && state.tags !== null) {
            createUnitUpdate.tags = state.tags;
        }

        if (state.tier !== undefined && state.tier !== null) {
            createUnitUpdate.tier = state.tier;
        }

        if (state.description !== undefined && state.description !== null) {
            createUnitUpdate.description = state.description;
        }

        if (state.cost !== undefined && state.cost !== null) {
            createUnitUpdate.cost = state.cost;
        }

        if (state.workspaceConfig !== undefined && state.workspaceConfig !== null) {
            createUnitUpdate.workspaceConfig = state.workspaceConfig;
        }

        if (state.customWorkspaceConfigContent !== undefined && state.customWorkspaceConfigContent !== null) {
            createUnitUpdate.customWorkspaceConfigContent = state.customWorkspaceConfigContent;
        }

        if (state.createWorkspaceConfig !== undefined && state.createWorkspaceConfig !== null) {
            createUnitUpdate.createWorkspaceConfig = state.createWorkspaceConfig;
        }

        setJourneyUnit(createUnitUpdate);

        dispatch(updateJourneyCreateUnitState(state));
    }

    const clearUnitState = () => {
        dispatch(clearJourneyCreateUnitState())
        setJourneyUnit({
            title: '',
            unitFocus: 0,
            languages: [],
            tags: [],
            tier: 0,
            description: '',
            cost: null,
            workspaceConfig: {
                _id: "0",
                title: "Default",
                content: DefaultWorkspaceConfig,
                description: "Default workspace configuration provided by GIGO."
            } as WorkspaceConfig,
            customWorkspaceConfigContent: {
                _id: "-1",
                title: "Custom",
                content: DefaultWorkspaceConfig,
            } as WorkspaceConfig,
            createWorkspaceConfig: false,
        })
    }

    const reduxProjectTitleState = useSelector(selectProjectTitle)
    const reduxParentUnitState = useSelector(selectParentUnit)
    const reduxWorkingDirectoryState = useSelector(selectWorkingDirectory)
    const reduxLanguageState = useSelector(selectLanguage)
    const reduxDependenciesState = useSelector(selectDependencies)
    const reduxProjectDescriptionState = useSelector(selectProjectDescription)
    const reduxProjectTagsState = useSelector(selectProjectTags)

    const [journeyProject, setJourneyProject] = React.useState(
        {
            title: reduxProjectTitleState,
            parentUnit: reduxParentUnitState,
            workingDirectory: reduxWorkingDirectoryState,
            language: reduxLanguageState,
            dependencies: reduxDependenciesState,
            description: reduxProjectDescriptionState,
            tags: reduxProjectTagsState
        }
    )

    const updateJourneyCreateProject = (state: JourneyCreateProjectStateUpdate) => {
        let createProjectUpdate = Object.assign({}, journeyProject);

        if (state.title !== undefined && state.title !== null) {
            createProjectUpdate.title = state.title;
        }

        if (state.parentUnit!== undefined && state.parentUnit!== null) {
            createProjectUpdate.parentUnit = state.parentUnit;
        }

        if (state.workingDirectory!== undefined && state.workingDirectory !== null) {
            createProjectUpdate.workingDirectory = state.workingDirectory;
        }

        if (state.language !== undefined && state.language !== null) {
            createProjectUpdate.language = state.language;
        }

        if (state.dependencies!== undefined && state.dependencies !== null) {
            createProjectUpdate.dependencies = state.dependencies;
        }

        if (state.description!== undefined && state.description !== null) {
            createProjectUpdate.description = state.description;
        }

        if (state.tags !== undefined && state.tags !== null) {
            createProjectUpdate.tags = state.tags;
        }

        setJourneyProject(createProjectUpdate);

        dispatch(updateJourneyCreateProjectState(state));
    }

    const clearProjectState = () => {
        dispatch(clearJourneyCreateProjectState())
        setJourneyProject({
            title: "",
            parentUnit: 0,
            workingDirectory: "",
            language: "",
            dependencies: [],
            description: "",
            tags: [],
        })
    }

    const [createUnitTags, setCreateUnitTags] = useState<Tag[]>([]);
    const [createProjTags, setCreateProjTags] = useState<Tag[]>([]);
    const [tagOptions, setTagOptions] = React.useState<Tag[]>([])
    const [innerTabValue, setInnerTabValue] = React.useState(0);
    const wsConfigOptionsBaseState = [
        {
            _id: "0",
            title: "Default",
            content: DefaultWorkspaceConfig,
            description: "Default workspace configuration provided by GIGO."
        } as WorkspaceConfig,
        journeyUnit.customWorkspaceConfigContent
    ]
    const [wsConfigOptions, setWsConfigOptions] = React.useState<WorkspaceConfig[]>(wsConfigOptionsBaseState)

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    let navigate = useNavigate();

    const [selectedTab, setSelectedTab] = useState(queryParams.get('unit') ? 'unit' : 'project');

    useEffect(() => {
        // Get the first query parameter key as the selected tab
        const firstQueryParamKey = Array.from(queryParams.keys())[0];
        setSelectedTab(firstQueryParamKey);
    }, [location.search]); // Re-run the effect when search parameters change

    const handleTabChange = (tab: React.SetStateAction<string>) => {
        setSelectedTab(tab);
        navigate(`?${tab}`);
    };


    const handleTagSearch =  async (e : any) => {
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

    const styles = {
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
        },
    };

    let renderCreateUnit = () => {
        const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
            setInnerTabValue(newValue);
        };

        return (
            <div style={{height: "auto"}}>
                <Card sx={styles.card}>
                    <Typography component={"div"} variant={"h5"}
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    paddingTop: "10px"
                                }}>
                        Create Journey Unit
                    </Typography>
                    <Tabs value={innerTabValue} onChange={handleTabChange} centered>
                        <Tab label="Unit Creation" />
                        <Tab label="Config" />
                    </Tabs>

                    {innerTabValue === 0 && (
                        <div style={{ padding: '20px' }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Title"
                                        variant="outlined"
                                        size="medium"
                                        type="text"
                                        color="primary"
                                        value={journeyUnit.title}
                                        onChange={e => {
                                            // copy initial state
                                            let updateUnitState = Object.assign({}, initialJourneyCreateUnitStateUpdate);
                                            // update title in state update
                                            updateUnitState.title = e.target.value;
                                            // execute state update
                                            updateJourneyCreateUnit(updateUnitState);
                                        }}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    />
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Unit Focus</InputLabel>
                                        <Select
                                            value={journeyUnit.unitFocus}
                                            label="Unit Focus"
                                            onChange={e => {
                                                // ensure type is number
                                                if (typeof e.target.value === "string") {
                                                    return
                                                }
                                                // copy initial state
                                                let updateUnitState = Object.assign({}, initialJourneyCreateUnitStateUpdate);
                                                // update unit focus in state update
                                                updateUnitState.unitFocus = e.target.value;
                                                // execute state update
                                                updateJourneyCreateUnit(updateUnitState);
                                            }}
                                        >
                                            <MenuItem value={0}>Frontend</MenuItem>
                                            <MenuItem value={1}>Backend</MenuItem>
                                            <MenuItem value={2}>Full Stack</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Autocomplete
                                        multiple
                                        limitTags={5}
                                        id="languagesInputSelect"
                                        options={programmingLanguages.map((_, i) => i)}
                                        getOptionLabel={(option) => programmingLanguages[option]}
                                        onChange={(e: SyntheticEvent, value: number[]) => {
                                            // copy initial state
                                            let updateUnitState = Object.assign({}, initialJourneyCreateUnitStateUpdate);
                                            // update languages in state update
                                            updateUnitState.languages = value;
                                            // execute state update
                                            updateJourneyCreateUnit(updateUnitState);
                                        }}
                                        value={journeyUnit.languages}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Languages" placeholder="Languages" />
                                        )}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    />
                                    <Autocomplete
                                        multiple
                                        limitTags={5}
                                        freeSolo
                                        id="createUnitTags"
                                        options={tagOptions}
                                        getOptionLabel={(option: Tag | string) => typeof option === "string" ? option : option.value}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Tags" placeholder="Tags" />
                                        )}
                                        onInputChange={(e, value) => {
                                            handleTagSearch(e);
                                        }}
                                        onChange={(event, value: (Tag | string)[], reason) => {
                                            // set update state tags to empty array
                                            // copy initial state
                                            let updateState = Object.assign({}, initialJourneyCreateUnitStateUpdate);

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
                                            // @ts-ignore
                                            setCreateUnitTags(updateState.tags)
                                            updateJourneyCreateUnit(updateState)
                                        }}
                                        value={createUnitTags}
                                        sx={{ width: "100%", paddingBottom: "10px" }}
                                    />
                                    <Select
                                        labelId={"tierInputLabel"}
                                        id={"tierInputSelect"}
                                        required={true}
                                        value={journeyUnit.tier >= 0 ? journeyUnit.tier : 0}
                                        label="Tier"
                                        sx={{ mb: 2, width: "100%" }}
                                        onChange={(e) => {
                                            // ensure type is number
                                            if (typeof e.target.value === "string") {
                                                return
                                            }

                                            // copy initial state
                                            let updateUnitState = Object.assign({}, initialJourneyCreateUnitStateUpdate);
                                            // update tier in state update
                                            updateUnitState.tier = e.target.value;
                                            // execute state update
                                            updateJourneyCreateUnit(updateUnitState);
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
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        id="description"
                                        required={true}
                                        variant="outlined"
                                        color="primary"
                                        label="Description"
                                        margin="normal"
                                        multiline={true}
                                        minRows={10}
                                        maxRows={10}
                                        fullWidth
                                        value={journeyUnit.description}
                                        onChange={e => {
                                            // copy initial state
                                            let updateUnitState = Object.assign({}, initialJourneyCreateUnitStateUpdate);
                                            // update description in state update
                                            updateUnitState.description = e.target.value;
                                            // execute state update
                                            updateJourneyCreateUnit(updateUnitState);
                                        }}
                                        sx={{ mt: 0 }}
                                    />
                                    <TextField
                                        label="Cost (Optional)"
                                        required={false}
                                        variant="outlined"
                                        size="medium"
                                        type="text"
                                        color="primary"
                                        onChange={e => {
                                            // copy initial state
                                            let updateUnitState = Object.assign({}, initialJourneyCreateUnitStateUpdate);
                                            // update cost in state update
                                            updateUnitState.cost = e.target.value;
                                            // execute state update
                                            updateJourneyCreateUnit(updateUnitState);
                                        }}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                            </Grid>
                            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
                                <div style={{padding: "10px"}}>
                                    <Button variant="outlined"
                                            color="primary"
                                            onClick={() => clearUnitState()}
                                            sx={{
                                                width: "10vw",
                                            }}
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {innerTabValue === 1 && (
                        <div>
                            {renderConfigEditor()}
                        </div>
                    )}
                </Card>
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
                    <div style={{padding: "10px"}}>
                        <Button variant="outlined"
                                color="primary"
                                href={"/journey/admin"}
                                sx={{
                                    width: "10vw",
                                }}
                        >
                            Dashboard
                        </Button>
                    </div>
                    <div style={{padding: "10px"}}>
                        <Button variant="contained"
                                color="primary"
                                onClick={() => createJourneyUnit()}
                                sx={{
                                    width: "10vw",
                                }}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    let renderConfigEditor = () => {
        return (
            <div>
                <WorkspaceConfigEditor
                    value={journeyUnit.workspaceConfig.content}
                    setValue={(v: string) => {
                        // skip state update if this is a template and it is unchanged
                        //@ts-ignore
                        if (journeyUnit.workspaceConfig._id !== "0" &&
                            //@ts-ignore
                            v === journeyUnit.workspaceConfig.content) {
                            return
                        }

                        // copy initial state
                        let updateState = Object.assign({}, initialJourneyCreateUnitStateUpdate);

                        // create variable to hold the config value we're going to use and assume that it is a custom config
                        let cfg = Object.assign({}, journeyUnit.customWorkspaceConfigContent) as WorkspaceConfig;
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
                        updateJourneyCreateUnitState(updateState)
                        setWsConfigOptions(opts)
                    }}
                    style={{
                        float: "left",
                        marginTop: "40px",
                        marginLeft: "40px"
                    }}
                    width={"40vw"}
                    height={"60vh"}
                />
            </div>
        )
    }

    let renderCreateProject = () => {
        const parentUnit = ["Unit 1", "Unit 2", "Unit 3", "Unit 4"]
        const dependencies = ["Dependency 1", "Dependency 2", "Dependency 3"]

        return (
            <div style={{height: "auto"}}>
                <Card sx={styles.card}>
                    <Typography component={"div"} variant={"h5"}
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    paddingTop: "10px"
                                }}>
                        Create Unit Project
                    </Typography>
                    <div style={{ padding: '20px' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Title"
                                    variant="outlined"
                                    size="medium"
                                    type="text"
                                    color="primary"
                                    value={journeyProject.title}
                                    onChange={e => {
                                        // copy initial state
                                        let updateProjectState = Object.assign({}, initialJourneyCreateProjectStateUpdate);
                                        // update title in state update
                                        updateProjectState.title = e.target.value;
                                        // execute state update
                                        updateJourneyCreateProject(updateProjectState);
                                    }}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Parent Unit</InputLabel>
                                    <Select
                                        value={journeyProject.parentUnit}
                                        required={true}
                                        label="Parent Unit"
                                        onChange={e => {
                                            // ensure type is number
                                            if (typeof e.target.value === "string") {
                                                return
                                            }
                                            // copy initial state
                                            let updateProjectState = Object.assign({}, initialJourneyCreateProjectStateUpdate);
                                            // update title in state update
                                            updateProjectState.parentUnit = e.target.value;
                                            // execute state update
                                            updateJourneyCreateProject(updateProjectState);
                                        }}
                                    >
                                        {
                                            parentUnit.map((unit, index) => (
                                                <MenuItem value={index} key={index}>
                                                    <em>{unit}</em>
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Working Directory"
                                    variant="outlined"
                                    size="medium"
                                    type="text"
                                    color="primary"
                                    onChange={e => {
                                        // copy initial state
                                        let updateProjectState = Object.assign({}, initialJourneyCreateProjectStateUpdate);
                                        // update title in state update
                                        updateProjectState.workingDirectory = e.target.value;
                                        // execute state update
                                        updateJourneyCreateProject(updateProjectState);
                                    }}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />
                                <Autocomplete
                                    multiple={false}
                                    limitTags={1}
                                    id="languagesInputSelect"
                                    options={programmingLanguages.map((_, i) => i)}
                                    getOptionLabel={(option) => programmingLanguages[option]}
                                    onChange={(event: SyntheticEvent, value: number | null) => {
                                        // Copy initial state
                                        let updateProjectState = { ...initialJourneyCreateProjectStateUpdate };
                                        // Update language in state. Check for null since single value can be deselected
                                        // Use the string representation of the language instead of the index
                                        updateProjectState.language = value !== null ? programmingLanguages[value] : ''; // Use an empty string or any default value if nothing is selected
                                        // Execute state update
                                        updateJourneyCreateProject(updateProjectState);
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Language" placeholder="Languages" />
                                    )}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />

                                <Autocomplete
                                    multiple
                                    limitTags={5}
                                    id="dependencies"
                                    options={dependencies.map((_, i) => i)}
                                    getOptionLabel={(option) => dependencies[option]}
                                    onChange={(e: SyntheticEvent, value: number[]) => {
                                        // copy initial state
                                        let updateProjectState = Object.assign({}, initialJourneyCreateProjectStateUpdate);
                                        // update dependencies in state update
                                        updateProjectState.dependencies = value;
                                        // execute state update
                                        updateJourneyCreateProject(updateProjectState);
                                    }}
                                    value={journeyProject.dependencies}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Dependencies" placeholder="Dependencies" />
                                    )}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    id="description"
                                    variant="outlined"
                                    color="primary"
                                    label="Description"
                                    margin="normal"
                                    multiline={true}
                                    minRows={10}
                                    maxRows={10}
                                    fullWidth
                                    value={journeyProject.description}
                                    onChange={e => {
                                        // copy initial state
                                        let updateProjectState = Object.assign({}, initialJourneyCreateProjectStateUpdate);
                                        // update description in state update
                                        updateProjectState.description = e.target.value;
                                        // execute state update
                                        updateJourneyCreateProject(updateProjectState);
                                    }}
                                    sx={{ mt: 0 }}
                                />
                                <Autocomplete
                                    multiple
                                    limitTags={5}
                                    freeSolo
                                    id="createUnitProjectTags"
                                    options={tagOptions}
                                    getOptionLabel={(option: Tag | string) => typeof option === "string" ? option : option.value}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Tags" placeholder="Tags" />
                                    )}
                                    onInputChange={(e, value) => {
                                        handleTagSearch(e);
                                    }}
                                    onChange={(event, value: (Tag | string)[], reason) => {
                                        // set update state tags to empty array
                                        // copy initial state
                                        let updateState = Object.assign({}, initialJourneyCreateProjectStateUpdate);

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
                                        // @ts-ignore
                                        setCreateProjTags(updateState.tags)
                                        updateJourneyCreateProject(updateState)
                                    }}
                                    value={createProjTags}
                                    sx={{ width: "100%", paddingBottom: "10px" }}
                                />
                            </Grid>
                        </Grid>
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
                            <div style={{padding: "10px"}}>
                                <Button variant="outlined"
                                        color="primary"
                                        onClick={() => clearProjectState()}
                                        sx={{
                                            width: "10vw",
                                        }}
                                >
                                    Clear All
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
                    <div style={{padding: "10px"}}>
                        <Button variant="outlined"
                                color="primary"
                                href={"/journey/admin"}
                                sx={{
                                    width: "10vw",
                                }}
                        >
                            Dashboard
                        </Button>
                    </div>
                    <div style={{padding: "10px"}}>
                        <Button variant="contained"
                                color="primary"
                                onClick={createJourneyProject}
                                sx={{
                                    width: "10vw",
                                }}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const createJourneyUnit = async () => {
        if (journeyUnit.title === "") {
            swal("Please enter a title for the Journey Unit");
            return;
        }

        if (journeyUnit.unitFocus === -1) {
            swal("Please enter a focus for the Journey Unit");
            return;
        }

        if (journeyUnit.description === "") {
            swal("Please enter a description for the Journey Unit");
            return;
        }

        // if (journeyUnit.tags.length === 0) {
        //     swal("Please enter at least one tag for the Journey Unit");
        //     return;
        // }

        if (journeyUnit.tier === -1) {
            swal("Please enter a tier for the Journey Unit");
            return;
        }

        if (journeyUnit.languages.length === 0) {
            swal("Please enter at least one language for the Journey Unit");
            return;
        }

        // let params = {
        //     title: journeyUnit.title,
        //     unit_focus: journeyUnit.unitFocus,
        //     description: journeyUnit.description,
        //     tier: journeyUnit.tier,
        //     languages: journeyUnit.languages,
        //     tags: journeyUnit.tags,
        //     project_cost: journeyUnit.cost,
        //     workspace_config_id: journeyUnit.workspaceConfig._id,
        // } as object
        //
        // let res = await call(
        //     "/api/journey/createUnit",
        //     "post",
        //     null,
        //     null,
        //     null,
        //     //@ts-ignore
        //     params,
        //     null,
        //     config.rootPath
        // )
        //
        // if (res["message"] !== "journey unit created") {
        //     swal("Error", "An error occurred while creating the unit", "error")
        //     console.log("Create Unit Error: ", res)
        // }
    }

    const createUnitAttempt = async () => {
        let params = {
            title: "Unit Attempt",
            unit_focus: journeyUnit.unitFocus,
            description: "this describes the unit attempt",
            tier: 1,
            languages: journeyUnit.languages,
            tags: journeyUnit.tags,
            parent_unit_id: "1730352056192991233",
            workspace_config_id: journeyUnit.workspaceConfig._id,
            repo_id: "270018",
            parent_unit_author_id: "1681347220214906880",
            workspace_config_revision: "false"

        } as object

        let res = await call(
            "/api/journey/createUnitAttempt",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            params,
            null,
            config.rootPath
        )


    }


    const createJourneyProject = async () => {
        if (journeyProject.title === "") {
            swal("Please enter a title for the Journey Unit");
            return;
        }

        if (journeyProject.parentUnit === -1) {
            swal("Please enter a parent unit for the Journey Unit");
            return;
        }

        if (journeyProject.workingDirectory === "") {
            swal("Please enter a working directory for the Journey Unit");
            return;
        }

        if (journeyProject.language === null) {
            swal("Please enter at least one language for the Journey Unit");
            return;
        }

        if (journeyProject.dependencies.length === 0) {
            swal("Please enter at least one tag for the Journey Unit");
            return;
        }

        if (journeyProject.description === "") {
            swal("Please enter a working directory for the Journey Unit");
            return;
        }

        // TODO use a setup close to this for providing dependencies

        const test = {
            "test_ids": ["1730243677319593984"]
        };


        let dep: string[] = [];

        if (dep.length === 0 && test["test_ids"] !== null) {
            for (let i = 0; i < test["test_ids"].length; i++) {
                dep.push(test["test_ids"][i])
            }
        }

        // let params = {
        //     title: journeyProject.title,
        //     unit_id: "1729988107912085505",
        //     working_directory: journeyProject.workingDirectory,
        //     description: journeyProject.description,
        //     languages: journeyProject.language,
        //     tags: journeyProject.tags,
        //     deps: dep,
        //     tier: 1,
        // } as object
        //
        // let res = await call(
        //     "/api/journey/createProject",
        //     "post",
        //     null,
        //     null,
        //     null,
        //     //@ts-ignore
        //     params,
        //     null,
        //     config.rootPath
        // )
        //
        // if (res["message"] !== "journey project created") {
        //     swal("Error", "An error occurred while creating the project", "error")
        //     console.log("Create Unit Error: ", res)
        // }
    }

    let renderView = () => {
        switch (selectedTab) {
            case 'unit':
                return renderCreateUnit()
            case 'project':
                return renderCreateProject()
            default:
                return renderCreateUnit()
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
                    <div style={{padding: '10px' }}>
                        <Button
                            sx={{
                                color: selectedTab === 'unit' ? 'primary' : 'default',
                                padding: '10px',
                                width: '5vw'
                            }}
                            onClick={() => handleTabChange('unit')}
                            variant="outlined"
                            disabled={selectedTab === 'unit'}
                        >
                            Unit
                        </Button>
                    </div>
                    <div style={{padding: '10px' }}>
                        <Button
                            sx={{
                                color: selectedTab === 'project' ? 'primary' : 'default',
                                padding: '10px',
                                width: '5vw'
                            }}
                            onClick={() => handleTabChange('project')}
                            variant="outlined"
                            disabled={selectedTab === 'project'}
                        >
                            Project
                        </Button>
                    </div>
                </div>
                {renderView()}
            </CssBaseline>
        </ThemeProvider>
    )
}

export default JourneyAdminCreate;