// src/pages/card_detail/animal_services.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Si la geolocalización falla, pedimos todos los animales
export const getAllAnimals = async () => {
  try {
    const response = await api.get("animals/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener todos los animales:", error);
    throw error;
  }
};

// Cuando sí tenemos lat, lng y distancia
export const getAnimals = async (distance: number, userLat: number, userLng: number) => {
  try {
    const response = await api.get(
      `animals/?distance=${distance}&user_lat=${userLat}&user_lng=${userLng}`
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
    const response = await api.get(`animals/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el animal:", error);
    throw error;
  }
};
