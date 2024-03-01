import {
    alpha,
    Box,
    Button,
    Container,
    createTheme,
    CssBaseline,
    Grid,
    PaletteMode,
    Paper,
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
    CtHHAssistantMessage,
    CtHhUserMessage,
    CtMessage,
    CtMessageOrigin,
    CtMessageType,
    CtNewHhChatRequest,
    CtNewHhChatResponse,
    CtValidationErrorPayload
} from "../models/ct_websocket";

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
    setEditorCode: (code: string) => void;
    sendMessage: (content: string) => void;
    activeResponse?: { text: string, code: string, command: CtExecCommand | null };
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

    const renderInlineCodeEditor = (id: string, code: string) => {
        return (
            <Box>
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
                    <>
                        <MarkdownRenderer
                            markdown={
                                code ?
                                    "```\n" +
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
                                setEditorCode(code)
                                toggleEditor(true)
                            }}
                        >
                            Open In Editor
                            <CodeIcon sx={{marginLeft: "8px"}} fontSize={"small"}/>
                        </Button>
                    </>
                )}
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
        {idx, text, code}:
            {
                idx: number,
                text: string,
                code?: string,
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
                    {code && renderInlineCodeEditor(`q:${idx}`, code)}
                </Box>
            </Box>
        )
    }

    const renderAssistantMessage = (
        {idx, text, loading, code, command, commandResult}:
            {
                idx: number,
                text: string,
                loading: boolean,
                code?: string,
                command?: CtExecCommand,
                commandResult?: any
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
                {!loading && code && renderInlineCodeEditor(`q:${idx}`, code)}
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
                command?: CtExecCommand,
                commandResult?: any
            };
        }[] = [];

        for (let i = 0; i < messages.length; ++i) {
            let m = messages[i];
            if (m.message_type !== CtChatMessageType.CommandResponse) {
                processedMessages.push({
                    user: m.message_type === CtChatMessageType.User,
                    params: {
                        idx: i,
                        text: m.content,
                        loading: false,
                        code: m.code !== "" ? m.code : undefined,
                        command: m.command.command !== "" ? m.command : undefined,
                        commandResult: undefined,
                    }
                })
                continue
            }

            if (i > 0) {
                processedMessages[-1].params.commandResult = m.content
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
            })
        )
    }

    return (
        <ActiveStyledContainer maxWidth={"md"} sx={{position: "relative", height: "calc(100vh - 100px)"}}>
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

    const [selectedChat, setSelectedChat] = React.useState<string | null>(null);
    const [editorOpen, setEditorOpen] = React.useState(false);
    const [activeResponse, setActiveResponse] = React.useState<{
        text: string,
        code: string,
        command: CtExecCommand | null
    } | null>(null);
    const [messages, setMessages] = React.useState<CtGetHHChatMessagesResponseMessage[]>([]);

    const [code, setCode] = React.useState("");

    let ctWs = useGlobalCtWebSocket();

    // useEffect(() => {
    //     if (selectedChat === null || selectedChat === "-1") {
    //         setMessages([])
    //         return
    //     }
    //
    //     ctWs.sendWebsocketMessage({
    //             sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    //             type: CtMessageType.WebSocketMessageTypeGetHHChatMessagesRequest,
    //             origin: CtMessageOrigin.WebSocketMessageOriginClient,
    //             created_at: Date.now(),
    //             payload: {
    //                 chat_id: selectedChat,
    //             }
    //         } satisfies CtMessage<CtGetHHChatMessagesRequest>,
    //         (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtGetHHChatMessagesResponse>): boolean => {
    //             if (msg.type !== CtMessageType.WebSocketMessageTypeGetHHChatMessagesResponse) {
    //                 console.log("failed getting chat messages", msg)
    //                 return true;
    //             }
    //
    //             let res = msg.payload as CtGetHHChatMessagesResponse
    //             setMessages(res.messages)
    //             return true;
    //         })
    // }, [selectedChat]);

    const sendUserMessage = async (chatId: string, userMessage: string, addMessage: boolean = true) => {
        if (addMessage) {
            setMessages(prev => prev.concat({
                _id: "",
                chat_id: "",
                assistant_id: "",
                assistant_name: "",
                user_id: "",
                message_type: CtChatMessageType.User,
                content: userMessage,
                code: code,
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
                    setEditorOpen(true)
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
                        created_at: new Date(),
                        message_number: prev.length,
                        command: res.command,
                        premium_llm: res.premium_llm,
                        free_credit_use: res.free_credit_use
                    }))
                } else {
                    setActiveResponse({
                        text: res.complete_message,
                        code: res.complete_code,
                        command: res.command,
                    })
                }
                return res.done;
            })
    }

    const startNewChat = async (userMessage: string) => {
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
            created_at: new Date(),
            message_number: 0,
            command: {command: "", lang: ""},
            premium_llm: false,
            free_credit_use: false
        }]);
        setActiveResponse({text: "", code: "", command: null});

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
                    setEditorCode={(c) => setCode(c)}
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

    const renderEditor = () => {
        if (!editorOpen) {
            return null
        }

        console.log("rendering editor")

        return (
            <Slide direction="left" in={editorOpen} mountOnEnter unmountOnExit>
                <Box>
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
                        language={"python"}
                        code={code}
                        theme={mode}
                        readonly={false}
                        onChange={(val, view) => setCode(val)}
                        wrapperStyles={{
                            width: '100%',
                            height: 'calc(100vh - 100px)',
                            borderRadius: "10px",
                            border: `1px solid ${theme.palette.primary.light}`
                        }}
                    />
                </Box>
            </Slide>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Container sx={{maxHeight: "calc(100vh - 72px)", overflow: "hidden", maxWidth: "100% !important"}}>
                    <Grid container>
                        <Grid item xs={editorOpen ? 7 : 12}>
                            {renderBody()}
                        </Grid>
                        <Grid item xs={5} sx={{height: "calc(100vh - 72px)", mt: 2, mb: 2}}>
                            {renderEditor()}
                        </Grid>
                    </Grid>
                </Container>
            </CssBaseline>
        </ThemeProvider>
    )
}

export default HomeworkHelper;
