// src/pages/dashboard/Dashboard.tsx

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  Tag,
  Text,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
  Fade,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  AspectRatio,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiFilter } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { logoutSuccess } from "../features/auth/authSlice";
import { logout } from "../features/auth/authService";
import { checkSession } from "../features/auth/session/checkSession";
import { useTranslation } from "react-i18next";

import Layout from "../components/layout";
import LocationHeader from "../components/location/location_header";
import DogCards from "../components/card/card";
import { getAnimals, getAllAnimals } from "./card_detail/animal_services";
import { fetchCSRFToken } from "./profile/user_services";
import Loader from "../components/loader/loader";

export interface Dog {
  id: number;
  name: string;
  city: string;
  imageUrl: string;
  species: string;
  age: string;
  breed: string;
  size: string;
  activity: string;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userRole = useSelector((s: RootState) => s.auth.role);

  // Sessión
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);

  // Localización
  const [distance, setDistance] = useState<number>(30);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationAvailable, setLocationAvailable] = useState<boolean>(true);

  // Datos de perros
  const [allDogs, setAllDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [loadingDogs, setLoadingDogs] = useState<boolean>(true);

  // Skeleton/loading visual
  const [showSkeleton, setShowSkeleton] = useState(true);
  const loaderStart = useRef(Date.now());
  useEffect(() => {
    if (loadingDogs) {
      loaderStart.current = Date.now();
      setShowSkeleton(true);
    } else {
      const elapsed = Date.now() - loaderStart.current;
      const remaining = 600 - elapsed;
      if (remaining > 0) {
        const tmr = setTimeout(() => setShowSkeleton(false), remaining);
        return () => clearTimeout(tmr);
      } else {
        setShowSkeleton(false);
      }
    }
  }, [loadingDogs]);

  // Espera a que carguen imágenes
  const [imagesLoaded, setImagesLoaded] = useState(false);
  useEffect(() => {
    if (!loadingDogs) {
      const urls = filteredDogs.map((d) => d.imageUrl || "");
      if (urls.length === 0) {
        setImagesLoaded(true);
        return;
      }
      let loadedCount = 0;
      urls.forEach((url) => {
        const img = new window.Image();
        img.src = url;
        img.onload = img.onerror = () => {
          loadedCount++;
          if (loadedCount === urls.length) {
            setImagesLoaded(true);
          }
        };
      });
    }
  }, [filteredDogs, loadingDogs]);

  // Filtros de etiquetas
  const [speciesFilters, setSpeciesFilters] = useState<Set<string>>(new Set());
  const [sizeFilters, setSizeFilters] = useState<Set<string>>(new Set());
  const [activityFilters, setActivityFilters] = useState<Set<string>>(
    new Set()
  );
  const [filterQuery, setFilterQuery] = useState("");
  const { isOpen, onToggle } = useDisclosure();

  // CSRF
  useEffect(() => {
    fetchCSRFToken();
  }, []);

  // Verificar sesión
  useEffect(() => {
    (async () => {
      const valid = await checkSession();
      if (!valid) navigate("/login");
      else setIsSessionValid(true);
    })();
  }, [navigate]);

  // Obtener localización
  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationAvailable(true);
      },
      () => setLocationAvailable(false)
    );
  };
  useEffect(requestLocation, []);

  // Cargar animales según distancia (Filtrado adicional de adoptados)
  useEffect(() => {
    (async () => {
      setLoadingDogs(true);
      try {
        let raw: any[] = [];
        if (!locationAvailable) {
          raw = await getAllAnimals();
        } else if (userLat != null && userLng != null) {
          raw = await getAnimals(distance, userLat, userLng);
        }
        // Filtramos solo disponibles
        raw = raw.filter((d) => d.adopter == null);

        const mapped = raw.map((d) => ({
          id: d.id,
          name: d.name,
          city: d.city,
          imageUrl: d.imageUrl ?? d.image?.url ?? d.image ?? "",
          species: d.species,
          age: d.age,
          breed: d.breed,
          size: d.size,
          activity: d.activity,
        }));
        setAllDogs(mapped);
      } catch (err) {
        console.error("Error cargando perros:", err);
      } finally {
        setLoadingDogs(false);
      }
    })();
  }, [distance, userLat, userLng, locationAvailable]);

  // Aplicar filtros de etiqueta
  useEffect(() => {
    let list = allDogs;
    if (speciesFilters.size)
      list = list.filter((d) => speciesFilters.has(d.species));
    if (sizeFilters.size) list = list.filter((d) => sizeFilters.has(d.size));
    if (activityFilters.size)
      list = list.filter((d) => activityFilters.has(d.activity));
    setFilteredDogs(list);
  }, [allDogs, speciesFilters, sizeFilters, activityFilters]);

  // Función para alternar sets
  const toggleSet = (
    set: Set<string>,
    fn: React.Dispatch<Set<string>>,
    val: string
  ) => {
    const nxt = new Set(set);
    nxt.has(val) ? nxt.delete(val) : nxt.add(val);
    fn(nxt);
  };

  // Limpiar filtros
  const clearAll = () => {
    setSpeciesFilters(new Set());
    setSizeFilters(new Set());
    setActivityFilters(new Set());
    setFilterQuery("");
  };

  // ——— Hooks de estilo: siempre antes de cualquier return ———
  const cardBg = useColorModeValue("white", "gray.700");
  const shadow = useColorModeValue("md", "dark-lg");
  const showCards = !showSkeleton && imagesLoaded && !loadingDogs;

  // Early return mientras verificamos sesión
  if (isSessionValid === null) {
    return <Loader message={t("verificando_sesion")} />;
  }

  // Logout
  const handleLogout = async () => {
    await logout();
    dispatch(logoutSuccess());
    navigate("/login");
  };

  // Opciones únicas para filtros
  const uniqueSpecies = Array.from(new Set(allDogs.map((d) => d.species)));
  const uniqueSizes = Array.from(new Set(allDogs.map((d) => d.size)));
  const uniqueActivities = Array.from(new Set(allDogs.map((d) => d.activity)));

  return (
    <Layout handleLogout={handleLogout}>
      <Box minH="100vh" bg="#F7FAFC" p={[4, 6, 8]}>
        <VStack spacing={6} align="stretch">
          {!locationAvailable && (
            <Alert status="warning" variant="left-accent" borderRadius="lg">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>{t("ubicacion_no_disponible")}</AlertTitle>
                <AlertDescription>
                  {t("descripcion_ubicacion_no_disponible")}
                </AlertDescription>
              </Box>
              <Button size="sm" onClick={requestLocation}>
                {t("reintentar")}
              </Button>
            </Alert>
          )}

          <LocationHeader
            distance={distance}
            onDistanceChange={setDistance}
            onLocationSelect={(lat, lng) => {
              setUserLat(lat);
              setUserLng(lng);
              setLocationAvailable(true);
            }}
          />

          <Box bg="white" p={4} borderRadius="lg" boxShadow="base">
            <HStack justify="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                {t("filtrar_resultados")}
              </Text>
              <Button
                size="sm"
                leftIcon={<FiFilter />}
                variant="outline"
                onClick={onToggle}
              >
                {isOpen ? t("ocultar_filtros") : t("mostrar_filtros")}
              </Button>
            </HStack>
            <Collapse in={isOpen} animateOpacity>
              <VStack align="start" spacing={4}>
                <FormControl>
                  <FormLabel>{t("buscar_etiquetas")}</FormLabel>
                  <Input
                    placeholder={t("placeholder_filtrar")}
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                </FormControl>
                <HStack wrap="wrap" spacing={2}>
                  {uniqueSpecies
                    .filter((s) =>
                      s.toLowerCase().includes(filterQuery.toLowerCase())
                    )
                    .map((s) => (
                      <Tag
                        key={s}
                        size="md"
                        variant={speciesFilters.has(s) ? "solid" : "subtle"}
                        colorScheme="teal"
                        cursor="pointer"
                        onClick={() =>
                          toggleSet(speciesFilters, setSpeciesFilters, s)
                        }
                      >
                        {s}
                      </Tag>
                    ))}
                </HStack>
                <HStack wrap="wrap" spacing={2}>
                  {uniqueSizes
                    .filter((s) =>
                      s.toLowerCase().includes(filterQuery.toLowerCase())
                    )
                    .map((s) => (
                      <Tag
                        key={s}
                        size="md"
                        variant={sizeFilters.has(s) ? "solid" : "subtle"}
                        colorScheme="purple"
                        cursor="pointer"
                        onClick={() =>
                          toggleSet(sizeFilters, setSizeFilters, s)
                        }
                      >
                        {s}
                      </Tag>
                    ))}
                </HStack>
                <HStack wrap="wrap" spacing={2}>
                  {uniqueActivities
                    .filter((a) =>
                      a.toLowerCase().includes(filterQuery.toLowerCase())
                    )
                    .map((a) => (
                      <Tag
                        key={a}
                        size="md"
                        variant={activityFilters.has(a) ? "solid" : "subtle"}
                        colorScheme="orange"
                        cursor="pointer"
                        onClick={() =>
                          toggleSet(activityFilters, setActivityFilters, a)
                        }
                      >
                        {a}
                      </Tag>
                    ))}
                </HStack>
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  {t("limpiar_filtros")}
                </Button>
              </VStack>
            </Collapse>
          </Box>

          {!showCards ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <Box
                  key={idx}
                  bg={cardBg}
                  borderRadius="lg"
                  boxShadow={shadow}
                  overflow="hidden"
                >
                  <AspectRatio ratio={4 / 3}>
                    <Skeleton height="100%" />
                  </AspectRatio>
                  <Box p={4}>
                    <SkeletonText noOfLines={4} spacing="4" />
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Fade in={showCards}>
              <DogCards dogs={filteredDogs} />
            </Fade>
          )}
        </VStack>
      </Box>

      {userRole === "protectora" && (
        <Button
          colorScheme="teal"
          position="fixed"
          bottom={6}
          right={6}
          borderRadius="full"
          boxShadow="lg"
          size="lg"
          onClick={() => navigate("/add-animal")}
        >
          {t("boton_anadir_perro")}
        </Button>
      )}
    </Layout>
  );
};

export default Dashboard;
