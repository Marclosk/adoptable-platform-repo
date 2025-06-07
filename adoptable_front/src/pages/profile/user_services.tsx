// src/pages/profile/user_services.ts

import axios from 'axios';

const API_URL = 'http://localhost:8000/users';

export interface Profile {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

export const fetchCSRFToken = async (): Promise<void> => {
  try {
    const response = await axios.get('http://localhost:8000/csrf-token/', {
      withCredentials: true,
    });
    document.cookie = `csrftoken=${response.data.csrfToken}; path=/`;
  } catch (error: unknown) {
    console.error('Error obteniendo el CSRF token:', error);
  }
};

export const getCSRFToken = (): string => {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
};

export const getProfile = async (): Promise<Profile> => {
  try {
    const response = await axios.get(`${API_URL}/profile/`, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCSRFToken(),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error obteniendo el perfil:', error.response?.data);
    } else if (error instanceof Error) {
      console.error('Error obteniendo el perfil:', error.message);
    } else {
      console.error('Error obteniendo el perfil:', error);
    }
    throw error;
  }
};

export const updateProfile = async (
  profileData: FormData
): Promise<unknown> => {
  try {
    const response = await axios.put(
      `${API_URL}/profile/update/`,
      profileData,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error actualizando el perfil:', error.response?.data);
    } else if (error instanceof Error) {
      console.error('Error actualizando el perfil:', error.message);
    } else {
      console.error('Error actualizando el perfil:', error);
    }
    throw error;
  }
};

/** ——— Formulario general de adopción ——— **/

export interface AdoptionFormAPI {
  full_name: string;
  address: string;
  phone: string;
  email: string;
  reason: string;
  experience: string;
  has_other_pets: boolean;
  other_pet_types: string;
  references: string;
}

/**
 * Recupera el formulario de adopción completo (todos los campos)
 */
export const getAdoptionForm = async (): Promise<AdoptionFormAPI> => {
  try {
    const response = await axios.get<{
      adoption_form: AdoptionFormAPI;
    }>(`${API_URL}/profile/adoption-form/`, {
      withCredentials: true,
      headers: { 'X-CSRFToken': getCSRFToken() },
    });
    return response.data.adoption_form;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Error obteniendo formulario de adopción:',
        error.response?.data
      );
    } else if (error instanceof Error) {
      console.error('Error obteniendo formulario de adopción:', error.message);
    } else {
      console.error('Error obteniendo formulario de adopción:', error);
    }
    throw error;
  }
};

/**
 * Envía o crea el formulario de adopción del usuario,
 * incluyendo todos los campos en JSON.
 */
export const submitAdoptionForm = async (
  formData: AdoptionFormAPI
): Promise<AdoptionFormAPI> => {
  const payload = { adoption_form: formData };
  try {
    const response = await axios.post<{
      adoption_form: AdoptionFormAPI;
    }>(`${API_URL}/profile/adoption-form/`, payload, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCSRFToken(),
        'Content-Type': 'application/json',
      },
    });
    return response.data.adoption_form;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Error enviando formulario de adopción:',
        error.response?.data
      );
    } else if (error instanceof Error) {
      console.error('Error enviando formulario de adopción:', error.message);
    } else {
      console.error('Error enviando formulario de adopción:', error);
    }
    throw error;
  }
};

export const getUserProfile = async (userId: number): Promise<unknown> => {
  try {
    const resp = await axios.get(`${API_URL}/${userId}/profile/`);
    return resp.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Error obteniendo perfil de usuario:',
        error.response?.data
      );
    } else if (error instanceof Error) {
      console.error('Error obteniendo perfil de usuario:', error.message);
    } else {
      console.error('Error obteniendo perfil de usuario:', error);
    }
    throw error;
  }
};
