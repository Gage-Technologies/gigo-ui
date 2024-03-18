import React, {useEffect, useState} from 'react';
import {Typography, IconButton, Dialog, PaletteMode, createTheme, Box, Grid, Chip, Button} from '@mui/material';
import Close from '@mui/icons-material/Close'; // Assuming you're using MUI icons
import {getAllTokens, themeHelpers} from "../theme";
import call from "../services/api-call";
import config from "../config";
import proBackground from "../img/popu-up-backgraound-plain.svg";
import JourneyMap from "./JourneysMap";
import {AwesomeButton} from "react-awesome-button";
import {useAppSelector} from "../app/hooks";
import {selectAuthStateId} from "../reducers/auth/auth";
import {selectJourneysId} from "../reducers/journeyDetour/journeyDetour"; // Adjust import based on actual location
import swal from "sweetalert";

interface JourneyDetourPopupProps {
    open: boolean;
    onClose: () => void;
    unit: object;
}

const JourneyDetourPopup: React.FC<JourneyDetourPopupProps> = ({ open, onClose, unit }) => {
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    // Determine if it's a mobile view
    const isMobile = window.innerWidth < 1000;

    const [showFullDescription, setShowFullDescription] = useState(false);
    //@ts-ignore
    const isLongDescription = unit.description && unit.description.length > 150;
    const toggleDescription = () => setShowFullDescription(!showFullDescription);
    //@ts-ignore
    const displayedDescription = showFullDescription || !isLongDescription ? unit.description : unit.description.substring(0, 150) + '...';

    const reduxIdState = useAppSelector(selectJourneysId);

    useEffect(() => {
        console.log("id is:", reduxIdState)
    }, [])

    const userId = useAppSelector(selectAuthStateId);

    function redirectToMain(newPath: string) {
        // Get the current URL's protocol, hostname, and port
        const baseUrl = `${window.location.protocol}//${window.location.host}`;

        // Construct the new URL
        const newUrl = `${baseUrl}${newPath}`;

        // Redirect to the new URL
        window.location.href = newUrl;
    }


    const TakeDetour = async() => {
        let detour = await call(
            "/api/journey/createDetour",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            { detour_unit_id: unit._id, user_id: userId, task_id: reduxIdState, },
            null,
            config.rootPath
        )

        if (detour !== undefined && detour["success"] !== undefined && detour["success"] === true){
            swal("Detour added")
            redirectToMain("/journey/main")
        } else {
            swal("There was an issue adding this detour")
        }
    }




    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 7, maxHeight: "95vh", overflowX: "hidden", height: "auto", paddingBottom: "100px", ...themeHelpers.frostedGlass } }}>
            <Box style={{
                width: '100%', // Use 100% width to utilize the dialog's width fully
                minHeight: "auto",
                outlineColor: "black",
                borderRadius: 7,
                height: "100%"
            }}>
                <Grid container spacing={2} alignItems="center" justifyContent="center" style={{paddingTop: "20px"}}>
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Box style={{
                            padding: '20px', // Adjust padding as needed
                            borderRadius: '50px', // Adjust for rounded corners
                            backgroundColor: theme.palette.background.default,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center', // Center the text inside
                            justifyContent: 'center',
                            width: "90%", // Set the width to 90% of the parent
                            textAlign: 'center', // Center the text horizontally
                            margin: 'auto', // Auto margins for horizontal centering if needed
                            border: `2px solid ${
                                //@ts-ignore
                                unit.color}`
                        }}>
                            <img src={config.rootPath + "/static/junit/t/" +
                                //@ts-ignore
                                unit._id} alt="Top Image"
                                 style={{
                                     maxHeight: '200px',
                                     borderRadius: '30px',
                                     padding: "10px",
                                     marginRight: "20px"
                                 }}/>
                            <div style={{display: "flex", flexDirection: "column", textAlign: "left", height: "100%"}}>
                                <Typography variant="h5" style={{marginBottom: '8px'}}>
                                    {
                                        //@ts-ignore
                                        unit.name}
                                </Typography>
                                <Typography variant="body2">
                                    {displayedDescription}
                                </Typography>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}> {/* Container for the button */}
                                    {isLongDescription && (
                                        <Button onClick={toggleDescription} size="small">
                                            {showFullDescription ? 'Read Less' : 'Read More'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Box>
                    </Grid>
                </Grid>
                <Grid container spacing={2} alignItems="center" style={{display: "flex", flexDirection: "row"}}>
                    <Grid item xs={6} style={{position: "relative", left: "2vw", top: "3vh"}}>
                        <Box style={{
                            backgroundColor: `${
                                //@ts-ignore
                                unit.color}`,
                            borderRadius: "50px",
                            width: "100%", // 100% to fill up the outer Box
                            height: "100%", // If you need to set a specific height
                            minHeight: "275px",
                            paddingBottom: "10px",
                            maxHeight: "45vh",
                            border: '2px solid white', // This creates a thin white line around the box
                            overflowY: "scroll", overflowX: "hidden"
                        }}>
                            <JourneyMap unitId={
                                //@ts-ignore
                                unit._id}/>
                        </Box>
                    </Grid>
                    <Grid item xs={6} style={{ display: 'flex', flexDirection: 'column', paddingRight: "20px", justifyContent: "space-between", alignItems: 'center' }}>
                        <Box style={{
                            backgroundColor: theme.palette.background.paper,
                            padding: '20px',
                            borderRadius: '50px',
                            width: "70%",
                            height: "40vh",
                            bottom: "-3vh",
                            position: "relative",
                        }}>
                            <Typography variant="subtitle1" style={{ marginBottom: '10px', textAlign: "center", width: "100%" }}>Topics</Typography>
                            <div style={{
                                display: "flex",
                                height: "90%",
                                alignContent: "space-evenly",
                                justifyContent: "space-around",
                                flexWrap: "wrap"
                            }}>
                                {
                                    //@ts-ignore
                                    unit.tags.map((tag, index) => (
                                    <Chip
                                        key={index} // Assuming tags are unique, if not, use a better key
                                        label={tag}
                                        style={{
                                            margin: "8px",
                                            borderRadius: '20px',
                                            padding: '10px 15px', // Adjusted padding for better text fit
                                            fontSize: '1rem', // Start with a smaller font size for better initial fit
                                            height: 'auto', // Allows chip to expand vertically
                                            width: "90%",
                                            display: 'flex', // Needed to align the text center vertically
                                            justifyContent: 'center', // Center content horizontally
                                            alignItems: 'center', // Center content vertically
                                            flexWrap: 'wrap', // Allow text wrapping
                                            overflow: 'hidden' // Hide overflow
                                        }}
                                    />
                                ))}
                            </div>
                        </Box>
                    </Grid>
                    <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                        <AwesomeButton style={{width: "30%", top: "9vh", "--button-default-border-radius": "20px" }} onPress={TakeDetour}>Take Detour</AwesomeButton>
                    </div>
                </Grid>

                {/* Close Button */}
                <Box style={{
                    position: "absolute",
                    top: window.innerWidth < 1000 ? '3vh' : '5vh',
                    right: window.innerWidth < 1000 ? '3vw' : '.5vw',
                }}>
                    <IconButton edge="end" color="inherit" size="small" onClick={onClose}>
                        <Close style={{ color: "white" }} />
                    </IconButton>
                </Box>
            </Box>
        </Dialog>
    );
};

export default JourneyDetourPopup;
