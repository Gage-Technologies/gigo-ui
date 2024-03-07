import React, {useEffect, useRef, useState} from "react";
import {
    Box, Button, Card, CardContent, CardMedia, createTheme,
    CssBaseline, Grid,
    IconButton,
    InputBase,
    PaletteMode,
    Tab,
    Tabs,
    ThemeProvider,
    Typography
} from "@mui/material";
import {Paper} from "@material-ui/core";
import SearchIcon from "@mui/icons-material/Search";
import SearchBar from "../components/SearchBar";
import {getAllTokens} from "../theme";
import DetourCard from "../components/Icons/joruneyMainAssets/DetourCard";
import Carousel from "../components/Carousel2";
import call from "../services/api-call";
import config from "../config";
import {useAppSelector} from "../app/hooks";
import {selectJourneysId} from "../reducers/journeyDetour/journeyDetour";
import {JourneyDetourState} from "../reducers/journeyDetour/journeyDetour";

function JourneyDetours() {
    let userPref = localStorage.getItem('theme');
    const [mode, _] = useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [isSticky, setIsSticky] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const sections = useRef([]);
    const [unitsPython, setUnitsPython] = React.useState([])
    const [unitsGo, setUnitsGo] = React.useState([])
    const [searchText, setSearchText] = React.useState("")
    const reduxIdState = useAppSelector(selectJourneysId);

    const handleScroll = () => {
        const top = window.scrollY;
        setIsSticky(top >= 40);

        // Update the active tab based on scroll position
        const currentSection = sections.current.findIndex(section => {
            const elem = document.getElementById(section);
            return elem && top >= elem.offsetTop - 500 && top < elem.offsetTop + elem.offsetHeight - 100;
        });
        if (currentSection !== -1 && currentSection !== activeTab) {
            setActiveTab(currentSection);
        }
    };

    const [offsetHeight, setOffsetHeight] = useState(0);

    const calculateOffsetHeight = () => {
        const searchbar = document.getElementById('searchbar');
        const tabs = document.getElementById('tabs');
        const title = document.getElementById('title');
        const searchbarHeight = searchbar ? searchbar.offsetHeight : 0;
        const tabsHeight = tabs ? tabs.offsetHeight : 0;
        const titleHeight = title ? (title.offsetHeight + 300) : 0;

        return searchbarHeight + tabsHeight + titleHeight;
    };

    useEffect(() => {
        // Update the offset height when isSticky changes or window resizes
        const handleResize = () => {
            setOffsetHeight(calculateOffsetHeight());
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial calculation

        return () => window.removeEventListener('resize', handleResize);
    }, [isSticky]); // Dependency array includes isSticky

    // const handleTabChange = (event: any, newValue: any) => {
    //     setActiveTab(newValue);
    //     console.log("new value is: ", newValue)
    //     const section = document.getElementById(sections.current[newValue]);
    //     console.log("section: ", section)
    //     console.log("offsetHeight: ", offsetHeight)
    //     if (section) {
    //         window.scrollTo({ top: section.offsetTop - offsetHeight, behavior: 'smooth' });
    //     }
    // };

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number): void => {
        setActiveTab(newValue);
        console.log("new value is: ", newValue);

        if (newValue === 0) {
            // Scroll to the top of the page
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (newValue === 1) {
            // Scroll to the bottom of the page
            // Use document.body.scrollHeight to get the total height of the body content
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } else {
            // For other tabs, continue to scroll to their respective section if applicable
            const section = document.getElementById(sections.current[newValue]);
            console.log("section: ", section);
            console.log("offsetHeight: ", offsetHeight);
            if (section) {
                window.scrollTo({ top: section.offsetTop - offsetHeight, behavior: 'smooth' });
            }
        }
    };

    // useEffect(() => {
    //     window.addEventListener('scroll', handleScroll);
    //     return () => window.removeEventListener('scroll', handleScroll);
    // }, [activeTab]);

    // TODO subject to change
    // @ts-ignore
    sections.current = ['python', 'golang'];



    const handleSearchText = (text: string) => {
        setSearchText(text)
    }

    // useEffect(() => {
    //     window.addEventListener('scroll', handleScroll);
    //
    //     return () => {
    //         window.removeEventListener('scroll', handleScroll);
    //     };
    // }, []);

    const getUnits = async () => {
        let params = {}
        if (searchText !== "") {
            //@ts-ignore
            params["search_text"] = searchText
        }
        let res = await call(
            "/api/journey/getAllUnits",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            params,
            null,
            config.rootPath
        )

        if (res !== undefined && res["success"] !== undefined && res["success"] === true){
            // Array of units where the first language is Go
            const goUnits = res["units"].filter((unit: { langs: string[]; }) => unit.langs[0] === "Go");

// Array of units where the first language is Python
            const pythonUnits = res["units"].filter((unit: { langs: string[]; }) => unit.langs[0] === "Python");

            setUnitsGo(goUnits)
            setUnitsPython(pythonUnits)
        }

        console.log("this is the response: ", res)
        return null
    }

    useEffect(() => {
        getUnits()
        console.log("id is:", reduxIdState)
    }, [searchText])

    const [showAllPython, setShowAllPython] = useState(false); // State to toggle visibility
    const [showAllGo, setShowAllGo] = useState(false); // State to toggle visibility

    // const items = [1, 2, 3, 4, 5, 6, 7]; // Your items array, this could be dynamic

    // Function to toggle the showAll state
    const handleShowAllTogglePython = () => setShowAllPython(!showAllPython);
    const handleShowAllToggleGo = () => setShowAllGo(!showAllGo);

    console.log("y is: ", window.scrollY)

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    position: isSticky ? 'fixed' : 'static',
                    top: 63,
                    width: '100%',
                    backgroundColor: theme.palette.background.default,
                    transition: 'top 0.3s',
                    zIndex: 99
                }}>
                    {isSticky ? (
                        // Content when box is sticky
                        <Box id="searchbar" sx={{justifyContent: 'center', p: 2, flexDirection: "column"}}>
                            <SearchBar handleSearchText={handleSearchText}/>
                            <Tabs id="tabs" value={activeTab} onChange={handleTabChange}>
                                {/*// TODO subject to change*/}
                                <Tab label="Python" />
                                <Tab label="Golang" />
                                {/*<Tab label="Web Development" />*/}
                                {/*<Tab label="Game Development" />*/}
                                {/*<Tab label="JavaScript" />*/}
                                {/*<Tab label="Databases" />*/}
                            </Tabs>
                        </Box>
                    ) : (
                        // Full content when box is not sticky
                        <Box sx={{justifyContent: 'center', p: 2, alignItems: "center"}}>
                            <Typography id='title' variant={"h3"} sx={{textAlign: "center", p: 1}}>
                                Journey Detours
                            </Typography>
                            <SearchBar handleSearchText={handleSearchText}/>
                            <Tabs value={activeTab} onChange={handleTabChange}>
                                <Tab label="Python" />
                                <Tab label="Golang" />
                                {/*<Tab label="Web Development" />*/}
                                {/*<Tab label="Game Development" />*/}
                                {/*<Tab label="JavaScript" />*/}
                                {/*<Tab label="Databases" />*/}
                            </Tabs>
                        </Box>
                     )}
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: "column"}}>
                    <Box id="python" sx={{display: 'flex', justifyContent: 'left', alignItems: 'left', width: '50vw'}}>
                        <Typography variant={"h5"} sx={{textAlign: "center", p: 1}}>
                            Python
                        </Typography>
                        <Button onClick={handleShowAllTogglePython}>
                            {showAllPython ? 'Show Less' : 'Show More'} {/* Toggle button text */}
                        </Button>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 2,
                        width: '50vw',
                    }}>
                        <Grid container spacing={2}>
                            {unitsPython.slice(0, showAllPython ? unitsPython.length : 4).map((unit) => (
                                <Grid item xs={6} key={unit}>
                                    <DetourCard data={unit} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: "column"}}>
                    <Box id="python" sx={{display: 'flex', justifyContent: 'left', alignItems: 'left', width: '50vw'}}>
                        <Typography variant={"h5"} sx={{textAlign: "center", p: 1}}>
                            Golang
                        </Typography>
                        <Button onClick={handleShowAllToggleGo}>
                            {showAllGo ? 'Show Less' : 'Show More'} {/* Toggle button text */}
                        </Button>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 2,
                        width: '50vw',
                    }}>
                        <Grid container spacing={2}>
                            {unitsGo.slice(0, showAllGo ? unitsGo.length : 4).map((unit) => (
                                <Grid item xs={6} key={unit}>
                                    <DetourCard data={unit} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default JourneyDetours;
