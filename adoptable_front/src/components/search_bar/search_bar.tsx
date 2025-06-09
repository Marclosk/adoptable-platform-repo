import React, { useState, useRef } from 'react';
import {
  InputGroup,
  InputLeftElement,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  HStack,
  Icon,
  Spinner,
  Text,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaSearch, FaDog, FaUser } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type Suggestion = {
  id: number;
  label: string;
  type: 'animal' | 'user';
  path: string;
};

const MAX_PER_TAB = 5;

const SearchBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [sugs, setSugs] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<number>();
  const inputRef = useRef<HTMLInputElement>(null);

  const bg = useColorModeValue('white', 'gray.700');
  const ph = useColorModeValue('gray.400', 'gray.500');
  const color = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');

  const fetchSuggestions = async (val: string) => {
    setLoading(true);
    try {
      const aRes = await axios.get<{ id: number; name: string }[]>(
        `/api/animals/?search=${encodeURIComponent(val)}`
      );
      const uRes = await axios.get<{ id: number; username: string }[]>(
        `/users/?search=${encodeURIComponent(val)}`
      );

      const animals: Suggestion[] = aRes.data.slice(0, MAX_PER_TAB).map(a => ({
        id: a.id,
        label: a.name,
        type: 'animal',
        path: `/card_detail/${a.id}`,
      }));
      const users: Suggestion[] = uRes.data.slice(0, MAX_PER_TAB).map(u => ({
        id: u.id,
        label: u.username,
        type: 'user',
        path: `/users/${u.id}/profile`,
      }));

      setSugs([...animals, ...users]);
      const show = animals.length + users.length > 0;
      setOpen(show);
      if (show) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    } catch {
      setSugs([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQ(val);
    window.clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setOpen(false);
      setSugs([]);
      return;
    }
    debounceRef.current = window.setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (path: string) => {
    navigate(path);
    setQ('');
    setOpen(false);
  };

  const animalSug = sugs.filter(s => s.type === 'animal');
  const userSug = sugs.filter(s => s.type === 'user');

  return (
    <Popover
      isOpen={open}
      placement="bottom-start"
      closeOnBlur={false}
      initialFocusRef={inputRef}
      onClose={() => setOpen(false)}
    >
      <PopoverTrigger>
        <Box w={{ base: '100px', sm: '200px', md: '300px' }}>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              top="50%"
              transform="translateY(-50%)"
              color={ph}
            >
              <FaSearch />
            </InputLeftElement>
            <Input
              ref={inputRef}
              bg={bg}
              color={color}
              placeholder={t('search_placeholder')}
              _placeholder={{ color: ph }}
              size="sm"
              value={q}
              onChange={handleChange}
              onFocus={() => q && fetchSuggestions(q)}
              onKeyDown={e => {
                if (e.key === 'Enter' && sugs[0]) handleSelect(sugs[0].path);
                if (e.key === 'Escape') setOpen(false);
              }}
              borderRadius="md"
              pl="8"
            />
          </InputGroup>
        </Box>
      </PopoverTrigger>

      <PopoverContent mt={1} boxShadow="lg" borderRadius="md" bg={bg}>
        <PopoverArrow />
        <PopoverBody p={0}>
          {loading ? (
            <HStack justify="center" py={3}>
              <Spinner size="sm" />
            </HStack>
          ) : (
            <Tabs isFitted variant="enclosed" size="sm">
              <TabList
                bg={bg}
                color={color}
                borderBottom="1px solid"
                borderColor="gray.200"
              >
                <Tab _selected={{ color: 'teal.500', borderColor: 'teal.500' }}>
                  {t('search_tab_animals')}
                </Tab>
                <Tab _selected={{ color: 'teal.500', borderColor: 'teal.500' }}>
                  {t('search_tab_users')}
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0}>
                  {animalSug.length > 0 ? (
                    <List>
                      {animalSug.map(s => (
                        <ListItem
                          key={`a-${s.id}`}
                          px="4"
                          py="2"
                          cursor="pointer"
                          _hover={{ bg: hoverBg }}
                          onClick={() => handleSelect(s.path)}
                        >
                          <HStack spacing="3">
                            <Icon as={FaDog} color="teal.500" />
                            <Text flex="1" noOfLines={1} color={color}>
                              {s.label}
                            </Text>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box px="4" py="2">
                      <Text color="gray.500" fontSize="sm">
                        {t('search_no_results')}
                      </Text>
                    </Box>
                  )}
                </TabPanel>

                <TabPanel p={0}>
                  {userSug.length > 0 ? (
                    <List>
                      {userSug.map(s => (
                        <ListItem
                          key={`u-${s.id}`}
                          px="4"
                          py="2"
                          cursor="pointer"
                          _hover={{ bg: hoverBg }}
                          onClick={() => handleSelect(s.path)}
                        >
                          <HStack spacing="3">
                            <Icon as={FaUser} color="teal.500" />
                            <Text flex="1" noOfLines={1} color={color}>
                              {s.label}
                            </Text>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box px="4" py="2">
                      <Text color="gray.500" fontSize="sm">
                        {t('search_no_results')}
                      </Text>
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default SearchBar;
