

import * as React from "react";
import {useEffect, useState} from "react";
import {
    Box,
    Button, Container,
    createTheme,
    CssBaseline,
    Grid,
    PaletteMode,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useNavigate} from "react-router-dom";
import config from "../config";
import {gapi} from "gapi-script";
//@ts-ignore
import {useAppDispatch} from "../app/hooks";
import logoImg from "../img/WIP-referral-plain.svg";
import logoImgMobile from "../img/WIP-referral-plain-noback.svg";
import ReactGA from "react-ga4";
import loginImg from "../img/login/login_background.jpg"
import loginImg219 from "../img/login/login_background-21-9.jpg"
import UserIcon from "../components/UserIcon";
import {AwesomeButton} from "react-awesome-button";
import premiumImage from "../img/croppedPremium.png";
import AboutPageLearnIcon from "../components/Icons/aboutPage/AboutPageLearn";
import AboutPageEasyIcon from "../components/Icons/aboutPage/AboutPageEasy";
import AboutPageConnectionIcon from "../components/Icons/aboutPage/AboutPageConnection";
import AboutPageWorldIcon from "../components/Icons/aboutPage/AboutPageWorld";
import call from "../services/api-call";
import swal from "sweetalert";
import {useParams} from "react-router";
import {ThreeDots} from "react-loading-icons";



function ReferralWelcome(this: any) {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    let {name} = useParams();
    const [loading, setLoading] = useState(true);
    const [referralUser, setReferralUser] = useState(null);

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

    ReactGA.initialize("G-38KBFJZ6M6");

    let navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        setLoading(true)
        apiLoad().then(r => console.log("here: ", referralUser))
        setLoading(false)
    }, [])

    const apiLoad = async () => {
        let user = call(
            "/api/auth/referralUserInfo",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {user_name: name},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            user
        ])

        if (res === undefined) {
            swal("There has been an issue loading data. Please try again later.")
        }

        setReferralUser(res["user"])
    }

    const aspectRatio = useAspectRatio();

    // transferring data from google logi

    const iconStyles: React.CSSProperties = {
        width: '150%',
        height: '150%',
    };


    const [isExpanded, setIsExpanded] = useState(false);

    const handleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div
            style={{
                backgroundColor: `#63a4f8`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                width: '99vw',
                overflow: 'hidden',
            }}
        >
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    {loading || referralUser === null ? (
                        <Container maxWidth={"xl"}>
                            <Typography component={"div"} sx={{display: "flex", justifyContent: "center", height: window.innerHeight, alignItems: "center"}}>
                                <ThreeDots/>
                            </Typography>
                        </Container>
                    ) : (
                        <div>
                            <Grid container justifyContent="center" sx={{
                                display: "flex", flexDirection: "row", width: "100%", height: "100vh", justifyContent: "space-evenly", alignItems: "center",
                            }}>
                                <div>
                                    <h1 style={window.innerWidth > 1000 ? {fontSize: "4vw"} : {fontSize: "6vw"}}>
                                        Welcome to GIGO
                                    </h1>
                                    <Typography style={{display: "flex", flexDirection: "row", width: "85%"}}>
                                        <div>
                                            <UserIcon
                                                userId={
                                                //@ts-ignore
                                                referralUser["_id"]}
                                                userTier={
                                                    //@ts-ignore
                                                referralUser["tier"]}
                                                userThumb={config.rootPath + "/static/user/pfp/" +
                                                    //@ts-ignore
                                                    referralUser["_id"]}
                                                backgroundName={
                                                    //@ts-ignore
                                                referralUser["name"]}
                                                backgroundPalette={
                                                    //@ts-ignore
                                                referralUser["color_palette"]}
                                                backgroundRender={
                                                    //@ts-ignore
                                                referralUser["render_in_front"]}
                                                size={window.innerWidth / 10}
                                                imageTop={2}
                                                mouseMove={false}
                                            />
                                        </div>
                                        <Typography variant="h5" component="div" style={window.innerWidth > 1000 ? {fontSize: "2vw", display: "flex", alignItems: "center", paddingLeft: "3vw"} : {fontSize: "4vw", display: "flex", alignItems: "center", paddingLeft: "3vw"}}>
                                            {referralUser["user_name"] + " invited you to GIGO"}
                                        </Typography>
                                    </Typography>
                                    <h3 style={window.innerWidth > 1000 ? {fontSize: "2vw"} : {fontSize: "6vw"}}>
                                        Claim your free month now!
                                    </h3>
                                    <AwesomeButton style={window.innerWidth > 1000 ? { width: "auto",
                                        '--button-primary-color': theme.palette.primary.main,
                                        '--button-primary-color-dark': theme.palette.primary.dark,
                                        '--button-primary-color-light': theme.palette.text.primary,
                                        '--button-primary-color-hover': theme.palette.primary.main,
                                        '--button-default-border-radius': "24px",
                                        '--button-hover-pressure': "4",
                                        height: "10vh",
                                        '--button-raise-level': "10px"
                                    } : {
                                        width: "auto",
                                        '--button-primary-color': theme.palette.primary.main,
                                        '--button-primary-color-dark': theme.palette.primary.dark,
                                        '--button-primary-color-light': theme.palette.text.primary,
                                        '--button-primary-color-hover': theme.palette.primary.main,
                                        '--button-default-border-radius': "12px",
                                        '--button-hover-pressure': "4",
                                        height: "5vh",
                                        '--button-raise-level': "6px"
                                    }} type="primary" href={"/signup/" + referralUser["user_name"]}>
                                        <h1 style={{fontSize: "3vw", paddingRight: "1vw", paddingLeft: "1vw"}}>
                                            Create Account
                                        </h1>
                                    </AwesomeButton>
                                </div>
                                <div>
                                    <img
                                        src={logoImgMobile}
                                        alt="Gigo Logo"
                                        style={window.innerWidth > 1000 ? {
                                            width: "45vw"
                                        } : {
                                            width: "100%"
                                        }}
                                    />
                                </div>
                            </Grid>
                            {window.innerWidth > 1000 ? (
                                <div>
                                    <br/><br/><br/><br/><br/><br/>

                                    <Grid container spacing={0}>
                                        <Grid item xs={2}/>
                                        <Grid item xs={3}>
                                            <h2 style={{textAlign: 'left'}}>Learn by Doing</h2>
                                            <p>GIGO offers users the opportunity to tackle and craft genuine coding challenges. Through problem-solving and project development, users gain a deeper understanding of programming</p>
                                        </Grid>
                                        <Grid item xs={2}/>
                                        <Grid item xs={3} >
                                            <AboutPageLearnIcon style={iconStyles} aspectRatio={aspectRatio.toString()} />
                                        </Grid>
                                        <Grid item xs={2}/>
                                    </Grid>

                                    <br/><br/><br/><br/><br/><br/>

                                    <Grid container spacing={0}>
                                        <Grid item xs={2}/>
                                        <Grid item xs={3}>
                                            <AboutPageEasyIcon style={iconStyles} aspectRatio={aspectRatio.toString()} />
                                        </Grid>
                                        <Grid item xs={2}/>
                                        <Grid item xs={3}>
                                            <h2 style={{textAlign: 'left'}}>Take it Easy</h2>
                                            <p>Our preconfigured development environments, running on our robust in-house infrastructure, allow you to jump straight into writing and running code.</p>
                                        </Grid>
                                        <Grid item xs={2}/>
                                    </Grid>

                                    <br/><br/><br/><br/><br/><br/>

                                    <Grid container spacing={0}>
                                        <Grid item xs={2}/>
                                        <Grid item xs={3}>
                                            <h2 style={{textAlign: 'left'}}>Connect</h2>
                                            <p>Engage, collaborate, and socialize with a network of programmers who share your passion for technology.</p>
                                        </Grid>
                                        <Grid item xs={2}/>
                                        <Grid item xs={3} >
                                            <AboutPageConnectionIcon style={iconStyles} aspectRatio={aspectRatio.toString()} />
                                        </Grid>
                                        <Grid item xs={2}/>
                                    </Grid>

                                    <br/><br/><br/><br/><br/><br/>

                                    <Grid container spacing={0}>
                                        <Grid item xs={2}/>
                                        <Grid item xs={3}>
                                            <AboutPageWorldIcon style={iconStyles} aspectRatio={aspectRatio.toString()} />
                                        </Grid>
                                        <Grid item xs={2}/>
                                        <Grid item xs={3}>
                                            <h2 style={{textAlign: 'left'}}>Real World Experience</h2>
                                            <p>Our extensive library of tutorials, interactive projects, and challenges are designed to level up your skills for today's tech industry.</p>
                                        </Grid>
                                        <Grid item xs={2}/>
                                    </Grid>
                                    <br/><br/><br/><br/><br/><br/>
                                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                        <Button variant={'outlined'} onClick={handleExpand} style={{color: "white"}}>
                                            {isExpanded ? 'Show Less' : 'Learn More'}
                                        </Button>
                                        <br/>
                                        {isExpanded && (
                                            <div style={{display: "flex", textAlign: "center", flexDirection: "column", width: "100%"}}>
                                                <div style={{height: "20px"}}/>
                                                <body style={{width: "55%", alignSelf: "center", lineHeight: 2, textAlign: "justify", background: "transparent"}}>
                                                GIGO is a community that is more than just another coding platform; it's a revolution in software development, education, and collaboration. We believe that the future of the tech industry lies in collective growth. That's why GIGO aims to dismantle the barriers that hold back most novice and intermediate programmers. Our community is dedicated to collaborative learning, knowledge sharing, and advancing both individual coders and the tech industry as a whole.
                                                <br/>
                                                <br/>
                                                One of the most daunting barriers to coding is setting up a functional development environment. With GIGO, those hours spent installing dependencies, configuring servers, and resolving version conflicts are a thing of the past. Our preconfigured development environments, running on our robust in-house infrastructure, allows you to jump straight into writing and running code.
                                                <br/>
                                                <br/>
                                                <br/>
                                                </body>
                                            </div>
                                        )}
                                    </Box>
                                </div>
                            ) : (
                                <>
                                    <br/><br/>
                                    <AboutPageLearnIcon aspectRatio={'mobile'} />
                                    <Grid container spacing={0} style={{marginLeft: "15px", width: "90%"}}>
                                        <Grid item xs={12}>
                                            <h2 style={{textAlign: 'left'}}>Learn by Doing</h2>
                                            <p>GIGO offers users the opportunity to tackle and craft genuine coding challenges. Through problem-solving and project development, users gain a deeper understanding of programming</p>
                                        </Grid>
                                    </Grid>
                                    <br/><br/><br/><br/>
                                    <AboutPageEasyIcon aspectRatio={'mobile'} />
                                    <Grid container spacing={0} style={{marginLeft: "15px", width: "90%"}}>
                                        <Grid item xs={12}>
                                            <h2 style={{textAlign: 'left'}}>Take it Easy</h2>
                                            <p>Our preconfigured development environments, running on our robust in-house infrastructure, allow you to jump straight into writing and running code.</p>
                                        </Grid>
                                    </Grid>
                                    <br/><br/><br/><br/>
                                    <AboutPageConnectionIcon aspectRatio={'mobile'} />
                                    <Grid container spacing={0} style={{marginLeft: "15px", width: "90%"}}>
                                        <Grid item xs={12}>
                                            <h2 style={{textAlign: 'left'}}>Connect</h2>
                                            <p>Engage, collaborate, and socialize with a network of programmers who share your passion for technology.</p>
                                        </Grid>
                                    </Grid>
                                    <br/><br/><br/><br/>
                                    <AboutPageWorldIcon aspectRatio={'mobile'} />
                                    <Grid container spacing={0} style={{marginLeft: "15px", width: "90%"}}>
                                        <Grid item xs={12}>
                                            <h2 style={{textAlign: 'left'}}>Real World Experience</h2>
                                            <p>Our extensive library of tutorials, interactive projects, and challenges are designed to level up your skills for today's tech industry.</p>
                                        </Grid>
                                    </Grid>
                                    <br/><br/>
                                </>
                            )}
                        </div>
                    )}
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
        console.log("aspectRatio: ", aspectRatio);

        return () => {
            window.removeEventListener('resize', calculateAspectRatio);
        };
    }, []);

    return aspectRatio;
}


export default ReferralWelcome;