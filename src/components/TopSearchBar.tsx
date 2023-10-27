

import {
    alpha,
    Autocomplete,
    Button, ButtonBase, Card, CardContent, CardMedia,
    Checkbox, createTheme, FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputBase, InputLabel, MenuItem, PaletteMode, Paper, Popper, Select,
    styled,
    TextField, Tooltip, Typography,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import React, {SyntheticEvent} from "react";
import {useNavigate} from "react-router-dom";
import Menu from "@mui/material/Menu";
import {programmingLanguages} from "../services/vars";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import UserIcon from "./UserIcon";
import {
    clearSearchParamsState, initialSearchStateUpdate,
    SearchParamsStateUpdate, selectActiveSearch,
    selectAttemptsMax,
    selectAttemptsMin,
    selectAuthor,
    selectCoffeeMax,
    selectCoffeeMin,
    selectCompletionsMax,
    selectCompletionsMin,
    selectLanguage,
    selectQuery,
    selectSearchChallengeType,
    selectSearchTags, selectSearchTier,
    selectSince, selectUntil,
    selectViewsMax,
    selectViewsMin,
    selectVisibility, updateSearchParamsState
} from "../reducers/searchParams/searchParams";
import call from "../services/api-call";
import Tag from "../models/tag";
import swal from "sweetalert";
import User from "../models/user";
import Post from "../models/post";
import {initialAuthStateUpdate, selectAuthState, updateAuthState} from "../reducers/auth/auth";
import config from "../config";
import {getAllTokens} from "../theme";
import options from "./Avatar/options";
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
import ProBannerCircle from "./Icons/ProBannerCircle";


const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.contrastText, 0.25),
    },
    marginRight: theme.spacing(2),
    // marginTop: 10,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.contrastText
}));

const FilterIconButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.contrastText,
    float: 'right',
    zIndex: 1000,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '200%',
        [theme.breakpoints.up('md')]: {
            width: '50ch',
        },
    },
}));


interface SearchParamsState {
    query: string;
    languages: number[];
    author: User;
    attemptsMin: string;
    attemptsMax: string;
    completionsMin: string;
    completionsMax: string;
    coffeeMin: string;
    coffeeMax: string;
    viewsMin: string;
    viewsMax: string;
    tags: object[];
    challengeType: number;
    visibility: number;
    since: number;
    until: number;
    tier: number;
}


interface IProps {
    width: number | string
    height: number | string,
}
// initialize redux states
export default function TopSearchBar(props: IProps) {
    // retrieve theme from local storage
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    // redux states for search params
    const dispatch = useAppDispatch();
    const reduxActiveSearchState = useAppSelector(selectActiveSearch);
    const reduxQueryState = useAppSelector(selectQuery);
    const reduxLanguageState = useAppSelector(selectLanguage);
    const reduxAuthorState = useAppSelector(selectAuthor);
    const reduxAttemptsMinState = useAppSelector(selectAttemptsMin);
    const reduxAttemptsMaxState = useAppSelector(selectAttemptsMax);
    const reduxCompletionsMinState = useAppSelector(selectCompletionsMin);
    const reduxCompletionsMaxState = useAppSelector(selectCompletionsMax);
    const reduxCoffeeMinState = useAppSelector(selectCoffeeMin);
    const reduxCoffeeMaxState = useAppSelector(selectCoffeeMax);
    const reduxViewsMinState = useAppSelector(selectViewsMin);
    const reduxViewsMaxState = useAppSelector(selectViewsMax);
    const reduxTags = useAppSelector(selectSearchTags);
    const reduxChallengeType = useAppSelector(selectSearchChallengeType);
    const reduxVisibilityState = useAppSelector(selectVisibility);
    const reduxSinceState = useAppSelector(selectSince);
    const reduxUntilState = useAppSelector(selectUntil);
    //const reduxPublishedState = useAppSelector(selectPublished);
    const reduxTierState = useAppSelector(selectSearchTier);

    const [searchParams, setSearchParams] = React.useState<SearchParamsState>(
        (reduxActiveSearchState)
        ?
        {
            query: reduxQueryState,
            languages: reduxLanguageState,
            author: reduxAuthorState,
            attemptsMin: reduxAttemptsMinState,
            attemptsMax: reduxAttemptsMaxState,
            completionsMin: reduxCompletionsMinState,
            completionsMax: reduxCompletionsMaxState,
            coffeeMin: reduxCoffeeMinState,
            coffeeMax: reduxCoffeeMaxState,
            viewsMin: reduxViewsMinState,
            viewsMax: reduxViewsMaxState,
            tags: reduxTags,
            challengeType: reduxChallengeType,
            visibility: reduxVisibilityState,
            since: reduxSinceState,
            until: reduxUntilState,
            tier: reduxTierState,
        }
        :
        {
            query: '',
            languages: [],
            author: {} as User,
            attemptsMin: '',
            attemptsMax: '',
            completionsMin: '',
            completionsMax: '',
            coffeeMin: '',
            coffeeMax: '',
            viewsMin: '',
            viewsMax: '',
            tags: [],
            challengeType: -1,
            visibility: -1,
            since: -1,
            until: -1,
            tier: -1,
        }
    )

    const [optionsOpen, setOptionsOpen] = React.useState<boolean>(false);
    const optionsRef = React.useRef<HTMLDivElement>(null);
    const autoCompleteRef = React.useRef<HTMLDivElement>(null);

    const clearState = () => {
        dispatch(clearSearchParamsState())
        setSearchParams({
            query: '',
            languages: [],
            author: {} as User,
            attemptsMin: '',
            attemptsMax: '',
            completionsMin: '',
            completionsMax: '',
            coffeeMin: '',
            coffeeMax: '',
            viewsMin: '',
            viewsMax: '',
            tags: [],
            challengeType: -1,
            visibility: -1 ,
            since: -1,
            until: -1,
            tier: -1,
        });
    }

    const updateSearchState = (state: SearchParamsStateUpdate, triggerSearch: boolean = true) => {
        let searchUpdate = Object.assign({}, searchParams);

        if (state.query !== null) {
            searchUpdate.query = state.query;
        }

        if (state.languages !== null) {
            searchUpdate.languages = state.languages
        }

        if (state.author !== null) {
            searchUpdate.author = state.author
        }

        if (state.attemptsMin !== null) {
            searchUpdate.attemptsMin = state.attemptsMin
        }

        if (state.attemptsMax !== null) {
            searchUpdate.attemptsMax = state.attemptsMax
        }

        if (state.completionsMin !== null) {
            searchUpdate.completionsMin = state.completionsMin
        }

        if (state.completionsMax !== null) {
            searchUpdate.completionsMax = state.completionsMax
        }

        if (state.coffeeMin !== null) {
            searchUpdate.coffeeMin = state.coffeeMin
        }

        if (state.coffeeMax !== null) {
            searchUpdate.coffeeMax = state.coffeeMax
        }

        if (state.viewsMin !== null) {
            searchUpdate.viewsMin = state.viewsMin
        }

        if (state.viewsMax !== null) {
            searchUpdate.viewsMax = state.viewsMax
        }

        if (state.tags !== null && state.tags.length > 0) {
            searchUpdate.tags = state.tags
        }

        if (state.challengeType !== null) {
            searchUpdate.challengeType = state.challengeType
        }

        if (state.visibility !== null) {
            searchUpdate.visibility = state.visibility
        }

        if (state.since !== null) {
            searchUpdate.since = state.since
        }

        if (state.until !== null) {
            searchUpdate.until = state.until
        }

        if (state.tier !== null) {
            searchUpdate.tier = state.tier
        }

        setSearchParams(searchUpdate);

        state.activeSearch = true;

        dispatch(updateSearchParamsState(state));

        // fire search
        if (triggerSearch) {
            search(searchUpdate);
        }
    }

    let navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        let params = {
            q: searchParams.query,
        }

        if (searchParams.author._id !== undefined && searchParams.author._id !== "") {
            // @ts-ignore
            params["author"] = searchParams.author._id
        }

        if (searchParams.languages !== undefined && searchParams.languages.length > 0) {
            // @ts-ignore
            params["languages"] = searchParams.languages
        }

        if (searchParams.attemptsMin !== undefined && searchParams.attemptsMin !== "") {
            // @ts-ignore
            params["attempts_min"] = searchParams.attemptsMin
        }

        if (searchParams.attemptsMax !== undefined && searchParams.attemptsMax !== "") {
            // @ts-ignore
            params["attempts_max"] = searchParams.attemptsMax
        }

        if (searchParams.completionsMin !== undefined && searchParams.completionsMax !== "") {
            // @ts-ignore
            params["completions_min"] = searchParams.completionsMin
        }

        if (searchParams.completionsMax !== undefined && searchParams.completionsMax!== "") {
            // @ts-ignore
            params["completions_max"] = searchParams.completionsMax
        }

        if (searchParams.coffeeMin !== undefined && searchParams.coffeeMax !== "") {
            // @ts-ignore
            params["coffee_min"] = searchParams.coffeeMin
        }

        if (searchParams.coffeeMax!== undefined && searchParams.coffeeMax!== "") {
            // @ts-ignore
            params["coffee_max"] = searchParams.coffeeMax
        }

        if (searchParams.viewsMin !== undefined && searchParams.viewsMin !== "") {
            // @ts-ignore
            params["views_min"] = searchParams.viewsMin
        }

        if (searchParams.viewsMax !== undefined && searchParams.viewsMax!== "") {
            // @ts-ignore
            params["views_max"] = searchParams.viewsMax
        }

        if (searchParams.tags !== undefined && searchParams.tags.length > 0) {
            // @ts-ignore
            params["tags"] = searchParams.tags.map(x => x._id).join()
        }

        if (searchParams.challengeType !== undefined && searchParams.challengeType > -1) {
            // @ts-ignore
            params["challenge_type"] = searchParams.challengeType
        }

        if (searchParams.visibility !== undefined && searchParams.visibility > -1) {
            // @ts-ignore
            params["visibility"] = searchParams.visibility
        }

        if (searchParams.since !== undefined && searchParams.since > 0) {
            // @ts-ignore
            params["since"] = searchParams.since
        }

        if (searchParams.until !== undefined && searchParams.until > 0) {
            // @ts-ignore
            params["until"] = searchParams.until
        }

        if (searchParams.tier !== undefined && searchParams.tier !== null && searchParams.tier > -1) {
            // @ts-ignore
            params["tier"] = searchParams.tier
        }

        let urlParams = new URLSearchParams(params).toString()

        navigate("/search?"+urlParams)

    }

    const [hasOptionBeenSelected, setHasOptionBeenSelected] = React.useState(false);

    const [sinceDate, setSinceDate] = React.useState("")
    const [untilDate, setUntilDate] = React.useState("")
    const [advOpen, setAdvOpen] = React.useState(false)
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuRef = React.useRef<null | HTMLDivElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOptionsOpen(true)
        setAdvOpen(false)
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const optionsElement = optionsRef.current;
            const autoCompleteElement = autoCompleteRef.current;
            const menuElement = menuRef.current;

            if (
                optionsElement &&
                !isClickWithinElement(event, optionsElement) &&
                (!autoCompleteElement || !isClickWithinElement(event, autoCompleteElement)) &&
                (!menuElement || !isClickWithinElement(event, menuElement))
            ) {

                setOptionsOpen(false);
            }
        };

        const isClickWithinElement = (event: MouseEvent, element: HTMLElement) => {
            const { left, top, right, bottom } = element.getBoundingClientRect();
            const { clientX, clientY } = event;

            return (
                clientX >= left &&
                clientX <= right &&
                clientY >= top &&
                clientY <= bottom
            );
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [authorOptions, setAuthorOptions] = React.useState<User[]>([])
    const handleAuthorSearch = async (e : any) => {
        if (typeof e.target.value !== "string") {
            return
        }

        let res =  await call(
            "/api/search/users",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                query: e.target.value,
                skip: 0,
                limit: 5,
            }
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["users"] === undefined) {
            if (res["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            swal("Server Error", res["message"])
            return
        }

        setAuthorOptions(res["users"])

    }

    const [searchOptions, setSearchOptions] = React.useState<Post[]>([])
    const handleSearchSubmit =  async (e : any) => {
        let updateState = Object.assign({}, initialSearchStateUpdate);
        if (e !== null){
            updateState.query = e.target.value
            if (e) {
                // update attempts in state update
                updateState.query = e.target.value
            }
        }
        // update attempts in state updat

        // ensure that a field is set for query
        if (updateState.query === undefined || updateState.query === null) {
            updateState.query = ""
        }

        if (searchParams.tags !== undefined && searchParams.tags !== null && searchParams.tags.length > 0) {
            updateState.tags = [];
            // @ts-ignore
            searchParams.tags.forEach((tag) => {updateState.tags.push(tag)})
        }


        // execute state update
        updateSearchState(updateState)

    }

    const handleSelect = async (e : any) => {
        if (!hasOptionBeenSelected) {
            let updateState = Object.assign({}, initialSearchStateUpdate);
            if (e !== null){
                updateState.query = e.target.value
                if (e) {
                    // update attempts in state update
                    updateState.query = e.target.value
                }
            }
            // update attempts in state updat

            // ensure that a field is set for query
            if (updateState.query === undefined || updateState.query === null) {
                updateState.query = ""
            }

            if (searchParams.tags !== undefined && searchParams.tags !== null && searchParams.tags.length > 0) {
                updateState.tags = [];
                // @ts-ignore
                searchParams.tags.forEach((tag) => {updateState.tags.push(tag)})
            }


            // execute state update
            updateSearchState(updateState)

            // fire search
            search()
            setHasOptionBeenSelected(true);
        }
    }

    const search = async (overrideParams: SearchParamsState | null = null) => {
        let searchConfig = searchParams;
        if (overrideParams !== null) {
            searchConfig = overrideParams
        }

        let params = {
            query: searchConfig.query,
            search_rec_id: "0",
            skip: 0,
            limit: window.innerWidth > 1000 ? 5 : 3,
        }

        if (searchConfig.author._id !== undefined && searchConfig.author._id !== "") {
           // @ts-ignore
            params["author"] = searchConfig.author._id
        }

        if (searchConfig.languages !== undefined && searchConfig.languages.length > 0) {
            // @ts-ignore
            params["languages"] = searchConfig.languages
        }

        if (searchConfig.attemptsMin !== undefined && searchConfig.attemptsMin!== "") {
            // @ts-ignore
            params["attempts_min"] = searchConfig.attemptsMin
        }

        if (searchConfig.attemptsMax !== undefined && searchConfig.attemptsMax !== "") {
            // @ts-ignore
            params["attempts_max"] = searchConfig.attemptsMax
        }

        if (searchConfig.completionsMin !== undefined && searchConfig.completionsMax !== "") {
            // @ts-ignore
            params["completions_min"] = searchConfig.completionsMin
        }

        if (searchConfig.completionsMax !== undefined && searchConfig.completionsMax!== "") {
            // @ts-ignore
            params["completions_max"] = searchConfig.completionsMax
        }

        if (searchConfig.coffeeMin !== undefined && searchConfig.coffeeMax !== "") {
            // @ts-ignore
            params["coffee_min"] = searchConfig.coffeeMin
        }

        if (searchConfig.coffeeMax!== undefined && searchConfig.coffeeMax!== "") {
            // @ts-ignore
            params["coffee_max"] = searchConfig.coffeeMax
        }

        if (searchConfig.viewsMin !== undefined && searchConfig.viewsMin !== "") {
            // @ts-ignore
            params["views_min"] = searchConfig.viewsMin
        }

        if (searchConfig.viewsMax !== undefined && searchConfig.viewsMax!== "") {
            // @ts-ignore
            params["views_max"] = searchConfig.viewsMax
        }

        if (searchConfig.tags !== undefined && searchConfig.tags.length > 0) {
            // @ts-ignore
            params["tags"] = searchConfig.tags.map(x => x._id)
        }

        if (searchConfig.challengeType !== undefined && searchConfig.challengeType > -1) {
            // @ts-ignore
            params["challenge_type"] = searchConfig.challengeType
        }

        if (searchConfig.visibility !== undefined && searchConfig.visibility > -1) {
            // @ts-ignore
            params["visibility"] = searchConfig.visibility
        }

        if (searchConfig.since !== undefined && searchConfig.since > 0) {
            // @ts-ignore
            params["since"] = searchConfig.since
        }

        if (searchConfig.until !== undefined && searchConfig.until > 0) {
            // @ts-ignore
            params["until"] = searchConfig.until
        }

        if (searchConfig.tier !== undefined && searchConfig.tier !== null && searchConfig.tier > -1) {
            // @ts-ignore
            params["tier"] = searchConfig.tier
        }


        let posts =  await call(
            "/api/search/posts",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            params
        )

        let users =  await call(
            "/api/search/users",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            params
        )

        const [res, res2] = await Promise.all([
            posts,
            users
        ])


        if (res === undefined || res2 === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["challenges"] === undefined && res2["users"] === undefined) {
            if (res["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            swal("Server Error", res["message"])
            return
        }


        let finalSearchOptions = res["challenges"].concat(res2["users"])
        setSearchOptions(finalSearchOptions)
    }

    let loggedIn = false
    const authState = useAppSelector(selectAuthState);
    if (authState.authenticated !== false) {
        loggedIn = true
    }


    const handleSearchCompleted =  async (postID: string) => {
        if (loggedIn) {
            let params = {
                post_id: postID,
                query: searchParams.query,
            }

            let res =  await call(
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





    const [tagOptions, setTagOptions] = React.useState<Tag[]>([])
    const handleTagSearch =  async (e : any) => {
        if (typeof e.target.value !== "string") {
            return
        }

        let res = await call(
            "/api/search/tags",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {
                query: e.target.value,
                skip: 0,
                limit: 5,
            }
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["tags"] === undefined) {
            if (res["message"] === undefined) {
                swal("Server Error", "Man... We don't know what happened, but there's some weird stuff going on. " +
                    "We'll get working on this, come back in a few minutes")
                return
            }
            if (res["message"] === "incorrect type passed for field query") {
                return
            }
            swal("Server Error", res["message"])
            return
        }

        setTagOptions(res["tags"])
    }

    let renderSearchFilter = () => {
        return (
            <div>
                <Grid container justifyContent="center">
                    <InputLabel id={"languageInputLabel"}>Languages</InputLabel>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                    }} direction="row"   alignItems="center">
                        <Autocomplete
                            multiple
                            limitTags={5}
                            id="languagesInputSelect"
                            size={"small"}
                            options={programmingLanguages.map((_, i) => {
                                return i
                            })}
                            getOptionLabel={(option) => programmingLanguages[option]}
                            // @ts-ignore
                            onChange={(e: SyntheticEvent, value: number[]) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);

                                // set value for state update
                                updateState.languages = value

                                // execute state update
                                updateSearchState(updateState)
                            }}
                            value={searchParams.languages === null ? [] : searchParams.languages}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Select" />
                            )}
                            sx={{
                                width: "17vw",
                                paddingRight: "1vw",
                                paddingLeft: "1vw",
                                paddingBottom: "1vw",
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={"auto"}>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                        paddingBottom: "1vw",
                    }} direction="column"   alignItems="center">
                        <InputLabel id={"challengeTypeInputLabel"}>Challenge Type</InputLabel>
                        <Select
                            labelId={"challengeType"}
                            id={"challengeTypeInput"}
                            required={true}
                            value={searchParams.challengeType >= -1 ? searchParams.challengeType : -1}
                            label={"Challenge Type"}
                            size={"small"}
                            sx={{
                                width: "15vw",
                            }}
                            onChange={(e) => {
                                // ensure type is number
                                if (typeof e.target.value === "string") {
                                    return
                                }

                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update challenge type in state update
                                updateState.challengeType = e.target.value;
                                // execute state update
                                updateSearchState(updateState)
                            }}
                        >
                            <MenuItem value={-1}>
                                <em>Any</em>
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
                        </Select>
                    </Grid>
                </Grid>
                <Grid item xs={"auto"}>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                        paddingBottom: "20px"
                    }} direction="column" alignItems="center">
                        <InputLabel id={"tierInputLabel"}>Challenge Renown</InputLabel>
                        <Select
                            labelId={"tierInputLabel"}
                            id={"challengeTierInput"}
                            required={true}
                            value={searchParams.tier >= -1 ? searchParams.tier : -1}
                            label={"Challenge Renown"}
                            size={"small"}
                            sx={{
                                width: "15vw",
                            }}
                            onChange={(e) => {
                                // ensure type is number
                                if (typeof e.target.value === "string") {
                                    return
                                }

                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update tier in state update
                                updateState.tier = e.target.value;
                                // execute state update
                                updateSearchState(updateState)
                            }}
                        >
                            <MenuItem value={-1}>
                                <em>Any</em>
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
            </div>
        )
    }

    let renderAdvancedSearch = () => {
        return (
            <div>
                <Grid container justifyContent="center">
                    <InputLabel id={"dateInputLabel"}>Date Range</InputLabel>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                    }} direction="row"   alignItems="center">
                        <TextField
                            id="date"
                            label="From"
                            type="date"
                            size={`small`}
                            sx={{
                                width: "11vw",
                                paddingBottom: "1vw",
                                mt: "1vh",
                            }}
                            value={sinceDate}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);

                                setSinceDate(e.target.value);
                                // parse string in 2012-01-30 format to a Date
                                let date = new Date();
                                date.setFullYear(
                                    parseInt(e.target.value.split('-')[0]),
                                    parseInt(e.target.value.split('-')[1]) - 1,
                                    parseInt(e.target.value.split('-')[2])
                                );

                                // update since in state update
                                updateState.since = Math.round(date.getTime() / 1000);

                                // execute state update
                                updateSearchState(updateState)
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        -
                        <TextField
                            id="date"
                            label="To"
                            type="date"
                            size={`small`}
                            sx={{
                                width: "11vw",
                                paddingBottom: "1vw",
                                mt: "1vh",
                            }}
                            value={untilDate}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);

                                setUntilDate(e.target.value);

                                // parse string in 2012-01-30 format to a Date
                                let date = new Date();
                                date.setFullYear(
                                    parseInt(e.target.value.split('-')[0]),
                                    parseInt(e.target.value.split('-')[1]) - 1,
                                    parseInt(e.target.value.split('-')[2])
                                );

                                // update since in state update
                                updateState.until = Math.round(date.getTime() / 1000);
                                // execute state update
                                updateSearchState(updateState)
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container justifyContent="center">
                    <InputLabel id={"authorInputLabel"}>Author</InputLabel>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                    }} direction="row"   alignItems="center">
                        <Autocomplete
                            id="authorInputAutocomplete"
                            size={"small"}
                            options={authorOptions}
                            getOptionLabel={(option: User) => {
                                return option.user_name
                            }}
                            renderInput={(params) => (
                                <TextField {...params}  placeholder="Search" />
                            )}
                            onInputChange={(e) => {
                                handleAuthorSearch(e)
                            }}
                            // @ts-ignore
                            onChange={(e: SyntheticEvent, value: User) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);

                                updateState.author = (value !== null) ? value : {} as User

                                // execute state update
                                updateSearchState(updateState)

                            }}
                            value={(searchParams.author._id !== undefined) ? searchParams.author : null}
                            sx={{
                                width: "17vw",
                                paddingRight: "1vw",
                                paddingLeft: "1vw",
                                paddingBottom: "1vw",
                            }}
                        />


                    </Grid>
                </Grid>
                <Grid container justifyContent="center">
                    <InputLabel id={"attemptsInputLabel"}>Attempts</InputLabel>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                    }} direction="row"   alignItems="center">
                        <TextField
                            label={"min"}
                            variant={`outlined`}
                            size={`small`}
                            type={`number`}
                            color={`primary`}
                            value={searchParams.attemptsMin}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update attempts in state update
                                updateState.attemptsMin = e.target.value
                                // execute state update
                                updateSearchState(updateState)
                            }}
                            sx={{
                                width: "6vw",
                                marginLeft: "1vw",
                                marginRight: "1vw",
                                paddingBottom: "1vw",
                                mt: "1vh",
                            }}
                        >
                        </TextField>
                        -
                        <TextField
                            label={"max"}
                            variant={`outlined`}
                            size={`small`}
                            type={`number`}
                            color={`primary`}
                            value={searchParams.attemptsMax}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update attempts in state update
                                updateState.attemptsMax = e.target.value
                                // execute state update
                                updateSearchState(updateState)
                            }}
                            sx={{
                                width: "6vw",
                                marginLeft: "1vw",
                                marginRight: "1vw",
                                paddingBottom: "1vw",
                                mt: "1vh",
                            }}
                        >
                        </TextField>
                    </Grid>
                </Grid>
                <Grid container justifyContent="center">
                    <InputLabel id={"completionsInputLabel"}>Completions</InputLabel>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                    }} direction="row"   alignItems="center">
                        <TextField
                            label={"min"}
                            variant={`outlined`}
                            size={`small`}
                            type={`number`}
                            color={`primary`}
                            value={searchParams.completionsMin}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update completions in state update
                                updateState.completionsMin = e.target.value
                                // execute state update
                                updateSearchState(updateState)
                            }}
                            sx={{
                                width: "6vw",
                                marginLeft: "1vw",
                                marginRight: "1vw",
                                paddingBottom: "1vw",
                                mt: "1vh",
                            }}
                        >
                        </TextField>
                        -
                        <TextField
                            label={"max"}
                            variant={`outlined`}
                            size={`small`}
                            type={`number`}
                            color={`primary`}
                            value={searchParams.completionsMax}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update completions in state update
                                updateState.completionsMax = e.target.value
                                // execute state update
                                updateSearchState(updateState)
                            }}
                            sx={{
                                width: "6vw",
                                marginLeft: "1vw",
                                marginRight: "1vw",
                                paddingBottom: "1vw",
                                mt: "1vh",
                            }}
                        >
                        </TextField>
                    </Grid>
                </Grid>
                <Grid container justifyContent="center">
                    <InputLabel id={"coffeeInputLabel"}>Coffee</InputLabel>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                    }} direction="row"   alignItems="center">
                        <TextField
                            label={"min"}
                            variant={`outlined`}
                            size={`small`}
                            type={`number`}
                            color={`primary`}
                            value={searchParams.coffeeMin}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update coffee in state update
                                updateState.coffeeMin = e.target.value
                                // execute state update
                                updateSearchState(updateState)
                            }}
                            sx={{
                                width: "6vw",
                                marginLeft: "1vw",
                                marginRight: "1vw",
                                paddingBottom: "1vw",
                                mt: "1vh",
                            }}
                        >
                        </TextField>
                        -
                        <TextField
                            label={"max"}
                            variant={`outlined`}
                            size={`small`}
                            type={`number`}
                            color={`primary`}
                            value={searchParams.coffeeMax}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update coffee in state update
                                updateState.coffeeMax = e.target.value
                                // execute state update
                                updateSearchState(updateState)
                            }}
                            sx={{
                                width: "6vw",
                                marginLeft: "1vw",
                                marginRight: "1vw",
                                paddingBottom: "1vw",
                                mt: "1vh",
                            }}
                        >
                        </TextField>
                    </Grid>
                </Grid>
                <Grid container justifyContent="center">
                    <InputLabel id={"viewsInputLabel"}>Views</InputLabel>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                    }} direction="row"   alignItems="center">
                        <TextField
                            label={"min"}
                            variant={`outlined`}
                            size={`small`}
                            type={`number`}
                            color={`primary`}
                            value={searchParams.viewsMin}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update views in state update
                                updateState.viewsMin = e.target.value
                                // execute state update
                                updateSearchState(updateState)
                            }}
                            sx={{
                                width: "6vw",
                                marginLeft: "1vw",
                                marginRight: "1vw",
                                paddingBottom: "1vw",
                                mt: "1vh",
                            }}
                        >
                        </TextField>
                        -
                        <TextField
                            label={"max"}
                            variant={`outlined`}
                            size={`small`}
                            type={`number`}
                            color={`primary`}
                            value={searchParams.viewsMax}
                            onChange={(e) => {
                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update views in state update
                                updateState.viewsMax = e.target.value
                                // execute state update
                                updateSearchState(updateState)
                            }}
                            sx={{
                                width: "6vw",
                                marginLeft: "1vw",
                                marginRight: "1vw",
                                paddingBottom: "1vw",
                                mt: "1vh",
                            }}
                        >
                        </TextField>
                    </Grid>
                </Grid>
                <Grid item xs={"auto"}>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                        paddingBottom: "1vw",
                    }} direction="column"   alignItems="center">
                        <InputLabel id={"visibilityInputLabel"}>Visibility</InputLabel>
                        <Select
                            labelId={"visibility"}
                            id={"visibilityInput"}
                            required={true}
                            value={searchParams.visibility >= -1 ? searchParams.visibility : -1}
                            label={"Visibility"}
                            size={"small"}
                            sx={{
                                width: "15vw",
                            }}
                            onChange={(e) => {
                                // ensure type is number
                                if (typeof e.target.value === "string") {
                                    return
                                }

                                // copy initial state
                                let updateState = Object.assign({}, initialSearchStateUpdate);
                                // update challenge type in state update
                                updateState.visibility = e.target.value;
                                // execute state update
                                updateSearchState(updateState)
                            }}
                        >
                            <MenuItem value={-1}>
                                <em>Any</em>
                            </MenuItem>
                            <MenuItem value={0}>
                                <em>Public</em>
                            </MenuItem>
                            <MenuItem value={3}>
                                <em>Follower</em>
                            </MenuItem>
                            <MenuItem value={4}>
                                <em>Premium</em>
                            </MenuItem>
                            <MenuItem value={5}>
                                <em>Exclusive</em>
                            </MenuItem>
                        </Select>
                    </Grid>
                </Grid>
                <Grid container justifyContent="center">
                    <InputLabel id={"tagsInputLabel"}>Tags</InputLabel>
                    <Grid container sx={{
                        justifyContent: "center",
                        width: "100%",
                    }} direction="row"   alignItems="center">
                        <Autocomplete
                            multiple
                            limitTags={5}
                            id="tagInputAutocomplete"
                            freeSolo={true}
                            size={"small"}
                            options={tagOptions}
                            getOptionLabel={(option: Tag | string) => {
                                if (typeof option === "string") {
                                    return option
                                }
                                return option.value
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Search" />
                            )}
                            onInputChange={(e) => {
                                handleTagSearch(e)
                            }}
                            // @ts-ignore
                            onChange={(e: SyntheticEvent, value: Array<object | string>) => {
                                // copy initial state

                                let updateState = Object.assign({}, initialSearchStateUpdate);

                                // set update state tags to empty array
                                updateState.tags = [];

                                // handle any values that may be strings from user input
                                for (let i = 0; i < value.length; i++) {
                                    // append to the update state tags if this is an object
                                    if (typeof value[i] === "object") {
                                        // @ts-ignore
                                        updateState.tags.push(value[i]);
                                    }
                                }

                                // execute state update
                                updateSearchState(updateState)

                            }}
                            // @ts-ignore
                            value={searchParams.tags.map((v: {id: string, value: string}) => {
                                // return string for user defined tags so that the colliding ids do not cause issues
                                if (v.id === "-1") {
                                    return v.value
                                }
                                return v
                            })}
                            sx={{
                                width: "17vw",
                                paddingRight: "1vw",
                                paddingLeft: "1vw",
                                paddingBottom: "1vw",
                            }}
                        />
                    </Grid>
                </Grid>
            </div>
        )
    }

    // initialize tags if there are no values
    // if (tagOptions.length === 0) {
    //     handleTagSearch({target: {value: ""}})
    // }

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

    const renderGroup = (params: any) => {
        let color = window.innerWidth > 1000
            ?
                params.group.toLowerCase() === "post" ? theme.palette.primary.main : theme.palette.secondary.main
            :
                null;

        let text = window.innerWidth > 1000
            ?
                params.group.toLowerCase() === "post" ? "Challenges" : "Users"
            :
                null;

        // let textColor = params.group.toLowerCase() === "post" ? theme.palette.primary.main : theme.palette.secondary.main;
        // this is important if we are using gradients
        let textColor = params.group.toLowerCase() === "post" ? theme.palette.primary.light : theme.palette.secondary.light;
        if (mode === "light")
            textColor = params.group.toLowerCase() === "post" ? theme.palette.primary.dark : theme.palette.secondary.dark;
    
        const gradientBackground = {
            background: `linear-gradient(45deg, ${color}20 20%, transparent 100%, transparent 100%)`,
            borderRadius: 0,
            // borderTop: 1,
            // borderBottom: 1,
            borderColor: color + "75",
            paddingLeft: '10px',
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
            mb: 1,
            color: textColor,
            fontSize: 14,
        };
    
        return (
            <>
                <Typography key={params.key} variant="subtitle1" component={Paper} sx={gradientBackground}>
                    {text}
                </Typography>
                {params.children}
            </>
        );
    };

    const fullSizedSearch = () => {
        return (
            <>
                <Search
                    style={{
                        width: props.width,
                        minWidth: 320,
                    }}
                >
                    <SearchIconWrapper>
                        <SearchIcon/>
                    </SearchIconWrapper>
                    <FilterIconButton sx={{
                        color: theme.palette.primary.contrastText,
                        left: `calc(${props.width} - 60px)`
                    }} onClick={handleClick}>
                        <FilterListIcon/>
                    </FilterIconButton>
                    <form onSubmit={e => handleSubmit(e)}>
                        <Autocomplete
                            freeSolo
                            id="search-query"
                            ref={autoCompleteRef}
                            PopperComponent={({ children, ...popperProps }) => (
                                <Popper {...popperProps} ref={optionsRef}>
                                    {children}
                                </Popper>
                            )}
                            open={optionsOpen}
                            onOpen={() => setOptionsOpen(true)}
                            onClose={() => setOptionsOpen(false)}
                            options={searchOptions}
                            getOptionLabel={(option: Post | string) => {
                                if (typeof option === "string") {
                                    return option
                                }
                                return option.title === undefined ?
                                    //@ts-ignore
                                    option.user_name : option.title
                            }}
                            groupBy={(option) =>
                                // @ts-ignore
                                option.author_id !== undefined && option.author_id !== null ? "Post": "User"
                            }
                            renderGroup={renderGroup}
                            //@ts-ignore
                            renderOption={(props, option) => (
                                <div
                                    style={{
                                        paddingBottom: '10px',
                                        paddingLeft: '10px',
                                    }}
                                >
                                    {/* @ts-ignore */}
                                    {option.author_id !== undefined  && option.author_id !== null ? (
                                        <Card sx={{
                                            display: 'flex',
                                            textAlign: "left",
                                            width: "99%",
                                            height: 75,
                                            border: 1,
                                            borderColor: theme.palette.primary.main + "75",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                            backgroundColor: "transparent",
                                            backgroundImage: "none",
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.main + "25",
                                            }
                                        }}>
                                            <Button
                                                sx={{width: "100%"}}
                                                onClick={async () => {
                                                    // @ts-ignore
                                                    await handleSearchCompleted(option._id)
                                                    // @ts-ignore
                                                    navigate("/challenge/" + option._id)
                                                }}
                                            >
                                                <CardMedia
                                                    component="img"
                                                    // @ts-ignore
                                                    image={config.rootPath + option.thumbnail}
                                                    alt="No Image"
                                                    sx={{
                                                        borderRadius: "10px",
                                                        height: 60,
                                                        width: 220,
                                                        minWidth: 100,
                                                        paddingLeft: "-10px",
                                                    }}
                                                />
                                                <CardContent
                                                    sx={{
                                                        width: "100%",
                                                        height: "170%",
                                                        paddingTop: "20px",
                                                        paddingBottom: "15px",
                                                    }}
                                                >
                                                    <Typography align="left" variant="inherit" component="div" sx={{
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden",
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}>
                                                        {
                                                            // @ts-ignore
                                                            option.title
                                                        }
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden",
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}>
                                                        {
                                                            // @ts-ignore
                                                            option.description
                                                        }
                                                    </Typography>
                                                </CardContent>
                                            </Button>
                                        </Card>
                                    ) : (
                                        <Card sx={{
                                            display: 'flex',
                                            textAlign: "left",
                                            width: "99%",
                                            height: 75,
                                            border: 1,
                                            borderColor: theme.palette.secondary.main + "75",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                            backgroundColor: "transparent",
                                            backgroundImage: "none",
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: theme.palette.secondary.main + "25",
                                            }
                                        }}>
                                            <Button
                                                sx={{width: "100%"}}
                                                onClick={async () => {
                                                    // @ts-ignore
                                                    await handleSearchCompleted(option._id)
                                                    // @ts-ignore
                                                    navigate("/user/" + option._id)
                                                    window.location.reload()
                                                }}
                                            >
                                                <div style={{display: "flex", flexDirection: "row", width: "95%", justifyContent: "left"}}>
                                                    <div>
                                                        <UserIcon
                                                            userId={
                                                                // @ts-ignore
                                                                option._id
                                                            }
                                                            userTier={
                                                                //@ts-ignore
                                                                option.user_rank}
                                                            userThumb={
                                                                //@ts-ignore
                                                                config.rootPath + option.pfp_path}
                                                            backgroundName={
                                                                //@ts-ignore
                                                                option.name}
                                                            backgroundPalette={
                                                                //@ts-ignore
                                                                option.color_palette}
                                                            backgroundRender={
                                                                //@ts-ignore
                                                                option.render_in_front}
                                                            pro={
                                                                // @ts-ignore
                                                                option.user_status.toString() === "1"}
                                                            size={50}
                                                            imageTop={2}
                                                        />
                                                    </div>
                                                    <Typography variant="h5" component="div" sx={{
                                                        ml: 1,
                                                        mt: 1,
                                                        fontSize: 16,
                                                    }}>
                                                        {
                                                            //@ts-ignore
                                                            option.user_name}
                                                    </Typography>
                                                </div>
                                                <Tooltip
                                                    title={`Renown ${
                                                        //@ts-ignore
                                                        option.tier + 1}`}
                                                >
                                                    <img
                                                        style={{
                                                            height: "99%",
                                                            width: "auto",
                                                            opacity: "0.85",
                                                            overflow: "hidden",
                                                        }}
                                                        src={handleRenownCheck(
                                                            //@ts-ignore
                                                            option.tier)}
                                                    />
                                                </Tooltip>
                                            </Button>
                                        </Card>
                                    )}
                                </div>
                            )}
                            onInputChange={(e) => {
                                handleSearchSubmit(e)
                            }}
                            onSelect={(e) => {
                                handleSelect(e)
                            }}
                            value={(searchParams.query !== undefined && searchParams.query.length > 0) ? searchParams.query : null}
                            style={{
                                width: props.width,
                            }}
                            ListboxProps={
                                {
                                    style:{
                                        maxHeight: '90vh',
                                    }
                                }
                            }
                            renderInput={(params) => {
                                const {InputLabelProps,InputProps,...rest} = params;
                                return <StyledInputBase {...params.InputProps} {...rest} placeholder="Search for Challenges!"  />}}
                        />
                    </form>
                </Search>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    ref={menuRef}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {
                        advOpen
                            ?
                            [renderSearchFilter(), renderAdvancedSearch()]
                            :
                            renderSearchFilter()
                    }
                    <Grid container justifyContent="center">
                        <Button
                            onClick={() => {
                                setAdvOpen(!advOpen)
                            }}>
                            {!advOpen ? "Advanced Search" : "Hide Advanced Search"}
                        </Button>
                    </Grid>
                    <Grid container justifyContent="center">
                        <Button
                            onClick={() => {
                                clearState()
                            }}>
                            Clear Filters
                        </Button>
                    </Grid>
                </Menu>
            </>
        )
    }

    const mobileSearch = () => {
        return (
            <>
                <Search
                    style={{
                        width: "50vw",
                    }}
                >
                    <SearchIconWrapper>
                        <SearchIcon/>
                    </SearchIconWrapper>
                    {/*TODO: This is the options for search*/}
                    <form onSubmit={e => handleSubmit(e)}>
                        <Autocomplete
                            freeSolo
                            id="search-query"
                            ref={autoCompleteRef}
                            PopperComponent={({ children, ...popperProps }) => (
                                <Popper
                                    {...popperProps}
                                    ref={optionsRef}
                                    style={{
                                        width: "100vw",
                                    }}
                                >
                                   {children}
                                </Popper>
                            )}
                            open={optionsOpen}
                            onOpen={() => setOptionsOpen(true)}
                            onClose={() => setOptionsOpen(false)}
                            options={searchOptions}
                            getOptionLabel={(option: Post | string) => {
                                if (typeof option === "string") {
                                    return option
                                }
                                return option.title === undefined ?
                                    //@ts-ignore
                                    option.user_name : option.title
                            }}
                            groupBy={(option) =>
                                // @ts-ignore
                                option.author_id !== undefined && option.author_id !== null ? "Post": "User"
                            }
                            renderGroup={renderGroup}
                            //@ts-ignore
                            renderOption={(props, option) => (
                                <div
                                    style={{
                                        paddingBottom: '10px',
                                        paddingLeft: '10px',
                                    }}
                                >
                                    {/* @ts-ignore */}
                                    {option.author_id !== undefined  && option.author_id !== null ? (
                                        <Card sx={{
                                            display: 'flex',
                                            textAlign: "left",
                                            width: "99%",
                                            height: 75,
                                            border: 1,
                                            borderColor: theme.palette.primary.main + "75",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                            backgroundColor: "transparent",
                                            backgroundImage: "none",
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.main + "25",
                                            }
                                        }}>
                                            <Button
                                                sx={{width: "100%"}}
                                                onClick={async () => {
                                                    // @ts-ignore
                                                    await handleSearchCompleted(option._id)
                                                    // @ts-ignore
                                                    navigate("/challenge/" + option._id)
                                                }}
                                            >
                                                <CardMedia
                                                    component="img"
                                                    // @ts-ignore
                                                    image={config.rootPath + option.thumbnail}
                                                    alt="No Image"
                                                    sx={{
                                                        borderRadius: "10px",
                                                        height: 60,
                                                        width: 220,
                                                        minWidth: 100,
                                                        paddingLeft: "-10px",
                                                    }}
                                                />
                                                <CardContent
                                                    sx={{
                                                        width: "100%",
                                                        height: "170%",
                                                        paddingTop: "20px",
                                                        paddingBottom: "15px",
                                                    }}
                                                >
                                                    <Typography align="left" variant="inherit" component="div" sx={{
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden",
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}>
                                                        {
                                                            // @ts-ignore
                                                            option.title
                                                        }
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden",
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}>
                                                        {
                                                            // @ts-ignore
                                                            option.description
                                                        }
                                                    </Typography>
                                                </CardContent>
                                            </Button>
                                        </Card>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            )}
                            onInputChange={(e) => {
                                handleSearchSubmit(e)
                            }}
                            onSelect={(e) => {
                                handleSelect(e)
                            }}
                            value={(searchParams.query !== undefined && searchParams.query.length > 0) ? searchParams.query : null}
                            style={{
                                width: props.width,
                            }}
                            ListboxProps={
                                {
                                    style:{
                                        maxHeight: '90vh',
                                    }
                                }
                            }
                            renderInput={(params) => {
                                const {InputLabelProps,InputProps,...rest} = params;
                                return <StyledInputBase {...params.InputProps} {...rest} placeholder="Search"  />}}
                        />
                    </form>
                </Search>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    ref={menuRef}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {
                        advOpen
                            ?
                            [renderSearchFilter(), renderAdvancedSearch()]
                            :
                            renderSearchFilter()
                    }
                    <Grid container justifyContent="center">
                        <Button
                            onClick={() => {
                                setAdvOpen(!advOpen)
                            }}>
                            {!advOpen ? "Advanced Search" : "Hide Advanced Search"}
                        </Button>
                    </Grid>
                    <Grid container justifyContent="center">
                        <Button
                            onClick={() => {
                                clearState()
                            }}>
                            Clear Filters
                        </Button>
                    </Grid>
                </Menu>
            </>
        )
    }
    return (
        <div>
            {window.innerWidth > 1000 ? fullSizedSearch() : mobileSearch()}
        </div>
    )
}

TopSearchBar.defaultProps = {
    width: "35vw",
    height: "auto"
}