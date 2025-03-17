// animal_services.tsx
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/", // Ajusta la URL si usas otra base
});

// Obtener animales filtrados por distancia y coordenadas del usuario
export const getAnimals = async (distance: number, userLat: number, userLng: number) => {
  try {
    // Ejemplo: /animals/?distance=30&user_lat=41.40338&user_lng=2.17403
    const response = await api.get(
      `animals/?distance=${distance}&user_lat=${userLat}&user_lng=${userLng}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener los animales:", error);
    throw error;
  }
};

// Obtener un animal específico por su ID
export const getAnimalById = async (id: number) => {
  try {
    const response = await api.get(`animals/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el animal:", error);
    throw error;
  }
};
