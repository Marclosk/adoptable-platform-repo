  import React, { useEffect, useState } from "react";
  import {
    Box,
    Flex,
    IconButton,
    Text,
    Heading,
    SimpleGrid,
    Card,
    CardBody,
    Image,
    Stack,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Spinner,
    Center,
  } from "@chakra-ui/react";
  import { FaUserCircle, FaSignOutAlt } from "react-icons/fa"; 
  import { useDispatch } from "react-redux";
  import { useNavigate } from "react-router-dom";
  import { logoutSuccess } from "../features/auth/authSlice"; 
  import { logout } from "../features/auth/authService"; 
  import { checkSession } from "../features/auth/session/checkSession"; 

  const Dashboard: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  
    useEffect(() => {
      const verifySession = async () => {
        const valid = await checkSession();
        if (!valid) {
          navigate("/login");
        } else {
          setIsSessionValid(true); 
        }
      };
  
      verifySession();
    }, [navigate]);

    if (isSessionValid === null) {
      return (
        <Center height="100vh">
          <Spinner size="xl" color="teal.500" />
          <Text mt={4} color="teal.500" fontSize="xl">
            Verificando sesión...
          </Text>
        </Center>
      );
    }
    const handleLogout = async () => {
      try {
        await logout();
        dispatch(logoutSuccess());
        navigate("/login");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    };

    const dogs = [
      {
        id: 1,
        name: "Rex",
        breed: "Pastor Alemán",
        imageUrl: "https://via.placeholder.com/200",
      },
      {
        id: 2,
        name: "Luna",
        breed: "Labrador",
        imageUrl: "https://via.placeholder.com/200",
      },
      {
        id: 3,
        name: "Max",
        breed: "Bulldog Francés",
        imageUrl: "https://via.placeholder.com/200",
      },
      {
        id: 4,
        name: "Bella",
        breed: "Golden Retriever",
        imageUrl: "https://via.placeholder.com/200",
      },
    ];

    return (
      <Box minHeight="100vh" bg="#FFFFFF" display="flex" flexDirection="column">
        {/* Navbar superior */}
        <Flex as="nav" bg="#DDD2B5" p="4" align="center" justify="space-between">
          <Heading as="h1" size="lg" color="teal.500">
            AdoptAble
          </Heading>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaUserCircle />}
              aria-label="Perfil"
              variant="ghost"
              color="teal.500"
              fontSize="24px"
            />
            <MenuList>
              <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        {/* Navbar inferior */}
        <Flex as="nav" bg="#C3B898" p="4" justify="space-evenly" align="center">
          <Button variant="link" color="teal.500">
            Principal
          </Button>
          <Button variant="link" color="teal.500">
            Dogder
          </Button>
          <Button variant="link" color="teal.500">
            Perfil
          </Button>
          <Button variant="link" color="teal.500">
            Donacions
          </Button>
          <Button variant="link" color="teal.500">
            Contacte
          </Button>
        </Flex>

        {/* Main Content */}
        <Box p="6" flex="1">
          <Text fontSize="2xl" textAlign="center" mb="6" color="gray.600">
            Bienvenido al Dashboard de Protectora de Perros
          </Text>

          {/* Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {dogs.map((dog) => (
              <Card key={dog.id} bg="#DDD2B5" boxShadow="lg" borderRadius="md">
                <CardBody>
                  <Image
                    src={dog.imageUrl}
                    alt={dog.name}
                    borderRadius="md"
                    mb="4"
                    objectFit="cover"
                    boxSize="200px"
                  />
                  <Stack spacing={3}>
                    <Heading size="md" color="teal.500">
                      {dog.name}
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      {dog.breed}
                    </Text>
                    <Button colorScheme="teal" width="full">
                      Adoptar
                    </Button>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    );
  };

  export default Dashboard;
