import call from "./api-call";
import config from "../config";
import {decodeToken} from "react-jwt";
import swal from "sweetalert";

export async function authorize(username, password) {
  let res = await call(
    "/api/auth/login",
    "post",
    username,
    password,
    null,
    null,
    null,
    config.rootPath
  );

  window.sessionStorage.clear();


  if (res["message"] !== undefined && res["message"].includes("Too many failed attempts")){
    swal("Too many failed login attempts", "Please try again later.");
    return res["message"];
  }

  if (res["message"] !== undefined && res["message"].includes("attempts left")){
    swal("Too many failed login attempts", "Please try again later.");
    return res["message"];
  }

  let decodedToken = decodeToken(res["token"]);
  if (decodedToken === null) {
    return false;
  }

  window.sessionStorage.setItem("user", decodedToken["user"])
  window.sessionStorage.setItem("alive", "true");
  window.sessionStorage.setItem("loginXP", JSON.stringify(res["xp"]));

  return decodedToken;
}

export async function authorizeGithub(password) {

  let res = await call(
    "/api/auth/confirmLoginWithGithub",
    "post",
    null,
    null,
    null,
    // @ts-ignore
    {password: password},
    null,
    config.rootPath
  )

  let decodedToken = decodeToken(res["token"]);
  if (decodedToken === null) {
    return false;
  }

  window.sessionStorage.setItem("user", decodedToken["user"])
  window.sessionStorage.setItem("alive", "true");

  return decodedToken;
}

export async function authorizeGoogle(externalToken, password) {
  let res = await call(
    "/api/auth/loginWithGoogle",
    "post",
    null,
    null,
    null,
    // @ts-ignore
    {external_auth: externalToken, password: password},
    null,
    config.rootPath
  )

  let decodedToken = decodeToken(res["token"]);
  if (decodedToken === null) {
    return false;
  }

  window.sessionStorage.setItem("user", decodedToken["user"])
  window.sessionStorage.setItem("alive", "true");

  return decodedToken;
}

export async function validate2FA(code) {
  if (code.length !== 6 || !/^\d+$/.test(code)) {
    if (sessionStorage.getItem("alive") === "true")
      swal("Invalid 2FA Code", "Please enter a valid 2FA code.");
  }

  let res = await call(
    "/api/otp/validate",
    "post",
    null,
    null,
    null,
    {
      otp_code: code
    },
    null,
    config.rootPath
  );

  let decodedToken = decodeToken(res["token"]);
  if (decodedToken === null) {
    return false;
  }

  window.sessionStorage.setItem("user", decodedToken["user"]);
  window.sessionStorage.setItem("ip", decodedToken["ip"]);
  window.sessionStorage.setItem("expires", decodedToken["exp"]);
  window.sessionStorage.setItem("init_temp", decodedToken["init_temp"]);
  window.sessionStorage.setItem("alive", "true");

  return {
    auth: !(res === undefined || res["auth"] !== true),
    initTemp: false,
    otp: true
  };
}

export async function logout() {
  await call("/api/auth/logout", "post", null, null, null, null, null);
  window.sessionStorage.clear();
}
