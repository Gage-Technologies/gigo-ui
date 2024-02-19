import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";

export interface JourneyCreateProjectState {
    title: string;
    parentUnit: number;
    workingDirectory: string;
    language: string;
    dependencies: Array<number>;
    description: string;
    tags: Array<object>;
}

export interface JourneyCreateProjectStateUpdate {
    title: string | null;
    parentUnit: number | null;
    workingDirectory: string | null;
    language: string | null;
    dependencies: Array<number> | null
    description: string | null;
    tags: Array<object> | null;
}

export const initialJourneyCreateProjectState: JourneyCreateProjectState ={
    title: "",
    parentUnit: 0,
    workingDirectory: "",
    language: "",
    dependencies: [],
    description: "",
    tags: [],
}

export const initialJourneyCreateProjectStateUpdate: JourneyCreateProjectStateUpdate = {
    title: null,
    parentUnit: null,
    workingDirectory: null,
    language: null,
    dependencies: null,
    description: null,
    tags: null,
}

export const journeyCreateProjectSlice = createSlice({
    name: "journeyCreateProject",
    initialState: initialJourneyCreateProjectState,
    reducers: {
        clearJourneyCreateProjectState: (state) => {
            state.title = "";
            state.parentUnit = 0;
            state.workingDirectory = "";
            state.language = "";
            state.dependencies = [];
            state.description = "";
            state.tags = [];
        },
        updateJourneyCreateProjectState: (state, update: PayloadAction<JourneyCreateProjectStateUpdate>) => {
            if (update.payload.title!== null) {
                state.title = update.payload.title
            }

            if (update.payload.parentUnit!== null) {
                state.parentUnit = update.payload.parentUnit
            }

            if (update.payload.workingDirectory!== null) {
                state.workingDirectory = update.payload.workingDirectory
            }

            if (update.payload.language!== null) {
                state.language = update.payload.language
            }

            if (update.payload.dependencies!== null) {
                state.dependencies = update.payload.dependencies
            }

            if (update.payload.description!== null) {
                state.description = update.payload.description
            }

            if (update.payload.tags!== null) {
                state.tags = update.payload.tags
            }
        },
    }
})

export const {updateJourneyCreateProjectState, clearJourneyCreateProjectState} = journeyCreateProjectSlice.actions;

export const selectProjectTitle = (state: RootState) => state.journeyCreateProject.title;
export const selectParentUnit = (state: RootState) => state.journeyCreateProject.parentUnit;
export const selectWorkingDirectory = (state: RootState) => state.journeyCreateProject.workingDirectory;
export const selectLanguage = (state: RootState) => state.journeyCreateProject.language;
export const selectDependencies = (state: RootState) => state.journeyCreateProject.dependencies;
export const selectProjectDescription = (state: RootState) => state.journeyCreateProject.description;
export const selectProjectTags = (state: RootState) => state.journeyCreateProject.tags;

export default journeyCreateProjectSlice.reducer;