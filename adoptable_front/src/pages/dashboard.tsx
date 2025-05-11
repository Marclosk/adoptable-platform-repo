// src/pages/dashboard/Dashboard.tsx

import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { FiFilter } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { logoutSuccess } from "../features/auth/authSlice";
import { logout } from "../features/auth/authService";
import { checkSession } from "../features/auth/session/checkSession";
import Layout from "../components/layout";
import LocationHeader from "../components/location/location_header";
import DogCards from "../components/card/card";
import { getAnimals, getAllAnimals } from "./card_detail/animal_services";
import { fetchCSRFToken } from "./profile/user_services";
import Loader from "../components/loader/loader";

// Nuestro tipo de perro para DogCards
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userRole = useSelector((state: RootState) => state.auth.role);

  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const [distance, setDistance] = useState<number>(30);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationAvailable, setLocationAvailable] = useState<boolean>(true);

  const [allDogs, setAllDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [loadingDogs, setLoadingDogs] = useState<boolean>(true);

  // Estados de filtros
  const [speciesFilters, setSpeciesFilters] = useState<Set<string>>(new Set());
  const [sizeFilters, setSizeFilters] = useState<Set<string>>(new Set());
  const [activityFilters, setActivityFilters] = useState<Set<string>>(new Set());

  // Único buscador para los tres grupos
  const [filterQuery, setFilterQuery] = useState("");

  // useDisclosure para manejar apertura/cierre del panel de filtros
  const { isOpen, onToggle } = useDisclosure();

  useEffect(() => {
    fetchCSRFToken();
  }, []);

  useEffect(() => {
    (async () => {
      const valid = await checkSession();
      if (!valid) navigate("/login");
      else setIsSessionValid(true);
    })();
  }, [navigate]);

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

  useEffect(() => {
    (async () => {
      setLoadingDogs(true);
      try {
        let raw: any[];
        if (!locationAvailable) raw = await getAllAnimals();
        else if (userLat != null && userLng != null)
          raw = await getAnimals(distance, userLat, userLng);
        else raw = [];

        const mapped: Dog[] = raw.map((d) => ({
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

  // Aplica los filtros seleccionados
  useEffect(() => {
    let list = allDogs;
    if (speciesFilters.size > 0) {
      list = list.filter((d) => speciesFilters.has(d.species));
    }
    if (sizeFilters.size > 0) {
      list = list.filter((d) => sizeFilters.has(d.size));
    }
    if (activityFilters.size > 0) {
      list = list.filter((d) => activityFilters.has(d.activity));
    }
    setFilteredDogs(list);
  }, [allDogs, speciesFilters, sizeFilters, activityFilters]);

  if (isSessionValid === null) {
    return <Loader message="Verificando sesión..." />;
  }
  if (loadingDogs) {
    return <Loader message="Cargando perros..." />;
  }

  const handleLogout = async () => {
    await logout();
    dispatch(logoutSuccess());
    navigate("/login");
  };

  // Listas únicas para cada filtro
  const uniqueSpecies = Array.from(new Set(allDogs.map((d) => d.species)));
  const uniqueSizes = Array.from(new Set(allDogs.map((d) => d.size)));
  const uniqueActivities = Array.from(new Set(allDogs.map((d) => d.activity)));

  const toggleSet = (
    set: Set<string>,
    setter: React.Dispatch<Set<string>>,
    value: string
  ) => {
    const newSet = new Set(set);
    newSet.has(value) ? newSet.delete(value) : newSet.add(value);
    setter(newSet);
  };

  const clearAll = () => {
    setSpeciesFilters(new Set());
    setSizeFilters(new Set());
    setActivityFilters(new Set());
    setFilterQuery("");
  };

  return (
    <Layout handleLogout={handleLogout}>
      <Box minH="100vh" bg="#F7FAFC" p={6}>
        <VStack spacing={6} align="stretch">
          {!locationAvailable && (
            <Alert status="warning" variant="left-accent" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Ubicación no disponible</AlertTitle>
                <AlertDescription display="block">
                  Activa la geolocalización o ingresa manualmente tu ciudad.
                </AlertDescription>
              </Box>
              <Button size="sm" colorScheme="teal" onClick={requestLocation} ml={4}>
                Reintentar
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

          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Filtrar resultados
            </Text>
            <Button leftIcon={<FiFilter />} variant="outline" onClick={onToggle}>
              {isOpen ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>
          </HStack>

          <Collapse in={isOpen} animateOpacity>
            <Box bg="white" p={4} borderRadius="md" boxShadow="md" mb={4}>
              <VStack align="start" spacing={6}>
                {/* Buscador único */}
                <FormControl>
                  <FormLabel>Buscar etiquetas</FormLabel>
                  <Input
                    placeholder="Escribe para filtrar especies, tamaños y actividades..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                </FormControl>

                {/* Etiqueta para Especies */}
                <Text fontWeight="bold">Especies</Text>
                <HStack wrap="wrap" spacing={2}>
                  {uniqueSpecies
                    .filter((sp) =>
                      sp.toLowerCase().includes(filterQuery.toLowerCase())
                    )
                    .map((sp) => (
                      <Tag
                        key={sp}
                        size="md"
                        variant={speciesFilters.has(sp) ? "solid" : "subtle"}
                        colorScheme="teal"
                        cursor="pointer"
                        onClick={() =>
                          toggleSet(speciesFilters, setSpeciesFilters, sp)
                        }
                      >
                        {sp}
                      </Tag>
                    ))}
                </HStack>

                {/* Etiqueta para Tamaños */}
                <Text fontWeight="bold">Tamaños</Text>
                <HStack wrap="wrap" spacing={2}>
                  {uniqueSizes
                    .filter((sz) =>
                      sz.toLowerCase().includes(filterQuery.toLowerCase())
                    )
                    .map((sz) => (
                      <Tag
                        key={sz}
                        size="md"
                        variant={sizeFilters.has(sz) ? "solid" : "subtle"}
                        colorScheme="purple"
                        cursor="pointer"
                        onClick={() => toggleSet(sizeFilters, setSizeFilters, sz)}
                      >
                        {sz}
                      </Tag>
                    ))}
                </HStack>

                {/* Etiqueta para Actividad */}
                <Text fontWeight="bold">Actividad</Text>
                <HStack wrap="wrap" spacing={2}>
                  {uniqueActivities
                    .filter((ac) =>
                      ac.toLowerCase().includes(filterQuery.toLowerCase())
                    )
                    .map((ac) => (
                      <Tag
                        key={ac}
                        size="md"
                        variant={activityFilters.has(ac) ? "solid" : "subtle"}
                        colorScheme="orange"
                        cursor="pointer"
                        onClick={() =>
                          toggleSet(activityFilters, setActivityFilters, ac)
                        }
                      >
                        {ac}
                      </Tag>
                    ))}
                </HStack>

                <Button size="sm" variant="ghost" onClick={clearAll}>
                  Limpiar filtros
                </Button>
              </VStack>
            </Box>
          </Collapse>

          <DogCards dogs={filteredDogs} />
        </VStack>
      </Box>

      {userRole === "protectora" && (
        <Button
          colorScheme="teal"
          position="fixed"
          bottom={8}
          right={8}
          borderRadius="full"
          boxShadow="md"
          size="lg"
          onClick={() => navigate("/add-animal")}
        >
          + Añadir perro
        </Button>
      )}
    </Layout>
  );
};

export default Dashboard;
