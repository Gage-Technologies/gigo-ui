import {Box, Button, Card, CircularProgress, PopperPlacementType, styled, TextField, Tooltip} from "@mui/material";
import React, {useEffect, useLayoutEffect, useState} from "react";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import {useGlobalCtWebSocket} from "../../services/ct_websocket";
import {
    CtByteAssistantMessage,
    CtByteChatMessage,
    CtByteChatMessagesRequest,
    CtByteChatMessagesResponse,
    CtByteMessageMessageType,
    CtByteNewOrGetChatRequest,
    CtByteNewOrGetChatResponse,
    CtByteUserMessage,
    CtGenericErrorPayload,
    CtMessage,
    CtMessageOrigin,
    CtMessageType,
    CtValidationErrorPayload
} from "../../models/ct_websocket";
import {initialAuthState, selectAuthStateThumbnail} from "../../reducers/auth/auth";
import config from "../../config";
import UserIcon from "../UserIcon";
import {useAppSelector} from "../../app/hooks";
import ctIcon from "../../img/codeTeacher/CT-icon.svg"
import CodeTeacherChatIcon from "./CodeTeacherChatIcon";

export type ByteChatProps = {
    byteID: string;
    description: string;
    devSteps: string;
    code: string;
};

export default function ByteChat(props: ByteChatProps) {

    let ctWs = useGlobalCtWebSocket();
    let authState = Object.assign({}, initialAuthState)
    const thumbnail = useAppSelector(selectAuthStateThumbnail);

    enum State {
        WAITING = 'waiting',
        LOADING = 'loading',
        COMPLETED = 'completed'
    }

    const [disableChat, setDisableChat] = useState(false);
    const [chatId, setChatId] = useState("");
    const [response, setResponse] = useState("")
    const [state, setState] = useState<State>(State.WAITING)
    const [userMessage, setUserMessage] = useState('');
    const [messages, setMessages] = useState<CtByteChatMessage[]>([
        {
            _id: "init",
            byte_id: props.byteID,
            byte_chat_id: props.byteID,
            assistant_id: "init",
            user_id: authState.id,
            thread_number: 0,
            message_type: CtByteMessageMessageType.Assistant,
            content: `Hey! I'm Code Teacher!\n \n${props.description}`, // place the description and dev steps here
            created_at: new Date(0),
            message_number: -1,
            premium_llm: false,
            free_credit_use: false,
        },
    ]);

    const launchCTChat = () => {
        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeNewByteChatOrGetRequest,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                assistant_id: "",
                byte_id: props.byteID, // prop byte id
                owner_id: authState.id // get from page like usual
            }
        } satisfies CtMessage<CtByteNewOrGetChatRequest>, (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtByteNewOrGetChatResponse>) => {
            console.log("response message: ", msg)
            if (msg.type !== CtMessageType.WebSocketMessageTypeNewByteChatOrGetResponse) {
                console.log("failed next steps", msg)
                return true
            }
            const p: CtByteNewOrGetChatResponse = msg.payload as CtByteNewOrGetChatResponse;
            setChatId(p._id)
            console.log("chat_id: ", chatId)
            return true
        })
    }

    useEffect(() => {
        launchCTChat()
    }, []);

    useEffect(() => {
        if (chatId === "")
            return
        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeGetByteChatMessageRequest,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                byte_id: props.byteID, // prop byte id
                offset: 0,
                limit: 100
            }
        } satisfies CtMessage<CtByteChatMessagesRequest>, (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtByteChatMessagesResponse>) => {
            console.log("response message: ", msg)
            if (msg.type !== CtMessageType.WebSocketMessageTypeGetByteChatMessageResponse) {
                console.log("failed next steps", msg)
                return true
            }
            const p: CtByteChatMessagesResponse = msg.payload as CtByteChatMessagesResponse;

            // concat the messages
            let m: CtByteChatMessage[] = JSON.parse(JSON.stringify(messages))
            m = m.concat(p.messages)

            // sort the messages by message number
            m.sort((a: any, b: any) => a.message_number - b.message_number)

            // filter duplicate messages using the _id field
            let uniqueIds = new Set();
            let uniqueMessages: CtByteChatMessage[] = []
            for (let i = 0; i < m.length; i++) {
                if (!uniqueIds.has(m[i]._id)) {
                    uniqueIds.add(m[i]._id!)
                    uniqueMessages.push(m[i]);
                }
            }

            setMessages(uniqueMessages)
            return true
        })
    }, [chatId])

    const sendUserCTChat = () => {
        setDisableChat(true)
        setState(State.LOADING)
        let m: CtByteChatMessage[] = JSON.parse(JSON.stringify(messages));
        m.push({
            _id: "new-um",
            byte_id: "",
            byte_chat_id: "",
            assistant_id: "",
            user_id: "",
            thread_number: m[m.length-1] && m[m.length-1].thread_number >= 0 ? m[m.length-1].thread_number : 0,
            message_type: CtByteMessageMessageType.User,
            content: userMessage,
            created_at: new Date(),
            message_number: m[m.length-1] ? m[m.length-1].message_number + 1 : 0,
            premium_llm: false,
            free_credit_use: false,
        })
        setMessages(m)
        setUserMessage('')
        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeByteUserMessage,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                byte_id: props.byteID,
                user_message: userMessage,
                code_content: props.code
            }
        } satisfies CtMessage<CtByteUserMessage>, (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtByteAssistantMessage>) => {
            console.log("chat response message: ", msg)
            if (msg.type !== CtMessageType.WebSocketMessageTypeByteAssistantMessage) {
                console.log("failed next steps", msg)
                return true
            }
            const p: CtByteAssistantMessage = msg.payload as CtByteAssistantMessage;
            setResponse(p.complete_message)

            // check the messages for a "new-um" message and replace if we find it
            let index = messages.findIndex((x, i) => x._id === "new-um")
            if (index !== -1) {
                m = JSON.parse(JSON.stringify(m));
                m[index]._id = p.user_message_id;
                setMessages(m);
            }

            if (p.done) {
                console.log("completing the state")
                setDisableChat(false)
                setState(State.COMPLETED)

                // add the new message
                m = JSON.parse(JSON.stringify(m));
                m.push({
                    _id: p.assistant_message_id,
                    byte_id: "",
                    byte_chat_id: "",
                    assistant_id: "",
                    user_id: "",
                    thread_number: m[m.length-1] && m[m.length-1].thread_number >= 0 ? m[m.length-1].thread_number : 0,
                    message_type: CtByteMessageMessageType.Assistant,
                    content: p.complete_message,
                    created_at: new Date(),
                    message_number: m[m.length-1] ? m[m.length-1].message_number + 1 : 0,
                    premium_llm: p.premium_llm,
                    free_credit_use: p.free_credit_use,
                })
                setMessages(m)
                return true
            }
            return false
        })
    }

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

    const animMemo = React.useMemo(() => (
        <Box sx={{ width: "100%", height: "fit-content" }}>
            <AnimCircularProgress
                key="fixed-animation"
                size={16}
                sx={{
                    float: 'right',
                    m: 1,
                }}
            />
        </Box>
    ), [])

    const renderLoading = (
        content: string,
    ) => {
        return (
            <Box
                display={"block"}
            >
                <MarkdownRenderer
                    markdown={content}
                    style={{
                        overflowWrap: 'break-word',
                        borderRadius: '10px',
                        padding: '0px',
                    }}
                />
                {animMemo}
            </Box>
        )
    }

    const renderCompleted = (
        content: string,
    ) => {
        return (
            <MarkdownRenderer
                markdown={content}
                style={{
                    overflowWrap: 'break-word',
                    borderRadius: '10px',
                    padding: '0px',
                }}
            />
        )
    }

    const renderContent = (
        content: string,
        loading: boolean
    ) => {
        if (loading) {
            return renderLoading(content);
        }
        return renderCompleted(content);
    }

    const renderUserMessage = (content: string) => {
        console.log("thumbnail: ", thumbnail)
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                    paddingBottom: '10px'
                }}
            >
                <Card
                    style={{
                        fontSize: ".75rem",
                        marginLeft: "auto",
                        marginRight: "2.5px",
                        marginBottom: "0px",
                        padding: "10px",
                        backgroundColor: "#0842a040",
                        border: "1px solid #0842a0",
                        color: "#fcfcfc",
                        borderRadius: "10px",
                        width: "auto",
                        height: "auto",
                        display: "block",
                        maxWidth: "82%"
                    }}
                >
                    <MarkdownRenderer
                        markdown={content}
                        style={{
                            overflowWrap: 'break-word',
                            borderRadius: '10px',
                            padding: '0px',
                        }}
                    />
                </Card>
                <UserIcon
                    userId={authState.id}
                    userTier={authState.tier}
                    userThumb={config.rootPath + thumbnail}
                    size={35}
                    backgroundName={authState.backgroundName}
                    backgroundPalette={authState.backgroundColor}
                    backgroundRender={authState.backgroundRenderInFront}
                    profileButton={false}
                    pro={authState.role.toString() === "1"}
                    mouseMove={false}
                />
            </div>
        );
    };


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
                    alignItems: "flex-start",
                    paddingBottom: '10px'
                }}
            >

                <CodeTeacherChatIcon
                    style={{
                        marginRight: '10px',
                        width: '35px',
                        height: '35px',
                    }}
                />

                <Card
                    style={{
                        fontSize: ".75rem",
                        marginLeft: "2.5px",
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
                        maxWidth: "82%"
                    }}
                >
                    {renderContent(content, loading)}
                </Card>
            </div>
        );
    };


    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            // check for shift key to prevent ctrl+enter from submitting form
            if (event.shiftKey) {
                return;
            }

            setResponse('')
            sendUserCTChat();
        }
    }

    const messagesMemo = React.useMemo(() => (
        <>
            {messages.map((message: CtByteChatMessage) => (
                message.message_type === CtByteMessageMessageType.Assistant
                    ?
                    renderBotMessage(message.content, false, message.assistant_id, message.premium_llm, message.free_credit_use)
                    :
                    renderUserMessage(message.content)
            ))}
        </>
    ), [messages])

    const textInputMemo = React.useMemo(() => (
        <TextField
            disabled={disableChat}
            fullWidth
            label="Ask Code Teacher!"
            variant="outlined"
            value={userMessage}
            multiline={true}
            maxRows={5}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={handleKeyPress}
        />
    ), [userMessage, disableChat])

    return (
        <>
            <Box
                display={"flex"}
                flexDirection={"column"}
                sx={{
                    maxHeight: "68vh",
                    overflowY: "auto",
                    pt: 2,
                    pb: 2,
                    marginBottom: 1, // space for the input field and button
                }}
            >
                {messagesMemo}
                {state === State.LOADING &&
                    renderBotMessage(response, true, "", false, false)}
            </Box>
            {textInputMemo}
        </>
    );
}

