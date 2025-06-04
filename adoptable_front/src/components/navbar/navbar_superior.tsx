import React, { useEffect, useState } from 'react';
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
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { FaSignOutAlt, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../../pages/profile/user_services';
import { useTranslation } from 'react-i18next';
import SearchBar from '../search_bar/search_bar';

interface NavbarSuperiorProps {
  handleLogout: () => void;
}

const AVAILABLE_LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'ca', label: 'Català' },
  { code: 'es', label: 'Español' },
];

const NavbarSuperior: React.FC<NavbarSuperiorProps> = ({ handleLogout }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<{
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  }>({ username: '', first_name: '', last_name: '', email: '' });

  const menuBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const menuColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(' ') ||
    user.username;
  const avatarSrc = user.avatar;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <Flex
      as="nav"
      bg="teal.500"
      color="white"
      px="4"
      py="3"
      align="center"
      justify="space-between"
      boxShadow="sm"
    >
      <Heading as="h1" size="lg" fontFamily="heading">
        AdoptAble
      </Heading>

      <HStack spacing="4">
        {/* Search fija al lado del título */}
        <SearchBar />

        {/* Selector de idioma */}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FaGlobe />}
            aria-label="Seleccionar idioma"
            variant="ghost"
            color="white"
            _hover={{ bg: 'teal.600' }}
          />
          <MenuList
            bg={menuBg}
            color={menuColor}
            borderColor="gray.200"
            boxShadow="md"
            mt={1}
            minW="120px"
          >
            {AVAILABLE_LANGUAGES.map(lang => (
              <MenuItem
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                _hover={{ bg: 'teal.100', color: 'teal.800' }}
              >
                {lang.label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        {/* Menú de usuario */}
        <Menu>
          <MenuButton as={Button} variant="ghost" p={0} minW={0}>
            <Avatar
              size="sm"
              name={displayName}
              src={avatarSrc}
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
            p={0}
            minW="220px"
          >
            <Box bg={headerBg} textAlign="center" py="4" px="6">
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
              onClick={() => navigate('/perfil')}
              _hover={{ bg: 'teal.100', color: 'teal.800' }}
            >
              {t('nav_perfil')}
            </MenuItem>

            <MenuItem
              icon={<FaSignOutAlt />}
              onClick={handleLogout}
              _hover={{ bg: 'teal.100', color: 'teal.800' }}
            >
              {t('logout')}
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

export default NavbarSuperior;
