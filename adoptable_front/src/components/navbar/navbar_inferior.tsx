import React from "react";
import { Flex, Button, Image, Text } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

import homeIcon from "../../assets/icons/home-icon.svg";
import dogIcon from "../../assets/icons/dog-icon.svg";
import profileIcon from "../../assets/icons/profile-icon.svg";
import donationsIcon from "../../assets/icons/donations-icon.svg";
import contactIcon from "../../assets/icons/contact-icon.svg";

const NavbarInferior: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { src: homeIcon, label: "Principal", path: "/dashboard" },
    { src: dogIcon, label: "Dogder", path: "/dogder" },
    { src: profileIcon, label: "Perfil", path: "/perfil" },
    { src: donationsIcon, label: "Donacions", path: "/donacions" },
    { src: contactIcon, label: "Contacte", path: "/contacte" },
  ];

  return (
    <Flex as="nav" bg="#C3B898" p="4" justify="space-evenly" align="center">
      {menuItems.map((item, index) => (
        <Button
          key={index}
          variant="link"
          color="white"
          onClick={() => {
            if (location.pathname !== item.path) {
              navigate(item.path);
            }
          }}
        >
          <Flex align="center" gap="2" flexDirection="column">
            <Image src={item.src} alt={item.label} w="6" />
            <Text>{item.label}</Text>
          </Flex>
        </Button>
      ))}
    </Flex>
  );
};

export default NavbarInferior;
