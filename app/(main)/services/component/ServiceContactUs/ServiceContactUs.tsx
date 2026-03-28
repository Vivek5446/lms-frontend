import { Flex, Grid, Image } from "@chakra-ui/react";
import ContactSmallForm from "./ContactSmallForm";

const ServiceContactUs = () => {
  return (
    <Flex
    position="relative"
    direction="column"
    w="100%"
    h={{ base: "auto", md: "70vh",lg:"100%" }} // Use `h` instead of `minH` to ensure full section height
    overflow="hidden"
  >
    {/* Background Image */}
    <Image
      src="/images/service/contactbackground.webp"
      alt="best child psychologist in noida"
      position="absolute"
      top="0"
      left="0"
      w="100%"
      h="100%"
      objectFit="cover"
      zIndex={-1}
    />
  
    <Grid
      templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
      gap={{ base: 2, md: 6 }}
      alignItems="center"
      w="100%"
      h="100%"
      p={{ base: 4, lg: 0 }}
      m={0}
    >
      {/* Form Section */}
      <ContactSmallForm />
    </Grid>
  </Flex>
  
  );
};

export default ServiceContactUs;
