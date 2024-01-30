import { EditorView, Tooltip, Text, Extension, hoverTooltip } from "@uiw/react-codemirror";
import "./styles/ctpopup.css"

export interface PopupRange {
    to: number;
    from: number;
    content: string | HTMLDivElement;
}

export class CtPopupExtensionEngine {
    private popupRanges: PopupRange[] = [];

    addPopupRange(range: PopupRange): void {
        // add the range and popup content to the range state
        this.popupRanges.push(range);
    }

    removePopupRange(to: number, from: number): void {
        // remove any ranges that match the to & from
        this.popupRanges = this.popupRanges.filter((r) => r.to !== to || r.from === from);
    }

    async requestHoverTooltip(view: EditorView, offset: number): Promise<Tooltip | null> {
        const pos = offsetToPos(view.state.doc, offset)

        let popup = this.popupRanges.find((x) => pos.line >= x.from && pos.line <= x.to)
        if (!popup) {
            return null
        }

        const dom = document.createElement('div');
        dom.classList.add('ctsuggestions');
        if (typeof popup.content === "string") {
            dom.innerHTML = popup.content;
        } else {
            dom.appendChild(popup.content)
        }
        return {pos: offset, end: undefined, create: (view) => ({dom}), above: true};
    }
}


export function createCtPopupExtension(): {ext: Extension, engine: CtPopupExtensionEngine} {
    let engine = new CtPopupExtensionEngine()
    let ext = hoverTooltip((view, pos) => engine.requestHoverTooltip(view, pos), {
        hideOn: (tr, tt) => {
            return false
        },
        hoverTime: 300,
    })
    return {
        engine, ext
    }
}


function offsetToPos(doc: Text, offset: number) {
    const line = doc.lineAt(offset);
    return {
        line: line.number - 1, character: offset - line.from,
    };
}


