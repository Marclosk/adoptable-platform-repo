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
} from "@chakra-ui/react";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { getProfile } from "../../pages/profile/user_services";

interface NavbarSuperiorProps {
  handleLogout: () => void;
}

const NavbarSuperior: React.FC<NavbarSuperiorProps> = ({ handleLogout }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Al montar, recuperamos la foto de perfil (si existe)
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile.avatar) {
          setAvatarUrl(profile.avatar);
        }
      } catch (err) {
        // Si falla la petición, no hacemos nada y se mostrará el icono por defecto
        console.error("No se pudo cargar avatar en navbar:", err);
      }
    };
    loadProfile();
  }, []);

  return (
    <Flex
      as="nav"
      bg="#DDD2B5"
      p="4"
      align="center"
      justify="space-between"
      boxShadow="md"
    >
      <Heading as="h1" size="lg" color="teal.500">
        AdoptAble
      </Heading>

      <Menu>
        {/* 
          Usamos un Button variante ghost para contener el Avatar,
          de modo que al hacer click abra el menú.
        */}
        <MenuButton
          as={Button}
          variant="ghost"
          p={0}
          minW={0}
          cursor="pointer"
        >
          <Avatar
            size="sm"                // ~32px, mismo tamaño que tu icono anterior
            src={avatarUrl}          // si avatarUrl es undefined, Avatar usará el icono de fallback
            icon={<FaUserCircle />}  // icono de fallback
          />
        </MenuButton>

        <MenuList>
          <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default NavbarSuperior;
