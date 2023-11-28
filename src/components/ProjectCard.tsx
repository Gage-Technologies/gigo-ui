import * as React from "react"
import {
    Button,
    ButtonBase,
    Card, CardActions,
    CardContent,
    CardMedia,
    Chip,
    createTheme, Dialog, Grid,
    Icon,
    PaletteMode,
    SvgIcon,
    Tooltip,
    Typography
} from "@mui/material";
import { themeHelpers, getAllTokens } from "../theme";
import { string } from "prop-types";
import UserIcon from "./UserIcon";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HorseIcon from "./Icons/Horse";
import HoodieIcon from "./Icons/Hoodie";
import { QuestionMark } from "@mui/icons-material";
import TrophyIcon from "./Icons/Trophy";
import GraduationIcon from "./Icons/Graduation";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import renown1 from "../img/renown/renown1.svg"
import renown2 from "../img/renown/renown2.svg"
import renown3 from "../img/renown/renown3.svg"
import renown4 from "../img/renown/renown4.svg"
import renown5 from "../img/renown/renown5.svg"
import renown6 from "../img/renown/renown6.svg"
import renown7 from "../img/renown/renown7.svg"
import renown8 from "../img/renown/renown8.svg"
import renown9 from "../img/renown/renown9.svg"
import renown10 from "../img/renown/renown10.svg"
import DebugIcon from "./Icons/Debug";


interface IProps {
    role: any | null;
    width: number | string,
    height: number | string,
    imageWidth: number | string,
    imageHeight: number | string,
    projectId: string,
    projectTitle: string,
    projectDesc: string,
    projectThumb: string,
    projectDate: string,
    projectType: string,
    renown: number,
    onClick: () => void,
    userTier: string | number,
    userThumb: string,
    userId: string,
    username: string,
    backgroundName: string | null,
    backgroundPalette: string | null,
    backgroundRender: boolean | null,
    hover: boolean,
    attempt: boolean,
    exclusive: boolean | null,
    animate: boolean,
    estimatedTime: number | null
}

export default function ProjectCard(props: IProps) {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    let navigate = useNavigate();

    const styles = {
        card: {
            width: props.width,
            // boxShadow: "0px 6px 3px -3px rgba(0,0,0,0.3),0px 3px 3px 0px rgba(0,0,0,0.3),0px 3px 9px 0px rgba(0,0,0,0.3)",
            // backgroundColor: theme.palette.background.default
            border: "none",
            boxShadow: "none",
            backgroundColor: "transparent",
            backgroundImage: "none",
            animation: props.animate ? 'auraEffect 2s infinite alternate' : 'none',
            overflow: "visible"
        },
        image: {
            borderRadius: "10px",
            // width: props.imageWidth,
            height: props.imageHeight,
            minWidth: 200,
            backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0) 45%, rgba(0,0,0,1) 91%), url(" + props.projectThumb + ")",
            // objectFit: "fill",
        },
        date: {
            textOverflow: "ellipsis",
            overflow: "hidden",
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            color: theme.palette.text.secondary,
            fontWeight: 200,
            fontSize: "0.6em",
            textAlign: "left",
            // paddingLeft: "10px",
        },
        title: {
            textOverflow: "ellipsis",
            overflow: "hidden",
            display: '-webkit-box',
            // WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            textAlign: "left",
            fontSize: "1.1em",
        },
        username: {
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "9ch", // approximately 4 characters wide
            fontSize: "0.8em",
        },
    };

    let hoverStartRef = React.useRef<Date | null>(null);
    let [showHover, setShowHover] = React.useState<boolean>(false);
    let [exit, setExit] = React.useState<boolean>(false);

    let imgSrc;
    switch (props.renown) {
        case 0:
            imgSrc = renown1;
            break;
        case 1:
            imgSrc = renown2;
            break;
        case 2:
            imgSrc = renown3;
            break;
        case 3:
            imgSrc = renown4;
            break;
        case 4:
            imgSrc = renown5;
            break;
        case 5:
            imgSrc = renown6;
            break;
        case 6:
            imgSrc = renown7;
            break;
        case 7:
            imgSrc = renown8;
            break;
        case 8:
            imgSrc = renown9;
            break;
        case 9:
            imgSrc = renown10;
            break;

    }

    const hoverWatcherRoutine = async () => {
        while (!exit) {
            if (!showHover && hoverStartRef.current !== null && (new Date().getTime() - hoverStartRef.current.getTime()) > 800) {
                setShowHover(true)
            }
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    const getProjectIcon = (projectType: string) => {
        switch (projectType) {
            case "Playground":
                return (
                    <HorseIcon sx={{ width: "24px", height: "24px" }} />
                )
            case "Casual":
                return (
                    <HoodieIcon sx={{ width: "20px", height: "20px" }} />
                )
            case "Competitive":
                return (
                    <TrophyIcon sx={{ width: "18px", height: "18px" }} />
                )
            case "Interactive":
                return (
                    <GraduationIcon sx={{ width: "20px", height: "20px" }} />
                )
            case "Debug":
                return (
                    <DebugIcon sx={{width: "20px", height: "20px"}} />
                )
            default:
                return (
                    <QuestionMark sx={{ width: "20px", height: "20px" }} />
                )
        }
    }

    /**
     * Convert millis duration to a well formatted time string with a min precision of minutes (ex: 1h2m)
     */
    const millisToTime = (millisDuration: number) => {
        const minutes = Math.floor((millisDuration / (1000 * 60)) % 60);
        const hours = Math.floor((millisDuration / (1000 * 60 * 60)) % 24);
        const days = Math.floor(millisDuration / (1000 * 60 * 60 * 24));

        let timeString = "";

        if (days > 0) {
            timeString += `${days}d `;
        }
        if (hours > 0) {
            timeString += `${hours}h `;
        }
        if (minutes > 0) {
            timeString += `${minutes}m `;
        }

        return timeString.trim();
    };

    const hoverModal = () => {
        return (
            <Dialog
                open={props.hover && showHover}
                fullWidth={true}
                maxWidth={"lg"}
                onClose={() => setShowHover(false)}
                componentsProps={{
                    backdrop: {
                        style: {
                            backdropFilter: "blur(15px)",
                            backgroundColor: "rgba(255,255,255,0.2)"
                        },
                    }
                }}
            >
                <Button
                    href={`/${props.attempt ? "attempt" : "challenge"}/${props.projectId}`}
                    sx={{
                        position: "absolute",
                        top: "20px",
                        float: "right",
                        right: "20px",
                    }}
                >
                    Open {props.attempt ? "Attempt" : "Project"}
                </Button>
                <iframe
                    style={{
                        height: "85vh",
                        border: "none",
                        borderRadius: "10px",
                    }}
                    src={`/${props.attempt ? "attempt" : "challenge"}/${props.projectId}?embed=true`}
                    title={"Challenge Hover: " + props.projectId}
                />
            </Dialog>
        )
    }

    useEffect(() => {
        if (props.hover)
            hoverWatcherRoutine()
        return () => {
            setExit(true)
        }
    }, []);

    // @ts-ignore
    return (
        <>
            <style>
                {`
            @keyframes auraEffect {
                0% {
                    box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${theme.palette.primary.main}, 0 0 20px ${theme.palette.primary.main}, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main} 0 0 35px ${theme.palette.primary.main};
                }
                100% {
                    box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main}, 0 0 40px ${theme.palette.primary.main}, 0 0 50px ${theme.palette.primary.main};
                }
            }
            `}
            </style>
            {hoverModal()}
            <ButtonBase
                href={`/${props.attempt ? "attempt" : "challenge"}/${props.projectId}`}
                // onClick={props.onClick}
                onMouseOver={() => {
                    if (hoverStartRef.current !== null)
                        return
                    hoverStartRef.current = new Date()
                }}
                onMouseLeave={() => {
                    hoverStartRef.current = null
                }}
            >
                <Card sx={styles.card}>
                    <CardMedia
                        component="div"
                        sx={styles.image}
                    />
                    <CardContent
                        // sx={{width: "100%", height: "100%"}}
                        sx={{
                            paddingBottom: "4px",
                            paddingTop: "10px",
                            paddingLeft: "8px",
                            paddingRight: "8px",
                        }}
                    >
                        <div style={{
                            position: "absolute",
                            top: "12%",
                            left: "90%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 1,
                            overflow: "hidden",
                        }}>
                            <Tooltip
                                title={`Renown ${props.renown + 1}`}
                            >
                                <img
                                    style={{
                                        height: "7vh",
                                        width: "auto",
                                        opacity: "0.85",
                                        overflow: "hidden",
                                    }}
                                    src={imgSrc}
                                />
                            </Tooltip>
                        </div>
                        <Grid container rowSpacing={1} columnSpacing={2} justifyContent={"space-between"}>
                            <Grid item xs={3}>
                                <UserIcon
                                    size={30}
                                    userId={props.userId}
                                    userTier={props.userTier}
                                    userThumb={props.userThumb}
                                    backgroundName={props.backgroundName}
                                    backgroundPalette={props.backgroundPalette}
                                    backgroundRender={props.backgroundRender}
                                    pro={props.role !== null && props.role.toString() === "1"}
                                />
                                <Tooltip
                                    title={`@${props.username}`}
                                >
                                    <Typography gutterBottom variant="caption" component="div" sx={styles.username}>
                                        @{props.username}
                                    </Typography>
                                </Tooltip>
                                <Typography gutterBottom variant="h6" component="div" sx={styles.date}>
                                    {new Date(props.projectDate).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <Typography gutterBottom variant="h6" component="div" sx={styles.title}>
                                    {props.projectTitle}
                                </Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <Chip
                                    sx={{ float: "left" }}
                                    icon={getProjectIcon(props.projectType)}
                                    color="primary"
                                    label={props.projectType}
                                    variant="outlined"
                                />
                                {props.exclusive !== null && props.exclusive !== undefined && props.exclusive ? (
                                    <AttachMoneyIcon />
                                ) : null}
                            </Grid>
                            {props.estimatedTime !== null && props.estimatedTime > 0 ? (
                                <Grid item xs={3}>
                                    <Tooltip title={"Estimated Tutorial Time"}>
                                        <Typography
                                            sx={{ color: "grey"}}
                                            color="primary"
                                            variant="caption"
                                        >{millisToTime(props.estimatedTime)}</Typography>
                                    </Tooltip>
                                </Grid>
                            ) : null}
                        </Grid>
                    </CardContent>
                </Card>
            </ButtonBase>
        </>
    )
}

ProjectCard.defaultProps = {
    width: "20vw",
    height: "25vh",
    imageWidth: "20vw",
    imageHeight: "16vh",
    projectId: 0,
    projectTitle: "",
    projectDesc: "",
    projectThumb: "",
    projectDate: "",
    projectType: "",
    userTier: 0,
    userThumb: "",
    userId: "",
    username: "",
    backgroundName: null,
    backgroundPalette: null,
    backgroundRender: null,
    hover: true,
    attempt: false,
    role: null,
    animate: false,
    estimatedTime: 0,
}