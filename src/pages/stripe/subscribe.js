import {loadStripe} from '@stripe/stripe-js';
import {Button} from "@mui/material";
import config from "../../config";

export default function Subscribe() {
  //look into adding metadata here
  const handleClick = async e => {
    const stripe = await loadStripe(config.stripePubKey)
    const {error} = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: 'price_1NUvPrKRClXv1ERH7DzdSyge',
          quantity: 1
        }],
      mode: 'subscription',
      successUrl: `www.gigo.dev/success`,
      cancelUrl: `www.gigo.dev/cancel`,
    })
  }

  return (
    <Button onClick={handleClick}  style={{width: "75%", height: "30%", fontFamily: "Poppins"}} variant={"contained"}>Get Access </Button>

  )
}