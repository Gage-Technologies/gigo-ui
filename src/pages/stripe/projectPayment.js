import {loadStripe} from '@stripe/stripe-js';
import {Button} from "@mui/material";
import call from "../../services/api-call";
import config from "../../config";

export default function ProjectPayment(props) {
  //look into adding metadata here
  const handleClick = async e => {
    let res = await call(
      "/api/stripe/stripeCheckoutSession",
      "POST",
      null,
      null,
      null,
      // @ts-ignore
      {
        priceId: props.price,
        postId: props.post
      },
      null,
      config.rootPath
    )

    if (res !== undefined && res["return_url"] !== undefined){
      window.location.replace(res["return_url"])
    }
  }

  return (
    <Button onClick={handleClick}  style={{width: "75%", height: "30%", fontFamily: "Poppins"}} variant={"contained"}>Purchase </Button>

  )
}