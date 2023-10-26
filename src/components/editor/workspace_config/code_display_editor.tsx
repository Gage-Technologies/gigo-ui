import * as React from "react";
import { Box, Button, CircularProgress, createTheme, PaletteMode } from "@mui/material";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { DefaultWorkspaceConfig } from "../../../models/workspace";
import darkEditorTheme from "../themes/GitHub Dark.json"
import lightEditorTheme from "../themes/GitHub.json"
import "../css/editor.css"
import call from "../../../services/api-call";
import config from "../../../config";
import Sidebar from "../../EditorComponents/Sidebar";
import Text from "../../EditorComponents/Text";
import { initialAuthStateUpdate, updateAuthState } from "../../../reducers/auth/auth";
import { useNavigate } from "react-router-dom";
import MarkdownRenderer from "../../Markdown/MarkdownRenderer";
import { getAllTokens } from "../../../theme";
import Scrollbars from "react-custom-scrollbars";
import { ThreeDots } from "react-loading-icons";
import { PropaneTankSharp } from "@mui/icons-material";

export interface Code_display_editor {
    style?: object;
    height?: number | string | undefined;
    width?: number | string | undefined;
    repoId: string;
    references: string;
    filepath: string;
    projectName: string
}

function CodeDisplayEditor(props: Code_display_editor) {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [allFiles, setAllFiles] = React.useState([])
    const [fileName, setFileName] = useState("")
    const [chosenFile, setChosenFile] = useState([])
    const [loading, setLoading] = useState(false)

    const monaco = useMonaco();

    let navigate = useNavigate();

    const selectFile = async (file: any) => {
        if (!props.repoId || props.repoId === "" || !props.references || props.references === "")
            return

        if (file["content"] === undefined || file["content"] === null || file["content"] === "") {
            let res = await call(
                "/api/project/getProjectFiles",
                "post",
                null,
                null,
                null,
                // @ts-ignore
                { repo_id: props.repoId, ref: props.references, filepath: file["path"] },
                null,
                config.rootPath
            )
            file = { ...file, content: res["message"]["content"] };
        }

        setChosenFile(file)
    }

    const apiLoad = async () => {
        console.log("props: ", props)

        if (!props.repoId || props.repoId === "" || !props.references || props.references === "")
            return

        setLoading(true)
        let res = await call(
            "/api/project/getProjectCode",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            { repo_id: props.repoId, ref: props.references, filepath: props.filepath },
            null,
            config.rootPath
        )

        if (res !== undefined && res["message"] !== undefined) {
            setAllFiles(res["message"]);
            setFileName(res["message"][0]["name"])
            let index = res["message"].findIndex((item: { name: string; }) => item.name === "README.md");

            if (index !== -1) {
                await selectFile(res["message"][index]);
            } else {
                // determine the first file that is not hidden and is not in a hidden directory
                index = res["message"].findIndex((item: { name: string; }) => !item.name.startsWith('.'));
                await selectFile(res["message"][index]);
            }

        }
        setLoading(false)
    }

    const findLangauge = (name: string) => {
        let textArray = name.split(".")
        let determinate = textArray[1]
        switch (determinate) {
            // Languages with rich IntelliSense and validation
            case 'ts':
                return 'typescript';
            case 'js':
                return 'javascript';
            case 'css':
                return 'css';
            case 'less':
                return 'less';
            case 'scss':
                return 'scss';
            case 'json':
                return 'json';
            case 'html':
                return 'html';

            // Languages with only basic syntax colorization
            case 'xml':
                return 'xml';
            case 'php':
                return 'php';
            case 'cs':
                return 'csharp';
            case 'cpp':
            case 'cxx':
            case 'cc':
                return 'cpp';
            case 'cshtml':
                return 'razor';
            case 'md':
            case 'markdown':
                return 'markdown';
            case 'diff':
                return 'diff';
            case 'java':
                return 'java';
            case 'vb':
                return 'vb';
            case 'coffee':
                return 'coffeescript';
            case 'hbs':
                return 'handlebars';
            case 'bat':
                return 'batch';
            case 'pug':
                return 'pug';
            case 'fs':
            case 'fsharp':
                return 'fsharp';
            case 'lua':
                return 'lua';
            case 'ps1':
                return 'powershell';
            case 'py':
                return 'python';
            case 'rb':
                return 'ruby';
            case 'sass':
                return 'sass';
            case 'r':
                return 'r';
            case 'm':
                return 'objective-c';
            case 'go':
                return 'go';
            case 'sql':
                return 'sql';
            case 'swift':
                return 'swift';
            case 'sh':
                return 'shell';
            case 'yml':
            case 'yaml':
                return 'yaml';
            case 'rs':
                return 'rust';
            case 'clj':
                return 'clojure';
            case 'kt':
                return 'kotlin';
            case 'pl':
                return 'perl';
            case 'hs':
                return 'haskell';
            case 'erl':
                return 'erlang';
            case 'elixir':
                return 'elixir';
            case 'elm':
                return 'elm';
            case 'dart':
                return 'dart';
            default:
                return 'plaintext';
        }
    }

    useEffect(() => {
        if (monaco) {
            monaco.editor.defineTheme("gigo-default-light", lightEditorTheme)
            monaco.editor.defineTheme("gigo-default-dark", darkEditorTheme)
            monaco.editor.setTheme(mode === "light" ? "gigo-default-light" : "gigo-default-dark")
        }
    }, [monaco, mode]);

    useEffect(() => { 
        apiLoad()
    }, [props.references, props.repoId]);

    const handleCurrentFileSideBar = (file: any) => {
        setLoading(true)
        selectFile(file)
        setLoading(false)
    }

    //@ts-ignore
    const isMarkdown = chosenFile["name"]
        //@ts-ignore
        ? findLangauge(chosenFile["name"]).toLowerCase() === "markdown"
        : false;

    if (!props.repoId || props.repoId === "" || !props.references || props.references === "")
        return null

    return (
        <div style={props.style}>
            <div style={{ width: "50%", display: "flex", height: "73vh" }}>
                <Sidebar
                    selectedFile={chosenFile}
                    handleFileSelect={handleCurrentFileSideBar}
                    projectNames={props.projectName}
                    files={allFiles}
                    repoId={props.repoId}
                />
            </div>
            {
                isMarkdown ? (
                    <Scrollbars
                        style={{
                            height: props.height,
                            width: "121vw",
                            border: `1px solid ${theme.palette.primary.contrastText}`,
                            borderRadius: 5,
                        }}
                        renderThumbVertical={({ style, ...props }) =>
                            <div {...props}
                                style={{
                                    ...style,
                                    backgroundColor: theme.palette.primary.contrastText,
                                    borderRadius: 10
                                }}
                            />
                        }
                    >
                        {/*@ts-ignore*/}
                        <MarkdownRenderer markdown={chosenFile["content"]} style={{
                            height: props.height,
                            width: "60vw",
                            overflowWrap: "break-word",
                            padding: "2em 3em",
                        }} />
                    </Scrollbars>
                )
                    : (
                        loading ? (
                            <Box
                                sx={{
                                    border: `1px solid ${theme.palette.primary.contrastText}`,
                                    boxSizing: 'border-box',
                                    width: "121vw",
                                    height: props.height,
                                    borderRadius: "5px",
                                }}
                            >
                                <CircularProgress
                                    color="inherit"
                                    sx={{
                                        // center the spinner in the middle of the Box
                                        position: 'absolute',
                                        top: '52vh',
                                        left: '59vw',
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                />
                            </Box>
                        ) : (
                            <Editor
                                options={{ readOnly: true }}
                                height={props.height}
                                width={"121vw"}
                                path={
                                    //@ts-ignore
                                    chosenFile["name"]}
                                value={
                                    //@ts-ignore
                                    chosenFile["content"]}
                                //@ts-ignore
                                language={chosenFile["name"] !== undefined ? findLangauge(chosenFile["name"]).toLowerCase() : ""}
                                theme={mode === "light" ? "gigo-default-light" : "gigo-default-dark"}
                                className={"yaml-editor"}
                                wrapperProps={{
                                    style: {
                                        border: `1px solid ${theme.palette.primary.contrastText}`,
                                        boxSizing: 'border-box',
                                        width: "121vw",
                                        height: props.height,
                                        borderRadius: 5,
                                    }
                                }}
                            />
                        )
                    )
            }
        </div>
    )
}

export default CodeDisplayEditor;