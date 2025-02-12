import axios from "axios";
import Cookies from "js-cookie";

const API_URL_session = "http://localhost:8000/users/check_session/";

export const checkSession = async () => {
  try {
    const response = await axios.get(API_URL_session);
    if (response.status === 200) {
      return true;  // Si la sesión es válida, devuelve true.
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error);

    // Si el error es un 401 Unauthorized, eliminamos las cookies.
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      Cookies.remove("sessionid");
      Cookies.remove("csrftoken");
      console.log("Tokens eliminados debido a sesión no válida.");
    }

    return false;  // Si ocurre un error o la sesión no es válida, retorna false.
  }
};
