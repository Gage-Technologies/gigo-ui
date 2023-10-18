

import * as React from "react";
import {useEffect} from "react";
import {Container, createTheme, CssBaseline, PaletteMode, ThemeProvider, Typography} from "@mui/material";
import {getAllTokens} from "../theme";
import ProjectCard from "../components/ProjectCard";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {initialAuthStateUpdate, selectAuthState, updateAuthState} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import AppWrapper from "../components/AppWrapper";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {ThreeDots} from "react-loading-icons";
import Lottie from "react-lottie";
import * as animationData from "../img/85023-no-data.json";


function Following() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const dispatch = useAppDispatch();

    const authState = useAppSelector(selectAuthState);

    const [followData, setFollowData] = React.useState(null)

    const [skip, setSkip] = React.useState(0);

    const [loading, setLoading] = React.useState(true)

    let navigate = useNavigate();

    const apiLoad = async () => {
        if (followData === null) {

            let params = {
                skip: skip,
                limit: 20,
            }

            let follow = call(
                "/api/following/feed",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                params,
                null,
                config.rootPath
            )

            const [res] = await Promise.all([
                follow
            ])

            if (res === undefined) {
                swal("There has been an issue loading data. Please try again later.")
            }
            

            if (skip === 0){
                setFollowData(res["projects"])
            } else {
                let search = followData
                // @ts-ignore
                let finalArray = search.concat(res["users"])
                setFollowData(finalArray)
            }

            setSkip(skip + 20)
        }
    }

    window.onscroll = function() {
        if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
            apiLoad()
        }
    }

    useEffect(() => {
        setLoading(true)
        apiLoad().then(r => console.log("here: ", r))
        setLoading(false)
    }, [])

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <ThemeProvider theme={theme}>
        <CssBaseline>
            {/*<AppWrapper/>*/}
            {loading ? <Container maxWidth={"xl"}>
                    <Typography component={"div"} sx={{display: "flex", justifyContent: "center", height: window.innerHeight, alignItems: "center"}}>
                        <ThreeDots/>
                    </Typography>
                </Container>  :
                (
                    //@ts-ignore
                    followData !== null && followData.length > 0 ? (
                        <Typography component={"div"} sx={{
                            display: "flex",
                            flexWrap:"wrap",
                            justifyContent: "center",
                            flexDirection: `row`,
                            overflowY: "auto",
                            overflowX: "hidden",
                            alignContent: `center`
                        }}>
                            {
                                //@ts-ignore
                                followData.map((projects) => {
                                    return (
                                        <div style={{ padding: 30, display: "flex" }} >
                                            <ProjectCard
                                                width={window.innerWidth < 1000 ? 'fit-content' : '20vw'}
                                                projectId={projects["_id"]}
                                                projectTitle={projects["title"]}
                                                projectDesc={projects["description"]}
                                                projectThumb={config.rootPath + projects["thumbnail"]}
                                                projectDate={projects["updated_at"]}
                                                projectType={projects["post_type_string"]}
                                                renown={projects["tier"]}
                                                onClick={() => navigate("/challenge/" + projects["_id"])}
                                                userTier={projects["user_tier"]}
                                                userThumb={config.rootPath + "/static/user/pfp/" + projects["author_id"]}
                                                userId={projects["author_id"]}
                                                username={projects["author"]}
                                                backgroundName={projects["background_name"]}
                                                backgroundPalette={projects["background_palette"]}
                                                backgroundRender={projects["background_render"]}
                                                exclusive={projects["challenge_cost"] === null ? false : true}
                                                hover={false}
                                                role={projects["user_status"]}
                                            />
                                        </div>
                                    )
                                })}
                        </Typography>
                    ) : (
                        <div style={{width: "95vw", height: "89vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <Lottie options={defaultOptions}
                                    width={50  * window.innerWidth / 100}
                                    height={50 * window.innerHeight / 100}/>
                        </div>
                    ))}
        </CssBaseline>
    </ThemeProvider>
    );
}

export default Following;