import {
    Box,
    Button,
    CircularProgress,
    createTheme, DialogContent,
    PaletteMode,
    Popper,
    PopperPlacementType,
    styled,
    alpha
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { getAllTokens, themeHelpers } from "../../theme";
import { useGlobalCtWebSocket } from "../../services/ct_websocket";
import {
    CtByteNextOutputRequest, CtByteNextOutputResponse, CtByteSuggestionRequest, CtByteSuggestionResponse,
    CtGenericErrorPayload,
    CtMessage,
    CtMessageOrigin,
    CtMessageType, CtValidationErrorPayload
} from "../../models/ct_websocket";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import {Close, Done} from "@material-ui/icons";
import ConstructionIcon from '@mui/icons-material/Construction';
import CodeTeacherChatIcon from "./CodeTeacherChatIcon";
import { LoadingButton } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import {ctHighlightCodeRangeFullLines, removeCtHighlightCodeRange} from "../IDE/Extensions/CtHighlightExtension";
import ReactDOM from "react-dom";
import {ReactCodeMirrorRef} from "@uiw/react-codemirror";

export type ByteSuggestions2Props = {
    range: {start_line: number, end_line: number} | null;
    editorRef: React.RefObject<ReactCodeMirrorRef>;
    acceptedCallback: (newCode: string) => void;
    rejectedCallback: () => void;
    onExpand: () => void;
    onHide: () => void;
    lang: string;
    code: string;
    byteId: string;
    description: string;
    dev_steps: string;
    maxWidth: string;
};

enum State {
    LOADING = 'loading',
    COMPLETED = 'completed'
}

export default function ByteSuggestions2(props: ByteSuggestions2Props) {
    let userPref = localStorage.getItem("theme");
    const [mode, _] = useState<PaletteMode>(userPref === "light" ? "light" : "dark");
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [response, setResponse] = useState<string>("");
    const [newCode, setNewCode] = useState<string>("");
    const [state, setState] = useState<State>(State.LOADING);
    const [executing, setExecuting] = useState<boolean>(false)
    const [hidden, setHidden] = useState<boolean>(true);
    const [accepted, setAccepted] = useState<boolean>(false);


    const ctWs = useGlobalCtWebSocket();

    const HiddenButton = styled(Button)`
        background-color: transparent;
        padding: 8px;
        min-width: 0px;
        color: ${alpha(theme.palette.text.primary, 0.6)};
        &:hover {
            background-color: ${alpha(theme.palette.text.primary, 0.4)};
            color: ${theme.palette.text.primary};
        }
    `;

    const HiddenLoadingButton = styled(LoadingButton)`
        background-color: transparent;
        padding: 8px;
        min-width: 0px;
        color: ${alpha(theme.palette.text.primary, 0.6)};
        &:hover {
            background-color: ${alpha(theme.palette.text.primary, 0.4)};
            color: ${theme.palette.text.primary};
        }
    `;

    const AnimCircularProgress = styled(CircularProgress)`
        animation: mui-rotation 2s linear infinite, respondingEffect 2s infinite alternate;

        @keyframes respondingEffect {
            0% {
            color: #84E8A2;
            }
            20% {
            color: #29C18C;
            }
            40% {
            color: #1C8762;
            }
            60% {
            color: #2A63AC;
            }
            80% {
            color: #3D8EF7;
            }
            100% {
            color: #63A4F8;
            }
        }

        @keyframes mui-rotation {
            100% {
            transform: rotate(360deg);
            }
        }
    `;

    const hide = () => {
        setHidden(true)
        props.onHide()
    }

    const expand = () => {
        setHidden(false)
        props.onExpand()
    }


    const renderHidden = React.useMemo(() => (
        <HiddenButton
            sx={{
                height: "30px",
                width: "30px",
                minWidth: "24px",
                marginLeft: "10px"
            }}
            onClick={() => expand()}
        >
            <ConstructionIcon style={{ fontSize: "24px" }} />
        </HiddenButton>
    ), [])

    const renderHiddenDisabled = React.useMemo(() => (
        <HiddenButton
            disabled={true}
            sx={{
                height: "30px",
                width: "30px",
                minWidth: "24px",
                marginLeft: "10px"
            }}
        >
            <ConstructionIcon style={{ fontSize: "24px" }} />
        </HiddenButton>
    ), [])

    const renderHiddenLoading = React.useMemo(() => (
        <HiddenLoadingButton
            loading={true}
            sx={{
                height: "30px",
                width: "30px",
                minWidth: "24px",
                marginLeft: "10px"
            }}
        >
            <ConstructionIcon style={{ fontSize: "24px" }} />
        </HiddenLoadingButton>
    ), [])

    const getCodeSuggestion = () => {
        if (executing || !props.editorRef.current?.view || !props.range) {
            return
        }
        setExecuting(true)

        ctHighlightCodeRangeFullLines(props.editorRef.current.view, props.range.start_line, props.range.end_line+1);

        const {prefix, middle, suffix} = splitStringByLines(props.code, props.range.start_line, props.range.end_line+1)

        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeByteSuggestionRequest,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                code_language: props.lang,
                code_prefix: "",
                code: middle,
                code_suffix: "",
                byte_description: props.description,
                byte_development_steps: props.dev_steps,
                byte_id: props.byteId,
                assistant_id: ""
            }
        } satisfies CtMessage<CtByteSuggestionRequest>, (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtByteSuggestionResponse>) => {
            //console.log("response message of next output: ", msg)
            if (msg.type !== CtMessageType.WebSocketMessageTypeByteSuggestionResponse) {
                console.log("failed suggestion message", msg)
                setExecuting(false)
                return true
            }
            const p: CtByteSuggestionResponse = msg.payload as unknown as CtByteSuggestionResponse;
            setNewCode(p.code_section)
            setResponse(p.suggestion)
            setExecuting(false)
            setState(State.COMPLETED)
            expand()
            return true
        })
    };

    useEffect(() => {
        if (executing)
            return
        setState(State.LOADING)
        setResponse("")
        setNewCode("")
        setAccepted(false)
        if (!props.range) {
            return
        }
        getCodeSuggestion()
    }, [props.range])

    const loadingAnim = React.useMemo(() => (
        <Box sx={{ width: "100%", height: "fit-content" }}>
            <AnimCircularProgress
                size={16}
                sx={{
                    float: 'right',
                    m: 1,
                }}
            />
        </Box>
    ), [])

    const headerLoadingAnim = React.useMemo(() => (
        <AnimCircularProgress size={24} />
    ), [])

    const renderExpanded = () => {
        return (
            <Box
                sx={{
                    overflow: "auto",
                    pl: 1,
                    height: "100%",
                    backgroundColor: "transparent",
                    border: "none",
                    boxShadow: "none",
                    width: "100%"
                }}
            >
                <Box
                    display={"inline-flex"}
                    justifyContent={"space-between"}
                    sx={{
                        border: `1px solid ${theme.palette.text.primary}`,
                        borderRadius: "6px",
                        mb: 2,
                        p: 1,
                        width: "100%"
                    }}
                >
                    <CodeTeacherChatIcon
                        style={{
                            height: "24px",
                            width: "24px"
                        }}
                    />
                    <Box
                        sx={{
                            ml: 2
                        }}
                    >
                        Code Clean Up
                    </Box>
                    {state !== State.LOADING || response.length > 0 ? (
                        <Button
                            variant="text"
                            color="error"
                            sx={{
                                borderRadius: "50%",
                                padding: 0.5,
                                minWidth: "0px",

                                height: "24px",
                                width: "24px"
                            }}
                            onClick={() => hide()}
                        >
                            <Close />
                        </Button>
                    ) : headerLoadingAnim}
                </Box>
                <Box
                    sx={{
                        border: `1px solid ${theme.palette.primary.main}`,
                        borderRadius: "10px",
                        m: 1,
                        p: 1
                    }}
                >
                    <MarkdownRenderer
                        markdown={"```" + props.lang.toLowerCase() + "\n" + newCode + "\n```"}
                        style={{
                            overflowWrap: 'break-word',
                            borderRadius: '10px',
                            padding: '0px',
                        }}
                    />
                    {!accepted && (
                        <Box
                            display={"inline-flex"}
                            justifyContent={"space-between"}
                            sx={{
                                width: "100%",
                                mt: 1,
                            }}
                        >
                            <Button
                                color={"success"}
                                variant={"outlined"}
                                onClick={() => {
                                    if (!props.range || !props.editorRef.current?.view) {
                                        return
                                    }

                                    removeCtHighlightCodeRange(props.editorRef.current.view, props.range.start_line, props.range.end_line+1);

                                    const {prefix, middle, suffix} = splitStringByLines(props.code, props.range.start_line, props.range.end_line+1)
                                    hide()
                                    props.acceptedCallback(prefix+"\n"+newCode+suffix)
                                    setAccepted(true)
                                }}
                            >
                                <Done style={{marginRight: 2}}/> Accept
                            </Button>
                            <Button
                                color={"error"}
                                variant={"outlined"}
                                onClick={() => {
                                    if (!props.range || !props.editorRef.current?.view) {
                                        return
                                    }

                                    removeCtHighlightCodeRange(props.editorRef.current.view, props.range.start_line, props.range.end_line+1);

                                    hide()
                                    props.rejectedCallback()
                                    setAccepted(true)
                                }}
                            >
                                <Close style={{marginRight: 2}}/> Dismiss
                            </Button>
                        </Box>
                    )}
                </Box>
                <MarkdownRenderer
                    markdown={response}
                    style={{
                        overflowWrap: 'break-word',
                        borderRadius: '10px',
                        padding: '0px',
                    }}
                />
                {state === State.LOADING && response.length > 0 && loadingAnim}
            </Box>
        )
    }

    const renderContent = () => {
        if (hidden && response.length > 0) {
            return renderHidden
        }

        if (hidden && state === State.LOADING && (props.range || executing)) {
            return renderHiddenLoading
        }

        if (hidden) {
            return renderHiddenDisabled
        }

        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'start',
                    p: 1,
                    zIndex: 5,
                    boxShadow: "none",
                    backgroundColor: "transparent",
                    width: props.maxWidth,
                    height: "100%"
                }}
            >
                {renderExpanded()}
            </Box>
        )
    }

    return renderContent()
}

export function splitStringByLines(text: string, startLine: number, endLine: number): { prefix: string, middle: string, suffix: string } {
    // Split the text into lines, preserving empty lines.
    const lines = text.split('\n');

    // Adjust start and end lines to be zero-indexed.
    startLine = Math.max(startLine - 1, 0);
    endLine = Math.min(endLine - 1, lines.length - 1);

    // Validate the start and end lines.
    if (startLine > endLine) {
        throw new Error("Start line must be less than or equal to end line.");
    }

    // Extract the prefix, middle, and suffix.
    // Using slice and join, empty lines are preserved as they will simply result in consecutive newline characters.
    const prefix = lines.slice(0, startLine).join('\n') + (startLine > 0 ? '\n' : '');
    const middle = lines.slice(startLine, endLine + 1).join('\n');
    const suffix = (endLine < lines.length - 1 ? '\n' : '') + lines.slice(endLine + 1).join('\n');

    return { prefix, middle, suffix };
}
