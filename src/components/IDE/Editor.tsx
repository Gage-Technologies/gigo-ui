import React from "react";
import CodeMirror, { ViewUpdate, Text } from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { go } from '@codemirror/legacy-modes/mode/go';
import { copilot } from '@uiw/codemirror-theme-copilot';
import { quietlight } from '@uiw/codemirror-theme-quietlight';
import useDynamicStyles from "../../hooks/dynamicStyles";

export type EditorProps = {
    language: string;
    wrapperStyles: React.CSSProperties;
    editorStyles: React.CSSProperties;
    gutterStyles: React.CSSProperties;
    code: string;
    theme: string;
    onChange?: (val: string, viewUpdate: ViewUpdate) => void;
    onUpdate?: (viewUpdate: ViewUpdate) => void;
    onCursorChange?: (bytePosition: number, lineNumber: number, columnNumber: number) => void;
};

function Editor(props: EditorProps) {
    useDynamicStyles('custom-cm-editor-style', ".cm-editor", props.editorStyles);
    useDynamicStyles('custom-cm-gutters-style', ".cm-gutters", props.gutterStyles);

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

    const getExtensions = () => {
        let exts = [];
        let lang = selectLang();
        if (lang) {
            exts.push(lang)
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
            props.onCursorChange(cursorPosition, lineInfo.number-1, cursorPosition - lineInfo.from)
        }
    }, [props.onUpdate, props.onCursorChange]);

    return (
        <>
            <CodeMirror
                value={props.code}
                height="100%"
                theme={props.theme.toLowerCase() === 'light' ? quietlight : copilot}
                style={props.wrapperStyles}
                extensions={getExtensions()}
                onChange={onChange}
                onUpdate={onUpdate}
            />
        </>
    )
}

Editor.defaultProps = {
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
