import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    alpha,
    Box,
    Button,
    CircularProgress,
    Container,
    createTheme,
    CssBaseline,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    List,
    ListItemButton,
    MenuItem,
    PaletteMode,
    Paper,
    Select,
    SpeedDial,
    SpeedDialAction,
    TextField,
    Theme,
    ThemeProvider,
    Tooltip,
    Typography
} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import {getAllTokens} from "../theme";
import {styled} from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import CodeIcon from '@mui/icons-material/Code';
import Editor from "../components/IDE/Editor";
import Slide from "@mui/material/Slide";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import {grey} from "@mui/material/colors";
import SheenPlaceholder from "../components/Loading/SheenPlaceholder";
import {CtCircularProgress} from "../components/CodeTeacher/CtCircularProgress";
import {useGlobalCtWebSocket} from "../services/ct_websocket";
import {
    CtChatMessageType,
    CtExecCommand,
    CtGenericErrorPayload,
    CtGetHHChatMessagesRequest,
    CtGetHHChatMessagesResponse,
    CtGetHHChatMessagesResponseMessage,
    CtGetHHChatsRequest,
    CtGetHHChatsResponse,
    CtGetHHChatsResponseChat,
    CtHHAssistantMessage,
    CtHhUserMessage,
    CtMessage,
    CtMessageOrigin,
    CtMessageType,
    CtNewHhChatRequest,
    CtNewHhChatResponse,
    CtValidationErrorPayload
} from "../models/ct_websocket";
import {Add, LibraryBooks, PlayArrow} from "@material-ui/icons";
import {useAppSelector} from "../app/hooks";
import {selectAuthState} from "../reducers/auth/auth";
import {format, formatDistanceToNow, parseISO} from 'date-fns';
import {Helmet, HelmetProvider} from "react-helmet-async";
import {useParams} from "react-router";
import {useNavigate} from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ByteTerminal from "../components/Terminal";
import {ExecResponsePayload, OutputRow} from "../models/bytes";
import {WsGenericErrorPayload, WsMessage, WsMessageType} from "../models/websocket";
import {useGlobalWebSocket} from "../services/websocket";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {Workspace} from "../models/workspace";
import CodeSource from "../models/codeSource";
import {LoadingButton} from "@mui/lab";
import {sleep} from "../services/utils";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import LinkIcon from "@mui/icons-material/Link";
import CodeTeacherChatIcon from "../components/CodeTeacher/CodeTeacherChatIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

interface LanguageOption {
    name: string;
    extensions: string[];
    languageId: number;
}

interface InitialStatusMessage {
    workspace: Workspace;
    code_source: CodeSource;
    workspace_url: string
}

const languages: LanguageOption[] = [
    {name: 'Go', extensions: ['go'], languageId: 6},
    {name: 'Python', extensions: ['py', 'pytho'], languageId: 5},
    {name: 'C++', extensions: ['cpp', 'cc', 'cxx', 'hpp', 'c++'], languageId: 8},
    {name: 'HTML', extensions: ['html', 'htm'], languageId: 27},
    {name: 'Java', extensions: ['java'], languageId: 2},
    {name: 'JavaScript', extensions: ['js'], languageId: 3},
    {name: 'JSON', extensions: ['json'], languageId: 1},
    {name: 'Markdown', extensions: ['md'], languageId: 1},
    {name: 'PHP', extensions: ['php'], languageId: 13},
    {name: 'Rust', extensions: ['rs'], languageId: 14},
    {name: 'SQL', extensions: ['sql'], languageId: 34},
    {name: 'XML', extensions: ['xml'], languageId: 1},
    {name: 'LESS', extensions: ['less'], languageId: 1},
    {name: 'SASS', extensions: ['sass', 'scss'], languageId: 1},
    {name: 'Clojure', extensions: ['clj'], languageId: 21},
    {name: 'C#', extensions: ['cs'], languageId: 10},
    {name: 'Shell', extensions: ['bash', 'sh'], languageId: 38}
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

const InitStyledContainer = styled(Container)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: 'calc(100vh - 72px)',
    transition: theme.transitions.create(['height', 'max-width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
}));

const SearchContainer = styled(Paper)(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: "none",
    background: "transparent"
}));

const StyledTextField = styled(TextField)(({theme}) => ({
    color: 'inherit',
    width: '100%',
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.background.default,
}));

const CodeTeacherPopupPaper = styled(Paper)`
    animation: ctPopupAuraEffect 2s infinite alternate;
    border: none;

    @keyframes ctPopupAuraEffect {
        0% {
            box-shadow: 0 0 3px #84E8A2, 0 0 6px #84E8A2;
        }
        20% {
            box-shadow: 0 0 3px #29C18C, 0 0 6px #29C18C;
        }
        40% {
            box-shadow: 0 0 3px #1C8762, 0 0 6px #1C8762;
        }
        60% {
            box-shadow: 0 0 3px #2A63AC, 0 0 6px #2A63AC;
        }
        80% {
            box-shadow: 0 0 3px #3D8EF7, 0 0 6px #3D8EF7;
        }
        100% {
            box-shadow: 0 0 3px #63A4F8, 0 0 6px #63A4F8;
        }
    }
`;

interface InitProps {
    theme: Theme;
    toggleEditor: () => void;
    submit: (content: string) => void;
}

const HomeworkHelperInit = ({theme, toggleEditor, submit}: InitProps) => {
    const [active, setActive] = React.useState(false);
    const [text, setText] = React.useState("");

    return (
        <InitStyledContainer maxWidth={active || text.length > 0 ? "md" : "sm"}>
            <Box sx={{textAlign: 'center'}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    GIGO Homework Helper
                </Typography>
            </Box>
            <SearchContainer elevation={6}>
                <StyledTextField
                    fullWidth
                    multiline
                    maxRows={16}
                    placeholder="Enter your homework question..."
                    onFocus={() => setActive(true)}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            submit(text)
                            setText("")
                        }
                        if (e.key === 'Tab') {
                            e.preventDefault();
                            setText(text + '    ');
                        }
                    }}
                    value={text}
                    InputProps={{
                        sx: {
                            padding: theme.spacing(3),
                            fontSize: text.length > 0 ? "medium" : undefined,
                            borderRadius: "20px"
                        },
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title={"Add Code"}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        sx={{borderRadius: "50%", minWidth: "0px", p: 1}}
                                        onClick={(e) => {
                                            toggleEditor()
                                        }}
                                    >
                                        <CodeIcon/>
                                    </Button>
                                </Tooltip>
                            </InputAdornment>
                        ),
                        'aria-label': 'ask',
                    }}
                />
            </SearchContainer>
        </InitStyledContainer>
    );
};

const ActiveStyledContainer = styled(Container)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    // justifyContent: 'center',
    height: 'calc(100vh - 72px)',
    paddingTop: '16px',
    transition: theme.transitions.create(['height', 'max-width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
}));

interface ActiveProps {
    mode: string;
    theme: Theme;
    messages: Array<CtGetHHChatMessagesResponseMessage>;
    toggleEditor: (state?: boolean) => void;
    setEditorCode: (code: string, lang: string | undefined) => void;
    sendMessage: (content: string) => void;
    activeResponse?: { text: string, code: string, codeLanguage: string, command: CtExecCommand | null };
}

const HomeworkHelperActive = ({
                                  mode,
                                  theme,
                                  activeResponse,
                                  messages,
                                  toggleEditor,
                                  setEditorCode,
                                  sendMessage
                              }: ActiveProps) => {
    const [text, setText] = React.useState("");

    const [scrolledToBottom, setScrolledToBottom] = useState("")

    const [expandedCodeBlock, setExpandedCodeBlock] = useState<string[]>([]);

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const targetScrollRef = React.useRef<HTMLDivElement>(null);

    const renderInlineCodeEditor = (id: string, code: string, codeLanguage: string) => {
        return (
            <Box sx={{width: "100%"}}>
                <Button
                    variant={"text"}
                    sx={{
                        m: 1,
                        fontSize: "0.7rem"
                    }}
                    onClick={() => {
                        const idx = expandedCodeBlock.findIndex((x) => x === id);
                        if (idx >= 0) {
                            setExpandedCodeBlock((prev) => prev.filter((i) => i !== id));
                        } else {
                            setExpandedCodeBlock((prev) => prev.concat(id));
                        }
                    }}
                >
                    Code
                    {
                        expandedCodeBlock.findIndex((x) => x === id) > -1 ?
                            (<KeyboardArrowUpIcon fontSize={"small"}/>) :
                            (<KeyboardArrowDownIcon fontSize={"small"}/>)
                    }
                </Button>
                {expandedCodeBlock.findIndex((x) => x === id) > -1 && (
                    <Box sx={{marginBottom: "60px", width: "100%"}}>
                        <MarkdownRenderer
                            markdown={
                                code ?
                                    "```" + mapToLangMarkdown(codeLanguage) + "\n" +
                                    code.split("\n").slice(
                                        0,
                                        Math.min(25, code.split("\n").length)
                                    ).join("\n") +
                                    (code.split("\n").length > 25 ? `\n${code.split("\n").length - 25} more lines ...` : "") +
                                    "\n```" : ""
                            }
                            style={{
                                fontSize: "0.9rem",
                                width: "100%",
                            }}
                        />
                        <Button
                            variant={"outlined"}
                            sx={{
                                m: 1,
                                fontSize: "0.7rem",
                                float: "right"
                            }}
                            onClick={() => {
                                setEditorCode(code, codeLanguage)
                                toggleEditor(true)
                            }}
                        >
                            Open In Editor
                            <CodeIcon sx={{marginLeft: "8px"}} fontSize={"small"}/>
                        </Button>
                    </Box>
                )}
            </Box>
        )
    }

    const renderCodeExecResult = (_id: string, result: string) => {
        return (
            <Box sx={{width: "calc(100% - 10px)"}}>
                <Box
                    sx={{
                        // backgroundColor: alpha(grey[800], mode === "light" ? 0.1 : 0.25),
                        // borderRadius: "20px",
                        // p: 2,
                        maxWidth: "calc(100% - 10px)",
                        height: "fit-content"
                    }}
                >
                    <Accordion
                        sx={{
                            backgroundColor: "transparent",
                            // border: "1px solid #31343a",
                            p: "8px",
                            borderRadius: "20px !important",
                            width: "auto",
                            height: "auto",
                            display: "block",
                            maxWidth: "100%",
                            boxShadow: "none",
                            marginTop: "6px"
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id={`exec-result-header-${_id}`}
                            sx={{
                                padding: "0px",
                                backgroundColor: "transparent",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 300,
                                    fontSize: "0.9rem",
                                }}
                            >
                                Code Execution Result
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails
                            sx={{
                                padding: "0px",
                                backgroundColor: "transparent",
                            }}
                        >
                            <MarkdownRenderer
                                markdown={"```bash\n" + result + "\n```"}
                                style={{
                                    fontSize: "0.9rem",
                                    width: "calc(100% - 10px)",
                                }}
                            />
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Box>
        )
    }

    const renderNoResponseLoading = () => {
        return (
            <Box
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"space-between"}
                mb={2}
                p={2}
                sx={{
                    width: "calc(100% - 10px)",
                    gap: "0.7em",
                }}
            >
                <SheenPlaceholder height={"0.7rem"} width={"78%"}/>
                <SheenPlaceholder height={"0.7rem"} width={"92%"}/>
                <SheenPlaceholder height={"0.7rem"} width={"88%"}/>
                <SheenPlaceholder height={"0.7rem"} width={"95%"}/>
                <SheenPlaceholder height={"0.7rem"} width={"92%"}/>
                {/*<div style={{height: "calc(100vh - 450px)"}}/>*/}
            </Box>
        )
    }

    const renderUserMessage = (
        {idx, text, code, codeLanguage}:
            {
                idx: number,
                text: string,
                code?: string,
                codeLanguage?: string
            }
    ) => {
        return (
            <Box sx={{width: "calc(100% - 10px)"}}>
                <Box
                    sx={{
                        backgroundColor: alpha(grey[800], mode === "light" ? 0.1 : 0.25),
                        borderRadius: "20px",
                        p: 2,
                        maxWidth: "calc(100% - 10px)",
                        height: "fit-content"
                    }}
                >
                    <MarkdownRenderer
                        markdown={text}
                        style={{
                            fontSize: "0.9rem",
                            width: "calc(100% - 10px)",
                        }}
                    />
                    {code && renderInlineCodeEditor(`q:${idx}`, code, codeLanguage !== undefined ? codeLanguage : "")}
                </Box>
            </Box>
        )
    }

    const renderAssistantMessage = (
        {idx, text, loading, code, codeLanguage, command, commandResult, codeExecResult}:
            {
                idx: number,
                text: string,
                loading: boolean,
                code?: string,
                codeLanguage?: string,
                command?: CtExecCommand,
                commandResult?: any,
                codeExecResult: string
            }
    ) => {
        return (
            <Box sx={{width: "calc(100% - 10px)"}}>
                {loading && text.length === 0 && renderNoResponseLoading()}
                {text.length > 0 && (
                    <Box
                        sx={{
                            borderRadius: "20px",
                            p: 2,
                            maxWidth: "calc(100% - 10px)",
                            height: "fit-content"
                        }}
                    >
                        <MarkdownRenderer
                            markdown={text}
                            style={{
                                fontSize: "0.9rem",
                                width: "calc(100% - 10px)",
                            }}
                        />
                    </Box>
                )}
                {!loading && code && renderInlineCodeEditor(`q:${idx}`, code, codeLanguage !== undefined ? codeLanguage : "")}
                {!loading && codeExecResult.length > 0 && renderCodeExecResult(`${idx}`, codeExecResult)}
                {loading && (
                    <Box sx={{float: "right", right: "20px"}}>
                        <CtCircularProgress size={18}/>
                    </Box>
                )}
            </Box>
        )
    }

    const renderMessagePairs = () => {
        let processedMessages: {
            user: boolean;
            params: {
                idx: number,
                text: string,
                loading: boolean,
                code?: string,
                codeLanguage?: string,
                command?: CtExecCommand,
                commandResult?: any,
                codeExecResult: string
            };
        }[] = [];

        for (let i = 0; i < messages.length; ++i) {
            let m = messages[i];
            if (m.message_type !== CtChatMessageType.CommandResponse && m.message_type !== CtChatMessageType.CodeExecutionResult) {
                processedMessages.push({
                    user: m.message_type === CtChatMessageType.User,
                    params: {
                        idx: i,
                        text: m.content,
                        loading: false,
                        code: m.code !== "" ? m.code : undefined,
                        codeLanguage: m.code_language !== "" ? m.code_language : undefined,
                        command: m.command.command !== "" ? m.command : undefined,
                        commandResult: undefined,
                        codeExecResult: ""
                    }
                })
                continue
            }

            if (i > 0 && m.message_type === CtChatMessageType.CommandResponse) {
                processedMessages[processedMessages.length-1].params.commandResult = m.content
            }

            if (i > 0 && m.message_type === CtChatMessageType.CodeExecutionResult) {
                processedMessages[processedMessages.length-1].params.codeExecResult = m.content
            }
        }

        return processedMessages.map(x => x.user ? renderUserMessage(x.params) : renderAssistantMessage(x.params))
    }

    const renderActiveMessage = () => {
        if (!activeResponse) {
            return null
        }

        return (
            renderAssistantMessage({
                idx: messages.length,
                text: activeResponse ? activeResponse.text : "",
                command: activeResponse && activeResponse.command !== null ? activeResponse.command : undefined,
                loading: true,
                code: activeResponse && activeResponse.code.length > 0 ? activeResponse.code : undefined,
                codeLanguage: activeResponse && activeResponse.codeLanguage.length > 0 ? activeResponse.codeLanguage : undefined,
                codeExecResult: ""
            })
        )
    }

    return (
        <ActiveStyledContainer maxWidth={"md"} sx={{position: "relative", height: "calc(100vh - 82px)"}}>
            <Box
                display={"flex"}
                flexDirection={"column"}
                sx={{
                    marginBottom: "100px",
                    overflowY: "auto",
                    pb: 1,
                    width: "100%"
                }}
                ref={scrollContainerRef}
            >
                {renderMessagePairs()}
                {renderActiveMessage()}
                <div ref={targetScrollRef}/>
            </Box>
            <StyledTextField
                fullWidth
                multiline
                maxRows={16}
                placeholder="Ask a follow up question..."
                disabled={activeResponse !== undefined}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(text);
                        setText("")
                    }
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        setText(text + '    ');
                    }
                }}
                value={text}
                sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "calc(100% - 50px)"
                }}
                InputProps={{
                    sx: {
                        padding: theme.spacing(3),
                        fontSize: text.length > 0 ? "medium" : undefined,
                        borderRadius: "20px",
                    },
                    endAdornment: (
                        <InputAdornment position="end">
                            <Tooltip title={"Add Code"}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    sx={{borderRadius: "50%", minWidth: "0px", p: 1}}
                                    onClick={(e) => {
                                        toggleEditor()
                                    }}
                                >
                                    <CodeIcon/>
                                </Button>
                            </Tooltip>
                        </InputAdornment>
                    ),
                    'aria-label': 'ask',
                }}
            />
        </ActiveStyledContainer>
    )
}


function HomeworkHelper() {
    let userPref = localStorage.getItem('theme');
    const [mode, _] = useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const authState = useAppSelector(selectAuthState);

    const sendExecOutputToCT = React.useRef<boolean>(false)
    const [ctRequestingExec, setCTRequestingExec] = useState<boolean>(false)
    const [connectButtonLoading, setConnectButtonLoading] = useState<boolean>(false)
    const [commandId, setCommandId] = useState("");
    const [executingCode, setExecutingCode] = useState<boolean>(false)
    const [workspaceState, setWorkspaceState] = useState<null | number>(null);
    const [workspaceId, setWorkspaceId] = useState<string>('')
    const [speedDialOpen, setSpeedDialOpen] = React.useState(false);
    const [newChat, setNewChat] = React.useState(false);
    const [selectedChat, setSelectedChat] = React.useState<string | null>(null);
    const [chatSelectionOpen, setChatSelectionOpen] = React.useState(false);
    const [editorOpen, setEditorOpen] = React.useState(false);
    const [activeResponse, setActiveResponse] = React.useState<{
        text: string,
        code: string,
        codeLanguage: string,
        command: CtExecCommand | null
    } | null>(null);
    const [messages, setMessages] = React.useState<CtGetHHChatMessagesResponseMessage[]>([]);
    const [chats, setChats] = React.useState<CtGetHHChatsResponseChat[]>([]);

    const [code, setCode] = React.useState("");
    const [codeLanguage, setCodeLanguage] = React.useState("")
    const [langSelectActive, setLangSelectActive] = React.useState(false)

    const [terminalVisible, setTerminalVisible] = useState(false);
    const [output, setOutput] = useState<OutputState | null>(null);

    const navigate = useNavigate();

    let ctWs = useGlobalCtWebSocket();

    let globalWs = useGlobalWebSocket();

    let {id} = useParams()

    useEffect(() => {
        if (!id || id === selectedChat)
            return
        setMessages([])
        setCode("")
        setCodeLanguage("")
        setEditorOpen(false)
        setActiveResponse(null)
        setTerminalVisible(false)
        setOutput(null)
        setCTRequestingExec(false)
        setConnectButtonLoading(false)
        setExecutingCode(false)
        setCommandId("")
        setWorkspaceId("")
        setWorkspaceState(null)
        sendExecOutputToCT.current = false
        setSelectedChat(id)
    }, [id])

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
        if (selectedChat === null || selectedChat === "-1" || newChat) {
            return
        }

        ctWs.sendWebsocketMessage({
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: CtMessageType.WebSocketMessageTypeGetHHChatMessagesRequest,
                origin: CtMessageOrigin.WebSocketMessageOriginClient,
                created_at: Date.now(),
                payload: {
                    chat_id: selectedChat,
                }
            } satisfies CtMessage<CtGetHHChatMessagesRequest>,
            (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtGetHHChatMessagesResponse>): boolean => {
                if (msg.type !== CtMessageType.WebSocketMessageTypeGetHHChatMessagesResponse) {
                    console.log("failed getting chat messages", msg)
                    return true;
                }

                let res = msg.payload as CtGetHHChatMessagesResponse
                setMessages(res.messages)

                for (let i = res.messages.length; --i >= 0;) {
                    if (res.messages[i].code !== "") {
                        setCode(res.messages[i].code)
                        setCodeLanguage(res.messages[i].code_language)
                        setEditorOpen(true)
                        break
                    }
                }

                return true;
            })
    }, [selectedChat]);

    useEffect(() => {
        if (!authState.authenticated) {
            setChats([])
            return
        }

        ctWs.sendWebsocketMessage({
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: CtMessageType.WebSocketMessageTypeGetHHChatsRequest,
                origin: CtMessageOrigin.WebSocketMessageOriginClient,
                created_at: Date.now(),
                payload: {
                    partition: "default",
                    offset: 0,
                    limit: 100
                }
            } satisfies CtMessage<CtGetHHChatsRequest>,
            (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtGetHHChatsResponse>): boolean => {
                if (msg.type !== CtMessageType.WebSocketMessageTypeGetHHChatsResponse) {
                    console.log("failed getting chats", msg)
                    return true;
                }

                let res = msg.payload as CtGetHHChatsResponse
                setChats(res.chats)
                return true;
            })
    }, [authState.authenticated]);

    const sendUserMessage = async (chatId: string, userMessage: string, addMessage: boolean = true, codeExec: boolean = false) => {
        if (addMessage) {
            setMessages(prev => prev.concat({
                _id: "",
                chat_id: "",
                assistant_id: "",
                assistant_name: "",
                user_id: "",
                message_type: codeExec ? CtChatMessageType.CodeExecutionResult : CtChatMessageType.User,
                content: userMessage,
                code: codeExec ? "" : code,
                code_language: codeExec ? "" : codeLanguage,
                created_at: new Date(),
                message_number: 0,
                command: {command: "", lang: ""},
                premium_llm: false,
                free_credit_use: false
            }));
        }

        ctWs.sendWebsocketMessage({
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: CtMessageType.WebSocketMessageTypeUserHHChatMessage,
                origin: CtMessageOrigin.WebSocketMessageOriginClient,
                created_at: Date.now(),
                payload: {
                    chat_id: chatId,
                    user_message: userMessage,
                    code: code,
                    code_language: codeLanguage,
                    code_exec_result: codeExec
                }
            } satisfies CtMessage<CtHhUserMessage>,
            (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtHHAssistantMessage>): boolean => {
                if (msg.type !== CtMessageType.WebSocketMessageTypeAssistantHHChatMessage) {
                    console.log("failed to send message", msg)
                    return true;
                }

                let res = msg.payload as CtHHAssistantMessage

                if (res.complete_code !== "") {
                    setCode(res.complete_code)
                    setCodeLanguage(res.code_language)
                    setEditorOpen(true)

                    if (res.done) {
                        setCTRequestingExec(true)
                    }
                }

                if (res.done) {
                    setActiveResponse(null)
                    setMessages(prev => prev.concat({
                        _id: res.assistant_message_id,
                        chat_id: chatId,
                        assistant_id: "",
                        assistant_name: "",
                        user_id: "",
                        message_type: res.message_type,
                        content: res.complete_message,
                        code: res.complete_code,
                        code_language: res.code_language,
                        created_at: new Date(),
                        message_number: prev.length,
                        command: res.command,
                        premium_llm: res.premium_llm,
                        free_credit_use: res.free_credit_use
                    }))
                    setNewChat(false)
                } else {
                    setActiveResponse({
                        text: res.complete_message,
                        code: res.complete_code,
                        codeLanguage: res.code_language,
                        command: res.command,
                    })
                }
                return res.done;
            })
    }

    const startNewChat = async (userMessage: string) => {
        setNewChat(true)
        setSelectedChat("-1")
        setMessages([{
            _id: "",
            chat_id: "",
            assistant_id: "",
            assistant_name: "",
            user_id: "",
            message_type: CtChatMessageType.User,
            content: userMessage,
            code: code,
            code_language: codeLanguage,
            created_at: new Date(),
            message_number: 0,
            command: {command: "", lang: ""},
            premium_llm: false,
            free_credit_use: false
        }]);
        setActiveResponse({text: "", code: "", codeLanguage: "", command: null});

        // create a new promise that will return the chat id or null to us
        let resolver: (value: string | null) => void;
        const newChatPromise: Promise<string | null> = new Promise((resolve) => {
            resolver = resolve;
        });

        ctWs.sendWebsocketMessage({
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: CtMessageType.WebSocketMessageTypeNewHHChatRequest,
                origin: CtMessageOrigin.WebSocketMessageOriginClient,
                created_at: Date.now(),
                payload: {
                    partition: "default"
                }
            } satisfies CtMessage<CtNewHhChatRequest>,
            (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtNewHhChatResponse>): boolean => {
                if (msg.type !== CtMessageType.WebSocketMessageTypeNewHHChatResponse) {
                    console.log("failed to create new chat", msg)
                    resolver(null);
                    return true;
                }

                let res = msg.payload as CtNewHhChatResponse
                resolver(res.chat_id)
                return true;
            })

        // wait for the websocket to return the chat ID
        const chatId = await newChatPromise;
        if (chatId === null) {
            return
        }

        setSelectedChat(chatId);
        navigate(`/homework/${chatId}`)
        sendUserMessage(chatId, userMessage, false)
    }

    const renderBody = () => {
        if (selectedChat) {
            return (
                <HomeworkHelperActive
                    mode={mode}
                    theme={theme}
                    messages={messages}
                    activeResponse={activeResponse !== null ? activeResponse : undefined}
                    toggleEditor={(state) => setEditorOpen(state !== undefined ? state : !editorOpen)}
                    setEditorCode={(c, l) => {
                        setCode(c)
                        if (l !== "" && l !== undefined) {
                            setCodeLanguage(l)
                        }
                    }}
                    sendMessage={(content: string) => {
                        if (selectedChat === null || selectedChat === "-1" || content === "") {
                            return
                        }
                        sendUserMessage(selectedChat, content)
                    }}
                />
            )
        }
        return (
            <HomeworkHelperInit
                theme={theme}
                toggleEditor={() => setEditorOpen(!editorOpen)}
                submit={(content: string) => {
                    startNewChat(content)
                }}
            />
        )
    }

    const createWorkspace = async (chatId: string): Promise<boolean> => {
        try {
            const response = await call(
                "/api/homework/createWorkspace",
                "POST",
                null,
                null,
                null,
                // @ts-ignore
                {hh_id: chatId},
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

    const cancelCodeExec = (commandId: string) => {
        const message = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: WsMessageType.CancelExecRequest,
            payload: {
                code_source_id: selectedChat,
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
                code_source_id: selectedChat,
                payload: {
                    command_id: commandId,
                    input: input + "\n"
                }
            }
        };

        globalWs.sendWebsocketMessage(message, null);
    }

    const handleCtExecResult = React.useCallback((result: string) => {
        console.log("handleCtExecResult", sendExecOutputToCT, selectedChat);
        if (sendExecOutputToCT.current) {
            console.log("setSendExecOutputToCT");
            sendExecOutputToCT.current = false
            if (selectedChat !== null) {
                console.log("sending output to backend");
                sendUserMessage(
                    selectedChat,
                    result,
                    true,
                    true
                )
            }
        }
    }, [selectedChat]);

    const sendExecRequest = (retryCount: number = 0) => {
        const message = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: WsMessageType.AgentExecRequest,
            payload: {
                code_source_id: selectedChat,
                payload: {
                    lang: mapToLangId(codeLanguage),
                    code: code
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

                                setConnectButtonLoading(false)
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

                if (done) {
                    setCTRequestingExec(false)
                    handleCtExecResult(mergedRows.map(row => row.content).join("\n"))
                }

                // we only return true here if we are done since true removes this callback
                return done
            }
        );
    };

    const executeCode = async () => {
        if (selectedChat === null) {
            return
        }

        for (let i = 0; i < 5; i++) {
            let created = await createWorkspace(selectedChat);
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

        sendExecRequest();
    };

    const renderCtExecRequestPopup = () => {
        if (!ctRequestingExec) {
            return null
        }

        return (
            <CodeTeacherPopupPaper
                sx={{
                    position: "absolute",
                    zIndex: 4,
                    bottom: "20px",
                    left: "20px",
                    p: 2
                }}
            >
                <Box
                    display={'inline-flex'}
                >
                    <CodeTeacherChatIcon
                        style={{
                            marginRight: '10px',
                            width: '35px',
                            height: '35px',
                        }}
                    />
                    <Typography variant={"h6"} sx={{paddingTop: "8px"}}>
                        Code Teacher
                    </Typography>
                </Box>
                {executingCode ? (
                    <>
                        <Box
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            sx={{width: "100%"}}
                        >
                            <Typography variant={"body2"}>
                                CT is running the code
                            </Typography>
                            <CtCircularProgress size={18}/>
                        </Box>
                    </>
                ): (
                    <>
                        <Typography variant={"body2"}>
                            CT would like to run this code.
                        </Typography>
                        <Box
                            display={'inline-flex'}
                            justifyContent={'space-between'}
                            sx={{width: "100%", paddingTop: "8px"}}
                        >
                            <LoadingButton
                                color={"success"}
                                variant={"outlined"}
                                loading={executingCode}
                                onClick={() => {
                                    sendExecOutputToCT.current = true
                                    executeCode()
                                }}
                            >
                                Permit
                            </LoadingButton>
                            <Button
                                color={"error"}
                                variant={"outlined"}
                                onClick={() => setCTRequestingExec(false)}
                            >
                                Deny
                            </Button>
                        </Box>
                    </>
                )}
            </CodeTeacherPopupPaper>
        )
    }

    const renderEditor = () => {
        if (!editorOpen) {
            return null
        }

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
                        if (selectedChat) {
                            setConnectButtonLoading(true)
                            for (let i = 0; i < 5; i++) {
                                let created = await createWorkspace(selectedChat);
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
            } else {
                stateTooltipTitle = "Connecting To DevSpace"
                stateIcon = (<CircularProgress size={24} sx={{color: alpha(theme.palette.text.primary, 0.6)}}/>)
            }
        }

        return (
            <Slide direction="left" in={editorOpen} mountOnEnter unmountOnExit>
                <Box
                    sx={{
                        paddingLeft: "20px",
                        paddingRight: "20px",
                    }}
                >
                    <Box
                        display={"inline-flex"}
                        justifyContent={"space-between"}
                        sx={{
                            width: "100%",
                            marginBottom: "8px"
                        }}
                    >
                        <FormControl
                            sx={{
                                minWidth: "100px", // Adjust based on your UI needs
                                m: 0, // Minimize margin
                                p: 0, // Minimize padding
                            }}
                        >
                            <InputLabel
                                id="language-selector-label"
                                sx={{
                                    fontSize: "0.7rem !important",
                                    m: 0, // Minimize margin
                                    p: 0, // Minimize padding
                                    top: langSelectActive || codeLanguage !== "" ? "0px" : "-11px",
                                }}
                            >
                                Language
                            </InputLabel>
                            <Select
                                labelId="language-selector-label"
                                id="language-selector"
                                value={mapToLang(codeLanguage)}
                                label="Language"
                                onFocus={() => setLangSelectActive(true)}
                                onBlur={() => setLangSelectActive(false)}
                                onChange={(e) => {
                                    setCodeLanguage(e.target.value)
                                }}
                                size="small" // Make Select more compact
                                sx={{
                                    fontSize: "0.7rem !important",
                                    m: 0, // Minimize margin
                                    p: 0, // Minimize padding
                                    '& .MuiSelect-select': {
                                        py: '5px', // Adjust padding vertically as needed
                                    },
                                    // '& .MuiOutlinedInput-notchedOutline': {
                                    //     border: 'none', // Remove border if desired for compactness
                                    // },
                                }}
                            >
                                {languages.map((language) => (
                                    <MenuItem
                                        key={language.name}
                                        value={language.name.toLowerCase()}
                                        sx={{
                                            fontSize: "0.7rem !important",
                                            m: 0, // Minimize margin
                                            p: 0, // Minimize padding,
                                            paddingLeft: "5px"
                                        }}
                                    >
                                        {language.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box
                            display={"inline-flex"}
                        >
                            <Tooltip title={stateTooltipTitle}>
                                <Box
                                    sx={{
                                        height: "30px",
                                        width: "30px",
                                        marginRight: "20px",
                                        padding: "3px"
                                    }}
                                >
                                    {stateIcon}
                                </Box>
                            </Tooltip>
                            <Tooltip title="Run Code">
                                <LoadingButton
                                    loading={executingCode}
                                    variant="outlined"
                                    color={"success"}
                                    sx={{
                                        // position: 'absolute',
                                        // right: '8px',
                                        // top: '8px',
                                        zIndex: 3,
                                        m: 0,
                                        p: 0,
                                        fontSize: "0.7rem !important",
                                        // borderRadius: "50%",
                                        // minWidth: 0,
                                    }}
                                    onClick={() => {
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
                    </Box>
                    <Box
                        sx={{position: "relative"}}
                    >
                        <Editor
                            // ref={editorRef}
                            editorStyles={{
                                fontSize: "0.7rem",
                                borderRadius: "10px",
                                outline: "none !important"
                            }}
                            parentStyles={{
                                height: "100%",
                                borderRadius: "10px",
                            }}
                            language={mapToLangMarkdown(codeLanguage)}
                            code={code}
                            theme={mode}
                            readonly={false}
                            onChange={(val, view) => setCode(val)}
                            wrapperStyles={{
                                width: '100%',
                                height: terminalVisible ? 'calc(100vh - 364px)' : 'calc(100vh - 138px)',
                                borderRadius: "10px",
                                border: `1px solid ${theme.palette.primary.light}`
                            }}
                        />
                        {renderCtExecRequestPopup()}
                    </Box>
                    {terminalVisible && output && (
                        <ByteTerminal
                            output={output}
                            onClose={() => setTerminalVisible(false)}
                            onStop={() => cancelCodeExec(commandId)}
                            onInputSubmit={(input: string) => stdInExecRequest(commandId, input)}
                            isRunning={executingCode}
                        />
                    )}
                </Box>
            </Slide>
        )
    }

    const renderActions = () => {
        return (
            <>
                <SpeedDial
                    ariaLabel="SpeedDial"
                    sx={{position: 'fixed', bottom: 24, right: 16}}
                    icon={<MenuIcon/>}
                    open={speedDialOpen}
                    onOpen={() => setSpeedDialOpen(true)}
                    onClose={() => setSpeedDialOpen(false)}
                >
                    <SpeedDialAction
                        key={"new"}
                        icon={<Add/>}
                        tooltipTitle={"New Homework"}
                        onClick={clearChatState}
                    />
                    <SpeedDialAction
                        key={"history"}
                        icon={<LibraryBooks/>}
                        tooltipTitle={"Homework History"}
                        onClick={() => setChatSelectionOpen(prev => !prev)}
                    />
                </SpeedDial>
                <Dialog
                    open={chatSelectionOpen}
                    onClose={() => setChatSelectionOpen(false)}
                    maxWidth={"lg"}
                >
                    <DialogTitle>
                        Homework History
                    </DialogTitle>
                    <DialogContent
                        sx={{
                            maxHeight: "70vh",
                            minWidth: "400px"
                        }}
                    >
                        <List>
                            {chats.map((item, index) => (
                                <ListItemButton
                                    key={item._id}
                                    sx={{
                                        borderRadius: "10px"
                                    }}
                                    onClick={() => {
                                        setSelectedChat(item._id)
                                        navigate(`/homework/${item._id}`)
                                        setChatSelectionOpen(false)
                                    }}
                                >
                                    <Box
                                        display={"flex"}
                                        flexDirection={"column"}
                                    >
                                        {item.name}
                                        <Typography variant="caption" color="textPrimary" noWrap>
                                            {
                                                Date.now() - parseISO(item.last_message_at).getTime() > 86400000 ?
                                                    format(parseISO(item.last_message_at), 'MMMM d, yyyy') :
                                                    formatDistanceToNow(parseISO(item.last_message_at), {addSuffix: true})
                                            }
                                        </Typography>
                                    </Box>
                                </ListItemButton>
                            ))}
                        </List>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    const clearChatState = () => {
        setMessages([])
        setCode("")
        setCodeLanguage("")
        setEditorOpen(false)
        setActiveResponse(null)
        setSelectedChat(null)
        navigate("/homework")
    }

    let bodySize = 12;
    if (editorOpen) {
        bodySize -= 6
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <HelmetProvider>
                    <Helmet>
                        <title>GIGO Homework Helper</title>
                        <meta property="og:title" content={"GIGO Homework Helper"} data-rh="true"/>
                    </Helmet>
                </HelmetProvider>
                <Box
                    sx={{maxHeight: "calc(100vh - 72px)", overflow: "hidden", width: "100% !important"}}
                >
                    <Grid container sx={{width: "100% !important"}}>
                        <Grid item xs={bodySize}>
                            {renderBody()}
                        </Grid>
                        <Grid item xs={editorOpen ? 6 : 0} sx={{height: "calc(100vh - 72px)", mt: 2, mb: 2}}>
                            {renderEditor()}
                        </Grid>
                    </Grid>
                </Box>
                {renderActions()}
            </CssBaseline>
        </ThemeProvider>
    )
}

export default HomeworkHelper;
