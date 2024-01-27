import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import {
    Container,
    createTheme, CssBaseline,
    PaletteMode,
    ThemeProvider,
    Typography,
    Box, Tooltip, Button
} from "@mui/material";
import { getAllTokens } from "../theme";
import { Close, PlayArrow } from "@material-ui/icons";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import call from "../services/api-call";
import 'ace-builds';
import 'ace-builds/webpack-resolver';
import ByteSelectionMenu from "../components/ByteSelectionMenu";
import config from "../config";
import { useParams } from "react-router";
import { useGlobalWebSocket } from "../services/websocket";
import { WsGenericErrorPayload, WsMessage, WsMessageType } from "../models/websocket";
import {
    ExecResponsePayload,
    OutputRow
} from "../models/bytes";
import { programmingLanguages } from "../services/vars";
import { useGlobalCtWebSocket } from "../services/ct_websocket";
import ByteNextStep from "../components/CodeTeacher/ByteNextStep";
import ace from "ace-builds/src-noconflict/ace";
import "./bytes.css";
import ByteChat from "../components/CodeTeacher/ByteChat";
import { LoadingButton } from "@mui/lab";
import ByteNextOutputMessage from "../components/CodeTeacher/ByteNextOutputMessage";
import Editor from "../components/IDE/Editor";
import chroma from 'chroma-js';
import SheenPlaceholder from "../components/Loading/SheenPlaceholder";
import { sleep } from "../services/utils";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import DifficultyAdjuster from "../components/ByteDifficulty";
import { selectAuthState } from "../reducers/auth/auth";
import { initialBytesStateUpdate, selectBytesState, updateBytesState } from "../reducers/bytes/bytes";
import ByteTerminal from "../components/Terminal";

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

interface ByteAttempt {
    _id: string;
    byte_id: string;
    author_id: string;
    content_easy: string;
    content_medium: string;
    content_hard: string;
    modified: boolean;
}


function Byte() {
    let userPref = localStorage.getItem('theme');
    const [mode, _] = useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

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
        height: terminalVisible ? "calc(100% - 200px)" : "100%",
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
    const [loading, setLoading] = useState(true);
    const [initialCode, setInitialCode] = useState("// Write your code here...");
    const [code, setCode] = useState("// Write your code here...");
    const [longLine, setLongLine] = useState(false);
    const [isButtonActive, setIsButtonActive] = useState(false);
    const [isReceivingData, setIsReceivingData] = useState(false);

    const [output, setOutput] = useState<OutputState | null>(null);

    const [workspaceCreated, setWorkspaceCreated] = useState(false);
    const [containerStyle, setContainerSyle] = useState<React.CSSProperties>(containerStyleDefault)
    const [cursorPosition, setCursorPosition] = useState<{ row: number, column: number } | null>(null)
    const [codeBeforeCursor, setCodeBeforeCursor] = useState("");
    const [codeAfterCursor, setCodeAfterCursor] = useState("");
    const [outputPopup, setOutputPopup] = useState(false);
    const [outputMessage, setOutputMessage] = useState("");
    const [byteAttemptId, setByteAttemptId] = useState("");
    const [easyCode, setEasyCode] = useState("");
    const [mediumCode, setMediumCode] = useState("");
    const [hardCode, setHardCode] = useState("");
    const typingTimerRef = useRef(null);
    const [suggestionPopup, setSuggestionPopup] = useState(false);
    const [nextStepsPopup, setNextStepsPopup] = useState(false);
    const [commandId, setCommandId] = useState("");

    const [executingOutputMessage, setExecutingOutputMessage] = useState<boolean>(false)
    const [executingCode, setExecutingCode] = useState<boolean>(false)

    const pingInterval = React.useRef<NodeJS.Timer | null>(null)

    const editorContainerRef = React.useRef<HTMLDivElement>(null);
    const editorRef = React.useRef<ReactCodeMirrorRef>(null);

    const [activeSidebarTab, setActiveSidebarTab] = React.useState<string | null>(null);


    let { id } = useParams();

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
            stdout: [{ timestamp: Date.now() * 1000, content: "Running..." }],
            stderr: [],
            merged: "Running...",
            mergedLines: [{ timestamp: Date.now() * 1000, content: "Running...", error: false }],
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
                const { stdout, stderr, done } = payload;

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
            // Map through each byte and add a random image from byteImages
            const enhancedBytes = res["rec_bytes"].map((byte: any) => ({
                ...byte,
                id: byte._id,
                bytesThumb: byteImages[Math.floor(Math.random() * byteImages.length)],
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
                { byte_id: byteId },
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
                { byte_id: byteId },
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
                { byte_id: byteId },
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
                byte_id: byteAttemptId ,
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


    // Handle changes in the editor and activate the button
    const handleEditorChange = (newCode: string) => {
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
        if (newCode && newCode !== "// Write your code here..." && newCode !== initialCode) {
            setIsButtonActive(true);

            updateCode(newCode);

            // // Call createWorkspace only if it hasn't been called before
            // if (!workspaceCreated && id) {
            //     createWorkspace(id)
            //         .then(() => setWorkspaceCreated(true)) // Set the flag to true once the workspace is created
            //         .catch(console.error);
            // }
        } else {
            setIsButtonActive(false);
        }
    };

    // const handleEditorUpdate = (viewUpdate: ViewUpdate) => {
    //     // Check if the update is due to cursor movement
    //     if ((viewUpdate.docChanged || viewUpdate.selectionSet)) {
    //         // retrieve the cursor position
    //         const cursorPosition = viewUpdate.state.selection.main.head;
    //         // get the line and column position
    //         const lineInfo = viewUpdate.state.doc.lineAt(cursorPosition);
    //         props.onCursorChange(cursorPosition, lineInfo.number-1, cursorPosition - lineInfo.from)
    //     }
    // };

    const byteImages = [
        "/static/posts/t/1688617436791701504",
        "/static/posts/t/1688570643030736896",
        "/static/posts/t/1688638972722413568",
        "/static/posts/t/1688940677359992832",
        "/static/posts/t/1693725878338453504"
    ];

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
                navigate("/signup")
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

    // interface TerminalOutputProps {
    //     output: OutputState | null;
    //     style?: React.CSSProperties;
    //     executeCode: () => void; // Function to execute code
    //     cancelCodeExec: (commandId: string) => void; // Function to cancel code execution
    //     isRunning: boolean; // Whether code is currently executing
    //     commandId: string; // Command ID for execution
    // }
    //
    // const TerminalOutput: React.FC<TerminalOutputProps> = ({ output, style, executeCode, cancelCodeExec, isRunning, commandId }) => {
    //     const { setBufferedContent } = useContext(TerminalContext);
    //     // Define terminal commands
    //     const terminalCommands = {
    //         cancel: {
    //             description: "Cancel the running code",
    //             fn: () => {
    //                 if (isRunning) {
    //                     cancelCodeExec(commandId);
    //                     return "Cancelling code execution...";
    //                 }
    //                 return "No code is running";
    //             }
    //         },
    //         // Add more commands as needed
    //     };
    //
    //
    //     const formattedOutput = useMemo(() => {
    //         if (!output) return "";
    //         return output.mergedLines.map(line => `${line.error ? "Error: " : ""}${line.content}`).join("\n");
    //     }, [output]);
    //
    //     return (
    //         <Box style={{ ...style }}>
    //             <ReactTerminal
    //                 commands={terminalCommands}
    //                 welcomeMessage="Welcome to Byte terminal"
    //                 prompt=">>"
    //                 theme="material-dark"
    //                 errorMessage="Command not found"
    //                 outputRender={() => (
    //                     <pre>{formattedOutput}</pre>
    //                 )}
    //             />
    //         </Box>
    //     );
    // };

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

    const renderEditorSideBar = () => {
        return (
            <Box
                display={"flex"}
                flexDirection={"column"}
                sx={{
                    width: "fit-content",
                    padding: "0px",
                    gap: "10px",
                    height: "100%"
                }}
            >
                {(activeSidebarTab === null || activeSidebarTab === "nextSteps") && (
                    <ByteNextStep
                        trigger={nextStepsPopup}
                        acceptedCallback={() => {
                            setNextStepsPopup(false)
                        }}
                        onExpand={() => setActiveSidebarTab("nextSteps")}
                        onHide={() => setActiveSidebarTab(null)}
                        currentCode={code}
                        maxWidth="20vw"
                        bytesID={id || ""}
                        // @ts-ignore
                        bytesDescription={byteData ? byteData[`description_${difficultyToString(determineDifficulty())}`] : ""}
                        // @ts-ignore
                        bytesDevSteps={byteData ? byteData[`dev_steps_${difficultyToString(determineDifficulty())}`] : ""}
                        bytesLang={programmingLanguages[byteData ? byteData.lang : 5]}
                        codePrefix={codeBeforeCursor}
                        codeSuffix={codeAfterCursor}
                    />
                )}
                {(activeSidebarTab === null || activeSidebarTab === "debugOutput") && (
                    <ByteNextOutputMessage
                        trigger={outputPopup}
                        acceptedCallback={() => { setOutputPopup(false) }}
                        onExpand={() => setActiveSidebarTab("debugOutput")}
                        onHide={() => setActiveSidebarTab(null)}
                        onSuccess={() => {
                            markComplete()
                        }}
                        lang={programmingLanguages[byteData ? byteData.lang : 5]}
                        code={code}
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
                    />
                )}
            </Box>
        )
    }

    if (window.innerWidth < 1000) {
        navigate("/")
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Container maxWidth="xl" style={containerStyle}>
                    <Box sx={topContainerStyle}>
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
                                    <SheenPlaceholder width="400px" height={"45px"} />
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
                                        codePrefix={codeBeforeCursor}
                                        codeSuffix={codeAfterCursor}
                                        codeLanguage={programmingLanguages[byteData ? byteData.lang : 5]}
                                    />
                                )}
                            </div>
                            <Box
                                style={editorAndTerminalStyle}
                                ref={editorContainerRef}
                            >
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
                                                    navigate("/signup")
                                                    return
                                                }

                                                executeCode(); // Indicate button click
                                            }}
                                        >
                                            <PlayArrow />
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
                                    onCursorChange={(bytePosition, line, column) => setCursorPosition({ row: line, column: column })}
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
                            {recommendedBytes && <ByteSelectionMenu bytes={recommendedBytes} onSelectByte={handleSelectByte}/>}
                        </div>
                    </div>
                </Container>
            </CssBaseline>
        </ThemeProvider >
    );
}

export default Byte;
