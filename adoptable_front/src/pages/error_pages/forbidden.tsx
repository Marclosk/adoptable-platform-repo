// src/pages/Forbidden.tsx
import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Forbidden: React.FC = () => (
  <Flex
    align="center"
    justify="center"
    minH="80vh"
    bg={useColorModeValue('gray.50', 'gray.800')}
  >
    <Box
      textAlign="center"
      bg={useColorModeValue('white', 'gray.700')}
      p={{ base: 6, md: 10 }}
      borderRadius="md"
      boxShadow="lg"
    >
      <Heading mb={4} color="red.500">
        403 - Acceso denegado
      </Heading>
      <Text mb={6} fontSize="lg">
        No tienes permiso para acceder a esta página.
      </Text>
      <Button as={RouterLink} to="/" colorScheme="teal">
        Volver al inicio
      </Button>
    </Box>
  </Flex>
);

export default Forbidden;
