import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {
    alpha,
    Box,
    Button,
    CircularProgress,
    Container,
    createTheme,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    PaletteMode,
    TextField,
    ThemeProvider,
    Tooltip,
    Typography,
} from "@mui/material";
import XpPopup from "../components/XpPopup";
import {getAllTokens} from "../theme";
import {Add, PlayArrow} from "@material-ui/icons";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {useNavigate} from "react-router-dom";
import swal from "sweetalert";
import call from "../services/api-call";
import 'ace-builds';
import 'ace-builds/webpack-resolver';
import ByteSelectionMenu from "../components/ByteSelectionMenu";
import config from "../config";
import {useLocation, useParams} from "react-router";
import {useGlobalWebSocket} from "../services/websocket";
import {WsGenericErrorPayload, WsMessage, WsMessageType} from "../models/websocket";
import {ExecResponsePayload, OutputRow} from "../models/bytes";
import {programmingLanguages} from "../services/vars";
import {useGlobalCtWebSocket} from "../services/ct_websocket";
import ByteNextStep from "../components/CodeTeacher/ByteNextStep";
import ByteChat from "../components/CodeTeacher/ByteChat";
import {LoadingButton} from "@mui/lab";
import ByteNextOutputMessage from "../components/CodeTeacher/ByteNextOutputMessage";
import Editor from "../components/IDE/Editor";
import chroma from 'chroma-js';
import SheenPlaceholder from "../components/Loading/SheenPlaceholder";
import {sleep} from "../services/utils";
import {Extension, ReactCodeMirrorRef} from "@uiw/react-codemirror";
import DifficultyAdjuster from "../components/ByteDifficulty";
import {selectAuthState} from "../reducers/auth/auth";
import {initialBytesStateUpdate, selectBytesState, updateBytesState} from "../reducers/bytes/bytes";
import ByteTerminal from "../components/Terminal";
import {debounce} from "lodash";
import {LaunchLspRequest} from "../models/launch_lsp";
import {Workspace} from "../models/workspace";
import CodeSource from "../models/codeSource";
import {
    CtGenericErrorPayload,
    CtMessage,
    CtMessageOrigin,
    CtMessageType,
    CtParseFileRequest,
    CtParseFileResponse,
    CtValidationErrorPayload,
    Node as CtParseNode
} from "../models/ct_websocket";
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import {createCtPopupExtension, CtPopupExtensionEngine} from "../components/IDE/Extensions/CtPopupExtension";
import {ctCreateCodeActions} from "../components/IDE/Extensions/CtCodeActionExtension";
import ByteSuggestions2 from "../components/CodeTeacher/ByteSuggestions2";
import BytesLanguage from "../components/Icons/bytes/BytesLanguage";
import {CodeFile} from "../models/code_file";
import CloseIcon from "@material-ui/icons/Close";
import {EditorTab, EditorTabs} from "../components/IDE/EditorTabs";


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
    files_easy: CodeFile[];
    dev_steps_easy: string;

    description_medium: string;
    files_medium: CodeFile[];
    dev_steps_medium: string;

    description_hard: string;
    files_hard: CodeFile[];
    dev_steps_hard: string;
}

interface InitialStatusMessage {
    workspace: Workspace;
    code_source: CodeSource;
    workspace_url: string
}

interface ByteAttempt {
    _id: string;
    byte_id: string;
    author_id: string;
    files_easy: CodeFile[];
    files_medium: CodeFile[];
    files_hard: CodeFile[];
    modified: boolean;
}

interface LanguageOption {
    name: string;
    extensions: string[];
    languageId: number;
    execSupported: boolean;
}

const languages: LanguageOption[] = [
    {name: 'Go', extensions: ['go'], languageId: 6, execSupported: true},
    {name: 'Python', extensions: ['py', 'pytho', 'pyt'], languageId: 5, execSupported: true},
    {name: 'C++', extensions: ['cpp', 'cc', 'cxx', 'hpp', 'c++', 'h'], languageId: 8, execSupported: false},
    {name: 'HTML', extensions: ['html', 'htm'], languageId: 27, execSupported: false},
    {name: 'Java', extensions: ['java'], languageId: 2, execSupported: false},
    {name: 'JavaScript', extensions: ['js'], languageId: 3, execSupported: false},
    {name: 'JSON', extensions: ['json'], languageId: 1, execSupported: false},
    {name: 'Markdown', extensions: ['md'], languageId: 1, execSupported: false},
    {name: 'PHP', extensions: ['php'], languageId: 13, execSupported: false},
    {name: 'Rust', extensions: ['rs'], languageId: 14, execSupported: false},
    {name: 'SQL', extensions: ['sql'], languageId: 34, execSupported: false},
    {name: 'XML', extensions: ['xml'], languageId: 1, execSupported: false},
    {name: 'LESS', extensions: ['less'], languageId: 1, execSupported: false},
    {name: 'SASS', extensions: ['sass', 'scss'], languageId: 1, execSupported: false},
    {name: 'Clojure', extensions: ['clj'], languageId: 21, execSupported: false},
    {name: 'C#', extensions: ['cs'], languageId: 10, execSupported: false},
    {name: 'Shell', extensions: ['bash', 'sh'], languageId: 38, execSupported: false},
    {name: 'Toml', extensions: ['toml'], languageId: 14, execSupported: false}
];

const mapToLang = (l: string) => {
    l = l.trim()
    for (let i = 0; i < languages.length; i++) {
        if (l.toLowerCase() == languages[i].name.toLowerCase()) {
            return languages[i].name.toLowerCase()
        }

        for (let j = 0; j < languages[i].extensions.length; j++) {
            if (l.toLowerCase() === languages[i].extensions[j]) {
                return languages[i].name.toLowerCase()
            }
        }
    }
    return l
}

const mapToLangId = (l: string) => {
    l = l.trim()
    for (let i = 0; i < languages.length; i++) {
        if (l.toLowerCase() == languages[i].name.toLowerCase()) {
            return languages[i].languageId
        }

        for (let j = 0; j < languages[i].extensions.length; j++) {
            if (l.toLowerCase() === languages[i].extensions[j]) {
                return languages[i].languageId
            }
        }
    }
    return 5
}

const mapToLangMarkdown = (l: string) => {
    l = l.trim()
    for (let i = 0; i < languages.length; i++) {
        if (l.toLowerCase() == languages[i].name.toLowerCase()) {
            return languages[i].extensions[0]
        }

        for (let j = 0; j < languages[i].extensions.length; j++) {
            if (l.toLowerCase() === languages[i].extensions[j]) {
                return languages[i].extensions[0]
            }
        }
    }
    return ""
}

const mapFilePathToLang = (l: string) => {
    let parts = l.trim().split('.');
    l = parts[parts.length - 1];
    if (l === undefined) {
        return ""
    }
    for (let i = 0; i < languages.length; i++) {
        if (l.toLowerCase() == languages[i].name.toLowerCase()) {
            return languages[i].extensions[0]
        }

        for (let j = 0; j < languages[i].extensions.length; j++) {
            if (l.toLowerCase() === languages[i].extensions[j]) {
                return languages[i].extensions[0]
            }
        }
    }
    return l
}

const mapFilePathToLangOption = (l: string): LanguageOption | undefined => {
    let parts = l.trim().split('.');
    l = parts[parts.length - 1];
    if (l === undefined) {
        return undefined
    }
    for (let i = 0; i < languages.length; i++) {
        if (l.toLowerCase() == languages[i].name.toLowerCase()) {
            return languages[i]
        }

        for (let j = 0; j < languages[i].extensions.length; j++) {
            if (l.toLowerCase() === languages[i].extensions[j]) {
                return languages[i]
            }
        }
    }
    return undefined
}


function Byte() {
    let userPref = localStorage.getItem('theme');
    const [mode, _] = useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [xpPopup, setXpPopup] = React.useState(false)
    const [xpData, setXpData] = React.useState(null)
    const [nodeBelow, setNodeBelow] = React.useState(null)

    const authState = useAppSelector(selectAuthState);
    const bytesState = useAppSelector(selectBytesState)

    const [terminalVisible, setTerminalVisible] = useState(false);

    const combinedSectionStyle: React.CSSProperties = {
        display: 'flex',
        height: '80vh',
        width: 'calc(100vw - 360px)',
        marginLeft: '30px',
        marginRight: 'auto',
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
        border: `1px solid ${theme.palette.grey[300]}`,
        padding: "10px",
        backgroundColor: theme.palette.background.default
    };

    const mainLayoutStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '30px',
        marginTop: '1rem',
        maxHeight: "80vh",
        overflow: "hidden"
    };

    // Byte selection menu style
    const byteSelectionMenuStyle: React.CSSProperties = {
        width: '300px',
        maxHeight: '80vh',
        overflow: 'hidden'
    };

    const containerStyleDefault: React.CSSProperties = {
        width: '100%',
        padding: theme.spacing(0),
        margin: '0',
        maxWidth: 'none',
        overflowY: "hidden"
    };

    const markdownSectionStyle: React.CSSProperties = {
        flex: 1,
        minWidth: "450px",
        maxWidth: "20vw",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
    };

    const editorAndTerminalStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        paddingLeft: "20px",
        // width: "60vw",
        width: 0,
        position: "relative"
    };

    const editorStyle: React.CSSProperties = {
        height: terminalVisible ? "calc(100% - 236px)" : "calc(100% - 36px)",
    };

    const terminalOutputStyle: React.CSSProperties = {
        backgroundColor: "#333",
        color: "lime",
        fontFamily: "monospace",
        fontSize: "0.9rem",
        padding: "10px",
        marginTop: "20px",
        borderRadius: "5px",
        whiteSpace: "pre-wrap",
        // maxHeight: '300px',
        // minHeight: "100px",
        height: "200px",
        overflowY: 'auto',
        wordWrap: 'break-word',
        position: "relative",
    };

    const difficultyAdjusterStyle: React.CSSProperties = {
        width: "fit-content",
        marginLeft: "30px"
    };

    const titleStyle: React.CSSProperties = {
        textAlign: 'center',
        marginTop: "14px",
        marginBottom: "2px",
        width: "calc(100vw - 500px)",
    };

    const topContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center', // Align items vertically in the center
        justifyContent: 'flex-start', // Align the DifficultyAdjuster to the left
        gap: '0rem', // Add some space between the adjuster and the title
    };

    const titlePlaceholderContainerStyle: React.CSSProperties = {
        display: "flex",
        padding: theme.spacing(1),
        marginTop: "14px",
        marginBottom: "2px",
        alignItems: 'center',
        width: "calc(80vw - 164px)",
    };

    const titlePlaceholderStyle: React.CSSProperties = {
        margin: "auto"
    }

    // Define the state and dispatch hook
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Define the state for your data and loading state
    const [byteData, setByteData] = useState<BytesData | null>(null);
    const [recommendedBytes, setRecommendedBytes] = useState(null);
    const [code, setCode] = useState<CodeFile[]>([]);

    const [output, setOutput] = useState<OutputState | null>(null);

    const [containerStyle, setContainerSyle] = useState<React.CSSProperties>(containerStyleDefault)
    const [cursorPosition, setCursorPosition] = useState<{ row: number, column: number } | null>(null)
    const [codeBeforeCursor, setCodeBeforeCursor] = useState("");
    const [codeAfterCursor, setCodeAfterCursor] = useState("");
    const [outputPopup, setOutputPopup] = useState(false);
    const [byteAttemptId, setByteAttemptId] = useState("");
    const [easyCode, setEasyCode] = useState<CodeFile[]>([]);
    const [mediumCode, setMediumCode] = useState<CodeFile[]>([]);
    const [hardCode, setHardCode] = useState<CodeFile[]>([]);
    const [activeFile, setActiveFile] = useState("");
    const [activeFileIdx, setActiveFileIdx] = useState(-1);
    const typingTimerRef = useRef(null);
    const [suggestionPopup, setSuggestionPopup] = useState(false);
    const [nextStepsPopup, setNextStepsPopup] = useState(false);
    const [commandId, setCommandId] = useState("");
    const [newFilePopup, setNewFilePopup] = React.useState(false);
    const [newFileName, setNewFileName] = React.useState("");
    const [deleteFileRequest, setDeleteFileRequest] = React.useState<string | null>(null);

    const [executingOutputMessage, setExecutingOutputMessage] = useState<boolean>(false)
    const [executingCode, setExecutingCode] = useState<boolean>(false)

    const pingInterval = React.useRef<NodeJS.Timer | null>(null)

    const editorContainerRef = React.useRef<HTMLDivElement>(null);
    const editorRef = React.useRef<ReactCodeMirrorRef>(null);
    const popupEngineRef = React.useRef<CtPopupExtensionEngine | null>(null);
    const popupExtRef = React.useRef<Extension | null>(null);

    const [activeSidebarTab, setActiveSidebarTab] = React.useState<string | null>(null);

    const [userHasModified, setUserHasModified] = React.useState(false)
    const [lspActive, setLspActive] = React.useState(false)
    const [workspaceState, setWorkspaceState] = useState<null | number>(null);
    const [workspaceId, setWorkspaceId] = useState<string>('')
    const [journeySetupDone, setJourneySetupDone] = useState(false);

    const [connectButtonLoading, setConnectButtonLoading] = useState<boolean>(false)

    const [editorExtensions, setEditorExtensions] = useState<Extension[]>([])

    const [lastParse, setLastParse] = useState("")
    const [parsedSymbols, setParsedSymbols] = useState<CtParseFileResponse | null>(null)
    const [codeActionPortals, setCodeActionPortals] = useState<{ id: string, portal: React.ReactPortal }[]>([])

    const [loadingCodeCleanup, setLoadingCodeCleanup] = React.useState<string | null>(null);

    const [suggestionRange, setSuggestionRange] = useState<{ start_line: number, end_line: number } | null>(null);
    const [isHarderVersionPopupVisible, setIsHarderVersionPopupVisible] = useState(false);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    let {id} = useParams();

    let ctWs = useGlobalCtWebSocket();

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

    useEffect(() => {
        if (popupEngineRef.current !== null) {
            return
        }
        let {ext, engine} = createCtPopupExtension();
        popupExtRef.current = ext;
        popupEngineRef.current = engine;
    }, [])

    useEffect(() => {
        setActiveFileIdx(code.findIndex((x: CodeFile) => x.file_name === activeFile));
    }, [activeFile, code]);

    const debouncedUpdateCode = React.useCallback(debounce((newCode: CodeFile[]) => {
        globalWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: WsMessageType.ByteUpdateCode,
            payload: {
                byte_attempt_id: byteAttemptId,
                files: newCode,
                content_difficulty: bytesState ? bytesState.byteDifficulty : 0
            }
        }, null);
    }, 1000, {
        trailing: true
    }), [globalWs, byteAttemptId, bytesState.byteDifficulty]);

    const parseSymbols = React.useCallback((newCode: string) => {
        if (byteData === null) {
            return
        }

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
                setLastParse(newCode);
                return true
            }
        )
    }, [byteData])

    const debouncedParseSymbols = React.useCallback(debounce(parseSymbols, 3000, {
        trailing: true
    }), [parseSymbols]);

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
                    exec_files: code.map(x => ({
                        file_name: x.file_name,
                        code: x.content,
                        execute: x.file_name === activeFile
                    }))
                }
            }
        };

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
                if (stdout.length === 0 && stderr.length === 0 && !done) {
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
            // Map through each byte and add a random image from byteImages
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
    const getByte = async (byteId: string): Promise<any | null> => {
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
                let outlineContent = res["rec_bytes"][`files_${difficultyToString(determineDifficulty())}`]
                setCode(outlineContent);
                let afi = outlineContent.length >= 1 ? 0 : -1;
                setActiveFileIdx(afi)
                setActiveFile(afi >= 0 ? outlineContent[afi].file_name : "")
                setCodeBeforeCursor("")
                setCodeAfterCursor(outlineContent)
                setCursorPosition({row: 0, column: 0})
                setEasyCode(res["rec_bytes"]["files_easy"])
                setMediumCode(res["rec_bytes"]["files_medium"])
                setHardCode(res["rec_bytes"]["files_hard"])

                setByteData(res["rec_bytes"])
                return res["rec_bytes"]
            } else {
                swal("Byte Not Found", "The requested byte could not be found.");
            }
        } catch (error) {
            swal("Error", "An error occurred while fetching the byte data.");
        }
        return null
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
                setEasyCode(res["byte_attempt"]["files_easy"])
                setMediumCode(res["byte_attempt"]["files_medium"])
                setHardCode(res["byte_attempt"]["files_hard"])
                setCode(res["byte_attempt"][`files_${difficultyToString(determineDifficulty())}`]);
                let afi = res["byte_attempt"][`files_${difficultyToString(determineDifficulty())}`].length >= 1 ? 0 : -1;
                setActiveFileIdx(afi)
                setActiveFile(afi >= 0 ? res["byte_attempt"][`files_${difficultyToString(determineDifficulty())}`][afi].file_name : "")
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
                // TODO implement what needs to be done if successful
                let workspace = res["workspace"]
                if (workspace["_id"] !== workspaceId) {
                    setWorkspaceId(workspace["_id"])
                    setWorkspaceState(workspace["state"])
                }
                return true
            }
        } catch (error) {
            swal("Error", "An error occurred while creating the byte workspace.");
        }
        return false
    };

    const markComplete = async () => {
        let params = {
            byte_id: byteAttemptId,
            difficulty: difficultyToString(determineDifficulty()),
        }
        const isJourneyVersion = queryParams.has('journey');

        if (isJourneyVersion) {
            //@ts-ignore
            params["journey"] = true
        }
        let res = await call(
            "/api/bytes/setCompleted",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            params,
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

        if (res["nodeBelow"] !== undefined && res["nodeBelow"] !== null){
            setNodeBelow(res["nodeBelow"])
        }
    }

    useEffect(() => {
        if (id === undefined) {
            return;
        }

        const isJourneyVersion = queryParams.has('journey');
        const shouldSetToEasy = isJourneyVersion && !journeySetupDone && bytesState.byteDifficulty !== 0;

        if (shouldSetToEasy) {
            dispatch(updateBytesState({...bytesState, byteDifficulty: 0, initialized: true}));
            setJourneySetupDone(true); // Mark the journey setup as completed to prevent re-execution.
        }

        setOutput(null);
        setExecutingCode(false);
        setTerminalVisible(false);
        setUserHasModified(false);
        setWorkspaceId("");
        setWorkspaceState(null);
        setLspActive(false);
        setSuggestionRange(null);
        getRecommendedBytes();
        getByte(id).then((byteData: any | null) => {
            if (authState.authenticated && id && byteData !== null) {
                startByteAttempt(id).then(async () => {
                    // auto connect to the workspace if this is a journey task
                    if (isJourneyVersion) {
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
                });
            }
        });
    }, [id]);

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
            setNextStepsPopup(true);
        }, 15000);
    };


    useEffect(() => {
        switch (bytesState.byteDifficulty) {
            case 0:
                setCode(easyCode);
                setActiveFile(easyCode.length > 0 ? easyCode[0].file_name : "")
                setActiveFileIdx(easyCode.length > 0 ? 0 : -1)
                break
            case 1:
                setCode(mediumCode);
                setActiveFile(mediumCode.length > 0 ? mediumCode[0].file_name : "")
                setActiveFileIdx(mediumCode.length > 0 ? 0 : -1)
                break
            case 2:
                setCode(hardCode);
                setActiveFile(hardCode.length > 0 ? hardCode[0].file_name : "")
                setActiveFileIdx(hardCode.length > 0 ? 0 : -1)
                break
        }
    }, [bytesState.byteDifficulty])

    useEffect(() => {
        if (workspaceId === "") {
            return
        }

        globalWs.registerCallback(WsMessageType.WorkspaceStatusUpdate, `workspace:status:${workspaceId}`,
            (msg: WsMessage<any>) => {
                if (msg.type !== WsMessageType.WorkspaceStatusUpdate) {
                    return
                }

                // attempt to parse json message
                let jsonMessage: Object | null = null
                try {
                    jsonMessage = msg.payload;
                } catch (e) {
                    return
                }

                if (jsonMessage === null) {
                    return
                }

                // handle initial state message
                let payload = jsonMessage as InitialStatusMessage;
                let workspace = payload.workspace as Workspace

                if (workspaceId !== workspace._id) {
                    setWorkspaceId(workspace._id)
                }
                setWorkspaceState(workspace.state)
            },
        );

        // generate a random alphanumeric id
        let seqId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        globalWs.sendWebsocketMessage({
            sequence_id: seqId,
            type: WsMessageType.SubscribeWorkspace,
            payload: {
                workspace_id: workspaceId,
            }
        }, null)

        return () => {
            globalWs.sendWebsocketMessage({
                sequence_id: seqId,
                type: WsMessageType.UnsubscribeWorkspace,
                payload: {
                    workspace_id: workspaceId,
                }
            }, null)
        }
    }, [workspaceId])

    useEffect(() => {
        if (workspaceState !== 1) {
            return
        }

        if (byteData) {
            launchLsp()
        }
    }, [workspaceState])

    const launchLsp = async () => {
        if (!byteData || activeFileIdx < 0 || code[activeFileIdx] === undefined) {
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
                        content: code[activeFileIdx].content,
                        file_name: code[activeFileIdx].file_name,
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
                // wait 1s to link the lsp to ensure the startup completes
                setTimeout(() => {
                    setLspActive(true)
                }, 1000);
                return true
            }
        )
    }

    const triggerCodeCleanup = React.useCallback((node: CtParseNode) => {
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
                        // update the portal if it has a prior state or add it if new
                        return prevState.some((x) => x.id === id) ?
                            prevState.map((item) => item.id === id ? {...item, portal} : item) :
                            [...prevState, {id, portal}];
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

    // Handle changes in the editor and activate the button
    const handleEditorChange = async (newCode: string) => {
        const updateFunc = (prevState: CodeFile[]) => {
            let idx = prevState.findIndex((x) => x.file_name === activeFile);
            if (idx !== -1) {
                prevState[idx].content = newCode;
            }
            return prevState
        }

        debouncedUpdateCode(updateFunc(code));

        // Update the code state with the new content
        setCode(updateFunc);
        switch (bytesState.byteDifficulty) {
            case 0:
                setEasyCode(updateFunc);
                break
            case 1:
                setMediumCode(updateFunc);
                break
            case 2:
                setHardCode(updateFunc)
                break
        }
        startTypingTimer();


        if (!userHasModified) {
            setUserHasModified(true)
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

    const handleSelectByte = (byteId: string) => {
        navigate(`/byte/${byteId}`);
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
        if (activeSidebarTab === null || activeSidebarTab !== "nextSteps") {
            setNextStepsPopup(true)
        }
        if (outputPopup) {
            return;
        }
        if (byteData) {
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
                navigate("/signup?forward=" + encodeURIComponent(window.location.pathname))
                return
            }
            executeCode();
        }
        buttonClickedRef.current = false;
    }, [outputPopup]);

    useEffect(() => {
        if (activeFileIdx < 0 || code[activeFileIdx] === undefined) {
            return
        }

        const lines = code[activeFileIdx].content.split("\n");

        // detect if any lines extend beyond 80 chars
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
        if (activeFileIdx < 0 || code[activeFileIdx] === undefined) {
            return
        }
        setParsedSymbols(null)
        debouncedParseSymbols(code[activeFileIdx].content)
    }, [code, activeFileIdx]);


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

    const handleTryHarderVersionClick = () => {
        setIsHarderVersionPopupVisible(true);
        console.log("popup clicked")
    };


    const acceptCodeSuggestionCallback = React.useCallback((c: string) => {
        setCode((prevState: CodeFile[]) => {
            let idx = prevState.findIndex((x) => x.file_name === activeFile);
            if (idx !== -1) {
                prevState[idx].content = c;
            }
            return prevState
        })
        setSuggestionRange(null)
        setLoadingCodeCleanup(null)
    }, [activeFile])


    const renderEditorSideBar = () => {
        let stateTooltipTitle: string | React.ReactElement = (
            <Box>
                <Typography variant='caption'>Disconnected From DevSpace</Typography>
                <LoadingButton
                    loading={connectButtonLoading}
                    variant={"outlined"}
                    sx={{
                        fontSize: "10px",
                        height: "18px",
                        m: 0.5
                    }}
                    onClick={async () => {
                        if (byteData) {
                            setConnectButtonLoading(true)
                            for (let i = 0; i < 5; i++) {
                                let created = await createWorkspace(byteData._id);
                                if (created) {
                                    break
                                }

                                if (i === 4) {
                                    break
                                }
                            }
                            setConnectButtonLoading(false)
                        }
                    }}
                >
                    Connect
                </LoadingButton>
            </Box>
        )
        let stateIcon = (<LinkOffIcon sx={{color: alpha(theme.palette.text.primary, 0.6)}}/>)
        if (workspaceState !== null) {
            if (workspaceState === 1) {
                stateTooltipTitle = "Connected To DevSpace"
                stateIcon = (<LinkIcon sx={{color: theme.palette.success.main}}/>)
            } else if (workspaceState === 0) {
                stateTooltipTitle = "Connecting To DevSpace"
                stateIcon = (<CircularProgress size={24} sx={{color: alpha(theme.palette.text.primary, 0.6)}}/>)
            }
        }

        return (
            <Box
                display={"flex"}
                flexDirection={"column"}
                sx={{
                    position: "relative",
                    width: "fit-content",
                    padding: "0px",
                    gap: "10px",
                    height: "100%"
                }}
            >
                {(activeSidebarTab === null || activeSidebarTab === "nextSteps") && activeFileIdx >= 0 && code[activeFileIdx] && (
                    <ByteNextStep
                        trigger={nextStepsPopup}
                        acceptedCallback={() => {
                            setNextStepsPopup(false)
                        }}
                        onExpand={() => setActiveSidebarTab("nextSteps")}
                        onHide={() => setActiveSidebarTab(null)}
                        currentCode={code[activeFileIdx].content}
                        maxWidth="20vw"
                        bytesID={id || ""}
                        // @ts-ignore
                        bytesDescription={byteData ? byteData[`description_${difficultyToString(determineDifficulty())}`] : ""}
                        // @ts-ignore
                        bytesDevSteps={byteData ? byteData[`dev_steps_${difficultyToString(determineDifficulty())}`] : ""}
                        bytesLang={programmingLanguages[byteData ? byteData.lang : 5]}
                        codePrefix={codeBeforeCursor}
                        codeSuffix={codeAfterCursor}
                        containerRef={containerRef}
                    />
                )}
                {(activeSidebarTab === null || activeSidebarTab === "debugOutput") && activeFileIdx >= 0 && code[activeFileIdx] && (
                    <ByteNextOutputMessage
                        trigger={outputPopup}
                        acceptedCallback={() => {
                            setOutputPopup(false)
                        }}
                        onExpand={() => setActiveSidebarTab("debugOutput")}
                        onHide={() => setActiveSidebarTab(null)}
                        onSuccess={() => {
                            setSuggestionPopup(true)
                            markComplete()
                        }}
                        code={code.map(x => ({
                            code: x.content,
                            file_name: x.file_name
                        }))}
                        byteId={id || ""}
                        // @ts-ignore
                        description={byteData ? byteData[`description_${difficultyToString(determineDifficulty())}`] : ""}
                        // @ts-ignore
                        questions={byteData ? byteData[`questions_${difficultyToString(determineDifficulty())}`] : []}
                        // @ts-ignore
                        dev_steps={byteData ? byteData[`dev_steps_${difficultyToString(determineDifficulty())}`] : ""}
                        maxWidth={"20vw"}
                        codeOutput={output?.merged || ""}
                        nextByte={getNextByte()}
                        containerRef={containerRef}
                        journey={queryParams.has('journey')}
                        currentDifficulty={determineDifficulty()}
                        onTryHarderVersionClick={handleTryHarderVersionClick}
                        nodeBelowId={nodeBelow}
                    />
                )}
                {(activeSidebarTab === null || activeSidebarTab === "codeSuggestion") && activeFileIdx >= 0 && code[activeFileIdx] && (
                    <ByteSuggestions2
                        range={suggestionRange}
                        editorRef={editorRef}
                        onExpand={() => setActiveSidebarTab("codeSuggestion")}
                        onHide={() => setActiveSidebarTab(null)}
                        lang={programmingLanguages[byteData ? byteData.lang : 5]}
                        code={code[activeFileIdx].content}
                        byteId={id || ""}
                        // @ts-ignore
                        description={byteData ? byteData[`description_${difficultyToString(determineDifficulty())}`] : ""}
                        // @ts-ignore
                        dev_steps={byteData ? byteData[`dev_steps_${difficultyToString(determineDifficulty())}`] : ""}
                        maxWidth={"20vw"}
                        acceptedCallback={acceptCodeSuggestionCallback}
                        rejectedCallback={() => {
                            setSuggestionRange(null)
                            setLoadingCodeCleanup(null)
                        }}
                    />
                )}
                {isHarderVersionPopupVisible && (
                    <Dialog
                        open={isHarderVersionPopupVisible}
                        onClose={() => setIsHarderVersionPopupVisible(false)}
                        aria-labelledby="change-difficulty-dialog-title"
                    >
                        <DialogTitle id="change-difficulty-dialog-title">Change Difficulty</DialogTitle>
                        <DialogContent>
                            <DifficultyAdjuster
                                difficulty={determineDifficulty()}
                                onChange={(newDifficulty) => {
                                    updateDifficulty(newDifficulty);
                                    setIsHarderVersionPopupVisible(false);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                )}
                {activeSidebarTab === null && (
                    <Tooltip title={stateTooltipTitle}>
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: "10px",
                                height: "30px",
                                width: "30px",
                                marginLeft: "10px",
                                padding: "3px"
                            }}
                        >
                            {stateIcon}
                        </Box>
                    </Tooltip>
                )}
            </Box>
        )
    }

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

    if (window.innerWidth < 1000) {
        navigate("/")
    }

    const renderNewFilePopup = () => {
        return (
            <Dialog open={newFilePopup} maxWidth={'sm'} onClose={() => setNewFilePopup(false)}>
                <DialogTitle>Create New File</DialogTitle>
                <DialogContent>
                    <TextField
                        placeholder={"File Name"}
                        value={newFileName}
                        onChange={(event) => {
                            setNewFileName(event.target.value)
                        }}
                        onKeyDown={(e) => {
                            if (e.code == "Enter") {
                                e.preventDefault()
                                e.stopPropagation()
                                setCode(prev => {
                                    let newCode = prev.concat({
                                        file_name: newFileName,
                                        content: "",
                                    })
                                    debouncedUpdateCode(newCode)
                                    return newCode
                                })
                                setActiveFile(newFileName)
                                setNewFilePopup(false)
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        color={"error"}
                        variant={"outlined"}
                        onClick={() => {
                            setNewFilePopup(false)
                            setNewFileName("")
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        color={"success"}
                        variant={"outlined"}
                        disabled={newFileName === ""}
                        onClick={() => {
                            setCode(prev => {
                                let newCode = prev.concat({
                                    file_name: newFileName,
                                    content: "",
                                })
                                debouncedUpdateCode(newCode)
                                return newCode
                            })
                            setActiveFile(newFileName)
                            setNewFilePopup(false)
                        }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    const renderDeleteFilePopup = () => {
        return (
            <Dialog open={deleteFileRequest !== null} maxWidth={'sm'} onClose={() => setDeleteFileRequest(null)}>
                <DialogTitle>Delete File</DialogTitle>
                <DialogContent>
                    <Typography variant={"body2"}>
                        Are you sure you want to delete the file <b>{deleteFileRequest}</b>?
                        <br/>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        color={"inherit"}
                        variant={"outlined"}
                        onClick={() => {
                            setDeleteFileRequest(null)
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        color={"error"}
                        variant={"outlined"}
                        onClick={() => {
                            if (activeFile === deleteFileRequest) {
                                if (code.length === 1) {
                                    setActiveFile("")
                                    setActiveFileIdx(-1)
                                } else {
                                    setActiveFile(code.filter((f) => f.file_name !== deleteFileRequest)[0].file_name)
                                }
                            }
                            setCode(prev => {
                                let newCode = prev.filter((f) => f.file_name !== deleteFileRequest)
                                debouncedUpdateCode(newCode)
                                return newCode
                            })
                            setDeleteFileRequest(null)
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    const containerRef = useRef(null)

    const bytesPage = () => {
        let lang = mapFilePathToLangOption(activeFile)

        return (
            <>
                <Container maxWidth="xl" style={containerStyle}>
                    <Box sx={topContainerStyle} ref={containerRef}>
                        <Box sx={difficultyAdjusterStyle}>
                            <DifficultyAdjuster
                                difficulty={determineDifficulty()}
                                onChange={updateDifficulty}
                            />
                        </Box>

                        {byteData ? (
                            <Typography variant="h4" component="h1" style={titleStyle}>
                                {byteData.name}
                            </Typography>
                        ) : (
                            <Box sx={titlePlaceholderContainerStyle}>
                                <Box sx={titlePlaceholderStyle}>
                                    <SheenPlaceholder width="400px" height={"45px"}/>
                                </Box>
                            </Box>
                        )}
                    </Box>
                    <div style={mainLayoutStyle}>
                        <div style={combinedSectionStyle}>
                            <div style={markdownSectionStyle}>
                                {byteData && id !== undefined && (
                                    <ByteChat
                                        byteID={id}
                                        // @ts-ignore
                                        description={byteData ? byteData[`description_${difficultyToString(determineDifficulty())}`] : ""}
                                        // @ts-ignore
                                        devSteps={byteData ? byteData[`dev_steps_${difficultyToString(determineDifficulty())}`] : ""}
                                        // @ts-ignore
                                        difficulty={difficultyToString(determineDifficulty())}
                                        // @ts-ignore
                                        questions={byteData ? byteData[`questions_${difficultyToString(determineDifficulty())}`] : []}
                                        code={code.map(x => {
                                            let content = x.content
                                            if (activeFile === x.file_name) {
                                                content = codeBeforeCursor + "<<CURSOR>>" + codeAfterCursor
                                            }

                                            return {
                                                code: content,
                                                file_name: x.file_name
                                            }
                                        })}
                                        containerRef={containerRef}
                                    />
                                )}
                            </div>
                            <Box
                                style={editorAndTerminalStyle}
                                ref={editorContainerRef}
                            >
                                {byteData && (
                                    <Tooltip title={programmingLanguages[byteData.lang]}>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                right: '8px',
                                                bottom: terminalVisible ? '228px' : '18px',
                                                zIndex: 3,
                                                minWidth: 0,
                                            }}
                                        >
                                            <BytesLanguage language={programmingLanguages[byteData.lang]}/>
                                        </Box>
                                    </Tooltip>
                                )}
                                <Box
                                    display={"inline-flex"}
                                    justifyContent={"space-between"}
                                    sx={{
                                        width: "100%",
                                        marginBottom: "8px"
                                    }}
                                >
                                    <EditorTabs
                                        value={activeFileIdx + 1}
                                        onChange={(e, idx) => {
                                            if (idx === 0) {
                                                setNewFilePopup(true)
                                                return
                                            }
                                            setActiveFile(code[idx - 1].file_name)
                                        }}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        aria-label="file tabs"
                                        TabIndicatorProps={{sx: {display: "none"}}}
                                    >
                                        <EditorTab icon={<Add/>} aria-label="New file"/>
                                        {code.map((file, index) => (
                                            <EditorTab
                                                key={file.file_name}
                                                label={
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        {file.file_name}
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setDeleteFileRequest(file.file_name)}
                                                            sx={{marginLeft: 0.5, padding: '2px', fontSize: "12px"}}
                                                        >
                                                            <CloseIcon fontSize="inherit"/>
                                                        </IconButton>
                                                    </div>
                                                }
                                            />
                                        ))}
                                    </EditorTabs>
                                    {activeFileIdx >= 0 && code[activeFileIdx] && code[activeFileIdx].content.length > 0 && lang?.execSupported && (
                                        <Box
                                            display={"inline-flex"}
                                        >
                                            <Tooltip title="Run Code">
                                                <LoadingButton
                                                    loading={executingCode}
                                                    variant="outlined"
                                                    color={"success"}
                                                    sx={{
                                                        zIndex: 3,
                                                        m: 0,
                                                        p: 0,
                                                        fontSize: "0.7rem !important",
                                                    }}
                                                    onClick={() => {
                                                        setOutputPopup(false);
                                                        buttonClickedRef.current = true;
                                                        if (!authState.authenticated) {
                                                            navigate("/signup?forward=" + encodeURIComponent(window.location.pathname))
                                                            return
                                                        }

                                                        executeCode(); // Indicate button click
                                                    }}
                                                >
                                                    Run <PlayArrow fontSize={"small"}/>
                                                </LoadingButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>
                                <Editor
                                    ref={editorRef}
                                    parentStyles={editorStyle}
                                    language={programmingLanguages[byteData ? byteData.lang : 5]}
                                    code={activeFileIdx >= 0 && code[activeFileIdx] ? code[activeFileIdx].content : ""}
                                    theme={mode}
                                    readonly={!authState.authenticated}
                                    onChange={(val, view) => handleEditorChange(val)}
                                    onCursorChange={(bytePosition, line, column) => setCursorPosition({
                                        row: line,
                                        column: column
                                    })}
                                    lspUrl={byteData && lspActive ? `wss://${byteData._id}-lsp.${config.coderPath.replace("https://", "")}` : undefined}
                                    diagnosticLevel={selectDiagnosticLevel()}
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
                            </Box>
                            {renderEditorSideBar()}
                        </div>
                        <div style={byteSelectionMenuStyle}>
                            {recommendedBytes &&
                              <ByteSelectionMenu bytes={recommendedBytes} onSelectByte={handleSelectByte}/>}
                        </div>
                    </div>
                </Container>
                {parsedSymbols !== null ? codeActionPortals.map(x => x.portal) : null}
                {xpPopup ? (<XpPopup oldXP={
                    //@ts-ignore
                    (xpData["xp_update"]["old_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]} levelUp={
                    //@ts-ignore
                    xpData["level_up_reward"] !== null} maxXP={100}
                    //@ts-ignore
                                     newXP={(xpData["xp_update"]["new_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]}
                    //@ts-ignore
                                     nextLevel={xpData["xp_update"]["old_level"] !== null ? xpData["xp_update"]["new_level"] : xpData["xp_update"]["next_level"]}
                    //@ts-ignore
                                     gainedXP={xpData["xp_update"]["new_xp"] - xpData["xp_update"]["old_xp"]}
                    //@ts-ignore
                                     reward={xpData["level_up_reward"]}
                    //@ts-ignore
                                     renown={xpData["xp_update"]["current_renown"]} popupClose={null}
                                     homePage={true}/>) : null}
            </>
        )
    }

    const journeyBytesPage = () => {
        return (
            <>
                <Container maxWidth="xl" style={containerStyle}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0rem',
                    }} ref={containerRef}>
                        {byteData ? (
                            <Typography variant="h4" component="h1" style={titleStyle}>
                                {byteData.name}
                            </Typography>
                        ) : (
                            <Box sx={titlePlaceholderContainerStyle}>
                                <Box sx={titlePlaceholderStyle}>
                                    <SheenPlaceholder width="400px" height={"45px"}/>
                                </Box>
                            </Box>
                        )}
                    </Box>
                    <div style={mainLayoutStyle}>
                        <div style={{
                            display: 'flex',
                            height: '80vh',
                            width: '95vw',
                            marginLeft: '30px',
                            marginRight: 'auto',
                            borderRadius: theme.shape.borderRadius,
                            overflow: 'hidden',
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                            border: `1px solid ${theme.palette.grey[300]}`,
                            padding: "10px",
                            backgroundColor: theme.palette.background.default
                        }}>
                            <div style={markdownSectionStyle}>
                                {byteData && id !== undefined && (
                                    <ByteChat
                                        byteID={id}
                                        // @ts-ignore
                                        description={byteData ? byteData[`description_${difficultyToString(determineDifficulty())}`] : ""}
                                        // @ts-ignore
                                        devSteps={byteData ? byteData[`dev_steps_${difficultyToString(determineDifficulty())}`] : ""}
                                        // @ts-ignore
                                        difficulty={difficultyToString(determineDifficulty())}
                                        // @ts-ignore
                                        questions={byteData ? byteData[`questions_${difficultyToString(determineDifficulty())}`] : []}
                                        code={code.map(x => {
                                            let content = x.content
                                            if (activeFile === x.file_name) {
                                                content = codeBeforeCursor + "<<CURSOR>>" + codeAfterCursor
                                            }

                                            return {
                                                code: content,
                                                file_name: x.file_name
                                            }
                                        })}
                                        containerRef={containerRef}
                                    />
                                )}
                            </div>
                            <Box
                                style={editorAndTerminalStyle}
                                ref={editorContainerRef}
                            >
                                {activeFileIdx >= 0 && code[activeFileIdx] && code[activeFileIdx].content.length > 0 && (
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
                                                    navigate("/signup")
                                                    return
                                                }

                                                executeCode(); // Indicate button click
                                            }}
                                        >
                                            <PlayArrow/>
                                        </LoadingButton>
                                    </Tooltip>
                                )}
                                {byteData && (
                                    <Tooltip title={programmingLanguages[byteData.lang]}>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                right: '8px',
                                                bottom: terminalVisible ? '228px' : '18px',
                                                zIndex: 3,
                                                minWidth: 0,
                                            }}
                                        >
                                            <BytesLanguage language={programmingLanguages[byteData.lang]}/>
                                        </Box>
                                    </Tooltip>
                                )}
                                <Editor
                                    ref={editorRef}
                                    parentStyles={editorStyle}
                                    language={programmingLanguages[byteData ? byteData.lang : 5]}
                                    code={activeFileIdx >= 0 && code[activeFileIdx] ? code[activeFileIdx].content : ""}
                                    theme={mode}
                                    readonly={!authState.authenticated}
                                    onChange={(val, view) => handleEditorChange(val)}
                                    onCursorChange={(bytePosition, line, column) => setCursorPosition({
                                        row: line,
                                        column: column
                                    })}
                                    lspUrl={byteData && lspActive ? `wss://${byteData._id}-lsp.${config.coderPath.replace("https://", "")}` : undefined}
                                    diagnosticLevel={selectDiagnosticLevel()}
                                    extensions={popupExtRef.current ? editorExtensions.concat(popupExtRef.current) : editorExtensions}
                                    wrapperStyles={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: "10px",
                                        ...(
                                            // default
                                            workspaceState === null ? {} :
                                                // starting or active
                                                workspaceState === 1 && lspActive ?
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
                            </Box>
                            {renderEditorSideBar()}
                        </div>
                    </div>
                </Container>
                {parsedSymbols !== null ? codeActionPortals.map(x => x.portal) : null}
                {xpPopup ? (<XpPopup oldXP={
                    //@ts-ignore
                    (xpData["xp_update"]["old_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]} levelUp={
                    //@ts-ignore
                    xpData["level_up_reward"] !== null} maxXP={100}
                    //@ts-ignore
                                     newXP={(xpData["xp_update"]["new_xp"] * 100) / xpData["xp_update"]["max_xp_for_lvl"]}
                    //@ts-ignore
                                     nextLevel={xpData["xp_update"]["old_level"] !== null ? xpData["xp_update"]["new_level"] : xpData["xp_update"]["next_level"]}
                    //@ts-ignore
                                     gainedXP={xpData["xp_update"]["new_xp"] - xpData["xp_update"]["old_xp"]}
                    //@ts-ignore
                                     reward={xpData["level_up_reward"]}
                    //@ts-ignore
                                     renown={xpData["xp_update"]["current_renown"]} popupClose={null}
                                     homePage={true}/>) : null}
            </>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {(queryParams.has('journey')) ? journeyBytesPage() : bytesPage()}
                {renderNewFilePopup()}
                {renderDeleteFilePopup()}
            </CssBaseline>
        </ThemeProvider>
    );
}

export default Byte;
