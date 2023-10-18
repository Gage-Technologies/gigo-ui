import {loadStripe} from '@stripe/stripe-js';
import {Button} from "@mui/material";
import call from "../../services/api-call";
import config from "../../config";

export default function ProjectPayment(props) {
  //look into adding metadata here
  const handleClick = async e => {
    // const stripe = await loadStripe("pk_test_51MMbN1KRClXv1ERHUfgxPrT83LS1ufFFAZnKIuDzKdEqtkfawR0AiSM5TlK3X0yEXCrpcCdBvWFx5p4Cpi7iDpNG00tp2HC216")
    // const {error} = await stripe.redirectToCheckout({
    //   lineItems: [
    //     {
    //       price: props.price,
    //       quantity: 1,
    //     }],
    //   mode: 'payment',
    //   successUrl: `https://ui-dev.gigo.dev:3001/success`,
    //   cancelUrl: `https://ui-dev.gigo.dev:3001/cancel`,
    // })
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