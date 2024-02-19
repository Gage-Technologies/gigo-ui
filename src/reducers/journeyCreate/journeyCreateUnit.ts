import {DefaultWorkspaceConfig, WorkspaceConfig} from "../../models/workspace";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";

export interface JourneyCreateUnitState {
    title: string;
    unitFocus: number;
    languages: Array<number>;
    tags: Array<object>;
    tier: number;
    description: string;
    cost: string | null;
    workspaceConfig: WorkspaceConfig | null;
    customWorkspaceConfigContent: WorkspaceConfig;
    createWorkspaceConfig: boolean | null;
}

export interface JourneyCreateUnitStateUpdate {
    title: string | null;
    unitFocus: number | null;
    languages: Array<number> | null;
    tags: Array<object> | null;
    tier: number | null;
    description: string | null;
    cost: string | null;
    workspaceConfig: WorkspaceConfig | null;
    customWorkspaceConfigContent: WorkspaceConfig | null;
    createWorkspaceConfig: boolean | null;
}

export const initialJourneyCreateUnitState: JourneyCreateUnitState = {
    title: "",
    unitFocus: 0,
    languages: [],
    tags: [],
    tier: 0,
    description: "",
    cost: null,
    workspaceConfig: {
        _id: "0",
        title: "Default",
        content: DefaultWorkspaceConfig,
        description: "Default workspace configuration provided by GIGO."
    } as WorkspaceConfig,
    customWorkspaceConfigContent: {
        content: DefaultWorkspaceConfig,
    } as WorkspaceConfig,
    createWorkspaceConfig: false,
}

export const initialJourneyCreateUnitStateUpdate: JourneyCreateUnitStateUpdate = {
    title: null,
    unitFocus: null,
    languages: null,
    tags: null,
    tier: null,
    description: null,
    cost: null,
    workspaceConfig: null,
    customWorkspaceConfigContent: null,
    createWorkspaceConfig: null,
}

export const journeyCreateUnitSlice = createSlice({
    name: 'journeyCreateUnit',
    initialState: initialJourneyCreateUnitState,
    reducers: {
        clearJourneyCreateUnitState: (state) => {
            state.title = "";
            state.unitFocus = 0;
            state.languages = [];
            state.tags = [];
            state.tier = 0;
            state.description = "";
            state.cost = null;
            state.workspaceConfig = {
                _id: "0",
                title: "Default",
                content: DefaultWorkspaceConfig,
                description: "Default workspace configuration provided by GIGO."
            } as WorkspaceConfig;
            state.customWorkspaceConfigContent = {
                _id: "-1",
                title: "Custom",
                content: DefaultWorkspaceConfig,
            } as WorkspaceConfig;
            state.createWorkspaceConfig = false;
        },
        updateJourneyCreateUnitState: (state, update: PayloadAction<JourneyCreateUnitStateUpdate>) => {
            if (update.payload.title !== null) {
                state.title = update.payload.title
            }

            if (update.payload.unitFocus !== null) {
                state.unitFocus = update.payload.unitFocus
            }

            if (update.payload.languages !== null) {
                state.languages = update.payload.languages
            }

            if (update.payload.tags !== null) {
                state.tags = update.payload.tags
            }

            if (update.payload.tier !== null) {
                state.tier = update.payload.tier
            }

            if (update.payload.description !== null) {
                state.description = update.payload.description
            }

            if (update.payload.cost !== null) {
                state.cost = update.payload.cost
            }

            if (update.payload.workspaceConfig !== null) {
                state.workspaceConfig = update.payload.workspaceConfig
            }

            if (update.payload.customWorkspaceConfigContent !== null) {
                state.customWorkspaceConfigContent = update.payload.customWorkspaceConfigContent
            }

            if (update.payload.createWorkspaceConfig !== null) {
                state.createWorkspaceConfig = update.payload.createWorkspaceConfig
            }
        },
    }
})

export const {updateJourneyCreateUnitState, clearJourneyCreateUnitState} = journeyCreateUnitSlice.actions;

export const selectUnitTitle = (state: RootState) => state.journeyCreateUnit.title;
export const selectUnitFocus = (state: RootState) => state.journeyCreateUnit.unitFocus;
export const selectLanguages = (state: RootState) => state.journeyCreateUnit.languages;
export const selectUnitTags = (state: RootState) => state.journeyCreateUnit.tags;
export const selectTier = (state: RootState) => state.journeyCreateUnit.tier;
export const selectUnitDescription = (state: RootState) => state.journeyCreateUnit.description;
export const selectCost = (state: RootState) => state.journeyCreateUnit.cost;
export const selectWorkspaceConfig = (state: RootState) => state.journeyCreateUnit.workspaceConfig;
export const selectCustomWorkspaceConfigContent = (state: RootState) => state.journeyCreateUnit.customWorkspaceConfigContent;
export const selectCreateWorkspaceConfig = (state: RootState) => state.journeyCreateUnit.createWorkspaceConfig;

export default journeyCreateUnitSlice.reducer;
