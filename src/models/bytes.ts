
export interface BytesLivePingRequest {
    byte_attempt_id: string;
}

export interface ByteUpdateCodeRequest {
    byte_attempt_id: string;
    content: string;
}

export interface AgentWsRequestMessage {
    byte_attempt_id: string;
    payload: ExecRequestPayload; // add "or lint" when lint is implemented
}

export interface ExecRequestPayload {
    lang: number;
    code: string;
}

export interface ExecResponsePayload {
    stdout:     OutputRow[];
    stderr:     OutputRow[];
    status_code: number;
    done:      boolean;
}

export interface OutputRow {
    timestamp: number;
    content:   string;
}
