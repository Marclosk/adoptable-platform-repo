import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL_login = "http://localhost:8000/users/login/";
const API_URL_register = "http://localhost:8000/users/register/";

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export const login = async ({ username, password }: LoginCredentials) => {
  try {
    const response = await axios.post(API_URL_login, { username, password });
    return { response };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail || "Error en el servidor");
    } else {
      throw new Error("Error desconocido");
    }
  }
};

export const register = async ({
  username,
  email,
  password,
  first_name,
  last_name,
}: RegisterCredentials) => {
  try {
    const response = await axios.post(API_URL_register, {
      username,
      email,
      password,
      first_name,
      last_name,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail || "Error en el servidor");
    } else {
      throw new Error("Error desconocido");
    }
  }
};
