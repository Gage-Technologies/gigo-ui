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
import { CtByteSuggestionRequest, CtByteSuggestionResponse, CtGenericErrorPayload, CtMessage, CtMessageOrigin, CtMessageType, CtValidationErrorPayload } from "../../models/ct_websocket";

export type ByteSuggestionProps = {
    open: boolean;
    closeCallback: () => void;
    anchorEl: null | HTMLElement; // Add this 
    placement: PopperPlacementType;
    posMods: number[];
    lang: string;
    code: string;
    byteId: string;
    description: string;
    maxWidth: string;
};

enum State {
    LOADING = 'loading',
    COMPLETED = 'completed'
}

export default function ByteSuggestion(props: ByteSuggestionProps) {
    let userPref = localStorage.getItem("theme");
    const [mode, _] = useState<PaletteMode>(userPref === "light" ? "light" : "dark");
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [response, setResponse] = useState<string>("");
    const [state, setState] = useState<State>(State.LOADING)

    const ctWs = useGlobalCtWebSocket();

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

    const close = () => {
        setResponse("")
        setState(State.LOADING)
        props.closeCallback()
    }

    const getByteSuggestion = () => {
        console.log("byte suggestion starting")


        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeByteSuggestionRequest,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                code_language: props.lang,
                code: props.code,
                byte_description: props.description,
                byte_id: props.byteId,
                assistant_id: ""
            }
        } satisfies CtMessage<CtByteSuggestionRequest>, (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtByteSuggestionResponse>) => {
            //console.log("response message of next output: ", msg)
            if (msg.type !== CtMessageType.WebSocketMessageTypeByteSuggestionResponse) {
                console.log("failed suggestion message", msg)
                return true
            }
            const p: CtByteSuggestionResponse = msg.payload as unknown as CtByteSuggestionResponse;
            console.log("complete suggestion message: ", p.complete_message)
            setResponse(p.complete_message)
            if (p.done) {
                setState(State.COMPLETED)
                return true
            }
            return false
        })
    };

    useEffect(() => {
        if (!props.open)
            return
        getByteSuggestion()
    }, [props.open])

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
                    CT: Suggestions
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
            case State.LOADING:
                return renderLoading();
            case State.COMPLETED:
                return renderCompleted();
        }
    }

    if (!props.open) {
        return null;
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
                    ...({
                        borderRadius: '10px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2);',
                        ...themeHelpers.frostedGlass,
                        backgroundColor: 'rgba(19,19,19,0.31)',
                        maxWidth: props.maxWidth
                    })
                }}
            >
                {response.length > 0 && (
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
