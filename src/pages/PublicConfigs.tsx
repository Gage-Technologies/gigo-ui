import React, {useEffect, useState} from 'react';
import JourneyPageIcon from "../components/Icons/JourneyPage";
import {themeHelpers, getAllTokens, isHoliday} from "../theme";
import {Card, createTheme, CssBaseline, InputBase, PaletteMode, Tab, Tabs, ThemeProvider} from "@mui/material";
import JourneyPageCampIcon from "../components/Icons/JourneyPageCamp";
import {Grid} from "@material-ui/core";
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
import {DefaultWorkspaceConfig, WorkspaceConfig} from "../models/workspace";

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
    console.log("aspectRatio: ", aspectRatio);
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

        console.log("e stuff: ", e)

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
            limit: 5
        }

        if (minorTab === "Personal") {
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
            console.log("configs second: ", workspaceConfigs)

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

        setSkip(skip + 5)
    }

    useEffect(() => {
        //null
        handleWorkspaceConfigSearch("", 0)
    }, [minorTab])


    const navigate = useNavigate();
    const minorValues = ["Community", "Personal"]
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Box sx={{ bgcolor: 'background.paper', minHeight: '10vh', p: 2 }}>
                    {/* Header and Search Bar */}
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
                        <div style={{ width: '30%' }}>
                            <SearchBar handleWorkspaceConfigSearch={(e: any) => {
                                console.log("e is: ", e)
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
                    {/*<Box>*/}
                    {/*    <Tabs*/}
                    {/*        orientation="horizontal"*/}
                    {/*        value={minorTab}*/}
                    {/*        onChange={handleChange}*/}
                    {/*        aria-label="Horizontal tabs"*/}
                    {/*    >*/}
                    {/*        {minorValues.map((minorValue) => {*/}
                    {/*            return <Tab label={minorValue} value={minorValue} key={minorValue}*/}
                    {/*                        sx={{color: "text.primary", borderRadius: 1}}/>;*/}
                    {/*        })}*/}
                    {/*    </Tabs>*/}
                    {/*</Box>*/}



                    {/* Configs List */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {wsConfigOptions.map((config) => (
                            <React.Fragment key={config._id}>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        bgcolor: 'grey.900',
                                        mb: 1,
                                        borderRadius: '10px', // Full rounded outline
                                        color: 'white',
                                        justifyContent: 'space-between',
                                        padding: '10px 20px',
                                        textTransform: 'none', // Prevents the button text from being uppercase
                                        width: '78%', // Set width to 78% of the parent container
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Typography variant="subtitle1">{config.title}</Typography>
                                        <Typography variant="body2">{config.description}</Typography>
                                    </Box>
                                    {/*<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>*/}
                                    {/*    <DownloadIcon />*/}
                                    {/*    /!*<Typography variant="body2">{config.downloads}</Typography>*!/*/}
                                    {/*    /!*<Typography variant="body2">{config.hoursPlayed} HOURS PLAYED</Typography>*!/*/}
                                    {/*</Box>*/}
                                </Button>
                                <Divider sx={{ width: '80%', marginBottom: '20px', marginTop: "20px" }} />
                            </React.Fragment>
                        ))}
                    </Box>

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

export default PublicConfigs;

