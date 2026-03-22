import { Box, HStack, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import CustomCarousel from "../../../../component/common/CustomCarousal/CustomCarousal";
import { dummyStepData, StepData } from "./utils/constant";
import CustomButton from "../../../../component/common/CustomButton/CustomButton";
import { useRouter } from "next/navigation";

interface Props {
  activeStep: StepData;
  activeBg: string;
  onStepClick?: any;
}

const MobileWorkingSteps = ({ activeStep, activeBg, onStepClick }: Props) => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleBeforeChange = (oldIndex: number, newIndex: number) => {
    setCurrentSlide(newIndex);
    onStepClick(dummyStepData[newIndex]);
  };

  useEffect(() => {
    const index = dummyStepData.findIndex((step) => step.id === activeStep.id);
    setCurrentSlide(index);
  }, [activeStep]);

  return (
    <Box position="relative" px={{ base: 2, md: 2 }} py={{ base: "-1rem", md: 4 }}>
      <CustomCarousel
        autoplay={true}
        autoplaySpeed={50000}
        showArrows={false}
        slidesToShow={1}
        dots={false}
        beforeChange={handleBeforeChange}
        infinite={true}
      >
        {dummyStepData.map((step) => (
          <Box
            key={step.id}
            px={{ base: 4, md: 10 }}
            py={{ base: 4, md: 12 }}
            borderRadius="lg"
            textAlign="center"
            position="relative" // 🔑 Add this
            w="full"
            minH={{ base: "760px", md: "900px" }} // 🔑 Add a consistent height to each slide        
          >
            {/* Video with frame outline */}
            <Box
              position="relative"
              w="102%"
              maxW={{ base: "150%", md: "600px" }}
              mb={{ base: 4, md: 6 }}
            >
              {/* Video Content */}
              <video
                key={step.id}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              >
                <source src={step.imageUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Top Left Decorations */}
              <Box
                position="absolute"
                top="10%"
                left="4%"
                width="6%"
                height="6%"
                bg={activeBg}
                borderLeftRadius="full"
              />
              <Box
                position="absolute"
                top="20%"
                left="-2%"
                width="12%"
                height="6%"
                bg={activeBg}
                borderLeftRadius="full"
              />

              {/* Bottom Right Decorations */}
              <Box
                position="absolute"
                bottom="20%"
                right="-2%"
                width="12%"
                height="6%"
                bg={activeBg}
                borderRightRadius="full"
              />
              <Box
                position="absolute"
                bottom="10%"
                right="4%"
                width="6%"
                height="6%"
                bg={activeBg}
                borderRightRadius="full"
              />
            </Box>
            {/* Custom Dots */}
            <HStack
              justify="center"
              mt={{ base: 4, md: 6 }}
              spacing={2}
              width="full"
              mb={5}
            >
              {dummyStepData.map((_, index) => (
                <Box
                  key={index}
                  h="4px"
                  w={index === currentSlide ? "24px" : "12px"}
                  bg={index === currentSlide ? "blue.500" : "gray.300"}
                  borderRadius="full"
                  transition="all 0.4s ease"
                />
              ))}
            </HStack>

            {/* Text */}
            <Text fontSize={{ base: "sm", md: "xl" }} mb={2}>
              {step.stepNumber}: {step.title}
            </Text>
            <Text fontSize={{ base: "sm", md: "md" }} maxW="700px">
              {step.description}
            </Text>
            <Box position="absolute" bottom={{ base: "0rem", md: "-10px" }} left="50%" transform="translateX(-50%)">
              <CustomButton onClick={() => router.push("/therapist")}>Get Started</CustomButton>
            </Box>
          </Box>
        ))}
      </CustomCarousel>


    </Box>
  );
};

export default MobileWorkingSteps;
