

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { initialState } from '../../components/Stripe/StateContext/reducer';

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
    role: number,
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
    tutorialState: TutorialState,
    inTrial: boolean,
    hasPaymentInfo: boolean,
    hasSubscription: boolean,
    alreadyCancelled: boolean,
    lastRefresh: number | null,
    usedFreeTrial: boolean,
}

export interface AuthStateUpdate {
    authenticated: boolean | null;
    token: string | null,
    id: string | null,
    role: number | null,
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
    tutorialState: TutorialState | null,
    inTrial: boolean | null,
    hasPaymentInfo: boolean | null,
    hasSubscription: boolean | null,
    alreadyCancelled: boolean | null,
    lastRefresh: number | null,
    usedFreeTrial: boolean | null,
}

export const initialAuthState: AuthState = {
    authenticated: false,
    token: "",
    id: "",
    role: 0,
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
    },
    inTrial: false,
    hasPaymentInfo: false,
    hasSubscription: false,
    alreadyCancelled: false,
    lastRefresh: null,
    usedFreeTrial: false,
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
    tutorialState: null,
    inTrial: null,
    hasPaymentInfo: null,
    hasSubscription: null,
    alreadyCancelled: null,
    lastRefresh: null,
    usedFreeTrial: null,
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

            if (update.payload.userName !== null) {
                state.userName = update.payload.userName
            }

            if (update.payload.email !== null) {
                state.email = update.payload.email
            }

            if (update.payload.phone !== null) {
                state.phone = update.payload.phone
            }

            if (update.payload.thumbnail !== null) {
                state.thumbnail = update.payload.thumbnail
            }
            if (update.payload.backgroundColor !== null) {
                state.backgroundColor = update.payload.backgroundColor
            }

            if (update.payload.backgroundRenderInFront !== null) {
                state.backgroundRenderInFront = update.payload.backgroundRenderInFront
            }

            if (update.payload.backgroundName !== null) {
                state.backgroundName = update.payload.backgroundName
            }

            if (update.payload.exclusiveContent !== null) {
                state.exclusiveContent = update.payload.exclusiveContent
            }
            if (update.payload.exclusiveAgreement !== null) {
                state.exclusiveAgreement = update.payload.exclusiveAgreement
            }

            if (update.payload.tutorialState !== null) {
                state.tutorialState = update.payload.tutorialState
            }

            if (update.payload.tutorialState !== null) {
                state.tutorialState = update.payload.tutorialState
            }

            if (update.payload.inTrial !== null) {
                state.inTrial = update.payload.inTrial
            }

            if (update.payload.hasSubscription!== null) {
                state.hasSubscription = update.payload.hasSubscription
            }

            if (update.payload.hasPaymentInfo!== null) {
                state.hasPaymentInfo = update.payload.hasPaymentInfo
            }

            if (update.payload.alreadyCancelled!== null) {
                state.alreadyCancelled = update.payload.alreadyCancelled
            }

            if (update.payload.lastRefresh !== null) {
                state.lastRefresh = update.payload.lastRefresh
            }

            if (update.payload.usedFreeTrial !== null) {
                state.usedFreeTrial = update.payload.usedFreeTrial
            }
        },
    }
});

export const { updateAuthState } = authSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectAuthState = (state: RootState) => state.auth ? state.auth : initialAuthState;
export const selectAuthStateAuth = (state: RootState) => state.auth.authenticated ? state.auth.authenticated : initialAuthState.authenticated;
export const selectAuthStateToken = (state: RootState) => state.auth.token ? state.auth.token : initialAuthState.token;
export const selectAuthStateId = (state: RootState) => state.auth.id ? state.auth.id : initialAuthState.id;
export const selectAuthStateRole = (state: RootState) => state.auth.role ? state.auth.role : initialAuthState.role;
export const selectAuthStateTier = (state: RootState) => state.auth.tier ? state.auth.tier : initialAuthState.tier;
export const selectAuthStateRank = (state: RootState) => state.auth.rank ? state.auth.rank : initialAuthState.rank;
export const selectAuthStateCoffee = (state: RootState) => state.auth.coffee ? state.auth.coffee : initialAuthState.coffee;
export const selectAuthStateExpiration = (state: RootState) => state.auth.expiration ? state.auth.expiration : initialAuthState.expiration;
export const selectAuthStateUserName = (state: RootState) => state.auth.userName ? state.auth.userName : initialAuthState.userName;
export const selectAuthStateEmail = (state: RootState) => state.auth.email ? state.auth.email : initialAuthState.email;
export const selectAuthStatePhone = (state: RootState) => state.auth.phone ? state.auth.phone : initialAuthState.phone;
export const selectAuthStateThumbnail = (state: RootState) => state.auth.thumbnail ? state.auth.thumbnail : initialAuthState.thumbnail;
export const selectAuthStateColorPalette = (state: RootState) => state.auth.backgroundColor ? state.auth.backgroundColor : initialAuthState.backgroundColor;
export const selectAuthStateRenderInFront = (state: RootState) => state.auth.backgroundRenderInFront ? state.auth.backgroundRenderInFront : initialAuthState.backgroundRenderInFront;
export const selectAuthStateBackgroundName = (state: RootState) => state.auth.backgroundName ? state.auth.backgroundName : initialAuthState.backgroundName;
export const selectAuthStateExclusiveContent = (state: RootState) => state.auth.exclusiveContent ? state.auth.exclusiveContent : initialAuthState.exclusiveContent;
export const selectAuthStateExclusiveAgreement = (state: RootState) => state.auth.exclusiveAgreement ? state.auth.exclusiveAgreement : initialAuthState.exclusiveAgreement;
export const selectAuthStateTutorialState = (state: RootState) => state.auth.tutorialState ? state.auth.tutorialState : initialAuthState.tutorialState;
export const selectAuthStateInTrial = (state: RootState) => state.auth.inTrial? state.auth.inTrial : initialAuthState.inTrial;
export const selectAuthStateHasSubscription = (state: RootState) => state.auth.hasSubscription? state.auth.hasSubscription : initialAuthState.hasSubscription;
export const selectAuthStateHasPaymentInfo = (state: RootState) => state.auth.hasPaymentInfo? state.auth.hasPaymentInfo : initialAuthState.hasPaymentInfo;
export const selectAuthStateAlreadyCancelled = (state: RootState) => state.auth.alreadyCancelled? state.auth.alreadyCancelled : initialAuthState.alreadyCancelled;
export const selectAuthStateLastRefresh = (state: RootState) => state.auth.lastRefresh? state.auth.lastRefresh : initialAuthState.lastRefresh;
export const selectAuthStateUsedFreeTrail = (state: RootState) => state.auth.usedFreeTrial? state.auth.usedFreeTrial : initialAuthState.usedFreeTrial;

export default authSlice.reducer;
