// src/components/loader/loader.tsx

import React from "react";
import { Center, VStack, Spinner, Text, useColorModeValue } from "@chakra-ui/react";

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = "Cargando..." }) => {
  // Fondo transparente para integrarse con el contenedor padre
  const bg = useColorModeValue("transparent", "transparent");
  const textColor = useColorModeValue("teal.500", "teal.300");

  return (
    <Center w="100%" h="100%" bg={bg} py={10}>
      <VStack spacing={4}>
        <Spinner size="xl" color={textColor} />
        <Text color={textColor} fontSize="lg">
          {message}
        </Text>
      </VStack>
    </Center>
  );
};

export default Loader;
