import { Box, Flex, Image, Text } from "@chakra-ui/react";
import CustomButton from "../../../../component/common/CustomButton/CustomButton";
import CustomSubHeading from "../../../../component/common/CustomSubHeading/CustomSubHeading";
import { useRouter } from "next/navigation";

const SupervisionValuesSection = () => {
  const router = useRouter();

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
              src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1746184761/Group_1000003392_1_qcbkwl.png"
            />
          </Box>
          <Box mt={{ lg: "-2rem" }} textAlign={{ base: "center", lg: "start" }} maxW={{ lg: "50%" }}>
            {/* <CustomSmallTitle textAlign={{ base: "center", lg: "start" }}>
              KNOW YOURSELF BETTER
            </CustomSmallTitle> */}

            <CustomSubHeading
              highlightText="Clinical Confidence with Us"
              textAlign={{ base: "center", lg: "start" }}
            >
              Building Your
              <br />
            </CustomSubHeading>

            <Text
              as="h2"
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight={400}
              mt={4}
              color="#4A4A4A"
              textAlign={{ base: "center", lg: "start" }}
            >
              Our clinical supervision provides essential guidance, feedback, and support mental health professionals need to build a strong foundation for their practice.
              Through this collaborative relationship, you’ll develop the skills required to navigate complex client cases, manage your caseload effectively, and sustain
              a fulfilling career in therapy.

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
                src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1746184761/Group_1000003392_1_qcbkwl.png"
              />
            </Box>

            <CustomButton mt={6} onClick={() => router.push("/contact-us")} >Get Started</CustomButton>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default SupervisionValuesSection;
