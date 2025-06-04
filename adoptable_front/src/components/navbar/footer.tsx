import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Link,
  IconButton,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const role = useSelector((s: RootState) => s.auth.role);

  const bg = 'teal.700';
  const linkColor = 'whiteAlpha.900';
  const iconBg = useColorModeValue('whiteAlpha.900', 'gray.700');
  const iconColor = useColorModeValue('teal.700', 'teal.300');
  const year = new Date().getFullYear();

  return (
    <Box as="footer" bg={bg} color="whiteAlpha.900" pt={10} pb={6}>
      <Box maxW="1200px" mx="auto" px={{ base: 6, md: 8 }}>
        <Grid
          templateColumns={{
            base: '1fr',
            sm: 'repeat(2, 1fr)',
            md:
              role === 'protectora' ? '1fr repeat(2,1fr) 1fr' : 'repeat(3,1fr)',
          }}
          gap={8}
        >
          <GridItem>
            <VStack align="start" spacing={3}>
              <Text fontSize="2xl" fontWeight="bold">
                AdoptAble
              </Text>
              <Text fontSize="sm" color="whiteAlpha.700" maxW="250px">
                {t('footer_tagline')}
              </Text>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="start" spacing={2}>
              <Text fontWeight="semibold">{t('footer_nav_title')}</Text>
              <Link
                href="/dashboard"
                color={linkColor}
                _hover={{ textDecoration: 'underline' }}
              >
                {t('nav_inicio')}
              </Link>
              {role === 'protectora' && (
                <Link
                  href="/protectora/dashboard"
                  color={linkColor}
                  _hover={{ textDecoration: 'underline' }}
                >
                  {t('nav_panel')}
                </Link>
              )}
              <Link
                href="/perfil"
                color={linkColor}
                _hover={{ textDecoration: 'underline' }}
              >
                {t('nav_perfil')}
              </Link>
              <Link
                href="/donaciones"
                color={linkColor}
                _hover={{ textDecoration: 'underline' }}
              >
                {t('nav_donaciones')}
              </Link>
              <Link
                href="/contacto"
                color={linkColor}
                _hover={{ textDecoration: 'underline' }}
              >
                {t('nav_contacto')}
              </Link>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="start" spacing={2}>
              <Text fontWeight="semibold">{t('footer_help_title')}</Text>
              <Accordion allowToggle width="100%" bg="transparent">
                <AccordionItem border="none">
                  <AccordionButton px={0}>
                    <Text flex="1" textAlign="left" color={linkColor}>
                      {t('help_faq')}
                    </Text>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel
                    pb={4}
                    bg="white"
                    color="gray.800"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <Text fontWeight="bold" mb={2}>
                      {t('faq_how_to_adopt_title')}
                    </Text>
                    <Text mb={2}>{t('faq_how_to_adopt_line1')}</Text>
                    <Text>{t('faq_how_to_adopt_line2')}</Text>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem border="none">
                  <AccordionButton px={0}>
                    <Text flex="1" textAlign="left" color={linkColor}>
                      {t('help_terms')}
                    </Text>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel
                    pb={4}
                    bg="white"
                    color="gray.800"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <Text mb={2}>{t('terms_content_objeto')}</Text>
                    <Text mb={2}>{t('terms_content_conducta')}</Text>
                    <Text>{t('terms_content_suspension')}</Text>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem border="none">
                  <AccordionButton px={0}>
                    <Text flex="1" textAlign="left" color={linkColor}>
                      {t('help_privacy')}
                    </Text>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel
                    pb={4}
                    bg="white"
                    color="gray.800"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <Text mb={2}>{t('privacy_content_1')}</Text>
                    <Text mb={2}>{t('privacy_content_2')}</Text>
                    <Text>{t('privacy_content_3')}</Text>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="start" spacing={3}>
              <Text fontWeight="semibold">{t('footer_follow_title')}</Text>
              <HStack spacing={3}>
                <IconButton
                  as="a"
                  href="https://facebook.com"
                  aria-label={t('footer_facebook')}
                  icon={<FaFacebook />}
                  bg={iconBg}
                  color={iconColor}
                  _hover={{ bg: 'teal.500', color: 'white' }}
                  borderRadius="full"
                  size="md"
                />
                <IconButton
                  as="a"
                  href="https://twitter.com"
                  aria-label={t('footer_twitter')}
                  icon={<FaTwitter />}
                  bg={iconBg}
                  color={iconColor}
                  _hover={{ bg: 'teal.500', color: 'white' }}
                  borderRadius="full"
                  size="md"
                />
                <IconButton
                  as="a"
                  href="https://instagram.com"
                  aria-label={t('footer_instagram')}
                  icon={<FaInstagram />}
                  bg={iconBg}
                  color={iconColor}
                  _hover={{ bg: 'teal.500', color: 'white' }}
                  borderRadius="full"
                  size="md"
                />
                <IconButton
                  as="a"
                  href="https://linkedin.com"
                  aria-label={t('footer_linkedin')}
                  icon={<FaLinkedin />}
                  bg={iconBg}
                  color={iconColor}
                  _hover={{ bg: 'teal.500', color: 'white' }}
                  borderRadius="full"
                  size="md"
                />
              </HStack>
            </VStack>
          </GridItem>
        </Grid>

        <Box borderTop="1px solid" borderColor="whiteAlpha.300" mt={10} pt={4}>
          <Text textAlign="center" fontSize="sm" color="whiteAlpha.700">
            {t('footer_copy', { year })}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
