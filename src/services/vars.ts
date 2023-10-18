// create const to hold the names of all programming languages
export const programmingLanguages = [
    "Any",
    "Custom",
    "Java",
    "JavaScript",
    "TypeScript",
    "Python",
    "Go",
    "Ruby",
    "C++",
    "C",
    "C#",
    "ObjectiveC",
    "Swift",
    "PHP",
    "Rust",
    "Kotlin",
    "Dart",
    "Scala",
    "CoffeeScript",
    "Haskell",
    "Lua",
    "Clojure",
    "Perl",
    "Shell",
    "Elixir",
    "Assembly",
    "Groovy",
    "Html",
    "Julia",
    "OCaml",
    "R",
    "Ada",
    "Erlang",
    "Matlab",
    "SQL",
    "Cobol",
    "Lisp",
    "HCL"
];

export const getProgrammingIds = () => {
    return programmingLanguages.map((_, i) => {
        return i
    })
}