// src/pages/dashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Center,
  Spinner,
  Text,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
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

  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const [distance, setDistance] = useState<number>(30);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationAvailable, setLocationAvailable] = useState<boolean>(true);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  fetchCSRFToken();

  // 1) Verificar sesión
  useEffect(() => {
    (async () => {
      const valid = await checkSession();
      if (!valid) {
        navigate("/login");
      } else {
        setIsSessionValid(true);
      }
    })();
  }, [navigate]);

  // 2) Pedir geolocalización
  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationAvailable(true);
      },
      (err) => {
        console.error("Error obteniendo la ubicación:", err);
        setLocationAvailable(false);
      }
    );
  };
  useEffect(requestLocation, []);

  // 3) Cargar la lista de perros (filtrada o no)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let list: Dog[];
        if (!locationAvailable) {
          list = await getAllAnimals();
        } else if (userLat != null && userLng != null) {
          list = await getAnimals(distance, userLat, userLng);
        } else {
          list = [];
        }
        setDogs(list);
      } catch (err) {
        console.error("Error cargando perros:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [distance, userLat, userLng, locationAvailable]);

  if (isSessionValid === null) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="teal.500" />
        <Text mt={4} color="teal.500" fontSize="xl">
          Verificando sesión...
        </Text>
      </Center>
    );
  }

  const handleLogout = async () => {
    await logout();
    dispatch(logoutSuccess());
    navigate("/login");
  };

  return (
    <Layout handleLogout={handleLogout}>
      <Box minH="100vh" bg="#F7FAFC" p={6}>
        <VStack spacing={6} align="stretch">
          {!locationAvailable && (
            <Alert status="warning" variant="left-accent" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Ubicación no disponible</AlertTitle>
                <AlertDescription display="block">
                  Activa la geolocalización o ingresa manualmente tu ciudad.
                </AlertDescription>
              </Box>
              <Button
                size="sm"
                colorScheme="teal"
                onClick={requestLocation}
                ml={4}
              >
                Reintentar
              </Button>
            </Alert>
          )}

          <LocationHeader
            distance={distance}
            onDistanceChange={setDistance}
            onLocationSelect={(lat, lng) => {
              setUserLat(lat);
              setUserLng(lng);
            }}
          />

          {loading ? (
            <Center py={10}>
              <Spinner size="xl" />
            </Center>
          ) : (
            <DogCards dogs={dogs} />
          )}
        </VStack>
      </Box>
    </Layout>
  );
};

export default Dashboard;
