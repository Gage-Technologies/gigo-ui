import React, {ReactNode} from "react";
import config from "../config";
import useWebSocket from "react-use-websocket";
import {Agent} from "http";
import {useParams} from "react-router";
import {useAppSelector} from "../app/hooks";
import {selectAuthState, selectAuthStateId} from "../reducers/auth/auth";
import * as models from "../models/websocket";


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


class Mutex {
    private mutex = Promise.resolve();

    lock(): PromiseLike<() => void> {
        let begin: (unlock: () => void) => void = unlock => { };

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

interface AgentWebsocketProps {
    children: ReactNode;
}

//@ts-ignore
export const AgentWebsocket: React.FC<AgentWebsocketProps> = ({ children }) => {

    // create map to hold callbacks
    let messageCallbacks = React.useRef<CallbackMap>({});

    // create mutex for callbacks
    let mutex = new Mutex();


    // retrieve url params
    let {id} = useParams();
    const userId = useAppSelector(selectAuthStateId);


    let websocketRoot = config.rootPath.replace("https://", "wss://").replace("http://", "ws://");
    const {sendMessage, lastMessage, lastJsonMessage, readyState} = useWebSocket(
        `${websocketRoot}/api/agent/${userId}/${id}/ws`, {
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
            },
    });

    const sendWebsocketMessage = React.useCallback(async (msg: models.WsMessage<any>, callback: WebSocketResponseCallback | null = null) => {
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
    }, []);

    // const WrappedApp = React.useMemo(() => {
    //     const value = {
    //         sendWebsocketMessage,
    //     };
    //
    //     return (
    //         <WebSocketContext.Provider value={value}>
    //             {children}
    //         </WebSocketContext.Provider>
    //     )
    // }, [children, sendWebsocketMessage])
    //
    // return WrappedApp
}