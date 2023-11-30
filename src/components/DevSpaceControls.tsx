import * as React from 'react';
import { useGlobalWebSocket } from '../services/websocket';
import { WsMessage, WsMessageType } from '../models/websocket';
import LinearProgress from '@mui/material/LinearProgress';
import { Box, IconButton, PaletteMode, Paper, Tooltip, createTheme } from '@mui/material';
import { getAllTokens } from '../theme';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StopIcon from '@mui/icons-material/Stop';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import DesktopAccessDisabledIcon from '@mui/icons-material/DesktopAccessDisabled';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import call from '../services/api-call';
import { DevSpaceUsageCache, selectDevSpaceUsageCacheState, setDevSpaceUsageCache } from '../reducers/devSpace/usageCache';
import { useAppDispatch, useAppSelector } from '../app/hooks';

interface IProps {
    openCallback: ((open: boolean) => void);
    isOpen?: boolean;
    wsId: string;
};


const DevSpaceControls = React.forwardRef<HTMLAnchorElement, IProps>((props: React.PropsWithChildren<IProps>, ref) => {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const dispatch = useAppDispatch();

    const usageCache = useAppSelector(selectDevSpaceUsageCacheState);
    let cachedValues = (
        usageCache[props.wsId] !== undefined &&
        usageCache[props.wsId].usage !== undefined &&
        usageCache[props.wsId].usage.timestamp > Date.now() - 30_000
    ) ? usageCache[props.wsId].usage as DevSpaceUsageCache : null

    const [cpuUsagePercentage, setCpuUsagePercentage] = React.useState<number>(cachedValues ? cachedValues.cpuPercentage : 0);
    const [memoryUsagePercentage, setMemoryUsagePercentage] = React.useState<number>(cachedValues ? cachedValues.memoryPercentage : 0);
    const [cpuLimit, setCpuLimit] = React.useState<number>(cachedValues ? cachedValues.cpuLimit : 0);
    const [memoryLimit, setMemoryLimit] = React.useState<number>(cachedValues ? cachedValues.memoryLimit : 0);
    const [cpuUsage, setCpuUsage] = React.useState<number>(cachedValues ? cachedValues.cpuUsage : 0);
    const [memoryUsage, setMemoryUsage] = React.useState<number>(cachedValues ? cachedValues.memoryUsage : 0);

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

        // exit if there's no resource utilization
        if (!jsonMessage["resources"]) {
            return
        }

        // exit if this is not the launchpad
        if (!window.location.pathname.startsWith("/launchpad/")) {
            return
        }

        // load the id from the path
        let id = window.location.pathname.split("/launchpad/")[1]
        if (id.endsWith("/")) {
            // trim final slash
            id = id.replaceAll("/", "")
        }
        // skip if the workspace isn't the same one
        if (!jsonMessage["workspace"] || !jsonMessage["workspace"]["_id"] || jsonMessage["workspace"]["_id"] !== id) {
            return
        }

        setCpuUsagePercentage(jsonMessage["resources"]["cpu"] * 100)
        setMemoryUsagePercentage(jsonMessage["resources"]["memory"] * 100)
        setCpuUsage(jsonMessage["resources"]["cpu_usage"] / 1000)
        setMemoryUsage(jsonMessage["resources"]["memory_usage"] / 1_000_000_000)
        setCpuLimit(jsonMessage["resources"]["cpu_limit"] / 1000)
        setMemoryLimit(jsonMessage["resources"]["memory_limit"] / 1_000_000_000)

        dispatch(setDevSpaceUsageCache(props.wsId, {
            cpuUsage: jsonMessage["resources"]["cpu_usage"] / 1000,
            cpuPercentage: jsonMessage["resources"]["cpu"] * 100,
            cpuLimit: jsonMessage["resources"]["cpu_limit"] / 1000,
            memoryUsage: jsonMessage["resources"]["memory_usage"] / 1_000_000_000,
            memoryPercentage: jsonMessage["resources"]["memory"] * 100,
            memoryLimit: jsonMessage["resources"]["memory_limit"] / 1_000_000_000,
            timestamp: Date.now(),
        }));
    }

    globalWs.registerCallback(
        WsMessageType.WorkspaceStatusUpdate,
        `workspace:usage:${window.location.pathname.split("/launchpad/")[1]}`,
        handleWsMessage
    );

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
                    ref={ref}
                    onClick={() => props.openCallback(!props.isOpen)}
                    color={((cpuUsagePercentage >= 90 || memoryUsagePercentage >= 90) ? "error" : (cpuUsagePercentage >= 75 || memoryUsagePercentage >= 75) ? "warning" : "inherit")}
                    sx={{
                        ...((cpuUsagePercentage >= 75 || memoryUsagePercentage >= 75) ? { animation: 'fade 1s infinite' } : {})
                    }}
                    href={""}
                >
                    <SettingsApplicationsIcon />
                </IconButton>
            </Tooltip>

            {props.isOpen && (
                <Paper elevation={3} style={{
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'absolute',
                    top: '70%',
                    left: "50%",
                    transform: 'translate(-50%, 0)',
                    width: '30vw',
                    minWidth: "150px",
                    maxWidth: "400px"
                }}>
                    <Box sx={{ display: "flex", width: "100%", flexDirection: "row", justifyContent: "center" }}>
                        <Tooltip title="Go Back">
                            <IconButton color="error" onClick={async () => {
                                window.history.replaceState({}, "", window.location.href.split("?")[0]);
                                window.location.reload();
                            }}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Stop Workspace">
                            <IconButton color="warning" onClick={() => stopWorkspace()}>
                                <StopIcon />
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
                                                <DesktopWindowsIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Open Desktop In New Tab">
                                            <IconButton color="success" onClick={async () => {
                                                window.history.replaceState({}, "", window.location.href.split("?")[0] + "?editor=true&desktop=popped-out");
                                                window.location.reload();
                                            }}>
                                                <QueuePlayNextIcon />
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
                                                <DesktopAccessDisabledIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Open Desktop In New Tab">
                                            <IconButton color="success" onClick={async () => {
                                                window.history.replaceState({}, "", window.location.href.split("?")[0] + "?editor=true&desktop=popped-out");
                                                window.location.reload();
                                            }}>
                                                <QueuePlayNextIcon />
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
                                                <DesktopWindowsIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : null
                            ) : null
                        }
                    </Box>
                    {usageMemo}
                </Paper>
            )}
        </>
    )
});

export default DevSpaceControls;