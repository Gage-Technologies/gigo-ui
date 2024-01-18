import * as React from "react";
import { useEffect, useState } from "react";
import {
    Container,
    createTheme,
    Grid,
    CssBaseline,
    PaletteMode,
    ThemeProvider,
    Typography,
    Box,
    Paper, Card, Tooltip, Button, Divider, Tab, Tabs, TextField, Popper, DialogContent
} from "@mui/material";
import { getAllTokens, themeHelpers } from "../theme";
import { Close } from "@material-ui/icons";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import AppWrapper from "../components/AppWrapper";
import swal from "sweetalert";
import * as animationData from "../img/85023-no-data.json";
import ReactMarkdown from "react-markdown";
import styled from "@emotion/styled";
import { AwesomeButton } from "react-awesome-button";
import AceEditor from "react-ace";
import call from "../services/api-call";
import 'ace-builds'
import 'ace-builds/webpack-resolver'
import { CodeComponent } from "react-markdown/lib/ast-to-react";
import ByteSelectionMenu from "../components/ByteSelectionMenu";
import config from "../config";
import { useParams } from "react-router";
import { useGlobalWebSocket } from "../services/websocket";
import { WsMessage, WsMessageType } from "../models/websocket";
import {
    AgentWsRequestMessage,
    ByteUpdateCodeRequest,
    ExecRequestPayload,
    ExecResponsePayload,
    OutputRow
} from "../models/bytes";
import { programmingLanguages } from "../services/vars";
import { useGlobalCtWebSocket } from "../services/ct_websocket";
import MenuItem from "@mui/material/MenuItem";
import ByteNextStep from "../components/CodeTeacher/ByteNextStep";
import { IAceEditor } from "react-ace/lib/types";
import ReactAce from "react-ace/lib/ace";
import {
    CtByteNextOutputRequest,
    CtByteNextOutputResponse,
    CtGenericErrorPayload,
    CtMessage,
    CtMessageOrigin,
    CtMessageType,
    CtParseFileRequest, CtParseFileResponse,
    CtValidationErrorPayload
} from "../models/ct_websocket";
import { Nightlife } from "@mui/icons-material";
import ace from "ace-builds/src-noconflict/ace";
import "./bytes.css"
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import ByteChat from "../components/CodeTeacher/ByteChat";

const Range = ace.require('ace/range').Range;

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

function Byte() {
    let userPref = localStorage.getItem('theme');
    const [mode, _] = useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    // Define the state and dispatch hook
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Define the state for your data and loading state
    const [byteData, setByteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState("// Write your code here...");
    const [isButtonActive, setIsButtonActive] = useState(false);
    const [isReceivingData, setIsReceivingData] = useState(false);
    
    const [output, setOutput] = useState<OutputState | null>(null);

    const [currentByteTitle, setCurrentByteTitle] = useState("");
    const [workspaceCreated, setWorkspaceCreated] = useState(false);
    const [bytesDescription, setBytesDescription] = useState("");
    const [bytesDevSteps, setBytesDevSteps] = useState("");
    const [bytesLang, setBytesLang] = useState("python");

    const editorRef = React.useRef(null);
    const aceEditorRef = React.useRef<ReactAce | null>(null);
    const [cursorPosition, setCursorPosition] = useState<{row: number, column: number} | null>(null)
    const [codeBeforeCursor, setCodeBeforeCursor] = useState("");
    const [codeAfterCursor, setCodeAfterCursor] = useState("");
    const [outputPopup, setOutputPopup] = useState(false);
    const [outputMessage, setOutputMessage] = useState("");
    const [byteAttemptId, setByteAttemptId] = useState("");


    let { id } = useParams();

    let ctWs = useGlobalCtWebSocket();

    let globalWs = useGlobalWebSocket();

    const [markdown, setMarkdown] = useState("");

    // useEffect(() => {
    //     globalWs.sendWebsocketMessage(
    //         {
    //             sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    //             type: WsMessageType.ByteUpdateCode,
    //             payload: {
    //                 byte_attempt_id: "0",
    //                 content: ""
    //             } satisfies ByteUpdateCodeRequest
    //         },
    //         (msg: WsMessage<any>) => {
    //             console.log(msg.payload);
    //         }
    //     )
    // }, []);

    const sendExecRequest = () => {
        console.log("sendExecRequest triggered");

        const message = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: WsMessageType.AgentExecRequest,
            payload: {
                byte_attempt_id: byteAttemptId,
                payload: {
                    lang: programmingLanguages.indexOf("Python"),
                    code: code
                }
            }
        };

        console.log("Sending message:", message);

        setIsReceivingData(true);
        setOutput(null);

        globalWs.sendWebsocketMessage(
            message,
            (msg: WsMessage<any>): boolean => {
                console.log("Received message:", msg);

                if (msg.payload.type !== WsMessageType.AgentExecResponse) {
                    console.log("error: ", msg.payload);
                    //return true;
                }

                const payload = msg.payload as ExecResponsePayload;
                const { stdout, stderr, done } = payload;

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

                // we only return true here if we are done since true removes this callback
                return done
            }
        );
    };


    useEffect(() => {
        console.log("Output state updated:", output);
    }, [output]);

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
                bytesThumb: byteImages[Math.floor(Math.random() * byteImages.length)]
            }));
            setByteData(enhancedBytes);
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
                setCurrentByteTitle(res["rec_bytes"].name);

                // Process the outline content
                const outlineContent = res["rec_bytes"].outline_content
                    .replace(/\\n/g, "\n") // Replace escaped newlines with actual newline characters
                    .split('\n') // Split the string into lines
                    .map((line: string) => {
                        // Remove step number (formatted as "1.", "2.", etc.), trim, and format as a comment
                        const stepContent = line.replace(/^\d+\.\s*/, '').trim();
                        return stepContent ? `// ${stepContent}` : '';
                    })
                    .filter((line: string) => line) // Remove empty lines
                    .join('\n\n'); // Join lines with double newline for spacing

                setCode(outlineContent); // Set the processed content as code

                // Set the markdown content for other sections
                setMarkdown(`### Description\n${res["rec_bytes"].description}\n\n### Development Steps\n${res["rec_bytes"].dev_steps}`);
                setBytesDescription(res["rec_bytes"].description)
                setBytesDevSteps(res["rec_bytes"].dev_steps)
                setBytesLang(programmingLanguages[res["rec_bytes"].lang])

                setWorkspaceCreated(false);
            } else {
                swal("Byte Not Found", "The requested byte could not be found.");
            }
        } catch (error) {
            swal("Error", "An error occurred while fetching the byte data.");
        }
    };


    function getByteIdFromUrl() {
        const currentUrl = window.location.href;
        let urlParts = currentUrl.split('/');
        // Remove any empty strings from the end of the array (caused by trailing slashes)
        urlParts = urlParts.filter(part => part !== '');
        const byteId = urlParts[urlParts.length - 1];
        return byteId;
    }

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

            if (res["byte_attempt"] !== undefined && res["byte_attempt"]["content"] !== undefined) {
                setCode(res["byte_attempt"]["content"]);
                setByteAttemptId(res["byte_attempt"]["_id"]);
            }
        } catch (error) {
            swal("Error", "An error occurred while fetching the byte attempt data.");
        }
    };

    const createWorkspace = async (byteId: string) => {
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
                return;
            }

            if (res["message"] === "Workspace Created Successfully") {
                // TODO implement what needs to be done if successful
                console.log("agent_url: ", res['agent_url'])
                console.log("workspace: ", res['workspace'])
            }
        } catch (error) {
            swal("Error", "An error occurred while creating the byte workspace.");
        }
    };

    useEffect(() => {
        const byteId = getByteIdFromUrl();
        setLoading(true);
        getRecommendedBytes()
        getByte(byteId).then(() => {
            startByteAttempt(byteId).then(() => {
                if (!workspaceCreated && byteId) {
                    createWorkspace(byteId)
                        .then(() => setWorkspaceCreated(true))
                        .catch((error) => console.error("Error creating workspace:", error));
                }
            });
        }).finally(() => {
            setLoading(false);
        });
    }, [id]);

    // Handle changes in the editor and activate the button
    const handleEditorChange = (newCode: string) => {
        //console.log("new code: ", newCode)
        setCode(newCode);
        if (newCode && newCode !== "// Write your code here...") {
            setIsButtonActive(true);

            // Call createWorkspace only if it hasn't been called before
            if (!workspaceCreated && id) {
                createWorkspace(id)
                    .then(() => setWorkspaceCreated(true)) // Set the flag to true once the workspace is created
                    .catch(console.error);
            }
        } else {
            setIsButtonActive(false);
        }
    };

    const byteImages = [
        "/static/posts/t/1688617436791701504",
        "/static/posts/t/1688570643030736896",
        "/static/posts/t/1688638972722413568",
        "/static/posts/t/1688940677359992832",
        "/static/posts/t/1693725878338453504"
    ];

    const handleSelectByte = (id: string) => {
        getByte("999");
    };


    interface SubmitButtonProps {
        isButtonActive: boolean;
        onClick?: () => void;
    }

    const SubmitButton = styled(AwesomeButton)<SubmitButtonProps>`
      cursor: ${props => props.isButtonActive ? 'pointer' : 'not-allowed'};
      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    `;

    const combinedSectionStyle: React.CSSProperties = {
        display: 'flex',
        height: '80vh',
        width: '60vw',
        marginLeft: '5%',
        marginRight: 'auto',
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
        gap: "3%",
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
        border: `1px solid ${theme.palette.grey[300]}`,
        padding: "1%",
    };

    const mainLayoutStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '1rem',
        marginTop: '1rem'
    };

    // Byte selection menu style
    const byteSelectionMenuStyle: React.CSSProperties = {
        width: '20%',
        maxHeight: '80vh',
        overflow: 'auto'
    };

    const containerStyle: React.CSSProperties = {
        width: '100%',
        padding: theme.spacing(0),
        margin: '0',
        maxWidth: 'none',
    };

    const markdownSectionStyle: React.CSSProperties = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
    };

    const markdownContentStyle: React.CSSProperties = {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        overflowY: 'auto',
        overflowX: 'hidden',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
    };

    // Style for markdown comment blocks
    const markdownBlockStyle: React.CSSProperties = {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(1),
        marginBottom: theme.spacing(1),
        wordBreak: 'break-word',
    };

    const editorAndTerminalStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
    };

    // Adjust the height of the AceEditor and TerminalOutput
    const aceEditorStyle: React.CSSProperties = {
        width: '100%',
        height: 'calc(100% - 100px)',
        borderRadius: theme.shape.borderRadius,
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
        height: '300px',
        overflowY: 'auto',
        wordWrap: 'break-word',
    };

    const titleStyle: React.CSSProperties = {
        marginBottom: theme.spacing(2),
        textAlign: 'center',
        width: '60vw',
        marginLeft: '5%',
    };

    let originalConsoleLog = console.log;

    const sendWebsocketMessageNextOutput = (byteId: string, userCode: string, codeOutput: string) => {
        console.log("next output starting")

        console.log(" payload next output is: ", {
            byte_id: byteId,
            byte_description: bytesDescription,
            code_language: bytesLang,
            // @ts-ignore
            byte_output: codeOutput,// changed from this because of an error codeOutput["stdout"][0]
            code: userCode
        })


        ctWs.sendWebsocketMessage({
          sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          type: CtMessageType.WebSocketMessageTypeByteNextOutputMessageRequest,
          origin: CtMessageOrigin.WebSocketMessageOriginClient,
          created_at: Date.now(),
          payload: {
              byte_id: byteId,
              byte_description: bytesDescription,
              code_language: bytesLang,
              // @ts-ignore
              byte_output: codeOutput, // changed from codeOutput["stdout"][0] because of an error
              code: userCode
          }
      } satisfies CtMessage<CtByteNextOutputRequest>, (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtByteNextOutputResponse>) => {
          //console.log("response message of next output: ", msg)
          if (msg.type !== CtMessageType.WebSocketMessageTypeByteNextOutputMessageResponse) {
              console.log("failed next output message", msg)
              return true
          }
          const p: CtByteNextOutputResponse = msg.payload as CtByteNextOutputResponse;
          setOutputMessage(p.complete_message)
          setOutputPopup(true)
        //   if (p.done) {
        //       setState(State.COMPLETED)
        //       return true
        //   }
          return false
      })
    };

    useEffect(() => {
        console.log("output is: ", output)
        console.log("id is: ", id)
        // @ts-ignore
        if (id !== undefined && output) {
            console.log("next output called")
            sendWebsocketMessageNextOutput(id, code, output.merged)
        }
    }, [output])

    const executeCode = () => {
        console.log("executeCode called")
        sendExecRequest();
        // todo: remove later
        // console.log("id is: ", id)
        // // @ts-ignore
        // if (id !== undefined) {
        //     sendWebsocketMessageNextOutput(id, code, {stdout: ["testing true"], stderr: ["nil"]})
        // }
    };

    useEffect(() => {
        if (cursorPosition === null) {
            return
        }

        const lines = code.split("\n");
        //console.log("line: ", lines[cursorPosition.row])
        if (lines[cursorPosition.row] === undefined) {
            return
        }
        let preffix = lines.filter((x, i) => i < cursorPosition.row).join("\n") + lines[cursorPosition.row].slice(0, cursorPosition.column)
        let suffix = lines[cursorPosition.row].slice(cursorPosition.column, lines[cursorPosition.row].length) + lines.filter((x, i) => i > cursorPosition.row).join("\n")
        setCodeBeforeCursor(preffix)
        setCodeAfterCursor(suffix)

        //console.log("preffix\n", preffix)
        //console.log("suffix\n", suffix)
    }, [code, cursorPosition])

    const logCursorPosition = React.useCallback(() => {
        //console.log("registering cursor position")
        if (!aceEditorRef || !aceEditorRef.current) {
            return
        }

        const editor = aceEditorRef.current.editor;
        const cursorPosition = editor.getCursorPosition();

        //console.log("new cursor position", cursorPosition)
        //console.log("code content: ", code)
        
        setCursorPosition({
            row: cursorPosition.row,
            column: cursorPosition.column,
        })
    }, [aceEditorRef.current]);

    useEffect(() => {
        // Function to log the cursor position
        if (!aceEditorRef || !aceEditorRef.current) {
            return
        }

        // Get the Ace Editor instance from the ref and attach the changeCursor event listener
        const editor = aceEditorRef.current.editor;
        editor.session.selection.on('changeCursor', logCursorPosition);

        // Cleanup the event listener when the component unmounts
        return () => {
            editor.session.selection.off('changeCursor', logCursorPosition);
        };
    }, []);

    interface TerminalOutputProps {
        output: OutputState | null;
        style?: React.CSSProperties;
    }

    const TerminalOutput: React.FC<TerminalOutputProps> = ({ output, style }) => (
        <div style={{ ...terminalOutputStyle, ...style }}>
            {output && output.mergedLines.map((line, index) => (
                <div key={index} style={{ color: line.error ? "red" : "white" }}>
                    {line.content}
                </div>
            ))}
        </div>
    );

    const CodeBlock: CodeComponent = ({ inline, className, children, ...props }) => {
        if (inline) {
            return <code className={className} {...props}>{children}</code>;
        }
        return (
            <pre style={markdownBlockStyle}>
                <code className={className} {...props}>{children}</code>
            </pre>
        );
    };

    interface TextBlockProps {
        children?: React.ReactNode;
        node?: any;
    }

    const TextBlock = ({ children, node, ...props }: TextBlockProps) => {
        return <p {...props}>{children}</p>;
    };

    const renderUserMessage = (content: string) => {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    paddingBottom: '10px'
                }}
            >
                <Card
                    style={{
                        fontSize: ".75rem",
                        marginLeft: "auto",
                        marginRight: "10px",
                        marginBottom: "0px",
                        padding: "10px",
                        backgroundColor: "#0842a040",
                        border: "1px solid #0842a0",
                        color: "#fcfcfc",
                        borderRadius: "10px",
                        width: "auto",
                        height: "auto",
                        display: "block",
                        maxWidth: "90%"
                    }}
                >
                    <ReactMarkdown components={{ code: CodeBlock, p: TextBlock }}>
                        {content}
                    </ReactMarkdown>
                </Card>
            </div>
        );
    }

    const renderBotMessage = (
        content: string,
        loading: boolean,
        _id: string | null = null,
        premiumLlm: boolean = false,
        freeCreditUse: boolean = false
    ) => {

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    paddingBottom: '10px'
                }}
            >
                <Card
                    style={{
                        fontSize: ".75rem",
                        marginLeft: "10px",
                        marginRight: "auto",
                        marginBottom: "0px",
                        padding: "10px",
                        backgroundColor: "#31343a40",
                        border: `1px solid ${premiumLlm ? "#84E8A2" : "#31343a"}`,
                        color: "white",
                        borderRadius: "10px",
                        width: "auto",
                        height: "auto",
                        display: "block",
                        maxWidth: "90%"
                    }}
                >
                    <ReactMarkdown components={{ code: CodeBlock, p: TextBlock }}>
                        {content}
                    </ReactMarkdown>
                </Card>
            </div>
        );
    }

    const [typeTab, setTypeTab] = React.useState("Outline")
    const handleChange = async (event: React.SyntheticEvent, newValue: string) => {
        setTypeTab(newValue);
    };

    const MessageContainer = styled('div')(({ theme }) => ({
        overflowY: 'auto',
        padding: 2,
        marginBottom: 4, // space for the input field and button
        height: '68vh', // adjust based on your header/footer size
    }));

    type Message = {
        type: 'user' | 'bot';
        content: string;
    };

    const [userMessage, setUserMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    const handleSend = () => {
        // Add user message to messages array
        setMessages(prevMessages => [...prevMessages, { type: 'user', content: userMessage }]);
        setUserMessage('');

        // Simulate receiving a bot message after a delay
        setTimeout(() => {
            const botResponse = "Bot's response to: " + userMessage;
            setMessages(prevMessages => [...prevMessages, { type: 'bot', content: botResponse }]);
        }, 1000); // Simulating delay for bot response
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            handleSend();
        }
    };

    const CodeTeacher = () => {
        return (
            <Box>
                <MessageContainer>
                    {renderBotMessage(markdown, false, "123", true, false)}
                    {renderUserMessage("Help me with my code")}
                </MessageContainer>
            </Box>
        );
    };

    const [currentLineMarker, setCurrentLineMarker] = useState<number | null>(null);

    // const editorMarkCallback = React.useCallback(() => {
    //     console.log("marker callback")
    //
    //     if (!aceEditorRef.current) {
    //         return;
    //     }
    //
    //     console.log("marking editor")
    //
    //     const editor = aceEditorRef.current.editor;
    //     const session = editor.getSession();
    //     const Range = ace.require('ace/range').Range;
    //
    //     console.log("marked")
    //
    //     // Get the current cursor position
    //     const cursor = editor.getCursorPosition();
    //
    //     // Add a new marker for the current line
    //     const newMarker = session.addMarker(new Range(cursor.row, 0, cursor.row, 1), "editorLineHighlighted", "fullLine");
    //     //@ts-ignore
    //     setCurrentLineMarker(newMarker);
    // }, [aceEditorRef.current, currentLineMarker])

    function findFunctionStartLine(code: string, cursorLine: number) {
        const lines = code.split('\n');
        let depth = 0;

        for (let i = cursorLine - 1; i >= 0; i--) {
            const line = lines[i].trim();

            // Check for function start patterns
            if (line.match(/function\s+(\w+)?\s*\(/) || // function declaration/expression
                line.match(/(\w+)\s*=\s*function\s*\(/) || // function expression
                line.match(/(\w+)\s*=\s*\(/) || // arrow function
                line.match(/(\w+):\s*function\s*\(/)) { // method shorthand
                if (depth === 0) {
                    return i;
                }
                depth--;
            }

            // Check for function end (simple approach)
            if (line.endsWith('}')) {
                depth++;
            }
        }

        return -1; // Function start not found
    }


    useEffect(() => {
        console.log("marker callback")

        if (!aceEditorRef.current || cursorPosition === null) {
            return;
        }

        console.log("marking editor")

        const editor = aceEditorRef.current.editor;
        const session = editor.getSession();
        const code = session.getValue();

        if (currentLineMarker != null) {
            console.log("removing current marker")
            session.removeMarker(currentLineMarker);
        }

        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeParseFileRequest,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                relative_path: "main." + (bytesLang === "Go" ? "go" : "py"),
                content: code
            }
        } satisfies CtMessage<CtParseFileRequest>, (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtParseFileResponse>): boolean => {
            //console.log("response message of next output: ", msg)
            if (msg.type !== CtMessageType.WebSocketMessageTypeParseFileResponse) {
                console.log("failed parse file", msg)
                return true
            }
            const p: CtParseFileResponse = msg.payload as CtParseFileResponse;

            // locate the symbol that the cursor is pointing to
            for (let i = 0; i < p.nodes.length; ++i) {
                let node = p.nodes[i]

                // check if the cursor row is within the nodes content location
                if (
                    node.position.start_line <= cursorPosition.row &&
                    node.position.end_line >= cursorPosition.row
                ) {
                    const newMarker = session.addMarker(new Range(node.position.start_line, 0, node.position.end_line, Infinity), "editorLineHighlighted", "fullLine");
                    setCurrentLineMarker(newMarker);
                    break;
                }
            }

            return true
        })

        // const functionStartLine = findFunctionStartLine(code, cursorPosition.row);
        //
        // console.log("marked")
        //
        // console.log("cursorPosition is: ", cursorPosition)
        // console.log("functionStart: ", functionStartLine)
        //
        // // // Add a new marker for the current line
        // // const newMarker = session.addMarker(new Range(cursorPosition.row, 0, cursorPosition.row, 1), "editorLineHighlighted", "fullLine");
        // // Add a new marker for the current line
        // const newMarker = session.addMarker(new Range(functionStartLine, 0, cursorPosition.row, Infinity), "editorLineHighlighted", "fullLine");
        // //@ts-ignore
        // setCurrentLineMarker(newMarker);
    }, [code, cursorPosition])

    // useEffect(() => {
    //     if (!aceEditorRef.current) {
    //         return;
    //     }
    //
    //     const editor = aceEditorRef.current.editor;
    //
    //     // Attach event listener for cursor changes
    //     editor.session.selection.on('changeCursor', editorMarkCallback);
    //
    //     // Cleanup
    //     return () => {
    //         editor.session.selection.off('changeCursor', editorMarkCallback);
    //         if (currentLineMarker) {
    //             editor.session.removeMarker(currentLineMarker);
    //         }
    //     };
    // }, [aceEditorRef.current]);


    let minorValues = ["Outline", "Code Teacher"]
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Container maxWidth="xl" style={containerStyle}>
                    <Typography variant="h4" component="h1" style={titleStyle}>
                        {currentByteTitle}
                    </Typography>
                    <div style={mainLayoutStyle}>
                        <div style={combinedSectionStyle}>
                            <div style={markdownSectionStyle}>
                                <ByteChat/>
                            </div>
                            <ByteNextStep
                                open={true}
                                closeCallback={() => { }}
                                currentCode={code}
                                anchorEl={editorRef.current}
                                placement="right-start"
                                posMods={[0, 40]}
                                maxWidth="30vw"
                                bytesID={id || ""}
                                bytesDescription={bytesDescription}
                                bytesDevSteps={bytesDevSteps}
                                bytesLang={bytesLang}
                                codePrefix={codeBeforeCursor}
                                codeSuffix={codeAfterCursor}
                            />
                            <div
                                style={editorAndTerminalStyle}
                                ref={editorRef}
                            >
                                <AceEditor
                                    ref={aceEditorRef}
                                    mode={bytesLang === "Go" ? "golang" : "python"}
                                    theme="monokai"
                                    value={code}
                                    onChange={handleEditorChange}
                                    name="ACE_EDITOR_DIV"
                                    editorProps={{ $blockScrolling: true }}
                                    style={aceEditorStyle}
                                />
                                <TerminalOutput output={output} style={terminalOutputStyle} />
                            </div>
                            <div>
                                <Popper
                                    open={outputPopup}
                                    anchorEl={editorRef.current}
                                    placement={"right-start"}
                                    sx={{
                                        backgroundColor: "transparent",
                                        // height: "50vh"
                                        // width: "20vw",
                                    }}
                                    modifiers={[
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [0, 40], // x, y offset
                                            },
                                        },
                                    ]}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'start',
                                            p: 1,
                                            borderRadius: '10px',
                                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2);',
                                            ...themeHelpers.frostedGlass,
                                            backgroundColor: 'rgba(19,19,19,0.31)',
                                            maxWidth: "30vw"
                                        }}
                                    >
                                        <Button
                                            variant="text"
                                            color="error"
                                            sx={{
                                                position: "absolute",
                                                right: 10,
                                                top: 10,
                                                borderRadius: "50%",
                                                padding: 1,
                                                minWidth: "0px"
                                            }}
                                            onClick={() => setOutputPopup(false)}
                                        >
                                            <Close />
                                        </Button>
                                        <DialogContent
                                            sx={{
                                                backgroundColor: 'transparent',
                                                maxHeight: '70vh',
                                                overflow: 'auto',
                                                mt: outputMessage.length > 0 ? 2: undefined,
                                            }}
                                        >
                                            <MarkdownRenderer
                                                markdown={outputMessage}
                                                style={{
                                                    overflowWrap: 'break-word',
                                                    borderRadius: '10px',
                                                    padding: '0px',
                                                }}
                                            />
                                        </DialogContent>
                                    </Box>
                                </Popper>
                            </div>
                            {isButtonActive && (
                                <button
                                    style={{
                                        position: 'absolute',
                                        right: '16%',
                                        top:"90%",
                                        marginBottom: '2%',
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: theme.shape.borderRadius,
                                        cursor: 'pointer',
                                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)'
                                    }}
                                    onClick={executeCode}
                                >
                                    Submit Code
                                </button>
                            )}
                        </div>
                        <div style={byteSelectionMenuStyle}>
                            {byteData && <ByteSelectionMenu bytes={byteData} onSelectByte={handleSelectByte} />}
                        </div>
                    </div>
                </Container>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default Byte;
