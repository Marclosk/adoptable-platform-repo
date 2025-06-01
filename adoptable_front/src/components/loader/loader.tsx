import React from "react";
import { Center, VStack, Spinner, Text, useColorModeValue } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

interface LoaderProps {
  messageKey?: string;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ messageKey, message }) => {
  const { t } = useTranslation();
  const bg = useColorModeValue("transparent", "transparent");
  const textColor = useColorModeValue("teal.500", "teal.300");

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
