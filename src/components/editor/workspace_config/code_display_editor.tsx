import * as React from "react";
import {Button, PaletteMode} from "@mui/material";
import Editor, { useMonaco } from "@monaco-editor/react";
import {useEffect, useState} from "react";
import {DefaultWorkspaceConfig} from "../../../models/workspace";
import darkEditorTheme from "../themes/GitHub Dark.json"
import lightEditorTheme from "../themes/GitHub.json"
import "../css/editor.css"
import call from "../../../services/api-call";
import config from "../../../config";
import Sidebar from "../../EditorComponents/Sidebar";
import Text from "../../EditorComponents/Text";
import {initialAuthStateUpdate, updateAuthState} from "../../../reducers/auth/auth";
import {useNavigate} from "react-router-dom";

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
    const [allFiles, setAllFiles] = React.useState([])
    const [fileName, setFileName] = useState("")
    const [chosenFile, setChosenFile] = useState([])

    const monaco = useMonaco();

    let navigate = useNavigate();

    const apiLoad = async () => {
        let res = await call(
            "/api/project/getProjectCode",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {repo_id: props.repoId, ref: props.references, filepath: props.filepath},
            null,
            config.rootPath
        )

        if (res !== undefined && res["message"] !== undefined){
            setAllFiles(res["message"]);
            setFileName(res["message"][0]["name"])
            setChosenFile(res["message"][0])
        }
    }

    const findLangauge = (name :string) => {
        let textArray = name.split(".")
        let determinate = textArray[1]
        switch (determinate) {
            case "tx":
                return "TypeScript"
            case "js":
                return "JavaScript"
            case "tsx":
                return "TypeScript"
            case "jsx":
                return "JavaScript"
            case "css":
                return "CSS"
            case "less":
                return "LESS"
            case "scss":
                return "SCSS"
            case "json":
                return "JSON"
            case "html":
                return "HTML"
            case "xml":
                return "XML"
            case "PHP":
                return "PHP"
            case "cs":
                return "C#"
            case ".c":
                return "C++"
            case "cshtml":
                return "Razor"
            case "md":
                return "Markdown"
            case "dif":
                return "Diff"
            case "java":
                return "Java"
            case "vb":
                return "VB"
            case "litcoffee":
                return "CoffeeScript"
            case "handlebars":
                return "Handlebars"
            case "bat":
                return "Batch"
            case "pug":
                return "Pug"
            case "fs":
                return "F#"
            case "lua":
                return "Lua"
            case "ps1":
                return "Powershell"
            case "py":
                return "Python"
            case "rb":
                return "Ruby"
            case "scss":
                return "SASS"
            case "r":
                return "R"
            case "h":
                return "Objective-C"
            case "go":
                return "Go"
            case "yaml":
                return "yaml"
            default:
                return "markdown"
        }
    }

    useEffect(() => {
        if (monaco) {
            monaco.editor.defineTheme("gigo-default-light", lightEditorTheme)
            monaco.editor.defineTheme("gigo-default-dark", darkEditorTheme)
            monaco.editor.setTheme(mode === "light" ? "gigo-default-light" : "gigo-default-dark")
        }

        if (allFiles.length === 0) {
            apiLoad()
        }
    }, [monaco, mode]);

    const handleCurrentFileSideBar = (file: any) => {
        // let arr = new Set(allFiles)
        // //@ts-ignore
        // arr.add(file)
        // //@ts-ignore
        // setAllFiles(arr)
        setChosenFile(file)
    }



    return (
        <div style={props.style}>
            {/*{files.map((file) => {*/}
            {/*    return (*/}
            {/*        <button disabled={*/}
            {/*            //@ts-ignore*/}
            {/*            chosenFile["name"] === file["name"]} onClick={() => setChosenFile(file)}>{*/}
            {/*            //@ts-ignore*/}
            {/*            file["name"]}</button>*/}
            {/*    )*/}
            {/*})}*/}
            <div style={{width: "50%", display: "flex", height: "73vh"}}>
                <Sidebar selectedFile={chosenFile} handleFileSelect={handleCurrentFileSideBar} projectNames={props.projectName} files={allFiles} repoId={props.repoId}/>
            </div>
            {/*<div style={{*/}
            {/*    width: "74%",*/}
            {/*    height: "100%",*/}
            {/*    borderRadius: 5*/}
            {/*}} id={"text"}>*/}
            {/*    <div style={{overflow: "auto", width: "100%", height: "100%"}}>*/}
            {/*        <Text files={allFiles} selectedFile={chosenFile} handleCloseFile={handleCloseFile}*/}
            {/*              handleClickFile={handleClickFile}></Text>*/}
            {/*    </div>*/}
            {/*</div>*/}
            <Editor
                options={{readOnly: true}}
                height={props.height}
                width={"115vw"}
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
            />
        </div>
    )
}

export default CodeDisplayEditor;