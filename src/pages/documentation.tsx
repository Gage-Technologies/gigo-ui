

import * as React from "react";
import { useState, useEffect } from "react";
import {
    Box,
    createTheme,
    CssBaseline,
    Grid,
    PaletteMode,
    ThemeProvider,
    Typography,
} from "@mui/material";
import {getAllTokens} from "../theme";
import {Link, useNavigate } from "react-router-dom";
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import {useParams} from "react-router";
import TreeView from '@mui/lab/TreeView';
import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem';
import { styled } from '@mui/material/styles';
import { SvgIconProps } from '@mui/material/SvgIcon';
import {Article, Sailing} from "@mui/icons-material";
import BarChartIcon from '@mui/icons-material/BarChart';
import ExtensionIcon from '@mui/icons-material/Extension';
import KayakingIcon from '@mui/icons-material/Kayaking';
import TerminalIcon from '@mui/icons-material/Terminal';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import GitIcon from "../components/Icons/Git";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import TimerIcon from '@mui/icons-material/Timer';
import ReactGA from "react-ga4";

import CodeTeacherIcon from "../components/Icons/CodeTeacher";
import ProIcon from "../components/Icons/Pro";

declare module 'react' {
    interface CSSProperties {
        '--tree-view-color'?: string;
        '--tree-view-bg-color'?: string;
    }
}

type StyledTreeItemProps = TreeItemProps & {
    bgColor?: string;
    color?: string;
    labelIcon: React.ElementType<SvgIconProps>;
    labelInfo?: string;
    labelText: string;
    href?: string;
    labelStyling?: object;
};

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
    color: theme.palette.text.secondary,
    [`& .${treeItemClasses.content}`]: {
        color: theme.palette.text.secondary,
        borderRadius: "10px",
        paddingRight: "20px",
        fontWeight: theme.typography.fontWeightMedium,
        '&.Mui-expanded': {
            fontWeight: theme.typography.fontWeightRegular,
        },
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
            color: 'var(--tree-view-color)',
        },
        [`& .${treeItemClasses.label}`]: {
            fontWeight: 'inherit',
            color: 'inherit',
        },
    },
    [`& .${treeItemClasses.iconContainer}`]: {
        margin: 2,
        minHeight: "30px",
        minWidth: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    [`& .${treeItemClasses.label}`]: {
        minHeight: "30px",
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: 0,
        [`& .${treeItemClasses.content}`]: {
            marginLeft: 2,
        },
    },
}));

function StyledTreeItem(props: StyledTreeItemProps) {
    const {
        bgColor,
        color,
        labelIcon: LabelIcon,
        labelInfo,
        labelText,
        href,
        labelStyling,
        ...other
    } = props;

    let defaultedLabelStyling = labelStyling;
    if (defaultedLabelStyling === undefined) {
        defaultedLabelStyling = { fontWeight: 'inherit', flexGrow: 1 };
    }

    const renderItem = () => {
        return (
            <StyledTreeItemRoot
                icon={<LabelIcon fontSize={"large"} style={{ fontSize: "25px" }}/>}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0, pl: 0, ml: 0}}>
                        {/*<Box component={LabelIcon} color="inherit" sx={{ mr: 1, ml: 0, pl: 0 }} />*/}
                        <Typography variant="body2" sx={defaultedLabelStyling}>
                            {labelText}
                        </Typography>
                        <Typography variant="caption" color="inherit">
                            {labelInfo}
                        </Typography>
                    </Box>
                }
                style={{
                    '--tree-view-color': color,
                    '--tree-view-bg-color': bgColor,
                }}
                {...other}
            />
        )
    }

    if (href) {
        return (
            <Link to={href} style={{textDecoration: "none"}}>
                {renderItem()}
            </Link>
        )
    } else {
        return renderItem();
    }
}

function Documentation() {
    let userPref = localStorage.getItem("theme");

    const navigate = useNavigate();

    const [mode, setMode] = React.useState<PaletteMode>(
        userPref === "light" ? "light" : "dark"
    );

        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [loading, setLoading] = React.useState(false);
    const [markdownContent, setMarkdownContent] = useState("");
    const [selectedNode, setSelectedNode] = useState<string[]>([]);

    let {level1, level2, file} = useParams();

    const nodesToPaths = {
        "1": "introduction/intro.md",
        "2": "workspace/workspace_overview_1.md",
        "3": "workspace/base_docker_image/base_docker_image_2.md",
        "4": "workspace/resources_specified/resources_specified_3.md",
        "5": "workspace/vscode_extensions/vscode_extensions_4.md",
        "6": "workspace/docker_service/additional_docker_service_5.md",
        "7": "workspace/command_line_arguments/command_line_arguments_6.md",
        "8": "workspace/default_workspace_config/default_workspace_config_7.md"
    }

    ReactGA.initialize("G-38KBFJZ6M6");

    const pathsToNodes = {
        "introduction/intro.md": "1",
        "workspace/workspace_overview_1.md": "2",
        "workspace/base_docker_image/base_docker_image_2.md": "3",
        "workspace/resources_specified/resources_specified_3.md": "4",
        "workspace/vscode_extensions/vscode_extensions_4.md": "5",
        "workspace/docker_service/additional_docker_service_5.md": "6",
        "workspace/command_line_arguments/command_line_arguments_6.md": "7",
        "workspace/default_workspace_config/default_workspace_config_7.md": "8",
        "extension/extension_overview_1.md": "9",
        "extension/code_teacher/extension_code_teacher_2.md": "10",
        "extension/automatic_git/extension_automatic_git_3.md": "11",
        "extension/tutorial_viewer/extension_tutorial_viewer_4.md": "12",
        "extension/tutorial_creator/extension_tutorial_creator_5.md": "13",
        "extension/afk_setting/extension_afk_setting_6.md": "14",
        "pro/pro_overview_1.md": "15",
        "pro/pro_purchase_2.md": "16"
    }

    useEffect(() => {
        let url = (level2 !== undefined) ?
            `https://raw.githubusercontent.com/Gage-Technologies/gigo-documentation/master/${level1}/${level2}/${file}` :
            `https://raw.githubusercontent.com/Gage-Technologies/gigo-documentation/master/${level1}/${file}`

        fetch(url).then(async (response) => {
            if (!response.ok) {
                navigate("/documentation/introduction/intro.md");
                // setMarkdownContent("### Failed to download file: " + url + "\nStatus Code: " + response.status + "\nResponse: " + await response.text());
                return;
            }

            const content = await response.text();
            setMarkdownContent(content);
        });
    }, [level1, level2, file]);

    useEffect(() => {
        for (let key in pathsToNodes) {
            if (window.location.href.includes(key)) {
                // @ts-ignore
                setSelectedNode([pathsToNodes[key]]);
                return;
            }
        }
        setSelectedNode([]);
    }, [window.location.href]);

    if (level1 === undefined || file === undefined) {
        navigate("/documentation/introduction/intro.md");
        return (<div/>);
    }


    // @ts-ignore
    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Grid container>
                    <Grid item xs={2.5}>
                        <TreeView
                            aria-label="file system navigator"
                            // defaultCollapseIcon={<ExpandMore />}
                            // defaultExpandIcon={<ChevronRight />}
                            expanded={["2", "9", "15"]}
                            selected={selectedNode}
                            sx={{
                                top: '10vh',
                                height: '87vh',
                                flexGrow: 1,
                                minWidth: 50,
                                maxWidth: 450,
                                overflowY: 'hidden',
                                overflowX: 'hidden',
                                // borderRight: '1px solid grey',
                                position:'fixed'
                            }}
                        >
                            <StyledTreeItem
                                nodeId="1"
                                labelText="Introduction"
                                labelIcon={Article}
                                // bgColor={"#265d9a"}
                                // color={"#fa0000"}
                                href={`${window.location.origin}/documentation/introduction/intro.md`}
                                bgColor={window.location.href.includes("introduction/intro.md") ? theme.palette.background.paper : undefined}
                            >
                            </StyledTreeItem>
                            <StyledTreeItem
                                nodeId="2"
                                labelText="DevSpace"
                                labelIcon={Article}
                                href={`${window.location.origin}/documentation/workspace/workspace_overview_1.md`}
                                bgColor={window.location.href.includes("workspace/workspace_overview_1.md") ? theme.palette.background.paper : undefined}
                            >
                                <StyledTreeItem
                                    sx={{
                                        paddingLeft: "20px",
                                    }}
                                    nodeId="3"
                                    labelText="Base Docker Image"
                                    labelIcon={Sailing}
                                    href={`${window.location.origin}/documentation/workspace/base_docker_image/base_docker_image_2.md`}
                                    bgColor={window.location.href.includes("workspace/base_docker_image/base_docker_image_2.md") ? theme.palette.background.paper : undefined}
                                />
                                <StyledTreeItem
                                    sx={{paddingLeft: "20px"}}
                                    nodeId="4" labelText="Resources Specified"
                                    labelIcon={BarChartIcon}
                                    href={`${window.location.origin}/documentation/workspace/resources_specified/resources_specified_3.md`}
                                    bgColor={window.location.href.includes("workspace/resources_specified/resources_specified_3.md") ? theme.palette.background.paper : undefined}
                                />
                                <StyledTreeItem
                                    sx={{paddingLeft: "20px"}}
                                    nodeId="5"
                                    labelText="Vscode Extensions"
                                    labelIcon={ExtensionIcon}
                                    href={`${window.location.origin}/documentation/workspace/vscode_extensions/vscode_extensions_4.md`}
                                    bgColor={window.location.href.includes("workspace/vscode_extensions/vscode_extensions_4.md") ? theme.palette.background.paper : undefined}
                                />
                                <StyledTreeItem
                                    sx={{paddingLeft: "20px"}}
                                    nodeId="6"
                                    labelText="Additional Docker Services"
                                    labelIcon={KayakingIcon}
                                    href={`${window.location.origin}/documentation/workspace/docker_service/additional_docker_service_5.md`}
                                    bgColor={window.location.href.includes("workspace/docker_service/additional_docker_service_5.md") ? theme.palette.background.paper : undefined}
                                />
                                <StyledTreeItem
                                    sx={{paddingLeft: "20px"}}
                                    nodeId="7"
                                    labelText="Command Line Arguments"
                                    labelIcon={TerminalIcon}
                                    href={`${window.location.origin}/documentation/workspace/command_line_arguments/command_line_arguments_6.md`}
                                    bgColor={window.location.href.includes("workspace/command_line_arguments/command_line_arguments_6.md") ? theme.palette.background.paper : undefined}
                                />
                                <StyledTreeItem
                                    sx={{marginLeft: "20px"}}
                                    nodeId="8"

                                    labelText="Default DevSpace Config"
                                    labelIcon={InsertDriveFileIcon}
                                    href={`${window.location.origin}/documentation/workspace/default_workspace_config/default_workspace_config_7.md`}
                                    bgColor={window.location.href.includes("workspace/default_workspace_config/default_workspace_config_7.md") ? theme.palette.background.paper : undefined}
                                />
                            </StyledTreeItem>
                            <StyledTreeItem
                                nodeId="9"
                                labelText="Extension"
                                labelIcon={Article}
                                sx={{

                                    maxWidth: "80%",
                                    left: "50",
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                href={`${window.location.origin}/documentation/extension/extension_overview_1.md`}
                                bgColor={window.location.href.includes("extension/extension_overview_1.md") ? theme.palette.background.paper : undefined}
                            >
                                <StyledTreeItem
                                    sx={{
                                        paddingLeft: "20px",
                                    }}
                                    nodeId="10"
                                    labelText="Code Teacher"
                                    labelIcon={CodeTeacherIcon}
                                    href={`${window.location.origin}/documentation/extension/code_teacher/extension_code_teacher_2.md`}
                                    bgColor={window.location.href.includes("extension/code_teacher/extension_code_teacher_2.md") ? theme.palette.background.paper : undefined}
                                />
                                <StyledTreeItem
                                    sx={{paddingLeft: "20px"}}
                                    nodeId="11" labelText="Automatic Git"
                                    labelIcon={GitIcon}
                                    href={`${window.location.origin}/documentation/extension/automatic_git/extension_automatic_git_3.md`}
                                    bgColor={window.location.href.includes("extension/automatic_git/extension_automatic_git_3.md") ? theme.palette.background.paper : undefined}
                                />
                                <StyledTreeItem
                                    sx={{paddingLeft: "20px"}}
                                    nodeId="12"
                                    labelText="Tutorial Viewer"
                                    labelIcon={AutoStoriesIcon}
                                    href={`${window.location.origin}/documentation/extension/tutorial_viewer/extension_tutorial_viewer_4.md`}
                                    bgColor={window.location.href.includes("extension/tutorial_viewer/extension_tutorial_viewer_4.md") ? theme.palette.background.paper : undefined}
                                />
                                <StyledTreeItem
                                    sx={{paddingLeft: "20px"}}
                                    nodeId="13"
                                    labelText="Tutorial Creator"
                                    labelIcon={NoteAltIcon}
                                    href={`${window.location.origin}/documentation/extension/tutorial_creator/extension_tutorial_creator_5.md`}
                                    bgColor={window.location.href.includes("extension/tutorial_creator/extension_tutorial_creator_5.md") ? theme.palette.background.paper : undefined}
                                />
                                <StyledTreeItem
                                    sx={{paddingLeft: "20px"}}
                                    nodeId="14"
                                    labelText="AFK Setting"
                                    labelIcon={TimerIcon}
                                    href={`${window.location.origin}/documentation/extension/afk_setting/extension_afk_setting_6.md`}
                                    bgColor={window.location.href.includes("extension/afk_setting/extension_afk_setting_6.md") ? theme.palette.background.paper : undefined}
                                />
                            </StyledTreeItem>
                            <StyledTreeItem
                                nodeId="15"
                                labelText="Pro"
                                labelIcon={Article}
                                sx={{

                                    maxWidth: "80%",
                                    left: "50",
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                href={`${window.location.origin}/documentation/pro/pro_overview_1.md`}
                                bgColor={window.location.href.includes("pro/pro_overview_1.md") ? theme.palette.background.paper : undefined}
                            >
                                <StyledTreeItem
                                    sx={{
                                        paddingLeft: "20px",
                                    }}
                                    nodeId="16"
                                    labelText="Get Pro"
                                    labelIcon={ProIcon}
                                    href={`${window.location.origin}/documentation/pro/pro_purchase_2.md`}
                                    bgColor={window.location.href.includes("pro/pro_purchase_2.md") ? theme.palette.background.paper : undefined}
                                />
                            </StyledTreeItem>
                        </TreeView>
                    </Grid>
                    <Grid item xs={9.5}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                width: "100%",
                            }}
                        >
                            <MarkdownRenderer
                                markdown={markdownContent}
                            />
                        </div>
                    </Grid>
                </Grid>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default Documentation;