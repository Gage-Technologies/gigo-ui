import React, {useEffect, useState} from 'react';
import JourneyPageIcon from "../components/Icons/JourneyPage";
import {themeHelpers, getAllTokens, isHoliday} from "../theme";
import {
    Box,
    Card,
    CardContent,
    Container,
    createTheme,
    CssBaseline,
    Grid,
    IconButton, Menu, MenuItem,
    PaletteMode,
    ThemeProvider,
    Typography
} from "@mui/material";
import JourneyPageCampIcon from "../components/Icons/JourneyPageCamp";

import JourneyPagePumpIcon from "../components/Icons/JourneyPageGasPump";
import {useAppSelector} from "../app/hooks";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {AwesomeButton, AwesomeButtonSocial} from "react-awesome-button";
import {useNavigate} from "react-router-dom";
import premiumImage from "../img/croppedPremium.png";
import CompletedCircleIcon from "../components/Icons/joruneyMainAssets/CompletedCircle";
import PythonCircleIcon from "../components/Icons/joruneyMainAssets/PythonCircle";
import GolangCircleIcon from "../components/Icons/joruneyMainAssets/GolangCircle";
import VscodeCircleIcon from "../components/Icons/joruneyMainAssets/VscodeCircle";
import JavaScriptCircleIcon from "../components/Icons/joruneyMainAssets/JavascriptCircle";
import JavascriptNoCircleIcon from "../components/Icons/joruneyMainAssets/JavascriptNoCircle";
import javascriptCircle from "../components/Icons/joruneyMainAssets/JavascriptCircle";
import javascriptNoCircle from "../components/Icons/joruneyMainAssets/journey-javascript-no-cirlce.svg";
import completedNoCircle from "../components/Icons/joruneyMainAssets/journey-completed-no-cirlce.svg"
import pythonNoCircle from "../components/Icons/joruneyMainAssets/journey-python-no-cirlce.svg"
import golangNoCircle from "../components/Icons/joruneyMainAssets/journey-golang-no-cirlce.svg"
import vscodeNoCircle from "../components/Icons/joruneyMainAssets/journey-vscode-no-cirlce.svg"
import javascriptNoCircleBlue from "../components/Icons/joruneyMainAssets/journey-javascript-no-cirlce-blue.svg";
import pythonNoCircleBlue from "../components/Icons/joruneyMainAssets/journey-python-no-cirlce-blue.svg"
import golangNoCircleBlue from "../components/Icons/joruneyMainAssets/journey-golang-no-cirlce-blue.svg"
import vscodeNoCircleBlue from "../components/Icons/joruneyMainAssets/journey-vscode-no-cirlce-blue.svg"
import javascriptNoCirclePurple from "../components/Icons/joruneyMainAssets/journey-javascript-no-cirlce-purple.svg";
import pythonNoCirclePurple from "../components/Icons/joruneyMainAssets/journey-python-no-cirlce-purple.svg"
import golangNoCirclePurple from "../components/Icons/joruneyMainAssets/journey-golang-no-cirlce-purple.svg"
import vscodeNoCirclePurple from "../components/Icons/joruneyMainAssets/journey-vscode-no-cirlce-purple.svg"
import 'react-awesome-button/dist/styles.css';
import '../img/Journey/button.css'
import '../img/Journey/background.css'
import MenuIcon from "@mui/icons-material/Menu";





interface LineProps {
    fromId: string;
    toId: string;
    complete: boolean;
    color: any;
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

const LineBetweenElements: React.FC<LineProps> = ({ fromId, toId, complete, color }) => {
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



    const fromPosition = useElementPosition(fromId, 'center');
    const toPosition = useElementPosition(toId, 'center');
    const isCompleted = complete
    const colorStyles = color
    const [style, setStyle] = useState<React.CSSProperties | null>(null);

    useEffect(() => {
        if (fromPosition && toPosition) {
            const dx = toPosition.x - fromPosition.x;
            const dy = toPosition.y - fromPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            const incompleteStyles: React.CSSProperties = {
                position: 'absolute',
                top:
                    sidebarOpen
                        ? `${fromPosition.y}px`
                        : chatOpen ? `${fromPosition.y}px`
                            : `${fromPosition.y}px`,
                left:  sidebarOpen
                    ? `${fromPosition.x - 80}px`
                    : chatOpen ? `${fromPosition.x + 190}px`
                        : `${fromPosition.x + 30}px`,
                width: `${distance}px`,
                height: '1px',
                border: 'none',
                borderBottom: `8px dotted ${colorStyles["button_dark"]}`,  // This will make the line dotted
                transform: `rotate(${angle}deg)`,
                transformOrigin: '0% 0%',
                zIndex: 1,
            }

            // @ts-ignore
            const completeStyles: React.CSSProperties = {
                position: 'absolute',
                top:
                    sidebarOpen
                        ? `${fromPosition.y}px`
                        : chatOpen ? `${fromPosition.y}px`
                            : `${fromPosition.y}px`,
                left:  sidebarOpen
                    ? `${fromPosition.x - 80}px`
                    : chatOpen ? `${fromPosition.x + 190}px`
                        : `${fromPosition.x + 30}px`,
                width: `${distance}px`,
                height: '8px',
                // @ts-ignore
                backgroundColor: `${theme.palette.tertiary.dark}`,
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
    // State to manage dropdown visibility
    const [isDropdownVisible, setIsDropdownVisible] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);

    const [pressed, setPressed] = useState(false);
    // Handler to toggle the dropdown visibility
    const handlePress = (event: { currentTarget: React.SetStateAction<null>; }, unit: string) => {
        setAnchorEl(event.currentTarget);
        setIsDropdownVisible(unit);
    };


    const handleClose = () => {
        setAnchorEl(null);
        setIsDropdownVisible("");
    };

    const handleClick = (e: any, unitName: string) => {
        let close = false;
        if (anchorEl === e.currentTarget) {
            close = true;
        }
        handleClose();
        if (close) {
            return
        }
        handlePress(e, unitName);
    };


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

    const generalButton = (language: string, complete: boolean, title: string, desc: string, etc: string, unitName: string, unitColors: any) => {
        let src = ""
        let type = "primary"
        switch (language) {
            case "vscode":
                if (complete){
                    src = completedNoCircle
                    type = "secondary"
                    break
                }
                switch (unitName) {
                    case "unit1":
                        src = vscodeNoCircle
                        break
                    case "unit2":
                        src = vscodeNoCircleBlue
                        break
                    case "unit3":
                        src = vscodeNoCirclePurple
                        break

                }

                break;
            case "js":
                if (complete){
                    src = completedNoCircle
                    type = "secondary"
                    break
                }
                switch (unitName) {
                    case "unit1":
                        src = javascriptNoCircle
                        break
                    case "unit2":
                        src = javascriptNoCircleBlue
                        break
                    case "unit3":
                        src = javascriptNoCirclePurple
                        break

                }
                break;
            case "python":
                if (complete){
                    src = completedNoCircle
                    type = "secondary"
                    break
                }
                switch (unitName) {
                    case "unit1":
                        src = pythonNoCircle
                        break
                    case "unit2":
                        src = pythonNoCircleBlue
                        break
                    case "unit3":
                        src = pythonNoCirclePurple
                        break

                }
                break;
            case "go":
                if (complete){
                    src = completedNoCircle
                    type = "secondary"
                    break
                }
                switch (unitName) {
                    case "unit1":
                        src = golangNoCircle
                        break
                    case "unit2":
                        src = golangNoCircleBlue
                        break
                    case "unit3":
                        src = golangNoCirclePurple
                        break

                }
                break;
            default:
                if (complete){
                    src = completedNoCircle
                    type = "secondary"
                    break
                }
                switch (unitName) {
                    case "unit1":
                        src = vscodeNoCircle
                        break
                    case "unit2":
                        src = vscodeNoCircleBlue
                        break
                    case "unit3":
                        src = vscodeNoCirclePurple
                        break

                }
                break;
        }

        return (

            <div style={{
                display: 'flex', // Use flex layout
                flexDirection: 'column', // Stack items vertically
                alignItems: 'center', // Center items horizontally
                justifyContent: 'center', // Center items vertically (if the container has a defined height)
            }}>
                <div className="awesome-button-wrapper">
                    <AwesomeButton
                    style={{
                        width: "6em",
                        height: "6em",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        '--button-default-height': '68px',
                        '--button-default-font-size': '14px',
                        '--button-default-border-radius': '80%',
                        '--button-horizontal-padding': '3px',
                        '--button-raise-level': '10px',
                        '--button-hover-pressure': '1',
                        '--transform-speed': '0.275s',
                        '--button-primary-color': `${unitColors["button_light"]}`,
                        '--button-primary-color-dark': `${unitColors["button_dark"]}`,
                        '--button-primary-color-light': '#d4d9e4',
                        '--button-primary-color-hover': `${unitColors["button_hover"]}`,
                        '--button-primary-color-active': `${unitColors["button_active"]}`,
                        '--button-primary-border': '0px solid #FFFFFF',
                        '--button-secondary-color': '#fffc6c',
                        '--button-secondary-color-dark': '#b9b500',
                        '--button-secondary-color-light': '#6c6a00',
                        '--button-secondary-color-hover': '#fffb3e',
                        '--button-secondary-color-active': '#faf75f',
                        '--button-secondary-border': 'none',
                        '--button-anchor-color': '#f3c8ad',
                        '--button-anchor-color-dark': '#734922',
                        '--button-anchor-color-light': '#4c3016',
                        '--button-anchor-color-hover': '#f1bfa0',
                        '--button-anchor-border': '1px solid #8c633c',
                    }}
                    type={type}
                    onPress={() => navigate("/journey/form")}

                >
                    <img
                        src={src}
                        style={{
                            height: "50%",
                            width: "50%",
                            left: "10%",
                            marginLeft: "auto",
                            marginRight: "auto",
                            objectFit: 'contain',
                        }}
                        alt="js"/>
                    </AwesomeButton>
                    <div className="tooltip">
                        <div className="tooltip-inner">
                            <div className="tooltip-content">
                                {desc}
                            </div>
                            <div className="tooltip-tags">
                                <span className="tooltip-tag-item">Tag1</span>
                                <span className="tooltip-tag-item">Tag2</span>
                                <div className="tooltip-estimated-time">
                                    {etc}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    <Card style={{
                        maxWidth: 345, // You might need to adjust this depending on your layout
                        backgroundColor: !complete ? `${unitColors["button_dark"]}` : `#ffef62`,
                        boxShadow: 'none',
                        marginTop: '1em',
                    }}>
                        <CardContent style={{
                            padding: '8px', // Adjust as needed
                        }}>
                            <Typography variant="h6" align="center" style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                color: !complete ? `#fffafa` : `#8a870b`,
                            }}>
                                {title}
                            </Typography>
                        </CardContent>
                    </Card>
            </div>
        );
    }

    const units = {
        "unit1":  [
            [
                {
                    "name": "vscode",
                    "title": "VS Code Basics",
                    "icon": "vscode",
                    "from": null,
                    "description": "A simple tutorial to get started with VS Code",
                    "etc": "2m",
                    "complete": true,
                }
            ],
            [
                {
                    "name": "js",
                    "icon": "js",
                    "title": "Intro to JavaScript",
                    "from": ["vscode"],
                    "description": "Javascript syntax OOP and best programming practices",
                    "etc": "10m",
                    "complete": true,
                },
                {
                    "name": "python",
                    "icon": "python",
                    "title": "Python Syntax",
                    "from": ["vscode"],
                    "description": "Python introduction and differences in syntax. Outlining what python does better and worse.",
                    "etc": "8m",
                    "complete": false,
                },
                {
                    "name": "go",
                    "icon": "go",
                    "title": "Golang Similarities",
                    "from": ["vscode"],
                    "description": "A simple tutorial to get introduce golang and the newest emerging programming language",
                    "etc": "9m",
                    "complete": false,
                },
            ],
            [

                {
                    "name": "js2",
                    "icon": "js",
                    "from": ["js"],
                    "title": "OOP in JavaScript",
                    "description": "Object Oriented Programming and why it is important. How to use it in JavaScript",
                    "etc": "8m",
                    "complete": false,
                },
                {
                    "name": "python2",
                    "icon": "python",
                    "from": ["python"],
                    "title": "OOP in Python",
                    "description": "Object Oriented Programming in Python and Inheritance. A simple illustration of the self method",
                    "etc": "4m",
                    "complete": false,
                },
                {
                    "name": "go2",
                    "icon": "go",
                    "from": ["go"],
                    "title": "OOP in Golang",
                    "description": "Object Oriented Programming in Go and compiled languages. Structs, Types, Classes, and Interfaces",
                    "etc": "5m",
                    "complete": false,
                },



            ],
            [

                {
                    "name": "js3",
                    "icon": "js",
                    "from": ["js2"],
                    "title": "Web Design Principles",
                    "description": "Web design in javascript and an introduction to HTML, CSS, and Node.js",
                    "etc": "7m",
                    "complete": false,
                },
                {
                    "name": "go3",
                    "icon": "go",
                    "from": ["python2"],
                    "title": "Concurrency in Go vs Python",
                    "description": "Concurrency introduction and how it differs in Golang",
                    "etc": "14m",
                    "complete": false,
                },

                {
                    "name": "python3",
                    "icon": "python",
                    "from": ["go2", "python2"],
                    "title": "Multithreading in Python vs Go",
                    "description": "Concurrency introduction and how it differs in Python",
                    "etc": "8m",
                    "complete": false,
                },
            ]
        ],
        "unit2":  [
            [
                {
                    "name": "vscode2",
                    "title": "VS Code Basics",
                    "icon": "vscode",
                    "from": null,
                    "description": "A simple tutorial to get started with VS Code",
                    "etc": "2m",
                    "complete": true,
                }
            ],
            [
                {
                    "name": "js6",
                    "icon": "js",
                    "title": "Intro to JavaScript",
                    "from": ["vscode2"],
                    "description": "Javascript syntax OOP and best programming practices",
                    "etc": "10m",
                    "complete": true,
                },
                {
                    "name": "python6",
                    "icon": "python",
                    "title": "Python Syntax",
                    "from": ["vscode2"],
                    "description": "Python introduction and differences in syntax. Outlining what python does better and worse.",
                    "etc": "8m",
                    "complete": false,
                },
                {
                    "name": "go6",
                    "icon": "go",
                    "title": "Golang Similarities",
                    "from": ["vscode2"],
                    "description": "A simple tutorial to get introduce golang and the newest emerging programming language",
                    "etc": "9m",
                    "complete": false,
                },
            ],
            [

                {
                    "name": "js7",
                    "icon": "js",
                    "from": ["js6"],
                    "title": "OOP in JavaScript",
                    "description": "Object Oriented Programming and why it is important. How to use it in JavaScript",
                    "etc": "8m",
                    "complete": false,
                },
                {
                    "name": "python7",
                    "icon": "python",
                    "from": ["python6"],
                    "title": "OOP in Python",
                    "description": "Object Oriented Programming in Python and Inheritance. A simple illustration of the self method",
                    "etc": "4m",
                    "complete": false,
                },
                {
                    "name": "go7",
                    "icon": "go",
                    "from": ["go6"],
                    "title": "OOP in Golang",
                    "description": "Object Oriented Programming in Go and compiled languages. Structs, Types, Classes, and Interfaces",
                    "etc": "5m",
                    "complete": false,
                },



            ],
            [

                {
                    "name": "js8",
                    "icon": "js",
                    "from": ["js7"],
                    "title": "Web Design Principles",
                    "description": "Web design in javascript and an introduction to HTML, CSS, and Node.js",
                    "etc": "7m",
                    "complete": false,
                },
                {
                    "name": "go8",
                    "icon": "go",
                    "from": ["python6"],
                    "title": "Concurrency in Go vs Python",
                    "description": "Concurrency introduction and how it differs in Golang",
                    "etc": "14m",
                    "complete": false,
                },

                {
                    "name": "python8",
                    "icon": "python",
                    "from": ["go6", "python6"],
                    "title": "Multithreading in Python vs Go",
                    "description": "Concurrency introduction and how it differs in Python",
                    "etc": "8m",
                    "complete": false,
                },
            ]
        ],
        "unit3":  [
            [
                {
                    "name": "vscode3",
                    "title": "VS Code Basics",
                    "icon": "vscode",
                    "from": null,
                    "description": "A simple tutorial to get started with VS Code",
                    "etc": "2m",
                    "complete": true,
                }
            ],
            [
                {
                    "name": "js12",
                    "icon": "js",
                    "title": "Intro to JavaScript",
                    "from": ["vscode3"],
                    "description": "Javascript syntax OOP and best programming practices",
                    "etc": "10m",
                    "complete": true,
                },
                {
                    "name": "python12",
                    "icon": "python",
                    "title": "Python Syntax",
                    "from": ["vscode3"],
                    "description": "Python introduction and differences in syntax. Outlining what python does better and worse.",
                    "etc": "8m",
                    "complete": false,
                },
                {
                    "name": "go12",
                    "icon": "go",
                    "title": "Golang Similarities",
                    "from": ["vscode3"],
                    "description": "A simple tutorial to get introduce golang and the newest emerging programming language",
                    "etc": "9m",
                    "complete": false,
                },
            ],
            [

                {
                    "name": "js13",
                    "icon": "js",
                    "from": ["js12"],
                    "title": "OOP in JavaScript",
                    "description": "Object Oriented Programming and why it is important. How to use it in JavaScript",
                    "etc": "8m",
                    "complete": false,
                },
                {
                    "name": "python13",
                    "icon": "python",
                    "from": ["python12"],
                    "title": "OOP in Python",
                    "description": "Object Oriented Programming in Python and Inheritance. A simple illustration of the self method",
                    "etc": "4m",
                    "complete": false,
                },
                {
                    "name": "go13",
                    "icon": "go",
                    "from": ["go12"],
                    "title": "OOP in Golang",
                    "description": "Object Oriented Programming in Go and compiled languages. Structs, Types, Classes, and Interfaces",
                    "etc": "5m",
                    "complete": false,
                },



            ],
            [

                {
                    "name": "js14",
                    "icon": "js",
                    "from": ["js13"],
                    "title": "Web Design Principles",
                    "description": "Web design in javascript and an introduction to HTML, CSS, and Node.js",
                    "etc": "7m",
                    "complete": false,
                },
                {
                    "name": "go14",
                    "icon": "go",
                    "from": ["python13"],
                    "title": "Concurrency in Go vs Python",
                    "description": "Concurrency introduction and how it differs in Golang",
                    "etc": "14m",
                    "complete": false,
                },

                {
                    "name": "python14",
                    "icon": "python",
                    "from": ["go13", "python13"],
                    "title": "Multithreading in Python vs Go",
                    "description": "Concurrency introduction and how it differs in Python",
                    "etc": "8m",
                    "complete": false,
                },
            ]
        ],


    }


    const unitColors = {
        "unit1": {
            "lighter": "#a7ecbc",
            "light":  "#84E8A2",
            "dark":  "#65a377",
            "button_light": "#70bba1",
            "button_dark": "#268765",
            "button_hover": "#74cd8e",
            "button_active": "#72a996",
        },
        "unit2": {
            "lighter": "#98bff2",
            "light":  "#63a4f8",
            "dark":  "#4684d4",
            "button_light": "#7083bb",
            "button_dark": "#264387",
            "button_hover": "#7496cd",
            "button_active": "#7284a9",
        },
        "unit3": {
            "lighter": "#ddb4fa",
            "light": "#daa6ff",
            "dark": "#ae5ce8",
            "button_light": "#c470ff",
            "button_dark": "#7a26c4",
            "button_hover": "#be74cd",
            "button_active": "#a172a9",
        },
        "unit4": "#ffe2a6"
    }








    // @ts-ignore
    const renderJourneyMap = (data: any, unitName: string, unitDescription: string, unitKey: string) => {
        // @ts-ignore
        const color = unitColors[unitKey]
        let iconData = data
        let drawnLines: Array<{ from: string, to: string, complete: boolean, color: any }> = [];
        iconData.forEach((group: any[], index: number) => {
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
                                color: color
                            });
                        }
                    }
                });
            }
        });

        return (
            <>
                <div style={{
                    borderColor: `${color["light"]}`,
                    borderWidth: '5px',
                    borderStyle: 'solid', // this is necessary to actually show the border
                    borderRadius: '20px', // Material-UI cards have rounded corners
                    padding: '16px', // default padding for Material-UI Cards
                    margin: '20px',
                    backgroundColor: 'transparent', // a card typically has a white background
                    // boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)', // Uncomment for drop shadow like Material-UI cards
                }}>
                    <div style={{
                        backgroundColor: `${color["light"]}`,
                        border: `1px solid ${color["light"]}`,
                        borderRadius: isDropdownVisible === unitName ? '14px 14px 0px 0px' : '14px', // Material-UI Card default border radius
                        margin: '20px',
                        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)', // Material-UI Card default box-shadow
                        padding: '16px', // Default padding for the CardContent
                        overflow: 'visible', // To handle the overflow content
                        // Add any other styles that you want to apply to the div
                    }}>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            style={{ margin: '20px' }}
                        >
                            <Box display="flex" flexDirection="column">
                                <Typography variant="h3" align="left">
                                    {unitName}
                                </Typography>
                                <Typography variant="body1" align="left">
                                    {unitDescription}
                                </Typography>
                            </Box>
                            <div style={{ position: 'relative' }}>
                                <AwesomeButton
                                    style={{
                                        width: "20em",
                                        height: "4em",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        '--button-default-height': '68px',
                                        '--button-default-font-size': '14px',
                                        '--button-default-border-radius': '20px',
                                        '--button-horizontal-padding': '3px',
                                        '--button-raise-level': '3px',
                                        '--button-hover-pressure': '0',
                                        '--transform-speed': '0.275s',
                                        '--button-primary-color': `${color["lighter"]}`,
                                        '--button-primary-color-dark': `${color["dark"]}`,
                                        '--button-primary-color-light': '#d4d9e4',
                                        '--button-primary-color-hover': `${color["button_hover"]}`,
                                        '--button-primary-color-active': `${color["button_active"]}`,
                                        '--button-primary-border': '0px solid #FFFFFF',
                                        '--button-secondary-color': '#fffc6c',
                                        '--button-secondary-color-dark': '#b9b500',
                                        '--button-secondary-color-light': '#6c6a00',
                                        '--button-secondary-color-hover': '#fffb3e',
                                        '--button-secondary-color-active': '#faf75f',
                                        '--button-secondary-border': 'none',
                                        '--button-anchor-color': '#f3c8ad',
                                        '--button-anchor-color-dark': '#734922',
                                        '--button-anchor-color-light': '#4c3016',
                                        '--button-anchor-color-hover': '#f1bfa0',
                                        '--button-anchor-border': '1px solid #8c633c',
                                    }}
                                    onPress= {(e: any) => handleClick(e, unitName)}

                                >
                                    <MenuIcon />
                                    <Typography variant="h6" align="right" color="white" style={{ marginLeft: '10px' }}>
                                        Unit Guide
                                    </Typography>
                                </AwesomeButton>
                                {isDropdownVisible === unitName && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%', // Position right below the button
                                            left: "-70.7%",
                                            height: "500%",
                                            marginTop: "30px",
                                            transform: 'translateX(-50%)', // Center it horizontally
                                            width: '367.8%', // Set width to half of the parent's size
                                            zIndex: 10, // Ensure it's above other content
                                            backgroundColor: `${hexToRGBA(color["light"], .5)}`, // Semi-transparent background
                                            borderColor: `${color["light"]}`,
                                            borderRadius: '0px 0px 14px 14px',
                                            overflow: 'visible', // Ensure that dropdown content isn't clipped
                                            padding: '16px',
                                            // Apply a blur effect to the background
                                            backdropFilter: 'blur(14px)',
                                            WebkitBackdropFilter: 'blur(14px)', // For Safari compatibility
                                            // Any additional styling
                                        }}
                                    >


                                            {/* Content that was inside your CardContent */}
                                            <h3 style={{
                                                marginTop: "50px",
                                                fontSize: '1.5rem', // h5 equivalent font size
                                                fontWeight: '400', // Normal font weight for h5
                                                lineHeight: 'normal', // Ensure the line height is normal for the text block
                                                alignSelf: 'flex-end', // Align self at the end of the flex container on cross axis
                                            }}>
                                                Dive into the essential components of backend development in this comprehensive introductory course. Designed for aspiring developers or those interested in understanding the server-side mechanics of web applications, this course covers the fundamental concepts and technologies that form the backbone of the internet.
                                            </h3>

                                        {/* Add more content or menu items as needed */}
                                    </div>
                                )}
                            </div>
                        </Box>
                        {/* ... rest of your component */}
                    </div>
                    <Grid
                        container
                        key={"journey-map"}
                        spacing={3}
                        style={{
                            marginTop: "50px",
                        }}
                    >
                        {
                            iconData.map((group: any[], index: number) => {
                                let rowWidth = 12 / group.length;
                                return (
                                    group.map((icon) => {
                                        let from = null;
                                        if (index > 0) {
                                            from = icon.from;
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
                                                    {/* The `generalButton` function needs to be defined or imported */}
                                                    {generalButton(icon.icon, icon.complete, icon.title, icon.description, icon.etc, unitKey, color)}
                                                </div>
                                            </Grid>
                                        );
                                    })
                                );
                            })
                        }
                    </Grid>
                    <div>
                        {drawnLines.map((line, index) => (
                            <LineBetweenElements key={index} fromId={line.from} toId={line.to} complete={line.complete} color={color} />
                        ))}
                    </div>
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
                    {renderJourneyMap(units["unit1"], "Unit 1", "Begin learning a variety of languages and syntax", "unit1")}
                    {renderJourneyMap(units["unit2"], "Unit 2", "Begin learning a variety of languages and syntax", "unit2")}
                    {renderJourneyMap(units["unit3"], "Unit 3", "Begin learning a variety of languages and syntax", "unit3")}
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

