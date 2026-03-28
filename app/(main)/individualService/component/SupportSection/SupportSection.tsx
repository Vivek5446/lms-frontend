import { Box, Flex, Text, Heading, Button, useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import CustomButton from "../../../../component/common/CustomButton/CustomButton";
import AppointmentModal from "../../../../component/common/AppointmentModal/AppointmentModal";

const SupportSection = () => {
  const router = useRouter();
  const buttonSize = useBreakpointValue({ base: "md", md: "xl" });
  const buttonWidth = useBreakpointValue({ base: "100%", sm: "8rem", md: "180px" });
  const [isOpen, setIsOpen] = useState(false);

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
          STILL UNSURE ? LET&apos;S TALK.
        </Text>

        <Heading
          color="white"
          fontSize={{ base: "21px", sm: "22px", md: "36px", lg: "48px" }}
          fontWeight={400}
          lineHeight="1.3"
          maxW={{ base: "90%", md: "100%" }}
        >
          {/* Mobile (force break after '15-') */}
          <Box display={{ base: "block", md: "none" }}>
            Book a <Text as="span" fontWeight={600}>Free 15-</Text>
            <br />
            Minute call with a
            <br />
            licensed therapist.
          </Box>

          {/* Tablet & Up (break after 'call') */}
          <Box display={{ base: "none", md: "block" }}>
            Book a <Text as="span" fontWeight={600}>Free 15- Minute</Text> call
            <br />
            with a licensed therapist.
          </Box>
        </Heading>


        <Button
          position="absolute"
          top={{ base: "auto", md: 7, lg: 12 }} // updated for tablet responsiveness
          bottom={{ base: 5, md: "auto" }}
          left={{ base: 4, md: "auto" }}
          right={{ base: "auto", md: 10, lg: 12 }} // updated for tablet responsiveness
          bg="#FFB8B2"
          color="#000"
          borderRadius="md"
          fontSize={{ base: "xs", md: "lg", lg: "xl" }} // updated for tablet responsiveness
          py={4}
          px={6}
          fontWeight="500"
          height={{ base: "auto", md: "45px", lg: "50px" }} // updated for tablet responsiveness
          width={{ base: "120px", md: "170px", lg: "200px" }} // updated for tablet responsiveness
          _hover={{ bg: "#ffb6b6" }}
          onClick={() => setIsOpen(true)}
        >
          Book a 15-Min Call
        </Button>

        <AppointmentModal isOpen={isOpen} onClose={() => setIsOpen(false)} pageLink="15 - Min call" />
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
            fontWeight={500}
            color="gray.800"
            mb={{ base: 3, sm: 0 }}
          >
            Support for you or a loved <br />
            one?{" "}
            <Text
              as="span"
              fontWeight={600}
              display="inline"
            >
              Let&apos;s connect
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
      <AppointmentModal isOpen={isOpen} onClose={() => setIsOpen(false)} pageLink="Book 15-min" />
    </Box>
  );
};

export default SupportSection;