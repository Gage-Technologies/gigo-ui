import React from 'react';
import {alpha, Box, styled, useTheme} from '@mui/material';

const SheenAnimation = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.action.focus,
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%', // Start from the left, out of view
    width: '100%', // Width of the sheen effect
    height: '100%',
    background: `linear-gradient(
      to right,
      transparent, 
      ${theme.palette.mode === "dark" ? alpha(theme.palette.grey[100], 0.1) : alpha(theme.palette.grey[600], 0.1)} 5%, 
      ${theme.palette.mode === "dark" ? theme.palette.grey[100] : theme.palette.grey[600]} 50%, 
      ${theme.palette.mode === "dark" ? alpha(theme.palette.grey[100], 0.1): alpha(theme.palette.grey[600], 0.1)} 95%, 
      transparent
    )`,
    opacity: 0.5,
    animation: 'sheen 2s infinite linear', // Use linear for constant speed
  },

  '@keyframes sheen': {
    '0%': {
      left: '-100%', // Start out of view
    },
    '100%': {
      left: '100%', // End completely on the other side
    },
  },
}));

interface SheenPlaceholderProps {
  width?: string | number;
  height?: string | number;
}

const SheenPlaceholder: React.FC<SheenPlaceholderProps> = ({ width = '100%', height = '16px' }) => {
  const theme = useTheme();

  return (
      <SheenAnimation
          sx={{
            width,
            height,
            // Optional: Additional styles can be applied here
          }}
      />
  );
};

export default SheenPlaceholder;
