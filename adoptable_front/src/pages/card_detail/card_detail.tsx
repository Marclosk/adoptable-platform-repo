// src/pages/animal/AnimalDetail.tsx

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { ArrowBackIcon, CheckCircleIcon, StarIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Layout from "../../components/layout";
import Loader from "../../components/loader/loader";

import {
  getAnimalById,
  deleteAnimal,
  adoptAnimal,
  addFavorite,
  removeFavorite,
  requestAdoption,
  cancelAdoptionRequest,
  getMyAdoptionRequests,
  listAdoptionRequestsForAnimal,
} from "./animal_services";
import { getProfile, getAdoptionForm } from "../profile/user_services";
import type { AdoptionFormAPI } from "../profile/user_services";
import { logoutSuccess } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authService";
import { RootState } from "../../redux/store";

interface Animal {
  id: number;
  name: string;
  city: string;
  biography: string;
  imageUrl?: string;
  image?: string | { url?: string };
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

const AnimalDetail: React.FC = () => {
  const { t } = useTranslation();
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
  const [isRequested, setIsRequested] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [isFormAlertOpen, setIsFormAlertOpen] = useState(false);
  const formAlertCancelRef = useRef<HTMLButtonElement>(null);

  const fallbackImage = "/images/default_image.jpg";

  /** 1) cargar detalle */
  const loadAnimal = useCallback(async () => {
    try {
      const data = await getAnimalById(Number(id));
      setAnimal(data);
    } catch {
      toast({ title: t("error_cargar_animal"), status: "error" });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast, t]);

  /** 2) favoritos */
  const loadFavorites = useCallback(async () => {
    if (role !== "adoptante" || !animal) return;
    try {
      const prof = await getProfile();
      setIsFavorite(
        Array.isArray(prof.favorites) &&
          prof.favorites.some((f: any) => f.id === animal.id)
      );
    } catch {
      /* no hacemos toast aquí */
    }
  }, [animal, role]);

  /** 3) estado solicitud */
  const loadRequestStatus = useCallback(async () => {
    if (role !== "adoptante" || !animal) return;
    try {
      const requests = await getMyAdoptionRequests();
      const existing = requests.find((r: any) => r.animal.id === animal.id);
      if (existing) {
        setIsRequested(true);
        setRequestId(existing.id);
      }
    } catch {
      /* silent */
    }
  }, [animal, role]);

  /** 4) lista solicitantes para protectora */
  const loadApplicants = useCallback(async () => {
    if (
      role !== "protectora" ||
      !animal ||
      authUser?.id !== animal.owner ||
      animal.adopter != null
    )
      return;
    try {
      const reqs = await listAdoptionRequestsForAnimal(animal.id);
      setAdopters(reqs.map((r) => r.user));
    } catch {
      /* silent */
    }
  }, [animal, role, authUser]);

  useEffect(() => {
    loadAnimal();
  }, [loadAnimal]);

  useEffect(() => {
    loadFavorites();
    loadRequestStatus();
    loadApplicants();
  }, [loadFavorites, loadRequestStatus, loadApplicants]);

  /** handlers comunes */
  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch {
      toast({ title: t("error_cerrar_sesion"), status: "error" });
    }
  };

  const handleDelete = async () => {
    if (!animal) return;
    try {
      await deleteAnimal(animal.id);
      toast({ title: t("animal_eliminado"), status: "success" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: err.message || t("error_eliminando"),
        status: "error",
      });
    }
  };

  /** adoptante: solicitar adopción */
  const handleAdoptionRequest = async () => {
    if (!animal) return;
    setRequestLoading(true);
    try {
      const form: AdoptionFormAPI = await getAdoptionForm();
      const requiredFields: (keyof AdoptionFormAPI)[] = [
        "full_name",
        "address",
        "phone",
        "email",
        "reason",
      ];
      const missing = requiredFields.filter((field) => {
        const val = form[field];
        const isEmpty =
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "");
        return isEmpty;
      });
      if (missing.length > 0) {
        setIsFormAlertOpen(true);
        return;
      }
      const newReq = await requestAdoption(animal.id, form);
      toast({ title: t("solicitud_enviada"), status: "success" });
      setIsRequested(true);
      setRequestId(newReq.id);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setIsFormAlertOpen(true);
      } else {
        toast({ title: t("error_solicitar_adopcion"), status: "error" });
      }
    } finally {
      setRequestLoading(false);
    }
  };

  /** protectora: marcar adoptado */
  const handleAdopt = async () => {
    if (!animal || !selectedAdopter) return;
    try {
      const updated = await adoptAnimal(animal.id, selectedAdopter);
      setAnimal(updated);
      toast({ title: t("animal_marcado_adoptado"), status: "success" });
    } catch (err: any) {
      toast({
        title: err.message || t("error_al_adoptar"),
        status: "error",
      });
    }
  };

  /** favorito */
  const toggleFavorite = async () => {
    if (!animal) return;
    try {
      if (isFavorite) {
        await removeFavorite(animal.id);
        toast({ title: t("quitado_favoritos"), status: "info" });
      } else {
        await addFavorite(animal.id);
        toast({ title: t("anadido_favoritos"), status: "success" });
      }
      setIsFavorite(!isFavorite);
    } catch {
      toast({ title: t("error_actualizar_favorito"), status: "error" });
    }
  };

  if (loading) return <Loader message={t("cargando_detalle")} />;
  if (!animal)
    return (
      <Box textAlign="center" mt={12}>
        <Text fontSize="2xl" fontWeight="bold" color="red.500">
          {t("animal_no_encontrado")}
        </Text>
      </Box>
    );

  const urlFromImage =
    typeof animal.image === "string" ? animal.image : animal.image?.url;
  const imgUrl = animal.imageUrl || urlFromImage || fallbackImage;
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
          {/* Header */}
          <HStack justify="space-between" p={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              {t("volver")}
            </Button>
            {role === "adoptante" && (
              <Button
                leftIcon={<StarIcon />}
                colorScheme={isFavorite ? "yellow" : "teal"}
                variant={isFavorite ? "solid" : "outline"}
                onClick={toggleFavorite}
              >
                {isFavorite ? t("favorito") : t("anadir_favorito")}
              </Button>
            )}
          </HStack>

          {/* Image */}
          <AspectRatio ratio={16 / 9} maxH="350px">
            <ChakraImage
              src={imgUrl}
              alt={animal.name}
              objectFit="cover"
              fallbackSrc={fallbackImage}
            />
          </AspectRatio>

          {/* Details */}
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

            <Text fontWeight="bold">{t("como_soy")}</Text>
            <HStack wrap="wrap" spacing={2}>
              {chars.length ? (
                chars.map((c, i) => (
                  <Badge key={i} colorScheme="teal">
                    {c}
                  </Badge>
                ))
              ) : (
                <Text color="gray.500">{t("sin_caracteristicas")}</Text>
              )}
            </HStack>

            <Text fontWeight="bold">{t("me_entregan")}</Text>
            <VStack align="start" spacing={1}>
              {animal.dewormed && (
                <HStack>
                  <Icon as={CheckCircleIcon} color="green.500" />
                  <Text>{t("desparasitado")}</Text>
                </HStack>
              )}
              {animal.sterilized && (
                <HStack>
                  <Icon as={CheckCircleIcon} color="green.500" />
                  <Text>{t("esterilizado")}</Text>
                </HStack>
              )}
              {animal.microchipped && (
                <HStack>
                  <Icon as={CheckCircleIcon} color="green.500" />
                  <Text>{t("con_microchip")}</Text>
                </HStack>
              )}
              {animal.vaccinated && (
                <HStack>
                  <Icon as={CheckCircleIcon} color="green.500" />
                  <Text>{t("vacunado")}</Text>
                </HStack>
              )}
            </VStack>
            <Divider />

            <Text fontSize="lg" fontWeight="bold">
              {t("shelter_label")} {animal.shelter}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {t("en_la_protectora_desde", { date: animal.since })}
            </Text>

            {/* Adoptante */}
            {role === "adoptante" && animal.adopter == null && (
              <Button
                colorScheme="purple"
                variant={isRequested ? "solid" : "outline"}
                onClick={handleAdoptionRequest}
                isDisabled={isRequested}
                isLoading={requestLoading}
                w="full"
                mt={4}
              >
                {isRequested ? t("solicitud_enviada") : t("solicitar_adopcion")}
              </Button>
            )}

            {/* Protectora */}
            {role === "protectora" &&
              authUser?.id === animal.owner &&
              animal.adopter == null && (
                <Box w="full" mt={4}>
                  <FormControl>
                    <FormLabel>{t("solicitudes_recibidas")}</FormLabel>
                    <Select
                      placeholder={t("selecciona_solicitante")}
                      value={selectedAdopter}
                      onChange={(e) =>
                        setSelectedAdopter(Number(e.target.value) || "")
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
                    {t("marcar_como_adoptado")}
                  </Button>
                </Box>
              )}

            {/* Adoptado por */}
            {animal.adopter_username && (
              <Text fontWeight="bold" mt={4}>
                {t("adoptado_por")}: {animal.adopter_username}
              </Text>
            )}

            {/* Eliminar */}
            {(role === "admin" ||
              (role === "protectora" && authUser?.id === animal.owner)) && (
              <Button colorScheme="red" w="full" onClick={handleDelete} mt={4}>
                {t("eliminar_animal")}
              </Button>
            )}
          </VStack>
        </Box>
      </Flex>

      {/* AlertDialog formulario incompleto */}
      <AlertDialog
        isOpen={isFormAlertOpen}
        leastDestructiveRef={formAlertCancelRef}
        onClose={() => setIsFormAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t("formulario_incompleto")}
            </AlertDialogHeader>
            <AlertDialogBody>{t("alert_form_body")}</AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={formAlertCancelRef}
                onClick={() => setIsFormAlertOpen(false)}
              >
                {t("cancelar")}
              </Button>
              <Button
                colorScheme="teal"
                onClick={() => {
                  setIsFormAlertOpen(false);
                  navigate("/perfil");
                }}
                ml={3}
              >
                {t("ir_al_perfil")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
};

export default AnimalDetail;
