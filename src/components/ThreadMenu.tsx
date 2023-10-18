import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface IProps {
    handleSelectBool: (arg: boolean) => void,
    handleCommentSelect: (arg: boolean) => void,
}


export default function ThreadMenu(props: IProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelectChange = () => {
        setAnchorEl(null);
        props.handleSelectBool(true)
        return true;
    };

    const handleCommentSelect = () => {
        setAnchorEl(null);
        props.handleCommentSelect(true)
        return true;
    };

    return (
        <div>
            <Button
                id="demo-positioned-button"
                aria-controls={open ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                ...
            </Button>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <MenuItem onClick={handleSelectChange}>Reply In Thread</MenuItem>
                <MenuItem onClick={handleCommentSelect}>Reply</MenuItem>
            </Menu>
        </div>
    );
}