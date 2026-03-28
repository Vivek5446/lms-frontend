"use client";
import {
  Box,
  Flex,
  FlexProps,
  Heading,
  Image,
  Text,
  TextProps,
  useBreakpointValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CustomButton from "../../../../component/common/CustomButton/CustomButton";
import stores from "../../../../store/stores";
import Link from "next/link";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";

const AboutHeroSection = observer(() => {
  const router = useRouter();
  const [content, setContent] = useState<any | null>(null);
  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  useEffect(() => {
    const pageContent = getPageContent("about") || null;
    setContent(pageContent);
  }, [companyDetails, getPageContent]);

  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });
  const buttonWidth = useBreakpointValue({ base: "14rem", md: "160px" });
  const headingSize = useBreakpointValue({
    base: "xl",
    md: "2xl",
    lg: "3rem",
  });

  const flexDirection: FlexProps["flexDirection"] = useBreakpointValue({
    base: "column",
    md: "row",
  });

  const textAlign: TextProps["textAlign"] = useBreakpointValue({
    base: "center",
    md: "start",
  });

  // Show loading placeholder until content is loaded
  if (!content) {
    return (
      <Box
        minHeight="400px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#D3FFDF"
        borderRadius="2.5rem"
        p={8}
      >
        <Text fontSize="xl" color="gray.500">
          Loading About Section...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      bg={{ base: "#D3FFDF", lg: "transparent" }}
      py={{ base: 12, md: 16, lg: 20 }}
      px={{ base: 4, md: 8 }}
      maxW="100vw"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bg="#D3FFDF"
        zIndex={-1}
        display={{ base: "block" }}
      />
      <Box
        maxW={{ lg: "95%" }}
        mx="auto"
        px={{ base: 2, lg: 6 }}
        borderTopLeftRadius="2.5rem"
        borderBottomRightRadius="2.5rem"
      >
        <Flex
          direction={flexDirection}
          align="center"
          gap={{ base: 6, md: 4, lg: 8 }}
          position="relative"
          zIndex={1}
        >
          {/* Left Content */}
          <Box
            textAlign={textAlign}
            flex={1}
            pl={{ base: 0, lg: 6 }}
            pr={{ base: 0, md: 4 }}
          >
            <CustomSmallTitle
              textAlign={{ base: "center", lg: "start" }}
            >
              About us
            </CustomSmallTitle>
            <Heading
              as="h1"
              fontSize={headingSize}
              mt={1}
              letterSpacing="2px"
              fontWeight="400"
            >
              {content?.aboutTitle?.aboutTitle1 ||
                "Mental Health Care That"}
              <Text
                as="span"
                ml={{ lg: "2" }}
                display="inline"
                fontWeight="700"
              >
                {content?.aboutTitle?.aboutTitle2 || "Works for You"}
              </Text>
            </Heading>

            <Box display={{ base: "none", md: "block" }}>
              <Text
                color={"brand.1100"}
                fontSize={{ base: "sm", lg: "lg" }}
                w={{ md: "90%", lg: "80%" }}
                mt={4}
                display={{ base: "none", md: "block" }}
              >
                {content?.aboutSubTitle ||
                  "Finding the right mental health support can be hard. We’re here to make it simple, effective, and tailored to you."}
              </Text>

              <Link href="/therapist" passHref legacyBehavior>
                <a target="_blank" rel="noopener noreferrer">
                  <CustomButton
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/therapist");
                    }}
                    width={buttonWidth}
                    size={buttonSize}
                    mt={6}
                  >
                    Get Started
                  </CustomButton>
                </a>
              </Link>
            </Box>
          </Box>

          {/* Right Image */}
          <Box
            mt={{ base: 6, md: 0 }}
            mr={{ base: 0, md: "-2rem", lg: "-5rem" }}
            ml={{ base: 0, md: "1rem" }}
            zIndex={2}
            flex={1}
            display="flex"
            justifyContent="center"
          >
            <Image
              src="/images/about/hero.webp"
              alt="Best Psychotherapist In Noida"
              w={{ base: "90%", md: "80%", lg: "65%" }}
              objectFit="cover"
              borderTopLeftRadius="4rem"
              borderBottomRightRadius="4rem"
            />
          </Box>
        </Flex>

        {/* Mobile-only Button */}
        <Box display={{ base: "block", md: "none" }} textAlign={"center"} mt={6}>
          <Link href="/therapist" passHref legacyBehavior>
            <a target="_blank" rel="noopener noreferrer">
              <CustomButton
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/therapist");
                }}
                width={buttonWidth}
                size={buttonSize}
              >
                Get Started
              </CustomButton>
            </a>
          </Link>
        </Box>
      </Box>
    </Box>
  );
});

export default AboutHeroSection;
