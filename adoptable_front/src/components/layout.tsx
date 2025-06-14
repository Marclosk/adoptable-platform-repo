import React, { useEffect } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { useAppDispatch } from '../redux/hooks';
import NavbarSuperior from './navbar/navbar_superior';
import NavbarInferior from './navbar/navbar_inferior';
import Footer from './navbar/footer';
import { fetchProfile } from '../redux/slices/profileSlice';

interface LayoutProps {
  children: React.ReactNode;
  handleLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, handleLogout }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <Flex direction="column" minH="100vh">
      <NavbarSuperior handleLogout={handleLogout} />

      <NavbarInferior />

      <Box as="main" flex="1" bg="gray.50" p={{ base: 4, md: 6 }}>
        {children}
      </Box>

      <Footer />
    </Flex>
  );
};

export default Layout;
