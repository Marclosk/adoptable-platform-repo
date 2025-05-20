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
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  // escogemos un fondo contrastado respecto al dashboard (teal oscuro)
  const bg = "teal.700";
  const linkColor = "whiteAlpha.900";
  const iconBg = useColorModeValue("whiteAlpha.900", "gray.700");
  const iconColor = useColorModeValue("teal.700", "teal.300");

  const year = new Date().getFullYear();

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
            {t("footer_tagline")}
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
              {t("footer_nav_title")}
            </Text>
            <Link
              href="/"
              color={linkColor}
              _hover={{ textDecoration: "underline" }}
            >
              {t("nav_inicio")}
            </Link>
            <Link
              href="/dogder"
              color={linkColor}
              _hover={{ textDecoration: "underline" }}
            >
              {t("nav_dogder")}
            </Link>
            <Link
              href="/perfil"
              color={linkColor}
              _hover={{ textDecoration: "underline" }}
            >
              {t("nav_perfil")}
            </Link>
            <Link
              href="/donaciones"
              color={linkColor}
              _hover={{ textDecoration: "underline" }}
            >
              {t("nav_donaciones")}
            </Link>
            <Link
              href="/contacto"
              color={linkColor}
              _hover={{ textDecoration: "underline" }}
            >
              {t("nav_contacto")}
            </Link>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontSize="md" fontWeight="semibold">
              {t("footer_help_title")}
            </Text>
            <Link
              href="/faq"
              color={linkColor}
              _hover={{ textDecoration: "underline" }}
            >
              {t("help_faq")}
            </Link>
            <Link
              href="/support"
              color={linkColor}
              _hover={{ textDecoration: "underline" }}
            >
              {t("help_support")}
            </Link>
            <Link
              href="/terms"
              color={linkColor}
              _hover={{ textDecoration: "underline" }}
            >
              {t("help_terms")}
            </Link>
            <Link
              href="/privacy"
              color={linkColor}
              _hover={{ textDecoration: "underline" }}
            >
              {t("help_privacy")}
            </Link>
          </VStack>
        </HStack>

        {/* Redes sociales */}
        <VStack align="start" spacing={4} mt={{ base: 8, md: 0 }}>
          <Text fontSize="md" fontWeight="semibold">
            {t("footer_follow_title")}
          </Text>
          <HStack spacing={4}>
            <IconButton
              as="a"
              href="https://facebook.com"
              aria-label={t("footer_facebook")}
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
              aria-label={t("footer_twitter")}
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
              aria-label={t("footer_instagram")}
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
              aria-label={t("footer_linkedin")}
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
        {t("footer_copy", { year })}
      </Box>
    </Box>
  );
};

export default Footer;
