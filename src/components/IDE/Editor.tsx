import React, {useEffect, useState} from "react";
import CodeMirror, {Extension, ReactCodeMirrorRef, ViewUpdate} from '@uiw/react-codemirror';
import {indentUnit, StreamLanguage} from '@codemirror/language';
import {python} from '@codemirror/lang-python';
import {cpp} from '@codemirror/lang-cpp';
import {html} from '@codemirror/lang-html';
import {java} from '@codemirror/lang-java';
import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {lezer} from '@codemirror/lang-lezer';
import {markdown} from '@codemirror/lang-markdown';
import {php} from '@codemirror/lang-php';
import {rust} from '@codemirror/lang-rust';
import {sql} from '@codemirror/lang-sql';
import {xml} from '@codemirror/lang-xml';
import {less} from '@codemirror/lang-less';
import {sass} from '@codemirror/lang-sass';
import {clojure} from '@nextjournal/lang-clojure';
import {csharp} from '@replit/codemirror-lang-csharp';
import {go} from '@codemirror/legacy-modes/mode/go';
import {copilot} from '@uiw/codemirror-theme-copilot';
import {quietlight} from '@uiw/codemirror-theme-quietlight';
import useDynamicStyles from "../../hooks/dynamicStyles";
import {alpha, Box, createTheme, PaletteMode} from "@mui/material";
import {ctTextHighlightExtension, ctTextHighlightTheme} from "./Extensions/CtHighlightExtension";
import {languageServer} from './Extensions/Lsp/Lsp';
import "./editor.css"
import {useGlobalCtWebSocket} from "../../services/ct_websocket";
import {
    CtGenericErrorPayload,
    CtMessage,
    CtMessageOrigin,
    CtMessageType, CtParseFileRequest, CtParseFileResponse,
    CtSemanticRankRequest,
    CtSemanticRankResponse,
    CtValidationErrorPayload
} from "../../models/ct_websocket";
import {ctCreateCodeActions} from "./Extensions/CtCodeActionExtension";
import {getAllTokens} from "../../theme";

export type EditorProps = {
    language: string;
    parentStyles?: React.CSSProperties;
    wrapperStyles?: React.CSSProperties;
    editorStyles?: React.CSSProperties;
    gutterStyles?: React.CSSProperties;
    scrollerStyles?: React.CSSProperties;
    code: string;
    theme?: string;
    readonly: boolean;
    lspUrl?: string;
    diagnosticLevel?: "hint" | "info" | "warning" | "error",
    onChange?: (val: string, viewUpdate: ViewUpdate) => void;
    onUpdate?: (viewUpdate: ViewUpdate) => void;
    onCursorChange?: (bytePosition: number, lineNumber: number, columnNumber: number) => void;
    extensions?: Extension[]
};

const Editor = React.forwardRef<ReactCodeMirrorRef, EditorProps>((props: EditorProps, ref) => {
    const defaultProps: {
        parentStyles: React.CSSProperties;
        wrapperStyles: React.CSSProperties;
        editorStyles: React.CSSProperties;
        gutterStyles: React.CSSProperties;
        scrollerStyles: React.CSSProperties;
        theme: string;
    } = {
        parentStyles: {},
        wrapperStyles: {
            width: '100%',
            height: '100%',
            borderRadius: "10px",
        },
        editorStyles: {
            borderRadius: '10px',
            outline: "none !important"
        },
        gutterStyles: {
            borderRadius: '10px',
        },
        scrollerStyles: {
            borderRadius: '10px'
        },
        theme: "dark"
    };

    useDynamicStyles('custom-cm-editor-style', ".cm-editor", props.editorStyles ? props.editorStyles : defaultProps.editorStyles);
    useDynamicStyles('custom-cm-gutters-style', ".cm-gutters", props.gutterStyles ? props.gutterStyles : defaultProps.gutterStyles);
    useDynamicStyles('custom-cm-gutters-style', ".cm-scroller", props.scrollerStyles ? props.scrollerStyles : defaultProps.scrollerStyles);

    let ctWs = useGlobalCtWebSocket();

    const [wsLanguageServer, setWsLanguageServer] = useState<Extension[] | null>(null);

    const [PopupPortal, setPopupPortal] = useState<React.ReactPortal | null>(null);

    const [extensions, setExtensions] = useState<Extension[]>([])

    const selectLang = () => {
        switch (props.language.toLowerCase()) {
            case "golang":
            case "go":
                return StreamLanguage.define(go);
            case "py":
            case "python":
                return python();
            case "cpp":
            case "cc":
            case "cxx":
            case "c++":
            case "hpp":
                return cpp();
            case "html":
            case "htm":
                return html();
            case "java":
                return java();
            case "js":
            case "javascript":
                return javascript();
            case "json":
                return json();
            case "md":
            case "markdown":
                return markdown();
            case "php":
                return php();
            case "rs":
            case "rust":
                return rust();
            case "sql":
                return sql();
            case "xml":
                return xml();
            case "less":
                return less();
            case "sass":
            case "scss":
                return sass();
            case "clj":
            case "clojure":
                return clojure();
            case "cs":
            case "csharp":
                return csharp();
            // Additional cases for other languages and their extensions
            default:
                return undefined;
        }
    }

    const rankCompletions = React.useCallback(async (preText: string, completions: string[]): Promise<CtSemanticRankResponse | undefined> => {
        // create a promise that will be resolved when the response is received
        let resolver: (value: CtSemanticRankResponse | undefined) => void;
        const promise: Promise<CtSemanticRankResponse | undefined> = new Promise((resolve) => {
            resolver = resolve;
        });

        // Define a timeout duration in milliseconds
        const timeoutDuration = 1000;

        // Create a timeout promise
        const timeoutPromise = new Promise<CtSemanticRankResponse | undefined>((resolve) => {
            setTimeout(() => {
                resolve(undefined);
            }, timeoutDuration);
        });

        ctWs.sendWebsocketMessage(
            {
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: CtMessageType.WebSocketMessageTypeSemanticRankRequest,
                origin: CtMessageOrigin.WebSocketMessageOriginClient,
                created_at: Date.now(),
                payload: {
                    query: preText,
                    content: completions,
                }
            } satisfies CtMessage<CtSemanticRankRequest>,
            (msg: CtMessage<CtGenericErrorPayload | CtValidationErrorPayload | CtSemanticRankResponse>): boolean => {
                if (msg.type !== CtMessageType.WebSocketMessageTypeSemanticRankResponse) {
                    console.log("failed to semantically rank completions: ", msg)
                    resolver(undefined)
                    return true
                }
                resolver(msg.payload as CtSemanticRankResponse)
                return true
            }
        )

        // Use Promise.race to handle the timeout
        return Promise.race([promise, timeoutPromise]);
    }, [ctWs]);

    useEffect(() => {
        if (!props.lspUrl) {
            return
        }

        // get fp for the language
        let fp = "/tmp/pyrun/main.py"
        let root = "/tmp/pyrun"
        let lspLangCode = "python"
        if (props.language.toLowerCase() === "go" || props.language.toLowerCase() === "golang") {
            root = "/tmp/gorun"
            fp = "/tmp/gorun/main.go"
            lspLangCode = "go"
        }

        console.log("creating lsp")
        const lsp = languageServer({
            // WebSocket server uri and other client options.
            // @ts-ignore
            serverUri: props.lspUrl,
            rootUri: `file://${root}`,

            documentUri: `file://${fp}`,
            languageId: lspLangCode, // As defined at https://microsoft.github.io/language-server-protocol/specification#textDocumentItem.

            allowHTMLContent: true,
            level: props.diagnosticLevel !== undefined ? props.diagnosticLevel : "error",
            portalCallback: setPopupPortal,
            rankCompletions: rankCompletions
        });

        // update the lsp
        setWsLanguageServer(lsp)
    }, [props.language, props.lspUrl])

    const getExtensions = () => {
        let exts = [
            // this indents with 4 spaces
            indentUnit.of("    "),
            // autocompleteExtension,
            ctTextHighlightExtension,
            ctTextHighlightTheme,
        ];
        let lang = selectLang();
        if (lang) {
            exts.push(lang)
        }
        if (wsLanguageServer) {
            exts = exts.concat(wsLanguageServer)
        }
        if (props.extensions) {
            exts = exts.concat(props.extensions)
        }

        return exts
    }

    useEffect(() => {
        setExtensions(getExtensions())
    }, [props.extensions, props.language, wsLanguageServer]);

    const onChange = React.useCallback((val: string, viewUpdate: ViewUpdate) => {
        if (props.onChange) {
            props.onChange(val, viewUpdate)
        }
    }, [props.onChange, props.code])

    const onUpdate = React.useCallback((viewUpdate: ViewUpdate) => {
        if (props.onUpdate) {
            props.onUpdate(viewUpdate)
        }

        // Check if the update is due to cursor movement
        if (props.onCursorChange && (viewUpdate.docChanged || viewUpdate.selectionSet)) {
            // retrieve the cursor position
            const cursorPosition = viewUpdate.state.selection.main.head;
            // get the line and column position
            const lineInfo = viewUpdate.state.doc.lineAt(cursorPosition);
            props.onCursorChange(cursorPosition, lineInfo.number - 1, cursorPosition - lineInfo.from)
        }
    }, [props.onUpdate, props.onCursorChange]);

    return (
        <Box
            style={props.parentStyles ? props.parentStyles : defaultProps.parentStyles}
        >
            <CodeMirror
                ref={ref}
                value={props.code}
                height="100%"
                theme={(props.theme ? props.theme : defaultProps.theme).toLowerCase() === 'light' ? quietlight : copilot}
                style={props.wrapperStyles ? props.wrapperStyles : defaultProps.wrapperStyles}
                extensions={extensions}
                onChange={onChange}
                onUpdate={onUpdate}
                readOnly={props.readonly}
                
            />
            {PopupPortal}
        </Box>
    )
});

export default Editor;
