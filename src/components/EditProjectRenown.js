import React, { useState } from 'react';
import { Chip, List, ListItem, IconButton } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import HorseIcon from "./Icons/Horse";
import HoodieIcon from "./Icons/Hoodie";
import TrophyIcon from "./Icons/Trophy";
import GraduationIcon from "./Icons/Graduation";
import {QuestionMark} from "@mui/icons-material";

function ProjectRenown({ originalLabel, onProjectSelect}) {
    const [selectedProject, setSelectedProject] = useState(originalLabel);
    const [isOpen, setIsOpen] = useState(false);

    const projects = [
        1,2,3,4,5,6,7,8,9,10
    ];

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

    return (
        <div>
            <Chip
                label={selectedProject}
                color="primary"
                variant="outlined"
                deleteIcon={isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                onDelete={handleToggle}
                clickable
            />
            {isOpen && (
                <List component="nav" style={{ maxHeight: '150px', overflow: 'auto' }}>
                    {projects.map((project, index) => (
                        <ListItem button key={index} onClick={() => handleSelect(project)}>
                            <Chip
                                label={project}
                                color="primary"
                                variant="outlined"
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
}

export default ProjectRenown;