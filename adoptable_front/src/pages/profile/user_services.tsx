// src/pages/profile/user_services.ts

import axios from "axios";

const API_URL = "http://localhost:8000/users";

export const fetchCSRFToken = async () => {
  try {
    const response = await axios.get("http://localhost:8000/csrf-token/", {
      withCredentials: true,
    });
    document.cookie = `csrftoken=${response.data.csrfToken}; path=/`;
  } catch (error) {
    console.error("Error obteniendo el CSRF token:", error);
  }
};

export const getCSRFToken = (): string => {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "";
};

export const getProfile = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/profile/`, {
      withCredentials: true,
      headers: {
        "X-CSRFToken": getCSRFToken(),
      },
    });
    console.log("Perfil:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error obteniendo el perfil:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateProfile = async (profileData: FormData): Promise<any> => {
  try {
    const response = await axios.put(
      `${API_URL}/profile/update/`,
      profileData,
      {
        withCredentials: true,
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error actualizando el perfil:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/** ——— Formulario general de adopción ——— **/

export interface AdoptionFormFromAPI {
  full_name: string;
  address: string;
  phone: string;
  email?: string;
  reason: string;
  experience?: string;
  has_other_pets?: boolean;
  other_pet_types?: string;
  references?: string;
}

export const getAdoptionForm = async (): Promise<AdoptionFormFromAPI> => {
  try {
    const response = await axios.get<{
      adoption_form: AdoptionFormFromAPI;
    }>(`${API_URL}/profile/adoption-form/`, {
      withCredentials: true,
      headers: { "X-CSRFToken": getCSRFToken() },
    });
    // ahora devolvemos sólo el objeto adoption_form
    return response.data.adoption_form;
  } catch (error: any) {
    console.error(
      "Error obteniendo formulario de adopción:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Envía o crea el formulario de adopción del usuario
export const submitAdoptionForm = async (
  formData: Record<string, any>
): Promise<any> => {
  // envolvemos los campos en { adoption_form: ... }
  const payload = { adoption_form: formData };

  try {
    const response = await axios.post(
      `${API_URL}/profile/adoption-form/`,
      payload,
      {
        withCredentials: true,
        headers: {
          "X-CSRFToken": getCSRFToken(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error enviando formulario de adopción:",
      error.response?.data || error.message
    );
    throw error;
  }
};
