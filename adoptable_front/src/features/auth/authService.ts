import axios from "axios";

const API_URL_login = "http://localhost:8000/users/login/";
const API_URL_register = "http://localhost:8000/users/register/";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

export const login = async ({ email, password }: LoginCredentials) => {
  try {
    const response = await axios.post(API_URL_login, { email, password });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    return { user };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail || "Error de autenticación");
    } else {
      throw new Error("Error de autenticación");
    }
  }
};

export const register = async ({ email, password }: RegisterCredentials) => {
  try {
    const response = await axios.post(API_URL_register, { email, password });
    return response.data;
  } catch (error) {
    throw new Error("Error en el registro");
  }
};
