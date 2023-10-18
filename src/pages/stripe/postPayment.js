import {loadStripe} from '@stripe/stripe-js';
import call from "../../services/api-call";
import config from "../../config";
import swal from "sweetalert";
import {Button} from "@mui/material";

export default function PostPayment(postId) {
  const handleClick = async e => {
    const stripe = await loadStripe("pk_live_51MMbN1KRClXv1ERHBolgHPr1HP16jGDThpzsF3UY9TLkyFyaAeqRkLJb1UomdND8ODZrRwaCze7GlFrwiTVGECdO00y4HGWCtj")
    let res = await call(
      "/api/stripe/getPriceId",
      "post",
      null,
      null,
      null,
      {post_id: postId},
      null,
      config.rootPath
    );

    if (res !== undefined && res["priceId"] !== undefined) {
      let price_id = res["priceId"]
      const {error} = await stripe.redirectToCheckout({
        lineItems: [
          {
            price: price_id,
            quantity: 1
          }],
        mode: 'subscription',
        successUrl: `http://localhost:3001/success`,
        cancelUrl: `http://localhost:3001/cancel`,
      })
    } else {
      swal("There was an issue getting the pricing info for this project.")
    }
  }

  return (
    <Button onClick={handleClick}  style={{width: "75%", height: "30%", fontFamily: "Poppins"}} variant={"contained"}>Get Access </Button>
  )
}