// src/pages/card_detail/animal_services.ts
import axios from "axios";
import type { Dog } from "../../pages/dashboard";
import { getCSRFToken } from "../profile/user_services";

const api = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true, // para enviar siempre la cookie de sesión
});

// Si la geolocalización falla, pedimos todos los animales
export const getAllAnimals = async (): Promise<any[]> => {
  try {
    const response = await api.get("api/animals/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener todos los animales:", error);
    throw error;
  }
};

// Cuando sí tenemos lat, lng y distancia
export const getAnimals = async (
  distance: number,
  userLat: number,
  userLng: number
): Promise<any[]> => {
  try {
    const response = await api.get(
      `api/animals/?distance=${distance}&user_lat=${userLat}&user_lng=${userLng}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener los animales con geolocalización:", error);
    throw error;
  }
};

// Obtener un animal específico
export const getAnimalById = async (id: number) => {
  try {
    const response = await api.get(`api/animals/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el animal:", error);
    throw error;
  }
};

export const addAnimal = async (data: FormData): Promise<Dog> => {
  try {
    const response = await api.post<Dog>("api/animals/", data, {
      headers: {
        // NO ponemos Content-Type a mano
        "X-CSRFToken": getCSRFToken(),
      },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    const payload = error.response?.data;
    console.error("Error al crear animal:", status, payload);

    let message = "Error al crear el animal";
    if (status === 400 && typeof payload === "object") {
      // Validaciones del servidor en JSON
      message = Object.entries(payload)
        .map(
          ([field, msgs]) =>
            `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
        )
        .join(". ");
    } else if (status === 500) {
      // Error interno
      message = "Error interno del servidor";
    } else if (typeof payload === "string") {
      // fallback a texto plano (p. ej. HTML)
      message = payload;
    }

    // Lancemos un Error con el mensaje ya formateado
    throw new Error(message);
  }
};

export const deleteAnimal = async (id: number): Promise<void> => {
  await api.delete(`api/animals/${id}/`, {
    headers: { "X-CSRFToken": getCSRFToken() },
  });
};

export const getAdopters = async (): Promise<
  { id: number; username: string }[]
> => {
  try {
    const response = await api.get("users/adopters/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener adoptantes:", error);
    throw error;
  }
};

export const adoptAnimal = async (id: number, adopterId: number) => {
  const response = await api.patch(
    `api/animals/${id}/`,
    { adopter: adopterId },
    { headers: { "X-CSRFToken": getCSRFToken() } }
  );
  return response.data;
};

export const unadoptAnimal = async (id: number) => {
  try {
    const response = await api.patch(
      `api/animals/${id}/`,
      { adopter: null },
      { headers: { "X-CSRFToken": getCSRFToken() } }
    );
    return response.data;
  } catch (error) {
    console.error("Error al desadoptar animal:", error);
    throw error;
  }
};
