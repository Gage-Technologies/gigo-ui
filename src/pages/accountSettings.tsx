

import * as React from "react";
import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CircularProgress,
    Container,
    createTheme,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, FormControlLabel, Grid, LinearProgress, List, ListItem, ListItemText, Modal,
    PaletteMode, Stack, Switch,
    Tab,
    Tabs,
    TextField,
    ThemeProvider,
    Typography
} from "@mui/material";
import { getAllTokens } from "../theme";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
    initialAuthState,
    initialAuthStateUpdate,
    selectAuthState,
    selectAuthStateEmail,
    selectAuthStatePhone,
    selectAuthStateUserName, updateAuthState
} from "../reducers/auth/auth";
import { useNavigate } from "react-router-dom";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import { ThreeDots } from "react-loading-icons";
import Avataaar from "../components/Avatar/avatar";
import ReactDOM from "react-dom";
import { LoadingButton } from "@mui/lab";
import UserIcon from "../components/UserIcon";
import { persistStore } from "redux-persist";
import { store } from "../app/store";
import { resetAppWrapper } from "../reducers/appWrapper/appWrapper";
import { clearProjectState } from "../reducers/createProject/createProject";
import { clearSearchParamsState } from "../reducers/searchParams/searchParams";
import { clearJourneyFormState } from "../reducers/journeyForm/journeyForm";
import { clearCache } from "../reducers/pageCache/pageCache";
import { clearMessageCache } from "../reducers/chat/cache";
import { clearChatState } from "../reducers/chat/chat";
import StarIcon from '@mui/icons-material/Star';
import stripeWhite from '../img/powered-stripe-white.svg'
import stripeBlack from '../img/powered-stripe-black.svg'
import {clearBytesState} from "../reducers/bytes/bytes";

function AccountSettings() {

    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [tab, setTab] = React.useState("user")
    const [deleteAccount, setDeleteAccount] = React.useState(false)

    const [confirmDeletionContent, setConfirmDeletionContent] = React.useState("")

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

    const [membershipDates, setMembershipDates] = React.useState({ start: null, last: null, upcoming: null })

    const [membership, setMembership] = React.useState(0)

    const [portalLink, setPortalLink] = React.useState("")

    const [userInfo, setUserInfo] = React.useState(null)

    const [loading, setLoading] = React.useState(false)

    const [portalLinkLoading, setPortalLinkLoading] = React.useState(false)

    const [wsSettingsLoading, setWsSettingsLoading] = React.useState(false)

    const [connectedAccountLoading, setConnectedAccountLoading] = React.useState(false)

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
        setPortalLinkLoading(true)

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

        setPortalLinkLoading(false)

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
        if (res !== undefined && res["return url"] !== undefined && res["return year"] !== undefined) {
            if (yearly != null && yearly) {
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
        if (hasSubscriptionId) {
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
            { avatar_settings: { topType: Attributes.topType, accessoriesType: Attributes.accessoriesType, hairColor: Attributes.hairColor, facialHairType: Attributes.facialHairType, clotheType: Attributes.clotheType, clotheColor: Attributes.clotheColor, eyeType: Attributes.eyeType, eyebrowType: Attributes.eyebrowType, mouthType: Attributes.mouthType, avatarStyle: Attributes.avatarStyle, skinColor: Attributes.skinColor } },
            svg,
            config.rootPath,
            (res: any) => {
                //@ts-ignore
                if (res !== undefined && res["message"] === "avatar settings edited successfully") {
                    swal("Your avatar was edited successfully. Please give it a few minutes for the changes to take effect!")
                    setIsLoading(false)
                }
            }
        )

    }

    const editWorkspace = async () => {
        if (workspaceCommitMessage === "") {
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
            ;
            if (message === "workspace settings edited successfully") {
                swal("Success", "Your workspace settings were edited successfully.", "success")
            }
        } else {
            // Handle the case when the response does not have a "message" property
            ;
            swal("Server Error", "An error occured editing your workspace settings.", "error")
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
        if (userInfo === null) {
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
        let profile = call(
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

    const updateHoliday = async () => {
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

        window.sessionStorage.removeItem("accountsPage");
        setLoading(true)
        apiLoad().then(r => console.log("here: ", r))
        setLoading(false)
        checkUserHoliday()
    }, [])


    const editUser = async () => {
        if (newUsername.length > 50) {
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
                { new_username: newUsername },
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

        if (newEmail !== email) {
            let email = call(
                "/api/user/changeEmail",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                { new_email: newEmail },
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

        if (newPhone !== phone) {
            let phone = call(
                "/api/user/changePhone",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                { new_phone: newPhone },
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
                { old_password: oldPassword, new_password: newPassword },
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
        dispatch(clearBytesState())
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
            <Box component={"div"} sx={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
                height: "100%"
            }}>
                <UserIcon
                    size={80}
                    userId={authState.id}
                    userTier={authState.tier}
                    userThumb={config.rootPath + "/static/user/pfp/" + authState.id}
                    backgroundName={authState.backgroundName}
                    backgroundPalette={authState.backgroundColor}
                    backgroundRender={authState.backgroundRenderInFront}
                    imageTop={1.6}
                    mouseMove={false}
                />
                <TextField
                    id={"username"}
                    disabled={!edit}
                    variant={`outlined`}
                    color={"primary"}
                    label={"Username"}
                    value={newUsername}
                    required={false}
                    margin={`normal`}
                    InputLabelProps={{ shrink: true }}
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
                    InputLabelProps={{ shrink: true }}
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
                    InputLabelProps={{ shrink: true }}
                    sx={{
                        width: "28vw",
                    }}
                    onChange={(e) => setNewPhone(e.target.value)}
                >
                </TextField>
                {edit ? (
                    <>
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
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Button variant="outlined" onClick={() => setEdit(false)} color={"error"} sx={{ mr: 1 }}>
                                Cancel
                            </Button>
                            <Button variant="outlined" onClick={() => editUser()} sx={{ ml: 1 }}>
                                Submit
                            </Button>
                        </Box>
                    </>
                ) : (
                    <div>
                        <Button variant="outlined" onClick={() => setEdit(true)}>
                            Edit User Details
                        </Button>
                    </div>
                )}
                <Box
                    sx={{
                        mt: 15
                    }}
                >
                    <Button variant="outlined" color={"error"} onClick={() => setDeleteAccount(true)}>
                        Delete Account
                    </Button>
                    <Dialog
                        open={deleteAccount}
                        onClose={() => {
                            setConfirmDeletionContent("")
                            setDeleteAccount(false)
                        }}
                        aria-labelledby="responsive-dialog-title"
                    >
                        <DialogTitle id="responsive-dialog-title">{"Delete Account"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to delete your account?
                            </DialogContentText>
                            <DialogContentText>
                                Account deletion is permanent and cannot be undone. If you delete your account you will lose all of your work.
                            </DialogContentText>
                            <TextField
                                id={"confirm-delete"}
                                variant={`outlined`}
                                color={"primary"}
                                label={"Type Confirm"}
                                value={confirmDeletionContent}
                                required={true}
                                margin={`normal`}
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) => setConfirmDeletionContent(e.target.value)}
                            >
                            </TextField>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" autoFocus onClick={() => setDeleteAccount(false)} color="primary">
                                Cancel
                            </Button>
                            <Button variant="outlined" onClick={deleteUserAccount} disabled={confirmDeletionContent.toLowerCase() !== "confirm"} color="error">
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        )
    }

    const exclusiveContentLink = async () => {
        setConnectedAccountLoading(true)
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

        setConnectedAccountLoading(false)

        if (res !== undefined && res["account"] !== undefined) {
            window.location.replace(res["account"])
            // setPortalLink(res["account"])
            // setMembershipType("update")
        }
    }

    const exclusiveContentUpdateLink = async () => {
        setConnectedAccountLoading(true)
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

        setConnectedAccountLoading(false)

        if (res !== undefined && res["account"] !== undefined) {
            window.location.replace(res["account"])
            // setPortalLink(res["account"])
            // setMembershipType("update")
        }
    }

    const UnixDateConverter = (unixTimestamp: number) => {
        let date = new Date(unixTimestamp * 1000);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        if (day === 0) {
            return "N/A"
        } else {
            return month + "/" + day + "/" + year;
        }
    }

    const exclusiveContentTab = () => {
        return (
            <Box>
                <Box sx={{
                    margin: 3,
                    padding: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Typography variant="h4" textAlign="left" sx={{ width: "100%", mb: 2 }}>
                        Exclusive Content
                    </Typography>
                    <Card variant="outlined" sx={{ borderRadius: '10px', borderColor: 'primary.main', backgroundColor: "transparent" }}>
                        <CardContent sx={{ display: "flex", flexDirection: "row" }}>
                            <Typography variant="h5" align="left">
                                Account Connection Status:
                            </Typography>
                            <Typography variant="body1" align="right" sx={{ ml: 2, marginTop: "8px" }}>
                                {stripeAccount === "" ? "Not Connected" : "Connected"}
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center' }}>
                            {stripeAccount !== "" ? (
                                <LoadingButton loading={connectedAccountLoading} variant="outlined" onClick={() => exclusiveContentUpdateLink()}>
                                    Update Connected Account
                                </LoadingButton>
                            ) : (
                                <LoadingButton loading={connectedAccountLoading} variant="outlined" onClick={() => exclusiveContentLink()}>
                                    Connect Account
                                </LoadingButton>
                            )}
                        </CardActions>
                    </Card>
                </Box>
                <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Why do I have to set this up?
                    </Typography>
                    <Box my={2}>
                        <Typography variant="body1" align="left" paragraph>
                            Exclusive content creators sell their challenges on GIGO for fixed prices. This helps GIGO provide more detailed and diverse content and rewards content creators for their work.
                        </Typography>
                        <Typography variant="body1" align="left" paragraph>
                            GIGO uses Stripe Connected Accounts to compensate creators when user's purchase exclusive content. In order for you to begin creating exclusive content you must first setup your Stripe Connected Account.
                        </Typography>
                    </Box>
                    <Box my={4} />
                    <Typography variant="h4" align="center" gutterBottom>
                        What Is Exclusive Content?
                    </Typography>
                    <Box my={2}>
                        <Typography variant="body1" align="left" paragraph>
                            Exclusive coding projects are unique, premium programming challenges or assignments that users can access by paying a fee. These projects are designed to provide a stimulating and rewarding learning experience, allowing users to develop and hone their coding skills by working on real-world problems or innovative ideas.
                        </Typography>
                        <Typography variant="body1" align="left" paragraph>
                            These exclusive coding projects often come with detailed instructions, sample code, and test cases to help users understand the problem and validate their solutions. They may also include expert guidance, mentorship, or a more detailed tutorial.
                        </Typography>
                        <Typography variant="body1" align="left" paragraph>
                            By attempting these exclusive coding projects, users can improve their programming abilities, expand their knowledge in specific domains, and showcase their skills to potential employers or clients. The projects can also serve as an excellent addition to a user's portfolio, demonstrating their expertise and commitment to continuous learning.
                        </Typography>
                    </Box>
                    <Box my={4} />
                    <Typography variant="h4" align="center" gutterBottom>
                        How to Create Exclusive Content
                    </Typography>
                    <Box my={2}>
                        <Typography variant="body1" align="left" paragraph>
                            Creating exclusive content is easy, but it is important to know that the standard for a challenge being worthy of being exclusive is higher than general content. Before being able to make any exclusive content, you must also create a connected account for you to receive money into.
                        </Typography>
                        <Box component="ul" sx={{ m: '0 auto', lineHeight: '2em' }}>
                            <Typography component="li">
                                Create a connected account by either going to account settings or clicking the 'Setup Exclusive Content Account' button below.
                            </Typography>
                            <Typography component="li">
                                Once you have created a connected account, can get started by clicking the 'Create Exclusive Content' button below.
                            </Typography>
                            <Typography component="li">
                                When you get serious about creating exclusive content, click the 'Don't Show Me This Page Again' button below and submit it.
                            </Typography>
                            <Typography component="li">
                                Just know, once you hit that button you will only be able to get to this page through the About page.
                            </Typography>
                            <Typography component="li">
                                After you have confirmed to have read this page, clicking the 'Exclusive Content' button in the top menu will take you straight to creating exclusive content.
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        )
    }

    const determineMembershipStatus = () => {
        if (inTrial) {
            if (hasPaymentInfo) {
                if (alreadyCancelled === true) {
                    return "Keep Pro"
                } else {
                    return "Cancel Membership"
                }
            } else {
                return "Get Pro"
            }
        } else {
            if (membership === 0) {
                return "Get Pro"
            } else {
                if (alreadyCancelled === true) {
                    return "Keep Pro"
                } else {
                    return "Cancel Membership"
                }
            }
        }
    }

    const determineMembershipMessage = () => {
        let title = "Go Pro"

        if (inTrial) {
            if (hasPaymentInfo) {
                if (alreadyCancelled === true) {
                    title = "Keep Pro"
                } else {
                    title = "Downgrade your membership? You'll lose all the best parts of Gigo!"
                }
            }
        } else {
            if (membership === 1) {
                if (alreadyCancelled === true) {
                    title = "Keep Pro"
                } else {
                    title = "Downgrade your membership? You'll lose all the best parts of Gigo!"
                }
            }
        }

        let buttons = (
            <>
                <LoadingButton loading={portalLinkLoading} variant="outlined" onClick={() => handleCloseAgree(false)} sx={{ mr: 1 }}>
                    Get Pro
                </LoadingButton>
                <LoadingButton loading={portalLinkLoading} variant="contained" color="secondary" onClick={() => handleCloseAgree(true)} sx={{ ml: 1 }}>
                    Save 25% with Pro Yearly
                </LoadingButton>
            </>
        )

        buttons = (inTrial && !hasSubscriptionId) || (!inTrial && membership === 0) ? buttons : (
            <>
                <Button variant="outlined" onClick={handleClose} sx={{ mr: 1 }}>No</Button>
                <Button variant="outlined" onClick={() => handleCloseAgree(null)} color="primary" autoFocus sx={{ ml: 1 }}>Yes</Button>
            </>
        )

        return (
            <div>
                <Box sx={{ my: 2 }}>
                    <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        {title}
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ color: theme.palette.primary.main, fontSize: ".8em", mr: 1 }} />
                        <span style={{ color: theme.palette.primary.main }}>Access to Code Teacher</span>
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ fontSize: ".7em", ml: 3 }}>
                        Your personal AI tutor.
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ color: theme.palette.primary.main, fontSize: ".8em", mr: 1 }} />
                        <span style={{ color: theme.palette.primary.main }}>Private Projects</span>
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ fontSize: ".7em", ml: 3 }}>
                        Learn in stealth mode.
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ color: theme.palette.primary.main, fontSize: ".8em", mr: 1 }} />
                        <span style={{ color: theme.palette.primary.main }}>More DevSpace Resources</span>
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ fontSize: ".7em", ml: 3 }}>
                        8 CPU cores, 8GB RAM, 50GB disk space.
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ color: theme.palette.primary.main, fontSize: ".8em", mr: 1 }} />
                        <span style={{ color: theme.palette.primary.main }}>Three Concurrent DevSpaces</span>
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ fontSize: ".7em", ml: 3 }}>
                        Run multiple projects.
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ color: theme.palette.primary.main, fontSize: ".8em", mr: 1 }} />
                        <span style={{ color: theme.palette.primary.main }}>Two Streak Freezes a Week</span>
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ fontSize: ".7em", ml: 3 }}>
                        Preserve your streak.
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ color: theme.palette.primary.main, fontSize: ".8em", mr: 1 }} />
                        <span style={{ color: theme.palette.primary.main }}>Premium VsCode Theme</span>
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ fontSize: ".7em", ml: 3 }}>
                        Enhance your coding experience.
                    </Typography>
                </Box>
                {buttons}
            </div>
        )
    }

    const membershipTab = () => {
        const formatDate = (timestamp: number | null) => {
            return timestamp === 0 || timestamp === null ? "N/A" : UnixDateConverter(timestamp);
        };

        let percentageOfMembership = 0;
        if (membershipDates["last"] && membershipDates["last"] > 0 && membershipDates["upcoming"] && membershipDates["upcoming"] > 0) {
            percentageOfMembership = ((new Date().getTime() / 1000) - membershipDates["last"]) / (membershipDates["upcoming"] - membershipDates["last"])




        }

        return (
            <Box sx={{ margin: 3, padding: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                {membershipType === "info" ? (
                    loading ? (
                        <CircularProgress />
                    ) : (
                        <Stack spacing={2} width="100%">
                            <Typography variant="h4" textAlign="left">
                                {`Membership Level`}
                                <span style={{
                                    fontWeight: 200,
                                    marginLeft: "15px",
                                    textTransform: "none"
                                }}>
                                    {membership === 0 ? "Basic" : "Pro"}
                                </span>
                                {membership === 0 && (
                                    <span
                                        style={{
                                            fontWeight: 150,
                                            textTransform: "none",
                                            fontSize: "12px",
                                            marginLeft: "3px"
                                        }}
                                    >
                                        (lame)
                                    </span>
                                )}
                                {membership === 1 && inTrial && (!hasPaymentInfo || alreadyCancelled) && (
                                    <span
                                        style={{
                                            fontWeight: 200,
                                            textTransform: "none",
                                            fontSize: "14px",
                                            marginLeft: "3px"
                                        }}
                                    >
                                        trial
                                    </span>
                                )}
                                {membership === 1 && !inTrial && (!hasPaymentInfo || alreadyCancelled) && (
                                    <span
                                        style={{
                                            fontWeight: 200,
                                            textTransform: "none",
                                            fontSize: "14px",
                                            marginLeft: "3px"
                                        }}
                                    >
                                        cancelled
                                    </span>
                                )}
                            </Typography>
                            <Box>
                                <Card variant="outlined" sx={{ borderRadius: '10px', borderColor: theme.palette.primary.main, backgroundColor: "transparent" }}>
                                    {membership === 1 ? (
                                        <CardContent>
                                            <Typography variant="h6" textAlign="center" gutterBottom>
                                                Membership Details
                                            </Typography>
                                            <Grid container>
                                                <Grid item xs={12}>
                                                    <LinearProgress
                                                        sx={{
                                                            marginTop: "20px",
                                                            marginLeft: "20px",
                                                            marginRight: "20px",
                                                            height: "12px",
                                                            borderRadius: "15px"
                                                        }}
                                                        variant="determinate"
                                                        value={percentageOfMembership * 100}
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <ListItemText
                                                        primary={inTrial ? "Trial Start" : "Date of Last Payment"}
                                                        secondary={formatDate(membershipDates["last"])}
                                                        primaryTypographyProps={{ align: 'left' }}
                                                        secondaryTypographyProps={{ align: 'left' }}
                                                        sx={{
                                                            marginLeft: "20px",
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <ListItemText
                                                        primary={inTrial && !hasPaymentInfo ? "Trial End" : alreadyCancelled ? "End of Pro Access" : "Date of Next Payment"}
                                                        secondary={formatDate(membershipDates["upcoming"])}
                                                        primaryTypographyProps={{ align: 'right' }}
                                                        secondaryTypographyProps={{ align: 'right' }}
                                                        sx={{
                                                            marginRight: "20px",
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <List>
                                                {(!inTrial || hasPaymentInfo) && !alreadyCancelled && (
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={`${membershipCost === "135.00" ? "Yearly" : "Monthly"} Payment`}
                                                            secondary={`$${membershipCost}`}
                                                            primaryTypographyProps={{ align: 'left' }}
                                                            secondaryTypographyProps={{ align: 'left' }}
                                                        />
                                                    </ListItem>
                                                )}
                                                <ListItem>
                                                    <ListItemText
                                                        primary="Membership Start Date"
                                                        secondary={formatDate(membershipDates["start"])}
                                                        primaryTypographyProps={{ align: 'left' }}
                                                        secondaryTypographyProps={{ align: 'left' }}
                                                    />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    ) : (
                                        <CardContent>
                                            <Typography variant="h5" textAlign="center" gutterBottom>
                                                Why Go Pro?
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Card sx={{ minHeight: "100%" }}>
                                                        <CardHeader
                                                            title="Code Teacher"
                                                            subheader={"Your personal AI tutor."}
                                                        />
                                                        <CardContent>
                                                            <Typography variant="body2">
                                                                Unlimited access to a personal coding tutor that helps you understand code and fix errors.
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Card sx={{ minHeight: "100%" }}>
                                                        <CardHeader
                                                            title="Private Projects"
                                                            subheader="Learn in stealth mode."
                                                        />
                                                        <CardContent>
                                                            <Typography variant="body2">
                                                                Create private projects that are accessible only to you.
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Card sx={{ minHeight: "100%" }}>
                                                        <CardHeader
                                                            title="More DevSpace Resources"
                                                            subheader="8 CPU cores, 8GB RAM, 50GB disk space."
                                                        />
                                                        <CardContent>
                                                            <Typography variant="body2">
                                                                Increased CPU and memory allocation for running larger and more complex projects.
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Card sx={{ minHeight: "100%" }}>
                                                        <CardHeader
                                                            title="Concurrent DevSpaces"
                                                            subheader="Run up to 3 DevSpaces at once."
                                                        />
                                                        <CardContent>
                                                            <Typography variant="body2">
                                                                Run multiple DevSpaces at the same time for efficient multitasking.
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Card sx={{ minHeight: "100%" }}>
                                                        <CardHeader
                                                            title="Streak Freezes"
                                                            subheader="Preserve your streak."
                                                        />
                                                        <CardContent>
                                                            <Typography variant="body2">
                                                                Get 2 streak freezes a week to maintain your learning streak on days you don't log on.
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Card sx={{ minHeight: "100%" }}>
                                                        <CardHeader
                                                            title="Premium VSCode Theme"
                                                            subheader="Code like a pro."
                                                        />
                                                        <CardContent>
                                                            <Typography variant="body2">
                                                                Access to an exclusive Visual Studio Code theme to enhance your development experience.
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    )}
                                </Card>
                            </Box>
                            <Box sx={{ display: 'flex' }}>
                                {membership === 1 && (
                                    <LoadingButton
                                        variant="outlined"
                                        color="primary"
                                        loading={portalLinkLoading}
                                        onClick={() => getPortalLink()}
                                        sx={{
                                            mr: 1
                                        }}
                                    >
                                        Change Payment Card
                                    </LoadingButton>
                                )}
                                <LoadingButton
                                    variant="outlined"
                                    color={determineMembershipStatus() === "Cancel Membership" ? "error" : "secondary"}
                                    onClick={handleClickOpen}
                                    loading={portalLinkLoading}
                                    sx={{
                                        ml: 1
                                    }}
                                >
                                    {determineMembershipStatus()}
                                </LoadingButton>
                                <img
                                    style={{
                                        height: "36px",
                                        marginLeft: "auto"
                                    }}
                                    src={mode === "light" ? stripeBlack : stripeWhite}
                                />
                            </Box>
                            <Dialog open={open} onClose={handleClose}>
                                <DialogTitle>{"Change Membership Status?"}</DialogTitle>
                                <DialogContent>
                                    <DialogContentText>{determineMembershipMessage()}</DialogContentText>
                                </DialogContent>
                            </Dialog>
                        </Stack>
                    )
                ) : (
                    <Typography variant="h6" textAlign="center" color="error">
                        There was an issue with this action, please try again later.
                    </Typography>
                )}
            </Box>
        );
    };

    const workspaceTab = () => {
        return (
            <Box sx={{ margin: 3, padding: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="h4" textAlign="left" sx={{ width: "100%", mb: 2 }}>
                    Workspace Settings
                </Typography>
                <Card variant="outlined" sx={{ borderRadius: '10px', borderColor: theme.palette.primary.main, backgroundColor: "transparent" }}>
                    <CardContent>
                        <Typography variant="h6" textAlign="center" gutterBottom>
                            Auto Git
                        </Typography>
                        <Grid container >
                            <Grid item xs={1} sm={6} md={4}>
                                <FormControlLabel
                                    control={
                                        <Switch checked={workspaceRunStart} name="run" onChange={() => setWorkspaceRunStart(!workspaceRunStart)} />
                                    }
                                    label="Active"
                                />
                                <Typography variant="caption" display="block" gutterBottom>
                                    Toggle Auto Git system inside DevSpaces
                                </Typography>
                            </Grid>
                            <Grid item xs={1} sm={6} md={4}>
                                <FormControlLabel
                                    disabled={!workspaceRunStart}
                                    control={
                                        <Switch checked={workspaceLogging} name="logging" onChange={() => setWorkspaceLogging(!workspaceLogging)} />
                                    }
                                    label="Logging"
                                />
                                <Typography variant="caption" display="block" gutterBottom>
                                    Whether Auto Git will log commits to a local file
                                </Typography>
                            </Grid>
                            <Grid item xs={1} sm={6} md={4}>
                                <FormControlLabel
                                    disabled={!workspaceRunStart}
                                    control={
                                        <Switch checked={workspaceSilent} name="silent" onChange={() => setWorkspaceSilent(!workspaceSilent)} />
                                    }
                                    label="Silent"
                                />
                                <Typography variant="caption" display="block" gutterBottom>
                                    Disable alert popups for Auto Git actions
                                </Typography>
                            </Grid>
                            <Grid item xs={1} sm={6} md={4}>
                                <TextField
                                    disabled={!workspaceRunStart}
                                    id={"updateInterval"}
                                    variant={`outlined`}
                                    color={"primary"}
                                    label={"Update Interval"}
                                    value={workspaceUpdateInterval}
                                    required={false}
                                    margin={`normal`}
                                    InputLabelProps={{ shrink: true }}
                                    onChange={e => setWorkspaceUpdateInterval(e.target.value)}
                                >
                                </TextField>
                                <Typography variant="caption" display="block" gutterBottom>
                                    How frequently in seconds Auto Git will commit changes
                                </Typography>
                            </Grid>
                            <Grid item xs={1} sm={6} md={4}>
                                <TextField
                                    disabled={!workspaceRunStart}
                                    id={"CommitMessage"}
                                    variant={`outlined`}
                                    color={"primary"}
                                    label={"Commit Message"}
                                    value={workspaceCommitMessage}
                                    required={false}
                                    margin={`normal`}
                                    InputLabelProps={{ shrink: true }}
                                    onChange={e => setWorkspaceCommitMessage(e.target.value)}
                                >
                                </TextField>
                                <Typography variant="caption" display="block" gutterBottom>
                                    Commit message that will be used by Auto Git
                                </Typography>
                            </Grid>
                            <Grid item xs={1} sm={6} md={4}>
                                <TextField
                                    disabled={!workspaceRunStart}
                                    id={"Locale"}
                                    variant={`outlined`}
                                    color={"primary"}
                                    label={"Locale"}
                                    required={false}
                                    margin={`normal`}
                                    value={workspaceLocale}
                                    type={`text`}
                                    InputLabelProps={{ shrink: true }}
                                    onChange={e => setWorkspaceLocale(e.target.value)}
                                >
                                </TextField>
                                <Typography variant="caption" display="block" gutterBottom>
                                    Locale to be used by Auto Git in commit messages
                                </Typography>
                            </Grid>
                            <Grid item xs={1} sm={6} md={4}>
                                <TextField
                                    disabled={!workspaceRunStart}
                                    id={"TimeZone"}
                                    variant={`outlined`}
                                    color={"primary"}
                                    label={"Time Zone"}
                                    value={workspaceTimeZone}
                                    required={false}
                                    margin={`normal`}
                                    InputLabelProps={{ shrink: true }}
                                    onChange={e => setWorkspaceTimeZone(e.target.value)}
                                >
                                </TextField>
                                <Typography variant="caption" display="block" gutterBottom>
                                    Timezone used for Auto Git's log file
                                </Typography>
                            </Grid>
                        </Grid>
                        <Typography variant="h6" textAlign="center" gutterBottom>
                            Editor
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch checked={holidayPref} name="holiday" onChange={() => updateHoliday()} />
                            }
                            label="Holiday Themes"
                        />
                        <Typography variant="caption" display="block" gutterBottom>
                            Toggle holiday themes in the editor
                        </Typography>
                    </CardContent>
                </Card>
                <LoadingButton
                    loading={wsSettingsLoading}
                    variant="outlined"
                    sx={{
                        mt: 2
                    }}
                    onClick={async () => {
                        setWsSettingsLoading(true)
                        await editWorkspace()
                        setWsSettingsLoading(false)
                    }}
                >
                    Submit
                </LoadingButton>
            </Box>
        )
    }

    const avatarTab = () => {
        // @ts-ignore
        return (
            <Box sx={{ margin: 3, padding: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Avataaar value={Attributes} onChange={(e: React.SetStateAction<{ topType: string; accessoriesType: string; avatarRef: object, hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; }>) => setAvatar(e)} />
                <LoadingButton 
                    loading={isLoading} 
                    variant="outlined" 
                    onClick={() => updateAvatarSettings()}
                    sx={{
                        mt: 4
                    }}
                >
                    Set Avatar
                </LoadingButton>
            </Box>
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
                        display: 'flex',
                        justifyContent: 'center',
                        // alignItems: 'center',
                        height: 'calc(100vh - 60px)', // Use the full height of the viewport
                        outlineColor: 'black',
                        borderRadius: 1,
                    }}
                >
                    <Grid container sx={{
                        marginTop: "60px"
                    }}>
                        <Grid item xs={2}>
                            <Tabs
                                orientation="vertical"
                                value={tab}
                                onChange={handleChange}
                                aria-label="Vertical tabs"
                                style={{ maxWidth: "300px" }}
                            >
                                {tabValues.map((minorValue) => {
                                    return <Tab label={minorValue} value={minorValue}
                                        sx={{ color: "text.primary", paddingRight: "20px", textAlign: "left", alignItems: "baseline" }} />;
                                })}
                            </Tabs>
                        </Grid>
                        <Grid item xs={10}>
                            <Box
                                sx={{
                                    width: "100%",
                                    justifyContent: 'center',
                                }}
                            >
                                {tabDetermination()}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default AccountSettings;