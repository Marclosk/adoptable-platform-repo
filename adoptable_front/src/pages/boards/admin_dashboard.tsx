import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/layout';
import axios from 'axios';
import { getCSRFToken } from '../profile/user_services';

interface ProtectoraPending {
  id: number;
  username: string;
  email: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface BlockedUser {
  id: number;
  username: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [pendingList, setPendingList] = useState<ProtectoraPending[]>([]);
  const [contactList, setContactList] = useState<ContactMessage[]>([]);
  const [blockedList, setBlockedList] = useState<BlockedUser[]>([]);

  const csrfToken = getCSRFToken();

  const fetchPending = async () => {
    try {
      const response = await axios.get<ProtectoraPending[]>(
        '/users/admin/pending-protectoras/',
        {
          headers: {
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );
      setPendingList(response.data);
    } catch {
      toast({
        title:
          t('error_cargar_protectoras_pendientes') || 'Error cargando datos',
        status: 'error',
      });
    }
  };

  const handleValidate = async (id: number) => {
    try {
      await axios.post(
        `/users/admin/validate-protectora/${id}/`,
        {},
        {
          headers: {
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );
      toast({
        title: t('protectora_validada') || 'Protectora validada',
        status: 'success',
      });
      setPendingList(prev => prev.filter(p => p.id !== id));
    } catch {
      toast({
        title: t('error_validar_protectora') || 'Error validando protectora',
        status: 'error',
      });
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get<ContactMessage[]>(
        '/api/contact/admin/messages/',
        {
          headers: {
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );
      setContactList(response.data);
    } catch {
      toast({
        title:
          t('error_cargar_mensajes_contacto') ||
          'Error cargando mensajes de contacto',
        status: 'error',
      });
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const response = await axios.get<BlockedUser[]>(
        '/users/admin/blocked-users/',
        {
          headers: {
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );
      setBlockedList(response.data);
    } catch {
      toast({
        title:
          t('error_cargar_usuarios_bloqueados') ||
          'Error cargando usuarios bloqueados',
        status: 'error',
      });
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      await axios.put(
        `/users/admin/unblock/${id}/`,
        {},
        {
          headers: {
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );
      toast({
        title: t('usuario_reactivado') || 'Usuario reactivado',
        status: 'success',
      });
      setBlockedList(prev => prev.filter(u => u.id !== id));
    } catch {
      toast({
        title: t('error_reactivar_usuario') || 'Error reactivando usuario',
        status: 'error',
      });
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchPending(), fetchContacts(), fetchBlockedUsers()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const bg = useColorModeValue('white', 'gray.700');
  const shadow = useColorModeValue('md', 'dark-lg');

  if (loading) {
    return (
      <Layout handleLogout={() => navigate('/login')}>
        <Flex justify="center" py={20}>
          <Spinner size="xl" color="teal.500" />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout handleLogout={() => navigate('/login')}>
      <Box maxW="800px" mx="auto" py={8} px={[4, 6, 8]}>
        <Heading mb={6} color="teal.600">
          {t('panel_admin') || 'Panel Administrador'}
        </Heading>

        {pendingList.length === 0 ? (
          <Text color="gray.500" mb={8}>
            {t('sin_protectoras_pendientes') ||
              'No hay protectoras pendientes.'}
          </Text>
        ) : (
          <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={6} mb={8}>
            <Heading size="md" mb={4}>
              {t('protectora_pendientes') || 'Protectoras Pendientes'}
            </Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>{t('username') || 'Username'}</Th>
                  <Th>{t('email') || 'Email'}</Th>
                  <Th textAlign="right">{t('acciones') || 'Acciones'}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pendingList.map(p => (
                  <Tr key={p.id}>
                    <Td>{p.username}</Td>
                    <Td>{p.email}</Td>
                    <Td textAlign="right">
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleValidate(p.id)}
                      >
                        {t('validar') || 'Validar'}
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={6} mb={8}>
          <Heading size="md" mb={4}>
            {t('mensajes_contacto') || 'Mensajes de Contacto'}
          </Heading>
          {contactList.length === 0 ? (
            <Text color="gray.500">
              {t('sin_mensajes_contacto') || 'No hay mensajes de contacto.'}
            </Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>{t('nombre') || 'Nombre'}</Th>
                  <Th>{t('email') || 'Email'}</Th>
                  <Th>{t('fecha') || 'Fecha'}</Th>
                  <Th textAlign="right">{t('acciones') || 'Acciones'}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {contactList.map(c => (
                  <Tr key={c.id}>
                    <Td>{c.name}</Td>
                    <Td>{c.email}</Td>
                    <Td>{new Date(c.created_at).toLocaleString()}</Td>
                    <Td textAlign="right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/contact/${c.id}`)}
                      >
                        {t('ver_detalle') || 'Ver Detalle'}
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>

        <Box bg={bg} boxShadow={shadow} borderRadius="lg" p={6}>
          <Heading size="md" mb={4}>
            {t('usuarios_bloqueados') || 'Usuarios Bloqueados'}
          </Heading>
          {blockedList.length === 0 ? (
            <Text color="gray.500">
              {t('sin_usuarios_bloqueados') || 'No hay usuarios bloqueados.'}
            </Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>{t('username') || 'Username'}</Th>
                  <Th>{t('email') || 'Email'}</Th>
                  <Th textAlign="right">{t('acciones') || 'Acciones'}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {blockedList.map(u => (
                  <Tr key={u.id}>
                    <Td>{u.username}</Td>
                    <Td>{u.email}</Td>
                    <Td textAlign="right">
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleUnblock(u.id)}
                      >
                        {t('reactivar_usuario') || 'Reactivar'}
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default AdminDashboard;
