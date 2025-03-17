import React from "react";
import { Box, Text, Image, Link } from "@chakra-ui/react";

interface Dog {
  id: number;
  name: string;
  city: string;
  imageUrl: string;
}

interface DogCardsProps {
  dogs: Dog[];
}

const DogCards: React.FC<DogCardsProps> = ({ dogs }) => {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      justifyContent="center"
      gap={6}
      mt={4}
    >
      {dogs.map((dog) => (
        <Box
          key={dog.id}
          bg="white"
          borderRadius="md"
          overflow="hidden"
          boxShadow="md"
          maxW="280px"
          transition="transform 0.2s"
          _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
        >
          <Link href={`/card_detail/${dog.id}`}>
            <Image
              src={
                dog.imageUrl ||
                "https://images.unsplash.com/photo-1560807707-8cc77767d783"
              }
              alt={dog.name}
              width="100%"
              height="200px"        // Altura fija para todas las imágenes
              objectFit="cover"     // Recorta la imagen sin deformarla
            />
            <Box p={4}>
              <Text fontWeight="bold" fontSize="lg" mb={1} color="gray.800">
                {dog.name}
              </Text>
              <Text color="gray.600" fontSize="sm">
                {dog.city}
              </Text>
            </Box>
          </Link>
        </Box>
      ))}
    </Box>
  );
};

export default DogCards;
