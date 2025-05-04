// src/pages/card_detail/AnimalDetail.tsx
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
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { ArrowBackIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/react";
import {
  getAnimalById,
  deleteAnimal,
  getAdopters,
  adoptAnimal,
} from "./animal_services";
import Layout from "../../components/layout";
import { useDispatch, useSelector } from "react-redux";
import { logoutSuccess } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authService";
import { RootState } from "../../redux/store";

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
  characteristics: string[] | { [key: string]: any };
  shelter: string;
  since: string;
  vaccinated: boolean;
  sterilized: boolean;
  microchipped: boolean;
  dewormed: boolean;
  owner?: number | null;
  adopter?: number | null;
  adopter_username?: string;
}

interface Adopter {
  id: number;
  username: string;
}

const CardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user: authUser, role } = useSelector((s: RootState) => s.auth);

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [adopters, setAdopters] = useState<Adopter[]>([]);
  const [selectedAdopter, setSelectedAdopter] = useState<number | "">("");

  // fetch animal details
  useEffect(() => {
    (async () => {
      try {
        const data = await getAnimalById(Number(id));
        setAnimal(data);
      } catch (err) {
        console.error("Error cargando animal:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // if owner & not adopted, load adopters list
  useEffect(() => {
    if (
      animal &&
      role === "protectora" &&
      authUser?.id === animal.owner &&
      animal.adopter == null
    ) {
      (async () => {
        try {
          const list = await getAdopters();
          setAdopters(list);
        } catch (err) {
          console.error("Error cargando adoptantes:", err);
        }
      })();
    }
  }, [animal, role, authUser]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch {
      /* no-op */
    }
  };

  const handleDelete = async () => {
    if (!animal) return;
    try {
      await deleteAnimal(animal.id);
      toast({ title: "Animal eliminado", status: "success" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: err.message || "Error al eliminar", status: "error" });
    }
  };

  const handleAdopt = async () => {
    if (!animal || !selectedAdopter) return;
    try {
      const updated = await adoptAnimal(animal.id, selectedAdopter);
      setAnimal(updated);
      toast({ title: "Animal marcado como adoptado", status: "success" });
    } catch (err: any) {
      toast({ title: err.message || "Error al adoptar", status: "error" });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
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

  const chars: string[] = Array.isArray(animal.characteristics)
    ? animal.characteristics
    : Object.keys(animal.characteristics || {});

  const canDelete =
    role === "admin" || (role === "protectora" && authUser?.id === animal.owner);

  return (
    <Layout handleLogout={handleLogout}>
      <Flex direction="column" align="center" p={6} bg="gray.100">
        <Box
          maxW="900px"
          w="full"
          bg="white"
          borderRadius="lg"
          boxShadow="lg"
          overflow="hidden"
          p={6}
        >
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate(-1)}
            mb={4}
          >
            Volver
          </Button>

          <Flex direction={{ base: "column", md: "row" }} gap={6}>
            <Box flex="1">
              <Image
                src={animal.imageUrl || "https://via.placeholder.com/400"}
                alt={animal.name}
                w="100%"
                h="350px"
                objectFit="cover"
                borderRadius="md"
              />
            </Box>

            <Box flex="2">
              <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                {animal.name}
              </Text>
              <Text fontSize="md" color="gray.500" mb={4}>
                📍 {animal.city}
              </Text>

              <Flex wrap="wrap" gap={4} mb={4}>
                <Badge colorScheme="blue">{animal.species}</Badge>
                <Badge colorScheme="green">{animal.age}</Badge>
                <Badge colorScheme="purple">{animal.breed}</Badge>
                <Badge colorScheme="pink">{animal.size}</Badge>
                <Badge colorScheme="orange">{animal.activity}</Badge>
              </Flex>

              <Text fontWeight="bold" mb={2}>
                ¿Cómo soy?
              </Text>
              <HStack wrap="wrap" spacing={2} mb={4}>
                {chars.length ? (
                  chars.map((c, i) => (
                    <Badge key={i} colorScheme="teal">
                      {c}
                    </Badge>
                  ))
                ) : (
                  <Text color="gray.500">Sin características</Text>
                )}
              </HStack>

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

              <Text fontSize="lg" fontWeight="bold" mb={1}>
                🏠 {animal.shelter}
              </Text>
              <Text fontSize="sm" color="gray.500">
                En la protectora desde el {animal.since}
              </Text>

              <Button
                mt={4}
                colorScheme="blue"
                w="full"
                fontSize="lg"
                borderRadius="full"
              >
                ¡Quiero adoptarlo!
              </Button>
            </Box>
          </Flex>

          {/* si es protectora dueña y aún no hay adoptante, asignar */}
          {role === "protectora" &&
            authUser?.id === animal.owner &&
            animal.adopter == null && (
              <Box mt={6}>
                <FormControl>
                  <FormLabel>Selecciona adoptante</FormLabel>
                  <Select
                    placeholder="Seleccione..."
                    value={selectedAdopter}
                    onChange={(e) =>
                      setSelectedAdopter(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                  >
                    {adopters.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  mt={2}
                  colorScheme="teal"
                  onClick={handleAdopt}
                  isDisabled={!selectedAdopter}
                >
                  Marcar como adoptado
                </Button>
              </Box>
            )}

          {/* si ya hay adoptante, mostramos quién */}
          {animal.adopter_username && (
            <Text mt={6} fontWeight="bold">
              Adoptado por: {animal.adopter_username}
            </Text>
          )}

          {/* botón eliminar (owner o admin) */}
          {canDelete && (
            <Button colorScheme="red" mt={6} w="full" onClick={handleDelete}>
              Eliminar animal
            </Button>
          )}
        </Box>
      </Flex>
    </Layout>
  );
};

export default CardDetail;
