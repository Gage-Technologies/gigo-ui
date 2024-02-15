import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Grid,
    Card,
    CardActionArea,
    CardContent,
    Typography,
    CardMedia,
    Button,
    Box,
    PaletteMode,
    createTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import {useParams} from "react-router";
import SheenPlaceholder from "../components/Loading/SheenPlaceholder";
import {getAllTokens} from "../theme"; // Import if using React Router for navigation


type MarkdownFile = {
    name: string;
    content: string;
    imageUrl?: string; // Optional field to store the first image URL
};

const ArticlePage: React.FC = () => {
    let userPref = localStorage.getItem('theme');
    const [mode, _] = useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const { articleName } = useParams()
    const navigate = useNavigate()

    const [markdownContents, setMarkdownContents] = useState<string>("");

    const titlePlaceholderStyle: React.CSSProperties = {
        margin: "auto",
        opacity: 0.3,
        backdropFilter: "blur(15px)"
    }

    useEffect(() => {
        if (!articleName) {
            return
        }

        const owner = 'Gage-Technologies';
        const repo = 'blogs-gigo.dev';
        let url= `https://raw.githubusercontent.com/${owner}/${repo}/master/${articleName}.md`

        fetch(url).then(async (response) => {
            if (!response.ok) {
                // navigate("/articles");
                // setMarkdownContents("### Failed to download file: " + url + "\nStatus Code: " + response.status + "\nResponse: " + await response.text());
                return;
            }

            const content = await response.text();
            setMarkdownContents(content);
        });
    }, [articleName]);

    return (
        <>
            <style>{`
                .markdown-body img {
                    background-color: transparent !important;
                    border-radius: 10px;
                }
            `}</style>
            <Box
                id="article-container"
                sx={{width: "100%"}}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                alignContent={"center"}
            >
                <Box id="article-content" sx={{maxWidth: 800, width: "100%", m: 2}}>
                    {articleName && articleName.length > 0 ? (
                        <Typography variant="h4" gutterBottom>
                            {/* @ts-ignore */}
                            {articleName ? articleName.replaceAll("-", " ").replace('.md', '') : ""}
                        </Typography>
                    ) : (
                        <Box sx={{mb: 2}}>
                            <Box sx={titlePlaceholderStyle}>
                                <SheenPlaceholder width="400px" height={"45px"} />
                            </Box>
                        </Box>
                    )}
                    {markdownContents.length > 0 ? (
                        <MarkdownRenderer
                            markdown={markdownContents}
                            style={{
                                overflowWrap: 'break-word',
                                borderRadius: '10px',
                                padding: '0px',
                            }}
                        />
                    ) : (
                        <Box sx={titlePlaceholderStyle}>
                            <SheenPlaceholder width={`${Math.min(window.innerWidth - 300, 800)}px`} height={`${window.innerHeight - 300}px`} />
                        </Box>
                    )}
                    <Button href={"/articles"} style={{ marginTop: '20px' }} variant={"outlined"}>Back to list</Button>
                </Box>
            </Box>
        </>
    );
};



export default ArticlePage;
