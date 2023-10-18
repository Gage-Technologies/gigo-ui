import * as React from "react";
import {
    createTheme,
    CssBaseline,
    PaletteMode,
    ThemeProvider,
    Box,
    Modal,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {getAllTokens} from "../theme";
import { keyframes } from "@emotion/react";
import LinearProgress from "@mui/material/LinearProgress";
import * as levelUp from "../img/levelUp.json"
import * as XPBoost from "../img/doubleXP.json";
import Lottie from "react-lottie";
import {useEffect} from "react";
import Button from "@mui/material/Button";
import {Fade} from "react-awesome-reveal"
import LootPopup from "./LootPopup";
import Joyride from "react-joyride";
import {bottom} from "@popperjs/core";

interface IProps {
    oldXP: number;
    newXP: number;
    nextLevel: number;
    maxXP: number;
    levelUp: boolean;
    gainedXP: number;
    reward: string | null;
    renown: number;
    popupClose: () => void | null;
    homePage: boolean;
}

const XpPopup = (props: IProps) => {
    let userPref = localStorage.getItem("theme");
    const [mode, _] = React.useState<PaletteMode>(
        userPref === "light" ? "light" : "dark"
    );
        const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [showConfetti, setShowConfetti] = React.useState(false);

    const [startXP, setStartXP] = React.useState(props.oldXP);
    const [extraXP, setExtraXP] = React.useState(props.newXP - props.oldXP);
    const [totalXP, setTotalXP] = React.useState(props.maxXP);
    const [currentLevel, setCurrentLevel] = React.useState(props.nextLevel - 1);
    const [nextLevel, setNextLevel] = React.useState(props.nextLevel);
    const [xpTitle, setXpTitle] = React.useState(props.gainedXP);
    const [open, setOpen] = React.useState(true);
    const [lootBox, setLootBox] = React.useState(false);
    const [showLoot, setShowLoot] = React.useState(false);
    const [reward, setReward] = React.useState(props.reward);
    const [renown, setRenown] = React.useState(props.renown + 1);

    const [steps, setSteps] = React.useState([{
        content: <h2>Let's begin our journey!</h2>,
        locale: { skip: <strong aria-label="skip">Skip</strong> },
        placement: 'center',
        target: 'body',
    },{content: <h2>You earn XP by doing activities on the platform.</h2>, target: '.button', placement: 'bottom'}]);

    const [run, setRun] = React.useState(props.homePage)


    const progressKeyframes = keyframes`
    0% {
      width: ${0}%;
    }
    100% {
      width: ${startXP + extraXP}%;
    }
  `;


    useEffect(() => {
        if (props.levelUp) {
            setTimeout(function(){
                setLootBox(true)
                setShowConfetti(true);
                setStartXP(0);
                setExtraXP(0);
                setCurrentLevel(currentLevel);
                setNextLevel(nextLevel);
            },1800)
        }
    }, [])

    const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
        height: 50,
        borderRadius: 25,
        outline: "solid 5px grey",
        [`& .MuiLinearProgress-bar`]: {
            borderRadius: 5,
            background: `linear-gradient(to right, #20A51A, #308fe8)`,
            animation: `${progressKeyframes} 1.5s forwards`,
            boxShadow: `0 0 10px #308fe8, 0 0 5px #308fe8`,
        },
    }));

    const confettiOptions = {
        loop: true,
        autoplay: true,
        animationData: levelUp,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const confirmButton = () => {
        if (lootBox) {
            setShowLoot(true);
        } else {
            setOpen(false);
            if (props.popupClose !== null){
                props.popupClose();
            }
            window.sessionStorage.setItem("loginXP", "undefined")
            window.sessionStorage.setItem("attemptXP", "undefined")
        }
    }

    const closePopupLoot = () => {
        setOpen(false)
        if (props.popupClose !== null){
            props.popupClose();
        }
        window.sessionStorage.setItem("loginXP", "undefined")
        window.sessionStorage.setItem("attemptXP", "undefined")
    }


    console.log("renown: ", renown)

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Modal open={open} style={{display: 'flex', justifyContent: "center", alignItems: "center"}}>
                    <Box
                        sx={{
                            width: "40vw",
                            height: "45vh",
                            minHeight: "420px",
                            // justifyContent: "center",
                            // marginLeft: "25vw",
                            // marginTop: "5vh",
                            outlineColor: "black",
                            borderRadius: 1,
                            boxShadow:
                                "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px 6px 0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        {showLoot ? (
                            <div>
                                <LootPopup closePopup={closePopupLoot}
                                           //@ts-ignore
                                           reward={props.reward}/>
                            </div>
                        ) : (
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "start",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Fade cascade damping={1e-1} direction={"left"}>
                                        <h1>{"You Earned " + xpTitle + " XP"}</h1>
                                    </Fade>
                                </div>
                                <div style={{ height: "5vh" }} />
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "start",
                                        justifyContent: "center",
                                    }}
                                >
                                    <h3>{"Renown " +
                                        renown}</h3>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                    }}
                                >
                                    <h4>{"Lvl " + currentLevel}</h4>
                                    <div style={{ width: "20px" }} />
                                    <Box sx={{ width: "75%"}}>
                                        <StyledLinearProgress variant="determinate"/>
                                    </Box>
                                    <div style={{ width: "20px" }} />
                                    <h4>{"Lvl " + nextLevel}</h4>
                                </div>
                                {showConfetti && (
                                    <div style={{position: "absolute"}}>
                                        <Lottie options={confettiOptions} isClickToPauseDisabled={true}
                                                width={window.innerHeight / .8}
                                                height={window.innerHeight / .8} style={{zIndex: 4}}/>
                                    </div>
                                )}
                                <div style={{height: "5vh"}}/>
                                <div style={{display: "flex", alignItems: "end", justifyContent: "center"}}>
                                    <Button variant={"contained"}
                                            sx={{ width: "25%", height: "60px", backgroundColor: "#29C18C", color: "white", borderRadius: "25px", boxShadow: '0 5px 0 #235d30',
                                                '&:active':{transform: 'translateY(5px)', boxShadow: 'none'}, '&:hover':{backgroundColor: "#29C18C", cursor: 'pointer', '&:before': {transform: 'translateX(300px) skewX(-15deg)', opacity: 0.6, transition: '.7s'}}}} disableRipple={true} onClick={() => confirmButton()}
                                            id={"button"} className={'button'} style={{zIndex: "600000"}}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Box>
                </Modal>
            </CssBaseline>
        </ThemeProvider>
    );
};

export default XpPopup;