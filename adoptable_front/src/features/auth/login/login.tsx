// src/pages/auth/Login.tsx

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const Login: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // campos de formulario y sus errores
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // error general del backend
  const [formError, setFormError] = useState("");

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
    // Limpiar errores
    setUsernameError("");
    setPasswordError("");
    setFormError("");

    // Validaciones cliente
    if (!username) {
      setUsernameError(t("error_username_required"));
      return;
    }
    if (!password) {
      setPasswordError(t("error_password_required"));
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError(t("error_password_requirements"));
      return;
    }

    try {
      const data: LoginResponse = await login({ username, password });
      dispatch(
        loginSuccess({
          user: data.user,
          role: data.role,
        })
      );
      navigate("/dashboard");
    } catch (err: any) {
      dispatch(loginFailure(err.message));
      console.error("Error durante el inicio de sesión:", err);

      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === 403) {
          setFormError(t("error_account_not_approved"));
        } else if (status === 401) {
          setFormError(t("error_invalid_credentials"));
        } else {
          setFormError(t("error_server"));
        }
      } else {
        setFormError(t("error_server"));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  const goToRegister = () => navigate("/register");

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#F7FAFC"
    >
      <Card
        maxW="600px"
        w="full"
        boxShadow="lg"
        borderRadius="lg"
        bg="white"
        borderColor="teal.300"
        p={6}
      >
        <CardBody>
          <Heading
            as="h2"
            size="xl"
            textAlign="center"
            mb={4}
            color="teal.600"
          >
            {t("login_heading")}
          </Heading>

          <Text fontSize="md" textAlign="center" mb={6} color="gray.600">
            {t("login_subtitle")}
          </Text>

          {formError && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {formError}
            </Alert>
          )}

          <FormControl isInvalid={!!usernameError} mb={4}>
            <FormLabel>{t("login_username_label")}</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("placeholder_username")}
              focusBorderColor="teal.500"
            />
            {usernameError && (
              <FormErrorMessage>{usernameError}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!passwordError} mb={6}>
            <FormLabel>{t("password_label")}</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("placeholder_password")}
              onKeyDown={handleKeyDown}
              focusBorderColor="teal.500"
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
            mb={4}
          >
            {t("login_button")}
          </Button>

          <Flex justify="center">
            <Text fontSize="sm" color="gray.600">
              {t("login_no_account")}{" "}
              <Button variant="link" color="teal.500" onClick={goToRegister}>
                {t("login_register_link")}
              </Button>
            </Text>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Login;
