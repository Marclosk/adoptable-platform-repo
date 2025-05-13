// src/services/animal_services.ts

import axios from "axios";
import type { Dog } from "../../pages/dashboard";
import {
  fetchCSRFToken,
  getCSRFToken,
  getProfile,
} from "../profile/user_services";

const api = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true,
});

export interface AdoptionRequest {
  id: number;
  user: { id: number; username: string };
  created_at: string;
}

/** ————— Animales ————— **/

export const getAllAnimals = async (): Promise<any[]> => {
  try {
    const response = await api.get("api/animals/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener todos los animales:", error);
    throw error;
  }
};

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

export const getAnimalById = async (id: number): Promise<any> => {
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
      headers: { "X-CSRFToken": getCSRFToken() },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    const payload = error.response?.data;
    console.error("Error al crear animal:", status, payload);

    let message = "Error al crear el animal";
    if (status === 400 && typeof payload === "object") {
      message = Object.entries(payload)
        .map(
          ([field, msgs]) =>
            `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
        )
        .join(". ");
    } else if (status === 500) {
      message = "Error interno del servidor";
    } else if (typeof payload === "string") {
      message = payload;
    }

    throw new Error(message);
  }
};

export const deleteAnimal = async (id: number): Promise<void> => {
  await api.delete(`api/animals/${id}/`, {
    headers: { "X-CSRFToken": getCSRFToken() },
  });
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

/** ————— Favoritos ————— **/

export const addFavorite = async (animalId: number): Promise<void> => {
  await api.post(
    `users/favorites/${animalId}/`,
    {},
    { headers: { "X-CSRFToken": getCSRFToken() } }
  );
};

export const removeFavorite = async (animalId: number): Promise<void> => {
  await api.delete(`users/favorites/${animalId}/`, {
    headers: { "X-CSRFToken": getCSRFToken() },
  });
};

/** ————— Solicitudes de adopción ————— **/

/**
 * Para el perfil de usuario: trae todas las solicitudes que yo he hecho.
 */
export const getMyAdoptionRequests = async (): Promise<AdoptionRequest[]> => {
  try {
    const profile = await getProfile();
    return profile.requests || [];
  } catch (err) {
    console.error("Error al obtener mis solicitudes:", err);
    throw err;
  }
};

/**
 * Creo una nueva solicitud para este animal.
 */
export const requestAdoption = async (
  animalId: number
): Promise<AdoptionRequest> => {
  const resp = await api.post<AdoptionRequest>(
    `api/animals/${animalId}/request/`,
    {},
    { headers: { "X-CSRFToken": getCSRFToken() } }
  );
  return resp.data;
};

/**
 * Cancelo (elimino) una solicitud que ya hice.
 */
export const cancelAdoptionRequest = async (
  requestId: number
): Promise<void> => {
  await api.delete(
    `users/animals/request/${requestId}/delete/`,
    { headers: { "X-CSRFToken": getCSRFToken() } }
  );
};

/**
 * Sólo para protectora: lista las solicitudes de adopción hechas para un animal.
 */
export const listAdoptionRequestsForAnimal = async (
  animalId: number
): Promise<AdoptionRequest[]> => {
  try {
    const resp = await api.get<AdoptionRequest[]>(
      `api/animals/${animalId}/requests/`
    );
    return resp.data;
  } catch (err: any) {
    console.error(
      `Error listando solicitudes para animal ${animalId}:`,
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
};
