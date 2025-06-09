import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  Button,
  HStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/layout';
import axios from 'axios';
import { getCSRFToken } from '../profile/user_services';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

const ContactDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<ContactMessage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const csrfToken = getCSRFToken();
  const bg = useColorModeValue('white', 'gray.700');
  const shadow = useColorModeValue('md', 'dark-lg');

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      try {
        const resp = await axios.get<ContactMessage>(
          `/api/contact/admin/messages/${id}/`,
          {
            headers: { 'X-CSRFToken': csrfToken },
            withCredentials: true,
          }
        );
        setContact(resp.data);
      } catch {
        toast({
          title: t('error_cargar_mensaje') || 'Error cargando mensaje',
          status: 'error',
        });
        navigate('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [id, csrfToken, navigate, toast, t]);

  const handleResolve = async () => {
    if (!contact) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/contact/admin/messages/${contact.id}/`, {
        headers: { 'X-CSRFToken': csrfToken },
        withCredentials: true,
      });
      toast({
        title: t('mensaje_resuelto') || 'Mensaje resuelto y eliminado',
        status: 'success',
      });
      navigate('/admin/dashboard');
    } catch {
      toast({
        title: t('error_resolver_mensaje') || 'Error al resolver mensaje',
        status: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout handleLogout={() => navigate('/login')}>
        <Flex justify="center" py={20}>
          <Spinner size="xl" color="teal.500" />
        </Flex>
      </Layout>
    );
  }

  if (!contact) {
    return (
      <Layout handleLogout={() => navigate('/login')}>
        <Box textAlign="center" mt={12}>
          <Text fontSize="2xl" fontWeight="bold" color="red.500">
            {t('mensaje_no_encontrado') || 'Mensaje no encontrado'}
          </Text>
          <HStack justify="center" mt={6}>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              {t('volver') || 'Volver'}
            </Button>
          </HStack>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout handleLogout={() => navigate('/login')}>
      <Flex justify="center" py={8}>
        <Box
          maxW="600px"
          w="full"
          bg={bg}
          boxShadow={shadow}
          borderRadius="lg"
          p={6}
        >
          <HStack justify="start" mb={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              {t('volver') || 'Volver'}
            </Button>
          </HStack>

          <Heading mb={4} color="teal.600" size="lg" textAlign="center">
            {t('detalle_mensaje_contacto') || 'Detalle Mensaje de Contacto'}
          </Heading>

          <Box mb={4}>
            <Text fontWeight="bold">{t('nombre') || 'Nombre'}:</Text>
            <Text>{contact.name}</Text>
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold">{t('email') || 'Email'}:</Text>
            <Text>{contact.email}</Text>
          </Box>

          <Box mb={4}>
            <Text fontWeight="bold">
              {t('fecha_envio') || 'Fecha de Envío'}:
            </Text>
            <Text>{new Date(contact.created_at).toLocaleString()}</Text>
          </Box>

          <Box mb={6}>
            <Text fontWeight="bold">{t('mensaje') || 'Mensaje'}:</Text>
            <Text whiteSpace="pre-wrap">{contact.message}</Text>
          </Box>

          <Button
            colorScheme="red"
            width="full"
            isLoading={deleteLoading}
            onClick={handleResolve}
          >
            {t('resolver_mensaje') || 'Resolver'}
          </Button>
        </Box>
      </Flex>
    </Layout>
  );
};

export default ContactDetail;
