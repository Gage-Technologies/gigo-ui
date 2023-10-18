import * as React from "react";
import {createTheme, CssBaseline, PaletteMode, ThemeProvider, Box, Modal} from "@mui/material";
import {getAllTokens} from "../theme";
import * as LootBox from "../img/lootBox.json"
import * as brightLights from "../img/brightlights.json"
import * as LootConfetti from "../img/loot_confetti_.json"
import { useEffect} from "react";
import Lottie from "react-lottie";
import freeze from "../img/streak/freeze.svg"
import {Rotate, Slide} from "react-awesome-reveal"
import Button from '@mui/material/Button';
import * as XPBoost from "../img/doubleXP.json"
import * as FreeWeek from "../img/freeWeek.json"
import {handle} from "mdast-util-to-markdown/lib/handle";
import config from "../config";

interface IProps {
    closePopup: () => void;
    reward: string;
}

const LootPopup = (props: IProps) => {
    // retrieve theme from local storage
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);
    const [steps, setSteps] = React.useState(0)
    const [winnings, setWinnings] = React.useState(props.reward)
    const [pause, setPause] = React.useState(false)
    const [open, setOpen] = React.useState(true)
    const [lottieBackground, setLottieBackground] = React.useState(null)

    const lootBoxOptions = {
        loop: true,
        autoplay: true,
        animationData: LootBox,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    };

    const confettiOptions = {
        loop: true,
        autoplay: true,
        animationData: LootConfetti,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const brightLightOptions = {
        loop: true,
        autoplay: true,
        animationData: brightLights,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const freeWeekOptions = {
        loop: true,
        autoplay: true,
        animationData: FreeWeek,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const xpBoostOptions = {
        loop: true,
        autoplay: true,
        animationData: XPBoost,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };


    const MINUTE_MS =500;

    useEffect(() => {
        setTimeout(function(){
            setPause(true)
        }, 3000)

        setTimeout(function(){
            setSteps(1)
        },3500)

        if (
            //@ts-ignore
            winnings["reward"] !== undefined && winnings["reward"] !== "undefined" && winnings["reward"]["color_palette"] !== ""){
            //@ts-ignore
            fetch(`${config.rootPath}/static/ui/lottie/user_backgrounds/${winnings["reward"]["color_palette"]}_${winnings["reward"]["name"]}.json`, {credentials: 'include'})
                .then(data => {
                    data.json().then(json => {
                        setLottieBackground(json)
                    })
                })
                .catch(error => console.error(error));
        }
    }, [])

    const handleClickClose = () => {
        props.closePopup()
        setOpen(false)
    }

    function reformat(str: string) {
        let words = str.split("_");
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
        }
        return words.join(" ");
    }

    const RenderFinalPage = () => {
        switch(
            //@ts-ignore
            winnings["reward_type"]) {
            case "streak_freeze": {
                return (
                    <div>
                        <div style={{zIndex: 4}}>
                            <h1>You Won A Streak Freeze</h1>
                        </div>
                        <div style={{zIndex: 4}}>
                            {/*<Slide direction={"up"} triggerOnce={true}>*/}
                            {/*    <Rotate triggerOnce={true} cascade={true} damping={0.1}>*/}
                            {/*        <img src={freeze} alt="freeze" style={{zIndex: 4}}/>*/}
                            {/*    </Rotate>*/}
                            {/*</Slide>*/}
                            <Slide triggerOnce={true}>
                                <img src={freeze} alt="freeze" style={{zIndex: 4}}/>
                            </Slide>
                        </div>
                        <div style={{height: "100px"}}/>
                        <div style={{height: "100%", width: "100%", display: "flex", alignItems: "end", justifyContent: "center", zIndex: 6}}>
                            <Button variant={"contained"}
                                    sx={{zIndex: 6, width: "75%", height: "60px", backgroundColor: "gold", color: "#853500", borderRadius: "25px", boxShadow: '0 5px 0 #B7410E',
                                    '&:active':{transform: 'translateY(5px)', boxShadow: 'none'}, '&:hover':{backgroundColor: "gold", cursor: 'pointer', '&:before': {transform: 'translateX(300px) skewX(-15deg)', opacity: 0.6, transition: '.7s'}}}} disableRipple={true}
                                    id={"button"} onClick={() => handleClickClose()}>
                                Accept Loot
                            </Button>
                        </div>
                    </div>
                )
            }
            case "avatar_background": {
                return (
                    <div>
                        <div style={{zIndex: 4}}>
                            <h1>You Won An Avatar Background</h1>
                        </div>
                        <div style={{width: "100%", display: "flex", justifyContent: "center", zIndex: 4}}>
                            <h4>{
                                //@ts-ignore
                                winnings["reward"]["color_palette"].toUpperCase() + " " + winnings["reward"]["name"].replace("_", " ").toUpperCase()}</h4>
                        </div>
                        <div style={{zIndex: 4}}>
                            <Rotate triggerOnce={true}
                            >
                                {lottieBackground !== null ? (
                                    <div>
                                        <Lottie options={
                                            {loop: true,
                                                autoplay: true,
                                                animationData: lottieBackground,
                                                rendererSettings: {
                                                    preserveAspectRatio: 'xMidYMid slice'
                                                }
                                            }} width={window.innerHeight / 2}
                                                height={window.innerHeight / 2} isClickToPauseDisabled={true} style={{zIndex: 4}}/>
                                    </div>
                                ) : null}
                            </Rotate>
                        </div>
                        <div style={{height: "25px"}}/>
                        <div style={{height: "100%", width: "100%", display: "flex", alignItems: "end", justifyContent: "center", zIndex: 6}}>
                            <Button variant={"contained"}
                                    sx={{zIndex: 6, width: "75%", height: "60px", backgroundColor: "gold", color: "#853500", borderRadius: "25px", boxShadow: '0 5px 0 #B7410E',
                                        '&:active':{transform: 'translateY(5px)', boxShadow: 'none'}, '&:hover':{backgroundColor: "gold", cursor: 'pointer', '&:before': {transform: 'translateX(300px) skewX(-15deg)', opacity: 0.6, transition: '.7s'}}}} disableRipple={true}
                                    id={"button"} onClick={() => handleClickClose()}>
                                Accept Loot
                            </Button>
                        </div>
                    </div>
                )
            }
            case "xp_boost" : {
                return (
                    <div>
                        <div style={{zIndex: 4}}>
                            <h1>You Won A Double XP Boost</h1>
                        </div>
                        <div style={{zIndex: 4}}>
                                <Rotate triggerOnce={true}>
                                    <Lottie options={xpBoostOptions} isClickToPauseDisabled={true}
                                            width={window.innerHeight / 2}
                                            height={window.innerHeight / 2} style={{zIndex: 4}}/>
                                </Rotate>
                        </div>
                        <div style={{height: "100px"}}/>
                        <div style={{height: "100%", width: "100%", display: "flex", alignItems: "end", justifyContent: "center", zIndex: 6}}>
                            <Button variant={"contained"}
                                    sx={{zIndex: 6, width: "75%", height: "60px", backgroundColor: "gold", color: "#853500", borderRadius: "25px", boxShadow: '0 5px 0 #B7410E',
                                        '&:active':{transform: 'translateY(5px)', boxShadow: 'none'}, '&:hover':{backgroundColor: "gold", cursor: 'pointer', '&:before': {transform: 'translateX(300px) skewX(-15deg)', opacity: 0.6, transition: '.7s'}}}} disableRipple={true}
                                    id={"button"} onClick={() => handleClickClose()}>
                                Accept Loot
                            </Button>
                        </div>
                    </div>
                )
            }
            case "free_week" : {
                return (
                    <div>
                        <div style={{zIndex: 4}}>
                            <h1>You Won A Free Month</h1>
                        </div>
                        <div style={{zIndex: 4}}>
                                <Rotate triggerOnce={true}>
                                    <Lottie options={freeWeekOptions} isClickToPauseDisabled={true}
                                            width={window.innerHeight / 2}
                                            height={window.innerHeight / 2} style={{zIndex: 4}}/>
                                </Rotate>
                        </div>
                        <div style={{height: "100px"}}/>
                        <div style={{height: "100%", width: "100%", display: "flex", alignItems: "end", justifyContent: "center", zIndex: 6}}>
                            <Button variant={"contained"}
                                    sx={{zIndex: 6, width: "75%", height: "60px", backgroundColor: "gold", color: "#853500", borderRadius: "25px", boxShadow: '0 5px 0 #B7410E',
                                        '&:active':{transform: 'translateY(5px)', boxShadow: 'none'}, '&:hover':{backgroundColor: "gold", cursor: 'pointer', '&:before': {transform: 'translateX(300px) skewX(-15deg)', opacity: 0.6, transition: '.7s'}}}} disableRipple={true}
                                    id={"button"} onClick={() => handleClickClose()}>
                                Accept Loot
                            </Button>
                        </div>
                    </div>
                )
            }
        }
    }


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Modal open={open} style={{display: 'flex', justifyContent: "center", alignItems: "center"}}>
                    <Box
                        sx={{
                            width: "65vw",
                            height: "80vh",
                            // justifyContent: "center",
                            // marginLeft: "18vw",
                            // marginTop: "5vh",
                            outlineColor: "black",
                            borderRadius: 1,
                            boxShadow: "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                            backgroundColor: theme.palette.background.default,
                            // outline: `solid`
                        }}
                    >
                        {steps === 0 ? (
                            <div style={{display: "flex", width: "100%", height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
                                <h1>You Won A Loop Box</h1>
                                <Lottie options={lootBoxOptions} isClickToPauseDisabled={true}
                                        width={window.innerHeight / 1.25}
                                        height={window.innerHeight / 1.25} isPaused={pause}/>
                            </div>
                        ) : (
                            <div style={{display: "flex", width: "100%", height: "100%", justifyContent: "center", alignItems: "center", flexWrap: "wrap"}}>
                                <div style={{zIndex: 5, position: "absolute", top: 0, transform: "rotate(180deg)"}}>
                                    <Lottie options={brightLightOptions} speed={.5} direction={-1} isClickToPauseDisabled={true}
                                            width={window.innerHeight / .5}
                                            height={window.innerHeight / .5}/>
                                </div>
                                <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "start"}}>
                                    {RenderFinalPage()}
                                </div>
                                <div style={{zIndex: 0, position: "absolute"}}>
                                    <Lottie options={confettiOptions} isClickToPauseDisabled={true}
                                            width={window.innerHeight / 1.5}
                                            height={window.innerHeight / 1.5}/>
                                </div>
                                <div style={{zIndex: 5, position: "absolute", bottom: 0}}>
                                    <Lottie options={brightLightOptions} speed={.5} isClickToPauseDisabled={true} direction={1}
                                            width={window.innerHeight / .5}
                                            height={window.innerHeight / .5}/>
                                </div>
                            </div>
                        )}
                    </Box>
                </Modal>
            </CssBaseline>
        </ThemeProvider>
    )
}

export default LootPopup;