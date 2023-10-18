import React, { useState, ChangeEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import {List, SelectChangeEvent} from "@mui/material";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import Input from "@material-ui/core/Input";
import Post from "../models/post";

interface AddCuratedProjectPopupProps {
    open: boolean;
    onClose: () => void;
    onProjectAdded: () => void;
}

const AddCuratedProjectPopup: React.FC<AddCuratedProjectPopupProps> = ({ open, onClose, onProjectAdded }) => {
    const [selectedProficiencies, setSelectedProficiencies] = useState<number[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<number | string>('');
    const [projects, setProjects] = useState<Post[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const searchProjects = async (q: string) => {
        let projects = await call(
            "/api/search/simplePost",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                query: q
            },
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            projects
        ])

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["posts"] === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        setProjects(res["posts"])
    };

    const addCuratedProject = async () => {
        let res = await call(
            "/api/curated/add",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                post_id: selectedProject,
                proficiency_type: selectedProficiencies,
                language: selectedLanguage
            },
            null,
            config.rootPath
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["message"] === undefined) {
            swal("Server Error", res["message"])
            return
        }

        if (res["message"] === "Failed to remove curated project") {
            swal("\"Failed to add curated project")
            return
        }

        if (res["message"] === "Added curated project successfully") {
            swal("Added curated project successfully")
            onProjectAdded();
            return
        }
    }

    const handleProficiencyChange = (event: SelectChangeEvent<number[]>) => {
        setSelectedProficiencies(event.target.value as number[]);
    };

    const handleLanguageChange = (event: SelectChangeEvent<number | string>) => {
        setSelectedLanguage(event.target.value as number | string);
    };

    const handleProjectSelect = (projectId: string) => {
        if (selectedProject === projectId) {
            setSelectedProject(null);
        } else {
            setSelectedProject(projectId);
        }
    };

    const proficiencyTypes = [
        'Beginner',
        'Intermediate',
        'Advanced'
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth={true}
            PaperProps={{
                style: {
                    width: '70%',
                    height: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            <DialogTitle>Add Curated Project</DialogTitle>
            <DialogContent style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Input
                    type="text"
                    placeholder="Search projects..."
                    onChange={(e) => searchProjects(e.target.value)}
                    style={{ marginBottom: '16px' }}
                />
                <div style={{ overflow: 'auto', height: '35%', flex: 1 }}>
                    <List>
                        {projects.map(project => (
                            <MenuItem
                                key={project._id}
                                onClick={() => handleProjectSelect(project._id)}
                                style={{ display: 'flex', alignItems: 'center', padding: '10px 16px' }}
                            >
                                <div style={{ marginRight: '10px' }}>
                                    <img
                                        src={config.rootPath + project.thumbnail}
                                        alt={`${project.title} profile`}
                                        style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                                    />
                                </div>
                                <Checkbox checked={selectedProject === project._id} />
                                <ListItemText primary={project.title} />
                            </MenuItem>
                        ))}
                    </List>
                </div>
                <FormControl style={{ width: '100%', marginBottom: `2%`, marginTop: "2%"}}>
                    <InputLabel>Proficiency Type</InputLabel>
                    <Select
                        multiple
                        value={selectedProficiencies}
                        onChange={handleProficiencyChange}
                        renderValue={(selected) => (selected as number[]).map(idx => proficiencyTypes[idx]).join(', ')}
                    >
                        {proficiencyTypes.map((name, index) => (
                            <MenuItem key={name} value={index}>
                                <Checkbox checked={selectedProficiencies.indexOf(index) > -1} />
                                <ListItemText primary={name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl style={{ width: '100%'}}>
                    <InputLabel>Programming Language</InputLabel>
                    <Select value={selectedLanguage} onChange={handleLanguageChange}>
                        <MenuItem value={6}>Go</MenuItem>
                        <MenuItem value={5}>Python</MenuItem>
                        <MenuItem value={3}>JavaScript</MenuItem>
                        <MenuItem value={4}>Typescript</MenuItem>
                        <MenuItem value={14}>Rust</MenuItem>
                        <MenuItem value={2}>Java</MenuItem>
                        <MenuItem value={10}>C#</MenuItem>
                        <MenuItem value={32}>SQL</MenuItem>
                        <MenuItem value={27}>HTML</MenuItem>
                        <MenuItem value={12}>Swift</MenuItem>
                        <MenuItem value={7}>Ruby</MenuItem>
                        <MenuItem value={8}>C++</MenuItem>
                        <MenuItem value={1}>Other</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={() => {
                        addCuratedProject();
                        onClose();
                    }}
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddCuratedProjectPopup;
