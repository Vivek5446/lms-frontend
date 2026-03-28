import { Box, Flex, Image, Text } from "@chakra-ui/react";
import CustomButton from "../../../../component/common/CustomButton/CustomButton";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomSubHeading from "../../../../component/common/CustomSubHeading/CustomSubHeading";

const AssesmentHeroSection = () => {
  const scrollToAssessment = () => {
    const element = document.getElementById('right-assessment');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box bg={"#E1F0EE"} py={14}>
      <Box maxW={'90%'} mx={'auto'} px={{ base: 2, lg: 4 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align={{ base: "center", lg: "center" }}
          justify={"space-between"}
          gap={6}
        >
          <Box textAlign={{ base: "center", lg: "start" }} maxW={{ lg: "50%" }}>
            <CustomSmallTitle textAlign={{ base: "center", lg: "start" }}>
              PSYCHOLOGICAL ASSESSMENT
            </CustomSmallTitle>

            <CustomSubHeading
              highlightText="Clinical Assessments"
              textAlign={{ base: "center", lg: "start" }}
            >
              Gain Insights through
            </CustomSubHeading>

            <Text
              as="h2"
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight={400}
              mt={4}
              color="#4A4A4A"
              textAlign={{ base: "center", lg: "start" }}
            >
              Whether it&apos;s finding the right diagnosis, understanding yourself better,
              or figuring out the best treatment—a professional assessment is the first step.
              It gives you the clarity and guidance you need to make the right choices for your well-being.
            </Text>

            <Box
              maxW={{ base: "100%", lg: "50%" }}
              display={{ base: "block", lg: "none" }}
              mt={{ md: 4, lg: 0 }}
            >
              <Image
                alt="best counseling psychologist in Noida"
                w={"100%"}
                h={{ base: "300px", md: "350px", lg: "400px" }}
                objectFit={"contain"}
                mt={{ base: "6", md: "", lg: "" }}
                src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1746130328/Group_1000003425_1_clowgu.png"
              />
            </Box>

            <CustomButton mt={6} onClick={scrollToAssessment}>
              Get Started
            </CustomButton>
          </Box>
          <Box
            maxW={{ base: "100%", lg: "50%" }}
            display={{ base: "none", lg: "block" }}
          >
            <Image
              alt="Dental"
              w={"100%"}
              h={{ base: "300px", md: "350px", lg: "400px" }}
              mr={6}
              objectFit={"contain"}
              src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1746130328/Group_1000003425_1_clowgu.png"
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default AssesmentHeroSection;