import React from "react";
import NavbarSuperior from "./navbar/navbar_superior";  // Asegúrate de que estos componentes existen
import NavbarInferior from "./navbar/navbar_inferior";
import Footer from "./navbar/footer";
import { Box } from "@chakra-ui/react";

interface LayoutProps {
    children: React.ReactNode;
    handleLogout: () => void;
  }
  
  const Layout: React.FC<LayoutProps> = ({ children, handleLogout }) => {
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
