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
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile.avatar) {
          setAvatarUrl(profile.avatar);
        }
      } catch (err) {
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
        <MenuButton
          as={Button}
          variant="ghost"
          p={0}
          minW={0}
          cursor="pointer"
        >
          <Avatar
            size="sm"                
            src={avatarUrl}          
            icon={<FaUserCircle />}  
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
