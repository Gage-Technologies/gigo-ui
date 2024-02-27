import React, {useEffect, useState} from 'react';
import {Typography, IconButton, Dialog, PaletteMode, createTheme, Box, Grid, Chip, Button} from '@mui/material';
import Close from '@mui/icons-material/Close'; // Assuming you're using MUI icons
import {getAllTokens} from "../theme";
import call from "../services/api-call";
import config from "../config";
import proBackground from "../img/popu-up-backgraound-plain.svg";
import JourneyMap from "./JourneysMap";
import {AwesomeButton} from "react-awesome-button"; // Adjust import based on actual location

interface JourneyDetourPopupProps {
    open: boolean;
    onClose: () => void;
}

const JourneyDetourPopup: React.FC<JourneyDetourPopupProps> = ({ open, onClose }) => {
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    // Determine if it's a mobile view
    const isMobile = window.innerWidth < 1000;

    useEffect(() => {
        //todo: call function to get the journey unit info
    }, [])

    // todo replace test data
    const data = [
        {
            unit: '1',
            node_above: '2',
            node: '3',
            node_below: '4',
            name: 'third',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: null,
            node: '1',
            node_below: '2',
            name: 'First',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '1',
            node: '2',
            node_below: '3',
            name: 'Second',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '3',
            node: '4',
            node_below: '5',
            name: 'fourth',
            completed: true,
            detour: true,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '4',
            node: '5',
            node_below: '6',
            name: 'fifth',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '5',
            node: '6',
            node_below: '7',
            name: 'sixth',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '6',
            node: '7',
            node_below: '8',
            name: 'seventh',
            completed: true,
            detour: false,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '7',
            node: '8',
            node_below: '9',
            name: 'eighth',
            completed: false,
            detour: true,
            color: '#dfce53'
        },
        {
            unit: '1',
            node_above: '8',
            node: '9',
            node_below: null,
            name: 'ninth',
            completed: false,
            detour: false,
            color: '#dfce53'
        }
    ];


    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 7, overflow: "hidden" } }}>
            <Box style={{
                width: '100%', // Use 100% width to utilize the dialog's width fully
                minHeight: "420px",
                outlineColor: "black",
                borderRadius: 7,
                boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                height: "85vh"
            }}>
                {/* First Row with Image and Text */}
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
                            border: `2px solid ${'#dfce53'}`
                        }}>
                            <img src="https://picsum.photos/200/300" alt="Top Image"
                                 style={{maxHeight: '150px', borderRadius: '30px', width: "300px", padding: "10px", marginRight: "20px"}}/>
                            <div style={{display: "flex", flexDirection: "column", textAlign: "left"}}>
                                <Typography variant="subtitle1" style={{marginBottom: '8px'}}>Unit 1: Intro to
                                    Cooking</Typography>
                                <Typography variant="h6">How to cook and can a white boy really buss it
                                    down.</Typography>
                            </div>
                        </Box>
                    </Grid>
                </Grid>


                {/* Second Row with JourneyMap and Topics */}
                <Grid container spacing={2} alignItems="center" style={{display: "flex", flexDirection: "row"}}>
                    {/*<Grid item xs={6}>*/}
                    {/*    <JourneyMap />*/}
                    {/*</Grid>*/}
                    <Grid item xs={6} style={{ position: "relative", left: "2vw", top: "3vh" }}>
                        <Box style={{
                            border: '2px solid white', // This creates a thin white line around the box
                            borderRadius: "50px", // Match the border-radius of the inner box
                            padding: '10px', // Adjust the space between the border and the inner box
                            height: "560px"
                        }}>
                            <Box style={{
                                backgroundColor: '#dfce53',
                                borderRadius: "50px",
                                width: "100%", // 100% to fill up the outer Box
                                height: "100%", // If you need to set a specific height
                            }}>
                                <div style={{paddingTop: "5px"}}>
                                    <JourneyMap />
                                </div>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6} style={{ display: 'flex', flexDirection: 'column', paddingRight: "20px", justifyContent: "space-between", alignItems: 'center' }}>
                        <Box style={{ backgroundColor: theme.palette.background.paper, padding: '20px', borderRadius: '50px', width: "70%", height: "40vh", bottom: "3vh", position: "relative"}}>
                            <Typography variant="subtitle1" style={{ marginBottom: '10px', textAlign: "center", width: "100%" }}>Topics</Typography>
                            <div style={{display: "flex", height: "90%", alignContent: "space-evenly", justifyContent: "space-around", flexWrap: "wrap"}}>
                                <Chip label="Python"    style={{
                                    margin: "8px",
                                    borderRadius: '20px', // Makes the chip more rounded
                                    padding: '20px 15px', // Adjust padding to make the chip bigger
                                    fontSize: '1.8rem', // Increase the font size
                                    height: "20%",
                                    width: "90%"
                                }}  />
                                <Chip label="Learning"     style={{
                                    margin: "8px",
                                    borderRadius: '20px', // Makes the chip more rounded
                                    padding: '20px 15px', // Adjust padding to make the chip bigger
                                    fontSize: '1.8rem', // Increase the font size
                                    height: "20%",
                                    width: "90%"
                                }}  />
                                <Chip label="Beginner"     style={{
                                    margin: "8px",
                                    borderRadius: '20px', // Makes the chip more rounded
                                    padding: '20px 15px', // Adjust padding to make the chip bigger
                                    fontSize: '1.8rem', // Increase the font size
                                    height: "20%",
                                    width: "90%"
                                }}  />
                            </div>
                        </Box>
                        <AwesomeButton style={{width: "50%", top: "9vh", "--button-default-border-radius": "20px" }}>Take Detour</AwesomeButton>
                    </Grid>
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
