import * as React from "react";
import { useEffect, useState } from "react";
import {Container, createTheme, Grid, CssBaseline, PaletteMode, ThemeProvider, Typography} from "@mui/material";
import { getAllTokens } from "../theme";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import AppWrapper from "../components/AppWrapper";
import swal from "sweetalert";
import {ThreeDots } from "react-loading-icons";
import Lottie from "react-lottie";
import * as animationData from "../img/85023-no-data.json";
import {Box, Button, Paper} from "@material-ui/core";
import ReactMarkdown from "react-markdown";
import styled from "@emotion/styled";
import {AwesomeButton} from "react-awesome-button";
import AceEditor from "react-ace";
// import "ace-builds/src-noconflict/mode-javascript"; // Example mode, change as needed
// import "ace-builds/src-noconflict/theme-monokai";
import 'ace-builds'
import 'ace-builds/webpack-resolver'
import {CodeComponent} from "react-markdown/lib/ast-to-react";

function Byte() {
    let userPref = localStorage.getItem('theme');
    const [mode, _] = useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    // Define the state and dispatch hook
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Define the state for your data and loading state
    const [byteData, setByteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState("// Write your code here...");
    const [isButtonActive, setIsButtonActive] = useState(false);

    // Define your API call logic here
    const loadData = async () => {
        // Implement your API call logic
        // Example: Set the byteData state with the response
    };

    const [markdown, setMarkdown] = useState("");

    const initialMarkdownContent = `
# Byte Instructions
**Objective:** Write a JavaScript function that logs "Hello, World!" to the console.

\`\`\`javascript
// Example:
function greet() {
    console.log("Hello, World!");
}
// Remember to call greet();
\`\`\`

Please write your code in the editor on the right.
`;

    useEffect(() => {
        setLoading(true);
        loadData().then(() => {
            setLoading(false);
            // Update this part to fetch and set your actual markdown content
            setMarkdown(initialMarkdownContent);
        });
    }, []);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    // Handle changes in the editor and activate the button
    const handleEditorChange = (newCode: string) => {
        setCode(newCode);
        if (newCode && newCode !== "// Write your code here...") {
            setIsButtonActive(true);
        } else {
            setIsButtonActive(false);
        }
    };

    const AnimatedAwesomeButton = styled(AwesomeButton)`
      .aws-btn__wrapper:before {
            border-radius: 25px;
            transition: box-shadow 0.3s ease;
            box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${theme.palette.primary.main}, 0 0 20px ${theme.palette.primary.main}, 0 0 25px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.main}, 0 0 35px ${theme.palette.primary.main};
        
            &:hover {
              box-shadow: 0 0 3px #fff, 0 0 6px #fff, 0 0 9px ${theme.palette.primary.main}, 0 0 12px ${theme.palette.primary.main}, 0 0 15px ${theme.palette.primary.main}, 0 0 18px ${theme.palette.primary.main}, 0 0 21px ${theme.palette.primary.main};
            }
        
            &:active {
              box-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px ${theme.palette.primary.main}, 0 0 8px ${theme.palette.primary.main}, 0 0 10px ${theme.palette.primary.main}, 0 0 12px ${theme.palette.primary.main}, 0 0 14px ${theme.palette.primary.main};
            }
        }
    `;

    interface SubmitButtonProps {
        isButtonActive: boolean;
    }

    // Styled AwesomeButton for the Submit button
    const SubmitButton = styled(AwesomeButton)<SubmitButtonProps>`
        position: absolute;
        bottom: 20px;
        right: 20px;
        &:before {
            transition: box-shadow 0.3s ease;
            box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ddd, 0 0 20px #ddd, 0 0 25px #ddd, 0 0 30px #ddd, 0 0 35px #ddd;
            border-radius: 25px;
        }
        &:hover:before {
            box-shadow: 0 0 3px #fff, 0 0 6px #fff, 0 0 9px #bbb, 0 0 12px #bbb, 0 0 15px #bbb, 0 0 18px #bbb, 0 0 21px #bbb;
        }
        &:active:before {
            box-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px #aaa, 0 0 8px #aaa, 0 0 10px #aaa, 0 0 12px #aaa, 0 0 14px #aaa;
        }
        background-color: ${props => props.isButtonActive ? theme.palette.secondary.main : theme.palette.primary.main};
        cursor: ${props => props.isButtonActive ? 'pointer' : 'not-allowed'};
    `;

    // Adjust the backgroundColor to be a slightly lighter shade
    const lighterBackground = theme.palette.mode === 'dark' ?
        'rgba(255, 255, 255, 0.1)' : // Lighter shade for dark mode
        'rgba(0, 0, 0, 0.1)';       // Lighter shade for light mode

    const combinedSectionStyle: React.CSSProperties = {
        display: 'flex',
        height: '80vh',
        width: '60vw',
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
        gap: "3%",
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', // Soft shadow for depth
        border: `1px solid ${theme.palette.grey[300]}`,
        padding: "1%", // Optional: Adds some space inside the border
    };

    const markdownSectionStyle: React.CSSProperties = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'transparent', // No background color here
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
    };

    const markdownContentStyle: React.CSSProperties = {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        overflowY: 'auto', // Allow vertical scrolling within the markdown section
        overflowX: 'hidden', // Prevent horizontal scrolling
        wordBreak: 'break-word', // Break long words to prevent horizontal scrolling
        whiteSpace: 'pre-wrap', // Wrap whitespace as necessary
    };

    const editorSectionStyle: React.CSSProperties = {
        flex: 1,
        // Standout for the editor, making it lighter
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.3)' : 'rgba(220, 220, 220, 0.3)',
        borderRadius: theme.shape.borderRadius,
    };

    // Style for markdown comment blocks
    const markdownBlockStyle: React.CSSProperties = {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(1),
        marginBottom: theme.spacing(1),
        wordBreak: 'break-word', // Ensure long words do not cause overflow
    };

    const submitButtonStyle = {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: '120px',
        backgroundColor: isButtonActive ? theme.palette.secondary.main : theme.palette.primary.main,
        color: 'white',
        cursor: isButtonActive ? 'pointer' : 'not-allowed',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
        transition: 'background-color 0.3s ease',
    };

    const CodeBlock: CodeComponent = ({ inline, className, children, ...props }) => {
        if (inline) {
            return <code className={className} {...props}>{children}</code>;
        }
        return (
            <pre style={markdownBlockStyle}>
        <code className={className} {...props}>{children}</code>
      </pre>
        );
    };

    interface TextBlockProps {
        children?: React.ReactNode;
        node?: any;
    }

    const TextBlock = ({ children, node, ...props }: TextBlockProps) => {
        return <p {...props}>{children}</p>;
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Container maxWidth="xl" style={{ marginTop: theme.spacing(4) }}>
                    <Typography variant="h4" component="h1" style={{ marginBottom: theme.spacing(2) }}>
                        Javascript console logs {/* Replace with dynamic title if needed */}
                    </Typography>
                    <div style={{ position: 'relative' }}> {/* Parent div for relative positioning */}
                        <div style={combinedSectionStyle}>
                            {/* Markdown Section */}
                            <div style={markdownSectionStyle}>
                                <div style={markdownContentStyle}>
                                    <ReactMarkdown components={{ code: CodeBlock, p: TextBlock }}>
                                        {markdown}
                                    </ReactMarkdown>
                                </div>
                                <AwesomeButton
                                    type="primary"
                                    style={{
                                        width: '40%',
                                        alignSelf: 'center',
                                        marginTop: 'auto',
                                        marginBottom: theme.spacing(2),
                                    }}
                                >
                                    Get Help
                                </AwesomeButton>
                            </div>
                            {/* Editor Section */}
                            <div style={editorSectionStyle}>
                                <AceEditor
                                    mode="javascript"
                                    theme="monokai"
                                    value={code}
                                    onChange={handleEditorChange}
                                    name="ACE_EDITOR_DIV"
                                    editorProps={{ $blockScrolling: true }}
                                    style={{ width: '100%', height: '100%', borderRadius: theme.shape.borderRadius }}
                                />
                            </div>
                        </div>
                        <SubmitButton
                            type={isButtonActive ? "secondary" : "primary"}
                            isButtonActive={isButtonActive}
                            disabled={!isButtonActive}
                            style={{
                                position: 'absolute',
                                right: "12%",
                            }}
                        >
                            Submit
                        </SubmitButton>
                    </div>
                </Container>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default Byte;
