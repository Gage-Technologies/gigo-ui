import React, { useEffect, useState } from 'react';
import {Grid, Card, CardActionArea, CardContent, Typography, CardMedia, Button, Box} from '@mui/material';


type MarkdownFile = {
    name: string;
    content: string;
    imageUrl?: string;
    date: string; // Added date field
};


function parseCustomDate(dateStr: any) {
    // Assuming dateStr is in M-D-YY format
    const [month, day, year] = dateStr.split('-').map(Number);
    // Adjust the year based on your century cutoff logic
    console.log('date: ', month, day, year);
    return new Date(year, month - 1, day);
}


const ArticlesPage: React.FC = () => {
    const [markdownContents, setMarkdownContents] = useState<MarkdownFile[]>([]);

    useEffect(() => {
        const listRepoContents = async () => {
            const owner = 'Gage-Technologies';
            const repo = 'blogs-gigo.dev';
            const path = ''; // Specify a directory if needed
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

            try {
                const response = await fetch(apiUrl);
                const data: { name: string; download_url: string; }[] = await response.json();
                return data.filter(file => file.name.endsWith('.md') && file.name !== 'README.md');
            } catch (error) {
                console.error('Error listing repository contents:', error);
                return [];
            }
        };

        listRepoContents().then(markdownFiles => {
            const contentsPromises = markdownFiles.map(file =>
                fetch(file.download_url).then(response => response.text())
            );

            Promise.all(contentsPromises).then(contents => {
                let filesContent: MarkdownFile[] = markdownFiles.map((file, index) => {
                    const content = contents[index];
                    const firstLine = content.split('\n')[0].trim();
                    const dateMatch = firstLine.match(/^\d{1,2}-\d{1,2}-\d{4}$/);
                    const dateStr = dateMatch ? dateMatch[0] : 'Unknown Date';
                    const imageUrlMatch = content.match(/!\[.*?\]\((.*?)\)/);
                    const imageUrl = imageUrlMatch ? imageUrlMatch[1] : undefined;

                    return {
                        name: file.name.replaceAll("-", " ").replace('.md', ''),
                        content: content.replace(firstLine + '\n', '').trim(),
                        imageUrl,
                        date: dateStr,
                    };
                });

                // Sort the articles by date
                filesContent = filesContent.sort((a, b) => {
                    let dateA = parseCustomDate(a.date);
                    console.log("date int: ", dateA)
                    let dateB = parseCustomDate(b.date);
                    // @ts-ignore
                    return dateB - dateA;
                });

                setMarkdownContents(filesContent);
            });

        });

    }, []);




    return (
        <>
            <style>{`
                .article-content img {
                    max-width: 400px; /* Limits the width to 400px */
                    max-height: 400px; /* Optional: Use if you also want to limit the height */
                    height: auto; /* Ensures the aspect ratio is maintained */
                    display: block; /* Renders the image as a block element */
                    margin-left: auto; /* Together with margin-right: auto, centers the image */
                    margin-right: auto;
                }
            `}</style>
            <Grid container spacing={4} style={{ padding: '24px' }}>
                {markdownContents.map((article, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardActionArea href={`/articles/${article.name.replaceAll(" ", "-").replace('.md', '')}`}>
                                {article.imageUrl && (
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={article.imageUrl}
                                        alt="Article Image"
                                    />
                                )}
                                <CardContent style={{height: "17vh"}}>
                                    <Typography gutterBottom variant="h5" component="div" sx={{fontSize: "100%"}}>
                                        {article.name.replace('.md', '')} {/* Optionally remove file extension */}

                                    </Typography>
                                    <Typography gutterBottom variant="body1" component="div">
                                        {article.date}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};

// export const ArticleDetail: React.FC = () => {
//     const { name } = useParams();
//     // Fetch the article's content based on the name or identifier
//     // Display the article content
//
//     return (
//         <Box
//             id="article-container"
//             sx={{width: "100%"}}
//             display={"flex"}
//             justifyContent={"center"}
//             alignItems={"center"}
//             alignContent={"center"}
//         >
//             <Box id="article-content" sx={{maxWidth: 800, width: "100%", m: 2}}>
//                 <Typography variant="h4" gutterBottom>
//                     {selectedArticle.name.replace('.md', '')}
//                 </Typography>
//                 <MarkdownRenderer
//                     markdown={selectedArticle.content}
//                     style={{
//                         overflowWrap: 'break-word',
//                         borderRadius: '10px',
//                         padding: '0px',
//                     }}
//                 />
//                 <Button onClick={() => setSelectedArticle(null)} style={{ marginTop: '20px' }}>Back to list</Button>
//             </Box>
//         </Box>
//     );
// };



export default ArticlesPage;
