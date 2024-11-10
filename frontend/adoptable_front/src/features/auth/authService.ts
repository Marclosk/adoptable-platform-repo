import axios from "axios";

const API_URL = "https://api.example.com/login";

interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async ({ email, password }: LoginCredentials) => {
  try {
    const response = await axios.post(API_URL, { email, password });
    return response.data;
  } catch (error) {
    throw new Error("Error de autenticación");
  }
};
