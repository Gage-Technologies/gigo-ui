import * as React from "react";
import ReactDOM from "react-dom";
import {Box, Typography} from "@mui/material";
import type * as LSP from "vscode-languageserver-protocol";
import {Diagnostic} from "@codemirror/lint";
import MarkdownRenderer from "../../../Markdown/MarkdownRenderer";

const DiagnosticRenderer = (props: {diagnostic: Diagnostic, topBorder: boolean}) => {
    let backgroundColor: string | undefined;
    if (props.diagnostic.severity == "error") backgroundColor = "#ff000020";
    if (props.diagnostic.severity == "warning") backgroundColor = "#ffa50020";
    if (props.diagnostic.severity == "info") backgroundColor = "#0000ff20";
    if (props.diagnostic.severity == "hint") backgroundColor = "#00800020";

    return (
        <Box
            sx={{
                p: 0.5,
                borderTop: props.topBorder ? "1px solid rgba(255,255,255,0.18)" : undefined,
                backgroundColor
            }}
        >
            <Typography variant={"body1"} sx={{fontSize:"smaller", mb: 0.75, textTransform: 'capitalize', fontFamily: "monospace"}} >
                {props.diagnostic.severity}
            </Typography>
            <MarkdownRenderer
                markdown={props.diagnostic.message}
                style={{
                    overflowWrap: 'break-word',
                    borderRadius: '10px',
                    padding: '0px',
                    width: "100%",
                }}
            />
        </Box>
    )
}

const DocumentationRenderer = (props: {hover: LSP.Hover, topBorder: boolean}) => {
    return (
        <Box
            sx={{
                p: 0.75,
                borderTop: props.topBorder ? "1px solid rgba(255,255,255,0.18)" : undefined
            }}
        >
            <Typography variant={"body1"} sx={{fontSize:"smaller", mb: 0.75, fontFamily: "monospace"}} >
                Documentation
            </Typography>
            <MarkdownRenderer
                markdown={props.hover.contents}
                style={{
                    overflowWrap: 'break-word',
                    borderRadius: '10px',
                    padding: '0px',
                    width: "100%",
                }}
            />
        </Box>
    )
}

export function createPortal(hoverResult: LSP.Hover | null, diagnostics: Diagnostic[]): {portal: React.ReactPortal, dom: HTMLDivElement} {
    const dom = document.createElement('div');
    dom.id = "lsp-popup-portal"
    console.log("hover: ", hoverResult)
    console.log("diag: ", diagnostics)
    return {
        portal: ReactDOM.createPortal((
            <Box>
                {diagnostics.map((x, i) => (<DiagnosticRenderer diagnostic={x} topBorder={i > 0} /> ))}
                {hoverResult ? <DocumentationRenderer hover={hoverResult} topBorder={diagnostics.length > 0} /> : ""}
            </Box>
        ), dom),
        dom
    }
}
