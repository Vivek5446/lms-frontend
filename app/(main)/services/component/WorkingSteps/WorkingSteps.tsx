import { Box, Flex, Text, useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomSubHeading from "../../../../component/common/CustomSubHeading/CustomSubHeading";
import MobileWorkingSteps from "./MobileWorkingSteps";
import { dummyStepData, StepData } from "./utils/constant";
import CustomButton from "../../../../component/common/CustomButton/CustomButton";

const WorkingSteps = () => {

  const [activeStep, setActiveStep] = useState<StepData>(dummyStepData[0]);
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [activeBg, setActiveBg] = useState("red.100");

  const handleStepClick = (step: StepData) => {
    setActiveStep(step);
    setActiveBg(step.bg);
  };

  return (
    <Box maxW={{ base: "94%", md: "75%" }} mx={"auto"}>
      <Box maxW={{ base: "94%", md: "70%" }} mx={"auto"}>

        <CustomSmallTitle>How wE WORK</CustomSmallTitle>
        <CustomSubHeading textAlign="center">
          <Text as="span" whiteSpace={{ base: "normal", lg: "nowrap" }} >
            Getting Started with us <br /> <strong>is Simple</strong>
          </Text>
        </CustomSubHeading>

      </Box>

      {/* Responsive Layout */}
      {isMobile ? (
        <MobileWorkingSteps
          activeStep={activeStep}
          activeBg={activeBg}
          onStepClick={handleStepClick}
        />
      ) : (
        <Flex gap={8} align={"center"} mt={8}>
          <Box flex={1} position="relative" h="560px" w="100%">
            <Box
              position="relative"
              h="100%"
              p={4}
              w="100%"
              overflow="hidden"
              borderRadius="8px"
            >
              <Box position="relative" w="100%" h="110%" mt="-50px">

                {/* Video Content */}
                <video
                  key={activeStep.id}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "110%",
                    height: "100%",
                    objectFit: "contain",
                    // borderRadius:'2'
                  }}
                >
                  <source src={activeStep.imageUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Top Left Decorations */}
                <Box
                  position="absolute"
                  top="10%"
                  left="20%"
                  width="4.5%"
                  height="6%"
                  bg={activeBg}
                  borderLeftRadius="full"
                />
                <Box
                  position="absolute"
                  top="20%"
                  left="15%"
                  width="9.5%"
                  height="6%"
                  bg={activeBg}
                  borderLeftRadius="full"
                />

                {/* Bottom Right Decorations */}
                <Box
                  position="absolute"
                  bottom="20%"
                  right="15.5%"
                  width="9.5%"
                  height="6%"
                  bg={activeBg}
                  borderRightRadius="full"
                />
                <Box
                  position="absolute"
                  bottom="10%"
                  right="20.5%"
                  width="4.5%"
                  height="6%"
                  bg={activeBg}
                  borderRightRadius="full"
                />
              </Box>
            </Box>
          </Box>

          {/* Right Side: Steps */}
          <Box flex={1}>
            {dummyStepData.map((step) => (
              <Box
                key={step.id}
                w={"440px"}
                bg={activeStep.id === step.id ? step.bg || "white" : "white"}
                transition={"background-color 0.3s ease-in-out"}
                roundedRight={"xl"}
                borderLeft={"3px solid"}
                borderColor={
                  activeStep.id === step.id ? "brand.100" : "#045B6473"
                }
                pl={4}
                h={"fit-content"}
                mb={4}
                py={2}
                cursor={"pointer"}
                onClick={() => handleStepClick(step)}
              >
                <Text color={"#033136"} fontWeight={500}>
                  {step.stepNumber}
                </Text>
                <Text color={"#2C2B2B"} fontWeight={600} fontSize={"lg"} mt={2}>
                  {step.title}
                </Text>
                <Text fontSize={"sm"} color={"#434343"}>
                  {step.description}
                </Text>
              </Box>
            ))}
            <Box mt={6}>
              <a href="/therapist" rel="noopener noreferrer">
                <CustomButton>Get Started</CustomButton>
              </a>
            </Box>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default WorkingSteps;
