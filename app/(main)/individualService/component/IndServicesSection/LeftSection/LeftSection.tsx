import { Box, Image } from '@chakra-ui/react';
import React from 'react';
import CustomSubHeading from '../../../../../component/common/CustomSubHeading/CustomSubHeading';

const LeftSection = ({ data }) => {
  return (
    <Box position="relative" overflow="hidden">
      <Box w={{ lg: "70%" }} ml={{ lg: 20 }} px={{ base: 2, lg: 0 }} mt={{ base: "-2", md: "-10px" }}>
        {/* Heading */}
        <CustomSubHeading
          highlightText={data?.title}
          textAlign={{ base: "center", lg: "start" }}
          fontSize={{ base: "22px", md: "30px" }}
        >
          Everything you need to know before starting
        </CustomSubHeading>
      </Box>

      {/* Image */}
      <Image
        alt="Dental"
        src={data?.image}
        h={{ base: "230px", lg: "370px" }}
        ml={{ base: "-1rem", lg: "-5rem" }}  // Move left by 2rem on larger screens
        position="relative"
        mt={6}
        top={{ base: "auto", lg: "0" }}
        w={{ base: "100%", lg: "100%" }}
        objectFit="contain"
      />
    </Box>
  );
};

export default LeftSection;
