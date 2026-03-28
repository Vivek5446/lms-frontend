'use client';

import {
  Box,
  Heading,
  Text,
  Container,
  SimpleGrid,
  Stack,
  Icon,
  Circle
} from '@chakra-ui/react';
import { FaGraduationCap, FaUsers, FaGlobe } from 'react-icons/fa';

export default function About() {
  return (
    <Box bg="gray.50" _dark={{ bg: 'gray.950' }} minH="100vh" py={20}>
      <Container maxW="1000px">
        {/* Header Section */}
        <Stack gap={6} mb={16} textAlign="center">
          <Badge colorScheme="blue" alignSelf="center" px={4} py={1} rounded="full">
            Our Story
          </Badge>
          <Heading as="h1" size="4xl" fontWeight="800" letterSpacing="tight">
            Empowering the next generation of <br />
            <Text as="span" color="blue.600">Banking Professionals</Text>
          </Heading>
          <Text fontSize="xl" color="gray.600" _dark={{ color: 'gray.400' }} maxW="2xl" mx="auto">
            We are dedicated to providing high-quality, functional training for the
            BFSI sector, bridging the gap between academic theory and industry reality.
          </Text>
        </Stack>

        {/* Values Grid */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
          <ValueCard
            icon={FaGraduationCap}
            title="Expert Led"
            desc="Courses designed by industry veterans with decades of banking experience."
          />
          <ValueCard
            icon={FaUsers}
            title="Community Focused"
            desc="Join a network of 10,000+ learners across the NBFC and Banking landscape."
          />
          <ValueCard
            icon={FaGlobe}
            title="Digital First"
            desc="Accessible, mobile-friendly learning that fits into your professional schedule."
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
}

// Small helper component for the values section
function ValueCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <Stack
      p={8}
      bg="white"
      _dark={{ bg: 'gray.900' }}
      borderRadius="2xl"
      shadow="sm"
      borderWidth="1px"
      align="center"
      textAlign="center"
    >
      <Circle size="60px" bg="blue.50" _dark={{ bg: 'blue.950' }} color="blue.600">
        <Icon as={icon} size="lg" />
      </Circle>
      <Heading size="md" mt={4}>{title}</Heading>
      <Text color="gray.500" fontSize="sm">{desc}</Text>
    </Stack>
  );
}

// Note: If Badge isn't imported, you can add it to your Chakra imports at the top.
import { Badge } from "@chakra-ui/react";