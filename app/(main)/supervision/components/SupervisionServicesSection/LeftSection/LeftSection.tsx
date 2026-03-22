import { Box, Image } from '@chakra-ui/react';
import React from 'react';
import CustomSubHeading from '../../../../../component/common/CustomSubHeading/CustomSubHeading';

const LeftSection = () => {
  return (
    <Box position="relative" overflow="hidden">
      <Box w={{ lg: "70%" }} ml={{ lg: 20 }} px={{ base: 2, lg: 0 }} mt={{ base: "-2", md: "2rem" }}>
        {/* Heading */}
        <CustomSubHeading
          highlightText={'Supervision'}
          textAlign={{ base: "center", lg: "start" }}
          fontSize={{ base: "22px", md: "30px" }}
        >
          Our approach to
        </CustomSubHeading>
      </Box>

      {/* Image */}
      <Image
        alt="Dental"
        src={'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746184761/Group_1000003463_jyu6sz.png'}
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
