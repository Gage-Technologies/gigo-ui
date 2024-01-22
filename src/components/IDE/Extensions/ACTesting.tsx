import { autocompletion, CompletionSource } from "@codemirror/autocomplete";

// Dummy completions
const dummyCompletions = [
    { label: 'Completion1', type: 'keyword' },
    { label: 'Completion2', type: 'variable' },
    { label: 'Completion3', type: 'function' },
];

// Autocomplete extension
export const dummyAutocomplete: CompletionSource = (context) => {
    // You can add more sophisticated logic here to determine completions
    return {
        from: context.pos,
        options: dummyCompletions,
    };
};

// Export the autocompletion extension configured with the dummy source
export const autocompleteExtension = autocompletion({ 
    override: [dummyAutocomplete] 
});
