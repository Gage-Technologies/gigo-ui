/* This file renders a page that informs the user that mobile is not supported yet */

import React from "react"
import {
    createTheme,
    CssBaseline,
    ThemeProvider,
} from "@mui/material";
import loginImg from "../img/login/login_background_mobile2.png"
import logo from "../img/fullLogo.png"

import {GoogleReCaptcha, GoogleReCaptchaProvider} from 'react-google-recaptcha-v3';


import {getAllTokens} from "../theme";
import call from "../services/api-call";
import config from "../config";
import swal from "sweetalert";
import {useNavigate} from "react-router-dom";
import {DefaultTutorialState, initialAuthStateUpdate, updateAuthState} from "../reducers/auth/auth";


type BackgroundImageProps = {
    imageUrl: string;
    children?: React.ReactNode; // Include the children prop
};

const BackgroundImage: React.FC<BackgroundImageProps> = ({imageUrl, children}) => {
    const containerStyle: React.CSSProperties = {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        width: '100vw', // Use viewport width to cover the entire width
        position: 'fixed', // Use fixed positioning
        top: 0, // Align to the top
        left: 0, // Align to the left
        margin: 0, // Ensure no margin
        padding: 0, // Ensure no padding
    };

    return (
        <div style={containerStyle}>
            {children}
        </div>
    );
};


interface CaptchaProps {
    setIsCaptchaVerified: (verified: boolean) => void;
    redirectOnFailure?: () => void;
}

const CaptchaPage: React.FC<CaptchaProps> = ({setIsCaptchaVerified, redirectOnFailure}) => {
    let navigate = useNavigate();
    const theme = React.useMemo(() => createTheme(getAllTokens("dark")), ["dark"]);
    const [refreshReCaptcha, setRefreshReCaptcha] = React.useState(false);

    const doSomething = () => {
        /* do something like submit a form and then refresh recaptcha */
        setRefreshReCaptcha(r => !r);
    }


    const containerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
    };

    const glassStyle: React.CSSProperties = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '30px',
        borderRadius: '20px',
        width: '60%',
        maxWidth: '500px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#ffffff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const logoStyle: React.CSSProperties = {
        position: 'absolute', // Absolute positioning
        top: '20px', // Distance from the top
        right: '20px', // Distance from the right
        width: '100px', // You can adjust the width as needed
    };

    const handleVerificationSuccess = async (token: any) => {

        let res = await call(
            "/api/verifyRecaptcha",
            "post",
            null,
            null,
            null,
            //@ts-ignore
            {
                "captcha_response": token,
            },
            null,
            config.rootPath
        )

        if (res["message"] !== "Captcha successfully verified" && res["success"] !== true) {
            swal("You look like a bot...", "Maybe try to be a bit less robotic!", "error").then(() => {
                if (redirectOnFailure) {
                    redirectOnFailure()
                    return
                }
                navigate("/login")
            })

        } else {
            console.log(res);
            setIsCaptchaVerified(true);
        }

        if (res === undefined) {
            if (sessionStorage.getItem("alive") === null)
                //@ts-ignore
                swal(
                    "Server Error",
                    "We are unable to connect with the GIGO servers at this time. We're sorry for the inconvenience!"
                );
            return;
        }


        // fetch('/verify-captcha', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({token}),
        // });
        //
        // console.log('Verification successful!: ', token);
    };


    return (
        <GoogleReCaptchaProvider
            reCaptchaKey="6LdUQpAoAAAAALcG2C2c40c_7USQFbaPxUvvHkjh"
            language="[optional_language]"
            useRecaptchaNet={true}
            useEnterprise={false}
            scriptProps={{
                async: true, // optional, default to false,
                defer: false, // optional, default to false
                appendTo: 'head', // optional, default to "head", can be "head" or "body",
                nonce: undefined // optional, default undefined
            }}
            container={{ // optional to render inside custom element
                element: "[required_id_or_htmlelement]",
                parameters: {
                    badge: undefined, // optional, default undefined
                    theme: 'dark', // optional, default undefined
                }
            }}
        >
            <GoogleReCaptcha
                onVerify={handleVerificationSuccess}
                refreshReCaptcha={refreshReCaptcha}
            />
        </GoogleReCaptchaProvider>

    );
}


export default CaptchaPage;