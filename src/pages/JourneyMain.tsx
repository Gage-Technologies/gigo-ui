import React, {createRef, useEffect, useRef, useState} from 'react';
import {getAllTokens} from "../theme";
import {
    Box, Button,
    Card,
    createTheme,
    CssBaseline,
    Grid,
    PaletteMode, Popover,
    SpeedDial,
    ThemeProvider,
    Typography
} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../app/hooks";
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
import python from "../components/Icons/bytes/python-logo.svg";
import golang from "../components/Icons/bytes/golang-logo.svg";
import completed from "../components/Icons/joruneyMainAssets/journey-completed-no-cirlce.svg"
import journeyMap from "../components/Icons/bytes/journey-map.svg";
import call from "../services/api-call";
import config from "../config";
import {initialAuthStateUpdate, selectAuthStateId, updateAuthState} from "../reducers/auth/auth";
import JourneyPortals from "../components/Icons/joruneyMainAssets/JourneyPortals";
import {initialJourneyDetourStateUpdate, updateJourneyDetourState} from "../reducers/journeyDetour/journeyDetour";
import {ThreeDots} from "react-loading-icons";
import Carousel from "../components/Carousel2";
import LazyLoad from "react-lazyload";
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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
    
    const userId = useAppSelector(selectAuthStateId) as string

    type Task = {
        _id: string;
        name: string;
        description: string;
        lang: string;
        journey_unit_id: string;
        node_above: string | null;
        node_below: string | null;
        completed: boolean;
    };

    type Unit = {
        _id: string;
        name: string;
        unit_above: string | null;
        unit_below: string | null;
        description: string;
        langs: string[];
        tags: string[];
        published: boolean;
        color: string;
        tasks: Task[];
        handout: string;
    };

    const [unitData, setUnitData] = useState<Unit[]>([])
    const [nextUnit, setNextUnit] = useState<Unit>()
    const [taskData, setTaskData] = useState<Task[]>([])
    const unitRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

    // const getTasks = async () => {
    //     let res = await call(
    //         "/api/journey/getUnitMetadata",
    //         "post",
    //         null,
    //         null,
    //         null,
    //         // @ts-ignore
    //         {
    //             unit_id: "1759701436645507072"
    //         },
    //         null,
    //         config.rootPath
    //     )
    //
    //
    //     //@ts-ignore
    //     unitData.push(res['unit']);
    //     return null
    // }

    // const getTasks = async () => {
    //
    //     if (unitData !== null) {
    //         let res = await call(
    //             "/api/journey/createMap",
    //             "post",
    //             null,
    //             null,
    //             null,
    //             // @ts-ignore
    //             {
    //                 user_id: userId,
    //                 units: ['1759701436645507072']
    //             },
    //             null,
    //             config.rootPath
    //         )
    //
    //         return null
    //     }
    // }
    //

    const [activeJourney, setActiveJourney] = useState(false)
    const [loading, setLoading] = useState(true)
    const getTasks = async () => {
        let map = await call(
            "/api/journey/determineStart",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        if (map['started_journey'] === false) {
            setActiveJourney(false)
            setLoading(false)
            return
        }

        let res = await call(
            "/api/journey/getUserMap",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                user_id: userId,
            },
            null,
            config.rootPath
        )

        const units = (res['user_map']['units'])
        //@ts-ignore
        const sortedUnitData = units.sort((a, b) => {
            if (a.node_above === null) return -1;
            if (b.node_above === null) return 1;
            // @ts-ignore
            return a.node_above - b.node_above;
        });

        // Fetch next unit and append it to sortedUnitData if successful
        const nextUnitRes = await call(
            "/api/journey/tempNextUnit",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        );

        if (nextUnitRes !== undefined && nextUnitRes["success"] === true && nextUnitRes["unit"]) {
            setNextUnit(nextUnitRes["unit"]);
            sortedUnitData.push(nextUnitRes["unit"]);
        }

        // @ts-ignore
        const fetchedTasks = sortedUnitData.map(async (unit: any) => {
            let res = await call(
                "/api/journey/getTasksInUnit",
                "post",
                null,
                null,
                null,
                // @ts-ignore
                {
                    user_id: userId,
                    unit_id: unit._id
                },
                null,
                config.rootPath
            )

            const tasks = res.data.tasks

            //@ts-ignore
            const sortedTaskData = tasks.sort((a, b) => {
                if (a.node_above === null) return -1;
                if (b.node_above === null) return 1;
                // @ts-ignore
                return a.node_above - b.node_above;
            });
            return { ...unit, tasks: sortedTaskData };
        });

        const allUnits = await Promise.all(fetchedTasks);
        setNextUnit(allUnits[allUnits.length - 1]);
        setUnitData(allUnits.slice(0, -1));
        setActiveJourney(true)
        setLoading(false)
        unitRefs.current = allUnits.map((_, i) => unitRefs.current[i] ?? createRef<HTMLDivElement>());
    }

    useEffect(() => {
        getTasks()
    }, []);

    const handleAddUnitToMap = async () => {
        if (!nextUnit) return;

        const res = await call(
            "/api/journey/addUnitToMap",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                unit_id: nextUnit._id
            },
            null,
            config.rootPath
        );

        if (res && res.success) {
            console.log("Unit added successfully!");
        } else {
            console.error("Failed to add unit to map");
            return
        }
    };

    const smoothScrollTo = (element: Element, duration: number): void => {
        let targetPosition = element.getBoundingClientRect().top;
        let startPosition = window.pageYOffset;
        let startTime: number | null = null;

        const ease = (t: number, b: number, c: number, d: number): number => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        const animation = (currentTime: number): void => {
            if (startTime === null) startTime = currentTime;
            let timeElapsed = currentTime - startTime;
            let run = ease(timeElapsed, startPosition, targetPosition - startPosition, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    };

    // todo: works properly, but scrolls super fast. Keeping in case the smooth scroll causes too many issues.
    // useEffect(() => {
    //     // Find the index of the last unit with at least one completed task
    //     const lastUnitWithCompletedTaskIndex = unitData.reduce((acc, unit, index) =>
    //         unit.tasks.some(task => task.completed) ? index : acc, -1
    //     );
    //
    //     // Scroll to the last unit with a completed task, if found
    //     if (lastUnitWithCompletedTaskIndex !== -1) {
    //         const ref = unitRefs.current[lastUnitWithCompletedTaskIndex];
    //         ref?.current?.scrollIntoView({
    //             behavior: 'smooth',
    //             block: 'start',
    //         });
    //     }
    // }, [unitData]);


    useEffect(() => {
        const lastUnitWithCompletedTaskIndex = unitData.reduce((acc, unit, index) =>
            unit.tasks.some(task => task.completed) ? index : acc, -1
        );

        if (lastUnitWithCompletedTaskIndex !== -1) {
            const ref = unitRefs.current[lastUnitWithCompletedTaskIndex];
            if (ref?.current) {
                requestAnimationFrame(() => {
                    if (ref && ref?.current) {
                        smoothScrollTo(ref.current, 1250);
                    }
                });
            }
        }
    }, [unitData]);

    const items = [1, 2];

    const [openSpeedDial, setOpenSpeedDial] = useState(null);
    const [anchorElDetour, setAnchorElDetour] = useState(null);
    const [anchorElDesc, setAnchorElDesc] = useState(null);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [popupLoading, setPopupLoading] = useState(false)
    const [detours, setDetours] = useState([])

    const [taskId, setTaskId] = useState("")

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

    const dispatch = useAppDispatch();

    //@ts-ignore
    const handleClickDetour = async(event, id) => {
        setPopupLoading(true)
        setAnchorElDetour(event.currentTarget);
        let updateState = Object.assign({}, initialJourneyDetourStateUpdate);
        // update file in state update
        updateState.id = id;
        // execute state update
        updateJourneyDetourState(updateState)
        dispatch(updateJourneyDetourState(updateState))

        let res = await call(
            "/api/journey/getUnitsPreview",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        if (res !== undefined && res["success"] !== undefined && res["success"] === true){
            setDetours(res["units"])
        }
        setPopupLoading(false)
    };

    // const handleNextUnit = async () => {
    //     let res = await call(
    //         "/api/journey/tempNextUnit",
    //         "POST",
    //         null,
    //         null,
    //         null,
    //         // @ts-ignore
    //         {},
    //         null,
    //         config.rootPath
    //     );
    //
    //     if (res !== undefined && res["success"] !== undefined && res["success"] === true && res["unit"]) {
    //
    //         setNextUnit(res["unit"]);
    //     }
    // };

    const [taskDescription, setTaskDescription] = useState("")
    const [taskTitle, setTaskTitle] = useState("")
    const [currentTask, setCurrentTask] = useState(false)
    //@ts-ignore
    const handleClickDesc = (description, title, taskID, current) => (event) => {
        setTaskTitle(title)
        setTaskDescription(description)
        setTaskId(taskID)
        setCurrentTask(current)
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
                }} type="primary">
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
                }} type="primary"
                               href={`/byte/${item.code_source_id}?journey`}
                >
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
                    <Button href={"/journey/detours"}>
                        See All
                    </Button>
                </Box>
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    pt: 4,
                }}>
                    <Carousel itemsShown={1} infiniteLoop={true}
                              itemsToSlide={1}>
                        {
                            detours && detours.length > 0 ?
                                detours.map((unit, index) => {
                                    return (
                                        <div style={{paddingBottom: "20px", paddingLeft: "5vw"}}>
                                            <LazyLoad once scroll unmountIfInvisible>
                                                <Grid item xs={6}>
                                                    <DetourCard data={unit} width={"20vw"}/>
                                                </Grid>
                                            </LazyLoad>
                                        </div>
                                    )
                                }) : (
                                    <>
                                        <ThreeDots/>
                                    </>
                                )
                        }
                    </Carousel>
                </Box>
            </>

        )
    }

    const TaskDescription = () => {
        return (
            <>
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Typography sx={{textTransform: "none"}} variant={"h4"}>
                        {taskTitle}
                    </Typography>
                </Box>
                <Box sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    flexDirection: "column",
                    pt: 4,
                    height: "225px"
                }}>
                    <Typography sx={{textTransform: "none", textAlign: 'justify', marginLeft: '28px', marginRight: '28px'}} variant={"h6"}>
                        {taskDescription}
                    </Typography>

                </Box>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    {(currentTask)
                    ?
                        <AwesomeButton style={{
                            width: "auto",
                            //@ts-ignore
                            '--button-primary-color': theme.palette.secondary.main,
                            '--button-primary-color-dark': theme.palette.secondary.dark,
                            '--button-primary-color-light': theme.palette.secondary.dark,
                            //@ts-ignore
                            '--button-primary-color-active': theme.palette.secondary.dark,
                            //@ts-ignore
                            '--button-primary-color-hover': theme.palette.secondary.main,
                            '--button-default-border-radius': "24px",
                            '--button-hover-pressure': "4",
                            height: "10vh",
                            '--button-raise-level': "10px"
                        }} type="primary" href={`/byte/${taskId}?journey`}>
                            <h1 style={{fontSize: "2vw", paddingRight: "1vw", paddingLeft: "1vw"}}>
                                Start
                            </h1>
                        </AwesomeButton>
                    :
                    <></>}
                </Box>
            </>

        )
    }

    const taskPopups = () => {;
        return(
            <>
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
                    <Box sx={{width: "30vw", height: '40vh'}}>
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
                    <Box sx={{width: "30vw", height: '45vh', m: 3}}>
                        <Box sx={{display: "flex", justifyContent: "right", alignItems: "right"}}>
                            <Button onClick={handleDescClose}>
                                <CloseIcon/>
                            </Button>
                        </Box>
                        {TaskDescription()}
                    </Box>
                </Popover>
            </>
        )
    }

    const Tasks = (item: any, index: any, firstIncomplete: any) => {
        return (
            <>

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
                    ariaLabel={`SpeedDial ${item.name}`}
                    icon={handleIcon(item, index, firstIncomplete)}
                    direction="right"
                    open={openSpeedDial === item._id}
                >
                    {/*//@ts-ignore*/}
                    <SpeedDialAction
                        icon={<ArticleIcon/>}
                        //@ts-ignore
                        tooltipTitle="Info"
                        onClick={handleClickDesc(item.description, item.name, item.code_source_id, (index === firstIncomplete))}
                        sx={{
                            backgroundColor: "#52ad94",
                            color: "white"
                        }}
                    />
                    {(index === firstIncomplete) ?
                        <SpeedDialAction
                        icon={<ForkRightIcon/>}
                    //@ts-ignore
                    tooltipTitle="Take a Detour"
                    onClick={e => handleClickDetour(e, item._id)}
                    sx={{
                        backgroundColor: "#52ad94",
                        color: "white"
                    }}
                />
                    :
                        <SpeedDialAction
                            sx={{
                                opacity: 0,
                                '&:hover': {
                                    cursor: 'default',
                                },
                            }}
                        />
                    }
                </SpeedDial>

                {taskPopups()}
            </>
        )
    }

    function JourneyStops(metadata: Task[]) {
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
                        key={item._id}
                        style={{
                            marginBottom: '20px',
                            marginLeft: '5vw',
                            transform: `translateX(${index % 2 === 0 ? '-100px' : '100px'})`,
                            position: 'relative', // To ensure it's above the SVG
                            zIndex: 1, // Bring SpeedDials above the SVG paths
                        }}
                        onMouseEnter={handleMouseEnter(item._id)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {Tasks(item, index, firstIncompleteIndex)}
                    </div>
                ))}
            </div>
        );
    }

    const GetStarted = () => {
        const [selectedJourney, setSelectedJourney] = useState('');

        // TODO choose the ID's for the starting units
        const journeys = {
            python: {
                title: 'Python',
                description: 'Start with python basics and work your way up to learning the basics of Object Oriented Programming (OOP)',
                img: python,
                height: "100px"
            },
            golang: {
                title: 'Golang',
                description: 'Start with golang basics and work your way up to concurrency in go, including goroutines and channels',
                img: golang,
                height: "65px"
            }
        };

        const selectJourney = (journey: React.SetStateAction<string>) => {
            setSelectedJourney(journey);
        };

        return (
            <Box
                sx={{
                    flexGrow: 1,
                    height: '93vh',
                    backgroundImage: `url(${journeyMap})`, // Set the background image
                    backgroundSize: 'cover', // Ensure the image covers the full area without being repeated
                    backgroundPosition: 'center', // Center the background image
                    backgroundRepeat: 'no-repeat', // Do not repeat the background image
                }}
            >
                <Box sx={{ flexGrow: 1, height: '93vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                    <Box sx={{ height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                        <Typography variant="h4" sx={{color: "white"}}>Choose Your Lane</Typography>
                        <Typography variant="body1" textTransform="none" sx={{ width: '45vw', textAlign: 'center', mt:3, color: "white" }}>
                            Journey's are a structured way to learn programming. Select the starting path you would like to take in your Journey. You can always take a detour at any time to switch it up.
                        </Typography>
                    </Box>
                    <Grid container spacing={2} sx={{height: '60vh'}}>
                        <Grid item xs={2} container justifyContent="center" alignItems="center"/>
                        <Grid item xs={8} container direction="row" justifyContent="center" alignItems="center" sx={{gap: 12}}>
                            {Object.entries(journeys).map(([key, value]) => (
                                <Box key={key} textAlign="center" sx={{width: '10vw'}}>
                                    <Typography variant="subtitle1" component="div" sx={{color: selectedJourney === key ? "#29C18C" : 'white'}}>
                                        {value.title}
                                    </Typography>
                                    <Button variant={'outlined'} onClick={() => selectJourney(key)} sx={{
                                        borderRadius: "20px",
                                        width: '100%',
                                        height: '10vw',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        borderColor: selectedJourney === key ? "#29C18C" : 'white',
                                        backgroundColor: selectedJourney === key ? "#282826" : '',
                                        '&:hover': {
                                            backgroundColor: selectedJourney === key ? '#282826' : '',
                                            borderColor: selectedJourney === key ? "#29C18C" : '#29C18C',
                                        },
                                    }}>
                                        <img src={value.img} style={{height: value.height}} alt={`${value.title} logo`}/>
                                    </Button>
                                </Box>
                            ))}
                        </Grid>
                        <Grid item xs={2} container justifyContent="center" alignItems="center">
                        </Grid>
                        <Grid item xs={12} sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mt: 2
                        }}>
                            <Typography variant="body1" sx={{textAlign: 'center', marginBottom: '20px', width: '45vw', color: "white"}}>
                                {/*@ts-ignore*/}
                                {selectedJourney && journeys[selectedJourney].description}
                            </Typography>
                            {selectedJourney && (
                                <AwesomeButton style={{
                                    width: "auto",
                                    '--button-primary-color': theme.palette.secondary.main,
                                    '--button-primary-color-dark': theme.palette.secondary.dark,
                                    '--button-primary-color-light': theme.palette.secondary.dark,
                                    '--button-primary-color-active': theme.palette.secondary.dark,
                                    '--button-primary-color-hover': theme.palette.secondary.main,
                                    '--button-default-border-radius': "24px",
                                    '--button-hover-pressure': "1",
                                    height: "10vh",
                                    '--button-raise-level': "10px"
                                }} type="primary">
                                    <h1 style={{fontSize: "2vw", paddingRight: "1vw", paddingLeft: "1vw"}}>
                                        Start Journey
                                    </h1>
                                </AwesomeButton>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Box>

        );
    }

    const nextUnitPreview = () => {
        return(
            <Box sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                zIndex: 1,
            }}>
                {nextUnit && (
                    <Grid container>
                        <Grid item xl={4} sx={{
                            display: "flex",
                            justifyContent: "start",
                            paddingTop: '20vh',
                            flexDirection: "column",
                            alignItems: "center",
                        }}>
                        </Grid>
                        <Grid item xl={4} sx={{
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "center",
                            borderRadius: "30px",
                            mt: 2,
                            backgroundColor: nextUnit.color,
                            opacity: 0.2
                        }}>
                            <Box sx={{p: 2}}>
                                <Typography variant={'h5'}>{nextUnit.name}</Typography>
                            </Box>
                            {JourneyStops(nextUnit.tasks)}
                            <Box sx={{p: 2}}>
                                <AwesomeButton style={{
                                    width: "auto",
                                    // @ts-ignore
                                    '--button-primary-color': theme.palette.tertiary.dark,
                                    '--button-primary-color-dark': "#afa33d",
                                    '--button-primary-color-light': "#dfce53",
                                    // @ts-ignore
                                    '--button-primary-color-active': theme.palette.tertiary.dark,
                                    // @ts-ignore
                                    '--button-primary-color-hover': theme.palette.tertiary.main,
                                    '--button-default-border-radius': "24px",
                                    '--button-hover-pressure': "1",
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
                        <Grid item xl={4}/>
                            <Box sx={{
                                position: 'absolute', // This is the 'wall' overlay.
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backdropFilter: "blur(2.8px)",
                                "-webkit-backdrop-filter": "blur(2.8px)",
                                backgroundColor: userPref === "dark" ? "rgba(28, 28, 26,0.2)" : "rgba(250, 250, 250,0.2)",
                            }}>
                            </Box>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <AwesomeButton style={{
                                    width: "auto",
                                    '--button-primary-color': theme.palette.secondary.main,
                                    '--button-primary-color-dark': theme.palette.secondary.dark,
                                    '--button-primary-color-light': theme.palette.secondary.dark,
                                    '--button-primary-color-active': theme.palette.secondary.dark,
                                    '--button-primary-color-hover': theme.palette.secondary.main,
                                    '--button-default-border-radius': "24px",
                                    '--button-hover-pressure': "1",
                                    height: "10vh",
                                    '--button-raise-level': "10px"
                                }} type="primary" onPress={handleAddUnitToMap}>
                                    <h1 style={{fontSize: "2vw", paddingRight: "1vw", paddingLeft: "1vw"}}>
                                        Add Unit to Map
                                    </h1>
                                </AwesomeButton>
                            </Box>
                    </Grid>
                )}
            </Box>
        )
    }

    const [expandedCard, setExpandedCard] = useState(null);

    const handleToggleClick = (index: any) => {
        if (expandedCard === index) {
            setExpandedCard(null);
        } else {
            setExpandedCard(index);
        }
    };

    const userJourney = () => {
        return (
            <Box sx={{ overflow: 'hidden', position: "relative" }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", m: 2 }}>
                    <Typography variant="h2" sx={{ color: theme.palette.text.primary }}>
                        Your Journey
                    </Typography>
                </Box>
                {unitData.map((unit, index) => (
                    <div key={unit._id}>
                        <Grid container>
                            {index % 2 === 0 ?
                                (<Grid item xl={4} sx={{ display: "flex", justifyContent: "start", paddingTop: '20vh', flexDirection: "column", alignItems: "center" }}>
                                    {<JourneyPortals currentIndex={index} />}
                                </Grid>)
                                :
                                (<Grid item xl={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: 'column', textAlign: "justify" }}>

                                    <Card
                                        sx={{
                                            borderRadius: "30px",
                                            backgroundColor: hexToRGBA(unit.color, 0.5),
                                            overflow: "hidden",
                                            position: 'relative',
                                            boxShadow: (expandedCard === index) ? '' : `inset 0px -50px 75px -25px ${hexToRGBA(unit.color, 0.5)}`,
                                        }}>
                                        <div style={{
                                            maxHeight: (expandedCard === index) ? 'none' : '60vh',
                                            overflow: 'hidden',
                                            position: 'relative',
                                        }}>
                                            <div style={{
                                                backgroundColor: 'rgb(255,255,255,0.5)',
                                                color: 'black',
                                                textAlign: 'center',
                                            }}>
                                                <Typography variant={'h4'}>Handout</Typography>
                                            </div>
                                            <MarkdownRenderer
                                                //markdown={unit.handout.replace(/^.*\n/, "# <p style=\"text-align: center;\">Handout</p>")}
                                                markdown={unit.handout}
                                                style={{
                                                    margin: "20px",
                                                    fontSize: "1rem",
                                                    width: "fit-content",
                                                    maxWidth: "475px",
                                                }}
                                            />
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '43px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backdropFilter: (expandedCard === index) ? '' : 'blur(1px)'
                                        }}>
                                            <Button
                                                variant={"contained"}
                                                onClick={() => handleToggleClick(index)}
                                                sx={{
                                                    zIndex: 2,
                                                    opacity: (expandedCard === index) ? 0 : 0.7,
                                                    '&:hover': { opacity: 0.7},
                                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                                    borderRadius: '50%',
                                                    color: 'black',
                                                    minWidth: '30px',
                                                    height: '30px',
                                                    padding: '5px',
                                                }}
                                            >
                                                {(expandedCard === index) ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                                            </Button>
                                        </div>
                                    </Card>
                                </Grid>)
                            }
                            <Grid item xl={4} sx={{
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                alignItems: "center",
                                borderRadius: "30px",
                                mt: 2,
                                backgroundColor: unit.color
                            }}>
                                <Box sx={{p: 2}}>
                                    <Typography variant={'h5'}>{unit.name}</Typography>
                                </Box>
                                {JourneyStops(unit.tasks)}
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
                                        '--button-hover-pressure': "1",
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
                            {index % 2 === 0 ?
                                (<Grid item xl={4} sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: 'column', textAlign: "justify" }}>

                                    <Card
                                        sx={{
                                            borderRadius: "30px",
                                            backgroundColor: hexToRGBA(unit.color, 0.5),
                                            overflow: "hidden",
                                            position: 'relative',
                                            boxShadow: (expandedCard === index) ? '' : `inset 0px -50px 75px -25px ${hexToRGBA(unit.color, 0.5)}`,
                                        }}>
                                        <div style={{
                                            maxHeight: (expandedCard === index) ? 'none' : '60vh',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            textAlign: 'justify',
                                        }}>
                                            <div style={{
                                                backgroundColor: 'rgb(255,255,255,0.5)',
                                                color: 'black',
                                                textAlign: 'center',
                                            }}>
                                                <Typography variant={'h4'}>Handout</Typography>
                                            </div>
                                            <MarkdownRenderer
                                                //markdown={unit.handout.replace(/^.*\n/, "# <p style=\"text-align: center;\">Handout</p>")}
                                                markdown={unit.handout}
                                                style={{
                                                    margin: "20px",
                                                    fontSize: "1rem",
                                                    width: "fit-content",
                                                    maxWidth: "475px",
                                                }}
                                            />
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '43px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backdropFilter: (expandedCard === index) ? '' : 'blur(1px)'
                                        }}>
                                            <Button
                                                variant={"contained"}
                                                onClick={() => handleToggleClick(index)}
                                                sx={{
                                                    zIndex: 2,
                                                    opacity: (expandedCard === index) ? 0 : 0.7,
                                                    '&:hover': { opacity: 0.7},
                                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                                    borderRadius: '50%',
                                                    color: 'black',
                                                    minWidth: '30px',
                                                    height: '30px',
                                                    padding: '5px',
                                                }}
                                            >
                                                {(expandedCard === index) ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                                            </Button>
                                        </div>
                                    </Card>
                                </Grid>)
                                :
                                (<Grid item xl={4} sx={{ display: "flex", justifyContent: "start", paddingTop: '20vh', flexDirection: "column", alignItems: "center" }}>
                                    {<JourneyPortals currentIndex={index} />}
                                </Grid>)
                            }
                        </Grid>
                    </div>
                ))}
                {nextUnitPreview()}
            </Box>
        )
    }

    const pageContent = () => {
        if (loading) {
            return null;
        }
        if (activeJourney) {
            return userJourney();
        }
        return <GetStarted />;
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {pageContent()}
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

export default JourneyMain;