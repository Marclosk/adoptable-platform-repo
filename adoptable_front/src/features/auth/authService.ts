import axios from 'axios';
import { getCSRFToken } from './session/token';

axios.defaults.withCredentials = true;

const API_URL_login = '/users/login/';
const API_URL_register = '/users/register/';
const API_URL_logout = '/users/logout/';

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
    is_superuser: boolean;
  };
  role: 'adoptante' | 'protectora';
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  localidad?: string;
  shelter_name?: string;
}

export const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(API_URL_login, {
      username,
      password,
    });
    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error en login:', error.response?.data);
      throw error;
    }
    console.error('❌ Error inesperado en login:', error);
    throw error;
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
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
      }
    );
    console.log(response.data.message);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Error al cerrar sesión:',
        error.response?.data || error.message
      );
    } else {
      console.error('Error al cerrar sesión:', error);
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
  shelter_name,
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
      shelter_name,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      const firstError =
        typeof data === 'object'
          ? Object.values(data)[0]
          : error.response?.data?.detail;
      throw new Error(
        Array.isArray(firstError)
          ? firstError[0]
          : firstError || 'Error desconocido'
      );
    } else {
      throw new Error('Error desconocido');
    }
  }
};
