

import * as React from "react"
import {Avatar, Button, Card, CardContent, Chip, IconButton, PaletteMode, TextField, Tooltip, Typography, createTheme} from "@mui/material";
import UserIcon from "./UserIcon";
import call from "../services/api-call";
import config from "../config";
import {initialAuthStateUpdate, updateAuthState} from "../reducers/auth/auth";
import swal from "sweetalert";
import {useNavigate} from "react-router-dom";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import {useEffect} from "react";
import Lottie from "react-lottie";
import ProBannerCircle from "./Icons/ProBannerCircle";
import { getAllTokens } from "../theme";

interface IProps {
    width: number | string,
    height: number | string,
    userName: string,
    userThumb: string,
    userId: string,
    userTier: string,
    discussionTitle: string,
    discussionSummary: string,
    tags: string[],
    discussionId: string,
    coffee: string,
    backgroundName: string | null,
    backgroundPalette: string | null,
    backgroundRender: boolean | null,
    role: any | null,
}

export default function DiscussionCard(props: IProps) {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);


    const styles = {
        card: window.innerWidth > 1000 ? {
            display: 'flex',
            width: props.width,
            height: "auto",
            background: "transparent",
            border: `1px solid ${theme.palette.primary.main}`
        } : {
            display: 'flex',
            width: props.width,
            height: "auto"
        },
        image: {
            width: "20%",
            height: "20%",
            borderRadius: "50%",
        },
        cardContent: {
            display: 'flex',
        },
        sectionDisplay1: {
            width: props.width,
            height: "50px",
            display: "flex",
            flexDirection: "row",
        },
        userName: window.innerWidth > 1000 ?{
            maxWidth: typeof props.width === "number" ? props.width / 7 : props.width,
            fontSize: "20px"
        } : {
            maxWidth: typeof props.width === "number" ? props.width / 7 : props.width,
            fontSize: "18px"
        },
        sectionDisplay2: {
            paddingRight: "50%",
            lineHeight: 2
        },
        title: window.innerWidth > 1000 ? {
            fontSize: "20px",
            height: typeof props.height === "number" ? props.height * 1 / 4 : props.height,
            width: typeof props.width === "number" ? props.width * .6 : props.width,
            paddingTop: "1px",
        } : {
            fontSize: "18px",
            height: typeof props.height === "number" ? props.height * 1 / 4 : props.height,
            width: typeof props.width === "number" ? props.width * .6 : props.width,
            paddingTop: "1px",
        },
        summary: window.innerWidth > 1000 ? {
            fontSize: "14px",
            height: "100%",
            width: typeof props.width === "number" ? props.width * .9 : props.width,
            paddingTop: "5px",
        } : {
            fontSize: "12px",
            height: "100%",
            width: typeof props.width === "number" ? props.width * .65 : props.width,
            paddingTop: "5px",
        },
        tags: {
            display: "flex",
            width: typeof props.width === "number" ? props.width * .3 : props.width,
            height: typeof props.height === "number" ? props.height * 1 / 4 : props.height,
            justifyContent: "right"
        },
        tag: {
            display: "flex"
        },
        textField: {
            color: `text.secondary`
        },
    };


    // @ts-ignore
    return (
        <Card sx={styles.card}>
            <CardContent sx={styles.cardContent}>
                <Typography component={"div"} sx={styles.sectionDisplay1} style={props.role !== undefined && props.role !== null && props.role.toString() === "1" ? {} : {width: "10%"}}>
                    <Tooltip title={props.userName} placement={`left-start`}>
                        <Typography component={"div"}>
                            <UserIcon userId={props.userId} userTier={props.userTier} userThumb={props.userThumb} backgroundName={props.backgroundName} backgroundPalette={props.backgroundPalette} backgroundRender={props.backgroundRender} pro={props.role !== undefined && props.role !== null && props.role.toString() === "1"} size={50}/>
                        </Typography>
                    </Tooltip>
                </Typography>
                <Typography component={"div"} sx={styles.sectionDisplay2}>
                    <Typography component={"div"} sx={{display: "flex", flexDirection: "row"}}>
                        <Typography component={"div"} sx={styles.title} variant={"h2"}>
                            {props.discussionTitle}
                        </Typography>
                        <Typography component={"div"} sx={styles.tags}>
                            {props.tags && props.tags.map((tag) => {
                                return (
                                    <Typography component={"div"} sx={styles.tag}>
                                        <Chip label={tag}/>
                                    </Typography>
                                )
                            })}
                        </Typography>
                    </Typography>
                    <Typography component={"div"} sx={styles.summary} variant={"body2"}>
                        {props.discussionSummary}
                    </Typography>
                </Typography>
            </CardContent>
        </Card>
    )
}

DiscussionCard.defaultProps = {
    width: 700,
    height: 115,
    userId: 0,
    userName: "",
    userThumb: "",
    userTier: "",
    discussionTitle: "",
    discussionSummary: "",
    tags: ["", ""],
    discussionId: "",
    coffee: "0",
    user_status: null
}