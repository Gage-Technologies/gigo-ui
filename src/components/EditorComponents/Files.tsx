import React, {useState} from 'react';
import {RiArrowDownSLine, RiArrowRightSLine} from 'react-icons/ri';
import FILE_ICONS from './FileIcons';
import {Button, ButtonBase, createTheme, PaletteMode, useMediaQuery} from "@mui/material";
import {getAllTokens} from "../../theme";
import call from "../../services/api-call";
import config from "../../config";
import swal from "sweetalert";
import {ThreeDots} from "react-loading-icons";
import FolderIcon from '@mui/icons-material/Folder';
import {initialAuthStateUpdate, updateAuthState} from "../../reducers/auth/auth";
import {useNavigate} from "react-router-dom";

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

function Tree({children}: Children) {
    return (
        <div style={{height: "auto"}}>
            {children}
        </div>
    )
}

function File({name, padding, handleFileSelect, selected, selectedFile}: Name) {

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
                {FILE_ICONS[ext] || <div/>}
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
            {FILE_ICONS[ext] || <div/>}
            <span className="ml-1 font-['Consolas', 'Courier New', 'monospace'] text-sm">{name}</span>
        </div>
    )
}

function Folder({children, name, padding, filepath, repoId, handleFileSelect, selectedFile}: ChildrenName) {
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
            {repo_id: repoId, ref: "main", filepath: filepath},
            null,
            config.rootPath
        )
        if (res !== undefined && res["message"] !== undefined){
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
                        <RiArrowDownSLine/>
                        <FolderIcon style={{fontSize: "small"}}/>
                    </div>
                    :
                    <div>
                        <ButtonBase>
                            <RiArrowRightSLine onClick={() =>
                                GetDirectoryData(filepath, repoId)
                            }/>
                            <FolderIcon style={{fontSize: "small"}}/>
                        </ButtonBase>
                    </div>
                }
                <span style={{fontSize: "large", fontWeight: "normal"}}>{nameElement}</span>
            </div>
            <div
                style={isOpen ? {height: "auto", overflow: "hidden"} : {height: 0, overflow: "hidden"}}>
                {loading ? (
                    <div>
                        <ThreeDots
                            height="50"
                            width="50"
                            radius="9"
                            color="#4fa94d"
                        />
                    </div>
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
                                            data["name"]} selected={selectedFile !== undefined && selectedFile === data} padding={"60px"} handleFileSelect={handleFileSelect} selectedFile={data}/>
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

function Files({selectedFile, handleFileSelect, projectName, files, repoId}: FilesProps) {
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
    //className="flex flex-col w-fit h-screen text-white bg-zinc-800"
    //className='flex flex-row h-8 justify-start items-center'



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
            <div style={{display: "flex", flexDirection: "row", justifyContent: "start", alignItems: "center"}}>
                <h1 style={{fontSize: "medium"}}>{projectName.toUpperCase()}</h1>
            </div>
            <Tree>
                {files.map((file) => {
                    return (
                        <div style={{
                            paddingBottom: "2.5px",
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
                                    file["name"]} selected={selectedFile === file} padding={"40px"} handleFileSelect={handleFileSelect} selectedFile={file}/>
                            )}
                        </div>
                    )
                })}
                {/*<Tree.Folder name={FILES[0]} bold={true} padding={"0px"}>*/}
                {/*    <Tree.Folder name={FILES[1]} bold={false} padding={"20px"}>*/}
                {/*        <Tree.Folder name={FILES[2]} bold={false} padding={"40px"}>*/}
                {/*            <Tree.File name={FILES[3]} selected={selectedFile === FILES[3]} padding={"60px"}*/}
                {/*                       handleFileSelect={handleFileSelect}/>*/}
                {/*            <Tree.File name={FILES[4]} selected={selectedFile === FILES[4]} padding={"60px"}*/}
                {/*                       handleFileSelect={handleFileSelect}/>*/}
                {/*        </Tree.Folder>*/}
                {/*        <Tree.Folder name={FILES[5]} bold={false} padding={"40px"}>*/}
                {/*            <Tree.File name={FILES[6]} selected={selectedFile === FILES[6]} padding={"60px"}*/}
                {/*                       handleFileSelect={handleFileSelect}/>*/}
                {/*            <Tree.File name={FILES[7]} selected={selectedFile === FILES[7]} padding={"60px"}*/}
                {/*                       handleFileSelect={handleFileSelect}/>*/}
                {/*            <Tree.File name={FILES[8]} selected={selectedFile === FILES[8]} padding={"60px"}*/}
                {/*                       handleFileSelect={handleFileSelect}/>*/}
                {/*        </Tree.Folder>*/}
                {/*        <Tree.Folder name={FILES[10]} bold={false} padding={"40px"}>*/}
                {/*            <Tree.File name={FILES[11]} selected={selectedFile === FILES[11]} padding={"60px"}*/}
                {/*                       handleFileSelect={handleFileSelect}/>*/}
                {/*            <Tree.File name={FILES[12]} selected={selectedFile === FILES[12]} padding={"60px"}*/}
                {/*                       handleFileSelect={handleFileSelect}/>*/}
                {/*            <Tree.File name={FILES[13]} selected={selectedFile === FILES[13]} padding={"60px"}*/}
                {/*                       handleFileSelect={handleFileSelect}/>*/}
                {/*        </Tree.Folder>*/}
                {/*        <Tree.File name={FILES[14]} selected={selectedFile === FILES[14]} padding={"60px"}*/}
                {/*                   handleFileSelect={handleFileSelect}/>*/}
                {/*        <Tree.File name={FILES[15]} selected={selectedFile === FILES[15]} padding={"60px"}*/}
                {/*                   handleFileSelect={handleFileSelect}/>*/}
                {/*    </Tree.Folder>*/}
                {/*    <Tree.File name={FILES[16]} selected={selectedFile === FILES[16]} padding={"20px"}*/}
                {/*               handleFileSelect={handleFileSelect}/>*/}
                {/*</Tree.Folder>*/}
            </Tree>
        </div>
    );
}

export default Files;
