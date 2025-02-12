import axios from "axios";

// Configuración base para Axios
const api = axios.create({
  baseURL: "http://localhost:8000/api/", // Cambia la URL si usas otra base para tu API
});

// Obtener todos los animales
export const getAnimals = async () => {
  try {
    const response = await api.get("animals/");
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
