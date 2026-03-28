import { Box, Flex, Image, Text } from '@chakra-ui/react'
import React from 'react'
import CustomButton from '../../../../component/common/CustomButton/CustomButton'
import CustomSmallTitle from '../../../../component/common/CustomSmallTitle/CustomSmallTitle'
import CustomSubHeading from '../../../../component/common/CustomSubHeading/CustomSubHeading'
import { useRouter } from "next/navigation";

const SupervisionHeroSection = () => {
  const router = useRouter();

  return (
    <Box bg="#F4DDDE" py={14}>
      <Box maxW={'90%'} mx={'auto'} px={{ base: 2, lg: 4 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align={{ base: "center", lg: "center" }}
          justify={"space-between"}
          gap={6}
        >
          <Box textAlign={{ base: "center", lg: "start" }} maxW={{ lg: "55%" }}>
            <CustomSmallTitle as="h1" textAlign={{ base: "center", lg: "start" }}>
              supervision
            </CustomSmallTitle>

            <CustomSubHeading
              textAlign={{ base: "center", lg: "start" }}
              highlightText="Supervision for mental health professionals "
            >
              Clinical
            </CustomSubHeading>

            <Text
              as="h2"
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight={400}
              mt={4}
              color="#4A4A4A"
              textAlign={{ base: "center", lg: "start" }}
            >
              Therapists in the early stages of their careers looking for individual or group supervision to deepen clinical insight, strengthen your practice, or grow in confidence, we offer a supportive space to reflect, learn, and evolve.
            </Text>

            <Box
              maxW={{ base: "100%", lg: "50%" }}
              display={{ base: "block", lg: "none" }}
              mt={{ base: "2rem", md: 4, lg: 0 }}
            >
              <Image
                alt="best counseling psychologist in Noida"
                w={"100%"}
                h={{ base: "300px", md: "350px", lg: "400px" }}
                objectFit={"contain"}
                src={'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746184760/Group_1000003472_xvrval.png'}
              />
            </Box>

            <CustomButton
              mt={6}
              onClick={() => router.push("/contact-us")}
            >
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
              src={'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746184760/Group_1000003472_xvrval.png'}
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

export default SupervisionHeroSection