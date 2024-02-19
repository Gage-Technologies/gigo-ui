import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    createTheme,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    PaletteMode,
    Popper,
    PopperPlacementType,
    styled,
    Tooltip,
    alpha
} from "@mui/material";
import { getAllTokens, themeHelpers } from "../../theme";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import { Close } from "@material-ui/icons";
import { Typography } from "@material-ui/core";
import { Checklist, Circle } from "@mui/icons-material";
import { useGlobalCtWebSocket } from "../../services/ct_websocket";
import { CtByteNextStepsRequest, CtByteNextStepsResponse, CtGenericErrorPayload, CtMessage, CtMessageOrigin, CtMessageType, CtValidationErrorPayload } from "../../models/ct_websocket";
import CodeTeacherChatIcon from "./CodeTeacherChatIcon";
import GoProDisplay from "../GoProDisplay";
import {selectAuthState} from "../../reducers/auth/auth";
import {useAppSelector} from "../../app/hooks";

export type ByteNextStepProps = {
    trigger: boolean;
    acceptedCallback: () => void;
    onExpand: () => void;
    onHide: () => void;
    currentCode: string;
    maxWidth: string;
    bytesID: string;
    bytesDescription: string;
    bytesDevSteps: string;
    bytesLang: string;
    codePrefix: string;
    codeSuffix: string;
};

enum State {
    WAITING = 'waiting',
    LOADING = 'loading',
    COMPLETED = 'completed'
}

export default function ByteNextStepMobile(props: ByteNextStepProps) {
    let userPref = localStorage.getItem("theme");
    let authState = useAppSelector(selectAuthState);
    const [mode, _] = useState<PaletteMode>(userPref === "light" ? "light" : "dark");
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [response, setResponse] = useState<string>("");
    const [state, setState] = useState<State>(State.WAITING)
    const [hidden, setHidden] = useState<boolean>(true);
    const [goProPopup, setGoProPopup] = useState(false)

    const ctWs = useGlobalCtWebSocket();

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

    const HiddenButton = styled(Button)`
        background-color: transparent;
        padding: 8px;
        min-width: 0px;
        color: ${alpha(theme.palette.text.primary, 0.6)};
        border: 1px solid ${alpha(theme.palette.text.primary, 0.6)};
        &:hover {
            background-color: ${alpha(theme.palette.text.primary, 0.4)};
            color: ${theme.palette.text.primary};
            border: 1px solid ${alpha(theme.palette.text.primary, 0.8)};
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

    let premium = authState.role.toString()
    // //remove after testing
    // premium = "0"

    useEffect(() => {
        if (state !== State.LOADING && hidden) {
            setResponse("")
            setState(State.WAITING)
        }
    }, [props.trigger, hidden])

    const hide = () => {
        setHidden(true)
        props.onHide()
    }

    const expand = () => {
        setHidden(false)
        props.onExpand()
    }

    const launchNextSteps = React.useCallback(() => {
        if (state === State.LOADING) {
            return
        }

        setState(State.LOADING)
        expand()
        console.log('next steps payload: ', {
            byte_id: props.bytesID,
            byte_description: props.bytesDescription,
            byte_development_steps: props.bytesDevSteps,
            code_language: props.bytesLang,
            code_prefix: props.codePrefix,
            code_suffix: props.codeSuffix,
        })
        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeByteNextStepsMessageRequest,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                byte_id: props.bytesID,
                byte_description: props.bytesDescription,
                byte_development_steps: props.bytesDevSteps,
                code_language: props.bytesLang,
                code_prefix: props.codePrefix,
                code_suffix: props.codeSuffix,
            }
        } satisfies CtMessage<CtByteNextStepsRequest>, (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtByteNextStepsResponse>) => {
            if (msg.type !== CtMessageType.WebSocketMessageTypeByteNextStepsMessageResponse) {
                console.log("failed next steps", msg)
                return true
            }
            const p: CtByteNextStepsResponse = msg.payload as CtByteNextStepsResponse;
            setResponse(p.complete_message)
            if (p.done) {
                setState(State.COMPLETED)
                return true
            }
            return false
        })
    }, [props.bytesID, props.bytesDescription, props.bytesDevSteps, props.bytesLang, props.codePrefix, props.codeSuffix])

    const toggleProPopup = () => setGoProPopup(!goProPopup)

    const renderWaiting = React.useMemo(() => {
        return (
            <>
                <Tooltip arrow title="Code Teacher wants to help you with the next step. Click the button to accept the help.">
                    <WaitingButton
                        sx={{
                            height: "30px",
                            width: "30px",
                            minWidth: "24px",
                            marginRight: "25px"
                        }}
                        variant="outlined"
                        onClick={() => {
                            launchNextSteps()
                            props.acceptedCallback()
                        }}
                    >
                        <Circle style={{ fontSize: "12px" }} />
                    </WaitingButton>
                </Tooltip>
            </>
        )
    }, [props.bytesID, props.bytesDescription, props.bytesDevSteps, props.bytesLang, props.codePrefix, props.codeSuffix])

    const renderHidden = React.useMemo(() => (
        <HiddenButton
            sx={{
                height: "30px",
                width: "30px",
                minWidth: "24px",
                marginRight: "25px"
            }}
            variant="outlined"
            onClick={() => expand()}
        >
            <Circle style={{ fontSize: "12px" }} />
        </HiddenButton>
    ), [])

    const renderHiddenDisabled = React.useMemo(() => (
        <HiddenButton
            disabled={true}
            sx={{
                height: "30px",
                width: "30px",
                minWidth: "24px",
                marginRight: "25px"
            }}
            variant="outlined"
        >
            <Circle style={{ fontSize: "12px" }} />
        </HiddenButton>
    ), [])

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
                        What To Do Next
                    </Box>
                    {state !== State.LOADING || response.length > 0 ? (
                        <Button
                            variant="text"
                            color="error"
                            sx={{
                                borderRadius: "50%",
                                padding: 0.5,
                                minWidth: "0px",
                                // marginLeft: "auto",
                                height: "24px",
                                width: "24px"
                            }}
                            onClick={hide}
                        >
                            <Close/>
                        </Button>
                    ) : headerLoadingAnim}
                </Box>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <MarkdownRenderer
                        markdown={response}
                        style={{
                            overflowWrap: 'break-word',
                            borderRadius: '10px',
                            padding: '0px',
                        }}
                    />
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px', marginRight: "10px"}}>
                        {premium === "0" && (
                            <Tooltip title={"Get Access to more coding help and resources by going pro"}>
                                <Button onClick={(event) => {
                                    setGoProPopup(true)
                                }} variant={"outlined"}>
                                    Go Pro
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                </div>
                {state === State.LOADING && response.length > 0 && loadingAnim}
            </Box>
        )
    }

    if (hidden && props.trigger && state === State.WAITING) {
        return renderWaiting
    }

    if (hidden && response.length > 0) {
        return renderHidden
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
            <GoProDisplay open={goProPopup} onClose={toggleProPopup}/>
        </Box>
    );
}
