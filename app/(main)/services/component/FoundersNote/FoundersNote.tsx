import { Box, Flex, Grid, Image, Text, VStack } from "@chakra-ui/react";

const FoundersNote = () => {
  return (
    <Box
      bg="brand.100"
      color="white"
      py={{ base: 8, md: 12, lg: 16 }}
      px={{ base: 4, md: 8, lg: 16 }}
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        alignItems="center"
        gap={{ base: 6, lg: 12 }}
        maxW="6xl"
        mx="auto"
      >
        {/* Text Content */}
        <VStack
          align="start"
          spacing={6}
          textAlign="left"
          pr={{ lg: 8 }}
        >
          <Text
            mt={4}
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="medium"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            From Expert
          </Text>

          <Box position="relative" pl={0}>
            <Text
              fontSize={{ base: "16px", md: "18px", lg: "20px" }}
              fontFamily="Montserrat, sans-serif"
              letterSpacing="1px"
              lineHeight={{ base: "22px", md: "26px", lg: "34px" }}
              mt={4}
              textAlign="left"
              fontWeight="thin"
              color="white"
              textTransform="none"
              fontStyle="italic"
            >
              {/* opening quote image */}
              <Image
                src="/images/about/apos1.png"
                alt="Best Clinical Psychologists in Noida"
                display="inline"
                h={{ base: "22px", md: "24px" }} // Adjust the height for different screen sizes
                mr={{ base: "1", md: "2" }}
                ml={{ base: "-3.5", md: "-10" }}
                verticalAlign="middle"
                // width={{ base: "20px", md: "24px" }}  // Width adjusts on smaller screens
              />
              Dental stands for more than just therapy—it&apos;s about building trust.
              Every therapist here is chosen not just for their qualifications but for their ability to connect with and truly understand our clients.
              Through rigorous advanced training, research and monitoring your progress, we make sure they are always evolving to provide the highest standard of care.
              Our goal is to work with you in every session, helping you take meaningful steps toward a stronger recovery.

              {/* Closing quote image */}
              <Image
                src="/images/about/apos2.png"
                alt="Best Clinical Psychologists in Noida"
                display="inline-block"
                h={{ base: "22px", md: "28px" }}
                ml={2}
                mt={{ base: 2, lg: 0 }}
                verticalAlign="middle"
              />
            </Text>
          </Box>


          {/* Footer Section with Founder Name */}
          <Flex direction="column" mt={6} fontSize={{ base: "14px", md: "16px" }} textAlign="start" justify={{ base: "center" }}>
            <Text fontWeight="normal" fontSize={{ base: "16px", md: "18px" }} textAlign={{ base: "left", lg: "start" }}>
              Nikita Bhati
            </Text>
            <Text fontSize={{ base: "12px", md: "14px" }} color="white" textAlign={{ base: "left", lg: "start" }} >
              Founder & Clinical Head <br />
              Clinical Psychologist with 13+ years experience

            </Text>
          </Flex>
        </VStack>

        {/* Image Section */}
        <Box
          position="relative"
          w="100%"
          maxW="350px"
          mx="auto"
        >
          <Image
            src='https://res.cloudinary.com/dekfm4tfh/image/upload/v1743333154/nikita_zjtny0.png'
            alt="Nikita Bhati"
            position="relative"
            zIndex={2}
            borderRadius="lg"
            objectFit={{ base: "contain", lg: "cover" }}
            w="95%"
            h={{ base: "240px", md: "300px", lg: "auto" }}
          // boxShadow="xl"
          />
        </Box>
      </Grid>
    </Box>
  );
};

export default FoundersNote;