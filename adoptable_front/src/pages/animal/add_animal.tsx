// src/pages/AddAnimal.tsx
import React, { useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Checkbox,
  Button,
  useToast,
  Flex,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout";
import LocationHeader from "../../components/location/location_header";
import { addAnimal } from "./../card_detail/animal_services";

const GENDERS = [
  { value: "male", label: "Macho" },
  { value: "female", label: "Hembra" },
];
const SIZES = [
  { value: "small", label: "Pequeño" },
  { value: "medium", label: "Mediano" },
  { value: "large", label: "Grande" },
];
const ACTIVITIES = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

const AddAnimal: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // 1️⃣ Estado del formulario
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "male",
    size: "medium",
    activity: "low",
    city: "",
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

  // 2️⃣ Handlers
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
  const onLocationSelect = (lat: number, lng: number) => {
    setLocation([lat, lng]);
  };

  // 3️⃣ Submit
  const handleSubmit = async () => {
    if (!form.name || !image || !form.city || !location) {
      toast({
        title: "Completa los campos obligatorios",
        status: "error",
      });
      return;
    }

    const data = new FormData();
    // Campos string
    Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
    // Imagen
    data.append("image", image);
    // Lat/Lng
    data.append("latitude", String(location[0]));
    data.append("longitude", String(location[1]));

    setLoading(true);
    try {
      await addAnimal(data);
      toast({ title: "Perro añadido", status: "success" });
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
        <Heading mb={6}>Añadir nuevo perro</Heading>
        {loading ? (
          <Flex justify="center">
            <Spinner />
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input name="name" value={form.name} onChange={onChange} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Edad</FormLabel>
              <Input name="age" value={form.age} onChange={onChange} />
            </FormControl>

            <Flex gap={4}>
              <FormControl>
                <FormLabel>Género</FormLabel>
                <Select name="gender" value={form.gender} onChange={onChange}>
                  {GENDERS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Tamaño</FormLabel>
                <Select name="size" value={form.size} onChange={onChange}>
                  {SIZES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Flex>

            <FormControl>
              <FormLabel>Actividad</FormLabel>
              <Select name="activity" value={form.activity} onChange={onChange}>
                {ACTIVITIES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Ciudad</FormLabel>
              <Input name="city" value={form.city} onChange={onChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Especie</FormLabel>
              <Input name="species" value={form.species} onChange={onChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Raza</FormLabel>
              <Input name="breed" value={form.breed} onChange={onChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Peso (kg)</FormLabel>
              <Input name="weight" value={form.weight} onChange={onChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Biografía</FormLabel>
              <Textarea
                name="biography"
                value={form.biography}
                onChange={onChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Imagen principal</FormLabel>
              <Input type="file" accept="image/*" onChange={onFileChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Ubicación exacta</FormLabel>
              <LocationHeader
                distance={0}
                onDistanceChange={() => {}}
                onLocationSelect={onLocationSelect}
              />
            </FormControl>

            <FormControl>
              <Checkbox
                name="vaccinated"
                isChecked={form.vaccinated}
                onChange={onChange}
              >
                Vacunado
              </Checkbox>
              <Checkbox
                name="sterilized"
                isChecked={form.sterilized}
                onChange={onChange}
              >
                Esterilizado
              </Checkbox>
              <Checkbox
                name="microchipped"
                isChecked={form.microchipped}
                onChange={onChange}
              >
                Con microchip
              </Checkbox>
              <Checkbox
                name="dewormed"
                isChecked={form.dewormed}
                onChange={onChange}
              >
                Desparasitado
              </Checkbox>
            </FormControl>

            <Button colorScheme="teal" onClick={handleSubmit}>
              Guardar perro
            </Button>
          </VStack>
        )}
      </Box>
    </Layout>
  );
};

export default AddAnimal;
