import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Heading,
  useToast,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface QueryParams {
  uid: string;
  token: string;
}

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [params, setParams] = useState<QueryParams>({ uid: '', token: '' });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const uid = searchParams.get('uid') || '';
    const token = searchParams.get('token') || '';
    setParams({ uid, token });
  }, [location.search]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async () => {
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!newPassword) {
      setNewPasswordError(t('error_password_required'));
      return;
    }
    if (!validatePassword(newPassword)) {
      setNewPasswordError(t('error_password_requirements'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t('error_confirm_password'));
      return;
    }

    if (!params.uid || !params.token) {
      toast({
        title: t('error_reset_link_invalido'),
        status: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(
        '/users/password-reset-confirm/',
        {
          uid: params.uid,
          token: params.token,
          new_password: newPassword,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      toast({
        title: t('password_restablecida_exito'),
        status: 'success',
      });
      navigate('/login');
    } catch (err: unknown) {
      console.error('Error al restablecer contraseña:', err);
      let msg = t('error_restablecer_contraseña');
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.detail || msg;
      }
      toast({ title: msg, status: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#F7FAFC"
      p={4}
    >
      <Box
        maxW="400px"
        w="full"
        bg="white"
        boxShadow="lg"
        borderRadius="lg"
        p={6}
      >
        <Heading size="lg" textAlign="center" mb={6} color="teal.600">
          {t('recuperar_contraseña')}
        </Heading>

        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!newPasswordError}>
            <FormLabel>{t('password_label')}</FormLabel>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder={t('password_label')}
              focusBorderColor="teal.500"
            />
            {newPasswordError && (
              <FormErrorMessage>{newPasswordError}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!confirmPasswordError}>
            <FormLabel>{t('confirm_password')}</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder={t('placeholder_confirm_password')}
              focusBorderColor="teal.500"
            />
            {confirmPasswordError && (
              <FormErrorMessage>{confirmPasswordError}</FormErrorMessage>
            )}
          </FormControl>

          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={submitting}
            loadingText={t('restableciendo')}
          >
            {t('restablecer_contraseña_boton')}
          </Button>

          <Text fontSize="sm" textAlign="center" color="gray.600">
            <Button
              variant="link"
              colorScheme="teal"
              onClick={() => navigate('/login')}
            >
              {t('volver_al_login')}
            </Button>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default ResetPassword;
