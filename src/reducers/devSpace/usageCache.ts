import {RootState} from '../../app/store';


export const SET_DEVSPACE_USAGE_CACHE = 'SET_DEVSPACE_USAGE_CACHE';
export const DELETE_DEVSPACE_USAGE_CACHE = 'DELETE_DEVSPACE_USAGE_CACHE';
export const CLEAR_DEVSPACE_USAGE_CACHE = 'CLEAR_DEVSPACE_USAGE_CACHE';

export interface DevSpaceUsageCache {
    cpuUsage: number;
    cpuPercentage: number;
    cpuLimit: number;
    memoryUsage: number;
    memoryPercentage: number;
    memoryLimit: number;
    timestamp: number;
}

interface SetDevSpaceUsageCacheAction<T> {
    type: typeof SET_DEVSPACE_USAGE_CACHE;
    payload: {
        ws_id: string;
        usage: DevSpaceUsageCache;
    };
}

interface DeleteDevSpaceUsageCacheAction {
    type: typeof DELETE_DEVSPACE_USAGE_CACHE;
    payload: {
        ws_id: string;
    };
}

interface ClearDevSpaceUsageCacheAction {
    type: typeof CLEAR_DEVSPACE_USAGE_CACHE;
}

export type CacheActionTypes = SetDevSpaceUsageCacheAction<any> | DeleteDevSpaceUsageCacheAction | ClearDevSpaceUsageCacheAction;

export const setDevSpaceUsageCache = <T>(ws_id: string, usage: DevSpaceUsageCache): SetDevSpaceUsageCacheAction<T> => ({
    type: SET_DEVSPACE_USAGE_CACHE,
    payload: { ws_id, usage },
});

export const deleteDevSpaceUsageCache = (ws_id: string): DeleteDevSpaceUsageCacheAction => ({
    type: DELETE_DEVSPACE_USAGE_CACHE,
    payload: { ws_id },
});

export const clearDevSpaceUsageCache = (): ClearDevSpaceUsageCacheAction => ({
    type: CLEAR_DEVSPACE_USAGE_CACHE,
});

export interface DevSpaceUsageCacheItem<T> {
    usage: DevSpaceUsageCache;
}

interface DevSpaceUsageCacheState {
    [key: string]: DevSpaceUsageCacheItem<any>;
}

const initialState: DevSpaceUsageCacheState = {};

const devSpaceUsageCacheReducer = (state = initialState, action: CacheActionTypes): DevSpaceUsageCacheState => {
    switch (action.type) {
        case SET_DEVSPACE_USAGE_CACHE:
            return {
                ...state,
                [action.payload.ws_id]: {
                    usage: action.payload.usage,
                },
            };
        case DELETE_DEVSPACE_USAGE_CACHE:
            const { [action.payload.ws_id]: _, ...rest } = state;
            return rest;
        case CLEAR_DEVSPACE_USAGE_CACHE:
            return {};
        default:
            return state;
    }
};

export const selectDevSpaceUsageCacheState = (state: RootState) => state.devSpaceUsageCache;

export default devSpaceUsageCacheReducer;