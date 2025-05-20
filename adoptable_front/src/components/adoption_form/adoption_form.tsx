// src/components/adoption_form/AdoptionForm.tsx

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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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

  const validators: Record<
    keyof AdoptionFormData,
    (value: any, all: AdoptionFormData) => string | null
  > = {
    fullName: (v) => {
      const str = (v as string).trim();
      return !str ? t("error_fullName_required") : null;
    },
    address: (v) => {
      const str = (v as string).trim();
      return !str ? t("error_address_required") : null;
    },
    phone: (v) => {
      const str = (v as string).trim();
      if (!str) return t("error_phone_required");
      if (!/^\+?[0-9\s\-]{7,15}$/.test(str)) return t("error_phone_invalid");
      return null;
    },
    email: (v) => {
      const str = (v as string).trim();
      if (!str) return t("error_email_required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str))
        return t("error_email_invalid");
      return null;
    },
    hasExperience: () => null,
    experienceDescription: (v, all) => {
      if (all.hasExperience) {
        const str = (v as string).trim();
        return !str ? t("error_experienceDescription_required") : null;
      }
      return null;
    },
    hasOtherPets: () => null,
    otherPetTypes: (v, all) => {
      if (all.hasOtherPets === "yes") {
        const str = (v as string).trim();
        return !str ? t("error_otherPetTypes_required") : null;
      }
      return null;
    },
    references: () => null,
    motivation: (v) => {
      const str = (v as string).trim();
      return !str ? t("error_motivation_required") : null;
    },
  };

  const validateField = (field: keyof AdoptionFormData) => {
    const err = validators[field](form[field], form);
    setErrors((e) => ({ ...e, [field]: err || undefined }));
    return !err;
  };

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

  const isFormValid =
    Object.values(errors).every((e) => !e) &&
    ["fullName", "address", "phone", "email", "motivation"].every((k) => {
      const v = form[k as keyof AdoptionFormData];
      return typeof v === "string" && v.trim() !== "";
    }) &&
    (!form.hasExperience || form.experienceDescription.trim() !== "") &&
    (form.hasOtherPets === "no" || form.otherPetTypes.trim() !== "");

  return (
    <Box bg="white" p={6} borderRadius="md" boxShadow="md">
      <form onSubmit={handleSubmit} noValidate>
        <VStack spacing={4} align="stretch">
          <FormControl
            isRequired
            isInvalid={!!errors.fullName && touched.fullName}
          >
            <FormLabel>{t("form_fullName_label")}</FormLabel>
            <Input
              value={form.fullName}
              onChange={handleChange("fullName")}
              onBlur={handleBlur("fullName")}
              placeholder={t("form_fullName_placeholder")}
            />
            <FormErrorMessage>{errors.fullName}</FormErrorMessage>
          </FormControl>

          <FormControl
            isRequired
            isInvalid={!!errors.address && touched.address}
          >
            <FormLabel>{t("form_address_label")}</FormLabel>
            <Input
              value={form.address}
              onChange={handleChange("address")}
              onBlur={handleBlur("address")}
              placeholder={t("form_address_placeholder")}
            />
            <FormErrorMessage>{errors.address}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.phone && touched.phone}>
            <FormLabel>{t("form_phone_label")}</FormLabel>
            <Input
              value={form.phone}
              onChange={handleChange("phone")}
              onBlur={handleBlur("phone")}
              placeholder={t("form_phone_placeholder")}
            />
            <FormErrorMessage>{errors.phone}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.email && touched.email}>
            <FormLabel>{t("form_email_label")}</FormLabel>
            <Input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              onBlur={handleBlur("email")}
              placeholder={t("form_email_placeholder")}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <Checkbox
              isChecked={form.hasExperience}
              onChange={handleChange("hasExperience")}
            >
              {t("form_hasExperience_label")}
            </Checkbox>
          </FormControl>

          {form.hasExperience && (
            <FormControl
              isInvalid={
                !!errors.experienceDescription && touched.experienceDescription
              }
              isRequired
            >
              <FormLabel>{t("form_experienceDescription_label")}</FormLabel>
              <Textarea
                value={form.experienceDescription}
                onChange={handleChange("experienceDescription")}
                onBlur={handleBlur("experienceDescription")}
                placeholder={t("form_experienceDescription_placeholder")}
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
            <FormLabel>{t("form_hasOtherPets_label")}</FormLabel>
            <Select
              value={form.hasOtherPets}
              onChange={handleChange("hasOtherPets")}
              onBlur={handleBlur("hasOtherPets")}
            >
              <option value="no">{t("no")}</option>
              <option value="yes">{t("si")}</option>
            </Select>
            <FormErrorMessage>{errors.hasOtherPets}</FormErrorMessage>
          </FormControl>

          {form.hasOtherPets === "yes" && (
            <FormControl
              isInvalid={!!errors.otherPetTypes && touched.otherPetTypes}
              isRequired
            >
              <FormLabel>{t("form_otherPetTypes_label")}</FormLabel>
              <Input
                value={form.otherPetTypes}
                onChange={handleChange("otherPetTypes")}
                onBlur={handleBlur("otherPetTypes")}
                placeholder={t("form_otherPetTypes_placeholder")}
              />
              <FormErrorMessage>{errors.otherPetTypes}</FormErrorMessage>
            </FormControl>
          )}

          <FormControl>
            <FormLabel>{t("form_references_label")}</FormLabel>
            <Textarea
              value={form.references}
              onChange={handleChange("references")}
              placeholder={t("form_references_placeholder")}
            />
          </FormControl>

          <FormControl
            isRequired
            isInvalid={!!errors.motivation && touched.motivation}
          >
            <FormLabel>{t("form_motivation_label")}</FormLabel>
            <Textarea
              value={form.motivation}
              onChange={handleChange("motivation")}
              onBlur={handleBlur("motivation")}
              placeholder={t("form_motivation_placeholder")}
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
            {t("form_submit")}
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default AdoptionForm;
