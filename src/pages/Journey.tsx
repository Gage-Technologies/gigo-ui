import React, {useEffect, useState} from 'react';
import JourneyPageIcon from "../components/Icons/JourneyPage";
import {themeHelpers, getAllTokens, isHoliday} from "../theme";
import {createTheme, PaletteMode} from "@mui/material";
import JourneyPageCampIcon from "../components/Icons/JourneyPageCamp";
import {Grid} from "@material-ui/core";
import JourneyPagePumpIcon from "../components/Icons/JourneyPageGasPump";
import {useAppSelector} from "../app/hooks";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {AwesomeButton} from "react-awesome-button";
import {useNavigate} from "react-router-dom";
import premiumImage from "../img/croppedPremium.png";



function Journey() {

    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const colorMode = React.useMemo(
        () => ({
            // The dark mode switch would invoke this method
            toggleColorMode: () => {
                setMode((prevMode: PaletteMode) =>
                    prevMode === 'light' ? 'dark' : 'light',
                );
            },
        }),
        [mode],
    );

    const aspectRatio = useAspectRatio();
    console.log("aspectRatio: ", aspectRatio);
    const handleTheme = () => {
        colorMode.toggleColorMode();
        localStorage.setItem('theme', mode === 'light' ? "dark" : 'light')
        window.location.reload()
    };


    const containerStyles: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        height: '90vh',

    };

    const iconContainerStyles: React.CSSProperties = {
        width:
            sidebarOpen
                ? 'calc(95vw - 15vw)'
                : chatOpen ? 'calc(95vw - 15vw)'
                    : '95vw',
        height: '90vh', // Set to 100% of viewport height
        position: 'relative',
        zIndex: 0,
    };

    const vignetteStyles: React.CSSProperties = {
        width:
            sidebarOpen
                ? 'calc(95vw - 15vw)'
                : chatOpen ? 'calc(95vw - 15vw)'
                : '95vw',
        height: '90vh',
        background: `radial-gradient(circle, rgba(0,0,0,0) 40%, ${hexToRGBA(theme.palette.background.default)} 70%, ${hexToRGBA(theme.palette.background.default)} 83%), linear-gradient(180deg, rgba(0,0,0,0) 51%, rgba(0,0,0,0) 52%, ${hexToRGBA(theme.palette.background.default)} 92%, ${hexToRGBA(theme.palette.background.default)}` , // Vignette gradient
        position: 'absolute',
        left: '0%',
        bottom: (aspectRatio !== '21:9') && (sidebarOpen || chatOpen) ? '-1%' : '0%',
        zIndex: 2, // Set a higher zIndex to appear above the SVG
    };


    const iconStyles: React.CSSProperties = {
        width: '95%',
        height: '110%',
    };

    const textStyles: React.CSSProperties = {
        position: 'absolute',
        top: '20%',
        left: '55%',
        transform: 'translate(-50%, -50%)',
        fontSize: '300%',
        fontWeight: 'bold',
        color: '#e4c8b5',
        zIndex: 1,
        whiteSpace: 'nowrap',
    };

    const textStyles2: React.CSSProperties = {
        position: 'absolute',
        top: '20%',
        left: '55.3%',
        transform: 'translate(-50%, -50%)',
        fontSize: '300%',
        fontWeight: 'bold',
        color: '#915d5d',
        zIndex: 0.5,
        whiteSpace: 'nowrap',
    };

    const [buttonHover, setButtonHover] = React.useState(false);

    const buttonShine: React.CSSProperties = {
        position: 'absolute',
        borderRadius: '50%',
        width: '180px',
        height: '180px',

        animation: 'shine 2s infinite linear',
    };

    const textBoxStyles: React.CSSProperties = {
        height: '95vh', // Set to 100% of viewport height
        padding: '20px', // Adds some padding around the text
        zIndex: 2, // Set a higher zIndex to appear above the SVG
        backgroundColor: theme.palette.background.default,
    }


    const buttonStyles: React.CSSProperties = {
        animation: 'godRays 5s infinite linear',
        backgroundRepeat: 'repeat',
        backgroundPosition: '50% 50%',
        position: 'absolute',
        top: '37.6%',
        left: '55.8%',
        transform: 'translate(-50%, -50%)',
        width:  aspectRatio === '21:9' ?  '6%': '7%', // Set width and height to the same value to create a circle
        height: aspectRatio === '21:9' ? '15.4%' : '12.4%',

        backgroundColor: '#e9c6af',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#fff',
        boxShadow: buttonHover
            ? '0 0 20px 15px rgba(256, 256, 256, 0.5)'
            : '0 0 16px 13px rgba(256, 256, 256, 0.2)',
        borderRadius: '50%', // 50% border-radius to create a perfect circle
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // To center the text inside the circle
        overflow: 'hidden', // Hide the overflowing part of the shine effect
        zIndex: 3, // Set a higher zIndex to appear above the SVG

    };

    const finalButtonStyles: React.CSSProperties = {
        backgroundColor: buttonHover ? '#58cc02': '#4da902', /* Duolingo green */
        color: 'white',
        border: 'none',
        borderRadius: '25px', /* Rounded corners */
        padding: '12px 24px', /* Padding for aesthetics */
        fontSize: '16px',
        cursor: 'pointer', /* Pointer cursor on hover */
        transition: 'background-color 0.3s ease' /* Transition effect */
    };

    const contentStyles: React.CSSProperties = {
        flex: '1',
        overflowY: 'scroll',
        backgroundColor: theme.palette.background.default,
    };

    const scrollToBottom = () => {
        const element = document.getElementById("contentContainer");
        if (element) {
            const scrollHeight = element.scrollHeight;
            const startPos = element.scrollTop;
            const change = scrollHeight - startPos;
            const duration = 900; // Duration of scroll in milliseconds
            let start: number;

            const animateScroll = (timestamp: number) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
                    t /= d / 2;
                    if (t < 1) return (c / 2) * t * t + b;
                    t--;
                    return (-c / 2) * (t * (t - 2) - 1) + b;
                };

                element.scrollTop = easeInOutQuad(progress, startPos, change, duration);

                if (progress < duration) {
                    window.requestAnimationFrame(animateScroll);
                }
            };

            window.requestAnimationFrame(animateScroll);
        }
    };


    const navigate = useNavigate();
    return (
        <div style={containerStyles}>
            <div style={iconContainerStyles}>
                <div style={vignetteStyles} /> {/* Vignette overlay */}
                <JourneyPageIcon style={iconStyles} aspectRatio={aspectRatio.toString()} />
                <div style={textStyles}>Your Journey Starts Here</div>
                <div style={textStyles2}>Your Journey Starts Here</div>
                <button
                    style={buttonStyles}
                    onMouseEnter={() => setButtonHover(true)}
                    onMouseLeave={() => setButtonHover(false)}
                    onClick={scrollToBottom}
                >
                    <div style={buttonShine} />
                    Get Started
                </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                <div style={textBoxStyles}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
                            <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.5', textAlign: 'left', maxWidth: '80%' }}>
                                <h1 style={{textAlign: 'center'}}>GIGO Journey System</h1>
                                <br/>
                                <br/>
                                <Grid container spacing={0}>
                                    <Grid item xs={6}>
                                        <p>GIGO Code Journeys focus on delivering comprehensive programming education. The journey is structured to provide programmers of various skill levels with concise, well-defined, and efficient paths to enhance their programming expertise.</p>
                                        <ol>
                                            <strong>Incremental Learning Path</strong>
                                            <p>For Entry-Level Programmers: The journey starts with the basics of programming. Entry-level participants engage in simple exercises and challenges that introduce fundamental concepts like variables, loops, and functions.</p>
                                            <p>For Experienced Programmers: Intermediate and advanced modules are available. These include complex algorithms, design patterns, data structures, and specialized areas like machine learning or distributed systems.</p>
                                            <li>
                                                <strong>Bite-Sized Lessons</strong>
                                                <p>Lessons are broken down into manageable, easily digestible segments. This allows participants to learn at their own pace and facilitates understanding by focusing on one concept at a time.</p>
                                                <p>Practical examples and hands-on exercises are integrated within each lesson to ensure understanding and retention.</p>
                                            </li>
                                        </ol>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <JourneyPageCampIcon style={iconStyles} aspectRatio={aspectRatio.toString()} />
                                    </Grid>

                                </Grid>
                                <Grid container spacing={0}>
                                <Grid item xs={11}>

                                </Grid>
                                    <Grid item xs={6}>
                                        <JourneyPagePumpIcon style={iconStyles} aspectRatio={aspectRatio.toString()} />
                                    </Grid>


                                    <Grid item xs={6}>
                                        <div style={{textAlign: 'left', justifyContent: 'center'}}>
                                            <h2>Curriculum</h2>
                                        </div>
                                        <p>The curriculum is designed with a wide array of programming languages and paradigms, allowing flexibility and personalization for each participant. It covers:</p>
                                        <ul>
                                            <li>Fundamentals: Data types, control structures, error handling, etc.</li>
                                            <li>Intermediate Concepts: Object-oriented programming, APIs, databases, etc.</li>
                                            <li>Advanced Topics: Multi-threading, distributed computing, cloud-native technologies, etc.</li>
                                            <li>Specialized Paths: In-depth mastery in areas like machine learning, network programming, etc.</li>
                                        </ul>



                                        <h3>Mentorship and Community Support</h3>
                                        <p>Participants have access to mentors, forums, and community groups that can provide support, guidance, and collaboration opportunities.</p>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <h3>Continuous Evaluation and Feedback</h3>

                                        <p>Through quizzes, projects, and real-world scenarios, participants are constantly evaluated. Feedback is provided to ensure that they understand the concepts thoroughly and can apply them in practical situations.</p>
                                        <br/>
                                        <br/>
                                    </Grid>
                                    <Grid container xs={12} style={{justifyContent: "center", alignItems: "center"}}>
                                        <AwesomeButton style={{ width: "30%", height: "100%",
                                            '--button-primary-color': theme.palette.primary.main,
                                            '--button-primary-color-dark': theme.palette.primary.dark,
                                            '--button-primary-color-light': theme.palette.text.primary,
                                            '--button-primary-color-hover': theme.palette.primary.main,
                                            '--button-default-height': '5vh',
                                            '--button-default-font-size': '2vh',
                                            '--button-default-border-radius': '12px',
                                            '--button-horizontal-padding': '27px',
                                            '--button-raise-level': '6px',
                                            '--button-hover-pressure': '1',
                                            '--transform-speed': '0.185s',


                                            borderRadius: "25px",
                                            fontSize: "100%",
                                        }} type="primary" onPress={() => navigate("/journey/form")}>
                                            Embark On Your Journey
                                        </AwesomeButton>
                                        <br/>
                                        <br/>
                                        <br/>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <h3>Conclusion</h3>
                                        <p>The GIGO Journey system stands as a robust educational framework catering to different skill levels. Its incremental and bite-sized approach to lessons ensures that learners can progress at a comfortable pace without feeling overwhelmed. By connecting foundational concepts to advanced mastery through a well-structured pathway, it ensures a coherent and fulfilling learning experience for anyone looking to either start their coding journey or elevate their existing skills to complete mastery. Whether a novice seeking full competency or an experienced programmer aiming for complete mastery, the GIGO Code Journeys have the tools, resources, and support needed to reach those goals.</p>
                                        <br/>
                                    </Grid>


                                </Grid>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function hexToRGBA(hex: any, alpha = 1) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

export default Journey;

