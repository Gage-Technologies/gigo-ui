import {Box, Button, Typography} from "@mui/material";
import { isHoliday, themeHelpers } from "../theme";
import christmasLogin from "../img/christmas-login.png";
import loginImg from "../img/login/login_background.png";

export default function Maintenance() {
    const holiday = isHoliday()

    const renderLanding = () => {
        console.log("holiday: ", holiday)
        const today = new Date();

        if (today.getMonth() === 11) {
            return christmasLogin
        }
        return loginImg
    }

    return (
        <Box style={{
            display: "flex", // Set display to flex for outer box
            justifyContent: "center", // Center children horizontally
            alignItems: "center", // Center children vertically
            backgroundColor: "black",
            backgroundImage: `url(${renderLanding()})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            width: '100vw',
            height: '100vh',
            overflow: "hidden"
        }}>
            <Box sx={{
                display: "flex",
                width: "fit-content",
                maxWidth: "60vw",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                flexDirection: "column",
                borderRadius: "10px",
                p: 2,
                ...themeHelpers.frostedGlass
            }}>
                <Typography variant={"h4"} sx={{
                    color: "white",
                }}>
                    GIGO is currently down for scheduled maintenance.
                </Typography>
            </Box>
        </Box>
    )
}
