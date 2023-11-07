export enum WebTrackingEvent {
    PageVisit = "pagevisit",
    PageExit = "pageexit",
    LoginStart = "loginstart",
    Login = "login",
    Logout = "logout",
    SignupStart = "signupstart",
    Signup = "signup",
    ResetPassword = "resetpassword",
}

export interface RecordWebUsage {
    host: string;
    event: WebTrackingEvent;
    timespent?: number | null;
    path: string;
    latitude?: number | null;
    longitude?: number | null;
    metadata?: object | null;
}
