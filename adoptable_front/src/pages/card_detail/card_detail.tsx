// src/pages/card_detail/card_detail.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  AspectRatio,
  Image as ChakraImage,
  Skeleton,
  Button,
  Flex,
  Divider,
  Badge,
  Icon,
  VStack,
  HStack,
  FormControl,
  Select,
  useToast,
  useColorModeValue,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  FormLabel,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckCircleIcon, StarIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useTranslation } from 'react-i18next';

import Layout from '../../components/layout';
import Loader from '../../components/loader/loader';

import {
  getAnimalById,
  deleteAnimal,
  adoptAnimal,
  unadoptAnimal,
  addFavorite,
  removeFavorite,
  requestAdoption,
  getMyAdoptionRequests,
  listAdoptionRequestsForAnimal,
} from './animal_services';
import { getProfile, getAdoptionForm } from '../profile/user_services';
import type { AdoptionFormAPI } from '../profile/user_services';
import { logoutSuccess } from '../../features/auth/authSlice';
import { logout } from '../../features/auth/authService';

interface Animal {
  id: number;
  name: string;
  city: string;
  biography: string;
  imageUrl?: string;
  image?: string | { url?: string };
  age: string;
  breed: string;
  species: string;
  weight: string;
  size: string;
  activity: string;
  gender: 'male' | 'female';
  vaccinated: boolean;
  sterilized: boolean;
  microchipped: boolean;
  dewormed: boolean;
  shelter: string;
  since: string;
  owner?: number | null;
  adopter?: number | null;
  adopter_username?: string;
}

interface Adopter {
  id: number;
  username: string;
}

const AnimalDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user: authUser, role } = useAppSelector(s => s.auth);

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [adopters, setAdopters] = useState<Adopter[]>([]);
  const [selectedAdopter, setSelectedAdopter] = useState<number | ''>('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [isFormAlertOpen, setIsFormAlertOpen] = useState(false);
  const formAlertCancelRef = useRef<HTMLButtonElement>(null);

  const {
    isOpen: isUnadoptOpen,
    onOpen: onUnadoptOpen,
    onClose: onUnadoptClose,
  } = useDisclosure();
  const unadoptCancelRef = useRef<HTMLButtonElement>(null);

  const fallbackImage = '/images/default_image.jpg';
  const [imageLoaded, setImageLoaded] = useState(false);

  const loadAnimal = useCallback(async () => {
    try {
      const data = (await getAnimalById(Number(id))) as Animal;
      setAnimal(data);
    } catch (error) {
      console.error(error);
      toast({ title: t('error_cargar_animal'), status: 'error' });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast, t]);

  const loadFavorites = useCallback(async () => {
    if (role !== 'adoptante' || !animal) return;
    try {
      const prof = (await getProfile()) as { favorites?: { id: number }[] };
      if (Array.isArray(prof.favorites)) {
        setIsFavorite(prof.favorites.some(f => f.id === animal.id));
      }
    } catch (error) {
      console.error(error);
    }
  }, [animal, role]);

  const loadRequestStatus = useCallback(async () => {
    if (role !== 'adoptante' || !animal) return;
    try {
      const requests = await getMyAdoptionRequests();
      const existing = (
        requests as unknown as { animal: { id: number } }[]
      ).find(r => r.animal.id === animal.id);
      if (existing) {
        setIsRequested(true);
      }
    } catch (error) {
      console.error(error);
    }
  }, [animal, role]);

  const loadApplicants = useCallback(async () => {
    if (
      role !== 'protectora' ||
      !animal ||
      authUser?.id !== animal.owner ||
      animal.adopter != null
    )
      return;
    try {
      const reqs = await listAdoptionRequestsForAnimal(animal.id);
      setAdopters(reqs.map(r => r.user));
    } catch (error) {
      console.error(error);
    }
  }, [animal, role, authUser]);

  useEffect(() => {
    loadAnimal();
  }, [loadAnimal]);

  useEffect(() => {
    loadFavorites();
    loadRequestStatus();
    loadApplicants();
  }, [loadFavorites, loadRequestStatus, loadApplicants]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast({ title: t('error_cerrar_sesion'), status: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!animal) return;
    try {
      await deleteAnimal(animal.id);
      toast({ title: t('animal_eliminado'), status: 'success' });
      navigate('/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: message || t('error_eliminando'),
        status: 'error',
      });
    }
  };

  const handleAdoptionRequest = async () => {
    if (!animal) return;
    setRequestLoading(true);
    try {
      const form: AdoptionFormAPI = await getAdoptionForm();
      const requiredFields: (keyof AdoptionFormAPI)[] = [
        'full_name',
        'address',
        'phone',
        'email',
        'reason',
      ];
      const missing = requiredFields.filter(f => {
        const v = form[f];
        return v == null || (typeof v === 'string' && !v.trim());
      });
      if (missing.length) {
        setIsFormAlertOpen(true);
        return;
      }
      await requestAdoption(animal.id, form);
      toast({ title: t('solicitud_enviada'), status: 'success' });
      setIsRequested(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setIsFormAlertOpen(true);
      } else {
        console.error(error);
        toast({ title: t('error_solicitar_adopcion'), status: 'error' });
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAdopt = async () => {
    if (!animal || !selectedAdopter) return;
    try {
      const updated = (await adoptAnimal(
        animal.id,
        Number(selectedAdopter)
      )) as Animal;
      setAnimal(updated);
      toast({ title: t('animal_marcado_adoptado'), status: 'success' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: message || t('error_al_adoptar'),
        status: 'error',
      });
    }
  };

  const handleUnadopt = async () => {
    if (!animal) return;
    try {
      await unadoptAnimal(animal.id);
      toast({
        title: t('desadoptacion_exito', { name: animal.name }),
        status: 'success',
      });
      loadAnimal();
    } catch (error) {
      console.error(error);
      toast({ title: t('error_desadoptar'), status: 'error' });
    } finally {
      onUnadoptClose();
    }
  };

  const toggleFavorite = async () => {
    if (!animal) return;
    try {
      if (isFavorite) {
        await removeFavorite(animal.id);
        toast({ title: t('quitado_favoritos'), status: 'info' });
      } else {
        await addFavorite(animal.id);
        toast({ title: t('anadido_favoritos'), status: 'success' });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error(error);
      toast({ title: t('error_actualizar_favorito'), status: 'error' });
    }
  };

  if (loading) return <Loader message={t('cargando_detalle')} />;
  if (!animal)
    return (
      <Box textAlign="center" mt={12}>
        <Text fontSize="2xl" fontWeight="bold" color="red.500">
          {t('animal_no_encontrado')}
        </Text>
      </Box>
    );

  const urlFromImage =
    typeof animal.image === 'string' ? animal.image : animal.image?.url;
  const imgUrl = animal.imageUrl || urlFromImage || fallbackImage;

  const cardBg = useColorModeValue('white', 'gray.700');
  const shadow = useColorModeValue('lg', 'dark-lg');

  return (
    <Layout handleLogout={handleLogout}>
      <Flex direction="column" align="center" p={6} bg="gray.50">
        <Box
          maxW="900px"
          w="full"
          bg={cardBg}
          borderRadius="lg"
          boxShadow={shadow}
          overflow="hidden"
        >
          <HStack justify="space-between" p={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              {t('volver')}
            </Button>
            {role === 'adoptante' && (
              <Button
                leftIcon={<StarIcon />}
                colorScheme={isFavorite ? 'yellow' : 'teal'}
                variant={isFavorite ? 'solid' : 'outline'}
                onClick={toggleFavorite}
              >
                {isFavorite ? t('favorito') : t('anadir_favorito')}
              </Button>
            )}
          </HStack>

          <AspectRatio ratio={16 / 9} maxH="350px">
            <Box w="100%" h="100%" position="relative">
              {!imageLoaded && <Skeleton width="100%" height="100%" />}
              <ChakraImage
                src={imgUrl}
                alt={animal.name}
                objectFit="cover"
                fallbackSrc={fallbackImage}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                display={imageLoaded ? 'block' : 'none'}
                w="100%"
                h="100%"
              />
            </Box>
          </AspectRatio>

          <VStack align="start" spacing={4} p={6}>
            <Text fontSize="3xl" fontWeight="bold" color="teal.600">
              {animal.name}
            </Text>
            <Text fontSize="md" color="gray.500">
              <Icon as={CheckCircleIcon} mr={2} /> {animal.city}
            </Text>

            <HStack spacing={3} wrap="wrap" mb={4}>
              <Badge colorScheme="blue">{animal.species}</Badge>
              <Badge colorScheme="green">{animal.age}</Badge>
              <Badge colorScheme="purple">{animal.breed}</Badge>
              <Badge colorScheme="pink">{animal.size}</Badge>
              <Badge colorScheme="orange">{animal.activity}</Badge>
            </HStack>

            <VStack align="start" spacing={1}>
              <Text>
                <Text as="span" fontWeight="bold">
                  {t('peso_kg')}:
                </Text>{' '}
                {animal.weight} kg
              </Text>
              <Text>
                <Text as="span" fontWeight="bold">
                  {t('genero')}:
                </Text>{' '}
                {animal.gender === 'male'
                  ? t('genero_macho')
                  : t('genero_hembra')}
              </Text>
            </VStack>
            <Divider />

            {animal.biography && (
              <>
                <Text fontWeight="bold">{t('biografia')}</Text>
                <Text>{animal.biography}</Text>
                <Divider />
              </>
            )}

            <Text fontWeight="bold">{t('me_entregan')}</Text>
            <VStack align="start" spacing={1}>
              {animal.dewormed && (
                <HStack>
                  <Icon as={CheckCircleIcon} color="green.500" />
                  <Text>{t('desparasitado')}</Text>
                </HStack>
              )}
              {animal.sterilized && (
                <HStack>
                  <Icon as={CheckCircleIcon} color="green.500" />
                  <Text>{t('esterilizado')}</Text>
                </HStack>
              )}
              {animal.microchipped && (
                <HStack>
                  <Icon as={CheckCircleIcon} color="green.500" />
                  <Text>{t('con_microchip')}</Text>
                </HStack>
              )}
              {animal.vaccinated && (
                <HStack>
                  <Icon as={CheckCircleIcon} color="green.500" />
                  <Text>{t('vacunado')}</Text>
                </HStack>
              )}
            </VStack>
            <Divider />

            <Text fontSize="lg" fontWeight="bold">
              {t('shelter_label')} {animal.shelter}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {t('en_la_protectora_desde', { date: animal.since })}
            </Text>
            <Divider />

            {role === 'adoptante' && animal.adopter == null && (
              <Button
                colorScheme="purple"
                variant={isRequested ? 'solid' : 'outline'}
                onClick={handleAdoptionRequest}
                isDisabled={isRequested}
                isLoading={requestLoading}
                w="full"
                mt={4}
              >
                {isRequested ? t('solicitud_enviada') : t('solicitar_adopcion')}
              </Button>
            )}

            {role === 'protectora' &&
              authUser?.id === animal.owner &&
              animal.adopter == null && (
                <Box width="full" mt={4}>
                  <FormControl>
                    <FormLabel>{t('solicitudes_recibidas')}</FormLabel>
                    <Select
                      placeholder={t('selecciona_solicitante')}
                      value={selectedAdopter}
                      onChange={e =>
                        setSelectedAdopter(Number(e.target.value) || '')
                      }
                    >
                      {adopters.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.username}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    mt={2}
                    colorScheme="teal"
                    isDisabled={!selectedAdopter}
                    onClick={handleAdopt}
                    width="full"
                  >
                    {t('marcar_como_adoptado')}
                  </Button>
                </Box>
              )}

            {animal.adopter_username && (
              <>
                <Text fontWeight="bold" mt={4}>
                  {t('adoptado_por')}: {animal.adopter_username}
                </Text>

                {(role === 'protectora' && authUser?.id === animal.owner) ||
                role === 'admin' ? (
                  <Button
                    mt={2}
                    colorScheme="orange"
                    onClick={onUnadoptOpen}
                    width="full"
                  >
                    {t('desadoptar')}
                  </Button>
                ) : null}
              </>
            )}

            {(role === 'admin' ||
              (role === 'protectora' && authUser?.id === animal.owner)) && (
              <Button
                colorScheme="red"
                width="full"
                onClick={handleDelete}
                mt={4}
              >
                {t('eliminar_animal')}
              </Button>
            )}
          </VStack>
        </Box>
      </Flex>

      <AlertDialog
        isOpen={isUnadoptOpen}
        leastDestructiveRef={unadoptCancelRef}
        onClose={onUnadoptClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('confirmar_desadopcion')}
            </AlertDialogHeader>
            <AlertDialogBody>
              {t('confirmar_desadopcion_text', {
                name: animal?.name,
                adopter: animal?.adopter_username,
              })}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={unadoptCancelRef} onClick={onUnadoptClose}>
                {t('cancelar')}
              </Button>
              <Button colorScheme="orange" onClick={handleUnadopt} ml={3}>
                {t('si_desadoptar')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isFormAlertOpen}
        leastDestructiveRef={formAlertCancelRef}
        onClose={() => setIsFormAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('formulario_incompleto')}
            </AlertDialogHeader>
            <AlertDialogBody>{t('alert_form_body')}</AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={formAlertCancelRef}
                onClick={() => setIsFormAlertOpen(false)}
              >
                {t('cancelar')}
              </Button>
              <Button
                colorScheme="teal"
                onClick={() => {
                  setIsFormAlertOpen(false);
                  navigate('/perfil');
                }}
                ml={3}
              >
                {t('ir_al_perfil')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
};

export default AnimalDetail;
