

import * as React from "react"
import {Button, Card, CardContent, Chip, TextField, Tooltip, Typography} from "@mui/material";
import UserIcon from "./UserIcon";
import EditIcon from '@mui/icons-material/Edit';
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {initialAuthStateUpdate, updateAuthState} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import {themeHelpers} from "../theme";

interface IProps {
    width: number | string,
    height: number | string,
    userName: string,
    userThumb: string,
    userId: string,
    userTier: string,
    description: string,
    postDate: string
    userIsOP: boolean,
    id: string,
    renown: number,
    project: boolean,
    backgroundName: string | null,
    backgroundPalette: string | null,
    backgroundRender: boolean | null,
    exclusiveDescription: string | null,
}

export default function PostOverviewMobile(props: IProps) {
    let userPref = localStorage.getItem('theme')

    const styles = {
        card: {
            display: 'flex',
            borderRadius: "18px",
            marginLeft: "5px",
            width: "100%",
            height: "auto",
        },
        image: {
            width: "20%",
            height: "20%",
            borderRadius: "50%"
        },
        cardContent: {
            width: props.width,
            position: "relative",
            zIndex: 10,
            // borderRadius: "10px",
            // borderTopLeftRadius: "10px; !important",
            // boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2);",
            // ...themeHelpers.frostedGlass,
            // backgroundColor: "rgba(206,206,206,0.31)"
        },
        sectionDisplay1: {
            width: props.width,
            height: "auto",
            display: "flex",
            flexDirection: "row",
        },
        userName: {
            maxWidth: typeof props.width === "number" ? props.width / 7 : props.width,
            fontSize: "20px"
        },
        sectionDisplay2: {
            paddingRight: "2%",
            lineHeight: 2,
            height: "auto",
            overflowY: "auto"
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

        },
        textField: {
            color: `text.secondary`,
        },
    };

    const [editMode, setEditMode] = React.useState(false)
    const [readMore, setReadMore] = React.useState(false)

    const [descriptions, setDescriptions] = React.useState(props.description)
    // const [lottieBackground, setLottieBackground] = React.useState(null)

    React.useEffect(() => {
        setDescriptions(props.description)
    }, [props.description])

    let navigate = useNavigate();

    const handleSubmit = async () => {
        if (descriptions.length > 500) {
            swal({
                title: "Error",
                text: "Description is too long",
                icon: "error",
            });
        }
        setEditMode(false)
        if (props.description !== descriptions) {
            let res = await call(
                "/api/editDescription",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {id: props.id, project: props.project, description: descriptions},
                null,
                config.rootPath
            )

            if (res !== undefined && res["message"] === "Edit successful") {
                swal("Description has been successfully edited")
            }
        }
        //todo make api call to edit description
    }

    const handleCancel = () => {
        setEditMode(false)
        setDescriptions(props.description)
    }

    // @ts-ignore
    return (
        <div style={styles.card}>
            <CardContent sx={styles.cardContent}>
                {/*<Typography component={"div"} sx={styles.sectionDisplay1}>*/}
                {/*    <Typography style={{display: "flex", flexDirection: "row", width: "85%"}}>*/}
                {/*        <div>*/}
                {/*            <UserIcon*/}
                {/*                userId={props.userId}*/}
                {/*                userTier={props.userTier}*/}
                {/*                userThumb={props.userThumb}*/}
                {/*                backgroundName={props.backgroundName}*/}
                {/*                backgroundPalette={props.backgroundPalette}*/}
                {/*                backgroundRender={props.backgroundRender}*/}
                {/*                size={50}*/}
                {/*                imageTop={2}*/}
                {/*            />*/}
                {/*        </div>*/}
                {/*        <Typography variant="h5" component="div">*/}
                {/*            {props.userName}*/}
                {/*        </Typography>*/}
                {/*    </Typography>*/}
                {/*    <Typography variant="body1" color="text.primary" align="right">*/}
                {/*        {date.toLocaleString("en-us", {day: '2-digit', month: 'short', year: 'numeric'})}*/}
                {/*    </Typography>*/}
                {/*</Typography>*/}
                {descriptions !== "" && (
                    <>
                        <Typography component={"div"} sx={styles.sectionDisplay2}>
                            <div>
                                {descriptions.length > 200 && !readMore ? descriptions.slice(0, 200) + "...." : descriptions}
                            </div>
                        </Typography>
                        {!readMore ? (
                            <Typography component={"div"} style={{width: props.width, display: "flex", justifyContent: "right"}}>
                                <Button onClick={() => setReadMore(true)} style={{fontSize: "small", color: "grey"}}>
                                    Read More
                                </Button>
                            </Typography>
                        ) : (
                            <Typography component={"div"} style={{width: props.width, display: "flex", justifyContent: "right"}}>
                                <Button onClick={() => setReadMore(false)} style={{fontSize: "small", color: "grey"}}>
                                    Read Less
                                </Button>
                            </Typography>
                        )}
                    </>
                )}
            </CardContent>
        </div>
    )
}

PostOverviewMobile.defaultProps = {
    width: 700,
    height: 500,
    userId: 0,
    userName: "",
    userThumb: "",
    userTier: "",
    description: "",
    postDate: "",
    userIsOP: false,
    id: "",
    project: false
};
