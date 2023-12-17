import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    createTheme,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    PaletteMode,
    Tooltip
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {getAllTokens, themeHelpers} from "../theme";

type TutorialStep = {
    content: JSX.Element;
    moreInfo?: JSX.Element;
}

type TutorialProps = {
    open: boolean;
    closeCallback: () => void;
    step: number;
    changeCallback: (step: number, back: boolean) => void;
    steps: TutorialStep[];
};

export default function CardTutorial(props: TutorialProps) {
    let userPref = localStorage.getItem("theme");
    const [mode, _] = useState<PaletteMode>(userPref === "light" ? "light" : "dark");
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const [moreInfoRendered, setMoreInfoRendered] = useState<boolean>(false);

    if (!props.open) {
        return null;
    }

    return (
        <Box
            sx={window.innerWidth < 1000 ? {
                position: "fixed",
                bottom: 60,
                right: "2.5vw",
                borderRadius: "10px",
                zIndex: 10000,
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2);",
                ...themeHelpers.frostedGlass,
                backgroundColor: "rgba(19,19,19,0.31)",
                // backgroundColor: theme.palette.primary.main + "30",
                width: "95vw"
            } :{
                position: "fixed",
                bottom: 40,
                right: 80,
                borderRadius: "10px",
                zIndex: 1000,
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2);",
                ...themeHelpers.frostedGlass,
                backgroundColor: "rgba(19,19,19,0.31)",
                // backgroundColor: theme.palette.primary.main + "30",
                width: 400,
            }}
        >
            <DialogContent
                sx={{
                    backgroundColor: "transparent",
                    maxHeight: "50vh",
                }}
            >
                {props.steps[props.step].content}
                {moreInfoRendered && props.steps[props.step].moreInfo}
            </DialogContent>
            <DialogActions
                sx={{
                    // @ts-ignore
                    // backgroundColor: theme.palette.background.codeEditorSide,
                    backgroundColor: "transparent",
                }}
            >
                {/* Conditionally render More Info button on the left side if the moreInfo value is available on the step */}
                {props.steps[props.step].moreInfo && (
                    <Button
                        onClick={() => setMoreInfoRendered(!moreInfoRendered)}
                        variant="text"
                        color="primary"
                        sx={{
                            borderRadius: "10px",
                            pointerEvents: 'auto',
                            // bound to the left side of the dialog
                            position: "absolute",
                            left: 0,
                            ml: 1,
                            fontSize: "0.8rem",
                        }}
                    >
                        {
                            moreInfoRendered ? "Less Info" : "More Info"
                        }
                    </Button>
                )}
                {props.step === 0 ? (
                    <Button
                        onClick={() => props.closeCallback()}
                        variant="outlined"
                        color="error"
                        sx={{
                            borderRadius: "10px",
                            pointerEvents: 'auto',
                            fontSize: "0.8rem",
                            '&:hover': {
                                backgroundColor: theme.palette.error.main + "25",
                            }
                        }}
                    >
                        Skip
                    </Button>
                    ): (
                    <Button
                        onClick={() => props.changeCallback(props.step - 1, true)}
                        variant="outlined"
                        color="primary"
                        sx={{
                            borderRadius: "10px",
                            pointerEvents: 'auto',
                            fontSize: "0.8rem",
                            '&:hover': {
                                backgroundColor: theme.palette.primary.main + "25",
                            }
                        }}
                        disabled={props.step === 0}
                    >
                        Back
                    </Button>
                )}
                {
                    props.step === props.steps.length - 1 ? (
                        <Button
                            onClick={() => props.closeCallback()}
                            variant="outlined"
                            color="success"
                            sx={{
                                borderRadius: "10px",
                                pointerEvents: 'auto',
                                fontSize: "0.8rem",
                                '&:hover': {
                                    backgroundColor: theme.palette.success.main + "25",
                                }
                            }}
                            disabled={props.step !== props.steps.length - 1}
                        >
                            Finish
                        </Button>
                        ) : (
                        <Button
                            onClick={() => props.changeCallback(props.step + 1, false)}
                            variant="outlined"
                            color="primary"
                            sx={{
                                borderRadius: "10px",
                                pointerEvents: 'auto',
                                fontSize: "0.8rem",
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main + "25",
                                }
                            }}
                            disabled={props.step === props.steps.length - 1}
                        >
                            Next
                        </Button>
                    )
                }
            </DialogActions>
        </Box>
    );
}
