import axios from "axios";
import { getSession } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

//generic helper that calls the backend api with auth
export async function backendRequest(path, method = "GET", body) {

  //gets the current user session to get the jwt token, if no session it throws an error and stops the request  
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  //makes an http request to teh backend api with the jwt token in the auth header using axios
  const res = await axios({
    url: `${API_BASE}${path}`,
    method,
    data: body, //ie the request body for POST or PUT requests
    headers: {

      //sends the jwt token as a bearer token so the backend can verify the user  
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  //returns only the respone data, not the whole axios response object
  return res.data;
}
