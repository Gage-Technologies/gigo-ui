import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";

export interface JourneyDetourState {
    id: number;
}

export interface JourneyDetourStateUpdate {
    id: number | null;
}

export const initialJourneyDetourState: JourneyDetourState = {
    id: 0,
};

export const initialJourneyDetourStateUpdate: JourneyDetourStateUpdate = {
    id: null,
};

export const journeySlice = createSlice({
    name: 'journeys',
    initialState: initialJourneyDetourState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        clearJourneyDetourState: (state) => {
            state.id = 0
        },
        updateJourneyDetourState: (state, update: PayloadAction<JourneyDetourStateUpdate>) => {

            if (update.payload.id !== null) {
                state.id = update.payload.id
            }
        },
    }
});

export const {updateJourneyDetourState, clearJourneyDetourState} = journeySlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectJourneyDetourState = (state: RootState) => state.journeyDetour;
export const selectJourneysId = (state: RootState) => state.journeyDetour.id;

export default journeySlice.reducer;
