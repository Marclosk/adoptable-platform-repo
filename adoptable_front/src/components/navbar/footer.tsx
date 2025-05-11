// src/components/layout/Footer.tsx

import React from "react";
import {
  Box,
  Flex,
  Text,
  Link,
  IconButton,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer: React.FC = () => {
  // escogemos un fondo contrastado respecto al dashboard (teal oscuro)
  const bg = "teal.700";
  const linkColor = "whiteAlpha.900";
  const iconBg = useColorModeValue("whiteAlpha.900", "gray.700");
  const iconColor = useColorModeValue("teal.700", "teal.300");

  return (
    <Box as="footer" bg={bg} color="whiteAlpha.900" py={8} mt="auto">
      <Flex
        maxW="1200px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "center", md: "flex-start" }}
        wrap="wrap"
      >
        {/* Branding */}
        <VStack align="start" spacing={4} mb={{ base: 8, md: 0 }}>
          <Text fontSize="2xl" fontWeight="bold" color="white">
            AdoptAble
          </Text>
          <Text fontSize="sm" color="whiteAlpha.700">
            Connecting pets with loving homes.
          </Text>
        </VStack>

        {/* Navegación */}
        <HStack
          spacing={{ base: 8, md: 16 }}
          align={{ base: "center", md: "flex-start" }}
          wrap="wrap"
        >
          <VStack align="start" spacing={2}>
            <Text fontSize="md" fontWeight="semibold">
              Navegación
            </Text>
            <Link href="/" color={linkColor} _hover={{ textDecoration: "underline" }}>
              Inicio
            </Link>
            <Link href="/dogder" color={linkColor} _hover={{ textDecoration: "underline" }}>
              Dogder
            </Link>
            <Link href="/perfil" color={linkColor} _hover={{ textDecoration: "underline" }}>
              Perfil
            </Link>
            <Link href="/donaciones" color={linkColor} _hover={{ textDecoration: "underline" }}>
              Donaciones
            </Link>
            <Link href="/contacto" color={linkColor} _hover={{ textDecoration: "underline" }}>
              Contacto
            </Link>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontSize="md" fontWeight="semibold">
              Ayuda
            </Text>
            <Link href="/faq" color={linkColor} _hover={{ textDecoration: "underline" }}>
              Preguntas frecuentes
            </Link>
            <Link href="/support" color={linkColor} _hover={{ textDecoration: "underline" }}>
              Soporte
            </Link>
            <Link href="/terms" color={linkColor} _hover={{ textDecoration: "underline" }}>
              Términos y condiciones
            </Link>
            <Link href="/privacy" color={linkColor} _hover={{ textDecoration: "underline" }}>
              Política de privacidad
            </Link>
          </VStack>
        </HStack>

        {/* Redes sociales */}
        <VStack align="start" spacing={4} mt={{ base: 8, md: 0 }}>
          <Text fontSize="md" fontWeight="semibold">
            Síguenos
          </Text>
          <HStack spacing={4}>
            <IconButton
              as="a"
              href="https://facebook.com"
              aria-label="Facebook"
              icon={<FaFacebook />}
              bg={iconBg}
              color={iconColor}
              _hover={{ bg: "teal.500", color: "white" }}
              borderRadius="full"
              size="md"
            />
            <IconButton
              as="a"
              href="https://twitter.com"
              aria-label="Twitter"
              icon={<FaTwitter />}
              bg={iconBg}
              color={iconColor}
              _hover={{ bg: "teal.500", color: "white" }}
              borderRadius="full"
              size="md"
            />
            <IconButton
              as="a"
              href="https://instagram.com"
              aria-label="Instagram"
              icon={<FaInstagram />}
              bg={iconBg}
              color={iconColor}
              _hover={{ bg: "teal.500", color: "white" }}
              borderRadius="full"
              size="md"
            />
            <IconButton
              as="a"
              href="https://linkedin.com"
              aria-label="LinkedIn"
              icon={<FaLinkedin />}
              bg={iconBg}
              color={iconColor}
              _hover={{ bg: "teal.500", color: "white" }}
              borderRadius="full"
              size="md"
            />
          </HStack>
        </VStack>
      </Flex>

      {/* Copy */}
      <Box mt={8} textAlign="center" fontSize="sm" color="whiteAlpha.700">
        © {new Date().getFullYear()} AdoptAble. Todos los derechos reservados.
      </Box>
    </Box>
  );
};

export default Footer;
