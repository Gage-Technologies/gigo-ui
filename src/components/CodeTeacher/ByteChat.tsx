import { Box, Card, styled, TextField } from "@mui/material";
import { useState } from "react";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import {useGlobalCtWebSocket} from "../../services/ct_websocket";

export default function ByteChat() {

    let ctWs = useGlobalCtWebSocket();

    const MessageContainer = styled('div')(({ theme }) => ({
        overflowY: 'auto',
        padding: 2,
        marginBottom: 4, // space for the input field and button
        height: '68vh', // adjust based on your header/footer size
    }));
    
    type Message = {
        type: 'user' | 'bot';
        content: string;
    };

    // const launchCTChat = () => {
    //     ctWs.sendWebsocketMessage({
    //         sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    //         type: CtMessageType.WebSocketMessageTypeByteChatMessageRequest,
    //         origin: CtMessageOrigin.WebSocketMessageOriginClient,
    //         created_at: Date.now(),
    //         payload: {
    //             :
    //         }
    //     })
    // }
    

    const [userMessage, setUserMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { type: 'bot', content: "Hello, I'm Code Teacher! How may I help?" },
        { type: 'user', content: "My code is broken and i dont know what to do next" },
        { type: 'bot', content: "Skill issue" },
    ]);
    const [isBotTyping, setIsBotTyping] = useState(false);

    const renderUserMessage = (content: string) => {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    paddingBottom: '10px'
                }}
            >
                <Card
                    style={{
                        fontSize: ".75rem",
                        marginLeft: "auto",
                        marginRight: "10px",
                        marginBottom: "0px",
                        padding: "10px",
                        backgroundColor: "#0842a040",
                        border: "1px solid #0842a0",
                        color: "#fcfcfc",
                        borderRadius: "10px",
                        width: "auto",
                        height: "auto",
                        display: "block",
                        maxWidth: "90%"
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
            </div>
        );
    }

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
                    alignItems: "flex-end",
                    paddingBottom: '10px'
                }}
            >
                <Card
                    style={{
                        fontSize: ".75rem",
                        marginLeft: "10px",
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
                        maxWidth: "90%"
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
            </div>
        );
    }
    
   
    return (
        <Box>
            <MessageContainer>
            {messages.map((message: { type: string; content: string; }, index: any) => (
                        message.type === 'bot' ?
                            renderBotMessage(message.content,  false, "123", true, false) :
                            renderUserMessage(message.content, /* other props */)
                    ))}
            </MessageContainer>
            <TextField
                fullWidth
                label="Ask Code Teacher!"
                variant="outlined"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
            />

        </Box>
    );

}

