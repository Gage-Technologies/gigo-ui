import { EditorView, Decoration, keymap } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";
import { DecorationSet, Transaction } from "@uiw/react-codemirror";
import { keyframes } from "@emotion/react";
import "./styles/highlights.css"
import { CtPopupExtensionEngine } from "./CtPopupExtension";

// Create a state effect for highlighting a particular line
const ctHighlightText = StateEffect.define<{ from: number, to: number }>();

//create a state effect for removing a particular line
const ctClearHighlight = StateEffect.define<{ from: number, to: number }>();

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

            // if (e.is(ctHighlightText)) {
            //     underlines = underlines.update({
            //         add: [ctTextHighlightMark.range(e.value.from, e.value.to)]
            //     });
            // }

            if (e.is(ctHighlightText)) {
                // Add highlight
                underlines = underlines.update({
                    add: [ctTextHighlightMark.range(e.value.from, e.value.to)]
                });
            } else if (e.is(ctClearHighlight)) {
                // Clear highlight
                // Assuming ctClearHighlight effect clears highlighting within the specified range
                underlines = underlines.update({
                    filter: (from, to) => !(from >= e.value.from && to <= e.value.to)
                });
            }
        }
        return underlines;
    },

    // basic template function - just copy this to any new StateField extensions you create
    provide: (f) => EditorView.decorations.from(f)
});


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
}

export function removeCtHighlightCodeRange(view: EditorView, startLine: number, endLine: number) {
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

    const effects = [ctClearHighlight.of({ from: startIndex, to: endIndex })];
    view.dispatch({ effects });
}
