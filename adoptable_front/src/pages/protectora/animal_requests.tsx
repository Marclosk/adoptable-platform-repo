// src/pages/protectora/AnimalRequests.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useTranslation } from "react-i18next";
import {
  Box,
  Heading,
  Text,
  AspectRatio,
  Image as ChakraImage,
  SimpleGrid,
  Flex,
  Button,
  Divider,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  Badge,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import Layout from "../../components/layout";
import Loader from "../../components/loader/loader";
import {
  getAnimalById,
  listAdoptionRequestsForAnimal,
  cancelAdoptionRequestForUser,
  adoptAnimal,
  AdoptionRequest,
} from "../card_detail/animal_services";

const AnimalRequests: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const role = useSelector((s: RootState) => s.auth.role);

  const [animal, setAnimal] = useState<any>(null);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Para selección y marcado de adoptante
  const [selectedAdopter, setSelectedAdopter] = useState<number | "">("");
  const [adoptLoading, setAdoptLoading] = useState<boolean>(false);

  // Diálogo de rechazo
  const {
    isOpen: isRejectOpen,
    onOpen: onRejectOpen,
    onClose: onRejectClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [toReject, setToReject] = useState<AdoptionRequest | null>(null);

  useEffect(() => {
    if (role !== "protectora") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  // Carga animal y solicitudes
  useEffect(() => {
    (async () => {
      try {
        const a = await getAnimalById(Number(id));
        setAnimal(a);
        const reqs = await listAdoptionRequestsForAnimal(Number(id));
        setRequests(reqs);
      } catch (err) {
        console.error(err);
        toast({ title: t("error_cargando_datos"), status: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast, t]);

  // Si el animal ya está adoptado, redirigimos al card_detail
  useEffect(() => {
    if (!loading && animal?.adopter) {
      navigate(`/card_detail/${animal.id}`);
    }
  }, [loading, animal, navigate]);

  const openRejectDialog = (req: AdoptionRequest) => {
    setToReject(req);
    onRejectOpen();
  };

  const handleConfirmReject = useCallback(async () => {
    if (!toReject || !animal) return;
    try {
      await cancelAdoptionRequestForUser(animal.id, toReject.user.username);
      toast({ title: t("solicitud_rechazada"), status: "info" });
      setRequests((prev) => prev.filter((r) => r.id !== toReject.id));
    } catch (err) {
      console.error(err);
      toast({ title: t("error_rechazar"), status: "error" });
    } finally {
      onRejectClose();
      setToReject(null);
    }
  }, [toReject, animal, toast, onRejectClose, t]);

  const handleAdopt = async () => {
    if (!animal || !selectedAdopter) return;
    setAdoptLoading(true);
    try {
      await adoptAnimal(animal.id, Number(selectedAdopter));
      toast({ title: t("animal_marcado_adoptado"), status: "success" });
      navigate("/protectora/dashboard");
    } catch (err) {
      console.error(err);
      toast({ title: t("error_al_adoptar"), status: "error" });
    } finally {
      setAdoptLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout handleLogout={() => navigate("/login")}>
        <Loader message={t("cargando_solicitudes")} />
      </Layout>
    );
  }

  if (!animal) {
    return (
      <Layout handleLogout={() => navigate("/login")}>
        <Box textAlign="center" mt={12}>
          <Text fontSize="2xl" fontWeight="bold" color="red.500">
            {t("animal_no_encontrado")}
          </Text>
        </Box>
      </Layout>
    );
  }

  const urlFromImage =
    typeof animal.image === "string" ? animal.image : animal.image?.url;
  const imgUrl = animal.imageUrl || urlFromImage || "/images/default_image.jpg";

  return (
    <Layout handleLogout={() => navigate("/login")}>
      <Box maxW="960px" mx="auto" py={8}>
        {/* Imagen y encabezado */}
        <AspectRatio ratio={16 / 9} mb={6} borderRadius="md" overflow="hidden">
          <ChakraImage
            src={imgUrl}
            alt={animal.name}
            objectFit="cover"
            fallbackSrc="/images/default_image.jpg"
          />
        </AspectRatio>
        <Flex align="center" mb={4}>
          <Box>
            <Heading>{animal.name}</Heading>
            <Text color="gray.600">{animal.city}</Text>
          </Box>
          <HStack ml="auto" spacing={2}>
            <Badge colorScheme="green">{animal.age}</Badge>
            <Badge colorScheme="purple">{animal.breed}</Badge>
          </HStack>
        </Flex>
        <Divider />

        {/* Selector de adoptante */}
        <Box my={6} bg="white" p={4} borderRadius="md" boxShadow="sm">
          <FormControl>
            <FormLabel>{t("selecciona_solicitante")}</FormLabel>
            <Select
              placeholder={t("selecciona_solicitante")}
              value={selectedAdopter}
              onChange={(e) => setSelectedAdopter(Number(e.target.value) || "")}
            >
              {requests.map((r) => (
                <option key={r.id} value={r.user.id}>
                  {r.user.username}
                </option>
              ))}
            </Select>
          </FormControl>
          <Button
            mt={3}
            colorScheme="teal"
            onClick={handleAdopt}
            isDisabled={!selectedAdopter}
            isLoading={adoptLoading}
          >
            {t("marcar_como_adoptado")}
          </Button>
        </Box>

        {/* Lista de solicitudes */}
        <Heading size="lg" mb={4}>
          {t("solicitudes_recibidas")} ({requests.length})
        </Heading>
        {requests.length === 0 ? (
          <Text color="gray.500">{t("no_hay_solicitudes_pendientes")}</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {requests.map((r) => (
              <Box
                key={r.id}
                bg="white"
                borderWidth="1px"
                borderRadius="lg"
                p={6}
                boxShadow="sm"
                _hover={{ boxShadow: "md" }}
              >
                <VStack align="start" spacing={3}>
                  <Flex justify="space-between" w="100%">
                    <Text fontWeight="bold">{r.user.username}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </Text>
                  </Flex>
                  <VStack
                    align="start"
                    spacing={1}
                    fontSize="sm"
                    color="gray.700"
                  >
                    <Text>
                      <b>{t("nombre")}:</b> {r.form_data.full_name}
                    </Text>
                    <Text>
                      <b>{t("direccion")}:</b> {r.form_data.address}
                    </Text>
                    <Text>
                      <b>{t("telefono")}:</b> {r.form_data.phone}
                    </Text>
                    <Text>
                      <b>{t("correo_electronico")}:</b> {r.form_data.email}
                    </Text>
                    <Text>
                      <b>{t("motivacion")}:</b> {r.form_data.reason}
                    </Text>
                    {r.form_data.experience && (
                      <Text>
                        <b>{t("experiencia")}:</b> {r.form_data.experience}
                      </Text>
                    )}
                    <Text>
                      <b>{t("otras_mascotas")}:</b>{" "}
                      {r.form_data.has_other_pets
                        ? r.form_data.other_pet_types
                        : t("no")}
                    </Text>
                    {r.form_data.references && (
                      <Text>
                        <b>{t("referencias")}:</b> {r.form_data.references}
                      </Text>
                    )}
                  </VStack>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    alignSelf="end"
                    onClick={() => openRejectDialog(r)}
                  >
                    {t("rechazar")}
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        )}

        {/* Diálogo de rechazo */}
        <AlertDialog
          isOpen={isRejectOpen}
          leastDestructiveRef={cancelRef}
          onClose={onRejectClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {t("rechazar_solicitud")}
              </AlertDialogHeader>
              <AlertDialogBody>
                {toReject &&
                  t("confirmar_rechazar_solicitud", {
                    username: toReject.user.username,
                  })}
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onRejectClose}>
                  {t("cancelar")}
                </Button>
                <Button colorScheme="red" onClick={handleConfirmReject} ml={3}>
                  {t("si_rechazar")}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Layout>
  );
};

export default AnimalRequests;
