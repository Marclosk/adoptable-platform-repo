import React from 'react';
import { Flex, Button, Image, Text } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../redux/store';
import type { RootState } from '../../redux/store';
import { useTranslation } from 'react-i18next';

import homeIcon from '../../assets/icons/home-icon.svg';
import dashboardIcon from '../../assets/icons/dashboard-icon.svg';
import profileIcon from '../../assets/icons/profile-icon.svg';
import donationsIcon from '../../assets/icons/donations-icon.svg';
import contactIcon from '../../assets/icons/contact-icon.svg';

const NavbarInferior: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const role = useAppSelector((s: RootState) => s.auth.role);

  const menuItems: { src: string; labelKey: string; path: string }[] = [
    { src: homeIcon, labelKey: 'nav_home', path: '/dashboard' },
    ...(role === 'protectora'
      ? [
          {
            src: dashboardIcon,
            labelKey: 'nav_panel',
            path: '/protectora/dashboard',
          },
        ]
      : role === 'admin'
        ? [
            {
              src: dashboardIcon,
              labelKey: 'nav_admin',
              path: '/admin/dashboard',
            },
          ]
        : []),
    { src: profileIcon, labelKey: 'nav_perfil', path: '/perfil' },
    ...(role !== 'admin'
      ? [
          {
            src: donationsIcon,
            labelKey: 'nav_donaciones',
            path: '/donaciones',
          },
          { src: contactIcon, labelKey: 'nav_contacto', path: '/contacto' },
        ]
      : []),
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
      {menuItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Button
            key={item.path}
            variant="ghost"
            color={isActive ? 'white' : 'teal.100'}
            onClick={() => {
              if (!isActive) navigate(item.path);
            }}
            _hover={{ color: 'white', bg: 'teal.700' }}
            flexDirection="column"
            fontSize="xs"
          >
            <Image
              src={item.src}
              alt={t(item.labelKey)}
              boxSize="5"
              mb="1"
              filter="brightness(0) invert(1)"
              opacity={isActive ? 1 : 0.6}
            />
            <Text>{t(item.labelKey)}</Text>
          </Button>
        );
      })}
    </Flex>
  );
};

export default NavbarInferior;
