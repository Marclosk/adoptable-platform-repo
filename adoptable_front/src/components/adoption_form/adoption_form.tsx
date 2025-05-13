// src/components/AdoptionForm.tsx

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Checkbox,
  Select,
  Button,
  FormErrorMessage,
} from "@chakra-ui/react";

export interface AdoptionFormData {
  fullName: string;
  address: string;
  phone: string;
  email: string;
  hasExperience: boolean;
  experienceDescription: string;
  hasOtherPets: "yes" | "no";
  otherPetTypes: string;
  references: string;
  motivation: string;
}

interface AdoptionFormProps {
  initialValues?: Partial<AdoptionFormData>;
  onSubmit: (data: AdoptionFormData) => void;
}

export const AdoptionForm: React.FC<AdoptionFormProps> = ({
  initialValues = {},
  onSubmit,
}) => {
  const [form, setForm] = useState<AdoptionFormData>({
    fullName: initialValues.fullName ?? "",
    address: initialValues.address ?? "",
    phone: initialValues.phone ?? "",
    email: initialValues.email ?? "",
    hasExperience: initialValues.hasExperience ?? false,
    experienceDescription: initialValues.experienceDescription ?? "",
    hasOtherPets: initialValues.hasOtherPets ?? "no",
    otherPetTypes: initialValues.otherPetTypes ?? "",
    references: initialValues.references ?? "",
    motivation: initialValues.motivation ?? "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AdoptionFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof AdoptionFormData, boolean>>
  >({});

  // whenever initialValues changes, reset form state (and clear errors/touched)
  useEffect(() => {
    setForm({
      fullName: initialValues.fullName ?? "",
      address: initialValues.address ?? "",
      phone: initialValues.phone ?? "",
      email: initialValues.email ?? "",
      hasExperience: initialValues.hasExperience ?? false,
      experienceDescription: initialValues.experienceDescription ?? "",
      hasOtherPets: initialValues.hasOtherPets ?? "no",
      otherPetTypes: initialValues.otherPetTypes ?? "",
      references: initialValues.references ?? "",
      motivation: initialValues.motivation ?? "",
    });
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // simple validators with guards
  const validators: Record<
    keyof AdoptionFormData,
    (value: any, all: AdoptionFormData) => string | null
  > = {
    fullName: (v) => {
      const str = typeof v === "string" ? v.trim() : "";
      return !str ? "Nombre es obligatorio" : null;
    },
    address: (v) => {
      const str = typeof v === "string" ? v.trim() : "";
      return !str ? "Dirección es obligatoria" : null;
    },
    phone: (v) => {
      const str = typeof v === "string" ? v.trim() : "";
      if (!str) return "Teléfono es obligatorio";
      if (!/^\+?[0-9\s\-]{7,15}$/.test(str)) return "Teléfono no válido";
      return null;
    },
    email: (v) => {
      const str = typeof v === "string" ? v.trim() : "";
      if (!str) return "Email es obligatorio";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return "Email no válido";
      return null;
    },
    hasExperience: () => null,
    experienceDescription: (v, all) => {
      if (all.hasExperience) {
        const str = typeof v === "string" ? v.trim() : "";
        return !str ? "Describe tu experiencia" : null;
      }
      return null;
    },
    hasOtherPets: () => null,
    otherPetTypes: (v, all) => {
      if (all.hasOtherPets === "yes") {
        const str = typeof v === "string" ? v.trim() : "";
        return !str ? "Indica tipo de otras mascotas" : null;
      }
      return null;
    },
    references: () => null,
    motivation: (v) => {
      const str = typeof v === "string" ? v.trim() : "";
      return !str ? "Motivación es obligatoria" : null;
    },
  };

  // validate a single field
  const validateField = (field: keyof AdoptionFormData) => {
    const error = validators[field](form[field], form);
    setErrors((e) => ({ ...e, [field]: error || undefined }));
    return !error;
  };

  // validate all
  const validateAll = () => {
    const newErrors: typeof errors = {};
    let valid = true;
    (Object.keys(validators) as Array<keyof AdoptionFormData>).forEach((f) => {
      const err = validators[f](form[f], form);
      if (err) {
        valid = false;
        newErrors[f] = err;
      }
    });
    setErrors(newErrors);
    return valid;
  };

  // handlers
  const handleChange =
    (field: keyof AdoptionFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((f) => ({
        ...f,
        [field]: value,
        ...(field === "hasExperience" && !value
          ? { experienceDescription: "" }
          : {}),
        ...(field === "hasOtherPets" && value === "no"
          ? { otherPetTypes: "" }
          : {}),
      }));
    };

  const handleBlur = (field: keyof AdoptionFormData) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    validateField(field);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      // mark all as touched to show errors
      const allTouched: typeof touched = {};
      (Object.keys(validators) as Array<keyof AdoptionFormData>).forEach(
        (f) => {
          allTouched[f] = true;
        }
      );
      setTouched(allTouched);
      return;
    }
    onSubmit(form);
  };

  // disable if any errors or required empty
  const isFormValid =
    Object.values(errors).every((e) => !e) &&
    ["fullName", "address", "phone", "email", "motivation"].every((k) => {
      const v = form[k as keyof AdoptionFormData];
      return typeof v === "string" && v.trim() !== "";
    }) &&
    (!form.hasExperience ||
      (typeof form.experienceDescription === "string" &&
        form.experienceDescription.trim() !== "")) &&
    (form.hasOtherPets === "no" ||
      (typeof form.otherPetTypes === "string" &&
        form.otherPetTypes.trim() !== ""));

  return (
    <Box bg="white" p={6} borderRadius="md" boxShadow="md">
      <form onSubmit={handleSubmit} noValidate>
        <VStack spacing={4} align="stretch">
          <FormControl
            isRequired
            isInvalid={!!errors.fullName && touched.fullName}
          >
            <FormLabel>Nombre completo</FormLabel>
            <Input
              value={form.fullName}
              onChange={handleChange("fullName")}
              onBlur={handleBlur("fullName")}
              placeholder="Tu nombre completo"
            />
            <FormErrorMessage>{errors.fullName}</FormErrorMessage>
          </FormControl>

          <FormControl
            isRequired
            isInvalid={!!errors.address && touched.address}
          >
            <FormLabel>Dirección</FormLabel>
            <Input
              value={form.address}
              onChange={handleChange("address")}
              onBlur={handleBlur("address")}
              placeholder="Tu dirección"
            />
            <FormErrorMessage>{errors.address}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.phone && touched.phone}>
            <FormLabel>Teléfono</FormLabel>
            <Input
              value={form.phone}
              onChange={handleChange("phone")}
              onBlur={handleBlur("phone")}
              placeholder="Tu número de teléfono"
            />
            <FormErrorMessage>{errors.phone}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.email && touched.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              onBlur={handleBlur("email")}
              placeholder="Tu correo electrónico"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <Checkbox
              isChecked={form.hasExperience}
              onChange={handleChange("hasExperience")}
            >
              ¿Tienes experiencia cuidando animales?
            </Checkbox>
          </FormControl>

          {form.hasExperience && (
            <FormControl
              isInvalid={
                !!errors.experienceDescription && touched.experienceDescription
              }
              isRequired
            >
              <FormLabel>Describe tu experiencia</FormLabel>
              <Textarea
                value={form.experienceDescription}
                onChange={handleChange("experienceDescription")}
                onBlur={handleBlur("experienceDescription")}
                placeholder="Ej.: años con perros, voluntariado, etc."
              />
              <FormErrorMessage>
                {errors.experienceDescription}
              </FormErrorMessage>
            </FormControl>
          )}

          <FormControl
            isRequired
            isInvalid={!!errors.hasOtherPets && touched.hasOtherPets}
          >
            <FormLabel>¿Tienes otras mascotas?</FormLabel>
            <Select
              value={form.hasOtherPets}
              onChange={handleChange("hasOtherPets")}
              onBlur={handleBlur("hasOtherPets")}
            >
              <option value="no">No</option>
              <option value="yes">Sí</option>
            </Select>
            <FormErrorMessage>{errors.hasOtherPets}</FormErrorMessage>
          </FormControl>

          {form.hasOtherPets === "yes" && (
            <FormControl
              isInvalid={!!errors.otherPetTypes && touched.otherPetTypes}
              isRequired
            >
              <FormLabel>¿De qué tipo?</FormLabel>
              <Input
                value={form.otherPetTypes}
                onChange={handleChange("otherPetTypes")}
                onBlur={handleBlur("otherPetTypes")}
                placeholder="Ej.: 2 gatos y 1 conejo"
              />
              <FormErrorMessage>{errors.otherPetTypes}</FormErrorMessage>
            </FormControl>
          )}

          <FormControl>
            <FormLabel>Referencias</FormLabel>
            <Textarea
              value={form.references}
              onChange={handleChange("references")}
              placeholder="Nombre y contacto de alguna referencia"
            />
          </FormControl>

          <FormControl
            isRequired
            isInvalid={!!errors.motivation && touched.motivation}
          >
            <FormLabel>Motivación</FormLabel>
            <Textarea
              value={form.motivation}
              onChange={handleChange("motivation")}
              onBlur={handleBlur("motivation")}
              placeholder="¿Por qué quieres adoptar un animal?"
            />
            <FormErrorMessage>{errors.motivation}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            mt={4}
            isDisabled={!isFormValid}
          >
            Enviar formulario
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default AdoptionForm;
