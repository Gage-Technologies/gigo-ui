

import * as React from "react"
import {Avatar, ButtonBase, Card, CardContent, Typography} from "@mui/material";
import {styled} from "@mui/material/styles";
import Badge from "@mui/material/Badge";

interface IProps {
    width: number | string,
    height: number | string,
    userTier: string,
    userThumb: string,
    userId: string,
    userName: string,
    onClick: () => void
}

export default function SearchUserCard(props: IProps) {
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

    const StyledBadge = styled(Badge)(({theme}) => ({
        '& .MuiBadge-badge': {
            backgroundColor: props.userTier,
            color: props.userTier,
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            '&::after': {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                animation: 'ripple 1.2s infinite ease-in-out',
                border: '1px solid currentColor',
                content: '""',
            },
        },
        '@keyframes ripple': {
            '0%': {
                transform: 'scale(.8)',
                opacity: 1,
            },
            '100%': {
                transform: 'scale(2.4)',
                opacity: 0,
            },
        },
    }));

    return (
        <Card sx={styles.card}>
            <ButtonBase
                sx={{width: "100%", display: "flex", flexDirection: "column", top: "15px"}}
                onClick={props.onClick}
            >
                <StyledBadge
                    overlap="circular"
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    variant="dot"
                >
                    <Avatar alt="User Profile" src={props.userThumb}
                            sx={{
                                width: typeof props.width === "number" ? props.width * .29 : props.width,
                                height: typeof props.width === "number" ? props.width * .29 : props.width
                            }}
                    />
                </StyledBadge>
                <CardContent
                    sx={{width: "100%", height: "100%"}}>
                    <Typography gutterBottom variant="h6" component="div" sx={styles.title}>
                        {props.userName}
                    </Typography>
                </CardContent>
            </ButtonBase>
        </Card>
    )
}

SearchUserCard.defaultProps = {
    width: 600,
    height: 250,
    userId: "",
    userName: "",
    userThumb: "",
    userTier: ""
}