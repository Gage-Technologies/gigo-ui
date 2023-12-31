

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';

export interface TutorialState {
    all: boolean,
    home: boolean,
    challenge: boolean,
    workspace: boolean,
    nemesis: boolean,
    stats: boolean,
    create_project: boolean,
    launchpad: boolean,
    vscode: boolean,
}

export const DefaultTutorialState: TutorialState = {
    all: false,
    home: false,
    challenge: false,
    workspace: false,
    nemesis: false,
    stats: false,
    create_project: false,
    launchpad: false,
    vscode: false,
}

export interface AuthState {
    authenticated: boolean;
    token: string,
    id: string,
    userName: string,
    email: string,
    phone: string,
    role: string,
    tier: number,
    rank: number,
    coffee: number,
    expiration: number,
    thumbnail: string,
    backgroundColor: string,
    backgroundRenderInFront: boolean,
    backgroundName: string,
    exclusiveContent: boolean,
    exclusiveAgreement: boolean,
    tutorialState: TutorialState
}

export interface AuthStateUpdate {
    authenticated: boolean | null;
    token: string | null,
    id: string | null,
    role: string | null,
    tier: number | null,
    userName: string | null,
    email: string | null,
    phone: string | null,
    rank: number | null,
    coffee: number | null,
    expiration: number | null,
    thumbnail: string | null,
    backgroundColor: string | null,
    backgroundRenderInFront: boolean | null,
    backgroundName: string | null,
    exclusiveContent: boolean | null,
    exclusiveAgreement: boolean | null,
    tutorialState: TutorialState | null
}

export const initialAuthState: AuthState = {
    authenticated: false,
    token: "",
    id: "",
    role: "",
    userName: "",
    email: "",
    phone: "",
    tier: 0,
    rank: 0,
    coffee: 0,
    expiration: 0,
    thumbnail: "",
    backgroundColor: "",
    backgroundRenderInFront: false,
    backgroundName: "",
    exclusiveContent: false,
    exclusiveAgreement: false,
    tutorialState: {
        all: false,
        home: false,
        challenge: false,
        workspace: false,
        nemesis: false,
        stats: false,
        create_project: false,
        launchpad: false,
        vscode: false,
    }
};

export const initialAuthStateUpdate: AuthStateUpdate = {
    authenticated: null,
    token: null,
    id: null,
    role: null,
    userName: null,
    email: null,
    phone: null,
    tier: null,
    rank: null,
    coffee: null,
    expiration: null,
    thumbnail: null,
    backgroundColor: null,
    backgroundRenderInFront: null,
    backgroundName: null,
    exclusiveContent: null,
    exclusiveAgreement: null,
    tutorialState: null
};

export const authSlice = createSlice({
    name: 'auth',
    initialState: initialAuthState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        updateAuthState: (state, update: PayloadAction<AuthStateUpdate>) => {
            if (update.payload.authenticated !== null) {
                state.authenticated = update.payload.authenticated
            }

            if (update.payload.token !== null) {
                state.token = update.payload.token
            }

            if (update.payload.id !== null) {
                state.id = update.payload.id
            }

            if (update.payload.role !== null) {
                state.role = update.payload.role
            }

            if (update.payload.tier !== null) {
                state.tier = update.payload.tier
            }

            if (update.payload.rank !== null) {
                state.rank = update.payload.rank
            }

            if (update.payload.coffee !== null) {
                state.coffee = update.payload.coffee
            }

            if (update.payload.expiration !== null) {
                state.expiration = update.payload.expiration
            }

            if (update.payload.userName !== null){
                state.userName = update.payload.userName
            }

            if (update.payload.email!== null){
                state.email = update.payload.email
            }

            if (update.payload.phone!== null){
                state.phone = update.payload.phone
            }

            if (update.payload.thumbnail !== null){
                state.thumbnail = update.payload.thumbnail
            }
            if (update.payload.backgroundColor!== null){
                state.backgroundColor = update.payload.backgroundColor
            }

            if (update.payload.backgroundRenderInFront!== null){
                state.backgroundRenderInFront = update.payload.backgroundRenderInFront
            }

            if (update.payload.backgroundName!== null){
                state.backgroundName = update.payload.backgroundName
            }

            if (update.payload.exclusiveContent!== null){
                state.exclusiveContent = update.payload.exclusiveContent
            }
            if (update.payload.exclusiveAgreement!== null){
                state.exclusiveAgreement = update.payload.exclusiveAgreement
            }

            if (update.payload.tutorialState!== null){
                state.tutorialState = update.payload.tutorialState
            }

            if (update.payload.tutorialState!== null){
                state.tutorialState = update.payload.tutorialState
            }
        },
    }
});

export const {updateAuthState} = authSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectAuthState = (state: RootState) => state.auth;
export const selectAuthStateAuth = (state: RootState) => state.auth.authenticated;
export const selectAuthStateToken = (state: RootState) => state.auth.token;
export const selectAuthStateId = (state: RootState) => state.auth.id;
export const selectAuthStateRole = (state: RootState) => state.auth.role;
export const selectAuthStateTier = (state: RootState) => state.auth.tier;
export const selectAuthStateRank = (state: RootState) => state.auth.rank;
export const selectAuthStateCoffee = (state: RootState) => state.auth.coffee;
export const selectAuthStateExpiration = (state: RootState) => state.auth.expiration;
export const selectAuthStateUserName = (state: RootState) => state.auth.userName;
export const selectAuthStateEmail = (state: RootState) => state.auth.email;
export const selectAuthStatePhone = (state: RootState) => state.auth.phone;
export const selectAuthStateThumbnail = (state: RootState) => state.auth.thumbnail;
export const selectAuthStateColorPalette = (state: RootState) => state.auth.backgroundColor;
export const selectAuthStateRenderInFront = (state: RootState) => state.auth.backgroundRenderInFront;
export const selectAuthStateBackgroundName = (state: RootState) => state.auth.backgroundName;
export const selectAuthStateExclusiveContent = (state: RootState) => state.auth.exclusiveContent
export const selectAuthStateExclusiveAgreement = (state: RootState) => state.auth.exclusiveAgreement
export const selectAuthStateTutorialState = (state: RootState) => state.auth.tutorialState

export default authSlice.reducer;
