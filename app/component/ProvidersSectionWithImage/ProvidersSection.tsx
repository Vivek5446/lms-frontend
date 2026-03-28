import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  useBreakpointValue,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import CustomSmallTitle from "../common/CustomSmallTitle/CustomSmallTitle";
import CustomButton from "../common/CustomButton/CustomButton";
import AppointmentModal from "../common/AppointmentModal/AppointmentModal";

const ProvidersSectionWithImage = ({ data }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const buttonSize = useBreakpointValue({ base: "md", md: "xl" });
  const buttonFont = useBreakpointValue({ base: "14px", md: "16px" });
  const hoverColor = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('#065F68', 'teal.200');

  const scrollToWorkingStepsSection = () => {
    const workingStepsSection = document.getElementById('WorkingSteps-section');
    if (workingStepsSection) {
      workingStepsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/therapist');
    }
  };

  // Function to render conditions in pill format
  const renderConditions = () => {
    if (!data?.conditions) return null;

    return (
      <Flex mt={{ base: 2, md: 4 }} flexWrap="wrap" justify={{ base: "center", lg: "start" }}>
        {data.conditions.map((condition) => (
          <Box
            key={condition}
            py="clamp(4px, 1vw, 8px)"
            px="clamp(8px, 2vw, 16px)"
            mb={2}
            mr="clamp(4px, 1vw, 12px)"
            transition="all 0.2s"
            w={{ base: "fit-content", md: "auto" }}
            rounded="full"
            border="1px solid #065F68"
            color="#065F68"
            fontSize="clamp(12px, 2vw, 16px)"
            cursor="pointer"
            _hover={{
              bg: hoverBg,
              color: hoverColor,
              transform: 'scale(1.05)'
            }}
          >
            {condition}
          </Box>
        ))}
      </Flex>
    );
  };

  return (
    <Box>
      <Grid
        templateColumns={{ lg: "1fr 1fr" }}
        gap={4}
        justifyContent={"space-between"}
      >
        <Box py={{ base: "0rem", lg: "5rem", xl: "6rem" }} w={{ lg: "99%" }}>
          <CustomSmallTitle textAlign={{ base: "center", lg: "start" }} ml={{ lg: "0.2rem" }}>
            CONDITIONS WE TREAT
          </CustomSmallTitle>

          <Heading
            as="h2"
            fontWeight={400}
            my={{ base: 1, md: 3 }}
            fontSize={{ base: "28px", md: "39px" }}
            textAlign={{ base: "center", lg: "start" }}
            lineHeight="1.3"
          >
            <Box
              display={{ base: "block", md: "inline" }}
              maxW={{ base: "90%", md: "100%" }}
              textAlign={{ base: "center", md: "center" }}
              mx="auto"
              lineHeight="1.3"
            >
              <Text display="inline" fontSize={{ base: "26px", md: "39px" }}>
                The concerns that you can talk {""}
              </Text>
              <Text
                as="span"
                fontWeight={600}
                fontSize={{ base: "26px", md: "39px" }}
                display="inline"
                ml={{ base: "0", md: "4px" }}
              >
                about with Dental Therapists
              </Text>
            </Box>
            <Text
              fontSize={{ base: "16px", md: "20px" }}
              textAlign={{ base: "center", lg: "start" }}
              color="gray.600"
              mt={{ base: 3, md: 4 }}
              px={{ base: 4, md: 0 }}
            >
              Our licensed therapists specialize in a wide range of psychological conditions,
              12+ psychotherapy approaches and various psychological assessments.
            </Text>
          </Heading>

          <Box mt={{ base: 4 }} display={{ base: "none", lg: "block" }}>
            {renderConditions()}
          </Box>

          <Box display={{ base: "none", lg: "block" }}>
            <CustomButton
              mt={6}
              size={buttonSize}
              fontSize={buttonFont}
              onClick={scrollToWorkingStepsSection}
            >
              Get Started
            </CustomButton>
          </Box>
        </Box>

        <Flex
          pl={{ base: 0, md: 0, lg: 4 }}
          justify={{ base: "center", md: "center", lg: "end" }}
          pt={{ base: 8, md: 20 }}
          minH={{ md: "500px", lg: "600px" }}
          align="start"
        >
          <Image
            src={data?.image}
            alt="Best Licensed Therapists in Noida"
            borderRadius="md"
            objectFit="cover"
            mt={{ base: -4, md: 1, lg: 20 }}
            maxW={{ base: "100%", md: "70%" }}
            maxH={{ base: "300px", md: "300px", lg: "420px" }}
          />
        </Flex>

        <Box>
          <Box display={{ base: "block", lg: "none" }}>
            {renderConditions()}
          </Box>
        </Box>
      </Grid>

      <Flex justify={'center'} display={{ base: "flex", lg: "none" }} mt={{ md: 4 }}>
        <CustomButton
          mt={6}
          size={buttonSize}
          fontSize={buttonFont}
          onClick={scrollToWorkingStepsSection}
        >
          Get Started
        </CustomButton>

        <AppointmentModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </Flex>
    </Box>
  );
};

export default ProvidersSectionWithImage;