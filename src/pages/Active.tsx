

import * as React from "react";
import {useEffect} from "react";
import {Box, Container, createTheme, CssBaseline, Grid, PaletteMode, ThemeProvider, Typography} from "@mui/material";
import {getAllTokens} from "../theme";
import ProjectCard from "../components/ProjectCard";
import AppWrapper from "../components/AppWrapper";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {initialAuthStateUpdate, selectAuthState, updateAuthState} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import Lottie from "react-lottie";
import * as animationData from '../img/85023-no-data.json'
import Carousel from "../components/Carousel2";
import {ThreeDots} from "react-loading-icons";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";

function Active() {
    let userPref = localStorage.getItem('theme')

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');

        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const dispatch = useAppDispatch();

    const authState = useAppSelector(selectAuthState);

    const [pastWeek, setPastWeek] = React.useState([]);

    const [mostChallenging, setMostChallenging] = React.useState([]);

    const [incomplete, setIncomplete] = React.useState([]);

    const [loading, setLoading] = React.useState(false)

    const [firstLoad, setFirstLoad] = React.useState(true)
    const chatOpen = useAppSelector(selectAppWrapperChatOpen);
    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);

    let navigate = useNavigate();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const getActiveProjects = async () => {
        let activeData = [];
        let challengingData = [];
        let incompleteData = [];

        if (firstLoad) {
            let active = call(
                "/api/active/pastWeek",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {skip: 0, limit: 15},
                null,
                config.rootPath
            )

            let rec = call(
                "/api/active/challenging",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {skip: 0, limit: 15},
                null,
                config.rootPath
            )

            let follow = call(
                "/api/active/dontGiveUp",
                "post",
                null,
                null,
                null,
                //@ts-ignore
                {skip: 0, limit: 15},
                null,
                config.rootPath
            )

            const [res, res2, res3] = await Promise.all([
                active,
                rec,
                follow
            ])

            if (res === undefined && res2 === undefined && res3 === undefined){
                swal("There has been an issue loading data. Please try again later.")
            }

            if (res2["projects"] !== undefined && res2["projects"].length > 0) {
                //@ts-ignore
                setMostChallenging(res2["projects"])
            } else {
                //@ts-ignore
                setMostChallenging([])
            }

            if (res["projects"] !== undefined && res["projects"].length > 0) {
                //@ts-ignore
                setPastWeek(res["projects"])
            } else {
                //@ts-ignore
                setPastWeek([])
            }

            if (res3["projects"] !== undefined && res3["projects"].length > 0) {
                //@ts-ignore
                setIncomplete(res3["projects"])
            } else {
                //@ts-ignore
                setIncomplete([])
            }

            setFirstLoad(false)
        }

    }

    useEffect(() => {

        setLoading(true)
        getActiveProjects().then(r => console.log("here: ", r))
        setLoading(false)
    }, [])

    const PastProjects = () => {
        return (
            <Typography component={"div"} sx={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "auto",
                paddingRight: "auto",
                justifyContent: "center",
                width: "100%",
                paddingBottom: "10px"
            }}>
                <Typography component={"div"} sx={{display: "flex", marginTop: "25px"}}>
                    <Typography variant="h5" gutterBottom>
                        Past Week
                    </Typography>
                </Typography>
                <Typography component={"div"} sx={
                    //@ts-ignore
                    pastWeek !== undefined && pastWeek !== null && pastWeek.length > 0 ?  chatOpen || sidebarOpen ? {
                        display: "flex",
                        justifyContent: "start",
                        flexDirection: `row`,
                        alignContent: `center`,
                        overflowX: "auto",
                        width: "83vw"
                    } :{
                        display: "flex",
                        justifyContent: "start",
                        flexDirection: `row`,
                        alignContent: `center`,
                        overflowX: "auto",
                        width: "95vw"
                    } : {
                        display: "flex",
                        justifyContent: "start",
                        flexDirection: `row`,
                        alignContent: `center`,
                        overflowX: "auto",
                        width: "50vw"
                    }}>
                    {
                        //@ts-ignore
                        pastWeek !== null && pastWeek.length > 0 ? (
                            <div style={{width: "100%"}}>
                                <Carousel itemsShown={(window.innerWidth < 1000 ? 1 : 5)} infiniteLoop={true} itemsToSlide={(window.innerWidth < 1000 ? 1 : 5)}>
                                    {
                                        //@ts-ignore
                                        pastWeek.map((project, index) => {
                                            return (
                                                <div>
                                                    {project["_id"] !== "-1" ? (
                                                        <ProjectCard
                                                            width={(chatOpen || sidebarOpen) ? "16vw" : (window.innerWidth < 1000 ? 'fit-content' : '20vw')}
                                                            imageWidth={(chatOpen || sidebarOpen) ? "16vw" : "23vw"}
                                                            projectId={project["_id"]}
                                                            projectTitle={project["attempt_title"] !== null ? project["attempt_title"] : project["post_title"]}
                                                            projectDesc={project["description"]}
                                                            projectThumb={config.rootPath + project["thumbnail"]}
                                                            projectDate={project["updated_at"]}
                                                            projectType={project["post_type_string"]}
                                                            renown={project["tier"]}
                                                            onClick={() => navigate("/attempt/" + project["_id"])}
                                                            // onClick={() => navigate("/challenge/" + project["post_id"])}
                                                            userTier={authState.tier}
                                                            userThumb={config.rootPath + "/static/user/pfp/" + authState.id}
                                                            userId={authState.id}
                                                            username={authState.userName}
                                                            backgroundName={authState.backgroundName}
                                                            backgroundPalette={authState.backgroundColor}
                                                            backgroundRender={authState.backgroundRenderInFront}
                                                            hover={false}
                                                            exclusive={false}
                                                            attempt={true}
                                                            role={authState.role}
                                                        />
                                                    ) : (
                                                        <ProjectCard
                                                            width={(chatOpen || sidebarOpen) ? "16vw" : (window.innerWidth < 1000 ? 'fit-content' : '20vw')}
                                                            imageWidth={(chatOpen || sidebarOpen) ? "16vw" : "23vw"}
                                                            projectId={project["post_id"]}
                                                            projectTitle={project["post_title"]}
                                                            projectDesc={project["description"]}
                                                            projectThumb={config.rootPath + project["thumbnail"]}
                                                            projectDate={project["updated_at"]}
                                                            projectType={project["post_type_string"]}
                                                            renown={project["tier"]}
                                                            onClick={() => navigate("/challenge/" + project["post_id"])}
                                                            // onClick={() => navigate("/attempt/" + project["_id"])}
                                                            userTier={authState.tier}
                                                            userThumb={config.rootPath + "/static/user/pfp/" + authState.id}
                                                            userId={authState.id}
                                                            username={authState.userName}
                                                            backgroundName={authState.backgroundName}
                                                            backgroundPalette={authState.backgroundColor}
                                                            backgroundRender={authState.backgroundRenderInFront}
                                                            exclusive={false}
                                                            hover={false}
                                                            role={authState.role}
                                                            // attempt={true}
                                                        />
                                                    )}
                                                </div>
                                            )
                                        })}
                                </Carousel>
                            </div>
                        ) : (
                            <Lottie options={defaultOptions}
                                    height={200}
                                    width={300}/>
                        )}
                    {/*<ProjectCarousel projects={activeData} width={450} height={200}/>*/}
                </Typography>
            </Typography>
        )
    }

    const Challenges = () => {
        return (
            <Typography sx={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "auto",
                paddingRight: "auto",
                justifyContent: "center",
                width: "103%",
                paddingBottom: "10px"
            }}>
                <Typography sx={{display: "flex"}}>
                    <Typography variant="h5" gutterBottom>
                        Most Challenging
                    </Typography>
                </Typography>
                <Typography component={"div"} sx={
                    //@ts-ignore
                    mostChallenging !== undefined && mostChallenging !== null && mostChallenging.length > 0 ? chatOpen || sidebarOpen ? {
                        display: "flex",
                        justifyContent: "start",
                        flexDirection: `row`,
                        alignContent: `center`,
                        overflowX: "auto",
                        width: "83vw"
                    } : {
                        display: "flex",
                        justifyContent: "start",
                        flexDirection: `row`,
                        alignContent: `center`,
                        overflowX: "auto",
                        width: "95vw"
                    } : {
                        display: "flex",
                        justifyContent: "start",
                        flexDirection: `row`,
                        alignContent: `center`,
                        overflowX: "auto",
                        width: "50vw"
                    }}>
                    {
                        //@ts-ignore
                        mostChallenging !== null && mostChallenging.length > 0 ? (
                            // <ProjectCarousel projects={mostChallenging} height={200} width={450}/>
                            <div style={{width: "100%"}}>
                                <Carousel itemsShown={(window.innerWidth < 1000 ? 1 : 5)} infiniteLoop={true} itemsToSlide={(window.innerWidth < 1000 ? 1 : 5)}>
                                    {
                                        //@ts-ignore
                                        mostChallenging.map((project, index) => {
                                            return (
                                                <div>
                                                    <ProjectCard
                                                        width={(chatOpen || sidebarOpen) ? "16vw" : (window.innerWidth < 1000 ? 'fit-content' : '20vw')}
                                                        imageWidth={(chatOpen || sidebarOpen) ? "16vw" : "23vw"}
                                                        projectId={project["_id"]}
                                                        projectTitle={project["title"] !== null ? project["title"] : project["post_title"]}
                                                        projectDesc={project["description"]}
                                                        projectThumb={config.rootPath + project["thumbnail"]}
                                                        projectDate={project["updated_at"]}
                                                        projectType={project["post_type_string"]}
                                                        renown={project["tier"]}
                                                        onClick={() => navigate("/attempt/" + project["_id"])}
                                                        userTier={authState.tier}
                                                        userThumb={config.rootPath + "/static/user/pfp/" + authState.id}
                                                        userId={authState.id}
                                                        username={authState.userName}
                                                        backgroundName={authState.backgroundName}
                                                        backgroundPalette={authState.backgroundColor}
                                                        backgroundRender={authState.backgroundRenderInFront}
                                                        exclusive={false}
                                                        hover={false}
                                                        attempt={true}
                                                        role={authState.role}
                                                    />
                                                </div>
                                            )
                                        })}
                                </Carousel>
                            </div>
                        ) : (
                            <Lottie options={defaultOptions}
                                    height={200}
                                    width={300}/>
                        )}
                </Typography>
            </Typography>
        )
    }

    const Started = () => {

        return (
            <Typography sx={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "auto",
                paddingRight: "auto",
                justifyContent: "center",
                width: "103%",
                paddingBottom: "10px"
            }}>
                <Typography sx={{display: "flex"}}>
                    <Typography variant="h5" gutterBottom>
                        Don't Give Up Yet!
                    </Typography>
                </Typography>
                {
                    //@ts-ignore
                    incomplete !== null && incomplete.length > 0 ? (
                        <Typography component={"div"} sx={
                            //@ts-ignore
                            incomplete !== undefined && incomplete !== null && incomplete.length > 0 ? chatOpen || sidebarOpen ? {
                                display: "flex",
                                justifyContent: "start",
                                flexDirection: `row`,
                                alignContent: `center`,
                                overflowX: "auto",
                                width: "83vw"
                            } : {
                                display: "flex",
                                justifyContent: "start",
                                flexDirection: `row`,
                                alignContent: `center`,
                                overflowX: "auto",
                                width: "95vw"
                            } : {
                                display: "flex",
                                justifyContent: "start",
                                flexDirection: `row`,
                                alignContent: `center`,
                                overflowX: "auto",
                                width: "50vw"
                            }}>
                            <div style={{width: "100%"}}>
                                <Carousel itemsShown={(window.innerWidth < 1000 ? 1 : 5)} infiniteLoop={true} itemsToSlide={(window.innerWidth < 1000 ? 1 : 5)}>
                                    {
                                        //@ts-ignore
                                        incomplete.map((project, index) => {
                                            return (
                                                <div>
                                                    {project["_id"] !== "-1" ? (
                                                        <ProjectCard
                                                            width={(chatOpen || sidebarOpen) ? "16vw" : (window.innerWidth < 1000 ? 'fit-content' : '20vw')}
                                                            imageWidth={(chatOpen || sidebarOpen) ? "16vw" : "23vw"}
                                                            projectId={project["_id"]}
                                                            projectTitle={project["attempt_title"] !== null ? project["attempt_title"] : project["post_title"]}
                                                            projectDesc={project["description"]}
                                                            projectThumb={config.rootPath + project["thumbnail"]}
                                                            projectDate={project["updated_at"]}
                                                            projectType={project["post_type_string"]}
                                                            renown={project["tier"]}
                                                            onClick={() => navigate("/attempt/" + project["_id"])}
                                                            userTier={authState.tier}
                                                            userThumb={config.rootPath + "/static/user/pfp/" + authState.id}
                                                            userId={authState.id}
                                                            username={authState.userName}
                                                            backgroundName={authState.backgroundName}
                                                            backgroundPalette={authState.backgroundColor}
                                                            backgroundRender={authState.backgroundRenderInFront}
                                                            exclusive={false}
                                                            hover={false}
                                                            attempt={true}
                                                            role={authState.role}
                                                        />
                                                    ) : (
                                                        // <div>challenge</div>
                                                        <ProjectCard
                                                            width={(chatOpen || sidebarOpen) ? "16vw" : (window.innerWidth < 1000 ? 'fit-content' : '20vw')}
                                                            imageWidth={(chatOpen || sidebarOpen) ? "16vw" : "23vw"}
                                                            projectId={project["post_id"]}
                                                            projectTitle={project["post_title"]}
                                                            projectDesc={project["description"]}
                                                            projectThumb={config.rootPath + project["thumbnail"]}
                                                            projectDate={project["updated_at"]}
                                                            projectType={project["post_type_string"]}
                                                            renown={project["tier"]}
                                                            onClick={() => navigate("/challenge/" + project["post_id"])}
                                                            userTier={authState.tier}
                                                            userThumb={config.rootPath + "/static/user/pfp/" + authState.id}
                                                            userId={authState.id}
                                                            username={authState.userName}
                                                            backgroundName={authState.backgroundName}
                                                            backgroundPalette={authState.backgroundColor}
                                                            backgroundRender={authState.backgroundRenderInFront}
                                                            exclusive={false}
                                                            hover={false}
                                                            role={authState.role}
                                                            // attempt={true}
                                                        />
                                                    )}
                                                </div>
                                            )
                                        })}
                                </Carousel>
                            </div>
                        </Typography>
                    ) : (
                        <Typography component={"div"} sx={{
                            display: "flex",
                            flexWrap:"wrap",
                            justifyContent: "center",
                            flexDirection: `row`,
                            overflowY: "auto",
                            overflowX: "hidden",
                            alignContent: `center`
                        }}>
                            <Lottie options={defaultOptions}
                                    height={200}
                                    width={300}/>
                        </Typography>
                    )}
            </Typography>
        )
    }


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {/*<AppWrapper/>*/}
                {loading ? (
                    <div>
                        <ThreeDots/>
                    </div>
                ) : (
                    <Grid container sx={(chatOpen || sidebarOpen) ? {display: "flex", justifyContent: "center", alignItems: "center", height: "1", marginLeft: "25px"} : { display: "flex", justifyContent: "center", alignItems: "center", height: "1"}}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: "wrap",
                                width: "100%",
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                                color: 'text.primary',
                                borderRadius: 1,
                            }}
                        >
                            {PastProjects()}
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: "wrap",
                                width: "100%",
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                                color: 'text.primary',
                                borderRadius: 1,
                            }}
                        >
                            {Challenges()}
                        </Box>
                        <Box
                            sx={window.innerWidth > 1000 ? {
                                display: 'flex',
                                flexWrap: "wrap",
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                                color: 'text.primary',
                                borderRadius: 1,
                            }: {
                                display: 'flex',
                                flexWrap: "wrap",
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                                color: 'text.primary',
                                borderRadius: 1,
                                marginBottom: "50px"
                            }}
                        >
                            {Started()}
                        </Box>
                    </Grid>
                )}
            </CssBaseline>
        </ThemeProvider>
    );
}

export default Active;
