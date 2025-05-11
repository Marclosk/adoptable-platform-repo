import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  AspectRatio,
  Image as ChakraImage,
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
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowBackIcon, CheckCircleIcon, StarIcon } from "@chakra-ui/icons";
import {
  getAnimalById,
  deleteAnimal,
  getAdopters,
  adoptAnimal,
  addFavorite,
  removeFavorite,
  requestAdoption,
  cancelAdoptionRequest,
  getMyAdoptionRequests,
} from "./animal_services";
import { getProfile } from "../profile/user_services";
import Layout from "../../components/layout";
import Loader from "../../components/loader/loader";
import { useDispatch, useSelector } from "react-redux";
import { logoutSuccess } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authService";
import { RootState } from "../../redux/store";

interface Animal {
  id: number;
  name: string;
  city: string;
  imageUrl?: string;
  image?: string | { url?: string };
  age: string;
  breed: string;
  species: string;
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

const AnimalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser, role } = useSelector((s: RootState) => s.auth);

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [adopters, setAdopters] = useState<Adopter[]>([]);
  const [selectedAdopter, setSelectedAdopter] = useState<number | "">("");
  const [isFavorite, setIsFavorite] = useState(false);

  // Estados para solicitud de adopción
  const [isRequested, setIsRequested] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);

  const fallbackImage = "/images/default_image.jpg";

  /** 1) Carga detalle de animal **/
  const loadAnimal = useCallback(async () => {
    try {
      const data = await getAnimalById(Number(id));
      setAnimal(data);
    } catch {
      toast({ title: "No se pudo cargar el animal", status: "error" });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  /** 2) Carga favoritos **/
  const loadFavorites = useCallback(async () => {
    if (role !== "adoptante" || !animal) return;
    const profile = await getProfile();
    setIsFavorite(
      Array.isArray(profile.favorites) &&
        profile.favorites.some((f: any) => f.id === animal.id)
    );
  }, [animal, role]);

  /** 3) Comprueba si ya solicitó este animal **/
  const loadRequestStatus = useCallback(async () => {
    if (role !== "adoptante" || !animal) return;
    const requests = await getMyAdoptionRequests();
    const existing = requests.find((r) => r.animal === animal.id);
    if (existing) {
      setIsRequested(true);
      setRequestId(existing.id);
    }
  }, [animal, role]);

  /** 4) Si eres protectora y dueña: precarga adoptantes **/
  const loadAdopters = useCallback(async () => {
    if (
      role === "protectora" &&
      animal &&
      authUser?.id === animal.owner &&
      animal.adopter === null
    ) {
      const list = await getAdopters();
      setAdopters(list);
    }
  }, [animal, role, authUser]);

  useEffect(() => {
    loadAnimal();
  }, [loadAnimal]);

  useEffect(() => {
    loadFavorites();
    loadRequestStatus();
    loadAdopters();
  }, [loadFavorites, loadRequestStatus, loadAdopters]);

  /** Logout, eliminar, adoptar, favoritos… **/
  const handleLogout = async () => {
    await logout();
    dispatch(logoutSuccess());
    navigate("/login");
  };

  const handleDelete = async () => {
    if (!animal) return;
    await deleteAnimal(animal.id);
    toast({ title: "Animal eliminado", status: "success" });
    navigate("/dashboard");
  };

  const handleAdopt = async () => {
    if (!animal || !selectedAdopter) return;
    const updated = await adoptAnimal(animal.id, selectedAdopter);
    setAnimal(updated);
    toast({ title: "Animal marcado como adoptado", status: "success" });
  };

  const toggleFavorite = async () => {
    if (!animal) return;
    if (isFavorite) {
      await removeFavorite(animal.id);
      toast({ title: "Quitado de favoritos", status: "info" });
    } else {
      await addFavorite(animal.id);
      toast({ title: "Añadido a favoritos", status: "success" });
    }
    setIsFavorite(!isFavorite);
  };

  /** 5) Solicitante: solicitar/cancelar adopción **/
  const toggleRequest = async () => {
    if (!animal) return;
    setRequestLoading(true);
    if (isRequested && requestId) {
      await cancelAdoptionRequest(requestId);
      toast({ title: "Solicitud cancelada",status: "info" });
      setIsRequested(false);
      setRequestId(null);
    } else {
      const newReq = await requestAdoption(animal.id);
      toast({ title: "Solicitud enviada",status: "success" });
      setIsRequested(true);
      setRequestId(newReq.id);
    }
    setRequestLoading(false);
  };

  if (loading) return <Loader message="Cargando detalle…" />;
  if (!animal)
    return (
      <Box textAlign="center" mt={12}>
        <Text fontSize="2xl" fontWeight="bold" color="red.500">
          Animal no encontrado
        </Text>
      </Box>
    );

  const imgUrl =
    typeof animal.image === "string" ? animal.image : animal.image?.url;
  const actualImageUrl = animal.imageUrl || imgUrl || fallbackImage;

  const cardBg = useColorModeValue("white", "gray.700");
  const shadow = useColorModeValue("lg", "dark-lg");
  const chars: string[] = Array.isArray(animal.characteristics)
    ? animal.characteristics
    : Object.keys(animal.characteristics || {});

  return (
    <Layout handleLogout={handleLogout}>
      <Flex direction="column" align="center" p={6} bg="gray.50">
        <Box
          maxW="900px"
          w="full"
          bg={cardBg}
          borderRadius="lg"
          boxShadow={shadow}
          overflow="hidden"
        >
          <HStack justify="space-between" p={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
            {role === "adoptante" && (
              <Button
                leftIcon={<StarIcon />}
                colorScheme={isFavorite ? "yellow" : "teal"}
                variant={isFavorite ? "solid" : "outline"}
                onClick={toggleFavorite}
              >
                {isFavorite ? "Favorito" : "Añadir favorito"}
              </Button>
            )}
          </HStack>

          <AspectRatio ratio={16 / 9} maxH="350px">
            <ChakraImage
              src={actualImageUrl}
              alt={animal.name}
              objectFit="cover"
              fallbackSrc={fallbackImage}
            />
          </AspectRatio>

          <VStack align="start" spacing={4} p={6}>
            <Text fontSize="3xl" fontWeight="bold" color="teal.600">
              {animal.name}
            </Text>
            <Text fontSize="md" color="gray.500">
              <Icon as={CheckCircleIcon} mr={2} /> {animal.city}
            </Text>

            <HStack spacing={3} wrap="wrap" mb={4}>
              <Badge colorScheme="blue">{animal.species}</Badge>
              <Badge colorScheme="green">{animal.age}</Badge>
              <Badge colorScheme="purple">{animal.breed}</Badge>
              <Badge colorScheme="pink">{animal.size}</Badge>
              <Badge colorScheme="orange">{animal.activity}</Badge>
            </HStack>

            <Divider />

            <Text fontWeight="bold">¿Cómo soy?</Text>
            <HStack wrap="wrap" spacing={2}>
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

            <Text fontWeight="bold">Me entregan:</Text>
            <VStack align="start" spacing={1}>
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

            <Divider />

            <Text fontSize="lg" fontWeight="bold">
              🏠 {animal.shelter}
            </Text>
            <Text fontSize="sm" color="gray.500">
              En la protectora desde el {animal.since}
            </Text>

            {/* Adoptante: solicitar o estado */}
            {role === "adoptante" && animal.adopter == null && (
              <Button
                colorScheme="purple"
                variant={isRequested ? "solid" : "outline"}
                onClick={toggleRequest}
                isDisabled={isRequested}
                isLoading={requestLoading}
                w="full"
                mt={4}
              >
                {isRequested ? "Solicitud enviada" : "Solicitar adopción"}
              </Button>
            )}

            {/* Protectora: dropdown de adoptantes precargado */}
            {role === "protectora" &&
              authUser?.id === animal.owner &&
              animal.adopter == null && (
                <Box w="full" mt={4}>
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
                    isDisabled={!selectedAdopter}
                    onClick={handleAdopt}
                    w="full"
                  >
                    Marcar como adoptado
                  </Button>
                </Box>
              )}

            {animal.adopter_username && (
              <Text fontWeight="bold" mt={4}>
                Adoptado por: {animal.adopter_username}
              </Text>
            )}

            {(role === "admin" ||
              (role === "protectora" && authUser?.id === animal.owner)) && (
              <Button colorScheme="red" w="full" onClick={handleDelete} mt={4}>
                Eliminar animal
              </Button>
            )}
          </VStack>
        </Box>
      </Flex>
    </Layout>
  );
};

export default AnimalDetail;
