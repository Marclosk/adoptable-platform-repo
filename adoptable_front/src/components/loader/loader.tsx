// src/components/loader/loader.tsx

import React from "react";
import { Center, VStack, Spinner, Text, useColorModeValue } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

interface LoaderProps {
  /** traducción: clave de i18n, p.ej. "cargando" o "cargando_perfil" */
  messageKey?: string;
  /** texto plano si ya está traducido */
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ messageKey, message }) => {
  const { t } = useTranslation();
  // Fondo transparente para integrarse con el contenedor padre
  const bg = useColorModeValue("transparent", "transparent");
  const textColor = useColorModeValue("teal.500", "teal.300");

  // Determina qué texto mostrar: clave i18n > mensaje plano > texto genérico
  const displayText = messageKey
    ? t(messageKey)
    : message
    ? message
    : t("cargando");

  return (
    <Center w="100%" h="100%" bg={bg} py={10}>
      <VStack spacing={4}>
        <Spinner size="xl" color={textColor} />
        <Text color={textColor} fontSize="lg">
          {displayText}
        </Text>
      </VStack>
    </Center>
  );
};

export default Loader;
