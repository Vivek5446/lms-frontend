'use client';

import {
  Box,
  Heading,
  Text,
  Container,
  SimpleGrid,
  Stack,
  Icon,
  Circle,
  Badge,
  Flex,
  Image,
  VStack,
  HStack,
  Button,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaGlobe, 
  FaAward, 
  FaLightbulb, 
  FaChartLine,
  FaArrowRight 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import NextLink from 'next/link';

const MotionBox = motion(Box);

export default function About() {
  const bgCard = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'gray.800');

  return (
    <Box bg="white" minH="100vh">
      {/* --- HERO SECTION --- */}
      <Box position="relative" overflow="hidden" pt={24} pb={20} bg="#F8FAFC">
        <Box 
          position="absolute" 
          top="-10%" 
          right="-5%" 
          w="500px" 
          h="500px" 
          bg="blue.50" 
          filter="blur(100px)" 
          rounded="full" 
          zIndex={0}
        />
        <Container maxW="1200px" position="relative" zIndex={1}>
          <Stack spacing={8} textAlign="center" align="center">
            <Badge 
              px={4} py={2} 
              rounded="full" 
              colorScheme="blue" 
              textTransform="uppercase" 
              letterSpacing="widest"
              fontSize="xs"
              shadow="sm"
            >
              The Craft LMS Story
            </Badge>
            <Heading 
              as="h1" 
              fontSize={{ base: '4xl', md: '6xl' }} 
              fontWeight="900" 
              letterSpacing="-2px"
              lineHeight="1.1"
            >
              Elevating the standard of <br />
              <Text as="span" bgGradient="linear(to-r, blue.600, blue.400)" bgClip="text">
                Professional Excellence
              </Text>
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl" lineHeight="tall">
              CRAFT isn't just a learning platform; it’s a career accelerator. We provide the 
              BFSI sector with technical mastery, bridging the gap between traditional 
              banking and the future of Fintech.
            </Text>
            <HStack spacing={4}>
              <Button size="lg" colorScheme="blue" px={8} rounded="full" rightIcon={<FaArrowRight />}>
                Explore Courses
              </Button>
              <Button size="lg" variant="ghost" colorScheme="blue" rounded="full">
                Our Methodology
              </Button>
            </HStack>
          </Stack>
        </Container>
      </Box>

      {/* --- STATS BAR --- */}
      <Container maxW="1100px" mt="-10">
        <SimpleGrid 
          columns={{ base: 2, md: 4 }} 
          spacing={8} 
          bg="white" 
          p={10} 
          rounded="3xl" 
          shadow="2xl" 
          borderWidth="1px" 
          borderColor={borderColor}
        >
          <StatItem count="15k+" label="Learners" />
          <StatItem count="50+" label="Expert Mentors" />
          <StatItem count="120+" label="Corporate Partners" />
          <StatItem count="98%" label="Success Rate" />
        </SimpleGrid>
      </Container>

      {/* --- OUR CORE PILLARS --- */}
      <Container maxW="1200px" py={24}>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={16} align="center">
          <Box flex="1">
            <Image 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop" 
              alt="Team Collaborating" 
              rounded="3xl" 
              shadow="2xl"
            />
          </Box>
          <VStack flex="1" align="start" spacing={8}>
            <Heading size="2xl" letterSpacing="-1px">Why the Industry Trusts CRAFT</Heading>
            <Text color="gray.600" fontSize="lg">
              Our curriculum is built from the ground up by Chief Risk Officers, 
              Compliance Leads, and Fintech Founders. We don't teach from textbooks; 
              we teach from real-world scenarios.
            </Text>
            <SimpleGrid columns={1} spacing={6} w="full">
              <PillarItem 
                icon={FaAward} 
                title="Accredited Content" 
                desc="All certifications are recognized by major NBFC and Banking institutions." 
              />
              <PillarItem 
                icon={FaLightbulb} 
                title="Practical Case Studies" 
                desc="Solve actual credit appraisal and risk management cases used in top firms." 
              />
              <PillarItem 
                icon={FaChartLine} 
                title="Career Support" 
                desc="Direct pipelines to recruitment for our top-performing certificate holders." 
              />
            </SimpleGrid>
          </VStack>
        </Flex>
      </Container>

      {/* --- VALUES GRID (Modern Cards) --- */}
      <Box bg="gray.50" py={24}>
        <Container maxW="1200px">
          <VStack mb={16} spacing={4}>
            <Heading size="xl">Our Founding Values</Heading>
            <Text color="gray.500">The principles that guide every course we build.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            <ValueCard
              icon={FaGraduationCap}
              title="Expert Led"
              desc="Designed by industry veterans with 20+ years in commercial banking."
            />
            <ValueCard
              icon={FaUsers}
              title="Community First"
              desc="Network with thousands of peers in the BFSI and NBFC landscape."
            />
            <ValueCard
              icon={FaGlobe}
              title="Global Standard"
              desc="Aligning domestic banking talent with international digital standards."
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* --- CTA SECTION --- */}
      <Container maxW="1200px" py={24}>
        <Box 
          bg="blue.600" 
          rounded="3xl" 
          p={{ base: 10, md: 20 }} 
          textAlign="center" 
          color="white"
          position="relative"
          overflow="hidden"
        >
          <Circle 
            position="absolute" top="-20%" left="-10%" size="300px" bg="blue.500" opacity="0.4" 
          />
          <VStack spacing={8} position="relative" zIndex={1}>
            <Heading size="2xl">Ready to Start Your Learning Journey?</Heading>
            <Text fontSize="xl" opacity="0.9" maxW="2xl">
              Join 15,000+ professionals who have already accelerated their banking careers 
              with our specialized certification programs.
            </Text>
            <Button size="lg" bg="white" color="blue.600" _hover={{ bg: 'gray.100' }} px={10} rounded="full">
              View All Courses
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}

// --- Helper Components ---

function StatItem({ count, label }: { count: string, label: string }) {
  return (
    <VStack spacing={1}>
      <Text fontSize="4xl" fontWeight="900" color="blue.600">{count}</Text>
      <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase">{label}</Text>
    </VStack>
  );
}

function PillarItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <HStack spacing={5} align="start">
      <Circle size="48px" bg="blue.50" color="blue.600">
        <Icon as={icon} />
      </Circle>
      <VStack align="start" spacing={0}>
        <Text fontWeight="bold" fontSize="lg">{title}</Text>
        <Text color="gray.600" fontSize="sm">{desc}</Text>
      </VStack>
    </HStack>
  );
}

function ValueCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <MotionBox
      whileHover={{ y: -10 }}
      p={10}
      bg="white"
      borderRadius="3xl"
      shadow="sm"
      borderWidth="1px"
      borderColor="gray.100"
    >
      <Circle size="64px" bg="blue.50" color="blue.600" mb={6}>
        <Icon as={icon} boxSize={6} />
      </Circle>
      <Heading size="md" mb={4}>{title}</Heading>
      <Text color="gray.500" lineHeight="tall">{desc}</Text>
    </MotionBox>
  );
}