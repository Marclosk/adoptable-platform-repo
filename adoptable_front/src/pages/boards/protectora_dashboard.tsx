// ── src/pages/protectora/ProtectoraDashboard.tsx ──

import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  Spinner,
  Text,
  useColorModeValue,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
} from "@chakra-ui/react";
import {
  FaPaw,
  FaClipboardList,
  FaCheckCircle,
  FaChevronRight,
  FaPercentage,
  FaChartLine,
  FaChartBar,
} from "react-icons/fa";
import Layout from "../../components/layout";
import { useNavigate } from "react-router-dom";
import {
  getProtectoraMetrics,
  getProtectoraAnimals,
  ProtectoraAnimal,
} from "../card_detail/animal_services";

// imports de Recharts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

interface ProtectoraMetrics {
  total_animals: number;
  pending_requests: number;
  completed_adoptions: number;
}

const COLORS = ["#38A169", "#ED8936", "#4FD1C5"]; // verde, naranja, turquesa

const ProtectoraDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ProtectoraMetrics>({
    total_animals: 0,
    pending_requests: 0,
    completed_adoptions: 0,
  });
  const [animals, setAnimals] = useState<ProtectoraAnimal[]>([]);

  // Datos de ejemplo para gráficas (reemplaza con fetch real)
  const [monthlyAdoptions, setMonthlyAdoptions] = useState<
    { month: string; count: number }[]
  >([]);
  const [topRequested, setTopRequested] = useState<
    { name: string; count: number }[]
  >([]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [m, a] = await Promise.all([
          getProtectoraMetrics(),
          getProtectoraAnimals(),
        ]);
        setMetrics(m);
        setAnimals(a);

        // simula datos de gráficas
        setMonthlyAdoptions([
          { month: "Ene", count: 2 },
          { month: "Feb", count: 4 },
          { month: "Mar", count: 3 },
          { month: "Abr", count: 5 },
          { month: "May", count: 6 },
          { month: "Jun", count: 4 },
          { month: "Jul", count: 7 },
          { month: "Ago", count: 5 },
          { month: "Sep", count: 8 },
          { month: "Oct", count: 6 },
          { month: "Nov", count: 9 },
          { month: "Dic", count: 7 },
        ]);
        setTopRequested([
          { name: "Fido", count: 12 },
          { name: "Luna", count: 9 },
          { name: "Nala", count: 7 },
          { name: "Rex", count: 5 },
          { name: "Milo", count: 3 },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const { total_animals, pending_requests, completed_adoptions } = metrics;
  const adoptionRate =
    total_animals > 0 ? (completed_adoptions / total_animals) * 100 : 0;

  const bg = useColorModeValue("white", "gray.700");
  const shadow = useColorModeValue("md", "dark-lg");

  if (loading) {
    return (
      <Layout handleLogout={() => navigate("/login")}>
        <Flex justify="center" py={20}>
          <Spinner size="xl" color="teal.500" />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout handleLogout={() => navigate("/login")}>
      <Box maxW="1200px" mx="auto" py={8} px={[4, 6, 8]}>
        <Heading mb={6} color="teal.600">
          Panel Protectora
        </Heading>

        {/* Estadísticas generales */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={6}>
            <Flex align="center">
              <Icon as={FaPaw} boxSize={6} color="teal.500" mr={3} />
              <Text fontSize="lg" fontWeight="medium">
                Total de animales
              </Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold">
              {total_animals}
            </Text>
          </Box>

          <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={6}>
            <Flex align="center">
              <Icon as={FaClipboardList} boxSize={6} color="orange.500" mr={3} />
              <Text fontSize="lg" fontWeight="medium">
                Solicitudes pendientes
              </Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold">
              {pending_requests}
            </Text>
          </Box>

          <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={6}>
            <Flex align="center">
              <Icon as={FaCheckCircle} boxSize={6} color="green.500" mr={3} />
              <Text fontSize="lg" fontWeight="medium">
                Adopciones completadas
              </Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold">
              {completed_adoptions}
            </Text>
          </Box>
        </SimpleGrid>

        <Divider mb={8} />

        {/* Gráficas */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
          {/* PieChart */}
          <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={4}>
            <Heading size="md" mb={4}>
              Estado global
            </Heading>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Adoptados", value: completed_adoptions },
                    { name: "Pendientes", value: pending_requests },
                    { name: "Disponibles", value: total_animals - completed_adoptions },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={80}
                  label
                >
                  {[
                    completed_adoptions,
                    pending_requests,
                    total_animals - completed_adoptions,
                  ].map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* LineChart mensual */}
          <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={4}>
            <Heading size="md" mb={4}>
              Adopciones mensuales
            </Heading>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={monthlyAdoptions}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#38A169"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* BarChart top solicitados */}
          <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={4}>
            <Heading size="md" mb={4}>
              Animales más solicitados
            </Heading>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topRequested}
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#3182CE" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SimpleGrid>

        <Divider mb={8} />

        {/* Tabla detallada */}
        <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={6}>
          <Heading size="md" mb={4}>
            Animales en adopción
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th isNumeric>Solicitudes</Th>
                <Th textAlign="right">Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {animals.map((a) => (
                <Tr key={a.id}>
                  <Td>{a.name}</Td>
                  <Td isNumeric>{a.pending_requests}</Td>
                  <Td textAlign="right">
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<FaChevronRight />}
                      onClick={() =>
                        navigate(`/protectora/animal/${a.id}/requests`)
                      }
                    >
                      Ver
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {!animals.length && (
            <Text textAlign="center" mt={4} color="gray.500">
              No tienes animales en adopción.
            </Text>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default ProtectoraDashboard;
