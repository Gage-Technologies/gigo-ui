import React, {useState} from 'react';
import Files from './Files';
import { Scrollbars } from 'react-custom-scrollbars';
import {createTheme, PaletteMode} from "@mui/material";
import {getAllTokens} from "../../theme";

const WHITE = "#FFFFFF"
const CURRENTCOLOR = "currentColor"

interface SidebarProps {
    selectedFile: object
    handleFileSelect: any
    projectNames: string
    files: object[]
    repoId: string

}

function Sidebar({selectedFile, handleFileSelect, projectNames, files, repoId}: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selected_parent, setSelected] = useState([1, 0, 0, 0])
    const [elements, setElements] = useState([0])
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const handleClickSidebarItem = (selected: number[], i: number) => {
        if (!isOpen) {
            setIsOpen(true)
        } else if (isOpen && selected[i] === selected_parent[i]) {
            setIsOpen(false)
            setSelected([0, 0, 0, 0])
            return;
        } else if (isOpen && selected[i] !== selected_parent[i]) {
            setIsOpen(true)
        }
        setSelected(selected);

    }

    return (
        <Scrollbars
            style={{
                width: "18vw",
                height: "73vh",
                border: `1px solid ${theme.palette.primary.contrastText}`,
                borderRadius: 5
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
            <div className={"flex flex-row"} style={{overflow: "hidden", width: "17vw"}}>
                <div className={isOpen ? 'w-64' : 'w-0 bg-zinc-800'} style={isOpen ? {} : {backgroundColor: "zinc"}}>
                    {(selected_parent.indexOf(1) === 0 &&
                      <Files selectedFile={selectedFile} handleFileSelect={handleFileSelect} projectName={projectNames} files={files} repoId={repoId}/>)
                    }
                    {/* conditionally render via func, drill down to get i, return i form func and
                render specific exploerer element */}
                </div>
            </div>
        </Scrollbars>
    );
}

export default Sidebar;