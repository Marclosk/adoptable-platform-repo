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
  Select,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { register } from "../authService";

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Manejo de errores de servidor
  const [serverError, setServerError] = useState("");

  // Ejemplo de rol, email, password, etc. (código omitido por brevedad)
  const [role, setRole] = useState<"adoptante" | "protectora">("adoptante");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // etc...

  // Errores de validación local
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Campos para adoptante
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Campos para protectora
  const [shelterName, setShelterName] = useState("");
  const [localidad, setLocalidad] = useState("");

  // Funciones de validación local (ejemplo)
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
    // Limpiar errores
    setServerError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let valid = true;

    // Validación local
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

    if (!valid) return;

    try {
      // Llamada al servicio de registro
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
          username: shelterName,
          email,
          password,
          first_name: "",
          last_name: "",
          role: "protectora",
          // localidad, si tu backend lo necesita
        });
      }

      // Si todo sale bien, podemos mostrar un mensaje y redirigir
      if (role === "protectora") {
        // Por ejemplo, mostrar un alert
        alert("Se ha enviado la solicitud de protectora. Espera aprobación.");
      } else {
        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
      }
      // Redirigir al login
      navigate("/login");
    } catch (error: any) {
      console.error("❌ Error en el servidor:", error);
      if (error.message) {
        setServerError(error.message);
      } else {
        setServerError("Error en el servidor");
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
        maxWidth="500px"
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

          {/* Si hay error de servidor, mostramos un alert */}
          {serverError && (
            <Box mb={4} color="red.500">
              {serverError}
            </Box>
          )}

          {/* Seleccionar rol */}
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

          {/* Email */}
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

          {/* Contraseña */}
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

          {/* Confirmar Contraseña */}
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

          {/* Campos adoptante */}
          {role === "adoptante" && (
            <>
              <FormControl mb="6">
                <FormLabel>Nombre de usuario</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  borderColor="teal.300"
                />
              </FormControl>

              <FormControl mb="6">
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

          {/* Campos protectora */}
          {role === "protectora" && (
            <>
              <FormControl mb="6">
                <FormLabel>Nombre de la protectora</FormLabel>
                <Input
                  type="text"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
                  placeholder="Ej. Protectora Canina XYZ"
                  borderColor="teal.300"
                />
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
