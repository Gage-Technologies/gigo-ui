import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Box, Button, Grid, MuiThemeProvider, Step, StepLabel, Stepper,} from '@material-ui/core';
import StepperIcons from "./StepIcons";
import StepConnector from './StepConnector'
import ContactForm from "./ContactForm";
import PaymentForm from "./PaymentForm";
import {createTheme} from "@mui/material";
import {getAllTokens} from "../../theme";
import ThankYouPage from "./ThankYouPage";

const style = makeStyles(theme => ({
  button: {
    marginRight: theme.spacing(1),
  },
  mainBox: {
    position: "relative",
    marginTop: "-8px",
    padding: "10px 20px",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
    background: "theme.palette.background.default"
  },
  stepper: {
    height: "calc(10vh - 40px)",
    minHeight: "55px",
    color: "black"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    width: "100%"
  },
}));

const StepContent = ({step}) => {
  switch (step) {
    case 0:
      return <ContactForm/>;
    case 1:
      return <PaymentForm/>;
    case 2:
      return <ThankYouPage/>;
    default:
      return <></>;
  }
}

const Steppers = () => {
  const [activeStep, setActiveStep] = useState(0);
  const classes = style();

  const handleNext = () => setActiveStep(prevActiveStep => prevActiveStep + 1);
  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);
  const handleReset = () => setActiveStep(2);

  let userPref = localStorage.getItem('theme')
  const [mode, _] = React.useState(userPref === 'light' ? 'light' : 'dark');
  const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

  return <>
    <MuiThemeProvider theme={theme}>
      <Stepper alternativeLabel className={classes.stepper} connector={<StepConnector/>} activeStep={activeStep}>
        {[1, 2, 3].map(e =>
          <Step key={e}>
            <StepLabel StepIconComponent={StepperIcons}/>
          </Step>
        )}
      </Stepper>
      <Box className={classes.mainBox}>
        <Grid
          container
          spacing={3}
          direction="column"
          justify="space-around"
          alignItems="center"
          style={{height: "400px"}}
        >
          {activeStep === 3
            ?
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
            :
            <form className={classes.form} onSubmit={e => {
              e.preventDefault();
              handleNext()
            }}>
              <Grid container spacing={3}>
                <StepContent step={activeStep}/>
                {/* <StepContent step={activeStep} /> */}
                <Grid container item justify="flex-end">
                  {activeStep === 2 ? (
                    <div/>
                  ) : (
                    <div>
                      <Button disabled={activeStep === 0} className={classes.button} onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        type="submit"
                      >
                        {activeStep === 1 ? 'Pay' : 'Next'}
                      </Button>
                    </div>
                  )}
                </Grid>
              </Grid>
            </form>
          }
        </Grid>
      </Box>
    </MuiThemeProvider>
  </>
}

export default Steppers;