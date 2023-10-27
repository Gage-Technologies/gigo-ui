

import * as React from "react";
import * as moment from 'moment-timezone';
import {SyntheticEvent, useEffect, useState} from "react";
import {
    Autocomplete, Box,
    Button,
    createTheme,
    CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormHelperText,
    Grid, InputAdornment, Menu,
    PaletteMode, Popover, Stack,
    SvgIcon,
    TextField,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {
    DefaultTutorialState,
    initialAuthStateUpdate,
    selectAuthState,
    TutorialState,
    updateAuthState
} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import LockPersonIcon from '@mui/icons-material/LockPerson';
import call from "../services/api-call";
import config from "../config";
import ReactGA from "react-ga4";
// @ts-ignore
import GitHubLogin from 'react-login-github';
import LoginGithub from "../components/Login/Github/LoginGithub";
import githubNameLight from "../img/github/gh_name_light.png"
import githubNameDark from "../img/github/gh_name_dark.png"
import githubLogoLight from "../img/github/gh_logo_light.svg"
import githubLogoDark from "../img/github/gh_logo_dark.svg"
import googleDark from "../img/login/google-logo-white.png"
import googleLight from "../img/login/google_light.png"
import googleLogo from "../img/login/google_g.png"
import loginImg from "../img/login/login_background.png";
import {useGoogleLogin} from "@react-oauth/google";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {authorize, authorizeGithub, authorizeGoogle} from "../services/auth";
import {LoadingButton} from "@mui/lab";
import Tag from "../models/tag";
import swal from "sweetalert";
import TagsInput from "react-tagsinput";
import Input from "@material-ui/core/Input";
import {
Select, MenuItem
} from "@mui/material";
import {ArrowBack, Cancel} from "@material-ui/icons";
import {InputLabel} from "@material-ui/core";
import {programmingLanguages} from "../services/vars";
import {ArrowBackIosNew} from "@mui/icons-material";
import Avataaar from "../components/Avatar/avatar";
import ReactDOM from "react-dom";
import {generateRandomAvatarOptions} from "../components/Avatar/avatarRandomize";
import {clearProjectState, updateCreateProjectState} from "../reducers/createProject/createProject";
import {DefaultWorkspaceConfig, WorkspaceConfig} from "../models/workspace";
import loginImg219 from "../img/login/login_background-21-9.jpg";
import {useParams} from "react-router";


interface TimezoneOption {
    value: string;
    label: string;
}


function CreateNewAccount() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

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
            color: "error"
        },
        card: {
            backgroundColor: theme.palette.background
        }
    };

    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [username, setUsername] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [validEmail, setValidEmail] = React.useState(false)
    const [number, setNumber] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [confirmPass, setConfirmPass] = React.useState("")
    const [external, setExternal] = React.useState(false)
    const [externalLogin, setExternalLogin] = React.useState("")
    const [externalToken, setExternalToken] = React.useState("")
    const [showPass, setShowPass] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [usage, setUsage] = React.useState("")
    const [proficiency, setProficiency] = React.useState<string>("")
    const [step, setStep] = React.useState(0)
    const [timezone, setTimezone] = React.useState<TimezoneOption | null>(null)
    const [tagOptions, setTagOptions] = React.useState<Tag[]>([])
    const [bsTags, setBsTags] = React.useState<boolean>(false)
    const [interestTags, setInterestTags] = React.useState<Tag[]>([])
    const [avatarRef, setAvatarRef] = React.useState({})
    const [userCreated, setUserCreated] = React.useState(false)
    const [tagsExplanationAnchor, setTagsExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const tagsExplanationPopoverOpen = Boolean(tagsExplanationAnchor);
    const [expExplanationAnchor, setExpExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const expExplanationPopoverOpen = Boolean(expExplanationAnchor);
    const [languageExplanationAnchor, setLanguageExplanationAnchor] = React.useState<HTMLElement | null>(null);
    const languageExplanationPopoverOpen = Boolean(languageExplanationAnchor);
    const [unsafe, setUnsafe] = React.useState<boolean>(false)
    const [forcePass, setForcePass] = React.useState<boolean>(false)
    const [missingFirst, setMissingFirst] = React.useState<boolean>(false)
    const [missingLast, setMissingLast] = React.useState<boolean>(false)
    const [missingUser, setMissingUser] = React.useState<boolean>(false)
    const [invalidUsername, setInvalidUsername] = React.useState<boolean>(false)
    const [missingEmail, setMissingEmail] = React.useState<boolean>(false)
    const [missingPhone, setMissingPhone] = React.useState<boolean>(false)
    const [missingPassword, setMissingPassword] = React.useState<boolean>(false)
    const [missingConfirm, setMissingConfirm] = React.useState<boolean>(false)
    const [missingTimezone, setMissingTimezone] = React.useState<boolean>(false)
    const [lastStepDisabled, setLastStepDisabled] = React.useState<boolean>(true)
    const [Attributes, setAttributes] = useState({
        topType: "ShortHairDreads02",
        accessoriesType: "Prescription02",
        avatarRef: {},
        hairColor: "BrownDark",
        facialHairType: "Blank",
        clotheType: "Hoodie",
        clotheColor: "PastelBlue",
        eyeType: "Happy",
        eyebrowType: "Default",
        mouthType: "Smile",
        avatarStyle: "Circle",
        skinColor: "Light",
    });
    const [preferredLanguage, setPreferredLanguage] = useState<string>("");

    const ShowButton = () => (
        <Button
            onClick={() => setShowPass(!showPass)}>
            {showPass ? <VisibilityIcon/> : <VisibilityOffIcon/>}
        </Button>
    )

    // retrieve url params
    let {name} = useParams();

    ReactGA.initialize("G-38KBFJZ6M6");

    function hasLetters(str: string): boolean {
        return /[a-zA-Z]/.test(str);
    }

    const validateUser = async () => {
        let missingFields = [];
        if (firstName === "") {
            setMissingFirst(true);
            missingFields.push('First Name');
        }
        if (lastName === "") {
            setMissingLast(true);
            missingFields.push('Last Name');
        }
        if (username === "") {
            setMissingUser(true);
            missingFields.push('Username');
        }

        if (email === "") {
            setMissingEmail(true);
            missingFields.push('Email');
        }
        if (number === "") {
            setMissingPhone(true);
            missingFields.push('Number');
        }
        if (password === "") {
            setMissingPassword(true);
            missingFields.push('Password');
        }
        if (confirmPass === "") {
            setMissingConfirm(true);
            missingFields.push('Confirm Password');
        }
        if (timezone === null) {
            setMissingTimezone(true);
            missingFields.push('Timezone');
        }
        if (missingFields.length > 0) {
            setLoading(false);
            swal(`Please fill in the following fields:`, `${missingFields.join(', ')}`, "error");
            return;
        }

        if (!hasLetters(username)) {
            swal("Username Invalid", "Username must contain at least one letter!", "error");
            setLoading(false)
            return
        }

        if (password !== confirmPass) {
            //@ts-ignore
            swal("Passwords do not match", "", "error");
            setLoading(false)
            return
        }

        if (password.length < 5){
            //@ts-ignore
            swal("Sorry!", "Your password is too short. Try Another!", "error")
            setLoading(false)
            return
        }

        if (timezone === null) {
            //@ts-ignore
            swal("Timezone must be filled", "", "error")
            setLoading(false)
            return
        }

        if (email !== "") {
            const emailIsValid = await verifyEmail(email);
            if (!emailIsValid) {
                setLoading(false);
                setMissingEmail(true);
                return;
            }
        }

        let res = await call(
            "/api/user/validateUser",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {user_name: username, password: password, email: email, phone: number, timezone: timezone.value, force_pass: forcePass},
        )

        if (res["message"] === "a username is required for user creation") {
            swal("Please enter a username", "", "error")
            setLoading(false)
            setMissingUser(true)
        }
        if (res["message"] === "that username already exists") {
            swal("We're sorry!", "That username is already taken, please choose another", "error")
            setLoading(false)
            setMissingUser(true)
        }
        if (res["message"] === "password is too short for user creation") {
            swal("Sorry!", "Your password is too short. Try Another!", "error")
            setLoading(false)
            setMissingPassword(true)
        }
        if (res["message"] === "email is required for user creation") {
            swal("Please enter your email address", "", "error")
            setLoading(false)
            setMissingEmail(true)
        }
        if (res["message"] === "not a valid email address") {
            swal("We're sorry", "That does not seem to be a valid email address!", "error")
            setLoading(false)
            setMissingEmail(true)
        }
        if (res["message"] === "that email already exists") {
            swal("We're sorry", "This email already has an existing account", "error")
            setLoading(false)
            setMissingEmail(true)
        }
        if (res["message"] === "phone number is required for user creation") {
            swal("Please enter your phone number", "", "error")
            setLoading(false)
            setMissingPhone(true)
        }

        if (res["message"] === "unsafe password") {
            setUnsafe(true)
        }

        if (res["message"] === "User Cleared.") {
            setStep(1)
        }
    }

    const accountCreation = async () => {
        let svgNode = avatarRef
        //@ts-ignore
        let data = svgNode.outerHTML;
        let svg = new Blob([data], { type: "image/svg+xml" });
        setLoading(true)
        if (password!== confirmPass) {
            //@ts-ignore
            swal("Passwords do not match")
            setLoading(false)
            return
        }

        if (password.length < 5){
            //@ts-ignore
            swal("Passwords do not match")
            setLoading(false)
            return
        }

        if (timezone === null) {
            //@ts-ignore
            swal("Timezone must be filled")
            setLoading(false)
            return
        }

        let tagStringArray = interestTags.map(tag => tag.value).join(",")

        if (username.length > 50){
            swal("Username must be less than 50 characters.")
            return
        }

        let params = {
            user_name: username,
            password: password,
            email: email,
            phone: number,
            status: "basic",
            pfp_path: "",
            badges: [],
            tier: "1",
            coffee: "0",
            rank: "0",
            bio: "",
            first_name: firstName,
            last_name: lastName,
            external_auth: "",
            start_user_info: {usage: usage, proficiency: proficiency, tags: tagStringArray, preferred_language: preferredLanguage},
            timezone: timezone.value,
            avatar_settings: {topType: Attributes.topType, accessoriesType: Attributes.accessoriesType, hairColor: Attributes.hairColor, facialHairType: Attributes.facialHairType, clotheType: Attributes.clotheType, clotheColor: Attributes.clotheColor, eyeType: Attributes.eyeType, eyebrowType: Attributes.eyebrowType, mouthType: Attributes.mouthType, avatarStyle: Attributes.avatarStyle, skinColor: Attributes.skinColor},
            force_pass: forcePass
        }

        if (name !== "" && name !== undefined) {
            //@ts-ignore
            params["referral_user"] = name
        }

        let create = await call(
            "/api/user/createNewUser",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            params,
            svg,
            config.rootPath,
            (res: any) => {
                if (res["message"] !== "User Created.") {
                    swal("Somethings went wrong...", res["message"], "error")
                }

                if (res === undefined) {
                    if (sessionStorage.getItem("alive") === null)
                        //@ts-ignore
                        swal(
                            "Server Error",
                            "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                        );
                    return;
                }

                if (res["message"] === "User Created.") {
                    createLogin(true)
                }
            }
        )

        const [createRes] = await Promise.all([
            create,
        ])

        if (createRes["message"] === "You must be logged in to access the GIGO system."){
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }

    }

    const createLogin = async (newUser: boolean | null) => {
        let auth = await authorize(username, password);
        // @ts-ignore
        if (auth["user"] !== undefined) {
            let authState = Object.assign({}, initialAuthStateUpdate)
            authState.authenticated = true
            // @ts-ignore
            authState.expiration = auth["exp"]
            // @ts-ignore
            authState.id = auth["user"]
            // @ts-ignore
            authState.role = auth["user_status"]
            authState.email = auth["email"]
            authState.phone = auth["phone"]
            authState.userName = auth["user_name"]
            authState.thumbnail = auth["thumbnail"]
            authState.exclusiveContent = auth["exclusive_account"]
            authState.exclusiveAgreement = auth["exclusive_agreement"]
            authState.tutorialState = DefaultTutorialState
            dispatch(updateAuthState(authState))

            window.location.href = "/home";

        } else {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal("Sorry, we failed to log you in, please try again on login page");
                setLoading(false)
        }
    }

    /**
     * Handles a search for tags given a query string via the remote GIGO servers
     */
    const handleTagSearch =  async (e : any) => {
        if (typeof e.target.value !== "string") {
            return
        }

        let res = await call(
            "/api/search/tags",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                query: e.target.value,
                skip: 0,
                limit: 5,
            }
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["tags"] === undefined) {
            if (res["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            if (res["message"] === "incorrect type passed for field query") {
                return
            }
            swal("Server Error", res["message"])
            return
        }

        setTagOptions(res["tags"])
    }

    const dispatch = useAppDispatch();

    const authState = useAppSelector(selectAuthState);

    let navigate = useNavigate();

    const [profile, setProfile] = useState([]);

    // transferring data from google login
    const onSuccessGoogle = async (usr: any) => {
        setExternal(true)
        setExternalToken(usr.access_token)
        setExternalLogin("Google")
    }

    const googleButton = useGoogleLogin({
        onSuccess: (usr : any) => onSuccessGoogle(usr)
    });

    const googleCreate = async () => {
        setLoading(true)
        let svgNode = avatarRef
        //@ts-ignore
        let data = svgNode.outerHTML;
        let svg = new Blob([data], { type: "image/svg+xml" });
        if (password!== confirmPass || password.length < 5) {
            //@ts-ignore
            swal("Passwords do not match")
            setLoading(false)
            return
        }

        if (timezone === null) {
            //@ts-ignore
            swal("Timezone must be filled")
            setLoading(false)
            return
        }

        let tagStringArray = interestTags.map(tag => tag.value).join(",")

        let params = {
            external_auth: externalToken,
            password: password,
            start_user_info: {usage: usage, proficiency: proficiency, tags: tagStringArray, preferred_language: preferredLanguage},
            timezone: timezone.value,
            avatar_settings: {topType: Attributes.topType, accessoriesType: Attributes.accessoriesType, hairColor: Attributes.hairColor, facialHairType: Attributes.facialHairType, clotheType: Attributes.clotheType, clotheColor: Attributes.clotheColor, eyeType: Attributes.eyeType, eyebrowType: Attributes.eyebrowType, mouthType: Attributes.mouthType, avatarStyle: Attributes.avatarStyle, skinColor: Attributes.skinColor}
        }

        if (name !== "" && name !== undefined) {
            //@ts-ignore
            params["referral_user"] = name
        }

        let res = await call(
            "/api/user/createNewGoogleUser",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            params,
            svg,
            config.rootPath,
            async (res: any) => {
                if (res["message"] !== "Google User Added.") {
                    swal("Somethings went wrong...", res["message"], "error")
                    setLoading(false)
                }

                if (res === undefined) {
                    if (sessionStorage.getItem("alive") === null)
                        //@ts-ignore
                        swal(
                            "Server Error",
                            "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                        );
                    setLoading(false)
                    return;
                }

                if (res["message"] === "Google User Added.") {
                    let auth = await authorizeGoogle(externalToken, password);
                    // @ts-ignore
                    if (auth["user"] !== undefined) {
                        let authState = Object.assign({}, initialAuthStateUpdate)
                        authState.authenticated = true
                        // @ts-ignore
                        authState.expiration = auth["exp"]
                        // @ts-ignore
                        authState.id = auth["user"]
                        // @ts-ignore
                        authState.role = auth["user_status"]
                        authState.email = auth["email"]
                        authState.phone = auth["phone"]
                        authState.userName = auth["user_name"]
                        authState.thumbnail = auth["thumbnail"]
                        authState.backgroundColor = auth["color_palette"]
                        authState.backgroundName = auth["name"]
                        authState.backgroundRenderInFront = auth["render_in_front"]
                        authState.exclusiveContent = auth["exclusive_account"]
                        authState.exclusiveAgreement = auth["exclusive_agreement"]
                        authState.tutorialState = auth["tutorials"] as TutorialState
                        authState.tier = auth["tier"]
                        dispatch(updateAuthState(authState))

                        window.location.href = "/home";

                    } else {
                        if (sessionStorage.getItem("alive") === null)
                            //@ts-ignore
                            swal("Sorry, we failed to log you in, please try again on login page");
                        setLoading(false)
                    }
                }
            }
        )
        const [createRes] = await Promise.all([
            res,
        ])

        if (createRes["message"] === "You must be logged in to access the GIGO system."){
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
            setLoading(false)
        }
        setLoading(false)
    }

    const onSuccessGithub = async (gh: any) => {
        setExternal(true)
        setExternalToken(gh["code"])
        setExternalLogin("Github")
    }

    const githubCreate = async () => {
        setLoading(true)
        let svgNode = avatarRef
        //@ts-ignore
        let data = svgNode.outerHTML;
        let svg = new Blob([data], { type: "image/svg+xml" });
        if (password!== confirmPass) {
            //@ts-ignore
            swal("Passwords do not match")
            setLoading(false)
            return
        }

        if (password.length < 5) {
            //@ts-ignore
            swal("Password is too short, try again");
            setLoading(false)
            return
        }

        if (timezone === null) {
            //@ts-ignore
            swal("Timezone must be filled")
            setLoading(false)
            return
        }

        let tagStringArray = interestTags.map(tag => tag.value).join(",")

        let params = {
            external_auth: externalToken,
            password: password,
            start_user_info: {usage: usage, proficiency: proficiency, tags: tagStringArray, preferred_language: preferredLanguage},
            timezone: timezone.value,
            avatar_settings: {topType: Attributes.topType, accessoriesType: Attributes.accessoriesType, hairColor: Attributes.hairColor, facialHairType: Attributes.facialHairType, clotheType: Attributes.clotheType, clotheColor: Attributes.clotheColor, eyeType: Attributes.eyeType, eyebrowType: Attributes.eyebrowType, mouthType: Attributes.mouthType, avatarStyle: Attributes.avatarStyle, skinColor: Attributes.skinColor}
        }

        if (name !== "" && name !== undefined) {
            //@ts-ignore
            params["referral_user"] = name
        }

        let res = await call(
            "/api/user/createNewGithubUser",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            params,
            svg,
            config.rootPath,
            async (res: any) => {
                if (res["message"] !== "Github User Added.") {
                    swal("Somethings went wrong...", res["message"], "error")
                }

                if (res === undefined) {
                    if (sessionStorage.getItem("alive") === null)
                        //@ts-ignore
                        swal(
                            "Server Error",
                            "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                        );
                    setLoading(false)
                    return;
                }

                if (res["message"] === "Github User Added.") {
                    let auth = await authorizeGithub(password);
                    // @ts-ignore
                    if (auth["user"] !== undefined) {
                        let authState = Object.assign({}, initialAuthStateUpdate)
                        authState.authenticated = true
                        // @ts-ignore
                        authState.expiration = auth["exp"]
                        // @ts-ignore
                        authState.id = auth["user"]
                        // @ts-ignore
                        authState.role = auth["user_status"]
                        authState.email = auth["email"]
                        authState.phone = auth["phone"]
                        authState.userName = auth["user_name"]
                        authState.thumbnail = auth["thumbnail"]
                        authState.backgroundColor = auth["color_palette"]
                        authState.backgroundName = auth["name"]
                        authState.backgroundRenderInFront = auth["render_in_front"]
                        authState.exclusiveContent = auth["exclusive_account"]
                        authState.exclusiveAgreement = auth["exclusive_agreement"]
                        authState.tutorialState = auth["tutorials"] as TutorialState
                        authState.tier = auth["tier"]
                        dispatch(updateAuthState(authState))

                        window.location.href = "/home";

                    } else {
                        if (sessionStorage.getItem("alive") === null)
                            //@ts-ignore
                            swal("Sorry, we failed to log you in, please try again on login page");
                        setLoading(false)
                    }
                }
            }
        )

        const [createRes] = await Promise.all([
            res,
        ])

        if (createRes["message"] === "You must be logged in to access the GIGO system."){
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
            setLoading(false)
        }

        setLoading(false)
    };

    const verifyEmail = async (emailParam: string) => {
        let isValid = false;

        if (emailParam === "") {
            //@ts-ignore
            swal("You must input a valid email", "", "failed");
            return isValid;
        }

        let res = await call(
            "/api/email/verify",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {
                email: emailParam
            }
        );

        if (res["valid"] === undefined) {
            setValidEmail(false);
            //@ts-ignore
            swal("An unexpected error has occurred", "We're sorry, we'll get right on that!", "error");
        } else if (res["valid"] === false) {
            setValidEmail(false);
            //@ts-ignore
            swal("Invalid Email Address", "", "Please enter a valid email address and retry");
        } else if (res["valid"] === true) {
            setValidEmail(true);
            isValid = true;
        }

        return isValid;
    }


    const getTimeZoneOptions = (showTimezoneOffset?: boolean) => {
        const timeZones = moment.tz.names();
        const offsetTmz: TimezoneOption[] = [];

        for (const i in timeZones) {
            const tz = timeZones[i];
            const tzOffset = moment.tz(tz).format('Z');
            const value: string = parseInt(
                tzOffset
                    .replace(':00', '.00')
                    .replace(':15', '.25')
                    .replace(':30', '.50')
                    .replace(':45', '.75')
            ).toFixed(2);

            const timeZoneOption: TimezoneOption = {
                label: showTimezoneOffset ? `${tz} (GMT${tzOffset})` : tz,
                value: tz
            };
            offsetTmz.push(timeZoneOption);
        }

        return offsetTmz;
    };

    let handleForce = () => {
        setForcePass(true)
        setUnsafe(false)
    }

    const renderInput = ({...props}) => {
        let { onChange, value, ...other } = props;
        return (
            <Input
                onChange={onChange}
                value={value}
                style={{color: theme.palette.text.primary, width: "100%"}}
                {...other}
            />
        );
    }


    let renderTagsExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={tagsExplanationPopoverOpen ? 'tags-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setTagsExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setTagsExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        marginLeft: "3.5vw",
                    }}
                >
                    Learn more about Tags
                </Typography>
                <Popover
                    id="tags-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={tagsExplanationPopoverOpen}
                    anchorEl={tagsExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setTagsExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            Tags are a powerful tool to help us better understand your interests and provide you with personalized recommendations. By providing us with some tags that you are interested in, we can ensure that the challenges and other entities we recommend to you will be relevant to what matters most. We look forward to getting acquainted and helping make your experience more enjoyable!
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }

    let renderExperienceExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={expExplanationPopoverOpen ? 'exp-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setExpExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setExpExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        marginLeft: "3.5vw",
                    }}
                >
                    Learn more about Experience Levels
                </Typography>
                <Popover
                    id="exp-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={expExplanationPopoverOpen}
                    anchorEl={expExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setExpExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            Experience level selection helps us better understand your familiarity with programming concepts and provides a basis for determining what Renown your recommended challenges should have. As a new user of GIGO, you can benefit from our Renown system which is designed to accurately measure your proficiency and progress. By continuing to complete more challenges, you will be able to move up in tiers of Renown - not only helping you determine if you are skilled enough to attempt certain challenges but also providing recognition within the community for your hard work & achievements.
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }

    let renderLanguageExplanationPopover = () => {
        return (
            <div>
                <Typography
                    aria-owns={languageExplanationPopoverOpen ? 'language-explanation-popup' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                        setLanguageExplanationAnchor(event.currentTarget);
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                        setLanguageExplanationAnchor(null);
                    }}
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: 11,
                        marginLeft: "3.5vw",
                    }}
                >
                    Learn more about Preferred Language
                </Typography>
                <Popover
                    id="language-explanation-popup"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={languageExplanationPopoverOpen}
                    anchorEl={languageExplanationAnchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={async () => {
                        setLanguageExplanationAnchor(null);
                    }}
                    disableRestoreFocus
                >
                    <div style={{
                        width: "45vw",
                        paddingTop: "5px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }}>
                        <div style={{
                            fontSize: 12,
                            textOverflow: "wrap"
                        }}>
                            Your preferred programming language helps us tailor your experience on our platform. By selecting a preferred language, we can recommend projects, tutorials, and other resources that are most relevant to you.
                        </div>
                    </div>
                </Popover>
            </div>
        )
    }


    const onFailureGithub = (gh: any) => {
        console.log('github failed:', gh);
    };

    const Tags = () => {
        return (
            <Box
                sx={{
                    background: "#283240",
                    height: "100%",
                    display: "flex",
                    padding: "0.4rem",
                    margin: "0 0.5rem 0 0",
                    justifyContent: "center",
                    alignContent: "center",
                    color: "#ffffff",
                }}
            >
                <Stack direction='row' gap={1}>
                    <Typography>Tags</Typography>
                    <Cancel/>
                </Stack>
            </Box>
        );
    };

    const setAvatar = (e: { topType: string; accessoriesType: string; avatarRef: {}; hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; } | ((prevState: { topType: string; accessoriesType: string; avatarRef: {}; hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; }) => { topType: string; accessoriesType: string; avatarRef: {}; hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; }) | ((prevState: { topType: string; accessoriesType: string; avatarRef: object; hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; }) => { topType: string; accessoriesType: string; avatarRef: object; hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; })) => {

        setAttributes(e)
        setAvatarRef(
            //@ts-ignore
            ReactDOM.findDOMNode(
                //@ts-ignore
                e.avatarRef.current))
        setLastStepDisabled(false)
    }

    let renderAvatar = () => {
        return (
            <form>

                <Avataaar id={"avatar-container"} value={Attributes} sx={{width: window.innerWidth > 1000 ? "auto" : "80%"}} onChange={(e: React.SetStateAction<{ topType: string; accessoriesType: string; avatarRef: object, hairColor: string; facialHairType: string; clotheType: string; clotheColor: string; eyeType: string; eyebrowType: string; mouthType: string; avatarStyle: string; skinColor: string; }>) => setAvatar(e)}/>
                <div style={window.innerWidth > 1000 ? {width: "100%", display: "flex", justifyContent: "center", paddingTop: "1vh",} : {width: "80%", display: "flex", justifyContent: "space-evenly", paddingTop: "1vh", flexDirection: "row"}}>
                    <Button id={"last-step"}
                            onClick={() => {
                                setStep(0)
                            }}
                            sx={window.innerWidth > 1000 ?{
                                // paddingLeft: "5vw",
                                // paddingTop: "1vh",
                                // marginLeft: "1vw",
                                // width: window.innerWidth > 1000 ? "auto" : "1vw",
                                // color: theme.palette.primary.main,
                                // top: "53vh",
                                // left: "5vw",
                            } : {}}
                    >
                        <ArrowBack style={{color: theme.palette.primary.main}}/> Back
                    </Button>
                    <LoadingButton
                        loading={loading}
                        onClick={() => {
                            setStep(2)
                        }}
                        variant={`contained`}
                        color={"primary"}
                        // endIcon={<LockPersonIcon/>}
                        style={window.innerWidth > 1000 ? {
                            width: '15vw',
                            borderRadius: 100,
                            height: "5vh",
                            paddingTop: "1vh",
                            justifyContent: "center",
                            paddingBottom: "5px"
                        } : {
                            width: '100px',
                            borderRadius: 100,
                            height: "5vh",
                            paddingTop: "1vh",
                            paddingBottom: "5px"
                        }}
                        disabled={lastStepDisabled}
                    >
                        Last Step
                    </LoadingButton>
                </div>
                <div style={{height: "10px"}}/>
            </form>
        )
    }

    function hexToRGBA(hex: string, alpha: string | number) {
        let r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        if (alpha) {
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        } else {
            return "rgb(" + r + ", " + g + ", " + b + ")";
        }
    }

    const languageOptions = [
        "Any",
        "I'm not sure",
        "Go",
        "Python",
        "JavaScript",
        "Typescript",
        "Rust",
        "Java",
        "C#",
        "SQL",
        "HTML",
        "Swift",
        "Ruby",
        "C++",
        "Other"
    ].sort();

    let renderQuestions = () => {
        return (
            <form>
                <Button
                    onClick={() => {
                        setStep(1)
                    }}
                    sx={{
                        marginLeft: "1vw",
                    }}
                >
                    <ArrowBack/> Go Back
                </Button>
                <div style={{background: hexToRGBA(theme.palette.primary.light, 0.7), color: theme.palette.text.primary, padding: "20px", textAlign: "center", fontWeight: "bold", fontSize: "16px", boxShadow: "0px 0px 10px 2px black"}}>
                    We use cutting edge Magic to understand your input and serve you personalized projects.
                </div>
                <TextField
                    id={"Usage"}
                    variant={`outlined`}
                    color={"primary"}
                    label={"Why are you using GIGO?"}
                    required={true}
                    margin={`normal`}
                    type={`text`}
                    multiline={true}
                    value={usage}
                    placeholder={"A short summary of what you want to get out of GIGO. This will help us provide you with relevant content."}
                    fullWidth={true}
                    minRows={3}
                    sx={window.innerWidth > 1000 ? {
                        width: "28vw",
                        marginLeft: "3.5vw",
                        mt: "2.5vh"
                    } : {width: "90%", marginLeft: "4.5vw", mt: "2.5vh"}}
                    onChange={e => setUsage(e.target.value)}
                >
                </TextField>
                <Autocomplete
                    multiple
                    limitTags={5}
                    id="tagInputAutocomplete"
                    options={tagOptions}
                    getOptionLabel={(option: Tag) => {
                        return option.value
                    }}
                    isOptionEqualToValue={(option: Tag, value: Tag) => {
                        return option._id === value._id;
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Interest Tags" placeholder="Interest Tags"/>
                    )}
                    onInputChange={(e) => {
                        handleTagSearch(e)
                    }}
                    // @ts-ignore
                    onChange={(e: SyntheticEvent, value: Array<Tag>) => {
                        setInterestTags(value)
                    }}
                    // @ts-ignore
                    value={interestTags}
                    sx={window.innerWidth > 1000 ? {
                        width: "28vw",
                        marginLeft: "3.5vw",
                        mt: "2.5vh"
                    } : {width: "90%", marginLeft: "4.5vw", mt: "2.5vh"}}
                />
                {renderTagsExplanationPopover()}
                <TextField
                    select
                    id={"newUserExperienceLevel"}
                    label={"Experience Level"}
                    required={true}
                    value={proficiency}
                    onChange={e => setProficiency(e.target.value as string)}
                    sx={window.innerWidth > 1000? {
                        width: "28vw",
                        marginLeft: "3.5vw",
                        mt: "2.5vh"
                    } : {width: "90%", marginLeft: "4.5vw", mt: "2.5vh"}}
                >
                    <MenuItem value={"Beginner"}>Beginner</MenuItem>
                    <MenuItem value={"Intermediate"}>Intermediate</MenuItem>
                    <MenuItem value={"Advanced"}>Advanced</MenuItem>
                </TextField>
                {renderExperienceExplanationPopover()}
                <TextField
                    select
                    id={"newUserPreferredLanguage"}
                    label={"Preferred Language"}
                    required={true}
                    value={preferredLanguage}
                    onChange={e => setPreferredLanguage(e.target.value as string)}
                    sx={window.innerWidth > 1000 ? {
                        width: "28vw",
                        marginLeft: "3.5vw",
                        mt: "2.5vh"
                    } : {width: "90%", marginLeft: "4.5vw", mt: "2.5vh"}}
                    SelectProps={{
                        MenuProps: {
                            PaperProps: {
                                style: {
                                    maxHeight: '20%',
                                    overflow: 'auto',
                                }
                            }
                        }
                    }}
                >
                    {languageOptions.map((lang, index) => (
                        <MenuItem key={index} value={lang}>
                            {lang}
                        </MenuItem>
                    ))}
                </TextField>
                {renderLanguageExplanationPopover()}
                <LoadingButton
                    loading={loading}
                    onClick={() => {
                        (!external) ? accountCreation() : externalLogin === "Google" ? googleCreate() : githubCreate()
                    }}
                    variant={`contained`}
                    color={"primary"}
                    // endIcon={<LockPersonIcon/>}
                    sx={window.innerWidth > 1000? {
                        width: '15vw',
                        borderRadius: 1,
                        height: "5vh",
                        justifyContent: "center",
                        marginLeft: "10vw",
                        mt: "2.5vh",
                        marginBottom: "30px",
                    } : {
                        width: 'auto',
                        borderRadius: 1,
                        height: "5vh",
                        justifyContent: "center",
                        marginLeft: "23vw",
                        mt: "2.5vh",
                        marginBottom: "30px",
                    }}
                >
                    Create Account
                </LoadingButton>
            </form>
        )
    }

    let renderCreateForm = () => {
        return (
            <Grid container justifyContent="center" sx={{
                paddingTop: "25px",
            }}>
                <Grid container
                      sx={{
                          justifyContent: "center",
                          outlineColor: "black",
                          width: window.innerWidth > 1000 ? "35%" : "90%",
                          height: window.innerWidth > 1000 ? "100%" : "60%",
                          borderRadius: 1,
                          backgroundColor: theme.palette.background.default,
                      }} direction="column" alignItems="center"
                >
                    <Typography component={"div"} variant={"h5"} sx={window.innerWidth > 1000 ?{
                        width:  "100%",
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: "10px"
                    } : {
                        width:  "80%",
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: "10px",
                        fontSize: "26px",
                        marginBottom: "15px"
                    }}>
                        Register New Account
                    </Typography>
                    {step === 0 ? (
                        <form style={{height: window.innerWidth > 1000 ? '89vh' : "auto"}}>
                            <TextField
                                id={"FirstName"}
                                error={firstName === "" ? missingFirst : false}
                                variant={`outlined`}
                                color={"primary"}
                                size={window.innerWidth > 1000 ? `small` : `small`}
                                label={"First Name"}
                                required={false}
                                margin={`normal`}
                                sx={{
                                    width: window.innerWidth > 1000 ? "12vw" : "40%",
                                    marginLeft: "3.5vw",
                                    mt: window.innerWidth > 1000 ? "2.5vh" : ".5vh"
                                }}
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                            >
                            </TextField>
                            <TextField
                                id={"LastName"}
                                error={lastName === "" ? missingLast : false}
                                variant={`outlined`}
                                color={"primary"}
                                size={window.innerWidth > 1000 ? `small` : `small`}
                                label={"Last Name"}
                                required={false}
                                margin={`normal`}
                                sx={{
                                    width: window.innerWidth > 1000 ? "12vw" : "40%",
                                    marginLeft: "4vw",
                                    mt: window.innerWidth > 1000 ? "2.5vh" : ".5vh"
                                }}
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                            >
                            </TextField>
                            <TextField
                                id={"UserName"}
                                error={username === "" ? missingUser : false}
                                variant={`outlined`}
                                color={"primary"}
                                size={window.innerWidth > 1000 ? `small` : `small`}
                                label={"UserName"}
                                required={true}
                                margin={`normal`}
                                sx={{
                                    width: window.innerWidth > 1000 ? "28vw" : "85%",
                                    marginLeft: "3.5vw",
                                    mt: window.innerWidth > 1000 ? "2.5vh" : ".5vh"
                                }}
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            >
                            </TextField>
                            <TextField
                                id={"Email"}
                                error={email === "" ? missingEmail : false}
                                variant={`outlined`}
                                color={"primary"}
                                size={window.innerWidth > 1000 ? `small` : `small`}
                                label={"Email"}
                                required={true}
                                margin={`normal`}
                                type={`text`}
                                sx={{
                                    width: window.innerWidth > 1000 ? "28vw" : "85%",
                                    marginLeft: "3.5vw",
                                    mt: window.innerWidth > 1000 ? "2.5vh" : ".5vh"
                                }}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            >
                            </TextField>
                            <TextField
                                id={"Phone Number"}
                                error={number === "" ? missingPhone : false}
                                variant={`outlined`}
                                color={"primary"}
                                size={window.innerWidth > 1000 ? `small` : `small`}
                                label={"Phone Number"}
                                required={true}
                                margin={`normal`}
                                sx={{
                                    width: window.innerWidth > 1000 ? "28vw" : "85%",
                                    marginLeft: "3.5vw",
                                    mt: window.innerWidth > 1000 ? "2.5vh" : ".5vh"
                                }}
                                value={number}
                                onChange={e => setNumber(e.target.value)}
                            >
                            </TextField>
                            <TextField
                                id={"Password"}
                                error={password === "" ? missingPassword : false}
                                variant={`outlined`}
                                size={window.innerWidth > 1000 ? `small` : `small`}
                                type={showPass ? `text` : `password`}
                                color={
                                    (password.length > 5 && password !== "") ? "success" : "error"
                                }
                                label={"Password"}
                                required={true}
                                margin={`normal`}
                                sx={{
                                    width: window.innerWidth > 1000 ? "28vw" : "85%",
                                    marginLeft: "3.5vw",
                                    mt: window.innerWidth > 1000 ? "2.5vh" : ".5vh"
                                }}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: <ShowButton/>
                            }}
                            >
                            </TextField>
                            <TextField
                                id={"ReTypePassword"}
                                error={confirmPass === "" ? missingConfirm : false}
                                variant={`outlined`}
                                type={showPass ? `text` : `password`}
                                color={
                                    (password === confirmPass && password !== "") ? "success" : "error"
                                }
                                size={window.innerWidth > 1000 ? `small` : `small`}
                                label={"Confirm Password"}
                                required={true}
                                margin={`normal`}
                                sx={{
                                    width: window.innerWidth > 1000 ? "28vw" : "85%",
                                    marginLeft: "3.5vw",
                                    mt: window.innerWidth > 1000 ? "2.5vh" : ".5vh"
                                }}
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                            >
                            </TextField>
                            <Autocomplete
                                id="timezoneInputSelect"
                                options={getTimeZoneOptions(true)}
                                getOptionLabel={(option) => option.label}
                                onChange={(e: SyntheticEvent, value: TimezoneOption | null) => {
                                    if (value === null) {
                                        setTimezone(null)
                                    }
                                    setTimezone(value)
                                }}
                                isOptionEqualToValue={(option: TimezoneOption, value: TimezoneOption) => {
                                    return option.value === value.value;
                                }}
                                value={timezone}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size={window.innerWidth > 1000 ? `small` : `small`}
                                        error={timezone === null ? missingTimezone : false}
                                        placeholder="Timezone"
                                    />
                                )}
                                sx={{
                                    width: window.innerWidth > 1000 ? "28vw" : "85%",
                                    marginLeft: "3.5vw",
                                    mt: window.innerWidth > 1000 ? "2.5vh" : ".5vh"
                                }}
                            />
                            <LoadingButton
                                loading={loading}
                                onClick={() => {
                                    validateUser()
                                }}
                                variant={`contained`}
                                color={"primary"}
                                // endIcon={<LockPersonIcon/>}
                                sx={{
                                    width: window.innerWidth > 1000 ? '15vw' : "40%",
                                    borderRadius: 1,
                                    height: "5vh",
                                    justifyContent: "center",
                                    marginLeft: window.innerWidth > 1000 ? "10vw" : "25vw",
                                    mt: window.innerWidth > 1000 ? "2.5vh" : ".5vh"
                                }}
                            >
                                Next Step
                            </LoadingButton>
                                <Dialog
                                    open={unsafe}
                                    onClose={() => setUnsafe(false)}
                                >
                                    <DialogTitle>{"Unsafe Password"}</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Hey, we found that your password is included in a list of compromised passwords. It's important to keep your account secure, so we strongly suggest that you change your password. You can still continue using your current password, but just know that it carries a higher risk.
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setUnsafe(false)} color="primary">Change Password</Button>
                                        <Button onClick={handleForce} color={"error"}>
                                            Force Un-Safe Password
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            <Typography component={"div"} variant={"h6"} sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                paddingTop: "15px"
                            }}>
                                or register with:
                            </Typography>
                            <Grid container sx={{
                                justifyContent: "center",
                                width: "100%",
                                marginBottom: "5px"
                            }} direction="row" alignItems="center">
                                <Button onClick={() => googleButton()}>
                                    <Grid container spacing={{xs: 2}} justifyContent="center" sx={{
                                        flexGrow: 1,
                                        paddingRight: ".5vh"
                                    }}>
                                        <Grid item xs={"auto"}>
                                            <img
                                                style={{
                                                    width: window.innerWidth > 1000 ? "2vw" : "6vw",
                                                    height: "auto",
                                                }}
                                                alt={"Google Logo"}
                                                src={googleLogo}
                                            />
                                        </Grid>
                                        <Grid item xs={"auto"}>
                                            <img
                                                style={{
                                                    width: window.innerWidth > 1000 ? "5vw" : "10vw",
                                                    height: "auto",
                                                    paddingTop: ".5vh"
                                                }}
                                                alt={"Google Name"}
                                                src={theme.palette.mode === "light" ? googleLight : googleDark}
                                            />
                                        </Grid>
                                    </Grid>
                                </Button>
                                <LoginGithub
                                    color={"primary"}
                                    sx={{
                                        // width: window.innerWidth > 1000 ? '5vw' : "20vw",
                                        justifyContent: "center",
                                    }}
                                    clientId="9ac1616be22aebfdeb3e"
                                    // TODO change redirect URI for production
                                    redirectUri={""}
                                    onSuccess={onSuccessGithub}
                                    onFailure={onFailureGithub}
                                >
                                    <Grid container spacing={{xs: 2}} justifyContent="center" sx={{
                                        flexGrow: 1,
                                        paddingTop: ".1vh",
                                        marginLeft: "10px",
                                        // marginRight: "10px",
                                    }}>
                                        <Grid item xs={4}>
                                            <img
                                                style={{
                                                    width: window.innerWidth > 1000 ? "2vw" : "6vw",
                                                    height: "auto",
                                                }}
                                                alt={"Github Logo"}
                                                src={theme.palette.mode === "light" ? githubLogoDark : githubLogoLight}
                                            />
                                        </Grid>
                                        <Grid item xs={8}>
                                            <img
                                                style={{
                                                    width: window.innerWidth > 1000 ? "5vw" : "10vw",
                                                    height: "auto"
                                                }}
                                                alt={"Github Name"}
                                                src={theme.palette.mode === "light" ? githubNameDark : githubNameLight}
                                            />
                                        </Grid>
                                    </Grid>
                                </LoginGithub>
                            </Grid>
                            <Typography sx={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                height: "1%",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <Typography variant="h5" component="div"
                                            sx={{fontSize: "75%"}}
                                >
                                    Already have an account?
                                </Typography>
                                <Button
                                    onClick={async () => {
                                        navigate("/login")
                                    }}
                                    variant={`text`}
                                    color={"primary"}
                                >
                                    Login
                                </Button>
                            </Typography>
                        </form>
                    ) : step === 1 ? renderAvatar() : renderQuestions()
                    }
                </Grid>
            </Grid>
        )
    }

    const aspectRatio = useAspectRatio();

    let renderExternal = () => {
        return (
            step === 0 ? (
                <Grid container justifyContent="center" sx={{
                    paddingTop: "220px",
                }}>
                    <Grid container
                          sx={{
                              justifyContent: "center",
                              outlineColor: "black",
                              width: window.innerWidth > 1000 ? "35%" : "90%",
                              borderRadius: 1,
                              backgroundColor: theme.palette.background.default,
                              paddingBottom: "1.5vw"
                          }} direction="column" alignItems="center"
                    >
                        <Typography component={"div"} variant={"h5"} sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            paddingTop: "10px",
                        }}>
                            Create a Password
                        </Typography>
                        <TextField
                            id={"Password"}
                            variant={`outlined`}
                            type={showPass ? `text` : `password`}
                            color={
                                (password.length > 5 && password !== "") ? "success" : "error"
                            }
                            label={"Password"}
                            required={true}
                            margin={`normal`}
                            sx={{
                                width: window.innerWidth > 1000 ? "28vw" : "80vw",
                                mt: "2.5vh"
                            }}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: <ShowButton/>
                            }}
                        >
                        </TextField>
                        <TextField
                            id={"ReTypePassword"}
                            variant={`outlined`}
                            type={showPass ? `text` : `password`}
                            color={
                                (password === confirmPass && password !== "") ? "success" : "error"
                            }
                            label={"Confirm Password"}
                            required={true}
                            margin={`normal`}
                            onKeyDown={
                                e => {
                                    if (e.key === "Enter") {
                                        setStep(1)
                                    }
                                }}
                            sx={{
                                width: window.innerWidth > 1000 ? "28vw" : "80vw",
                                mt: "2.5vh"
                            }}
                            value={confirmPass}
                            onChange={e => setConfirmPass(e.target.value)}
                        >
                        </TextField>
                        <Autocomplete
                            id="timezoneInputSelect"
                            options={getTimeZoneOptions(true)}
                            getOptionLabel={(option) => option.label}
                            onChange={(e: SyntheticEvent, value: TimezoneOption | null) => {
                                if (value === null) {
                                    setTimezone(null)
                                }
                                setTimezone(value)
                            }}
                            isOptionEqualToValue={(option: TimezoneOption, value: TimezoneOption) => {
                                return option.value === value.value;
                            }}
                            value={timezone}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Timezone"
                                />
                            )}
                            sx={{
                                width: window.innerWidth > 1000 ? "28vw" : "80vw",
                                mt: "2.5vh"
                            }}
                        />
                        <Button
                            onClick={() => {
                                setStep(1)
                            }}
                            variant={`contained`}
                            color={"primary"}
                            endIcon={<SendIcon/>}
                            sx={{
                                borderRadius: 1,
                                minHeight: "5vh",
                                minWidth: '15vw',
                                justifyContent: "center",
                                lineHeight: "35px",
                                mt: "2.5vh"
                            }}
                        >
                            Next Step
                        </Button>
                        <Typography variant="h5" component="div"
                                    sx={{fontSize: "75%"}}
                        >
                            Already linked your account?
                        </Typography>
                        <Button
                            onClick={async () => {
                                navigate("/login")
                            }}
                            variant={`text`}
                            color={"primary"}
                        >
                            sign in
                        </Button>
                    </Grid>
                </Grid>
            ) : step === 1
                ?
                <Grid container justifyContent="center" sx={{
                    paddingTop: "25px",
                }}>
                    <Grid container
                          sx={{
                              justifyContent: "center",
                              outlineColor: "black",
                              width: "35%",
                              borderRadius: 1,
                              backgroundColor: theme.palette.background.default,
                              height: "100%",
                          }} direction="column" alignItems="center"
                    >
                        {renderAvatar()}
                    </Grid>
                </Grid>
                :
                <Grid container justifyContent="center" sx={{
                    paddingTop: "25px",
                }}>
                    <Grid container
                          sx={{
                              justifyContent: "center",
                              outlineColor: "black",
                              width: "35%",
                              borderRadius: 1,
                              backgroundColor: theme.palette.background.default,
                              height: "100%",
                          }} direction="column" alignItems="center"
                    >
                        {renderQuestions()}
                    </Grid>
                </Grid>
        )
    }

    // initialize tags if there are no values
    if (tagOptions.length === 0 && !bsTags) {
        setBsTags(true)
        handleTagSearch({target: {value: ""}})
    }

    return (
        <div
            style={{
                backgroundColor: "black",
                backgroundImage: aspectRatio === '21:9' ? `url(${loginImg219})` : `url(${loginImg})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                width: '100vw',
                height: '100vh'
            }}>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    {(!external) ? renderCreateForm() : renderExternal()}
                </CssBaseline>
            </ThemeProvider>
        </div>
    );
}

function useAspectRatio() {
    const [aspectRatio, setAspectRatio] = useState('');

    useEffect(() => {
        function gcd(a: any, b: any): any {
            return b === 0 ? a : gcd(b, a % b);
        }

        function calculateAspectRatio() {
            const width = window.screen.width;
            const height = window.screen.height;
            let divisor = gcd(width, height);
            console.log("divisor: ", divisor);
            // Dividing by GCD and truncating into integers
            let simplifiedWidth = Math.trunc(width / divisor);
            let simplifiedHeight = Math.trunc(height / divisor);

            divisor = Math.ceil(simplifiedWidth / simplifiedHeight);
            simplifiedWidth = Math.trunc(simplifiedWidth / divisor);
            simplifiedHeight = Math.trunc(simplifiedHeight / divisor);
            setAspectRatio(`${simplifiedWidth}:${simplifiedHeight}`);
        }

        calculateAspectRatio();

        window.addEventListener('resize', calculateAspectRatio);


        return () => {
            window.removeEventListener('resize', calculateAspectRatio);
        };
    }, []);

    return aspectRatio;
}

export default CreateNewAccount;