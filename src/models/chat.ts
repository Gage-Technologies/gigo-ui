
export enum ChatWebSocketMessageType {
    ChatWebSocketMessageTypeNewIncomingMessage = 0,
    ChatWebSocketMessageTypeNewChat = 1,
    ChatWebSocketMessageTypeNewOutgoingMessage = 2,
    ChatWebSocketMessageTypeValidationError = 3,
    ChatWebSocketMessageTypeGenericError = 4,
}

export enum ChatWebSocketCode {
    ChatWebSocketCodeBadRequest = 0,
    ChatWebSocketCodeServerError = 1
}

export enum ChatMessageType {
    ChatMessageTypeInsecure = 0,
    ChatMessageTypeSecure = 1
}

export enum ChatType {
    ChatTypeGlobal = 0,
    ChatTypeRegional = 1,
    ChatTypePublicGroup = 2,
    ChatTypePrivateGroup = 3,
    ChatTypeDirectMessage = 4,
    ChatTypeChallenge = 5
}

export enum ChatUpdateEvent {
    ChatUpdateEventNameChange = 0,
    ChatUpdateEventUserAdd = 1,
    ChatUpdateEventUserRemove = 2,
    ChatUpdateEventDeleted = 3
}

export interface ChatWebSocketGenericErrorPayload {
    code: ChatWebSocketCode;
    error: string;
}

export interface ChatWebSocketValidationErrorPayload extends ChatWebSocketGenericErrorPayload {
    validation_errors: Record<string, string>;
}

export interface ChatMessage {
    _id: string;
    chat_id: string;
    author_id: string;
    author: string;
    author_renown: number;
    message: string;
    created_at: string;
    revision: number;
    type: ChatMessageType;
}

export interface ChatIconInfo {
    icon: string | null;
    background: string | null;
    background_render_in_front: boolean;
    background_palette: string | null;
    pro: boolean;
}

export interface Chat {
    _id: string;
    name: string;
    type: ChatType;
    users: string[];
    user_names: string[];
    last_message: string | null;
    last_message_time: string | null;
    icon: ChatIconInfo | null;
    last_read_message: string | null;
    muted: boolean;
}

export interface SendMessageParams {
    chat_id: string;
    content: string;
    message_type: ChatMessageType;
}

export interface NewChatParams {
    name: string;
    chat_type: ChatType;
    users: string[];
}

export interface EditChatParams {
    chat_id: string;
    name: string;
    add_users: string[];
    remove_users: string[];
}

export interface KickChatMessage {
    chat_id: string;
}

export interface GetChatsParams {
    offset: number;
    limit: number;
}

export interface GetChatsResponse {
    chats: Chat[];
}

export interface GetChatMessagesParams {
    chat_id: string;
    timestamp: Date;
    descending: boolean;
    limit: number;
}

export interface ChatSubscribeParams {
    chat_id: string;
    chat_type: ChatType;
}

export interface ChatSubscribeResponse {
    chat: Chat;
}

export interface ChatUnsubscribeParams {
    chat_id: string;
}

export interface ChatUnsubscribeResponse {
    chat_id: string;
}

export interface ChatUpdateEventMessage {
    chat: Chat;
    update_events: ChatUpdateEvent[];
    old_name: string;
    added_users: string[] | null;
    removed_users: string[] | null;
    updater: string;
    updater_icon: string;
    updater_background: string;
    updater_background_render_in_front: boolean;
    updater_background_palette: string;
    updater_pro: boolean;
}

export interface GetChatMessagesResponse {
    messages: ChatMessage[];
}
