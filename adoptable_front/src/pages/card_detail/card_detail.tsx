import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  Image,
  Spinner,
  Button,
  Flex,
  Divider,
  Badge,
  Icon,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { getAnimalById } from "./animal_services";
import Layout from "../../components/layout";
import { useDispatch } from "react-redux";
import { logoutSuccess } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authService";

interface Animal {
  id: number;
  name: string;
  city: string;
  biography: string;
  imageUrl: string;
  age: string;
  breed: string;
  species: string;
  weight: string;
  size: string;
  activity: string;
  characteristics: string[];
  shelter: string;
  since: string;
  vaccinated: boolean;
  sterilized: boolean;
  microchipped: boolean;
  dewormed: boolean;
}

const CardDetail: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const data = await getAnimalById(Number(id));
        setAnimal(data);
      } catch (error) {
        console.error("Error al cargar los detalles del animal:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="60vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!animal) {
    return (
      <Box textAlign="center" mt="20">
        <Text fontSize="2xl" fontWeight="bold" color="red.500">
          No se encontró el animal.
        </Text>
      </Box>
    );
  }

  return (
    <Layout handleLogout={handleLogout}>
      <Flex justify="center" p={6} bg="gray.100">
        <Box
          maxW="900px"
          w="full"
          bg="white"
          borderRadius="lg"
          boxShadow="lg"
          overflow="hidden"
          p={6}
        >
          {/* Botón de volver */}
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate(-1)}
            mb={4}
          >
            Volver
          </Button>

          <Flex direction={{ base: "column", md: "row" }} gap={6}>
            {/* Sección de imágenes */}
            <Box flex="1">
              <Image
                src={animal.imageUrl || "https://via.placeholder.com/400"}
                alt={animal.name}
                width="100%"
                height="350px"
                objectFit="cover"
                borderRadius="md"
              />
            </Box>

            {/* Sección de información */}
            <Box flex="2">
              <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                {animal.name}
              </Text>
              <Text fontSize="md" color="gray.500" mb={4}>
                📍 {animal.city}
              </Text>

              {/* Datos generales */}
              <Flex wrap="wrap" gap={4} mb={4}>
                <Badge colorScheme="blue">{animal.species}</Badge>
                <Badge colorScheme="green">{animal.age}</Badge>
                <Badge colorScheme="purple">{animal.breed}</Badge>
                <Badge colorScheme="pink">{animal.size}</Badge>
                <Badge colorScheme="orange">{animal.activity}</Badge>
              </Flex>

              {/* Características */}
              <Text fontWeight="bold" mb={2}>
                ¿Cómo soy?
              </Text>
              <HStack wrap="wrap" spacing={2} mb={4}>
                {Object.keys(animal.characteristics).map((char, index) => (
                  <Badge key={index} colorScheme="teal">
                    {char}
                  </Badge>
                ))}
              </HStack>

              {/* Estado de salud */}
              <Text fontWeight="bold" mb={2}>
                Me entregan:
              </Text>
              <VStack align="start" spacing={1} mb={4}>
                {animal.dewormed && (
                  <HStack>
                    <Icon as={CheckCircleIcon} color="green.500" />
                    <Text>Desparasitado</Text>
                  </HStack>
                )}
                {animal.sterilized && (
                  <HStack>
                    <Icon as={CheckCircleIcon} color="green.500" />
                    <Text>Esterilizado</Text>
                  </HStack>
                )}
                {animal.microchipped && (
                  <HStack>
                    <Icon as={CheckCircleIcon} color="green.500" />
                    <Text>Con microchip</Text>
                  </HStack>
                )}
                {animal.vaccinated && (
                  <HStack>
                    <Icon as={CheckCircleIcon} color="green.500" />
                    <Text>Vacunado</Text>
                  </HStack>
                )}
              </VStack>

              <Divider my={4} />

              {/* Información protectora */}
              <Text fontSize="lg" fontWeight="bold" mb={1}>
                🏠 {animal.shelter}
              </Text>
              <Text fontSize="sm" color="gray.500">
                En la protectora desde el {animal.since}
              </Text>

              {/* Botón de adoptar */}
              <Button
                mt={4}
                colorScheme="blue"
                width="full"
                fontSize="lg"
                borderRadius="full"
              >
                ¡Quiero adoptarlo!
              </Button>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
};

export default CardDetail;
