import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {
    alpha,
    Box, Button, CircularProgress,
    createTheme,
    CssBaseline,
    Dialog, DialogContent,
    DialogTitle, Grid, IconButton,
    List,
    ListItem,
    ListItemText,
    PaletteMode,
    SpeedDial,
    SpeedDialAction,
    ThemeProvider,
    Tooltip,
    Typography,
} from "@mui/material";
import {getAllTokens} from "../theme";
import {KeyboardArrowUp, PlayArrow} from "@material-ui/icons";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {useNavigate} from "react-router-dom";
import swal from "sweetalert";
import call from "../services/api-call";
import 'ace-builds';
import 'ace-builds/webpack-resolver';
import config from "../config";
import {useParams} from "react-router";
import {useGlobalWebSocket} from "../services/websocket";
import {WsGenericErrorPayload, WsMessage, WsMessageType} from "../models/websocket";
import {ExecResponsePayload, OutputRow} from "../models/bytes";
import {programmingLanguages} from "../services/vars";
import {LoadingButton} from "@mui/lab";
import Editor from "../components/IDE/Editor";
import chroma from 'chroma-js';
import SheenPlaceholder from "../components/Loading/SheenPlaceholder";
import {sleep} from "../services/utils";
import {Extension, ReactCodeMirrorRef} from "@uiw/react-codemirror";
import {selectAuthState} from "../reducers/auth/auth";
import {initialBytesStateUpdate, selectBytesState, updateBytesState} from "../reducers/bytes/bytes";
import ByteTerminal from "../components/Terminal";
import './byteMobile.css';
import ByteNextOutputMessageMobile from "../components/CodeTeacher/ByteNextOutputMessageMobile";
import ByteNextStepMobile from "../components/CodeTeacher/ByteNextStepMobile";
import HomeIcon from "@mui/icons-material/Home";
import CTIcon from '../img/codeTeacher/CT-icon-simple.svg';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import ByteChatMobile from "../components/CodeTeacher/ByteChatMobile";
import NextByteDrawerMobile from "../components/NextByteDrawerMobile";
import MenuIcon from '@mui/icons-material/Menu';
import PinIcon from '@mui/icons-material/Pin';
import {LaunchLspRequest} from "../models/launch_lsp";
import {
    CtGenericErrorPayload,
    CtMessage,
    CtMessageOrigin,
    CtMessageType, CtParseFileRequest,
    CtParseFileResponse, CtValidationErrorPayload,
    Node as CtParseNode
} from "../models/ct_websocket";
import {ctCreateCodeActions} from "../components/IDE/Extensions/CtCodeActionExtension";
import {debounce} from "lodash";
import {useGlobalCtWebSocket} from "../services/ct_websocket";
import {createCtPopupExtension, CtPopupExtensionEngine} from "../components/IDE/Extensions/CtPopupExtension";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import LinkIcon from "@mui/icons-material/Link";
import ByteSuggestions2Mobile from "../components/CodeTeacher/ByteSuggestions2Mobile";
import ByteSuggestions2 from "../components/CodeTeacher/ByteSuggestions2";
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from "@material-ui/icons/Close";
import {styled} from "@mui/system";
import { BugReportOutlined } from "@material-ui/icons";
import { Circle } from "@mui/icons-material";
import ConstructionIcon from '@mui/icons-material/Construction';


interface MergedOutputRow {
    error: boolean;
    content: string;
    timestamp: number;
}

interface OutputState {
    stdout: OutputRow[];
    stderr: OutputRow[];
    merged: string;
    mergedLines: MergedOutputRow[];
}

interface BytesData {
    _id: string;
    name: string;
    lang: number;
    color: string;
    published: boolean;

    description_easy: string;
    outline_content_easy: string;
    dev_steps_easy: string;

    description_medium: string;
    outline_content_medium: string;
    dev_steps_medium: string;

    description_hard: string;
    outline_content_hard: string;
    dev_steps_hard: string;
}

function ByteMobile() {
    let userPref = localStorage.getItem('theme');
    const [mode, _] = useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [xpPopup, setXpPopup] = React.useState(false)
    const [xpData, setXpData] = React.useState(null)

    const authState = useAppSelector(selectAuthState);
    const bytesState = useAppSelector(selectBytesState)

    const [terminalVisible, setTerminalVisible] = useState(false);

    const containerStyleDefault: React.CSSProperties = {
        width: '100%',
        margin: '0',
        maxWidth: 'none',
        overflowY: "hidden"
    };

    const topContainerStyle: React.CSSProperties = {
        display: 'flex',
        overflowY: "hidden",
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        height: "100%",
        marginTop: '5px'
    };

    const titlePlaceholderContainerStyle: React.CSSProperties = {
        display: "flex",
        padding: theme.spacing(1),
        alignItems: 'center',
        width: "100%",
    };

    const titleStyle: React.CSSProperties = {
        textAlign: 'center',
        width: "100%",
        fontSize: '0.8rem',
        marginTop: "-3%",
    };

    const titlePlaceholderStyle: React.CSSProperties = {
        margin: "auto"
    }

    const fixedElementsHeight = 48;

    const editorAndTerminalStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: `calc(100vh - ${fixedElementsHeight}px)`,
        width: "100%",
        minWidth: `100%`,
        alignItems: 'center',
        overflowX: 'auto',
        position: 'relative',
        overflowY: 'hidden',
    };

    const editorStyle: React.CSSProperties = {
        height: '100%',
        width: '100%',
        overflowX: 'auto',
        maxWidth: '100%',
    };


    // Define the state and dispatch hook
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Define the state for your data and loading state
    const [byteData, setByteData] = useState<BytesData | null>(null);
    const [recommendedBytes, setRecommendedBytes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialCode, setInitialCode] = useState("// Write your code here...");
    const [code, setCode] = useState("// Write your code here...");
    const [longLine, setLongLine] = useState(false);
    const [isButtonActive, setIsButtonActive] = useState(false);
    const [isReceivingData, setIsReceivingData] = useState(false);

    const [output, setOutput] = useState<OutputState | null>(null);

    const [loadingCodeCleanup, setLoadingCodeCleanup] = React.useState<string | null>(null);
    const [lspActive, setLspActive] = React.useState(false)
    const [workspaceCreated, setWorkspaceCreated] = useState(false);
    const [containerStyle, setContainerSyle] = useState<React.CSSProperties>(containerStyleDefault)
    const [cursorPosition, setCursorPosition] = useState<{ row: number, column: number } | null>(null)
    const [codeBeforeCursor, setCodeBeforeCursor] = useState("");
    const [codeAfterCursor, setCodeAfterCursor] = useState("");
    const [outputPopup, setOutputPopup] = useState(false);
    const [byteAttemptId, setByteAttemptId] = useState("");
    const [easyCode, setEasyCode] = useState("");
    const [mediumCode, setMediumCode] = useState("");
    const [hardCode, setHardCode] = useState("");
    const typingTimerRef = useRef(null);
    const [suggestionPopup, setSuggestionPopup] = useState(false);
    const [nextStepsPopup, setNextStepsPopup] = useState(false);
    const [commandId, setCommandId] = useState("");
    const [isDifficultyPopupOpen, setIsDifficultyPopupOpen] = useState(false);
    const [executingCode, setExecutingCode] = useState<boolean>(false)
    const [suggestionRange, setSuggestionRange] = useState<{start_line: number, end_line: number} | null>(null);
    const [userHasModified, setUserHasModified] = React.useState(false)
    const [parsedSymbols, setParsedSymbols] = useState<CtParseFileResponse | null>(null)
    const [lastParse, setLastParse] = useState("")
    const [editorExtensions, setEditorExtensions] = useState<Extension[]>([])
    const popupEngineRef = React.useRef<CtPopupExtensionEngine | null>(null);
    const popupExtRef = React.useRef<Extension | null>(null);
    const [codeActionPortals, setCodeActionPortals] = useState<{id: string, portal: React.ReactPortal}[]>([])
    const [connectButtonLoading, setConnectButtonLoading] = useState<boolean>(false)



    const pingInterval = React.useRef<NodeJS.Timer | null>(null)

    const editorContainerRef = React.useRef<HTMLDivElement>(null);
    const editorRef = React.useRef<ReactCodeMirrorRef>(null);
    const [tabValue, setTabValue] = useState(0);
    const [activeView, setActiveView] = useState("editor");
    const [activeSidebarTab, setActiveSidebarTab] = React.useState<string | null>(null);
    const [nextByteDrawerOpen, setNextByteDrawerOpen] = useState(false);
    const [isSpeedDialVisible, setSpeedDialVisibility] = useState(true);
    const [speedDialOpen, setSpeedDialOpen] = useState(false);
    const [workspaceState, setWorkspaceState] = useState<null | number>(null);
    const [workspaceId, setWorkspaceId] = useState<string>('')
    const [helpPopupOpen, setHelpPopupOpen] = useState(false);

    const [editorStyles, setEditorStyles] = useState({
        fontSize: '14px',
    });

    let ctWs = useGlobalCtWebSocket();

    let {id} = useParams();

    let globalWs = useGlobalWebSocket();

    const determineDifficulty = React.useCallback(() => {
        if (bytesState.initialized) {
            return bytesState.byteDifficulty
        }
        if (authState.tier < 3) {
            return 0
        }
        if (authState.tier < 6) {
            return 1
        }
        return 2
    }, [bytesState.byteDifficulty])

    const difficultyToString = (difficulty: number): string => {
        if (difficulty === 0) {
            return "easy"
        }
        if (difficulty === 1) {
            return "medium"
        }
        return "hard"
    }

    const updateCode = (newCode: string) => {
        const message = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: WsMessageType.ByteUpdateCode,
            payload: {
                byte_attempt_id: byteAttemptId,
                content: newCode,
                content_difficulty: bytesState ? bytesState.byteDifficulty : 0
            }
        };

        globalWs.sendWebsocketMessage(message, null);
    };

    const cancelCodeExec = (commandId: string) => {

        const message = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: WsMessageType.CancelExecRequest,
            payload: {
                byte_attempt_id: byteAttemptId,
                payload: {
                    command_id: commandId,
                }
            }
        };

        globalWs.sendWebsocketMessage(message, null);

        // Set executingCode false to indicate that execution has been stopped
        setExecutingCode(false);
    };

    const stdInExecRequest = (commandId: string, input: string) => {

        const message = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: WsMessageType.StdinExecRequest,
            payload: {
                byte_attempt_id: byteAttemptId,
                payload: {
                    command_id: commandId,
                    input: input + "\n"
                }
            }
        };

        globalWs.sendWebsocketMessage(message, null);

    };

    const byteWebSocketPing = () => {
        globalWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: WsMessageType.ByteLivePing,
            payload: {
                byte_attempt_id: byteAttemptId
            }
        }, null);
    };

    const startPing = React.useCallback(() => {
        if (byteAttemptId && pingInterval.current === null) {
            byteWebSocketPing(); // Send the first ping immediately
            pingInterval.current = setInterval(byteWebSocketPing, 60000); // Then start the interval
        }
    }, [byteAttemptId]);

    const stopPing = () => {
        if (pingInterval.current) {
            clearInterval(pingInterval.current);
            pingInterval.current = null;
        }
    };

    useEffect(() => {
        // Add event listeners for focus and blur
        window.addEventListener('focus', startPing);
        window.addEventListener('blur', stopPing);

        // Start ping if tab is already in focus when component mounts
        if (document.hasFocus()) {
            startPing();
        }

        return () => {
            stopPing();
            // Remove event listeners
            window.removeEventListener('focus', startPing);
            window.removeEventListener('blur', stopPing);
        };
    }, [byteAttemptId]);

    useEffect(() => {
        // Collapse the terminal when the difficulty changes
        setTerminalVisible(false);
    }, [bytesState.byteDifficulty]);

    const sendExecRequest = (retryCount: number = 0) => {
        const message = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: WsMessageType.AgentExecRequest,
            payload: {
                byte_attempt_id: byteAttemptId,
                payload: {
                    lang: byteData ? byteData.lang : 5,
                    code: code
                }
            }
        };

        setIsReceivingData(true);
        setTerminalVisible(true)
        setOutput({
            stdout: [{timestamp: Date.now() * 1000, content: "Running..."}],
            stderr: [],
            merged: "Running...",
            mergedLines: [{timestamp: Date.now() * 1000, content: "Running...", error: false}],
        });
        setExecutingCode(true)
        setCommandId("");
        globalWs.sendWebsocketMessage(
            message,
            (msg: WsMessage<any>): boolean => {
                if (msg.type !== WsMessageType.AgentExecResponse) {
                    if (msg.type === WsMessageType.GenericError) {
                        const payload = msg.payload as WsGenericErrorPayload;

                        if (payload.error === "workspace is not active" || payload.error === "cannot find workspace or workspace agent") {
                            if (retryCount >= 60) {
                                setOutput({
                                    stdout: [],
                                    stderr: [{
                                        timestamp: Date.now() * 1000,
                                        content: "Failed to connect to DevSpace"
                                    }],
                                    merged: "Failed to connect to DevSpace",
                                    mergedLines: [{
                                        error: true,
                                        timestamp: Date.now() * 1000,
                                        content: "Failed to connect to DevSpace",
                                    }],
                                })

                                setExecutingCode(false)
                                return true
                            }
                            // wait 1s and try again
                            sleep(1000).then(() => {
                                sendExecRequest(retryCount + 1)
                            })
                            return true
                        }
                    }
                    return true;
                }

                const payload = msg.payload as ExecResponsePayload;

                if (payload.command_id_string) {
                    setCommandId(payload.command_id_string);
                }
                const {stdout, stderr, done} = payload;

                // skip the processing if this is the first response
                if (stdout.length === 0 && stderr.length === 0) {
                    return false;
                }

                // merge all the lines together
                let mergedRows: MergedOutputRow[] = [];
                mergedRows = mergedRows.concat(stdout.map(row => ({
                    content: row.content,
                    error: false,
                    timestamp: row.timestamp
                }))).sort((a, b) => a.timestamp - b.timestamp);
                mergedRows = mergedRows.concat(stderr.map(row => ({
                    content: row.content,
                    error: true,
                    timestamp: row.timestamp
                }))).sort((a, b) => a.timestamp - b.timestamp);

                // sort the lines by timestamp
                mergedRows = mergedRows.sort((a, b) => a.timestamp - b.timestamp);

                // assemble the final output state and set it
                setOutput({
                    stdout: stdout,
                    stderr: stderr,
                    merged: mergedRows.map(row => row.content).join("\n"),
                    mergedLines: mergedRows,
                })

                setExecutingCode(!done)
                if (done && !outputPopup) {
                    setOutputPopup(true)
                }

                // we only return true here if we are done since true removes this callback
                return done
            }
        );
        setIsReceivingData(false)
    };


    const getRecommendedBytes = async () => {
        let recommendedBytes = await call(
            "/api/bytes/getRecommendedBytes",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        );

        const [res] = await Promise.all([recommendedBytes]);

        if (res === undefined) {
            swal("Server Error", "Cannot fetch recommended bytes. Please try again later.");
            return;
        }

        if (res["rec_bytes"] === undefined) {
            swal("Server Error", "Cannot fetch recommended bytes. Please try again later.");
            return;
        }

        if (res["rec_bytes"]) {
            const enhancedBytes = res["rec_bytes"].map((byte: any) => ({
                ...byte,
                id: byte._id,
                completedEasy: byte["completed_easy"],
                completedMedium: byte["completed_medium"],
                completedHard: byte["completed_hard"],
                language: programmingLanguages[byte.lang]
            }));
            setRecommendedBytes(enhancedBytes);
        } else {
            swal("No Bytes Found", "No recommended bytes found.");
        }
    };

    // Function to fetch the full metadata of a byte
    const getByte = async (byteId: string) => {
        try {
            const response = await call("/api/bytes/getByte",
                "POST",
                null,
                null,
                null,
                // @ts-ignore
                {byte_id: byteId},
                null,
                config.rootPath);
            const [res] = await Promise.all([response]);

            if (res && res["rec_bytes"]) {
                let outlineContent = res["rec_bytes"][`outline_content_${difficultyToString(determineDifficulty())}`]
                setInitialCode(outlineContent);
                setCode(outlineContent);
                setCodeBeforeCursor("")
                setCodeAfterCursor(outlineContent)
                setCursorPosition({row: 0, column: 0})
                setEasyCode(res["rec_bytes"]["outline_content_easy"])
                setMediumCode(res["rec_bytes"]["outline_content_medium"])
                setHardCode(res["rec_bytes"]["outline_content_hard"])

                setByteData(res["rec_bytes"])
                setWorkspaceCreated(false);
            } else {
                swal("Byte Not Found", "The requested byte could not be found.");
            }
        } catch (error) {
            swal("Error", "An error occurred while fetching the byte data.");
        }
    };

    const startByteAttempt = async (byteId: string) => {
        try {
            const response = await call(
                "/api/bytes/startByteAttempt",
                "POST",
                null,
                null,
                null,
                // @ts-ignore
                {byte_id: byteId},
                null,
                config.rootPath
            );

            const [res] = await Promise.all([response]);

            if (res === undefined) {
                swal("Server Error", "Cannot fetch byte data. Please try again later.");
                return;
            }

            if (res["byte_attempt"] !== undefined) {
                // Apply new line formatting
                let content = res["byte_attempt"]["content_medium"]

                setEasyCode(res["byte_attempt"]["content_easy"])
                setMediumCode(res["byte_attempt"]["content_medium"])
                setHardCode(res["byte_attempt"]["content_hard"])
                setCode(res["byte_attempt"][`content_${difficultyToString(determineDifficulty())}`]);
                setByteAttemptId(res["byte_attempt"]["_id"]);
            }
        } catch (error) {
            swal("Error", "An error occurred while fetching the byte attempt data.");
        }
    };

    const createWorkspace = async (byteId: string): Promise<boolean> => {
        try {
            const response = await call(
                "/api/bytes/createWorkspace",
                "POST",
                null,
                null,
                null,
                // @ts-ignore
                {byte_id: byteId},
                null,
                config.rootPath
            );

            const [res] = await Promise.all([response]);

            if (res === undefined) {
                swal("Server Error", "Cannot fetch byte data. Please try again later.");
                return false;
            }

            if (res["message"] === "Workspace Created Successfully") {
                let workspace = res["workspace"]
                if (workspace["_id"] !== workspaceId) {
                    setWorkspaceId(workspace["_id"])
                    setWorkspaceState(workspace["state"])
                }
                setWorkspaceCreated(true)
                return true
            }
        } catch (error) {
            swal("Error", "An error occurred while creating the byte workspace.");
        }
        return false
    };

    const markComplete = async () => {
        let res = await call(
            "/api/bytes/setCompleted",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                byte_id: byteAttemptId,
                difficulty: difficultyToString(determineDifficulty()),
            },
            null,
            config.rootPath
        );

        if (res === undefined) {
            swal("Server Error", "Cannot complete byte. Please try again later.");
            return;
        }

        if (res["success"] !== true) {
            swal("Server Error", "Cannot complete byte. Please try again later.");
            return;
        }

        if (res["xp"] !== undefined) {
            setXpData(res["xp"])
            setXpPopup(true)
        }
    }

    useEffect(() => {
        if (id === undefined) {
            return
        }

        setOutput(null)
        setExecutingCode(false)
        setTerminalVisible(false)
        setLoading(true);
        getRecommendedBytes()
        getByte(id).then(() => {
            if (authState.authenticated && id) {
                startByteAttempt(id);
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        const handleResize = () => {
            setEditorStyles({
                fontSize: '12px',
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        return () => {
            if (typingTimerRef.current !== null) {
                clearTimeout(typingTimerRef.current);
            }
        };
    }, []);

    const startTypingTimer = () => {
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
        }
        //@ts-ignore
        typingTimerRef.current = setTimeout(() => {
            setSuggestionPopup(true);
            setNextStepsPopup(true);
        }, 15000);
    };


    useEffect(() => {
        switch (bytesState.byteDifficulty) {
            case 0:
                setCode(easyCode);
                break
            case 1:
                setCode(mediumCode);
                break
            case 2:
                setCode(hardCode)
                break
        }
    }, [bytesState.byteDifficulty])

    useEffect(() => {
        if (popupEngineRef.current !== null) {
            return
        }
        let {ext, engine} = createCtPopupExtension();
        popupExtRef.current = ext;
        popupEngineRef.current = engine;
    }, [])

    const debouncedUpdateCode = React.useCallback(debounce(updateCode, 1000, {
        trailing: true
    }), [updateCode]);

    const parseSymbols = React.useCallback((newCode: string) => {
        if (byteData === null) {
            return
        }
        console.log("parseSymbols called ")
        ctWs.sendWebsocketMessage(
            {
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: CtMessageType.WebSocketMessageTypeParseFileRequest,
                origin: CtMessageOrigin.WebSocketMessageOriginClient,
                created_at: Date.now(),
                payload: {
                    relative_path: "main." + (byteData.lang === 5 ? "py" : "go"),
                    content: newCode,
                }
            } satisfies CtMessage<CtParseFileRequest>,
            (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtParseFileResponse>): boolean => {
                if (msg.type !== CtMessageType.WebSocketMessageTypeParseFileResponse) {
                    console.log("failed to parse file: ", msg)
                    return true
                }
                setParsedSymbols(msg.payload as CtParseFileResponse)
                console.log("Symbol set " + msg.payload)
                setLastParse(newCode);
                return true
            }
        )
    }, [byteData])

    const debouncedParseSymbols = React.useCallback(debounce(parseSymbols, 3000, {
        trailing: true
    }), [parseSymbols]);

    useEffect(() => {
        setParsedSymbols(null)
        debouncedParseSymbols(code)
    }, [code]);

    // Handle changes in the editor and activate the button
    const handleEditorChange = async (newCode: string) => {
        // Update the code state with the new content
        setCode(newCode);
        switch (bytesState.byteDifficulty) {
            case 0:
                setEasyCode(newCode);
                break
            case 1:
                setMediumCode(newCode);
                break
            case 2:
                setHardCode(newCode)
                break
        }
        startTypingTimer();

        debouncedUpdateCode(newCode);

        if (newCode && newCode !== "// Write your code here..." && newCode !== initialCode) {
            setIsButtonActive(true);

            updateCode(newCode);


        } else {
            setIsButtonActive(false);
        }

        if (!userHasModified) {
            setUserHasModified(true)
            setIsButtonActive(true);
            if (byteData) {
                for (let i = 0; i < 5; i++) {
                    let created = await createWorkspace(byteData._id);
                    if (created) {
                        break
                    }

                    if (i === 4) {
                        break
                    }
                }
            }
        }
    };

    // Add a function to handle closing the terminal
    const handleCloseTerminal = () => {
        setTerminalVisible(false);
    };

    const deleteTypingTimer = () => {
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
        }
    };

    const firstRenderRef = useRef(true);
    const buttonClickedRef = useRef(false);

    const executeCode = async () => {

        if (suggestionPopup) {
            setSuggestionPopup(false)
            if (activeSidebarTab === null || activeSidebarTab !== "nextSteps") {
                setNextStepsPopup(true)
            }
        }
        if (outputPopup) {
            return;
        }
        if (!workspaceCreated && byteData) {
            for (let i = 0; i < 5; i++) {
                let created = await createWorkspace(byteData._id);
                if (created) {
                    break
                }
                if (i === 4) {
                    setOutput({
                        stdout: [],
                        stderr: [{
                            timestamp: Date.now() * 1000,
                            content: "Failed to create DevSpace"
                        }],
                        merged: "Failed to create DevSpace",
                        mergedLines: [{
                            error: true,
                            timestamp: Date.now() * 1000,
                            content: "Failed to create DevSpace",
                        }],
                    })
                }
            }
        }
        deleteTypingTimer();
        sendExecRequest();
    };

    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false; // Set it to false on the first render
            return; // Skip the rest of the useEffect on the first render
        }
        if (!outputPopup && buttonClickedRef.current) {
            buttonClickedRef.current = false;
            if (!authState.authenticated) {
                navigate("/signup?forward="+encodeURIComponent(window.location.pathname))
                return
            }
            executeCode();
        }
        buttonClickedRef.current = false;
    }, [outputPopup]);

    useEffect(() => {
        const lines = code.split("\n");

        // detect if any lines extend beyond 80 chars
        let ll = lines.filter(x => x.length >= 80);
        setLongLine(ll.length > 0)

        if (cursorPosition === null) {
            return
        }
        if (lines[cursorPosition.row] === undefined) {
            return
        }
        let preffix = lines.filter((x, i) => i < cursorPosition.row).join("\n") + lines[cursorPosition.row].slice(0, cursorPosition.column)
        let suffix = lines[cursorPosition.row].slice(cursorPosition.column, lines[cursorPosition.row].length) + lines.filter((x, i) => i > cursorPosition.row).join("\n")
        setCodeBeforeCursor(preffix)
        setCodeAfterCursor(suffix)
    }, [code, cursorPosition])

    useEffect(() => {
        if (byteData === null) {
            setContainerSyle(containerStyleDefault);
            return;
        }

        if (containerStyle.background !== undefined)
            return;

        let s: React.CSSProperties = JSON.parse(JSON.stringify(containerStyleDefault));
        let color1 = chroma(byteData.color).alpha(0.5).css(); // 60% opacity
        let color2 = chroma(byteData.color).alpha(0.3).css(); // 30% opacity
        let color3 = chroma(byteData.color).alpha(0.1).css(); // 10% opacity

        s.background = `linear-gradient(to bottom, ${color1} 0%, ${color2} 20%, ${color3} 40%, transparent 70%)`;
        setContainerSyle(s);
    }, [byteData]);


    const updateDifficulty = (difficulty: number) => {
        // copy the existing state
        let state = Object.assign({}, initialBytesStateUpdate)
        // update the state
        state.initialized = true
        state.byteDifficulty = difficulty
        dispatch(updateBytesState(state))
    }

    const getNextByte = () => {
        if (recommendedBytes === null) {
            return undefined
        }
        // attempt to locate the current bytes position in the list of recommendations
        // @ts-ignore
        let idx = recommendedBytes.findIndex(x => x._id == byteData?._id)
        if (idx === undefined) {
            idx = -1
        }

        // find the first byte that is later than the index with the same language
        // @ts-ignore
        let byte = recommendedBytes.find((x, i) => i > idx && x.lang === byteData?.lang)
        if (byte) {
            return byte
        }

        // retrieve the first index from the list that is the same language
        // @ts-ignore
        byte = recommendedBytes.find((x, i) => x.lang === byteData?.lang)
        if (byte) {
            return byte
        }

        // fallback on the first byte
        return recommendedBytes[0]
    }

    const handleNextByte = () => {
        const nextByte = getNextByte();
        if (nextByte) {
            navigate(`/byte/${nextByte._id}`);
            setNextByteDrawerOpen(false);
        }
    };

    const currentDifficulty = determineDifficulty();

    interface DifficultyPopupProps {
        open: boolean;
        onClose: () => void;
        onSelectDifficulty: (difficulty: number) => void;
        currentDifficulty: number;
    }

    const DifficultyPopup: React.FC<DifficultyPopupProps> = ({
         open,
         onClose,
         onSelectDifficulty,
         currentDifficulty}) => {
        const difficulties = ['Easy', 'Medium', 'Hard'];

        return (
            <Dialog onClose={onClose} open={open}>
                <DialogTitle>Select Difficulty</DialogTitle>
                <List>
                    {difficulties.map((difficulty, index) => (
                        <ListItem
                            button
                            onClick={() => onSelectDifficulty(index)}
                            key={difficulty}
                            selected={index === currentDifficulty}
                            sx={{backgroundColor: index === currentDifficulty ? 'action.selected' : null}}
                        >
                            <ListItemText
                                primary={
                                    <Typography variant="body1" style={{textAlign: 'center'}}>
                                        {difficulty}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Dialog>
        );
    };

    const getFilteredActions = () => {
        const allActions = [
            {
                icon: <HomeIcon/>,
                name: 'Home',
                action: () => window.location.assign('/home')
            },
            {
                icon: <img alt="CT" src={CTIcon} style={{width: 18, height: 18}}/>,
                name: 'Byte Chat',
                action: () => setActiveView('byteChat')
            },
            {
                icon: <DeveloperModeIcon/>,
                name: 'Editor',
                action: () => setActiveView('editor')
            },
            {
                icon: <span role="img" aria-label="banana">🍌</span>,
                name: 'All Bytes',
                action: () => navigate('/bytesMobile')
            },
            {
                icon: <PinIcon/>,
                name: 'Difficulty',
                action: () => setIsDifficultyPopupOpen(true),
            },
            {
                icon: <HelpIcon/>,
                name: 'Help',
                action: () => setHelpPopupOpen(true),
            },
        ];

        // Filter actions based on the current view
        return allActions.filter(action => {
            if (activeView === 'editor' && action.name === 'Editor') return false;
            if (activeView === 'byteChat' && action.name === 'Byte Chat') return false;
            return true;
        });
    };

    useEffect(() => {
        if (workspaceState !== 1) {
            return
        }

        if (byteData) {
            launchLsp()
        }
    }, [workspaceState])

    const launchLsp = async () => {
        if (!byteData) {
            return
        }

        globalWs.sendWebsocketMessage(
            {
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: WsMessageType.LaunchLspRequest,
                payload: {
                    byte_attempt_id: byteAttemptId,
                    payload: {
                        lang: byteData.lang,
                        content: code,
                    } satisfies LaunchLspRequest
                }
            }, (msg: WsMessage<any>): boolean => {
                if (msg.type !== WsMessageType.LaunchLspResponse) {
                    console.log("failed to start lsp: ", msg)
                    setTimeout(() => {
                        launchLsp()
                    }, 1000);
                    return true
                }
                // wait 3s to link the lsp to ensure the startup completes
                setTimeout(() => {
                    setLspActive(true)
                }, 3000);
                return true
            }
        )
    }

    useEffect(() => {
        if (id === undefined) {
            return
        }

        setOutput(null)
        setExecutingCode(false)
        setTerminalVisible(false)
        setUserHasModified(false)
        setWorkspaceId("")
        setWorkspaceState(null)
        setLspActive(false)
        setLoading(true);
        setSuggestionRange(null)
        getRecommendedBytes()
        getByte(id).then(() => {
            if (authState.authenticated && id) {
                startByteAttempt(id);
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [id]);

    const triggerCodeCleanup = React.useCallback((node: CtParseNode) => {
        console.log("triggerCodeCleanup called")
        if (!editorRef.current?.view) {
            return
        }
        setLoadingCodeCleanup(node.id)


        // set range here
        setSuggestionRange({start_line: node.position.start_line, end_line: node.position.end_line})
    }, [editorRef.current])

    useEffect(() => {
        console.log("called useEffect")
        if (parsedSymbols !== null && parsedSymbols.nodes.length > 0 && workspaceState === 1) {
            console.log("updating extensions")
            setEditorExtensions([ctCreateCodeActions(
                alpha(theme.palette.text.primary, 0.6),
                parsedSymbols,
                loadingCodeCleanup,
                (id: string, portal: React.ReactPortal) => {
                    setCodeActionPortals((prevState) => {

                        return prevState.some((x) => x.id === id) ?
                            prevState.map((item) => item.id === id ? { ...item, portal } : item) :
                            [...prevState, { id, portal }];
                    })
                },
                (node: CtParseNode) => triggerCodeCleanup(node)
            )])
        }

        // filter any code symbols from the portals that no longer exist
        if (parsedSymbols !== null) {
            setCodeActionPortals((prevState) => {
                return prevState.filter(({id}) =>
                    parsedSymbols.nodes.some((node) => node.id === id));
            });
        }
    }, [parsedSymbols, loadingCodeCleanup, workspaceState]);

    const renderStateIndicator = () => {
        let actionButton;

        if (workspaceState === null || workspaceState === 0) {
            // Define an action for the connect button
            const connectAction = async () => {
                if (byteData && !connectButtonLoading) {
                    setConnectButtonLoading(true);
                    for (let i = 0; i < 5; i++) {
                        let created = await createWorkspace(byteData._id);
                        if (created) {
                            break
                        }

                        if (i === 4) {
                            break
                        }
                    }
                    setConnectButtonLoading(false);
                }
            };

            actionButton = (
                <Tooltip title={<Typography variant='caption'>Disconnected From DevSpace. Click to connect.</Typography>}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', ml: '-8px' }} onClick={connectAction}>
                        <LinkOffIcon sx={{ color: theme.palette.error.main }} />
                        {connectButtonLoading && <CircularProgress size={24} sx={{ color: theme.palette.error.main, ml: 1 }} />}
                    </Box>
                </Tooltip>
            );
        } else if (workspaceState === 1) {
            // Show a non-clickable connected state
            actionButton = (
                <Tooltip title="Connected To DevSpace">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinkIcon sx={{ color: theme.palette.success.main }} />
                    </Box>
                </Tooltip>
            );
        } else {
            // Show a loading indicator while connecting
            actionButton = (
                <Tooltip title="Connecting To DevSpace">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={24} sx={{ color: alpha(theme.palette.text.primary, 0.6) }} />
                    </Box>
                </Tooltip>
            );
        }

        return actionButton;
    };

    const selectDiagnosticLevel = React.useCallback((): "hint" | "info" | "warning" | "error" => {
        switch (bytesState.byteDifficulty) {
            case 0:
                return "error"
            case 1:
                return "warning"
            case 2:
                return "hint"
        }
        return "hint"
    }, [bytesState.byteDifficulty])

    const WaitingButton = styled(Button)`
        animation: nextStepsButtonAuraEffect 2s infinite alternate;
        padding: 8px;
        min-width: 0px;

        @keyframes nextStepsButtonAuraEffect {
            0% {
                box-shadow: 0 0 3px #84E8A2, 0 0 6px #84E8A2;
                color: #84E8A2;
                border: 1px solid #84E8A2;
            }
            20% {
                box-shadow: 0 0 3px #29C18C, 0 0 6px #29C18C;
                color: #29C18C;
                border: 1px solid #29C18C;
            }
            40% {
                box-shadow: 0 0 3px #1C8762, 0 0 6px #1C8762;
                color: #1C8762;
                border: 1px solid #1C8762;
            }
            60% {
                box-shadow: 0 0 3px #2A63AC, 0 0 6px #2A63AC;
                color: #2A63AC;
                border: 1px solid #2A63AC;
            }
            80% {
                box-shadow: 0 0 3px #3D8EF7, 0 0 6px #3D8EF7;
                color: #3D8EF7;
                border: 1px solid #3D8EF7;
            }
            100% {
                box-shadow: 0 0 3px #63A4F8, 0 0 6px #63A4F8;
                color: #63A4F8;
                border: 1px solid #63A4F8;
            }
        }
    `;


    const helpPopup = () => {
        return (
            <Dialog
                fullScreen
                open={helpPopupOpen}
                onClose={() => setHelpPopupOpen(false)}
                aria-labelledby="help-popup-title"
            >
                <DialogTitle id="help-popup-title">
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => setHelpPopupOpen(false)}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    Whats going on?
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h5" gutterBottom>
                                GIGO Bytes
                            </Typography>
                            <Typography>
                                This experience can be a little confusing on mobile, but this short guide will have you improving your programming skills shortly.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h5" gutterBottom>
                                    Byte Chat
                                </Typography>
                                <img alt="CT" src={CTIcon} style={{width: 42, height: 42, marginBottom: "3%"}}/>
                            </Box>
                            <Typography>
                                Byte Chat is your guide through the coding challenge, providing the task to be completed. Upon dropping into a Byte, you should first check out the Byte Chat to understand the task. Ask Byte Chat any questions you have!
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h5" gutterBottom display="inline">
                                    Editor
                                </Typography>
                                <DeveloperModeIcon style={{width: 42, height: 42, marginBottom: "3%"}} />
                            </Box>
                            <Typography>
                                You were initially dropped inside of our AI powered Code Editor. The editor will come with some basic code to get you started. You will see a number of important AI powered tools that will help you on your coding journey.
                            </Typography>
                        </Grid>
                        {/* Debug Section */}
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h5">
                                    Debug
                                </Typography>
                                <BugReportOutlined style={{width: 42, height: 42, marginBottom: "1%"}} />
                            </Box>
                            <Typography>
                                Encounter an error? Use the debug feature to automatically identify and help you correct mistakes.
                                Debug will automatically pop up if Code Teacher detects any errors after your code runs. You can open the Debug menu after closing it by pressing the bug icon.
                            </Typography>
                        </Grid>
                        {/* Next Steps Section */}
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h5">
                                    Next Steps
                                </Typography>
                                <WaitingButton
                                    sx={{
                                        height: "30px",
                                        width: "30px",
                                        minWidth: "24px",
                                        marginRight: "25px"
                                    }}
                                    variant="outlined"
                                >
                                    <Circle style={{ fontSize: "12px" }} />
                                </WaitingButton>
                            </Box>
                            <Typography>
                               Not sure what to do next? Code Teacher will automatically detect when you have been idle for a certain amount of time and will provide you with AI-powered hints to tackle the next step.
                            </Typography>
                        </Grid>
                        {/* Code Improvement Section */}
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h5">
                                    Code Improvement
                                </Typography>
                                <ConstructionIcon style={{width: 36, height: 36, marginBottom: "1%"}}/>
                            </Box>
                            <Typography>
                                Once you are connected to the workspace, a Clean Up Code option will be available. Code teacher will analyze your code and suggest improvements
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        )
    };

    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Box sx={{...topContainerStyle, flexDirection: 'row', justifyContent: 'center', width: '100%'}}>
                    {helpPopup()}
                    {tabValue === 0 && (
                        <>
                            {activeSidebarTab !== "nextSteps" && activeSidebarTab !== "codeSuggestion" &&(
                                <ByteNextOutputMessageMobile
                                    trigger={outputPopup}
                                    acceptedCallback={() => {
                                        setOutputPopup(false)
                                    }}
                                    onExpand={() => setActiveSidebarTab("debugOutput")}
                                    onHide={() => setActiveSidebarTab(null)}
                                    onSuccess={() => {
                                        markComplete()
                                    }}
                                    lang={programmingLanguages[byteData ? byteData.lang : 5]}
                                    code={code}
                                    byteId={id || ""}
                                    //@ts-ignore
                                    description={byteData ? byteData[`description_${difficultyToString(determineDifficulty())}`] : ""}
                                    //@ts-ignore
                                    questions={byteData ? byteData[`questions_${difficultyToString(determineDifficulty())}`] : []}
                                    //@ts-ignore
                                    dev_steps={byteData ? byteData[`dev_steps_${difficultyToString(determineDifficulty())}`] : ""}
                                    maxWidth={"100%"}
                                    codeOutput={output?.merged || ""}
                                    nextByte={getNextByte()}
                                    style={{
                                        position: 'relative',
                                        top: 0,
                                        left: 0,
                                        zIndex: 1050,
                                        width: '100%',
                                        height: '100%',
                                    }}
                                />
                            )}
                            {activeSidebarTab !== "nextSteps" && activeSidebarTab !== "debugOutput" && (
                                <ByteSuggestions2
                                    range={suggestionRange}
                                    editorRef={editorRef}
                                    onExpand={() => setActiveSidebarTab("codeSuggestion")}
                                    onHide={() => setActiveSidebarTab(null)}
                                    lang={programmingLanguages[byteData ? byteData.lang : 5]}
                                    code={code}
                                    byteId={id || ""}
                                    // @ts-ignore
                                    description={byteData ? byteData[`description_${difficultyToString(determineDifficulty())}`] : ""}
                                    // @ts-ignore
                                    dev_steps={byteData ? byteData[`dev_steps_${difficultyToString(determineDifficulty())}`] : ""}
                                    maxWidth={"100%"}
                                    acceptedCallback={(c) => {
                                        setCode(c)
                                        setSuggestionRange(null)
                                        setLoadingCodeCleanup(null)
                                    }}
                                    rejectedCallback={() => {
                                        setSuggestionRange(null)
                                        setLoadingCodeCleanup(null)
                                    }}
                                />
                            )}
                            {activeSidebarTab === null && (
                                byteData ? (
                                    <Typography variant="h4" component="h1" style={titleStyle}>
                                        {byteData.name}
                                    </Typography>
                                ) : (
                                    <Box sx={titlePlaceholderContainerStyle}>
                                        <Box sx={titlePlaceholderStyle}>
                                            <SheenPlaceholder width="400px" height={"45px"}/>
                                        </Box>
                                    </Box>
                                )
                            )}
                            {activeSidebarTab === null && (
                                <Box
                                    style={{
                                        marginRight: "3%",
                                        marginTop: "1%"
                                    }}
                                >
                                    {renderStateIndicator()}
                                </Box>
                            )}
                            {activeSidebarTab !== "debugOutput" && activeSidebarTab !== "codeSuggestion" && (
                                <ByteNextStepMobile
                                    trigger={nextStepsPopup}
                                    acceptedCallback={() => {
                                        setNextStepsPopup(false)
                                    }}
                                    onExpand={() => setActiveSidebarTab("nextSteps")}
                                    onHide={() => setActiveSidebarTab(null)}
                                    currentCode={code}
                                    maxWidth="100%"
                                    bytesID={id || ""}
                                    //@ts-ignore
                                    bytesDescription={byteData ? byteData[`description_${difficultyToString(determineDifficulty())}`] : ""}
                                    //@ts-ignore
                                    bytesDevSteps={byteData ? byteData[`dev_steps_${difficultyToString(determineDifficulty())}`] : ""}
                                    bytesLang={programmingLanguages[byteData ? byteData.lang : 5]}
                                    codePrefix={codeBeforeCursor}
                                    codeSuffix={codeAfterCursor}
                                />
                            )}
                        </>
                    )}
                </Box>
                {activeSidebarTab === null && (
                    <Box style={editorAndTerminalStyle} ref={editorContainerRef}>
                        <DifficultyPopup
                            open={isDifficultyPopupOpen}
                            onClose={() => setIsDifficultyPopupOpen(false)}
                            onSelectDifficulty={(difficulty: number) => {
                                updateDifficulty(difficulty); // Call your existing updateDifficulty function with the new difficulty
                                setIsDifficultyPopupOpen(false);
                            }}
                            currentDifficulty={currentDifficulty}
                        />
                        {activeView === 'editor' && (
                            <>
                                {code.length > 0 && (
                                    <Tooltip title="Run Code">
                                        <LoadingButton
                                            loading={executingCode}
                                            variant="text"
                                            color={"success"}
                                            style={{
                                                position: 'absolute',
                                                right: '8px',
                                                top: '8px',
                                                zIndex: 3,
                                                borderRadius: "50%",
                                                minWidth: 0,
                                            }}
                                            onClick={() => {
                                                setOutputPopup(false);
                                                buttonClickedRef.current = true;
                                                if (!authState.authenticated) {
                                                    navigate("/signup?forward="+encodeURIComponent(window.location.pathname))
                                                    return;
                                                }
                                                executeCode();
                                            }}
                                        >
                                            <PlayArrow/>
                                        </LoadingButton>
                                    </Tooltip>
                                )}
                                <Editor
                                    ref={editorRef}
                                    parentStyles={editorStyle}
                                    language={programmingLanguages[byteData ? byteData.lang : 5]}
                                    code={code}
                                    theme={mode}
                                    readonly={!authState.authenticated}
                                    onChange={(val, view) => handleEditorChange(val)}
                                    onCursorChange={(bytePosition, line, column) => setCursorPosition({
                                        row: line,
                                        column: column
                                    })}
                                    lspUrl={byteData && lspActive ? `wss://${byteData._id}-lsp.${config.coderPath.replace("https://", "")}` : undefined}
                                    diagnosticLevel={selectDiagnosticLevel()}
                                    editorStyles={editorStyles}
                                    extensions={popupExtRef.current ? editorExtensions.concat(popupExtRef.current) : editorExtensions}
                                    wrapperStyles={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: "10px",
                                        ...(
                                            // default
                                            workspaceState === null ? {} :
                                                // starting or active
                                                workspaceState === 1 ?
                                                    {border: `1px solid ${theme.palette.primary.main}`} :
                                                    {border: `1px solid grey`}
                                        )
                                    }}
                                />
                                {terminalVisible && output && (
                                    <ByteTerminal
                                        output={output}
                                        onClose={handleCloseTerminal}
                                        onStop={() => cancelCodeExec(commandId)}
                                        onInputSubmit={(input: string) => stdInExecRequest(commandId, input)}
                                        isRunning={executingCode}
                                    />
                                )}
                                <Box
                                    sx={{
                                        width: '100%',
                                        maxWidth: "100%",
                                        height: '35px',
                                        backgroundColor: '#232a2f',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onClick={() => setNextByteDrawerOpen(true)}
                                >
                                    <KeyboardArrowUp/>
                                </Box>
                            </>
                        )}
                        {activeView === 'byteChat' && byteData && id !== undefined && (
                            <ByteChatMobile
                                byteID={id}
                                // @ts-ignore
                                description={byteData ? byteData[`description_${difficultyToString(determineDifficulty())}`] : ""}
                                // @ts-ignore
                                devSteps={byteData ? byteData[`dev_steps_${difficultyToString(determineDifficulty())}`] : ""}
                                difficulty={difficultyToString(determineDifficulty())}
                                // @ts-ignore
                                questions={byteData ? byteData[`questions_${difficultyToString(determineDifficulty())}`] : []}
                                codePrefix={codeBeforeCursor}
                                codeSuffix={codeAfterCursor}
                                codeLanguage={programmingLanguages[byteData ? byteData.lang : 5]}
                                setSpeedDialVisibility={setSpeedDialVisibility}
                            />
                        )}
                        {isSpeedDialVisible && (
                            <SpeedDial
                                ariaLabel="SpeedDial"
                                sx={{position: 'fixed', bottom: 24, right: 16}}
                                icon={<MenuIcon/>}
                                open={speedDialOpen}
                                onOpen={() => setSpeedDialOpen(true)}
                                onClose={() => setSpeedDialOpen(false)}
                            >
                                {getFilteredActions().map((action) => (
                                    <SpeedDialAction
                                        key={action.name}
                                        icon={action.icon}
                                        tooltipTitle={action.name}
                                        onClick={() => {
                                            setSpeedDialOpen(false)
                                            action.action();
                                        }}
                                    />
                                ))}
                            </SpeedDial>
                        )}
                    </Box>
                )}
                {parsedSymbols !== null ? codeActionPortals.map(x => x.portal) : null}
                <NextByteDrawerMobile
                    open={nextByteDrawerOpen}
                    onClose={() => setNextByteDrawerOpen(false)}
                    onNextByte={handleNextByte}
                />
            </CssBaseline>
        </ThemeProvider>
    );
};

export default ByteMobile;