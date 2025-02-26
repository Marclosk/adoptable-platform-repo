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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  useToast,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { getProfile, updateProfile } from "./user_services";
import { EditIcon } from "@chakra-ui/icons";

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    avatar: "",
    location: "",
    phone_number: "",
    bio: "",
  });

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toast = useToast();

  const username = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let data = await getProfile();
        if (!data || Object.keys(data).length === 0) {
          setIsEditing(true);
        } else {
          setProfile(data);
          setFormData({
            avatar: data.avatar || "",
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (username) {
        const updatedData = await updateProfile(formData);
        setProfile(updatedData);
        setIsEditing(false);
        toast({
          title: "Perfil actualizado",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("No se puede actualizar el perfil sin un username");
      }
    } catch (error) {
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
      <Box minHeight="100vh" p={6} bg="#f8f9fa" mx="auto">
        {profile ? (
          <VStack align="center" spacing={6}>
            <Avatar
              size="2xl"
              src={profile.avatar}
              name={profile.username}
              mb={4}
            />
            <Heading as="h2" size="lg" fontWeight="semibold" color="gray.800">
              {profile.username}
            </Heading>
            <Text fontSize="md" color="gray.500">
              {profile.location || "Ubicación no especificada"}
            </Text>
            <Text fontSize="md" color="gray.600">
              {profile.phone_number || "Teléfono no disponible"}
            </Text>
            <Text textAlign="center" color="gray.700">
              {profile.bio || "Sin biografía aún."}
            </Text>

            <Button
              colorScheme="blue"
              variant="outline"
              size="sm"
              leftIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Editar perfil
            </Button>
          </VStack>
        ) : (
          <Center height="100vh">
            <Spinner size="xl" color="teal.500" />
            <Text mt={4} color="teal.500" fontSize="xl">
              Verificando sesión...
            </Text>
          </Center>
        )}

        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {profile ? "Editar Perfil" : "Crear Perfil"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Avatar (URL)</FormLabel>
                  <Input
                    name="avatar"
                    placeholder="URL del Avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    borderColor="gray.300"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Ubicación</FormLabel>
                  <Input
                    name="location"
                    placeholder="Ubicación"
                    value={formData.location}
                    onChange={handleChange}
                    borderColor="gray.300"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    name="phone_number"
                    placeholder="Teléfono"
                    value={formData.phone_number}
                    onChange={handleChange}
                    borderColor="gray.300"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Biografía</FormLabel>
                  <Textarea
                    name="bio"
                    placeholder="Biografía"
                    value={formData.bio}
                    onChange={handleChange}
                    borderColor="gray.300"
                  />
                </FormControl>
                <Button
                  colorScheme="blue"
                  width="full"
                  onClick={handleSave}
                  size="lg"
                >
                  {profile ? "Guardar cambios" : "Crear perfil"}
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
};

export default Profile;
