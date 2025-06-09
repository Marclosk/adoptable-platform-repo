// src/pages/animal/ContactPage.tsx

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/layout';
import { logoutSuccess } from '../../features/auth/authSlice';
import { logout } from '../../features/auth/authService';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { sendContactMessage, ContactData } from './contact_services';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [messageError, setMessageError] = useState('');

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    setNameError('');
    setEmailError('');
    setMessageError('');

    let valid = true;

    if (!name.trim()) {
      setNameError(t('error_nombre_obligatorio'));
      valid = false;
    }

    if (!validateEmail(email)) {
      setEmailError(t('error_correo_invalido'));
      valid = false;
    }

    if (!message.trim()) {
      setMessageError(t('error_mensaje_vacio'));
      valid = false;
    }

    if (!valid) return;

    const contactData: ContactData = { name, email, message };

    try {
      await sendContactMessage(contactData);

      toast({
        title: t('mensaje_enviado_titulo'),
        description: t('mensaje_enviado_descripcion'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setName('');
      setEmail('');
      setMessage('');
    } catch (error: unknown) {
      console.error('Error al enviar el mensaje:', error);

      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const data = error.response.data as { error?: string };
        toast({
          title: t('error'),
          description: data.error ?? t('error_envio_mensaje'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast({
          title: t('error'),
          description: t('error_email_invalid'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: t('error'),
          description: t('error_envio_mensaje_luego'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Layout handleLogout={handleLogout}>
      <Box
        bg="gray.50"
        minH="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={4}
      >
        <Card
          w="full"
          maxW="600px"
          boxShadow="lg"
          borderRadius="md"
          bg="white"
          borderColor="teal.300"
        >
          <CardBody p={6}>
            <Heading
              as="h2"
              size="lg"
              textAlign="center"
              mb={4}
              color="teal.500"
            >
              {t('contact_title')}
            </Heading>
            <Text fontSize="md" textAlign="center" mb={6} color="gray.600">
              {t('contact_subtitle')}
            </Text>

            <FormControl isInvalid={!!nameError} mb={4}>
              <FormLabel>{t('nombre')}</FormLabel>
              <Input
                type="text"
                placeholder={t('placeholder_nombre')}
                value={name}
                onChange={e => setName(e.target.value)}
                borderColor="teal.300"
              />
              {nameError && <FormErrorMessage>{nameError}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!emailError} mb={4}>
              <FormLabel>{t('correo_electronico')}</FormLabel>
              <Input
                type="email"
                placeholder={t('placeholder_correo')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                borderColor="teal.300"
              />
              {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!messageError} mb={4}>
              <FormLabel>{t('mensaje')}</FormLabel>
              <Textarea
                placeholder={t('placeholder_mensaje')}
                value={message}
                onChange={e => setMessage(e.target.value)}
                borderColor="teal.300"
                rows={5}
              />
              {messageError && (
                <FormErrorMessage>{messageError}</FormErrorMessage>
              )}
            </FormControl>

            <Button
              colorScheme="teal"
              size="md"
              w="full"
              mt={4}
              onClick={handleSubmit}
            >
              {t('enviar')}
            </Button>
          </CardBody>
        </Card>
      </Box>
    </Layout>
  );
};

export default ContactPage;
