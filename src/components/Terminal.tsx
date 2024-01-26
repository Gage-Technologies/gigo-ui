import React, {useEffect, useState, useRef, CSSProperties} from "react";
import { Button, Tooltip, useTheme } from "@mui/material";
import StopIcon from '@mui/icons-material/Stop';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
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

    // Determine if the theme mode is light or dark
    const isLightMode = theme.palette.mode === 'light';

    // Adjust terminal styles based on the theme mode
    const terminalStyle: CSSProperties = {
        backgroundColor: isLightMode ? "#f4f5f4" : "#232a2f",
        color: isLightMode ? "black" : "white",
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
    };

    const inputStyle: CSSProperties = {
        minHeight: "20px",
        cursor: "text",
        caretColor: isLightMode ? "black" : "white",
        display: "inline",
        backgroundColor: isLightMode ? "#ddd" : "#222",
        color: isLightMode ? "black" : "white",
        padding: "2px 5px",
        borderRadius: "4px",
    };

    useEffect(() => {
        if (!output) return;
        const formattedOutput = output.mergedLines.flatMap((line, index) => {
            // Split the content by new line characters and render each line separately
            return line.content.split("\n").map((content, lineIndex) => (
                <div key={`line-${index}-${lineIndex}`} style={{ color: line.error ? "red" : theme.palette.text.primary }}>
                    {content}
                </div>
            ));
        });
        setTerminalContent(formattedOutput);
    }, [output, theme.palette.text.primary]);

    const handleInputKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (inputRef.current) {
                const inputValue = inputRef.current.innerText;

                setTerminalContent(prevContent => {
                    const updatedContent = [...prevContent];
                    if (updatedContent.length > 0) {
                        const lastLineIndex = updatedContent.length - 1;
                        updatedContent[lastLineIndex] = (
                            <span key={`line-${lastLineIndex}`} style={{ color: theme.palette.text.primary }}>
                                {updatedContent[lastLineIndex].props.children + inputValue}
                            </span>
                        );
                    }
                    updatedContent.push(
                        <span key={`newline-${Date.now()}`} style={{ color: theme.palette.text.primary }}>
                            {"\n"}
                        </span>
                    );
                    return updatedContent;
                });

                inputRef.current.innerText = "";

                if (onInputSubmit) {
                    onInputSubmit(inputValue);
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
            style={inputStyle}
            onKeyPress={handleInputKeyPress}
        />
    );

    const lastLineRequiresInput = output && output.mergedLines.length > 0 && !output.mergedLines[output.mergedLines.length - 1].content.endsWith("\n");

    return (
        <div style={terminalStyle}>
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
                    {isRunning ? <StopIcon style={{ color: "red" }} /> : <HighlightOffIcon style={{ color: "red" }}/>}
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