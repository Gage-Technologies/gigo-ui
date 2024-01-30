import React, { useEffect, useState } from "react";
import CodeMirror, { ViewUpdate, Text, ReactCodeMirrorRef, Extension } from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { go } from '@codemirror/legacy-modes/mode/go';
import { copilot } from '@uiw/codemirror-theme-copilot';
import { quietlight } from '@uiw/codemirror-theme-quietlight';
import useDynamicStyles from "../../hooks/dynamicStyles";
import { Box } from "@mui/material";
import { indentUnit } from '@codemirror/language';
import { autocompleteExtension } from "./Extensions/ACTesting";
import { ctTextHighlightExtension, ctTextHighlightTheme, highlightTesterKeymap } from "./Extensions/CtHighlightExtension";
import { languageServer } from './Extensions/Lsp';

export type EditorProps = {
    language: string;
    parentStyles?: React.CSSProperties;
    wrapperStyles?: React.CSSProperties;
    editorStyles?: React.CSSProperties;
    gutterStyles?: React.CSSProperties;
    code: string;
    theme?: string;
    readonly: boolean;
    lspUrl?: string;
    diagnosticLevel?: "hint" | "info" | "warning" | "error",
    onChange?: (val: string, viewUpdate: ViewUpdate) => void;
    onUpdate?: (viewUpdate: ViewUpdate) => void;
    onCursorChange?: (bytePosition: number, lineNumber: number, columnNumber: number) => void;
};

const Editor = React.forwardRef<ReactCodeMirrorRef, EditorProps>((props: EditorProps, ref) => {
    const defaultProps: {
        parentStyles: React.CSSProperties;
        wrapperStyles: React.CSSProperties;
        editorStyles: React.CSSProperties;
        gutterStyles: React.CSSProperties;
        theme: string;
    } = {
        parentStyles: {},
        wrapperStyles: {
            width: '100%',
            height: '100%',
            borderRadius: "10px",
            // border: "1px solid #fff"
        },
        editorStyles: {
            borderRadius: '10px',
        },
        gutterStyles: {
            borderRadius: '10px',
        },
        theme: "dark"
    };

    useDynamicStyles('custom-cm-editor-style', ".cm-editor", props.editorStyles ? props.editorStyles : defaultProps.editorStyles);
    useDynamicStyles('custom-cm-gutters-style', ".cm-gutters", props.gutterStyles ? props.gutterStyles : defaultProps.gutterStyles);

    const [wsLanguageServer, setWsLanguageServer] = useState<Extension[] | null>(null);

    const selectLang = () => {
        switch (props.language.toLowerCase()) {
            case "go":
            case "golang":
                return StreamLanguage.define(go)
            case "py":
            case "python":
                return python()
            default:
                return undefined
        }
    }

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
            highlightTesterKeymap,
        ];
        let lang = selectLang();
        if (lang) {
            exts.push(lang)
        }
        if (wsLanguageServer) {
            exts = exts.concat(wsLanguageServer)
        }

        return exts
    }

    const onChange = React.useCallback((val: string, viewUpdate: ViewUpdate) => {
        if (props.onChange) {
            props.onChange(val, viewUpdate)
        }
    }, [props.onChange])

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
                extensions={getExtensions()}
                onChange={onChange}
                onUpdate={onUpdate}
                readOnly={props.readonly}
            />
        </Box>
    )
});

Editor.defaultProps = {
    parentStyles: {},
    wrapperStyles: {
        width: '100%',
        height: '100%',
        borderRadius: "10px",
        // border: "1px solid #fff"
    },
    editorStyles: {
        borderRadius: '10px',
    },
    gutterStyles: {
        borderRadius: '10px',
    },
    theme: "dark"
};

export default Editor;
