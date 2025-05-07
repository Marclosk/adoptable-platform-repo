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
