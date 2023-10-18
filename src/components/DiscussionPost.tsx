

import * as React from "react"
import {ButtonBase, Card, CardContent, Chip, Tooltip, Typography} from "@mui/material";
import UserIcon from "./UserIcon";

interface IProps {
    width: number | string,
    height: number | string,
    userName: string,
    userThumb: string,
    userId: string,
    userTier: string,
    discussionTitle: string,
    discussionPost: string,
    tags: string[],
    discussionId: string
}

export default function DiscussionPost(props: IProps) {
    const [postHeight, setPostHeight] = React.useState(props.height)
    const styles = {
        card: {
            display: 'flex',
            width: props.width,
            height: postHeight,
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
        },
        sectionDisplay1: {
            display: 'flex',
            width: typeof props.width === "number" ? props.width / 15 : props.width,
            justifyContent: "space-between",
        },
        userName: {
            maxWidth: typeof props.width === "number" ? props.width / 7 : props.width,
            fontSize: "20px"
        },
        sectionDisplay2: {
            display: "flex",
            height: "75px",
            flexDirection: "column",
            width: props.width
        },
        title: {
            fontSize: "20px",
            height: typeof props.height === "number" ? props.height * 1 / 4 : props.height,
            width: typeof props.width === "number" ? props.width * .6 : props.width
        },
        summary: {
            fontSize: "14px",
            height: typeof props.height === "number" ? props.height * 1 / 2 : props.height,
            width: typeof props.width === "number" ? props.width * .9 : props.width
        },
        tags: {
            display: "flex",
            width: typeof props.width === "number" ? props.width * .2 : props.width,
            height: typeof props.height === "number" ? props.height * 1 / 4 : props.height,
            justifyContent: "right"
        },
        tag: {
            display: "flex"

        }
    };

    const handleChange = () => {
        if (postHeight === props.height) {
            setPostHeight(75)
        } else {
            setPostHeight(props.height)
        }
    }

    // @ts-ignore
    return (
        <Card sx={styles.card}>
            <CardContent sx={styles.cardContent}>
                <Typography component={"div"} sx={styles.sectionDisplay1}>
                    <Tooltip title={props.userName}>
                        <Typography component={"div"}>
                            <UserIcon userId={props.userId} userTier={props.userTier} userThumb={props.userThumb} backgroundName={null} backgroundPalette={null} backgroundRender={null}/>
                        </Typography>
                    </Tooltip>
                </Typography>
                <Typography component={"div"} sx={styles.sectionDisplay2}>
                    <ButtonBase onClick={() => handleChange()}>
                        <Typography component={"div"} sx={{display: "flex", flexDirection: "row", height: "100px"}}>
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
                    </ButtonBase>
                    <Typography component={"div"} sx={styles.summary} variant={"body2"}>
                        {props.discussionPost}
                    </Typography>
                </Typography>
            </CardContent>
        </Card>
    )
}

DiscussionPost.defaultProps = {
    width: 700,
    height: 500,
    userId: 0,
    userName: "",
    userThumb: "",
    userTier: "",
    discussionTitle: "",
    discussionPost: "",
    tags: ["", ""],
    discussionId: ""
}