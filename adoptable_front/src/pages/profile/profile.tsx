// src/pages/profile/Profile.tsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { logoutSuccess } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authService";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [petToUnadopt, setPetToUnadopt] = useState<{
    id: number;
    name: string;
    adopter: string;
  } | null>(null);

  const [requestToCancel, setRequestToCancel] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [showAdoptionForm, setShowAdoptionForm] = useState(false);
  const [adopFormValues, setAdopFormValues] = useState<
    Partial<AdoptionFormData>
  >({});

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
    } catch {
      toast({ title: t("error_cargar_perfil"), status: "error" });
      setIsEditing(true);
    }
  }, [t]);

  const toggleAdoptionForm = async () => {
    if (!showAdoptionForm) {
      try {
        const existing = await getAdoptionForm();
        setAdopFormValues({
          fullName: existing.full_name,
          address: existing.address,
          phone: existing.phone,
          email: existing.email,
          motivation: existing.reason,
          hasExperience: existing.experience !== "",
          experienceDescription: existing.experience,
          hasOtherPets: existing.has_other_pets ? "yes" : "no",
          otherPetTypes: existing.other_pet_types,
          references: existing.references,
        });
        setShowAdoptionForm(true);
      } catch {
        toast({ title: t("error_cargar_datos_adopcion"), status: "error" });
      }
    } else {
      setShowAdoptionForm(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      const fd = new FormData();
      if (formData.avatar) fd.append("avatar", formData.avatar);
      fd.append("location", formData.location);
      fd.append("phone_number", formData.phone_number);
      fd.append("bio", formData.bio);

      await updateProfile(fd);
      toast({ title: t("perfil_actualizado"), status: "success" });
      fetchProfile();
      setIsEditing(false);
    } catch {
      toast({ title: t("error_actualizar_perfil"), status: "error" });
    }
  };

  const handleAdoptionSubmit = async (data: AdoptionFormData) => {
    try {
      const payload: AdoptionFormAPI = {
        full_name: data.fullName,
        address: data.address,
        phone: data.phone,
        email: data.email,
        reason: data.motivation,
        experience: data.hasExperience ? data.experienceDescription : "",
        has_other_pets: data.hasOtherPets === "yes",
        other_pet_types: data.hasOtherPets === "yes" ? data.otherPetTypes : "",
        references: data.references,
      };
      await submitAdoptionForm(payload);
      toast({ title: t("formulario_guardado"), status: "success" });
      setShowAdoptionForm(false);
    } catch {
      toast({ title: t("error_guardar_formulario"), status: "error" });
    }
  };

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
        title: t("desadoptacion_exito", { name: petToUnadopt.name }),
        status: "success",
      });
      fetchProfile();
    } catch {
      toast({ title: t("error_desadoptar"), status: "error" });
    } finally {
      closeUnadoptDialog();
    }
  };

  const confirmCancelRequest = async () => {
    if (!requestToCancel) return;
    try {
      await cancelAdoptionRequest(requestToCancel.id);
      toast({
        title: t("solicitud_cancelada", { name: requestToCancel.name }),
        status: "info",
      });
      fetchProfile();
    } catch {
      toast({ title: t("error_cancelar_solicitud"), status: "error" });
    } finally {
      setRequestToCancel(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    dispatch(logoutSuccess());
    navigate("/login");
  };

  const handleRemoveFavorite = async (animalId: number) => {
    try {
      await removeFavorite(animalId);
      toast({ title: t("favorito_eliminado"), status: "info" });
      fetchProfile();
    } catch {
      toast({ title: t("error_eliminar_favorito"), status: "error" });
    }
  };

  if (!profile) {
    return <Loader message={t("cargando_perfil")} />;
  }

  return (
    <Layout handleLogout={handleLogout}>
      <Box minH="100vh" bg="gray.50" py={10} px={{ base: 6, sm: 8, lg: 12 }}>
        <VStack spacing={8} align="center">
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
                  {t("editar_perfil")}
                </Heading>
                <FormControl>
                  <FormLabel>{t("avatar")}</FormLabel>
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
                  <FormLabel>{t("ubicacion")}</FormLabel>
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
                  <FormLabel>{t("telefono")}</FormLabel>
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
                  <FormLabel>{t("biografia")}</FormLabel>
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
                    {t("guardar_cambios")}
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="teal"
                    onClick={() => setIsEditing(false)}
                  >
                    {t("cancelar")}
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
                  {profile.location || t("ubicacion_no_especificada")}
                </Text>
                <Text fontSize="md" color="gray.600">
                  {profile.phone_number || t("telefono_no_disponible")}
                </Text>
                <Text
                  textAlign="center"
                  maxW="600px"
                  color="gray.700"
                  fontSize="lg"
                >
                  {profile.bio || t("sin_biografia")}
                </Text>
                <HStack spacing={4}>
                  <Button
                    leftIcon={<EditIcon />}
                    variant="outline"
                    colorScheme="teal"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    {t("editar_perfil")}
                  </Button>
                  {role === "adoptante" && (
                    <Button
                      colorScheme="purple"
                      size="sm"
                      onClick={toggleAdoptionForm}
                    >
                      {showAdoptionForm
                        ? t("ocultar_formulario")
                        : t("mostrar_formulario_adopcion")}
                    </Button>
                  )}
                </HStack>
              </VStack>
            )}
          </Box>

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
                {t("formulario_adopcion")}
              </Heading>
              <AdoptionForm
                initialValues={adopFormValues}
                onSubmit={handleAdoptionSubmit}
              />
            </Box>
          )}

          {role === "adoptante" && (
            <>
              <Box
                bg="white"
                boxShadow="md"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="800px"
              >
                <Heading size="md" color="teal.600" mb={4} textAlign="center">
                  {t("favoritos")}
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
                            e.stopPropagation();
                            handleRemoveFavorite(fav.id);
                          }}
                        />
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">{t("no_tienes_favoritos")}</Text>
                  )}
                </Wrap>
              </Box>

              <Box
                bg="white"
                boxShadow="md"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="800px"
              >
                <Heading size="md" color="teal.600" mb={4} textAlign="center">
                  {t("adoptados_perfil")}
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
                    <Text color="gray.500">{t("no_has_adoptado")}</Text>
                  )}
                </Wrap>
              </Box>

              <Box
                bg="white"
                boxShadow="md"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="800px"
              >
                <Heading size="md" color="teal.600" mb={4} textAlign="center">
                  {t("solicitudes_adopcion_perfil")}
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
                            setRequestToCancel({
                              id: req.id,
                              name: req.animal.name,
                            });
                          }}
                        />
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">{t("no_has_solicitado")}</Text>
                  )}
                </Wrap>
              </Box>
            </>
          )}

          {role === "protectora" && (
            <>
              <Box
                bg="white"
                boxShadow="md"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="800px"
              >
                <Heading size="md" color="teal.600" mb={4} textAlign="center">
                  {t("en_adopcion")}
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
                        onClick={() => navigate(`/animals/${a.id}/requests`)}
                      >
                        <TagLabel>{a.name}</TagLabel>
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">{t("no_perros_en_adopcion")}</Text>
                  )}
                </Wrap>
              </Box>

              <Box
                bg="white"
                boxShadow="md"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="800px"
              >
                <Heading size="md" color="teal.600" mb={4} textAlign="center">
                  {t("adoptados_protectora")}
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
                                pet.adopter_username!
                              )
                            }
                          />
                        </HStack>
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">{t("no_completado_adopcion")}</Text>
                  )}
                </Wrap>
              </Box>
            </>
          )}

          <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={closeUnadoptDialog}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  {t("confirmar_desadopcion")}
                </AlertDialogHeader>
                <AlertDialogBody>
                  {petToUnadopt &&
                    t("confirmar_desadopcion_text", {
                      name: petToUnadopt.name,
                      adopter: petToUnadopt.adopter,
                    })}
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={closeUnadoptDialog}>
                    {t("cancelar")}
                  </Button>
                  <Button colorScheme="red" onClick={confirmUnadopt} ml={3}>
                    {t("si_desadoptar")}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          <AlertDialog
            isOpen={!!requestToCancel}
            leastDestructiveRef={cancelRef}
            onClose={() => setRequestToCancel(null)}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  {t("cancelar_solicitud")}
                </AlertDialogHeader>
                <AlertDialogBody>
                  {t("confirmar_cancelar_solicitud_text", {
                    name: requestToCancel?.name,
                  })}
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button
                    ref={cancelRef}
                    onClick={() => setRequestToCancel(null)}
                  >
                    {t("cancelar")}
                  </Button>
                  <Button
                    colorScheme="orange"
                    onClick={confirmCancelRequest}
                    ml={3}
                  >
                    {t("si_cancelar")}
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
