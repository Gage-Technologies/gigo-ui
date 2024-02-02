import React, { MutableRefObject, useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    createTheme,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    PaletteMode,
    Popper,
    PopperPlacementType,
    styled,
    Tooltip
} from "@mui/material";
import { getAllTokens, themeHelpers } from "../../theme";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import { Close } from "@material-ui/icons";
import { Typography } from "@material-ui/core";
import { Checklist } from "@mui/icons-material";
import { useGlobalCtWebSocket } from "../../services/ct_websocket";
import { CtByteSuggestionRequest, CtByteSuggestionResponse, CtGenericErrorPayload, CtMessage, CtMessageOrigin, CtMessageType, CtValidationErrorPayload } from "../../models/ct_websocket";
import ReactDOM from "react-dom";
import { CtPopupExtensionEngine } from "../IDE/Extensions/CtPopupExtension";
import  {ctHighlightCodeRangeFullLines, removeCtHighlightCodeRange} from "../../components/IDE/Extensions/CtHighlightExtension"
import { EditorView } from "@uiw/react-codemirror";
import { Extension, ReactCodeMirrorRef } from "@uiw/react-codemirror";

export type ByteSuggestionProps = {
    open: boolean;
    closeCallback: (startLine: any, endLine: any, newCode: string | null) => void;
    // anchorEl: null | HTMLElement; // Add this 
    lang: string;
    code: string;
    byteId: string;
    description: string;
    popupRef: MutableRefObject<CtPopupExtensionEngine | null>;
    codeMirrorRef: React.RefObject<ReactCodeMirrorRef>;
    apiCallback: (startLine: number, endLine: number) => void;
};

export default function ByteSuggestion(props: ByteSuggestionProps) {
    let userPref = localStorage.getItem("theme");
    const [mode, _] = useState<PaletteMode>(userPref === "light" ? "light" : "dark");
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [SuggestionPortal, setSuggestionPortal] = React.useState<React.ReactPortal | null>(null)

    // const [startSuggestionLine, setStartSuggestionLine] = React.useState<number | null>(null)
    // const [endSuggestionLine, setEndSuggestionLine] = React.useState<number | null>(null)

    const ctWs = useGlobalCtWebSocket();

    function findSubstringStartEndLines(codeSection: string): { startLine: number, endLine: number } {
        // Function to normalize spaces within each line of the code
        const normalizeSpaces = (input: string): string =>
            input.split('\n').map(line => line.trim().replace(/\s+/g, ' ')).join('\n');
    
        // Normalize the input code and code section
        const normalizedCode = normalizeSpaces(props.code);
        const normalizedCodeSection = normalizeSpaces(codeSection);
    
        const startIndex = normalizedCode.indexOf(normalizedCodeSection);
        if (startIndex === -1) {
            console.log("Substring not found");
            return { startLine: -1, endLine: -1 }; // Substring not found
        }
        const endIndex = startIndex + normalizedCodeSection.length;
    
        const lines = normalizedCode.split("\n");
        let accumulatedLength = 0;
        let startLine = 0;
        let endLine = 0;
    
        for (let i = 0; i < lines.length; i++) {
            accumulatedLength += lines[i].length + 1; // +1 for the newline character
    
            if (accumulatedLength > startIndex && startLine === 0) {
                startLine = i + 1; // Convert from 0-based to 1-based index
            }
    
            if (accumulatedLength >= endIndex && endLine === 0) {
                endLine = i + 1; // Convert from 0-based to 1-based index
                break; // End loop once endLine is found
            }
        }

        if (startLine === 0){
            endLine = endLine + 1
        } else {
            startLine = startLine - 1
        }
    
        console.log(`Start line: ${startLine}, End line: ${endLine}`);
        return { startLine, endLine };
    }

    const executeSuggestion = (suggestion: string, codeSection: string) => {
    
        const improvementRegex = /<<CODE IMPROVEMENT>>([\s\S]*?)(?=(\n<<CODE IMPROVEMENT>>|$))/g;

    
        let matches: string[] = [];
        let match;


    
        // Match using the updated regex
        while ((match = improvementRegex.exec(suggestion)) !== null) {

            matches.push(match[1].trim());
        }

    
        //switch this to the commented one if you ever want matches to have multiple values
        // const matchString = matches.join('\n');
        const matchString = matches;


        let newCode = (() => {
            const prevCode = props.code; // Assuming props.code is accessible here
        
            // Function to create a normalized version for comparison, but maintain indexes for replacement
            const findIndexesAfterNormalization = (source: string, search: string): { start: number, end: number } => {
                const normalizedSource = source.toLowerCase().replace(/\s+/g, ' ');
                const normalizedSearch = search.toLowerCase().replace(/\s+/g, ' ');
                const start = normalizedSource.indexOf(normalizedSearch);
                if (start === -1) {
                    console.error('codeSection not found in the code');
                    return { start: -1, end: -1 }; // Not found
                }
                const end = start + search.length;
                return { start, end }; // Return original indexes
            };
        
            const { start, end } = findIndexesAfterNormalization(prevCode, codeSection);
            if (start !== -1 && end !== -1) {
                // Replace using the original indexes in prevCode to maintain formatting
                const before = prevCode.substring(0, start);
                const after = prevCode.substring(end);
                return before + matchString + after;
            } else {
                return prevCode; // Return prevCode if the section is not found or no replacement is made
            }
        })();

        return newCode;
    };

    const suggestionPopupRender = (suggestion: string, endLine: number | undefined, startLine: number | undefined, codeSection: string) => {

        let counter = 0; // To track the replacement count
        const newStateValue = suggestion; // Assuming you want to insert this as a dynamic value

        const resultString = newStateValue.replace(/<<CODE IMPROVEMENT>>/g, () => {
            counter += 1;
            if (counter === 1) {
                // Replace the first occurrence with ```[state value]
                //@ts-ignore
                return `\`\`\`[${props.lang}]`;
            } else {
                // Replace the second (and any subsequent, though not specified) occurrences with ```
                return "\`\`\`";
            }
        });



        return (
            <Box id="ct-suggestion-internal">
                <MarkdownRenderer 
                    markdown={resultString} 
                    style={{
                        overflowWrap: 'break-word',
                        borderRadius: '10px',
                        padding: '0px',
                        width: "90%",
                    }}
                />
                <Box className="ctsuggestons-buttons" style={{
                    position: "sticky",
                    width: "100%",
                    padding: "10px",
                    display: "flex",
                    justifyContent: "space-evenly",
                    bottom: -10,
                    left: 0,
                    backgroundColor: mode === 'dark' ? "#333338" : "#f5f5f5"
                }}>
                    <Button onClick={() => {
                        props.closeCallback(startLine, endLine, null)
                        setSuggestionPortal(null)
                        }} variant='contained'>
                        Dismiss
                    </Button>
                    <Button onClick={() => {
                        //@ts-ignore
                        let newCode = executeSuggestion(suggestion, codeSection)
                        props.closeCallback(startLine, endLine, newCode)
                        setSuggestionPortal(null)
                    }} variant='contained'>
                        Accept
                    </Button>
                </Box>

            {/* Add button here to dismiss or accept - we need to remove the SuggestionPortal state too */}
            </Box>
        )
    }

    const sendSuggestionRequest = (retryCount: number = 0) => {
        console.log("byte suggestion starting")


        ctWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: CtMessageType.WebSocketMessageTypeByteSuggestionRequest,
            origin: CtMessageOrigin.WebSocketMessageOriginClient,
            created_at: Date.now(),
            payload: {
                //@ts-ignore
                lang: props.lang,
                code: props.code,
                //@ts-ignore
                byte_description: props.description,
                //@ts-ignore
                byte_id: props.byteId,
                assistant_id: ""
            }
        } satisfies CtMessage<CtByteSuggestionRequest>, (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtByteSuggestionResponse>) => {
            //console.log("response message of next output: ", msg)
            if (msg.type !== CtMessageType.WebSocketMessageTypeByteSuggestionResponse) {
                console.log("failed suggestion message", msg)
                return true
            }
            const p: CtByteSuggestionResponse = msg.payload as unknown as CtByteSuggestionResponse;
            const codeSection = p.code_section;


            let startLine = findSubstringStartEndLines(codeSection).startLine
            let endLine = findSubstringStartEndLines(codeSection).endLine



            //@ts-ignore
            ctHighlightCodeRangeFullLines(props.codeMirrorRef.current.view, startLine, endLine);

            props.apiCallback(startLine, endLine)


            if (props.popupRef.current) {
                const d = document.createElement('div')
                d.id = "ct-suggestion-container"
                setSuggestionPortal(ReactDOM.createPortal((
                    suggestionPopupRender(p.suggestion, endLine, startLine, codeSection)
                ), d))
                //@ts-ignore
                props.popupRef.current.addPopupRange({
                    from: startLine,
                    to: endLine,
                    content: d
                })
            }
            return false
        })
    };

    useEffect(() => {
        if (!props.open)
            return
        sendSuggestionRequest()
    }, [props.open])

    return (
        <div>
            {SuggestionPortal ? (SuggestionPortal) : null}
        </div>
    )
}
