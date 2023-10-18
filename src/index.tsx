

import 'typeface-poppins';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import Routing from "./routing";
import {BrowserRouter} from "react-router-dom";
import {Provider} from 'react-redux';
import {store} from './app/store';
import {PersistGate} from 'redux-persist/integration/react'
import {persistStore} from 'redux-persist'
import {GoogleOAuthProvider} from "@react-oauth/google";
import config from "./config";
import AppWrapper from "./components/AppWrapper";
import {Suspense} from "react";
import Lottie from "react-lottie";
import * as animationData from './img/loadingIcon.json'
import './components/scrollbar.css';
import { WebSocketProvider } from './services/websocket';
import {GoogleReCaptchaProvider} from "react-google-recaptcha-v3";

// create callback to register last activity in session storage
function setTimestamp() {
    sessionStorage.setItem('lastActivity', `${new Date().getTime()}`);
}

// create trackers for activity
window.addEventListener('load', setTimestamp);
window.addEventListener('click', setTimestamp);
window.addEventListener('scroll', setTimestamp);
window.addEventListener('keypress', setTimestamp);
window.addEventListener('focus', setTimestamp);
window.addEventListener('mousemove', setTimestamp);

const root = ReactDOM.createRoot(document.getElementById('root')!);

let persistor = persistStore(store);

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
};



root.render(
    <WebSocketProvider>

            <BrowserRouter>
                <GoogleOAuthProvider clientId={config.googleClient}>
                    <Provider store={store}>
                        <PersistGate loading={null} persistor={persistor}>
                            <AppWrapper>
                                <Suspense fallback={<div><Lottie options={defaultOptions} height={500} width={500}/></div>}>
                                    <Routing />
                                </Suspense>
                            </AppWrapper>
                        </PersistGate>
                    </Provider>
                </GoogleOAuthProvider>

            </BrowserRouter>
    </WebSocketProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
