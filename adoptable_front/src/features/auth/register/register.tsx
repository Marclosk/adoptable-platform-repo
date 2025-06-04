// src/pages/auth/Register.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Box,
  FormErrorMessage,
  Card,
  CardBody,
  Heading,
  Text,
  Flex,
  Select,
  Alert,
  AlertIcon,
  useToast,
  Checkbox,
  Collapse,
  HStack,
} from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import { register } from '../authService';
import { useTranslation } from 'react-i18next';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [serverError, setServerError] = useState('');
  const [role, setRole] = useState<'adoptante' | 'protectora'>('adoptante');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [shelterName, setShelterName] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [protectoraUsername, setProtectoraUsername] = useState('');

  const [pwdFieldType, setPwdFieldType] = useState<'text' | 'password'>('text');
  const [pwdReadOnly, setPwdReadOnly] = useState(true);
  const [confirmFieldType, setConfirmFieldType] = useState<'text' | 'password'>(
    'text'
  );
  const [confirmReadOnly, setConfirmReadOnly] = useState(true);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [protectoraUsernameError, setProtectoraUsernameError] = useState('');

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (pwd: string) =>
    /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}[\]|\\:;"'<>,.?/`~-]{8,}$/.test(
      pwd
    );

  const clearErrors = () => {
    setServerError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setUsernameError('');
    setProtectoraUsernameError('');
    setTermsError('');
  };

  const handleRegister = async () => {
    clearErrors();
    let valid = true;

    if (!acceptedTerms) {
      setTermsError(t('error_accept_terms'));
      valid = false;
    }

    if (!validateEmail(email)) {
      setEmailError(t('error_correo_invalido'));
      valid = false;
    }
    if (!validatePassword(password)) {
      setPasswordError(t('error_password_requirements'));
      valid = false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError(t('error_confirm_password'));
      valid = false;
    }

    if (role === 'adoptante') {
      if (!/^[A-Za-z0-9@.+-_]+$/.test(username)) {
        setUsernameError(t('error_username_invalid'));
        valid = false;
      }
    } else {
      if (!/^[A-Za-z0-9@.+-_]+$/.test(protectoraUsername)) {
        setProtectoraUsernameError(t('error_username_invalid'));
        valid = false;
      }
    }

    if (!valid) return;

    try {
      if (role === 'adoptante') {
        await register({
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role: 'adoptante',
        });
      } else {
        await register({
          username: protectoraUsername,
          email,
          password,
          first_name: '',
          last_name: '',
          role: 'protectora',
          localidad,
          shelter_name: shelterName,
        });
      }

      toast({
        title: t('register_success_title'),
        description:
          role === 'protectora'
            ? t('register_success_protectora')
            : t('register_success_adoptante'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/login');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<unknown>;
        if (axiosError.response?.status === 400) {
          const data = axiosError.response.data as Record<string, unknown>;

          if (
            Array.isArray(data.username) &&
            typeof data.username[0] === 'string'
          ) {
            const msg: string = data.username[0];
            setProtectoraUsernameError(
              msg.toLowerCase().includes('already exists')
                ? t('error_username_taken')
                : msg
            );
          }

          if (Array.isArray(data.email) && typeof data.email[0] === 'string') {
            setEmailError(data.email[0]);
          }

          if (
            Array.isArray(data.password) &&
            typeof data.password[0] === 'string'
          ) {
            setPasswordError(data.password[0]);
          }

          if (!data.username && !data.email && !data.password) {
            setServerError(JSON.stringify(data));
          }

          return;
        }
      }

      setServerError(
        error instanceof Error ? error.message : t('error_server')
      );
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
            {t('register_heading')}
          </Heading>
          <Text fontSize="md" textAlign="center" mb={6} color="gray.600">
            {t('register_subtitle')}
          </Text>

          {serverError && (
            <Alert status="error" mb={4}>
              <AlertIcon /> {serverError}
            </Alert>
          )}

          <form autoComplete="off" onSubmit={e => e.preventDefault()}>
            <Input
              type="text"
              name="username_fake"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="username"
            />
            <Input
              type="password"
              name="password_fake"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="new-password"
            />

            <FormControl mb={4}>
              <FormLabel>{t('register_role_label')}</FormLabel>
              <Select
                value={role}
                onChange={e =>
                  setRole(e.target.value as 'adoptante' | 'protectora')
                }
                focusBorderColor="teal.500"
              >
                <option value="adoptante">{t('role_adoptante')}</option>
                <option value="protectora">{t('role_protectora')}</option>
              </Select>
            </FormControl>

            <FormControl isInvalid={!!emailError} mb={4}>
              <FormLabel>{t('email')}</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('placeholder_email')}
                focusBorderColor="teal.500"
                name="signup_email"
                autoComplete="nope"
              />
              <FormErrorMessage>{emailError}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!passwordError} mb={4}>
              <FormLabel>{t('password')}</FormLabel>
              <Input
                type={pwdFieldType}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('placeholder_password')}
                focusBorderColor="teal.500"
                autoComplete="new-password"
                readOnly={pwdReadOnly}
                onFocus={() => {
                  setPwdFieldType('password');
                  setPwdReadOnly(false);
                }}
              />
              <FormErrorMessage>{passwordError}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!confirmPasswordError} mb={4}>
              <FormLabel>{t('confirm_password')}</FormLabel>
              <Input
                type={confirmFieldType}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t('placeholder_confirm_password')}
                focusBorderColor="teal.500"
                autoComplete="new-password"
                readOnly={confirmReadOnly}
                onFocus={() => {
                  setConfirmFieldType('password');
                  setConfirmReadOnly(false);
                }}
              />
              <FormErrorMessage>{confirmPasswordError}</FormErrorMessage>
            </FormControl>

            {role === 'adoptante' ? (
              <>
                <FormControl isInvalid={!!usernameError} mb={4}>
                  <FormLabel>{t('username_label')}</FormLabel>
                  <Input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={t('placeholder_username')}
                    focusBorderColor="teal.500"
                    name="signup_username"
                    autoComplete="nope"
                  />
                  <FormErrorMessage>{usernameError}</FormErrorMessage>
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>{t('first_name_label')}</FormLabel>
                  <Input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder={t('placeholder_first_name')}
                    focusBorderColor="teal.500"
                    name="signup_first_name"
                    autoComplete="nope"
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>{t('last_name_label')}</FormLabel>
                  <Input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder={t('placeholder_last_name')}
                    focusBorderColor="teal.500"
                    name="signup_last_name"
                    autoComplete="nope"
                  />
                </FormControl>
              </>
            ) : (
              <>
                <FormControl mb={4}>
                  <FormLabel>{t('shelter_name_label')}</FormLabel>
                  <Input
                    value={shelterName}
                    onChange={e => setShelterName(e.target.value)}
                    placeholder={t('placeholder_shelter_name')}
                    focusBorderColor="teal.500"
                    name="signup_shelter_name"
                    autoComplete="nope"
                  />
                </FormControl>
                <FormControl isInvalid={!!protectoraUsernameError} mb={4}>
                  <FormLabel>{t('protectora_username_label')}</FormLabel>
                  <Input
                    value={protectoraUsername}
                    onChange={e => setProtectoraUsername(e.target.value)}
                    placeholder={t('placeholder_protectora_username')}
                    focusBorderColor="teal.500"
                    name="signup_protectora_username"
                    autoComplete="nope"
                  />
                  <FormErrorMessage>{protectoraUsernameError}</FormErrorMessage>
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>{t('localidad_label')}</FormLabel>
                  <Input
                    value={localidad}
                    onChange={e => setLocalidad(e.target.value)}
                    placeholder={t('placeholder_localidad')}
                    focusBorderColor="teal.500"
                    name="signup_localidad"
                    autoComplete="nope"
                  />
                </FormControl>
              </>
            )}

            <FormControl isInvalid={!!termsError} mb={4}>
              <HStack align="start">
                <Checkbox
                  isChecked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  colorScheme="teal"
                />
                <Text>
                  {t('accept_terms_prefix')}{' '}
                  <Button
                    variant="link"
                    colorScheme="teal"
                    onClick={() => setShowTerms(!showTerms)}
                  >
                    {t('terms_and_conditions')}
                  </Button>
                </Text>
              </HStack>
              <FormErrorMessage>{termsError}</FormErrorMessage>
            </FormControl>

            <Collapse in={showTerms} animateOpacity>
              <Box
                p={4}
                bg="gray.50"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                mb={4}
                maxH="200px"
                overflowY="auto"
              >
                <Text fontWeight="bold" mb={2}>
                  {t('terms_content_title')}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {t('terms_content_body')}
                </Text>
              </Box>
            </Collapse>

            <Button
              colorScheme="teal"
              size="lg"
              w="full"
              mb={4}
              onClick={handleRegister}
            >
              {t('register_button')}
            </Button>

            <Flex justify="center">
              <Button
                variant="link"
                color="teal.500"
                onClick={() => navigate('/login')}
              >
                {t('register_go_login')}
              </Button>
            </Flex>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Register;
