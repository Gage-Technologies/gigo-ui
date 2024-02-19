import React, {useEffect} from "react";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Button,
    Chip,
    createTheme, CssBaseline, Grid, IconButton,
    PaletteMode, Paper, ThemeProvider, Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {selectAuthStateRole} from "../reducers/auth/auth";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArticleIcon from "@mui/icons-material/Article";

function JourneyAdminProject() {
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

    const testProject = {
        title: "Performance Optimization",
        parentUnit: "Advanced React Patterns",
        tags: ["JavaScript", "Dashboard"],
        workingDir: "/projects/data-dashboard",
        description: "A real-time dashboard for visualiziics. A reeal-time dashboard for visualizing streaming data. It integrates with multiple data sources and provides interactive visual analytics. ng streaming data. It integrates with multiple data sources and provides interactive visual analytics. A reeal-time dashboard for visualizing streaming data. It integrates with multiple data sources and provides interactive visual analytics. A real-time dashboard for visualizing streaming data. It integrates with multiple data sources and provides interactive visual analytics.",
        dependencies: [
            {
                name: "Context API Integration",
                language: "JavaScript",
                details: "An in-depth project to integrate the Context API for state management in a complex application.",
            },
            {
                name: "Reusable Component Library",
                language: "TypeScript",
                details: "Developing a library of reusable components implementing various design patterns.",
            },
        ]
    };


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Grid container spacing={2} justifyContent="center">
                    {/* Title */}
                    <Grid item xs={12}>
                        <Typography variant="h3" align="center" gutterBottom>
                            {testProject.title}
                        </Typography>
                    </Grid>

                    {/* Parent Unit, Tags, and Working Directory */}
                    <Grid item container xs={12} md={8} spacing={2} direction="column">
                        <Grid item>
                            <Paper elevation={3} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
                                <div>
                                    <Typography variant="h5">Parent Unit</Typography>
                                    <Typography variant="body1">{testProject.parentUnit}</Typography>
                                </div>
                                <IconButton href={`/journey/admin/unit/${1}`}>
                                    <ArticleIcon />
                                </IconButton>
                            </Paper>
                        </Grid>


                        <Grid item>
                            <Typography variant="h5">Tags</Typography>
                            <Grid container spacing={1}>
                                {testProject.tags.map((tag, index) => (
                                    <Grid item key={index}>
                                        <Chip label={tag} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        <Grid item>
                            <Paper elevation={3} sx={{ padding: 2 }}>
                                <Typography variant="h5">Working Directory</Typography>
                                <Typography variant="body1">{testProject.workingDir}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={3} sx={{ padding: 2 }}>
                            <Typography variant="h5">Description</Typography>
                            <Typography variant="body1">{testProject.description}</Typography>
                        </Paper>
                    </Grid>

                    {/* Dependencies */}
                    <Grid item xs={12} md={8}>
                        <Grid item container xs={12} md={12} justifyContent="space-between" alignItems="center" sx={{ paddingTop: 2 }}>
                            <Grid item>
                                <Typography variant="h5">Dependencies</Typography>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" color="primary" startIcon={<AddIcon />} >
                                    Add Dependencies
                                    {/* TODO make into a popup*/}
                                </Button>
                            </Grid>
                        </Grid>
                        {testProject.dependencies.map((project, index) => (
                            <Accordion key={index}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">{project.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body1">Language: {project.language}</Typography>
                                    <Button variant="contained" sx={{ float: 'right' }} onClick={() => {/* handleMoreDetails */}}>
                                        Project Details
                                    </Button>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Grid>
                </Grid>
            </CssBaseline>
        </ThemeProvider>
    )
}

export default JourneyAdminProject;
