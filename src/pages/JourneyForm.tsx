import React, {useEffect, useState} from 'react';
import JourneyFormPageDeskIcon from "../components/Icons/JourneyFormPageDesk";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import {
    Button,
    createTheme,
    CssBaseline,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    PaletteMode,
    Select,
    ThemeProvider
} from "@mui/material";
import {getAllTokens} from "../theme";
import JourneyPageIcon from "../components/Icons/JourneyPage";
import {Paper, TextField} from "@material-ui/core";
import MenuItem from "@mui/material/MenuItem";
import {AwesomeButton} from "react-awesome-button";


import {
    clearJourneyFormState,
    JourneyFormStateUpdate,
    initialJourneyFormState,
    selectSection,
    selectLearningGoal,
    selectLanguageInterest,
    selectEndGoal,
    selectExperienceLevel,
    selectFamiliarityIDE,
    selectFamiliarityLinux,
    selectTriedProgramming,
    selectTriedProgrammingOnline,
    initialJourneyFormStateUpdate, updateJourneyFormState,
} from "../reducers/journeyForm/journeyForm";
import {
    clearProjectState, CreateProjectStateUpdate,
    initialCreateProjectStateUpdate,
    updateCreateProjectState
} from "../reducers/createProject/createProject";
import {DefaultWorkspaceConfig, WorkspaceConfig} from "../models/workspace";
import {useSelector} from "react-redux";
import JourneyFormOneIcon from "../components/Icons/journeyForms/Forms1";
import JourneyFormTwoIcon from "../components/Icons/journeyForms/Forms2";
import JourneyFormThreeIcon from "../components/Icons/journeyForms/Forms3";
import JourneyFormFourIcon from "../components/Icons/journeyForms/Forms4";
import JourneyFormFiveIcon from "../components/Icons/journeyForms/Forms5";
import JourneyFormSixIcon from "../components/Icons/journeyForms/Forms6";
import JourneyFormSevenIcon from "../components/Icons/journeyForms/Forms7";
import {useNavigate} from "react-router-dom";

function JourneyForm() {
    // const [formData, setFormData] = useState({
    //     learningGoal: '',
    //     languageInterest: '',
    //     endGoal: '',
    //     experienceLevel: '',
    //     familiarityIDE: '',
    //     familiarityLinux: '',
    //     triedProgramming: '',
    //     triedProgrammingOnline: '',
    // });

    const dispatch = useAppDispatch();

    const reduxSectionState = useSelector(selectSection);
    const reduxLearningGoal = useSelector(selectLearningGoal);
    const reduxLanguageInterest = useSelector(selectLanguageInterest);
    const reduxEndGoal = useSelector(selectEndGoal);
    const reduxExperienceLevel = useSelector(selectExperienceLevel);
    const reduxTriedProgramming = useSelector(selectTriedProgramming);
    const reduxTriedProgrammingOnline = useSelector(selectTriedProgrammingOnline);
    const reduxFamiliarityIDE = useSelector(selectFamiliarityIDE);
    const reduxFamiliarityLinux = useSelector(selectFamiliarityLinux);

    const [dialogOpen, setDialogOpen] = useState(false);


    const [section, setSection] = React.useState<number>(reduxSectionState === null ? 0 : reduxSectionState)

    const [journeyForm, setJourneyForm] = React.useState(
            {

                learningGoal: reduxLearningGoal,
                languageInterest: reduxLanguageInterest,
                endGoal: reduxEndGoal,
                experienceLevel: reduxExperienceLevel,
                triedProgramming: reduxTriedProgramming,
                triedProgrammingOnline: reduxTriedProgrammingOnline,
                familiarityIDE: reduxFamiliarityIDE,
                familiarityLinux: reduxFamiliarityLinux,
            }

    )

    /**
     * Performs state update for section state using local state hooks and relays the updates to the redux storage
     */
    const updateSectionState = (state: number) => {
        // deep copy initial update state
        let updateState = Object.assign({}, initialJourneyFormStateUpdate);

        // update section
        updateState.section = state

        // execute local state hook
        setSection(state)

        // update redux storage with new state
        dispatch(updateJourneyFormState(updateState))
    }


    // window.addEventListener('beforeunload', (event) => {
    //     if (window.location.href.includes('create-project')) {
    //         window.sessionStorage.setItem('exclusiveProject', "false")
    //         updateSectionState(0)
    //     }
    // });


    // const handleChange = (e: any) => {
    //     const {name, value} = e.target;
    //     setJourneyForm({
    //         ...journeyForm,
    //         [name]: value,
    //     });
    // };

    // const handleSubmit = (e: any) => {
    //     e.preventDefault();
    //     console.log('Form data submitted:', formData);
    // };
    const updateJourneyForm = (state: JourneyFormStateUpdate) => {
        // deep copy createProjectForm to local state copy to augment the local stat
        let formUpdate = Object.assign({}, journeyForm);

        // conditionally update each field in the createProjectForm state depending on which values were passed

        if (state.learningGoal !== '') {
            formUpdate.learningGoal = state.learningGoal;
        }

        if (state.languageInterest !== '') {
            formUpdate.languageInterest = state.languageInterest;
        }

        if (state.endGoal !== null) {
            formUpdate.endGoal = state.endGoal;
        }

        if (state.experienceLevel !== null) {
            formUpdate.experienceLevel = state.experienceLevel;
        }

        if (state.familiarityLinux !== null) {
            formUpdate.familiarityLinux = state.familiarityLinux;
        }

        if (state.familiarityIDE !== null) {
            formUpdate.familiarityIDE = state.familiarityIDE;
        }

        if (state.triedProgramming !== null) {
            formUpdate.triedProgramming = state.triedProgramming;
        }

        if (state.triedProgrammingOnline !== null) {
            formUpdate.triedProgrammingOnline = state.triedProgrammingOnline;
        }


        // execute local state update with the createProjectForm update
        setJourneyForm(formUpdate);


        // update redux storage with new state
        dispatch(updateJourneyFormState(state));
    }


    const clearState = () => {
        dispatch(clearJourneyFormState())
        setJourneyForm({
            learningGoal: '',
            languageInterest: '',
            endGoal: '',
            experienceLevel: '',
            familiarityIDE: '',
            familiarityLinux: '',
            triedProgramming: '',
            triedProgrammingOnline: '',
        });
    }

    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    console.log("theme: ", theme);
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

    const aspectRatio = useAspectRatio();
    console.log("aspectRatio: ", aspectRatio);

    const iconContainerStyles: React.CSSProperties = {
        width:
            sidebarOpen
                ? 'calc(95vw - 15vw)'
                : chatOpen ? 'calc(95vw - 15vw)'
                    : '95vw',
        height: '65vh', // Set to 100% of viewport height
        position: 'relative',
        zIndex: 0,
        left: '2%',
    };

    const iconDeskContainerStyles: React.CSSProperties = {
        width:
            sidebarOpen
                ? 'calc(95vw - 15vw)'
                : chatOpen ? 'calc(95vw - 15vw)'
                    : '95vw',
        height: '80vh', // Set to 100% of viewport height
        position: 'relative',
        zIndex: 0,
        left: '2%',
    };

    const vignetteStyles: React.CSSProperties = {
        width:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? 'calc(80vw - 15vw)'
                    : chatOpen ? 'calc(80vw - 17vw)'
                        : '80vw'
            :
                sidebarOpen
                    ? 'calc(87vw - 15vw)'
                    : chatOpen ? 'calc(87vw - 17vw)'
                        : '80vw',
        height:
            aspectRatio === '21:9' ?
                sidebarOpen ? 'calc(87vh - 64px)'
                : chatOpen ? 'calc(87vh - 64px)'
                    : 'calc(87vh - 64px)'
            :
                sidebarOpen ? 'calc(90vh - 64px)'
                    : chatOpen ? 'calc(89vh - 64px)'
                        : 'calc(87vh - 64px)',
        background: `radial-gradient(circle, rgba(0,0,0,0) 40%, ${hexToRGBA(theme.palette.background.default)} 65%, ${hexToRGBA(theme.palette.background.default)} 83%), linear-gradient(180deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 52%, ${hexToRGBA(theme.palette.background.default)} 92%, ${hexToRGBA(theme.palette.background.default)}), linear-gradient(0deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 52%, ${hexToRGBA(theme.palette.background.default)} 92%, ${hexToRGBA(theme.palette.background.default)})`, // Vignette gradient
        position: 'absolute',
        left:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? '9.5%'
                    : chatOpen ? '11.5%'
                    : '8%'
            :
                sidebarOpen
                    ? '4.5%'
                    : chatOpen ? '6%'
                        : '8%',
        top:
            aspectRatio === '21:9' ?
                sidebarOpen
                ? '-15%'
                : chatOpen ? '-15%'
                : '0%'
            :
                sidebarOpen
                    ? '0%'
                    : chatOpen ? '0%'
                        : '0%',
        bottom: (aspectRatio !== '21:9') && (sidebarOpen || chatOpen) ? '-1%' : '0%',
        zIndex: 2, // Set a higher zIndex to appear above the SVG
    };


    const vignetteFormStyles: React.CSSProperties = {
        width:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? 'calc(80vw - 15vw)'
                    : chatOpen ? 'calc(80vw - 17vw)'
                        : '80vw'
            :
                sidebarOpen
                    ? 'calc(90vw - 15vw)'
                    : chatOpen ? 'calc(90vw - 17vw)'
                        : '90vw',
        height:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? 'calc(25vw - 64px)'
                    : chatOpen? 'calc(25vw - 64px)'
                    : 'calc(80vh - 64px)'
            :
                sidebarOpen
                    ? 'calc(35vw - 64px)'
                    : chatOpen? 'calc(35vw - 64px)'
                        : 'calc(85vh - 64px)',
        background: `radial-gradient(circle, rgba(0,0,0,0) 40%, ${hexToRGBA(theme.palette.background.default)} 65%, ${hexToRGBA(theme.palette.background.default)} 83%), linear-gradient(180deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 52%, ${hexToRGBA(theme.palette.background.default)} 92%, ${hexToRGBA(theme.palette.background.default)}), linear-gradient(0deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 52%, ${hexToRGBA(theme.palette.background.default)} 92%, ${hexToRGBA(theme.palette.background.default)})`, // Vignette gradient
        position: 'absolute',
        left:
            aspectRatio === '21:9' ?
                sidebarOpen
                    ? '9.5%'
                    : chatOpen ? '11.5%'
                        : '8%'
            :
                sidebarOpen
                    ? '1%'
                    : chatOpen ? '1%'
                        : '2%',
        top: sidebarOpen
            ? '0%'
            : chatOpen ? '0%'
                : '0%',
        bottom: (aspectRatio !== '21:9') && (sidebarOpen || chatOpen) ? '-1%' : '0%',
        zIndex: 2, // Set a higher zIndex to appear above the SVG
    };

    const mainDivStyles: React.CSSProperties = {
        position: 'relative',
        height: 'calc(95vh-64px)',
        overflow: 'hidden'
    }

    const iconStyles: React.CSSProperties = {
        width: '95%',
        height: '110%',
    };

    const formIconStyles: React.CSSProperties = {
        width: '100%',
        height: '100%',
    };

    const formStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        width: '50%',
        margin: 'auto',
        padding: '20px',
        paddingTop: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 4,
    };

    const labelStyle: React.CSSProperties = {
        marginBottom: '8px',
        fontSize: '16px',
        fontWeight: '600',
    };

    const inputStyle: React.CSSProperties = {
        marginBottom: '20px',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.primary.contrastText,
        justifyContent: 'center'

    };

    const buttonStyle: React.CSSProperties = {
        padding: '10px 20px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: '#fff',
        fontWeight: '600',
        cursor: 'pointer',
    };

    let sectionSwitch = () => {
        console.log("sectionSwitch: ", section);
        switch (section) {
            case -1:
                return renderLearningGoalSection()
            case 0:
                return renderLanguageInterest()
            case 1:
                return renderEndGoal()
            case 2:
                return renderExperienceLevel()
            case 3:
                return renderFamiliarityIDE()
            case 4:
                return renderFamiliarityLinux()
            case 5:
                return renderTriedProgramming()
            case 6:
                return renderTriedProgrammingOnline()
            default:
                return renderLearningGoalSection()
        }
    }

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const [aptitudeDialogOpen, setAptitudeDialogOpen] = useState(false);
    // ... (other state variables, methods)

    const handleAptitudeDialogClose = () => {
        setAptitudeDialogOpen(false);
    };

    const handleAptitudeDialogOpen = () => {
        setAptitudeDialogOpen(true);
    };


    const navigate = useNavigate();


    let renderLearningGoalSection = () => {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline>

                    <div style={mainDivStyles}> {/* Container div */}

                        {/* Icon Container */}
                        <div  style={iconDeskContainerStyles}>
                            <div style={vignetteStyles}/> {/* Vignette overlay */}
                            <JourneyFormPageDeskIcon style={iconStyles} aspectRatio={aspectRatio.toString()} />
                        </div>

                        {/* Form Description */}
                        <div style={{
                            position: 'absolute',
                            top: sidebarOpen
                                ? '55%'
                                : chatOpen ? '55%'
                                    : '61%',
                            zIndex: 4,
                            fontSize: '16px',
                            width: '40%',
                            left: sidebarOpen
                                ? '26%'
                                : chatOpen ? '28%'
                                    : '28%',
                            textAlign: 'center'
                        }}>
                            <h1>GIGO Journey Experience Form</h1>
                            <p>
                                The purpose of this form is to customize the GIGO Journey experience according to your individual requirements and proficiency level. We kindly request that you provide the necessary information in the fields provided below. By doing so, we will be able to ensure that your experience with GIGO Journey is optimized to meet your unique needs.
                            </p>
                        </div>
                        <Paper elevation={3} style={{
                            padding: '20px',
                            borderRadius: '15px',

                            color: theme.palette.primary.contrastText,
                            boxShadow: 'none'
                        }}>
                            <Grid container spacing={16}
                                  style={{

                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      position: 'absolute',
                                      bottom: sidebarOpen
                                              ? '9vh'
                                              : chatOpen ? '9vh'
                                              : '6vh',
                                      left: sidebarOpen
                                          ? '-5%'
                                          : chatOpen ? '-3.5%'
                                              : '1%',
                            }}>
                                <br/>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <InputLabel id={"learningGoalLabel"}>Why do you want learn programming?</InputLabel>
                                        <Select
                                            fullWidth
                                            name="learningGoal"
                                            required={true}
                                            value={journeyForm.learningGoal}
                                            onChange={(e) => {
                                                console.log("learningGoal: ", e.target.value);
                                                // copy initial state
                                                let updateState = Object.assign({}, initialJourneyFormState);
                                                // update description in state update
                                                updateState.learningGoal = e.target.value;
                                                // execute state update
                                                updateJourneyForm(updateState)
                                            }}
                                            labelId={"learningGoalLabel"}
                                            label={"Why do you want learn programming?"}
                                            sx={{
                                                width: "45vw",
                                            }}
                                        >
                                            <MenuItem value="Hobby">As a creative avenue/hobby</MenuItem>
                                            <MenuItem value="PossibleDeveloper">As a brain-stimulating activity with the
                                                possibility of occupation</MenuItem>
                                            <MenuItem value="FullDev">To get employed as a programmer/developer as quick as
                                                possible</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}
                                  style={{paddingTop: '20px',
                                      top: '92%',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      position: 'absolute',
                                      left: sidebarOpen
                                          ? '-3%'
                                          : chatOpen ? '-2%'
                                              : '1%',}}>
                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            if (journeyForm.learningGoal === '') {
                                                setDialogOpen(true);
                                            } else {
                                                updateSectionState(0);
                                            }
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Next

                                        </AwesomeButton>
                                    </div>
                                        <Dialog open={dialogOpen} onClose={handleDialogClose}>
                                            <DialogTitle>Empty Learning Goal</DialogTitle>
                                            <DialogContent>
                                                <DialogContentText>
                                                    The learning goal cannot be empty.
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={handleDialogClose} color="primary">
                                                    Close
                                                </Button>
                                            </DialogActions>
                                        </Dialog>

                                </Grid>
                            </Grid>
                        </Paper>
                    </div>
                </CssBaseline>
            </ThemeProvider>
        );
    }


    let renderLanguageInterest = () => {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <div style={mainDivStyles}>
                        <Paper elevation={3} style={{
                            padding: '20px',
                            borderRadius: '15px',
                            color: theme.palette.primary.contrastText
                        }}>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <br/>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <InputLabel id={"languageInterestLabel"}>What language are you interested in learning?</InputLabel>
                                        <Select
                                            fullWidth
                                            name="languageInterest"
                                            required={true}
                                            value={journeyForm.languageInterest}
                                            onChange={(e) => {
                                                // copy initial state
                                                let updateState = Object.assign({}, initialJourneyFormState);
                                                // update description in state update
                                                updateState.languageInterest = e.target.value;
                                                // execute state update
                                                updateJourneyForm(updateState)
                                            }}
                                            labelId={"languageInterestLabel"}
                                            label={"What language are you interested in learning?"}
                                            sx={{
                                                width: "45vw",
                                            }}
                                        >
                                            <MenuItem value="Python">Python</MenuItem>
                                            <MenuItem value="Golang">Golang</MenuItem>
                                            <MenuItem value="Javascript">Javascript</MenuItem>
                                            <MenuItem value="Typescript">Typescript</MenuItem>
                                            <MenuItem value="Cpp">C++</MenuItem>
                                            <MenuItem value="CSharp">C#</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                            <MenuItem value="Undecided">I don't know</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>

                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            console.log("clicked back")
                                            updateSectionState(-1);
                                            let updateState = Object.assign({}, initialJourneyFormStateUpdate);
                                            console.log("current state: ", updateState.section);
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Back
                                        </AwesomeButton>
                                    </div>
                                    <Dialog open={dialogOpen} onClose={handleDialogClose}>
                                        <DialogTitle>Empty Language</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>
                                                Please fill out the language option.
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleDialogClose} color="primary">
                                                Close
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Grid>

                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            if (journeyForm.learningGoal === '') {
                                                setDialogOpen(true);
                                            } else {
                                                updateSectionState(1);
                                            }
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Next

                                        </AwesomeButton>
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <div id={'jar-box'} style={iconContainerStyles}>
                                        <div id={'jar-vignette'} style={vignetteFormStyles}/>
                                        {/* Vignette overlay */}
                                        <JourneyFormOneIcon id={'actual-jar'} style={formIconStyles} aspectRatio={aspectRatio.toString()}/>
                                    </div>
                                </Grid>
                            </Grid>

                        </Paper>
                    </div>
                </CssBaseline>
            </ThemeProvider>
        );
    }


    let renderEndGoal = () => {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <div style={mainDivStyles}>
                        <Paper elevation={3} style={{
                            padding: '20px',
                            borderRadius: '15px',

                            color: theme.palette.primary.contrastText
                        }}>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <br/>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <InputLabel id={"endGoalLabel"}>What is your end goal interest?</InputLabel>
                                        <Select
                                            labelId={"endGoalLabel"}
                                            label="What is your end goal interest?"
                                            onChange={(e) => {
                                                // copy initial state
                                                let updateState = Object.assign({}, initialJourneyFormState);
                                                // update description in state update
                                                updateState.endGoal = e.target.value;
                                                // execute state update
                                                updateJourneyForm(updateState)
                                            }}
                                            fullWidth
                                            name="endGoal"
                                            value={journeyForm.endGoal}
                                            sx={{
                                                width: "45vw",
                                            }}
                                        >
                                            <MenuItem value="FrontendDevelopment">Frontend: Web Development, App Design, UI/UX,
                                                etc</MenuItem>
                                            <MenuItem value="BackendDevelopment">Backend: Program Development, Data Science, API
                                                Utilization, etc</MenuItem>
                                            <MenuItem value="ComputerScienceBackend">Computer Science: Machine Learning, System
                                                Design, Computer Architecture, Theory, etc</MenuItem>
                                            <MenuItem value="FullStackDevelopment">Full Stack: A little of everything</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            updateSectionState(0);
                                            let updateState = Object.assign({}, initialJourneyFormStateUpdate);
                                            console.log("current state: ", updateState.section);
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Back
                                        </AwesomeButton>
                                    </div>
                                    <Dialog open={dialogOpen} onClose={handleDialogClose}>
                                        <DialogTitle>Empty end goal</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>
                                                Please fill out the end goal field.
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleDialogClose} color="primary">
                                                Close
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Grid>
                                <Grid item xs={3}>

                                    <div
                                        onClick={() => {
                                            if (journeyForm.learningGoal === '') {
                                                setDialogOpen(true);
                                            } else {
                                                updateSectionState(2);
                                            }
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Next

                                        </AwesomeButton>
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <div style={iconContainerStyles}>
                                        <div style={vignetteFormStyles}/>
                                        {/* Vignette overlay */}
                                        <JourneyFormTwoIcon style={formIconStyles} aspectRatio={aspectRatio.toString()}/>
                                    </div>
                                </Grid>

                            </Grid>
                        </Paper>
                    </div>
                </CssBaseline>
            </ThemeProvider>
        );
    }

    let renderExperienceLevel = () => {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <div style={mainDivStyles}>
                        <Paper elevation={3} style={{
                            padding: '20px',
                            borderRadius: '15px',
                            color: theme.palette.primary.contrastText
                        }}>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <br/>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <InputLabel id={"experienceLevelLabel"}>What is your experience level in programming?</InputLabel>
                                        <Select
                                            labelId={"experienceLevelLabel"}
                                            label="What is your experience level in programming?"
                                            fullWidth
                                            name="experienceLevel"
                                            value={journeyForm.experienceLevel}
                                            onChange={(e) => {
                                                // copy initial state
                                                let updateState = Object.assign({}, initialJourneyFormState);
                                                // update description in state update
                                                updateState.experienceLevel = e.target.value;
                                                // execute state update
                                                updateJourneyForm(updateState)
                                            }}
                                            sx={{
                                                width: "45vw",
                                            }}
                                        >
                                            <MenuItem value="No Experience">I have no prior experience in programming (0hrs of
                                                experience)</MenuItem>
                                            <MenuItem value="Beginner">I have a little experience in one or two languages (1 - 10hrs
                                                of experience)</MenuItem>
                                            <MenuItem value="Intermediate">I have completed a few projects in multiple languages and
                                                have some basic understanding of advanced concepts (10 - 400hrs of
                                                experience)</MenuItem>
                                            <MenuItem value="Advanced">I have extensive experience of a wide variety of different
                                                programming disciplines (+400hrs of experience)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            updateSectionState(1);
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Back
                                        </AwesomeButton>
                                    </div>
                                    <Dialog open={dialogOpen} onClose={handleDialogClose}>
                                        <DialogTitle>Empty experience level</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>
                                                Please fill out the experience level field.
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleDialogClose} color="primary">
                                                Close
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Grid>
                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            if (journeyForm.learningGoal === '') {
                                                setDialogOpen(true);
                                            } else {
                                                updateSectionState(3);
                                            }
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Next

                                        </AwesomeButton>
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <div style={iconContainerStyles}>
                                        <div style={vignetteFormStyles}/>
                                        {/* Vignette overlay */}
                                        <JourneyFormThreeIcon style={formIconStyles} aspectRatio={aspectRatio.toString()}/>
                                    </div>
                                </Grid>
                            </Grid>
                        </Paper>
                    </div>
                </CssBaseline>
            </ThemeProvider>
        );
    }


    let renderFamiliarityIDE = () => {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <div style={mainDivStyles}>
                        <Paper elevation={3} style={{
                            padding: '20px',
                            borderRadius: '15px',
                            color: theme.palette.primary.contrastText
                        }}>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <br/>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <InputLabel id={"familiarityIDELabel"}>How familiar are you with IDEs (Integrated Development Environments)?</InputLabel>
                                        <Select
                                            label="How familiar are you with IDEs (Integrated Development Environments)?"
                                            labelId={"familiarityIDELabel"}
                                            fullWidth
                                            name="familiarityIDE"
                                            value={journeyForm.familiarityIDE}
                                            onChange={(e) => {
                                                // copy initial state
                                                let updateState = Object.assign({}, initialJourneyFormState);
                                                // update description in state update
                                                updateState.familiarityIDE = e.target.value;
                                                // execute state update
                                                updateJourneyForm(updateState)
                                            }}
                                            sx={{
                                                width: "45vw",
                                            }}
                                        >
                                            <MenuItem value="No Experience">I have no prior experience using IDEs</MenuItem>
                                            <MenuItem value="Eclipse">I have used Eclipse before</MenuItem>
                                            <MenuItem value="JetBrains">I have used JetBrains IDEs (Pycharm, IntelliJ, Golang,
                                                Webstorm, etc.)</MenuItem>
                                            <MenuItem value="Visual Studio">I have used Visual Studio</MenuItem>
                                            <MenuItem value="Other">I have used other IDEs (Xcode, AWS Cloud9, Corretto, Notepad++,
                                                etc.)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            updateSectionState(2);
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Back
                                        </AwesomeButton>
                                    </div>
                                    <Dialog open={dialogOpen} onClose={handleDialogClose}>
                                        <DialogTitle>Empty familiarity field</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>
                                                Please fill out the IDE familiarity field.
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleDialogClose} color="primary">
                                                Close
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Grid>
                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            if (journeyForm.learningGoal === '') {
                                                setDialogOpen(true);
                                            } else {
                                                updateSectionState(4);
                                            }
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Next

                                        </AwesomeButton>
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <div style={iconContainerStyles}>
                                        <div style={vignetteFormStyles}/>
                                        {/* Vignette overlay */}
                                        <JourneyFormFourIcon style={formIconStyles} aspectRatio={aspectRatio.toString()}/>
                                    </div>
                                </Grid>
                            </Grid>
                        </Paper>
                    </div>
                </CssBaseline>
            </ThemeProvider>
        );
    }


    let renderFamiliarityLinux = () => {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <div style={mainDivStyles}>
                        <Paper elevation={3} style={{
                            padding: '20px',
                            borderRadius: '15px',
                            color: theme.palette.primary.contrastText
                        }}>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <br/>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <InputLabel id={"familiarityLinuxLabel"}>Why do you want learn programming?</InputLabel>
                                        <Select
                                            labelId={"familiarityLinuxLabel"}
                                            label="How familiar are you with the Linux OS?"
                                            fullWidth
                                            name="familiarityLinux"
                                            value={journeyForm.familiarityLinux}
                                            onChange={(e) => {
                                                // copy initial state
                                                let updateState = Object.assign({}, initialJourneyFormState);
                                                // update description in state update
                                                updateState.familiarityLinux = e.target.value;
                                                // execute state update
                                                updateJourneyForm(updateState)
                                            }}
                                            sx={{
                                                width: "45vw",
                                            }}

                                        >
                                            <MenuItem value="No Experience">I have no prior experience or I have not heard of Linux
                                                before</MenuItem>
                                            <MenuItem value="Beginner">I have seen Linux before but have not used it much</MenuItem>
                                            <MenuItem value="Intermediate">I have used Linux a fair bit and know some enough
                                                terminal commands to get by</MenuItem>
                                            <MenuItem value="Advanced">I have used Linux a significant amount and feel that I can
                                                hold my own on any task in Linux.</MenuItem>
                                            <MenuItem value="Other">I have used shell commands in other Linux alternatives (Windows
                                                Powershell, Windows Terminal, Mac Terminal, etc.)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            updateSectionState(3);
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Back
                                        </AwesomeButton>
                                    </div>
                                    <Dialog open={dialogOpen} onClose={handleDialogClose}>
                                        <DialogTitle>Empty familiarity field</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>
                                                Please fill out the Linux familiarity field.
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleDialogClose} color="primary">
                                                Close
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Grid>
                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            if (journeyForm.learningGoal === '') {
                                                setDialogOpen(true);
                                            } else {
                                                updateSectionState(5);
                                            }
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Next

                                        </AwesomeButton>
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <div style={iconContainerStyles}>
                                        <div style={vignetteFormStyles}/>
                                        {/* Vignette overlay */}
                                        <JourneyFormFiveIcon style={formIconStyles} aspectRatio={aspectRatio.toString()}/>
                                    </div>
                                </Grid>
                            </Grid>
                        </Paper>
                    </div>
                </CssBaseline>
            </ThemeProvider>
        );
    }

    let renderTriedProgramming = () => {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <div style={mainDivStyles}>
                        <Paper elevation={3} style={{
                            padding: '20px',
                            borderRadius: '15px',
                            color: theme.palette.primary.contrastText
                        }}>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <br/>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <InputLabel id={"triedProgrammingLabel"}>Have you tried to learn programming before?</InputLabel>
                                        <Select
                                            labelId={"triedProgrammingLabel"}
                                            label="Have you tried to learn programming before?"
                                            fullWidth
                                            name="triedProgramming"
                                            value={journeyForm.triedProgramming}
                                            onChange={(e) => {
                                                // copy initial state
                                                let updateState = Object.assign({}, initialJourneyFormState);
                                                // update description in state update
                                                updateState.triedProgramming = e.target.value;
                                                // execute state update
                                                updateJourneyForm(updateState)
                                            }}
                                            sx={{
                                                width: "45vw",
                                            }}
                                        >
                                            <MenuItem value="Tried">I have tried to learn programming before</MenuItem>
                                            <MenuItem value="NotTried">I have not tried to learn programming before</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            updateSectionState(4);
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Back
                                        </AwesomeButton>
                                    </div>
                                    <Dialog open={dialogOpen} onClose={handleDialogClose}>
                                        <DialogTitle>Empty experience field</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>
                                                Please fill out the tried programming field.
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleDialogClose} color="primary">
                                                Close
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Grid>

                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            if (journeyForm.learningGoal === '') {
                                                setDialogOpen(true);
                                            } else {
                                                updateSectionState(6);
                                            }
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Next

                                        </AwesomeButton>
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <div style={iconContainerStyles}>
                                        <div style={vignetteFormStyles}/>
                                        {/* Vignette overlay */}
                                        <JourneyFormSixIcon style={formIconStyles} aspectRatio={aspectRatio.toString()}/>
                                    </div>
                                </Grid>
                            </Grid>
                        </Paper>
                    </div>
                </CssBaseline>
            </ThemeProvider>
        );
    }

    let renderTriedProgrammingOnline = () => {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <div style={mainDivStyles}>
                        <Paper elevation={3} style={{
                            padding: '20px',
                            borderRadius: '15px',
                            color: theme.palette.primary.contrastText
                        }}>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>
                                <br/>
                                <Grid item xs={6}>
                                    <FormControl>
                                        <InputLabel id={"triedProgrammingOnlineLabel"}>Have you tried to learn programming online before?</InputLabel>
                                        <Select
                                            labelId={"triedProgrammingOnlineLabel"}
                                            label="Have you tried to learn programming online before?"
                                            fullWidth
                                            name="triedProgrammingOnline"
                                            value={journeyForm.triedProgrammingOnline}
                                            onChange={(e) => {
                                                // copy initial state
                                                let updateState = Object.assign({}, initialJourneyFormState);
                                                // update description in state update
                                                updateState.triedProgrammingOnline = e.target.value;
                                                // execute state update
                                                updateJourneyForm(updateState)
                                            }}
                                            sx={{
                                                width: "45vw",
                                            }}
                                        >
                                            <MenuItem value="Tried">I have tried to learn programming online</MenuItem>
                                            <MenuItem value="NotTried">I have not tried to learn programming online</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}
                                  style={{justifyContent: 'center', alignItems: 'center', paddingTop: '20px'}}>

                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            updateSectionState(5);
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Back
                                        </AwesomeButton>
                                    </div>
                                    <Dialog open={dialogOpen} onClose={handleDialogClose}>
                                        <DialogTitle>Empty programming experience online field</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>
                                                Please fill out the tried programming online field.
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleDialogClose} color="primary">
                                                Close
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Grid>

                                <Grid item xs={3}>
                                    <div
                                        onClick={() => {
                                            if (journeyForm.learningGoal === '') {
                                                setDialogOpen(true);
                                            } else {
                                                setAptitudeDialogOpen(true);
                                            }
                                        }}
                                    >
                                        <AwesomeButton style={{
                                            width: "30%", height: "100%", left: '32%',
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary"
                                        >
                                            Next

                                        </AwesomeButton>
                                    </div>
                                </Grid>
                                <Dialog open={aptitudeDialogOpen} onClose={handleAptitudeDialogClose}>
                                    <DialogTitle>Aptitude Test</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Would you like to take an aptitude test?
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => {
                                            // Handle "No" button click
                                            handleAptitudeDialogClose();
                                        }} color="primary">
                                            No
                                        </Button>
                                        <Button onClick={() => {
                                            // Handle "Yes" button click
                                            // Navigate to the aptitude test or set up state accordingly
                                             navigate("/journey/quiz")
                                        }} color="primary">
                                            Yes
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                                <Grid item xs={12}>
                                    <div style={iconContainerStyles}>
                                        <div style={vignetteFormStyles}/>
                                        {/* Vignette overlay */}
                                        <JourneyFormSevenIcon style={formIconStyles} aspectRatio={aspectRatio.toString()}/>
                                    </div>
                                </Grid>
                            </Grid>
                        </Paper>
                    </div>
                </CssBaseline>
            </ThemeProvider>
        );
    }





    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {sectionSwitch()}
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

export default JourneyForm;