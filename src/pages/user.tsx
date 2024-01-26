

// @ts-nocheck

import * as React from "react";
import {SyntheticEvent, useEffect} from "react";
import {
    Autocomplete,
    Avatar,
    Box, Button,
    Chip,
    createTheme,
    CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Grid, MenuItem,
    PaletteMode, Select,
    TextField,
    ThemeProvider,
    Typography
} from "@mui/material";
import {getAllTokens} from "../theme";
import ProjectCard from "../components/ProjectCard";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {
    initialAuthStateUpdate,
    selectAuthStateId,
    updateAuthState
} from "../reducers/auth/auth";
import {useNavigate} from "react-router-dom";
import {Chart} from "react-google-charts";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {ThreeDots} from "react-loading-icons";
import ProgressBar from "@ramonak/react-progress-bar";
import Post from "../models/post";
import {programmingLanguages} from "../services/vars";
import SearchIcon from '@mui/icons-material/Search';
import {useParams} from "react-router";
import useInfiniteScroll from "../hooks/infiniteScroll";
import MoonLoader from "react-spinners/MoonLoader";
import LottieAnimation from "../components/LottieAnimation";
import useDebounce from "../hooks/debounce";
import ProfilePicture from "../components/ProfilePicture";
import coffeePot from "../img/renown/coffee_maker.svg";
import r1Lvl from "../img/renown/r1Lvl.svg";
import r2Lvl from "../img/renown/r2Lvl.svg";
import r3Lvl from "../img/renown/r3Lvl.svg";
import r4Lvl from "../img/renown/r4Lvl.svg";
import r5Lvl from "../img/renown/r5Lvl.svg";
import r6Lvl from "../img/renown/r6Lvl.svg";
import r7Lvl from "../img/renown/r7Lvl.svg";
import r8Lvl from "../img/renown/r8Lvl.svg";
import r9Lvl from "../img/renown/r9Lvl.svg";
import r10Lvl from "../img/renown/r10Lvl.svg";
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
import Lottie from "react-lottie";
import ProBackgroundProfile from "../components/Icons/ProBackgroundProfile";
import UserIcon from "../components/UserIcon";
import {selectAppWrapperChatOpen, selectAppWrapperSidebarOpen} from "../reducers/appWrapper/appWrapper";
import {Helmet, HelmetProvider} from "react-helmet-async";
import alternativeImage from "../img/Black.png"

function User() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const dispatch = useAppDispatch();

    const [userActivity, setUserActivity] = React.useState([])

    const [userData, setUserData] = React.useState(null)

    const [loading, setLoading] = React.useState(true)

    const [searchOptions, setSearchOptions] = React.useState<Post[]>([])

    const [searchActive, setSearchActive] = React.useState(false)

    const [query, setQuery] = React.useState("")
    const debounceQuery = useDebounce(query, 500);

    const [languages, setLanguages] = React.useState([])

    const [following, setFollowing] = React.useState(false)

    const [challengeType, setChallengeType] = React.useState(-1)

    const [tierFilter, setTierFilter] = React.useState(-1)

    const [userBackground, setUserBackground] = React.useState(null)

    const [mutual, setMutual] = React.useState(false)

    const [skip, setSkip] = React.useState(0)

    let navigate = useNavigate();

    const sidebarOpen = useAppSelector(selectAppWrapperSidebarOpen);

    const chatOpened = useAppSelector(selectAppWrapperChatOpen);

    const ShowButton = () => (
        <Button
            onClick={() => freshSearch()}
            style={{width: "5px"}}
        >
            {<SearchIcon/>}
        </Button>
    )

    // retrieve url params
    let {id: urlId} = useParams();
    const [id, setId] = React.useState<string>("");

    const userId = useAppSelector(selectAuthStateId);

    const [friendBool, setFriendBool] = React.useState(false)

    const [requestBool, setRequestBool] = React.useState(false)

    useEffect(() => {
        if (urlId === "") {
            return;
        }



        // check if the urlId is all numbers
        if (/^\d+$/.test(urlId)) {
            setId(urlId);
            return;
        }

        // we have a username so let's get the id
        call(
            "/api/user/getId",
            "post",
            null,
            null,
            null,
            {username: urlId},
            null,
            config.rootPath
        ).then((res) => {
            if (res["id"] !== undefined) {
                setId(res["id"]);
            } else {
                navigate("/404");
            }
        });
    }, [urlId]);

    const checkFriend = async () => {
        if (id === "") {
            return;
        }

        let friend = call(
            "/api/friends/check",
            "post",
            null,
            null,
            null,
            {profile_id: id},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            friend
        ])

        setFriendBool(res["friend"])

    }

    const requestCheck = async () => {
        if (id === "") {
            return;
        }

        let request = call(
            "/api/friends/requestCheck",
            "post",
            null,
            null,
            null,
            {user_id: id},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            request
        ])

        setRequestBool(res["request"])

    }

    const sendFriendRequest = async () => {
        if (id === "") {
            return;
        }

        let friend = call(
            "/api/friends/request",
            "post",
            null,
            null,
            null,
            {friend_id: id},
            null,
            config.rootPath
        )

        const [res] = await Promise.all([
            friend
        ])

        if (res["message"] === "mutual request")
        {
            setMutual(true)
        } else if (res["message"] === "already friends") {
            //@ts-ignore
            swal("You are already friends!")
        } else if (res["message"] === "pending request") {
            //@ts-ignore
            swal("Friend request already sent", "", "info")
            setRequestBool(true)
        } else if (res["message"] === "friend request sent") {
            //@ts-ignore
            swal("Your friend request has been sent!", "", "success")
            setRequestBool(true)
        }

    }

    const acceptFriend = async () => {
        if (id === "") {
            return;
        }

        let res = await call(
            "/api/friends/accept",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                requester_id: id
            }
        )

        if (res["message"] !== "friend request accepted") {
            //@ts-ignore
            swal("An unexpected error has occurred", "We're sorry, we'll get right on that!", "error")
        } else if (res["message"] === "friend request accepted") {
            //@ts-ignore
            swal("friend request accepted", "", "success")
        }
    }

    const declineFriend = async () => {
        if (id === "") {
            return;
        }

        let res = await call(
            "/api/friends/decline",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                requester_id: id
            }
        )
        if (res["message"] !== "friend request declined") {
            //@ts-ignore
            swal("An unexpected error has occurred", "We're sorry, we'll get right on that!", "error")
        }
    }

    const getUserData = async () => {
        if (id === "") {
            return;
        }

        //todo check if maybe it should be formatted safer
        if (userData === null) {
            let user = call(
                "/api/user/profilePage",
                "post",
                null,
                null,
                null,
                {author_id: id},
                null,
                config.rootPath
            )

            const [res] = await Promise.all([
                user
            ])

            if (res === undefined) {
                swal("There has been an issue loading data. Please try again later.")
            }

            setUserData(res["user"])
            setUserActivity(res["activity"])
            setFollowing(res["following"])

            if (res["user"]["color_palette"] !== null && res["user"]["color_palette"]!== "null" && res["user"]["color_palette"]!== "" && res["user"]["color_palette"] !== "undefined" && res["user"]["color_palette"] !== undefined){
                fetch(`${config.rootPath}/static/ui/lottie/user_backgrounds/${res["user"]["color_palette"]}_${res["user"]["name"]}.json`, {credentials: 'include'})
                    .then(data => {
                        data.json().then(json => {
                            setUserBackground(json)
                        })
                    })
                    .catch(error => console.error(error));
            }
        }
    }

    useEffect(() => {
        if (id === "") {
            return;
        }

        setLoading(true)
        getUserData().then(() => {
            checkFriend().then(() => {
                requestCheck().then(() => {
                    setLoading(false)
                })
            })
        })
    }, [id])

    const stopScroll = React.useRef(false)

    const getQueryProjects = async (fresh: boolean = false, paramOverrides: Object = {}) => {
        if (id === "") {
            return;
        }

        let params = {
            query: query,
            author: id,
            published: true,
            skip: fresh ? 0 : skip,
            limit: 32,
        }

        if (languages !== undefined) {
            // @ts-ignore
            params["languages"] = languages
        }

        if (challengeType !== undefined && challengeType !== null && challengeType > -1) {
            // @ts-ignore
            params["challenge_type"] = challengeType
        }

        if (tierFilter !== undefined && tierFilter !== null && tierFilter > -1) {
            // @ts-ignore
            params["tier"] = tierFilter
        }

        // override params
        params = Object.assign(params, paramOverrides)


        let projects =  await call(
            "/api/search/posts",
            "post",
            null,
            null,
            null,
            params,
            null,
            config.rootPath
        );
        const [res] = await Promise.all([
            projects
        ])

        if (res === undefined || res["challenges"] === undefined) {
            swal("There has been an issue loading data. Please try again later.")
            return
        }

        if (res["challenges"].length < 32) {
            stopScroll.current = true
        }

        if (fresh) {
            setSearchOptions(res["challenges"])
            return
        }

        let opts = JSON.parse(JSON.stringify(searchOptions))
        setSearchOptions(opts.concat(res["challenges"]))
    }

    const freshSearch = async (paramOverrides: Object = {}) => {
        setSkip(0)
        stopScroll.current = false
        await getQueryProjects(true, paramOverrides)
        setSkip(32)
    }

    const scrollSearch = async () => {
        await getQueryProjects()
        setSkip(skip + 32)
    }

    const [isFetching, setIsFetching] = useInfiniteScroll(scrollSearch, true, 1440, stopScroll)

    useEffect(() => {
        if (id === "") {
            return;
        }

        if (debounceQuery) {
            freshSearch()
        }
    }, [debounceQuery]);

    useEffect(() => {
        if (id === "") {
            return;
        }
        freshSearch()
    }, [id]);

    const graphStuff = () => {
        return (
            <Typography component={"div"}
                        sx={{
                            display: "flex",
                            justifyContent: "start",
                            overflowY: "auto",
                            maxHeight: "50vh",
                            width: "65vw",
                            overflowX: "hidden",
                            alignItems: "center",
                            // outline: "1px solid",
                            boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                            borderRadius: 10
                        }}>
                {/*<Chart*/}
                {/*    width={"500px"}*/}
                {/*    height={"200px"}*/}
                {/*    chartType="AreaChart"*/}
                {/*    loader={<div>Loading Chart</div>}*/}
                {/*    data={GetGraphData(userActivity)}*/}
                {/*    rootProps={{"data-testid": "1"}}*/}
                {/*    options={{*/}
                {/*        backgroundColor: "transparent",*/}
                {/*        width: 63 * window.innerWidth / 100,*/}
                {/*        vAxis: {*/}
                {/*            gridlines: {*/}
                {/*                color: "transparent"*/}
                {/*            }*/}
                {/*        }*/}
                {/*    }}*/}

                {/*/>*/}
                <Chart
                    width={"20vw"}
                    height={"300px"}
                    chartType="AreaChart"
                    loader={<div>Loading Chart</div>}
                    data={GetGraphData(userActivity)}
                    curveTypes={"function"}
                    // data={[
                    //     [1, "test"],
                    //     [2, "test"],
                    //     [2, "test"]
                    // ]}
                    rootProps={{"data-testid": "1"}}
                    options={{
                        backgroundColor: "transparent",
                        width: 60 * window.innerWidth / 100,
                        vAxis: {
                            title: 'Minutes',
                            gridlines: {
                                color: "transparent"
                            },
                            titleTextStyle: {color: `${theme.palette.text.primary}`},
                            textStyle: {color: `${theme.palette.text.primary}`}
                        },
                        hAxis: {
                            textStyle: {color: `${theme.palette.text.primary}`}
                        },
                        curveTypes:"function",
                        // series: [{color: "#233350"}],
                        // intervals: [{ style:'area', color: "#233350" }],
                        legend: 'none',
                        title: "User Activity",
                        titleTextStyle: {color: `${theme.palette.text.primary}`},
                        colors: ['#6495ED'],
                    }}

                />
            </Typography>
        )
    }

    const GetGraphData = (dataArray = []) => {
        let finalDates = [["Day", "Activity"]];
        const currentDate = new Date();
        const day = currentDate.getDate();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        // Function to pad single-digit numbers
        const padNumber = number => number < 10 ? `0${number}` : number.toString();

        for (let i = 1; i <= day; i++) {
            const dateString = `${year}-${padNumber(month)}-${padNumber(i)}`;
            const formattedDate = new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            finalDates.push([formattedDate, 0]);
        }

        if (dataArray !== undefined) {
            for (let i = 0; i < dataArray.length; i++) {
                const dateDay = parseInt(dataArray[i]["date"].split("T")[0].substr(8, 9));
                const dateString = `${year}-${padNumber(month)}-${padNumber(dateDay)}`;
                const formattedDate = new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                if (dataArray[i]["date_difference"] !== null) {
                    finalDates[dateDay] = [formattedDate, dataArray[i]["date_difference"] / 60];
                } else {
                    finalDates[dateDay] = [formattedDate, 30];
                }
            }
        }
        return finalDates;
    };

    // const GetGraphData = (dataArray: []) => {
    //     let finalDates = [
    //         ["Day", "Activity"]
    //     ]
    //     let currentDate = new Date();
    //     let day = currentDate.getDate()
    //     let year = currentDate.getFullYear();
    //     let month = currentDate.getMonth() + 1;
    //     if (month < 10){
    //         month = "0" + month.toString()
    //     } else {
    //         month = month.toString()
    //     }
    //     for (let i = 1; i <= day; i++){
    //         if (i < 10){
    //             finalDates.push([year.toString() + "-" + month + "-0" + i.toString(), 0])
    //         } else {
    //             finalDates.push([year.toString() + "-" + month + "-" + i.toString(), 0])
    //         }
    //     }
    //
    //
    //     if (dataArray !== undefined){
    //         for (let i = 0; i < dataArray.length; i++){
    //             if (dataArray[i]["date_difference"] !== null){
    //                 finalDates[parseInt(dataArray[i]["date"].split("T")[0].substr(8, 9))] = [dataArray[i]["date"].split("T")[0], dataArray[i]["date_difference"] / 60]
    //             } else {
    //                 finalDates[parseInt(dataArray[i]["date"].split("T")[0].substr(8, 9))] = [dataArray[i]["date"].split("T")[0], 30]
    //             }
    //         }
    //     }
    //     return finalDates
    // }

    const SearchBox = () => {
        if (searchOptions.length === 0 ) {
            return (
                <div>
                    No Projects!
                </div>
            )
        } else {
            return (
                <Grid container spacing={3} justifyContent={"space-between"} alignContent={"center"}>
                    {
                        searchOptions.map((projects) => {
                            return (
                                <Grid item>
                                    <ProjectCard
                                        width={window.innerWidth < 1000 ? 'fit-content' : "20vw"}
                                        height={"23vh"}
                                        projectId={projects["_id"]}
                                        projectTitle={projects["title"]}
                                        projectDesc={projects["description"]}
                                        projectThumb={config.rootPath + projects["thumbnail"]}
                                        //@ts-ignore
                                        projectDate={projects["updated_at"]}
                                        projectType={projects["post_type_string"]}
                                        renown={projects["tier"]}
                                        onClick={async () => {
                                            navigate("/challenge/" + projects["_id"])
                                        }}
                                        //@ts-ignore
                                        userTier={projects["user_tier"]}
                                        userThumb={config.rootPath + "/static/user/pfp/" + projects["author_id"]}
                                        userId={projects["author_id"]}
                                        username={projects["author"]}
                                        //@ts-ignore
                                        backgroundName={projects["background_name"]}
                                        //@ts-ignore
                                        backgroundPalette={projects["background_palette"]}
                                        //@ts-ignore
                                        backgroundRender={projects["background_render"]}
                                        exclusive={projects["challenge_cost"] === null ? false : true}
                                        hover={false}
                                    />
                                </Grid>
                            )
                        })
                    }
                    {
                        isFetching ? (
                            <Grid container spacing={2} justifyContent="center" alignItems="center"
                                  style={{marginTop: "10px"}}
                            >
                                <Grid item xs={12}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: "100%"
                                        }}
                                    >
                                        <MoonLoader color={theme.palette.primary.main} loading={true} size={35}/>
                                    </div>
                                </Grid>
                            </Grid>
                        ) : (<></>)
                    }
                </Grid>
            )
        }
    }

    const follow = async () => {
        if (id === "") {
            return;
        }

        let res = await call(
            "/api/user/follow",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {id: id},
            null,
            config.rootPath
        )

        if (res !== undefined && res["message"] !== undefined){
            if (res["message"] === "You must be logged in to access the GIGO system."){
                let authState = Object.assign({}, initialAuthStateUpdate)
                // @ts-ignore
                dispatch(updateAuthState(authState))
                navigate("/login")
            }
            if (res["message"] === "successful"){
                setFollowing(true)
                setUserData(prevData => ({
                    ...prevData,
                    follower_count: prevData.follower_count + 1,
                }));
            } else {
                swal("There was an issue following the user. Please try again later")
            }
        } else {
            swal("There was an issue following the user. Please try again later")
        }
    }

    const unFollow = async () => {
        if (id === "") {
            return;
        }

        let res = await call(
            "/api/user/unfollow",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {id: id},
            null,
            config.rootPath
        )

        if (res !== undefined && res["message"] !== undefined){
            if (res["message"] === "You must be logged in to access the GIGO system."){
                let authState = Object.assign({}, initialAuthStateUpdate)
                // @ts-ignore
                dispatch(updateAuthState(authState))
                navigate("/login")
            }

            if (res["message"] === "successful"){
                setFollowing(false)
                setUserData(prevData => ({
                    ...prevData,
                    follower_count: prevData.follower_count - 1,
                }));
            } else {
                swal("There was an issue following the user. Please try again later")
            }
        } else {
            swal("There was an issue following the user. Please try again later")
        }
    }

    let renownImg;
    let levelImg;
    let barColor;

    switch(userData === null ? "N/A" : userData["tier"]){
        case 0:
            renownImg = renown1;
            levelImg = r1Lvl;
            barColor ="linear-gradient(90deg, rgba(4,100,62,1) 25%, rgba(60,193,140,1) 100%)"
            break;
        case 1:
            renownImg = renown2;
            levelImg = r2Lvl;
            barColor ="linear-gradient(90deg, rgba(19,131,134,1) 25%, rgba(60,190,193,1) 100%)"
            break;
        case 2:
            renownImg = renown3;
            levelImg = r3Lvl;
            barColor ="linear-gradient(90deg, rgba(9,77,133,1) 25%, rgba(60,133,193,1) 100%)"
            break;
        case 3:
            renownImg = renown4;
            levelImg = r4Lvl;
            barColor ="linear-gradient(90deg, rgba(41,31,155,1) 25%, rgba(70,60,193,1) 100%)"
            break;
        case 4:
            renownImg = renown5;
            levelImg = r5Lvl;
            barColor ="linear-gradient(90deg, rgba(92,29,143,1) 25%, rgba(134,60,193,1) 100%)"
            break;
        case 5:
            renownImg = renown6;
            levelImg = r6Lvl;
            barColor ="linear-gradient(90deg, rgba(121,16,110,1) 25%, rgba(193,60,178,1) 100%)"
            break;
        case 6:
            renownImg = renown7;
            levelImg = r7Lvl;
            barColor ="linear-gradient(90deg, rgba(138,34,37,1) 25%, rgba(193,60,64,1) 100%)"
            break;
        case 7:
            renownImg = renown8;
            levelImg = r8Lvl;
            barColor ="linear-gradient(90deg, rgba(147,69,31,1) 25%, rgba(193,103,60,1) 100%)"
            break;
        case 8:
            renownImg = renown9;
            levelImg = r9Lvl;
            barColor ="linear-gradient(90deg, rgba(132,101,18,1) 25%, rgba(193,157,60,1) 100%)"
            break;
        case 9:
            renownImg = renown10;
            levelImg = r10Lvl;
            barColor ="linear-gradient(90deg, rgba(51,51,51,1) 25%, rgba(129,99,18,1) 100%)"
            break;
        default:
            renownImg = renown10;
            levelImg = r10Lvl;
            barColor ="linear-gradient(90deg, rgba(51,51,51,1) 25%, rgba(129,99,18,1) 100%)"
            break;

    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                {userData !== null ? (
                    <HelmetProvider>
                        <Helmet>
                            <title>{userData["user_name"]}</title>
                            <meta property="og:title" content={userData["user_name"]} data-rh="true"/>
                            <meta property="og:image" content={config.rootPath + userData["pfp_path"]} data-rh="true"/>
                        </Helmet>
                    </HelmetProvider>
                ) : (
                    <HelmetProvider>
                        <Helmet>
                            <title>User</title>
                            <meta property="og:image" content={alternativeImage} data-rh="true"/>
                        </Helmet>
                    </HelmetProvider>
                )}
                {/*<AppWrapper/>*/}
                {loading || userData === null ? (
                    <div>
                        <ThreeDots/>
                    </div>
                ) : (
                    <div style={window.innerWidth > 1000 ? {} : {marginBottom: "100px"}}>
                        <Typography sx={window.innerWidth > 1000 ? {display: "flex", flexDirection: "row"} : {display: "flex", flexDirection: "column"}}>
                            <Typography sx={window.innerWidth > 1000 ? {display: "flex", flexDirection: "column", width: "20vw"} : {display: "flex", flexDirection: "column", width: "20vw"}}>
                                {window.innerWidth > 1000 ? (
                                    <Box style={{                                        display: 'flex',
                                        alignItems: 'left',
                                        justifyContent: 'left',
                                        paddingTop: `1%`,
                                        paddingLeft: `25px`,
                                        height: "400px"}}>
                                        <UserIcon
                                            userId={userData["_id"]}
                                            userTier={userData["tier"]}
                                            userThumb={userData === null ? "" : config.rootPath + userData["pfp_path"]}
                                            size={300}
                                            backgroundName={userData["name"]}
                                            backgroundPalette={userData["color_palette"]}
                                            backgroundRender={userData["render_in_front"]}
                                            profileButton={false}
                                            pro={userData["user_status"] === 1}
                                            mouseMove={false}
                                        />
                                    </Box>
                                ) : (
                                    <Box style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingTop: `10%`,
                                        height: "auto",
                                        width: "100vw",
                                        flexDirection: "column",
                                        marginBottom: "12.5%"
                                    }}>
                                        <UserIcon
                                            userId={userData["_id"]}
                                            userTier={userData["tier"]}
                                            userThumb={userData === null ? "" : config.rootPath + userData["pfp_path"]}
                                            size={200}
                                            backgroundName={userData["name"]}
                                            backgroundPalette={userData["color_palette"]}
                                            backgroundRender={userData["render_in_front"]}
                                            profileButton={false}
                                            pro={userData["user_status"] === 1}
                                            mouseMove={false}
                                        />
                                        <Typography variant={"h3"}>
                                            {userData !== null ?  userData["user_name"].charAt(0).toUpperCase() + userData["user_name"].slice(1).toLowerCase() : "N/A"}
                                        </Typography>
                                    </Box>
                                )}
                                {window.innerWidth <= 1000 ? (
                                    <div style={{
                                        width: "100vw",
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-evenly",
                                        paddingTop: "5%",
                                        paddingBottom: "25%"
                                    }}>
                                        <Button
                                            variant="contained"
                                            disabled={friendBool || requestBool}
                                            onClick={() => sendFriendRequest()}
                                            sx={{
                                                color: 'text.primary',
                                                borderRadius: 1,
                                                p: 1,
                                                backgroundColor: "secondary",
                                                width: "auto",
                                                paddingTop: "10px",
                                            }}>
                                            {friendBool ? "Already Your Friend!" : requestBool ? "Request Pending" : "Send Friend Request"}
                                        </Button>
                                        <div style={{display: "flex", justifyContent: "right"}}>
                                            {userId === id ? (
                                                <div></div>
                                            ) : (
                                                <div style={{display: "flex", justifyContent: "right", alignItems: "bottom"}}>
                                                    {following ? (
                                                        <Button onClick={() => unFollow()} sx={{color: 'text.primary',
                                                            borderRadius: 1,
                                                            p: 1,
                                                            backgroundColor: "secondary",
                                                            width: "auto",
                                                            paddingTop: "10px",}}                                             variant="contained">
                                                            Unsubscribe
                                                        </Button>
                                                    ) : (
                                                        <Button onClick={() => follow()} sx={{color: 'text.primary',
                                                            borderRadius: 1,
                                                            p: 1,
                                                            backgroundColor: "secondary",
                                                            width: "auto",
                                                            paddingTop: "10px",}}                                             variant="contained">
                                                            Subscribe
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                                {window.innerWidth <= 1000 ? (
                                    <div style={{marginBottom: "20px", marginTop: "10%"}}>
                                        <Grid item style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            paddingLeft: "110%",
                                            width: "100vw"
                                        }}>
                                            <img
                                                style={window.innerWidth > 1000 ? {
                                                    height: "20vh",
                                                    width: "auto",
                                                    overflow: "hidden",
                                                } : {
                                                    height: "60px",
                                                    overflow: "hidden",
                                                }}
                                                src={renownImg}
                                            />
                                            <Box display="flex" flexDirection="column" alignItems="left" marginLeft={"25px"}>
                                                <Typography variant="h4" sx={{transform: "translate(-1.5vw, 0)", fontSize: "24px"}}>
                                                    {`Renown ${userData === null ? "N/A" : userData["tier"] + 1}`}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </div>
                                ) : null}
                                {window.innerWidth > 1000 ? (
                                    <Box
                                        sx={window.innerWidth > 1000 ? {
                                            boxShadow: "0px 6px 3px -3px rgba(0,0,0,0.3),0px 3px 3px 0px rgba(0,0,0,0.3),0px 3px 9px 0px rgba(0,0,0,0.3)",
                                            color: 'text.primary',
                                            borderRadius: 1,
                                            p: 3,
                                            marginLeft: "120px"
                                        } : {
                                            boxShadow: "0px 6px 3px -3px rgba(0,0,0,0.3),0px 3px 3px 0px rgba(0,0,0,0.3),0px 3px 9px 0px rgba(0,0,0,0.3)",
                                            color: 'text.primary',
                                            borderRadius: 1,
                                            p: 3,
                                            width: "fit-content",
                                            marginLeft: "20px"
                                        }}
                                    >
                                        <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                                            <Typography sx={{
                                                display: 'flex',
                                                width: "100%",
                                                justifyContent: 'left',
                                                textSizeAdjust: "150%"
                                            }}>
                                                {userData !== null ?  userData["user_name"].charAt(0).toUpperCase() + userData["user_name"].slice(1).toLowerCase() : "N/A"}
                                            </Typography>
                                            <Typography sx={window.innerWidth > 1000 ? {
                                                display: 'flex',
                                                width: "100%", justifyContent: "left"} : {display: 'flex',
                                                width: "130px", justifyContent: "left"}}>
                                                {userData !== null ? userData["follower_count"] + " Subscribers" : "n/A"}
                                            </Typography>
                                        </div>
                                        {window.innerWidth > 1000 ? (<hr style={{color: "white"}}/>) : null}
                                        {userData !== null ?  userData["bio"] : "N/A"}
                                        {userId === id || window.innerWidth <= 1000 ? (
                                            <div></div>
                                        ) : (
                                            <div style={{display: "flex", justifyContent: "right", alignItems: "bottom"}}>
                                                {following ? (
                                                    <Button onClick={() => unFollow()}>
                                                        Unsubscribe
                                                    </Button>
                                                ) : (
                                                    <Button onClick={() => follow()}>
                                                        Subscribe
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </Box>
                                ) : (
                                    <div style={{display: "flex", flexDirection: "row", width: "100vw"}}>
                                        <div
                                            sx={{
                                                color: 'text.primary',
                                                borderRadius: 1,
                                                p: 3,
                                                width: "fit-content", justifyContent: "left"}}
                                        >
                                            <Typography sx={window.innerWidth <= 1000 && window.innerWidth > 300 ? {
                                                display: 'flex',
                                                width: "130px", justifyContent: "left", fontSize: "16px", marginLeft: "10px", marginTop: "5%"} : {display: 'flex',
                                                width: "130px", justifyContent: "left", fontSize: "12px"}}>
                                                {userData !== null ? userData["follower_count"] + " Subscribers" : "n/A"}
                                            </Typography>
                                        </div>
                                        <div style={{display: "flex", flexDirection: "row", justifyContent: "right", width: "100%", marginRight: "5px"}}>
                                            <div style={{ position: 'relative' }}>
                                                <img
                                                    style={window.innerWidth > 1000 ? {
                                                        height: "15vh",
                                                        width: "auto",
                                                        overflow: "hidden",
                                                        zIndex: 2
                                                    } : {
                                                        height: "50px",
                                                        width: "auto",
                                                        overflow: "hidden",
                                                        zIndex: 2,
                                                        transform: "translate(0, -30%)",
                                                        marginRight: "5px"
                                                    }}
                                                    src={coffeePot}
                                                />
                                                <div
                                                    variant="h5"
                                                    component="span"
                                                    style={{
                                                        color: "white",
                                                        position: "absolute",
                                                        top: "50%",
                                                        left: "50%",
                                                        transform: "translate(-35%, -90%)",
                                                        zIndex: 2,
                                                    }}
                                                >
                                                    {userData === null ? "N/A" : userData["coffee"]}
                                                </div>
                                            </div>
                                            <div
                                                variant="h5"
                                                component="span"
                                                style={window.innerWidth <= 1000 && window.innerWidth > 300 ? {
                                                    color: "white",
                                                    fontSize: "16px", marginRight: "10px"
                                                } : {
                                                    color: "white",
                                                    fontSize: "12px"
                                                }}
                                            >
                                                Coffee
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div style={{overflow: "auto", alignItems: "center", display: "flex", flexDirection: "row", paddingTop: "10px"}}>
                                    {window.innerWidth > 1000 ? (
                                        <Button
                                            variant="contained"
                                            disabled={friendBool || requestBool}
                                            onClick={() => sendFriendRequest()}
                                            sx={{
                                                color: 'text.primary',
                                                borderRadius: 1,
                                                p: 1,
                                                marginLeft: "30px",
                                                backgroundColor: "secondary",
                                                width: "92%",
                                                paddingTop: "10px",
                                                marginLeft: "120px"
                                            }}>
                                            {friendBool ? "Already Your Friend!" : requestBool ? "Request Pending" : "Send Friend Request"}
                                        </Button>
                                    ) : null}
                                </div>
                            </Typography>
                            <Box
                                sx={window.innerWidth > 1000 ? {
                                    display: `flex`,
                                    alignItems: `center`,
                                    justifyContent: "right",
                                    width: "70vw",
                                    flexDirection: "column",
                                    float: "right",
                                    marginLeft: "120px",
                                } : {
                                    display: `flex`,
                                    alignItems: `center`,
                                    justifyContent: "right",
                                    width: "70vw",
                                    flexDirection: "column",
                                    float: "right",
                                }}>
                                <Grid container spacing={2} width={"88%"} sx={window.innerWidth > 1000 ? {paddingTop: "8%", transform: `scale(1.1)`} : {paddingTop: "2%", transform: `scale(1.1)`}}>
                                    {window.innerWidth <= 1000 ? null : (
                                        <Grid item>
                                            <img
                                                style={window.innerWidth > 1000 ? {
                                                    height: "20vh",
                                                    width: "auto",
                                                    overflow: "hidden",
                                                } : {
                                                    height: "60px",
                                                    overflow: "hidden",
                                                }}
                                                src={renownImg}
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%'}}>
                                            {window.innerWidth > 1000 ? (
                                                <Box display="flex" flexDirection="column" alignItems="left">
                                                    <Typography variant="h4" sx={{transform: "translate(-1.5vw, 0)"}}>
                                                        {`Renown ${userData === null ? "N/A" : userData["tier"] + 1}`}
                                                    </Typography>
                                                    <div style={{ display: 'flex', alignItems: 'left' }}>
                                                        <Typography sx={{paddingRight: "10px"}} variant="h5">Level</Typography>
                                                        <Grid item sx={{zIndex: 1}}>
                                                            <Box position="relative" sx={{transform: "translate(0px, -0.8vh)"}}>
                                                                <img
                                                                    style={{
                                                                        height: "6vh",
                                                                        width: "auto",
                                                                        overflow: "hidden",
                                                                    }}
                                                                    src={levelImg}
                                                                />
                                                                <Typography
                                                                    variant="h6"
                                                                    component="span"
                                                                    style={{
                                                                        color: "white",
                                                                        position: "absolute",
                                                                        top: "45%",
                                                                        left: "50%",
                                                                        transform: "translate(-50%, -50%)",
                                                                    }}
                                                                >
                                                                    {userData === null ? "N/A" : userData["level"] + 1}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </div>
                                                </Box>
                                            ) : null}
                                            {window.innerWidth  > 1000 ? (
                                                <Box sx={{ flexGrow: 1, alignItems: 'flex-end', display: 'flex', zIndex: 2, justifyContent: "right", width: "250%"}} alignItems="right">
                                                    <Grid item sx={{transform: "translate(-13vw, -21vh)", zIndex: 1}}>

                                                        <Box position="absolute">
                                                            <img
                                                                style={{
                                                                    height: "15vh",
                                                                    width: "auto",
                                                                    overflow: "hidden",
                                                                    zIndex: 2
                                                                }}
                                                                src={coffeePot}
                                                            />
                                                            <Typography
                                                                variant="h5"
                                                                component="span"
                                                                style={{
                                                                    color: "white",
                                                                    position: "absolute",
                                                                    top: "85%",
                                                                    left: "-50%",
                                                                    transform: "translate(-50%, -50%)",
                                                                    zIndex: 2,
                                                                    width: "200%"
                                                                }}
                                                            >
                                                                Coffee Collected
                                                            </Typography>
                                                            <Typography
                                                                variant="h5"
                                                                component="span"
                                                                style={{
                                                                    color: "white",
                                                                    position: "absolute",
                                                                    top: "55%",
                                                                    left: "53%",
                                                                    transform: "translate(-50%, -50%)",
                                                                    zIndex: 2,
                                                                }}
                                                            >
                                                                {userData === null ? "N/A" : userData["coffee"]}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Box>
                                            ) : null}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Typography>
                        <Typography component={"div"}
                                    sx={{display: "flex",
                                        justifyContent: "center",
                                        paddingTop: "2%",
                                        paddingBottom: "2%",
                                        flexDirection: "row"
                        }}>
                            <Box
                                sx={{
                                    boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                                    color: 'text.primary',
                                    borderRadius: 1,
                                    p: 3,
                                    marginLeft: "30px",
                                    marginRight: "30px",
                                    minWidth: "97%",
                                }}
                            >
                                {window.innerWidth > 1000 ? (
                                    <Grid container sx={{
                                        justifyContent: "left",
                                        width: "100%",
                                    }} direction="row"   alignItems="center">
                                        <TextField
                                            label={userData !== null ? `Search @${userData['user_name']} Projects` : "Search Projects"}
                                            variant={`outlined`}
                                            size={`small`}
                                            type={`username`}
                                            color={`primary`}
                                            helperText={" "}
                                            onKeyDown={
                                                e => {
                                                    if (e.key === "Enter") {
                                                        freshSearch()
                                                    }
                                                }}
                                            onChange={e => {
                                                if (typeof e.target.value !== "string") {
                                                    setQuery("")
                                                    return
                                                }
                                                setQuery(e.target.value)
                                            }}
                                            sx={{
                                                width: "350px",
                                            }}
                                            InputProps={{
                                                endAdornment: <ShowButton/>
                                            }}
                                        >
                                        </TextField>

                                        <Autocomplete
                                            multiple
                                            id="languagesInputSelect"
                                            size={"small"}
                                            options={programmingLanguages.map((_, i) => {
                                                return i
                                            })}
                                            getOptionLabel={(option) => programmingLanguages[option]}
                                            // @ts-ignore
                                            onChange={(e: SyntheticEvent, value: number[]) => {
                                                setLanguages(value)
                                                freshSearch({languages: value.length > 0 ? value : undefined})
                                            }}
                                            value={languages === null ? [] : languages}
                                            renderInput={(params) => (
                                                <TextField {...params} placeholder="Language" />
                                            )}
                                            sx={{
                                                width: "10vw",
                                                paddingLeft:"5px",
                                                paddingBottom: "22px"
                                            }}
                                        />
                                        <Grid item xs={"auto"}>
                                            <Grid container sx={{
                                                justifyContent: "center",
                                                width: "155px",
                                                paddingLeft:"5px",
                                                paddingBottom: "22px",
                                            }} direction="column"   alignItems="center">
                                                <Select
                                                    labelId={"challengeType"}
                                                    id={"challengeTypeInput"}
                                                    required={true}
                                                    value={challengeType >= -1 ? challengeType : -1}
                                                    size={"small"}
                                                    sx={{
                                                        width: "200px",
                                                        //paddingLeft:"5px",
                                                    }}
                                                    onChange={(e) => {
                                                        // ensure type is number
                                                        if (typeof e.target.value === "string") {
                                                            return
                                                        }
                                                        setChallengeType(e.target.value);
                                                        freshSearch({
                                                            challenge_type: e.target.value !== -1 && typeof e.target.value === "number" ? e.target.value : undefined
                                                        })
                                                    }}
                                                >
                                                    <MenuItem value={-1}>
                                                        <em>Challenge Type</em>
                                                    </MenuItem>
                                                    <MenuItem value={0}>
                                                        <em>Interactive</em>
                                                    </MenuItem>
                                                    <MenuItem value={1}>
                                                        <em>Playground</em>
                                                    </MenuItem>
                                                    <MenuItem value={2}>
                                                        <em>Casual</em>
                                                    </MenuItem>
                                                    <MenuItem value={3}>
                                                        <em>Competitive</em>
                                                    </MenuItem>
                                                    <MenuItem value={4}>
                                                        <em>Debug</em>
                                                    </MenuItem>
                                                </Select>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={"auto"}>
                                            <Grid container sx={{
                                                justifyContent: "center",
                                                width: "10vw",
                                                paddingLeft:"54px",
                                                paddingBottom: "22px",
                                            }} direction="column" alignItems="center">
                                                <Select
                                                    labelId={"tierInputLabel"}
                                                    id={"challengeTierInput"}
                                                    required={true}
                                                    value={tierFilter >= -1 ? tierFilter : -1}
                                                    label={"Challenge Renown"}
                                                    size={"small"}
                                                    sx={{
                                                        width: "12vw",
                                                    }}
                                                    onChange={(e) => {
                                                        // ensure type is number
                                                        if (typeof e.target.value === "string") {
                                                            return
                                                        }
                                                        setTierFilter(e.target.value);
                                                        freshSearch({
                                                            tier: e.target.value !== -1 && typeof e.target.value === "number" ? e.target.value : undefined
                                                        })
                                                    }}
                                                >
                                                    <MenuItem value={-1}>
                                                        <em>Renown</em>
                                                    </MenuItem>
                                                    <MenuItem value={0}>
                                                        <em>Renown 1</em>
                                                    </MenuItem>
                                                    <MenuItem value={1}>
                                                        <em>Renown 2</em>
                                                    </MenuItem>
                                                    <MenuItem value={2}>
                                                        <em>Renown 3</em>
                                                    </MenuItem>
                                                    <MenuItem value={3}>
                                                        <em>Renown 4</em>
                                                    </MenuItem>
                                                    <MenuItem value={4}>
                                                        <em>Renown 5</em>
                                                    </MenuItem>
                                                    <MenuItem value={5}>
                                                        <em>Renown 6</em>
                                                    </MenuItem>
                                                    <MenuItem value={6}>
                                                        <em>Renown 7</em>
                                                    </MenuItem>
                                                    <MenuItem value={7}>
                                                        <em>Renown 8</em>
                                                    </MenuItem>
                                                    <MenuItem value={8}>
                                                        <em>Renown 9</em>
                                                    </MenuItem>
                                                    <MenuItem value={9}>
                                                        <em>Renown 10</em>
                                                    </MenuItem>
                                                </Select>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                ) : null}
                                {SearchBox()}
                            </Box>
                        </Typography>
                    </div>
                )}
                <Dialog
                    open={mutual}
                    onClose={() => setMutual(false)}
                >
                    <DialogTitle>{"Mutual Friend Request"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            It seems this user has already sent you a friend request! You can go ahead and accept or decline their request here.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setMutual(false)
                            acceptFriend()
                        }} color="primary">Accept Friend</Button>
                        <Button onClick={() => {
                            setMutual(false)
                            declineFriend()
                        }} color={"error"}>
                            Decline Friend
                        </Button>
                    </DialogActions>
                </Dialog>
            </CssBaseline>
        </ThemeProvider>
    );
}

export default User;
