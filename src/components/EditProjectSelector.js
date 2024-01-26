import React, { useState } from 'react';
import { Chip, List, ListItem, IconButton } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import HorseIcon from "./Icons/Horse";
import HoodieIcon from "./Icons/Hoodie";
import TrophyIcon from "./Icons/Trophy";
import GraduationIcon from "./Icons/Graduation";
import DebugIcon from "./Icons/Debug";
import {QuestionMark} from "@mui/icons-material";
import {getAllTokens} from "../theme";
import {
    createTheme,
} from "@mui/material";

function ProjectSelector({ originalLabel, onProjectSelect, theme, style = {}}) {

    // let userPref = localStorage.getItem('theme')
    // //@ts-ignore
    // const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    // const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    // let userPref = localStorage.getItem('theme')
    //
    // const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    // const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [selectedProject, setSelectedProject] = useState(originalLabel);
    const [isOpen, setIsOpen] = useState(false);

    const projects = [
        "Playground",
        "Casual",
        "Competitive",
        "Interactive",
        "Debug"
    ];

    const listStyle = {
        maxHeight: '150px',
        overflow: 'auto',
        background: theme.palette.background.default, // Make sure this color is opaque
        borderRadius: "15px",
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Optional: added for better visibility
        zIndex: 2000
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (project) => {
        console.log("1: ", project)
        setSelectedProject(project);
        console.log("y")
        setIsOpen(false);
        console.log("k")
        onProjectSelect(project)
        console.log("l")
    };

    const getProjectIcon = (projectType) => {
        switch (projectType) {
            case "Playground":
                return (
                    <HorseIcon sx={{width: "24px", height: "24px"}} />
                )
            case "Casual":
                return (
                    <HoodieIcon sx={{width: "20px", height: "20px"}} />
                )
            case "Competitive":
                return (
                    <TrophyIcon sx={{width: "18px", height: "18px"}} />
                )
            case "Interactive":
                return (
                    <GraduationIcon sx={{width: "20px", height: "20px"}} />
                )
            case "Debug":
                return (
                    <DebugIcon sx={{width: "20px", height: "20px"}} />
                )
            default:
                return (
                    <QuestionMark sx={{width: "20px", height: "20px"}} />
                )
        }
    }

    console.log("theme is: ", theme)

    return (
        <div>
            <Chip
                label={selectedProject || "Select a project"}
                color="primary"
                variant="outlined"
                icon={getProjectIcon(selectedProject)}
                deleteIcon={isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                onDelete={handleToggle}
                clickable
            />
            {isOpen && (
                <List component="nav" style={{...listStyle, ...style}}>
                    {projects.map((project, index) => (
                        <ListItem button key={index} onClick={() => handleSelect(project)}>
                            <Chip
                                label={project}
                                color="primary"
                                variant="outlined"
                                icon={getProjectIcon(project)}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
}

export default ProjectSelector;
