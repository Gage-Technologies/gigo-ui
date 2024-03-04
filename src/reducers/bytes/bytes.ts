import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
import Post from "../../models/post";
import {DefaultWorkspaceConfig, WorkspaceConfig} from "../../models/workspace";

export interface BytesState {
    initialized: boolean;
    byteDifficulty: number;
    acceptedExplanationSuggestion: boolean;
    helpPopupClosedByUser: boolean;
}

export interface BytesStateUpdate {
    initialized: boolean | null;
    byteDifficulty: number | null;
    acceptedExplanationSuggestion: boolean | null;
}

export const initialBytesState: BytesState = {
    initialized: false,
    byteDifficulty: 0,
    acceptedExplanationSuggestion: true,
    helpPopupClosedByUser: true
};

export const initialBytesStateUpdate: BytesStateUpdate = {
    initialized: null,
    byteDifficulty: null,
    acceptedExplanationSuggestion: null,
};

export const bytesSlice = createSlice({
    name: 'bytes',
    initialState: initialBytesState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        clearBytesState: (state) => {
            state.initialized = false
            state.byteDifficulty = 0
        },
        updateBytesState: (state, update: PayloadAction<BytesStateUpdate>) => {
            if (update.payload.initialized !== null) {
                state.initialized = update.payload.initialized
            }

            if (update.payload.byteDifficulty !== null) {
                state.byteDifficulty = update.payload.byteDifficulty
            }

            if (update.payload.acceptedExplanationSuggestion !== null) {
                state.acceptedExplanationSuggestion = update.payload.acceptedExplanationSuggestion
            }
        },
        setHelpPopupClosedByUser: (state, action: PayloadAction<boolean>) => {
            state.helpPopupClosedByUser = action.payload;
        },
    }
});

export const {updateBytesState, clearBytesState, setHelpPopupClosedByUser} = bytesSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectBytesState = (state: RootState) => state.bytes;
export const selectBytesInitialized = (state: RootState) => state.bytes.initialized;
export const selectBytesDifficulty = (state: RootState) => state.bytes.byteDifficulty;
export const selectBytesExplanationSuggestion = (state: RootState) => state.bytes.acceptedExplanationSuggestion;

export const selectHelpPopupClosedByUser = (state: RootState) => state.bytes.helpPopupClosedByUser;

export default bytesSlice.reducer;
