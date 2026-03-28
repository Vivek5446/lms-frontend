'use client';
import { AddIcon, DeleteIcon, EditIcon, HamburgerIcon, InfoIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Collapse,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  SimpleGrid,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useState } from 'react';
import stores from '../../store/stores';

type Option = { optionName: string; code: string };
type MasterData = { category: string; options: Option[] };

const MotionBox = motion(Box);
interface Sidebar  {
  showSidebar?: boolean;
  handleCloseDrawer?: () => void
}

const MasterDataForm: React.FC<Sidebar> = observer(({ showSidebar = true,handleCloseDrawer }) => {
  const { dashboardStore: { getMasterData, createOrUpdateMasterData } } = stores;
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [optionName, setOptionName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [masterData, setMasterData] = useState<MasterData[]>([]);
  const [editing, setEditing] = useState<Option | null>(null);
  const [errors, setErrors] = useState<{ category?: string; option?: string; code?: string }>({});
  const [loading, setLoading] = useState(false); // Loading state for Save button
  const { isOpen: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({ defaultIsOpen: true });
  const toast = useToast();

  // Fetch master data on mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const data: any = await getMasterData();
        const masters = data?.masters || [];
        setMasterData(masters);

        const cats = masters.map((m: any) => m.category);
        setCategories(cats);

        if (cats.length > 0) setSelectedCategory(cats[0]);
      } catch (err : any) {
        alert(err?.message)
      }
    };
    fetchMasterData();
  }, [getMasterData]);

  // Add category
  const handleAddCategory = useCallback(() => {
    if (!newCategory.trim()) {
      setErrors({ category: 'Category name is required' });
      return;
    }
    if (categories.includes(newCategory.trim())) {
      setErrors({ category: 'Category already exists' });
      return;
    }
    setCategories(prev => [...prev, newCategory.trim()]);
    setSelectedCategory(newCategory.trim());
    setNewCategory('');
    toast({
      title: 'Category added',
      description: `${newCategory} has been created.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [newCategory, categories, toast]);

  // Add or update option
  const handleAddOrUpdate = useCallback(() => {
    if (!optionName.trim() || !code.trim()) {
      setErrors({
        option: !optionName ? 'Option name required' : '',
        code: !code ? 'Code required' : '',
      });
      return;
    }

    setMasterData(prev => {
      const existing = prev.find(c => c.category === selectedCategory);
      if (editing) {
        return prev.map(c =>
          c.category === selectedCategory
            ? { ...c, options: c.options.map(o => (o.code === editing.code ? { optionName, code } : o)) }
            : c
        );
      }
      if (existing) {
        return prev.map(c =>
          c.category === selectedCategory
            ? { ...c, options: [...c.options, { optionName, code }] }
            : c
        );
      }
      return [...prev, { category: selectedCategory, options: [{ optionName, code }] }];
    });

    toast({
      title: editing ? 'Option updated' : 'Option added',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    setOptionName('');
    setCode('');
    setEditing(null);
  }, [optionName, code, selectedCategory, editing, toast]);

  // Delete option
  const handleDeleteOption = useCallback(
    (opt: Option) => {
      setMasterData(prev =>
        prev.map(c =>
          c.category === selectedCategory ? { ...c, options: c.options.filter(o => o.code !== opt.code) } : c
        )
      );
      toast({
        title: 'Deleted',
        description: `${opt.optionName} removed.`,
        status: 'info',
        duration: 2000,
      });
    },
    [selectedCategory, toast]
  );

  // Save all master data to backend
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      await createOrUpdateMasterData({ masters: masterData });
      toast({
        title: 'Data Saved',
        description: 'All categories and options saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err : any) {
      toast({
        title: 'Save Failed',
        description: err?.message || 'Error while saving data.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      await getMasterData();
      handleCloseDrawer();

    }
  };

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h="100%" bgGradient="linear(to-br, blue.100, blue.50)" overflow="hidden" p={4} gap={4}>
      {/* Sidebar */}
      {showSidebar && (
      <Box w={{ base: '100%', md: isSidebarOpen ? '280px' : '70px' }} bg="blue.500" color="white" borderRadius="2xl" boxShadow="lg" p={4} transition="all 0.3s ease">
        <HStack justify="space-between" mb={4}>
          {isSidebarOpen && <Heading size="md">Categories</Heading>}
          <IconButton aria-label="Toggle sidebar" icon={<HamburgerIcon />} variant="ghost" color="white" onClick={toggleSidebar} />
        </HStack>
        <Collapse in={isSidebarOpen}>
          <VStack align="stretch" spacing={2}>
            {categories.map(cat => (
              <Button
                key={cat}
                justifyContent="space-between"
                onClick={() => setSelectedCategory(cat)}
                colorScheme={selectedCategory === cat ? 'blue' : 'whiteAlpha'}
                bg={selectedCategory === cat ? 'blue.600' : 'transparent'}
                borderRadius="lg"
              >
                {cat}
                <Badge colorScheme="whiteAlpha">{masterData.find(c => c.category === cat)?.options.length || 0}</Badge>
              </Button>
            ))}
            <FormControl isInvalid={!!errors.category} mt={4}>
              <Input
                size="sm"
                placeholder="New Category"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                bg="whiteAlpha.800"
                color="blue.900"
              />
              <FormErrorMessage>{errors.category}</FormErrorMessage>
            </FormControl>
            <Button leftIcon={<AddIcon />} size="sm" mt={2} colorScheme="blue" variant="solid" onClick={handleAddCategory}>
              Add
            </Button>
          </VStack>
        </Collapse>
      </Box>
      )}

      {/* Main area */}
      <Box flex="1" bg="white" borderRadius="2xl" boxShadow="xl" p={{ base: 4, md: 6 }} overflowY="auto">
        {!selectedCategory ? (
          <Center h="100%">
            <VStack spacing={3}>
              <InfoIcon boxSize={10} color="blue.400" />
              <Text fontSize="lg" color="gray.600">Select or create a category to manage options.</Text>
            </VStack>
          </Center>
        ) : (
          <>
            <HStack justify="space-between" mb={6}>
              <Heading size="lg" color="blue.700">{selectedCategory}</Heading>
              <Tooltip label="Delete category">
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label="Delete category"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => {
                    setCategories(prev => prev.filter(c => c !== selectedCategory));
                    setMasterData(prev => prev.filter(c => c.category !== selectedCategory));
                    setSelectedCategory('');
                  }}
                />
              </Tooltip>
            </HStack>

            {/* Add Option */}
            <Card variant="outline" borderColor="blue.100" mb={6}>
              <CardHeader>
                <Text fontWeight="medium" color="gray.700">{editing ? 'Edit Option' : 'Add Option'}</Text>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl isInvalid={!!errors.option}>
                    <FormLabel>Option Name</FormLabel>
                    <Input placeholder="e.g. Health Insurance" value={optionName} onChange={e => setOptionName(e.target.value)} focusBorderColor="blue.400" />
                    <FormErrorMessage>{errors.option}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.code}>
                    <FormLabel>Code</FormLabel>
                    <Input placeholder="e.g. HI" value={code} onChange={e => setCode(e.target.value)} focusBorderColor="blue.400" />
                    <FormErrorMessage>{errors.code}</FormErrorMessage>
                  </FormControl>
                  <Flex align="end">
                    <HStack>
                      <Button colorScheme="blue" onClick={handleAddOrUpdate}>{editing ? 'Update' : 'Add'}</Button>
                      {editing && (
                        <Button variant="outline" colorScheme="gray" onClick={() => { setEditing(null); setOptionName(''); setCode(''); }}>Cancel</Button>
                      )}
                    </HStack>
                  </Flex>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Option list */}
            <VStack align="stretch" spacing={3}>
              {masterData.find(c => c.category === selectedCategory)?.options.length ? (
                masterData.find(c => c.category === selectedCategory)?.options.map(opt => (
                  <MotionBox key={opt.code} p={4} borderWidth="1px" borderRadius="lg" whileHover={{ scale: 1.01 }}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold" color="gray.800">{opt.optionName}</Text>
                        <Text fontSize="sm" color="gray.500">Code: {opt.code}</Text>
                      </VStack>
                      <HStack>
                        <Tooltip label="Edit">
                          <IconButton icon={<EditIcon />} aria-label="Edit" size="sm" variant="ghost" onClick={() => { setEditing(opt); setOptionName(opt.optionName); setCode(opt.code); }} />
                        </Tooltip>
                        <Tooltip label="Delete">
                          <IconButton icon={<DeleteIcon />} aria-label="Delete" size="sm" colorScheme="red" variant="ghost" onClick={() => handleDeleteOption(opt)} />
                        </Tooltip>
                      </HStack>
                    </HStack>
                  </MotionBox>
                ))
              ) : (
                <Text color="gray.500" fontStyle="italic" textAlign="center">No options yet — add one above.</Text>
              )}
            </VStack>

            <Divider my={8} />

            {/* Save Button */}
            <Flex justify="center" mt={4}>
              <Button
                colorScheme="blue"
                size="lg"
                borderRadius="full"
                px={10}
                shadow="md"
                onClick={handleSaveAll}
                isLoading={loading} // Loading spinner while saving
                loadingText="Saving..."
              >
                💾 Save All
              </Button>
            </Flex>
          </>
        )}
      </Box>
    </Flex>
  );
});

export default MasterDataForm;
