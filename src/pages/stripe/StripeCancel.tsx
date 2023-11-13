import {useNavigate} from "react-router-dom";
import {Button} from "@mui/material";
import goodbyeGorilla from "../../img/goodbye_gorilla.png"
import {useAppSelector, useAppDispatch} from "../../app/hooks";

export default function StripeCancel() {

    const RedirectToHome = () => {
        window.location.href = "/home";
    }

    return (
        <div style={{
            backgroundColor: "black",
            backgroundImage: `url(${goodbyeGorilla})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            // width: '100vw',
            // height: '100vh',
            overflowX: "hidden",
            msOverflowX: "hidden"
        }}>
            <div style={{ display: "flex", width: "98vw", justifyContent: "center", height: "98vh", alignItems: "center", overflow: "hidden", flexDirection: "column"}}>
                <div>
                    <Button onClick={() => RedirectToHome()} variant={"contained"}> Take Me Home </Button>
                </div>
            </div>
        </div>
    )
}