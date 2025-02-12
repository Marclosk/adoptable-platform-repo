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
import { getAnimals } from "./card_detail/animal_services";

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
  const [distance] = useState<number>(30);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    const fetchDogs = async () => {
      try {
        const data = await getAnimals();
        setDogs(data);
      } catch (error) {
        console.error("Error al cargar los animales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDogs();
  }, []);

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
      <Box minHeight="100vh" bg="#FFFFFF" display="flex" flexDirection="column">
        <Box p="6" flex="1" display="flex" justifyContent="center">
          <Box maxWidth="1200px" width="100%">
            <LocationHeader distance={distance} />
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
