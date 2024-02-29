
import completed from "./journey-completed-cirlce.svg";
import React, {useState} from "react";
import {Box, Card, CardContent, CardMedia, Typography} from "@mui/material";
import JourneyDetourPopup from "../../JourneyDetourPopup";
import {themeHelpers} from "../../../theme";
import config from "../../../config"
import cube from "../../../img/3d-cube.svg"

function DetourCard(props: any) {
    const [openPopup, setOpenPopup] = useState<boolean>(false);

    const closePopup = () => {
        setOpenPopup(false);
    }
    return (
        <>
            <Card sx={{
                display: 'flex',
                width: '23vw',
                height: '14vh',
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.05)'
                },
                ...themeHelpers.frostedGlass
            }} onClick={() => setOpenPopup(true)}>
                <CardMedia
                    component="img"
                    sx={{
                        width: '3.5vw',
                        height: '4vw',
                        objectFit: 'cover',
                        alignSelf: 'center',
                        clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
                        marginLeft: '1vw',
                        marginRight: ".3vw"
                    }}
                    // image={`https://picsum.photos/200/300?random=${Math.random()}`}
                    image={config.rootPath + "/static/junit/t/" + props.data._id}
                    alt="Hexagon Image"
                />
                {/*<Box sx={{*/}
                {/*    position: 'absolute',*/}
                {/*    top: '.65vw',*/}
                {/*    left: '1vw', // Adjust to align with the CardMedia image*/}
                {/*    width: '3.5vw',*/}
                {/*    height: '4vw',*/}
                {/*    clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)', // Match the CardMedia shape*/}
                {/*}}>*/}
                {/*    <img src={cube} alt="Overlay Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>*/}
                {/*</Box>*/}
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '450px' }}>
                    <CardContent>
                        <Typography component="div" variant="body1" sx={{ fontSize: '3vh', paddingBottom: "10px" }}>
                            {props.data.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                            fontSize: '1.5vh',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '16vw', // Adjust based on the actual width of the card minus image width and any padding/margins
                        }}>
                            {props.data.description}
                        </Typography>
                    </CardContent>
                </Box>
            </Card>
            <JourneyDetourPopup open={openPopup} onClose={closePopup} unit={props.data}/>
        </>
    )

}

export default DetourCard;
