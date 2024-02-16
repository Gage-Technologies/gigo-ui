import * as React from 'react';
import { useGlobalWebSocket } from '../services/websocket';
import { WsMessage, WsMessageType } from '../models/websocket';
import LinearProgress from '@mui/material/LinearProgress';
import {
    Box,
    Button,
    Grid,
    IconButton,
    PaletteMode,
    Paper,
    Tooltip,
    Typography,
    createTheme,
    Popper
} from '@mui/material';
import { getAllTokens, isHoliday } from '../theme';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StopIcon from '@mui/icons-material/Stop';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import DesktopAccessDisabledIcon from '@mui/icons-material/DesktopAccessDisabled';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import call from '../services/api-call';
import { DevSpaceCache, selectDevSpaceCacheState, setDevSpaceCache } from '../reducers/devSpace/usageCache';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Workspace } from '../models/workspace';
import { selectAuthState } from "../reducers/auth/auth";
import goProGorilla from "../img/pro-pop-up-icon-plain.svg"
import config from "../config";
import {useEffect, useRef, useState} from "react";
import proBackground from "../img/popu-up-backgraound-plain.svg";
import {Close} from "@material-ui/icons";
import premiumGorilla from "../img/pro-pop-up-icon-plain.svg";
import {LoadingButton} from "@mui/lab";

interface IProps {
    wsId: string;
};


const DevSpaceControls = (props: React.PropsWithChildren<IProps>) => {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const dispatch = useAppDispatch();
    const holiday = isHoliday();

    const usageCache = useAppSelector(selectDevSpaceCacheState);
    let cachedValues = (
        usageCache[props.wsId] !== undefined &&
        usageCache[props.wsId].usage !== undefined &&
        usageCache[props.wsId].usage.timestamp > Date.now() - 30_000
    ) ? usageCache[props.wsId].usage as DevSpaceCache : null

    const [isOpen, setIsOpen] = React.useState(false);

    const [workspace, setWorkspace] = React.useState<Workspace | null>(cachedValues && cachedValues.workspace ? cachedValues.workspace : null);
    const [cpuUsagePercentage, setCpuUsagePercentage] = React.useState<number>(cachedValues ? cachedValues.cpuPercentage : 0);
    const [memoryUsagePercentage, setMemoryUsagePercentage] = React.useState<number>(cachedValues ? cachedValues.memoryPercentage : 0);
    const [cpuLimit, setCpuLimit] = React.useState<number>(cachedValues ? cachedValues.cpuLimit : 0);
    const [memoryLimit, setMemoryLimit] = React.useState<number>(cachedValues ? cachedValues.memoryLimit : 0);
    const [cpuUsage, setCpuUsage] = React.useState<number>(cachedValues ? cachedValues.cpuUsage : 0);
    const [memoryUsage, setMemoryUsage] = React.useState<number>(cachedValues ? cachedValues.memoryUsage : 0);
    const [proMonthlyLink, setProMonthlyLink] = React.useState("");
    const [proYearlyLink, setProYearlyLink] = React.useState("");
    const [proUrlsLoading, setProUrlsLoading] = React.useState(false);
    const [goProPopup, setGoProPopup] = useState(false)

    const authState = useAppSelector(selectAuthState);

    let premium = authState.role.toString()
    // //remove after testing
    // premium = "0"

    let globalWs = useGlobalWebSocket();

    const handleWsMessage = (message: WsMessage<any>) => {
        // attempt to parse json message
        let jsonMessage: any | null = null
        try {
            jsonMessage = message.payload;
        } catch (e) {
            console.log("websocket json decode error: ", e);
            return
        }

        if (jsonMessage === null) {
            console.log("unexpected null message")
            return
        }

        // handle workspace
        if (jsonMessage["workspace"]) {
            // only update if this is the same workspace
            if (jsonMessage["workspace"] && jsonMessage["workspace"]["_id"] && jsonMessage["workspace"]["_id"] === props.wsId) {
                setWorkspace(jsonMessage["workspace"])
            }
        }

        // handle resource utilization
        if (jsonMessage["resources"] && window.location.pathname.startsWith("/launchpad/")) {
            // only update if this is the same workspace
            if (jsonMessage["workspace"] && jsonMessage["workspace"]["_id"] && jsonMessage["workspace"]["_id"] === props.wsId) {
                setCpuUsagePercentage(jsonMessage["resources"]["cpu"] * 100)
                setMemoryUsagePercentage(jsonMessage["resources"]["memory"] * 100)
                setCpuUsage(jsonMessage["resources"]["cpu_usage"] / 1000)
                setMemoryUsage(jsonMessage["resources"]["memory_usage"] / 1_000_000_000)
                setCpuLimit(jsonMessage["resources"]["cpu_limit"] / 1000)
                setMemoryLimit(jsonMessage["resources"]["memory_limit"] / 1_000_000_000)

                dispatch(setDevSpaceCache(props.wsId, {
                    cpuUsage: jsonMessage["resources"]["cpu_usage"] / 1000,
                    cpuPercentage: jsonMessage["resources"]["cpu"] * 100,
                    cpuLimit: jsonMessage["resources"]["cpu_limit"] / 1000,
                    memoryUsage: jsonMessage["resources"]["memory_usage"] / 1_000_000_000,
                    memoryPercentage: jsonMessage["resources"]["memory"] * 100,
                    memoryLimit: jsonMessage["resources"]["memory_limit"] / 1_000_000_000,
                    timestamp: Date.now(),
                }));
            }
        }
    }

    globalWs.registerCallback(
        WsMessageType.WorkspaceStatusUpdate,
        `workspace:usage:${props.wsId}`,
        handleWsMessage
    );

    const retrieveProUrls = async (): Promise<{ monthly: string, yearly: string } | null> => {
        setProUrlsLoading(true)
        let res = await call(
            "/api/stripe/premiumMembershipSession",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        setProUrlsLoading(false)

        if (res !== undefined && res["return url"] !== undefined && res["return year"] !== undefined) {
            setProMonthlyLink(res["return url"])
            setProYearlyLink(res["return year"])
            return {
                "monthly": res["return url"],
                "yearly": res["return year"],
            }
        }

        return null
    }

    useEffect(() => {
        if (premium === "0") {
            retrieveProUrls()
        }
    }, [])

    const containerRef = useRef(null)

    const stopWorkspace = async () => {
        let res = await call(
            "/api/workspace/stopWorkspace",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                workspace_id: props.wsId,
            }
        )

        window.history.replaceState({}, "", window.location.href.split("?")[0]);
    };

    const usageMemo = React.useMemo(() => (
        <>
            {/* CPU Usage Progress Bar */}
            <div style={{ marginTop: '8px', position: 'relative' }}>
                <div
                    style={{
                        color: cpuUsagePercentage < 75 ? theme.palette.text.primary : cpuUsagePercentage < 90 ? theme.palette.warning.main : theme.palette.error.main
                    }}
                >
                    CPU
                </div>
                <LinearProgress
                    variant="determinate"
                    value={cpuUsagePercentage}
                    color={cpuUsagePercentage < 75 ? "primary" : cpuUsagePercentage < 90 ? "warning" : "error"}
                    sx={{
                        height: "10px",
                        borderRadius: "10px",
                        ...(cpuUsagePercentage >= 90 && { animation: 'glitch 1s infinite' })
                    }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 5,
                    right: 0,
                    fontSize: '0.8em',
                    color: cpuUsagePercentage < 75 ? theme.palette.text.primary : cpuUsagePercentage < 90 ? theme.palette.warning.main : theme.palette.error.main
                }}>
                    {cpuUsage.toFixed(2)}/{cpuLimit} Cores
                </div>
            </div>

            {/* Memory Usage Progress Bar */}
            <div style={{ marginTop: '8px', position: 'relative' }}>
                <div
                    style={{
                        color: memoryUsagePercentage < 75 ? theme.palette.text.primary : memoryUsagePercentage < 90 ? theme.palette.warning.main : theme.palette.error.main
                    }}
                >
                    Memory
                </div>
                <LinearProgress
                    variant="determinate"
                    value={memoryUsagePercentage}
                    color={memoryUsagePercentage < 75 ? "secondary" : memoryUsagePercentage < 90 ? "warning" : "error"}
                    sx={{
                        height: "10px",
                        borderRadius: "10px",
                        ...(memoryUsagePercentage >= 90 && { animation: 'glitch 1s infinite' })
                    }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 5,
                    right: 0,
                    fontSize: '0.8em',
                    color: memoryUsagePercentage < 75 ? theme.palette.text.primary : memoryUsagePercentage < 90 ? theme.palette.warning.main : theme.palette.error.main
                }}>
                    {Math.round(memoryUsage)}/{memoryLimit}MB
                </div>
            </div>
        </>
    ), [cpuUsage, cpuUsagePercentage, cpuLimit, memoryUsage, memoryUsagePercentage, memoryLimit])

    return (
        <>
            <style>
                {`
                        @keyframes glitch {
                            0% {
                                transform: translate(0);
                                opacity: 1;
                            }
                            20% {
                                transform: translate(-1px, 1px);
                                opacity: 0.4;
                            }
                            40% {
                                transform: translate(1px, -1px);
                                opacity: 0.9;
                            }
                            60% {
                                transform: translate(-1px, -1px);
                                opacity: 0.6;
                            }
                            80% {
                                transform: translate(1px, 1px);
                                opacity: 0.95;
                            }
                            100% {
                                transform: translate(0);
                                opacity: 1;
                            }
                        }
                    `}
            </style>
            <style>
                {`
                        @keyframes fade {
                            0% {
                                opacity: 1;
                            }
                            50% {
                                opacity: 0.6;
                            }
                            100% {
                                opacity: 1;
                            }
                        }
                    `}
            </style>
            <Tooltip title="Open DevSpace Controls">
                <IconButton
                    onClick={() => setIsOpen(!isOpen)}
                    color={((cpuUsagePercentage >= 90 || memoryUsagePercentage >= 90) ? "error" : (cpuUsagePercentage >= 75 || memoryUsagePercentage >= 75) ? "warning" : "inherit")}
                    sx={{
                        ...((cpuUsagePercentage >= 75 || memoryUsagePercentage >= 75) ? { animation: 'fade 1s infinite' } : { color: "black" })
                    }}
                    ref={containerRef}
                >
                    <SettingsApplicationsIcon />
                </IconButton>
            </Tooltip>

            {isOpen && (
                <Paper elevation={3} style={{
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'absolute',
                    top: '70%',
                    left: "50%",
                    transform: 'translate(-50%, 0)',
                    width: window.innerWidth < 1000 ? "90vw" : '30vw',
                    minWidth: "150px",
                    maxWidth: window.innerWidth < 1000 ? "99vw" : "400px"
                }}>
                    <Box sx={{display: "flex", width: "100%", flexDirection: "row", justifyContent: "center"}}>
                        <Tooltip title="Go Back">
                            <IconButton color="error" onClick={async () => {
                                window.history.replaceState({}, "", window.location.href.split("?")[0]);
                                window.location.reload();
                            }}>
                                <ArrowBackIcon/>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Stop Workspace">
                            <IconButton color="warning" onClick={() => stopWorkspace()}>
                                <StopIcon/>
                            </IconButton>
                        </Tooltip>

                        {
                            window.location.pathname.startsWith("/launchpad/") ? (
                                new URLSearchParams(window.location.search).get("desktop") === "none" ? (
                                    <>
                                        <Tooltip title="View Desktop">
                                            <IconButton color="success" onClick={async () => {
                                                window.history.replaceState({}, "", window.location.href.split("?")[0] + "?editor=true&desktop=side");
                                                window.location.reload();
                                            }}>
                                                <DesktopWindowsIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Open Desktop In New Tab">
                                            <IconButton color="success" onClick={async () => {
                                                window.history.replaceState({}, "", window.location.href.split("?")[0] + "?editor=true&desktop=popped-out");
                                                window.location.reload();
                                            }}>
                                                <QueuePlayNextIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : new URLSearchParams(window.location.search).get("desktop") === "side" ? (
                                    <>
                                        <Tooltip title="Close Desktop">
                                            <IconButton color="error" onClick={async () => {
                                                window.history.replaceState({}, "", window.location.href.split("?")[0] + "?editor=true&desktop=none");
                                                window.location.reload();
                                            }}>
                                                <DesktopAccessDisabledIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Open Desktop In New Tab">
                                            <IconButton color="success" onClick={async () => {
                                                window.history.replaceState({}, "", window.location.href.split("?")[0] + "?editor=true&desktop=popped-out");
                                                window.location.reload();
                                            }}>
                                                <QueuePlayNextIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : new URLSearchParams(window.location.search).get("desktop") === "popped-out" ? (
                                    <>
                                        <Tooltip title="View Desktop">
                                            <IconButton color="success" onClick={async () => {
                                                window.history.replaceState({}, "", window.location.href.split("?")[0] + "?editor=true&desktop=side");
                                                window.location.reload();
                                            }}>
                                                <DesktopWindowsIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : null
                            ) : null
                        }
                    </Box>
                    <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "10px", backgroundColor: theme.palette.background.default,
                        borderRadius: "10px",
                        border: `1px solid ${theme.palette.primary.main}`}}>
                        <div>
                            <Typography variant={"subtitle1"}>Need More Resources?</Typography>
                            <Button variant={"outlined"} onClick={() => {
                                setGoProPopup(true)
                                setIsOpen(false)
                            }}>Go Pro</Button>
                        </div>
                        <img src={goProGorilla} alt={"Go Pro"} height={"50px"}/>
                    </div>
                    {usageMemo}

                    {/* Ports */}
                    <div style={{marginTop: '8px', position: 'relative'}}>
                        <div>
                            Ports
                        </div>
                        <Grid container spacing={1} direction={"row"} alignItems={'stretch'} sx={{
                            marginTop: '8px',
                            marginBottom: '8px'
                        }}>
                            {(workspace && workspace["ports"]) ? workspace["ports"].map((port: {
                                name: string;
                                port: string;
                                url: string,
                                disabled: boolean
                            }, index: any) => {
                                return (
                                    <Grid item xs={"auto"}>
                                        <Button
                                            href={port.url}
                                            target="_blank"
                                            variant={"outlined"}
                                            disabled={port.disabled}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: theme.palette.primary.main + "25",
                                                }
                                            }}
                                        >
                                            {port.name !== "" ? port.name + "  -  " + port.port : port.port}
                                        </Button>
                                    </Grid>
                                )
                            }) : (
                                <Typography variant="body2" sx={{marginLeft: "8px"}}>
                                    No Ports Available
                                </Typography>
                            )}
                        </Grid>
                    </div>
                </Paper>
            )}
            <Popper open={goProPopup} anchorEl={containerRef.current}>
                <Box style={{
                    width: window.innerWidth < 1000 ? "90vw" : "24vw",
                    height: window.innerWidth < 1000 ? "78vh": "65vh",
                    minHeight: "420px",
                    // justifyContent: "center",
                    // marginLeft: "25vw",
                    // marginTop: "5vh",
                    outlineColor: "black",
                    borderRadius: "7%",
                    boxShadow:
                        "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px  0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                    // backgroundColor: theme.palette.background.default,
                    backgroundImage: `url(${proBackground})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center center",
                    zIndex: 1000,
                    // ...themeHelpers.frostedGlass
                }}>
                    <div style={{
                        borderRadius: "10px",
                        padding: "20px",
                        textAlign: "center"
                    }}>
                        <IconButton
                            edge="end"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setGoProPopup(false)
                            }}

                            sx={window.innerWidth < 1000 ? {
                                position: "absolute",
                                top: '2vh',
                                right: '2vw',
                                color: "white"
                            } : {
                                position: "absolute",
                                top: '2vh',
                                right: '2vw', color: "white"
                            }}
                        >
                            <Close/>
                        </IconButton>
                        <img src={premiumGorilla} style={{width: "30%", marginBottom: "20px"}}/>
                        <Typography variant={"h4"} style={{marginBottom: "10px", color: "white"}} align={"center"}>GIGO
                            Pro</Typography>
                        <Typography variant={"body1"} style={{marginLeft: "20px", marginRight: "20px", color: "white"}}
                                    align={"center"}>
                            Learn faster with a smarter Code Teacher!
                        </Typography>
                        <Typography variant={"body1"}
                                    style={{
                                        marginBottom: "20px",
                                        marginLeft: "20px",
                                        marginRight: "20px",
                                        color: "white"
                                    }}
                                    align={"center"}>
                            Do more with larger DevSpaces!
                        </Typography>
                        <div style={{
                            display: "flex",
                            justifyContent: "center"
                        }}>
                            <div style={{
                                backgroundColor: "#070D0D",
                                borderRadius: "10px",
                                padding: "20px",
                                margin: "10px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                textAlign: "center",
                                width: "200px"
                            }}>
                                <Typography variant={"subtitle1"} style={{marginBottom: "10px", color: "white"}}
                                            align={"center"}>1 Month</Typography>
                                <Typography variant={"h5"} style={{marginBottom: "10px", color: "white"}}
                                            align={"center"}>$15
                                    / MO</Typography>
                                <LoadingButton
                                    loading={proUrlsLoading}
                                    variant="contained"
                                    onClick={() => window.open(proMonthlyLink, "_blank")}
                                    style={{backgroundColor: theme.palette.secondary.dark}}
                                >
                                    Select
                                </LoadingButton>
                            </div>
                            <div style={{
                                backgroundColor: "#070D0D",
                                borderRadius: "10px",
                                padding: "20px",
                                margin: "10px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                textAlign: "center",
                                width: "200px"
                            }}>
                                <Typography variant={"subtitle1"} style={{marginBottom: "10px", color: "white"}}
                                            align={"center"}>12 Months</Typography>
                                <Typography variant={"h5"} style={{marginBottom: "10px", color: "white"}}
                                            align={"center"}>$11.25
                                    / MO</Typography>
                                <LoadingButton
                                    loading={proUrlsLoading}
                                    variant="contained"
                                    onClick={() => window.open(proYearlyLink, "_blank")}
                                    style={{backgroundColor: theme.palette.secondary.dark}}
                                >
                                    Select
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </Box>
            </Popper>
        </>
    )
};

export default DevSpaceControls;