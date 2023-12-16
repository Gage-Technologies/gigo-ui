import React, { useState } from "react"
import { Box, Typography } from "@mui/material";
import loginImg from "../../img/login/login_background.png";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { TutorialState, initialAuthStateUpdate, selectAuthState, updateAuthState } from "../../reducers/auth/auth";
import call from "../../services/api-call";
import config from "../../config";
import { decodeToken } from "react-jwt";
import { sleep } from "../../services/utils";
import { LoadingButton } from "@mui/lab";
import { themeHelpers } from "../../theme";

export default function StripeSuccessMembership() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuthState);

  const [sessionReloading, setSessionReloading] = useState(false);

  const [failed, setFailed] = useState(false);

  const updateToken = async (): Promise<boolean> => {
    let res = await call(
      "/api/auth/updateToken",
      "post",
      null,
      null,
      null,
      null,
      null,
      config.rootPath
    );

    if (res && res["token"]) {
      let auth: {
        [key: string]: any
      } | null = decodeToken(res["token"]);
      if (!auth) {
        return false;
      }

      if (auth["user_status"] !== 1) {
        return false
      }

      let authState = Object.assign({}, initialAuthStateUpdate)
      authState.authenticated = true
      authState.expiration = auth["exp"]
      authState.id = auth["user"]
      authState.role = auth["user_status"]
      authState.email = auth["email"]
      authState.phone = auth["phone"]
      authState.userName = auth["user_name"]
      authState.thumbnail = auth["thumbnail"]
      authState.backgroundColor = auth["color_palette"]
      authState.backgroundName = auth["name"]
      authState.backgroundRenderInFront = auth["render_in_front"]
      authState.exclusiveContent = auth["exclusive_account"]
      authState.exclusiveAgreement = auth["exclusive_agreement"]
      authState.tutorialState = auth["tutorials"] as TutorialState
      authState.tier = auth["tier"]
      authState.inTrial = auth["in_trial"]
      authState.alreadyCancelled = auth["already_cancelled"]
      authState.hasPaymentInfo = auth["has_payment_info"]
      authState.hasSubscription = auth["has_subscription"]
      authState.lastRefresh = Date.now()
      authState.usedFreeTrial = auth["used_free_trial"]
      dispatch(updateAuthState(authState))

      await sleep(1000)

      return true
    }

    return false
  }

  const loopUntilPro = async () => {
    setSessionReloading(true);
    for (let i = 0; i < 30; i++) {
      if (await updateToken()) {
        setSessionReloading(false);
        return
      }

      await sleep(1000);
    }
    setFailed(true)
    setSessionReloading(false);
  }

  React.useEffect(() => {
    if (authState.role === 1 && authState.lastRefresh && Date.now() - authState.lastRefresh < 3_000)
      return
    loopUntilPro()
  }, [])

  return (
    <Box sx={{
      backgroundColor: "black",
      backgroundImage: `url(${loginImg})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      overflowX: "hidden",
      msOverflowX: "hidden",
      overflowY: "hidden",
      height: "100vh",
      width: "100vw",
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Box
        sx={{
          maxWidth: '800px',
          textAlign: 'center',
          padding: '2rem',
          overflowY: 'hidden',
          borderRadius: "10px",
          ...themeHelpers.frostedGlass
        }}
      >
        {sessionReloading && authState.role !== 1 ? (
          <>
            <Typography variant="h4">
              Thank You For Your Purchase!
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Hold on a minute while we get your new pro status setup.
            </Typography>
          </>
        ) : failed ? (
          <>
            <Typography variant="h4">
              Oops... Something Went Wrong
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }}>
              We haven't been able to validate your payment. Try loggin out and back in.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h4">
              Congratulations!
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }}>
              You're a Pro!
            </Typography>
          </>
        )}
        <LoadingButton
          loading={sessionReloading}
          href="/home"
          variant={"contained"}
        >
          Take Me Home
        </LoadingButton>
      </Box>
    </Box >
  )
}