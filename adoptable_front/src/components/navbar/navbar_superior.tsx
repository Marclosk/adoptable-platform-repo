// src/components/navbar/NavbarSuperior.tsx

import React, { useEffect, useState } from "react";
import {
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
  Box,
  Text,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../pages/profile/user_services";
import { useTranslation } from "react-i18next";

interface NavbarSuperiorProps {
  handleLogout: () => void;
}

const NavbarSuperior: React.FC<NavbarSuperiorProps> = ({ handleLogout }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<{
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  }>({ username: "", first_name: "", last_name: "", email: "" });

  const menuBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const menuColor = useColorModeValue("gray.800", "white");

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch {
        // ignore
      }
    })();
  }, []);

  // Si hay nombre completo lo usamos, si no, caemos a username
  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username;

  // Solo enviamos src si avatar es truthy y no es cadena vacía
  const avatarSrc = user.avatar ? user.avatar : undefined;

  return (
    <Flex
      as="nav"
      bg="teal.500"
      color="white"
      p="4"
      align="center"
      justify="space-between"
      boxShadow="sm"
    >
      <Heading as="h1" size="lg" fontFamily="heading">
        AdoptAble
      </Heading>

      <Menu>
        {/* Avatar pequeño en la barra (size="sm") */}
        <MenuButton as={Button} variant="ghost" p={0} minW={0}>
          <Avatar
            size="sm"
            name={displayName}
            src={avatarSrc}
            border="2px solid"
            borderColor="teal.200"
            cursor="pointer"
          />
        </MenuButton>

        <MenuList
          bg={menuBg}
          color={menuColor}
          borderColor="gray.200"
          boxShadow="md"
          mt={1}
          p={0}
          minW="220px"
        >
          {/* Cabecera con avatar grande */}
          <Box bg={headerBg} textAlign="center" py={4} px={6}>
            <Avatar
              size="xl"
              name={displayName}
              src={avatarSrc}
              border="2px solid"
              borderColor="teal.200"
              mb={2}
            />
            <Text fontWeight="bold" fontSize="md">
              {displayName}
            </Text>
            <Text fontSize="sm" color="gray.500" noOfLines={1}>
              {user.email}
            </Text>
          </Box>

          <Divider />

          <MenuItem
            onClick={() => navigate("/perfil")}
            _hover={{ bg: "teal.100", color: "teal.800" }}
          >
            {t("nav_perfil")}
          </MenuItem>

          <MenuItem
            icon={<FaSignOutAlt />}
            onClick={handleLogout}
            _hover={{ bg: "teal.100", color: "teal.800" }}
          >
            {t("logout")}
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default NavbarSuperior;
