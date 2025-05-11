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

// ————— Animales —————

export const getAllAnimals = async (): Promise<any[]> => {
  const resp = await api.get("api/animals/");
  return resp.data;
};

export const getAnimals = async (
  distance: number,
  userLat: number,
  userLng: number
): Promise<any[]> => {
  const resp = await api.get(
    `api/animals/?distance=${distance}&user_lat=${userLat}&user_lng=${userLng}`
  );
  return resp.data;
};

export const getAnimalById = async (id: number): Promise<any> => {
  const resp = await api.get(`api/animals/${id}/`);
  return resp.data;
};

export const addAnimal = async (data: FormData): Promise<Dog> => {
  const resp = await api.post<Dog>("api/animals/", data, {
    headers: { "X-CSRFToken": getCSRFToken() },
  });
  return resp.data;
};

export const deleteAnimal = async (id: number): Promise<void> => {
  await api.delete(`api/animals/${id}/`, {
    headers: { "X-CSRFToken": getCSRFToken() },
  });
};

export const getAdopters = async (): Promise<
  { id: number; username: string }[]
> => {
  const resp = await api.get("api/users/adopters/");
  return resp.data;
};

export const adoptAnimal = async (id: number, adopterId: number) => {
  const resp = await api.patch(
    `api/animals/${id}/`,
    { adopter: adopterId },
    { headers: { "X-CSRFToken": getCSRFToken() } }
  );
  return resp.data;
};

export const unadoptAnimal = async (id: number) => {
  const resp = await api.patch(
    `api/animals/${id}/`,
    { adopter: null },
    { headers: { "X-CSRFToken": getCSRFToken() } }
  );
  return resp.data;
};

// ————— Favoritos —————

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

// ————— Solicitudes de adopción (Adoptante) —————

export interface AdoptionRequest {
  id: number;
  user: number;
  animal: number;
  created_at: string;
  // si quieres, añade aquí otros campos que tu backend devuelva
}

/**
 * Obtenemos del profile todas las solicitudes que he hecho.
 */
export const getMyAdoptionRequests = async (): Promise<AdoptionRequest[]> => {
  const profile = await getProfile();
  return profile.requests || [];
};

/**
 * Hacemos POST para solicitar adopción.
 * Devuelve el objeto AdoptionRequest creado.
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
 * Cancelamos (DELETE) la solicitud que hice, usando su ID.
 */
export const cancelAdoptionRequest = async (
  requestId: number
): Promise<void> => {
  await api.delete(
    `users/animals/request/${requestId}/delete/`,
    { headers: { "X-CSRFToken": getCSRFToken() } }
  );
};
