import fetch from "isomorphic-fetch";
import { v4 } from "uuid";
import base64ArrayBuffer from "./arrayBufferToBase64";
import config from "../config";
import JSZip from "jszip";
import swal from "sweetalert";
import { Buffer } from "buffer";
import { store } from "../app/store";
import { initialAuthState, updateAuthState } from "../reducers/auth/auth";
import { resetAppWrapper } from "../reducers/appWrapper/appWrapper";
import { clearProjectState } from "../reducers/createProject/createProject";
import { clearSearchParamsState } from "../reducers/searchParams/searchParams";
import { clearJourneyFormState } from "../reducers/journeyForm/journeyForm";
import { clearCache } from "../reducers/pageCache/pageCache";
import { clearChatState } from "../reducers/chat/chat";
import { clearMessageCache } from "../reducers/chat/cache";
import { sleep } from './utils'

function constructAuthorizationHeader(rawUsername, rawPassword) {
  let username = rawUsername.toString("base64");
  let password = rawPassword.toString("base64");
  return "Basic " + new Buffer(username + ":" + password).toString("base64");
}

function constructUrl(url, params) {
  let temp_url = url + "?";
  let len = Object.keys(params).length;
  let i = 0;
  for (let key in params) {
    temp_url = temp_url + key + "=" + params[key];
    if (i < len - 1) {
      temp_url = temp_url + "&";
    }
    i++;
  }
  return temp_url;
}

const clearReducers = async () => {
  let authState = Object.assign({}, initialAuthState)
  // @ts-ignore
  store.dispatch(updateAuthState(authState))

  store.dispatch(resetAppWrapper())
  store.dispatch(clearProjectState())
  store.dispatch(clearSearchParamsState())
  store.dispatch(clearJourneyFormState())
  store.dispatch(clearCache())
  store.dispatch(clearMessageCache())
  store.dispatch(clearChatState())
  console.log("reducers clearead")
}

async function chunkFile(
  file,
  url_extension,
  method_type,
  username,
  password,
  token = null,
  args = null,
  rootPath = config.rootPath,
  completionCallback = null
) {
  console.log("chunker")

  // exit if no file was passed
  if (!file) {
    console.log("exit early: ", file)
    return;
  }

  // create new file reader
  const reader = new FileReader();

  // define chunk size 8MB
  const chunkSize = 8 * 1024 * 1024;

  // save file size
  const fileSize = file.size;

  // calculate the total chunks
  const totalChunks = Math.ceil(fileSize / chunkSize);

  // create variable to hold response object
  let res;

  // define part count
  // eslint-disable-next-line
  let partCount = 1;

  // create variable to hold reader offset
  let offset = 0;

  // create index tracker
  let partIndex = 1;

  // calculate end of file chunk
  let endOffset = Math.min(offset + chunkSize, fileSize);

  // create temporary id for upload session
  const tempFileId = v4();

  // create empty object for arguments if none were passed
  if (args == null) {
    args = {};
  }

  // assign upload parameters to the arguments object
  Object.assign(args, { total_parts: totalChunks, upload_id: tempFileId });

  // specify reader callback to send upload chunks to the server
  reader.onload = async () => {
    console.log("reading chunk")

    // increment the part count
    partCount++;

    // set offset value to the end of the last file chunk
    offset = endOffset;

    // calculate new end offset for this file chunk
    endOffset = Math.min(offset + chunkSize, fileSize);

    // set the part argument to inform the server of which chunk this is
    args["part"] = partIndex;

    // create form with base64 encoded file chunk
    let form = { chunk: base64ArrayBuffer(reader.result) };

    // execute api call with the passed chunk
    res = await apiCall(
      url_extension,
      method_type,
      username,
      password,
      token,
      args,
      form,
      rootPath
    );

    // handle final chunk logic
    if (offset === fileSize) {
      // remove upload flag
      window.localStorage.setItem("upload", JSON.stringify(false));
      window.dispatchEvent(new Event("upload"));

      if (completionCallback === null) {
        // check upload success
        if (res === undefined || !("message" in res)) {
          // notify user of failure
          if (sessionStorage.getItem("alive") === "true")
            swal("File Upload: " + args["name"] + " Failed.");
        } else {
          // notify user of success
          if (sessionStorage.getItem("alive") === "true") swal(res["message"]);
        }
      } else {
        completionCallback(res);
      }

      // exit on completion
      return;
    }

    // increment part index
    partIndex++;

    // execute the reader recursively for the next chunk
    await reader.readAsArrayBuffer(file.slice(offset, endOffset));
  };

  // create callback for reader errors
  reader.onerror = () => {
  };

  console.log("reading start")

  // execute recursive file chunk reader
  await reader.readAsArrayBuffer(file.slice(offset, endOffset));

  // alert user to the upload start
  // if (sessionStorage.getItem("alive") === "true")
  //   swal(
  //     "File Upload Is Starting. You can continue to navigate the site as normal." +
  //     " You will be notified when the upload is complete. Do not close the page if " +
  //     "the loading icon in the top right corner is moving."
  //   );

  // return start message
  return { message: "File Upload Starting" };
}

async function apiCall(
  urlExtension,
  methodType,
  username = null,
  password = null,
  token = null,
  args = null,
  form = null,
  rootPath = config.rootPath,
  completionCall = null
) {
  // create variable to hold header data
  let headers = new Headers({ "Content-Type": "application/json" });
  // create variable to hold body content
  let body = null;

  // handle user credentials if they were passed
  if (username != null) {
    // assemble auth header with credentials
    headers.append(
      "Authorization",
      constructAuthorizationHeader(username, password)
    );
  }

  // handle token if passed
  if (token != null) {
    // fill arguments with empty object if null
    if (args == null) {
      args = {};
    }

    // add token to arguments
    args = Object.assign(args, { tk: token });
  }
  // format arguments if they exist
  if (args != null) {
    // handle all non-get methods
    if (methodType.toLowerCase() !== "get") {
      // load arguments into body
      body = args;
    } else {
      // load arguments into url as query parameters
      urlExtension = constructUrl(urlExtension, args);
    }
  }

  // handle form data
  if (form != null) {
    // fill body with empty object if null
    if (body == null) {
      body = {};
    }

    // add form data to body
    body = Object.assign(body, form);
  }

  // execute api call
  try {
    // call api via fetch
    let res = await fetch(rootPath + urlExtension, {
      // set method
      method: methodType.toUpperCase(),
      // load header is they exist
      headers: headers !== null ? headers : undefined,
      // load body if it exists
      body: body != null ? JSON.stringify(body) : undefined,
      // ensure cookies are included with call
      credentials: "include"
      // agent: sslConfiguredAgent,
    }).then(response => {
      // format response into JSON if the status code was successful (within the 200 block)
      try {
        return response.json()
      } catch (err) {
        console.log("failed to format api response to json: ", err)
        return response.text()
      }
    });

    if (
      res["message"] && 
      (
        res["message"] === "You must be logged in to access the GIGO system." ||
        res["message"] === "logout" ||
        res["message"] === "login"
      )
    ) {
      clearReducers()
      // we have to wait a bit before the redirect so the reducers really clear
      await sleep(100)
      window.location.href = "/login"
      res = {
        "message": "Your session has expired. Please login again!"
      }
    }

    if (completionCall !== undefined && completionCall !== null) {
      completionCall(res);
    }

    // return json response
    return res;
  } catch (e) {
  }
}

export default async function call(
  url_extension,
  method_type,
  username = null,
  password = null,
  token = null,
  args = null,
  file = null,
  rootPath = config.rootPath,
  completionCall = null
) {
  // route file upload to file chunker
  if (file != null) {
    // handle a single file
    if (Array.isArray(file) === true) {
      // create a new zipper object
      let zip = new JSZip();
      // iterate over files adding them to the zip
      for (let i = 0; i < file.length; i++) {
        // add file to zip
        zip.file(file[i].name, file[i]);
      }

      let result = null;

      // execute zip operation and pipe data to file upload
      await zip.generateAsync({ type: "blob" }).then(async function (content) {
        result = await chunkFile(
          content,
          url_extension,
          method_type,
          username,
          password,
          token,
          args,
          rootPath,
          completionCall
        );
      });

      return result;
    } else {
      console.log("calling chunker")
      // execute call via file chunker
      return await chunkFile(
        file,
        url_extension,
        method_type,
        username,
        password,
        token,
        args,
        rootPath,
        completionCall
      );
    }
  }

  // execute traditional api call
  return await apiCall(
    url_extension,
    method_type,
    username,
    password,
    token,
    args,
    null,
    rootPath
  );
}
