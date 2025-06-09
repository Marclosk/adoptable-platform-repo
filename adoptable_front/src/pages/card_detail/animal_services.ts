import axios from 'axios';
import type { Dog } from '../../pages/dashboard';
import { getCSRFToken, getProfile } from '../profile/user_services';

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
});

export interface AdoptionRequest {
  id: number;
  user: { id: number; username: string };
  created_at: string;
  form_data: {
    full_name: string;
    address: string;
    phone: string;
    email: string;
    reason: string;
    experience: string;
    has_other_pets: boolean;
    other_pet_types: string;
    references: string;
  };
}

export interface ProtectoraAnimal {
  id: number;
  name: string;
  pending_requests: number;
}

export interface ProtectoraAdoptedAnimal extends ProtectoraAnimal {
  adopter_username: string;
}

export interface ProtectoraMetrics {
  total_animals: number;
  pending_requests: number;
  completed_adoptions: number;
}

export interface MonthlyAdoption {
  month: string;
  count: number;
}

export interface TopRequested {
  name: string;
  count: number;
}

export interface AdoptionFormData {
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

export const getAllAnimals = async (): Promise<Dog[]> => {
  try {
    const response = await api.get<Dog[]>('api/animals/');
    return response.data;
  } catch (error: unknown) {
    console.error('Error al obtener todos los animales:', error);
    throw error;
  }
};

export const getAnimals = async (
  distance: number,
  userLat: number,
  userLng: number
): Promise<Dog[]> => {
  try {
    const response = await api.get<Dog[]>(
      `api/animals/?distance=${distance}&user_lat=${userLat}&user_lng=${userLng}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error al obtener los animales con geolocalización:', error);
    throw error;
  }
};

export const getAnimalById = async (id: number): Promise<Dog> => {
  try {
    const response = await api.get<Dog>(`api/animals/${id}/`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error al obtener el animal:', error);
    throw error;
  }
};

export const addAnimal = async (data: FormData): Promise<Dog> => {
  try {
    const response = await api.post<Dog>('api/animals/', data, {
      headers: { 'X-CSRFToken': getCSRFToken() },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;
      console.error(
        'Error al crear animal:',
        axiosError.response?.status,
        axiosError.response?.data
      );
      let message = 'Error al crear el animal';
      const responseData = axiosError.response?.data;
      if (responseData && typeof responseData === 'object') {
        message = Object.entries(responseData)
          .map(
            ([field, msgs]) =>
              `${field}: ${
                Array.isArray(msgs) ? msgs.join(', ') : String(msgs)
              }`
          )
          .join('. ');
      } else if (axiosError.response?.status === 500) {
        message = 'Error interno del servidor';
      } else if (typeof responseData === 'string') {
        message = responseData;
      }
      throw new Error(message);
    }
    console.error('Error no Axios al crear el animal:', error);
    throw error;
  }
};

export const deleteAnimal = async (id: number): Promise<void> => {
  await api.delete(`api/animals/${id}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  });
};

export const adoptAnimal = async (
  id: number,
  adopterId: number
): Promise<Dog> => {
  const resp = await api.patch<Dog>(
    `api/animals/${id}/`,
    { adopter: adopterId },
    { headers: { 'X-CSRFToken': getCSRFToken() } }
  );
  return resp.data;
};

export const unadoptAnimal = async (id: number): Promise<Dog> => {
  const resp = await api.patch<Dog>(
    `api/animals/${id}/`,
    { adopter: null },
    {
      headers: {
        'X-CSRFToken': getCSRFToken(),
      },
    }
  );
  return resp.data;
};

export const addFavorite = async (animalId: number): Promise<void> => {
  await api.post(
    `users/favorites/${animalId}/`,
    {},
    { headers: { 'X-CSRFToken': getCSRFToken() } }
  );
};

export const removeFavorite = async (animalId: number): Promise<void> => {
  await api.delete(`users/favorites/${animalId}/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  });
};

export const getMyAdoptionRequests = async (): Promise<AdoptionRequest[]> => {
  try {
    const profile = (await getProfile()) as { requests?: AdoptionRequest[] };
    return profile.requests || [];
  } catch (error: unknown) {
    console.error('Error al obtener mis solicitudes:', error);
    throw error;
  }
};

export const requestAdoption = async (
  animalId: number,
  formData: AdoptionFormData
): Promise<AdoptionRequest> => {
  const payload = { adoption_form: formData };
  const resp = await api.post<AdoptionRequest>(
    `api/animals/${animalId}/request/`,
    payload,
    {
      headers: {
        'X-CSRFToken': getCSRFToken(),
        'Content-Type': 'application/json',
      },
    }
  );
  return resp.data;
};

export const cancelAdoptionRequest = async (
  requestId: number
): Promise<void> => {
  await api.delete(`users/animals/request/${requestId}/delete/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  });
};

export const cancelAdoptionRequestForUser = async (
  animalId: number,
  username: string
): Promise<void> => {
  await api.delete(`api/animals/${animalId}/requests/${username}/delete/`, {
    headers: { 'X-CSRFToken': getCSRFToken() },
  });
};

export const listAdoptionRequestsForAnimal = async (
  animalId: number
): Promise<AdoptionRequest[]> => {
  try {
    const resp = await api.get<AdoptionRequest[]>(
      `api/animals/${animalId}/requests/`
    );
    return resp.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Error listando solicitudes para animal ${animalId}:`,
        error.response?.status,
        error.response?.data
      );
    } else {
      console.error(
        `Error inesperado listando solicitudes para animal ${animalId}:`,
        error
      );
    }
    throw error;
  }
};

export const getProtectoraAnimals = async (): Promise<ProtectoraAnimal[]> => {
  const resp = await api.get<ProtectoraAnimal[]>(
    'api/animals/protectora/animals/',
    { headers: { 'X-CSRFToken': getCSRFToken() } }
  );
  return resp.data;
};

export const getProtectoraAdoptedAnimals = async (): Promise<
  ProtectoraAdoptedAnimal[]
> => {
  const resp = await api.get<ProtectoraAdoptedAnimal[]>(
    'api/animals/protectora/adopted/',
    { headers: { 'X-CSRFToken': getCSRFToken() } }
  );
  return resp.data;
};

export const getProtectoraMetrics = async (): Promise<ProtectoraMetrics> => {
  const resp = await api.get<ProtectoraMetrics>(
    'api/animals/protectora/metrics/',
    { headers: { 'X-CSRFToken': getCSRFToken() } }
  );
  return resp.data;
};

export const getMonthlyAdoptions = async (): Promise<MonthlyAdoption[]> => {
  const resp = await api.get<MonthlyAdoption[]>(
    'api/animals/protectora/monthly-adoptions/',
    { headers: { 'X-CSRFToken': getCSRFToken() } }
  );
  return resp.data;
};

export const getTopRequestedAnimals = async (): Promise<TopRequested[]> => {
  const resp = await api.get<TopRequested[]>(
    'api/animals/protectora/top-requested/',
    { headers: { 'X-CSRFToken': getCSRFToken() } }
  );
  return resp.data;
};
