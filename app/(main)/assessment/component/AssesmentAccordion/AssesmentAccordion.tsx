import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Flex, Grid, Image, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import CustomSmallTitle from '../../../../component/common/CustomSmallTitle/CustomSmallTitle'
import stores from '../../../../store/stores'
import { observer } from 'mobx-react-lite'
import CustomSubHeading from '../../../../component/common/CustomSubHeading/CustomSubHeading'

const AssesmentAccordion = observer(() => {

  const icon = ["/images/assesment/assessmenticon1.svg", "/images/assesment/assessmenticon2.svg", "/images/assesment/assessmenticon3.svg", "/images/assesment/assessmenticon4.svg", "/images/assesment/assessmenticon5.svg"]
  const [content, setContent] = useState<any>({});
  const { companyStore: { getPageContent, companyDetails } } = stores;

  useEffect(() => {
    setContent(getPageContent('assessment') || {});
  }, [companyDetails, getPageContent]);

  // Dummy data for testing(similar to the dummyAccordionData)
  const dummyAccordionData = [
    {
      id: 1,
      title: 'Helps Identify Mental Health Conditions',
      paragraph:
        'We use structured, clinically-backed psychological tests to accurately diagnose conditions like anxiety, depression, ADHD, autism, and more ensuring you receive the right support.',
    },
    {
      id: 2,
      title: 'Gives Clear and Unbiased Results',
      paragraph:
        'Unlike personal opinions or self-assessments, psychological tests use standardized methods to provide accurate, research-backed insights. Standardized psychological tests reduce diagnostic errors by 25% in mental health evaluations (Meyer et al., 2001).',
    },
    {
      id: 3,
      title: 'Helps Find the Right Treatment',
      paragraph:
        'Therapists use test results to create personalized treatment plans based on your specific needs.',
    },
    {
      id: 4,
      title: 'Tracks Progress in Therapy or Treatment',
      paragraph:
        'If you’re already in therapy or treatment, testing helps measure improvements over time and adjust strategies accordingly.',
    },
    {
      id: 5,
      title: 'Helps reduce stigma and self-judgement',
      paragraph:
        'It offers a clear, data-backed way to understand your mental health. It helps take guesswork out and replaces it with clarity without the weight of stigma or self-criticism.',
    },
  ];

  return (
    <Box
      bg={"#FDFFDD"}
    >

      <Box
        maxW={{ lg: '90%' }}
        mx={'auto'}
        py={{ base: "3rem", md: "4rem" }}
        px={{ base: 4 }}
        position="relative"
        borderTopLeftRadius={{ base: "50px", lg: "90px" }}
        borderBottomRightRadius={{ base: "50px", lg: "90px" }}
        overflow="hidden"
      >
        <Grid
          templateColumns={{ base: "1fr", lg: "1.15fr 1fr" }}
          alignItems={{ base: "center", md: "start" }}
          gap={{ base: 6, md: 0 }}
        >
          <Box
            display={{ base: "block", lg: "none" }}
            textAlign={{ base: "center", lg: "start" }}
          >
            <Text textTransform="uppercase" color="#DF837C">
            </Text>
            <CustomSmallTitle>HOW IT HELPS</CustomSmallTitle>

            <CustomSubHeading
              highlightText="Help You?"
              textAlign={{ base: "center", lg: "start" }}

            >
              How Assessments <br />
            </CustomSubHeading>

            <Text
              w={{ base: "100%", lg: "90%" }}
              color={"#434343"}
              fontSize={{ base: "14px", md: "16px" }}
              lineHeight={{ base: "24px", md: "32px" }}
              px={{ base: 2, md: 4, lg: 0 }}
            >
              {content?.ourvalues}
            </Text>
          </Box>
          <Flex justifyContent="center" alignItems="center" w="100%" mt="2.5rem"
            mb={4}
            display={{ base: "flex", lg: "none" }}
          >
            <Image
              src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1746130330/Group_1000003424_sqejae.png"
              objectFit="contain"
              height={{ base: "20rem", md: "30rem", lg: "36rem" }}
              width={{ base: "85%", md: "75%", lg: "80%" }}
              ml={{ base: "0", md: "-2rem", lg: "-4rem" }}
              alt="best child psychologist in noida"
              position={{ base: "relative", md: "unset" }}
              top={{ base: "-4rem", md: "0" }}
              left={{ base: "-1rem", md: "0" }}
              mb={{ base: "-8rem", md: "0" }}
            />
          </Flex>
          <Box>
            {/* Intro Section */}
            <Box display={{ base: "none", lg: "block" }} mb={8}>
              <Text textTransform="uppercase" color="#DF837C" mb={2}>
              </Text>
              <CustomSmallTitle textAlign={{ base: "center", lg: "start" }} ml={{ lg: "0.2rem" }}> HOW IT HELPS</CustomSmallTitle>
              <CustomSubHeading
                highlightText="Help You?"
                textAlign={{ base: "center", lg: "start" }}
              >
                How Assessments
              </CustomSubHeading>
              {/* <Text
                w={{ base: "100%", md: "80%", lg: "90%" }}
                color={"#434343"}
                fontSize={{ base: "14px", md: "16px" }}
                lineHeight={{ base: "20px", md: "24px" }}
                mt={2}
              >
                At Dental, we know that seeking mental health care can be a long, frustrating journey. With us, you’ll find the right support to move forward with clarity & confidence.

              </Text> */}
            </Box>

            {/* Accordion Section */}
            <Box
              mb={8}
              mt={{ base: "12", md: "6" }}
              pr={2}
            >
              <Accordion w={{ base: "100%", lg: "90%" }} defaultIndex={0} allowToggle>
                <VStack spacing={4} align="stretch">
                  {/* Use companyDetails?.homeFaq if available, otherwise use dummy data */}
                  {(companyDetails?.assessmentAccordion || dummyAccordionData).map((feature, index) => (
                    <AccordionItem key={index} border="none">
                      {({ isExpanded }) => (
                        <>
                          <AccordionButton
                            px={6}
                            textAlign={'start'}
                            pt={isExpanded ? 4 : 3}
                            pb={isExpanded ? 0 : 3}
                            bg={isExpanded ? "white" : "#FFFFFF9C"}
                            rounded={"16px"}
                            borderBottomRadius={isExpanded ? "0px" : "16px"}
                            boxShadow={isExpanded ? "rgba(0, 0, 0, 0.1) 0px 4px 6px" : "none"}
                            _hover={{ bg: "white" }}
                          >
                            <Flex align="center" gap={4} flex="1">
                              <Image
                                src={icon[index % icon.length]}
                                alt="Best Psychiatrists In Noida"
                                boxSize="26px"
                                opacity={isExpanded ? 1 : 0.6}
                              />
                              <Text fontSize={{ base: "16px", md: "18px" }} color={isExpanded ? "#292929" : "#111111AB"}>
                                {feature.title}
                              </Text>
                            </Flex>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel
                            pb={4}
                            px={6}
                            bg={isExpanded ? "white" : "#FFFFFF9C"}
                            borderBottomRadius={"16px"}
                          >
                            <Text color="#292929" fontSize={{ base: "14px", md: "16px" }} lineHeight="24px">
                              {feature.paragraph}
                            </Text>
                          </AccordionPanel>
                        </>
                      )}
                    </AccordionItem>
                  ))}
                </VStack>
              </Accordion>
            </Box>

            {/* Button Section */}
            {/* <Flex justify={{ base: "center", md: "start" }}>
              <CustomButton
                width={buttonWidth}
                size={buttonSize}
                onClick={() => setIsOpen(true)}
              >
                Book Appointment
              </CustomButton>
              <AppointmentModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
            </Flex> */}
          </Box>
          <Box
            position={{ base: "relative", lg: "sticky" }}
            top={{ lg: 8, xl: 12 }}
            height={{ base: "auto", lg: "100%" }}
            maxHeight={{ base: "300px", md: "620px" }}
          >
            <Flex justifyContent="center" alignItems="center" w="100%" mt="2.5rem"
              display={{ base: "none", lg: "flex" }}

            >
              <Image
                src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1746130330/Group_1000003424_sqejae.png"
                objectFit="contain"
                height={{ base: "20rem", md: "30rem", lg: "36rem" }}
                width={{ base: "85%", md: "75%", lg: "80%" }}
                ml={{ base: "0", md: "-2rem", lg: "-4rem" }}
                alt="best child psychologist in noida"
                position={{ base: "relative", md: "unset" }}
                top={{ base: "-4rem", md: "0" }}
                left={{ base: "-1rem", md: "0" }}
                mb={{ base: "-8rem", md: "0" }}
              />
            </Flex>
          </Box>

        </Grid>
      </Box>
    </Box>
  )
})

export default AssesmentAccordion