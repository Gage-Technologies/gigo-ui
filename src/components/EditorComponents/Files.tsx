import React, { useState } from 'react';
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri';
import FILE_ICONS from './FileIcons';
import { Box, Button, ButtonBase, CircularProgress, createTheme, PaletteMode, useMediaQuery } from "@mui/material";
import { getAllTokens } from "../../theme";
import call from "../../services/api-call";
import config from "../../config";
import swal from "sweetalert";
import { ThreeDots } from "react-loading-icons";
import FolderIcon from '@mui/icons-material/Folder';
import { initialAuthStateUpdate, updateAuthState } from "../../reducers/auth/auth";
import { useNavigate } from "react-router-dom";

interface Children {
    children: React.ReactNode;
}

interface ChildrenName {
    children: React.ReactNode;
    name: string;
    padding: string;
    filepath: string;
    repoId: string
    handleFileSelect: any
    selectedFile: object
}

interface Name {
    name: string;
    padding: string;
    handleFileSelect: any
    selected: boolean
    selectedFile: any
}

function Tree({ children }: Children) {
    return (
        <div style={{ height: "auto" }}>
            {children}
        </div>
    )
}

function File({ name, padding, handleFileSelect, selected, selectedFile }: Name) {

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

    let ext = name.split('.')[1]

    const handleClick = () => {
        handleFileSelect(selectedFile);
    }

    if (selected) {
        //className={'flex items-center cursor-pointer bg-zinc-600 ' + padding}
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "zinc",
                opacity: .7,
                paddingLeft: padding,
                height: "auto",
                cursor: "pointer"
            }} onClick={handleClick}>
                {FILE_ICONS[ext] || <div />}
                <span className="ml-1 font-['Consolas', 'Courier New', 'monospace'] text-sm">{name}</span>
            </div>
        )
    }

    //className={'flex items-center cursor-pointer hover:bg-zinc-700 ' + padding

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "zinc",
            opacity: 1,
            paddingLeft: padding,
            height: "auto",
            cursor: "pointer"
        }} onClick={handleClick}>
            {FILE_ICONS[ext] || <div />}
            <span className="ml-1 font-['Consolas', 'Courier New', 'monospace'] text-sm">{name}</span>
        </div>
    )
}

function Folder({ children, name, padding, filepath, repoId, handleFileSelect, selectedFile }: ChildrenName) {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (filepath: string, repoId: string) => {
        GetDirectoryData(filepath, repoId)
        setIsOpen(!isOpen);
    }

    const GetDirectoryData = async (filepath: string, repoId: string) => {
        setLoading(true)
        let res = await call(
            "/api/project/getProjectDirectories",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            { repo_id: repoId, ref: "main", filepath: filepath },
            null,
            config.rootPath
        )
        if (res !== undefined && res["message"] !== undefined) {
            setFolderData(res["message"])
            setLoading(false)
        } else {
            setLoading(false)
            swal("Unable to get directly data at this time. Please try again later.")
        }
    }

    const [folderData, setFolderData] = React.useState([])
    const [loading, setLoading] = React.useState(false)

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


    let nameElement = name

    //className={'flex items-center cursor-pointer hover:bg-zinc-700 ' + padding}

    function extractNumber(name: string): number {
        const match = name.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0
    }

    // organize the source code alphabetically first, then numerically
    folderData.sort((a, b) => {
        // @ts-ignore
        const prefixA = a.name.replace(/\d+/g, '');
        // @ts-ignore
        const prefixB = b.name.replace(/\d+/g, '');

        if (prefixA < prefixB) return -1;
        if (prefixA > prefixB) return 1;

        // @ts-ignore
        return extractNumber(a.name) - extractNumber(b.name);
    });


    return (
        <div className=''>
            <div style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                paddingLeft: padding,
                height: "30px",
                paddingBottom: "5px",
            }} onClick={() =>
                handleToggle(filepath, repoId)
            }>
                {isOpen ?
                    <div>
                        <RiArrowDownSLine />
                        <FolderIcon style={{ fontSize: "small" }} />
                    </div>
                    :
                    <div>
                        <ButtonBase>
                            <RiArrowRightSLine onClick={() =>
                                GetDirectoryData(filepath, repoId)
                            } />
                            <FolderIcon style={{ fontSize: "small" }} />
                        </ButtonBase>
                    </div>
                }
                <span style={{ fontSize: "small", fontWeight: "normal" }}>{nameElement}</span>
            </div>
            <div
                style={isOpen ? { height: "auto", overflow: "hidden" } : { height: 0, overflow: "hidden" }}>
                {loading ? (
                    <Box>
                        <CircularProgress
                            color="inherit"
                            size={16}
                            sx={{
                                marginLeft: "40px"
                            }}
                        />
                    </Box>
                ) : (
                    <div style={{
                        paddingBottom: "5px",
                    }}>
                        {folderData.map((data) => {
                            return (
                                <div>
                                    {data["type"] === "dir" ? (
                                        <Tree.Folder name={
                                            //@ts-ignore
                                            data["name"]} padding={"40px"} filepath={
                                                //@ts-ignore
                                                data["path"]
                                            } repoId={repoId} handleFileSelect={handleFileSelect} selectedFile={selectedFile}>
                                        </Tree.Folder>
                                    ) : (
                                        <Tree.File name={
                                            //@ts-ignore
                                            data["name"]} selected={selectedFile !== undefined && selectedFile === data} padding={"40px"} handleFileSelect={handleFileSelect} selectedFile={data} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

Tree.File = File;
Tree.Folder = Folder;

interface FilesProps {
    selectedFile: object
    handleFileSelect: any
    projectName: string
    files: object[];
    repoId: string
}

function Files({ selectedFile, handleFileSelect, projectName, files, repoId }: FilesProps) {
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



    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            width: "fit-content",
            height: "100%",
            alignItems: "start",
            paddingLeft: "5px",
            paddingRight: "10px"
        }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "start", alignItems: "center" }}>
                <h1 style={{ fontSize: "medium", marginLeft: "10px" }}>{"Project Files"}</h1>
            </div>
            <Tree>
                {(files && files.length > 0) && files.map((file) => {
                    return (
                        <div style={{
                            paddingBottom: "2.5px",
                            fontSize: "small"
                        }}>
                            {
                                //@ts-ignore
                                file["type"] === "dir" ? (
                                    <Tree.Folder name={
                                        //@ts-ignore
                                        file["name"]} padding={"20px"} filepath={
                                            //@ts-ignore
                                            file["path"]
                                        } repoId={repoId} handleFileSelect={handleFileSelect} selectedFile={selectedFile}>
                                    </Tree.Folder>
                                ) : (
                                    <Tree.File name={
                                        //@ts-ignore
                                        file["name"]} selected={selectedFile === file} padding={"40px"} handleFileSelect={handleFileSelect} selectedFile={file} />
                                )}
                        </div>
                    )
                })}
            </Tree>
        </div>
    );
}

export default Files;
