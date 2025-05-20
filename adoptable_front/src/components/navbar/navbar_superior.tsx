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
  useColorModeValue,
} from "@chakra-ui/react";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { getProfile } from "../../pages/profile/user_services";
import { useTranslation } from "react-i18next";

interface NavbarSuperiorProps {
  handleLogout: () => void;
}

const NavbarSuperior: React.FC<NavbarSuperiorProps> = ({ handleLogout }) => {
  const { t } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState<string>();
  // Elegimos un color oscuro para el texto del menú
  const menuBg = useColorModeValue("white", "gray.800");
  const menuColor = useColorModeValue("gray.800", "white");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile.avatar) setAvatarUrl(profile.avatar);
      } catch {
        /* no-op */
      }
    };
    loadProfile();
  }, []);

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
        <MenuButton as={Button} variant="ghost" p={0} minW={0}>
          <Avatar
            size="sm"
            src={avatarUrl}
            icon={<FaUserCircle color="white" />}
            border="2px solid"
            borderColor="white"
            cursor="pointer"
          />
        </MenuButton>

        <MenuList
          bg={menuBg}
          color={menuColor}
          borderColor="gray.200"
          boxShadow="md"
          mt={1}
        >
          <MenuItem
            icon={<FaSignOutAlt color={menuColor} />}
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
