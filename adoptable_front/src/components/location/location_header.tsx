import React from "react";
import { Flex, Image, Text } from "@chakra-ui/react";
import locationIcon from "../../assets/icons/location-icon.svg";

interface LocationHeaderProps {
  distance: number;
}

const LocationHeader: React.FC<LocationHeaderProps> = ({ distance }) => (
  <Flex align="center" gap="2" mb="6" justify="start">
    <Image src={locationIcon} alt="Location" w="6" />
    <Text fontSize="xl" fontWeight="thin" color="gray.700">
      A {distance}km de la teva ubicació
    </Text>
  </Flex>
);

export default LocationHeader;
