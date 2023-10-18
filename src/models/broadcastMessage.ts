export default interface BroadcastMessage {
    _id: string;
    user_id: string;
    user_name: string;
    message: string;
    time_stamp: string;
}

export const EmptyBroadcastMessage = {
    _id: "",
    user_id: "",
    user_name: "",
    message: "",
    time_stamp: ""
} as BroadcastMessage;