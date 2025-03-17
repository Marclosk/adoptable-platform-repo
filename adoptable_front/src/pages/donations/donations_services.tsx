import axios from "axios";

const API_URL = "http://localhost:8000/api/donations/";

// donations_services.tsx
export interface Donation {
    id?: number;      // Si en tu modelo existe un id, añádelo
    usuario: string;
    cantidad: number;
    fecha: string;    // El backend devuelve "fecha"
  }  

/**
 * Obtiene la lista de donaciones desde la API.
 */
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

/**
 * Envía una donación a la API.
 * @param donationAmount - Monto de la donación.
 * @param token - Token de autorización.
 */
export const donate = async (
  donationAmount: number,
  token: string
): Promise<Donation> => {
  try {
    const response = await axios.post(
      `${API_URL}add/`,
      { cantidad: donationAmount }, // Cambiado "amount" por "cantidad"
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

/**
 * Obtiene el token CSRF desde las cookies.
 */
export const getCSRFToken = (): string => {
  const csrfCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));
  return csrfCookie ? csrfCookie.split("=")[1] : "";
};
