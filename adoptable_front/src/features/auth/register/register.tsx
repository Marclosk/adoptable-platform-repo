import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Box,
  FormErrorMessage,
  Card,
  CardBody,
  Heading,
  Text,
  Flex,
  Select,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import axios from "axios"; 
import { register } from "../authService";

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [serverError, setServerError] = useState("");

  const [role, setRole] = useState<"adoptante" | "protectora">("adoptante");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [shelterName, setShelterName] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [protectoraUsername, setProtectoraUsername] = useState("");
  const [protectoraUsernameError, setProtectoraUsernameError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}[\]|\\:;"'<>,.?/`~-]{8,}$/;
    return regex.test(password);
  };

  const clearErrors = () => {
    setServerError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setUsernameError("");
    setProtectoraUsernameError("");
  };

  const handleRegister = async () => {
    clearErrors();

    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Por favor, ingresa un correo válido.");
      valid = false;
    }
    if (!validatePassword(password)) {
      setPasswordError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número."
      );
      valid = false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden.");
      valid = false;
    }

    if (role === "adoptante") {
      if (!/^[A-Za-z0-9@.+-_]+$/.test(username)) {
        setUsernameError(
          "El nombre de usuario solo puede contener letras, números y @/./+/-/_"
        );
        valid = false;
      }
    } else {
      if (!/^[A-Za-z0-9@.+-_]+$/.test(protectoraUsername)) {
        setProtectoraUsernameError(
          "El nombre de usuario solo puede contener letras, números y @/./+/-/_"
        );
        valid = false;
      }
    }

    if (!valid) return;

    try {
      if (role === "adoptante") {
        await register({
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role: "adoptante",
        });
      } else {
        await register({
          username: protectoraUsername,
          email,
          password,
          first_name: "",
          last_name: "",
          role: "protectora",
          localidad,
          shelter_name: shelterName,
        });
      }

      toast({
        title: "Registro exitoso",
        description:
          role === "protectora"
            ? "Se ha enviado la solicitud de protectora. Espera aprobación."
            : "¡Te has registrado correctamente!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/login");
    } catch (error: any) {
      console.error("❌ Error en el servidor:", error);
    
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const data = error.response.data;
        console.log("[DEBUG] error.response.data:", data);
    
        if (data.username && Array.isArray(data.username)) {
          const detail = data.username[0];
    
          if (typeof detail === "object" && detail.string) {
            console.log("[DEBUG] detail.string:", detail.string);
            if (detail.string.toLowerCase().includes("already exists")) {
              setProtectoraUsernameError("Ese nombre de usuario ya está en uso.");
            } else {
              setProtectoraUsernameError(detail.string);
            }
          } else if (typeof detail === "string") {
            console.log("[DEBUG] detail:", detail);
            if (detail.toLowerCase().includes("already exists")) {
              setProtectoraUsernameError("Ese nombre de usuario ya está en uso.");
            } else {
              setProtectoraUsernameError(detail);
            }
          }
        }
    
        if (data.email && Array.isArray(data.email)) {
          const detail = data.email[0];
          if (typeof detail === "object" && detail.string) {
            setEmailError(detail.string);
          } else if (typeof detail === "string") {
            setEmailError(detail);
          }
        }
    
        if (data.password && Array.isArray(data.password)) {
          const detail = data.password[0];
          if (typeof detail === "object" && detail.string) {
            setPasswordError(detail.string);
          } else if (typeof detail === "string") {
            setPasswordError(detail);
          }
        }
    
        if (!data.username && !data.email && !data.password) {
          setServerError(JSON.stringify(data));
        }
      } else {
        setServerError(error.message || "Error en el servidor");
      }
    }
    
    
  };

  const goBackToLogin = () => {
    navigate("/login");
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#DDD2B5"
    >
      <Card
        maxWidth="600px"
        width="full"
        boxShadow="lg"
        borderRadius="md"
        bg="white"
        borderColor="teal.300"
        p="6"
      >
        <CardBody>
          <Heading as="h2" size="lg" textAlign="center" mb="6" color="teal.500">
            Registrarse
          </Heading>

          <Text fontSize="lg" textAlign="center" mb="6" color="gray.600">
            Selecciona tu tipo de cuenta y rellena los campos requeridos.
          </Text>

          {serverError && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {serverError}
            </Alert>
          )}

          <FormControl mb="6">
            <FormLabel>¿Eres adoptante o protectora?</FormLabel>
            <Select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "adoptante" | "protectora")
              }
              borderColor="teal.300"
            >
              <option value="adoptante">Adoptante</option>
              <option value="protectora">Protectora</option>
            </Select>
          </FormControl>

          <FormControl isInvalid={!!emailError} mb="4">
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              borderColor="teal.300"
            />
            {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!passwordError} mb="4">
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              borderColor="teal.300"
            />
            {passwordError && (
              <FormErrorMessage>{passwordError}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!confirmPasswordError} mb="6">
            <FormLabel>Confirmar Contraseña</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              borderColor="teal.300"
            />
            {confirmPasswordError && (
              <FormErrorMessage>{confirmPasswordError}</FormErrorMessage>
            )}
          </FormControl>

          {role === "adoptante" && (
            <>
              <FormControl isInvalid={!!usernameError} mb="4">
                <FormLabel>Nombre de usuario</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej. juan_perez"
                  borderColor="teal.300"
                />
                {usernameError && (
                  <FormErrorMessage>{usernameError}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl mb="4">
                <FormLabel>Nombre</FormLabel>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  borderColor="teal.300"
                />
              </FormControl>

              <FormControl mb="6">
                <FormLabel>Apellido</FormLabel>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  borderColor="teal.300"
                />
              </FormControl>
            </>
          )}

          {role === "protectora" && (
            <>
              <FormControl mb="4">
                <FormLabel>Nombre de la protectora</FormLabel>
                <Input
                  type="text"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
                  placeholder="Ej. Abam i Apropat"
                  borderColor="teal.300"
                />
              </FormControl>

              <FormControl isInvalid={!!protectoraUsernameError} mb="4">
                <FormLabel>Username de protectora</FormLabel>
                <Input
                  type="text"
                  value={protectoraUsername}
                  onChange={(e) => setProtectoraUsername(e.target.value)}
                  placeholder="Ej. abam_apropat"
                  borderColor="teal.300"
                />
                {protectoraUsernameError && (
                  <FormErrorMessage>{protectoraUsernameError}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl mb="6">
                <FormLabel>Localidad</FormLabel>
                <Input
                  type="text"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  placeholder="Ej. Barcelona, Madrid..."
                  borderColor="teal.300"
                />
              </FormControl>
            </>
          )}

          <Button
            colorScheme="teal"
            onClick={handleRegister}
            width="full"
            size="lg"
            mb="6"
          >
            Registrarse
          </Button>

          <Flex justify="center">
            <Button variant="link" color="teal.500" onClick={goBackToLogin}>
              Volver al Login
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Register;
