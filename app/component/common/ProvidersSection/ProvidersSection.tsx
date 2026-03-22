import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import CustomButton from "../CustomButton/CustomButton";
import RotatingCard from "../RotatingCard/RotatingCard";
import MentalHealthConditions from "./MentalHealthConditions";
import CustomSmallTitle from "../CustomSmallTitle/CustomSmallTitle";
import Link from "next/link"; // Import Link for routing

const ProvidersSection = () => {
  const buttonSize = useBreakpointValue({ base: "md", md: "xl" });
  const buttonFont = useBreakpointValue({ base: "14px", md: "16px" });

  return (
    <Box>
      <Grid
        templateColumns={{ lg: "1fr 1fr" }}
        gap={4}
        justifyContent={"space-between"}
      >
        <Box
          py={{ base: "0rem", lg: "5rem", xl: "6rem" }}
          w={{ lg: "95%" }}
        >
          <CustomSmallTitle textAlign={{ base: "center", lg: "start" }} ml={{ lg: "0.2rem" }}>
            Our Providers
          </CustomSmallTitle>

          <Heading
            as={"h2"}
            fontWeight={400}
            my={{ base: 1, md: 3 }}
            fontSize={{ base: "24px", md: "52px" }}
            textAlign={{ base: "center", lg: "start" }}
          >
            Meet our{" "}
            <Text as={"span"} fontWeight={600}>
              Licensed <br /> Therapists
            </Text>
          </Heading>
          <Text
            color={"#434343"}
            fontSize={{ base: "14px", md: "16px", xl: "18px" }}
            textAlign={{ base: "center", lg: "start" }}
            lineHeight={{ base: "24px", md: "32px" }}
            px={{ base: 3, md: 4, lg: 0 }}
          >
            Our licensed therapists are specialized in a wide range of psychological conditions, 12+ psychotherapy approaches
            (including CBT, ACT, Psychodynamic Therapy, and more) and psychological assessments. Whether you need best psychiatrists in Noida,
            a psychotherapist in Noida, or a counseling psychologist in Noida, our team is here to help.
          </Text>
          
          <Box display={{ base: "none", lg: "block" }}>
            <MentalHealthConditions />
          </Box>

          {/* Using Link for navigation */}
          <Box display={{ base: "none", lg: "block" }}>
            <Link href="/therapist" passHref>
              <CustomButton
                mt={6}
                size={buttonSize}
                fontSize={buttonFont}
              >
                Explore Therapist
              </CustomButton>
            </Link>
          </Box>
        </Box>

        <Flex justify={"end"} pl={{ base: 0, md: 2, lg: 12 }} pt={{ md: 8 }}>
          <RotatingCard />
        </Flex>

        <Box>
          <Box display={{ base: "block", lg: "none" }}>
            <MentalHealthConditions />
          </Box>
        </Box>
      </Grid>

      {/* Mobile version of the button */}
      <Flex justify={'center'} display={{ base: "flex", lg: "none" }} mt={{ md: 4 }}>
        <Link href="/therapist" passHref>
          <CustomButton
            mt={2}
            size={buttonSize}
            fontSize={buttonFont}
          >
            Explore Therapist
          </CustomButton>
        </Link>
      </Flex>
    </Box>
  );
};

export default ProvidersSection;
