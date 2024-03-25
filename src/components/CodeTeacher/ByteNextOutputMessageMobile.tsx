import {
    Box,
    Button,
    CircularProgress,
    createTheme, DialogContent,
    PaletteMode,
    Popper,
    PopperPlacementType,
    styled,
    alpha, Tooltip
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { getAllTokens, themeHelpers } from "../../theme";
import { useGlobalCtWebSocket } from "../../services/ct_websocket";
import {
    CtByteNextOutputRequest, CtByteNextOutputResponse, CtCodeFile,
    CtGenericErrorPayload,
    CtMessage,
    CtMessageOrigin,
    CtMessageType, CtValidationErrorPayload
} from "../../models/ct_websocket";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import { Typography } from "@material-ui/core";
import { BugReportOutlined, Close } from "@material-ui/icons";
import Lottie from "react-lottie";
import * as byteSuccess from "../../img/byteSuccess.json"
import CodeTeacherChatIcon from "./CodeTeacherChatIcon";
import { truncate } from "fs/promises";
import { LoadingButton } from "@mui/lab";
import { Player } from "@lottiefiles/react-lottie-player";
import config from "../../config";
import BytesCard from "../BytesCard";
import { useNavigate } from "react-router-dom";
import BytesCardMobile from "../BytesCardMobile";
import BytesCardSuccessPageMobile from "../ByteCardSuccessPageMobile";
import GoProDisplay from "../GoProDisplay";
import {useAppSelector} from "../../app/hooks";
import {selectAuthState} from "../../reducers/auth/auth";

export type ByteNextOutputMessageMobileProps = {
    trigger: boolean;
    acceptedCallback: () => void;
    onExpand: () => void;
    onHide: () => void;
    onSuccess: () => void;
    code: CtCodeFile[];
    byteId: string;
    description: string;
    dev_steps: string;
    maxWidth: string;
    codeOutput: string;
    nextByte?: any;
};

enum State {
    LOADING = 'loading',
    COMPLETED = 'completed'
}

export default function ByteNextOutputMessageMobile(props: ByteNextOutputMessageMobileProps) {
    let userPref = localStorage.getItem("theme");
    let authState = useAppSelector(selectAuthState);
    const [mode, _] = useState<PaletteMode>(userPref === "light" ? "light" : "dark");
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [response, setResponse] = useState<string>("");
    const [success, setSuccess] = useState<boolean | null>(null);
    const [state, setState] = useState<State>(State.LOADING);
    const [executingOutputMessage, setExecutingOutputMessage] = useState<boolean>(false)
    const [hidden, setHidden] = useState<boolean>(true);
    const [goProPopup, setGoProPopup] = useState(false)


    const ctWs = useGlobalCtWebSocket();

    const navigate = useNavigate();

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

    let premium = authState.role.toString()
    // //remove after testing
    // premium = "0"


    const renderHidden = React.useMemo(() => (
        <HiddenButton
            sx={{
                height: "30px",
                width: "30px",
                minWidth: "24px",
                marginLeft: "25px"
            }}
            onClick={() => expand()}
        >
            <BugReportOutlined style={{ fontSize: "24px" }} />
        </HiddenButton>
    ), [])

    const renderHiddenDisabled = React.useMemo(() => (
        <HiddenButton
            disabled={true}
            sx={{
                height: "30px",
                width: "30px",
                minWidth: "24px",
                marginLeft: "25px"
            }}
        >
            <BugReportOutlined style={{ fontSize: "24px" }} />
        </HiddenButton>
    ), [])

    const renderHiddenLoading = React.useMemo(() => (
        <HiddenLoadingButton
            loading={true}
            sx={{
                height: "30px",
                width: "30px",
                minWidth: "24px",
                marginLeft: "25px"
            }}
        >
            <BugReportOutlined style={{ fontSize: "24px" }} />
        </HiddenLoadingButton>
    ), [])

    const getOutputMessage = () => {
        if (executingOutputMessage) {
            return
        }
        setExecutingOutputMessage(true)
        props.acceptedCallback()

        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeByteNextOutputMessageRequest,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                byte_id: props.byteId,
                byte_description: props.description,
                byte_development_steps: props.dev_steps,
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

            setSuccess(p.success)
            setState(State.COMPLETED)
            if (p.success) {
                setResponse("")
                props.onSuccess()
            } else {
                setResponse(p.explanation)
            }
            expand()
            setExecutingOutputMessage(false)
            return true
        })
    };

    useEffect(() => {
        if (!props.trigger || executingOutputMessage)
            return
        setState(State.LOADING)
        setSuccess(null)
        setResponse("")
        getOutputMessage()
    }, [props.trigger])

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

    const toggleProPopup = () => setGoProPopup(!goProPopup)

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
                    width: "100%",
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
                        Debug
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
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
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

    const renderSuccesPage = () => {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems='center'
                justifyContent="space-between"
                sx={{
                    height: "100%",
                    width: "100%",
                    p: 2
                }}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    sx={{
                        width: "100%",
                    }}
                >
                    <Typography variant="h4" style={{marginBottom: 2}}>
                        Byte Completed!
                    </Typography>
                    <Player
                        src={byteSuccess}
                        loop={false}
                        keepLastFrame={true}
                        autoplay={true}
                        renderer="svg"
                    />
                    {props.nextByte && (
                        <>
                            <Typography variant="h6" style={{ paddingBottom: "10%" }}>
                                Next Up
                            </Typography>
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                style={{ width: "100%", marginTop: "-5%" }}
                            >
                                <BytesCardSuccessPageMobile
                                    bytesId={props.nextByte._id}
                                    bytesTitle={props.nextByte.name}
                                    bytesThumb={config.rootPath + "/static/bytes/t/" + props.nextByte._id}
                                    onClick={() => navigate(`/byte/${props.nextByte._id}`)}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.3s ease',
                                        margin: "0 auto",
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    width={"100%"}
                                    height={'fit-content'}
                                />
                            </Box>
                        </>
                    )}
                </Box>
                <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-around"
                    sx={{
                        width: "100%",
                        mt: 2,
                        mb: 2
                    }}
                >
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                            hide()
                        }}
                    >
                        Keep Hacking
                    </Button>
                    <Button
                        variant="outlined"
                        color="success"
                        sx={{
                            color: "#15cf91",
                            border: "1px solid #15cf9160",
                            "&:hover": {
                                color: "#15cf91",
                                backgroundColor: "#15cf9140",
                                border: "1px solid #15cf91",
                            }
                        }}
                        onClick={() => {
                            setSuccess(false)
                            setResponse("")
                            setState(State.LOADING)
                            hide()
                            navigate(`/byte/${props.nextByte._id}`)
                        }}
                    >
                        Continue
                    </Button>
                </Box>
            </Box>
        );
    };

    const renderContent = () => {
        if (hidden && (response.length > 0 || success)) {
            return renderHidden
        }

        if (hidden && state === State.LOADING && (props.trigger || executingOutputMessage)) {
            return renderHiddenLoading
        }

        if (hidden) {
            return renderHiddenDisabled
        }

        if (success) {
            return renderSuccesPage()
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
                    // width: "100%",
                    height: "100%"
                }}
            >
                {renderExpanded()}
                <GoProDisplay open={goProPopup} onClose={toggleProPopup}/>
            </Box>
        )
    }

    return renderContent()
}
