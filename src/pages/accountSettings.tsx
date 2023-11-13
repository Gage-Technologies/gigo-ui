

import * as React from "react";
import {useEffect, useState} from "react";
import {
    Box,
    Button,
    createTheme,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, FormControlLabel, Grid, Modal,
    PaletteMode, Switch,
    Tab,
    Tabs,
    TextField,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {
    initialAuthState,
    initialAuthStateUpdate,
    selectAuthState,
    selectAuthStateEmail,
    selectAuthStatePhone,
    selectAuthStateUserName, updateAuthState
} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {ThreeDots} from "react-loading-icons";
import Avataaar from "../components/Avatar/avatar";
import ReactDOM from "react-dom";
import {LoadingButton} from "@mui/lab";
import UserIcon from "../components/UserIcon";
import {persistStore} from "redux-persist";
import {store} from "../app/store";
import {resetAppWrapper} from "../reducers/appWrapper/appWrapper";
import {clearProjectState} from "../reducers/createProject/createProject";
import {clearSearchParamsState} from "../reducers/searchParams/searchParams";
import {clearJourneyFormState} from "../reducers/journeyForm/journeyForm";
import {clearCache} from "../reducers/pageCache/pageCache";
import { clearMessageCache } from "../reducers/chat/cache";
import { clearChatState } from "../reducers/chat/chat";


function AccountSettings() {

    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [tab, setTab] = React.useState("user")
    const [deleteAccount, setDeleteAccount] = React.useState(false)

    const CurrentBgColor = theme.palette.background

    const styles = {
        themeButton: {
            display: "flex",
            justifyContent: "right"
        },
        createAccount: {
            display: "flex",
            marginLeft: "auto",
            marginTop: "3vh",
            paddingLeft: "40%",
            fontSize: "200%"
        },
        textField: {
            color: `text.secondary`
        },
        card: {
            backgroundColor: theme.palette.background
        }
    };

    const dispatch = useAppDispatch();

    const authState = useAppSelector(selectAuthState);

    let navigate = useNavigate();

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue);
        setMembershipType("info")
    };

    const username = useAppSelector(selectAuthStateUserName);
    const email = useAppSelector(selectAuthStateEmail)
    const phone = useAppSelector(selectAuthStatePhone)

    const [updatedUsername, setUpdatedUsername] = useState("");
    const [updatedEmail, setUpdatedEmail] = useState("");
    const [updatedPhone, setUpdatedPhone] = useState("");
    const [edit, setEdit] = React.useState(false);
    const [oldPassword, setOldPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [newUsername, setNewUsername] = React.useState("");
    const [newEmail, setNewEmail] = React.useState("");
    const [newPhone, setNewPhone] = React.useState("");

    const [workspaceRunStart, setWorkspaceRunStart] = React.useState(true)

    const [workspaceUpdateInterval, setWorkspaceUpdateInterval] = React.useState("0")

    const [workspaceLogging, setWorkspaceLogging] = React.useState(true)

    const [workspaceSilent, setWorkspaceSilent] = React.useState(false)

    const [workspaceCommitMessage, setWorkspaceCommitMessage] = React.useState("")

    const [workspaceLocale, setWorkspaceLocale] = React.useState("")

    const [workspaceTimeZone, setWorkspaceTimeZone] = React.useState("")

    //const [deleteAccount, setDeleteAccount] = React.useState(false)

    const [membershipCost, setMembershipCost] = React.useState("")
    const [hasSubscriptionId, setHasSubscriptionId] = React.useState(false)
    const [alreadyCancelled, setAlreadyCancelled] = React.useState(false)

    const [inTrial, setInTrial] = React.useState(false)
    const [hasPaymentInfo, setHasPaymentInfo] = React.useState(false)

    const [membershipType, setMembershipType] = React.useState("info")

    const [membershipDates, setMembershipDates] = React.useState({start: null, last: null, upcoming: null})

    const [membership, setMembership] = React.useState(0)

    const [portalLink, setPortalLink] = React.useState("")

    const [userInfo, setUserInfo] = React.useState(null)

    const [loading, setLoading] = React.useState(false)

    let tabValues = ["user", "membership   ", "workspace settings", "exclusive content setup", "avatar"]

    const [open, setOpen] = React.useState(false)
    const [stripeAccountLink, setStripeAccountLink] = React.useState("")
    const [stripeAccount, setStripeAccount] = React.useState("")
    const [holidayPref, setHolidayPref] = React.useState(true)

    // TODO possibly temp changes, this is so the page doesnt break
    const [Attributes, setAttributes] = useState({
        topType: "NoHair",
        accessoriesType: "Blank",
        avatarRef: {},
        hairColor: "Auburn",
        facialHairType: "Blank",
        clotheType: "ShirtScoopNeck",
        clotheColor: "Heather",
        eyeType: "Close",
        eyebrowType: "RaisedExcitedNatural",
        mouthType: "Serious",
        avatarStyle: "",
        skinColor: "Light",
    });

    const [avatarRef, setAvatarRef] = React.useState({})

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const getPortalLink = async () => {
        let name = call(
            "/api/stripe/portalSession",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            name,
        ])

        if (res !== undefined && res["session"] !== undefined) {
            window.location.replace(res["session"])
            // setPortalLink(res["session"])
        }
    }

    const stripeNavigate = async (yearly: boolean | null) => {
        let res = await call(
            "/api/stripe/premiumMembershipSession",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        if (res["message"] === "You must be logged in to access the GIGO system.") {
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }
        if (res !== undefined && res["return url"] !== undefined && res["return year"] !== undefined){
            if (yearly != null && yearly){
                window.location.replace(res["return year"])
            } else {
                window.location.replace(res["return url"])
            }
        }
    }

    const handleCloseAgree = (yearly: boolean | null) => {
        // if (membership === 1) {
        //     getPortalLink()
        //     // setMembership("Basic")
        //     // setMembershipType("update")
        // } else {
        //     stripeNavigate()
        //     // setMembership("Premium")
        // }
        // if (inTrial) {
        //     if (hasPaymentInfo){
        //         return "Are you sure you wanna downgrade your membership? You'll lose all the best parts of Gigo!"
        //     } else {
        //         "Upgrade to Premium for $15 a month?"
        //     }
        // } else {
        //     if (membership === 0){
        //         return "Upgrade to Premium for $15 a month?"
        //     } else {
        //         return "Are you sure you wanna downgrade your membership? You'll lose all the best parts of Gigo!"
        //     }
        // }
        if (hasSubscriptionId){
            getPortalLink()
        } else {
            stripeNavigate(yearly)
        }
        setOpen(false)
    }



    const setAvatar = (e: { topType: string; accessoriesType: string; avatarRef: {}; hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; } | ((prevState: { topType: string; accessoriesType: string; avatarRef: {}; hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; }) => { topType: string; accessoriesType: string; avatarRef: {}; hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; }) | ((prevState: { topType: string; accessoriesType: string; avatarRef: object; hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; }) => { topType: string; accessoriesType: string; avatarRef: object; hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; })) => {

        setAttributes(e)
        setAvatarRef(
            //@ts-ignore
            ReactDOM.findDOMNode(
                //@ts-ignore
                e.avatarRef.current))
    }

    const [isLoading, setIsLoading] = useState(false)

    const updateAvatarSettings = async () => {
        setIsLoading(true)
        let svgNode = avatarRef
        //@ts-ignore
        let data = svgNode.outerHTML;
        let svg = new Blob([data], { type: "image/svg+xml" });
        let res = call(
            "/api/user/updateAvatar",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {avatar_settings: {topType: Attributes.topType, accessoriesType: Attributes.accessoriesType, hairColor: Attributes.hairColor, facialHairType: Attributes.facialHairType, clotheType: Attributes.clotheType, clotheColor: Attributes.clotheColor, eyeType: Attributes.eyeType, eyebrowType: Attributes.eyebrowType, mouthType: Attributes.mouthType, avatarStyle: Attributes.avatarStyle, skinColor: Attributes.skinColor}},
            svg,
            config.rootPath,
            (res: any) => {
                //@ts-ignore
                if (res !== undefined && res["message"] === "avatar settings edited successfully") {
                    swal("Your avatar was edited successfully.")
                    setIsLoading(false)
                }
            }
        )

    }

    const editWorkspace = async () => {
        console.log("run on start: ", workspaceRunStart)
        console.log("workspace update interval: ", workspaceUpdateInterval)
        console.log("logging: ", workspaceLogging)
        console.log("silent: ", workspaceSilent)
        console.log("commit message: ", workspaceCommitMessage)
        console.log("locale: ", workspaceLocale)
        console.log("timezone: ", workspaceTimeZone)
        if (workspaceCommitMessage === ""){
            swal("Please enter a commit message.")
            return
        }
        let res = await call(
            "/api/user/updateWorkspace",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {
                workspace_settings: {
                    auto_git: {
                        runOnStart: workspaceRunStart,
                        updateInterval: workspaceUpdateInterval,
                        logging: workspaceLogging,
                        silent: workspaceSilent,
                        commitMessage: workspaceCommitMessage,
                        locale: workspaceLocale,
                        timeZone: workspaceTimeZone,
                    }
                }
            },
            null,
            config.rootPath
        )


        //@ts-ignore
        if ("message" in res) {
            const message = res.message;
            // Use the message as needed
            console.log("Response message:", message);
            if (message === "workspace settings edited successfully"){
                swal("Your workspace was edited successfully.")
            }
        } else {
            // Handle the case when the response does not have a "message" property
            console.log("Response does not have a message property");
            swal("Your workspace was not edited successfully.")
        }
        // if (res["message"] === "workspace settings edited successfully") {
        //     swal("Workspace settings were edited successfully.")
        // } else {
        //     swal("We were unable to update workspace settings. Please try again later")
        // }
    }

    const apiLoad = async () => {
        if (membership === 0) {
            let follow = call(
                "/api/user/subscription",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {},
                null,
                config.rootPath
            )

            const [res] = await Promise.all([
                follow
            ])

            if (res === undefined) {
                swal("There has been an issue loading data. Please try again later.")
            }

            setMembership(res["subscription"])
            setMembershipCost(res["payment"])
            setMembershipDates({
                start: res["membershipStart"],
                last: res["lastPayment"],
                upcoming: res["upcomingPayment"]
            })
            setInTrial(res["inTrial"])
            setHasPaymentInfo(res["hasPaymentInfo"])
            setHasSubscriptionId(res["hasSubscription"])
            setAlreadyCancelled(res["alreadyCancelled"])
        }
        if (userInfo === null){
            let name = call(
                "/api/user/get",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {},
                null,
                config.rootPath
            )

            const [res] = await Promise.all([
                name,
            ])

            if (res !== undefined && res["user"] !== undefined) {
                setUserInfo(res["user"])
                setNewUsername(res["user"]["user_name"])
                setNewEmail(res["user"]["email"])
                setNewPhone(res["user"]["phone"])
                setWorkspaceRunStart(res["user"]["workspace_settings"]["auto_git"]["runOnStart"])
                setWorkspaceUpdateInterval(res["user"]["workspace_settings"]["auto_git"]["updateInterval"])
                setWorkspaceLogging(res["user"]["workspace_settings"]["auto_git"]["logging"])
                setWorkspaceSilent(res["user"]["workspace_settings"]["auto_git"]["silent"])
                setWorkspaceCommitMessage(res["user"]["workspace_settings"]["auto_git"]["commitMessage"])
                setWorkspaceLocale(res["user"]["workspace_settings"]["auto_git"]["locale"])
                setWorkspaceTimeZone(res["user"]["workspace_settings"]["auto_git"]["timeZone"]);
                (res["user"]["avatar_settings"]) !== null ? setAttributes(res["user"]["avatar_settings"]) : setAttributes(Attributes);
                (res["user"]["stripe_account"]) !== undefined ? setStripeAccount(res["user"]["stripe_account"]) : setStripeAccount("")
            }
        }
    }

    const checkUserHoliday = async () => {
        // record click action
        let profile =  call(
            "/api/user/get",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {
            },
            null,
            config.rootPath
        )
        const [res] = await Promise.all([
            profile,
        ])

       setHolidayPref(res["user"]["holiday_themes"])
    }

    const updateHoliday = async() => {
        let update = call(
            "/api/user/updateHolidayPreference",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            update,
        ])

        if (res === undefined || res["message"] === undefined || res["message"] !== "user holiday preference updated") {
            swal("We are unable to process your request at this time. Please try again later.")
        } else {
            setHolidayPref(!holidayPref)
        }

    }

    useEffect(() => {
        const storedValue = window.sessionStorage.getItem("accountsPage");
        if (storedValue !== null && storedValue === "membership") {
            setTab("membership   ")
            setMembershipType("info")
        }
        console.log("sessionVar: ", storedValue)
        window.sessionStorage.removeItem("accountsPage");
        setLoading(true)
        apiLoad().then(r => console.log("here: ", r))
        setLoading(false)
        checkUserHoliday()
    }, [])


    const editUser = async () => {
        if (newUsername.length > 50){
            swal("Username must be less than 50 characters.")
            return
        }
        if (newUsername !== username) {
            let user = call(
                "/api/user/changeUsername",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {new_username: newUsername},
                null,
                config.rootPath
            )

            const [resUser] = await Promise.all([
                user,
            ])

            if (resUser["message"] === "Username updated successfully") {
                setEdit(false)
                swal("Username updated successfully.")
            } else {
                swal(resUser["message"])
            }
        }

        if (newEmail!== email) {
            let email = call(
                "/api/user/changeEmail",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {new_email: newEmail},
                null,
                config.rootPath
            )

            const [resEmail] = await Promise.all([
                email,
            ])

            if (resEmail["message"] === "Email updated successfully") {
                setEdit(false)
                swal(
                    "Success",
                    "Email updated successfully."
                );
            } else if (resEmail["message"] === "email is already in use") {
                swal(
                    "Email in use",
                    "It appears the email you provided was already in use"
                );
            } else {
                swal(
                    "Error",
                    resEmail["message"]
                );
            }
        }

        if (newPhone!== phone) {
            let phone = call(
                "/api/user/changePhone",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {new_phone: newPhone},
                null,
                config.rootPath
            )

            const [resPhone] = await Promise.all([
                phone,
            ])

            if (resPhone["message"] === "Phone number updated successfully") {
                setEdit(false)
                swal("Phone number updated successfully.")
            } else {
                swal(resPhone["message"])
            }
        }

        if (newPassword !== "") {
            let password = call(
                "/api/user/changePassword",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {old_password: oldPassword, new_password: newPassword},
                null,
                config.rootPath
            )

            const [resPass] = await Promise.all([
                password,
            ])

            if (resPass["message"] === "Phone number updated successfully") {
                setEdit(false)
                swal("Password changed successfully.")
            } else {
                swal(resPass["message"])
            }
        }

    }

    const clearReducers = () => {
        let authState = Object.assign({}, initialAuthState)
        // @ts-ignore
        dispatch(updateAuthState(authState))

        dispatch(resetAppWrapper())
        dispatch(clearProjectState())
        dispatch(clearSearchParamsState())
        dispatch(clearJourneyFormState())
        dispatch(clearCache())
        dispatch(clearMessageCache())
        dispatch(clearChatState())
    }

    const deleteUserAccount = async () => {
        clearReducers()

        let res = await call(
            "/api/user/deleteUserAccount",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        if (res === undefined || res["message"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }

        if (res["message"] !== "Account has been deleted.") {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    (res["message"] !== "internal server error occurred") ?
                        res["message"] :
                        "An unexpected error has occurred. We're sorry, we'll get right on that!"
                );
            return;
        }
        swal("User has been deleted.", "You will be redirected to the login page in a few.")
        navigate("/login")
        const persistOptions = {};

        persistStore(store, persistOptions).purge()
        window.sessionStorage.setItem("homeIndex", "undefined")
    }


    const userTab = () => {
        return (
            <Typography component={"div"} sx={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                flexDirection: "column",
                height: "100%"
            }}>
                <Typography component={"div"} sx={{display: "flex", paddingLeft: "9vw", paddingTop: "20px"}}>
                    <UserIcon
                        size={80}
                        userId={authState.id}
                        userTier={authState.tier}
                        userThumb={config.rootPath + "/static/user/pfp/" + authState.id}
                        backgroundName={authState.backgroundName}
                        backgroundPalette={authState.backgroundColor}
                        backgroundRender={authState.backgroundRenderInFront}
                        imageTop={1.6}
                    />
                </Typography>
                <TextField
                    id={"username"}
                    disabled={!edit}
                    variant={`outlined`}
                    color={"primary"}
                    label={"Username"}
                    value={newUsername}
                    required={false}
                    margin={`normal`}
                    InputLabelProps={{shrink: true}}
                    sx={{
                        width: "28vw",
                    }}
                    onChange={(e) => setNewUsername(e.target.value)}
                >
                </TextField>
                <TextField
                    id={"Email"}
                    disabled={!edit}
                    variant={`outlined`}
                    color={"primary"}
                    label={"Email"}
                    required={false}
                    margin={`normal`}
                    value={newEmail}
                    type={`text`}
                    InputLabelProps={{shrink: true}}
                    sx={{
                        width: "28vw",
                    }}
                    onChange={(e) => setNewEmail(e.target.value)}
                >
                </TextField>
                <TextField
                    id={"Phone Number"}
                    disabled={!edit}
                    variant={`outlined`}
                    color={"primary"}
                    label={"Phone Number"}
                    value={newPhone}
                    required={false}
                    margin={`normal`}
                    InputLabelProps={{shrink: true}}
                    sx={{
                        width: "28vw",
                    }}
                    onChange={(e) => setNewPhone(e.target.value)}
                >
                </TextField>
                {edit ? (
                    <Typography component={"div"} sx={{display: "flex", flexDirection: "row", width: "30vw"}}>
                        <Typography>
                            <TextField
                                id={"Password"}
                                variant={`outlined`}
                                type={`password`}
                                color={"primary"}
                                label={"Password"}
                                required={true}
                                margin={`normal`}
                                sx={{
                                    width: "28vw",
                                }}
                                onChange={(e) => setOldPassword(e.target.value)}
                            >
                            </TextField>
                            <TextField
                                id={"newPassword"}
                                variant={`outlined`}
                                type={`password`}
                                color={"primary"}
                                label={"New Password"}
                                required={true}
                                margin={`normal`}
                                sx={{
                                    width: "28vw",
                                }}
                                onChange={(e) => setNewPassword(e.target.value)}
                            >
                            </TextField>
                            <TextField
                                id={"ReTypePassword"}
                                variant={`outlined`}
                                type={`password`}
                                color={"primary"}
                                label={"Re Type New Password"}
                                required={true}
                                margin={`normal`}
                                sx={{
                                    width: "28vw",
                                }}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            >
                            </TextField>
                            <Grid
                                container
                            >
                                <Typography>
                                    <Button onClick={() => setEdit(false)} color={"error"}>
                                        Cancel
                                    </Button>
                                </Typography>
                                <Typography>
                                    <Button
                                        onClick={() => editUser()}
                                    >
                                        Submit
                                    </Button>
                                </Typography>
                            </Grid>
                        </Typography>
                    </Typography>
                ) : (
                    <div>
                        <Button onClick={() => setEdit(true)}>
                            Edit User Details
                        </Button>
                    </div>
                )}
                <div>
                    <Button onClick={() => setDeleteAccount(true)}>
                        Delete Account
                    </Button>
                    <Modal open={deleteAccount} onClose={() => setDeleteAccount(false)}>
                        <Box
                            sx={{
                                width: "40vw",
                                height: "20vh",
                                justifyContent: "center",
                                marginLeft: "40vw",
                                marginTop: "40vh",
                                outlineColor: "black",
                                borderRadius: 1,
                                boxShadow:
                                    "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                                backgroundColor: theme.palette.background.default,
                            }}
                        >
                            <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                                <h4>Are you sure you want to delete your account? You will lose all your work</h4>
                            </div>
                            <div style={{display: "flex", flexDirection: "row", width: "100%", justifyContent: "center"}}>
                                <Button onClick={() => deleteUserAccount()}>
                                    Confirm
                                </Button>
                                <Button onClick={() => setDeleteAccount(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Box>
                    </Modal>
                </div>
            </Typography>
        )
    }

    const exclusiveContentLink = async() => {
        let name = call(
            "/api/stripe/createConnectedAccount",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            name,
        ])

        if (res !== undefined && res["account"] !== undefined) {
            window.location.replace(res["account"])
            // setPortalLink(res["account"])
            // setMembershipType("update")
        }
    }

    const exclusiveContentUpdateLink = async() => {
        let name = call(
            "/api/stripe/updateConnectedAccount",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            name,
        ])

        if (res !== undefined && res["account"] !== undefined) {
            window.location.replace(res["account"])
            // setPortalLink(res["account"])
            // setMembershipType("update")
        }
    }

    const UnixDateConverter = (unixTimestamp: number) => {
        let date = new Date(unixTimestamp * 1000);
        let day = date.getDate();
        let month= date.getMonth() + 1;
        let year = date.getFullYear();

        if (day === 0){
            return "N/A"
        } else {
            return month + "/" + day + "/" + year;
        }
    }

    const exclusiveContentTab = () => {
        return (
            <Typography component={"div"} sx={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                flexDirection: "column",
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                paddingTop: "20px"
            }}>
                {stripeAccount !== "" ? (
                    <Button onClick={() => exclusiveContentUpdateLink()}>
                        Update Connected Account
                    </Button>
                ) : (
                    <Button onClick={() => exclusiveContentLink()}>
                        Setup Connected Account for Exclusive Content
                    </Button>
                )}
            </Typography>
        )
    }

    const determineMembershipStatus = () => {
        if (inTrial) {
            if (hasPaymentInfo){
                if (alreadyCancelled === true){
                    return "Keep Pro at End of Billing Cycle"
                } else {
                    return "Cancel Membership"
                }
            } else {
                return "Get Pro"
            }
        } else {
            if (membership === 0){
                return "Get Pro"
            } else {
                if (alreadyCancelled === true){
                    return "Keep Pro at End of Billing Cycle"
                } else {
                    return "Cancel Membership"
                }
            }
        }
    }

    const determineMembershipMessage = () => {
        if (inTrial) {
            if (hasPaymentInfo){
                if (alreadyCancelled === true){
                    return "Keep Pro at End of Billing Cycle"
                } else {
                    return "Are you sure you wanna downgrade your membership? You'll lose all the best parts of Gigo!"
                }
            } else {
                return (
                    <div>
                        <Button onClick={() => handleCloseAgree(true)}>
                            Get Pro for $135 a year
                        </Button>
                        <Button onClick={() => handleCloseAgree(false)}>
                            Get Pro for $15 a month
                        </Button>
                    </div>
                )
            }
        } else {
            if (membership === 0){
                return (
                    <div>
                        <Button onClick={() => handleCloseAgree(true)}>
                            Get Pro for $135 a year
                        </Button>
                        <Button onClick={() => handleCloseAgree(false)}>
                            Get Pro for $15 a month
                        </Button>
                    </div>
                )
            } else {
                if (alreadyCancelled === true){
                    return "Keep Pro at End of Billing Cycle"
                } else {
                    return "Are you sure you wanna downgrade your membership? You'll lose all the best parts of Gigo!"
                }
            }
        }
    }

    const membershipTab = () => {
        return (
            <Typography component={"div"} sx={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                flexDirection: "column",
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                paddingTop: "20px"
            }}>
                {
                    membershipType === "info" ? (
                        <div>
                            {loading ? (
                                <div>
                                    <Typography component={"div"} sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        height: window.innerHeight,
                                        alignItems: "center"
                                    }}>
                                        <ThreeDots/>
                                    </Typography>
                                </div>
                            ) : (
                                <div>
                                    <Typography component={"div"} variant={"body2"} width={"100%"}>
                                        {membership === 0 ? ("Membership Level: Basic") : ("Membership Level: Premium")}
                                    </Typography>
                                    <hr style={{width: "100%"}}/>
                                    <Typography component={"div"} variant={"body2"}>
                                        {membershipCost === "135.00" ? "Yearly Payment: $" + membershipCost : "Monthly Payment: $" + membershipCost}
                                    </Typography>
                                    <hr style={{width: "100%"}}/>
                                    <Typography component={"div"} variant={"body2"}>
                                        {membershipDates["start"] === 0 ? "Membership Start Date: N/A" : "Membership Start Date: " + UnixDateConverter(
                                            //@ts-ignore
                                            membershipDates["start"])}
                                    </Typography>
                                    <hr style={{width: "100%"}}/>
                                    <Typography component={"div"} variant={"body2"}>
                                        {membershipDates["last"] === 0 ? "Date of Last Payment: N/A" : "Date of Last Payment: " + UnixDateConverter(
                                            //@ts-ignore
                                            membershipDates["last"])}
                                    </Typography>
                                    <hr style={{width: "100%"}}/>
                                    <Typography component={"div"} variant={"body2"}>
                                        {membershipDates["upcoming"] === 0 ? "Date of Upcoming Payment: N/A" : "Date of Upcoming Payment: " + UnixDateConverter(
                                            //@ts-ignore
                                            membershipDates["upcoming"])}
                                    </Typography>
                                    <hr style={{width: "100%"}}/>
                                    <Button onClick={() => getPortalLink()}>
                                        Change Payment Card
                                    </Button>
                                    <Button onClick={handleClickOpen}>
                                        {determineMembershipStatus()}
                                    </Button>
                                    <Dialog
                                        open={open}
                                        onClose={handleClose}
                                        aria-labelledby="alert-dialog-title"
                                        aria-describedby="alert-dialog-description"
                                    >
                                        <DialogTitle id="alert-dialog-title">
                                            {"Change Membership Status?"}
                                        </DialogTitle>
                                        <DialogContent>
                                            <DialogContentText id="alert-dialog-description">
                                                {determineMembershipMessage()}
                                            </DialogContentText>
                                        </DialogContent>
                                        {(inTrial && !hasSubscriptionId) || (!inTrial && membership === 0) ? (<div/>) : (
                                            <DialogActions>
                                                <Button onClick={handleClose}>No</Button>
                                                <Button onClick={() => handleCloseAgree} autoFocus>
                                                    Yes
                                                </Button>
                                            </DialogActions>
                                        )}
                                    </Dialog>
                                </div>
                            )}
                        </div>
                    ) : membershipType === "card" ? (
                        <div>
                            <h3>There was an issue with this action, please try again later</h3>
                        </div>
                    ) : (
                        <div>
                            <h3>There was an issue with this action, please try again later</h3>
                        </div>
                    )
                }
            </Typography>
        )
    }

    const workspaceTab = () => {
        return (
            <div style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                flexDirection: "column",
                height: "100%",
                paddingTop: "20px"
            }}>
                <FormControlLabel
                    control={
                        <Switch checked={workspaceRunStart} name="run"  onChange={() => setWorkspaceRunStart(!workspaceRunStart)}/>
                    }
                    label="Run On Start"
                />
                <TextField
                    id={"updateInterval"}
                    variant={`outlined`}
                    color={"primary"}
                    label={"Update Interval"}
                    value={workspaceUpdateInterval}
                    required={false}
                    margin={`normal`}
                    InputLabelProps={{shrink: true}}
                    sx={{
                        width: "28vw",
                    }}
                    onChange={e => setWorkspaceUpdateInterval(e.target.value)}
                >
                </TextField>
                <FormControlLabel
                    control={
                        <Switch checked={workspaceLogging} name="logging" onChange={() => setWorkspaceLogging(!workspaceLogging)}/>
                    }
                    label="Logging"
                />
                <FormControlLabel
                    control={
                        <Switch checked={workspaceSilent} name="silent" onChange={() => setWorkspaceSilent(!workspaceSilent)}/>
                    }
                    label="Silent"
                />
                <TextField
                    id={"CommitMessage"}
                    variant={`outlined`}
                    color={"primary"}
                    label={"Commit Message"}
                    value={workspaceCommitMessage}
                    required={false}
                    margin={`normal`}
                    InputLabelProps={{shrink: true}}
                    sx={{
                        width: "28vw",
                    }}
                    onChange={e => setWorkspaceCommitMessage(e.target.value)}
                >
                </TextField>
                <TextField
                    id={"Locale"}
                    variant={`outlined`}
                    color={"primary"}
                    label={"Locale"}
                    required={false}
                    margin={`normal`}
                    value={workspaceLocale}
                    type={`text`}
                    InputLabelProps={{shrink: true}}
                    sx={{
                        width: "28vw",
                    }}
                    onChange={e => setWorkspaceLocale(e.target.value)}
                >
                </TextField>
                <TextField
                    id={"TimeZone"}
                    variant={`outlined`}
                    color={"primary"}
                    label={"Time Zone"}
                    value={workspaceTimeZone}
                    required={false}
                    margin={`normal`}
                    InputLabelProps={{shrink: true}}
                    sx={{
                        width: "28vw",
                    }}
                    onChange={e => setWorkspaceTimeZone(e.target.value)}
                >
                </TextField>
                <FormControlLabel
                    control={
                        <Switch checked={holidayPref} name="holiday"  onChange={() => updateHoliday()} />
                    }
                    label="Toggle VSCode Holiday Themes"
                />
                <Button
                    sx={{paddingTop: "4vh"}}
                    onClick={async () => {
                        await editWorkspace()
                    }}
                >
                    Submit
                </Button>
            </div>

        )
    }

    const avatarTab = () => {
        // @ts-ignore
        return (
            <div style={{position: "relative", top: "35px", display: "flex", flexDirection: "row"}}>
                <Typography component={"div"} sx={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    flexDirection: "column",
                    height: "100%",
                    align: "center"
                }}>
                    <Avataaar value={Attributes} onChange={(e: React.SetStateAction<{ topType: string; accessoriesType: string; avatarRef: object, hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; }>) => setAvatar(e)}/>
                    <div style={{paddingTop: "30px", width: "100%", display: 'flex', alignItems: "center"}}>
                        <LoadingButton loading={isLoading} onClick={() => updateAvatarSettings()}>
                            Set Avatar
                        </LoadingButton>
                    </div>
                </Typography>
            </div>
        )
    }

    const tabDetermination = () => {
        if (tab === "user") {
            return userTab()
        } else if (tab === "workspace settings") {
            return workspaceTab()
        } else if (tab === "membership   ") {
            return membershipTab()
        } else if (tab === "exclusive content setup") {
            return exclusiveContentTab()
        } else {
            return avatarTab()
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {/*<AppWrapper/>*/}
                <Box
                    sx={{
                        width: "65vw",
                        height: "80vh",
                        justifyContent: "center",
                        marginLeft: "18vw",
                        marginTop: "5vh",
                        outlineColor: "black",
                        borderRadius: 1,
                        boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                        // outline: `solid`
                    }}
                >
                    <Typography sx={{display: "flex"}}>
                        <Typography sx={{display: "flex", justifyContent: "left", height: "100%", paddingTop: "100px"}}>
                            <Tabs
                                orientation="vertical"
                                value={tab}
                                onChange={handleChange}
                                aria-label="Vertical tabs"
                                style={{width: "10vw"}}
                            >
                                {tabValues.map((minorValue) => {
                                    return <Tab label={minorValue} value={minorValue}
                                                sx={{color: "text.primary", paddingRight: "20px"}}/>;
                                })}
                            </Tabs>
                        </Typography>
                        <Typography sx={{paddingLeft: "8vw"}}>
                            {tabDetermination()}
                        </Typography>
                    </Typography>
                </Box>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default AccountSettings;