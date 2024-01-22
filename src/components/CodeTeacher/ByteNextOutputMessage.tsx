import {
    Box,
    Button,
    CircularProgress,
    createTheme, DialogContent,
    PaletteMode,
    Popper,
    PopperPlacementType,
    styled
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {getAllTokens, themeHelpers} from "../../theme";
import {useGlobalCtWebSocket} from "../../services/ct_websocket";
import {
    CtByteNextOutputRequest, CtByteNextOutputResponse,
    CtGenericErrorPayload,
    CtMessage,
    CtMessageOrigin,
    CtMessageType, CtValidationErrorPayload
} from "../../models/ct_websocket";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import {Typography} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import Lottie from "react-lottie";
import * as byteSuccess from "../../img/byteSuccess.json"

export type ByteNextOutputMessageProps = {
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
    codeOutput: string
};

enum State {
    LOADING = 'loading',
    COMPLETED = 'completed'
}

export default function ByteNextOutputMessage(props: ByteNextOutputMessageProps) {
    let userPref = localStorage.getItem("theme");
    const [mode, _] = useState<PaletteMode>(userPref === "light" ? "light" : "dark");
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [response, setResponse] = useState<string>("");
    const [success, setSuccess] = useState<boolean | null>(null);
    const [state, setState] = useState<State>(State.LOADING);
    const [executingOutputMessage, setExecutingOutputMessage] = useState<boolean>(false)

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
        setSuccess(null)
        setState(State.LOADING)
        props.closeCallback()
    }

    const getOutputMessage = () => {
        console.log("executingOutputmessage: ", executingOutputMessage)
        if (executingOutputMessage) {
            return
        }

        console.log("next output starting")


        setExecutingOutputMessage(true)
        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeByteNextOutputMessageRequest,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                byte_id: props.byteId,
                byte_description: props.description,
                code_language: props.lang,
                // @ts-ignore
                byte_output: props.codeOutput, // changed from codeOutput["stdout"][0] because of an error
                code: props.code
            }
        } satisfies CtMessage<CtByteNextOutputRequest>, (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtByteNextOutputResponse>) => {
            //console.log("response message of next output: ", msg)
            if (msg.type !== CtMessageType.WebSocketMessageTypeByteNextOutputMessageResponse) {
                console.log("failed next output message", msg)
                setExecutingOutputMessage(false)
                return true
            }
            const p: CtByteNextOutputResponse = msg.payload as CtByteNextOutputResponse;
            console.log("p is: ", p)
            console.log("complete output message: ", p.success)
            console.log("Explanation: ", p.explanation)
            setResponse(p.explanation)
            setSuccess(p.success)
            // setSuccess(true)
            setExecutingOutputMessage(false)
            setState(State.COMPLETED)
            return true
        })
    };

    useEffect(() => {
        if (!props.open)
            return
        console.log("use effect for output message")
        getOutputMessage()
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
                    CT: Output Analysis
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

    const onAnimationComplete = () => {
        console.log("here i am on animation complete")
        setResponse("")
        setSuccess(null)
        setState(State.LOADING)
        props.closeCallback()
    }

    const byteSuccessOptions = {
        loop: false,
        autoplay: true,
        animationData: byteSuccess,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    };

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
            {success ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    maxWidth: props.maxWidth
                }}>
                    <Lottie options={byteSuccessOptions} speed={2} direction={-1}
                            isClickToPauseDisabled={true}/>
                </div>
            ) : (
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
                    <div>
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
                                <Close/>
                            </Button>
                        )}
                        <DialogContent
                            sx={{
                                backgroundColor: 'transparent',
                                maxHeight: '70vh',
                                overflow: 'auto',
                                mt: response.length > 0 ? 2 : undefined,
                            }}
                        >
                            {renderContent()}
                        </DialogContent>
                    </div>
                </Box>
            )}
        </Popper>
    );
}
