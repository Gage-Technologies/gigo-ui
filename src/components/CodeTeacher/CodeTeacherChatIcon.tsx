import React, { useState } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'; // Assuming you want to use a button for closing the Popover
import CTIcon from '../../img/codeTeacher/CT-icon.svg';

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
            >
                <Typography sx={{ p: 2 }}>
                    I am Code Teacher, a programming expert and educator dedicated to helping developers improve their coding skills and understand their code better.
                </Typography>
                <Button onClick={handleClose}>Close</Button>
            </Popover>
        </div>
    );
}

export default CodeTeacherChatIcon;
