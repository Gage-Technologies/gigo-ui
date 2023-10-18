import {Action, configureStore, ThunkAction, getDefaultMiddleware} from '@reduxjs/toolkit';
import storage from "redux-persist/lib/storage"
import {combineReducers} from "redux";
import {persistReducer} from 'redux-persist'
import authReducer from '../reducers/auth/auth'
import createProjectReducer from '../reducers/createProject/createProject'
import searchParamsReducer from '../reducers/searchParams/searchParams'
import appWrapperReducer from '../reducers/appWrapper/appWrapper'
import journeyFormReducer from '../reducers/journeyForm/journeyForm'
import pageCacheReducer, {CacheItem} from '../reducers/pageCache/pageCache'
import chatMessageCacheReducer from '../reducers/chat/cache'
import chatReducer from '../reducers/chat/chat'

const persistConfig = {
    key: 'root',
    storage: storage,
    blacklist: ["createProject"]
};

const createProjectConfig = {
    key: 'createProject',
    storage: storage,
    blacklist: ["thumbnail"]
}

const reducers = combineReducers({
    auth: authReducer,
    createProject: persistReducer(createProjectConfig, createProjectReducer),
    searchParams: searchParamsReducer,
    appWrapper: appWrapperReducer,
    journeyForm: journeyFormReducer,
    pageCache: pageCacheReducer,
    chatMessageCache: chatMessageCacheReducer,
    chat: chatReducer
});

const persistedReducer = persistReducer(persistConfig, reducers)

const cacheMiddleware = (store: any) => (next: any) => (action: any) => {
    next(action);

    const cacheTimeout = 10 * 60 * 1000; // 10m

    // Cache invalidation logic
    setInterval(() => {
        const now = Date.now();
        const state = store.getState().pageCache as { [key: string]: CacheItem<any> };

        for (const [key, value] of Object.entries(state)) {
            if (value.timestamp && now - value.timestamp > cacheTimeout) {
                store.dispatch({ type: 'DELETE_CACHE', payload: { key } });
            }
        }
    }, cacheTimeout);
};

export const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: [cacheMiddleware], // Add cacheMiddleware
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
