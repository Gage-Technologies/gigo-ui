

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
import User from "../../models/user";
import Post from "../../models/post";

export interface AppWrapperState {
    sidebarOpen: boolean,
    chatOpen: boolean
}

export interface AppWrapperStateUpdate {
    sidebarOpen: boolean | null,
    chatOpen: boolean | null
}

export const initialAppWrapperState: AppWrapperState = {
    sidebarOpen: false,
    chatOpen: false
}

export const initialAppWrapperStateUpdate: AppWrapperStateUpdate = {
    sidebarOpen: false,
    chatOpen: false
}

export const appWrapperSlice = createSlice({
    name: 'appWrapper',
    initialState: initialAppWrapperState,
    reducers: {
        resetAppWrapper: (state) => {
            state.sidebarOpen = false
            state.chatOpen = false
        },
        updateAppWrapper: (state, update: PayloadAction<AppWrapperStateUpdate>) => {
            if (update.payload.sidebarOpen !== null) {
                state.sidebarOpen = update.payload.sidebarOpen
            }
            if (update.payload.chatOpen !== null) {
                state.chatOpen = update.payload.chatOpen
            }
        },
    }
});

export const {resetAppWrapper, updateAppWrapper} = appWrapperSlice.actions;

export const selectAppWrapperSidebarOpen = (state: RootState) => state.appWrapper.sidebarOpen;
export const selectAppWrapperChatOpen = (state: RootState) => state.appWrapper.chatOpen;

export default appWrapperSlice.reducer;

