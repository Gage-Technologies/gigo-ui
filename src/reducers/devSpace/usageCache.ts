import {RootState} from '../../app/store';
import { Workspace } from '../../models/workspace';


export const SET_DEVSPACE_CACHE = 'SET_DEVSPACE_CACHE';
export const DELETE_DEVSPACE_CACHE = 'DELETE_DEVSPACE_CACHE';
export const CLEAR_DEVSPACE_CACHE = 'CLEAR_DEVSPACE_CACHE';

export interface DevSpaceCache {
    cpuUsage: number;
    cpuPercentage: number;
    cpuLimit: number;
    memoryUsage: number;
    memoryPercentage: number;
    memoryLimit: number;
    workspace?: Workspace;
    timestamp: number;
}

interface SetDevSpaceCacheAction<T> {
    type: typeof SET_DEVSPACE_CACHE;
    payload: {
        ws_id: string;
        usage: DevSpaceCache;
    };
}

interface DeleteDevSpaceCacheAction {
    type: typeof DELETE_DEVSPACE_CACHE;
    payload: {
        ws_id: string;
    };
}

interface ClearDevSpaceCacheAction {
    type: typeof CLEAR_DEVSPACE_CACHE;
}

export type CacheActionTypes = SetDevSpaceCacheAction<any> | DeleteDevSpaceCacheAction | ClearDevSpaceCacheAction;

export const setDevSpaceCache = <T>(ws_id: string, usage: DevSpaceCache): SetDevSpaceCacheAction<T> => ({
    type: SET_DEVSPACE_CACHE,
    payload: { ws_id, usage },
});

export const deleteDevSpaceCache = (ws_id: string): DeleteDevSpaceCacheAction => ({
    type: DELETE_DEVSPACE_CACHE,
    payload: { ws_id },
});

export const clearDevSpaceCache = (): ClearDevSpaceCacheAction => ({
    type: CLEAR_DEVSPACE_CACHE,
});

export interface DevSpaceCacheItem<T> {
    usage: DevSpaceCache;
}

interface DevSpaceCacheState {
    [key: string]: DevSpaceCacheItem<any>;
}

const initialState: DevSpaceCacheState = {};

const devSpaceCacheReducer = (state = initialState, action: CacheActionTypes): DevSpaceCacheState => {
    switch (action.type) {
        case SET_DEVSPACE_CACHE:
            return {
                ...state,
                [action.payload.ws_id]: {
                    usage: action.payload.usage,
                },
            };
        case DELETE_DEVSPACE_CACHE:
            const { [action.payload.ws_id]: _, ...rest } = state;
            return rest;
        case CLEAR_DEVSPACE_CACHE:
            return {};
        default:
            return state;
    }
};

export const selectDevSpaceCacheState = (state: RootState) => state.devSpaceCache;

export default devSpaceCacheReducer;