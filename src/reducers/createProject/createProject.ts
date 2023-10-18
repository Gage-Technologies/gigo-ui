

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
import Post from "../../models/post";
import {DefaultWorkspaceConfig, WorkspaceConfig} from "../../models/workspace";

export interface CreateProjectState {
    active: boolean;
    name: string;
    description: string;
    languages: Array<number>;
    challengeType: number;
    tier: number;
    tags: Array<object>;
    section: number;
    project: Post | null;
    workspaceConfig: WorkspaceConfig | null;
    customWorkspaceConfigContent: WorkspaceConfig;
    createWorkspaceConfig: boolean;
    evaluation: string | null;
    price: number | null;
    exclusiveDescription: string | null;
    visibility: boolean;
}

export interface CreateProjectStateUpdate {
    active: boolean | null;
    name: string | null;
    description: string | null;
    languages: Array<number> | null;
    challengeType: number | null;
    tier: number | null;
    tags: Array<object> | null;
    thumbnail: File | null;
    section: number | null;
    project: Post | null;
    workspaceConfig: WorkspaceConfig | null;
    customWorkspaceConfigContent: WorkspaceConfig | null;
    createWorkspaceConfig: boolean | null;
    evaluation: string | null;
    price: number | null;
    exclusiveDescription: string | null;
    visibility: boolean | null;
}

export const initialCreateProjectState: CreateProjectState = {
    active: false,
    name: "",
    description: "",
    languages: [],
    challengeType: 0,
    tier: 0,
    tags: [],
    section: 0,
    project: null,
    workspaceConfig: null,
    customWorkspaceConfigContent: {
        _id: "-1",
        title: "Custom",
        content: DefaultWorkspaceConfig,
    } as WorkspaceConfig,
    createWorkspaceConfig: false,
    evaluation: null,
    price: null,
    exclusiveDescription: null,
    visibility: false
};

export const initialCreateProjectStateUpdate: CreateProjectStateUpdate = {
    active: null,
    name: null,
    description: null,
    languages: null,
    challengeType: null,
    tier: null,
    tags: null,
    thumbnail: null,
    section: 0,
    project: null,
    workspaceConfig: null,
    customWorkspaceConfigContent: null,
    createWorkspaceConfig: null,
    evaluation: null,
    price: null,
    exclusiveDescription: null,
    visibility: null
};

export const createProjectSlice = createSlice({
    name: 'createProject',
    initialState: initialCreateProjectState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        clearProjectState: (state) => {
            state.active = false
            state.name = ""
            state.languages = []
            state.challengeType = 0
            state.tier = 0
            state.tags = []
            state.section = 0
            state.workspaceConfig = null
            state.customWorkspaceConfigContent = {
                _id: "-1",
                title: "Custom",
                content: DefaultWorkspaceConfig,
            } as WorkspaceConfig
            state.createWorkspaceConfig = false
            state.evaluation = null
            state.price = null
            state.exclusiveDescription = null
            state.visibility = false
        },
        updateCreateProjectState: (state, update: PayloadAction<CreateProjectStateUpdate>) => {
            if (update.payload.active !== null) {
                state.active = update.payload.active
            }

            if (update.payload.name !== null) {
                state.name = update.payload.name
            }

            if (update.payload.description !== null) {
                state.description = update.payload.description
            }

            if (update.payload.languages !== null) {
                state.languages = update.payload.languages
            }

            if (update.payload.challengeType !== null) {
                state.challengeType = update.payload.challengeType
            }

            if (update.payload.tier !== null) {
                state.tier = update.payload.tier
            }

            if (update.payload.tags !== null) {
                state.tags = update.payload.tags
            }

            if (update.payload.section !== null) {
                state.section = update.payload.section
            }

            if (update.payload.section !== null) {
                state.section = update.payload.section
            }

            if (update.payload.project !== null) {
                state.project = update.payload.project
            }

            if (update.payload.workspaceConfig!== null) {
                state.workspaceConfig = update.payload.workspaceConfig
            }

            if (update.payload.customWorkspaceConfigContent!== null) {
                state.customWorkspaceConfigContent = update.payload.customWorkspaceConfigContent
            }

            if (update.payload.createWorkspaceConfig!== null) {
                state.createWorkspaceConfig = update.payload.createWorkspaceConfig
            }

            if (update.payload.evaluation!== null) {
                state.evaluation = update.payload.evaluation
            }

            if (update.payload.price!== null) {
                state.price = update.payload.price
            }

            if (update.payload.exclusiveDescription!== null) {
                state.exclusiveDescription = update.payload.exclusiveDescription
            }

            if (update.payload.visibility!== null) {
                state.visibility = update.payload.visibility
            }
        },
    }
});

export const {updateCreateProjectState, clearProjectState} = createProjectSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectActiveState = (state: RootState) => state.createProject.active;
export const selectName = (state: RootState) => state.createProject.name;
export const selectDescription = (state: RootState) => state.createProject.description;
export const selectLanguage = (state: RootState) => state.createProject.languages;
export const selectChallengeType = (state: RootState) => state.createProject.challengeType
export const selectTier = (state: RootState) => state.createProject.tier;
export const selectTags = (state: RootState) => state.createProject.tags;
export const selectSection = (state: RootState) => state.createProject.section;
export const selectProject = (state: RootState) => state.createProject.project;
export const selectWorkspaceConfig = (state: RootState) => state.createProject.workspaceConfig
export const selectCustomWorkspaceConfigContent = (state: RootState) => state.createProject.customWorkspaceConfigContent
export const selectCreateWorkspaceConfig = (state: RootState) => state.createProject.createWorkspaceConfig
export const selectEvaluation = (state: RootState) => state.createProject.evaluation;
export const selectPrice = (state: RootState) => state.createProject.price;

export const selectExclusiveDescription = (state: RootState) => state.createProject.exclusiveDescription;

export const selectVisibility = (state: RootState) => state.createProject.visibility;

export default createProjectSlice.reducer;
