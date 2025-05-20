// src/pages/auth/Login.tsx

import React, { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";

const Login: React.FC = () => {
  const { t } = useTranslation();
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
      setPasswordError(t("error_username_required"));
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
      console.error("Error durante el inicio de sesión:", err.message);
      setPasswordError(t("error_invalid_credentials"));
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
            {t("login_heading")}
          </Heading>

          <Text fontSize="lg" textAlign="center" mb="6" color="gray.600">
            {t("login_subtitle")}
          </Text>

          <FormControl mb="4">
            <FormLabel>{t("login_username_label")}</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("placeholder_username")}
              borderColor="teal.300"
            />
          </FormControl>

          <FormControl isInvalid={!!passwordError} mb="6">
            <FormLabel>{t("password_label")}</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("placeholder_password")}
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
