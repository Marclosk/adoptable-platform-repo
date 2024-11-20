import { useState } from "react";
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
} from "@chakra-ui/react";
import { register } from "../authService";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}[\]|\\:;"'<>,.?/`~-]{8,}$/;
    return regex.test(password);
  };

  const handleRegister = async () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!validateEmail(email)) {
      setEmailError("Por favor, ingresa un correo válido.");
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número."
      );
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden.");
    }

    if (emailError || passwordError || confirmPasswordError) {
      return;
    }

    try {
      const data = await register({ email, password });
      dispatch({ type: "auth/registerSuccess", payload: data.user });
      navigate("/login");
    } catch (err) {
      console.error(err);
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
        maxWidth="400px"
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

          {/* Descripción de la plataforma */}
          <Text fontSize="lg" textAlign="center" mb="6" color="gray.600">
            Crea tu cuenta para adoptar a tu nuevo amigo peludo.
          </Text>

          {/* Formulario de registro */}
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

          {/* Botón de registro */}
          <Button
            colorScheme="teal"
            onClick={handleRegister}
            width="full"
            size="lg"
            mb="6"
          >
            Registrarse
          </Button>

          {/* Botón para volver al login */}
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
