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
    bytesId: string,
    bytesTitle: string,
    bytesThumb: string,
    bytesDesc: string,
    onClick: () => void,
    animate: boolean,
}

export default function BytesCard(props: IProps) {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    let navigate = useNavigate();

    const styles = {
        card: {
            width: props.width,
            // boxShadow: "0px 6px 3px -3px rgba(0,0,0,0.3),0px 3px 3px 0px rgba(0,0,0,0.3),0px 3px 9px 0px rgba(0,0,0,0.3)",
            // backgroundColor: theme.palette.background.default
            height: props.height,
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
            width: props.imageWidth,
            minWidth: 200,
            backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0) 45%, rgba(0,0,0,1) 91%), url(" + props.bytesThumb + ")",
            // objectFit: "fill",
        },
        title: {
            textOverflow: "ellipsis",
            overflow: "hidden",
            display: '-webkit-box',
            // WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            textAlign: "left",
            fontSize: "1em",
            width: props.width,
            margin: 0,
            paddingLeft: 0
        },
        content: {
            paddingBottom: "4px",
            paddingLeft: 0, // Remove left padding to align with the image
            paddingRight: "8px", // You can adjust right padding as needed
            width: props.width
        }
    };
    let [exit, setExit] = React.useState<boolean>(false);

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
            <ButtonBase
                href={`/byte/${props.bytesId}`}
                // onClick={props.onClick}
            >
                <Card sx={styles.card}>
                    <CardMedia
                        component="div"
                        sx={styles.image}
                    />
                    <CardContent
                        // sx={{width: "100%", height: "100%"}}
                        sx={styles.content}
                    >
                        <Typography gutterBottom variant="h6" component="div" sx={styles.title}>
                            {props.bytesTitle}
                        </Typography>
                    </CardContent>
                </Card>
            </ButtonBase>
        </>
    )
}

BytesCard.defaultProps = {
    width: "12vw",
    height: "36vh",
    imageWidth: "12vw",
    imageHeight: "30vh",
    bytesId: 0,
    bytesTitle: "",
    bytesDesc: "",
    bytesThumb: "",
    animate: false,
}