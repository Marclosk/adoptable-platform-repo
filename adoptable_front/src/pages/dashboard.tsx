// src/pages/dashboard.tsx
import React, { useEffect, useState } from "react";
import { Box, Center, Spinner, Text } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutSuccess } from "../features/auth/authSlice";
import { logout } from "../features/auth/authService";
import { checkSession } from "../features/auth/session/checkSession";
import Layout from "../components/layout";
import LocationHeader from "../components/location/location_header";
import DogCards from "../components/card/card";
import { getAnimals, getAllAnimals } from "./card_detail/animal_services";
import { fetchCSRFToken } from "./profile/user_services";

interface Dog {
  id: number;
  name: string;
  city: string;
  imageUrl: string;
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Verificación de sesión
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);

  // Distancia en km (inicialmente 30)
  const [distance, setDistance] = useState<number>(30);

  // Ubicación del usuario
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  // Controla si la ubicación está disponible
  const [locationAvailable, setLocationAvailable] = useState<boolean>(true);

  // Lista de perros y estado de carga
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar el CSRF token
  fetchCSRFToken();

  // Verificar la sesión al montar el componente
  useEffect(() => {
    const verifySession = async () => {
      const valid = await checkSession();
      if (!valid) {
        navigate("/login");
      } else {
        setIsSessionValid(true);
      }
    };
    verifySession();
  }, [navigate]);

  // Intentamos obtener la geolocalización al montar
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
      },
      (error) => {
        console.error("Error obteniendo la ubicación:", error);
        // Marcar locationAvailable = false
        setLocationAvailable(false);
      }
    );
  }, []);

  // Cada vez que cambien distance, userLat, userLng o locationAvailable, cargamos perros
  useEffect(() => {
    const fetchDogs = async () => {
      setLoading(true);

      // Si la ubicación no está disponible, cargamos todos los animales
      if (!locationAvailable) {
        console.log("[DEBUG] Cargando todos los animales (sin filtro)...");
        try {
          const all = await getAllAnimals();
          setDogs(all);
        } catch (error) {
          console.error("Error al cargar todos los animales:", error);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Si la ubicación está disponible y lat/lng no son nulos, filtramos
      if (userLat !== null && userLng !== null) {
        console.log("[DEBUG] Llamando a getAnimals con:", { distance, userLat, userLng });
        try {
          const data = await getAnimals(distance, userLat, userLng);
          console.log("[DEBUG] Respuesta getAnimals:", data);
          setDogs(data);
        } catch (error) {
          console.error("Error al cargar los animales (con geolocalización):", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Si la ubicación está "disponible" pero userLat/userLng no han llegado todavía
        // no hacemos nada; esperamos a que se definan
        setLoading(false);
      }
    };
    fetchDogs();
  }, [distance, userLat, userLng, locationAvailable]);

  if (isSessionValid === null) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="teal.500" />
        <Text mt={4} color="teal.500" fontSize="xl">
          Verificando sesión...
        </Text>
      </Center>
    );
  }

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Layout handleLogout={handleLogout}>
      <Box minHeight="100vh" bg="#F7FAFC" display="flex" flexDirection="column">
        <Box p={6} flex="1" display="flex" justifyContent="center">
          <Box maxWidth="1200px" width="100%">
            {/* 
              Si la ubicación está disponible, mostramos el LocationHeader.
              Si no, lo ocultamos. 
            */}
            {locationAvailable && (
              <LocationHeader
                distance={distance}
                onDistanceChange={(val) => setDistance(val)}
              />
            )}

            {loading ? (
              <Center>
                <Spinner size="xl" />
              </Center>
            ) : (
              <DogCards dogs={dogs} />
            )}
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default Dashboard;
