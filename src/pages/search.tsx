

import * as React from "react";
import { Button, Card, createTheme, CssBaseline, PaletteMode, Tab, Tabs, ThemeProvider, Tooltip, Typography } from "@mui/material";
import { getAllTokens } from "../theme";
import ProjectCard from "../components/ProjectCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppWrapper from "../components/AppWrapper";
import call from "../services/api-call";
import Post from "../models/post";
import { useEffect, useReducer } from "react";
import swal from "sweetalert";
import config from "../config";
import { initialAuthStateUpdate, selectAuthState, updateAuthState } from "../reducers/auth/auth";
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
import { useAppSelector } from "../app/hooks";
import ReactGA from "react-ga4";
import BytesCard from "../components/BytesCard";


interface SearchOption {
    type: "challenge" | "user" | "byte";
    content: any;
}


function Search() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [searchRecId, setSearchRecordId] = React.useState(null);

    let navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    const [searchOptions, setSearchOptions] = React.useState<SearchOption[]>([])

    const [skip, setSkip] = React.useState(0);

    const [minorTab, setMinorTab] = React.useState("bytes");

    ReactGA.initialize("G-38KBFJZ6M6");

    const searchPosts = async (skip: number) => {
        if (searchParams.get("q") === undefined || searchParams.get("q") === null) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Query Required",
                    "A query must be passed for the search page."
                );
        }

        let params = {
            query: searchParams.get("q"),
            skip: skip,
            limit: 20,
        }

        if (searchRecId !== null) {
            //@ts-ignore
            params["search_rec_id"] = searchRecId;
        }

        if (
            searchParams.get("author") !== undefined &&
            searchParams.get("author") !== null &&
            searchParams.get("author") !== ""
        ) {
            // @ts-ignore
            params["author"] = searchParams.get("author");
        }

        if (
            searchParams.get("languages") !== undefined &&
            searchParams.get("languages") !== null &&
            searchParams.get("languages") !== ""
        ) {
            // @ts-ignore
            params["languages"] = (searchParams.get("languages").split(",")).map(Number);
        }

        if (
            searchParams.get("attempts_min") !== undefined &&
            searchParams.get("attempts_min") !== null &&
            searchParams.get("attempts_min") !== ""
        ) {
            // @ts-ignore
            params["attempts_min"] = searchParams.get("attempts_min");
        }

        if (
            searchParams.get("attempts_max") !== undefined &&
            searchParams.get("attempts_max") !== null &&
            searchParams.get("attempts_max") !== ""
        ) {
            // @ts-ignore
            params["attempts_max"] = searchParams.get("attempts_max");
        }

        if (
            searchParams.get("completions_min") !== undefined &&
            searchParams.get("completions_min") !== null &&
            searchParams.get("completions_min") !== ""
        ) {
            // @ts-ignore
            params["completions_min"] = searchParams.get("completions_min");
        }

        if (
            searchParams.get("completions_max") !== undefined &&
            searchParams.get("complecompletions_maxtionsMax") !== null &&
            searchParams.get("completions_max") !== ""
        ) {
            // @ts-ignore
            params["completions_max"] = searchParams.get("completions_max");
        }

        if (
            searchParams.get("coffee_min") !== undefined &&
            searchParams.get("coffee_min") !== null &&
            searchParams.get("coffee_min") !== ""
        ) {
            // @ts-ignore
            params["coffee_min"] = searchParams.get("coffee_min");
        }

        if (
            searchParams.get("coffee_max") !== undefined &&
            searchParams.get("coffee_max") !== null &&
            searchParams.get("coffee_max") !== ""
        ) {
            // @ts-ignore
            params["coffee_max"] = searchParams.get("coffee_max");
        }

        if (
            searchParams.get("views_min") !== undefined &&
            searchParams.get("views_min") !== null &&
            searchParams.get("views_min") !== ""
        ) {
            // @ts-ignore
            params["views_min"] = searchParams.get("views_min");
        }

        if (
            searchParams.get("views_max") !== undefined &&
            searchParams.get("views_max") !== null &&
            searchParams.get("views_max") !== ""
        ) {
            // @ts-ignore
            params["views_max"] = searchParams.get("views_max");
        }

        if (
            searchParams.get("tags") !== undefined &&
            searchParams.get("tags") !== null &&
            searchParams.get("tags") !== ""
        ) {
            // @ts-ignore
            params["tags"] = (searchParams.get("tags")).split(",");
        }

        if (
            searchParams.get("challenge_type") !== undefined &&
            searchParams.get("challenge_type") !== null &&
            searchParams.get("challenge_type") !== ""
        ) {
            // @ts-ignore
            params["challenge_type"] = Number(searchParams.get("challenge_type"));
        }

        if (
            searchParams.get("visibility") !== undefined &&
            searchParams.get("visibility") !== null &&
            searchParams.get("visibility") !== ""
        ) {
            // @ts-ignore
            params["visibility"] = Number(searchParams.get("visibility"));
        }

        if (
            searchParams.get("since") !== undefined &&
            searchParams.get("since") !== null &&
            searchParams.get("since") !== ""
        ) {
            // @ts-ignore
            params["since"] = Number(searchParams.get("since"));
        }

        if (
            searchParams.get("until") !== undefined &&
            searchParams.get("until") !== null &&
            searchParams.get("until") !== ""
        ) {
            // @ts-ignore
            params["until"] = Number(searchParams.get("until"));
        }

        if (
            searchParams.get("tier") !== undefined &&
            searchParams.get("tier") !== null &&
            searchParams.get("tier") !== ""
        ) {
            // @ts-ignore
            params["tier"] = Number(searchParams.get("tier"));
        }

        if (minorTab === "challenges") {
            let res = await call(
                "/api/search/posts",
                "post",
                null,
                null,
                null,

                // @ts-ignore
                params
            )

            if (res === undefined) {
                swal("There has been an issue getting your search results. Please try again later.")
            }

            if (res["message"] === "You must be logged in to access the GIGO system.") {
                let authState = Object.assign({}, initialAuthStateUpdate)
                // @ts-ignore
                dispatch(updateAuthState(authState))
                navigate("/login?forward="+encodeURIComponent(window.location.pathname))
            }

            if (res["challenges"].length === 0) {
                if (skip === 0) {
                    //@ts-ignore
                    swal("Sorry, no challenges match those parameters!")
                } else {
                    //@ts-ignore
                    // swal("There was an unexpected issue. Please try again later.")
                    // if (window.location.href.includes("search")) {
                    //     //@ts-ignore
                    //     swal("That's all the posts that match those parameters!")
                    // }
                }
            }

            // @ts-ignore
            let data = res["challenges"].map(x => ({ type: "challenge", content: x }))
            if (searchRecId === null) {
                setSearchOptions(data)
            } else {
                if (skip === 0) {
                    setSearchOptions(data)
                } else {
                    let search = searchOptions
                    let finalArray = search.concat(data)
                    setSearchOptions(finalArray)
                }
            }


            if (res["search_rec_id"] !== null) {
                setSearchRecordId(res["search_rec_id"].toString())
            }

            setSkip(skip + 20)
        } else if (minorTab === "users") {
            let res = await call(
                "/api/search/users",
                "post",
                null,
                null,
                null,

                // @ts-ignore
                params
            )

            if (res === undefined) {
                swal("There has been an issue getting your search results. Please try again later.")
            }

            if (res["message"] === "You must be logged in to access the GIGO system.") {
                let authState = Object.assign({}, initialAuthStateUpdate)
                // @ts-ignore
                dispatch(updateAuthState(authState))
                navigate("/login?forward="+encodeURIComponent(window.location.pathname))
            }

            if (res["users"].length === 0) {
                if (skip === 0) {
                    //@ts-ignore
                    swal("Sorry, no users match those parameters!")
                } else {
                    //@ts-ignore
                    // swal("There was an unexpected issue. Please try again later.")
                    // if (window.location.href.includes("search")) {
                    //     //@ts-ignore
                    //     swal("That's all the posts that match those parameters!")
                    // }
                }
            }

            // @ts-ignore
            let data = res["users"].map(x => ({ type: "user", content: x }))
            if (searchRecId === null) {
                if (skip === 0) {
                    setSearchOptions(data)
                } else {
                    if (res["users"].length > 0 && res["users"][0]["_id"] !== searchOptions[0].content["_id"]) {
                        let search = searchOptions
                        let finalArray = search.concat(data)
                        setSearchOptions(finalArray)
                    }
                }
            } else {
                if (skip === 0) {
                    setSearchOptions(data)
                } else {
                    let search = searchOptions
                    let finalArray = search.concat(data)
                    setSearchOptions(finalArray)
                }
            }


            setSkip(skip + 20)
        } else {
            let res = await call(
                "/api/search/bytes",
                "post",
                null,
                null,
                null,

                // @ts-ignore
                params
            )

            if (res === undefined) {
                swal("There has been an issue getting your search results. Please try again later.")
            }

            if (res["message"] === "You must be logged in to access the GIGO system.") {
                let authState = Object.assign({}, initialAuthStateUpdate)
                // @ts-ignore
                dispatch(updateAuthState(authState))
                navigate("/login?forward="+encodeURIComponent(window.location.pathname))
            }

            if (res["posts"].length === 0) {
                if (skip === 0) {
                    //@ts-ignore
                    swal("Sorry, no bytes match those parameters!")
                } else {
                    //@ts-ignore
                    // swal("There was an unexpected issue. Please try again later.")
                    // if (window.location.href.includes("search")) {
                    //     //@ts-ignore
                    //     swal("That's all the posts that match those parameters!")
                    // }
                }
            }

            // @ts-ignore
            let data = res["posts"].map(x => ({ type: "byte", content: x }))
            if (skip === 0) {
                setSearchOptions(data)
            } else {
                let search = searchOptions
                let finalArray = search.concat(data)
                setSearchOptions(finalArray)
            }


            setSkip(skip + 20)
        }

    }

    let loggedIn = false
    const authState = useAppSelector(selectAuthState);
    if (authState.authenticated !== false) {
        loggedIn = true
    }

    const handleSearchCompleted = async (postID: string) => {
        if (loggedIn) {
            if (searchParams.get("q") === undefined || searchParams.get("q") === null) {
                if (sessionStorage.getItem("alive") === null)
                    //@ts-ignore
                    swal(
                        "Query Required",
                        "A query must be passed for the search page."
                    );
            }


            let params = {
                post_id: postID,
                query: searchParams.get("q"),
                search_rec_id: searchRecId,
            }

            let res = await call(
                "/api/search/complete",
                "post",
                null,
                null,
                null,
                // @ts-ignore
                params
            )

            if (res === undefined) {
                swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                    "We'll get crackin' on that right away!")
                return
            }
        } else {

        }
    }

    window.onscroll = function () {
        if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
            searchPosts(skip)
        }
    }



    useEffect(() => {
        //null
        searchPosts(0)
    }, [searchParams, minorTab])

    let minorValues = ["bytes", "challenges", "users"]

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setSkip(0)
        setSearchRecordId(null)
        setMinorTab(newValue)
    };

    const handleRenownCheck = (renown: number) => {
        let imgSrc;
        switch (renown) {
            case 0:
                imgSrc = renown1;
                break;
            case 1:
                imgSrc = renown2;
                break;
            case 2:
                imgSrc = renown3;
                break;
            case 3:
                imgSrc = renown4;
                break;
            case 4:
                imgSrc = renown5;
                break;
            case 5:
                imgSrc = renown6;
                break;
            case 6:
                imgSrc = renown7;
                break;
            case 7:
                imgSrc = renown8;
                break;
            case 8:
                imgSrc = renown9;
                break;
            case 9:
                imgSrc = renown10;
                break;
            default:
                imgSrc = renown10;
                break;
        }
        return imgSrc;
    }

    // let container: HTMLElement | null = document.getElementById('container');
    //
    // if (container) {
    //     let fontSize: number = 24; // Start with a high value
    //     container.style.fontSize = fontSize + 'px';
    //
    //     // Reduce the font size until the text fits the width, or the font size is 12px
    //     while (container.scrollWidth > container.offsetWidth && fontSize > 12) {
    //         fontSize--;
    //         container.style.fontSize = fontSize + 'px';
    //     }
    // }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {/*<AppWrapper/>*/}
                <div>
                    <div style={{ display: "flex", justifyContent: "center", paddingBottom: "50px" }}>
                        <Tabs
                            orientation="horizontal"
                            value={minorTab}
                            onChange={handleChange}
                            aria-label="Horizontal tabs"
                        >
                            {minorValues.map((minorValue) => {
                                return <Tab label={minorValue} value={minorValue} key={minorValue}
                                    sx={{ color: "text.primary", borderRadius: 1 }} />;
                            })}
                        </Tabs>
                    </div>
                    <Typography component={"div"} sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        flexDirection: `row`,
                        overflowY: "auto",
                        overflowX: "hidden",
                        alignContent: `center`
                    }}>
                        {searchOptions.map((option) => {
                            if (option.type === "challenge") {
                                return (
                                    <div style={{ padding: 30, display: "flex" }}>
                                        <ProjectCard
                                            width={window.innerWidth < 1000 ? 'fit-content' : '20vw'}
                                            height={"23vh"}
                                            projectId={option.content["_id"]}
                                            projectTitle={option.content["title"]}
                                            projectDesc={option.content["description"]}
                                            projectThumb={config.rootPath + option.content["thumbnail"]}
                                            //@ts-ignore
                                            projectDate={option.content["updated_at"]}
                                            projectType={option.content["post_type_string"]}
                                            renown={option.content["tier"]}
                                            onClick={async () => {
                                                await handleSearchCompleted(option.content["_id"])
                                                navigate("/challenge/" + option.content["_id"])
                                            }}
                                            //@ts-ignore
                                            userTier={option.content["user_tier"]}
                                            userThumb={config.rootPath + "/static/user/pfp/" + option.content["author_id"]}
                                            userId={option.content["author_id"]}
                                            username={option.content["author"]}
                                            //@ts-ignore
                                            backgroundName={option.content["background_name"]}
                                            //@ts-ignore
                                            backgroundPalette={option.content["background_palette"]}
                                            //@ts-ignore
                                            backgroundRender={option.content["background_render"]}
                                            //todo come back and add this
                                            exclusive={null}
                                            hover={false}
                                            role={
                                                //@ts-ignore
                                                option.content["user_status"]}
                                        />
                                    </div>
                                )
                            }

                            if (option.type === "byte") {
                                return (
                                    <div style={{ padding: 30, display: "flex" }}>
                                        <BytesCard
                                            height={"fit-content"}
                                            width={'fit-content'}
                                            imageHeight={"500px"}
                                            imageWidth={"281px"}
                                            bytesId={option.content["_id"]}
                                            bytesTitle={option.content["name"]}
                                            bytesDesc={option.content["description_medium"]}
                                            bytesThumb={config.rootPath + "/static/bytes/t/" + option.content["_id"]}
                                            onClick={() => navigate("/byte/" + option.content["_id"])}
                                            role={authState.role}
                                        />
                                    </div>
                                )
                            }

                            // @ts-ignore
                            return (
                                <div style={{ padding: 30, display: "flex" }}>
                                    <Card sx={window.innerWidth > 1000 ? {
                                        display: 'flex',
                                        textAlign: "left",
                                        minWidth: 150,
                                        maxWidth: "97vw",
                                        width: "auto",
                                        height: 200,
                                        boxShadow: "0px 6px 3px -3px rgba(0,0,0,0.3),0px 3px 3px 0px rgba(0,0,0,0.3),0px 3px 9px 0px rgba(0,0,0,0.3)",
                                        marginLeft: "20px"
                                    } : {
                                        display: 'flex',
                                        textAlign: "left",
                                        minWidth: 150,
                                        maxWidth: "97vw",
                                        width: "85vw",
                                        height: 250,
                                        boxShadow: "0px 6px 3px -3px rgba(0,0,0,0.3),0px 3px 3px 0px rgba(0,0,0,0.3),0px 3px 9px 0px rgba(0,0,0,0.3)",
                                        marginLeft: "20px"
                                    }}>
                                        <Button
                                            sx={{ width: "100%" }}
                                            onClick={async () => {
                                                await handleSearchCompleted(option.content._id)
                                                navigate("/user/" + option.content._id)
                                            }}
                                        >
                                            <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", justifyContent: "left", alignItems: "center", marginRight: "10px" }}>
                                                <div style={{ display: "flex", width: "50%", justifyContent: "left" }}>
                                                    <UserIcon
                                                        userId={option.content._id}
                                                        userTier={
                                                            //@ts-ignore
                                                            option.content.user_rank}
                                                        userThumb={
                                                            //@ts-ignore
                                                            config.rootPath + option.content.pfp_path}
                                                        backgroundName={
                                                            //@ts-ignore
                                                            option.content.background_name}
                                                        backgroundPalette={
                                                            //@ts-ignore
                                                            option.content.background_palette}
                                                        backgroundRender={
                                                            //@ts-ignore
                                                            option.content.background_render}
                                                        size={65}
                                                        imageTop={2}
                                                    />
                                                </div>
                                                <div>
                                                    <Typography variant="h5" component="div" id={"container"} style={window.innerWidth > 1000 ? {} : { width: "45vw", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "5vw" }}>
                                                        {
                                                            //@ts-ignore
                                                            option.content.user_name}
                                                    </Typography>
                                                    <Tooltip
                                                        title={`Renown ${
                                                            //@ts-ignore
                                                            option.content.tier + 1}`}
                                                    >
                                                        <img
                                                            style={{
                                                                height: "7vh",
                                                                width: "auto",
                                                                opacity: "0.85",
                                                                // overflow: "hidden",
                                                            }}
                                                            src={handleRenownCheck(
                                                                //@ts-ignore
                                                                option.content.tier)}
                                                        // src={renown1}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </Button>
                                    </Card>
                                </div>
                            )
                        })}
                    </Typography>
                </div>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default Search;