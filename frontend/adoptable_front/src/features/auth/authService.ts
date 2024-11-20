import axios from "axios";

const API_URL_login = "https://api.example.com/login";
const API_URL_register = "https://api.example.com/register";

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
    return response.data;
  } catch (error) {
    throw new Error("Error de autenticación");
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
