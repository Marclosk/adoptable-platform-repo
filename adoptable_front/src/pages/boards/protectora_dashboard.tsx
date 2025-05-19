// ── src/pages/protectora/ProtectoraDashboard.tsx ──

import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
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
} from "react-icons/fa";
import Layout from "../../components/layout";
import { useNavigate } from "react-router-dom";

import {
  getProtectoraMetrics,
  getProtectoraAnimals,
  getProtectoraAdoptedAnimals,
  ProtectoraAnimal,
  ProtectoraAdoptedAnimal,
  getMonthlyAdoptions,
  getTopRequestedAnimals,
  ProtectoraMetrics as MetricsAPI,
  MonthlyAdoption,
  TopRequested,
} from "../card_detail/animal_services";

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

const COLORS = ["#38A169", "#ED8936", "#4FD1C5"];

const ProtectoraDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsAPI>({
    total_animals: 0,
    pending_requests: 0,
    completed_adoptions: 0,
  });
  const [availableAnimals, setAvailableAnimals] = useState<ProtectoraAnimal[]>(
    []
  );
  const [adoptedAnimals, setAdoptedAnimals] = useState<
    ProtectoraAdoptedAnimal[]
  >([]);
  const [monthlyAdoptions, setMonthlyAdoptions] = useState<MonthlyAdoption[]>(
    []
  );
  const [topRequested, setTopRequested] = useState<TopRequested[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [m, avail, adopted, monthly, top] = await Promise.all([
          getProtectoraMetrics(),
          getProtectoraAnimals(),
          getProtectoraAdoptedAnimals(),
          getMonthlyAdoptions(),
          getTopRequestedAnimals(),
        ]);
        setMetrics(m);
        setAvailableAnimals(avail);
        setAdoptedAnimals(adopted);
        setMonthlyAdoptions(monthly);
        setTopRequested(top);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { total_animals, pending_requests, completed_adoptions } = metrics;
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
            <Flex align="center" mb={2}>
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
            <Flex align="center" mb={2}>
              <Icon
                as={FaClipboardList}
                boxSize={6}
                color="orange.500"
                mr={3}
              />
              <Text fontSize="lg" fontWeight="medium">
                Solicitudes pendientes
              </Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold">
              {pending_requests}
            </Text>
          </Box>
          <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={6}>
            <Flex align="center" mb={2}>
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
                  key={`${completed_adoptions}-${pending_requests}-${
                    total_animals - completed_adoptions
                  }`}
                  data={[
                    { name: "Adoptados", value: completed_adoptions },
                    { name: "Pendientes", value: pending_requests },
                    {
                      name: "Disponibles",
                      value: total_animals - completed_adoptions,
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  label={({ percent }) => `${(percent! * 100).toFixed(0)}%`}
                  labelLine={false}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-in-out"
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
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="square"
                  formatter={(value) => String(value)}
                  wrapperStyle={{
                    top: "50%",
                    right: 0,
                    transform: "translateY(-50%)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* LineChart */}
          <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={4}>
            <Heading size="md" mb={4}>
              Adopciones mensuales
            </Heading>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={monthlyAdoptions}
                key={monthlyAdoptions.map((d) => d.count).join(",")}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#38A169"
                  strokeWidth={2}
                  dot
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* BarChart */}
          <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={4}>
            <Heading size="md" mb={4}>
              Animales más solicitados
            </Heading>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topRequested}
                margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
                key={topRequested.map((d) => d.count).join(",")}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Bar
                  dataKey="count"
                  fill="#3182CE"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SimpleGrid>

        <Divider mb={8} />

        {/* Tabla detallada: Animales en adopción */}
        <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={6} mb={8}>
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
              {availableAnimals.map((a) => (
                <Tr key={a.id}>
                  <Td>{a.name}</Td>
                  <Td isNumeric>{a.pending_requests}</Td>
                  <Td textAlign="right">
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<FaChevronRight />}
                      onClick={() => navigate(`/animals/${a.id}/requests`)}
                    >
                      Ver
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {availableAnimals.length === 0 && (
            <Text textAlign="center" mt={4} color="gray.500">
              No tienes animales en adopción.
            </Text>
          )}
        </Box>

        {/* Tabla detallada: Animales adoptados */}
        <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={6}>
          <Heading size="md" mb={4}>
            Animales adoptados
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Adoptado por</Th>
                <Th textAlign="right">Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {adoptedAnimals.map((a) => (
                <Tr key={a.id}>
                  <Td>{a.name}</Td>
                  <Td>{a.adopter_username}</Td>
                  <Td textAlign="right">
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<FaChevronRight />}
                      onClick={() => navigate(`/animals/${a.id}/requests`)}
                    >
                      Ver
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {adoptedAnimals.length === 0 && (
            <Text textAlign="center" mt={4} color="gray.500">
              No tienes animales adoptados.
            </Text>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default ProtectoraDashboard;
