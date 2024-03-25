
export interface LaunchLspRequest {
    lang: number;
    content: string;
    file_name?: string;
}

export interface LaunchLspResponse {
    success: boolean;
}
