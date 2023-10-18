import * as React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    createTheme,
    CssBaseline,
    IconButton,
    PaletteMode,
    ThemeProvider,
    Tooltip,
    Typography
} from "@mui/material";
import {themeHelpers, getAllTokens} from "../theme";
import BroadcastMessage from "../models/broadcastMessage";
import Notification from "../models/notification";
import {styled} from "@mui/material/styles";
import call from "../services/api-call";
import config from "../config";
import {
    selectAuthStateAuth,
} from "../reducers/auth/auth";
import swal from "sweetalert";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import {useAppDispatch, useAppSelector} from "../app/hooks";
import SendBroadcastPopup from "./SendBroadcastPopup";
import NotificationPopup from "./NotificationPopup";
import randomColor from "randomcolor";
import MarkdownRenderer from "./Markdown/MarkdownRenderer";
import Scrollbars from "react-custom-scrollbars";
import { Buffer } from 'buffer';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

interface IProps {
    width: number | string,
    height: number | string,
    handleClick: () => void,
}

export default function BroadcastPopup(props: IProps) {
    // retrieve theme from local storage
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [opened, setOpened] = React.useState(false);
    const [openSendBroadcastPopup, setOpenSendBroadcastPopup] = React.useState(false);
    const [messages, setMessages] = React.useState<BroadcastMessage[]>([]);
    const chatContainerRef = React.useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [notificationCount, setNotificationCount] = React.useState<number>(0);

    const authState = useAppSelector(selectAuthStateAuth);

    const BroadcastButton = styled(IconButton)({
        position: 'fixed',
        right: 0,
        top: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontSize: '2rem',
        transform: 'translateY(-50%)',
    });

    interface Message {
        id: number;
        user_id: string;
        message: string;
    }

    const handleGetMessages = async () => {
        setMessages([])
        let res = await call(
            "/api/broadcast/get",
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

        if (res["broadcast_messages"] === undefined) {
            if (res["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            swal("Server Error", res["message"])
            return
        }

        setMessages(res["broadcast_messages"])
    }

    const getNotifications = async () => {
        if (!authState) {
            setNotifications([])
            return;
        }

        setNotifications([])
        let res = await call(
            "/api/notification/get",
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

        if (res["notifications"] === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        setNotifications(res["notifications"])
        setNotificationCount(res["notifications"].length)
    }

    const checkBroadcast = async () => {
        let res = await call(
            "/api/broadcast/check",
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
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["message"] === "Has Broadcast") {
            setOpenSendBroadcastPopup(true)
        } else {
            return;
        }
    }

    const revertBroadcast = async () => {
        let res = await call(
            "/api/broadcast/revert",
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
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["message"] !== "Revert Successful") {
            console.log("problem with reverting broadcast")
        }
    }

    const handleSendBroadcastClose = () => {
        setOpenSendBroadcastPopup(false);
        revertBroadcast()
    };

    const MessageBox = styled(Box)({
        position: 'fixed',
        right: 0,
        top: '53vh',
        transform: 'translateY(-50%)',
        backgroundColor: `transparent`,
        padding: '10px',
        borderRadius: '5px',
        zIndex: 999,
        transition: 'right 0.3s ease-in-out',
        width: '33vw',
        height: '92vh',

        '& ::-webkit-scrollbar': {
            width: '8px',
        },
        '& ::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
        },
        '& ::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: '4px',
        },
        '& ::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(255,255,255,0.7)',
        }
    });

    const Message = ({message, userName}: { message: string, userName: string }) => {
        // message from user in global chat thread
        return (
            <Card
                sx={{
                    display: 'flex',
                    padding: '10px',
                    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.4)',
                    borderRadius: '10px',
                    marginBottom: '10px',
                    border: "1px solid rgba(255,255,255,0.18)",
                    backgroundColor: "rgba(56,59,63,0.9)"
                }}
            >
                <CardContent>
                    <Typography variant="body1" gutterBottom>
                        <strong style={{color: randomColor()}}>{userName}: </strong>
                    </Typography>
                    <MarkdownRenderer markdown={message} style={{ color: `primary`, fontSize: "17px", fontWeight: "bold" }}/>
                </CardContent>
            </Card>
        );
    };

    const handleButtonClick = () => {
        if (opened) {
            setOpened(false)
        } else {
            handleGetMessages();
            setOpened(true)
        }
    };

    React.useEffect(() => {
        handleGetMessages();
        getNotifications();
        checkBroadcast();
    }, []);

    React.useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [opened]);

    React.useEffect(() => {
    }, [openSendBroadcastPopup]);


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <NotificationPopup
                    notificationCount={notificationCount}
                    notifications={notifications}
                    setNotifications={setNotifications}
                    setNotificationCount={setNotificationCount}
                />
                {openSendBroadcastPopup && (
                    <SendBroadcastPopup onClose={() => handleSendBroadcastClose()} />
                )}
                <BroadcastButton
                    onClick={() => handleButtonClick()}
                >
                    <Tooltip
                        title={"Broadcast Messages"}
                    >
                        <KeyboardDoubleArrowLeftIcon style={{color: theme.palette.primary.contrastText}} fontSize={"large"}/>
                    </Tooltip>
                </BroadcastButton>
                <Box>
                    {opened ? (
                        <MessageBox ref={chatContainerRef} style={{ right: opened ? 0 : '-100%' }}>
                            <Box sx={{
                                position: `relative`,
                                boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                                borderRadius: "25px",
                                width: "30vw",
                                height: "92vh",
                                ...themeHelpers.MoreTransparentFrostedGlass,
                                overflowY: "scroll",
                                paddingRight: "1%",
                            }}>
                                <div style={{
                                    overflowY: "hidden",
                                }}>
                                    <div style={{margin: "1px"}}>
                                        <div style={{height: "10px"}}/>
                                        {messages.slice().reverse().map((message) => (
                                            <Message
                                                key={message._id}
                                                message={message.message}
                                                userName={message.user_name}
                                            />
                                        ))}
                                        <div style={{ marginBottom: "20px" }} />
                                    </div>
                                </div>
                            </Box>
                        </MessageBox>
                    ) : null
                    }
                </Box>
            </CssBaseline>
        </ThemeProvider>
    )
}


BroadcastPopup.defaultProps = {width: '40%', height: '40%'}