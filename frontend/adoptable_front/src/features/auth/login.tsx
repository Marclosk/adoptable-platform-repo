import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../../styles/login/login.css";

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
} from "@chakra-ui/react";
import { loginSuccess, loginFailure } from "./authSlice";
import { login } from "./authService";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
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
    setEmailError("");
    setPasswordError("");

    if (!validateEmail(email)) {
      setEmailError("Por favor, ingresa un correo válido.");
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número."
      );
    }

    if (emailError || passwordError) {
      return;
    }

    try {
      const data = await login({ email, password });
      dispatch(loginSuccess(data.user));
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        dispatch(loginFailure(err.message));
      } else {
        dispatch(loginFailure("Error desconocido"));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Card className="login-card" maxWidth="400px" width="full" boxShadow="lg">
        <CardBody>
          <Heading as="h2" size="lg" textAlign="center" mb="6">
            Iniciar sesión
          </Heading>
          <FormControl isInvalid={!!emailError}>
            <FormLabel>Email</FormLabel>
            <Input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
            />
            {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
          </FormControl>
          <FormControl mt="4" isInvalid={!!passwordError}>
            <FormLabel>Contraseña</FormLabel>
            <Input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              onKeyDown={handleKeyDown}
            />
            {passwordError && (
              <FormErrorMessage>{passwordError}</FormErrorMessage>
            )}
          </FormControl>
          <Button
            className="login-button"
            mt="6"
            colorScheme="teal"
            onClick={handleLogin}
            width="full"
          >
            Iniciar sesión
          </Button>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Login;
