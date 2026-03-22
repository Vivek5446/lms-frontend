import {
  Box,
  Grid,
  Image,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import ContactDetailedForm from "../ContactUsFormSection/element/ContactDetailedForm";

const ContactUs = ({ links }: any) => {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Box maxW={{ md: "90%" }} mx="auto" my={12} px={{ base: 2, md: 4 }}>
      {/* Header Section */}
      <Box display={{ base: "block", lg: "none" }} textAlign="center" mb={8}>
        <Text
          textTransform="uppercase"
          color="teal.500"
          fontWeight="bold"
          letterSpacing="wider"
        >
          Contact us
        </Text>
        <Text
          fontSize={{ base: "1.8rem", md: "2.6rem" }}
          fontWeight={400}
          lineHeight="1.4"
          mt={2}
        >
          Support for you or a loved one?{" "}
          <Text as="span" fontWeight={600} color="teal.600">
            {`Let's connect`}
          </Text>
        </Text>
      </Box>

      {/* Main Grid Section */}
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={{ base: 8, md: 12 }}
        alignItems="center"
      >
        {/* Image Section */}
        {!isMobile && (
          <Box>
            <Image
              src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1746192921/iStock-2187124139_ixsrek.png"
              alt="Contact our support team"
              mt={8}
              mx="auto"
              maxW="100%"
            />
          </Box>
        )}

        <Box
          w="100%"
          maxW="100%"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          boxShadow="sm"
          p={{ base: 4, md: 6 }}
          bg="white"
        >
          <ContactDetailedForm isHome={true} bg="white" links={links} />
        </Box>
      </Grid>
    </Box>
  );
};

export default ContactUs;
