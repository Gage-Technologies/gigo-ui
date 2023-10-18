export default interface Notification {
    _id: string;
    user_id: string;
    message: string;
    notification_type: number;
    created_at: string;
    interacting_user_id: null | string;
}

export const EmptyNotification = {
    _id: "",
    user_id: "",
    message: "",
    notification_type: 0,
    created_at: "",
    interacting_user_id: null
} as Notification;