import React from "react";
import {
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";

interface NavbarSuperiorProps {
  handleLogout: () => void;
}

const NavbarSuperior: React.FC<NavbarSuperiorProps> = ({ handleLogout }) => (
  <Flex as="nav" bg="#DDD2B5" p="4" align="center" justify="space-between">
    <Flex align="center" gap="3">
      <Heading as="h1" size="lg" color="teal.500">
        AdoptAble
      </Heading>
    </Flex>
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<FaUserCircle />}
        aria-label="Perfil"
        variant="ghost"
        color="white"
        fontSize="32px"
      />
      <MenuList>
        <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  </Flex>
);

export default NavbarSuperior;
