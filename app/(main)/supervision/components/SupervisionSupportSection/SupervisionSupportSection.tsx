import { Box, Flex, Text, Heading, useBreakpointValue } from "@chakra-ui/react";
import { useRouter } from 'next/navigation';
import CustomButton from "../../../../component/common/CustomButton/CustomButton";

const SupervisionSupportSection = () => {
  const router = useRouter();
  const buttonSize = useBreakpointValue({ base: "md", md: "xl" });
  const buttonWidth = useBreakpointValue({ base: "100%", sm: "8rem", md: "180px" });

  return (
    <Box maxW="88%" mx="auto" my={8} borderRadius="lg" overflow="hidden" border="1px solid #E2E8F0">
      <Box
        backgroundImage={"https://res.cloudinary.com/dekfm4tfh/image/upload/v1746128862/Mask_group_1_gn6oex.png"}
        backgroundSize="cover"
        backgroundPosition="center"
        h={{ base: "250px", md: "300px" }}
        position="relative"
        p={{ base: 5, md: 10 }}
      >
        <Text
          color="white"
          fontSize={{ base: "xs", md: "18" }}
          fontWeight="400"
          mb={2}
        >
          GET IN TOUCH
        </Text>

        <Heading
          color="white"
          fontSize={{ base: "xl", sm: "22px", md: "48px" }}
          fontWeight={400}
          lineHeight="1.3"
          maxW={{ base: "80%", sm: "100%" }}
        >
          Looking for a{" "}
          <Text
            as="span"
            fontWeight={600}
          >
            supervisor ?
          </Text>{" "}
          <br />
          Reach out to us
        </Heading>

        {/* <Button
          position="absolute"
          top={{ base: "auto", md: 12 }}
          bottom={{ base: 5, md: "auto" }}
          left={{ base: 4, md: "auto" }}
          right={{ base: "auto", md: 12 }}
          bg="#FFB8B2"
          color="#000"
          borderRadius="md"
          fontSize={{ base: "xs", md: "xl" }}
          py={4}
          px={6}
          fontWeight="500"
          height={{ base: "auto", md: "50px" }}
          width={{ base: "120px", md: "200px" }}
          _hover={{ bg: "#ffb6b6" }}
          onClick={() => setIsOpen(true)}
        >
          Book a 15-Min Call
        </Button>
        <AppointmentModal isOpen={isOpen} onClose={() => setIsOpen(false)} pageLink="15 - Min call" /> */}
      </Box>
      <Box p={{ base: 4, md: 6 }} bg="white">
        <Text
          fontSize="xs"
          fontWeight="500"
          color="gray.700"
          mb={1}
        >
          CONTACT US
        </Text>

        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          flexDirection={{ base: "column", sm: "row" }}
          gap={{ base: 4, sm: 0 }}
        >
          <Heading
            fontSize={{ base: "14px", sm: "18px", md: "28px" }}
            fontWeight={600}
            color="gray.800"
            mb={{ base: 3, sm: 0 }}
          >
            Fill out the form
            {" "}
            <Text
              as="span"
              fontWeight={500}
              display="inline"
            >And We&apos;ll
              <br /> Get Back To You Soon
            </Text>
          </Heading>

          <CustomButton
            width={buttonWidth}
            size={buttonSize}
            onClick={() => router.push('/contact-us')}
          >
            Contact Us
          </CustomButton>
        </Flex>
      </Box>
      {/* <AppointmentModal isOpen={isOpen} onClose={() => setIsOpen(false)} /> */}
    </Box>
  );
};

export default SupervisionSupportSection;