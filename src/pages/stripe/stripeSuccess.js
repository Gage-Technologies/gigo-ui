import {useNavigate} from "react-router-dom";
import {Button} from "@mui/material";
import loginImg from "../../img/login/login_background.png";

export default function StripeSuccess() {
  let navigate = useNavigate();

  return (
    <div style={{
      backgroundColor: "black",
      backgroundImage: `url(${loginImg})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      // width: '100vw',
      // height: '100vh',
      overflowX: "hidden",
      msOverflowX: "hidden"
    }}>
      <div style={{ display: "flex", width: "98vw", justifyContent: "center", height: "98vh", alignItems: "center", overflow: "hidden", flexDirection: "column"}}>
        <h1 style={{fontFamily: "poppins", color: "white", textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000"}}>Payment Success!</h1>
        <div>
          <Button href={"/home"} variant={"contained"}> Take Me Home </Button>
        </div>
      </div>
    </div>
  )
}