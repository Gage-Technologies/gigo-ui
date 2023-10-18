

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
import Post from "../../models/post";
import {DefaultWorkspaceConfig, WorkspaceConfig} from "../../models/workspace";

export interface JourneyFormState {
    section: number;
    learningGoal: string;
    languageInterest: string;
    endGoal: string;
    experienceLevel: string;
    familiarityIDE: string;
    familiarityLinux: string;
    triedProgramming: string;
    triedProgrammingOnline: string;
}

export interface JourneyFormStateUpdate {
    section: number;
    learningGoal: string | '';
    languageInterest: string | '';
    endGoal: string | '';
    experienceLevel: string | '';
    familiarityIDE: string | '';
    familiarityLinux: string | '';
    triedProgramming: string | '';
    triedProgrammingOnline: string | '';
}

export const initialJourneyFormState: JourneyFormState = {
    section: 0,
    learningGoal: '',
    languageInterest: '',
    endGoal: '',
    experienceLevel: '',
    familiarityIDE: '',
    familiarityLinux: '',
    triedProgramming: '',
    triedProgrammingOnline: '',
};

export const initialJourneyFormStateUpdate: JourneyFormStateUpdate = {
    section: 0,
    learningGoal: '',
    languageInterest: '',
    endGoal: '',
    experienceLevel: '',
    familiarityIDE: '',
    familiarityLinux: '',
    triedProgramming: '',
    triedProgrammingOnline: '',
};

export const journeyFormSlice = createSlice({
    name: 'journeyForm',
    initialState: initialJourneyFormState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        clearJourneyFormState: (state) => {
            state.section = 0
            state.learningGoal = ''
            state.languageInterest = ''
            state.endGoal = ''
            state.experienceLevel = ''
            state.familiarityIDE = ''
            state.familiarityLinux = ''
            state.triedProgramming = ''
            state.triedProgrammingOnline = ''
        },
        updateJourneyFormState: (state, update: PayloadAction<JourneyFormStateUpdate>) => {
            if (update.payload.section!== state.section) {
                state.section = update.payload.section
            }

            if (update.payload.learningGoal !== '') {
                state.learningGoal = update.payload.learningGoal
            }

            if (update.payload.languageInterest !== '') {
                state.languageInterest = update.payload.languageInterest
            }

            if (update.payload.endGoal !== '') {
                state.endGoal = update.payload.endGoal
            }

            if (update.payload.experienceLevel !== '') {
                state.experienceLevel = update.payload.experienceLevel
            }

            if (update.payload.familiarityIDE !== '') {
                state.familiarityIDE = update.payload.familiarityIDE
            }

            if (update.payload.familiarityLinux !== '') {
                state.familiarityLinux = update.payload.familiarityLinux
            }

            if (update.payload.triedProgramming !== '') {
                state.triedProgramming = update.payload.triedProgramming
            }

            if (update.payload.triedProgrammingOnline !== '') {
                state.triedProgrammingOnline = update.payload.triedProgrammingOnline
            }
        },
    }
});

export const {updateJourneyFormState, clearJourneyFormState} = journeyFormSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`

export const selectSection = (state: RootState) => state.journeyForm.section

export const selectLearningGoal = (state: RootState) => state.journeyForm.learningGoal;
export const selectLanguageInterest = (state: RootState) => state.journeyForm.languageInterest;
export const selectEndGoal = (state: RootState) => state.journeyForm.endGoal;
export const selectExperienceLevel = (state: RootState) => state.journeyForm.experienceLevel;
export const selectFamiliarityIDE = (state: RootState) => state.journeyForm.familiarityIDE;
export const selectFamiliarityLinux = (state: RootState) => state.journeyForm.familiarityLinux;
export const selectTriedProgramming = (state: RootState) => state.journeyForm.triedProgramming;
export const selectTriedProgrammingOnline = (state: RootState) => state.journeyForm.triedProgrammingOnline;
export default journeyFormSlice.reducer;
