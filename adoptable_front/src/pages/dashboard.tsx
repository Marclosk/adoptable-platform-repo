// src/pages/dashboard.tsx
import React, { useEffect, useState } from "react";
import { Box, Center, Spinner, Text, Heading } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutSuccess } from "../features/auth/authSlice";
import { logout } from "../features/auth/authService";
import { checkSession } from "../features/auth/session/checkSession";
import Layout from "../components/layout";
import LocationHeader from "../components/location/location_header";
import DogCards from "../components/card/card";
import { getAnimals } from "./card_detail/animal_services";
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

  // Distancia en km
  const [distance, setDistance] = useState<number>(30);

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
      },
      (error) => {
        console.error("Error obteniendo la ubicación:", error);
        // Podrías redirigir al usuario o mostrar un mensaje
      }
    );
  }, []);

  // Cada vez que cambien distance, userLat o userLng, cargamos los perros
  useEffect(() => {
    const fetchDogs = async () => {
      if (userLat !== null && userLng !== null) {
        setLoading(true);
        try {
          const data = await getAnimals(distance, userLat, userLng);
          setDogs(data);
        } catch (error) {
          console.error("Error al cargar los animales:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDogs();
  }, [distance, userLat, userLng]);

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
            {/* Cabecera de ubicación y slider de distancia */}
            <LocationHeader
              distance={distance}
              onDistanceChange={(val) => setDistance(val)}
            />
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
