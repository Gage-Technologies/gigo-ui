

import * as React from "react"
import {Card, CardContent, Chip, IconButton, Tooltip, Typography} from "@mui/material";
import UserIcon from "./UserIcon";
import ThreadMenu from "./ThreadMenu";
import CoffeeIcon from '@mui/icons-material/Coffee';
import {useEffect} from "react";
import config from "../config";
import Lottie from "react-lottie";
import ProBannerCircle from "./Icons/ProBannerCircle";

interface IProps {
    width: number | string,
    height: number | string,
    userName: string,
    userThumb: string,
    userId: string,
    userTier: string,
    commentBody: string,
    commentId: string,
    backgroundName: string | null,
    backgroundPalette: string | null,
    backgroundRender: boolean | null,
    role: any | null,
}

export default function CommentCard(props: IProps) {
    const styles = {
        card: window.innerWidth > 1000 ? {
            display: 'flex',
            width: props.width,
            height: "100%",
        } : {
            display: 'flex',
            width: props.width,
            height: "100%",
        },
        image: {
            width: "20%",
            height: "20%",
            borderRadius: "50%"
        },
        cardContent: {
            display: 'flex',
        },
        sectionDisplay1: window.innerWidth > 1000 ? {
            display: 'flex',
            width: typeof props.width === "number" ? props.width / 15 : props.width,
            justifyContent: "space-between",
        } : {
            display: 'flex',
            width: typeof props.width === "number" ? props.width / 4 : props.width,
            justifyContent: "space-between",
        },
        userName: window.innerWidth > 1000 ? {
            maxWidth: typeof props.width === "number" ? props.width / 7 : props.width,
            fontSize: "20px"
        } : {
            maxWidth: typeof props.width === "number" ? props.width / 7 : props.width,
            fontSize: "18px"
        },
        sectionDisplay2: window.innerWidth > 1000 ? {
            display: "flex",
            height: "100%",
            flexDirection: "column",
        } : {
            display: "flex",
            height: "100%",
            flexDirection: "column",
        },
        commentBody: window.innerWidth > 1000 ? {
            fontSize: "14px",
            height: "100%",
            width: typeof props.width === "number" ? props.width * .9 : props.width
        } : {
            fontSize: "12px",
            height: "100%",
            width: typeof props.width === "number" ? props.width * .7 : props.width
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
                    </Typography>
                    <Typography component={"div"} sx={styles.commentBody} variant={"body2"}>
                        {props.commentBody}
                    </Typography>
                </Typography>
            </CardContent>
        </Card>
    )
}

CommentCard.defaultProps = {
    width: 700,
    height: 100,
    userId: 0,
    userName: "",
    userThumb: "",
    userTier: "",
    commentBody: "",
    discussionId: "",
    role: null
}