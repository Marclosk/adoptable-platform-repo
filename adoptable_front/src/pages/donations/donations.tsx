// src/pages/donations/Donations.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Select,
  Flex,
} from "@chakra-ui/react";
import Layout from "../../components/layout";
import Loader from "../../components/loader/loader";
import { logoutSuccess } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authService";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import { fetchDonations, donate, Donation } from "./donations_services";

const Donations: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("10");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const loadDonations = async () => {
      setLoading(true);
      const data = await fetchDonations();
      if (user) {
        const filtered = data.filter(
          (donation) => donation.usuario === user.username
        );
        setUserDonations(filtered);
      }
      setDonations(data);
      setLoading(false);
    };
    loadDonations();
  }, [user]);

  const handleDonate = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const donationAmount = parseFloat(customAmount || amount);
      const newDonation = await donate(donationAmount, token);
      toast({
        title: "¡Gracias por tu donación! ❤️",
        description: `Has donado ${donationAmount}€ para ayudar a los animales.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setDonations((prev) => [newDonation, ...prev]);
      setUserDonations((prev) => [newDonation, ...prev]);
    } catch (error) {
      console.error("Error al hacer la donación:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar tu donación.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Layout handleLogout={handleLogout}>
      <Box bg="gray.50" minH="100vh" py={8} px={{ base: 4, md: 8 }}>
        <Box
          maxW="600px"
          mx="auto"
          bg="white"
          color="gray.800"
          p={6}
          mb={8}
          borderRadius="md"
          shadow="md"
          textAlign="center"
        >
          <Heading size="lg" color="teal.500" mb={4}>
            Ayuda a los animales 🐾
          </Heading>
          <Text fontSize="md" color="gray.600" mb={6}>
            Cada donación ayuda a alimentar, cuidar y encontrar un hogar para
            los animales.
          </Text>
          <VStack spacing={4}>
            <Select
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              color="gray.800"
            >
              <option value="5">5€</option>
              <option value="10">10€</option>
              <option value="20">20€</option>
              <option value="50">50€</option>
              <option value="">Otro monto</option>
            </Select>
            {amount === "" && (
              <Input
                type="number"
                placeholder="Introduce un monto"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                color="gray.800"
              />
            )}
            <Button colorScheme="teal" onClick={handleDonate} size="lg">
              Donar ❤️
            </Button>
          </VStack>
        </Box>

        <Box maxW="1200px" mx="auto" px={6} pb={8}>
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={8}
            justify="center"
            align="start"
          >
            <Box
              flex="1"
              bg="white"
              color="gray.800"
              borderRadius="md"
              shadow="md"
              p={4}
              textAlign="center"
            >
              <Heading size="md" color="teal.500" mb={4}>
                Últimas Donaciones
              </Heading>
              {loading ? (
                <Loader />
              ) : (
                <VStack spacing={3}>
                  {donations.slice(0, 5).map((donation) => (
                    <Box
                      key={donation.id}
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      shadow="sm"
                      w="100%"
                    >
                      <Text fontWeight="bold">{donation.usuario}</Text>
                      <Text>
                        {donation.cantidad}€ –{" "}
                        {new Date(donation.fecha).toLocaleString()}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>

            {user && (
              <Box
                flex="1"
                bg="white"
                color="gray.800"
                borderRadius="md"
                shadow="md"
                p={4}
                textAlign="center"
              >
                <Heading size="md" color="teal.500" mb={4}>
                  Tus Donaciones
                </Heading>
                {loading ? (
                  <Loader />
                ) : (
                  <VStack spacing={3}>
                    {userDonations.slice(0, 5).map((donation) => (
                      <Box
                        key={donation.id}
                        p={3}
                        bg="gray.50"
                        borderRadius="md"
                        shadow="sm"
                        w="100%"
                      >
                        <Text fontWeight="bold">{donation.cantidad}€</Text>
                        <Text>{new Date(donation.fecha).toLocaleString()}</Text>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            )}
          </Flex>
        </Box>
      </Box>
    </Layout>
  );
};

export default Donations;
