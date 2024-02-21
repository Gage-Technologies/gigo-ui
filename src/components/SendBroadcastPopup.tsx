import * as React from "react";
import {
    createTheme,
    CssBaseline,
    PaletteMode,
    ThemeProvider,
    Box,
    Modal, TextField, Grid, Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {getAllTokens} from "../theme";
import Lottie from "react-lottie";
import {useEffect} from "react";
import Button from "@mui/material/Button";
import {Fade} from "react-awesome-reveal"
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {initialAuthStateUpdate, updateAuthState} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";

const SendBroadcastPopop = ({ onClose }: { onClose?: () => void }) => {
    let userPref = localStorage.getItem("theme");
    const [mode, _] = React.useState<PaletteMode>(
        userPref === "light" ? "light" : "dark"
    );
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [showConfetti, setShowConfetti] = React.useState(false);
    const [message, setMessage] = React.useState<string>("");

    const [open, setOpen] = React.useState(true);

    let navigate = useNavigate();

    const sendBroadcastMessage = async () => {
        if (message !== "") {
            let res = await call(
                "/api/broadcast/message",
                "POST",
                null,
                null,
                null,
                // @ts-ignore
                {broadcast_type: 0, message: message},
                null,
                config.rootPath
            )

            if (res === undefined) {
                swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                    "We'll get crackin' on that right away!")
                return
            }

            if (res["broadcast_message"] === undefined) {
                if (res["message"] === undefined) {
                    swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                        "We'll get working on this, come back in a few minutes")
                    return
                }
                swal("Server Error", res["message"])
                return
            }
        }
    }

    const revertBroadcast = async () => {
        let res = await call(
            "/api/broadcast/revert",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["message"] === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["message"] !== "Revert Successful") {
            console.log("problem with reverting broadcast")
        }
    }

    useEffect(() => {
        setShowConfetti(true);

        const timer = setTimeout(() => {
            setShowConfetti(false);
        }, 4000);

        return () => clearTimeout(timer); // Clear the timeout if the component is unmounted
    }, [])

    const confirmButton = () => {
        if (message !== "") {
            sendBroadcastMessage()
            revertBroadcast()
            setOpen(false);
            if (onClose) onClose();
        } else {
            return;
        }
    }

    const backButton = () => {
        setOpen(false);
        if (onClose) onClose();
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'fixed', top: 0,
                left: 0,
                width: '100%',
                height: '100%'
            }}>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <Modal open={open} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Grid
                            container
                            sx={{
                                width: 800,
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                flexDirection: "column",
                                alignContent: "center",
                                padding: "10px",
                                outlineColor: "black",
                                borderRadius: 1,
                                boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                                backgroundColor: theme.palette.background.default,
                                overflow: "auto",
                            }}
                        >
                            <Typography component={"div"} variant={"h5"} sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                paddingTop: "10px"
                            }}>
                                Attention GigoChad
                            </Typography>
                            <div style={{height: "5vh"}}/>
                            <Typography component={"div"} variant={"h5"} sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "-7%"
                            }}>
                                You earned a global message!
                            </Typography>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%"
                            }}>
                                <form
                                    noValidate
                                    autoComplete="off"
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginTop: "4%",
                                        width: "95%",
                                        paddingBottom: "",
                                        zIndex: 6,
                                    }}
                                    onSubmit={e => e.preventDefault()}
                                >
                                    <TextField
                                        id={"outlined-basic"}
                                        label={"Message"}
                                        variant={"outlined"}
                                        required={true}
                                        multiline={true}
                                        minRows={2}
                                        color={`secondary`}
                                        style={{width: "100%"}}
                                        onChange={e => setMessage(e.target.value)}
                                        value={message}
                                    />
                                </form>
                            </div>
                            <div style={{height: "5vh"}}/>
                            <Grid container direction="column" alignItems="center" justifyContent="center">
                                <Button
                                    variant={"contained"}
                                    sx={{
                                        zIndex: 6,
                                        width: "25%",
                                        height: "50px",
                                        backgroundColor: "#20A51A",
                                        color: "white",
                                        borderRadius: "25px",
                                        boxShadow: '0 5px 0 #235d30',
                                        '&:active': {transform: 'translateY(5px)', boxShadow: 'none'},
                                        '&:hover': {backgroundColor: "#20A51A", cursor: 'pointer', '&:before': {transform: 'translateX(300px) skewX(-15deg)', opacity: 0.6, transition: '.7s'}}
                                    }}
                                    disableRipple={true}
                                    onClick={() => confirmButton()}
                                    id={"button"}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    variant={"contained"}
                                    sx={{
                                        zIndex: 6,
                                        width: "12%",
                                        height: "30px",
                                        backgroundColor: "#20A51A",
                                        color: "white",
                                        borderRadius: "25px",
                                        boxShadow: '0 5px 0 #235d30',
                                        '&:active':{transform: 'translateY(5px)', boxShadow: 'none'},
                                        '&:hover':{backgroundColor: "#20A51A", cursor: 'pointer', '&:before': {transform: 'translateX(300px) skewX(-15deg)', opacity: 0.6, transition: '.7s'}},
                                        margin: "15px 0"
                                    }}
                                    disableRipple={true}
                                    onClick={() => backButton()}
                                    id={"button"}
                                >
                                    Skip
                                </Button>
                            </Grid>
                        </Grid>
                    </Modal>
                </CssBaseline>
            </ThemeProvider>
        </div>
    );
};

export default SendBroadcastPopop;