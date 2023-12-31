import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import config from "../config";
import * as models from "../models/websocket";
import useWebSocket from "react-use-websocket";

interface WebSocketContextProps {
    sendWebsocketMessage: (msg: models.WsMessage<any>, callback: WebSocketResponseCallback | null) => Promise<void>;
    registerCallback: (type: models.WsMessageType, key: string, callback: WebSocketResponseCallback) => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const useGlobalWebSocket = (): WebSocketContextProps => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useGlobalWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: ReactNode;
}

interface WebSocketResponseCallback {
    (message: models.WsMessage<any>): void;
}

interface CallbackEntry {
    callback: WebSocketResponseCallback;
    key: string;
    expiration: number;
}

interface CallbackMap {
    [key: string]: CallbackEntry;
}

type GlobalCallbackMap = {
    [key in models.WsMessageType]: CallbackEntry[];
};

class Mutex {
    private mutex = Promise.resolve();

    lock(): PromiseLike<() => void> {
        let begin: (unlock: () => void) => void = unlock => {};

        this.mutex = this.mutex.then(() => {
            return new Promise(begin);
        });

        return new Promise(res => {
            begin = res;
        });
    }

    async dispatch<T>(fn: (() => T) | (() => PromiseLike<T>)): Promise<T> {
        const unlock = await this.lock();
        try {
            return await Promise.resolve(fn());
        } finally {
            unlock();
        }
    }
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    // create map to hold callbacks
    let messageCallbacks = React.useRef<CallbackMap>({});
    let globalCallbacks = React.useRef<GlobalCallbackMap>({} as GlobalCallbackMap);

    // create mutex for callbacks
    let mutex = new Mutex();


    // create routine to clean up callbacks that have timed out
    useEffect(() => {
        const interval = setInterval(() => {
            mutex.dispatch(() => {
                let now = new Date().getTime();
                let c = messageCallbacks.current;
                Object.keys(c).forEach((key) => {
                    if (c[key].expiration < now) {
                        delete c[key];
                    }
                });
                messageCallbacks.current = c;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [])

    // establish websocket connection
    let websocketRoot = config.rootPath.replace("https://", "wss://").replace("http://", "ws://");
    const { sendMessage } = useWebSocket(
        `${websocketRoot}/api/ws`, {
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: (closeEvent) => true,
            onClose: () => console.log("global socket closed"),
            onError: (error) => console.log("global socket error: ", error),
            onOpen: (event: WebSocketEventMap['open']) => console.log("global socket open"),
            onMessage: (event: WebSocketEventMap['message']) => {
                // skip if this is a ping
                if (event.data === "ping") {
                    return;
                }

                let msg: models.WsMessage<any> = JSON.parse(event.data);

                // check if this is a response to a message we sent
                mutex.dispatch(() => {
                    let c = messageCallbacks.current;
                    if (c[msg.sequence_id]) {
                        // call the callback and delete it from the map
                        c[msg.sequence_id].callback(msg);
                        delete c[msg.sequence_id];
                        messageCallbacks.current = c;
                    }
                });

                // call any global callbacks
                mutex.dispatch(() => {
                    let gc = globalCallbacks.current;
                    if (gc[msg.type]) {
                        gc[msg.type].forEach((callback) => {
                            callback.callback(msg);
                        });
                    }
                });
            },
        });

    const sendWebsocketMessage = async (msg: models.WsMessage<any>, callback: WebSocketResponseCallback | null = null) => {
        // generate a random alphanumeric id
        msg.sequence_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        // add callback to callback map
        if (callback) {
            await mutex.dispatch(() => {
                let c = messageCallbacks.current;
                c[msg.sequence_id] = {
                    callback: callback,
                    key: msg.sequence_id,
                    // we set the timeout to 5m since these shouldn't take that long
                    expiration: new Date().getTime() + 60 * 5 * 1000,
                };
                messageCallbacks.current = c;
            });
        }
        sendMessage(JSON.stringify(msg));
    };

    const registerCallback = async (type: models.WsMessageType, key: string, callback: WebSocketResponseCallback) => {
        // add callback to global callback map
        await mutex.dispatch(() => {
            let gc = globalCallbacks.current;
            if (!gc[type]) {
                gc[type] = [];
            }

            // overwrite any existing callback with the same key
            gc[type] = gc[type].filter((entry) => entry.key !== key);

            gc[type].push({
                callback: callback,
                key: key,
                // we set the timeout to the max value since these shouldn't expire
                expiration: Number.MAX_SAFE_INTEGER,
            });
            globalCallbacks.current = gc;
        });
    }

    const value = {
        sendWebsocketMessage,
        registerCallback,
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
