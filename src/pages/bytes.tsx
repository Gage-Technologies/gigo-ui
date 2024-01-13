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
    Paper, Card, Tooltip, Button, Divider, Tab, Tabs, TextField
} from "@mui/material";
import { getAllTokens } from "../theme";
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
import { AgentWsRequestMessage, ByteUpdateCodeRequest, ExecRequestPayload } from "../models/bytes";
import { programmingLanguages } from "../services/vars";
import { useGlobalCtWebSocket } from "../services/ct_websocket";
import MenuItem from "@mui/material/MenuItem";
import ByteNextStep from "../components/CodeTeacher/ByteNextStep";
import { IAceEditor } from "react-ace/lib/types";
import ReactAce from "react-ace/lib/ace";

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
    const [output, setOutput] = useState("");
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

    let { id } = useParams();

    let ctWs = useGlobalCtWebSocket();

    const ctChat = () => {

    }

    // Define your API call logic here
    const loadData = async () => {
        // Implement your API call logic
        // Example: Set the byteData state with the response
    };

    let globalWs = useGlobalWebSocket();

    const [markdown, setMarkdown] = useState("");

    const initialMarkdownContent = `
# Byte Instructions
**Objective:** Write a JavaScript function that logs "Hello, World!" to the console.

\`\`\`javascript
// Example:
function greet() {
    console.log("Hello, World!");
}
// Remember to call greet();
\`\`\`

Please write your code in the editor on the right.
`;

    useEffect(() => {
        globalWs.sendWebsocketMessage(
            {
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: WsMessageType.ByteUpdateCode,
                payload: {
                    byte_attempt_id: "0",
                    content: ""
                } satisfies ByteUpdateCodeRequest
            },
            (msg: WsMessage<any>) => {
                console.log(msg.payload);
            }
        )
    }, []);

    useEffect(() => {
        globalWs.sendWebsocketMessage(
            {
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: WsMessageType.AgentExecRequest,
                payload: {
                    byte_attempt_id: "0",
                    payload: {
                        lang: programmingLanguages.indexOf("Python"),
                        code: "print(\"Hello, World!\")"
                    }
                } satisfies AgentWsRequestMessage,
            },
            (msg: WsMessage<any>) => {
                if (msg.payload.type !== WsMessageType.AgentExecResponse) {
                    console.log("error: ", msg.payload);
                    return
                }

                // update console with payload
            }
        )
    }, []);

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

            if (res["byte_attempt"] !== undefined && res["byte_attempt"]["content"] !== "") {
                setCode(res["byte_attempt"]["content"]);
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
        getByte(byteId);
        startByteAttempt(byteId);
        getRecommendedBytes().then(() => {
            setLoading(false);
        });
        setMarkdown("");
    }, []);

    // Handle changes in the editor and activate the button
    const handleEditorChange = (newCode: string) => {
        console.log("new code: ", newCode)
        setCode(newCode);
        if (newCode && newCode !== "// Write your code here...") {
            setIsButtonActive(true);

            // Call createWorkspace only if it hasn't been called before
            if (!workspaceCreated && id) {
                // createWorkspace(id)
                //     .then(() => setWorkspaceCreated(true)) // Set the flag to true once the workspace is created
                //     .catch(console.error);
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

    // Styled AwesomeButton for the Submit button
    const SubmitButton = styled(AwesomeButton) <SubmitButtonProps>`
      position: absolute;
      bottom: 20px;
      right: 20px;
      &:before {
        transition: box-shadow 0.3s ease;
        box-shadow: ${props => props.isButtonActive ? '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ddd, 0 0 20px #ddd, 0 0 25px #ddd, 0 0 30px #ddd, 0 0 35px #ddd' : 'none'};
        border-radius: 25px;
      }
      &:hover:before {
        box-shadow: ${props => props.isButtonActive ? '0 0 3px #fff, 0 0 6px #fff, 0 0 9px #bbb, 0 0 12px #bbb, 0 0 15px #bbb, 0 0 18px #bbb, 0 0 21px #bbb' : 'none'};
      }
      &:active:before {
        box-shadow: ${props => props.isButtonActive ? '0 0 2px #fff, 0 0 4px #fff, 0 0 6px #aaa, 0 0 8px #aaa, 0 0 10px #aaa, 0 0 12px #aaa, 0 0 14px #aaa' : 'none'};
      }
      background-color: ${props => props.isButtonActive ? theme.palette.secondary.main : theme.palette.primary.main};
      cursor: ${props => props.isButtonActive ? 'pointer' : 'not-allowed'};
    `;

    const combinedSectionStyle: React.CSSProperties = {
        display: 'flex',
        height: '80vh', // Adjust height as needed
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
        gap: '1rem', // Add a gap between the main content and the menu
        marginTop: '1rem'
    };

    // Byte selection menu style
    const byteSelectionMenuStyle: React.CSSProperties = {
        width: '20%', // Adjust the width as needed
        maxHeight: '80vh', // Adjust the height as needed
        overflow: 'auto'
    };

    const containerStyle: React.CSSProperties = {
        width: '100%',
        padding: theme.spacing(0), // Remove vertical padding
        margin: '0',
        maxWidth: 'none',
    };

    const markdownSectionStyle: React.CSSProperties = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'transparent', // No background color here
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
    };

    const markdownContentStyle: React.CSSProperties = {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        overflowY: 'auto', // Allow vertical scrolling within the markdown section
        overflowX: 'hidden', // Prevent horizontal scrolling
        wordBreak: 'break-word', // Break long words to prevent horizontal scrolling
        whiteSpace: 'pre-wrap', // Wrap whitespace as necessary
    };

    // Style for markdown comment blocks
    const markdownBlockStyle: React.CSSProperties = {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(1),
        marginBottom: theme.spacing(1),
        wordBreak: 'break-word', // Ensure long words do not cause overflow
    };

    const editorAndTerminalStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%', // Use the full height of the parent container
    };

    // Adjust the height of the AceEditor and TerminalOutput
    const aceEditorStyle: React.CSSProperties = {
        width: '100%',
        height: 'calc(100% - 100px)', // Adjust height as needed, minus the height of the terminal
        borderRadius: theme.shape.borderRadius,
    };

    const terminalOutputStyle: React.CSSProperties = {
        backgroundColor: "#333",
        color: "lime",
        fontFamily: "monospace",
        padding: "10px",
        marginTop: "20px",
        borderRadius: "5px",
        whiteSpace: "pre-wrap",
        height: '100px', // Set the height of the terminal
    };

    const titleStyle: React.CSSProperties = {
        marginBottom: theme.spacing(2),
        textAlign: 'center', // Center align the title
        width: '60vw', // Match the width of the byte container
        marginLeft: '5%', // Align with the left margin of the byte container
    };

    let originalConsoleLog = console.log;

    const executeCode = () => {
        try {
            let capturedOutput = "";
            console.log = (...args) => {
                capturedOutput += args.join(" ") + "\n";
            };

            eval(code);

            console.log = originalConsoleLog; // Restore original console.log
            setOutput(capturedOutput);
        } catch (e) {
            console.log = originalConsoleLog; // Restore in case of error
            if (e instanceof Error) {
                setOutput("Error: " + e.message);
            } else {
                setOutput("Error: Unknown error occurred");
            }
        }
    };

    useEffect(() => {
        if (cursorPosition === null) {
            return
        }

        const lines = code.split("\n");
        console.log("line: ", lines[cursorPosition.row])
        if (lines[cursorPosition.row] === undefined) {
            return
        }
        let preffix = lines.filter((x, i) => i < cursorPosition.row).join("\n") + lines[cursorPosition.row].slice(0, cursorPosition.column)
        let suffix = lines[cursorPosition.row].slice(cursorPosition.column, lines[cursorPosition.row].length) + lines.filter((x, i) => i > cursorPosition.row).join("\n")
        setCodeBeforeCursor(preffix)
        setCodeAfterCursor(suffix)

        console.log("preffix\n", preffix)
        console.log("suffix\n", suffix)
    }, [code, cursorPosition])

    const logCursorPosition = React.useCallback(() => {
        console.log("registering cursor position")
        if (!aceEditorRef || !aceEditorRef.current) {
            return
        }

        const editor = aceEditorRef.current.editor;
        const cursorPosition = editor.getCursorPosition();

        console.log("new cursor position", cursorPosition)
        console.log("code content: ", code)
        
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
        output: string;
        style?: React.CSSProperties;
    }

    const TerminalOutput: React.FC<TerminalOutputProps> = ({ output, style }) => (
        <div style={{
            ...{
                backgroundColor: "#333",
                color: "lime",
                fontFamily: "monospace",
                padding: "10px",
                marginTop: "20px",
                borderRadius: "5px",
                whiteSpace: "pre-wrap"
            },
            ...style
        }}>
            {output || "No output"}
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
                                <CodeTeacher />
                                <TextField
                                    fullWidth
                                    label="Ask Code Teacher!"
                                    variant="outlined"
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
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
                            {isButtonActive && (
                                <SubmitButton
                                    style={{
                                        right: '22%',
                                        marginBottom: `2%`
                                    }}
                                    type="primary"
                                    onClick={executeCode}
                                    isButtonActive={isButtonActive}
                                >
                                    Submit Code
                                </SubmitButton>
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