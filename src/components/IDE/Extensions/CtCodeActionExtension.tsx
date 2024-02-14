import {lineWidget, LineWidgetPosition, LineWidgetSpec} from "./LineWidget";
import {WidgetType} from "@codemirror/view";
import * as React from "react";
import ReactDOM from "react-dom";
import {Box, Button, Tooltip, Typography} from "@mui/material";
import {CtParseFileResponse, SymbolType, Node} from "../../../models/ct_websocket";
import CTIcon from '../../../img/codeTeacher/CT-icon-simple.svg';
import {CtCircularProgress} from "../../CodeTeacher/CtCircularProgress";

interface CtCodeActionWidgetSpec extends LineWidgetSpec {
    textColor: string;
    node: Node;
    loading: boolean;
    disabled: boolean;
    portalCallback: (id: string, portal: React.ReactPortal) => void;
    cleanupCodeCallback: (node: Node) => void;
}

class CtCodeActionWidget extends WidgetType {
    constructor(readonly spec: CtCodeActionWidgetSpec) {
        super()
    }

    toDOM() {
        const { position, lineNumber, node, textColor, loading, disabled, portalCallback, cleanupCodeCallback } = this.spec
        const {portal, dom} = createPortal(textColor, lineNumber, position, loading, disabled, () => cleanupCodeCallback(node))
        portalCallback(node.id, portal)
        return dom
    }

    eq(x: CtCodeActionWidget) {
        return x.spec.position+x.spec.lineNumber+x.spec.loading+x.spec.disabled+x.spec.node.content
            === this.spec.position+this.spec.lineNumber+this.spec.loading+this.spec.disabled+this.spec.node.content
    }

    ignoreEvent() {
        return false
    }
}

export const ctCreateCodeActions = (
    textColor: string,
    symbols: CtParseFileResponse,
    loadingSymbol: string | null,
    portalCallback: (id: string, portal: React.ReactPortal) => void,
    cleanupCodeCallback: (node: Node) => void
) => {
    console.log("creating code actions")
    return lineWidget({
        spec: symbols.nodes.
            filter(x => {
                // ignore smaller symbol types
                if (x.type === SymbolType.SymbolTypeVariable || x.type === SymbolType.SymbolTypeConstant) {
                    return false
                }

                // // ignore symbol types that have less than 3 lines of code
                // if (x.position.end_line-x.position.start_line < 3) {
                //     return false
                // }

                return true
            }).
            sort(x => x.position.start_line).
            map(node => ({
                lineNumber: node.position.start_line + 1,
                position: LineWidgetPosition.TOP,
                node: node,
                textColor,
                loading: loadingSymbol === node.id,
                disabled: loadingSymbol !== null,
                portalCallback,
                cleanupCodeCallback
            })
        ),
        widgetFor: spec => new CtCodeActionWidget(spec)
    })
}

function createPortal(
    textColor: string,
    lineNumber: number,
    position: LineWidgetPosition,
    loading: boolean,
    disabled: boolean,
    codeCleanupCallback: () => void
): {portal: React.ReactPortal, dom: HTMLDivElement} {
    const dom = document.createElement('div');
    dom.id = "ct-code-action-portal-line-" + lineNumber
    dom.setAttribute('aria-hidden', 'true')
    dom.setAttribute('data-line-number', String(lineNumber))
    dom.setAttribute('data-position', position)

    console.log("rendering: ", lineNumber, loading)

    return {
        portal: ReactDOM.createPortal((
            <Box
                sx={disabled && !loading ? {display: "none"} : undefined}
            >
                <Tooltip
                    title={"Ask Code Teacher to cleanup this code block and explain how it could be better!"}
                    enterDelay={1000}
                    enterTouchDelay={1000}
                >
                    <Button sx={{ m: 0.3 }} onClick={codeCleanupCallback} disabled={disabled}>
                        {loading ?
                            (<CtCircularProgress size={18} sx={{marginRight: "8px"}}/>)
                            : (<img alt="Code Teacher" src={CTIcon} style={{width: 18, height: 18, marginRight: "8px"}}/>)}
                        <Typography variant={"caption"} color={textColor} sx={{ fontSize: "10px" }}>
                            Clean Up Code
                        </Typography>
                    </Button>
                </Tooltip>
            </Box>
        ), dom),
        dom
    }
}
