import { Box, Flex, Image, Show, Text } from '@chakra-ui/react';
import CustomButton from '../../../../component/common/CustomButton/CustomButton';
import CustomSmallTitle from '../../../../component/common/CustomSmallTitle/CustomSmallTitle';
import CustomSubHeading from '../../../../component/common/CustomSubHeading/CustomSubHeading';

const ConditionHeroSection = ({ data }) => {
  return (
    <Box bg={"#86C6F44D"} pt={10}>
      <Box maxW={{ base: "96%", lg: '90%' }} mx={'auto'} px={{ base: 2, lg: 4 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align={{ base: "center", lg: "center" }}
          gap={8}
          h={{ base: "710px", md: "790px", lg: "auto" }}
        >
          <Box textAlign={{ base: "center", lg: "start" }} maxW={{ lg: "50%" }}>
            <CustomSmallTitle
              as="h1"
              fontSize={{ base: "15" }}
              textAlign={{ base: "center", lg: "start" }}
            >
              {data?.title}
            </CustomSmallTitle>

            <CustomSubHeading
              highlightText=""
              textAlign={{ base: "center", lg: "start" }}
              fontSize={{ base: "24", md: "41px" }}
            >
              Work through
              <Show below="lg"><br /></Show>
              <b> {data?.conditionName}</b> <br />
              with the right help
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

            {/* Mobile image */}
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
                src={data?.image}
              />
            </Box>

            {/* Button wrapped in anchor for right-click menu support */}
            <Box mt={{ base: "-1rem", md: "4", lg: "4" }}>
              <a href={`/self-assessment/${data.id}`}>
                <CustomButton>
                  Take free Assessment
                </CustomButton>
              </a>
            </Box>
          </Box>

          {/* Desktop image */}
          <Box
            maxW={{ base: "100%", lg: "100%" }}
            display={{ base: "none", lg: "block" }}
          >
            <Image
              alt="Dental"
              w={"100%"}
              h={{ base: "300px", md: "350px", lg: "500px" }}
              objectFit={"contain"}
              src={data?.image}
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default ConditionHeroSection;
