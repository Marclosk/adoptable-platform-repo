import React from "react";
import {
  Box,
  Flex,
  Text,
  Link,
  IconButton,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <Box bg="#DDD2B5" color="white" py="6" mt="auto">
      <Flex
        maxWidth="1200px"
        mx="auto"
        px="6"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "center", md: "flex-start" }}
      >
        {/* Logo y descripción */}
        <VStack align="start" spacing="4" mb={{ base: 6, md: 0 }}>
          <Text fontSize="xl" fontWeight="bold">
            AdoptAble
          </Text>
          <Text fontSize="sm" color="white">
            Connecting pets with loving homes.
          </Text>
        </VStack>

        {/* Navegación */}
        <HStack
          spacing="8"
          align={{ base: "center", md: "flex-start" }}
          wrap="wrap"
        >
          <VStack align="start" spacing="2">
            <Text fontSize="md" fontWeight="semibold" color="white">
              Navegación
            </Text>
            <Link href="/" _hover={{ textDecoration: "underline" }}>
              Inicio
            </Link>
            <Link href="/dogder" _hover={{ textDecoration: "underline" }}>
              Dogder
            </Link>
            <Link href="/perfil" _hover={{ textDecoration: "underline" }}>
              Perfil
            </Link>
            <Link href="/donaciones" _hover={{ textDecoration: "underline" }}>
              Donaciones
            </Link>
            <Link href="/contacto" _hover={{ textDecoration: "underline" }}>
              Contacto
            </Link>
          </VStack>
          <VStack align="start" spacing="2">
            <Text fontSize="md" fontWeight="semibold" color="white">
              Ayuda
            </Text>
            <Link href="/faq" _hover={{ textDecoration: "underline" }}>
              Preguntas frecuentes
            </Link>
            <Link href="/support" _hover={{ textDecoration: "underline" }}>
              Soporte
            </Link>
            <Link href="/terms" _hover={{ textDecoration: "underline" }}>
              Términos y condiciones
            </Link>
            <Link href="/privacy" _hover={{ textDecoration: "underline" }}>
              Política de privacidad
            </Link>
          </VStack>
        </HStack>

        {/* Redes sociales */}
        <VStack align="start" spacing="4">
          <Text fontSize="md" fontWeight="semibold" color="white">
            Síguenos
          </Text>
          <HStack spacing="4">
            <IconButton
              as="a"
              href="https://facebook.com"
              aria-label="Facebook"
              icon={<FaFacebook />}
              bg="white"
              color="#DDD2B5"
              _hover={{ bg: "teal.500", color: "white" }}
              borderRadius="full"
            />
            <IconButton
              as="a"
              href="https://twitter.com"
              aria-label="Twitter"
              icon={<FaTwitter />}
              bg="white"
              color="#DDD2B5"
              _hover={{ bg: "teal.500", color: "white" }}
              borderRadius="full"
            />
            <IconButton
              as="a"
              href="https://instagram.com"
              aria-label="Instagram"
              icon={<FaInstagram />}
              bg="white"
              color="#DDD2B5"
              _hover={{ bg: "teal.500", color: "white" }}
              borderRadius="full"
            />
            <IconButton
              as="a"
              href="https://linkedin.com"
              aria-label="LinkedIn"
              icon={<FaLinkedin />}
              bg="white"
              color="#DDD2B5"
              _hover={{ bg: "teal.500", color: "white" }}
              borderRadius="full"
            />
          </HStack>
        </VStack>
      </Flex>

      {/* Derechos reservados */}
      <Box mt="8" textAlign="center" fontSize="sm" color="white">
        <Text>
          © {new Date().getFullYear()} AdoptAble. Todos los derechos reservados.
        </Text>
      </Box>
    </Box>
  );
};

export default Footer;
