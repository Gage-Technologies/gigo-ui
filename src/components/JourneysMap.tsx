import {AwesomeButton} from "react-awesome-button";
import CheckIcon from "@mui/icons-material/Check";
import python from "./Icons/joruneyMainAssets/journey-python-no-cirlce.svg";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import React, {useEffect, useState} from "react";
import {Box, Button, createTheme, Grid, PaletteMode, Popover, SpeedDial, Typography} from "@mui/material";
import DetourCard from "./Icons/joruneyMainAssets/DetourCard";
import {SpeedDialAction} from "@mui/lab";
import ArticleIcon from "@mui/icons-material/Article";
import ForkRightIcon from "@mui/icons-material/ForkRight";
import CloseIcon from "@material-ui/icons/Close";
import {getAllTokens} from "../theme";
import {useAppSelector} from "../app/hooks";
import {selectAuthStateId} from "../reducers/auth/auth";
import call from "../services/api-call";
import config from "../config";
import {ThreeDots} from "react-loading-icons";
import swal from "sweetalert";

interface JourneyMapProps {
    unitId: any;
}

function JourneyMap({ unitId }: JourneyMapProps) {

    const [anchorElDetour, setAnchorElDetour] = useState(null);
    const [anchorElDesc, setAnchorElDesc] = useState(null);
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [openSpeedDial, setOpenSpeedDial] = useState(null);
    const [tasks, setTasks] = React.useState([])

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

    //@ts-ignore
    const handleMouseEnter = (id) => () => setOpenSpeedDial(id);
    const handleMouseLeave = () => setOpenSpeedDial(null);

    //@ts-ignore
    const handleClickDetour = (event) => {
        setAnchorElDetour(event.currentTarget);
    };

    const [taskDescription, setTaskDescription] = useState("")
    const [taskTitle, setTaskTitle] = useState("")
    const [taskId, setTaskId] = useState("")

    //@ts-ignore
    const handleClickDesc = (description, title, taskID) => (event) => {
        setTaskTitle(title)
        setTaskDescription(description)
        setTaskId(taskID)
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
                    width: "5em",
                    height: "4.5em",
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
                    '--button-raise-level': '6px',
                    '--button-hover-pressure': '3',
                    '--transform-speed': '0.275s',
                }} type="primary">
                    <CheckIcon fontSize="large" sx={{width: '1.5em', height: '1.3em'}}/>
                </AwesomeButton>

            );
        } else if (index === firstIncomplete) {
            return (
                <AwesomeButton style={{
                    width: "5em",
                    height: "4.5em",
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
                    '--button-raise-level': '6px',
                    '--button-hover-pressure': '3',
                    '--transform-speed': '0.275s',
                }} type="primary">
                    <div style={{
                        height: "50px",
                        width: "50px",
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
                    width: "5.5em",
                    height: "4.5em",
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
                    '--button-raise-level': '6px',
                    '--button-hover-pressure': '3',
                    '--transform-speed': '0.275s',
                }} type="primary">
                    <QuestionMarkIcon fontSize="large" sx={{width: '1.3em', height: '1em'}}/>
                </AwesomeButton>
            );
        }
    }

    const userId = useAppSelector(selectAuthStateId);

    const getTasks = async () => {
        let res = await call(
            "/api/journey/getTasksInUnit",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {unit_id: unitId, user_id: userId},
            null,
            config.rootPath
        )

        if (res !== undefined && res["success"] !== undefined && res["success"] === true){
            let tasks = res["data"]["tasks"]

            let structuredData = tasks.sort((a: { node_above: number | null; }, b: { node_above: number | null; }) => {
                if (a.node_above === null) return -1;
                if (b.node_above === null) return 1;
                // @ts-ignore
                return a.node_above - b.node_above;
            });

            setTasks(structuredData)
        } else {
            swal("There was an issue getting this data. Please try again.")
        }

        console.log("this is the task: ", res)
        return null
    }

    useEffect(() => {
        getTasks()
    }, [])

    console.log("tasks first: ", tasks)


    const openDetour = Boolean(anchorElDetour);
    const openDesc = Boolean(anchorElDesc);

    //@ts-ignore
    const CurvedPath = ({ points }) => {
        // Assuming the circles have become significantly smaller,
        // you might need to reduce the curve depth even more
        const curveDepth = 5; // Adjust to ensure the curves line up with the circles

        let d = points.map((point: { x: any; y: any; }, i: number, arr: any[]) => {
            if (i === 0) {
                return `M${point.x},${point.y}`;
            } else {
                const prev = arr[i - 1];
                const cx1 = (prev.x + point.x) / 2;
                const cy1 = prev.y;
                const cx2 = (prev.x + point.x) / 2;
                const cy2 = point.y;

                // Alternate the wave's peak direction based on index
                const isPeak = i % 2 === 0;

                // Adjust control points for a smoother transition and to align with the circle centers
                // The control points are now closer to the point itself, which should line up better
                // with the smaller circles
                const controlPointX1 = isPeak ? cx1 - curveDepth : cx1 + curveDepth;
                const controlPointX2 = isPeak ? cx2 - curveDepth : cx2 + curveDepth;

                return `C${controlPointX1},${cy1} ${controlPointX2},${cy2} ${point.x},${point.y}`;
            }
        }).join(' ');

        return (
            <svg style={{ width: '35vw', height: '35vh', overflow: 'visible', position: 'absolute', left: 0, top: 0 }}>
                <path d={d} stroke="#008866" strokeWidth="4" fill="none" strokeDasharray="30,10" />
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
                    <Typography sx={{textTransform: "none"}} variant={"h6"}>
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
            </>

        )
    }

    const taskPopups = () => {;
        return(
            <>
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
                            //@ts-ignore
                            backgroundColor: theme.palette.background.chat,
                        }
                    }}
                >
                    <Box sx={{width: "20vw", height: '30vh', m: 3}}>
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
                            width: "30px",
                            height: "30px",
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
                        onClick={handleClickDesc(item.description, item.name, item.code_source_id)}
                        sx={{
                            backgroundColor: "#52ad94",
                            color: "white"
                        }}
                    />
                </SpeedDial>

                {taskPopups()}
            </>
        )
    }

    function JourneyStops(metadata: any[]) {
        // Assuming each SpeedDial is 130px high and we want 20px gap between them
        const speedDialHeight = 35;
        const gap = 25;
        const points = metadata.map((item, index) => {
            const x = index % 2 === 0 ? 100 : 250; // Alternate X position
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
                            marginLeft: '4vw',
                            transform: `translateX(${index % 2 === 0 ? '-75px' : '75px'})`,
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

    return (
        <>
            {tasks.length > 0 ? (
                <div>
                    {JourneyStops(tasks)}
                </div>
            ) : (
                <Typography component={"div"} sx={{display: "flex", justifyContent: "center", height: "50vh", alignItems: "center"}}>
                    <ThreeDots/>
                </Typography>
            )}
        </>
    )

}

export default JourneyMap