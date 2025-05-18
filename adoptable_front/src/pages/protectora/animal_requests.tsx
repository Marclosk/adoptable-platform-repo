// src/pages/protectora/AnimalRequests.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
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
} from "@chakra-ui/react";
import Layout from "../../components/layout";
import Loader from "../../components/loader/loader";
import {
  getAnimalById,
  listAdoptionRequestsForAnimal,
  cancelAdoptionRequestForUser,
  AdoptionRequest,
} from "../card_detail/animal_services";

const AnimalRequests: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const role = useSelector((s: RootState) => s.auth.role);

  const [animal, setAnimal] = useState<any>(null);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogo de rechazo
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } =
    useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [toReject, setToReject] = useState<AdoptionRequest | null>(null);

  // si no es protectora, redirige
  useEffect(() => {
    if (role !== "protectora") navigate("/dashboard");
  }, [role, navigate]);

  // carga animal y solicitudes
  useEffect(() => {
    (async () => {
      try {
        const a = await getAnimalById(Number(id));
        setAnimal(a);
        const reqs = await listAdoptionRequestsForAnimal(Number(id));
        setRequests(reqs);
      } catch (err) {
        console.error(err);
        toast({ title: "Error cargando datos", status: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  const openRejectDialog = (req: AdoptionRequest) => {
    setToReject(req);
    onRejectOpen();
  };

  const handleConfirmReject = useCallback(async () => {
    if (!toReject || !animal) return;
    try {
      await cancelAdoptionRequestForUser(animal.id, toReject.user.username);
      toast({ title: "Solicitud rechazada", status: "info" });
      setRequests((prev) => prev.filter((r) => r.id !== toReject.id));
    } catch (err) {
      console.error(err);
      toast({ title: "Error al rechazar", status: "error" });
    } finally {
      onRejectClose();
      setToReject(null);
    }
  }, [toReject, animal, toast, onRejectClose]);

  if (loading) {
    return (
      <Layout handleLogout={() => navigate("/login")}>
        <Loader message="Cargando solicitudes…" />
      </Layout>
    );
  }
  if (!animal) {
    return (
      <Layout handleLogout={() => navigate("/login")}>
        <Box textAlign="center" mt={12}>
          <Text fontSize="2xl" fontWeight="bold" color="red.500">
            Animal no encontrado
          </Text>
        </Box>
      </Layout>
    );
  }

  // resolver URL imagen igual que en AnimalDetail
  const urlFromImage =
    typeof animal.image === "string" ? animal.image : animal.image?.url;
  const imgUrl = animal.imageUrl || urlFromImage || "/images/default_image.jpg";

  return (
    <Layout handleLogout={() => navigate("/login")}>
      <Box maxW="960px" mx="auto" py={8}>
        {/* Imagen y datos del animal */}
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

        {/* Solicitudes */}
        <Heading size="lg" mt={6} mb={4}>
          Solicitudes recibidas ({requests.length})
        </Heading>
        {requests.length === 0 ? (
          <Text color="gray.500">No hay solicitudes pendientes.</Text>
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
                  <VStack align="start" spacing={1} fontSize="sm" color="gray.700">
                    <Text>
                      <b>Nombre:</b> {r.form_data.full_name}
                    </Text>
                    <Text>
                      <b>Dirección:</b> {r.form_data.address}
                    </Text>
                    <Text>
                      <b>Teléfono:</b> {r.form_data.phone}
                    </Text>
                    <Text>
                      <b>Email:</b> {r.form_data.email}
                    </Text>
                    <Text>
                      <b>Motivación:</b> {r.form_data.reason}
                    </Text>
                    {r.form_data.experience && (
                      <Text>
                        <b>Experiencia:</b> {r.form_data.experience}
                      </Text>
                    )}
                    <Text>
                      <b>Otras mascotas:</b>{" "}
                      {r.form_data.has_other_pets
                        ? r.form_data.other_pet_types
                        : "No"}
                    </Text>
                    {r.form_data.references && (
                      <Text>
                        <b>Referencias:</b> {r.form_data.references}
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
                    Rechazar
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        )}

        {/* Diálogo de confirmación de rechazo */}
        <AlertDialog
          isOpen={isRejectOpen}
          leastDestructiveRef={cancelRef}
          onClose={onRejectClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Rechazar solicitud
              </AlertDialogHeader>
              <AlertDialogBody>
                {toReject
                  ? `¿Estás seguro de rechazar la solicitud de "${toReject.user.username}"?`
                  : null}
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onRejectClose}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={handleConfirmReject} ml={3}>
                  Sí, rechazar
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
