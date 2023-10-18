

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
import {useNavigate} from "react-router-dom";
import LockPersonIcon from '@mui/icons-material/LockPerson';
import loginImg from "../img/login/login_background.png";
import swal from "sweetalert";
import call from "../services/api-call";
import config from "../config";
import {useLocation} from "react-router";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";



function ResetForgotPassword() {
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

    let navigate = useNavigate();

    const [id, setId] = React.useState("");
    const [token, setToken] = React.useState("");

    const location = useLocation();

    React.useEffect(() => {
        // Extract query parameters from location.
        const params = new URLSearchParams(location.search);
        setId(params.get('id') || '');
        setToken(params.get('token') || '');
    }, []);

    React.useEffect(() => {
        if (id && token) {
            verifyEmailToken();
        }
    }, [id, token]);

    const [newPassword, setNewPassword] = React.useState("")
    const [retypePassword, setRetypePassword] = React.useState("")
    const [validToken, setValidToken] = React.useState(false)
    const [showPass, setShowPass] = React.useState(false)
    const [isPasswordValid, setIsPasswordValid] = React.useState(false)

    const ShowButton = () => (
        <Button
            onClick={() => setShowPass(!showPass)}>
            {showPass ? <VisibilityIcon/> : <VisibilityOffIcon/>}
        </Button>
    )

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
    }

    const handleRetypePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRetypePassword(event.target.value);
    }

    React.useEffect(() => {
        setIsPasswordValid(newPassword === retypePassword && newPassword.length > 5);
    }, [newPassword, retypePassword]);

    const handleSubmit = () => {
        if (isPasswordValid) {
            resetForgotPassword()
        } else {
            alert('The passwords are not valid')
        }
    }

    const verifyEmailToken = async () => {

        let res = await call(
            "/api/verifyResetToken/" + token + "/" + id,
            "GET",
            null,
            null,
            null,
            //@ts-ignore
            null,
            null,
            config.rootPath
        )

        if (res === undefined) {
            swal(
                "Server Error",
                "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
            );
            return;
        }


        switch(res.message) {
            case "Token not valid":
                swal("Email link expired", "Your email verification link has expired. Please request a new one.")
                navigate("/forgotPassword")
                break;
            case "Token Validated":
                setValidToken(true)
                break;
            default:
                swal("Error", "An unexpected error has occurred. Please try again.")
        }
    }

    const resetForgotPassword = async () => {
        if (newPassword !== retypePassword) {
            // console.log("New Password" + newPassword + "\n retyped Password" + retypePassword + "\n Valid Token" + validToken)
            swal("Invalid Password", "Please ensure your passwords match, are more than 5 characters")
            return;
        }

        if (!validToken) {
            // console.log("New Password" + newPassword + "\n retyped Password" + retypePassword + "\n Valid Token" + validToken)
            swal("Token Invalid", "Your password reset link has expired. Please request a new one.")
            return;
        }

        let res = await call(
            "/api/user/resetForgotPassword",
            "POST",
            null,
            null,
            null,
            //@ts-ignore
            {
                user_id: id,
                new_password: newPassword,
                retyped_password: retypePassword,
                force_pass: true,
                valid_token: validToken
            },
            null,
            config.rootPath
        )

        if (res === undefined || res["message"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            navigate("/forgotPassword")
            return;
        }

        switch(res["message"]) {
            case "invalid token":
                swal("Invalid Token", "Your token is invalid. Please request a new one.")
                break;
            case "passwords do not match":
                swal("Passwords Do Not Match", "Please ensure your passwords match.")
                break;
            case "cannot check password":
                swal("Password Check Failed", "An error occurred while checking your password. Please try again.")
                break;
            case "unsafe password":
                swal("Unsafe Password", "Your password is unsafe. Please try a different one.")
                break;
            case "Password reset successfully":
                swal("Success", "Your password has been successfully reset.")
                navigate("/login")
                break;
            default:
                swal("Error", "An unknown error occurred. Please try again.")
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
                              sx={window.innerWidth > 1000 ? {
                                  justifyContent: "center",
                                  outlineColor: "black",
                                  width: "35%",
                                  borderRadius: 1,
                                  backgroundColor: theme.palette.background.default
                              } : {
                                  justifyContent: "center",
                                  outlineColor: "black",
                                  width: "99%",
                                  borderRadius: 1,
                                  backgroundColor: theme.palette.background.default
                              }} direction="column" alignItems="center"
                        >
                            <Typography component={"div"} variant={"h5"} sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                paddingTop: "10px"
                            }}>
                                Set New Password
                            </Typography>
                            <TextField
                                label={"New Password"}
                                type={showPass ? `text` : `password`}
                                variant={`outlined`}
                                color={"primary"}
                                helperText={"Please enter your new password"}
                                required={true}
                                onChange={handlePasswordChange}
                                sx={window.innerWidth > 1000 ? {
                                    width: "28vw",
                                    marginLeft: "3.5vw",
                                    marginRight: "3.5vw",
                                    mt: "3.5vh",
                                    mb: "20px"
                                } : {
                                    width: "85vw",
                                    marginLeft: "3.5vw",
                                    marginRight: "3.5vw",
                                    mt: "3.5vh",
                                    mb: "20px"
                                }}
                                InputProps={{
                                    endAdornment: <ShowButton/>
                                }}
                            />
                            <TextField
                                label={"Retype New Password"}
                                type={showPass ? `text` : `password`}
                                variant={`outlined`}
                                color={"primary"}
                                helperText={"Please retype your new password"}
                                required={true}
                                onChange={handleRetypePasswordChange}
                                sx={window.innerWidth > 1000 ? {
                                    width: "28vw",
                                    marginLeft: "3.5vw",
                                    marginRight: "3.5vw",
                                    mt: "3.5vh",
                                    mb: "20px"
                                } : {
                                    width: "85vw",
                                    marginLeft: "3.5vw",
                                    marginRight: "3.5vw",
                                    mt: "3.5vh",
                                    mb: "20px"
                                }}
                                InputProps={{
                                    endAdornment: <ShowButton/>
                                }}
                            />
                            <Button
                            disabled={!isPasswordValid}
                            onClick={handleSubmit}
                            variant={`contained`}
                            color={"primary"}
                            endIcon={<LockPersonIcon />}
                            sx={{
                                borderRadius: 1,
                                minHeight: "5vh",
                                minWidth: '15vw',
                                justifyContent: "center",
                                lineHeight: "35px",
                                marginBottom: "30px"
                        }}
                            >
                            Submit
                            </Button>
                        </Grid>
                    </Grid>
                </CssBaseline>
            </ThemeProvider>
        </div>
    );
}

export default ResetForgotPassword;
