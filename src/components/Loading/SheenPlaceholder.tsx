import React from 'react';
import { styled } from '@mui/material/styles';
import { alpha } from '@material-ui/core';

const SheenAnimation = styled('div')(({ theme }) => ({
  backgroundColor: alpha(theme.palette.grey[500], 0.6),
  borderRadius: '4px',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    background: 'linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
    transform: 'translateX(-100%)',
    animation: 'sheen 1.5s infinite linear',
  },

  '@keyframes sheen': {
    '100%': {
      transform: 'translateX(100%)',
    },
  },
}));

interface SheenPlaceholderProps {
  width?: string;
  height?: string;
}

const SheenPlaceholder: React.FC<SheenPlaceholderProps> = ({ width = '100%', height = '16px' }) => {
  return <SheenAnimation style={{ width, height }} />;
};

export default SheenPlaceholder;
