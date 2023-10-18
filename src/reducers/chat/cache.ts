import {RootState} from '../../app/store';


export const SET_MESSAGE_CACHE = 'SET_MESSAGE_CACHE';
export const DELETE_MESSAGE_CACHE = 'DELETE_MESSAGE_CACHE';
export const CLEAR_MESSAGE_CACHE = 'CLEAR_MESSAGE_CACHE';

interface SetMessageCacheAction<T> {
    type: typeof SET_MESSAGE_CACHE;
    payload: {
        chat_id: string;
        message: string;
    };
}

interface DeleteMessageCacheAction {
    type: typeof DELETE_MESSAGE_CACHE;
    payload: {
        chat_id: string;
    };
}

interface ClearMessageCacheAction {
    type: typeof CLEAR_MESSAGE_CACHE;
}

export type CacheActionTypes = SetMessageCacheAction<any> | DeleteMessageCacheAction | ClearMessageCacheAction;

export const setMessageCache = <T>(chat_id: string, message: string): SetMessageCacheAction<T> => ({
    type: SET_MESSAGE_CACHE,
    payload: { chat_id, message },
});

export const deleteMessageCache = (chat_id: string): DeleteMessageCacheAction => ({
    type: DELETE_MESSAGE_CACHE,
    payload: { chat_id },
});

export const clearMessageCache = (): ClearMessageCacheAction => ({
    type: CLEAR_MESSAGE_CACHE,
});

export interface MessageCacheItem<T> {
    message: string;
}

interface MessageCacheState {
    [key: string]: MessageCacheItem<any>;
}

const initialState: MessageCacheState = {};

const chatMessageCacheReducer = (state = initialState, action: CacheActionTypes): MessageCacheState => {
    switch (action.type) {
        case SET_MESSAGE_CACHE:
            return {
                ...state,
                [action.payload.chat_id]: {
                    message: action.payload.message,
                },
            };
        case DELETE_MESSAGE_CACHE:
            const { [action.payload.chat_id]: _, ...rest } = state;
            return rest;
        case CLEAR_MESSAGE_CACHE:
            return {};
        default:
            return state;
    }
};

export const selectMessageCacheState = (state: RootState) => state.chatMessageCache;

export default chatMessageCacheReducer;