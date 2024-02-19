
import completed from "./journey-completed-cirlce.svg";
import React from "react";
import {Box, Card, CardContent, CardMedia, Typography} from "@mui/material";

function DetourCard(props: any) {
    return (
        <Card sx={{
            display: 'flex',
            width: '23vw',
            height: '12vh',
            overflow: 'hidden',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
                transform: 'scale(1.05)'
            }
        }}>
            <CardMedia
                component="img"
                sx={{
                    width: '5vw',
                    height: '5vw',
                    objectFit: 'cover',
                    alignSelf: 'center',
                    clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
                    marginLeft: '1vw',
                }}
                // image={`https://picsum.photos/200/300?random=${Math.random()}`}
                image={`https://picsum.photos/200/300`}
                alt="Hexagon Image"
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
                <CardContent>
                    <Typography component="div" variant="h6" sx={{ fontSize: '3vh' }}>
                        {props.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.5vh' }}>
                        words to describe the journey blah blah 42069 is funny number
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    )

}

export default DetourCard;
