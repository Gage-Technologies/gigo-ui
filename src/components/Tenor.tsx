import React, { useState, useEffect, useRef } from "react";
import {createTheme, PaletteMode, TextField, Grid, Card, CardMedia, Dialog, DialogContent, Box} from "@mui/material";
import { getAllTokens } from "../theme";

interface MediaItem {
    dims: [number, number];
    url: string;
    preview: string;
    duration: number;
    size: number;
}

interface GifObject extends MediaItem {}

interface MediumGifObject extends MediaItem {}

interface NanoMp4Object extends MediaItem {}

interface NanoGifObject extends MediaItem {}

interface Mp4Object extends MediaItem {}

interface NanoWebmObject extends MediaItem {}

interface TinyWebmObject extends MediaItem {}

interface LoopedMp4Object extends MediaItem {}

interface WebmObject extends MediaItem {}

interface TinyMp4Object extends MediaItem {}

interface Media {
    mediumgif?: MediumGifObject;
    nanomp4?: NanoMp4Object;
    nanogif?: NanoGifObject;
    mp4?: Mp4Object;
    nanowebm?: NanoWebmObject;
    tinywebm?: TinyWebmObject;
    gif?: GifObject;
    tinygif?: TinyMp4Object;
    loopedmp4?: LoopedMp4Object;
    webm?: WebmObject;
    tinymp4?: TinyMp4Object;
}

interface Gif {
    id: string;
    title: string;
    content_description: string;
    content_rating: string;
    h1_title: string;
    media: Media[];
    bg_color: string;
    created: number;
    itemurl: string;
    url: string;
    tags: string[];
    flags: any[];
    shares: number;
    hasaudio: boolean;
    hascaption: boolean;
    source_id: string;
    composite: null | any; // Use a specific type if you know the structure of composite
}

type TenorResponse = {
    results: Gif[];
    next: string; // Next position in the result set
};

type TenorProps = {
    open: boolean; // Prop to control dialog visibility
    closeCallback: () => void; // Callback function to close dialog
    addGif: (gif: string) => void; // Callback function when a GIF is selected
};

export default function Tenor({ open, closeCallback, addGif }: TenorProps) {
    let userPref = localStorage.getItem("theme");
    const [mode, _] = useState<PaletteMode>(userPref === "light" ? "light" : "dark");
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [query, setQuery] = useState<string>("");
    const [gifs, setGifs] = useState<Gif[]>([]);
    const [selectedGif, setSelectedGif] = useState<Gif | null>(null);
    const [next, setNext] = useState<string>("0");
    const [loading, setLoading] = useState<boolean>(false);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    const searchGifs = async (searchQuery: string, nextPosition: string) => {
        if (loading) return;

        setLoading(true);
        const apiKey = "LIVDSRZULELA";
        const url = `https://api.tenor.com/v1/search?q=${searchQuery}&key=${apiKey}&limit=10&pos=${nextPosition}&contentfilter=low`; // Added contentfilter
        const response = await fetch(url);
        const data: TenorResponse = await response.json();
        setGifs((prevGifs) => [...prevGifs, ...data.results]);
        setNext(data.next);
        setLoading(false);
    };

    useEffect(() => {
        setGifs([]);
        setNext("0");
        searchGifs("gorilla", "0"); // Initial search for "gorilla"
    }, []);

    useEffect(() => {
        if (query) {
            setGifs([]);
            setNext("0");
            searchGifs(query, "0");
        }
    }, [query]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && next && !loading) {
                    searchGifs(query || "gorilla", next); // Use "gorilla" if query is empty
                }
            },
            { threshold: 1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [next, loading, query]);

    let dialogPosition: any = {
        bottom: 80,
        right: 300,
        width: "450px",
        height: "550px",
    }
    if (window.innerWidth < 1000) {
        dialogPosition = {
            bottom: 120,
            // right: "5vw",
            width: "90vw",
            height: "435px",
        }
    }

    return (
        <Dialog
            open={open}
            onClose={closeCallback}
            BackdropProps={{ style: { backgroundColor: "transparent" } }}
            PaperProps={{
                style: {
                    position: "absolute",
                    bottom: 80,
                    borderRadius: "10px",
                    overflow: "hidden", // Prevent GIFs from overflowing
                    // @ts-ignore
                    backgroundColor: theme.palette.background.paper,
                    ...dialogPosition
                },
            }}
        >
            <DialogContent
                sx={{
                    // @ts-ignore
                    backgroundColor: theme.palette.background.paper,
                    paddingTop: 0,
                }}
            >
                <Box
                    sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        // @ts-ignore
                        backgroundColor: theme.palette.background.paper,
                        padding: theme.spacing(1),
                    }}
                >
                    <TextField
                        label="Search GIFs"
                        variant="outlined"
                        fullWidth
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        sx={{
                            fontSize: "0.8rem",
                            mt: 2,
                        }}
                    />
                </Box>
                <Grid container spacing={2}>
                    {gifs
                        .filter((gif) => gif.media.length > 0 && gif.media[0].gif && gif.media[0].tinymp4)
                        .map((gif, index) => (
                        <Grid item xs={6} key={index}>
                            <Card onClick={() => {
                                if (!gif.media[0].tinymp4)
                                    return;

                                if (gif.media[0].tinywebm) {
                                    addGif(
                                        `<video style="border-radius: 10px;"><source src="${gif.media[0].tinywebm.url}" type="video/webm" /><source src="${gif.media[0].tinymp4.url}" type="video/mp4" />${query}</video>`
                                    );
                                }
                                addGif(
                                    `<video style="border-radius: 10px;"><source src="${gif.media[0].tinymp4.url}" type="video/mp4" />${query}</video>`
                                );
                            }}>
                                <CardMedia component="img" image={gif.media[0].gif?.url} />
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <div ref={loaderRef}></div>
            </DialogContent>
        </Dialog>
    );
}
