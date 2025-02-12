import React from "react";
import { Flex, Button, Image, Text } from "@chakra-ui/react";

import homeIcon from "../../assets/icons/home-icon.svg";
import dogIcon from "../../assets/icons/dog-icon.svg";
import profileIcon from "../../assets/icons/profile-icon.svg";
import donationsIcon from "../../assets/icons/donations-icon.svg";
import contactIcon from "../../assets/icons/contact-icon.svg";

const NavbarInferior: React.FC = () => (
  <Flex as="nav" bg="#C3B898" p="4" justify="space-evenly" align="center">
    {[
      { src: homeIcon, label: "Principal" },
      { src: dogIcon, label: "Dogder" },
      { src: profileIcon, label: "Perfil" },
      { src: donationsIcon, label: "Donacions" },
      { src: contactIcon, label: "Contacte" },
    ].map((item, index) => (
      <Button key={index} variant="link" color="white">
        <Flex align="center" gap="2" flexDirection="column">
          <Image src={item.src} alt={item.label} w="6" />
          <Text>{item.label}</Text>
        </Flex>
      </Button>
    ))}
  </Flex>
);

export default NavbarInferior;
