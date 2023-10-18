import React from 'react';
import {IoMdClose} from 'react-icons/io'
import FILE_ICONS from './FileIcons';
import {createTheme, PaletteMode, useMediaQuery} from "@mui/material";
import {getAllTokens} from "../../theme";


interface FileTabProps {
    file: string;
    selected: Boolean
    handleCloseFile: any
    handleClickFile: any
}

function FileTab({file, selected, handleCloseFile, handleClickFile}: FileTabProps) {

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

    let ext = file.split('.')[1]

    if (selected) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme.palette.primary.main,
                paddingLeft: "5px",
                borderRadius: 5,
                cursor: "pointer"
            }} onClick={(e) => {
                handleClickFile(e, file)
            }}>
                {FILE_ICONS[ext]}
                <span className="ml-1 pr-1 font-['Consolas', 'Courier New', 'monospace'] text-sm"
                      style={{paddingLeft: "2px"}}>{file}</span>
                <div onClick={(e) => {
                    handleCloseFile(e, file)
                }} style={{padding: "2px"}}>
                    <IoMdClose className='text-zinc-200 hover:bg-zinc-600 rounded-sm'/>
                </div>
            </div>
        )
    }


    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: "5px",
            borderRadius: 5,
            cursor: "pointer"
        }} onClick={(e) => {
            handleClickFile(e, file)
        }}>
            {FILE_ICONS[ext]}
            <span className="ml-1 pr-1 font-['Consolas', 'Courier New', 'monospace'] text-sm"
                  style={{paddingLeft: "2px"}}>{file}</span>
            <div onClick={(e) => {
                handleCloseFile(e, file)
            }} style={{padding: "2px"}}>
                <IoMdClose className='text-zinc-700 group-hover:text-zinc-400 hover:bg-zinc-600 rounded-sm'/>
            </div>
        </div>
    );
}

export default FileTab;