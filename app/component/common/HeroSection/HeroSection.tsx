'use client';

import React from 'react';
import NextLink from 'next/link';
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Flex,
  Image,
  SimpleGrid,
  Container,
  Badge,
  Icon,
  HStack,
  Circle,
  VStack,
  Divider, // Replaced Separator with v2 Divider
} from '@chakra-ui/react';
import { 
  FaUserGraduate, 
  FaRocket, 
  FaStar, 
  FaPlayCircle, 
  FaCheckCircle,
  FaArrowRight,
  FaClock,
  FaBookOpen
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// Chakra v2 integration with Framer Motion
const MotionBox = motion(Box);

const FEATURED_COURSES = [
  { 
    id: 1, 
    title: "MSME Lending & Credit Appraisal", 
    category: "Banking", 
    rating: 4.9, 
    duration: "12h", 
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600" 
  },
  { 
    id: 2, 
    title: "Affordable Housing Finance", 
    category: "NBFC", 
    rating: 4.8, 
    duration: "10h", 
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600" 
  },
  { 
    id: 3, 
    title: "Operational Risk Management", 
    category: "Risk", 
    rating: 4.7, 
    duration: "8h", 
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600" 
  },
  { 
    id: 4, 
    title: "Digital Banking 2.0", 
    category: "Technology", 
    rating: 4.9, 
    duration: "6h", 
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600" 
  },
];

export default function LMSLandingPage() {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.950' }}>
      
      {/* --- HERO SECTION --- */}
      <Box 
        as="section" 
        position="relative" 
        overflow="hidden"
        pt={{ base: '40px', md: '80px' }}
        pb={{ base: '60px', md: '100px' }}
      >
        <Circle
          size="600px"
          bg="blue.500"
          opacity="0.05"
          position="absolute"
          top="-200px"
          right="-100px"
          filter="blur(100px)"
          zIndex={0}
        />

        <Container maxW="1200px" position="relative" zIndex={1}>
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align="center"
            gap={{ base: 12, lg: 20 }}
          >
            <Box flex="1">
              <MotionBox
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge 
                  colorScheme="blue" // Fixed: colorPalette -> colorScheme
                  variant="subtle" 
                  px={3} 
                  py={1} 
                  mb={6} 
                  borderRadius="full"
                  textTransform="none"
                >
                  <HStack spacing={2}>
                    <Icon as={FaCheckCircle} />
                    <Text fontWeight="medium">Pioneering State-of-the-Art Training</Text>
                  </HStack>
                </Badge>

                <Heading
                  as="h1"
                  fontSize={{ base: '4xl', md: '6xl' }}
                  fontWeight="extrabold"
                  lineHeight="1.1"
                  mb={6}
                  letterSpacing="tight"
                >
                  Elevate Your <Text as="span" color="blue.600">Career</Text> with C.R.A.F.T. Academia
                </Heading>

                <Text fontSize="xl" color="gray.600" _dark={{ color: 'gray.400' }} mb={10}>
                  Master Banking, NBFC, and MSME Lending through our unique 
                  Adaptive Learning and Simulation-based video courses.
                </Text>

                <Stack direction={{ base: 'column', sm: 'row' }} spacing={5}>
                  {/* Fixed: Removed asChild and used NextLink directly or via 'as' prop */}
                  <NextLink href="/courses" passHref>
                    <Button
                      as="a" 
                      size="lg"
                      colorScheme="blue"
                      px={8}
                      rounded="lg"
                      fontWeight="bold"
                      _hover={{ transform: 'scale(1.02)', textDecoration: 'none' }}
                      leftIcon={<Icon as={FaRocket} />}
                    >
                      Explore Courses
                    </Button>
                  </NextLink>
                  <Button
                    size="lg"
                    variant="outline"
                    colorScheme="gray"
                    px={8}
                    rounded="lg"
                    leftIcon={<Icon as={FaPlayCircle} />}
                  >
                    Watch Demo
                  </Button>
                </Stack>

                <SimpleGrid columns={3} spacing={4} mt={12} pt={8} borderTopWidth="1px">
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold">150+</Text>
                    <Text fontSize="sm" color="gray.500">Video Modules</Text>
                  </Box>
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold">50k+</Text>
                    <Text fontSize="sm" color="gray.500">Professionals</Text>
                  </Box>
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold">4.9</Text>
                    <HStack spacing={1}>
                      <Icon as={FaStar} color="orange.400" />
                      <Text fontSize="sm" color="gray.500">Rating</Text>
                    </HStack>
                  </Box>
                </SimpleGrid>
              </MotionBox>
            </Box>

            <Box flex="1" position="relative">
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  position="relative"
                  borderRadius="3xl"
                  overflow="hidden"
                  boxShadow="2xl"
                  borderWidth="8px"
                  borderColor="white"
                  _dark={{ borderColor: 'gray.800' }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
                    alt="Corporate Training"
                    w="full"
                    h={{ base: '300px', md: '500px' }}
                    objectFit="cover"
                  />
                </Box>
                
                <MotionBox
                  position="absolute"
                  top="10%"
                  left="-5%"
                  bg="white"
                  _dark={{ bg: 'gray.800' }}
                  p={4}
                  borderRadius="xl"
                  boxShadow="xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  display={{ base: 'none', md: 'block' }}
                >
                  <HStack spacing={3}>
                    <Icon as={FaUserGraduate} color="blue.500" boxSize={6} />
                    <Box>
                      <Text fontWeight="bold" fontSize="sm">Corporate Expert</Text>
                      <Text fontSize="xs" color="gray.500">Live Mentorship</Text>
                    </Box>
                  </HStack>
                </MotionBox>
              </MotionBox>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* --- METHODOLOGY SECTION --- */}
      <Box as="section" py={20} bg="white" _dark={{ bg: 'gray.900' }} borderTopWidth="1px">
        <Container maxW="1200px">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16}>
            <MotionBox
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Box position="relative">
                <Box bg="blue.600" borderRadius="2xl" p={10} color="white" boxShadow="2xl" position="relative" zIndex={2}>
                  <Heading size="lg" mb={6}>The C.R.A.F.T. Edge</Heading>
                  <Stack spacing={8}>
                    <HStack spacing={5} align="start">
                      <Circle size="48px" bg="whiteAlpha.300">
                        <Icon as={FaBookOpen} />
                      </Circle>
                      <Box>
                        <Text fontSize="lg" fontWeight="bold">Adaptive Learning</Text>
                        <Text fontSize="md" opacity={0.9}>Content adjusts to your expertise.</Text>
                      </Box>
                    </HStack>
                    <HStack spacing={5} align="start">
                      <Circle size="48px" bg="whiteAlpha.300">
                        <Icon as={FaPlayCircle} />
                      </Circle>
                      <Box>
                        <Text fontSize="lg" fontWeight="bold">Simulated Scenarios</Text>
                        <Text fontSize="md" opacity={0.9}>Real banking cases in digital environments.</Text>
                      </Box>
                    </HStack>
                  </Stack>
                </Box>
              </Box>
            </MotionBox>

            <Box>
              <Badge colorScheme="blue" px={3} py={1} mb={4} borderRadius="md" variant="solid">Since 2018</Badge>
              <Heading as="h2" size="xl" mb={6}>Pioneering Functional Training</Heading>
              <Text fontSize="lg" color="gray.600" mb={6}>Custom L&D projects for the Financial Sector.</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box p={5} bg="gray.50" borderRadius="xl" borderLeft="4px solid" borderColor="blue.500">
                  <Text fontWeight="bold" color="blue.600">60+ Institutions</Text>
                </Box>
                <Box p={5} bg="gray.50" borderRadius="xl" borderLeft="4px solid" borderColor="purple.500">
                  <Text fontWeight="bold" color="purple.600">Expert Content</Text>
                </Box>
              </SimpleGrid>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* --- FEATURED COURSES --- */}
      <Box as="section" py={20} bg="gray.50">
        <Container maxW="1200px">
          <Flex justify="space-between" align="flex-end" mb={10}>
            <VStack align="start" spacing={2}>
              <Badge colorScheme="blue" variant="subtle">Top Enrollment</Badge>
              <Heading size="xl">Explore Our Catalog</Heading>
            </VStack>
            <NextLink href="/course" passHref>
              <Button as="a" variant="ghost" colorScheme="blue" rightIcon={<FaArrowRight />}>View All</Button>
            </NextLink>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {FEATURED_COURSES.map((course) => (
              <MotionBox key={course.id} whileHover={{ y: -10 }} bg="white" borderRadius="2xl" overflow="hidden" shadow="sm" borderWidth="1px">
                <Box position="relative">
                  <Image src={course.image} h="160px" w="full" objectFit="cover" />
                  <Badge position="absolute" top={3} left={3} colorScheme="blue" variant="solid">{course.category}</Badge>
                </Box>
                <Box p={5}>
                  <Heading size="sm" mb={4} minH="40px">{course.title}</Heading>
                  <Button w="full" size="sm" colorScheme="blue" variant="outline">Course Details</Button>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
}