// src/pages/auth/Register.tsx

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
import { useTranslation } from "react-i18next";

const Register: React.FC = () => {
  const { t } = useTranslation();
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
      setEmailError(t("error_correo_invalido"));
      valid = false;
    }
    if (!validatePassword(password)) {
      setPasswordError(t("error_password_requirements"));
      valid = false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError(t("error_confirm_password"));
      valid = false;
    }

    if (role === "adoptante") {
      if (!/^[A-Za-z0-9@.+-_]+$/.test(username)) {
        setUsernameError(t("error_username_invalid"));
        valid = false;
      }
    } else {
      if (!/^[A-Za-z0-9@.+-_]+$/.test(protectoraUsername)) {
        setProtectoraUsernameError(t("error_username_invalid"));
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
        title: t("register_success_title"),
        description:
          role === "protectora"
            ? t("register_success_protectora")
            : t("register_success_adoptante"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/login");
    } catch (error: any) {
      console.error("❌ Error en el servidor:", error);

      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const data = error.response.data;

        if (data.username && Array.isArray(data.username)) {
          const detail = data.username[0];
          const msg =
            typeof detail === "string" ? detail : (detail as any).string || "";
          setProtectoraUsernameError(
            msg.toLowerCase().includes("already exists")
              ? t("error_username_taken")
              : msg
          );
        }

        if (data.email && Array.isArray(data.email)) {
          const detail = data.email[0];
          const msg =
            typeof detail === "string" ? detail : (detail as any).string || "";
          setEmailError(msg);
        }

        if (data.password && Array.isArray(data.password)) {
          const detail = data.password[0];
          const msg =
            typeof detail === "string" ? detail : (detail as any).string || "";
          setPasswordError(msg);
        }

        if (!data.username && !data.email && !data.password) {
          setServerError(JSON.stringify(data));
        }
      } else {
        setServerError(error.message || t("error_server"));
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
            {t("register_heading")}
          </Heading>

          <Text fontSize="lg" textAlign="center" mb="6" color="gray.600">
            {t("register_subtitle")}
          </Text>

          {serverError && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {serverError}
            </Alert>
          )}

          <FormControl mb="6">
            <FormLabel>{t("register_role_label")}</FormLabel>
            <Select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "adoptante" | "protectora")
              }
              borderColor="teal.300"
            >
              <option value="adoptante">{t("role_adoptante")}</option>
              <option value="protectora">{t("role_protectora")}</option>
            </Select>
          </FormControl>

          <FormControl isInvalid={!!emailError} mb="4">
            <FormLabel>{t("email")}</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder_email")}
              borderColor="teal.300"
            />
            {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!passwordError} mb="4">
            <FormLabel>{t("password")}</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("placeholder_password")}
              borderColor="teal.300"
            />
            {passwordError && (
              <FormErrorMessage>{passwordError}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!confirmPasswordError} mb="6">
            <FormLabel>{t("confirm_password")}</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("placeholder_confirm_password")}
              borderColor="teal.300"
            />
            {confirmPasswordError && (
              <FormErrorMessage>{confirmPasswordError}</FormErrorMessage>
            )}
          </FormControl>

          {role === "adoptante" && (
            <>
              <FormControl isInvalid={!!usernameError} mb="4">
                <FormLabel>{t("username_label")}</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("placeholder_username")}
                  borderColor="teal.300"
                />
                {usernameError && (
                  <FormErrorMessage>{usernameError}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl mb="4">
                <FormLabel>{t("first_name_label")}</FormLabel>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("placeholder_first_name")}
                  borderColor="teal.300"
                />
              </FormControl>

              <FormControl mb="6">
                <FormLabel>{t("last_name_label")}</FormLabel>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("placeholder_last_name")}
                  borderColor="teal.300"
                />
              </FormControl>
            </>
          )}

          {role === "protectora" && (
            <>
              <FormControl mb="4">
                <FormLabel>{t("shelter_name_label")}</FormLabel>
                <Input
                  type="text"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
                  placeholder={t("placeholder_shelter_name")}
                  borderColor="teal.300"
                />
              </FormControl>

              <FormControl isInvalid={!!protectoraUsernameError} mb="4">
                <FormLabel>{t("protectora_username_label")}</FormLabel>
                <Input
                  type="text"
                  value={protectoraUsername}
                  onChange={(e) => setProtectoraUsername(e.target.value)}
                  placeholder={t("placeholder_protectora_username")}
                  borderColor="teal.300"
                />
                {protectoraUsernameError && (
                  <FormErrorMessage>{protectoraUsernameError}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl mb="6">
                <FormLabel>{t("localidad_label")}</FormLabel>
                <Input
                  type="text"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  placeholder={t("placeholder_localidad")}
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
            {t("register_button")}
          </Button>

          <Flex justify="center">
            <Button variant="link" color="teal.500" onClick={goBackToLogin}>
              {t("register_go_login")}
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Register;
