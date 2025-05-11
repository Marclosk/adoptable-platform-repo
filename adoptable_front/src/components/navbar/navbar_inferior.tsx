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
    { src: donationsIcon, label: "Donaciones", path: "/donacions" },
    { src: contactIcon, label: "Contacto", path: "/contacte" },
  ];

  return (
    <Flex
      as="nav"
      bg="teal.600"
      p="2"
      justify="space-around"
      align="center"
      boxShadow="md"
    >
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Button
            key={item.path}
            variant="ghost"
            color={isActive ? "white" : "teal.100"}
            onClick={() => {
              if (!isActive) navigate(item.path);
            }}
            _hover={{ color: "white", bg: "teal.700" }}
            flexDirection="column"
            fontSize="xs"
          >
            <Image
              src={item.src}
              alt={item.label}
              boxSize="5"
              mb="1"
              filter={isActive ? "none" : "brightness(0) invert(1)"}
            />
            <Text>{item.label}</Text>
          </Button>
        );
      })}
    </Flex>
  );
};

export default NavbarInferior;
