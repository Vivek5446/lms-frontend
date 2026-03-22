import { Box, Flex, Image, Text } from "@chakra-ui/react";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomSubHeading from "../../../../component/common/CustomSubHeading/CustomSubHeading";

const SupervisionValuesSection = () => {
  return (
    <Box py={14}>
      <Box maxW={"95%"} mx={"auto"} px={{ base: 2, lg: 4 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align={{ base: "center", lg: "center" }}
          justify={"space-between"}
          gap={6}
        >
          <Box
            maxW={{ base: "100%", lg: "50%" }}
            display={{ base: "none", lg: "block" }}
          >
            <Image
              alt="Dental"
              w={"100%"}
              h={{ base: "300px", md: "350px", lg: "440px" }}
              mr={6}
              objectFit={"contain"}
              src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1746130333/Group_1000003392_aw5xsp.png"
            />
          </Box>
          <Box textAlign={{ base: "center", lg: "start" }} maxW={{ lg: "50%" }}>
            <CustomSmallTitle textAlign={{ base: "center", lg: "start" }}>
            KNOW YOURSELF BETTER
            </CustomSmallTitle>

            <CustomSubHeading
              highlightText=" Psychological Testing ?"
              textAlign={{ base: "center", lg: "start" }}
            >
              What is <br />
            </CustomSubHeading>

            <Text
              as="h2"
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight={400}
              mt={4}
              color="#4A4A4A"
              textAlign={{ base: "center", lg: "start" }}
            >
              Psychological testing helps us understand how a person thinks, feels, and behaves.
              Using <strong>clinically-proven</strong> assessments, we can measure things like attention, memory, emotions, and personality.
              At Dental, every assessment follows strict professional guidelines and is conducted by trained experts,
              ensuring accurate and research-backed results for right diagnosis & treatment planning.
            </Text>

            <Box
              maxW={{ base: "100%", lg: "50%" }}
              display={{ base: "block", lg: "none" }}
            >
              <Image
                alt="best counseling psychologist in Noida"
                w={"100%"}
                h={{ base: "300px", md: "350px", lg: "400px" }}
                objectFit={"contain"}
                src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1746130333/Group_1000003392_aw5xsp.png"
              />
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default SupervisionValuesSection;
