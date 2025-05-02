import React, { useEffect } from "react";
import { useAppDispatch } from "../redux/hooks";
import NavbarSuperior from "./navbar/navbar_superior";
import NavbarInferior from "./navbar/navbar_inferior";
import Footer from "./navbar/footer";
import { Box } from "@chakra-ui/react";
import { fetchProfile } from "../redux/slices/profileSlice";

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
    <>
      <NavbarSuperior handleLogout={handleLogout} />
      <NavbarInferior />
      <Box minH="80vh" p={4}>
        {children}
      </Box>
      <Footer />
    </>
  );
};

export default Layout;
