// src/pages/profile/Profile.tsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { logoutSuccess } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authService";
import Layout from "../../components/layout";
import Loader from "../../components/loader/loader";
import {
  Box,
  Avatar,
  Text,
  Button,
  Input,
  Textarea,
  useToast,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  HStack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import {
  getProfile,
  updateProfile,
  getAdoptionForm,
  submitAdoptionForm,
  AdoptionFormAPI,
} from "./user_services";
import {
  unadoptAnimal,
  cancelAdoptionRequest,
  removeFavorite,
} from "../card_detail/animal_services";
import {
  AdoptionForm,
  AdoptionFormData,
} from "../../components/adoption_form/adoption_form";

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { user: authUser, role } = useSelector(
    (state: RootState) => state.auth
  );

  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    avatar: File | null;
    location: string;
    phone_number: string;
    bio: string;
  }>({
    avatar: null,
    location: "",
    phone_number: "",
    bio: "",
  });
  const [preview, setPreview] = useState<string>("");

  // AlertDialog para desadoptar
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [petToUnadopt, setPetToUnadopt] = useState<{
    id: number;
    name: string;
    adopter: string;
  } | null>(null);

  // AlertDialog para cancelar solicitud
  const [requestToCancel, setRequestToCancel] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Inline AdoptionForm toggle
  const [showAdoptionForm, setShowAdoptionForm] = useState(false);
  const [adopFormValues, setAdopFormValues] = useState<
    Partial<AdoptionFormData>
  >({});

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setPreview(data.avatar || "");
      setFormData({
        avatar: null,
        location: data.location || "",
        phone_number: data.phone_number || "",
        bio: data.bio || "",
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error al obtener perfil:", err);
      setIsEditing(true);
    }
  }, [authUser]);

  // src/pages/profile/Profile.tsx

  const toggleAdoptionForm = async () => {
    if (!showAdoptionForm) {
      try {
        console.log("🖱️ Cargando datos de adopción…");
        const existing = await getAdoptionForm();
        console.log("✅ Datos recibidos:", existing);

        setAdopFormValues({
          fullName:            existing.full_name,
          address:             existing.address,
          phone:               existing.phone,
          email:               existing.email,
          motivation:          existing.reason,
          hasExperience:       existing.experience !== "",
          experienceDescription: existing.experience,
          hasOtherPets:        existing.has_other_pets ? "yes" : "no",
          otherPetTypes:       existing.other_pet_types,
          references:          existing.references,
        });

        setShowAdoptionForm(true);
      } catch (err) {
        console.error("❌ Error al cargar formulario:", err);
        toast({
          title: "No se pudieron cargar los datos previos",
          status: "error",
        });
      }
    } else {
      setShowAdoptionForm(false);
    }
  };

  const loadAdoptionForm = useCallback(async () => {
    try {
      const existing = await getAdoptionForm(); // ya desenvuelto
      setAdopFormValues({
        fullName: existing.full_name || "",
        address: existing.address || "",
        phone: existing.phone || "",
        email: existing.email || "",
        motivation: existing.reason || "",
        hasExperience: !!existing.experience,
        experienceDescription: existing.experience || "",
        hasOtherPets: existing.has_other_pets ? "yes" : "no",
        otherPetTypes: existing.other_pet_types || "",
        references: existing.references || "",
      });
    } catch (err) {
      console.error("❌ loadAdoptionForm error", err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Save profile changes
  const handleSave = async () => {
    try {
      const fd = new FormData();
      if (formData.avatar) fd.append("avatar", formData.avatar);
      fd.append("location", formData.location);
      fd.append("phone_number", formData.phone_number);
      fd.append("bio", formData.bio);

      await updateProfile(fd);
      toast({ title: "Perfil actualizado", status: "success" });
      fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error al actualizar perfil", status: "error" });
    }
  };

// Profile.tsx (o donde esté definido)

const handleAdoptionSubmit = async (data: AdoptionFormData) => {
  try {
    // construimos el objeto EXACTO que espera el backend
    const payload: AdoptionFormAPI = {
      full_name:       data.fullName,
      address:         data.address,
      phone:           data.phone,
      email:           data.email,
      reason:          data.motivation,
      experience:      data.hasExperience
                          ? data.experienceDescription
                          : "",
      has_other_pets:  data.hasOtherPets === "yes",
      other_pet_types: data.hasOtherPets === "yes"
                          ? data.otherPetTypes
                          : "",
      references:      data.references,
    };

    await submitAdoptionForm(payload);
    toast({ title: "Formulario guardado", status: "success" });
    setShowAdoptionForm(false);
  } catch (err) {
    console.error("Error al guardar formulario:", err);
    toast({ title: "Error al guardar formulario", status: "error" });
  }
};


  // Desadoptar
  const openUnadoptDialog = (id: number, name: string, adopter: string) => {
    setPetToUnadopt({ id, name, adopter });
    setIsAlertOpen(true);
  };
  const closeUnadoptDialog = () => {
    setIsAlertOpen(false);
    setPetToUnadopt(null);
  };
  const confirmUnadopt = async () => {
    if (!petToUnadopt) return;
    try {
      await unadoptAnimal(petToUnadopt.id);
      toast({
        title: `Animal "${petToUnadopt.name}" desadoptado`,
        status: "success",
      });
      fetchProfile();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error al desadoptar", status: "error" });
    } finally {
      closeUnadoptDialog();
    }
  };

  // Cancelar solicitud de adopción
  const openCancelRequestDialog = (id: number, name: string) => {
    setRequestToCancel({ id, name });
  };
  const confirmCancelRequest = async () => {
    if (!requestToCancel) return;
    try {
      await cancelAdoptionRequest(requestToCancel.id);
      toast({
        title: `Solicitud de "${requestToCancel.name}" cancelada`,
        status: "info",
      });
      fetchProfile();
    } catch (err) {
      console.error(err);
      toast({ title: "Error al cancelar solicitud", status: "error" });
    } finally {
      setRequestToCancel(null);
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    dispatch(logoutSuccess());
    navigate("/login");
  };

  const handleRemoveFavorite = async (animalId: number) => {
    try {
      await removeFavorite(animalId);
      toast({ title: "Favorito eliminado", status: "info" });
      fetchProfile();
    } catch (err) {
      console.error(err);
      toast({ title: "Error al eliminar favorito", status: "error" });
    }
  };

  if (!profile) {
    return <Loader message="Cargando perfil…" />;
  }

  return (
    <Layout handleLogout={handleLogout}>
      <Box minH="100vh" bg="gray.50" py={10} px={{ base: 6, sm: 8, lg: 12 }}>
        <VStack spacing={8} align="center">
          {/* Tarjeta Perfil */}
          <Box
            bg="white"
            boxShadow="md"
            p={8}
            borderRadius="lg"
            w="100%"
            maxW="800px"
            borderTop="4px solid"
            borderTopColor="teal.400"
          >
            {isEditing ? (
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="teal.600" textAlign="center">
                  Editar Perfil
                </Heading>
                <FormControl>
                  <FormLabel>Avatar</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData((f) => ({ ...f, avatar: file }));
                        setPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {preview && (
                    <Avatar
                      src={preview}
                      boxSize="100px"
                      mt={2}
                      border="2px solid"
                      borderColor="teal.200"
                    />
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>Ubicación</FormLabel>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, location: e.target.value }))
                    }
                    focusBorderColor="teal.300"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        phone_number: e.target.value,
                      }))
                    }
                    focusBorderColor="teal.300"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Biografía</FormLabel>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, bio: e.target.value }))
                    }
                    focusBorderColor="teal.300"
                  />
                </FormControl>
                <HStack justify="center" spacing={4}>
                  <Button colorScheme="teal" onClick={handleSave}>
                    Guardar cambios
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="teal"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack spacing={6} align="center">
                <Avatar
                  size="2xl"
                  src={preview}
                  name={profile.username}
                  border="2px solid"
                  borderColor="teal.200"
                />
                <Heading size="xl" color="teal.600">
                  {profile.username}
                </Heading>
                <Text fontSize="md" color="gray.600">
                  {profile.location || "Ubicación no especificada"}
                </Text>
                <Text fontSize="md" color="gray.600">
                  {profile.phone_number || "Teléfono no disponible"}
                </Text>
                <Text
                  textAlign="center"
                  maxW="600px"
                  color="gray.700"
                  fontSize="lg"
                >
                  {profile.bio || "Sin biografía aún."}
                </Text>
                <HStack spacing={4}>
                  <Button
                    leftIcon={<EditIcon />}
                    variant="outline"
                    colorScheme="teal"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar perfil
                  </Button>

                  {role === "adoptante" && (
                    <Button
                      colorScheme="purple"
                      size="sm"
                      onClick={toggleAdoptionForm}
                    >
                      {showAdoptionForm
                        ? "Ocultar formulario"
                        : "Formulario adopción"}
                    </Button>
                  )}
                </HStack>
              </VStack>
            )}
          </Box>

          {/* Inline AdoptionForm */}
          {role === "adoptante" && showAdoptionForm && (
            <Box
              bg="white"
              boxShadow="md"
              p={6}
              borderRadius="lg"
              w="100%"
              maxW="800px"
            >
              <Heading size="md" color="teal.600" mb={4} textAlign="center">
                Formulario de Adopción
              </Heading>
              <AdoptionForm
                initialValues={adopFormValues}
                onSubmit={handleAdoptionSubmit}
              />
            </Box>
          )}

          {/* Secciones Adoptante */}
          {role === "adoptante" && (
            <>
              {/* Favoritos */}
              <Box
                bg="white"
                boxShadow="md"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="800px"
              >
                <Heading size="md" color="teal.600" mb={4} textAlign="center">
                  Favoritos
                </Heading>
                <Wrap justify="center" spacing={3}>
                  {profile.favorites?.length > 0 ? (
                    profile.favorites.map((fav: any) => (
                      <Tag
                        key={fav.id}
                        size="md"
                        variant="subtle"
                        colorScheme="teal"
                        cursor="pointer"
                        onClick={() => navigate(`/card_detail/${fav.id}`)}
                      >
                        <TagLabel>{fav.name}</TagLabel>
                        <TagCloseButton
                          onClick={(e) => {
                            e.stopPropagation(); // evita el onClick del Tag
                            handleRemoveFavorite(fav.id); // llama a tu servicio
                          }}
                        />
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">No tienes favoritos aún.</Text>
                  )}
                </Wrap>
              </Box>

              {/* Adoptados */}
              <Box
                bg="white"
                boxShadow="md"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="800px"
              >
                <Heading size="md" color="teal.600" mb={4} textAlign="center">
                  Adoptados
                </Heading>
                <Wrap justify="center" spacing={3}>
                  {profile.adopted?.length > 0 ? (
                    profile.adopted.map((pet: any) => (
                      <Tag
                        key={pet.id}
                        size="md"
                        variant="subtle"
                        colorScheme="green"
                        cursor="pointer"
                        onClick={() => navigate(`/card_detail/${pet.id}`)}
                      >
                        <TagLabel>{pet.name}</TagLabel>
                        <TagCloseButton onClick={(e) => e.stopPropagation()} />
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">
                      No has adoptado ningún animal aún.
                    </Text>
                  )}
                </Wrap>
              </Box>

              {/* Solicitudes de adopción */}
              <Box
                bg="white"
                boxShadow="md"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="800px"
              >
                <Heading size="md" color="teal.600" mb={4} textAlign="center">
                  Solicitudes de adopción
                </Heading>
                <Wrap justify="center" spacing={3}>
                  {profile.requests?.length > 0 ? (
                    profile.requests.map((req: any) => (
                      <Tag
                        key={req.id}
                        size="md"
                        variant="subtle"
                        colorScheme="orange"
                        cursor="pointer"
                        onClick={() =>
                          navigate(`/card_detail/${req.animal.id}`)
                        }
                      >
                        <TagLabel>{req.animal.name}</TagLabel>
                        <TagCloseButton
                          onClick={(e) => {
                            e.stopPropagation();
                            openCancelRequestDialog(req.id, req.animal.name);
                          }}
                        />
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">
                      No has solicitado ninguna adopción.
                    </Text>
                  )}
                </Wrap>
              </Box>
            </>
          )}

          {/* Secciones Protectora */}
          {role === "protectora" && (
            <>
              {/* En adopción */}
              <Box
                bg="white"
                boxShadow="md"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="800px"
              >
                <Heading size="md" color="teal.600" mb={4} textAlign="center">
                  En adopción
                </Heading>
                <Wrap justify="center" spacing={3}>
                  {profile.en_adopcion?.length > 0 ? (
                    profile.en_adopcion.map((a: any) => (
                      <Tag
                        key={a.id}
                        size="md"
                        variant="subtle"
                        colorScheme="orange"
                        cursor="pointer"
                        onClick={() => navigate(`/card_detail/${a.id}`)}
                      >
                        <TagLabel>{a.name}</TagLabel>
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">No tienes perros en adopción.</Text>
                  )}
                </Wrap>
              </Box>

              {/* Adoptados */}
              <Box
                bg="white"
                boxShadow="md"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="800px"
              >
                <Heading size="md" color="teal.600" mb={4} textAlign="center">
                  Adoptados
                </Heading>
                <Wrap justify="center" spacing={3}>
                  {profile.adopted?.length > 0 ? (
                    profile.adopted.map((pet: any) => (
                      <Tag
                        key={pet.id}
                        size="md"
                        variant="subtle"
                        colorScheme="green"
                      >
                        <HStack spacing={2}>
                          <TagLabel
                            cursor="pointer"
                            onClick={() => navigate(`/card_detail/${pet.id}`)}
                          >
                            {pet.name}
                          </TagLabel>
                          <TagCloseButton
                            onClick={() =>
                              openUnadoptDialog(
                                pet.id,
                                pet.name,
                                pet.adopter_username
                              )
                            }
                          />
                        </HStack>
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">
                      No se ha completado ninguna adopción aún.
                    </Text>
                  )}
                </Wrap>
              </Box>
            </>
          )}

          {/* AlertDialog: Confirmar desadopción */}
          <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={closeUnadoptDialog}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Confirmar desadopción
                </AlertDialogHeader>
                <AlertDialogBody>
                  {petToUnadopt &&
                    `¿Estás seguro de que "${petToUnadopt.name}" ya no está adoptado por ${petToUnadopt.adopter}?`}
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={closeUnadoptDialog}>
                    Cancelar
                  </Button>
                  <Button colorScheme="red" onClick={confirmUnadopt} ml={3}>
                    Sí, desadoptar
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          {/* AlertDialog: Confirmar cancelar solicitud */}
          <AlertDialog
            isOpen={!!requestToCancel}
            leastDestructiveRef={cancelRef}
            onClose={() => setRequestToCancel(null)}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Cancelar solicitud
                </AlertDialogHeader>
                <AlertDialogBody>
                  ¿Eliminar la solicitud de adopción de "{requestToCancel?.name}
                  "?
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button
                    ref={cancelRef}
                    onClick={() => setRequestToCancel(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="orange"
                    onClick={confirmCancelRequest}
                    ml={3}
                  >
                    Sí, cancelar
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </VStack>
      </Box>
    </Layout>
  );
};

export default Profile;
