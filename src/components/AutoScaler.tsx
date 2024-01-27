import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useMediaQuery } from '@mui/material';

interface IProps {
    children: React.ReactNode;
}
  
export default function AutoScaler(props: React.PropsWithChildren<IProps>) {
  const [scale, setScale] = useState(1);
  const isSmallScreen = useMediaQuery('(max-width:1600px)');

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    const targetAspectRatio = 1920 / 1080;
    const scaleFactor = isSmallScreen ? aspectRatio / targetAspectRatio : 1;
    setScale(scaleFactor);
  }, [isSmallScreen]);

  return (
    <Box
      id="autoscaler"
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {props.children}
    </Box>
  );
};

