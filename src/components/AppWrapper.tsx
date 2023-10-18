

import * as React from 'react';
import LoginIcon from '@mui/icons-material/Login';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from '@mui/icons-material/Add';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import HomeIcon from "@mui/icons-material/Home";
import FlareIcon from '@mui/icons-material/Flare';
import Drawer from "@mui/material/Drawer";
import {styled} from "@mui/material/styles";
import {useNavigate} from "react-router-dom";
import {AppBarProps as MuiAppBarProps} from "@mui/material/AppBar/AppBar";
import {BoxProps as MuiBoxProps} from "@mui/material/Box/Box";
import {AwesomeButton} from "react-awesome-button";
import 'react-awesome-button/dist/styles.css';
import premiumImage from "../img/croppedPremium.png"
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    Button, Container,
    createTheme,
    CssBaseline,
    Icon,
    ListItemButton,
    Menu, Modal,
    PaletteMode, TextField,
    ThemeProvider,
    Tooltip,
} from "@mui/material";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import FeedIcon from '@mui/icons-material/Feed';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FolderIcon from '@mui/icons-material/Folder';
import UserIcon from "./UserIcon";
import {themeHelpers, getAllTokens, isHoliday} from "../theme";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import TopSearchBar from "./TopSearchBar";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {
    initialAuthStateUpdate,
    selectAuthState,
    selectAuthStateBackgroundName,
    selectAuthStateColorPalette, selectAuthStateExclusiveAgreement,
    selectAuthStateThumbnail, selectAuthStateTutorialState,
    selectAuthStateUserName,
    updateAuthState,
} from "../reducers/auth/auth";
import {isChrome} from "react-device-detect";
import {LocalFireDepartment} from "@mui/icons-material";
import {Icon as IconifyIcon} from "@iconify/react";
import {persistStore} from "redux-persist";
import {store} from "../app/store"
import candycane from "../img/candycane.svg"
import usflag from "../img/us_flag.svg"
import Snowfall from "react-snowfall";
import Confetti from "react-confetti";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ChatContainer from "./Chat/ChatContainer";
import {
    initialAppWrapperStateUpdate,
    resetAppWrapper, selectAppWrapperChatOpen,
    selectAppWrapperSidebarOpen,
    updateAppWrapper
} from "../reducers/appWrapper/appWrapper";
import {clearProjectState} from "../reducers/createProject/createProject";
import {clearSearchParamsState} from "../reducers/searchParams/searchParams";
import {clearJourneyFormState} from "../reducers/journeyForm/journeyForm";
import {
    AccountBoxOutlined,
    BookmarkBorderOutlined, ChatBubbleOutline,
    FolderOutlined,
    HomeOutlined,
    InfoOutlined
} from "@material-ui/icons";
import Notification from "../models/notification";
import NotificationPopup from "./NotificationPopup";
import {clearCache} from "../reducers/pageCache/pageCache";
import {LoadingButton} from "@mui/lab";
import {useParams} from "react-router";
import CloseIcon from "@material-ui/icons/Close";
import {clearChatState} from "../reducers/chat/chat";
import {clearMessageCache} from "../reducers/chat/cache";


interface IProps {
};


export default function AppWrapper(props: React.PropsWithChildren<IProps>) {
    const drawerWidth = 200;

    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
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

    // retrieve the query params from the url
    const query = new URLSearchParams(window.location.search);

    const dispatch = useAppDispatch();

    let loggedIn = false
    const authState = useAppSelector(selectAuthState);
    if (authState.authenticated !== false) {
        loggedIn = true
    }

    let homePageLockedDrawer = (
        loggedIn &&
        (
            (window.location.pathname === '/home' || window.location.pathname === '/home/' ||
            window.location.pathname === '' || window.location.pathname === '/') && window.innerWidth > 1000
        )
    )

    const handleTheme = () => {
        colorMode.toggleColorMode();
        localStorage.setItem('theme', mode === 'light' ? "dark" : 'light')
        window.location.reload()
    };

    const queryParams = new URLSearchParams(window.location.search)

    const thumbnail = useAppSelector(selectAuthStateThumbnail);
    const exclusiveAgreement = useAppSelector(selectAuthStateExclusiveAgreement);
    const colorPalette = useAppSelector(selectAuthStateColorPalette);
    const backgroundName = useAppSelector(selectAuthStateBackgroundName);
    const username = useAppSelector(selectAuthStateUserName)
    const tutorialState = useAppSelector(selectAuthStateTutorialState)
    const leftOpen = useAppSelector(selectAppWrapperSidebarOpen)
    const rightOpen = useAppSelector(selectAppWrapperChatOpen)

    const [reportPopup, setReportPopup] = React.useState(false)

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const textFieldRef = React.useRef();
    const holiday = isHoliday()
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [notificationCount, setNotificationCount] = React.useState<number>(0);
    const [showReferPopup, setShowReferPopup] = React.useState(false)

    const styles = {
        regular: {
            ...themeHelpers.frostedGlass,
            zIndex: 999,
            border: "none",
            backgroundColor: theme.palette.primary.main + "20",
        },
        holiday: {
            ...themeHelpers.frostedGlass,
            zIndex: 999,
            border: "none",
            backgroundColor: theme.palette.primary.main,
        },
        christmas: {
            zIndex: 999,
            border: "none",
            backgroundImage: `url(${candycane})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
        },
        independence: {
            zIndex: 999,
            border: "none",
            backgroundImage: `url(${usflag})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
        },
    };

    let holidayStyle: any = styles.regular;
    let gigoColor = theme.palette.primary.contrastText

    switch (holiday) {
        case "Christmas":
            holidayStyle = styles.christmas;
            break;
        case "Independence":
            holidayStyle = styles.independence;
            gigoColor = "white"
            break;
        case "Regular":
            holidayStyle = styles.regular;
            break;
        default: holidayStyle = styles.holiday;
    }


    const DrawerHeader = styled('div')(({theme}) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    }));

    const DrawerFooter = styled('div')(({theme}) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        justifyContent: 'center',
        marginTop: 'auto',
    }));

    // const [leftOpen, setLeftOpen] = React.useState(sidebarOpenState);
    // const [rightOpen, setRightOpen] = React.useState(chatOpenState);

    const handleDrawerOpen = () => {
        let appWrapperState = Object.assign({}, initialAppWrapperStateUpdate);
        if (rightOpen) {
            appWrapperState.chatOpen = true
        }
        appWrapperState.sidebarOpen = true;
        dispatch(updateAppWrapper(appWrapperState));
    };
    const handleDrawerClose = () => {
        let appWrapperState = Object.assign({}, initialAppWrapperStateUpdate);
        appWrapperState.sidebarOpen = homePageLockedDrawer;
        dispatch(updateAppWrapper(appWrapperState));
    };

    const handleChatButton = () => {
        let appWrapperState = Object.assign({}, initialAppWrapperStateUpdate);
        if (!rightOpen && leftOpen) {
            appWrapperState.sidebarOpen = homePageLockedDrawer;
        }
        appWrapperState.chatOpen = !rightOpen;
        dispatch(updateAppWrapper(appWrapperState));
    }


    interface AppBarProps extends MuiAppBarProps {
        leftopen?: boolean;
        rightopen?: boolean;
    }

    const AppBar = styled(MuiAppBar, {
        shouldForwardProp: (prop) => prop !== 'open',
    })<AppBarProps>(({ theme, leftopen, rightopen }) => ({
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        ...(leftopen && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
        ...(rightopen && {
            width: `calc(100% - ${drawerWidth * 1.5}px)`,
            marginRight: `${drawerWidth * 1.5}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
        ...(leftopen && rightopen && {
            width: `calc(100% - ${drawerWidth * 2.5}px)`,
            marginLeft: `${drawerWidth}px`,
            marginRight: `${drawerWidth * 1.5}px`,
        }),
    }));

    interface ContentContainerProps extends MuiBoxProps {
        leftOpen?: boolean;
        rightOpen?: boolean;
    }

    const ContentContainer = styled(Box, {
        shouldForwardProp: (prop) => prop !== 'open',
    })<ContentContainerProps>(({ theme, leftOpen, rightOpen }) => ({
        overflowX: 'hidden',
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        ...(leftOpen && !rightOpen && {
            width: `calc(100% - ${drawerWidth + 20}px)`,
            marginLeft: `${drawerWidth + 20}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
        ...(rightOpen && !leftOpen && {
            width: `calc(100% - ${drawerWidth * 1.5 + 20}px)`,
            marginRight: `${drawerWidth * 1.5 + 20}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
        ...(leftOpen && rightOpen && {
            width: `calc(100% - ${drawerWidth * 2.5 + 40}px)`,
            marginLeft: `${drawerWidth + 20}px`,
            marginRight: `${drawerWidth * 1.5 + 20}px`,
        }),
    }));

    const memoizedChildren = React.useMemo(() => (
        <ContentContainer
            leftOpen={leftOpen || homePageLockedDrawer}
            rightOpen={rightOpen}
            style={{marginTop: window.location.pathname.startsWith("/launchpad/") && query.get("editor") === "true" ? "28px" : "65px"}}
            id={"contentContainer"}
        >
            {props.children}
        </ContentContainer>
    ), [leftOpen, homePageLockedDrawer, rightOpen, props.children]);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleCreateAccount = () => {
        navigate("/signup")
    }

    const handleLogin = () => {
        navigate("/login")
    }


    const handleProfile = () => {
        setAnchorEl(null);
        navigate("/profile")
    };

    let navigate = useNavigate();

    const clearReducers = () => {
        let authState = Object.assign({}, initialAuthStateUpdate)
        // @ts-ignore
        dispatch(updateAuthState(authState))

        dispatch(resetAppWrapper())
        dispatch(clearProjectState())
        dispatch(clearSearchParamsState())
        dispatch(clearJourneyFormState())
        dispatch(clearCache())
        dispatch(clearMessageCache())
        dispatch(clearChatState())
    }

    const reportIssue = async () => {
        let url = window.location.href
        let stringSplit = url.split("/")
        let res = await call(
            "/api/reportIssue",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {page: stringSplit[3], issue: textFieldRef.current.value},
            null,
            config.rootPath
        )

        if (res["message"] === "You must be logged in to access the GIGO system.") {
            clearReducers()
        }

        if (res["message"] !== undefined && res["message"] === "Thank you for your feedback!") {
            setReportPopup(false)
            swal("Thank you for your feedback!")
        } else {
            swal("Something went wrong, please try again.")
        }

    }

    const handleLogout = async () => {
        clearReducers()

        let res = await call(
            "/api/auth/logout",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        if (res["message"] === "You must be logged in to access the GIGO system.") {
            navigate("/login")
        }

        if (res !== undefined && res["message"] !== undefined) {
            if (res["message"] === "success") {
                navigate("/login")
            }

            const persistOptions = {};

            persistStore(store, persistOptions).purge()
            window.sessionStorage.setItem("homeIndex", "undefined")
        } else {
            swal("There was an issue logging out")
        }
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

    const handleSettings = () => {
        setAnchorEl(null);
        navigate("/settings")
    };

    React.useEffect(() => {
        if (loggedIn)
            getNotifications();
    }, []);

    const handleExclusiveContent = () => {
        setAnchorEl(null);
        if (exclusiveAgreement === true || window.sessionStorage.getItem('exclusiveAgreement') === "true") {
            window.sessionStorage.setItem("exclusiveProject", "true")
            navigate("/create-challenge")
        } else {
            navigate("/aboutExclusive")
        }
    };

    const handleCurateContent = () => {
        setAnchorEl(null);

        if (username === "gigo") {
            navigate("/curateAdmin")
        }
    };

    if (
        (queryParams.has("embed") && queryParams.get("embed") === "true") ||
        (
            window.location.pathname.startsWith('/login') ||
            window.location.pathname.startsWith('/forgotPassword') ||
            window.location.pathname.startsWith('/signup') ||
            window.location.pathname.startsWith('/resetPassword') ||
            window.location.pathname.startsWith('/referral')
        )
    ) {
        return (
            <div>
                {props.children}
            </div>
        )
    }

    const stopWorkspace = async () => {
        let wsId = window.location.href.split("/launchpad/")[1].split('?')[0]

        let res = await call(
            "/api/workspace/stopWorkspace",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                workspace_id: wsId,
            }
        )

        if (res["message"] !== undefined && res["message"] === "You must be logged in to access the GIGO system.") {

            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }

        window.history.replaceState({}, "", window.location.href.split("?")[0]);

    }
    ;
    const renderTutorialButton = () => {
        if (!(
            window.location.pathname.startsWith('/home') ||
            window.location.pathname.startsWith('/challenge') ||
            window.location.pathname.startsWith('/workspace') ||
            window.location.pathname.startsWith('/launchpad') ||
            window.location.pathname.startsWith('/create-challenge') ||
            window.location.pathname.startsWith('/streak') ||
            window.location.pathname.startsWith('/nemesis')
        )) {
            return null;
        }

        return (
            <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                <Tooltip title={"Restart Tutorial. Click to close at any point."}>
                    <Button onClick={() => {
                        let authState = Object.assign({}, initialAuthStateUpdate)
                        // copy the existing state
                        let state = Object.assign({}, tutorialState)
                        // update the state
                        switch (window.location.pathname.split("/")[1]) {
                            case "home":
                                state.home = false
                                break;
                            case "challenge":
                                state.challenge = false
                                break;
                            case "workspace":
                                state.workspace = false
                                break;
                            case "streak":
                                state.stats = false
                                break;
                            case "nemesis":
                                state.nemesis = false
                                break;
                            case "launchpad":
                                // get query params from url
                                let queryParams = new URLSearchParams(window.location.search)

                                // reset the vscode tutorial if editor query param is true
                                if (queryParams.has("editor") && queryParams.get("editor") === "true") {
                                    state.vscode = false
                                } else {
                                    state.launchpad = false
                                }
                                break;
                            case "create-challenge":
                                state.create_project = false
                                break;
                        }
                        authState.tutorialState = state
                        // @ts-ignore
                        dispatch(updateAuthState(authState))
                    }}>
                        <HelpOutlineIcon height={"25"} width={"25"}/>
                    </Button>
                </Tooltip>
            </div>
        )
    }

    //todo: change the url to have the correct info for production
    const urlLink = window.location.href
    const regex = /https?:\/\/[^\/]+/;
    const referralLink =
        //@ts-ignore
        urlLink.match(regex)[0] + "/referral/" + username

    // const referralLink = "https://ui-dev.gigo.dev:33000/referral/" + username;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            console.log('Text copied to clipboard');
        } catch(err) {
            console.log('Failed to copy text: ', err);
        }
    }


    const renderAppBar = () => {
        return (
            <AppBar
                position="fixed"
                // open={open && !homePageLockedDrawer}
                leftopen={false}
                elevation={5}
                style={{
                    height: "64px",
                    backgroundImage: `conic-gradient(from 0deg at 50% 50%, #FEDC5A20 0deg, #FFFCAB20 73.13deg, #29C18C20 155.62deg, #3D8EF720 249.37deg, #84E8A220 339.37deg, #FEDC5A20 360deg)`,
                    zIndex: 1000,
                    border: "none",
                    boxShadow: (mode === 'dark') ? "0px 3px 5px -1px #ffffff20, 0px 5px 8px 0px #ffffff14, 0px 1px 14px 0px #ffffff12" :
                        "0px 3px 5px -1px #00000020, 0px 5px 8px 0px #00000014, 0px 1px 14px 0px #00000012",
                }}
            >
                <Toolbar
                    sx={holidayStyle}
                >
                    {loggedIn && !homePageLockedDrawer ? (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            sx={{mr: 2}}
                            onClick={() => leftOpen ? handleDrawerClose() : handleDrawerOpen()}
                        >
                            <MenuIcon style={{color: theme.palette.primary.contrastText}} />
                        </IconButton>
                    ) : (
                        <div/>
                    )}
                    <Button href={"/home"} style={{color: theme.palette.text.primary, zIndex: "600000"}}>
                        <Box>
                            <Typography variant="h6" component="span" style={{color: gigoColor}}>
                                GIGO
                            </Typography>
                            <Typography variant="caption" component="span" style={{fontSize: '8px', marginLeft: '5px', textTransform: 'lowercase', color: gigoColor}}>
                                [alpha]
                            </Typography>
                        </Box>
                    </Button>
                    <TopSearchBar />
                    {loggedIn ? (
                        <Button onClick={async () => {
                            navigate("/premium")
                        }} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '18%', height: '55px', left: '8% ', color: theme.palette.primary.contrastText }}>
                            Your Pro Perks
                        </Button>
                    ) : (
                        <Button onClick={async () => {
                            navigate("/signup")
                        }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '18%', height: '55px', left: '8% ', color: theme.palette.primary.contrastText }}>
                            New accounts get 1 month of Pro!
                        </Button>
                    )}
                    <Box sx={{flexGrow: 1}}/>
                    {loggedIn ? (
                        <Box>
                            <NotificationPopup
                                notificationCount={notificationCount}
                                notifications={notifications}
                                setNotifications={setNotifications}
                                setNotificationCount={setNotificationCount}
                            />
                        </Box>
                    ) : (
                        <div/>
                    )}
                    {loggedIn ? (
                        <Box>
                            <Button onClick={async () => {
                                navigate("/create-challenge")
                            }} sx={{paddingLeft: "15px", paddingRight: "15px"}} className={'top-menu'}>
                                <Icon>
                                    <AddIcon style={{color: theme.palette.primary.contrastText}}/>
                                </Icon>
                                <Typography component={"div"} variant={"body2"}
                                            sx={{paddingLeft: "10px", color: theme.palette.primary.contrastText}}>Create Challenge</Typography>
                            </Button>
                        </Box>
                    ) : (
                        <div/>
                    )}
                    <div style={{width: "20px"}}/>
                    <Box sx={{width: "50px"}}/>
                    {loggedIn ? (
                        <Box sx={{
                            overflow: "hidden",
                        }}>
                            <Button
                                size={"small"}
                                aria-label="account of current user"
                                onClick={handleMenu}
                                variant="text"
                            >
                                <Typography sx={{color: theme.palette.primary.contrastText, mr: 2, textTransform: "none"}}>
                                    {username}
                                </Typography>
                                <UserIcon
                                    userId={authState.id}
                                    userTier={authState.tier}
                                    userThumb={config.rootPath + thumbnail}
                                    size={40}
                                    backgroundName={authState.backgroundName}
                                    backgroundPalette={authState.backgroundColor}
                                    backgroundRender={authState.backgroundRenderInFront}
                                    profileButton={false}
                                    pro={authState.role.toString() === "1"}
                                />
                            </Button>
                            <Menu
                                id="menu-appbar"
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                                <MenuItem onClick={handleSettings}>Account Settings</MenuItem>
                                <MenuItem onClick={handleExclusiveContent}>Exclusive Content</MenuItem>
                                {username === "gigo" && (
                                    <MenuItem onClick={handleCurateContent}>Curate Content</MenuItem>
                                )}
                                <MenuItem onClick={async () => {
                                    await handleLogout()
                                }}>Logout</MenuItem>
                                <MenuItem onClick={() => setShowReferPopup(true)}>Refer A Friend</MenuItem>
                            </Menu>
                            <Modal open={showReferPopup} onClose={() => setShowReferPopup(false)}>
                                <Box
                                    sx={{
                                        width: "30vw",
                                        minHeight: "340px",
                                        height: "30vh",
                                        justifyContent: "center",
                                        marginLeft: "35vw",
                                        marginTop: "35vh",
                                        outlineColor: "black",
                                        borderRadius: 1,
                                        boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                                        backgroundColor: theme.palette.background.default,
                                    }}
                                >
                                    <Button onClick={() => setShowReferPopup(false)}>
                                        <CloseIcon/>
                                    </Button>
                                    <div style={{width: "100%", display: "flex", alignItems: "center", flexDirection: "column"}}>
                                        <h3>Refer a Friend.</h3>
                                        <h4>Give a Month, Get a Month.</h4>
                                        <div style={{display: "flex", width: "100%", flexDirection: "row", justifyContent: "center"}}>
                                            <h5 style={{outline: "solid gray", borderRadius: "5px", padding: "8px"}} id={"url"}>{referralLink.length > 30 ? referralLink.slice(0,30) + "..." : referralLink}</h5>
                                            <Button onClick={() => copyToClipboard()}>
                                                <ContentCopyIcon/>
                                            </Button>
                                        </div>
                                    </div>
                                </Box>
                            </Modal>
                        </Box>
                    ) : (
                        <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                            <Tooltip title={"Login or Create Account!"}>
                                <Button
                                    size="large"
                                    aria-label="account of current user"
                                    aria-haspopup="true"
                                    onClick={handleMenu}
                                    color="primary"
                                    variant='outlined'
                                    sx={{
                                        color: theme.palette.primary.contrastText,
                                        borderColor: theme.palette.primary.contrastText,
                                    }}
                                >
                                    Signup / Login
                                </Button>
                            </Tooltip>
                            <Menu
                                id="menu-appbar"
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}>
                                <MenuItem onClick={handleCreateAccount}>Create Account</MenuItem>
                                <MenuItem onClick={handleLogin}>Login</MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
        )
    }

    const removeEditorQueryParam = () => {
        let url = new URL(window.location.href);
        let params = new URLSearchParams(url.search);
        params.delete("editor");
        url.search = params.toString();
        window.history.replaceState({}, '', url.toString());
    };

    const renderWorkspaceAppBar = () => {
        let toolbarStyles = JSON.parse(JSON.stringify(holidayStyle));
        toolbarStyles.height = "32px"
        toolbarStyles.minHeight = "32px !important"

        return (
            <AppBar
                position="fixed"
                leftopen={false}
                elevation={5}
                style={{
                    height: "32px",
                    backgroundImage: `conic-gradient(from 0deg at 50% 50%, #FEDC5A20 0deg, #FFFCAB20 73.13deg, #29C18C20 155.62deg, #3D8EF720 249.37deg, #84E8A220 339.37deg, #FEDC5A20 360deg)`,
                    zIndex: 1000,
                    border: "none",
                    boxShadow: (mode === 'dark') ? "0px 3px 5px -1px #ffffff20, 0px 5px 8px 0px #ffffff14, 0px 1px 14px 0px #ffffff12" :
                        "0px 3px 5px -1px #00000020, 0px 5px 8px 0px #00000014, 0px 1px 14px 0px #00000012",
                }}
            >
                <Toolbar
                    sx={toolbarStyles}
                >
                    {loggedIn && !homePageLockedDrawer ? (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            sx={{mr: 2}}
                            onClick={() => leftOpen ? handleDrawerClose() : handleDrawerOpen()}
                        >
                            <MenuIcon style={{color: theme.palette.primary.contrastText}} />
                        </IconButton>
                    ) : (
                        <div/>
                    )}
                    <Button href={"/home"} style={{color: theme.palette.text.primary, zIndex: "600000"}}>
                        <Box>
                            <Typography variant="h6" component="span" style={{color: gigoColor}}>
                                GIGO
                            </Typography>
                            <Typography variant="caption" component="span" style={{fontSize: '8px', marginLeft: '5px', textTransform: 'lowercase', color: gigoColor}}>
                                [alpha]
                            </Typography>
                        </Box>
                    </Button>

                    {/*<Button onClick={async () => {*/}
                    {/*    navigate("/premium")*/}
                    {/*}} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '18%', height: '55px', left: '8% ', color: theme.palette.primary.contrastText }}>*/}
                    {/*    Your Pro Perks*/}
                    {/*</Button>*/}


                    {loggedIn ? (
                        <>
                            <Button
                                variant={"outlined"}
                                color={"error"}

                                onClick={async () => {
                                    window.history.replaceState({}, "", window.location.href.split("?")[0]);
                                    // removeEditorQueryParam()
                                    window.location.reload()
                                }} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 'auto', height: '25px', left: '70% ', color: "error", fontSize: '13px' }}>
                                Go Back
                            </Button>
                            <Button
                                variant={"outlined"}
                                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '10%', height: '25px', left: '52% ', color: "error", fontSize: '13px' }}
                                color={"warning"}
                                onClick={() => stopWorkspace()}
                            >
                                {"Stop Workspace"}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={async () => {
                            navigate("/signup")
                        }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '18%', height: '55px', left: '8% ', color: theme.palette.primary.contrastText }}>
                            New accounts get 1 month of Pro!
                        </Button>
                    )}
                    <Box sx={{flexGrow: 1}}/>

                    <div style={{width: "20px"}}/>
                    <Box sx={{width: "50px"}}/>
                    {loggedIn ? (
                        <Box sx={{
                            overflow: "hidden",
                        }}>
                            <Button
                                size={"small"}
                                aria-label="account of current user"
                                onClick={handleMenu}
                                variant="text"
                            >
                                <Typography sx={{color: theme.palette.primary.contrastText, mr: 2, textTransform: "none"}}>
                                    {username}
                                </Typography>
                                <UserIcon
                                    userId={authState.id}
                                    userTier={authState.tier}
                                    userThumb={config.rootPath + thumbnail}
                                    size={25}
                                    backgroundName={authState.backgroundName}
                                    backgroundPalette={authState.backgroundColor}
                                    backgroundRender={authState.backgroundRenderInFront}
                                    profileButton={false}
                                    pro={authState.role.toString() === "1"}
                                />
                            </Button>
                            <Menu
                                id="menu-appbar"
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                                <MenuItem onClick={handleSettings}>Account Settings</MenuItem>
                                <MenuItem onClick={handleExclusiveContent}>Exclusive Content</MenuItem>
                                {username === "gigo" && (
                                    <MenuItem onClick={handleCurateContent}>Curate Content</MenuItem>
                                )}
                                <MenuItem onClick={async () => {
                                    await handleLogout()
                                }}>Logout</MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                            <Tooltip title={"Login or Create Account!"}>
                                <Button
                                    size="large"
                                    aria-label="account of current user"
                                    aria-haspopup="true"
                                    onClick={handleMenu}
                                    color="primary"
                                    variant='outlined'
                                    sx={{
                                        color: theme.palette.primary.contrastText,
                                        borderColor: theme.palette.primary.contrastText,
                                    }}
                                >
                                    Signup / Login
                                </Button>
                            </Tooltip>
                            <Menu
                                id="menu-appbar"
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}>
                                <MenuItem onClick={handleCreateAccount}>Create Account</MenuItem>
                                <MenuItem onClick={handleLogin}>Login</MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
        )
    }

    const mobileAppBar = () => {
        return (
            <>
                <AppBar
                    position="fixed"
                    leftopen={false}
                    elevation={5}
                    sx={{
                        height: "56px",
                        backgroundImage: `conic-gradient(from 0deg at 50% 50%, #FEDC5A20 0deg, #FFFCAB20 73.13deg, #29C18C20 155.62deg, #3D8EF720 249.37deg, #84E8A220 339.37deg, #FEDC5A20 360deg)`,
                        zIndex: 1000,
                        border: "none",
                        boxShadow: (mode === 'dark') ? "0px 3px 5px -1px #ffffff20, 0px 5px 8px 0px #ffffff14, 0px 1px 14px 0px #ffffff12" :
                            "0px 3px 5px -1px #00000020, 0px 5px 8px 0px #00000014, 0px 1px 14px 0px #00000012",
                    }}
                >
                    <Toolbar
                        sx={holidayStyle}
                    >
                        <Button href={"/home"} style={{color: theme.palette.text.primary, zIndex: "600000"}}>
                            <Box>
                                <Typography variant="h6" component="span" style={{color: gigoColor}}>
                                    GIGO
                                </Typography>
                                <Typography variant="caption" component="span" style={{fontSize: '8px', marginLeft: '5px', textTransform: 'lowercase', color: gigoColor}}>
                                    [alpha]
                                </Typography>
                            </Box>
                        </Button>
                        <TopSearchBar />
                        {loggedIn ? (
                        <>
                            <Button
                                size={"small"}
                                aria-label="account of current user"
                                onClick={handleMenu}
                                variant="text"
                                style={{position: "absolute", right: 0}}
                            >
                                <UserIcon
                                    userId={authState.id}
                                    userTier={authState.tier}
                                    userThumb={config.rootPath + thumbnail}
                                    size={40}
                                    backgroundName={authState.backgroundName}
                                    backgroundPalette={authState.backgroundColor}
                                    backgroundRender={authState.backgroundRenderInFront}
                                    profileButton={false}
                                    pro={authState.role.toString() === "1"}
                                />
                            </Button>
                            <Menu
                                id="menu-appbar"
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                                <MenuItem onClick={handleSettings}>Account Settings</MenuItem>
                                <MenuItem onClick={async () => {
                                    await handleLogout()
                                }}>Logout</MenuItem>
                                <MenuItem onClick={() => setShowReferPopup(true)}>Refer A Friend</MenuItem>
                            </Menu>
                            <Modal open={showReferPopup} onClose={() => setShowReferPopup(false)}>
                                <Box
                                    sx={{
                                        width: "90vw",
                                        height: "40vh",
                                        justifyContent: "center",
                                        marginLeft: "5vw",
                                        marginTop: "30vh",
                                        outlineColor: "black",
                                        borderRadius: 1,
                                        boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                                        backgroundColor: theme.palette.background.default,
                                    }}
                                >
                                    <Button onClick={() => setShowReferPopup(false)}>
                                        <CloseIcon/>
                                    </Button>
                                    <div style={{width: "100%", display: "flex", alignItems: "center", flexDirection: "column"}}>
                                        <h3>Refer a Friend.</h3>
                                        <h4>Give a Month, Get a Month.</h4>
                                        <div style={{display: "flex", width: "100%", flexDirection: "row", justifyContent: "center"}}>
                                            <h5 style={{outline: "solid gray", borderRadius: "5px", padding: "8px"}} id={"url-mobile"}>{referralLink.length > 20 ? referralLink.slice(0,20) + "..." : referralLink}</h5>
                                            <Button onClick={() => copyToClipboard()}>
                                                <ContentCopyIcon/>
                                            </Button>
                                        </div>
                                    </div>
                                </Box>
                            </Modal>
                        </>
                            ) : (
                                <>
                                    <Button
                                        size={"small"}
                                        aria-label="login-signup"
                                        onClick={handleMenu}
                                        variant="text"
                                        style={{position: "absolute", right: 0, width: "5%"}}
                                    >
                                        <LoginIcon/>
                                    </Button>
                                    <Menu
                                        id="menu-appbar"
                                        anchorOrigin={{
                                            vertical: "top",
                                            horizontal: "right",
                                        }}
                                        keepMounted
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}>
                                        <MenuItem onClick={handleCreateAccount}>Create Account</MenuItem>
                                        <MenuItem onClick={handleLogin}>Login</MenuItem>
                                    </Menu>
                                </>
                        )}
                    </Toolbar>
                </AppBar>
                {/*Bottom Navigation Bar*/}
                {loggedIn ? (
                    <AppBar
                        position="fixed"
                        // open={open && !homePageLockedDrawer}
                        leftopen={false}
                        elevation={5}
                        sx={{
                            height: "50px",
                            zIndex: 1000,
                            border: "none",
                            boxShadow: (mode === 'dark') ? "0px 3px 5px -1px #ffffff20, 0px 5px 8px 0px #ffffff14, 0px 1px 14px 0px #ffffff12" :
                                "0px 3px 5px -1px #00000020, 0px 5px 8px 0px #00000014, 0px 1px 14px 0px #00000012",
                            top: 'auto',
                            bottom: 0,
                            backgroundImage: `conic-gradient(from 0deg at 50% 50%, #FEDC5A20 0deg, #FFFCAB20 73.13deg, #29C18C20 155.62deg, #3D8EF720 249.37deg, #84E8A220 339.37deg, #FEDC5A20 360deg)`,
                        }}
                    >
                        <Container>
                            <Toolbar
                                sx={{
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingX: '0px',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', height: '60px', overflow: 'hidden' }}>
                                    <IconButton color="inherit" href={"/about"}>
                                        <InfoOutlined style={{ color: theme.palette.text.primary, fontSize: 25 }} />
                                    </IconButton>
                                    <Typography variant="caption" noWrap sx={{marginTop:'-10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '10px'}}>
                                        About
                                    </Typography>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', height: '60px', overflow: 'hidden' }}>
                                    <IconButton color="inherit" href={"/following"}>
                                        <BookmarkBorderOutlined style={{ color: theme.palette.text.primary, fontSize: 25 }} />
                                    </IconButton>
                                    <Typography variant="caption" noWrap sx={{marginTop:'-10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '10px'}}>
                                        Following
                                    </Typography>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', height: '60px', overflow: 'hidden' }}>
                                    <IconButton color="inherit" href={"/home"}>
                                        <HomeOutlined style={{ color: theme.palette.text.primary, fontSize: 25 }} />
                                    </IconButton>
                                    <Typography variant="caption" noWrap sx={{marginTop:'-10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '10px'}}>
                                        Home
                                    </Typography>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', height: '60px', overflow: 'hidden' }}>
                                    <IconButton color="inherit" href={"/active"}>
                                        <FolderOutlined style={{ color: theme.palette.text.primary, fontSize: 25 }} />
                                    </IconButton>
                                    <Typography variant="caption" noWrap sx={{marginTop:'-10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '10px'}}>
                                        Active
                                    </Typography>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', height: '60px', overflow: 'hidden' }}>
                                    <IconButton color="inherit" onClick={() => {
                                        let appWrapperState = Object.assign({}, initialAppWrapperStateUpdate);
                                        appWrapperState.chatOpen = true
                                        dispatch(updateAppWrapper(appWrapperState));
                                    }}>
                                        <ChatBubbleOutline style={{ color: theme.palette.text.primary, fontSize: 25 }} />
                                    </IconButton>
                                    <Typography variant="caption" noWrap sx={{marginTop:'-10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '10px'}}>
                                        Chat
                                    </Typography>
                                </div>
                            </Toolbar>
                        </Container>
                    </AppBar>
                ) : null}
            </>
        )
    }

    const renderSidebar = () => {
        return (
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    zIndex: 998,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        border: "none",
                        opacity: 1,
                        color: theme.palette.text.primary,
                        backgroundColor: (isChrome) ? theme.palette.background.default : theme.palette.background.default,
                        backdropFilter: (isChrome) ? "blur(15px)" : undefined,
                        zIndex: 998,
                    },
                }}
                variant="persistent"
                anchor="left"
                open={leftOpen || homePageLockedDrawer}
            >
                <DrawerHeader/>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton color={"primary"} sx={{
                            borderRadius: 2,
                        }} href={"/home"}>
                            <ListItemIcon>
                                <HomeIcon style={{color: theme.palette.text.primary,}}/>
                            </ListItemIcon>
                            <Typography
                                component={"div"}
                                variant={"body1"}
                                sx={{fontSize: "0.8em"}}
                            >
                                Home
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton color={"primary"} sx={{
                            borderRadius: 2,
                        }} href={"/active"}>
                            <ListItemIcon>
                                <FolderIcon style={{color: theme.palette.text.primary,}}/>
                            </ListItemIcon>
                            <Typography
                                component={"div"}
                                variant={"body1"}
                                sx={{fontSize: "0.8em"}}
                            >
                                Active
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton color={"primary"} sx={{
                            borderRadius: 2,
                        }} href={"/following"}>
                            <ListItemIcon>
                                <BookmarkIcon style={{color: theme.palette.text.primary,}}/>
                            </ListItemIcon>
                            <Typography
                                component={"div"}
                                variant={"body1"}
                                sx={{fontSize: "0.8em"}}
                            >
                                Following
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton color={"primary"} sx={{
                            borderRadius: 2,
                        }} href={"/profile"}>
                            <ListItemIcon>
                                <AccountBoxIcon style={{color: theme.palette.text.primary,}}/>
                            </ListItemIcon>
                            <Typography
                                component={"div"}
                                variant={"body1"}
                                sx={{fontSize: "0.8em"}}
                            >
                                Profile
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton color={"primary"} sx={{
                            borderRadius: 2,
                        }} href={"/streak"}>
                            <ListItemIcon>
                                <LocalFireDepartment style={{color: theme.palette.text.primary,}}/>
                            </ListItemIcon>
                            <Typography
                                component={"div"}
                                variant={"body1"}
                                sx={{fontSize: "0.8em"}}
                            >
                                Stats
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                    {/*<ListItem disablePadding>*/}
                    {/*    <ListItemButton color={"primary"} sx={{*/}
                    {/*        borderRadius: 2,*/}
                    {/*    }} href={"/nemesis"}>*/}
                    {/*        <ListItemIcon>*/}
                    {/*            <IconifyIcon icon="mdi:sword-cross" color={theme.palette.text.primary} width="25"*/}
                    {/*                         height="25"/>*/}
                    {/*        </ListItemIcon>*/}
                    {/*        <Typography*/}
                    {/*            component={"div"}*/}
                    {/*            variant={"body1"}*/}
                    {/*            sx={{fontSize: "0.8em"}}*/}
                    {/*        >*/}
                    {/*            Nemesis*/}
                    {/*        </Typography>*/}
                    {/*    </ListItemButton>*/}
                    {/*</ListItem>*/}
                    <ListItem disablePadding>
                        <ListItemButton color={"primary"} sx={{
                            borderRadius: 2,
                        }} href={"/documentation"}>
                            <ListItemIcon>
                                <FeedIcon style={{color: theme.palette.text.primary,}}/>
                            </ListItemIcon>
                            <Typography
                                component={"div"}
                                variant={"body1"}
                                sx={{fontSize: "0.8em"}}
                            >
                                Docs
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton color={"primary"} sx={{
                            borderRadius: 2,
                        }} href={"/about"}>
                            <ListItemIcon>
                                <IconifyIcon icon="mdi:about" color={theme.palette.text.primary} width="25"
                                             height="25"/>
                            </ListItemIcon>
                            <Typography
                                component={"div"}
                                variant={"body1"}
                                sx={{fontSize: "0.8em"}}
                            >
                                About
                            </Typography>
                        </ListItemButton>
                    </ListItem>

                </List>
                <DrawerFooter>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        {authState.role.toString() === "0" ? (
                            <div>
                                <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                                    <AwesomeButton style={{ width: "100%",
                                        '--button-primary-color': theme.palette.primary.main,
                                        '--button-primary-color-dark': theme.palette.primary.dark,
                                        '--button-primary-color-light': theme.palette.text.primary,
                                        '--button-primary-color-hover': theme.palette.primary.main,
                                        fontSize: "14px"
                                    }} type="primary" onPress={() => navigate("/premium")}>
                                        <img src={premiumImage}/>
                                    </AwesomeButton>
                                </div>
                                <div style={{height: "5vh"}}/>
                            </div>
                        ) : null}
                        {renderTutorialButton()}
                        <Button onClick={() => setReportPopup(true)}>
                            Report Issue
                        </Button>
                        <Modal open={reportPopup} onClose={() => setReportPopup(false)}>
                            <Box
                                sx={{
                                    width: "40vw",
                                    height: "30vh",
                                    justifyContent: "center",
                                    marginLeft: "30vw",
                                    marginTop: "30vh",
                                    outlineColor: "black",
                                    borderRadius: 1,
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                    backgroundColor: theme.palette.background.default,
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        height: "100%",
                                    }}
                                >
                                    <Typography variant="h5"
                                                component="h2"
                                                align="center"
                                                style={{
                                                    marginTop: "-10px",
                                                    marginBottom: "10px",
                                                    color: theme.palette.text.primary,
                                                }}>
                                        Report Issue
                                    </Typography>
                                    <TextField
                                        inputRef={textFieldRef}
                                        id="errorReport"
                                        variant="outlined"
                                        color="primary"
                                        label="Describe your issue or just give us feedback!"
                                        required={true}
                                        margin="normal"
                                        multiline={true}
                                        minRows={3}
                                        maxRows={15}
                                        sx={{
                                            width: "30vw",
                                            marginBottom: "25px",
                                        }}
                                    />
                                    <Button
                                        sx={{
                                            marginBottom: "-15px",
                                        }}
                                        onClick={() => reportIssue()}>Submit</Button>
                                </div>
                            </Box>
                        </Modal>
                        <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                            <Button sx={{ml: 1, mb: 1}} size={"small"} onClick={handleTheme} color="primary" variant="text">
                                <Typography sx={{textTransform: "capitalize", fontSize: "1.0em", mr: 1}}>
                                    {theme.palette.mode} mode
                                </Typography>
                                {theme.palette.mode === 'dark' ? <Brightness7Icon/> :
                                    <Brightness4Icon/>}
                            </Button>
                        </div>
                    </div>
                </DrawerFooter>
            </Drawer>
        )
    }

    const renderChatSideBar = () => {
        return (
            <>
                <IconButton
                    onClick={() => handleChatButton()}
                    sx={{
                        position: 'fixed',
                        right: (rightOpen) ? (window.innerWidth > 1000 ? 290 : 350) : 10,
                        top: '50vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        fontSize: '2rem',
                        transform: 'translateY(-50%)',
                    }}
                >
                    <Tooltip
                        title={"Global Chat"}
                    >
                        {
                            window.innerWidth > 1000
                                ?
                                    (rightOpen) ?
                                        (
                                            <KeyboardDoubleArrowRightIcon
                                                style={{color: theme.palette.primary.main}}
                                                fontSize={"large"}
                                            />
                                        )
                                        :
                                        (
                                            <KeyboardDoubleArrowLeftIcon
                                                style={{color: theme.palette.primary.main}}
                                                fontSize={"large"}
                                            />
                                        )
                                :
                                    <></>
                        }
                    </Tooltip>
                </IconButton>
                <Drawer
                    sx={{
                        width: drawerWidth * 1.5,
                        flexShrink: 0,
                        zIndex: 998,
                        '& .MuiDrawer-paper': {
                            width: window.innerWidth > 1000 ? drawerWidth * 1.5 : '100vw',
                            border: "none",
                            opacity: 1,
                            color: theme.palette.text.primary,
                            backgroundColor: (isChrome) ? theme.palette.background.default : theme.palette.background.default,
                            backdropFilter: (isChrome) ? "blur(15px)" : undefined,
                            zIndex: 998,
                        },
                    }}
                    variant="persistent"
                    anchor="right"
                    open={rightOpen}
                >
                    <DrawerHeader/>
                    <ChatContainer />
                </Drawer>
            </>
        )
    }

    let appBarRenderer = renderAppBar
    if (window.location.pathname.startsWith("/launchpad/") && query.get("editor") === "true") {
        appBarRenderer = renderWorkspaceAppBar
    } else if(window.innerWidth < 1000) {
        appBarRenderer = mobileAppBar
    }

    return (
        <ThemeProvider theme={theme}>
            {holiday === "Christmas"
                ?
                <Snowfall/>
                :
                <></>
            }
            {holiday === "New Years"
                ?
                <Confetti gravity={0.01} numberOfPieces={100} wind={0.001} colors={['#ad7832', '#dcb468', '#716c6c', '#8e8888']} friction={1}/>
                :
                <></>
            }
            <CssBaseline>
                <Box sx={{
                    mb: window.location.pathname.startsWith("/launchpad/") && query.get("editor") === "true" ? "0px" : "20px",
                    // height: "64px",
                }}>
                    {appBarRenderer()}
                    {renderSidebar()}
                    {renderChatSideBar()}
                    {memoizedChildren}
                </Box>
            </CssBaseline>
        </ThemeProvider>
    );
}