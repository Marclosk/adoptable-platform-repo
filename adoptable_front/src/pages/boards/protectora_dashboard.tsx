// src/pages/boards/protectora_dashboard.tsx
import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import {
  FaPaw,
  FaClipboardList,
  FaCheckCircle,
  FaChevronRight,
} from 'react-icons/fa';
import Layout from '../../components/layout';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
} from '../card_detail/animal_services';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

import { useDispatch } from 'react-redux';
import { logoutSuccess } from '../../features/auth/authSlice';
import { logout } from '../../features/auth/authService';

const COLORS = ['#38A169', '#ED8936', '#4FD1C5'];

// Dibuja el porcentaje dentro de cada sector del Pie
// Dibuja el porcentaje dentro de cada sector del Pie, pero más grande y oscuro
const renderPercentLabel = (props: PieLabelRenderProps) => {
  // forzamos a número inner/outer radius
  const iR = Number(props.innerRadius) || 0;
  const oR = Number(props.outerRadius) || 0;
  const cx = Number(props.cx) || 0;
  const cy = Number(props.cy) || 0;
  const midAngle = props.midAngle ?? 0;

  const RADIAN = Math.PI / 180;
  const radius = iR + (oR - iR) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#2D3748" // gris oscuro (Gray.800)
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={16} // más grande
      fontWeight="bold" // negrita
    >
      {`${(props.percent! * 100).toFixed(0)}%`}
    </text>
  );
};

const ProtectoraDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
  const bg = useColorModeValue('white', 'gray.700');
  const shadow = useColorModeValue('md', 'dark-lg');

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  if (loading) {
    return (
      <Layout handleLogout={handleLogout}>
        <Flex justify="center" py={20}>
          <Spinner size="xl" color="teal.500" />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout handleLogout={handleLogout}>
      <Box maxW="1200px" mx="auto" py={8} px={{ base: 4, md: 6, lg: 8 }}>
        <Heading mb={6} color="teal.600" fontSize={['2xl', '3xl', '4xl']}>
          {t('panel_protectora')}
        </Heading>

        {/* Métricas */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          {[
            {
              icon: FaPaw,
              label: t('total_animales'),
              value: total_animals,
              color: 'teal.500',
            },
            {
              icon: FaClipboardList,
              label: t('solicitudes_pendientes'),
              value: pending_requests,
              color: 'orange.500',
            },
            {
              icon: FaCheckCircle,
              label: t('adopciones_completadas'),
              value: completed_adoptions,
              color: 'green.500',
            },
          ].map(({ icon, label, value, color }, idx) => (
            <Box
              key={idx}
              bg={bg}
              boxShadow={shadow}
              borderRadius="lg"
              p={{ base: 4, md: 6 }}
            >
              <Flex align="center" mb={2}>
                <Icon
                  as={icon}
                  boxSize={{ base: 5, md: 6 }}
                  color={color}
                  mr={3}
                />
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="medium">
                  {label}
                </Text>
              </Flex>
              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                {value}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Divider mb={8} />

        {/* Gráficas */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
          {/* Pie Chart */}
          <Box
            bg={bg}
            boxShadow={shadow}
            borderRadius="lg"
            p={{ base: 4, md: 6 }}
          >
            <Heading size="md" mb={4} fontSize={{ base: 'lg', md: 'md' }}>
              {t('estado_global')}
            </Heading>
            <Box height={{ base: 150, md: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: t('adoptados'), value: completed_adoptions },
                      { name: t('pendientes'), value: pending_requests },
                      {
                        name: t('disponibles'),
                        value: total_animals - completed_adoptions,
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    labelLine={false}
                    label={renderPercentLabel}
                    isAnimationActive
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
                    formatter={value => String(value)}
                    wrapperStyle={{
                      top: '50%',
                      right: 0,
                      transform: 'translateY(-50%)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Line Chart */}
          <Box
            bg={bg}
            boxShadow={shadow}
            borderRadius="lg"
            p={{ base: 4, md: 6 }}
          >
            <Heading size="md" mb={4} fontSize={{ base: 'lg', md: 'md' }}>
              {t('adopciones_mensuales')}
            </Heading>
            <Box height={{ base: 150, md: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyAdoptions}>
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
                    isAnimationActive
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Bar Chart */}
          <Box
            bg={bg}
            boxShadow={shadow}
            borderRadius="lg"
            p={{ base: 4, md: 6 }}
          >
            <Heading size="md" mb={4} fontSize={{ base: 'lg', md: 'md' }}>
              {t('animales_mas_solicitados')}
            </Heading>
            <Box height={{ base: 150, md: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topRequested}
                  margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
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
                  <Bar dataKey="count" fill="#3182CE" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </SimpleGrid>

        <Divider mb={8} />

        {/* Tablas */}
        <Box
          bg={bg}
          boxShadow={shadow}
          borderRadius="lg"
          p={{ base: 4, md: 6 }}
          mb={8}
          overflowX="auto"
        >
          <Heading size="md" mb={4} fontSize={{ base: 'lg', md: 'md' }}>
            {t('animales_en_adopcion')}
          </Heading>
          <Table variant="simple" size={{ base: 'xs', md: 'sm' }}>
            <Thead>
              <Tr>
                <Th fontSize={{ base: 'xs', md: 'sm' }}>{t('nombre')}</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} isNumeric>
                  {t('solicitudes')}
                </Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} textAlign="right">
                  {t('acciones')}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {availableAnimals.map(a => (
                <Tr key={a.id}>
                  <Td fontSize={{ base: 'xs', md: 'sm' }}>{a.name}</Td>
                  <Td fontSize={{ base: 'xs', md: 'sm' }} isNumeric>
                    {a.pending_requests}
                  </Td>
                  <Td textAlign="right">
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<FaChevronRight />}
                      onClick={() => navigate(`/animals/${a.id}/requests`)}
                    >
                      {t('ver')}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {availableAnimals.length === 0 && (
            <Text textAlign="center" mt={4} color="gray.500">
              {t('no_tienes_animales_en_adopcion')}
            </Text>
          )}
        </Box>

        <Box
          bg={bg}
          boxShadow={shadow}
          borderRadius="lg"
          p={{ base: 4, md: 6 }}
          overflowX="auto"
        >
          <Heading size="md" mb={4} fontSize={{ base: 'lg', md: 'md' }}>
            {t('animales_adoptados')}
          </Heading>
          <Table variant="simple" size={{ base: 'xs', md: 'sm' }}>
            <Thead>
              <Tr>
                <Th fontSize={{ base: 'xs', md: 'sm' }}>{t('nombre')}</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }}>{t('adoptado_por')}</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} textAlign="right">
                  {t('acciones')}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {adoptedAnimals.map(a => (
                <Tr key={a.id}>
                  <Td fontSize={{ base: 'xs', md: 'sm' }}>{a.name}</Td>
                  <Td fontSize={{ base: 'xs', md: 'sm' }}>
                    {a.adopter_username}
                  </Td>
                  <Td textAlign="right">
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<FaChevronRight />}
                      onClick={() => navigate(`/animals/${a.id}/requests`)}
                    >
                      {t('ver')}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {adoptedAnimals.length === 0 && (
            <Text textAlign="center" mt={4} color="gray.500">
              {t('no_tienes_animales_adoptados')}
            </Text>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default ProtectoraDashboard;
