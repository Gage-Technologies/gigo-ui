

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
import * as models from "../../models/chat";

export interface ChatState {
    selectedTab: string;
    selectedChat: models.Chat;
    privateChatView: boolean;
}

export interface ChatStateUpdate {
    selectedTab: string | null;
    selectedChat: models.Chat | null;
    privateChatView: boolean | null;
}

export const initialChatState: ChatState = {
    selectedTab: 'Global',
    selectedChat: {
        _id: "0",
        name: "Global",
        type: models.ChatType.ChatTypeGlobal,
        users: [],
        user_names: [],
        last_message: null,
        last_message_time: null,
        icon: null,
        last_read_message: null,
        muted: false,
    },
    privateChatView: false
};

export const initialChatStateUpdate: ChatStateUpdate = {
    selectedTab: null,
    selectedChat: null,
    privateChatView: null
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState: initialChatState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        updateChatState: (state, update: PayloadAction<ChatStateUpdate>) => {
            if (update.payload.selectedTab !== null) {
                state.selectedTab = update.payload.selectedTab
            }

            if (update.payload.privateChatView !== null) {
                state.privateChatView = update.payload.privateChatView
            }

            if (update.payload.selectedChat !== null) {
                state.selectedChat = update.payload.selectedChat
            }
        },
        clearChatState: (state) => {
            state.selectedTab = initialChatState.selectedTab;
            state.selectedChat = initialChatState.selectedChat;
            state.privateChatView = initialChatState.privateChatView;
        }
    }
});

export const {updateChatState, clearChatState} = chatSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectChatState = (state: RootState) => state.chat;
export const selectChatStateSelectedTab = (state: RootState) => state.chat.selectedTab;
export const selectChatStatePrivateChatView = (state: RootState) => state.chat.privateChatView;
export const selectChatStateSelectedChat = (state: RootState) => state.chat.selectedChat;

export default chatSlice.reducer;
