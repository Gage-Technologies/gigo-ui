import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import {getAllTokens} from "../theme";
import {useAppSelector} from "../app/hooks";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import {MenuItem, PaletteMode, Select, SelectChangeEvent, Typography} from "@mui/material";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {inspect} from "util";
import Lottie from "react-lottie";
import ProjectCard from "../components/ProjectCard";
import * as animationData from "../img/85023-no-data.json";
import AddCuratedProjectPopup from "../components/AddCuratedProjectPopup";

const CurateAdminPage: React.FC = () => {
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    let navigate = useNavigate();
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);

    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [passwordPromptOpen, setPasswordPromptOpen] = useState(true);
    const [proficiencyFilter, setProficiencyFilter] = useState<number>(3);
    const [languageFilter, setLanguageFilter] = useState<number>(0);
    const [curatedData, setCuratedData] = React.useState<Array<never>>([])
    const [isAddCuratedPopupOpen, setIsAddCuratedPopupOpen] = useState(false);

    const curationAuth = async () => {
        let res = await call(
            "/api/curated/auth",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                password: password,
            },
            null,
            config.rootPath
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["message"] === undefined || res["auth"] === null) {
            swal("Server Error", res["message"])
            return
        }

        if (res["auth"] === true) {
            setAuthenticated(true)
            swal("Access Granted")
            return
        } else {
            swal("Auth Failed : " + res["message"])
            navigate('/home')
            return
        }
    }

    const removeCuratedProject = async (id: string) => {
        let res = await call(
            "/api/curated/remove",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                curated_post_id: id,
            },
            null,
            config.rootPath
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["message"] === undefined) {
            swal("Server Error", res["message"])
            return
        }

        if (res["message"] === "Failed to remove curated project") {
            swal("Failed to remove curated project")
            return
        }

        if (res["message"] === "Successfully removed curated project") {
            // Remove the project from the local state
            setCuratedData(prevData => prevData?.filter(project => project["_id"] !== id));

            swal("Successfully removed curated project")
            return
        }
    }

    const getCuratedProjects = async () => {
        let curated = await call(
            "/api/curated/getPostsAdmin",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                proficiency_filter: proficiencyFilter,
                language_filter: languageFilter,
            },
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            curated
        ])

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["message"] !== undefined && res["message"] === "No projects found") {
            swal("No Projects Found", "Please adjust the filter parameters")
            return
        }

        if (res["curated_posts"] === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        setCuratedData(res["curated_posts"])
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    const handlePasswordSubmit = () => {
        curationAuth()
    }

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    useEffect(() => {
        if (authenticated) {
            getCuratedProjects();
        }
    }, [authenticated, proficiencyFilter, languageFilter]);

    const openAddCuratedPopup = () => {
        setIsAddCuratedPopupOpen(true);
    };

    const closeAddCuratedPopup = () => {
        setIsAddCuratedPopupOpen(false);
    };

    const handleProficiencyFilterChange = (e: SelectChangeEvent<number>) => {
        const value = e.target.value as number;
        setProficiencyFilter(value);
    };

    const handleLanguageFilterChange = (e: SelectChangeEvent<number>) => {
        const value = e.target.value as number;
        setLanguageFilter(value);
    };

    const renderPasswordPrompt = () => (
        <Dialog open={passwordPromptOpen} onClose={() => navigate('/home')}>
            <DialogTitle>Admin Authentication</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter the Curate Content password to access this page.
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
                <Button onClick={() => navigate('/home')} color="primary">
                    Cancel
                </Button>
                <Button onClick={handlePasswordSubmit} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );

    const languageOptions = [
        "Any",
        "I'm not sure",
        "Go",
        "Python",
        "JavaScript",
        "Typescript",
        "Rust",
        "Java",
        "C#",
        "SQL",
        "HTML",
        "Swift",
        "Ruby",
        "C++",
        "Other"
    ].sort();

    const renderAdminContent = () => {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: "2%" }}>
                        <Select
                            labelId={"proficiencyType"}
                            id={"proficiencyTypeInput"}
                            value={proficiencyFilter}
                            sx={{ marginRight: "2%" }}
                            onChange={handleProficiencyFilterChange}
                        >
                            <MenuItem value={3}>All Proficiency Types</MenuItem>
                            <MenuItem value={0}>Beginner</MenuItem>
                            <MenuItem value={1}>Intermediate</MenuItem>
                            <MenuItem value={2}>Expert</MenuItem>
                        </Select>
                        <Select
                            labelId={"programmingLanguage"}
                            id={"programmingLanguageInput"}
                            value={languageFilter}
                            sx={{ marginRight: "2%"}}
                            onChange={handleLanguageFilterChange}
                        >
                            <MenuItem value={0}>Any Language</MenuItem>
                            <MenuItem value={6}>Go</MenuItem>
                            <MenuItem value={5}>Python</MenuItem>
                            <MenuItem value={3}>JavaScript</MenuItem>
                            <MenuItem value={4}>Typescript</MenuItem>
                            <MenuItem value={14}>Rust</MenuItem>
                            <MenuItem value={2}>Java</MenuItem>
                            <MenuItem value={10}>C#</MenuItem>
                            <MenuItem value={34}>SQL</MenuItem>
                            <MenuItem value={27}>HTML</MenuItem>
                            <MenuItem value={12}>Swift</MenuItem>
                            <MenuItem value={7}>Ruby</MenuItem>
                            <MenuItem value={8}>C++</MenuItem>
                        </Select>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => openAddCuratedPopup()}
                        >
                            Add Curated Project
                        </Button>
                    </div>
                    {curatedData !== null && curatedData.length > 0 ? (
                        <Typography component={"div"} sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            flexDirection: "row",
                            overflowY: "auto",
                            overflowX: "hidden",
                            alignContent: "center"
                        }}>
                            {
                                //@ts-ignore
                                curatedData.map((projects) => {
                                    return (
                                        <div style={{ padding: 30, display: "flex", flexDirection: "column" }}>
                                            <ProjectCard
                                                width={window.innerWidth < 1000 ? 'fit-content' : '20vw'}
                                                projectId={projects["_id"]}
                                                projectTitle={projects["title"]}
                                                projectDesc={projects["description"]}
                                                projectThumb={config.rootPath + projects["thumbnail"]}
                                                projectDate={projects["updated_at"]}
                                                projectType={projects["post_type_string"]}
                                                renown={projects["tier"]}
                                                onClick={() => navigate("/challenge/" + projects["_id"])}
                                                userTier={projects["user_tier"]}
                                                userThumb={config.rootPath + "/static/user/pfp/" + projects["author_id"]}
                                                userId={projects["author_id"]}
                                                username={projects["author"]}
                                                backgroundName={projects["background_name"]}
                                                backgroundPalette={projects["background_palette"]}
                                                backgroundRender={projects["background_render"]}
                                                exclusive={projects["challenge_cost"] === null ? false : true}
                                                hover={false}
                                                role={projects["user_status"]}
                                            />
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => removeCuratedProject(projects["_id"])}
                                            >
                                                Remove Curated Project
                                            </Button>
                                        </div>
                                    )
                                })
                            }
                        </Typography>
                    ) : (
                        <div style={{ width: "95vw", height: "89vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Lottie options={defaultOptions}
                                    width={50 * window.innerWidth / 100}
                                    height={50 * window.innerHeight / 100} />
                        </div>
                    )}
                </div>
            </ThemeProvider>
        );
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {!authenticated ? renderPasswordPrompt() : renderAdminContent()}
            <AddCuratedProjectPopup
                open={isAddCuratedPopupOpen}
                onClose={closeAddCuratedPopup}
                onProjectAdded={getCuratedProjects}
            />
        </ThemeProvider>
    );
};

export default CurateAdminPage;