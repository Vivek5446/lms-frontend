'use client';

import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
  useBreakpointValue,
  VStack,
  Container,
  Circle,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { motion } from 'framer-motion';
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import CustomButton from "../CustomButton/CustomButton";
import AppointmentModal from "../AppointmentModal/AppointmentModal";

const MotionBox = motion(Box);

const OurValues = observer(() => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonSize = useBreakpointValue({ base: "lg", md: "xl" });
  const buttonWidth = useBreakpointValue({ base: "12rem", md: "240px" });
  
  // LMS specific icons (ensure these paths exist or use Fa icons)
  const icons = ["/icons/training.svg", "/icons/adaptive.svg", "/icons/simulate.svg", "/icons/cert.svg", "/icons/expert.svg"];
  
  const [content, setContent] = useState<any>({});
  const { companyStore: { getPageContent, companyDetails } } = stores;

  useEffect(() => {
    setContent(getPageContent('home') || {});
  }, [companyDetails, getPageContent]);

  // Fallback data if companyDetails.homeFaq is empty (LMS Focused)
  const lmsValues = companyDetails?.homeFaq?.length > 0 ? companyDetails.homeFaq : [
    { title: "Adaptive Learning Paths", paragraph: "Our platform uses AI to identify skill gaps and customize the curriculum for every banker, ensuring no time is wasted on known concepts." },
    { title: "Real-World Simulations", paragraph: "Go beyond theory with our 'Virtual Credit Committee' simulations where you analyze real MSME loan applications in a risk-free environment." },
    { title: "Industry-Veteran Mentorship", paragraph: "Every module is curated and reviewed by former CXOs and Senior Bankers with over 25+ years of experience in Indian Banking & NBFC sectors." }
  ];

  return (
    <Box
      as="section"
      bg="white"
      _dark={{ bg: 'gray.950' }}
      py={{ base: "4rem", md: "6rem", lg: "8rem" }}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative Gradient Background */}
      <Circle
        size="600px"
        bg="blue.500"
        opacity="0.04"
        position="absolute"
        top="-100px"
        right="-200px"
        filter="blur(100px)"
        zIndex={0}
      />

      <Container maxW="1200px" position="relative" zIndex={1}>
        <Grid
          templateColumns={{ base: "1fr", lg: "1.1fr 1fr" }}
          gap={{ base: 12, lg: 24 }}
          alignItems="center"
        >
          {/* LEFT SIDE: CONTENT & ACCORDION */}
          <VStack align="start" spacing={8}>
            <Box>
              <Badge colorScheme="blue" variant="subtle" px={3} py={1} mb={4} borderRadius="full" letterSpacing="widest">
                WHY C.R.A.F.T. ACADEMIA
              </Badge>
              <Heading
                as="h2"
                fontSize={{ base: "3xl", md: "5xl" }}
                fontWeight="extrabold"
                lineHeight="1.1"
                mb={6}
              >
                The Gold Standard in <br />
                <Text as="span" color="blue.600">Banking Excellence</Text>
              </Heading>
              <Text fontSize="lg" color="gray.600" _dark={{ color: 'gray.400' }} maxW="500px">
                We don't just provide videos; we build functional expertise. Our 
                methodology is designed to transform complex financial concepts into actionable workplace skills.
              </Text>
            </Box>

            <Accordion allowToggle w="full" defaultIndex={[0]}>
              <VStack spacing={5} align="stretch" w="full">
                {lmsValues.map((feature: any, index: number) => (
                  <AccordionItem 
                    key={index} 
                    border="none" 
                    bg="gray.50" 
                    _dark={{ bg: 'gray.900' }}
                    borderRadius="2xl"
                    overflow="hidden"
                  >
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton 
                          p={6} 
                          _hover={{ bg: 'blue.50', _dark: { bg: 'gray.800' } }}
                        >
                          <HStack spacing={4} flex="1" textAlign="left">
                            <Circle 
                                size="44px" 
                                bg={isExpanded ? "blue.600" : "white"} 
                                color={isExpanded ? "white" : "blue.600"}
                                shadow="md"
                            >
                              <Image 
                                src={icons[index % icons.length]} 
                                boxSize="22px" 
                                filter={isExpanded ? "brightness(0) invert(1)" : "none"}
                                fallbackSrc="https://via.placeholder.com/22"
                              />
                            </Circle>
                            <Text fontWeight="bold" fontSize="xl" color={isExpanded ? "blue.600" : "gray.800"}>
                              {feature.title}
                            </Text>
                          </HStack>
                          <AccordionIcon color="blue.600" />
                        </AccordionButton>
                        <AccordionPanel pb={6} px={6} ml="60px">
                          <Text color="gray.600" _dark={{ color: 'gray.400' }} fontSize="md" lineHeight="tall">
                            {feature.paragraph}
                          </Text>
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                ))}
              </VStack>
            </Accordion>

            {/* <Box pt={2}>
              <CustomButton
                width={buttonWidth}
                size={buttonSize}
                onClick={() => setIsOpen(true)}
              >
                Schedule a Demo
              </CustomButton>
            </Box> */}
          </VStack>

          {/* RIGHT SIDE: PROFESSIONAL IMAGE */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Box position="relative">
              <Box
                borderRadius="full"
                borderWidth="20px"
                borderColor="blue.50"
                _dark={{ borderColor: 'gray.800' }}
                overflow="hidden"
                boxShadow="2xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800" // Professional workshop/meeting image
                  alt="Corporate Training Session"
                  w="full"
                  h={{ base: "350px", md: "550px" }}
                  objectFit="cover"
                />
              </Box>
              
              {/* Floating Stat Badge */}
              <MotionBox
                position="absolute"
                top="15%"
                left="-10%"
                bg="white"
                _dark={{ bg: 'gray.800' }}
                p={5}
                borderRadius="2xl"
                boxShadow="2xl"
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                display={{ base: 'none', md: 'block' }}
              >
                <VStack align="start" spacing={1}>
                  <Text fontWeight="extrabold" fontSize="2xl" color="blue.600">98%</Text>
                  <Text fontWeight="bold" fontSize="xs" color="gray.500" textTransform="uppercase">Completion Rate</Text>
                </VStack>
              </MotionBox>
            </Box>
          </MotionBox>
        </Grid>
      </Container>

      <AppointmentModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        pageLink="home"
      />
    </Box>
  );
});

export default OurValues;