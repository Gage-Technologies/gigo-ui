import React, {useEffect, useState} from 'react';
import {Typography, IconButton, Dialog, PaletteMode, createTheme, Box, Button} from '@mui/material';
import Close from '@mui/icons-material/Close'; // Assuming you're using MUI icons
import { LoadingButton } from '@mui/lab';
import premiumGorilla from "../img/pro-pop-up-icon-plain.svg";
import {getAllTokens} from "../theme";
import call from "../services/api-call";
import config from "../config";
import proBackground from "../img/popu-up-backgraound-plain.svg"; // Adjust import based on actual location

interface GoProPopupProps {
    open: boolean;
    onClose: () => void;
}

const GoProDisplay: React.FC<GoProPopupProps> = ({ open, onClose }) => {
    let userPref = localStorage.getItem('theme')
    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [proUrlsLoading, setProUrlsLoading] = useState(false);
    const [proMonthlyLink, setProMonthlyLink] = useState('');
    const [proYearlyLink, setProYearlyLink] = useState('');

    // Determine if it's a mobile view
    const isMobile = window.innerWidth < 1000;

    const retrieveProUrls = async (): Promise<{ monthly: string, yearly: string } | null> => {
        setProUrlsLoading(true)
        let res = await call(
            "/api/stripe/premiumMembershipSession",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        setProUrlsLoading(false)

        if (res !== undefined && res["return url"] !== undefined && res["return year"] !== undefined) {
            setProMonthlyLink(res["return url"])
            setProYearlyLink(res["return year"])
            return {
                "monthly": res["return url"],
                "yearly": res["return year"],
            }
        }

        return null
    }

    useEffect(() => {
        retrieveProUrls()
    }, [])

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" PaperProps={{sx: {borderRadius: 7, overflow: "hidden"}}}>
            <Box style={{
                width: window.innerWidth < 1000 ? "80vw" : "28vw",
                height: window.innerWidth < 1000 || window.innerHeight < 900 ? "78vh": "70vh",
                minHeight: "420px",
                // justifyContent: "center",
                // marginLeft: "25vw",
                // marginTop: "5vh",
                outlineColor: "black",
                borderRadius: 7,
                boxShadow:
                    "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px  0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                // backgroundColor: theme.palette.background.default,
                backgroundImage: `url(${proBackground})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center"
            }}>
                <div style={{
                    borderRadius: "10px",
                    padding: "20px",
                    textAlign: "center",
                }}>
                    <IconButton
                        edge="end"
                        color="inherit"
                        size="small"
                        onClick={onClose}

                        sx={window.innerWidth < 1000 ? {
                            position: "absolute",
                            top: '3vh',
                            right: '3vw',
                            color: "white"
                        } : {
                            position: "absolute",
                            top: '2vh',
                            right: '2vw', color: "white"
                        }}
                    >
                        <Close/>
                    </IconButton>
                    <img src={premiumGorilla} style={window.innerHeight < 900 ? {width: "20%", marginBottom: "5px"} : {
                        width: "30%",
                        marginBottom: "20px"
                    }}/>
                    <Typography variant={window.innerHeight < 1000 ? "h5" : "h4"}
                                style={{marginBottom: "10px", color: "white"}} align={"center"}>GIGO Pro</Typography>
                    <Typography variant={window.innerHeight < 900 ? "body2" : "body1"}
                                style={{marginLeft: "20px", marginRight: "20px", color: "white"}} align={"center"}>
                        Learn faster with a smarter Code Teacher!
                    </Typography>
                    <Typography variant={window.innerHeight < 900 ? "body2" : "body1"}
                                style={{marginBottom: "20px", marginLeft: "20px", marginRight: "20px", color: "white"}}
                                align={"center"}>
                        Do more with larger DevSpaces!
                    </Typography>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        width: "100%"
                    }}>
                        <div style={window.innerHeight < 900 ? {
                            backgroundColor: "#070D0D",
                            borderRadius: "10px",
                            padding: "20px",
                            margin: "10px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                            textAlign: "center",
                            height: "fit-content"
                        } : {
                            backgroundColor: "#070D0D",
                            borderRadius: "10px",
                            padding: "20px",
                            margin: "10px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                            textAlign: "center",
                            width: "200px"
                        }}>
                            <Typography variant={window.innerHeight < 900 ? "subtitle2" : "subtitle1"}
                                        style={{marginBottom: "10px", color: "white"}} align={"center"}>1
                                Month</Typography>
                            <Typography variant={window.innerHeight < 900 ? "h6" : "h5"}
                                        style={{marginBottom: "10px", color: "white"}} align={"center"}>$15 /
                                MO</Typography>
                            <LoadingButton
                                loading={proUrlsLoading}
                                variant="contained"
                                onClick={() => window.open(proMonthlyLink, "_blank")}
                                style={{backgroundColor: theme.palette.secondary.dark}}
                            >
                                Select
                            </LoadingButton>
                        </div>
                        <div style={window.innerHeight < 900 ? {
                            backgroundColor: "#070D0D",
                            borderRadius: "10px",
                            padding: "20px",
                            margin: "10px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                            textAlign: "center",
                            height: "fit-content"
                        } : {
                            backgroundColor: "#070D0D",
                            borderRadius: "10px",
                            padding: "20px",
                            margin: "10px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                            textAlign: "center",
                            width: "200px"
                        }}>
                            <Typography variant={window.innerHeight < 900 ? "subtitle2" : "subtitle1"}
                                        style={{marginBottom: "10px", color: "white"}} align={"center"}>12
                                Months</Typography>
                            <Typography variant={window.innerHeight < 900 ? "h6" : "h5"}
                                        style={{marginBottom: "10px", color: "white"}} align={"center"}>$11.25 /
                                MO</Typography>
                            <LoadingButton
                                loading={proUrlsLoading}
                                variant="contained"
                                onClick={() => window.open(proYearlyLink, "_blank")}
                                style={{backgroundColor: theme.palette.secondary.dark}}
                            >
                                Select
                            </LoadingButton>
                        </div>
                    </div>
                    <Typography
                        variant="body1"
                        style={{ marginTop: "20px", color: "white", cursor: "pointer" }}
                        align="center"
                        component="a" // Render the Typography as an <a> tag
                        href="/premium" // Specify the target URL
                        onClick={(e) => {
                            e.preventDefault(); // Prevent default to stop navigation (optional)
                            window.open("/premium", "_blank"); // Open in new tab
                        }}
                    >
                        Learn More About Pro
                    </Typography>
                </div>
            </Box>
        </Dialog>
    );
};

export default GoProDisplay;
