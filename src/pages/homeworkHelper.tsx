import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    alpha,
    Box,
    Button,
    ButtonBase,
    Card,
    CircularProgress,
    Container,
    createTheme,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    List,
    ListItemButton,
    PaletteMode,
    Paper,
    SpeedDial,
    SpeedDialAction,
    Tab,
    Tabs,
    TextField,
    Theme,
    ThemeProvider,
    Tooltip,
    Typography
} from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import { getAllTokens } from "../theme";
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import CodeIcon from '@mui/icons-material/Code';
import Editor from "../components/IDE/Editor";
import Slide from "@mui/material/Slide";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import { grey } from "@mui/material/colors";
import SheenPlaceholder from "../components/Loading/SheenPlaceholder";
import { CtCircularProgress } from "../components/CodeTeacher/CtCircularProgress";
import { useGlobalCtWebSocket } from "../services/ct_websocket";
import {
    CtChatMessageType,
    CtCodeFile,
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
import { Add, LibraryBooks, PlayArrow } from "@material-ui/icons";
import { useAppSelector } from "../app/hooks";
import { selectAuthState } from "../reducers/auth/auth";
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ByteTerminal from "../components/Terminal";
import { ExecResponsePayload, OutputRow } from "../models/bytes";
import { WsGenericErrorPayload, WsMessage, WsMessageType } from "../models/websocket";
import { useGlobalWebSocket } from "../services/websocket";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import { Workspace } from "../models/workspace";
import CodeSource from "../models/codeSource";
import { LoadingButton } from "@mui/lab";
import { sleep } from "../services/utils";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import LinkIcon from "@mui/icons-material/Link";
import CodeTeacherChatIcon from "../components/CodeTeacher/CodeTeacherChatIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@material-ui/icons/Close";
import Carousel from "../components/Carousel2";
import GoProDisplay from "../components/GoProDisplay";
import proGorillaCrown from "../img/pro-pop-up-icon-plain.svg";
import { selectAppWrapperChatOpen, selectAppWrapperSidebarOpen } from "../reducers/appWrapper/appWrapper";

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
    execSupported: boolean;
}

interface InitialStatusMessage {
    workspace: Workspace;
    code_source: CodeSource;
    workspace_url: string
}

const languages: LanguageOption[] = [
    { name: 'Go', extensions: ['go'], languageId: 6, execSupported: true },
    { name: 'Python', extensions: ['py', 'pytho', 'pyt'], languageId: 5, execSupported: true },
    { name: 'C++', extensions: ['cpp', 'cc', 'cxx', 'hpp', 'c++', 'h'], languageId: 8, execSupported: false },
    { name: 'HTML', extensions: ['html', 'htm'], languageId: 27, execSupported: false },
    { name: 'Java', extensions: ['java'], languageId: 2, execSupported: false },
    { name: 'JavaScript', extensions: ['js'], languageId: 3, execSupported: true },
    { name: 'JSON', extensions: ['json'], languageId: 1, execSupported: false },
    { name: 'Markdown', extensions: ['md'], languageId: 1, execSupported: false },
    { name: 'PHP', extensions: ['php'], languageId: 13, execSupported: false },
    { name: 'Rust', extensions: ['rs'], languageId: 14, execSupported: true },
    { name: 'SQL', extensions: ['sql'], languageId: 34, execSupported: false },
    { name: 'XML', extensions: ['xml'], languageId: 1, execSupported: false },
    { name: 'LESS', extensions: ['less'], languageId: 1, execSupported: false },
    { name: 'SASS', extensions: ['sass', 'scss'], languageId: 1, execSupported: false },
    { name: 'Clojure', extensions: ['clj'], languageId: 21, execSupported: false },
    { name: 'C#', extensions: ['cs'], languageId: 10, execSupported: true },
    { name: 'Shell', extensions: ['bash', 'sh'], languageId: 38, execSupported: true },
    { name: 'Toml', extensions: ['toml'], languageId: 14, execSupported: true }
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


const InitStyledContainer = styled(Container)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: 'calc(100vh - 72px)',
    transition: theme.transitions.create(['height', 'max-width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: "none",
    background: "transparent"
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
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

const EditorTabs = styled(Tabs)(({ theme }) => ({
    p: 0,
    m: 0,
    minHeight: 0,
}));

const EditorTab = styled(Tab)(({ theme }) => ({
    fontSize: '0.7rem !important',
    padding: "2px 6px",
    marginRight: "4px",
    textTransform: 'none',
    minHeight: 0,
    minWidth: 0,
    borderRadius: "8px",
    color: alpha(theme.palette.text.primary, 0.6),
    fontWeight: theme.typography.fontWeightMedium,

    '&:hover': {
        backgroundColor: alpha(grey[800], theme.palette.mode === "light" ? 0.1 : 0.25),
        opacity: 1,
    },
    '&.Mui-selected': {
        backgroundColor: alpha(grey[800], theme.palette.mode === "light" ? 0.1 : 0.25),
        color: alpha(theme.palette.text.primary, 0.8),
    },
    '&.Mui-focusVisible': {
        backgroundColor: '#d1eaff',
    },
}));

interface InitProps {
    id: string | undefined;
    theme: Theme;
    toggleEditor: () => void;
    submit: (content: string) => void;
}

const HomeworkHelperInit = ({ id, theme, toggleEditor, submit }: InitProps) => {
    const [active, setActive] = React.useState(false);
    const [text, setText] = React.useState("");
    const [goProPopup, setGoProPopup] = useState(false);

    const authState = useAppSelector(selectAuthState);
    const leftOpen = useAppSelector(selectAppWrapperSidebarOpen)
    const rightOpen = useAppSelector(selectAppWrapperChatOpen)

    useEffect(() => {
        let unAuthReq = localStorage.getItem('gigo:unauth:hh');
        if (id === undefined && unAuthReq !== null) {
            setText(unAuthReq)
            return
        }
    }, [id]);

    let plugPosition = 260;
    if (leftOpen) {
        plugPosition += 100
    }
    if (rightOpen) {
        plugPosition += 150
    }

    const renderGoProPlug = () => {
        if (text.split("\n").length > 3) {
            return (
                <Box sx={{
                    position: "relative",
                    width: "520px",
                    backgroundColor: theme.palette.background.default,
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.19)",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "row", // Stack items horizontally
                    alignItems: "flex-start", // Align items to the left
                    justifyContent: "space-between", // Even spacing
                    height: "auto",
                    border: `1px solid ${theme.palette.primary.main}`,
                    bottom: "80px",
                    left: `calc(50vw - ${plugPosition}px)`
                }} id={"pro-banner"}>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start", // Left align the title and subtitle
                        paddingTop: "12px"
                    }}>
                        <h2 style={{ margin: "0 0 4px 0", textAlign: "left", fontSize: "18px" }}>Want better help on your
                            homework?</h2>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "right", // Center the button
                        marginTop: "6px", // Add space above the button
                        marginBottom: "6px",
                        float: "right"
                    }}>
                        <Button style={{
                            padding: "8px 16px",
                            fontSize: "14px",
                        }} variant={"outlined"} onClick={() => setGoProPopup(true)}>Go Pro</Button>
                    </Box>
                </Box>
            )
        }

        return (
            <Box sx={{
                position: "relative",
                width: "520px",
                backgroundColor: theme.palette.background.default,
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.19)",
                padding: "10px",
                display: "flex",
                flexDirection: "column", // Stack items vertically
                alignItems: "flex-start", // Align items to the left
                justifyContent: "space-between", // Even spacing
                height: "auto",
                border: `1px solid ${theme.palette.primary.main}`,
                bottom: "165px",
                left: `calc(50vw - ${plugPosition}px)`
            }} id={"pro-banner"}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start", // Left align the title and subtitle
                    width: "calc(100% - 120px)", // Adjust width to prevent overlap with image, assuming image width + some padding
                }}>
                    <h2 style={{ margin: "0 0 4px 0", textAlign: "left", fontSize: "18px" }}>Want better help on your
                        homework?</h2>
                    <p style={{
                        textAlign: "left",
                        margin: "0",
                        fontSize: "12px",
                        maxWidth: "100%", // Prevents subtitle from overlapping with the image
                    }}>
                        Go Pro to get smarter answers to your homework, evade AI detection tools, and access
                        advanced
                        features.
                    </p>
                </Box>
                <Box sx={{
                    width: "100%", // Full width for centering the button
                    display: "flex",
                    justifyContent: "center", // Center the button
                    marginTop: "8px", // Add space above the button
                }}>
                    <Button style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                    }} variant={"outlined"} onClick={() => setGoProPopup(true)}>Go Pro</Button>
                </Box>
                <Box sx={{
                    position: "absolute",
                    top: "20px", // Adjust as needed
                    right: "20px", // Ensure it's aligned to the right
                    height: "80px", // Image size
                    width: "80px", // Image size
                }}>
                    <img src={proGorillaCrown} alt={"GIGO Pro"} style={{ width: "100%", height: "auto" }} />
                </Box>
            </Box>
        )
    }

    return (
        <>
            <InitStyledContainer maxWidth={active || text.length > 0 ? "md" : "sm"}>
                <Box display={"inline-flex"} sx={{ 
                    textAlign: 'center',
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "center"
                }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        GIGO Homework Helper
                    </Typography>
                    <Typography variant="caption" component="span" style={{ fontSize: '12px', marginLeft: '5px', textTransform: 'lowercase' }}>
                        [beta]
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
                            if (e.key === 'Enter' && !e.shiftKey && text.trim().length > 0) {
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
                                            sx={{ borderRadius: "50%", minWidth: "0px", p: 1 }}
                                            onClick={(e) => {
                                                toggleEditor()
                                            }}
                                        >
                                            <CodeIcon />
                                        </Button>
                                    </Tooltip>
                                </InputAdornment>
                            ),
                            'aria-label': 'ask',
                        }}
                    />
                </SearchContainer>
            </InitStyledContainer>
            {authState.authenticated && authState.role === 0 && renderGoProPlug()}
            <GoProDisplay open={goProPopup} onClose={() => setGoProPopup(false)} />
        </>
    );
};

const ActiveStyledContainer = styled(Container)(({ theme }) => ({
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
    setEditorCode: (code: CtCodeFile[], activeFile: string) => void;
    sendMessage: (content: string) => void;
    activeResponse?: { text: string, files: CtCodeFile[], command: CtExecCommand | null };
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
    const [selectedFile, setSelectedFile] = useState<string>("");

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const targetScrollRef = React.useRef<HTMLDivElement>(null);

    const [goProPopup, setGoProPopup] = useState(false);

    const authState = useAppSelector(selectAuthState);

    const renderInlineCodeEditor = (id: string, code: CtCodeFile[]) => {
        let selectedFileIdx = code.findIndex((f) => `${id}:${f.file_name}` === selectedFile)

        return (
            <Box sx={{ width: "100%" }}>
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
                            (<KeyboardArrowUpIcon fontSize={"small"} />) :
                            (<KeyboardArrowDownIcon fontSize={"small"} />)
                    }
                </Button>
                {expandedCodeBlock.findIndex((x) => x === id) > -1 && selectedFileIdx == -1 && (
                    <Box sx={{ marginBottom: "10px", width: "100%" }}>
                        <Carousel itemsShown={8} itemsToSlide={8} infiniteLoop={true}>
                            {code.map(
                                (c, index) => (
                                    <ButtonBase
                                        sx={{
                                            borderRadius: "8px",
                                        }}
                                        onClick={() => setSelectedFile(`${id}:${c.file_name}`)}
                                    >
                                        <Card
                                            key={`${id}:${c.file_name}`}
                                            sx={{
                                                width: "130px",
                                                p: 1,
                                                boxShadow: "none"
                                            }}
                                        >
                                            <Typography
                                                variant={"body2"}
                                                sx={{
                                                    textTransform: "none",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    width: "122px",
                                                    textAlign: "center"
                                                }}
                                            >
                                                {c.file_name}
                                            </Typography>
                                            <Typography variant={"caption"}>
                                                {c.code.split("\n").length} lines
                                            </Typography>
                                        </Card>
                                    </ButtonBase>
                                )
                            )}
                        </Carousel>
                    </Box>
                )}
                {expandedCodeBlock.findIndex((x) => x === id) > -1 && selectedFileIdx >= 0 && (
                    <Box sx={{ marginBottom: "60px", width: "100%" }}>
                        <MarkdownRenderer
                            markdown={
                                code ?
                                    "```" + mapFilePathToLang(code[selectedFileIdx].file_name) + "\n" +
                                    code[selectedFileIdx].code.split("\n").slice(
                                        0,
                                        Math.min(25, code[selectedFileIdx].code.split("\n").length)
                                    ).join("\n") +
                                    (code[selectedFileIdx].code.split("\n").length > 25 ? `\n${code[selectedFileIdx].code.split("\n").length - 25} more lines ...` : "") +
                                    "\n```" : ""
                            }
                            style={{
                                fontSize: "0.9rem",
                                width: "100%",
                            }}
                        />
                        <Box
                            display={"inline-flex"}
                            sx={{ width: "100%" }}
                        >
                            <Button
                                variant={"outlined"}
                                color={"error"}
                                sx={{
                                    m: 1,
                                    fontSize: "0.7rem",
                                    float: "right"
                                }}
                                onClick={() => {
                                    setSelectedFile("")
                                }}
                            >
                                Close Preview
                                <CloseIcon fontSize={"small"} />
                            </Button>
                            <Button
                                variant={"outlined"}
                                sx={{
                                    m: 1,
                                    fontSize: "0.7rem",
                                    float: "right"
                                }}
                                onClick={() => {
                                    setEditorCode(code, code[selectedFileIdx].file_name)
                                    toggleEditor(true)
                                }}
                            >
                                Open In Editor
                                <CodeIcon sx={{ marginLeft: "8px" }} fontSize={"small"} />
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        )
    }

    const renderCodeExecResult = (_id: string, result: string) => {
        return (
            <Box sx={{ width: "calc(100% - 10px)" }}>
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
                <SheenPlaceholder height={"0.7rem"} width={"78%"} />
                <SheenPlaceholder height={"0.7rem"} width={"92%"} />
                <SheenPlaceholder height={"0.7rem"} width={"88%"} />
                <SheenPlaceholder height={"0.7rem"} width={"95%"} />
                <SheenPlaceholder height={"0.7rem"} width={"92%"} />
                {/*<div style={{height: "calc(100vh - 450px)"}}/>*/}
            </Box>
        )
    }

    const renderUserMessage = (
        { idx, text, files }:
            {
                idx: number,
                text: string,
                files: CtCodeFile[]
            }
    ) => {
        return (
            <Box sx={{ width: "calc(100% - 10px)" }}>
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
                    {files.length > 0 && renderInlineCodeEditor(`q:${idx}`, files)}
                </Box>
            </Box>
        )
    }

    const renderAssistantMessage = (
        { idx, text, loading, files, command, commandResult, codeExecResult }:
            {
                idx: number,
                text: string,
                loading: boolean,
                files: CtCodeFile[],
                command?: CtExecCommand,
                commandResult?: any,
                codeExecResult: string
            }
    ) => {
        return (
            <Box sx={{ width: "calc(100% - 10px)" }}>
                {loading && text.trim().length === 0 && renderNoResponseLoading()}
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
                {!loading && files.length > 0 && renderInlineCodeEditor(`q:${idx}`, files)}
                {!loading && codeExecResult.length > 0 && renderCodeExecResult(`${idx}`, codeExecResult)}
                {loading && (
                    <Box sx={{ float: "right", right: "20px" }}>
                        <CtCircularProgress size={18} />
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
                files: CtCodeFile[],
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
                        files: m.files,
                        command: m.command.command !== "" ? m.command : undefined,
                        commandResult: undefined,
                        codeExecResult: ""
                    }
                })
                continue
            }

            if (i > 0 && m.message_type === CtChatMessageType.CommandResponse) {
                processedMessages[processedMessages.length - 1].params.commandResult = m.content
            }

            if (i > 0 && m.message_type === CtChatMessageType.CodeExecutionResult) {
                processedMessages[processedMessages.length - 1].params.codeExecResult = m.content
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
                files: activeResponse ? activeResponse.files : [],
                codeExecResult: ""
            })
        )
    }

    const messagePairsMemo = React.useMemo(() => renderMessagePairs(), [messages, expandedCodeBlock, selectedFile])

    const activeMessageMemo = React.useMemo(() => renderActiveMessage(), [activeResponse])

    const textFieldMemo = React.useMemo(() => (
        <StyledTextField
            fullWidth
            multiline
            maxRows={16}
            placeholder="Ask a follow up question..."
            disabled={activeResponse !== undefined}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && text.trim().length > 0) {
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
                                sx={{ borderRadius: "50%", minWidth: "0px", p: 1 }}
                                onClick={(e) => {
                                    toggleEditor()
                                }}
                            >
                                <CodeIcon />
                            </Button>
                        </Tooltip>
                    </InputAdornment>
                ),
                'aria-label': 'ask',
            }}
        />
    ), [text, activeResponse, toggleEditor])

    return (
        <ActiveStyledContainer maxWidth={"md"} sx={{ position: "relative", height: "calc(100vh - 82px)" }}>
            <Box
                display={"flex"}
                flexDirection={"column"}
                sx={{
                    marginBottom: authState.authenticated && authState.role !== 1 ? "108px" : "100px",
                    overflowY: "auto",
                    pb: 1,
                    width: "100%"
                }}
                ref={scrollContainerRef}
            >
                {messagePairsMemo}
                {activeMessageMemo}
                <div ref={targetScrollRef} />
            </Box>
            <Box
                display={"flex"}
                flexDirection={"column"}
                sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "calc(100% - 50px)",
                }}
            >
                {authState.authenticated && authState.role !== 1 && (
                    <ButtonBase
                        sx={{
                            borderRadius: "8px",
                        }}
                        onClick={() => setGoProPopup(true)}
                    >
                        <Typography
                            variant={"caption"}
                        >
                            Go Pro to get better answers and evade AI detection tools.
                        </Typography>
                    </ButtonBase>
                )}
                {textFieldMemo}
            </Box>
            <GoProDisplay open={goProPopup} onClose={() => setGoProPopup(false)} />
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
    const [ctRequestingShare, setCTRequestingShare] = useState<boolean>(false)
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
        files: CtCodeFile[],
        command: CtExecCommand | null
    } | null>(null);
    const [newFilePopup, setNewFilePopup] = React.useState(false);
    const [newFileName, setNewFileName] = React.useState("");
    const [deleteFileRequest, setDeleteFileRequest] = React.useState<string | null>(null);
    const [messages, setMessages] = React.useState<CtGetHHChatMessagesResponseMessage[]>([]);
    const [chats, setChats] = React.useState<CtGetHHChatsResponseChat[]>([]);

    const [code, setCode] = React.useState<CtCodeFile[]>([]);
    const [activeFile, setActiveFile] = React.useState("");
    const [langSelectActive, setLangSelectActive] = React.useState(false)

    const [terminalVisible, setTerminalVisible] = useState(false);
    const [output, setOutput] = useState<OutputState | null>(null);

    const navigate = useNavigate();

    let ctWs = useGlobalCtWebSocket();

    let globalWs = useGlobalWebSocket();

    let { id } = useParams()

    useEffect(() => {
        if (id === "-1" || newChat)
            return
        setMessages([])
        setCode([])
        setActiveFile("")
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
        setSelectedChat(id ? id : null)
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
        if (selectedChat === null || selectedChat === "-1" || selectedChat === "" || newChat) {
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

                let files: CtCodeFile[] = [];
                for (let i = 0; i < res.messages.length; ++i) {
                    if (res.messages[i].files !== null && res.messages[i].files.length > 0) {
                        // update the files
                        for (let j = 0; j < res.messages[i].files.length; ++j) {
                            // check if the file name already exists
                            let fidx = files.findIndex((f: CtCodeFile) => f.file_name == res.messages[i].files[j].file_name)
                            if (fidx < 0) {
                                files.push(res.messages[i].files[j])
                            } else {
                                files[fidx] = res.messages[i].files[j];
                            }
                        }
                    }
                }

                if (files.length > 0) {
                    setCode(files)
                    setActiveFile(files[0].file_name)
                    setEditorOpen(true)
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
                files: code,
                created_at: new Date(),
                message_number: 0,
                command: { command: "", lang: "" },
                premium_llm: false,
                free_credit_use: false
            }));
        }

        let workspaceLaunched = false;

        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeUserHHChatMessage,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                chat_id: chatId,
                user_message: userMessage,
                files: code,
                code_exec_result: codeExec
            }
        } satisfies CtMessage<CtHhUserMessage>,
            (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtHHAssistantMessage>): boolean => {
                if (msg.type !== CtMessageType.WebSocketMessageTypeAssistantHHChatMessage) {
                    console.log("failed to send message", msg)
                    return true;
                }

                let res = msg.payload as CtHHAssistantMessage

                let files: CtCodeFile[] = [];
                if (res.files !== null && res.files?.length > 0) {
                    files = code

                    console.log("checking for ws creation: ", workspaceState, workspaceLaunched)
                    // launch the workspace if the bot is writing files and we don't have one
                    if (!workspaceLaunched && (workspaceState === null || workspaceState > 1)) {
                        console.log("creating workspace")
                        createWorkspaceWithRetry(chatId);
                        workspaceLaunched = true;
                    }

                    // update the files
                    for (let i = 0; i < res.files.length; ++i) {
                        // check if the file name already exists
                        let fidx = files.findIndex((f: CtCodeFile) => f.file_name == res.files[i].file_name)
                        if (fidx < 0) {
                            files.push(res.files[i])
                        } else {
                            files[fidx] = res.files[i];
                        }
                    }

                    setCode(files)
                    setActiveFile(res.active_file)
                    setEditorOpen(true)

                    let activeFileLang = mapFilePathToLangOption(res.active_file)
                    if (activeFileLang === undefined || !activeFileLang.execSupported) {
                        // look for other files that have exec support
                        for (let i = 0; i < files.length; i++) {
                            activeFileLang = mapFilePathToLangOption(files[i].file_name)
                            if (activeFileLang !== undefined && activeFileLang.execSupported) {
                                setActiveFile(files[i].file_name)
                                break
                            }
                        }
                    }

                    if (res.done) {
                        let activeFileLang = mapFilePathToLangOption(res.active_file)
                        if (activeFileLang === undefined || !activeFileLang.execSupported) {
                            // look for other files that have exec support
                            for (let i = 0; i < files.length; i++) {
                                activeFileLang = mapFilePathToLangOption(files[i].file_name)
                                if (activeFileLang !== undefined && activeFileLang.execSupported) {
                                    setActiveFile(files[i].file_name)
                                    break
                                }
                            }
                        }
                        if (activeFileLang !== undefined && activeFileLang.execSupported) {
                            setCTRequestingExec(true)
                        }
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
                        files: files,
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
                        files: files,
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
            files: code,
            created_at: new Date(),
            message_number: 0,
            command: { command: "", lang: "" },
            premium_llm: false,
            free_credit_use: false
        }]);
        setActiveResponse({ text: "", files: code, command: null });

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
                    toggleEditor={(state) => {
                        if (code.length === 0 && !editorOpen) {
                            setNewFilePopup(true)
                            return
                        }
                        setEditorOpen(state !== undefined ? state : !editorOpen)
                    }}
                    setEditorCode={(code, activeFile) => {
                        setCode([])
                        setCode(code)
                        setActiveFile(activeFile)
                    }}
                    sendMessage={(content: string) => {
                        if (selectedChat === null || selectedChat === "-1" || content === "") {
                            return
                        }
                        setActiveResponse({ text: "", files: code, command: null });
                        sendUserMessage(selectedChat, content)
                    }}
                />
            )
        }
        return (
            <HomeworkHelperInit
                id={id}
                theme={theme}
                toggleEditor={() => {
                    if (code.length === 0 && !editorOpen) {
                        setNewFilePopup(true)
                        return
                    }
                    setEditorOpen(!editorOpen)
                }}
                submit={(content: string) => {
                    if (!authState.authenticated) {
                        localStorage.setItem("gigo:unauth:hh", content)
                        navigate("/signup?forward=" + encodeURIComponent(window.location.pathname))
                        return
                    }
                    if (localStorage.getItem("gigo:unauth:hh") !== null) {
                        localStorage.removeItem("gigo:unauth:hh")
                    }
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
                { hh_id: chatId },
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
        if (sendExecOutputToCT.current) {
            sendExecOutputToCT.current = false
            if (selectedChat !== null) {
                setActiveResponse({ text: "", files: code, command: null });
                sendUserMessage(
                    selectedChat,
                    result.length > 0 ? result : "No Output",
                    true,
                    true
                )
            }
        } else {
            setCTRequestingShare(true)
        }
    }, [selectedChat]);

    const sendExecRequest = (retryCount: number = 0) => {
        let lang = mapFilePathToLangOption(activeFile)
        if (lang === undefined || !lang?.execSupported) {
            return
        }

        let files = code.filter((f) => f.file_name.trim().length > 0)

        let payloadContent: any = {
            lang: lang.languageId,
            exec_files: files.map(c => ({
                file_name: c.file_name,
                code: c.code,
                execute: c.file_name === activeFile
            }))
        };

        // if the active file is a bash file then we use the single file exec
        if (lang.languageId === 38) {
            let file = code.find((f) => f.file_name == activeFile)
            payloadContent = {
                lang: lang.languageId,
                code: file ? file.code : "",
            }
        }

        const message = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: WsMessageType.AgentExecRequest,
            payload: {
                code_source_id: selectedChat,
                payload: payloadContent
            }
        };

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

                        if (payload.code === 1) {
                            setOutput({
                                stdout: [],
                                stderr: [{
                                    timestamp: Date.now() * 1000,
                                    content: "Unexpected Error Occurred: " + payload.error
                                }],
                                merged: "Unexpected Error Occurred: " + payload.error,
                                mergedLines: [{
                                    error: true,
                                    timestamp: Date.now() * 1000,
                                    content: "Unexpected Error Occurred: " + payload.error,
                                }],
                            })

                            setConnectButtonLoading(false)
                            setExecutingCode(false)
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

    const createWorkspaceWithRetry = async (chatId: string | null) => {
        let created = false;
        console.log("checking if we can create ws: ", chatId)
        if (chatId) {
            console.log("executing ws creation")
            setConnectButtonLoading(true)
            for (let i = 0; i < 5; i++) {
                let created = await createWorkspace(chatId);
                if (created) {
                    break
                }

                if (i === 4) {
                    break
                }
            }
            setConnectButtonLoading(false)
        }
        return created
    }

    const renderCtExecRequestPopup = () => {
        if (!ctRequestingExec && !ctRequestingShare) {
            return null
        }

        let body = (
            <>
                <Typography variant={"body2"}>
                    CT would like to run this code.
                </Typography>
                <Box
                    display={'inline-flex'}
                    justifyContent={'space-between'}
                    sx={{ width: "100%", paddingTop: "8px" }}
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
        )

        if (executingCode) {
            body = (
                <>
                    <Box
                        display={'inline-flex'}
                        justifyContent={'space-between'}
                        sx={{ width: "100%" }}
                    >
                        <Typography variant={"body2"}>
                            CT is running the code
                        </Typography>
                        <CtCircularProgress size={18} />
                    </Box>
                </>
            )
        }

        if (ctRequestingShare) {
            body = (
                <>
                    <Typography variant={"body2"}>
                        CT would like to see the output.
                    </Typography>
                    <Box
                        display={'inline-flex'}
                        justifyContent={'space-between'}
                        sx={{ width: "100%", paddingTop: "8px" }}
                    >
                        <LoadingButton
                            color={"success"}
                            variant={"outlined"}
                            loading={executingCode}
                            onClick={() => {
                                if (output !== null) {
                                    sendExecOutputToCT.current = true
                                    handleCtExecResult(output.merged)
                                    setCTRequestingShare(false)
                                }
                            }}
                        >
                            Permit
                        </LoadingButton>
                        <Button
                            color={"error"}
                            variant={"outlined"}
                            onClick={() => setCTRequestingShare(false)}
                        >
                            Deny
                        </Button>
                    </Box >
                </>
            )
        }

        return (
            <CodeTeacherPopupPaper
                sx={{
                    position: "absolute",
                    zIndex: 4,
                    bottom: "20px",
                    right: "20px",
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
                    <Typography variant={"h6"} sx={{ paddingTop: "8px" }}>
                        Code Teacher
                    </Typography>
                </Box>
                {body}
            </CodeTeacherPopupPaper>
        )
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
                                setCode(prev =>
                                    prev.concat({
                                        file_name: newFileName,
                                        code: "",
                                    })
                                )
                                setActiveFile(newFileName)
                                setNewFilePopup(false)
                                setEditorOpen(true)
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
                            setCode(prev =>
                                prev.concat({
                                    file_name: newFileName,
                                    code: "",
                                })
                            )
                            setActiveFile(newFileName)
                            setNewFilePopup(false)
                            setEditorOpen(true)
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
                        <br />
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
                            if (code.length === 1 && code[0].file_name === deleteFileRequest) {
                                setEditorOpen(false)
                            }
                            setCode(prev => prev.filter((f) => f.file_name !== deleteFileRequest))
                            setDeleteFileRequest(null)
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
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
                    onClick={() => createWorkspaceWithRetry(selectedChat)}
                >
                    Connect
                </LoadingButton>
            </Box>
        )
        let stateIcon = (<LinkOffIcon sx={{ color: alpha(theme.palette.text.primary, 0.6) }} />)
        if (workspaceState !== null) {
            if (workspaceState === 1) {
                stateTooltipTitle = "Connected To DevSpace"
                stateIcon = (<LinkIcon sx={{ color: theme.palette.success.main }} />)
            } else if (workspaceState < 1) {
                stateTooltipTitle = "Connecting To DevSpace"
                stateIcon = (<CircularProgress size={24} sx={{ color: alpha(theme.palette.text.primary, 0.6) }} />)
            }
        }

        let fileIndex = 0;
        let fileName = "New File"
        let fileContents = ""
        if (activeFile !== "") {
            let fidx = code.findIndex((f) => f.file_name === activeFile)
            if (fidx >= 0) {
                fileIndex = fidx
                fileName = code[fidx].file_name
                fileContents = code[fidx].code
            }
        }
        let lang = mapFilePathToLangOption(fileName)

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
                        <EditorTabs
                            value={fileIndex + 1}
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
                            TabIndicatorProps={{ sx: { display: "none" } }}
                        >
                            <EditorTab icon={<Add />} aria-label="New file" />
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
                                                sx={{ marginLeft: 0.5, padding: '2px', fontSize: "12px" }}
                                            >
                                                <CloseIcon fontSize="inherit" />
                                            </IconButton>
                                        </div>
                                    }
                                />
                            ))}
                        </EditorTabs>
                        {id !== undefined && lang?.execSupported && (
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
                                            zIndex: 3,
                                            m: 0,
                                            p: 0,
                                            fontSize: "0.7rem !important",
                                        }}
                                        onClick={() => {
                                            if (!authState.authenticated) {
                                                navigate("/signup?forward=" + encodeURIComponent(window.location.pathname))
                                                return
                                            }

                                            executeCode(); // Indicate button click
                                        }}
                                    >
                                        Run <PlayArrow fontSize={"small"} />
                                    </LoadingButton>
                                </Tooltip>
                            </Box>
                        )}
                    </Box>
                    <Box
                        sx={{ position: "relative" }}
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
                            language={mapFilePathToLang(activeFile)}
                            code={fileContents}
                            theme={mode}
                            readonly={false}
                            onChange={(val, view) => {
                                setCode(prev => {
                                    let fidx = prev.findIndex((f) => f.file_name === activeFile)
                                    if (fidx >= 0) {
                                        prev[fidx].code = val
                                    } else {
                                        prev = prev.concat({
                                            file_name: activeFile,
                                            code: val,
                                        })
                                    }
                                    return prev
                                })
                            }}
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
                            fontSize="0.7rem"
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
                    sx={{ position: 'fixed', bottom: 24, right: 16 }}
                    icon={<MenuIcon />}
                    open={speedDialOpen}
                    onOpen={() => setSpeedDialOpen(true)}
                    onClose={() => setSpeedDialOpen(false)}
                    onClick={() => setSpeedDialOpen(true)}
                >
                    <SpeedDialAction
                        key={"new"}
                        icon={<Add />}
                        tooltipTitle={"New Homework"}
                        onClick={clearChatState}
                    />
                    {chats.length > 0 && (
                        <SpeedDialAction
                            key={"history"}
                            icon={<LibraryBooks />}
                            tooltipTitle={"Homework History"}
                            onClick={() => setChatSelectionOpen(prev => !prev)}
                        />
                    )}
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
                                                    formatDistanceToNow(parseISO(item.last_message_at), { addSuffix: true })
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
        setCode([])
        setActiveFile("")
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
                        <meta property="og:title" content={"GIGO Homework Helper"} data-rh="true" />
                    </Helmet>
                </HelmetProvider>
                <Box
                    sx={{ maxHeight: "calc(100vh - 72px)", overflow: "hidden", width: "100% !important" }}
                >
                    <Grid container sx={{ width: "100% !important" }}>
                        <Grid item xs={bodySize}>
                            {renderBody()}
                        </Grid>
                        <Grid item xs={editorOpen ? 6 : 0} sx={{ height: "calc(100vh - 72px)", mt: 2, mb: 2 }}>
                            {renderEditor()}
                        </Grid>
                    </Grid>
                </Box>
                {renderActions()}
                {renderNewFilePopup()}
                {renderDeleteFilePopup()}
            </CssBaseline>
        </ThemeProvider>
    )
}

export default HomeworkHelper;
