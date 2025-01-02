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
import { loginSuccess, loginFailure } from "../authSlice";
import { login } from "../authService";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}[\]|\\:;"'<>,.?/`~-]{8,}$/;
    return regex.test(password);
  };

  const handleLogin = async () => {
    setPasswordError("");

    if (!validatePassword(password)) {
      setPasswordError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número."
      );
    }

    if (passwordError) {
      return;
    }

    try {
      console.log("Intentando iniciar sesión..."); 
      await login({ username, password });
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        dispatch(loginFailure(err.message));
        console.error("Error durante el inicio de sesión:");
        console.error(err.message);
      } else {
        const unknownError = "Error desconocido durante el inicio de sesión.";
        dispatch(loginFailure(unknownError));
        console.error(unknownError);
      }
    } finally {
      console.log("Fin del proceso de inicio de sesión."); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const goToRegister = () => {
    navigate("/register");
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
            Iniciar sesión
          </Heading>

          {/* Descripción de la plataforma */}
          <Text fontSize="lg" textAlign="center" mb="6" color="gray.600">
            Bienvenido a nuestra plataforma de adopción de perros. Conéctate
            para encontrar a tu nuevo amigo peludo.
          </Text>

          {/* Formulario de login */}
          <FormControl mb="4">
            <FormLabel>Nombre de usuario</FormLabel>
            <Input
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              borderColor="teal.300"
            />
          </FormControl>

          <FormControl isInvalid={!!passwordError} mb="6">
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              onKeyDown={handleKeyDown}
              borderColor="teal.300"
            />
            {passwordError && (
              <FormErrorMessage>{passwordError}</FormErrorMessage>
            )}
          </FormControl>

          {/* Botón de inicio de sesión */}
          <Button
            colorScheme="teal"
            onClick={handleLogin}
            width="full"
            size="lg"
            mb="6"
          >
            Iniciar sesión
          </Button>

          <Flex justify="center">
            <Text fontSize="sm" color="gray.600">
              ¿No tienes cuenta?{" "}
              <Button variant="link" color="teal.500" onClick={goToRegister}>
                Regístrate aquí
              </Button>
            </Text>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Login;
