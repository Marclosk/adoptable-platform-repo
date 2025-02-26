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


    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      Cookies.remove("sessionid");
      Cookies.remove("csrftoken");
      console.log("Tokens eliminados debido a sesión no válida.");
    }

    return false;
  }
};
