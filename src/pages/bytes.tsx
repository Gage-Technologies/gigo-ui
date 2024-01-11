import * as React from "react";
import { useEffect, useState } from "react";
import {Container, createTheme, Grid, CssBaseline, PaletteMode, ThemeProvider, Typography} from "@mui/material";
import { getAllTokens } from "../theme";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import AppWrapper from "../components/AppWrapper";
import swal from "sweetalert";
import * as animationData from "../img/85023-no-data.json";
import ReactMarkdown from "react-markdown";
import styled from "@emotion/styled";
import {AwesomeButton} from "react-awesome-button";
import AceEditor from "react-ace";
import call from "../services/api-call";
import 'ace-builds'
import 'ace-builds/webpack-resolver'
import {CodeComponent} from "react-markdown/lib/ast-to-react";
import ByteSelectionMenu from "../components/ByteSelectionMenu";
import config from "../config";

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
    const [output, setOutput] = useState("");
    const [currentByteTitle, setCurrentByteTitle] = useState("");

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

    const getRecommendedBytes = async () => {
        let recommendedBytes = await call(
            "/api/bytes/getRecommendedBytes",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        );

        const [res] = await Promise.all([recommendedBytes]);

        if (res === undefined) {
            swal("Server Error", "Cannot fetch recommended bytes. Please try again later.");
            return;
        }

        if (res["rec_bytes"] === undefined) {
            swal("Server Error", "Cannot fetch recommended bytes. Please try again later.");
            return;
        }

        if (res["rec_bytes"]) {
            setByteData(res["rec_bytes"]);
        } else {
            swal("No Bytes Found", "No recommended bytes found.");
        }
    };

    // Function to fetch the full metadata of a byte
    const getByte = async (byteId: string) => {
        try {
            const response = await call(
                "/api/bytes/getByte",
                "POST",
                null,
                null,
                null,
                // @ts-ignore
                { byte_id: byteId },
                null,
                config.rootPath
            );

            const [res] = await Promise.all([response]);

            if (res === undefined) {
                swal("Server Error", "Cannot fetch byte data. Please try again later.");
                return;
            }

            if (res["rec_bytes"]) {
                setCurrentByteTitle(res["rec_bytes"].name);

                // Adjusting the format of outline_content
                const formattedOutlineContent = res["rec_bytes"].outline_content.split('\n').map((line: string) => line.trim()).join('\n'); // Changed from ' ' to '\n'

                // Setting the markdown content
                setMarkdown(`### Description\n${res["rec_bytes"].description}\n\n### Outline\n${formattedOutlineContent}\n\n### Development Steps\n${res["rec_bytes"].dev_steps}`);
            } else {
                swal("Byte Not Found", "The requested byte could not be found.");
            }
        } catch (error) {
            swal("Error", "An error occurred while fetching the byte data.");
        }
    };

    function getByteIdFromUrl() {
        const currentUrl = window.location.href;
        let urlParts = currentUrl.split('/');
        // Remove any empty strings from the end of the array (caused by trailing slashes)
        urlParts = urlParts.filter(part => part !== '');
        const byteId = urlParts[urlParts.length - 1];
        return byteId;
    }

    const startByteAttempt = async (byteId: string) => {
        try {
            const response = await call(
                "/api/bytes/startByteAttempt",
                "POST",
                null,
                null,
                null,
                // @ts-ignore
                { byte_id: byteId },
                null,
                config.rootPath
            );

            const [res] = await Promise.all([response]);

            if (res === undefined) {
                swal("Server Error", "Cannot fetch byte data. Please try again later.");
                return;
            }

            if (res["byte_attempt"] !== undefined && res["byte_attempt"]["content"] !== "") {
                setCode(res["byte_attempt"]["content"]);
            }
        } catch (error) {
            swal("Error", "An error occurred while fetching the byte attempt data.");
        }
    };

    useEffect(() => {
        const byteId = getByteIdFromUrl();
        setLoading(true);
        getByte(byteId);
        startByteAttempt(byteId);
        getRecommendedBytes().then(() => {
            setLoading(false);
        });
        setMarkdown(initialMarkdownContent);
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

    const bytes = [
        {
            id: "1688617436791701504",
            title: "Python Basics: From Hello World to Classes",
            content: "Dive into the world of Python programming with this beginner-friendly project...",
            bytesThumb: "/static/posts/t/1688617436791701504"
        },
        {
            id: "1688570643030736896",
            title: "Introduction to Golang: Master the Basics",
            content: "Dive into the world of Golang with this introductory project...",
            bytesThumb: "/static/posts/t/1688570643030736896"
        },
        {
            id: "1688638972722413568",
            title: "Java Basics: Syntax and Structure",
            content: "Dive into the world of Java with this beginner-friendly project...",
            bytesThumb: "/static/posts/t/1688638972722413568"
        },
        {
            id: "1688940677359992832",
            title: "JavaScript Syntax Basics",
            content: "Learn the basics of JavaScript syntax and explore examples...",
            bytesThumb: "/static/posts/t/1688940677359992832"
        },
        {
            id: "1693725878338453504",
            title: "Mastering Visual Studio Code",
            content: "Learn how to use Visual Studio Code and its various features to enhance your coding experience.",
            bytesThumb: "/static/posts/t/1693725878338453504"
        }
        // ... potentially more bytes
    ];

    const handleSelectByte = (id: string) => {
        getByte("999");
    };


    interface SubmitButtonProps {
        isButtonActive: boolean;
        onClick?: () => void;
    }

    // Styled AwesomeButton for the Submit button
    const SubmitButton = styled(AwesomeButton)<SubmitButtonProps>`
      position: absolute;
      bottom: 20px;
      right: 20px;
      &:before {
        transition: box-shadow 0.3s ease;
        box-shadow: ${props => props.isButtonActive ? '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ddd, 0 0 20px #ddd, 0 0 25px #ddd, 0 0 30px #ddd, 0 0 35px #ddd' : 'none'};
        border-radius: 25px;
      }
      &:hover:before {
        box-shadow: ${props => props.isButtonActive ? '0 0 3px #fff, 0 0 6px #fff, 0 0 9px #bbb, 0 0 12px #bbb, 0 0 15px #bbb, 0 0 18px #bbb, 0 0 21px #bbb' : 'none'};
      }
      &:active:before {
        box-shadow: ${props => props.isButtonActive ? '0 0 2px #fff, 0 0 4px #fff, 0 0 6px #aaa, 0 0 8px #aaa, 0 0 10px #aaa, 0 0 12px #aaa, 0 0 14px #aaa' : 'none'};
      }
      background-color: ${props => props.isButtonActive ? theme.palette.secondary.main : theme.palette.primary.main};
      cursor: ${props => props.isButtonActive ? 'pointer' : 'not-allowed'};
    `;

    const combinedSectionStyle: React.CSSProperties = {
        display: 'flex',
        height: '80vh', // Adjust height as needed
        width: '60vw',
        marginLeft: '5%',
        marginRight: 'auto',
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
        gap: "3%",
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
        border: `1px solid ${theme.palette.grey[300]}`,
        padding: "1%",
    };

    const mainLayoutStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '1rem', // Add a gap between the main content and the menu
        marginTop: '1rem'
    };

    // Byte selection menu style
    const byteSelectionMenuStyle: React.CSSProperties = {
        width: '20%', // Adjust the width as needed
        maxHeight: '80vh', // Adjust the height as needed
        overflow: 'auto'
    };

    const containerStyle: React.CSSProperties = {
        width: '100%',
        padding: theme.spacing(0), // Remove vertical padding
        margin: '0',
        maxWidth: 'none',
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

    // Style for markdown comment blocks
    const markdownBlockStyle: React.CSSProperties = {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(1),
        marginBottom: theme.spacing(1),
        wordBreak: 'break-word', // Ensure long words do not cause overflow
    };

    const editorAndTerminalStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%', // Use the full height of the parent container
    };

// Adjust the height of the AceEditor and TerminalOutput
    const aceEditorStyle: React.CSSProperties = {
        width: '100%',
        height: 'calc(100% - 100px)', // Adjust height as needed, minus the height of the terminal
        borderRadius: theme.shape.borderRadius,
    };

    const terminalOutputStyle: React.CSSProperties = {
        backgroundColor: "#333",
        color: "lime",
        fontFamily: "monospace",
        padding: "10px",
        marginTop: "20px",
        borderRadius: "5px",
        whiteSpace: "pre-wrap",
        height: '100px', // Set the height of the terminal
    };

    const titleStyle: React.CSSProperties = {
        marginBottom: theme.spacing(2),
        textAlign: 'center', // Center align the title
        width: '60vw', // Match the width of the byte container
        marginLeft: '5%', // Align with the left margin of the byte container
    };

    let originalConsoleLog = console.log;

    const executeCode = () => {
        try {
            let capturedOutput = "";
            console.log = (...args) => {
                capturedOutput += args.join(" ") + "\n";
            };

            eval(code);

            console.log = originalConsoleLog; // Restore original console.log
            setOutput(capturedOutput);
        } catch (e) {
            console.log = originalConsoleLog; // Restore in case of error
            if (e instanceof Error) {
                setOutput("Error: " + e.message);
            } else {
                setOutput("Error: Unknown error occurred");
            }
        }
    };

    interface TerminalOutputProps {
        output: string;
        style?: React.CSSProperties;
    }

    const TerminalOutput: React.FC<TerminalOutputProps> = ({ output, style }) => (
        <div style={{
            ...{
                backgroundColor: "#333",
                color: "lime",
                fontFamily: "monospace",
                padding: "10px",
                marginTop: "20px",
                borderRadius: "5px",
                whiteSpace: "pre-wrap"
            },
            ...style
        }}>
            {output || "No output"}
        </div>
    );

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
                <Container maxWidth="xl" style={containerStyle}>
                    <Typography variant="h4" component="h1" style={titleStyle}>
                        {currentByteTitle}
                    </Typography>
                    <div style={mainLayoutStyle}>
                        <div style={combinedSectionStyle}>
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
                            <div style={editorAndTerminalStyle}>
                                <AceEditor
                                    mode="javascript"
                                    theme="monokai"
                                    value={code}
                                    onChange={handleEditorChange}
                                    name="ACE_EDITOR_DIV"
                                    editorProps={{ $blockScrolling: true }}
                                    style={aceEditorStyle}
                                />
                                <TerminalOutput output={output} style={terminalOutputStyle} />
                            </div>
                            {isButtonActive && (
                                <SubmitButton
                                    style={{
                                        right: '22%',
                                        marginBottom: `2%`
                                    }}
                                    type="primary"
                                    onClick={executeCode}
                                    isButtonActive={isButtonActive}
                                >
                                    Submit Code
                                </SubmitButton>
                            )}
                        </div>
                        <div style={byteSelectionMenuStyle}>
                            {byteData && <ByteSelectionMenu bytes={byteData} onSelectByte={handleSelectByte} />}
                        </div>
                    </div>
                </Container>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default Byte;
