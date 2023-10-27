

import * as React from "react";
import {useEffect, useState} from "react";
import {
    Button,
    createTheme,
    CssBaseline,
    Grid,
    IconButton,
    PaletteMode,
    TextField,
    ThemeProvider,
    Typography
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import {getAllTokens} from "../theme";
import {useNavigate} from "react-router-dom";
import call from "../services/api-call";
import config from "../config";
import {authorize, externalAuth} from "../services/auth";
import {gapi} from "gapi-script";
//@ts-ignore
import {GoogleLogin, useGoogleLogin} from "@react-oauth/google";
import {useAppDispatch} from "../app/hooks";
import {initialAuthStateUpdate, TutorialState, updateAuthState} from "../reducers/auth/auth";
import githubNameLight from "../img/github/gh_name_light.png"
import githubNameDark from "../img/github/gh_name_dark.png"
import githubLogoLight from "../img/github/gh_logo_light.svg"
import githubLogoDark from "../img/github/gh_logo_dark.svg"
import LoginGithub from "../components/Login/Github/LoginGithub";
import googleDark from "../img/login/google-logo-white.png"
import googleLight from "../img/login/google_light.png"
import googleLogo from "../img/login/google_g.png"
import loginImg from "../img/login/login_background.jpg"
import loginImg219 from "../img/login/login_background-21-9.jpg"
import logoImg from "../img/fullLogo.png"
import {decodeToken} from "react-jwt";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {LoadingButton} from "@mui/lab";
import LoginBackgroundIcon from "../img/login/LoginBackground";
import JourneyPageIcon from "../components/Icons/JourneyPage";
import ReactGA from "react-ga4";



function Login(this: any) {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const styles = {
        themeButton: {
            display: "flex",
            justifyContent: "right"
        },
        login: {
            display: "flex",
            marginLeft: "-.7%",
            marginTop: "5vh",
            paddingLeft: "45%",
            fontSize: "225%"
        },
        textField: {
            color: `text.secondary`
        },
        card: {
            backgroundColor: theme.palette.background
        }
    };

    // Update the theme only if the mode changes
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [external, setExternal] = React.useState(false)
    const [externalLogin, setExternalLogin] = React.useState("")
    const [externalToken, setExternalToken] = React.useState("")
    const [showPass, setShowPass] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [ghConfirm, setGhConfirm] = React.useState(false)
    const ShowButton = () => (
        <Button
        onClick={() => setShowPass(!showPass)}>
            {showPass ? <VisibilityIcon/> : <VisibilityOffIcon/>}
        </Button>
    )

    ReactGA.initialize("G-38KBFJZ6M6");

    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    useEffect(() => {
        const initClient = () => {
            gapi.auth2.init({
                clientId: config.googleClient,
                scope: 'profile'
            });
        };
        gapi.load('client:auth2', initClient)
    }, [])

    // transferring data from google login
    const onSuccessGoogle = async (usr: any) => {
        setExternal(true)
        setExternalToken(usr.access_token)
        setExternalLogin("Google")
    }

    const googleButton = useGoogleLogin({
        onSuccess: (usr : any) => onSuccessGoogle(usr)
    });

    const googleSignIn = async () => {
        setLoading(true)
        let res = await call(
            "/api/auth/loginWithGoogle",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {external_auth: externalToken, password: password},
            null,
            config.rootPath
        )

        window.sessionStorage.setItem("loginXP", JSON.stringify(res["xp"]));

        if (res["message"] === "You must be logged in to access the GIGO system."){
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }

        let auth = await externalAuth(res["token"]);
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
            if (sessionStorage.getItem("alive") === null || auth["user"] === undefined)
                //@ts-ignore
                swal("Login failed. The provided username and password did not match.");
                setLoading(false)
        }
    }

    const onSuccessGithub = async (gh: any) => {
        setExternal(true)
        setExternalToken(gh["code"])
        setExternalLogin("Github")
        setLoading(true)
        let res = await call(
            "/api/auth/loginWithGithub",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                external_auth: gh["code"],
            },
            null,
            config.rootPath
        )

        if (res["auth"] === false ) {
            //@ts-ignore
            swal("Incorrect credentials, please try again");
            setLoading(false)
        }

        setGhConfirm(true)
        setLoading(false)
    }

    const githubConfirm = async () => {
        if (ghConfirm !== true){
            //@ts-ignore
            swal("BAD")
            setLoading(false)
        }
        setLoading(true)
        let res = await call(
            "/api/auth/confirmLoginWithGithub",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {password: password},
            null,
            config.rootPath
        )

        let auth = await externalAuth(res["token"]);

        window.sessionStorage.setItem("loginXP", JSON.stringify(res["xp"]));

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
                swal("Login failed. The provided username or password is incorrect.");
            setLoading(false)
        }
    }

    const onFailureGithub = (gh: any) => {
        console.log('github failed:', gh);
    };

    const retrieveOTPLink = async () => {
        // @ts-ignore
        let res = await call(
            "/api/otp/generateUserOtpUri",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        );

        if (res === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We failed to retrieve your 2FA QR code. Please try again later."
                );
                setLoading(false)
            return;
        }

        if (res["message"] === "You must be logged in to access the GIGO system."){
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }

        if (res["message"] !== undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    res["message"] !== "logout"
                        ? res["message"]
                        : "An unexpected error occurred while retrieving your 2FA QR code. Please try again later."
                );
                setLoading(false)
            return;
        }

        if (res["otp_uri"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "An unexpected error occurred while retrieving your 2FA QR code. Please try again later."
                );
                setLoading(false)
            return;
        }

        // this.setState({
        //     otpLink: res["otp_uri"]
        // });
    }

    const loginFunction = async () => {
        setLoading(true)
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
            authState.backgroundColor = auth["color_palette"]
            authState.backgroundName = auth["name"]
            authState.backgroundRenderInFront = auth["render_in_front"]
            authState.exclusiveContent = auth["exclusive_account"]
            authState.exclusiveAgreement = auth["exclusive_agreement"]
            authState.tutorialState = auth["tutorials"] as TutorialState
            authState.tier = auth["tier"]
            dispatch(updateAuthState(authState))

            window.location.href = "/home";
        } else if (auth.includes("Too many failed attempts")) {
            //@ts-ignore
            swal("Login failed.", auth);
            setLoading(false)
        } else {
            if (sessionStorage.getItem("alive") === null || auth["user"] === undefined) {
                let messageString = "The provided username and password did not match. You have " + auth[0] + " attempts remaining."
                //@ts-ignore
                swal("Login Failed", messageString);
                setLoading(false)
            }
        }
    }

    let renderLogin = () => {
        return (
            <Grid container justifyContent="center" sx={{
                paddingTop: window.innerWidth > 1000 ? "220px" : "34%",
            }}>
                <Grid container
                      sx={{
                          justifyContent: "center",
                          outlineColor: "black",
                          width: window.innerWidth > 1000 ? "35%" : "80vw",
                          minWidth:  window.innerWidth > 1000 ? "600px" : "0px",
                          height: window.innerWidth > 1000? "auto" : "auto",
                          borderRadius: 1,
                          backgroundColor: theme.palette.background.paper,
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);"
                      }} direction="column" alignItems="center"
                >
                    <Typography component={"div"} variant={"h5"} sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: "10px"
                    }}>
                        Sign In
                    </Typography>
                    <TextField
                        label={"Username"}
                        variant={`outlined`}
                        size={window.innerWidth > 1000 ? `medium` : `small`}
                        color={"primary"}
                        helperText={"Please enter your username"}
                        inputProps={
                            styles.textField
                        }
                        onChange={e => setUsername(e.target.value)}
                        sx={{
                            width: window.innerWidth > 1000 ? "28vw" : "60vw",
                            marginLeft: "3.5vw",
                            marginRight: "3.5vw",
                            mt: "3.5vh",
                        }}
                    >
                    </TextField>
                    <TextField
                        label={"Password"}
                        variant={`outlined`}
                        size={window.innerWidth > 1000 ? `medium` : `small`}
                        type={showPass ? `text` : `password`}
                        color={`primary`}
                        helperText={"Please enter your password"}
                        onKeyDown={
                            e => {
                                if (e.key === "Enter") {
                                    loginFunction()
                                }
                            }}
                        onChange={e => setPassword(e.target.value)}
                        sx={{
                            width: window.innerWidth > 1000 ? "28vw" : "60vw",
                            marginLeft: "3.5vw",
                            marginRight: "3.5vw",
                            mt: "3.5vh",
                            paddingBottom: "1.5vw"
                        }}
                        InputProps={{
                            endAdornment: <ShowButton/>
                        }}
                    >
                    </TextField>
                    <LoadingButton
                        loading={loading}
                        onClick={async () => {
                            await loginFunction()
                        }}
                        variant={`contained`}
                        color={"primary"}
                        endIcon={<SendIcon/>}
                        sx={{
                            borderRadius: 1,
                            minHeight: "5vh",
                            minWidth: '10vw',
                            justifyContent: "center",
                            lineHeight: "35px",
                            width: window.innerWidth > 1000 ? '' : '50vw',
                        }}
                    >
                        Login
                    </LoadingButton>
                    <Button
                        onClick={async () => {
                            navigate("/forgotPassword")
                        }}
                        variant={`text`}
                        color={"primary"}
                        sx={{
                            width: window.innerWidth > 1000 ? '15vw' : '80vw',
                            justifyContent: "center",
                            paddingTop: window.innerWidth > 1000 ? '' : "8%",
                        }}
                    >
                        Forgot Password
                    </Button>
                    <Button
                        onClick={async () => {
                            navigate("/signup")
                        }}
                        variant={`text`}
                        color={"primary"}
                        sx={{
                            width: window.innerWidth > 1000 ? '15vw' : '60vw',
                            justifyContent: "center",
                            paddingTop: window.innerWidth > 1000 ? '' : "5%",
                        }}
                    >
                        No Account? Register
                    </Button>
                    <Typography component={"div"} variant={"h6"} sx={{
                        width:  window.innerWidth > 1000 ? "85%" : "90%",
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: "25px"
                    }}>
                        or sign in with linked account:
                    </Typography>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                        paddingBottom: "10px"
                    }} direction="row" alignItems="center">
                        <Button onClick={() => googleButton()}>
                            <Grid container spacing={{xs: 2}} justifyContent="center" sx={{
                                flexGrow: 1,
                                paddingRight: window.innerWidth > 1000 ? '.5vw' : "4vh"
                            }}>
                                <Grid item xs={"auto"}>
                                    <img
                                        style={{
                                            width: window.innerWidth > 1000 ? "2vw" : "8vw",
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
                                            paddingTop: "1.5vh",
                                            left: window.innerWidth > 1000 ? '0vw' : "11vw",
                                            bottom: window.innerWidth > 1000 ? "0vh" : "2.3vh",
                                            position: window.innerWidth > 1000 ? "relative" : "absolute"
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
                                width: window.innerWidth > 1000 ? '7vw' : '25vw',
                                justifyContent: "center",
                            }}
                            clientId="9ac1616be22aebfdeb3e"
                            // this redirect URI is for production, testing on dev will not work
                            redirectUri={""}
                            onSuccess={onSuccessGithub}
                            onFailure={onFailureGithub}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img
                                    style={{
                                        width: window.innerWidth > 1000 ? "2vw" : "8vw",
                                        height: "auto"
                                    }}
                                    alt={"Github Logo"}
                                    src={theme.palette.mode === "light" ? githubLogoDark : githubLogoLight}
                                />
                                <img
                                    style={{
                                        width: window.innerWidth > 1000 ? "5vw" : "10vw",
                                        height: "auto",
                                        marginLeft: '0.5rem' // Adjust the margin as needed
                                    }}
                                    alt={"Github Name"}
                                    src={theme.palette.mode === "light" ? githubNameDark : githubNameLight}
                                />
                            </div>
                        </LoginGithub>
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    let renderExternal = () => {
        return (
            <Grid container justifyContent="center" sx={{
                paddingTop: "220px",
            }}>
                <Grid container
                      sx={{
                          justifyContent: "center",
                          outlineColor: "black",
                          width: window.innerWidth > 1000 ? "35%" : "70%",
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
                        Enter Password
                    </Typography>

                    <TextField
                        label={"Password"}
                        variant={`outlined`}
                        size={`medium`}
                        type={showPass ? `text` : `password`}
                        color={`primary`}
                        helperText={"Please enter your password"}
                        onKeyDown={
                            e => {
                                if (e.key === "Enter") {
                                    externalLogin === "Google" ? googleSignIn() : githubConfirm()
                                }
                            }}
                        onChange={e => setPassword(e.target.value)}
                        sx={{
                            width: window.innerWidth > 1000 ? "28vw" : "60vw",
                            marginLeft: "3.5vw",
                            marginRight: "3.5vw",
                            mt: "3.5vh",
                            paddingBottom: window.innerWidth > 1000 ? "1.5vh" : "3.0vh"
                        }}
                        InputProps={{
                            endAdornment: <ShowButton/>
                        }}
                    >
                    </TextField>
                    <LoadingButton
                        loading={loading}
                        onClick={() => {
                            externalLogin === "Google" ? googleSignIn() : githubConfirm()
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
                        }}
                    >
                        Login
                    </LoadingButton>
                    <Typography variant="h5" component="div"
                                sx={{fontSize: "75%"}}
                    >
                        Haven't linked your account yet?
                    </Typography>
                    <Button
                        onClick={async () => {
                            navigate("/signup")
                        }}
                        variant={`text`}
                        color={"primary"}
                    >
                        sign up
                    </Button>
                </Grid>
            </Grid>
        )
    }

    const aspectRatio = useAspectRatio();

    const iconContainerStyles: React.CSSProperties = {
        width: aspectRatio === '21:9' ? '100vw' : '100vw',
        height: aspectRatio === '21:9' ? '100vh' : '100vh', // Set to 100% of viewport height
        position: 'absolute',
        zIndex: 0,
    };

    const iconStyles: React.CSSProperties = {
        width: '100%',
        height: '100%',
    };

    const containerStyles: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        height: '90vh',
        width: '100vw',
        top: '10%',
        position: 'absolute',
        zIndex: 2,

    };





    const vignetteStyles: React.CSSProperties = {
        width: '100vw',
        height: '100vh',
        background: `linear-gradient(270deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 80%, ${hexToRGBA(theme.palette.background.default)} 95%, ${hexToRGBA(theme.palette.background.default)}), linear-gradient(90deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 80%, ${hexToRGBA(theme.palette.background.default)} 95%, ${hexToRGBA(theme.palette.background.default)}), linear-gradient(180deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 52%, ${hexToRGBA(theme.palette.background.default)} 92%, ${hexToRGBA(theme.palette.background.default)}), linear-gradient(0deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 92%, ${hexToRGBA(theme.palette.background.default)} 98%, ${hexToRGBA(theme.palette.background.default)}` , // Vignette gradient
        position: 'absolute',
        left: '0%',
        bottom: '0%',
        zIndex: 1, // Set a higher zIndex to appear above the SVG
    };




    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
        <div
            style={{
                backgroundColor: `${theme.palette.background.default}`,
                backgroundImage: aspectRatio === '21:9' ? `url(${loginImg219})` : `url(${loginImg})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            {/* Your Logo */}
            <img
                src={logoImg}
                alt="Gigo Logo"
                style={{
                    position: 'absolute',
                    top: '20px', // Adjust the top position as needed
                    left: '20px', // Adjust the left position as needed
                    width: window.innerWidth > 1000 ? '350px' : '30vw', // Adjust the width as needed
                    height: 'auto', // Maintain aspect ratio
                }}
            />

            {/* Slogan */}
            <Typography
                variant="body1"
                style={{
                    position: 'absolute',
                    top: window.innerWidth > 1000 ? '120px' : '6%', // Adjust the top position as needed (slightly below the logo)
                    left: window.innerWidth > 1000 ? '360px' : '32%', // Adjust the left position as needed (to the right of the logo)
                    fontWeight: 'bold', // Customize the text style,
                    fontSize: window.innerWidth > 1000 ? '50px' : '5vw', // Adjust the font size,
                    // fontFamily: 'Kanit',
                    color: '#208562',
                }}
            >
                works on our machine.
            </Typography>


            {/*<div style={vignetteStyles} />*/}
            {/*<div style={iconContainerStyles}>*/}
            {/*    <LoginBackgroundIcon style={iconStyles} aspectRatio={aspectRatio.toString()} />*/}
            {/*</div>*/}
            <ThemeProvider theme={theme}>
                <CssBaseline>
                        {(!external) ? renderLogin() : renderExternal()}
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

function hexToRGBA(hex: any, alpha = 1) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


export default Login;