import React, {ChangeEvent, useEffect, useState} from "react";
import {
    Box,
    Button,
    Checkbox, createTheme,
    CssBaseline,
    FormControlLabel, Grid, PaletteMode,
    TextField,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens, isHoliday} from "../theme";
import {useAppDispatch} from "../app/hooks";
import {useNavigate} from "react-router-dom";
import christmasLogin219 from "../img/christmas-login-21-9.png";
import loginImg219 from "../img/login/login_background-21-9.jpg";
import christmasLogin from "../img/christmas-login.png";
import loginImg from "../img/login/login_background.png";
import {makeStyles} from "@material-ui/core";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
interface SubscriptionState {
    allEmails: boolean;
    streak: boolean;
    pro: boolean;
    newsletter: boolean;
    inactivity: boolean;
    messages: boolean;
    referrals: boolean;
    promotional: boolean;
}

// Define custom styles
const useStyles = makeStyles((theme) => ({
    checkbox: {
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
    label: {
        // Styling for the label
        fontSize: '1rem',
        margin: '8px 0',
    },
    checkboxContainer: {
        padding: '10px',
    },
}));

function Unsubscribe() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    // Update the theme only if the mode changes
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [email, setEmail] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
    const [userFound, setUserFound] = useState<boolean>(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [componentKey, setComponentKey] = useState(0);
    const [subscriptions, setSubscriptions] = useState<SubscriptionState>({
        allEmails: false,
        streak: false,
        pro: false,
        newsletter: false,
        inactivity: false,
        messages: false,
        referrals: false,
        promotional: false,
    });

    const dispatch = useAppDispatch();

    let navigate = useNavigate();

    const holiday = isHoliday()

    const aspectRatio = useAspectRatio();

    const emailRef = React.useRef(email);

    const renderLanding = () => {

        if (aspectRatio === "21:9") {
            if (holiday === "Christmas") {
                return christmasLogin219
            }
            return loginImg219
        } else {
            if (holiday === "Christmas") {
                return christmasLogin
            }
            return loginImg
        }
    }

    const isValidEmail = (email: string): boolean => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        emailRef.current = e.target.value; // Update emailRef whenever email changes
        setIsEmailValid(isValidEmail(e.target.value));
    };

    const handleSubscriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name as keyof SubscriptionState;
        setSubscriptions({ ...subscriptions, [name]: event.target.checked });
    };

    const handleSubmitEmail = async () => {
        const currentEmail = emailRef.current;

        if (!isEmailValid) {
            swal("Invalid Credentials", "Please enter a valid email address.");
            return;
        }

        let res = await call(
            "/api/unsubscribe/check",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            { email: currentEmail },
            null,
            config.rootPath
        );

        if (res === undefined || res["userFound"] === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }

        if (res && res["userFound"]) {
            const id = res["userID"];
            setUserId(res["userID"]);
            await handleGetEmails(id);
            setShowPreferences(true);
            setComponentKey(prevKey => prevKey + 1);
        } else {
            swal("Invalid Credentials", "No account found with that email address.");
        }
    };

    const handleGetEmails = async (userId: string) => {
        if (userId === "") {
            swal("Error", "There was an error processing your request. Please try again later or contact support.");
            return;
        }

        let res = await call(
            "/api/unsubscribe/get",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            { userID: userId },
            null,
            config.rootPath
        );

        if (res === undefined) {
            if (sessionStorage.getItem("alive") === null) {
                //@ts-ignore
                swal("Server Error", "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!");
            }
            return;
        }

        if (res && typeof res === "object") {
            setSubscriptions({
                allEmails: res["allEmails"],
                streak: res["streak"],
                pro: res["pro"],
                newsletter: res["newsletter"],
                inactivity: res["inactivity"],
                messages: res["messages"],
                referrals: res["referrals"],
                promotional: res["promotional"],
            });
            setShowPreferences(true);
        } else {
            swal("Error", "Failed to retrieve email preferences.");
        }
    };


    const handleSubmitPreferences = async () => {
        // Check if userId is valid
        if (!userId) {
            swal("Error", "User ID is not available. Please try again.");
            return;
        }

        console.log(userId);

        // Prepare the payload with the updated preferences
        const preferencesPayload = {
            userID: userId,
            allEmails: subscriptions.allEmails,
            streak: subscriptions.streak,
            pro: subscriptions.pro,
            newsletter: subscriptions.newsletter,
            inactivity: subscriptions.inactivity,
            messages: subscriptions.messages,
            referrals: subscriptions.referrals,
            promotional: subscriptions.promotional,
        };

        // Make the API call
        let res = await call(
            "/api/unsubscribe/modify",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            preferencesPayload,
            null,
            config.rootPath
        );

        // Handle the response
        if (res && res.success) {
            swal("Success", "Your email preferences have been updated.");
        } else {
            // Handle errors
            swal("Error", "Failed to update email preferences. Please try again.");
        }
    };


    const handleSelectAllEmails = (event: ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setSubscriptions({
            allEmails: checked,
            streak: checked,
            pro: checked,
            newsletter: checked,
            inactivity: checked,
            messages: checked,
            referrals: checked,
            promotional: checked,
        });
    };

    // New label mapping
    const labelMapping: { [key in keyof SubscriptionState]: string } = {
        allEmails: "All Emails",
        streak: "Streak Reminders",
        pro: "Membership Notifications",
        newsletter: "Newsletter",
        inactivity: "Inactivity Reminders",
        messages: "Message Notifications",
        referrals: "Referral Notifications",
        promotional: "Promotional Emails",
    };

    // Use the custom styles
    const classes = useStyles();

    return (
        <div key={componentKey}
            style={{
                backgroundColor: "black",
                backgroundImage: `url(${renderLanding()})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                width: '100vw',
                height: '100vh'
            }}>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        height: '100vh',
                        paddingTop: '15vh'
                    }}>
                        <Typography variant="h3"
                                    sx={{ color: 'primary.main', mb: 4,}}
                        >
                            Update Email Preferences
                        </Typography>
                        <Grid container justifyContent="center">
                            <Grid container
                                  sx={{
                                      justifyContent: "center",
                                      outlineColor: "black",
                                      width: window.innerWidth > 1000 ? "35%" : "55%",
                                      borderRadius: 1,
                                      padding: 4,
                                      backgroundColor: theme.palette.background.default,
                                  }} direction="column" alignItems="center"
                            >
                                {!showPreferences && (
                                    <>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            Enter Your Email
                                        </Typography>
                                        <TextField
                                            label="Email"
                                            variant="outlined"
                                            value={email}
                                            onChange={handleEmailChange}
                                            sx={{ mb: 2, width: '80%' }}
                                            required
                                        />
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSubmitEmail}
                                            disabled={!isEmailValid}
                                            sx={{ mb: 2 }}
                                        >
                                            Submit
                                        </Button>
                                    </>
                                )}
                                {showPreferences && (
                                    <>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            Select Email Preferences
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {Object.keys(subscriptions).map((key) => {
                                                const label = labelMapping[key as keyof SubscriptionState];
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} key={key} className={classes.checkboxContainer}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    className={classes.checkbox}
                                                                    checked={subscriptions[key as keyof SubscriptionState]}
                                                                    onChange={key === 'allEmails' ? handleSelectAllEmails : handleSubscriptionChange}
                                                                    name={key}
                                                                />
                                                            }
                                                            label={label}
                                                            classes={{ label: classes.label }}
                                                        />
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSubmitPreferences}
                                            sx={{ mt: "5%" }}
                                        >
                                            Update Preferences
                                        </Button>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
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

export default Unsubscribe;