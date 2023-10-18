

import * as React from "react"
import {Button, Card, CardContent, Icon, IconButton, Tooltip, Typography} from "@mui/material";
import UserIcon from "./UserIcon";
import ThreadMenu from "./ThreadMenu";
import CoffeeIcon from '@mui/icons-material/Coffee';
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import CheckIcon from '@mui/icons-material/Check';
import call from "../services/api-call";
import config from "../config";
import {useNavigate} from "react-router-dom";
import XpPopup from "./XpPopup";
import {useEffect} from "react";
import Lottie from "react-lottie";

interface IProps {
    width: number | string,
    height: number | string,
    userName: string,
    userThumb: string,
    userId: string,
    userTier: string,
    attemptId: string,
    commentCoffees: number,
    attemptDesc: string,
    branches: object[],
    OPValidated: boolean,
    closedDate: string,
    ownerEdit: boolean,
    success: boolean,
    backgroundName: string | null,
    backgroundPalette: string | null,
    backgroundRender: boolean | null,
}

export default function ClosedAttempts(props: IProps) {
    const styles = {
        card: {
            display: 'flex',
            height: props.height,
            width: "100%"
        },
        smallCard: {
            display: 'flex',
            width: "100%",
            height: props.height,
            paddingTop: "5px",
            paddingBottom: "5px",
        },
        card2: {
            width: props.width,
            height: props.height,
        },
        image: {
            // borderRadius: "50%",
            width: "20%",
            height: "20%",
            borderRadius: "50%"
            // height: typeof props.height === "number" ? props.height * .7 : props.height,
            // width: typeof props.width === "number" ? props.width * .05 : props.width,
            // margin: '28px',
        },
        cardContent: {
            display: 'flex',
            width: props.width
        },
        sectionDisplay1: {
            display: 'flex',
            width: "15%",
            justifyContent: "left",
            left: "50px",
            height: "40px",
            flexDirection: "column"
        },
        userName: {
            maxWidth: typeof props.width === "number" ? props.width / 7 : props.width,
            fontSize: "20px"
        },
        sectionDisplay2: {
            flexDirection: "column",
            // width: typeof props.width === "number" ? props.width * 17 / 20 : props.width
            width: "100%",
            height: "90%",
            textOverflow: "ellipsis",
            overflow: "hidden",
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
        },
        sectionDisplayMenu: {
            // display: 'flex',
            // width: typeof props.width === "number" ? props.width * 1 / 15 : props.width,
            width: "18%",
            height: "90%",
            paddingLeft: "3%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "right"
            // flexDirection: "column",
            // justifyContent: "right"
        },
        sectionDisplay3: {
            display: "flex",
            height: props.height,
            flexDirection: "column",
            width: typeof props.width === "number" ? props.width * 14 / 15 : props.width
        },
        sectionDisplay4: {
            display: 'flex',
            width: typeof props.width === "number" ? props.width * 1 / 15 : props.width,
            height: "40px"
        },
        title: {
            fontSize: "20px",
            height: typeof props.height === "number" ? props.height * 1 / 4 : props.height,
            width: typeof props.width === "number" ? props.width * .6 : props.width
        },
        summary: {
            fontSize: "14px",
            height: typeof props.height === "number" ? props.height * 1 / 2 : props.height,
            width: typeof props.width === "number" ? props.width * 16/20 : props.width,
        },
        tags: {
            display: "flex",
            width: typeof props.width === "number" ? props.width * .3 : props.width,
            height: typeof props.height === "number" ? props.height * 1 / 4 : props.height,
            justifyContent: "right"
        },
        tag: {
            display: "flex"

        }
    };

    const [thread, setThread] = React.useState(false)

    let navigate = useNavigate();

    const [coffee, setCoffee] = React.useState(false)

    const [coffeeContent, setCoffeeContent] = React.useState(props.commentCoffees)

    const [canEdit, setCanEdit] = React.useState(props.ownerEdit)

    const [isSuccess, setIsSuccess] = React.useState(props.success)

    const [xpData, setXpData] = React.useState(null)


    const handleChange = () => {
        setCoffee(!coffee);
        if (!coffee === true) {
            setCoffeeContent(coffeeContent + 1)
        } else {
            if (coffeeContent - 1 < 0) {
                setCoffeeContent(0)
            } else {
                setCoffeeContent(coffeeContent - 1)
            }
        }
    };

    const markSuccess = () => {
        setIsSuccess(true)
        let successPromise = call(
            "/api/attempt/markSuccess",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {attempt_id: props.attemptId},
            null,
            config.rootPath
        )

        // @ts-ignore
        setXpData(successPromise["xp"])
    }

    let date = new Date(props.closedDate)

        return (
            <div style={{width: props.width, height: props.height}}>
                <Card sx={styles.card}>
                    {xpData !== null && xpData !== undefined ? (<XpPopup oldXP={
                        //@ts-ignore
                        (xpData["xp_update"]["old_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]} levelUp={
                        //@ts-ignore
                        xpData["level_up_reward"] === null ? false : true} homePage={false} popupClose={null} maxXP={100} newXP={(xpData["xp_update"]["new_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]} nextLevel={xpData["xp_update"]["next_level"]} gainedXP={xpData["xp_update"]["new_xp"] - xpData["xp_update"]["old_xp"]} reward={xpData["level_up_reward"]} renown={xpData["xp_update"]["current_renown"]}/>) : null}
                    <CardContent sx={styles.cardContent}>
                        <Typography component={"div"} sx={styles.sectionDisplay1}>
                            <Tooltip title={props.userName}>
                                <Typography component={"div"}>
                                    <UserIcon userId={props.userId} userTier={props.userTier} userThumb={props.userThumb} backgroundName={props.backgroundName} backgroundPalette={props.backgroundPalette} backgroundRender={props.backgroundRender} size={50}/>
                                </Typography>
                            </Tooltip>
                            {props.OPValidated ? (
                                <div>
                                    <Icon>
                                        <CheckIcon style={{ color: 'green' }}/>
                                    </Icon>
                                </div>
                            ) : (<div/>)}
                        </Typography>
                        <Typography component={"div"} sx={styles.sectionDisplay2}>
                            <Typography component={"div"} sx={styles.summary} variant={"body2"}>
                                {props.attemptDesc}
                            </Typography>
                        </Typography>
                        <Typography component={"div"} sx={styles.sectionDisplayMenu}>
                            <Typography sx={{paddingLeft: "20px"}}>
                            </Typography>
                            <Typography component={"div"}
                                        sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <Typography component={"div"} variant={"body2"}
                                >
                                    {coffeeContent.toString()}
                                </Typography>
                                <IconButton aria-label="add to favorites" onClick={() => handleChange()}>
                                    <CoffeeIcon style={{color: coffee === true ? "#674736" : "grey"}}/>
                                </IconButton>
                                <Button variant={"contained"} sx={{height: "20px"}} href={"/attempt/" + props.attemptId}>
                                    View
                                </Button>
                                <div style={{paddingRight: "10px"}}></div>
                                {canEdit && isSuccess === false
                                ?
                                    (
                                    <Tooltip title={"Mark as Success"}>
                                    <IconButton aria-label="mark a success" onClick={() => markSuccess()}>
                                        <CheckCircleIcon style={{color: "grey", paddingLeft:"50px"}}/>
                                    </IconButton>
                                    </Tooltip>
                                    )
                                :
                                    isSuccess === true
                                    ?
                                        <Tooltip title={"Successful Attempt!"}>
                                            <CheckCircleIcon style={{color: "#1c8762" }}/>
                                        </Tooltip>
                                        :
                                        <div style={{paddingRight: "25px"}}>    </div>
                                }
                            </Typography>

                            <Typography>
                                <p style={{fontSize: "small"}}>
                                    {date.toLocaleString("en-us", {day: '2-digit', month: 'short', year: 'numeric'})}
                                </p>
                            </Typography>
                        </Typography>
                    </CardContent>
                </Card>
                {props.branches !== null && props.branches.length > 0 ? (
                    <div style={{display: "flex", width: "100%", flexDirection: "column", paddingTop: "10px", paddingLeft: "5%"}}>
                        {props.branches.map((attempt) => {
                            // @ts-ignore
                            return (
                                <div style={{display: "flex", justifyContent: "center", paddingBottom: "5px"}}>
                                    <Card sx={styles.smallCard}>
                                        <CardContent sx={styles.cardContent}>
                                            <Typography component={"div"} sx={styles.sectionDisplay1}>
                                                <Tooltip title={
                                                    //@ts-ignore
                                                    attempt["userName"]}>
                                                    <Typography component={"div"}>
                                                        <UserIcon userId={props.userId} userTier={props.userTier} userThumb={props.userThumb} backgroundName={props.backgroundName} backgroundPalette={props.backgroundPalette} backgroundRender={props.backgroundRender}/>
                                                    </Typography>
                                                </Tooltip>
                                                {
                                                    //@ts-ignore
                                                    attempt["OPValidated"] ? (
                                                    <div>
                                                        <Icon>
                                                            <CheckIcon style={{ color: 'green' }}/>
                                                        </Icon>
                                                    </div>
                                                ) : (<div/>)}
                                            </Typography>
                                            <Typography component={"div"} sx={styles.sectionDisplay2}>
                                                <Typography component={"div"} sx={styles.summary} variant={"body2"}>
                                                    {
                                                        //@ts-ignore
                                                        attempt["description"]}
                                                </Typography>
                                            </Typography>
                                            <Typography component={"div"} sx={styles.sectionDisplayMenu}>
                                                <Typography sx={{paddingLeft: "20px"}}>
                                                </Typography>
                                                <Typography component={"div"}
                                                            sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                                    <Typography component={"div"} variant={"body2"}
                                                    >
                                                        {coffeeContent.toString()}
                                                    </Typography>
                                                    <IconButton aria-label="add to favorites" onClick={() => handleChange()}>
                                                        <CoffeeIcon style={{color: coffee === true ? "#674736" : "grey"}}/>
                                                    </IconButton>
                                                </Typography>
                                                <Typography>
                                                    <p style={{fontSize: "x-small"}}>{props.closedDate}</p>
                                                </Typography>
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        })}
                    </div>
                ) : (<div/>)}
            </div>
        )
}

ClosedAttempts.defaultProps = {
    width: 700,
    height: 100,
    userId: 0,
    userName: "",
    userThumb: "",
    userTier: "",
    attemptId: "",
    commentCoffee: 0,
    attemptDesc: "",
    branches: null,
    OPValidated: false,
    closedDate: ""
}