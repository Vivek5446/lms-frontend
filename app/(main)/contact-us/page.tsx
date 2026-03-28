'use client';

import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Container,
  SimpleGrid,
  Stack,
  VStack,
  HStack,
  Icon,
  Input,
  Textarea,
  Button,
  Circle,
  Badge, // Added Badge to the main import list
} from '@chakra-ui/react';
import { 
  FaEnvelope, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaPaperPlane 
} from 'react-icons/fa';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset after 3 seconds for demo purposes
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Box bg="gray.50" _dark={{ bg: 'gray.950' }} minH="100vh" py={{ base: 12, md: 20 }}>
      <Container maxW="1200px">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignContent="center">
          
          {/* --- LEFT SIDE: CONTACT INFO --- */}
          <Stack spacing={8}>
            <Box>
              <Badge colorScheme="blue" px={3} py={1} rounded="md" mb={4}>
                Contact Us
              </Badge>
              <Heading size="2xl" mb={4} fontWeight="800">
                Let’s start a <br />
                <Text as="span" color="blue.600">Conversation</Text>
              </Heading>
              <Text fontSize="lg" color="gray.600" _dark={{ color: 'gray.400' }}>
                Have questions about our MSME lending courses or technical appraisals? 
                Our team is here to help you navigate your learning journey.
              </Text>
            </Box>

            <VStack align="start" spacing={6}>
              <ContactMethod 
                icon={FaEnvelope} 
                title="Email Support" 
                detail="support@lms-edu.com" 
                subDetail="Response within 24 hours"
              />
              <ContactMethod 
                icon={FaPhoneAlt} 
                title="Call Us" 
                detail="+91 98765 43210" 
                subDetail="Mon-Fri, 9am - 6pm IST"
              />
              <ContactMethod 
                icon={FaMapMarkerAlt} 
                title="Headquarters" 
                detail="Financial District, BKC" 
                subDetail="Mumbai, Maharashtra, India"
              />
            </VStack>
          </Stack>

          {/* --- RIGHT SIDE: FORM --- */}
          <Box 
            bg="white" 
            _dark={{ bg: 'gray.900' }} 
            p={{ base: 6, md: 10 }} 
            borderRadius="3xl" 
            shadow="2xl" 
            borderWidth="1px"
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Full Name</Text>
                    <Input placeholder="John Doe" variant="filled" h="50px" required />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Email Address</Text>
                    <Input type="email" placeholder="john@example.com" variant="filled" h="50px" required />
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>Subject</Text>
                  <Input placeholder="Course Inquiry" variant="filled" h="50px" />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>Message</Text>
                  <Textarea 
                    placeholder="Tell us how we can help..." 
                    variant="filled" 
                    rows={5} 
                    required 
                  />
                </Box>

                <Button 
                  type="submit" 
                  colorScheme={submitted ? "green" : "blue"} 
                  size="lg" 
                  h="60px" 
                  fontSize="lg"
                  rightIcon={<Icon as={FaPaperPlane} />}
                  transition="all 0.2s"
                >
                  {submitted ? "Message Sent!" : "Send Message"}
                </Button>
                
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  By clicking send, you agree to our privacy policy.
                </Text>
              </Stack>
            </form>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

// Reusable Contact Info Component
function ContactMethod({ icon, title, detail, subDetail }: any) {
  return (
    <HStack spacing={5} align="start">
      <Circle size="50px" bg="blue.50" _dark={{ bg: 'blue.950' }} color="blue.600">
        <Icon as={icon} />
      </Circle>
      <Box>
        <Text fontWeight="bold" fontSize="md">{title}</Text>
        <Text fontSize="lg" fontWeight="semibold">{detail}</Text>
        <Text fontSize="sm" color="gray.500">{subDetail}</Text>
      </Box>
    </HStack>
  );
}