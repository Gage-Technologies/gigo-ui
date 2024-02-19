import React, {useEffect, useState} from 'react';
import {themeHelpers, getAllTokens, isHoliday} from "../theme";
import {
    Box, Button,
    Card,
    CardContent,
    Container,
    createTheme,
    CssBaseline, FormControl, FormControlLabel, FormLabel,
    Grid,
    IconButton, Menu, MenuItem,
    PaletteMode, Popover, Radio, RadioGroup,
    SpeedDial,
    SpeedDialProps,
    styled, Switch,
    ThemeProvider,
    Typography
} from "@mui/material";
import {useAppSelector} from "../app/hooks";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import 'react-awesome-button/dist/styles.css';
import '../img/journey/button.css'
import '../img/journey/background.css'
import {SpeedDialAction, SpeedDialIcon} from "@mui/lab";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import DetourCard from "../components/Icons/joruneyMainAssets/DetourCard";
import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from '@mui/icons-material/Check';
import ArticleIcon from '@mui/icons-material/Article';
import { AwesomeButton } from 'react-awesome-button';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import python from "../components/Icons/joruneyMainAssets/journey-python-no-cirlce.svg";
import golang from "../components/Icons/joruneyMainAssets/journey-golang-no-cirlce.svg"
import * as portal from "../components/Icons/joruneyMainAssets/portal.json"
import completed from "../components/Icons/joruneyMainAssets/journey-completed-no-cirlce.svg"
import {string} from "prop-types";
import call from "../services/api-call";
import config from "../config";
import {selectAuthStateId} from "../reducers/auth/auth";
import journeySide1 from "../components/Icons/joruneyMainAssets/joureny-side-1.svg";
import Lottie from "react-lottie";
import Particles from "react-tsparticles";
import { loadStarsPreset } from "tsparticles-preset-stars";
import { Engine } from 'tsparticles-engine';

function JourneyMain() {
    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
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

    const portalOptions = {
        loop: true,
        autoplay: true,
        animationData: portal,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    };

    let designTokensJourney = getAllTokens(mode);
    designTokensJourney.palette.background.default = '#1b1b1a';
    const journeyTheme = React.useMemo(() => createTheme(designTokensJourney), [mode]);

    // todo replace test data
    const data = [
        {
            unit: '1',
            node_above: '2',
            node: '3',
            node_below: '4',
            name: 'third',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: null,
            node: '1',
            node_below: '2',
            name: 'First',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '1',
            node: '2',
            node_below: '3',
            name: 'Second',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '3',
            node: '4',
            node_below: '5',
            name: 'fourth',
            completed: true,
            detour: true,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '4',
            node: '5',
            node_below: '6',
            name: 'fifth',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '5',
            node: '6',
            node_below: '7',
            name: 'sixth',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '6',
            node: '7',
            node_below: '8',
            name: 'seventh',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '7',
            node: '8',
            node_below: '9',
            name: 'eighth',
            completed: false,
            detour: true,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '8',
            node: '9',
            node_below: null,
            name: 'ninth',
            completed: false,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '2',
            node_above: '2',
            node: '3',
            node_below: '4',
            name: 'third',
            completed: false,
            detour: false,
            color: '#52ad94'
        },
        {
            unit: '2',
            node_above: null,
            node: '1',
            node_below: '2',
            name: 'First',
            completed: false,
            detour: false,
            color: '#52ad94'
        },
        {
            unit: '2',
            node_above: '1',
            node: '2',
            node_below: '3',
            name: 'Second',
            completed: false,
            detour: false,
            color: '#52ad94'
        },
        {
            unit: '2',
            node_above: '3',
            node: '4',
            node_below: '5',
            name: 'fourth',
            completed: false,
            detour: true,
            color: '#52ad94'
        },
    ];

    const userId = useAppSelector(selectAuthStateId) as string

    // const getTasks = async () => {
    //     let res = await call(
    //         "/api/journey/getUserMap",
    //         "post",
    //         null,
    //         null,
    //         null,
    //         // @ts-ignore
    //         {
    //             user_id: userId
    //         },
    //         null,
    //         config.rootPath
    //     )
    //
    //     console.log("this is the response: ", res)
    //     return null
    // }
    //
    // useEffect(() => {
    //     getTasks()
    // }, [])

    function splitDataByUnit(data: any[]) {
        // Reduce the data into an object with unit numbers as keys
        const unitData = data.reduce((acc, item) => {
            // If the unit doesn't exist in the accumulator, initialize it
            if (!acc[item.unit]) {
                acc[item.unit] = [];
            }
            // Push the current item into the array for its unit
            acc[item.unit].push(item);
            return acc;
        }, {});

        // Convert the object into an array of objects with unit and metadata properties
        return Object.keys(unitData).map(unit => ({
            unit: unit,
            metadata: unitData[unit],
        }));
    }

    const items = [1, 2];

    const sortedData = data.sort((a, b) => {
        if (a.node_above === null) return -1;
        if (b.node_above === null) return 1;
        // @ts-ignore
        return a.node_above - b.node_above;
    });

    const structuredData = splitDataByUnit(sortedData);
    console.log("unit data", structuredData);

    //@ts-ignore
    // function findFirstIncompleteNodeIndex(structuredData) {
    //     // Loop through each unit
    //     for (let i = 0; i < structuredData.length; i++) {
    //         const unit = structuredData[i];
    //         // Search for the first node with completed=false
    //         for (let j = 0; j < unit.metadata.length; j++) {
    //             const node = unit.metadata[j];
    //             if (!node.completed) {
    //                 // Return the first incomplete node found along with its unit and index
    //                 return j;
    //             }
    //         }
    //     }
    //     // If no incomplete node is found
    //     return null;
    // }
    //
    // const firstIncompleteIndex = findFirstIncompleteNodeIndex(structuredData);


    const [openSpeedDial, setOpenSpeedDial] = useState(null);
    const [anchorElDetour, setAnchorElDetour] = useState(null);
    const [anchorElDesc, setAnchorElDesc] = useState(null);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    //@ts-ignore
    const handleMouseEnter = (id) => () => setOpenSpeedDial(id);
    const handleMouseLeave = () => setOpenSpeedDial(null);

    //@ts-ignore
    const handleClickDetour = (event) => {
        setAnchorElDetour(event.currentTarget);
    };

    //@ts-ignore
    const handleClickDesc = (event) => {
        setAnchorElDesc(event.currentTarget);
    };
    const handleDetourClose = () => {
        setAnchorElDetour(null);
    };

    const handleDescClose = () => {
        setAnchorElDesc(null);
    };

    const handleIcon = (item: any, index: any, firstIncomplete: any) => {

        if (item.completed) {
            return (
                <AwesomeButton style={{
                    width: "10em",
                    height: "10em",
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    '--button-default-height': '70px',
                    //@ts-ignore
                    '--button-primary-color': theme.palette.tertiary.dark,
                    //@ts-ignore
                    '--button-primary-color-dark': "#afa33d",
                    '--button-primary-color-light': "#dfce53",
                    //@ts-ignore
                    '--button-primary-color-active': theme.palette.tertiary.dark,
                    //@ts-ignore
                    '--button-primary-color-hover': theme.palette.tertiary.main,
                    '--button-default-font-size': '14px',
                    '--button-default-border-radius': '80%',
                    '--button-horizontal-padding': '3px',
                    '--button-raise-level': '12px',
                    '--button-hover-pressure': '3',
                    '--transform-speed': '0.275s',
                }} type="primary" href={"/journey/main"}>
                    <CheckIcon fontSize="large" sx={{width: '2em', height: '2em'}}/>
                </AwesomeButton>

            );
        } else if (index === firstIncomplete) {
            return (
                <AwesomeButton style={{
                    width: "10em",
                    height: "10em",
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    '--button-default-height': '70px',
                    '--button-primary-color': theme.palette.secondary.main,
                    '--button-primary-color-dark': theme.palette.secondary.dark,
                    '--button-primary-color-light': theme.palette.secondary.dark,
                    '--button-primary-color-active': theme.palette.secondary.dark,
                    '--button-primary-color-hover': theme.palette.secondary.main,
                    '--button-default-font-size': '14px',
                    '--button-default-border-radius': '80%',
                    '--button-horizontal-padding': '3px',
                    '--button-raise-level': '12px',
                    '--button-hover-pressure': '3',
                    '--transform-speed': '0.275s',
                }} type="primary" href={"/journey/main"}>
                    <div style={{
                        height: "80px",
                        width: "80px",
                    }}>
                        <img
                            src={python}
                            style={{
                                height: "100%",
                                width: "100%",
                            }}
                            alt="py"/>
                    </div>
                </AwesomeButton>
            );
        } else {
            return (
                <AwesomeButton style={{
                    width: "10em",
                    height: "10em",
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    '--button-default-height': '70px',
                    '--button-primary-color': "#b0b0b0",
                    '--button-primary-color-dark': "#808080",
                    '--button-primary-color-light': "#808080",
                    '--button-primary-color-active': "#808080",
                    '--button-primary-color-hover': "#b0b0b0",
                    '--button-default-font-size': '14px',
                    '--button-default-border-radius': '80%',
                    '--button-horizontal-padding': '3px',
                    '--button-raise-level': '12px',
                    '--button-hover-pressure': '3',
                    '--transform-speed': '0.275s',
                }} type="primary">
                    <QuestionMarkIcon fontSize="large" sx={{width: '2em', height: '2em'}}/>
                </AwesomeButton>
            );
        }
    }


    const openDetour = Boolean(anchorElDetour);
    const openDesc = Boolean(anchorElDesc);

    //@ts-ignore
    const CurvedPath = ({points}) => {
        const curveDepth = 50; // Adjust this value to control the depth of the curve between points

        //@ts-ignore
        let d = points.map((point, i, arr) => {
            if (i === 0) {
                return `M${point.x},${point.y}`;
            } else {
                const prev = arr[i - 1];
                const midX = (prev.x + point.x) / 2;
                const midY = (prev.y + point.y) / 2;
                const cx1 = (midX + prev.x) / 2;
                const cy1 = prev.y;
                const cx2 = (midX + point.x) / 2;
                const cy2 = point.y;

                // Adjust control points for a smoother transition
                const controlPointX1 = cx1 + (i % 2 === 0 ? -curveDepth : curveDepth);
                const controlPointX2 = cx2 + (i % 2 === 0 ? -curveDepth : curveDepth);

                return `C${controlPointX1},${cy1} ${controlPointX2},${cy2} ${point.x},${point.y}`;
            }
        }).join(' ');

        return (
            <svg style={{width: '100vw', height: '100vh', overflow: 'visible', position: 'absolute', left: 0, top: 0}}>
                <path d={d} stroke="#008866" strokeWidth="12" fill="none" strokeDasharray="30,10"/>
            </svg>
        );
    };

    const DetourSelection = () => {
        return (
            <>
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Typography sx={{textTransform: "none"}} variant={"h3"}>
                        Take a Detour
                    </Typography>
                </Box>
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Button>
                        See All
                    </Button>
                </Box>
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    pt: 4
                }}>
                    {items.map((item) => ( // Only show first 4 or all based on showAll
                        <Grid item xs={12} key={item} sx={{pb: 2}}>
                            <DetourCard title={`Title ${item}`}/>
                        </Grid>
                    ))}
                </Box>
            </>

        )
    }

    const TaskDescription = () => {
        return (
            <>
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Typography sx={{textTransform: "none"}} variant={"h3"}>
                        Binary Tree Visualizer
                    </Typography>
                </Box>
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    pt: 4
                }}>
                    <Typography sx={{textTransform: "none", textAlign: 'justify', marginLeft: '28px', marginRight: '28px'}} variant={"h6"}>
                        Learn to visualize a binary tree structure in the terminal by implementing a simple tree and
                        displaying it. You'll understand the basics of binary trees and how to represent them textually.
                    </Typography>
                </Box>
            </>

        )
    }

    const Tasks = (item: any, index: any, firstIncomplete: any) => {
        if (item.detour && (index === firstIncomplete)) {
            return (
                <SpeedDial
                    sx={{
                        '& .MuiSpeedDial-fab': {
                            width: "130px",
                            height: "130px",
                            backgroundColor: 'transparent',
                            boxShadow: "none",
                            '&:hover': {
                                backgroundColor: 'transparent',
                            },
                        },
                    }}
                    onClick={() => console.log("clicked: ", item.name)}
                    ariaLabel={`SpeedDial ${item.name}`}
                    icon={handleIcon(item, index, firstIncomplete)}
                    direction="right"
                    open={openSpeedDial === item.node}
                >
                    {/*//@ts-ignore*/}
                    <SpeedDialAction
                        icon={<ArticleIcon/>}
                        //@ts-ignore
                        tooltipTitle="Info"
                        onClick={handleClickDesc}
                        sx={{
                            backgroundColor: "#52ad94",
                            color: "white"
                        }}
                    />
                    <SpeedDialAction
                        icon={<ForkRightIcon/>}
                        //@ts-ignore
                        tooltipTitle="Take a Detour"
                        onClick={handleClickDetour}
                        sx={{
                            backgroundColor: "#52ad94",
                            color: "white"
                        }}
                    />
                </SpeedDial>
            )
        } else {
            return (
                <SpeedDial
                    sx={{
                        '& .MuiSpeedDial-fab': {
                            width: "130px",
                            height: "130px",
                            backgroundColor: 'transparent',
                            boxShadow: "none",
                            '&:hover': {
                                backgroundColor: 'transparent',
                            },
                        },
                    }}
                    onClick={() => console.log("clicked: ", item.name)}
                    ariaLabel={`SpeedDial ${item.name}`}
                    icon={handleIcon(item, index, firstIncomplete)}
                    direction="right"
                    open={openSpeedDial === item.node}
                >
                    {/*//@ts-ignore*/}
                    <SpeedDialAction
                        icon={<ArticleIcon/>}
                        //@ts-ignore
                        tooltipTitle="Info"
                        onClick={handleClickDesc}
                        sx={{
                            backgroundColor: "#52ad94",
                            color: "white"
                        }}
                    />
                    <SpeedDialAction
                        sx={{
                            opacity: 0,
                            '&:hover': {
                                cursor: 'default',
                            },
                        }}
                    />
                </SpeedDial>
            )
        }
    }

    function JourneyStops(metadata: any[]) {
        // Assuming each SpeedDial is 130px high and we want 20px gap between them
        const speedDialHeight = 130;
        const gap = 20;
        const points = metadata.map((item, index) => {
            const x = index % 2 === 0 ? 100 : 280; // Alternate X position
            const y = (speedDialHeight + gap) * index + speedDialHeight / 2; // Y position based on index
            return {x, y};
        });

        const findFirstIncompleteIndex = () => {
            return metadata.findIndex(item => !item.completed);
        };

        const firstIncompleteIndex = findFirstIncompleteIndex();

        return (
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: "center",
                margin: "10px"
            }}>
                <CurvedPath points={points}/>
                {metadata.map((item, index) => (
                    <div
                        key={item.node}
                        style={{
                            marginBottom: '20px',
                            marginLeft: '5vw',
                            transform: `translateX(${index % 2 === 0 ? '-100px' : '100px'})`,
                            position: 'relative', // To ensure it's above the SVG
                            zIndex: 1, // Bring SpeedDials above the SVG paths
                        }}
                        onMouseEnter={handleMouseEnter(item.node)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {Tasks(item, index, firstIncompleteIndex)}
                        <Popover
                            id={openDetour ? 'simple-popover' : undefined}
                            open={openDetour}
                            anchorEl={anchorElDetour}
                            onClose={handleDetourClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'center',
                                horizontal: 'left',
                            }}
                            PaperProps={{
                                style: {
                                    boxShadow: 'none',
                                    borderRadius: "30px",
                                }
                            }}
                        >
                            <Box sx={{width: "30vw", height: '50vh'}}>
                                <Box sx={{display: "flex", justifyContent: "right", alignItems: "right"}}>
                                    <Button onClick={handleDetourClose}>
                                        <CloseIcon/>
                                    </Button>
                                </Box>
                                {DetourSelection()}
                            </Box>
                        </Popover>
                        <Popover
                            id={openDesc ? 'simple-popover' : undefined}
                            open={openDesc}
                            anchorEl={anchorElDesc}
                            onClose={handleDescClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'center',
                                horizontal: 'left',
                            }}
                            PaperProps={{
                                style: {
                                    boxShadow: 'none',
                                    borderRadius: "30px",
                                }
                            }}
                        >
                            <Box sx={{width: "30vw", height: '50vh', m: 3}}>
                                <Box sx={{display: "flex", justifyContent: "right", alignItems: "right"}}>
                                    <Button onClick={handleDescClose}>
                                        <CloseIcon/>
                                    </Button>
                                </Box>
                                {TaskDescription()}
                            </Box>
                        </Popover>
                    </div>
                ))}
            </div>
        );
    }

    const ParticlesBackground = () => {
        const particlesInit = async (main: Engine) => {
            console.log(main);
            await loadStarsPreset(main);
        };

        const options = {
            preset: "stars",
        };

        return (
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={options}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1, // Ensure this is behind all other content
                }}
            />
        );
    };

    const journeyPortal = () => {
        return (
            <div style={{position: 'relative', width: '400px', height: '400px'}}>
                <Lottie options={portalOptions} speed={0.25} isClickToPauseDisabled={true} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '410px',
                    height: '420px',
                    zIndex: 3,
                    overflow: "visible"
                }}/>
                <img
                    src={journeySide1}
                    style={{
                        position: 'absolute',
                        top: 17,
                        left: 1,
                        height: '100%',
                        width: '100%',
                        zIndex: 1
                    }}
                    alt="py"
                />
            </div>
        )
    }

    const starMemo = React.useMemo(() => (
        <ParticlesBackground/>
    ), [])

    return (
        <ThemeProvider theme={theme}>
            {/*{starMemo}*/}
            <CssBaseline>
                <Box sx={{overflow: 'hidden', position: "relative"}}>
                    <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", m: 2}}>
                        <Typography variant="h2" sx={{color: "white"}}>
                            Your Journey
                        </Typography>
                    </Box>
                    {structuredData.map((unit, index) => (
                        <Grid container>
                            {(index % 2 === 0 ? <Grid item xl={4} sx={{
                                display: "flex",
                                justifyContent: "start",
                                paddingTop: '20vh',
                                flexDirection: "column",
                                alignItems: "center",
                            }}>
                                {journeyPortal()}
                            </Grid> : <Grid item xl={4}/>)}
                            <Grid item xl={4} sx={{
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                alignItems: "center", borderRadius: "30px",
                                mt: 2,
                                backgroundColor: unit.metadata[index].color
                            }}>
                            <Box sx={{p: 2}}>
                                    <Typography variant={'h4'}>Unit Title Here</Typography>
                                </Box>
                                {JourneyStops(unit.metadata)}
                                <Box sx={{p: 2}}>
                                    <AwesomeButton style={{
                                        width: "auto",
                                        //@ts-ignore
                                        '--button-primary-color': theme.palette.tertiary.dark,
                                        '--button-primary-color-dark': "#afa33d",
                                        '--button-primary-color-light': "#dfce53",
                                        //@ts-ignore
                                        '--button-primary-color-active': theme.palette.tertiary.dark,
                                        //@ts-ignore
                                        '--button-primary-color-hover': theme.palette.tertiary.main,
                                        '--button-default-border-radius': "24px",
                                        '--button-hover-pressure': "4",
                                        height: "10vh",
                                        '--button-raise-level': "10px"
                                    }} type="primary">
                                        <h1 style={{fontSize: "2vw", paddingRight: "1vw", paddingLeft: "1vw"}}>
                                            Unit Project
                                        </h1>
                                        <div style={{
                                            height: "80px",
                                            width: "80px",
                                        }}>
                                            <img
                                                src={completed}
                                                style={{
                                                    height: "100%",
                                                    width: "100%",
                                                }}
                                                alt="py"/>
                                        </div>
                                    </AwesomeButton>
                                </Box>
                            </Grid>
                            {(index % 2 === 0) ? <Grid item xl={4}/> : <Grid item xl={4} sx={{
                                display: "flex",
                                justifyContent: "end",
                                paddingBottom: '20vh',
                                flexDirection: "column",
                                alignItems: "center",
                            }}>
                                {journeyPortal()}
                            </Grid>}
                        </Grid>
                    ))}
                </Box>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default JourneyMain;

