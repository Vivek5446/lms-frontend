'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Container,
  Badge,
  Icon,
  HStack,
  Stack,
  Image,
  VStack,
  Circle,
  Divider, // v2 uses Divider instead of Separator
  Flex,
  Input,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FaStar,
  FaArrowLeft,
  FaPlayCircle,
  FaLock,
  FaFilter,
  FaTimes,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box); // v2 uses motion(Box)

// --- Types ---
type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
interface Course {
  id: number;
  title: string;
  category: string;
  rating: number;
  duration: string;
  students: string;
  image: string;
  description: string;
  modules: string[];
  price: number;
  level: CourseLevel;
}

const COURSES: Course[] = [
  { id: 1, title: "MSME Lending & Credit Appraisal", category: "Banking", rating: 4.9, duration: "12h", students: "1.2k", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600", description: "Comprehensive analysis of MSME credit life cycles.", modules: ["Macro Environment", "Financial Statement Analysis", "Credit Scoring Models"], price: 4999, level: 'Intermediate' },
  { id: 2, title: "Affordable Housing Finance", category: "NBFC", rating: 4.8, duration: "10h", students: "850", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600", description: "Explore the NHB guidelines for the informal housing sector.", modules: ["Policy Framework", "Technical Appraisal"], price: 3499, level: 'Beginner' },
  { id: 3, title: "Operational Risk Management", category: "Risk", rating: 4.7, duration: "8h", students: "2.1k", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600", description: "Strategic mitigation of operational failures.", modules: ["Internal Controls", "Fraud Prevention"], price: 5999, level: 'Advanced' },
  { id: 4, title: "Digital Banking 2.0", category: "Technology", rating: 4.9, duration: "6h", students: "3k", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600", description: "Traditional branch banking to digital ecosystems.", modules: ["Neo-Banking", "Cybersecurity"], price: 2999, level: 'Beginner' },
];

const CATEGORIES = ['All', 'Banking', 'NBFC', 'Risk', 'Technology'];

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'default'>('default');
  const { isOpen, onOpen, onClose } = useDisclosure(); // v2 standard for Drawers

  const filteredCourses = useMemo(() => {
    let result = COURSES.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'All' || c.category === activeCategory;
      return matchesSearch && matchesCat;
    });
    if (sortBy === 'price') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [searchQuery, activeCategory, sortBy]);

  const FilterContent = () => (
    <VStack align="start" spacing={6} w="full">
      <Box w="full">
        <Text fontWeight="bold" mb={2} fontSize="xs" color="gray.500" textTransform="uppercase">Search</Text>
        <Input 
          placeholder="Course name..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="filled"
          h="40px"
        />
      </Box>

      <Box w="full">
        <Text fontWeight="bold" mb={2} fontSize="xs" color="gray.500" textTransform="uppercase">Categories</Text>
        <VStack align="start" spacing={1} w="full">
          {CATEGORIES.map(cat => (
            <Button 
              key={cat} 
              variant={activeCategory === cat ? 'solid' : 'ghost'} 
              colorScheme="blue"
              justifyContent="flex-start"
              w="full"
              size="sm"
              onClick={() => {
                setActiveCategory(cat);
                onClose();
              }}
            >
              {cat}
            </Button>
          ))}
        </VStack>
      </Box>

      <Box w="full">
        <Text fontWeight="bold" mb={2} fontSize="xs" color="gray.500" textTransform="uppercase">Level</Text>
        <Stack spacing={2}>
          <Checkbox colorScheme="blue" defaultChecked>Beginner</Checkbox>
          <Checkbox colorScheme="blue">Intermediate</Checkbox>
        </Stack>
      </Box>
    </VStack>
  );

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.950' }} py={{ base: 4, md: 10 }}>
      <Container maxW="1200px">
        <AnimatePresence mode="wait">
          {!selectedCourse ? (
            <MotionBox key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {/* --- MOBILE FILTER FAB --- */}
              <Button 
                display={{ base: 'flex', md: 'none' }} 
                position="fixed" bottom="24px" right="24px"
                colorScheme="blue" borderRadius="full" shadow="lg" zIndex="overlay"
                onClick={onOpen}
                leftIcon={<FaFilter />}
              >
                Filters
              </Button>

              <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
                {/* Desktop Sidebar */}
                <Box display={{ base: 'none', md: 'block' }} w="260px" position="sticky" top="20px" h="fit-content">
                  <VStack align="start" p={6} bg="white" _dark={{ bg: 'gray.900' }} borderRadius="xl" shadow="sm" borderWidth="1px">
                    <HStack mb={4}><Icon as={FaFilter} color="blue.500" /><Heading size="sm">Filters</Heading></HStack>
                    <FilterContent />
                  </VStack>
                </Box>

                {/* Mobile Drawer (v2 Syntax) */}
                <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
                  <DrawerOverlay />
                  <DrawerContent borderTopRadius="2xl" p={4}>
                    <DrawerCloseButton />
                    <DrawerHeader>Filter Courses</DrawerHeader>
                    <DrawerBody pb={8}>
                      <FilterContent />
                    </DrawerBody>
                  </DrawerContent>
                </Drawer>

                {/* Main Content */}
                <Box flex="1">
                  <Flex justify="space-between" align="center" mb={6}>
                    <VStack align="start" spacing={0}>
                      <Heading size="lg">Course Catalog</Heading>
                      <Text fontSize="sm" color="gray.500">{filteredCourses.length} results found</Text>
                    </VStack>
                    <HStack>
                      <Button size="xs" variant="ghost" onClick={() => setSortBy('price')}>Price</Button>
                      <Button size="xs" variant="ghost" onClick={() => setSortBy('rating')}>Rating</Button>
                    </HStack>
                  </Flex>

                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                    {filteredCourses.map((course) => (
                      <MotionBox
                        key={course.id}
                        whileHover={{ y: -4 }}
                        onClick={() => setSelectedCourse(course)}
                        cursor="pointer" bg="white" _dark={{ bg: 'gray.900' }}
                        borderRadius="xl" shadow="sm" borderWidth="1px" overflow="hidden"
                      >
                        <Image src={course.image} h="140px" w="full" objectFit="cover" alt={course.title} />
                        <Box p={4}>
                          <Badge colorScheme="blue" mb={2}>{course.level}</Badge>
                          <Heading size="sm" mb={3} noOfLines={2}>{course.title}</Heading>
                          <Flex justify="space-between" align="center" mt={4}>
                            <Text fontWeight="bold" color="blue.600">₹{course.price}</Text>
                            <HStack spacing={1} color="orange.400">
                              <Icon as={FaStar} />
                              <Text fontSize="xs">{course.rating}</Text>
                            </HStack>
                          </Flex>
                        </Box>
                      </MotionBox>
                    ))}
                  </SimpleGrid>
                </Box>
              </Flex>
            </MotionBox>
          ) : (
            /* --- COURSE DETAIL --- */
            <MotionBox key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Button variant="ghost" mb={6} onClick={() => setSelectedCourse(null)} leftIcon={<FaArrowLeft />}>
                Back to Catalog
              </Button>

              <Flex direction={{ base: 'column', lg: 'row' }} gap={10}>
                <Box flex="2">
                  <Heading size="2xl" mb={4}>{selectedCourse.title}</Heading>
                  <Text fontSize="lg" color="gray.600" mb={8}>{selectedCourse.description}</Text>
                  
                  <Heading size="md" mb={4}>Curriculum</Heading>
                  <Stack spacing={3}>
                    {selectedCourse.modules.map((m, i) => (
                      <HStack key={i} p={4} bg="white" _dark={{ bg: 'gray.900' }} borderRadius="lg" borderWidth="1px" justify="space-between">
                        <HStack spacing={4}>
                          <Circle size="30px" bg="blue.50" color="blue.600" fontWeight="bold" fontSize="xs">{i+1}</Circle>
                          <Text fontWeight="medium">{m}</Text>
                        </HStack>
                        <Icon as={i === 0 ? FaPlayCircle : FaLock} color={i === 0 ? "blue.500" : "gray.400"} />
                      </HStack>
                    ))}
                  </Stack>
                </Box>

                <Box flex="1">
                  <VStack p={6} bg="white" _dark={{ bg: 'gray.900' }} borderRadius="2xl" shadow="xl" borderWidth="1px" position="sticky" top="20px">
                    <Image src={selectedCourse.image} borderRadius="lg" mb={4} alt={selectedCourse.title} />
                    <Heading size="xl" w="full">₹{selectedCourse.price}</Heading>
                    <Button colorScheme="blue" size="lg" w="full" mt={4}>Enroll Now</Button>
                    <Text fontSize="xs" color="gray.500" mt={4}>Includes lifetime access & certificate</Text>
                  </VStack>
                </Box>
              </Flex>
            </MotionBox>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
}