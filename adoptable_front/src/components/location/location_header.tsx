// src/components/location/location_header.tsx
import React from "react";
import {
  Flex,
  Image,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import locationIcon from "../../assets/icons/location-icon.svg";

interface LocationHeaderProps {
  distance: number;
  onDistanceChange: (value: number) => void;
}

const LocationHeader: React.FC<LocationHeaderProps> = ({
  distance,
  onDistanceChange,
}) => {
  const handleSliderChange = (val: number) => {
    onDistanceChange(val);
  };

  return (
    <Flex direction="column" mb={6}>
      <Flex align="center" gap={2} mb={2}>
        <Image src={locationIcon} alt="Location" w={6} />
        <Text fontSize="xl" fontWeight="thin" color="gray.700">
          A {distance} km de tu ubicación
        </Text>
      </Flex>

      {/* Slider para modificar la distancia */}
      <Slider
        aria-label="distance-slider"
        min={0}
        max={100}
        step={5}
        value={distance}
        onChange={handleSliderChange}
        colorScheme="teal"
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb boxSize={5} />
      </Slider>
    </Flex>
  );
};

export default LocationHeader;
