// src/components/location/location_header.tsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Image,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
} from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import locationIcon from "../../assets/icons/location-icon.svg";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

// Configuración de iconos Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationHeaderProps {
  distance: number;
  onDistanceChange: (val: number) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

// Idiomas soportados directamente por country_code (además de 'es' que tratamos arriba)
const OTHER_LANGS = ["de", "fr", "en"];

const LocationHeader: React.FC<LocationHeaderProps> = ({
  distance,
  onDistanceChange,
  onLocationSelect,
}) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [localDistance, setLocalDistance] = useState(distance);

  useEffect(() => {
    setLocalDistance(distance);
  }, [distance]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
        searchQuery
      )}`
    );
    const data = await res.json();
    if (data?.length) {
      const { lat, lon } = data[0];
      setMarkerPos([+lat, +lon]);
    }
  };

  const applyLocation = async () => {
    if (!markerPos) return;
    const [lat, lng] = markerPos;
    onLocationSelect(lat, lng);
    setIsOpen(false);

    try {
      // Reverse-geocode para detalles de la dirección
      const rev = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`
      );
      const revData = await rev.json();
      const cc: string = revData.address?.country_code?.toLowerCase() || "";

      let lang = "en"; // fallback

      if (cc === "es") {
        // En España, diferenciamos Cataluña → catalán, resto → español
        const region = (
          revData.address.state ||
          revData.address.region ||
          ""
        ).toLowerCase();
        if (region.includes("catal")) {
          lang = "ca";
        } else {
          lang = "es";
        }
      } else if (OTHER_LANGS.includes(cc)) {
        lang = cc;
      }

      await i18n.changeLanguage(lang);
      console.log("Idioma cambiado a", lang);
    } catch (err) {
      console.warn("Error detectando idioma, fallback a inglés", err);
      await i18n.changeLanguage("en");
    }
  };

  return (
    <>
      <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" mb={6}>
        <Flex align="center" wrap="wrap" gap={2} mb={4}>
          <Image src={locationIcon} alt={t("location_icon_alt")} w={6} />
          <Text fontSize="lg" fontWeight="medium" color="gray.700">
            {t("ubicacion_a_distancia", { distance: localDistance })}
          </Text>
          <Button
            size="sm"
            variant="outline"
            colorScheme="teal"
            ml="auto"
            onClick={() => setIsOpen(true)}
          >
            {t("cambiar_ubicacion")}
          </Button>
        </Flex>

        <Slider
          aria-label="distance-slider"
          min={0}
          max={100}
          step={5}
          value={localDistance}
          onChange={(val) => setLocalDistance(val)}
          onChangeEnd={(val) => onDistanceChange(val)}
          colorScheme="teal"
        >
          <SliderTrack bg="gray.200">
            <SliderFilledTrack bg="teal.500" />
          </SliderTrack>
          <SliderThumb boxSize={5} bg="teal.500" />
        </Slider>
      </Box>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("seleccionar_ubicacion")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap={2} mb={4}>
              <Input
                placeholder={t("placeholder_buscar_ciudad")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                flex="1"
                borderColor="gray.300"
              />
              <Button colorScheme="teal" onClick={handleSearch}>
                {t("buscar")}
              </Button>
            </Flex>
            <Box h="400px" borderRadius="md" overflow="hidden">
              <MapContainer
                center={markerPos ?? [20, 0]}
                zoom={markerPos ? 12 : 2}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {markerPos && (
                  <Marker position={markerPos}>
                    <Popup>{t("ubicacion_seleccionada")}</Popup>
                  </Marker>
                )}
              </MapContainer>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={applyLocation}
              isDisabled={!markerPos}
            >
              {t("usar_ubicacion")}
            </Button>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              {t("cancelar")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LocationHeader;
