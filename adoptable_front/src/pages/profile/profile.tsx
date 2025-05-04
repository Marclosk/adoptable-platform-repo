// src/pages/profile/Profile.tsx
import React, { useEffect, useState, useCallback } from "react";
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
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { getProfile, updateProfile } from "./user_services";
import { unadoptAnimal } from "../card_detail/animal_services";

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
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

  const handleUnadopt = async (
    animalId: number,
    animalName: string,
    adopterUsername: string
  ) => {
    const confirmed = window.confirm(
      `¿Confirmas que el animal "${animalName}" ya no está adoptado por ${adopterUsername}?`
    );
    if (!confirmed) return;
    try {
      await unadoptAnimal(animalId);
      toast({
        title: `Animal "${animalName}" desadoptado`,
        status: "success",
      });
      fetchProfile();
    } catch (err: any) {
      console.error("Error al desadoptar:", err);
      toast({
        title: err.message || "Error al desadoptar",
        status: "error",
      });
    }
  };

  if (!profile) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="teal.500" />
        <Text mt={4} color="teal.500" fontSize="xl">
          Cargando tu perfil...
        </Text>
      </Center>
    );
  }

  return (
    <Layout handleLogout={handleLogout}>
      <Box minH="100vh" bg="gray.50" py={10} px={{ base: 6, sm: 8, lg: 12 }}>
        <VStack spacing={8} align="center">
          {/* Tarjeta de perfil */}
          <Box
            bg="white"
            boxShadow="lg"
            p={6}
            borderRadius="lg"
            w="100%"
            maxW="900px"
          >
            {isEditing ? (
              <VStack spacing={5} align="stretch">
                <Heading size="lg" textAlign="center">
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
                    <Image
                      src={preview}
                      boxSize="100px"
                      borderRadius="full"
                      mt={2}
                    />
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>Ubicación</FormLabel>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Biografía</FormLabel>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </FormControl>
                <HStack justify="center" spacing={4}>
                  <Button colorScheme="blue" onClick={handleSave}>
                    Guardar cambios
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack spacing={4} align="center">
                <Avatar size="xl" src={preview} name={profile.username} />
                <Heading size="lg">{profile.username}</Heading>
                <Text>{profile.location || "Ubicación no especificada"}</Text>
                <Text>{profile.phone_number || "Teléfono no disponible"}</Text>
                <Text textAlign="center" maxW="600px">
                  {profile.bio || "Sin biografía aún."}
                </Text>
                <Button
                  leftIcon={<EditIcon />}
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Editar perfil
                </Button>
              </VStack>
            )}
          </Box>

          {/* Secciones según rol */}
          {role === "adoptante" && (
            <>
              {/* Favoritos */}
              <Box
                bg="white"
                boxShadow="lg"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="900px"
              >
                <Heading size="md" mb={4} textAlign="center">
                  Favoritos
                </Heading>
                <Wrap justify="center" spacing={4}>
                  {profile.favorites && profile.favorites.length > 0 ? (
                    profile.favorites.map((fav: any) => (
                      <Tag
                        key={fav.id}
                        size="lg"
                        variant="solid"
                        colorScheme="blue"
                        cursor="pointer"
                        onClick={() => goToAnimal(fav.id)}
                      >
                        <TagLabel>{fav.name}</TagLabel>
                        <TagCloseButton
                          onClick={(e) => {
                            e.stopPropagation();
                            // eliminar favorito si lo implementas
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
                boxShadow="lg"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="900px"
              >
                <Heading size="md" mb={4} textAlign="center">
                  Adoptados
                </Heading>
                <Wrap justify="center" spacing={4}>
                  {profile.adopted && profile.adopted.length > 0 ? (
                    profile.adopted.map((pet: any) => (
                      <Tag
                        key={pet.id}
                        size="lg"
                        variant="solid"
                        colorScheme="green"
                        cursor="pointer"
                        onClick={() => goToAnimal(pet.id)}
                      >
                        <TagLabel>{pet.name}</TagLabel>
                        <TagCloseButton
                          onClick={(e) => {
                            e.stopPropagation();
                            // deshacer adopción desde perfil de adoptante si lo deseas
                          }}
                        />
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
              {/* En adopción */}
              <Box
                bg="white"
                boxShadow="lg"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="900px"
              >
                <Heading size="md" mb={4} textAlign="center">
                  En adopción
                </Heading>
                <Wrap justify="center" spacing={4}>
                  {profile.en_adopcion && profile.en_adopcion.length > 0 ? (
                    profile.en_adopcion.map((a: any) => (
                      <Tag
                        key={a.id}
                        size="lg"
                        variant="solid"
                        colorScheme="blue"
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

              {/* Adoptados con opción de desadoptar */}
              <Box
                bg="white"
                boxShadow="lg"
                p={6}
                borderRadius="lg"
                w="100%"
                maxW="900px"
              >
                <Heading size="md" mb={4} textAlign="center">
                  Adoptados
                </Heading>
                <Wrap justify="center" spacing={4}>
                  {profile.adopted && profile.adopted.length > 0 ? (
                    profile.adopted.map((pet: any) => (
                      <Tag
                        key={pet.id}
                        size="lg"
                        variant="solid"
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
                              handleUnadopt(
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
        </VStack>
      </Box>
    </Layout>
  );
};

export default Profile;
