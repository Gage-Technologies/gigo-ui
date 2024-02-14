import * as React from "react";
import {
    createTheme,
    CssBaseline,
    PaletteMode,
    ThemeProvider,
    Box,
    Modal,
    IconButton,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {getAllTokens, themeHelpers} from "../theme";
import { keyframes } from "@emotion/react";
import LinearProgress from "@mui/material/LinearProgress";
import * as levelUp from "../img/levelUp.json"
import * as XPBoost from "../img/doubleXP.json";
import Lottie from "react-lottie";
import {useEffect} from "react";
import { Button } from "@mui/material"
import {Fade} from "react-awesome-reveal"
import LootPopup from "./LootPopup";
import Joyride from "react-joyride";
import {bottom} from "@popperjs/core";
import { selectAuthState } from "../reducers/auth/auth";
import { useAppSelector } from "../app/hooks";
import premiumGorilla from "../img/pro-pop-up-icon-plain.svg"
import proBackground from "../img/popu-up-backgraound-plain.svg"
import fireworks from "../img/fireworks.svg"
import croppedPremium from "../img/croppedPremium.png"
import call from "../services/api-call";
import config from "../config";
import { Close } from "@material-ui/icons";

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
    // const [mode, _] = React.useState<PaletteMode>(
    //     userPref === "light" ? "light" : "dark"
    // );
    // const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [mode, setMode] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
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
    const [showPro, setShowPro] = React.useState(false);
    const [proMonthlyLink, setProMonthlyLink] = React.useState("");
    const [proYearlyLink, setProYearlyLink] = React.useState("");

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

  const authState = useAppSelector(selectAuthState);


    useEffect(() => {
        let premium = authState.role.toString()
        // //remove
        // premium = "0"
        if (premium === "0") {
            retrieveProUrls()
        }
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
        let premium = authState.role.toString()
        // //remove
        // premium = "0"
        if (premium === "0") {
            setShowPro(true)
        } else if (lootBox) {
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

    const retrieveProUrls = async (): Promise<{ monthly: string, yearly: string } | null> => {
        let res = await call(
            "/api/stripe/premiumMembershipSession",
            "post",
            null,
            null,
            null,
            // @ts-ignore
            {},
            null,
            config.rootPath
        )

        if (res !== undefined && res["return url"] !== undefined && res["return year"] !== undefined) {
            setProMonthlyLink(res["return url"])
            setProYearlyLink(res["return year"])
            return {
                "monthly": res["return url"],
                "yearly": res["return year"],
            }
        }

        return null
    }

    const closePopupLoot = () => {
        setOpen(false)
        if (props.popupClose !== null){
            props.popupClose();
        }
        window.sessionStorage.setItem("loginXP", "undefined")
        window.sessionStorage.setItem("attemptXP", "undefined")
    }

    const renderXPPopup = () => {
        if (showLoot) {
            return (
                <div>
                    <LootPopup closePopup={closePopupLoot}
                           //@ts-ignore
                           reward={props.reward}/>
                 </div>
            )
        } else if (showPro) {
            // @ts-ignore
            return (
                <>
                    <style>
                    </style>
                    <div style={{
                        borderRadius: "10px",
                        padding: "20px",
                        textAlign: "center"
                    }}>
                        <IconButton
                            edge="end"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                console.log("loot is: ", showLoot)
                                if (lootBox) {
                                    console.log("here")
                                    setShowLoot(true);
                                setShowPro(false);
                                } else {
                                setOpen(false);
                                if (props.popupClose !== null) {
                                    props.popupClose();
                                }
                                window.sessionStorage.setItem("loginXP", "undefined");
                                window.sessionStorage.setItem("attemptXP", "undefined");
                                }
                            }}
                            sx={window.innerWidth < 1000 ? {
                                position: "absolute",
                                top: '20vh',
                                right: '15vw'
                            } :{
                                position: "absolute",
                                top: '20vh',
                                right: '38vw'
                            }}
                            >
                            <Close />
                        </IconButton>
                        <img src={premiumGorilla} style={{width: "30%", marginBottom: "20px"}}/>
                        <Typography variant={"h4"} style={{marginBottom: "10px"}} align={"center"}>GIGO Pro</Typography>
                        <Typography variant={"body1"} style={{marginBottom: "20px"}} align={"center"}>Get access to more resources and become a better developer today</Typography>
                        <div style={{
                            display: "flex",
                            justifyContent: "center"
                        }}>
                            <div style={{
                                backgroundColor:
                                //@ts-ignore
                                "#070D0D",
                                borderRadius: "10px",
                                padding: "20px",
                                margin: "10px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                textAlign: "center",
                                width: "200px"
                            }}>
                                <Typography variant={"subtitle1"} style={{marginBottom: "10px"}} align={"center"}>1 Month</Typography>
                                <Typography variant={"h5"} style={{marginBottom: "10px"}} align={"center"}>$15 / MO</Typography>
                                <Button variant="contained" onClick={() => window.open(proMonthlyLink, "_blank")} style={{backgroundColor: theme.palette.secondary.dark}}>Select</Button>
                            </div>
                            <div style={{
                                backgroundColor:
                                //@ts-ignore
                                    "#070D0D",
                                borderRadius: "10px",
                                padding: "20px",
                                margin: "10px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                textAlign: "center",
                                width: "200px"}}>
                                <Typography variant={"subtitle1"} style={{marginBottom: "10px"}} align={"center"}>12 Months</Typography>
                                <Typography variant={"h5"} style={{marginBottom: "10px"}} align={"center"}>$11.25 / MO</Typography>
                                <Button variant="contained" onClick={() => window.open(proYearlyLink, "_blank")} style={{backgroundColor: theme.palette.secondary.dark}}>Select</Button>
                            </div>
                        </div>
                    </div>
                </>
            )
        } else {
            return (
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
                    {/* {showConfetti && (
                        <div style={{position: "absolute"}}>
                            <Lottie options={confettiOptions} isClickToPauseDisabled={true}
                                    width={window.innerHeight / .8}
                                    height={window.innerHeight / .8} style={{zIndex: 4}}/>
                        </div>
                    )} */}
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
            )
        }
    }




    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <Modal open={open} style={{display: 'flex', justifyContent: "center", alignItems: "center"}}>
                    <Box
                        sx={showPro ? {
                            width: window.innerWidth < 1000 ? "90vw" : "28vw",
                            height: window.innerWidth < 1000 ? "78vh": "65vh",
                            minHeight: "420px",
                            // justifyContent: "center",
                            // marginLeft: "25vw",
                            // marginTop: "5vh",
                            outlineColor: "black",
                            borderRadius: 7,
                            boxShadow:
                                "0px 12px 6px -6px rgba(0,0,0,0.6),0px 6px  0px rgba(0,0,0,0.6),0px 6px 18px 0px rgba(0,0,0,0.6)",
                            // backgroundColor: theme.palette.background.default,
                            backgroundImage: `url(${proBackground})`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center center"
                            // ...themeHelpers.frostedGlass
                        } : {
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
                        {renderXPPopup()}
                    </Box>
                </Modal>
            </CssBaseline>
        </ThemeProvider>
    );
};

export default XpPopup;