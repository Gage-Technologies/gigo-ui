import { EditorView, Decoration, keymap } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";
import { DecorationSet, Transaction } from "@uiw/react-codemirror";
import { keyframes } from "@emotion/react";
import "./styles/highlights.css"

// Create a state effect for highlighting a particular line
const ctHighlightText = StateEffect.define<{ from: number, to: number }>();

// Decoration mark for highlighting selected lines in code editor - this can be used to modify the elements that wrap lines in the editor
const ctTextHighlightMark = Decoration.mark({ class: "cm-selection-highlight" });

// Theme used to apply custom CSS to the highlighted lines
export const ctTextHighlightTheme = EditorView.baseTheme({
    ".cm-selection-highlight": {
        background: "#29C18C",
        paddingRight: "4px",
        paddingLeft: "4px",
        paddingTop: "2px",
        paddingBottom: "2px",
        borderRadius: "10px",
        animation: `selection-highlight-anim 5s infinite`,
    }
});

// Extension used to enable highlighting functionality in the CodeMirror editor
export const ctTextHighlightExtension = StateField.define({
    // define the creation function - lines will have no decration by default
    create() {
        return Decoration.none;
    },
    // defin the update function - use the ctHighlightText StateEffects to determine which lines should be decorated with highlights
    update(underlines: DecorationSet, tr: Transaction): DecorationSet {
        underlines = underlines.map(tr.changes);
        for (let e of tr.effects) {
            if (e === null) {
                continue
            }

            if (e.is(ctHighlightText)) {
                underlines = underlines.update({
                    add: [ctTextHighlightMark.range(e.value.from, e.value.to)]
                });
            }
        }
        return underlines;
    },

    // basic template function - just copy this to any new StateField extensions you create
    provide: (f) => EditorView.decorations.from(f)
});

// Highlights the currently selected lines from the editor - 
export function ctHighlightSelection(view: EditorView) {
    let effects = view.state.selection.ranges
        .filter((r) => !r.empty)
        .map(({ from, to }) => ctHighlightText.of({ from, to }));
    if (!effects.length) return false;

    view.dispatch({ effects });
    return true;
}

// You can use this function to mark lines from normal JS/TS functions
export function ctHighlightCodeRange(view: EditorView, startLine: number, endLine: number) {
    console.log("true start line: ", startLine)
    console.log("true end line: ", endLine)
    let effects = [ctHighlightText.of({from: startLine, to: endLine})]
    view.dispatch({ effects });
    return true;
}

// export function ctHighlightCodeRangeFullLines(view: EditorView, startLine: number, endLine: number) {
//     const text = view.state.doc.toString();
//     const lines = text.split("\n");
//     let startIndex = 0;
//     let endIndex = 0;
  
//     for (let i = 0; i < startLine; i++) {
//       startIndex += lines[i].length + 1;
//     }
  
//     for (let i = 0; i < endLine; i++) {
//       endIndex += lines[i].length + 1;
//     }
  
//     endIndex -= 1; // Subtract 1 to exclude the newline character at the end of the last line
  
//     const effects = [ctHighlightText.of({ from: startIndex, to: endIndex })];
//     view.dispatch({ effects });
// }

// This is just an example instance I made to make it easier to test
export const highlightTesterKeymap = keymap.of([
    {
        key: "Mod-h",
        preventDefault: true,
        run: ctHighlightSelection
    }
]);

export function ctHighlightCodeRangeFullLines(view: EditorView, startLine: number, endLine: number) {
    const text = view.state.doc.toString();
    const lines = text.split("\n");
    let startIndex = 0;
    let endIndex = 0;

    for (let i = 0; i < startLine; i++) {
      startIndex += lines[i].length + 1;
    }

    for (let i = 0; i < endLine; i++) {
      endIndex += lines[i].length + 1;
    }

    endIndex -= 1; // Subtract 1 to exclude the newline character at the end of the last line

    const effects = [ctHighlightText.of({ from: startIndex, to: endIndex })];
    view.dispatch({ effects });

    // Attach a mousemove listener to the editor
    view.dom.addEventListener('mousemove', (event) => onMouseMove(event, view, startIndex, endIndex));
}

function onMouseMove(event: MouseEvent, view: EditorView, startIndex: number, endIndex: number) {
    const rect = view.dom.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const pos = view.posAtCoords({ x, y });
    console.log("in mouse event")
    if (pos !== null && pos >= startIndex && pos <= endIndex) {
        console.log("show tooltip")
        showTooltip(event.clientX, event.clientY);
    } else {
        hideTooltip();
    }
}

function showTooltip(x: number, y: number) {
    console.log("show tooltip")
    let tooltip = document.getElementById('my-tooltip') as HTMLDivElement;
    console.log("tooltip is: ", tooltip)
    console.log("creating tooltip")
    tooltip = document.createElement('div');
    tooltip.id = 'my-tooltip';
    tooltip.textContent = 'Tooltip content here'; // Customize as needed
    document.body.appendChild(tooltip);
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.display = 'block';
}

function hideTooltip() {
    console.log("hide tooltip")
    const tooltip = document.getElementById('my-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}