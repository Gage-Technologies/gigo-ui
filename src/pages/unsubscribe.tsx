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
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1);
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
        setIsEmailValid(isValidEmail(e.target.value));
    };

    const handleSubscriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name as keyof SubscriptionState;
        setSubscriptions({ ...subscriptions, [name]: event.target.checked });
    };

    const handleSubmitEmail = () => {
        setStep(2); // Transition to subscription options
    };

    const handleSubmitPreferences = async () => {
        // TODO: API call to update email preferences
        console.log("Submitted Email:", email);
        console.log("Subscriptions:", subscriptions);
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
        allEmails: "No Emails",
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
        <div
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
                                {/* Step 1: Email Input */}
                                {step === 1 && (
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

                                {/* Step 2: Email Preferences */}
                                {step === 2 && (
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