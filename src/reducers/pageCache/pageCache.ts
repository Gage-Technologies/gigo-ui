import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';

export const SET_CACHE = 'SET_CACHE';
export const DELETE_CACHE = 'DELETE_CACHE';
export const CLEAR_CACHE = 'CLEAR_CACHE';

interface SetCacheAction<T> {
    type: typeof SET_CACHE;
    payload: {
        key: string;
        data: T;
    };
}

interface DeleteCacheAction {
    type: typeof DELETE_CACHE;
    payload: {
        key: string;
    };
}

interface ClearCacheAction {
    type: typeof CLEAR_CACHE;
}

export type CacheActionTypes = SetCacheAction<any> | DeleteCacheAction | ClearCacheAction;

export const setCache = <T>(key: string, data: T): SetCacheAction<T> => ({
    type: SET_CACHE,
    payload: { key, data },
});

export const deleteCache = (key: string): DeleteCacheAction => ({
    type: DELETE_CACHE,
    payload: { key },
});

export const clearCache = (): ClearCacheAction => ({
    type: CLEAR_CACHE,
});

export interface CacheItem<T> {
    timestamp: number;
    data: T;
}

interface CacheState {
    [key: string]: CacheItem<any>;
}

const initialState: CacheState = {};

const pageCacheReducer = (state = initialState, action: CacheActionTypes): CacheState => {
    switch (action.type) {
        case SET_CACHE:
            return {
                ...state,
                [action.payload.key]: {
                    timestamp: Date.now(),
                    data: action.payload.data,
                },
            };
        case DELETE_CACHE:
            const { [action.payload.key]: _, ...rest } = state;
            return rest;
        case CLEAR_CACHE:
            return {};
        default:
            return state;
    }
};

export const selectCacheState = (state: RootState) => state.pageCache;

export default pageCacheReducer;