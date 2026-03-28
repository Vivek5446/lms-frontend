import { Box, Flex, Image, Text } from '@chakra-ui/react'
import React from 'react'
import CustomButton from '../../../../component/common/CustomButton/CustomButton'
import CustomSmallTitle from '../../../../component/common/CustomSmallTitle/CustomSmallTitle'
import CustomSubHeading from '../../../../component/common/CustomSubHeading/CustomSubHeading'

const IndServiceHeroSection = ({ data }) => {
  return (
    <Box bgGradient={data?.bg} py={14}>
      <Box maxW={'90%'} mx={'auto'} px={{ base: 2, lg: 4 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align={{ base: "center", lg: "center" }}
          justify={"space-between"}
          gap={6}
        >
          <Box textAlign={{ base: "center", lg: "start" }} maxW={{ lg: "45%" }}>
            <CustomSmallTitle as="h1" textAlign={{ base: "center", lg: "start" }}>
              {data?.title}
            </CustomSmallTitle>

            <CustomSubHeading
              highlightText={data?.highlightText}
              textAlign={{ base: "center", lg: "start" }}
            >
              {data?.subtitle} <br />

            </CustomSubHeading>

            <Text
              as="h2"
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight={400}
              mt={4}
              color="#4A4A4A"
              textAlign={{ base: "center", lg: "start" }}
            >
              {data?.description}
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
                src={data?.image}
              />
            </Box>

            <CustomButton
              mt={6}
              onClick={() => {
                const section = document.getElementById("psychologist-section");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
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
              src={data?.image}
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

export default IndServiceHeroSection