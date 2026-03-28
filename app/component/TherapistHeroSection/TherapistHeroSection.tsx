import React from "react";
import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import CustomButton from "../common/CustomButton/CustomButton";

const TherapistHeroSection = ({ onButtonClick }: { onButtonClick: () => void }) => {
  return (
    <Box
      maxW="95%"
      mx="auto"
      p={{ base: 4, md: 6, lg: 8 }}
      bg="#FFF3F2"
      borderTopLeftRadius="2.5rem"
      borderBottomRightRadius="2.5rem"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        gap={{ base: 4, lg: 6 }}
      >
        {/* Left Section - Text and Button */}
        <Box
          py={{ base: 3, lg: 6 }}
          pl={{ base: 0, md: 2, lg: 12 }}
          textAlign={{ base: "center", md: "start" }}
          maxW={{ md: "55%", lg: "50%" }}
        >
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "1.7rem", lg: "3rem" }}
            mt={1}
            fontWeight={400}
          >
            The right therapist makes <br />
            <Text as="span" fontWeight="bold">
              All the Difference
            </Text>
          </Heading>
          <Box
            display={{ base: "none", md: "block" }}
            justifyContent="center"
            mt={{ base: 4, md: 6 }}
          >
            <CustomButton
              onClick={onButtonClick}
              size={{ base: "md", md: "lg", lg: "xl" }}
            >
              Get Started
            </CustomButton>
          </Box>
        </Box>

        {/* Right Section - Image and Shapes */}
        <Box>
          <Flex
            gap={4}
            ml={{ base: "1.6rem" }}
            align="center"
            wrap="wrap"
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <Box
                w={{ base: "5rem", md: "6rem", lg: "7rem" }}
                h={{ base: "6rem", md: "7rem", lg: "7.5rem" }}
                bg="#065F68"
                mb={3}
                borderTopRightRadius="2rem"
                borderBottomLeftRadius="2rem"
              />
              <Box
                w={{ base: "5rem", md: "6rem", lg: "7rem" }}
                h={{ base: "5rem", md: "6rem", lg: "7rem" }}
                bg="#FFB8B29C"
                borderTopLeftRadius="2rem"
                borderBottomRightRadius="2rem"
              />
            </Box>

            <Image
              src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1745779310/Mask_group_1_ghd987.png"
              alt="Best Psychiatrists In Noida"
              h={{ base: "12rem", md: "14rem", lg: "16rem" }}
              objectFit="cover"
              borderTopLeftRadius="2rem"
              borderBottomRightRadius="2rem"
              ml={{ base: 0, md: "-0.5rem" }}
            />

            {/* Button for mobile view */}
            <Box
              display={{ base: "flex", md: "none" }}
              mx="auto"
              mt={{ base: 4, md: 6 }}
            >
              <CustomButton
                onClick={onButtonClick}
                size={{ base: "md", md: "lg", lg: "xl" }}
              >
                Get Started
              </CustomButton>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default TherapistHeroSection;
