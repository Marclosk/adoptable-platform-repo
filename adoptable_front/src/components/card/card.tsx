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
    <Box display="flex" flexWrap="wrap" justifyContent="center" gap="4">
      {dogs.map((dog) => (
        <Box
          key={dog.id}
          border="1px solid #ddd"
          borderRadius="md"
          overflow="hidden"
          boxShadow="md"
          maxWidth="300px"
          transition="transform 0.2s"
          _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
        >
          <Link href={`/card_detail/${dog.id}`}>
            <Image
              src={dog.imageUrl || "https://images.unsplash.com/photo-1560807707-8cc77767d783"}
              alt={dog.name}
              width="100%"
              height="200px"
              objectFit="cover"
            />
            <Box p="4">
              <Text fontWeight="bold" fontSize="xl">
                {dog.name}
              </Text>
              <Text color="gray.600">{dog.city}</Text>
            </Box>
          </Link>
        </Box>
      ))}
    </Box>
  );
};

export default DogCards;
