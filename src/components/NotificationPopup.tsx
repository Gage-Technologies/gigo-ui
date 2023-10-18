import React, { useState } from "react";
import CircleNotificationsIcon from "@mui/icons-material/CircleNotifications";
import {
    Box,
    Button,
    ClickAwayListener, createTheme,
    Grow, IconButton,
    MenuItem,
    MenuList, PaletteMode,
    Paper,
    Popper, Tooltip, Typography,
} from "@mui/material";
import Notification from "../models/notification";
import CloseIcon from '@material-ui/icons/Close';
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {initialAuthStateUpdate, updateAuthState} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import {getAllTokens} from "../theme";
import NotificationsPausedIcon from '@mui/icons-material/NotificationsPaused';


interface IProps {
    notificationCount: number;
    notifications: Notification[];
    setNotifications: (notifications: Notification[]) => void;
    setNotificationCount: (notificationCount: number) => void;
}

const NotificationPopup: React.FC<IProps> = ({
    notificationCount,
    notifications,
    setNotifications,
    setNotificationCount,
}) => {

    const [open, setOpen] = useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    let navigate = useNavigate();

    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const acknowledgeNotification = async (notification_id: string) => {
        let res = await call(
            "/api/notification/acknowledge",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                notification_id: notification_id,
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

        if (res["message"] !== "Notification acknowledged") {
            swal("We seem to be having trouble clearing your notification. Sorry for the inconvenience!")
            return
        }

    }

    const clearAllNotifications = async () => {
        let res = await call(
            "/api/notification/clearAll",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {},
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

        if (res["message"] !== "Notifications cleared") {
            swal("We seem to be having trouble clearing your notification. Sorry for the inconvenience!")
            return
        }

        setOpen(false);
        setNotificationCount(0);
        setNotifications([]);
    }

    const handleNotificationClose = (notifId: string, event?: React.MouseEvent) => {
        event?.stopPropagation();

        const updatedNotifications = notifications.filter(notification => notification._id !== notifId);
        setNotifications(updatedNotifications);
        setNotificationCount(notificationCount - 1);

        acknowledgeNotification(notifId)
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
            return;
        }
        setOpen(false);
    };

    const handleNotificationNavigate = (event: React.MouseEvent<HTMLLIElement, MouseEvent> | React.TouchEvent<HTMLLIElement>, notificationType : number, notifId: string) => {
        if (notificationType === 0) {
            // add a navigate to friends page once available
            navigate("/profile")
            handleNotificationClose(notifId)
        } else if (notificationType === 1) {
            acknowledgeNotification(notifId)
            navigate("/nemesis")
            handleNotificationClose(notifId)
        } else if (notificationType === 2) {
            acknowledgeNotification(notifId)
            navigate("/nemesis")
            handleNotificationClose(notifId)
        } else if (notificationType === 3) {
            acknowledgeNotification(notifId)
            navigate("/streak")
            handleNotificationClose(notifId)
        } else {
            acknowledgeNotification(notifId)
            console.log("Unknown notification type: " + notificationType)
            handleNotificationClose(notifId)
        }
    };

    return (
        <Box>
            <Button
                ref={anchorRef}
                color="inherit"
                onClick={handleToggle}
                startIcon={
                    notificationCount > 0 ? (
                        <Box
                            sx={{
                                alignItems: "center",
                                justifyContent: "center",
                                height: "16px",
                                width: "16px",
                                borderRadius: "50%",
                                backgroundColor: `tomato`,
                            }}
                        >
                            <Typography component={"div"} variant={"h6"} sx={{
                                fontSize: "12px",
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                {notificationCount > 99 ? "99+" : notificationCount}
                            </Typography>
                        </Box>
                    ) : (<></>)
                }
                sx={{
                    "& .MuiSvgIcon-root": {
                        fontSize: "30px"
                    }
                }}
            >
                <CircleNotificationsIcon style={{color: theme.palette.primary.contrastText}}/>
            </Button>
            <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === "bottom" ? "center top" : "center bottom",
                        }}
                    >
                        <Paper sx={{ width: "115%" }}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <Box>
                                    {notifications.length > 0 ? (
                                        <Box sx={{textAlign: "center", paddingTop: "10px", paddingBottom: "3px"}}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={clearAllNotifications}
                                                size={"medium"}
                                            >
                                                Clear All
                                            </Button>
                                        </Box>
                                    ) :
                                        <Box sx={{textAlign: "center", paddingTop: "10px", paddingBottom: "3px", flexDirection: "column", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                        No Notifications!
                                            <NotificationsPausedIcon fontSize={"large"} style={{color: theme.palette.primary.contrastText, opacity: 0.2}}/>
                                        </Box>
                                    }
                                    <MenuList autoFocusItem={open} id="menu-list-grow">
                                        {notifications.map((notification, index) => (
                                            <MenuItem
                                                key={index}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    paddingRight: "40px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    wordBreak: "break-all",
                                                    maxWidth: "30ch",
                                                    backgroundColor: "transparent",
                                                    borderColor: `ActiveBorder`,
                                                    borderWidth: "2px",
                                                    borderStyle: "solid",
                                                    margin: "10px 0",
                                                    borderRadius: "10px",
                                                    padding: "5px",
                                                }}
                                                onClick={(event) => handleNotificationNavigate(event, notification.notification_type, notification._id)}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "text.primary",
                                                        fontSize: "16px",
                                                        fontStyle: `normal`,
                                                    }}
                                                >
                                                    {notification.message}
                                                </Typography>
                                                <IconButton
                                                    edge="end"
                                                    color="inherit"
                                                    size="small"
                                                    onClick={(event) => {
                                                        event.stopPropagation(); // This stops MenuItem Onclick from overriding close icon Onclick
                                                        handleNotificationClose(notification._id);
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        zIndex: 1000
                                                    }}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </Box>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    );
};

export default NotificationPopup;