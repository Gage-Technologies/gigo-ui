

import * as React from "react"
import {ButtonBase, Card, CardContent, CardMedia, Typography} from "@mui/material";

interface IProps {
    width: number | string,
    height: number | string,
    projectId: string,
    projectTitle: string,
    projectDesc: string,
    projectThumb: string,
    onClick: () => void
}

export default function SearchProjectCard(props: IProps) {
    const styles = {
        card: {
            display: 'flex',
            width: props.width,
            height: props.height
        },
        image: {
            borderRadius: "10px",
            height: props.height,
            width: typeof props.width === "number" ? props.width * .5 : props.width,
            minWidth: 200,
        },
        text: {
            textOverflow: "ellipsis",
            overflow: "hidden",
            display: 'block',
            WebkitLineClamp: 5,
            whiteSpace: "nowrap",
            WebkitBoxOrient: 'vertical',
            width: typeof props.width === "number" ? props.width * .5 : props.width
        },
        title: {
            textOverflow: "ellipsis",
            overflow: "hidden",
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
        }
    };

    return (
        <Card sx={styles.card}>
            <ButtonBase
                sx={{width: "100%"}}
                onClick={props.onClick}
            >
                <CardMedia
                    component="img"
                    image={props.projectThumb}
                    alt="Project Thumbnail"
                    sx={styles.image}
                />
                <CardContent
                    sx={{width: "100%", height: "100%"}}>
                    <Typography gutterBottom variant="h6" component="div" sx={styles.title}>
                        {props.projectTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={styles.text}>
                        {props.projectDesc}
                    </Typography>
                </CardContent>
            </ButtonBase>
        </Card>
    )
}

SearchProjectCard.defaultProps = {
    width: 600,
    height: 250,
    projectId: 0,
    projectTitle: "",
    projectDesc: "",
    projectThumb: "",
}