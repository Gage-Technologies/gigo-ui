export enum CtMessageType {
    WebSocketMessageTypeCompletionRequest = 25,
    WebSocketMessageTypeCompletionResponse = 26,
    WebSocketMessageTypeParseFileRequest = 27,
    WebSocketMessageTypeParseFileResponse = 28,
    WebSocketMessageTypeUserStatusRequest = 36,
    WebSocketMessageTypeUserStatusResponse = 37,
    WebSocketMessageTypeNewByteChatOrGetRequest = 38,
    WebSocketMessageTypeNewByteChatOrGetResponse = 39,
    WebSocketMessageTypeGetByteChatMessageRequest = 40,
    WebSocketMessageTypeGetByteChatMessageResponse = 41,
    WebSocketMessageTypeByteNextStepsMessageRequest = 42,
    WebSocketMessageTypeByteNextStepsMessageResponse = 43,
    WebSocketMessageTypeByteNextOutputMessageRequest = 44,
    WebSocketMessageTypeByteNextOutputMessageResponse = 45,
    WebSocketMessageTypeByteDebugRequest = 46,
    WebSocketMessageTypeByteDebugResponse = 47,
    WebSocketMessageTypeByteSuggestionRequest = 48,
    WebSocketMessageTypeByteSuggestionResponse = 49,
    WebSocketMessageTypeByteUserMessage = 50,
    WebSocketMessageTypeByteAssistantMessage = 51,
    WebSocketMessageTypeCloseByteChatThreadRequest = 52,
    WebSocketMessageTypeCloseByteChatThreadResponse = 53,
    WebSocketMessageTypeSemanticRankRequest = 54,
    WebSocketMessageTypeSemanticRankResponse = 55,
    WebSocketMessageTypeNewHHChatRequest = 56,
    WebSocketMessageTypeNewHHChatResponse = 57,
    WebSocketMessageTypeGetHHChatNameRequest = 58,
    WebSocketMessageTypeGetHHChatNameResponse = 59,
    WebSocketMessageTypeGetHHChatsRequest = 60,
    WebSocketMessageTypeGetHHChatsResponse = 61,
    WebSocketMessageTypeGetHHChatMessagesRequest = 62,
    WebSocketMessageTypeGetHHChatMessagesResponse = 63,
    WebSocketMessageTypeDeleteHHChatRequest = 64,
    WebSocketMessageTypeDeleteHHChatResponse = 65,
    WebSocketMessageTypeUserHHChatMessage = 66,
    WebSocketMessageTypeAssistantHHChatMessage = 67,
}

export enum CtChatMessageType {
    User,
    Assistant,
    CommandRequest,
    CommandResponse,
    CodeExecutionResult
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

export enum CtByteMessageMessageType {
    User,
    Assistant,
}

export interface CtMessage<T> {
    sequence_id: string;
    type: CtMessageType;
    origin: CtMessageOrigin;
    created_at: number;
    payload: T;
}

export interface CtByteNextStepsRequest {
    byte_id: string;
    byte_description: string;
    byte_development_steps: string;
    code_language: string;
    code_prefix: string;
    code_suffix: string;
}

export interface CtByteNextStepsResponse {
    _id: string;
    assistant_id: string;
    token: string;
    complete_message: string;
    done: boolean;
    premium_llm: boolean;
    free_credit_use: boolean;
}

export interface CtByteNextOutputRequest {
    byte_id: string;
    byte_description: string;
    byte_development_steps: string;
    code: CtCodeFile[];
    byte_output: string;
}

export interface CtByteNextOutputResponse {
    assistant_id: string;
    success: boolean;
    explanation: string;
    premium_llm: boolean;
    free_credit_use: boolean;
}

export interface CtByteSuggestionRequest {
    byte_id: string;
    byte_description: string;
    byte_development_steps: string;
    code_prefix: string;
    code: string;
    code_suffix: string;
    assistant_id: string;
    code_language: string;
}

export interface CtByteSuggestionResponse {
    suggestion_id: string;
    token: string;
    code_section: string;
    suggestion: string;
    done: boolean;
    premium_llm: boolean;
    free_credit_use: boolean;
}

export interface CtByteNewOrGetChatRequest {
    assistant_id: string;
    byte_id: string;
    owner_id: string;
}

export interface CtByteNewOrGetChatResponse {
    _id: string;
    assistant_id: string;
    byte_id: string;
    owner_id: string;
    last_message_at: string;
    message_count: number;
    thread_count: number;
    user_message_count: number;
    assistant_message_count: number;
    created_at: string;
}

export interface CtByteUserMessage {
    byte_id: string;
    user_message: string;
    code: CtCodeFile[];
    byte_description: string;
    difficulty: string;
    byte_development_steps: string;
}

export interface CtByteAssistantMessage {
    user_message_id: string;
    assistant_message_id: string;
    token: string;
    complete_message: string;
    done: boolean;
    premium_llm: boolean;
    free_credit_use: boolean;
}

export interface CtByteChatMessagesRequest {
    byte_id: string;
    offset: number;
    limit: number;
}

export interface CtByteChatMessagesResponse {
    messages: CtByteChatMessage[];
    total_messages: number;
    total_threads: number;
    remaining: number;
    returned: number;
}

export interface CtByteChatMessage {
    _id: string;
    byte_id: string;
    byte_chat_id: string;
    assistant_id: string;
    user_id: string;
    thread_number: number;
    message_type: CtByteMessageMessageType;
    content: string;
    created_at: Date;
    message_number: number;
    premium_llm: boolean;
    free_credit_use: boolean;
}

export interface ContentLocation {
    start_line: number;
    end_line: number;
    start_column: number;
    end_column: number;
}

export interface Node {
    id: string;
    name: string;
    type: number;
    language: number;
    position: ContentLocation;
    content: string;
}

export interface CtParseFileRequest {
    relative_path: string;
    content: string;
}

export interface CtParseFileResponse {
    relative_path: string;
    nodes: Node[];
}

export interface CtCloseByteChatThreadRequest {
    _id: string;
}

export interface CtCloseByteChatThreadResponse {
    success: boolean;
}

export interface CtSemanticRankRequest {
    query: string;
    content: string[];
}

export interface CtSemanticScores {
    [key: string]: number;
}

export interface CtSemanticRankResponse {
    scores: CtSemanticScores,
    ranks: string[]
}

export interface CtNewHhChatRequest {
    partition: string;
}

export interface CtNewHhChatResponse {
    chat_id: string;
    assistant_id: string;
    assistant_name: string;
    user_id: string;
}

export interface CtHhUserMessage {
    chat_id: string;
    user_message: string;
    files: CtCodeFile[];
    code_exec_result: boolean;
}

export interface CtExecCommand {
    command: string;
    lang: string;
}

export interface CtCodeFile {
    file_name: string;
    code: string;
}

export interface CtHHAssistantMessage {
    user_message_id: string;
    assistant_message_id: string;
    token: string;
    complete_message: string;
    files: CtCodeFile[];
    active_file: string;
    message_type: CtChatMessageType;
    command: CtExecCommand;
    done: boolean;
    premium_llm: boolean;
    free_credit_use: boolean;
}

export interface GetHHChatNameRequest {
    chat_id: string;
}

export interface GetHHChatNameResponse {
    success: boolean;
    name: string;
}

export interface CtGetHHChatsRequest {
    partition: string;
    offset: number;
    limit: number;
}

export interface CtGetHHChatsResponse {
    chats: CtGetHHChatsResponseChat[];
    total: number;
    remaining: number;
    returned: number;
}

export interface CtGetHHChatsResponseChat {
    _id: string;
    assistant_id: string;
    assistant_name: string;
    owner_id: string;
    last_message_at: string;
    name: string;
    message_count: number;
    user_message_count: number;
    assistant_message_count: number;
    created_at: string;
    repo_id: string;
    partition: string;
}

export interface CtGetHHChatMessagesRequest {
    chat_id: string;
}

export interface CtGetHHChatMessagesResponse {
    messages: CtGetHHChatMessagesResponseMessage[];
    total: number;
    last_message_at: Date;
}

export interface CtGetHHChatMessagesResponseMessage {
    _id: string;
    chat_id: string;
    assistant_id: string;
    assistant_name: string;
    user_id: string;
    message_type: CtChatMessageType;
    content: string;
    files: CtCodeFile[];
    created_at: Date;
    message_number: number;
    command: CtExecCommand;
    premium_llm: boolean;
    free_credit_use: boolean;
}

export interface CtDeleteHHChatRequest {
    chatID: string;
}

export interface CtDeleteHHChatResponse {
    success: boolean;
}

export enum SymbolType {
    SymbolTypeUnknown,
    SymbolTypeFunction,
    SymbolTypeStruct,
    SymbolTypeInterface,
    SymbolTypeVariable,
    SymbolTypeConstant,
    SymbolTypeType,
    SymbolTypePackage,
    SymbolTypeImport,
    SymbolTypeField,
    SymbolTypeMethod,
    SymbolTypeConstructor,
    SymbolTypeEnum,
    SymbolTypeEnumValue,
    SymbolTypeProperty,
    SymbolTypeParameter,
    SymbolTypeLabel,
    SymbolTypeClass,
    SymbolTypeAnnotation,
    SymbolTypeImplementation,
    SymbolTypeChunk,
    SymbolTypeNamespace,
    SymbolTypeTemplate,
    SymbolTypeComponent,
    SymbolTypeHook,
    SymbolTypeAttribute,
}
