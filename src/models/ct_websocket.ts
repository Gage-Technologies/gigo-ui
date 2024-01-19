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
    WebSocketMessageTypeByteAssistantMessage = 51
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
    code: string;
    byte_output: string;
    code_language: string;
}

export interface CtByteNextOutputResponse {
    assistant_id: string;
    success: string;
    explanation: string;
    premium_llm: boolean;
    free_credit_use: boolean;
}

export interface CtByteSuggestionRequest {
    byte_id: string;
    byte_description: string;
    code: string;
    assistant_id: string;
    code_language: string;
}

export interface CtByteSuggestionResponse {
    suggestion_id: string;
    token: string;
    complete_message: string;
    done: boolean;
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
