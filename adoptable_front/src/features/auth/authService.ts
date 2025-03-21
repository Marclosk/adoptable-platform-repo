import axios from "axios";
import { getCSRFToken } from "./session/token";

axios.defaults.withCredentials = true;

const API_URL_login = "http://localhost:8000/users/login/";
const API_URL_register = "http://localhost:8000/users/register/";
const API_URL_logout = "http://localhost:8000/users/logout/";

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string; 
  localidad?: string; 
}


export const login = async ({ username, password }: { username: string; password: string }) => {
  try {
    const response = await axios.post(API_URL_login, { username, password });

    console.log("✅ Respuesta del servidor:", response.data);

    return response.data; 
  } catch (error: any) {
    console.error("❌ Error en login:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Error en el servidor");
  }
};

export const logout = async () => {
  try {
    const csrfToken = getCSRFToken();

    const response = await axios.post(
      API_URL_logout,
      {},
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      }
    );

    console.log(response.data.message);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error al cerrar sesión:",
        error.response?.data || error.message
      );
    } else {
      console.error("Error al cerrar sesión:", error);
    }
  }
};

export const register = async ({
  username,
  email,
  password,
  first_name,
  last_name,
  role,
  localidad,
}: RegisterCredentials) => {
  try {
    const response = await axios.post(API_URL_register, {
      username,
      email,
      password,
      first_name,
      last_name,
      role, 
      localidad,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Si el backend envía error en 'detail'
      const serverMessage = error.response.data?.detail || "Error en el servidor";
      throw new Error(serverMessage);
    } else {
      throw new Error("Error desconocido");
    }
  }
};