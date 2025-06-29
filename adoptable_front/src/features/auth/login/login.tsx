import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginSuccess, loginFailure } from '../authSlice';
import { login, LoginResponse } from '../authService';
import { checkSession } from '../session/checkSession';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Card,
  CardBody,
  Heading,
  Text,
  FormErrorMessage,
  Flex,
  Alert,
  AlertIcon,
  Link,
  VStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (await checkSession()) navigate('/dashboard');
    })();
  }, [navigate]);

  const validatePasswordFormat = (pwd: string) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}[\]|\\:;"'<>,.?/`~-]{8,}$/;
    return regex.test(pwd);
  };

  const handleLogin = async () => {
    setUsernameError('');
    setPasswordError('');
    setFormError('');

    if (!username) {
      setUsernameError(t('error_username_required'));
      return;
    }
    if (!password) {
      setPasswordError(t('error_password_required'));
      return;
    }
    if (!validatePasswordFormat(password)) {
      setPasswordError(t('error_password_requirements'));
      return;
    }

    try {
      const data: LoginResponse = await login({ username, password });
      const computedRole = data.user.is_superuser ? 'admin' : data.role;
      dispatch(
        loginSuccess({
          user: data.user,
          role: computedRole,
        })
      );
      navigate('/dashboard');
    } catch (err: unknown) {
      dispatch(loginFailure((err as Error).message));
      console.error('Error durante el inicio de sesión:', err);

      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === 403) {
          setFormError(t('error_account_not_approved'));
        } else if (status === 401) {
          setFormError(t('error_invalid_credentials'));
        } else {
          setFormError(t('error_server'));
        }
      } else {
        setFormError(t('error_server'));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLogin();
  };

  const goToRegister = () => navigate('/register');

  const handleSendReset = async () => {
    setResetEmailError('');
    setResetMessage('');

    if (!resetEmail.trim()) {
      setResetEmailError(t('error_email_required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetEmailError(t('error_email_invalid'));
      return;
    }

    setResetLoading(true);
    try {
      const response = await axios.post(
        '/users/password-reset/',
        { email: resetEmail.trim().toLowerCase() },
        { withCredentials: true }
      );

      if (
        response.status === 200 &&
        response.data.message === 'revisa_tu_correo'
      ) {
        setResetMessage(t('revisa_tu_correo'));
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 418) {
          setResetEmailError(t('error_usuario_no_encontrado'));
        } else {
          console.error('Error solicitando recuperación de contraseña:', err);
          setResetEmailError(t('error_restablecer_contraseña'));
        }
      } else {
        console.error('Error solicitando recuperación de contraseña:', err);
        setResetEmailError(t('error_restablecer_contraseña'));
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#F7FAFC"
    >
      <Card
        maxW="600px"
        w="full"
        boxShadow="lg"
        borderRadius="lg"
        bg="white"
        borderColor="teal.300"
        p={6}
      >
        <CardBody>
          <Heading as="h2" size="xl" textAlign="center" mb={4} color="teal.600">
            {t('login_heading')}
          </Heading>

          <Text fontSize="md" textAlign="center" mb={6} color="gray.600">
            {t('login_subtitle')}
          </Text>

          {formError && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {formError}
            </Alert>
          )}

          {!showResetForm && (
            <VStack spacing={4} align="stretch">
              {/* — login form — */}
              <FormControl isInvalid={!!usernameError} mb={4}>
                <FormLabel>{t('login_username_label')}</FormLabel>
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={t('placeholder_username')}
                  focusBorderColor="teal.500"
                />
                {usernameError && (
                  <FormErrorMessage>{usernameError}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!passwordError} mb={6}>
                <FormLabel>{t('password_label')}</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('placeholder_password')}
                  onKeyDown={handleKeyDown}
                  focusBorderColor="teal.500"
                />
                {passwordError && (
                  <FormErrorMessage>{passwordError}</FormErrorMessage>
                )}
              </FormControl>

              <Button
                colorScheme="teal"
                onClick={handleLogin}
                w="full"
                size="lg"
                mb={2}
              >
                {t('login_button')}
              </Button>

              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.600">
                  {t('login_no_account')}{' '}
                  <Button
                    variant="link"
                    color="teal.500"
                    onClick={goToRegister}
                  >
                    {t('login_register_link')}
                  </Button>
                </Text>

                <Link
                  color="teal.500"
                  fontSize="sm"
                  cursor="pointer"
                  onClick={() => {
                    setShowResetForm(true);
                    setResetEmail('');
                    setResetEmailError('');
                    setResetMessage('');
                  }}
                >
                  {t('recuperar_contraseña')}
                </Link>
              </Flex>
            </VStack>
          )}

          {showResetForm && (
            <VStack spacing={4} align="stretch">
              <Text textAlign="center" color="gray.700">
                {t('recuperar_contraseña')}
              </Text>

              {/* — feedback success — */}
              {resetMessage && (
                <Alert status="success" mb={4}>
                  <AlertIcon />
                  {resetMessage}
                </Alert>
              )}

              {/* — feedback error — */}
              {resetEmailError && (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  {resetEmailError}
                </Alert>
              )}

              <FormControl isInvalid={!!resetEmailError} mb={4}>
                <FormLabel>{t('placeholder_email')}</FormLabel>
                <Input
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder={t('placeholder_email')}
                  focusBorderColor="teal.500"
                />
              </FormControl>

              <Button
                colorScheme="teal"
                onClick={handleSendReset}
                isLoading={resetLoading}
                w="full"
              >
                {t('restablecer_contraseña_boton')}
              </Button>

              <Link
                color="teal.500"
                fontSize="sm"
                textAlign="center"
                onClick={() => setShowResetForm(false)}
                mt={2}
              >
                {t('volver_al_login')}
              </Link>
            </VStack>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default Login;
