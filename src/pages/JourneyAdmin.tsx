import React, {SyntheticEvent, useEffect, useState} from 'react';
import {useAppSelector} from "../app/hooks";
import {selectAuthStateRole} from "../reducers/auth/auth";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Box,
    Card,
    createTheme,
    CssBaseline, FormControl, InputLabel,
    Modal,
    PaletteMode, Select, Tab, Tabs,
    ThemeProvider,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, IconButton, List, ListItem,
    TextField, MenuItem, Autocomplete, Grid
} from "@mui/material";
import {getAllTokens} from "../theme";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import AddIcon from '@mui/icons-material/Add';
import {programmingLanguages} from "../services/vars";
import {initialCreateProjectStateUpdate} from "../reducers/createProject/createProject";
import {WorkspaceConfig} from "../models/workspace";
import WorkspaceConfigEditor from "../components/editor/workspace_config/editor";



function JourneyAdmin() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const adminStatus = useAppSelector(selectAuthStateRole)

    const [passwordPromptOpen, setPasswordPromptOpen] = React.useState(true)
    const [password, setPassword] = useState("");
    const [title, setTitle] = useState('');
    const [unitFocus, setUnitFocus] = useState('');
    const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [tier, setTier] = useState('');
    const [optionalCost, setOptionalCost] = useState('');
    const [tabValue, setTabValue] = useState(0);

    // make sure user is admin, if not, redirect to home
    useEffect(() => {
        if (adminStatus !== 1) {
            window.location.href = "/journey/admin/create"
        }
    }, [])

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

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    // TODO: connect to backend to check official admin password
    const renderPasswordPrompt = () => (
        <Dialog open={passwordPromptOpen} onClose={() => window.location.href = "/home"}>
            <DialogTitle>Admin Authentication</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter the admin password to access this page.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Password"
                    type="password"
                    fullWidth
                    autoComplete="off"
                    value={password}
                    onChange={handlePasswordChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => window.location.href = "/home"} color="primary">
                    Cancel
                </Button>
                <Button onClick={() => setPasswordPromptOpen(false)} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );

    const [currentView, setCurrentView] = React.useState('default'); // 'default', 'createJourney', 'addProject'

    const handleAddProjectClick = () => {
        setCurrentView('addProject');
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number[]) => {
        setSelectedLanguages(newValue);
    };



    let renderJourneyFrontend = () => {
        const units = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', /* ... other units */];
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                <Accordion style={{width: "80vw"}}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>Frontend</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List style={{ width: '100%' }}>
                            {units.map((unitName, index) => (
                                <ListItem key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>{unitName}</Typography>
                                    <div>
                                        <IconButton href={`/journey/admin/unit/${1}`}>
                                            <ArticleIcon color={"primary"}/>
                                        </IconButton>
                                        <IconButton href="/journey/admin/create?project">
                                            <AddIcon color={"primary"}/>
                                        </IconButton>
                                    </div>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            </div>
        )
    }

    let renderJourneyBackend = () => {
        const units = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', /* ... other units */];
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                <Accordion style={{width: "80vw"}}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>Backend</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List style={{ width: '100%' }}>
                            {units.map((unitName, index) => (
                                <ListItem key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>{unitName}</Typography>
                                    <div>
                                        <IconButton href={`/journey/admin/unit/${1}`}>
                                            <ArticleIcon color={"primary"}/>
                                        </IconButton>
                                        <IconButton href="/journey/admin/create?project">
                                            <AddIcon color={"primary"}/>
                                        </IconButton>
                                    </div>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            </div>
        )
    }

    let renderJourneyFullStack = () => {
        const units = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', /* ... other units */];
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                <Accordion style={{width: "80vw"}}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>Full Stack</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List style={{ width: '100%' }}>
                            {units.map((unitName, index) => (
                                <ListItem key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>{unitName}</Typography>
                                    <div>
                                        <IconButton href={`/journey/admin/unit/${1}`}>
                                            <ArticleIcon color={"primary"} />
                                        </IconButton>
                                        <IconButton href="/journey/admin/create?project">
                                            <AddIcon color={"primary"}/>
                                        </IconButton>
                                    </div>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            </div>
        )
    }

    let renderOverview = () => {
        return (
            <div style={{height: "auto"}}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <Button variant="contained" color="primary" href="/journey/admin/create?unit">
                        Create Journey
                    </Button>
                </div>
                {renderJourneyFrontend()}
                {renderJourneyBackend()}
                {renderJourneyFullStack()}
            </div>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {renderOverview()}
            </CssBaseline>
        </ThemeProvider>
    )
}

export default JourneyAdmin;
