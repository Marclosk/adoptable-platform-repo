import React, { useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Checkbox,
  Button,
  useToast,
  Flex,
  VStack,
  Text,
  Input
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/layout";
import LocationHeader from "../../components/location/location_header";
import { addAnimal } from "../card_detail/animal_services";
import Loader from "../../components/loader/loader";

const GENDERS = [
  { value: "male", labelKey: "genero_macho" },
  { value: "female", labelKey: "genero_hembra" },
];
const SIZES = [
  { value: "small", labelKey: "tamano_pequeno" },
  { value: "medium", labelKey: "tamano_mediano" },
  { value: "large", labelKey: "tamano_grande" },
];
const ACTIVITIES = [
  { value: "low", labelKey: "actividad_baja" },
  { value: "medium", labelKey: "actividad_media" },
  { value: "high", labelKey: "actividad_alta" },
];

const AddAnimal: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "male",
    size: "medium",
    activity: "low",
    city: "", // ahora se rellenará desde LocationHeader
    species: "",
    breed: "",
    weight: "",
    biography: "",
    vaccinated: false,
    sterilized: false,
    microchipped: false,
    dewormed: false,
  });
  const [image, setImage] = useState<File | null>(null);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" && e.target instanceof HTMLInputElement
        ? e.target.checked
        : undefined;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImage(e.target.files[0]);
  };

  // Ahora recibimos (lat, lng, textoCiudad)
  const onLocationSelect = (lat: number, lng: number, textoCiudad: string) => {
    setLocation([lat, lng]);
    setForm((f) => ({
      ...f,
      city: textoCiudad, // rellenamos city automáticamente
    }));
  };

  const handleSubmit = async () => {
    // Validamos que haya nombre, imagen, ciudad y coordenadas
    if (!form.name || !image || !form.city.trim() || !location) {
      toast({
        title: t("completar_campos_obligatorios"),
        status: "error",
      });
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
    data.append("image", image!);
    data.append("latitude", String(location![0]));
    data.append("longitude", String(location![1]));

    setLoading(true);
    try {
      await addAnimal(data);
      toast({ title: t("perro_anadido"), status: "success" });
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast({ title: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout handleLogout={() => navigate("/login")}>
      <Box maxW="600px" mx="auto" py={8}>
        <Heading mb={6}>{t("anadir_nuevo_perro")}</Heading>

        {loading ? (
          <Loader />
        ) : (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>{t("nombre")}</FormLabel>
              <Input name="name" value={form.name} onChange={onChange} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t("edad")}</FormLabel>
              <Input name="age" value={form.age} onChange={onChange} />
            </FormControl>

            <Flex gap={4}>
              <FormControl>
                <FormLabel>{t("genero")}</FormLabel>
                <Select name="gender" value={form.gender} onChange={onChange}>
                  {GENDERS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t("tamano")}</FormLabel>
                <Select name="size" value={form.size} onChange={onChange}>
                  {SIZES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Flex>

            <FormControl>
              <FormLabel>{t("actividad")}</FormLabel>
              <Select name="activity" value={form.activity} onChange={onChange}>
                {ACTIVITIES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Ya no aparece un <Input> independiente para “ciudad”:
                Se rellenará al pulsar “Usar ubicación” */}
            <FormControl isRequired>
              <FormLabel>{t("ubicacion_exacta")}</FormLabel>
              <LocationHeader
                distance={0}
                onDistanceChange={() => {}}
                onLocationSelect={onLocationSelect}
                showDistance={false}
              />
            </FormControl>
            {/* Mostramos al usuario la ciudad seleccionada (texto que escribió) */}
            {form.city && (
              <Text fontSize="sm" color="gray.600">
                {t("ciudad")}: {form.city}
              </Text>
            )}

            <FormControl>
              <FormLabel>{t("especie")}</FormLabel>
              <Input name="species" value={form.species} onChange={onChange} />
            </FormControl>
            <FormControl>
              <FormLabel>{t("raza")}</FormLabel>
              <Input name="breed" value={form.breed} onChange={onChange} />
            </FormControl>
            <FormControl>
              <FormLabel>{t("peso_kg")}</FormLabel>
              <Input name="weight" value={form.weight} onChange={onChange} />
            </FormControl>
            <FormControl>
              <FormLabel>{t("biografia")}</FormLabel>
              <Textarea
                name="biography"
                value={form.biography}
                onChange={onChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>{t("imagen_principal")}</FormLabel>
              <Input type="file" accept="image/*" onChange={onFileChange} />
            </FormControl>

            <FormControl>
              <Checkbox
                name="vaccinated"
                isChecked={form.vaccinated}
                onChange={onChange}
              >
                {t("vacunado")}
              </Checkbox>
              <Checkbox
                name="sterilized"
                isChecked={form.sterilized}
                onChange={onChange}
              >
                {t("esterilizado")}
              </Checkbox>
              <Checkbox
                name="microchipped"
                isChecked={form.microchipped}
                onChange={onChange}
              >
                {t("con_microchip")}
              </Checkbox>
              <Checkbox
                name="dewormed"
                isChecked={form.dewormed}
                onChange={onChange}
              >
                {t("desparasitado")}
              </Checkbox>
            </FormControl>

            <Button colorScheme="teal" onClick={handleSubmit}>
              {t("guardar_perro")}
            </Button>
          </VStack>
        )}
      </Box>
    </Layout>
  );
};

export default AddAnimal;
