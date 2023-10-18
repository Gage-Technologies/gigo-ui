import React from 'react';
import {Grid, Typography} from "@material-ui/core";
import {useStateValue} from "./StateContext";

const ThankYouPage = () => {

  const [{formValues}, dispatch] = useStateValue();

  return <>
    <Grid container item xs={12} sm={9} alignItems={"center"} style={{width: "40vw"}}>
      <Typography variant="h2">Thank You</Typography>
    </Grid>
  </>
}

export default ThankYouPage;