

import * as React from "react";
import {Button, Card, createTheme, CssBaseline, PaletteMode, Tab, Tabs, ThemeProvider, Tooltip, Typography} from "@mui/material";
import {getAllTokens} from "../theme";
import ProjectCard from "../components/ProjectCard";
import {useNavigate, useSearchParams} from "react-router-dom";
import AppWrapper from "../components/AppWrapper";
import call from "../services/api-call";
import Post from "../models/post";
import {useEffect, useReducer} from "react";
import swal from "sweetalert";
import config from "../config";
import {initialAuthStateUpdate, selectAuthState, updateAuthState} from "../reducers/auth/auth";
import UserIcon from "../components/UserIcon";
import renown1 from "../img/renown/renown1.svg"
import renown2 from "../img/renown/renown2.svg"
import renown3 from "../img/renown/renown3.svg"
import renown4 from "../img/renown/renown4.svg"
import renown5 from "../img/renown/renown5.svg"
import renown6 from "../img/renown/renown6.svg"
import renown7 from "../img/renown/renown7.svg"
import renown8 from "../img/renown/renown8.svg"
import renown9 from "../img/renown/renown9.svg"
import renown10 from "../img/renown/renown10.svg"
import {useAppSelector} from "../app/hooks";
import ReactGA from "react-ga4";
import BytesCard from "../components/BytesCard";
import { programmingLanguages } from "../services/vars";
import BytesCardMobile from "../components/BytesCardMobile";


function AllBytesScrollMobile() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    let navigate = useNavigate();

    const [bytes, setBytes] = React.useState([]);

    const [skip, setSkip] = React.useState(0);

    ReactGA.initialize("G-38KBFJZ6M6");

    let loggedIn = false
    const authState = useAppSelector(selectAuthState);
    if (authState.authenticated !== false) {
        loggedIn = true
    }

    window.onscroll = function() {
        if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
            apiLoad()
        }
    }

    const apiLoad = async () => {
        let byteData = call(
            "/api/bytes/getRecommendedBytes",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([byteData])

        if (res === undefined){
            swal("There has been an issue loading data. Please try again later.")
        }

        setBytes(res["rec_bytes"])
    }



    useEffect(() => {
        //null
        apiLoad().then(r => console.log("r"))
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    overflowY: "scroll",
                    height: "100%",
                    width: "100%",
                    marginTop: "5vh",
                }}>
                    {bytes.length > 0 ? (
                        bytes.map((byte) => (
                            <div key={byte["_id"]} style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: "1em" }}>
                                <BytesCardMobile
                                    completedEasy={byte["completed_easy"]}
                                    completedMedium={byte["completed_medium"]}
                                    completedHard={byte["completed_hard"]}
                                    height="100%"
                                    width="100%"
                                    bytesId={byte["_id"]}
                                    bytesTitle={byte["name"]}
                                    bytesDesc={byte["description_medium"]}
                                    bytesThumb={config.rootPath + "/static/bytes/t/" + byte["_id"]}
                                    onClick={() => navigate("/byteMobileConcept/" + byte["_id"])}
                                    role={authState.role}
                                    language={programmingLanguages[byte["lang"]]}
                                />
                            </div>
                        ))
                    ) : (
                        <Typography textAlign="center">Loading bytes...</Typography>
                    )}
                </div>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default AllBytesScrollMobile;