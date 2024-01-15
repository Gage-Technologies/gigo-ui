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
    Tooltip
} from "@mui/material";
import { getAllTokens, themeHelpers } from "../../theme";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import { Close } from "@material-ui/icons";
import { Typography } from "@material-ui/core";
import { Checklist } from "@mui/icons-material";
import { useGlobalCtWebSocket } from "../../services/ct_websocket";
import { CtByteNextStepsRequest, CtByteNextStepsResponse, CtGenericErrorPayload, CtMessage, CtMessageOrigin, CtMessageType, CtValidationErrorPayload } from "../../models/ct_websocket";

export type ByteNextStepProps = {
    open: boolean;
    closeCallback: () => void;
    currentCode: string;
    anchorEl: null | HTMLElement; // Add this 
    placement: PopperPlacementType;
    posMods: number[];
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

export default function ByteNextStep(props: ByteNextStepProps) {
    let userPref = localStorage.getItem("theme");
    const [mode, _] = useState<PaletteMode>(userPref === "light" ? "light" : "dark");
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [response, setResponse] = useState<string>("");
    const [state, setState] = useState<State>(State.WAITING)

    const ctWs = useGlobalCtWebSocket();

    const WaitingButton = styled(Button)`
        animation: nextStepsButtonAuraEffect 2s infinite alternate;
        border-radius: 50%;
        padding: 8px;
        min-width: 0px;
        border: none;
        &:hover {
            border: none;
        }

        @keyframes nextStepsButtonAuraEffect {
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

    if (!props.open) {
        return null;
    }

    const close = () => {
        setResponse("")
        setState(State.WAITING)
        props.closeCallback()
    }

    const launchNextSteps = () => {
        console.log("executing next steps", {
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
            console.log("response message: ", msg)
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
    }

    const renderWaiting = () => {
        return (
            <>
                <Tooltip arrow title="Code Teacher wants to help you with the next step. Click the button to accept the help.">
                    <WaitingButton
                        variant="outlined"
                        onClick={() => {
                            setState(State.LOADING)
                            launchNextSteps()
                        }}
                    >
                        <Checklist />
                    </WaitingButton>
                </Tooltip>
            </>
        )
    }

    const renderLoading = () => {
        if (response !== "") {
            console.log("response\n", response)
            return (
                <Box
                    display={"block"}
                >
                    <MarkdownRenderer
                        markdown={response}
                        style={{
                            overflowWrap: 'break-word',
                            borderRadius: '10px',
                            padding: '0px',
                        }}
                    />
                    <Box sx={{ width: "100%", height: "fit-content" }}>

                        <AnimCircularProgress
                            size={16}
                            sx={{
                                float: 'right',
                                m: 1,
                            }}
                        />
                    </Box>
                </Box>
            )
        }

        return (
            <Box
                display={"flex"}
                justifyContent={'space-between'}
                alignItems={'start'}
                sx={{
                    flexDirection: "row",
                }}
            >
                <Typography variant="body1">
                    CT: Next Steps
                </Typography>
                <AnimCircularProgress
                    size={24}
                    sx={{
                        ml: 2
                    }}
                />
            </Box>
        )
    }

    const renderCompleted = () => {
        return (
            <MarkdownRenderer
                markdown={response}
                style={{
                    overflowWrap: 'break-word',
                    borderRadius: '10px',
                    padding: '0px',
                }}
            />
        )
    }

    const renderContent = () => {
        switch (state) {
            case State.WAITING:
                return renderWaiting();
            case State.LOADING:
                return renderLoading();
            case State.COMPLETED:
                return renderCompleted();
        }
    }

    return (
        <Popper
            open={props.open}
            anchorEl={props.anchorEl}
            placement={props.placement}
            sx={{
                backgroundColor: "transparent"
            }}
            modifiers={[
                {
                    name: 'offset',
                    options: {
                        offset: props.posMods, // x, y offset
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
                    ...(state === State.WAITING ? {

                    } : {
                        borderRadius: '10px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2);',
                        ...themeHelpers.frostedGlass,
                        backgroundColor: 'rgba(19,19,19,0.31)',
                        maxWidth: props.maxWidth
                    })
                }}
            >
                {state !== State.WAITING && response.length > 0 && (
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
                        onClick={close}
                    >
                        <Close />
                    </Button>
                )}
                <DialogContent
                    sx={{
                        backgroundColor: 'transparent',
                        maxHeight: '70vh',
                        overflow: 'auto',
                        mt: response.length > 0 ? 2: undefined,
                    }}
                >
                    {renderContent()}
                </DialogContent>
            </Box>
        </Popper >
    );
}
