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
  Checkbox,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import Layout from "../../components/layout";
import Loader from "../../components/loader/loader";
import { logoutSuccess } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authService";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import {
  fetchDonations,
  donate,
  Donation,
} from "./donations_services";

const Donations: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const user = useSelector((state: RootState) => state.auth.user);

  const [amount, setAmount] = useState<string>("10");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [anonymous, setAnonymous] = useState<boolean>(false);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDonations = async () => {
      setLoading(true);
      const data = await fetchDonations();
      setDonations(data);
      if (user) {
        setUserDonations(data.filter((d) => d.usuario === user.username));
      }
      setLoading(false);
    };
    loadDonations();
  }, [user]);

  const handleDonate = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const donationAmount = parseFloat(customAmount || amount);
      const newDonation = await donate(donationAmount, token, anonymous);

      toast({
        title: t("donacion_gracias"),
        description: t("donacion_exito_descripcion", { amount: donationAmount }),
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setDonations((prev) => [newDonation, ...prev]);
      setUserDonations((prev) => [newDonation, ...prev]);
    } catch {
      toast({
        title: t("error"),
        description: t("error_donacion"),
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
        {/* Donation form */}
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
            {t("donations_help_title")}
          </Heading>
          <Text fontSize="md" color="gray.600" mb={6}>
            {t("donations_help_subtitle")}
          </Text>
          <VStack spacing={4}>
            <Select
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            >
              <option value="5">{t("monto_5")}</option>
              <option value="10">{t("monto_10")}</option>
              <option value="20">{t("monto_20")}</option>
              <option value="50">{t("monto_50")}</option>
              <option value="">{t("otro_monto")}</option>
            </Select>
            {amount === "" && (
              <Input
                type="number"
                placeholder={t("placeholder_monto")}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            )}
            <Checkbox
              isChecked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              colorScheme="teal"
            >
              {t("donar_anonimo")}
            </Checkbox>
            <Button colorScheme="teal" onClick={handleDonate} size="lg">
              {t("donar_boton")}
            </Button>
          </VStack>
        </Box>

        {/* Donation lists */}
        <Box maxW="1200px" mx="auto" px={6} pb={8}>
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={8}
            justify="center"
            align="start"
          >
            {/* Public donation feed */}
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
                {t("ultimas_donaciones")}
              </Heading>
              {loading ? (
                <Loader />
              ) : donations.length === 0 ? (
                <Text color="gray.600">{t("no_hay_donaciones")}</Text>
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
                      <Text fontWeight="bold">
                        {donation.anonimo ? t("anonimo") : donation.usuario}
                      </Text>
                      <Text>
                        {donation.cantidad}€ –{" "}
                        {new Date(donation.fecha).toLocaleString()}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>

            {/* Your personal donations */}
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
                  {t("tus_donaciones")}
                </Heading>
                {loading ? (
                  <Loader />
                ) : userDonations.length === 0 ? (
                  <Text color="gray.600">{t("no_tus_donaciones")}</Text>
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
                        <Text>
                          {new Date(donation.fecha).toLocaleString()}
                        </Text>
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
