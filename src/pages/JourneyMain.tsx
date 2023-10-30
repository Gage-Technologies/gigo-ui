import React, {useEffect, useState} from 'react';
import JourneyPageIcon from "../components/Icons/JourneyPage";
import {themeHelpers, getAllTokens, isHoliday} from "../theme";
import {Container, createTheme, CssBaseline, Grid, PaletteMode, ThemeProvider, Typography} from "@mui/material";
import JourneyPageCampIcon from "../components/Icons/JourneyPageCamp";

import JourneyPagePumpIcon from "../components/Icons/JourneyPageGasPump";
import {useAppSelector} from "../app/hooks";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {AwesomeButton} from "react-awesome-button";
import {useNavigate} from "react-router-dom";
import premiumImage from "../img/croppedPremium.png";
import CompletedCircleIcon from "../components/Icons/joruneyMainAssets/CompletedCircle";
import PythonCircleIcon from "../components/Icons/joruneyMainAssets/PythonCircle";
import GolangCircleIcon from "../components/Icons/joruneyMainAssets/GolangCircle";
import VscodeCircleIcon from "../components/Icons/joruneyMainAssets/VscodeCircle";
import JavaScriptCircleIcon from "../components/Icons/joruneyMainAssets/JavascriptCircle";


interface LineProps {
    fromId: string;
    toId: string;
    complete: boolean;
}

const useElementPosition = (id: string, positionType: 'center' | 'bottom' | 'top') => {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const element = document.getElementById(id);
        if (element) {
            const rect = element.getBoundingClientRect();
            let x = rect.left + window.scrollX + rect.width / 2;
            let y = rect.top + window.scrollY + rect.height / 2;

            // Adjust for bottom of the parent
            if (positionType === 'bottom') {
                y += 5;
            }
            // Adjust for top of the child
            if (positionType === 'top') {
                y -= (rect.height / 2) + 5;
            }

            // Adjust for center of the child
            if (positionType === 'center') {
                y -= rect.height / 4;
            }

            // Adjust for the offset
            x -= 403;
            y -= 225;

            setPosition({ x, y });
        }
    }, [id, positionType]);

    return position;
};

const LineBetweenElements: React.FC<LineProps> = ({ fromId, toId, complete }) => {
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



    const fromPosition = useElementPosition(fromId, 'center');
    const toPosition = useElementPosition(toId, 'center');
    const isCompleted = complete
    const [style, setStyle] = useState<React.CSSProperties | null>(null);

    useEffect(() => {
        if (fromPosition && toPosition) {
            const dx = toPosition.x - fromPosition.x;
            const dy = toPosition.y - fromPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            const incompleteStyles: React.CSSProperties = {
                position: 'absolute',
                top: `${fromPosition.y}px`,
                left: `${fromPosition.x}px`,
                width: `${distance}px`,
                height: '1px',
                border: 'none',
                borderBottom: `8px dotted ${theme.palette.primary.dark}`,  // This will make the line dotted
                transform: `rotate(${angle}deg)`,
                transformOrigin: '0% 0%',
                zIndex: 1,
            }

            const completeStyles: React.CSSProperties = {
                position: 'absolute',
                top: `${fromPosition.y}px`,
                left: `${fromPosition.x}px`,
                width: `${distance}px`,
                height: '8px',
                backgroundColor: `${theme.palette.text.primary}`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: '0% 0%',
                zIndex: 1,
            }

            setStyle(!isCompleted ? incompleteStyles : completeStyles);
        }
    }, [fromPosition, toPosition, isCompleted]);

    return style ? <div style={style}></div> : null;
};
function JourneyMain() {

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

    const iconStyles: React.CSSProperties = {
        width: '95%',
        height: '110%',
    };
    const iconData = [
        [
            {
                "name": "vscode",
                "icon": "vscode",
                "from": null,
                "complete": true,
            }
        ],
        [
            {
                "name": "js",
                "icon": "js",
                "from": ["vscode"],
                "complete": true,
            },
            {
                "name": "python",
                "icon": "python",
                "from": ["vscode"],
                "complete": false,
            },
            {
                "name": "go",
                "icon": "go",
                "from": ["vscode"],
                "complete": false,
            },
        ],
        [

            {
                "name": "go2",
                "icon": "go",
                "from": ["go"],
                "complete": false,
            },
            {
                "name": "go4",
                "icon": "go",
                "from": ["go"],
                "complete": false,
            },

        ],
        [
            {
                "name": "go3",
                "icon": "go",
                "from": ["go2", "go4"],
                "complete": false,
            }
        ]
    ];

    const labelToIcon = (label: string, complete: boolean) => {
        switch (label) {
            case "vscode":
                if (complete) return <CompletedCircleIcon />
                return <VscodeCircleIcon />
            case "js":
                if (complete) return <CompletedCircleIcon />
                return <JavaScriptCircleIcon />
            case "python":
                if (complete) return <CompletedCircleIcon />
                return <PythonCircleIcon />
            case "go":
                if (complete) return <CompletedCircleIcon />
                return <GolangCircleIcon />
            default:
                if (complete) return <CompletedCircleIcon />
                return "";
        }
    }

    const renderJourneyMap = () => {
        let drawnLines: Array<{ from: string, to: string, complete: boolean }> = [];
        iconData.forEach((group, index) => {
            if (index > 0) {
                group.forEach((icon) => {
                    if (icon.from) {
                        for (let i = 0; i < icon.from.length; i++) {
                            let completed = false;
                            for (let j = 0; j < iconData[index - 1].length; j++) {
                                if (iconData[index - 1][j].name === icon.from[i]){
                                    completed = iconData[index - 1][j].complete
                                }
                            }

                            drawnLines.push({
                                from: `journey-icon-${icon.from[i]}`,
                                to: `journey-icon-${icon.name}`,
                                complete: completed,
                            });
                        }
                    }
                });
            }
        });

        return (
            <>
                <Grid
                    container
                    key={"journey-map"}
                    spacing={3}
                    style={{
                        marginTop: "50px"
                    }}
                >
                    {
                        iconData.map((group, index) => {
                            let rowWidth = 12 / group.length
                            return (
                                group.map((icon) => {
                                    // require a from if this is not the first layer
                                    let from = null;
                                    if (index > 0) {
                                        from = icon.from
                                    }

                                    return (
                                        <Grid
                                            item
                                            xs={rowWidth}
                                            key={icon.name}
                                            sx={{
                                                alignItems: "center",
                                                zIndex: 3,
                                            }}
                                        >
                                            <div
                                                id={`journey-icon-${icon.name}`}
                                                style={{
                                                    height: "150px",
                                                    width: "150px",
                                                    marginLeft: "auto",
                                                    marginRight: "auto",
                                                }}
                                            >
                                                {labelToIcon(icon.icon, icon.complete)}
                                            </div>
                                        </Grid>
                                    )
                                })
                            )
                        })
                    }
                </Grid>
                <div>
                    {drawnLines.map((line, index) => (
                        <LineBetweenElements key={index} fromId={line.from} toId={line.to} complete={line.complete} />
                    ))}
                </div>
            </>
        )
    }

    const navigate = useNavigate();
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg" style={{ paddingTop: '20px' }}>
                <Typography variant="h1" align="center">
                    Journey
                </Typography>
                <div style={{ position: 'relative' }}>
                    {renderJourneyMap()}
                </div>

            </Container>
    </ThemeProvider>
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

export default JourneyMain;

