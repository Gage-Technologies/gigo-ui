import React, { useState } from "react";
import { createTheme, PaletteMode, Dialog, DialogContent } from "@mui/material";
import { getAllTokens } from "../theme";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

type EmojiProps = {
    open: boolean; // Prop to control dialog visibility
    closeCallback: () => void; // Callback function to close dialog
    onEmojiSelect: (emoji: any) => void; // Callback function when an emoji is selected
};

export default function EmojiPicker({ open, closeCallback, onEmojiSelect }: EmojiProps) {
    let userPref = localStorage.getItem("theme");
    const [mode, _] = useState<PaletteMode>(userPref === "light" ? "light" : "dark");
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const addEmoji = (emoji: any) => {
        onEmojiSelect(emoji);
    };

    return (
        <Dialog
            open={open} // Controlled by prop
            onClose={closeCallback} // Callback function to close dialog
            BackdropProps={{ style: { backgroundColor: "transparent" } }}
            PaperProps={{
                style: {
                    position: "absolute",
                    bottom: 80,
                    right: 300,
                    width: "450px",
                    height: "435px",
                    borderRadius: "10px",
                    // @ts-ignore
                    backgroundColor: theme.palette.background.chat,
                },
            }}
        >
            <DialogContent
                style={{
                    padding: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden',
                }}
            >
                <Picker
                    data={data}
                    onEmojiSelect={addEmoji}
                    theme={userPref === 'light' ? 'light' : 'dark'}
                    autoFocus={true}
                    emojiSize={24}
                    emojiButtonSize={47}
                    perline={12}
                    style={{ flex: 1 }}
                />
            </DialogContent>
        </Dialog>
    );
}
