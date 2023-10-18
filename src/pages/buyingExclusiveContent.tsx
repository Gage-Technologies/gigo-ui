

import * as React from "react";
import {useEffect} from "react";
import {
    Box, Button,
    Card,
    Container,
    createTheme,
    CssBaseline,
    Grid,
    PaletteMode,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import ProjectCard from "../components/ProjectCard";
import AppWrapper from "../components/AppWrapper";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {initialAuthStateUpdate, selectAuthState, updateAuthState} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import call from "../services/api-call";
import config from "../config";
import exclusive from "../img/icons/exclusive.svg"
import fast from "../img/icons/fast-time.svg"
import click from "../img/icons/click.svg"

function BuyingExclusiveContent() {
    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [loading, setLoading] = React.useState(false)


    let navigate = useNavigate();

    const stripeNavigate = async () => {
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

        if (res["message"] === "You must be logged in to access the GIGO system.") {
            let authState = Object.assign({}, initialAuthStateUpdate)
            // @ts-ignore
            dispatch(updateAuthState(authState))
            navigate("/login")
        }
        if (res !== undefined && res["return url"] !== undefined){
            window.location.replace(res["return url"])
        }
    }



    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div>
                    <Box>
                        <Box style={{backgroundColor: theme.palette.primary.light}}>
                            <div style={{height: "50px"}}/>
                            <h2 style={{width: "100%", display: "flex", justifyContent: "center"}}>What is Exclusive Content?</h2>
                            <div style={{display: "flex", width: "100%"}}>
                                <div style={{display: "flex", flexDirection: "row", width: "100%", justifyContent: "center"}}>
                                    <img src={exclusive} width={"30%"} height={"40%"}/>
                                    <div style={{width: "50px"}}/>
                                    <div style={{width: "40vw"}}>
                                        <h4>Unique Content Made by Top Creators</h4>
                                        <body style={{lineHeight: "2em", backgroundColor: "transparent"}}>Exclusive content in the context of a coding project refers to a premium programming challenge that requires payment to access. Although it doesn't include extra features, it is usually designed to be a more engaging and challenging experience. The creators of such content often invest more effort into crafting detailed explanations and presenting complex concepts, making it a valuable learning resource for those who choose to invest in it.</body>
                                    </div>
                                </div>
                            </div>
                        </Box>
                        <Box style={{backgroundColor: theme.palette.primary.main}}>
                            <div style={{height: "50px"}}/>
                            <h2 style={{width: "100%", display: "flex", justifyContent: "center"}}>Why Do You Want Exclusive Content?</h2>
                            <div style={{height: "50px"}}/>
                            <div style={{display: "flex", width: "100%"}}>
                                <div style={{display: "flex", flexDirection: "row", width: "100%", justifyContent: "center"}}>
                                    <img src={fast} width={"40%"} height={"30%"}/>
                                    <div style={{width: "50px"}}/>
                                    <div style={{width: "40vw"}}>
                                        <h4>More Personalized and Unique Content</h4>
                                        <body style={{lineHeight: "2em", backgroundColor: "transparent"}}>Paying for exclusive content in programming can be a wise investment for individuals looking to accelerate their learning process. The primary reason is that premium content tends to be of higher quality, with more effort put into crafting detailed explanations and presenting complex concepts. This well-structured and comprehensive material can help decrease the time it takes to learn programming, as it allows users to grasp concepts more effectively and efficiently.
                                        <br/>
                                        <br/>
                                        Moreover, exclusive content often comes with better support and guidance, providing users with a more personalized learning experience. This can lead to a deeper understanding of programming concepts, faster problem-solving skills, and ultimately, a more solid foundation in the programming language or framework being studied. By investing in exclusive content, users can save time and effort in the long run, enabling them to advance their programming skills more rapidly.</body>
                                    </div>
                                </div>
                            </div>
                            <div style={{height: "50px"}}/>
                        </Box>
                        <Box style={{backgroundColor: theme.palette.primary.dark}}>
                            <div style={{height: "50px"}}/>
                            <h2 style={{width: "100%", display: "flex", justifyContent: "center"}}>How to Purchase Exclusive Content?</h2>
                            <div style={{height: "50px"}}/>
                            <div style={{display: "flex", width: "100%"}}>
                                <div style={{display: "flex", flexDirection: "row", width: "100%", justifyContent: "center"}}>
                                    <img src={click} width={"40%"} height={"30%"}/>
                                    <div style={{width: "50px"}}/>
                                    <div style={{width: "40vw"}}>
                                        <h4>Get Access in Only a Few Clicks</h4>
                                        <body style={{lineHeight: "2em", backgroundColor: "transparent"}}>Purchasing exclusive content is only a few clicks away. Click on the project you would like to purchase and to to the challenge page. Once you are on the challenge page, click on the 'Buy Content' button. You will be navigated to a secure checkout page for a one time payment. Once redirected to the site, you will have access to start your attempt on the project.</body>
                                    </div>
                                </div>
                            </div>
                        </Box>
                    </Box>
                </div>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default BuyingExclusiveContent;