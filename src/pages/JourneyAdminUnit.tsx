import React, {useEffect, useState} from "react";
import {
    Accordion, AccordionDetails, AccordionSummary, Box,
    Button, Card, CardContent,
    Chip, Container,
    createTheme, CssBaseline, Grid,
    PaletteMode, Paper, ThemeProvider, Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {selectAuthStateRole} from "../reducers/auth/auth";
import {useParams} from "react-router";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from "@mui/icons-material/Add";
import {AwesomeButton} from "react-awesome-button";
import MenuIcon from "@mui/icons-material/Menu";
import completedNoCircle from "../components/Icons/joruneyMainAssets/journey-completed-no-cirlce.svg";
import vscodeNoCircle from "../components/Icons/joruneyMainAssets/journey-vscode-no-cirlce.svg";
import vscodeNoCircleBlue from "../components/Icons/joruneyMainAssets/journey-vscode-no-cirlce-blue.svg";
import vscodeNoCirclePurple from "../components/Icons/joruneyMainAssets/journey-vscode-no-cirlce-purple.svg";
import javascriptNoCircle from "../components/Icons/joruneyMainAssets/journey-javascript-no-cirlce.svg";
import javascriptNoCircleBlue from "../components/Icons/joruneyMainAssets/journey-javascript-no-cirlce-blue.svg";
import javascriptNoCirclePurple from "../components/Icons/joruneyMainAssets/journey-javascript-no-cirlce-purple.svg";
import pythonNoCircle from "../components/Icons/joruneyMainAssets/journey-python-no-cirlce.svg";
import pythonNoCircleBlue from "../components/Icons/joruneyMainAssets/journey-python-no-cirlce-blue.svg";
import pythonNoCirclePurple from "../components/Icons/joruneyMainAssets/journey-python-no-cirlce-purple.svg";
import golangNoCircle from "../components/Icons/joruneyMainAssets/journey-golang-no-cirlce.svg";
import golangNoCircleBlue from "../components/Icons/joruneyMainAssets/journey-golang-no-cirlce-blue.svg";
import golangNoCirclePurple from "../components/Icons/joruneyMainAssets/journey-golang-no-cirlce-purple.svg";
import {useNavigate} from "react-router-dom";

function JourneyAdminUnit() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const adminStatus = useAppSelector(selectAuthStateRole)

    // make sure user is admin, if not, redirect to home
    useEffect(() => {
        if (adminStatus !== 1) {
            window.location.href = "/home"
        }
    }, [])

    let { id } = useParams();
    const queryParams = new URLSearchParams(window.location.search)

    const navigate = useNavigate();

    const testUnit = {
        title: "Advanced React Patterns",
        focus: "Frontend",
        tags: ["React", "UI", "Advanced", "Design Patterns"],
        tier: "Renown 8",
        description: "This unit explores advanced design patterns in React, focusing on creating reusable components and efficient data handling. We'll cover Context, Render Props, Higher Order Components, and more.",
        projects: [
            {
                name: "Context API Integration",
                language: "JavaScript",
                dependencies: ["none"],
                details: "An in-depth project to integrate the Context API for state management in a complex application.",
            },
            {
                name: "Reusable Component Library",
                language: "TypeScript",
                dependencies: ["Context API Integration"],
                details: "Developing a library of reusable components implementing various design patterns.",
            },
            {
                name: "Performance Optimization",
                language: "JavaScript",
                dependencies: ["Context API Integration, Reusable Component Library"],
                details: "A project focused on optimizing the performance of large-scale React applications.",
            }
        ]
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



    const [isDropdownVisible, setIsDropdownVisible] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
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
                </div>
            </>
        )
    }


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Grid container spacing={2} justifyContent="center">
                    {/* Title */}
                    <Grid item xs={12}>
                        <Typography variant="h3" align="center" gutterBottom>
                            {testUnit.title}
                        </Typography>
                    </Grid>

                    {/* Unit Focus, Tags, and Tier */}
                    <Grid item container xs={12} md={8} spacing={2} direction="column">
                        <Grid item>
                            <Paper elevation={3} sx={{ padding: 2 }}>
                                <Typography variant="h5">Unit Focus</Typography>
                                <Typography variant="body1">{testUnit.focus}</Typography>
                            </Paper>
                        </Grid>

                        <Grid item>
                            <Typography variant="h5">Tags</Typography>
                            <Grid container spacing={1}>
                                {testUnit.tags.map((tag, index) => (
                                    <Grid item key={index}>
                                        <Chip label={tag} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        <Grid item>
                            <Paper elevation={3} sx={{ padding: 2 }}>
                                <Typography variant="h5">Tier</Typography>
                                <Typography variant="body1">{testUnit.tier}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={3} sx={{ padding: 2 }}>
                            <Typography variant="h5">Description</Typography>
                            <Typography variant="body1">{testUnit.description}</Typography>
                        </Paper>
                    </Grid>

                    {/* Projects */}
                    <Grid item xs={12} md={8}>
                        <Grid item container xs={12} md={12} justifyContent="space-between" alignItems="center" sx={{ paddingTop: 2 }}>
                            <Grid item>
                                <Typography variant="h5">Projects</Typography>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" color="primary" startIcon={<AddIcon />} href="/journey/admin/create?project">
                                    Add Project
                                </Button>
                            </Grid>
                        </Grid>
                        {testUnit.projects.map((project, index) => (
                            <Accordion key={index}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">{project.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body1">Language: {project.language}</Typography>
                                    <Typography variant="body1">Dependencies: {project.dependencies.join(', ')}</Typography>
                                    <Button variant="contained" sx={{ float: 'right' }} href={`/journey/admin/project/${1}`}>
                                        Project Details
                                    </Button>
                                    <Button variant="outlined" color={"error"} sx={{ float: 'right'}}>
                                        Remove from Unit
                                    </Button>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Grid>
                </Grid>
            </CssBaseline>
            {/*<Container maxWidth="lg" style={{ paddingTop: '20px' }}>*/}
            {/*    <Typography variant="h1" align="center">*/}
            {/*        Journey*/}
            {/*    </Typography>*/}
            {/*    <div style={{ position: 'relative' }}>*/}
            {/*        {renderJourneyMap(units["unit1"], "Unit 1", "Begin learning a variety of languages and syntax", "unit1")}*/}
            {/*    </div>*/}
            {/*</Container>*/}
        </ThemeProvider>
    )
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

export default JourneyAdminUnit;
