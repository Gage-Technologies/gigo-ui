import React, { useEffect, useState, useRef } from "react";
import { Button, Tooltip, useTheme } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import StopIcon from '@mui/icons-material/Stop';
import { OutputRow } from "../models/bytes";

interface MergedOutputRow {
    error: boolean;
    content: string;
    timestamp: number;
}

interface OutputState {
    stdout: OutputRow[];
    stderr: OutputRow[];
    merged: string;
    mergedLines: MergedOutputRow[];
}

const ByteTerminal = ({ output, onClose, onStop, isRunning, onInputSubmit }: { output: OutputState, onClose: () => void, onStop: () => void, isRunning: boolean, onInputSubmit: (input: string) => void }) => {
    const [terminalContent, setTerminalContent] = useState<JSX.Element[]>([]);
    const inputRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    useEffect(() => {
        if (!output) return;
        const formattedOutput = output.mergedLines.map((line, index) => {
            const lineEndsInNewline = line.content.endsWith("\n");
            return (
                <span key={index} style={{ color: line.error ? "red" : theme.palette.text.primary }}>
                    {line.content}{lineEndsInNewline ? "" : " "}
                </span>
            );
        });
        setTerminalContent(formattedOutput);
    }, [output, theme.palette.text.primary]);

    const handleInputKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (inputRef.current) {
                const inputValue = inputRef.current.innerText;
                console.log("Input submitted:", inputValue);
                inputRef.current.innerText = "";
                if (onInputSubmit) {
                    onInputSubmit(inputValue); // Call the onInputSubmit function with the user input
                }
            }
        }
    };

    useEffect(() => {
        if (inputRef.current && isRunning) {
            inputRef.current.focus();
        }
    }, [isRunning, terminalContent]);

    const inputField = (
        <div
            ref={inputRef}
            contentEditable
            spellCheck={false}
            style={{
                minHeight: "20px",
                cursor: "text",
                caretColor: "white",
                display: "inline",
                backgroundColor: "#222",
                color: "white",
                padding: "2px 5px",
                borderRadius: "4px",
            }}
            onKeyPress={handleInputKeyPress}
        />
    );

    const lastLineRequiresInput = output && output.mergedLines.length > 0 && !output.mergedLines[output.mergedLines.length - 1].content.endsWith("\n");

    return (
        <div style={{
            backgroundColor: "#333",
            fontFamily: "monospace",
            fontSize: "0.9rem",
            padding: "10px",
            marginTop: "20px",
            borderRadius: "5px",
            whiteSpace: "pre-wrap",
            height: "200px",
            overflowY: 'auto',
            wordWrap: 'break-word',
            position: "relative"
        }}>
            <Tooltip title={isRunning ? "Stop Execution" : "Close Terminal"}>
                <Button
                    onClick={isRunning ? onStop : onClose}
                    style={{
                        position: "absolute",
                        right: "10px",
                        top: "10px",
                        color: "white",
                        backgroundColor: "transparent",
                        minWidth: 0,
                        padding: 0
                    }}
                >
                    {isRunning ? <StopIcon /> : <CloseIcon />}
                </Button>
            </Tooltip>
            <div style={{ outline: "none", color: theme.palette.text.primary }}>
                {terminalContent}
                {isRunning && lastLineRequiresInput ? inputField : null}
            </div>
            {isRunning && !lastLineRequiresInput ? inputField : null}
        </div>
    );
};

export default ByteTerminal;
