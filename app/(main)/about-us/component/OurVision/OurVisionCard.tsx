import { Box, Flex, Image, ResponsiveValue, Text } from "@chakra-ui/react";
import type { Property } from "csstype";

interface CardComponentProps {
  imageSrc: string;
  title: string;
  description: string;
  hasBorder?: boolean;
  textAlign?: ResponsiveValue<Property.TextAlign>; // Ensure it's a valid Chakra UI textAlign type
  imageAlign?: ResponsiveValue<Property.JustifyContent>; // Ensure valid justifyContent values
  imageSpacing?: number;
  shadow?: string;
  color?:string
  bg?:string
}

const OurVisionCard: React.FC<CardComponentProps> = ({
  imageSrc,
  title,
  description,
  hasBorder = false,
  textAlign = { base: "center", md: "start" }, // Fixed type
  imageAlign = { base: "center", md: "flex-start" }, // Fixed type
  imageSpacing = 3,
  shadow = 'xl',
  color="black",
  bg='white',
  ...props
}) => {
  return (
    <Box
      px={{ base: 1, md:2,lg: 6 }}
      py={2}
      borderRight={{
        base: "none",
        lg: hasBorder ? "1px solid #D4D4D482" : "none",
      }}
      {...props}
    >
      <Flex justify={imageAlign} mb={{base:2,lg:0}}>
        <Box p={2} rounded={'16px'} bg={bg} shadow={shadow}>

        <Image
          src={imageSrc}
          boxSize={{ base: "40px", md: "50px" }}
          objectFit="contain"
          alt="psychiatrist clinics in Sector 63, Noida"
          />
          </Box>
      </Flex>
      <Text
        mt={{ md: imageSpacing }}
        mb={1}
        fontSize={{ base: "16px", md: "20px" }}
        fontWeight={600}
        textAlign={textAlign}
        color={color}
      >
        {title}
      </Text>
      <Text
        fontSize={{ base: "14px", md: "15px" }}
        fontWeight={400}
        pr={2}
        textAlign={textAlign}
        color={color}
      >
        {description}
      </Text>
    </Box>
  );
};

export default OurVisionCard;
