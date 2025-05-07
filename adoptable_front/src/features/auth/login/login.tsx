import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess, loginFailure } from "../authSlice";
import { login, LoginResponse } from "../authService";
import { checkSession } from "../session/checkSession";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Card,
  CardBody,
  Heading,
  Text,
  FormErrorMessage,
  Flex,
} from "@chakra-ui/react";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    (async () => {
      if (await checkSession()) navigate("/dashboard");
    })();
  }, [navigate]);

  const validatePassword = (pwd: string) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}[\]|\\:;"'<>,.?/`~-]{8,}$/;
    return regex.test(pwd);
  };

  const handleLogin = async () => {
    setPasswordError("");
    if (!username) {
      setPasswordError("El campo nombre de usuario está vacío");
      return;
    }
    if (!password) {
      setPasswordError("El campo contraseña está vacío");
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número."
      );
      return;
    }

    try {
      console.log("Intentando iniciar sesión...");
      const data: LoginResponse = await login({ username, password });


      dispatch(
        loginSuccess({
          user: data.user,
          role: data.role,
        })
      );


      if (data.role === "protectora") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      dispatch(loginFailure(err.message));
      console.error("Error durante el inicio de sesión:", err.message);
      setPasswordError("Credenciales inválidas.");
    } finally {
      console.log("Fin del proceso de inicio de sesión.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  const goToRegister = () => navigate("/register");

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#DDD2B5"
    >
      <Card
        maxW="400px"
        w="full"
        boxShadow="lg"
        borderRadius="md"
        bg="white"
        p="6"
      >
        <CardBody>
          <Heading as="h2" size="lg" textAlign="center" mb="6" color="teal.500">
            Iniciar sesión
          </Heading>

          <Text fontSize="lg" textAlign="center" mb="6" color="gray.600">
            Bienvenido a nuestra plataforma de adopción de perros.
          </Text>

          <FormControl mb="4">
            <FormLabel>Nombre de usuario</FormLabel>
            <Input
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

          <Button
            colorScheme="teal"
            onClick={handleLogin}
            w="full"
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
