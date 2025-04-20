import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import Layout from "../../components/layout";
import { logoutSuccess } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authService";
import { useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendContactMessage, ContactData } from "./contact_services";

const ContactPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [messageError, setMessageError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    setNameError("");
    setEmailError("");
    setMessageError("");

    let valid = true;

    if (!name.trim()) {
      setNameError("Por favor, ingresa tu nombre.");
      valid = false;
    }

    if (!validateEmail(email)) {
      setEmailError("Por favor, ingresa un correo válido.");
      valid = false;
    }

    if (!message.trim()) {
      setMessageError("El mensaje no puede estar vacío.");
      valid = false;
    }

    if (!valid) return;

    const contactData: ContactData = { name, email, message };

    try {
      await sendContactMessage(contactData);

      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Te responderemos pronto.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Limpiar campos
      setName("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      console.error("Error al enviar el mensaje:", error);

      if (error.response?.status === 400) {
        const data = error.response.data;
        toast({
          title: "Error",
          description: data.error || "No se pudo enviar el mensaje.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar el mensaje. Inténtalo más tarde.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Layout handleLogout={handleLogout}>
      <Box
        bg="gray.50" 
        minH="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={4}
      >
        <Card
          w="full"
          maxW="600px"
          boxShadow="lg"
          borderRadius="md"
          bg="white"
          borderColor="teal.300"
        >
          <CardBody p={6}>
            <Heading
              as="h2"
              size="lg"
              textAlign="center"
              mb={4}
              color="teal.500"
            >
              Contáctanos
            </Heading>
            <Text fontSize="md" textAlign="center" mb={6} color="gray.600">
              ¿Tienes alguna pregunta o comentario? Envíanos un mensaje.
            </Text>

            <FormControl isInvalid={!!nameError} mb={4}>
              <FormLabel>Nombre</FormLabel>
              <Input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                borderColor="teal.300"
              />
              {nameError && <FormErrorMessage>{nameError}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!emailError} mb={4}>
              <FormLabel>Correo electrónico</FormLabel>
              <Input
                type="email"
                placeholder="Tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                borderColor="teal.300"
              />
              {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!messageError} mb={4}>
              <FormLabel>Mensaje</FormLabel>
              <Textarea
                placeholder="Escribe tu mensaje aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                borderColor="teal.300"
                rows={5}
              />
              {messageError && (
                <FormErrorMessage>{messageError}</FormErrorMessage>
              )}
            </FormControl>

            <Button
              colorScheme="teal"
              size="md"
              w="full"
              mt={4}
              onClick={handleSubmit}
            >
              Enviar
            </Button>
          </CardBody>
        </Card>
      </Box>
    </Layout>
  );
};

export default ContactPage;
