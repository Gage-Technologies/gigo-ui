import { EditorView, Decoration, keymap } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";
import { DecorationSet, Transaction } from "@uiw/react-codemirror";
import { keyframes } from "@emotion/react";
import "./styles/highlights.css"

const ctHighlightText = StateEffect.define<{ from: number, to: number }>();

const ctTextHighlightMark = Decoration.mark({ class: "cm-selection-highlight" });
export const ctTextHighlightTheme = EditorView.baseTheme({
    ".cm-selection-highlight": {
        background: "#29C18C",
        padding: "4px",
        borderRadius: "10px",
        animation: `selection-highlight-anim 5s infinite`,
    }
});

export const ctTextHighlightExtension = StateField.define({
    create() {
        return Decoration.none;
    },
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
    provide: (f) => EditorView.decorations.from(f)
});

export function ctHighlightSelection(view: EditorView) {
    let effects = view.state.selection.ranges
        .filter((r) => !r.empty)
        .map(({ from, to }) => ctHighlightText.of({ from, to }));
    if (!effects.length) return false;

    // if (!view.state.field(ctTextHighlightExtension, false))
    //     // @ts-ignore
    //     effects.push(StateEffect.appendConfig.of([underlineField, underlineTheme]));
    view.dispatch({ effects });
    return true;
}

export const highlightTesterKeymap = keymap.of([
    {
        key: "Mod-h",
        preventDefault: true,
        run: ctHighlightSelection
    }
]);