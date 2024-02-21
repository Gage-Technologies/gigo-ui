

import * as React from "react";
import {useEffect} from "react";
import {
    Box, Button,
    Card, Checkbox,
    Container,
    createTheme,
    CssBaseline, FormControlLabel,
    Grid,
    PaletteMode,
    ThemeProvider,
    Typography
} from "@mui/material";
import {themeHelpers, getAllTokens} from "../theme";
import ProjectCard from "../components/ProjectCard";
import AppWrapper from "../components/AppWrapper";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {
    initialAuthStateUpdate,
    selectAuthState, selectAuthStateExclusiveAgreement,
    selectAuthStateExclusiveContent,
    updateAuthState
} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";

function ExclusiveContent() {
    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [loading, setLoading] = React.useState(false)

    const exclusiveContent = useAppSelector(selectAuthStateExclusiveContent) as boolean

    const [checkedBox, setCheckedBox] = React.useState(false)

    const [agreementSent, setAgreementSet] = React.useState(false)


    let navigate = useNavigate();

    const exclusiveAgreement = useAppSelector(selectAuthStateExclusiveAgreement);

    useEffect(() => {
        if (window.sessionStorage.getItem('exclusiveAgreement') === "true") {
            setAgreementSet(true)
        }
    }, [])

    const exclusiveContentLink = async() => {
        let name = call(
            "/api/stripe/createConnectedAccount",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            name,
        ])

        if (res !== undefined && res["account"] !== undefined) {
            window.location.replace(res["account"])
        }
    }


    const createProjectRedirect = () => {
        window.sessionStorage.setItem("exclusiveProject", "true")
        navigate("/create-challenge")
    }

    const setExclusiveAgreement = async() => {
        let name = call(
            "/api/user/updateExclusiveAgreement",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            name,
        ])

        if (res === undefined || res["message"] === undefined || res["message"] !== "user agreement updated") {
            swal("We are unable to process your request at this time. Please try again later.")
        } else {
            window.sessionStorage.setItem("exclusiveAgreement", "true")
            setAgreementSet(true)
        }

    }



    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div>
                    <div style={{height: "10vh"}}/>
                    <div style={{display: "flex", justifyContent: "center", flexDirection: "column", width: "100%"}}>
                        <h2 style={{alignSelf: "center"}}>What Exclusive Content Is</h2>
                        <div style={{height: "20px"}}/>
                        <body style={{width: "80%", alignSelf: "center", lineHeight: "2em"}}>
                        Exclusive coding projects are unique, premium programming challenges or assignments that users can access by paying a fee. These projects are designed to provide a stimulating and rewarding learning experience, allowing users to develop and hone their coding skills by working on real-world problems or innovative ideas.
                        <br/>
                        <br/>
                        These exclusive coding projects often come with detailed instructions, sample code, and test cases to help users understand the problem and validate their solutions. They may also include expert guidance, mentorship, or a more detailed tutorial.
                        <br/>
                        <br/>
                        By attempting these exclusive coding projects, users can improve their programming abilities, expand their knowledge in specific domains, and showcase their skills to potential employers or clients. The projects can also serve as an excellent addition to a user's portfolio, demonstrating their expertise and commitment to continuous learning.
                        </body>
                    </div>
                    <div style={{height: "8vh"}}/>
                    <div style={{display: "flex", justifyContent: "center", flexDirection: "column", width: "100%"}}>
                        <h2 style={{alignSelf: "center"}}>How to Create Exclusive Content</h2>
                        <div style={{height: "20px"}}/>
                        <body style={{width: "80%", alignSelf: "center", lineHeight: "2em"}}>
                            Creating exclusive content is easy, but it is important to know that the standard for a challenge being worthy of being exclusive is higher than general content. Before being able to make any exclusive content, you must also create a connected account for you to receive money into.
                        </body>
                        <ul style={{width: "70%", alignSelf: "center", lineHeight: "2em"}}>
                            <li>
                                Create a connected account by either going to account settings or clicking the 'Setup Exclusive Content Account' button below.
                            </li>
                            <li>
                                Once you have created a connected account, can get started by clicking the 'Create Exclusive Content' button below.
                            </li>
                            <li>
                                When you get serious about creating exclusive content, click the 'Don't Show Me This Page Again' button below and submit it.
                            </li>
                            <li>
                                Just know, once you hit that button you will only be able to get to this page through the About page.
                            </li>
                            <li>
                                After you have confirmed to have read this page, clicking the 'Exclusive Content' button in the top menu will take you straight to creating exclusive content.
                            </li>
                        </ul>
                    </div>
                    <div style={{height: "8vh"}}/>
                    <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                        {exclusiveContent !== undefined && exclusiveContent ? (
                            <Button onClick={() => createProjectRedirect()}>
                                Create Exclusive Content
                            </Button>
                        ) : (
                            <Button onClick={() => exclusiveContentLink()}>
                                Setup Exclusive Content Account
                            </Button>
                        )}
                    </div>
                    <div style={{height: "5vh"}}/>
                    {!agreementSent ? (
                        <div style={{marginLeft: "20px", display: "flex", flexDirection: "column"}}>
                            <FormControlLabel control={<Checkbox checked={checkedBox} onChange={() => setCheckedBox(!checkedBox)}/>} label="Don't Show Me This Page Again" />
                            {checkedBox ? (
                                <Button style={{width: "40px"}} onClick={() => setExclusiveAgreement()}>
                                    Submit
                                </Button>
                            ): null}
                        </div>
                    ) : null}
                </div>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default ExclusiveContent;