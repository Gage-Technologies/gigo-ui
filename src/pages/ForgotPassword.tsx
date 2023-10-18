

import * as React from "react";
import {
    Button,
    createTheme,
    CssBaseline,
    Grid,
    PaletteMode,
    TextField,
    ThemeProvider,
    Typography,
    useMediaQuery
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {initialAuthStateUpdate, selectAuthState, updateAuthState} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import LockPersonIcon from '@mui/icons-material/LockPerson';
import loginImg from "../img/login/login_background.png";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import Post from "../models/post";


function ForgotPassword() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    // Update the theme only if the mode changes
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const CurrentBgColor = theme.palette.background

    const styles = {
        themeButton: {
            display: "flex",
            justifyContent: "right"
        },
        missingCredentials: {
            display: "flex",
            marginLeft: "auto",
            marginTop: "6%",
            paddingLeft: "34.5%",
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

    //const authState = useAppSelector(selectAuthState);

    let navigate = useNavigate();

    const [email, setEmail] = React.useState("")
    const [isEmailValid, setIsEmailValid] = React.useState(false)
    const emailRef = React.useRef("")

    // todo: change to real url after testing
    const url = "www.gigo.dev"

    function isValidEmail(email: string) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function handleEmailChange(e: { target: { value: any; }; }) {
        const newEmail = e.target.value;
        setEmail(newEmail);
        setIsEmailValid(isValidEmail(newEmail));
        emailRef.current = newEmail;
    }

    const sendResetValidation = async () => {

        const currentEmail = emailRef.current

        if (currentEmail === null || currentEmail.length < 5) {
            //@ts-ignore
            swal("Invalid Credentials", "Please enter your username and the email you used to sign up")
            return
        }

        let res = await call(
            "/api/user/forgotPasswordValidation",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {email: email, url: url},
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

        if (res["message"] === "must provide email for password recovery"){
            //@ts-ignore
            swal("Account Not Found", "We could not find an account with that email address and username. Please try again, or create an account if you don't already have one.")
            return
        }

        if (res["message"] === "account not found"){
            //@ts-ignore
            swal("Account Not Found", "We could not find an account with that email address and username. Please try again, or create an account if you don't already have one.")
            return
        }

        if (res["message"] === "failed to store reset token" || res["message"] === "failed to send password reset email"){
            //@ts-ignore
            swal("Server Error",  "We are having an issue with the GIGO servers at this time. We're sorry for the inconvenience! Please try again later.")
            return
        }

        if (res["message"] === "Password reset email sent"){
            //@ts-ignore
            swal("Check your Email", "We have sent an email with instructions on how to reset your password.")
            navigate("/login")
        }

    }

    return (
        <div
            style={{
                backgroundColor: "black",
                backgroundImage: `url(${loginImg})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                width: '100vw',
                height: '100vh'
            }}>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <Grid container justifyContent="center" sx={{ paddingTop: "220px", }}>
                        <Grid container
                              sx={{
                                  justifyContent: "center",
                                  outlineColor: "black",
                                  width: window.innerWidth > 1000 ? "35%" : "55%",
                                  borderRadius: 1,
                                  backgroundColor: theme.palette.background.default
                              }} direction="column" alignItems="center"
                        >
                            <Typography component={"div"} variant={"h6"} sx={{
                                width: window.innerWidth > 1000 ? `28vw` : `100%`,
                                display: "flex",
                                justifyContent: "center",
                                paddingTop: "10px"
                            }}>
                                Forgot Password
                            </Typography>
                            <TextField
                                label={"Email"}
                                variant={`outlined`}
                                color={"primary"}
                                size={window.innerWidth > 1000 ? `medium` : `small`}
                                helperText={"Please enter the email associated with your account"}
                                required={true}
                                inputProps={
                                    styles.textField
                                }
                                onChange={handleEmailChange}
                                sx={{
                                    width: window.innerWidth > 1000 ? "23vw" : "90%",
                                    marginLeft: "3.5vw",
                                    marginRight: "3.5vw",
                                    mt: "3.5vh",
                                    mb: "20px"
                                }}
                            >
                            </TextField>
                            <Button
                                disabled={!isEmailValid}
                                onClick={sendResetValidation}
                                variant={`contained`}
                                color={"primary"}
                                endIcon={<LockPersonIcon />}
                                sx={{
                                    borderRadius: 1,
                                    minHeight: "5vh",
                                    minWidth: '15vw',
                                    justifyContent: "center",
                                    lineHeight: "35px",
                                    marginBottom: "5px"
                                }}
                            >
                                Submit
                            </Button>

                            <Button
                                onClick={async () => {
                                    navigate("/login")
                                }}
                                variant={`text`}
                                color={"primary"}
                                sx={{
                                    width: window.innerWidth > 1000 ? '7vw' : "20vw",
                                    justifyContent: "center",
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                onClick={async () => {
                                    navigate("/signup")
                                }}
                                variant={`text`}
                                color={"primary"}
                                sx={{
                                    width: window.innerWidth > 1000 ? '7vw' : "40vw",
                                    justifyContent: "center",
                                    paddingBottom: "15px"
                                }}
                            >
                                Sign Up
                            </Button>
                        </Grid>
                    </Grid>
                </CssBaseline>
            </ThemeProvider>
        </div>
    );

}

export default ForgotPassword;