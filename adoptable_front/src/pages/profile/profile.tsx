import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useDispatch } from "react-redux";
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

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Datos del formulario
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

  // Vista previa del avatar
  const [preview, setPreview] = useState<string>("");

  const toast = useToast();
  const username = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let data = await getProfile();

        if (!data || Object.keys(data).length === 0) {
          // Si el perfil está vacío, entramos en modo edición
          setIsEditing(true);
        } else {
          setProfile(data);
          // Guardamos la URL del avatar actual en preview
          setPreview(data.avatar || "");
          setFormData({
            avatar: null, // Este campo se rellena sólo si el usuario sube un archivo
            location: data.location || "",
            phone_number: data.phone_number || "",
            bio: data.bio || "",
          });
        }
      } catch (error) {
        console.error("Error al obtener perfil:", error);
        setIsEditing(true);
      }
    };
    fetchProfile();
  }, [username]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
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
      setPreview(URL.createObjectURL(file)); // Mostramos vista previa del nuevo avatar
    }
  };

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      if (formData.avatar) {
        formDataToSend.append("avatar", formData.avatar);
      }
      formDataToSend.append("location", formData.location);
      formDataToSend.append("phone_number", formData.phone_number);
      formDataToSend.append("bio", formData.bio);

      const updatedData = await updateProfile(formDataToSend);
      setProfile(updatedData);
      setIsEditing(false);

      // Actualizamos la vista previa con la nueva imagen si el usuario la cambió
      if (updatedData.avatar) {
        setPreview(updatedData.avatar);
      }

      toast({
        title: "Perfil actualizado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast({
        title: "Error al actualizar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Layout handleLogout={handleLogout}>
      <Box
        minHeight="100vh"
        bg="gray.50"
        py={10}
        px={{ base: 6, sm: 8, lg: 12 }}
      >
        {/* Si no hay perfil (todavía cargando) */}
        {!profile ? (
          <Center height="100vh">
            <Spinner size="xl" color="teal.500" />
            <Text mt={4} color="teal.500" fontSize="xl">
              Cargando tu perfil...
            </Text>
          </Center>
        ) : (
          <VStack spacing={8} align="center">
            {/* Tarjeta de perfil */}
            <Box
              bg="white"
              boxShadow="lg"
              p={6}
              borderRadius="lg"
              width="100%"
              maxW="900px"
            >
              {isEditing ? (
                // MODO EDICIÓN
                <VStack spacing={5} align="stretch">
                  <Heading as="h2" size="lg" color="gray.800" textAlign="center">
                    Editar Perfil
                  </Heading>
                  <FormControl>
                    <FormLabel>Avatar</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      borderColor="gray.300"
                    />
                    {preview && (
                      <Image
                        src={preview}
                        alt="Vista previa avatar"
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
                  <HStack justifyContent="center" spacing={4}>
                    <Button colorScheme="blue" onClick={handleSave}>
                      Guardar cambios
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                // MODO VISTA
                <VStack spacing={4} align="center">
                  <Avatar
                    size="xl"
                    src={preview}
                    name={profile.username}
                    border="4px solid #edf2f7"
                    boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                  />
                  <Heading as="h2" size="lg" fontWeight="bold" color="gray.800">
                    {profile.username}
                  </Heading>
                  <Text fontSize="md" color="gray.500">
                    {profile.location || "Ubicación no especificada"}
                  </Text>
                  <Text fontSize="md" color="gray.500">
                    {profile.phone_number || "Teléfono no disponible"}
                  </Text>
                  <Text
                    fontSize="lg"
                    color="gray.700"
                    textAlign="center"
                    maxW="600px"
                  >
                    {profile.bio || "Sin biografía aún."}
                  </Text>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    leftIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    borderRadius="full"
                    px={8}
                  >
                    Editar perfil
                  </Button>
                </VStack>
              )}
            </Box>

            {/* Favoritos */}
            <Box
              bg="white"
              boxShadow="lg"
              p={6}
              borderRadius="lg"
              width="100%"
              maxW="900px"
            >
              <Heading size="md" mb={4} color="gray.800" textAlign="center">
                Favoritos
              </Heading>
              <Wrap spacing={4} justify="center">
                {profile.favorites && profile.favorites.length > 0 ? (
                  profile.favorites.map((favorite: string) => (
                    <Tag key={favorite} size="lg" colorScheme="blue" variant="solid">
                      <TagLabel>{favorite}</TagLabel>
                      <TagCloseButton />
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
              width="100%"
              maxW="900px"
            >
              <Heading size="md" mb={4} color="gray.800" textAlign="center">
                Adoptados
              </Heading>
              <Wrap spacing={4} justify="center">
                {profile.adopted && profile.adopted.length > 0 ? (
                  profile.adopted.map((adoptedPet: string) => (
                    <Tag
                      key={adoptedPet}
                      size="lg"
                      colorScheme="green"
                      variant="solid"
                    >
                      <TagLabel>{adoptedPet}</TagLabel>
                      <TagCloseButton />
                    </Tag>
                  ))
                ) : (
                  <Text color="gray.500">
                    No has adoptado ningún animal aún.
                  </Text>
                )}
              </Wrap>
            </Box>
          </VStack>
        )}
      </Box>
    </Layout>
  );
};

export default Profile;
