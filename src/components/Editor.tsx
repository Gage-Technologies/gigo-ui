// @ts-nocheck

import React, {SyntheticEvent, useState} from 'react';
import Sidebar from './EditorComponents/Sidebar';
import Text from './EditorComponents/Text';
import {createTheme, PaletteMode, Theme, useMediaQuery} from "@mui/material";
import {getAllTokens} from "../theme";

interface Iprops {
    theme: Theme
}

function Editor(props: Iprops) {
    const [currentFiles, setCurrentFiles] = useState<Set<string>>(new Set());
    const [selectedFile, setSelectedFile] = useState<string>('none')
    const [textheight, setTextHeight] = useState(0)

    const handleClickFile = (e: SyntheticEvent, file: string) => {
        setSelectedFile(file)
    }

    const handleCurrentFileSideBar = (file: string) => {
        let arr = new Set(currentFiles)
        arr.add(file)
        setCurrentFiles(arr)
        setSelectedFile(file)
    }

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    const [mode, setMode] = React.useState<PaletteMode>(prefersDarkMode ? 'dark' : 'light');
    const colorMode = React.useMemo(
        () => ({
            // The dark mode switch would invoke this method
            toggleColorMode: () => {
                setMode((prevMode: PaletteMode) =>
                    prevMode === 'light' ? 'dark' : 'light',
                );
            },
        }),
        [],
    );

    // Update the theme only if the mode changes
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const handleCloseFile = (e: SyntheticEvent, file: string) => {
        let arr = new Set(currentFiles)
        arr.delete(file)
        setCurrentFiles(arr)
        // if selected is closed, select another
        if (file === selectedFile) {
            currentFiles.forEach((value) => {
                if (value !== selectedFile && currentFiles.size > 1) {
                    setSelectedFile(value);
                    return false;
                } else if (currentFiles.size === 1) {
                    setSelectedFile("none")
                    return false;
                }
            })
        }
        e.stopPropagation()
    }



    // @ts-ignore
    return (
        <div style={{display: "flex", flexDirection: "row", width: "100%", height: "100%"}}>
            <div style={{width: "25%", display: "flex"}}>
                <Sidebar selectedFile={selectedFile} handleFileSelect={handleCurrentFileSideBar}/>
            </div>
            <div style={{
                width: "74%",
                height: "100%",
                backgroundColor: props.theme.palette.background.codeEditor,
                borderRadius: 5
            }} id={"text"}>
                <div style={{overflow: "auto", width: "100%", height: "100%"}}>
                    <Text files={currentFiles} selectedFile={selectedFile} handleCloseFile={handleCloseFile}
                          handleClickFile={handleClickFile}></Text>
                </div>
            </div>
        </div>
    );
}

export default Editor;