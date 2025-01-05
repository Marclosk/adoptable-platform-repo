import axios from "axios";
import Cookies from "js-cookie";

const API_URL_session = "http://localhost:8000/users/check_session/";

export const checkSession = async () => {
  try {
    const response = await axios.get(API_URL_session);
    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
    Cookies.remove("sessionid");
    Cookies.remove("csrftoken");
    console.log("Tokens eliminados");
    return false;
  }
};
