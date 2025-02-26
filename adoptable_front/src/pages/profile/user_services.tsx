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

export const getCSRFToken = () => {
  const csrfCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));

  return csrfCookie ? csrfCookie.split("=")[1] : "";
};

export const getProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/users/profile/`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error obteniendo el perfil:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateProfile = async (profileData: any) => {
  try {
    const token = localStorage.getItem("token");
    const csrfToken = getCSRFToken(); 

    console.log("Token en localStorage:", token);
    console.log("CSRF Token:", csrfToken);

    const payload = {
      avatar: profileData.avatar,
      location: profileData.location,
      phone_number: profileData.phone_number,
      bio: profileData.bio,
    };

    const response = await axios.put(`${API_URL}/profile/update/`, payload, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": csrfToken, 
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error actualizando el perfil:",
      error.response?.data || error.message
    );
    throw error;
  }
};

