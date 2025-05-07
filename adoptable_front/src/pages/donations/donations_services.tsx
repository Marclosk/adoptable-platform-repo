import axios from "axios";

const API_URL = "http://localhost:8000/api/donations/";

export interface Donation {
    id?: number;      
    usuario: string;
    cantidad: number;
    fecha: string;    
  }  


export const fetchDonations = async (): Promise<Donation[]> => {
  try {
    const response = await axios.get(`${API_URL}`, { withCredentials: true });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
};


export const donate = async (
  donationAmount: number,
  token: string
): Promise<Donation> => {
  try {
    const response = await axios.post(
      `${API_URL}add/`,
      { cantidad: donationAmount }, 
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": getCSRFToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al hacer la donación:", error);
    throw error;
  }
};


export const getCSRFToken = (): string => {
  const csrfCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));
  return csrfCookie ? csrfCookie.split("=")[1] : "";
};
