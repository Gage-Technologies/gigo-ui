import * as React from "react";
import { Card, CardContent, Grid, Tooltip, Typography } from "@mui/material";
import UserIcon from "./UserIcon";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import { styled } from "@mui/system";

const StyledCard = styled(Card)`
  padding: 0.5rem 1.5rem;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  border: 1px solid ${(props) => props.theme.palette.primary.dark + "75"};
  margin: 0.5rem auto;
`;

const UserName = styled(Typography)`
  font-size: 1.2rem;
  font-weight: bold;
`;

const TimeText = styled(Typography)`
  font-size: 1rem;
  color: grey;
`;

const SuccessIcon = styled(CheckCircleIcon)`
  color: #1c8762;
`;

const InProgressIcon = styled(PendingOutlinedIcon)`
  color: #9cdcfe;
`;

interface IProps {
    width: number | string;
    height: number | string;
    attemptUser: string;
    userThumb: string;
    userId: string;
    attemptTime: string;
    attemptLines: string;
    attemptPercentage: string;
    userTier: string;
    success: boolean;
    backgroundName: string | null;
    backgroundPalette: string | null;
    backgroundRender: boolean | null;
}

export default function AttemptsCard(props: IProps) {
    const [isSuccess, setIsSuccess] = React.useState(props.success);

    return (
        <StyledCard
            sx={{
                width: props.width,
                height: props.height,
            }}
        >
            <CardContent
                sx={{
                    margin: "0 !important",
                    padding: "0.5rem !important",
                    "&:last-child": {
                        paddingBottom: "0.5rem !important",
                    },
                }}
            >
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={4} container alignItems="center">
                        <UserIcon
                            userTier={props.userTier}
                            userThumb={props.userThumb}
                            userId={props.userId}
                            backgroundName={props.backgroundName}
                            backgroundPalette={props.backgroundPalette}
                            backgroundRender={props.backgroundRender}
                            size={30}
                        />
                        <UserName>{props.attemptUser}</UserName>
                    </Grid>
                    <Grid item xs={4} container alignItems="center" justifyContent="center">
                        <TimeText>{props.attemptTime.split("T")[0]}</TimeText>
                    </Grid>
                    <Grid item xs={4} container alignItems="center" justifyContent="flex-end">
                        {isSuccess ? (
                            <Tooltip title={"Successful Attempt!"}>
                                <SuccessIcon />
                            </Tooltip>
                        ) : (
                            <Tooltip title={"Attempt In Progress"}>
                                <InProgressIcon />
                            </Tooltip>
                        )}
                    </Grid>
                </Grid>
            </CardContent>
        </StyledCard>
    );
}

AttemptsCard.defaultProps = {
    width: 700,
    height: 70,
    userId: "0",
    attemptUser: "",
    userThumb: "",
    attemptTime: "",
    attemptLines: "",
    attemptPercentage: "",
    userTier: "",
};
