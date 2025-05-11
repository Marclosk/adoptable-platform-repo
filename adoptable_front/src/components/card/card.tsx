// src/components/card/card.tsx

import React, { useEffect } from "react";
import {
  SimpleGrid,
  LinkBox,
  LinkOverlay,
  AspectRatio,
  Image,
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  FaDog,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaRulerCombined,
  FaHeartbeat,
} from "react-icons/fa";
import { GiDogHouse } from "react-icons/gi";

interface Dog {
  id: number;
  name: string;
  city: string;
  imageUrl: string;
  species: string;
  age: string;
  breed: string;
  size: string;
  activity: string;
}

interface DogCardsProps {
  dogs: Dog[];
}

const DogCards: React.FC<DogCardsProps> = ({ dogs }) => {
  // Para debug en consola:
  useEffect(() => {
    console.debug("🔍 [DEBUG] DogCards received dogs:", dogs);
  }, [dogs]);

  const cardBg = useColorModeValue("white", "gray.700");
  const shadow = useColorModeValue("md", "dark-lg");
  // Pon aquí tu imagen por defecto en public/images/default_image.jpg
  const fallback = "/images/default_image.jpg";

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
      {dogs.map((dog) => (
        <LinkBox
          key={dog.id}
          bg={cardBg}
          borderRadius="lg"
          overflow="hidden"
          boxShadow={shadow}
          transition="all 0.3s"
          _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
        >
          <AspectRatio ratio={4 / 3}>
            <Image
              src={dog.imageUrl || fallback}
              alt={dog.name}
              objectFit="cover"
              fallbackSrc={fallback}
            />
          </AspectRatio>

          <Box p={4}>
            <VStack align="start" spacing={2}>
              <LinkOverlay
                as={RouterLink}
                to={`/card_detail/${dog.id}`}
                _hover={{ textDecoration: "none" }}
              >
                <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                  <Icon as={FaDog} mr={2} /> {dog.name}
                </Text>
              </LinkOverlay>

              <HStack spacing={3} wrap="wrap">
                <Badge variant="subtle" colorScheme="orange">
                  <Icon as={GiDogHouse} mr={1} /> {dog.species}
                </Badge>
                <Badge variant="subtle" colorScheme="pink">
                  <Icon as={FaBirthdayCake} mr={1} /> {dog.age}
                </Badge>
                <Badge variant="subtle" colorScheme="cyan">
                  <Icon as={FaRulerCombined} mr={1} /> {dog.size}
                </Badge>
                <Badge variant="subtle" colorScheme="red">
                  <Icon as={FaHeartbeat} mr={1} /> {dog.activity}
                </Badge>
              </HStack>

              <Text fontSize="sm" color="gray.500">
                <Icon as={FaMapMarkerAlt} mr={1} /> {dog.city}
              </Text>

              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                Raza: {dog.breed}
              </Text>
            </VStack>
          </Box>
        </LinkBox>
      ))}
    </SimpleGrid>
  );
};

export default DogCards;
