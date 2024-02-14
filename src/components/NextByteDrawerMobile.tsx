import React from 'react';
import {Box, Button, Drawer, Typography} from '@mui/material';
import { useSwipeable } from 'react-swipeable';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SwipeAnimation from './swipe-left.json';
import Lottie from "react-lottie";

interface NextByteDrawerProps {
    open: boolean;
    onClose: () => void;
    onNextByte: () => void;
}

const NextByteDrawerMobile: React.FC<NextByteDrawerProps> = ({ open, onClose, onNextByte }) => {
    const handlers = useSwipeable({
        onSwipedLeft: onNextByte, // Change to left swipe to move to next byte
        trackTouch: true,
        delta: 50,
    });

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: SwipeAnimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
        >
            <div {...handlers} style={{ width: '100%', textAlign: 'center', touchAction: 'none' }}>
                <Box
                    sx={{
                        height: "75px",
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#232a2f',
                        cursor: 'pointer',
                    }}
                >
                    <Typography component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft:"-7%" }}>
                        <Lottie options={defaultOptions} height={75} width={45} />
                        <Typography>
                            Swipe To Next Byte
                        </Typography>
                    </Typography>
                </Box>
            </div>
        </Drawer>
    );
};

export default NextByteDrawerMobile;