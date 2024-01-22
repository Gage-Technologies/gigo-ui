import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { styled } from '@mui/material/styles';
import {useAppSelector} from "../app/hooks";
import {selectAuthState} from "../reducers/auth/auth";

const DifficultyBlock = styled(Box)<{ filled: boolean, color: string }>(({ filled, color }) => ({
    width: '20px',
    height: '30px',
    marginLeft: '2px',
    marginRight: '2px',
    display: 'inline-block',
    backgroundColor: filled ? color : '#ddd',
    transition: 'background-color 0.3s',
    borderRadius: "4px"
}));

const DifficultyContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

const MAX_LEVELS = 2;

export interface DifficultyAdjusterProps {
    difficulty: number;
    onChange: (difficulty: number) => void;
}

export default function DifficultyAdjuster(props: DifficultyAdjusterProps) {
    const [difficultyLevel, setDifficultyLevel] = React.useState(props.difficulty); // Start at level 1 (one bar on)

    const incrementDifficulty = () => {
        setDifficultyLevel((prev) => (prev < MAX_LEVELS ? prev + 1 : prev));
        props.onChange(difficultyLevel < MAX_LEVELS ? difficultyLevel + 1 : difficultyLevel);
    };

    const decrementDifficulty = () => {
        setDifficultyLevel((prev) => (prev > 0 ? prev - 1 : prev)); // Decrease only if above 1
        props.onChange(difficultyLevel > 0 ? difficultyLevel - 1 : difficultyLevel)
    };

    const getColorForDifficulty = (level: number) => {
        if (level === 0) return '#52af77'; // green for easy
        if (level === 1) return '#ffa500'; // orange for medium
        if (level === 2) return '#ff0000'; // red for hard
        return '#ddd'; // default color
    };

    return (
        <Box width="fit-content" m="auto">
            <Typography gutterBottom variant="caption" display="block" textAlign="center">
                Difficulty
            </Typography>
            <DifficultyContainer>
                <IconButton
                    size="small"
                    onClick={decrementDifficulty}
                    disabled={difficultyLevel === 0} // Disable if at level 1
                    aria-label="decrease difficulty"
                >
                    <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                {[...Array(MAX_LEVELS+1)].map((_, index) => (
                    <DifficultyBlock
                        key={index}
                        filled={index < difficultyLevel + 1}
                        color={getColorForDifficulty(difficultyLevel)}
                    />
                ))}
                <IconButton
                    size="small"
                    onClick={incrementDifficulty}
                    disabled={difficultyLevel === MAX_LEVELS} // Disable if at max level
                    aria-label="increase difficulty"
                >
                    <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
            </DifficultyContainer>
        </Box>
    );
}
