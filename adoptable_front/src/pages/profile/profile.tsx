import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { logoutSuccess } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authService";
import Layout from "../../components/layout";
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
  Center,
  Spinner,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  Image,
  HStack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { getProfile, updateProfile } from "./user_services";
import { unadoptAnimal } from "../card_detail/animal_services";

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

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [petToUnadopt, setPetToUnadopt] = useState<{
    id: number;
    name: string;
    adopter: string;
  } | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      if (!data || Object.keys(data).length === 0) {
        setIsEditing(true);
      } else {
        setProfile(data);
        setPreview(data.avatar || "");
        setFormData({
          avatar: null,
          location: data.location || "",
          phone_number: data.phone_number || "",
          bio: data.bio || "",
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error al obtener perfil:", err);
      setIsEditing(true);
    }
  }, [authUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const fd = new FormData();
      if (formData.avatar) fd.append("avatar", formData.avatar);
      fd.append("location", formData.location);
      fd.append("phone_number", formData.phone_number);
      fd.append("bio", formData.bio);

      const updated = await updateProfile(fd);
      setProfile(updated);
      setIsEditing(false);
      if (updated.avatar) setPreview(updated.avatar);
      toast({
        title: "Perfil actualizado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      toast({
        title: "Error al actualizar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const goToAnimal = (animalId: number) => {
    navigate(`/card_detail/${animalId}`);
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
        title: `Animal "${petToUnadopt.name}" desadoptado`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchProfile();
    } catch (err: any) {
      console.error("Error al desadoptar:", err);
      toast({
        title: err.message || "Error al desadoptar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      closeUnadoptDialog();
    }
  };

  if (!profile) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="teal.400" />
        <Text mt={4} color="teal.400" fontSize="xl">
          Cargando tu perfil...
        </Text>
      </Center>
    );
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
                  Editar Perfil
                </Heading>
                <FormControl>
                  <FormLabel>Avatar</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
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
                    onChange={handleChange}
                    focusBorderColor="teal.300"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    focusBorderColor="teal.300"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Biografía</FormLabel>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
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
                <Button
                  leftIcon={<EditIcon />}
                  variant="outline"
                  colorScheme="teal"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Editar perfil
                </Button>
              </VStack>
            )}
          </Box>

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
                        onClick={() => goToAnimal(fav.id)}
                      >
                        <TagLabel>{fav.name}</TagLabel>
                        <TagCloseButton onClick={(e) => e.stopPropagation()} />
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">No tienes favoritos aún.</Text>
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
                        onClick={() => goToAnimal(pet.id)}
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
                        onClick={() => goToAnimal(a.id)}
                      >
                        <TagLabel>{a.name}</TagLabel>
                      </Tag>
                    ))
                  ) : (
                    <Text color="gray.500">No tienes perros en adopción.</Text>
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
                            onClick={() => goToAnimal(pet.id)}
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
        </VStack>
      </Box>
    </Layout>
  );
};

export default Profile;
