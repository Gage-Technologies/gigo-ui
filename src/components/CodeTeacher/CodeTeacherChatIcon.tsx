import React, { useState } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'; // Assuming you want to use a button for closing the Popover
import CTIcon from '../../img/codeTeacher/CT-icon.svg';
import {Box} from "@mui/material";

function CodeTeacherChatIcon(props: any) {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'code-teacher-popover' : undefined;

    return (
        <div style={{ ...props.style }}>
            <img
                alt="Code Teacher"
                src={CTIcon}
                style={{ cursor: 'pointer', ...props.style }}
                onClick={handleClick}
            />
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={{
                    transform: 'translateY(-40px) translateX(10px)',
                }}
            >
                <Box sx={{ p: 2, maxWidth: 240, background: 'linear-gradient(0deg, rgba(34,117,85,1) 30%, rgba(30,81,135,1) 90%)' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 2 }}>
                        <img alt="Code Teacher" src={CTIcon} style={{ width: 80, height: 80}} />
                        <Typography variant="h5">Code Teacher</Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                        I am Code Teacher, a programming expert and educator dedicated to helping developers improve their coding skills and understand their code better.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 2 }}>
                        <Typography variant="h6">
                            Want the best features?
                        </Typography>
                        <Button variant="contained" color="primary" fullWidth href={"/premium"}>
                            Get Pro
                        </Button>
                    </Box>
                </Box>
            </Popover>
        </div>
    );
}

export default CodeTeacherChatIcon;
