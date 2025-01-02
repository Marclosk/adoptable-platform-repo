import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL_login = "http://localhost:8000/users/login/";
const API_URL_register = "http://localhost:8000/users/register/";
const API_URL_logout =  "http://localhost:8000/users/logout/";

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

// Función para obtener el token CSRF desde las cookies
const getCSRFToken = () => {
  const csrfToken = document.cookie.split(';')
    .find(cookie => cookie.trim().startsWith('csrftoken='))
    ?.split('=')[1];
  return csrfToken;
};

export const logout = async () => {
  try {
    const csrfToken = getCSRFToken();  // Obtener el token CSRF desde la cookie

    // Hacer la solicitud de logout incluyendo el token CSRF en las cabeceras
    const response = await axios.post(
      API_URL_logout,
      {},
      {
        headers: {
          "X-CSRFToken": csrfToken, // Incluir el token CSRF en la cabecera
        },
        withCredentials: true,  // Asegurar que se envíen las cookies de sesión
      }
    );

    console.log(response.data.message);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error al cerrar sesión:", error.response?.data || error.message);
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
