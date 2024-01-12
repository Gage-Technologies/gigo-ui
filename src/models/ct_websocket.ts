export enum CtMessageType {
    WebSocketMessageTypeCompletionRequest,
    WebSocketMessageTypeCompletionResponse,
    WebSocketMessageTypeParseFileRequest,
    WebSocketMessageTypeParseFileResponse,
    WebSocketMessageTypeUserStatusRequest,
    WebSocketMessageTypeUserStatusResponse,
    WebSocketMessageTypeNewByteChatOrGetRequest,
    WebSocketMessageTypeNewByteChatOrGetResponse,
    WebSocketMessageTypeGetByteChatMessageRequest,
    WebSocketMessageTypeGetByteChatMessageResponse,
    WebSocketMessageTypeByteNextStepsMessageRequest,
    WebSocketMessageTypeByteNextStepsMessageResponse,
    WebSocketMessageTypeByteNextOutputMessageRequest,
    WebSocketMessageTypeByteNextOutputMessageResponse,
    WebSocketMessageTypeByteDebugRequest,
    WebSocketMessageTypeByteDebugResponse,
    WebSocketMessageTypeByteSuggestionRequest,
    WebSocketMessageTypeByteSuggestionResponse
}

export enum CtResponseCode {
    BadRequest,
    ServerError
}

export interface CtGenericErrorPayload {
    code: CtResponseCode;
    error: string;
}

export interface CtValidationErrorPayload extends CtGenericErrorPayload {
    validation_errors: Record<string, string>;
}

export enum CtMessageOrigin {
    WebSocketMessageOriginServer,
    WebSocketMessageOriginClient
}

export interface CtMessage<T> {
    sequence_id: string;
    type: CtMessageType;
    origin: CtMessageOrigin;
    created_at: number;
    test: number;
    payload: T;
}

export const ctMessageTypeToString = (t: CtMessageType) => {
    return [
        "WebSocketMessageTypeInit",
        "WebSocketMessageTypeNewChat",
        "WebSocketMessageTypeUserMessage",
        "WebSocketMessageTypeAssistantMessage",
        "WebSocketMessageTypeGenericError",
        "WebSocketMessageTypeValidationError",
        "WebSocketMessageTypeDebugRequest",
        "WebSocketMessageTypeAuthorizationError",
        "WebSocketMessageTypeDebugResponse",
        "WebSocketMessageTypeFileNeedsIndexingRequest",
        "WebSocketMessageTypeFileNeedsIndexingResponse",
        "WebSocketMessageTypeDeleteFileRequest",
        "WebSocketMessageTypeDeleteFileResponse",
        "WebSocketMessageTypeIndexFileRequest",
        "WebSocketMessageTypeIndexFileResponse",
        "WebSocketMessageTypeGetChatsRequest",
        "WebSocketMessageTypeGetChatsResponse",
        "WebSocketMessageTypeGetChatMessagesRequest",
        "WebSocketMessageTypeGetChatMessagesResponse",
        "WebSocketMessageTypeDeleteChatRequest",
        "WebSocketMessageTypeDeleteChatResponse",
        "WebSocketMessageTypeGetChatNameRequest",
        "WebSocketMessageTypeGetChatNameResponse",
        "WebSocketMessageTypeRecordCommandResultRequest",
        "WebSocketMessageTypeRecordCommandResultResponse",
        "WebSocketMessageTypeCompletionRequest",
        "WebSocketMessageTypeCompletionResponse",
        "WebSocketMessageTypeParseFileRequest",
        "WebSocketMessageTypeParseFileResponse",
        "WebSocketMessageTypeNewExplanation",
        "WebSocketMessageTypeGetExplanationsRequest",
        "WebSocketMessageTypeGetExplanationsResponse",
        "WebSocketMessageTypeGetExplanationThreadsRequest",
        "WebSocketMessageTypeGetExplanationThreadsResponse",
        "WebSocketMessageTypeNewExplanationThreadRequest",
        "WebSocketMessageTypeNewExplanationThreadResponse",
        "WebSocketMessageTypeUserStatusRequest",
        "WebSocketMessageTypeUserStatusResponse",
        "WebSocketMessageTypeNewByteChatOrGetRequest",
        "WebSocketMessageTypeNewByteChatOrGetResponse",
        "WebSocketMessageTypeGetByteChatMessageRequest",
        "WebsocketMessageTypeGetByteChatMessageResponse",
        "WebSocketMessageTypeByteNextStepsMessageRequest",
        "WebSocketMessageTypeByteNextStepsMessageResponse",
        "WebSocketMessageTypeByteNextOutputMessageRequest",
        "WebSocketMessageTypeByteNextOutputMessageResponse",
        "WebSocketMessageTypeByteDebugRequest",
        "WebSocketMessageTypeByteDebugResponse",
        "WebsocketMessageTypeByteSuggestionRequest",
        "WebSocketMessageTypeByteSuggestionResponse",
    ][t];
}